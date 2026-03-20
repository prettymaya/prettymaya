// PrettyMaya - IndexedDB Database Layer
const DB = {
    db: null,
    DB_NAME: 'prettymaya',
    DB_VERSION: 4,

    DEFAULT_CATEGORIES: [
        { id: 1, name: 'v1 API', isDefault: true },
        { id: 2, name: 'v2 API', isDefault: true },
        { id: 3, name: 'Wiktionary', isDefault: true },
        { id: 4, name: 'AI Üretimi', isDefault: true }
    ],

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
                const tx = event.target.transaction;

                // Words store
                if (!db.objectStoreNames.contains('words')) {
                    const wordStore = db.createObjectStore('words', { keyPath: 'word' });
                    wordStore.createIndex('addedDate', 'addedDate', { unique: false });
                }

                // Meanings store
                if (!db.objectStoreNames.contains('meanings')) {
                    const meaningStore = db.createObjectStore('meanings', { keyPath: 'id', autoIncrement: true });
                    meaningStore.createIndex('word', 'word', { unique: false });
                }

                // Sentences store
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

                // ─── v4: Categories ─────────────────────────────────
                if (!db.objectStoreNames.contains('categories')) {
                    const catStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                    catStore.createIndex('name', 'name', { unique: true });
                }

                if (!db.objectStoreNames.contains('word_categories')) {
                    const wcStore = db.createObjectStore('word_categories', { keyPath: 'id', autoIncrement: true });
                    wcStore.createIndex('word', 'word', { unique: false });
                    wcStore.createIndex('categoryId', 'categoryId', { unique: false });
                    wcStore.createIndex('word_category', ['word', 'categoryId'], { unique: true });
                }
            };
        });
    },

    // Run after init — seeds default categories and migrates existing data
    async runMigration() {
        const cats = await this.getAllCategories();
        if (cats.length === 0) {
            // Seed default categories
            const tx = this.db.transaction('categories', 'readwrite');
            const store = tx.objectStore('categories');
            for (const c of this.DEFAULT_CATEGORIES) {
                store.put({ ...c, createdDate: new Date().toISOString() });
            }
            await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });

            // Auto-categorize existing words based on meaning tags
            await this.autoCategorizeAllWords();
        }
    },

    async autoCategorizeAllWords() {
        const allMeanings = await this.getAllMeanings();
        const wordCatMap = {}; // { word: Set<categoryId> }

        for (const m of allMeanings) {
            const def = m.definition || '';
            if (!wordCatMap[m.word]) wordCatMap[m.word] = new Set();

            if (def.includes('[v1]')) wordCatMap[m.word].add(1);
            if (def.includes('[v2]')) wordCatMap[m.word].add(2);
            if (def.includes('[Wiki]')) wordCatMap[m.word].add(3);
            if (def.includes('[🤖 AI]') || def.includes('(🤖 AI Üretimi)')) wordCatMap[m.word].add(4);
        }

        const tx = this.db.transaction('word_categories', 'readwrite');
        const store = tx.objectStore('word_categories');
        for (const [word, catIds] of Object.entries(wordCatMap)) {
            for (const catId of catIds) {
                try {
                    store.add({ word, categoryId: catId });
                } catch (e) { /* duplicate, skip */ }
            }
        }
        await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
    },

    // Auto-categorize a single word based on its meanings
    async autoCategorizeWord(word, meanings) {
        const catIds = new Set();
        for (const m of meanings) {
            const def = m.definition || '';
            if (def.includes('[v1]')) catIds.add(1);
            if (def.includes('[v2]')) catIds.add(2);
            if (def.includes('[Wiki]')) catIds.add(3);
            if (def.includes('[🤖 AI]') || def.includes('(🤖 AI Üretimi)')) catIds.add(4);
        }
        for (const catId of catIds) {
            try { await this.addWordToCategory(word, catId); } catch (e) { /* already exists */ }
        }
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
        const tx = this.db.transaction(['words', 'sentences', 'meanings', 'word_categories'], 'readwrite');
        tx.objectStore('words').delete(word);

        // Delete associated sentences
        const sentenceStore = tx.objectStore('sentences');
        const sIndex = sentenceStore.index('word');
        const sReq = sIndex.openCursor(IDBKeyRange.only(word));
        sReq.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) { cursor.delete(); cursor.continue(); }
        };

        // Delete associated meanings
        const meaningStore = tx.objectStore('meanings');
        const mIndex = meaningStore.index('word');
        const mReq = mIndex.openCursor(IDBKeyRange.only(word));
        mReq.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) { cursor.delete(); cursor.continue(); }
        };

        // Delete word-category mappings
        const wcStore = tx.objectStore('word_categories');
        const wcIndex = wcStore.index('word');
        const wcReq = wcIndex.openCursor(IDBKeyRange.only(word));
        wcReq.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) { cursor.delete(); cursor.continue(); }
        };

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async deleteAllWords() {
        const tx = this.db.transaction(['words', 'sentences', 'meanings', 'word_categories'], 'readwrite');
        tx.objectStore('words').clear();
        tx.objectStore('sentences').clear();
        tx.objectStore('meanings').clear();
        tx.objectStore('word_categories').clear();
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
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sentences', 'readonly');
            const store = tx.objectStore('sentences');
            const index = store.index('word');
            const counts = {};
            const req = index.openKeyCursor();
            req.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    counts[cursor.key] = (counts[cursor.key] || 0) + 1;
                    cursor.continue();
                } else {
                    resolve(counts);
                }
            };
            req.onerror = () => reject(req.error);
        });
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

        // Auto-categorize this word based on new meanings
        await this.autoCategorizeWord(word, meanings);

        return addedIds;
    },

    async deleteMeaning(id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('meanings', 'readwrite');
            const store = tx.objectStore('meanings');
            const req = store.delete(Number(id));
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async getAllMeanings() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('meanings', 'readonly');
            const store = tx.objectStore('meanings');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
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

    async getAllMeaningsGrouped() {
        const all = await this.getAllMeanings();
        const grouped = {};
        for (const m of all) {
            if (!grouped[m.word]) grouped[m.word] = [];
            grouped[m.word].push(m);
        }
        return grouped;
    },

    async getAllSentencesGrouped() {
        const all = await this.getAllSentences();
        const grouped = {};
        for (const s of all) {
            if (!grouped[s.word]) grouped[s.word] = [];
            grouped[s.word].push(s);
        }
        return grouped;
    },

    async getMeaningCount() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('meanings', 'readonly');
            const store = tx.objectStore('meanings');
            const req = store.count();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async getActiveMeaningCount() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sentences', 'readonly');
            const store = tx.objectStore('sentences');
            const index = store.index('meaningId');
            const uniqueMeanings = new Set();
            const req = index.openKeyCursor();
            req.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.key) uniqueMeanings.add(cursor.key);
                    cursor.continue();
                } else {
                    resolve(uniqueMeanings.size);
                }
            };
            req.onerror = () => reject(req.error);
        });
    },

    // ─── Categories ───────────────────────────────────────────
    async getAllCategories() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('categories', 'readonly');
            const store = tx.objectStore('categories');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    },

    async addCategory(name) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('categories', 'readwrite');
            const store = tx.objectStore('categories');
            const req = store.add({ name, isDefault: false, createdDate: new Date().toISOString() });
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async deleteCategory(id) {
        // Delete category + all its word_categories mappings
        const tx = this.db.transaction(['categories', 'word_categories'], 'readwrite');
        tx.objectStore('categories').delete(Number(id));

        const wcStore = tx.objectStore('word_categories');
        const wcIndex = wcStore.index('categoryId');
        const wcReq = wcIndex.openCursor(IDBKeyRange.only(Number(id)));
        wcReq.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) { cursor.delete(); cursor.continue(); }
        };

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async addWordToCategory(word, categoryId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('word_categories', 'readwrite');
            const store = tx.objectStore('word_categories');
            const req = store.add({ word, categoryId: Number(categoryId) });
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async removeWordFromCategory(word, categoryId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('word_categories', 'readwrite');
            const store = tx.objectStore('word_categories');
            const index = store.index('word_category');
            const req = index.openCursor(IDBKeyRange.only([word, Number(categoryId)]));
            req.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) cursor.delete();
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getWordsInCategory(categoryId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('word_categories', 'readonly');
            const store = tx.objectStore('word_categories');
            const index = store.index('categoryId');
            const req = index.getAll(IDBKeyRange.only(Number(categoryId)));
            req.onsuccess = () => resolve((req.result || []).map(r => r.word));
            req.onerror = () => reject(req.error);
        });
    },

    async getCategoriesForWord(word) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('word_categories', 'readonly');
            const store = tx.objectStore('word_categories');
            const index = store.index('word');
            const req = index.getAll(IDBKeyRange.only(word));
            req.onsuccess = () => resolve((req.result || []).map(r => r.categoryId));
            req.onerror = () => reject(req.error);
        });
    },

    async addBulkWordsToCategory(words, categoryId) {
        // Only adds words that exist in the DB, silently skips unknown ones
        const allWords = await this.getAllWords();
        const wordSet = new Set(allWords.map(w => w.word));
        const added = [];
        const skipped = [];

        const tx = this.db.transaction('word_categories', 'readwrite');
        const store = tx.objectStore('word_categories');

        for (const word of words) {
            const clean = word.trim().toLowerCase();
            if (!clean) continue;
            if (!wordSet.has(clean)) { skipped.push(clean); continue; }
            try {
                store.add({ word: clean, categoryId: Number(categoryId) });
                added.push(clean);
            } catch (e) { /* duplicate, skip */ }
        }

        await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
        return { added, skipped };
    },

    async getCategoryWordCounts() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('word_categories', 'readonly');
            const store = tx.objectStore('word_categories');
            const index = store.index('categoryId');
            const counts = {};
            const req = index.openKeyCursor();
            req.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    counts[cursor.key] = (counts[cursor.key] || 0) + 1;
                    cursor.continue();
                } else {
                    resolve(counts);
                }
            };
            req.onerror = () => reject(req.error);
        });
    },

    async getAllWordCategories() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('word_categories', 'readonly');
            const store = tx.objectStore('word_categories');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
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
        const sentences = await this.getAllSentences();
        const meanings = await this.getAllMeanings();
        const history = await this.getSessionHistory();
        const categories = await this.getAllCategories();
        const wordCategories = await this.getAllWordCategories();

        return { words, sentences, meanings, history, categories, wordCategories, exportDate: new Date().toISOString() };
    },

    async importAll(data) {
        // Clear existing data
        await this.deleteAllWords();

        // Also clear categories + word_categories
        const txCat = this.db.transaction(['categories', 'word_categories'], 'readwrite');
        txCat.objectStore('categories').clear();
        txCat.objectStore('word_categories').clear();
        await new Promise((res, rej) => { txCat.oncomplete = () => res(); txCat.onerror = () => rej(txCat.error); });

        // Import words
        if (data.words && data.words.length > 0) {
            const tx = this.db.transaction('words', 'readwrite');
            const store = tx.objectStore('words');
            for (const w of data.words) store.add(w);
            await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
        }

        // Import meanings
        if (data.meanings && data.meanings.length > 0) {
            const tx = this.db.transaction('meanings', 'readwrite');
            const store = tx.objectStore('meanings');
            for (const m of data.meanings) store.add(m);
            await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
        }

        // Import sentences
        if (data.sentences && data.sentences.length > 0) {
            const tx = this.db.transaction('sentences', 'readwrite');
            const store = tx.objectStore('sentences');
            for (const s of data.sentences) store.add(s);
            await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
        }

        // Import categories
        if (data.categories && data.categories.length > 0) {
            const tx = this.db.transaction('categories', 'readwrite');
            const store = tx.objectStore('categories');
            for (const c of data.categories) store.put(c);
            await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
        } else {
            // No categories in export — seed defaults
            const tx = this.db.transaction('categories', 'readwrite');
            const store = tx.objectStore('categories');
            for (const c of this.DEFAULT_CATEGORIES) {
                store.put({ ...c, createdDate: new Date().toISOString() });
            }
            await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
        }

        // Import word_categories
        if (data.wordCategories && data.wordCategories.length > 0) {
            const tx = this.db.transaction('word_categories', 'readwrite');
            const store = tx.objectStore('word_categories');
            for (const wc of data.wordCategories) store.add(wc);
            await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
        } else {
            // No word_categories in export — auto-categorize
            await this.autoCategorizeAllWords();
        }
    }
};
