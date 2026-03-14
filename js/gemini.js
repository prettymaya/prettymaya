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

    buildPrompt(word, meaningsToProcess, generateCount) {
        return `You are an expert English-Turkish translator and vocabulary curriculum designer.
        
Task: You will receive a JSON list of definitions and examples for the English word/phrase "${word}" from a dictionary API.
Your job is to translate the examples into natural, fluent Turkish, provide a short Turkish 'hint' for the definition, and generate additional sentences.

STRICT INSTRUCTIONS:
1. For each meaning provided, read the "example" sentence.
2. If the "example" is NOT null:
   - First, provide a natural Turkish translation of that EXACT sentence (set source to "dictionary").
   - Replace the target word/phrase with "___" and put it in \`answer\`.
   - THEN, generate ${Math.max(0, generateCount - 1)} MORE natural, B1-B2 level English fill-in-the-blank sentences demonstrating this same definition (set source to "ai").
3. If the "example" IS null:
   - YOU MUST generate exactly ${generateCount} natural, B1-B2 level English fill-in-the-blank sentences that perfectly demonstrate that specific definition (set source to "ai").
4. For all sentences belonging to the same meaning, use the SAME \`hint\` which is a 1-3 word Turkish translation of the dictionary definition.
5. Identify each sentence with its corresponding \`meaningIndex\` (from 0 to ${meaningsToProcess.length - 1}) based on the input array.

Input Data:
${JSON.stringify(meaningsToProcess, null, 2)}

Return ONLY a valid JSON array of objects in this EXACT format for EVERY sentence generated/translated:
[
  {
    "meaningIndex": 0,
    "sentence": "The original dictionary sentence with ___ blank, OR your generated sentence with ___.",
    "answer": "the removed word",
    "turkish": "Turkish translation of the sentence",
    "hint": "kısa hint",
    "source": "dictionary" // or "ai"
  }
]

IMPORTANT: Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.`;
    },

    async processDictionaryMeanings(word, meanings, generateCount = 1, onProgress = null) {
        const apiKey = await this.getApiKey();
        if (!apiKey) throw new Error('API anahtarı bulunamadı');

        const url = `${this.BASE_URL}/${this.MODEL}:generateContent?key=${apiKey}`;
        const prompt = this.buildPrompt(word, meanings, generateCount);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2, // Low temperature for precise translation
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gemini API Hatası');
        }

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        
        try {
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const translatedArr = JSON.parse(cleanJson);
            
            // Merge the Gemini translations back with the meaning IDs using meaningIndex
            return translatedArr.map((translation) => {
                const targetMeaning = meanings[translation.meaningIndex];
                return {
                    meaningId: targetMeaning ? targetMeaning.id : meanings[0].id,
                    sentence: translation.sentence,
                    answer: translation.answer,
                    turkish: translation.turkish,
                    hint: translation.hint,
                    source: translation.source || 'ai'
                };
            });
        } catch (e) {
            console.error("Gemini JSON Parsing Error:", textResponse);
            throw new Error("Gemini geçerli bir JSON formatı döndürmedi.");
        }
    }
};
