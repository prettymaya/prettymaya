const fs = require('fs');

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
            console.warn('Dictionary V2 Error, falling back to V1:', error.message);
            try {
                return await this.fetchV1(word);
            } catch (v1Error) {
                console.warn('Dictionary V1 Error, falling back to Wiktionary:', v1Error.message);
                return { word, meanings: [{ definition: "Mock AI Fallback [🤖 AI]" }] };
            }
        }
    },

    parseResponse(entry) {
        const result = { word: entry.word, meanings: [] };
        entry.meanings.forEach(m => {
            m.definitions.forEach(def => {
                result.meanings.push({ partOfSpeech: m.partOfSpeech, definition: def.definition + " [v2]" });
            });
        });
        return result;
    },

    async fetchV1(word) {
        const url = `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("V1 fail");
        const data = await response.json();
        const entry = data.entries[0];
        const result = { word: word, meanings: [] };
        const partOfSpeech = entry.partOfSpeech || 'unknown';
        if (entry.senses && Array.isArray(entry.senses)) {
            entry.senses.forEach(sense => {
                if (sense.definition) {
                    result.meanings.push({ partOfSpeech: partOfSpeech, definition: sense.definition + " [v1]" });
                }
            });
        }
        return result;
    }
};

(async () => {
    const res = await DictionaryService.fetchWord("step off");
    console.log(JSON.stringify(res, null, 2));
})();
