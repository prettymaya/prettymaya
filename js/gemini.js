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
        return `You are an expert English teacher creating vocabulary active recall exercises. Generate exactly ${count} fill-in-the-blank sentences for the English word "${word}".

STRICT RULES:
1. REQUIRED DIVERSITY: You MUST use the word in its MOST COMMON grammatical forms and meanings (e.g., as a noun, verb, adjective, adverb) based on how native speakers actually use it. Do NOT just use it as a verb. If a word is both a noun and a verb, provide sentences for BOTH cases.
2. Sentences MUST provide strong, clear context clues. The user should be able to guess the target word based on the rich context of the sentence alone.
3. Sentences must sound completely native and natural — like something a native English speaker would actually say in real life.
4. Difficulty: medium (everyday conversational to light academic).
5. Length: medium (8-16 words per sentence).
6. Replace the target word (or its grammatically modified form) with "___" (three underscores). 
   - CRITICAL DICTATE FOR PHRASAL VERBS: If the target vocabulary is a MULTI-WORD expression (e.g., "carve out", "put up with"), you MUST remove the ENTIRE expression from the sentence and replace it with a SINGLE "___". 
   - DO NOT leave any part of the expression behind. For example, if the word is "carve out", you MUST write "She ___ a niche" (where answer="carved out"). Do NOT write "She ___ out a niche".
   - The \`answer\` field MUST contain the full exact phrase you removed.
7. The word may appear in different grammatical forms (e.g., "leave" → "left", "leaving", "leaves" OR "act" → "acting", "action", "active").
   - EXTREMELY IMPORTANT: The \`answer\` MUST ALWAYS be the exact target phrase "${word}" or a direct grammatical derivation of it. NEVER use a synonym (like using "rid" when the target is "vice").
8. Each sentence MUST provide a DIFFERENT context. You may reuse meanings if the word doesn't have enough distinct meanings to fulfill the count, but the contexts/sentences must be different.
9. Turkish translations must be natural and fluent — not word-by-word translations. Capture the exact nuanced meaning the word has in that specific sentence.
10. The "hint" field should contain the exact Turkish meaning of the word form used in that specific sentence (e.g. if used as a noun, give noun meaning; if verb, give verb meaning).

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
