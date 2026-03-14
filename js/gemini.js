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

    buildPrompt(word, meaningsToProcess) {
        return `You are an expert English-Turkish translator and vocabulary curriculum designer.
        
Task: You will receive a JSON list of definitions and examples for the English word/phrase "${word}" from a dictionary API.
Your job is to translate the examples into natural, fluent Turkish and provide a short Turkish 'hint' for the definition.

STRICT INSTRUCTIONS:
1. For each meaning provided, read the "example" sentence.
2. If the "example" is NOT null:
   - Provide a natural Turkish translation of that EXACT sentence in the \`turkish\` field.
   - Replace the occurrence of the target word/phrase in the English sentence with "___" and put the removed word/phrase in the \`answer\` field. Ensure phrasal verbs are completely removed.
3. If the "example" IS null:
   - YOU MUST generate exactly ONE natural, B1-B2 level English fill-in-the-blank sentence that perfectly demonstrates that specific definition.
   - Replace the target word with "___". 
   - Put the removed word in the \`answer\` field.
   - Provide the \`turkish\` translation.
   - Set the \`source\` field to "ai" (if you generated the sentence) or "dictionary" (if you used the provided example).
4. For all meanings, provide a \`hint\` which is a 1-3 word Turkish translation of the specific dictionary definition.

Input Data:
${JSON.stringify(meaningsToProcess, null, 2)}

Return ONLY a valid JSON array of objects in this EXACT format for each input meaning (keep the same array order):
[
  {
    "sentence": "The exact dictionary sentence with ___ blank, OR your generated sentence with ___.",
    "answer": "the removed word",
    "turkish": "Turkish translation of the sentence",
    "hint": "kısa hint",
    "source": "dictionary" // or "ai" if you had to generate it
  }
]

IMPORTANT: Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.`;
    },

    async processDictionaryMeanings(word, meanings, onProgress = null) {
        const apiKey = await this.getApiKey();
        if (!apiKey) throw new Error('API anahtarı bulunamadı');

        const url = `${this.BASE_URL}/${this.MODEL}:generateContent?key=${apiKey}`;
        const prompt = this.buildPrompt(word, meanings);

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
            
            // Merge the Gemini translations back with the meaning IDs
            return meanings.map((m, index) => {
                const translation = translatedArr[index];
                return {
                    meaningId: m.id, // This will be assigned after saving meanings to DB
                    sentence: translation.sentence,
                    answer: translation.answer,
                    turkish: translation.turkish,
                    hint: translation.hint,
                    source: translation.source || 'dictionary'
                };
            });
        } catch (e) {
            console.error("Gemini JSON Parsing Error:", textResponse);
            throw new Error("Gemini geçerli bir JSON formatı döndürmedi.");
        }
    }
};
