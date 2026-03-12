// PrettyMaya - Gemini API Service
const GeminiService = {
    MODEL: 'gemini-2.5-flash-lite',
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
        return `You are an expert English teacher creating vocabulary exercises. Generate exactly ${count} fill-in-the-blank sentences for the English word "${word}".

STRICT RULES:
1. Use the word's most common and natural meanings
2. Sentences must sound completely native and natural — like something a native English speaker would actually say
3. Difficulty: medium (not too easy, not too hard — everyday conversational to light academic)
4. Length: medium (8-15 words per sentence)
5. Replace the target word (or its grammatical form) with "___" (three underscores)
6. The word may appear in different grammatical forms (e.g., "leave" → "left", "leaving", "leaves")
7. Each sentence should use a DIFFERENT meaning or context of the word when possible
8. Turkish translations must be natural and fluent — not word-by-word translations
9. The "hint" field should contain the Turkish meaning of the specific form used in that sentence

Return ONLY a valid JSON array with exactly ${count} objects in this format:
[
  {
    "sentence": "She ___ the door open for the guests.",
    "answer": "left",
    "turkish": "Misafirler için kapıyı açık bıraktı.",
    "hint": "bırakmak"
  }
]

IMPORTANT: Return ONLY the JSON array. No explanations, no markdown, no code blocks.`;
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
