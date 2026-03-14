// PrettyMaya - IndexedDB Database Layer
const DB = {
    db: null,
    DB_NAME: 'prettymaya',
    DB_VERSION: 3,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Words store (added audio field)
                if (!db.objectStoreNames.contains('words')) {
                    const wordStore = db.createObjectStore('words', { keyPath: 'word' });
                    wordStore.createIndex('addedDate', 'addedDate', { unique: false });
                }

                // Meanings store (New in v3) - Holds definitions from Dictionary API
                if (!db.objectStoreNames.contains('meanings')) {
                    const meaningStore = db.createObjectStore('meanings', { keyPath: 'id', autoIncrement: true });
                    meaningStore.createIndex('word', 'word', { unique: false });
                }

                // Sentences store (Updated in v3 to include meaningId and source)
                if (!db.objectStoreNames.contains('sentences')) {
                    const sentenceStore = db.createObjectStore('sentences', { keyPath: 'id', autoIncrement: true });
                    sentenceStore.createIndex('word', 'word', { unique: false });
                    sentenceStore.createIndex('meaningId', 'meaningId', { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Session history store
                if (!db.objectStoreNames.contains('history')) {
                    const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('date', 'date', { unique: false });
                }
            };
        });
    },

    // ─── Words ───────────────────────────────────────────────
    async addWords(wordList) {
        const tx = this.db.transaction('words', 'readwrite');
        const store = tx.objectStore('words');
        const added = [];
        const existing = [];

        for (const wordObj of wordList) {
            // Support both old array of strings and new array of objects {word, audio}
            const cleanWord = typeof wordObj === 'string' ? wordObj.trim().toLowerCase() : wordObj.word.trim().toLowerCase();
            const audioUrl = typeof wordObj === 'object' ? wordObj.audio : null;

            if (!cleanWord) continue;

            try {
                const check = await new Promise((resolve, reject) => {
                    const req = store.get(cleanWord);
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });

                if (check) {
                    existing.push(cleanWord);
                } else {
                    await new Promise((resolve, reject) => {
                        const req = store.add({
                            word: cleanWord,
                            audio: audioUrl,
                            addedDate: new Date().toISOString()
                        });
                        req.onsuccess = () => resolve();
                        req.onerror = () => reject(req.error);
                    });
                    added.push(cleanWord);
                }
            } catch (e) {
                console.error(`Error adding word "${cleanWord}":`, e);
            }
        }

        return { added, existing };
    },

    async getAllWords() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('words', 'readonly');
            const store = tx.objectStore('words');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async deleteWord(word) {
        const tx = this.db.transaction(['words', 'sentences', 'meanings'], 'readwrite');
        tx.objectStore('words').delete(word);

        // Delete associated sentences
        const sentenceStore = tx.objectStore('sentences');
        const sIndex = sentenceStore.index('word');
        const sReq = sIndex.openCursor(IDBKeyRange.only(word));
        sReq.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        // Delete associated meanings
        const meaningStore = tx.objectStore('meanings');
        const mIndex = meaningStore.index('word');
        const mReq = mIndex.openCursor(IDBKeyRange.only(word));
        mReq.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async deleteAllWords() {
        const tx = this.db.transaction(['words', 'sentences', 'meanings'], 'readwrite');
        tx.objectStore('words').clear();
        tx.objectStore('sentences').clear();
        tx.objectStore('meanings').clear();
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    // ─── Sentences ───────────────────────────────────────────
    async getSentencesForWord(word) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sentences', 'readonly');
            const store = tx.objectStore('sentences');
            const index = store.index('word');
            const req = index.getAll(IDBKeyRange.only(word));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async getSentenceCountForWord(word) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sentences', 'readonly');
            const store = tx.objectStore('sentences');
            const index = store.index('word');
            const req = index.count(IDBKeyRange.only(word));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async getAllSentences() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sentences', 'readonly');
            const store = tx.objectStore('sentences');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    },

    async getAllSentenceCounts() {
        const sentences = await this.getAllSentences();
        const counts = {};
        for (const s of sentences) {
            counts[s.word] = (counts[s.word] || 0) + 1;
        }
        return counts;
    },

    async addSentences(word, sentences) {
        const tx = this.db.transaction('sentences', 'readwrite');
        const store = tx.objectStore('sentences');

        for (const s of sentences) {
            await new Promise((resolve, reject) => {
                const req = store.add({
                    word: word,
                    meaningId: s.meaningId || null,
                    sentence: s.sentence,
                    answer: s.answer,
                    turkish: s.turkish,
                    hint: s.hint,
                    source: s.source || 'dictionary' // 'dictionary' or 'ai'
                });
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
        }
    },

    async deleteSentencesForWord(word) {
        const tx = this.db.transaction('sentences', 'readwrite');
        const store = tx.objectStore('sentences');
        const index = store.index('word');
        const req = index.openCursor(IDBKeyRange.only(word));

        return new Promise((resolve, reject) => {
            req.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async deleteSentenceById(id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sentences', 'readwrite');
            const store = tx.objectStore('sentences');
            const req = store.delete(Number(id));
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    // ─── Meanings (Dictionary Definitions) ───────────────────
    async addMeanings(word, meanings) {
        const tx = this.db.transaction('meanings', 'readwrite');
        const store = tx.objectStore('meanings');
        const addedIds = [];

        for (const m of meanings) {
            const id = await new Promise((resolve, reject) => {
                const req = store.add({
                    word: word,
                    partOfSpeech: m.partOfSpeech,
                    definition: m.definition
                });
                req.onsuccess = (e) => resolve(e.target.result);
                req.onerror = () => reject(req.error);
            });
            addedIds.push(id);
        }
        return addedIds;
    },

    async getMeaningsForWord(word) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('meanings', 'readonly');
            const store = tx.objectStore('meanings');
            const index = store.index('word');
            const req = index.getAll(IDBKeyRange.only(word));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    // ─── Settings ────────────────────────────────────────────
    async getSetting(key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('settings', 'readonly');
            const store = tx.objectStore('settings');
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result?.value || null);
            req.onerror = () => reject(req.error);
        });
    },

    async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('settings', 'readwrite');
            const store = tx.objectStore('settings');
            const req = store.put({ key, value });
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    // ─── History ─────────────────────────────────────────────
    async addSessionHistory(sessionData) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('history', 'readwrite');
            const store = tx.objectStore('history');
            const req = store.add({
                date: new Date().toISOString(),
                ...sessionData
            });
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async getSessionHistory() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('history', 'readonly');
            const store = tx.objectStore('history');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    // ─── Import / Export ─────────────────────────────────────
    async exportAll() {
        const words = await this.getAllWords();
        const tx = this.db.transaction('sentences', 'readonly');
        const sentenceStore = tx.objectStore('sentences');
        const sentences = await new Promise((res, rej) => {
            const req = sentenceStore.getAll();
            req.onsuccess = () => res(req.result);
            req.onerror = () => rej(req.error);
        });
        const history = await this.getSessionHistory();

        return { words, sentences, history, exportDate: new Date().toISOString() };
    },

    async importAll(data) {
        // Clear existing data
        await this.deleteAllWords();

        // Import words
        if (data.words) {
            const tx = this.db.transaction('words', 'readwrite');
            const store = tx.objectStore('words');
            for (const w of data.words) {
                store.add(w);
            }
            await new Promise((res, rej) => {
                tx.oncomplete = () => res();
                tx.onerror = () => rej(tx.error);
            });
        }

        // Import sentences
        if (data.sentences) {
            const tx = this.db.transaction('sentences', 'readwrite');
            const store = tx.objectStore('sentences');
            for (const s of data.sentences) {
                const { id, ...rest } = s; // Remove old id
                store.add(rest);
            }
            await new Promise((res, rej) => {
                tx.oncomplete = () => res();
                tx.onerror = () => rej(tx.error);
            });
        }
    }
};
