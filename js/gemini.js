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
        return `You are an expert English-Turkish vocabulary curriculum designer.
        
Task: You are given a JSON list of dictionary definitions (meanings) for the target word/phrase: "${word}".
Your job is to generate exactly ${generateCount} natural, medium-difficulty (B1-B2 level) example sentences for EACH provided meaning.

STRICT INSTRUCTIONS:
1. Generate natural, conversational English sentences that clearly demonstrate the specific meaning. 
   - Difficulty: Medium (B1-B2 level). Not overly simple ("He is a fella"), but not archaic or excessively formal. Example tone: "I ticked three things off the list in my head, and had only four chores left to do."
2. YOU MUST strictly use the exact target word ("${word}") or a direct grammatical inflection (e.g., plurals, past tense). DO NOT use synonyms like "colleague" for "fella".
3. Replace the occurrence of the target word/phrase in your generated sentence with "___".
4. Put the exact word you removed into the \`answer\` field. Ensure phrasal verbs are completely removed if they are the target.
5. Provide a natural Turkish translation of your sentence in the \`turkish\` field.
6. Provide a \`hint\` which is a 1-3 word Turkish translation of the specific dictionary definition. Use the exact same hint for all sentences sharing a meaning.
7. Identify each sentence with its corresponding \`meaningIndex\` (from 0 to ${meaningsToProcess.length - 1}) based on the input array.

Input Data:
${JSON.stringify(meaningsToProcess, null, 2)}

Return ONLY a valid JSON array of objects in this EXACT format for EVERY sentence generated:
[
  {
    "meaningIndex": 0,
    "sentence": "Your generated B1-B2 English sentence with the ___ blank.",
    "answer": "the removed target word",
    "turkish": "Turkish translation of the sentence",
    "hint": "kısa ipucu",
    "source": "ai"
  }
]

IMPORTANT: Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.`;
    },

    async generateDictionaryMeaning(word) {
        const apiKey = await this.getApiKey();
        if (!apiKey) throw new Error('API anahtarı bulunamadı');

        const prompt = `You are an expert English-Turkish dictionary compiler.
        
Task: The word/idiom/phrase "${word}" was not found in standard dictionary APIs.
Please define this expression accurately in English. Include common slang, idiomatic uses, or colloquialisms if applicable.

STRICT INSTRUCTIONS:
1. Provide exactly ONE primary definition for the word/phrase.
2. Identify the partOfSpeech (e.g., noun, verb, idiom, phrase).
3. The definition MUST be in English and be short, clear, and accurate.

IMPORTANT: Return ONLY a valid JSON object in this EXACT format. Do not use markdown blocks like \`\`\`json:
{
  "word": "${word}",
  "audio": null,
  "meanings": [
    {
      "partOfSpeech": "idiom",
      "definition": "To deceive someone playfully; to tease someone.",
      "example": null
    }
  ]
}`;

        const url = `${this.BASE_URL}/${this.MODEL}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API failed to generate definition.');
        }

        const responseData = await response.json();
        let textResponse = responseData.candidates[0].content.parts[0].text.trim();
        
        // Strip markdown if AI accidentally includes it
        if (textResponse.startsWith('\`\`\`json')) {
            textResponse = textResponse.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (textResponse.startsWith('\`\`\`')) {
            textResponse = textResponse.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }
        
        try {
            const parsed = JSON.parse(textResponse);
            if (parsed.meanings && Array.isArray(parsed.meanings)) {
                parsed.meanings.forEach(m => {
                    m.definition = m.definition + " (🤖 AI Üretimi)";
                });
            }
            return parsed;
        } catch (e) {
            console.error("Failed to parse Gemini Dictionary response:", textResponse);
            throw new Error("Geçersiz AI sözlük cevabı.");
        }
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
