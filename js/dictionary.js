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
            return this.parseResponse(data[0]); // DictionaryAPI returns an array for multiple entries, usually data[0] is primary
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
                    example: def.example || null
                };
                
                // Only push meanings that either have an example OR are the first of their kind to avoid noise
                // Actually, let's keep all distinct definitions that seem useful. For now, we will add all.
                result.meanings.push(meaningObj);
            });
        });

        // Filter out overly redundant meanings (Optional: limit to top 4-5 to avoid overwhelming the user)
        // We will prioritize meanings that natively have examples.
        const meaningsWithExamples = result.meanings.filter(m => m.example !== null);
        const meaningsWithoutExamples = result.meanings.filter(m => m.example === null);
        
        // Take up to 3 with examples, and pad with 1-2 without examples if needed, max 4 definitions.
        let finalMeanings = [...meaningsWithExamples];
        if (finalMeanings.length < 4) {
            finalMeanings = finalMeanings.concat(meaningsWithoutExamples.slice(0, 4 - finalMeanings.length));
        }

        result.meanings = finalMeanings.slice(0, 4); // Max 4 meanings per word to keep UI clean
        return result;
    },

    extractAudio(phonetics) {
        if (!phonetics || !Array.isArray(phonetics)) return null;
        // Prioritize US or UK audio, or just the first valid audio link
        const audioEntry = phonetics.find(p => p.audio && p.audio.length > 0);
        return audioEntry ? audioEntry.audio : null;
    }
};
