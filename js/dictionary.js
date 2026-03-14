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
            console.error('Dictionary API Error:', error);
            throw error;
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
    }
};
