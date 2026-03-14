// PrettyMaya - Gemini API Service
const GeminiService = {
    MODEL: 'gemini-3.1-flash-lite-preview',
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',

    async getApiKey() {
        return await DB.getSetting('gemini_api_key');
    },

    async testConnection() {
        const apiKey = await this.getApiKey();
        if (!apiKey) throw new Error('API anahtarı bulunamadı');

        const url = `${this.BASE_URL}/${this.MODEL}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Say "connection successful" in exactly those words.' }] }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API bağlantı hatası');
        }

        return true;
    },

    buildPrompt(word, count = 10) {
        return `You are an expert English teacher creating active-recall vocabulary exercises.

Task: Generate exactly ${count} fill-in-the-blank sentences for the word "${word}".

Rules:
* Use the word in its most common grammatical forms and meanings (noun, verb, adjective, etc.). If both noun and verb exist, include both.
* Sentences must sound natural and contain strong context clues.
* Length: 8-16 words.
* Difficulty: medium (daily conversation to light academic).
* Replace the target word (or its form) with "___".

Phrasal verbs:
If the word is a multi-word expression (e.g., "put up with", "carve out"):
* Remove the entire phrase and replace it with ONE "___".
* Do not leave any part of the phrase in the sentence.
* The \`answer\` must contain the full phrase.

Answer rules:
* \`answer\` must be EXACTLY "${word}" or a direct grammatical form of it (e.g., leave -> leaving / acted).
* Never use synonyms (e.g., if target is "vice", do not use "rid").

Context:
* Each sentence must use a different context.

Turkish:
* \`turkish\` must be a natural, non-robotic translation of the sentence.
* \`hint\` must be the Turkish meaning of the word form used in that specific sentence.

Return ONLY a valid JSON array with exactly ${count} objects.
Example:
[
  {
    "sentence": "She ___ the door open for the guests.",
    "answer": "left",
    "turkish": "Misafirler için kapıyı açık bıraktı.",
    "hint": "bırakmak"
  }
]

IMPORTANT: Return ONLY the JSON array.`;
    },

    async generateSentences(word, count = 10, onProgress = null) {
        const apiKey = await this.getApiKey();
        if (!apiKey) throw new Error('API anahtarı bulunamadı');

        const url = `${this.BASE_URL}/${this.MODEL}:generateContent?key=${apiKey}`;
        const prompt = this.buildPrompt(word, count);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                    responseMimeType: 'application/json'
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Cümle üretme hatası');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error('API boş yanıt döndürdü');

        try {
            // Try parsing directly
            const sentences = JSON.parse(text);

            // Validate structure
            if (!Array.isArray(sentences)) throw new Error('JSON array bekleniyor');

            return sentences.map(s => ({
                sentence: s.sentence || '',
                answer: (s.answer || '').toLowerCase().trim(),
                turkish: s.turkish || '',
                hint: s.hint || ''
            })).filter(s => s.sentence && s.answer);
        } catch (parseError) {
            // Try extracting JSON from markdown code blocks
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const sentences = JSON.parse(jsonMatch[0]);
                return sentences.map(s => ({
                    sentence: s.sentence || '',
                    answer: (s.answer || '').toLowerCase().trim(),
                    turkish: s.turkish || '',
                    hint: s.hint || ''
                })).filter(s => s.sentence && s.answer);
            }
            throw new Error('API yanıtı ayrıştırılamadı: ' + parseError.message);
        }
    },

    async generateForMissingWords(words, minCount = 10, onProgress = null) {
        const results = { success: [], failed: [] };
        let processed = 0;

        for (const word of words) {
            try {
                const existingCount = await DB.getSentenceCountForWord(word);

                if (existingCount >= minCount) {
                    processed++;
                    if (onProgress) onProgress(processed, words.length, word, 'skipped');
                    continue;
                }

                const needed = minCount - existingCount;
                const sentences = await this.generateSentences(word, needed);

                await DB.addSentences(word, sentences);
                results.success.push({ word, generated: sentences.length });

                processed++;
                if (onProgress) onProgress(processed, words.length, word, 'success');

                // Rate limiting: short delay between requests
                await new Promise(r => setTimeout(r, 500));
            } catch (error) {
                results.failed.push({ word, error: error.message });
                processed++;
                if (onProgress) onProgress(processed, words.length, word, 'error');

                // Longer delay on error (might be rate limited)
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        return results;
    },

    async addMoreSentences(word, additionalCount = 5) {
        const sentences = await this.generateSentences(word, additionalCount);
        await DB.addSentences(word, sentences);
        return sentences.length;
    }
};
