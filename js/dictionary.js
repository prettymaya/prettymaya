// PrettyMaya - Free Dictionary API Integration
const DictionaryService = {
    BASE_URL: 'https://api.dictionaryapi.dev/api/v2/entries/en',

    async fetchWord(word) {
        try {
            const response = await fetch(`${this.BASE_URL}/${encodeURIComponent(word)}`);
            if (!response.ok) {
                // Fallback to Wiktionary if DictionaryAPI throws 404
                if (response.status === 404) {
                    return await this.fetchWiktionary(word);
                }
                throw new Error('Sözlük API bağlantı hatası.');
            }
            
            const data = await response.json();
            return this.parseResponse(data[0]); 
        } catch (error) {
            console.error('Dictionary API Error:', error);
            // Final fallback 
            try {
                return await this.fetchWiktionary(word);
            } catch (fallbackError) {
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

        // Filter out overly redundant meanings. Just take the first 4 to avoid overwhelming the user.
        result.meanings = result.meanings.slice(0, 4); 
        return result;
    },

    async fetchWiktionary(word) {
        // Fetch definitions
        const defResponse = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
        if (!defResponse.ok) throw new Error('Wiktionary API hatası');
        
        const defData = await defResponse.json();
        const meanings = [];
        
        if (defData.en) {
            defData.en.forEach(m => {
                m.definitions.forEach(d => {
                    // Strip HTML tags from Wiktionary definition
                    const cleanDef = d.definition.replace(/<[^>]*>?/gm, '').trim();
                    if (cleanDef) {
                        meanings.push({
                            partOfSpeech: m.partOfSpeech.toLowerCase(),
                            definition: cleanDef,
                            example: null // Enforce AI generation
                        });
                    }
                });
            });
        }

        // Fetch Audio (Media list)
        let audioUrl = null;
        try {
            const mediaResponse = await fetch(`https://en.wiktionary.org/api/rest_v1/page/media-list/${encodeURIComponent(word)}`);
            if (mediaResponse.ok) {
                const mediaData = await mediaResponse.json();
                const audioItem = mediaData.items.find(i => i.type === 'audio' && (i.title.includes('us') || i.title.includes('uk') || i.title.includes('en')));
                if (audioItem) {
                    // Extract filename and build original upload URL (approximate logic, usually Commons)
                    // We'll use the standardized pronunciation URL if possible, or fallback to DictionaryAPI style parsing if available
                    // For Wiktionary REST API media list, we often need a separate call to Commons, which is complex.
                    // A simpler approach for Wikipedia/Wiktionary audio is using the title.
                    const filename = audioItem.title.replace('File:', '').replace(/ /g, '_');
                    const md5 = await this.hashString(filename); // MediaWiki uses MD5 for paths
                    audioUrl = `https://upload.wikimedia.org/wikipedia/commons/${md5[0]}/${md5.substring(0,2)}/${filename}`;
                }
            }
        } catch (e) {}

        return {
            word: word,
            audio: audioUrl,
            meanings: meanings.slice(0, 4)
        };
    },

    async hashString(str) {
        const msgBuffer = new TextEncoder().encode(str);                    
        const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    extractAudio(phonetics) {
        if (!phonetics || !Array.isArray(phonetics)) return null;
        // Prioritize US or UK audio, or just the first valid audio link
        const audioEntry = phonetics.find(p => p.audio && p.audio.length > 0);
        return audioEntry ? audioEntry.audio : null;
    }
};
