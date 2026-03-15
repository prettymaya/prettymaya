const DictionaryService = {
    BASE_URL: 'https://api.dictionaryapi.dev/api/v2/entries/en',

    async fetchWithRetry(url, options = {}, retries = 2, backoff = 1000) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // If it's a 404 (Not Found), don't retry, it just means the word doesn't exist.
                if (response.status === 404) {
                    return response;
                }
                
                // If it's a server error (5xx) or Rate Limit (429), throw to trigger retry
                if (response.status >= 500 || response.status === 429) {
                    throw new Error(`Server returned ${response.status}`);
                }
            }
            return response;
        } catch (error) {
            if (retries > 0) {
                console.warn(`Fetch failed (${error.message}). Retrying in ${backoff}ms... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw error;
        }
    },

    async fetchWord(word) {
        try {
            // Tier 1: V1 API (Comprehensive Senses)
            const result = await this.fetchV1(word);
            result.meanings = await GeminiService.filterTopMeanings(word, result.meanings);
            return result;
        } catch (v1Error) {
            console.warn('Dictionary V1 Error, falling back to V2:', v1Error.message);
            try {
                // Tier 2: V2 API (Standard Meanings)
                const response = await this.fetchWithRetry(`${this.BASE_URL}/${encodeURIComponent(word)}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Sözlükte "${word}" kelimesi bulunamadı.`);
                    }
                    throw new Error('Sözlük API bağlantı hatası.');
                }
                const data = await response.json();
                const result = this.parseResponse(data[0]); 
                result.meanings = await GeminiService.filterTopMeanings(word, result.meanings);
                return result;
            } catch (v2Error) {
                console.warn('Dictionary V2 Error, falling back to Wiktionary:', v2Error.message);
                try {
                    const result = await this.fetchWiktionary(word);
                    result.meanings = await GeminiService.filterTopMeanings(word, result.meanings);
                    return result;
                } catch (wiktiError) {
                    console.warn('Wiktionary failed for literal word. Falling back to Gemini...', wiktiError.message);
                    
                    // Ultimate Fallback: Gemini AI Dictionary
                    try {
                        console.log('Routing unknown phrase to Gemini AI Dictionary Generation:', word);
                        return await GeminiService.generateDictionaryMeaning(word);
                    } catch (geminiError) {
                        console.error('All Dictionary Fallbacks failed:', geminiError);
                        throw new Error(`Sözlükte "${word}" anlamı bulunamadı.`);
                    }
                }
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
                    definition: def.definition + " [v2]",
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
    },

    async fetchV1(word) {
        const url = `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word)}`;
        const response = await this.fetchWithRetry(url);
        
        if (!response.ok) {
            throw new Error(`V1 Sözlükte "${word}" kelimesi bulunamadı.`);
        }
        
        const data = await response.json();
        
        const result = {
            word: word,
            audio: null,
            meanings: []
        };
        
        // V1 Schema returns an array of entries (one per Part of Speech etc.)
        if (!data.entries || !Array.isArray(data.entries) || data.entries.length === 0) {
            throw new Error(`V1 Sözlükte "${word}" kelimesi bulunamadı (liste boş).`);
        }

        data.entries.forEach(entry => {
            const partOfSpeech = entry.partOfSpeech || 'unknown';
            
            if (entry.senses && Array.isArray(entry.senses)) {
                entry.senses.forEach(sense => {
                    if (sense.definition) {
                        result.meanings.push({
                            partOfSpeech: partOfSpeech,
                            definition: sense.definition + " [v1]",
                            example: null
                        });
                    }
                });
            }
        });
        
        if (result.meanings.length === 0) {
            throw new Error(`V1 Sözlükte "${word}" için geçerli bir anlam bulunamadı.`);
        }
        
        return result;
    },

    async fetchWiktionary(word) {
        const titleCaseWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        
        let url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.toLowerCase())}`;
        let response = await this.fetchWithRetry(url);
        
        if (!response.ok && response.status === 404) {
             url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(titleCaseWord)}`;
             response = await this.fetchWithRetry(url);
        }

        if (!response.ok) {
            throw new Error(`Wiktionary'de "${word}" kelimesi bulunamadı.`);
        }

        // Strict Matching: Ensure Wiktionary didn't redirect us to a completely different word
        const resolvedTitle = decodeURIComponent(response.url.split('/').pop().toLowerCase());
        const expectedWord = word.toLowerCase();
        
        // Allow minor case differences, but block completely different words (e.g. Wiktionary fuzzy matching)
        if (resolvedTitle !== expectedWord) {
            throw new Error(`Wiktionary "${word}" kelimesini bulamadı. (Bunun yerine "${resolvedTitle}" sonucunu verdi).`);
        }

        const data = await response.json();
        
        const result = {
            word: word,
            audio: null, // Audio from Wiktionary requires secondary calls or parsing different endpoints. Skip for simplicity unless needed.
            meanings: []
        };

        const activeLocales = Object.keys(data).filter(k => k.toLowerCase() === 'en');
        if (activeLocales.length === 0) {
            throw new Error(`İngilizce tanım bulunamadı.`);
        }

        const localeData = data[activeLocales[0]];

        localeData.forEach(posGroup => {
            const partOfSpeech = posGroup.partOfSpeech.toLowerCase();
            if (posGroup.definitions && Array.isArray(posGroup.definitions)) {
                posGroup.definitions.forEach(defObj => {
                    const cleanDef = defObj.definition.replace(/<[^>]*>/g, '').trim(); 
                    
                    // Filter out meaningless redirect definitions
                    const isRedirect = cleanDef.includes("plural of") || 
                                       cleanDef.includes("third-person singular") ||
                                       cleanDef.includes("Alternative form of") ||
                                       cleanDef.includes("Alternative spelling of") ||
                                       cleanDef.includes("past participle of");
                                       
                    // Strict Context Matching: The definition or its examples MUST contain the word
                    // Sometimes definitions don't contain the word, but their examples do.
                    let contentHasWord = cleanDef.toLowerCase().includes(expectedWord);
                    
                    if (!contentHasWord && defObj.parsedExamples) {
                        for (const ex of defObj.parsedExamples) {
                            if (ex.example && ex.example.toLowerCase().includes(expectedWord)) {
                                contentHasWord = true;
                                break;
                            }
                        }
                    }

                    // For extremely short words (like "run"), the examples check is crucial.
                    // If we couldn't find the word in the definition or examples, it might be an unrelated redirect, 
                    // or a highly abstracted definition. To be extremely safe as per user request:
                    if (cleanDef && cleanDef.length > 5 && !isRedirect && contentHasWord) {
                        result.meanings.push({
                            partOfSpeech: partOfSpeech,
                            definition: cleanDef + " [Wiki]",
                            example: null // Enforce AI generation
                        });
                    }
                });
            }
        });

        if (result.meanings.length === 0) {
             throw new Error(`Geçerli bir anlam bulunamadı.`);
        }
        
        // Let's cap Wiktionary at maybe 8 meanings to avoid massive dumps of useless definitions,
        // but DictionaryAPI runs free. Wiktionary can have 30+ definitions.
        result.meanings = result.meanings.slice(0, 10);

        return result;
    }
};
