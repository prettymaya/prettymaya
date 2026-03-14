// PrettyMaya - Free Dictionary API Integration
const DictionaryService = {
    BASE_URL: 'https://api.dictionaryapi.dev/api/v2/entries/en',

    async fetchWord(word) {
        try {
            const response = await fetch(`${this.BASE_URL}/${encodeURIComponent(word)}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Sözlükte "${word}" kelimesi bulunamadı.`);
                }
                throw new Error('Sözlük API bağlantı hatası.');
            }
            
            const data = await response.json();
            return this.parseResponse(data[0]); 
        } catch (error) {
            console.warn('DictionaryAPI Error, falling back to Wiktionary:', error.message);
            try {
                return await this.fetchWiktionary(word);
            } catch (wiktiError) {
                console.error('Both Dictionaries failed:', wiktiError);
                throw new Error(`Sözlükte "${word}" kelimesi bulunamadı.`);
            }
        }
    },

    parseResponse(entry) {
        const result = {
            word: entry.word,
            audio: this.extractAudio(entry.phonetics),
            meanings: []
        };

        // Parse Meanings
        entry.meanings.forEach(m => {
            const partOfSpeech = m.partOfSpeech;
            
            m.definitions.forEach(def => {
                const meaningObj = {
                    partOfSpeech: partOfSpeech,
                    definition: def.definition,
                    example: null // Enforce AI generation
                };
                
                // Only push meanings that either have an example OR are the first of their kind to avoid noise
                // Actually, let's keep all distinct definitions that seem useful. For now, we will add all.
                result.meanings.push(meaningObj);
            });
        });

        // We will return ALL meanings from DictionaryAPI, as requested.
        return result;
    },

    extractAudio(phonetics) {
        if (!phonetics || !Array.isArray(phonetics)) return null;
        // Prioritize US or UK audio, or just the first valid audio link
        const audioEntry = phonetics.find(p => p.audio && p.audio.length > 0);
        return audioEntry ? audioEntry.audio : null;
    },

    async fetchWiktionary(word) {
        const titleCaseWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        
        let url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.toLowerCase())}`;
        let response = await fetch(url);
        
        if (!response.ok && response.status === 404) {
             url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(titleCaseWord)}`;
             response = await fetch(url);
        }

        if (!response.ok) {
            throw new Error(`Wiktionary'de "${word}" kelimesi bulunamadı.`);
        }

        const data = await response.json();
        
        const result = {
            word: word,
            audio: null, // Audio from Wiktionary requires secondary calls or parsing different endpoints. Skip for simplicity unless needed.
            meanings: []
        };

        const activeLocales = Object.keys(data).filter(k => k.toLowerCase() === 'en');
        if (activeLocales.length === 0) {
            throw new Error(`İngilizce tanım bulunamadı.`);
        }

        const localeData = data[activeLocales[0]];

        localeData.forEach(posGroup => {
            const partOfSpeech = posGroup.partOfSpeech.toLowerCase();
            if (posGroup.definitions && Array.isArray(posGroup.definitions)) {
                posGroup.definitions.forEach(defObj => {
                    const cleanDef = defObj.definition.replace(/<[^>]*>/g, '').trim(); 
                    if (cleanDef && cleanDef.length > 5 && !cleanDef.includes("plural of") && !cleanDef.includes("third-person singular")) {
                        result.meanings.push({
                            partOfSpeech: partOfSpeech,
                            definition: cleanDef,
                            example: null // Enforce AI generation
                        });
                    }
                });
            }
        });

        if (result.meanings.length === 0) {
             throw new Error(`Geçerli bir anlam bulunamadı.`);
        }
        
        // Let's cap Wiktionary at maybe 8 meanings to avoid massive dumps of useless definitions,
        // but DictionaryAPI runs free. Wiktionary can have 30+ definitions.
        result.meanings = result.meanings.slice(0, 10);

        return result;
    }
};
