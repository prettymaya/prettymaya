// PrettyMaya - Session Manager (Spaced Repetition within Session)
class SessionManager {
    constructor(meaningSentencesMap, sentencesPerMeaning = 1) {
        // meaningSentencesMap: Map<string, Array<{id, sentence, answer, turkish, hint, word, meaningId}>>
        this.meaningSentences = meaningSentencesMap;
        this.mainQueue = [];
        this.retryInserts = []; // {card, insertAtPosition, consecutiveCorrect}
        this.position = 0;
        this.completed = new Set();
        this.stats = { correct: 0, incorrect: 0, total: 0 };
        this.wordState = new Map(); // Per-card tracking

        // Build initial queue: 'sentencesPerMeaning' sentences per meaning
        for (const [mId, sentences] of meaningSentencesMap) {
            if (sentences.length === 0) continue;
            
            const word = sentences[0].word;
            
            const shuffled = [...sentences];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            
            const toTake = Math.min(sentencesPerMeaning, shuffled.length);
            
            for (let i = 0; i < toTake; i++) {
                const sentence = shuffled[i];
                const cardKey = `${mId}_${sentence.id}`;

                this.mainQueue.push({
                    cardKey,
                    word,
                    meaningId: mId,
                    sentence,
                    usedSentenceIds: new Set([sentence.id])
                });

                this.wordState.set(cardKey, {
                    needsConfirmation: false,
                    consecutiveCorrect: 0,
                    usedSentenceIds: new Set([sentence.id])
                });
            }
        }

        this.shuffleArray(this.mainQueue);
        this.stats.total = this.mainQueue.length;
        this.currentCard = null;
        this.isSessionComplete = false;
        this.sentenceWritingPhase = false;
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    getNextCard() {
        // First check for retry cards that are due
        const dueRetry = this.retryInserts.findIndex(r => r.insertAtPosition <= this.position);
        if (dueRetry !== -1) {
            const retryItem = this.retryInserts.splice(dueRetry, 1)[0];
            this.currentCard = retryItem.card;
            return this.currentCard;
        }

        // Then check main queue
        if (this.mainQueue.length > 0) {
            this.currentCard = this.mainQueue.shift();
            return this.currentCard;
        }

        // Check if there are pending retries
        if (this.retryInserts.length > 0) {
            // Force the nearest retry
            this.retryInserts.sort((a, b) => a.insertAtPosition - b.insertAtPosition);
            const next = this.retryInserts.shift();
            this.currentCard = next.card;
            return this.currentCard;
        }

        // Session complete
        this.isSessionComplete = true;
        this.currentCard = null;
        return null;
    }

    handleAnswer(isCorrect) {
        if (!this.currentCard) return null;

        const card = this.currentCard;
        const word = card.word;
        const cardKey = card.cardKey;
        const state = this.wordState.get(cardKey);
        this.position++;

        const result = {
            word,
            isCorrect,
            correctAnswer: card.sentence.answer,
            fullSentence: card.sentence.sentence,
            turkishTranslation: card.sentence.turkish,
            isRetry: state.needsConfirmation,
            isDone: false
        };

        if (isCorrect) {
            this.stats.correct++;

            if (!state.needsConfirmation) {
                // First time seeing this word & got it right → DONE
                result.isDone = true;
                this.completed.add(cardKey);
            } else {
                // This is a retry attempt
                state.consecutiveCorrect++;

                if (state.consecutiveCorrect >= 2) {
                    // Two consecutive correct after being wrong → DONE
                    result.isDone = true;
                    this.completed.add(cardKey);
                } else {
                    // One correct, need one more confirmation
                    result.isDone = false;
                    this.scheduleRetry(cardKey, word, state, card.meaningId);
                }
            }
        } else {
            this.stats.incorrect++;
            state.needsConfirmation = true;
            state.consecutiveCorrect = 0;
            this.scheduleRetry(cardKey, word, state, card.meaningId);
        }

        return result;
    }

    skipToDifferentSentence() {
        if (!this.currentCard) return false;
        
        const mId = this.currentCard.meaningId;
        const cardKey = this.currentCard.cardKey;
        const state = this.wordState.get(cardKey);
        const sentences = this.meaningSentences.get(mId) || [];
        
        // Find unused sentences
        const unused = sentences.filter(s => !state.usedSentenceIds.has(s.id));
        let nextSentence;
        
        if (unused.length > 0) {
            nextSentence = unused[Math.floor(Math.random() * unused.length)];
        } else if (sentences.length > 1) {
            // Find a sentence that is NOT the current one
            const others = sentences.filter(s => s.id !== this.currentCard.sentence.id);
            nextSentence = others[Math.floor(Math.random() * others.length)];
        } else {
            // Only 1 sentence exists for this word, can't skip to a different one
            return false;
        }

        state.usedSentenceIds.add(nextSentence.id);
        this.currentCard.sentence = nextSentence;
        
        return true;
    }

    scheduleRetry(cardKey, word, state, mId) {
        const sentences = this.meaningSentences.get(mId) || [];
        const unused = sentences.filter(s => !state.usedSentenceIds.has(s.id));

        let nextSentence;
        if (unused.length > 0) {
            nextSentence = unused[Math.floor(Math.random() * unused.length)];
        } else {
            // Reuse a random sentence if all are used
            nextSentence = sentences[Math.floor(Math.random() * sentences.length)];
        }

        state.usedSentenceIds.add(nextSentence.id);

        const delay = 3 + Math.floor(Math.random() * 2); // 3-4 cards later
        this.retryInserts.push({
            card: {
                cardKey,
                word,
                meaningId: mId,
                sentence: nextSentence,
                usedSentenceIds: state.usedSentenceIds
            },
            insertAtPosition: this.position + delay,
            consecutiveCorrect: state.consecutiveCorrect
        });
    }

    checkAnswer(userInput) {
        if (!this.currentCard) return false;
        const normalize = (str) => str
            .toLowerCase()
            .trim()
            .replace(/[''`´]/g, '')  // remove apostrophes
            .replace(/[.,!?;:\-—–()"\[\]{}]/g, '') // remove punctuation
            .replace(/\s+/g, ' ');   // collapse whitespace
        return normalize(userInput) === normalize(this.currentCard.sentence.answer);
    }

    getProgress() {
        const totalWords = this.wordState.size;
        const completedWords = this.completed.size;
        const remaining = this.mainQueue.length + this.retryInserts.length;

        return {
            completedWords,
            totalWords,
            percentage: totalWords > 0 ? Math.round((completedWords / totalWords) * 100) : 0,
            remaining,
            stats: { ...this.stats }
        };
    }

    getHint() {
        if (!this.currentCard) return null;
        const s = this.currentCard.sentence;
        return {
            turkishMeaning: s.hint,
            firstLetter: s.answer.charAt(0).toUpperCase()
        };
    }
}

class ReadingSessionManager {
    constructor(meaningSentencesMap, sentencesPerMeaning) {
        this.mainQueue = [];
        this.position = 0;
        this.stats = { total: 0, correct: 0, incorrect: 0 };
        
        for (const [mId, sentences] of meaningSentencesMap) {
            if (sentences.length === 0) continue;
            const word = sentences[0].word;
            
            // shuffle the sentences for this meaning
            const shuffled = [...sentences];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            
            // take up to specified sentencesPerMeaning
            const toTake = Math.min(sentencesPerMeaning, shuffled.length);
            for(let i = 0; i < toTake; i++) {
                this.mainQueue.push({
                    word,
                    meaningId: mId,
                    sentence: shuffled[i]
                });
            }
        }
        
        // shuffle the entire reading queue
        for (let i = this.mainQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.mainQueue[i], this.mainQueue[j]] = [this.mainQueue[j], this.mainQueue[i]];
        }
        
        this.stats.total = this.mainQueue.length;
        this.currentCard = null;
    }

    getNextCard() {
        if (this.mainQueue.length > 0) {
            this.currentCard = this.mainQueue.shift();
            this.position++;
            this.stats.correct = this.position; // For progress bar purposes
            return this.currentCard;
        }
        this.currentCard = null;
        return null;
    }

    getProgress() {
        return {
            totalWords: this.stats.total,
            remaining: this.mainQueue.length,
            percentage: this.stats.total > 0 ? Math.round((this.position / this.stats.total) * 100) : 0,
            stats: this.stats
        };
    }
}

class WarmUpSessionManager {
    constructor(meaningSentencesMap, repeatCount) {
        this.mainQueue = [];
        this.position = 0;
        this.stats = { total: 0, correct: 0, incorrect: 0 };
        
        for (const [mId, sentences] of meaningSentencesMap) {
            if (sentences.length === 0) continue;
            const word = sentences[0].word;
            
            // For warm up, we'll queue the item 'repeatCount' times.
            for (let i = 0; i < repeatCount; i++) {
                // Get up to 3 random meanings (short hint fields) from the available sentences
                const shuffledSentences = [...sentences].sort(() => 0.5 - Math.random());
                const selectedSentences = shuffledSentences.slice(0, 3);
                const meanings = selectedSentences.map(s => s.hint);

                this.mainQueue.push({
                    word: word,
                    meaningId: mId,
                    meanings: [...new Set(meanings)] // ensure unique meanings just in case
                });
            }
        }
        
        // shuffle the entire warm up queue
        for (let i = this.mainQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.mainQueue[i], this.mainQueue[j]] = [this.mainQueue[j], this.mainQueue[i]];
        }
        
        this.stats.total = this.mainQueue.length;
        this.currentCard = null;
    }

    getNextCard() {
        if (this.mainQueue.length > 0) {
            this.currentCard = this.mainQueue.shift();
            this.position++;
            // We use 'correct' just to fill the progress bar gracefully
            this.stats.correct = this.position; 
            return this.currentCard;
        }
        this.currentCard = null;
        return null;
    }

    getProgress() {
        return {
            totalWords: this.stats.total,
            remaining: this.mainQueue.length,
            percentage: this.stats.total > 0 ? Math.round((this.position / this.stats.total) * 100) : 0,
            stats: this.stats
        };
    }
}

class SpeakingSessionManager {
    constructor(meaningList, meaningSentencesMap, repeatCount = 2) {
        this.meaningList = [...meaningList];
        this.meaningSentences = meaningSentencesMap;
        this.mainQueue = [];
        this.position = 0;
        this.stats = { total: 0, correct: 0, incorrect: 0 };
        this.currentCards = null;

        // Build queue — each meaning appears `repeatCount` times
        for (const mId of this.meaningList) {
            const sentences = this.meaningSentences.get(mId) || [];
            if (sentences.length === 0) continue;
            const word = sentences[0].word;
            const englishDefinition = sentences[0].englishDefinition;
            const turkishDefinition = sentences[0].turkishDefinition;
            const meanings = [...new Set(sentences.map(s => s.hint))];

            const cardData = {
                word: word,
                meaningId: mId,
                englishDefinition: englishDefinition || "Anlam bulunamadı.",
                turkishDefinition: turkishDefinition || null,
                meanings: meanings
            };

            // Push repeatCount copies
            for (let r = 0; r < repeatCount; r++) {
                this.mainQueue.push({ ...cardData });
            }
        }
        
        // Shuffle the entire queue
        for (let i = this.mainQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.mainQueue[i], this.mainQueue[j]] = [this.mainQueue[j], this.mainQueue[i]];
        }
        
        // Chunk by 4
        this.chunks = [];
        for (let i = 0; i < this.mainQueue.length; i += 4) {
            this.chunks.push(this.mainQueue.slice(i, i + 4));
        }

        // Fix constraint: no duplicate meaningId in the same chunk
        for (let ci = 0; ci < this.chunks.length; ci++) {
            const chunk = this.chunks[ci];
            const seen = new Set();
            for (let cardIdx = 0; cardIdx < chunk.length; cardIdx++) {
                const card = chunk[cardIdx];
                if (seen.has(card.meaningId)) {
                    // Find a card in another chunk to swap with
                    let swapped = false;
                    for (let oi = ci + 1; oi < this.chunks.length && !swapped; oi++) {
                        for (let oj = 0; oj < this.chunks[oi].length; oj++) {
                            const other = this.chunks[oi][oj];
                            // other must not conflict with current chunk, and card must not conflict with other chunk
                            const otherChunkIds = this.chunks[oi].map((c, idx) => idx === oj ? null : c.meaningId);
                            if (!seen.has(other.meaningId) && !otherChunkIds.includes(card.meaningId)) {
                                // Swap
                                this.chunks[ci][cardIdx] = other;
                                this.chunks[oi][oj] = card;
                                swapped = true;
                                break;
                            }
                        }
                    }
                }
                seen.add(this.chunks[ci][cardIdx].meaningId);
            }
        }
        
        this.stats.total = this.chunks.length;
    }

    getNextCard() {
        if (this.chunks.length > 0) {
            this.currentCards = this.chunks.shift();
            this.position++;
            // Use 'correct' just to fill the progress bar gracefully
            this.stats.correct = this.position; 
            return this.currentCards; // an array of up to 3 word objects
        }
        this.currentCards = null;
        return null;
    }

    getProgress() {
        return {
            totalWords: this.stats.total,
            remaining: this.chunks.length,
            percentage: this.stats.total > 0 ? Math.round((this.position / this.stats.total) * 100) : 0,
            stats: this.stats
        };
    }
}
class CombinedCardSessionManager {
    constructor(meaningSentencesMap, groupSize = 3, sentencesPerMeaning = 1) {
        this.groupSize = groupSize;
        this.sentencesPerMeaning = sentencesPerMeaning;
        this.mainQueue = []; // [{type:'warmup',...} or {type:'combined', sentences:[...]}]
        this.position = 0;
        this.currentCard = null;

        // Convert map to array of {meaningId, sentences, word, englishDefinition, hint}
        const allMeanings = [];
        for (const [mId, sentences] of meaningSentencesMap) {
            if (sentences.length === 0) continue;
            allMeanings.push({
                meaningId: mId,
                word: sentences[0].word,
                hint: sentences[0].hint || '',
                englishDefinition: sentences[0].englishDefinition || '',
                sentences: sentences
            });
        }

        // Shuffle all meanings
        for (let i = allMeanings.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allMeanings[i], allMeanings[j]] = [allMeanings[j], allMeanings[i]];
        }

        // For each meaning, pick `sentencesPerMeaning` random sentences
        // Then create groups of `groupSize` (meaning, sentence) pairs
        const expandedItems = []; // [{meaningId, word, hint, englishDefinition, sentence}]
        for (const m of allMeanings) {
            const shuffledSents = [...m.sentences];
            for (let i = shuffledSents.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledSents[i], shuffledSents[j]] = [shuffledSents[j], shuffledSents[i]];
            }
            const toTake = Math.min(sentencesPerMeaning, shuffledSents.length);
            for (let i = 0; i < toTake; i++) {
                expandedItems.push({
                    meaningId: m.meaningId,
                    word: m.word,
                    hint: m.hint,
                    englishDefinition: m.englishDefinition,
                    sentence: shuffledSents[i]
                });
            }
        }

        // Shuffle expanded items
        for (let i = expandedItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [expandedItems[i], expandedItems[j]] = [expandedItems[j], expandedItems[i]];
        }

        // Group into chunks of `groupSize`, merging remainder into last group
        const groups = [];
        for (let i = 0; i < expandedItems.length; i += groupSize) {
            groups.push(expandedItems.slice(i, i + groupSize));
        }
        // If last group is smaller than groupSize and there's a previous group, merge into it
        if (groups.length > 1 && groups[groups.length - 1].length < groupSize) {
            const remainder = groups.pop();
            remainder.forEach(item => groups[groups.length - 1].push(item));
        }

        for (const group of groups) {
            if (group.length < 2) {
                // Single item — only warmup (edge case: total items = 1)
                group.forEach(item => {
                    this.mainQueue.push({ type: 'warmup', ...item });
                });
                continue;
            }

            // Add warmup cards first (one per item in group)
            group.forEach(item => {
                this.mainQueue.push({
                    type: 'warmup',
                    word: item.word,
                    hint: item.hint,
                    englishDefinition: item.englishDefinition,
                    meaningId: item.meaningId,
                    sentence: item.sentence
                });
            });

            // Then add the combined card
            this.mainQueue.push({
                type: 'combined',
                items: group.map(item => ({
                    word: item.word,
                    hint: item.hint,
                    englishDefinition: item.englishDefinition,
                    meaningId: item.meaningId,
                    sentence: item.sentence
                }))
            });
        }

        this.stats = { total: this.mainQueue.length, correct: 0, incorrect: 0 };
    }

    getNextCard() {
        if (this.mainQueue.length > 0) {
            this.currentCard = this.mainQueue.shift();
            this.position++;
            this.stats.correct = this.position;
            return this.currentCard;
        }
        this.currentCard = null;
        return null;
    }

    getProgress() {
        return {
            totalWords: this.stats.total,
            remaining: this.mainQueue.length,
            percentage: this.stats.total > 0 ? Math.round((this.position / this.stats.total) * 100) : 0,
            stats: this.stats
        };
    }

    // Replace a sentence in the current combined card
    replaceSentence(itemIndex, newSentence) {
        if (this.currentCard && this.currentCard.type === 'combined' && this.currentCard.items[itemIndex]) {
            this.currentCard.items[itemIndex].sentence = newSentence;
        }
    }

    // Remove a sentence from the current combined card
    removeSentence(itemIndex) {
        if (this.currentCard && this.currentCard.type === 'combined') {
            this.currentCard.items.splice(itemIndex, 1);
        }
    }
}

class ScanSessionManager {
    constructor(meaningSentencesMap, pageSize = 20) {
        this.pageSize = pageSize;
        this.allItems = []; // [{word, meaningId, hint, englishDefinition, sentence}]
        this.pages = [];
        this.currentPageIndex = -1;
        this.currentCard = null; // Current page (array of items)
        this.position = 0;

        // Build items from meaning-sentences map
        for (const [mId, sentences] of meaningSentencesMap) {
            if (sentences.length === 0) continue;
            // Pick one random sentence for display
            const sentence = sentences[Math.floor(Math.random() * sentences.length)];
            this.allItems.push({
                meaningId: mId,
                word: sentence.word,
                hint: sentence.hint || '',
                englishDefinition: sentence.englishDefinition || '',
                sentence: sentence,
                allSentences: sentences
            });
        }

        // Shuffle all items
        for (let i = this.allItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.allItems[i], this.allItems[j]] = [this.allItems[j], this.allItems[i]];
        }

        // Split into pages
        for (let i = 0; i < this.allItems.length; i += pageSize) {
            this.pages.push(this.allItems.slice(i, i + pageSize));
        }

        this.stats = { total: this.pages.length, correct: 0, incorrect: 0 };
        // mainQueue is kept for session resume compatibility
        this.mainQueue = this.pages.slice();
    }

    getNextCard() {
        this.currentPageIndex++;
        if (this.currentPageIndex < this.pages.length) {
            this.currentCard = {
                type: 'scan-page',
                pageIndex: this.currentPageIndex,
                items: this.pages[this.currentPageIndex]
            };
            this.position = this.currentPageIndex + 1;
            this.stats.correct = this.position;
            // Update mainQueue for session resume
            this.mainQueue = this.pages.slice(this.currentPageIndex);
            return this.currentCard;
        }
        this.currentCard = null;
        return null;
    }

    getPrevCard() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex -= 2; // go back 2 because getNextCard will +1
            return this.getNextCard();
        }
        return null;
    }

    getProgress() {
        return {
            totalWords: this.stats.total,
            remaining: this.stats.total - this.position,
            percentage: this.stats.total > 0 ? Math.round((this.position / this.stats.total) * 100) : 0,
            stats: this.stats
        };
    }

    // Replace a sentence within the current page
    replaceSentence(itemIndex, newSentence) {
        if (this.currentCard && this.currentCard.items[itemIndex]) {
            this.currentCard.items[itemIndex].sentence = newSentence;
            // Also update in pages array
            if (this.pages[this.currentPageIndex] && this.pages[this.currentPageIndex][itemIndex]) {
                this.pages[this.currentPageIndex][itemIndex].sentence = newSentence;
            }
        }
    }

    // Remove a sentence item from the current page
    removeSentence(itemIndex) {
        if (this.currentCard && this.currentCard.items) {
            this.currentCard.items.splice(itemIndex, 1);
            if (this.pages[this.currentPageIndex]) {
                this.pages[this.currentPageIndex].splice(itemIndex, 1);
            }
        }
    }
}

class FlowSessionManager {
    constructor(meaningSentencesMap) {
        this.allItems = [];
        this.position = 0;
        this.currentCard = null;

        for (const [mId, sentences] of meaningSentencesMap) {
            if (sentences.length === 0) continue;
            const sentence = sentences[Math.floor(Math.random() * sentences.length)];
            this.allItems.push({
                meaningId: mId,
                word: sentence.word,
                hint: sentence.hint || '',
                englishDefinition: sentence.englishDefinition || '',
                sentence: sentence,
                allSentences: sentences
            });
        }

        // Shuffle
        for (let i = this.allItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.allItems[i], this.allItems[j]] = [this.allItems[j], this.allItems[i]];
        }

        this.stats = { total: this.allItems.length, correct: 0, incorrect: 0 };
        this.mainQueue = this.allItems.slice();
    }

    getNextCard() {
        if (this.position < this.allItems.length) {
            this.currentCard = this.allItems[this.position];
            this.position++;
            this.stats.correct = this.position;
            this.mainQueue = this.allItems.slice(this.position);
            return this.currentCard;
        }
        this.currentCard = null;
        return null;
    }

    getProgress() {
        return {
            totalWords: this.stats.total,
            remaining: this.stats.total - this.position,
            percentage: this.stats.total > 0 ? Math.round((this.position / this.stats.total) * 100) : 0,
            stats: this.stats
        };
    }

    handleAnswer(isCorrect) {
        // No-op for flow mode
    }
}

class ShadowingSessionManager {
    constructor(meaningSentencesMap, groupSize = 1) {
        this.meaningSentences = meaningSentencesMap;
        this.groupSize = groupSize;
        this.allItems = [];
        this.chunks = [];
        this.position = 0;
        this.currentCard = null;

        // Build items: one per meaning, with a random sentence
        for (const [mId, sentences] of meaningSentencesMap) {
            if (sentences.length === 0) continue;
            const sentence = sentences[Math.floor(Math.random() * sentences.length)];
            this.allItems.push({
                meaningId: mId,
                word: sentence.word,
                englishDefinition: sentence.englishDefinition || '',
                turkishDefinition: sentence.turkishDefinition || null,
                sentence: sentence,
                allSentences: sentences
            });
        }

        // Shuffle all items
        for (let i = this.allItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.allItems[i], this.allItems[j]] = [this.allItems[j], this.allItems[i]];
        }

        // Group into chunks of groupSize
        for (let i = 0; i < this.allItems.length; i += groupSize) {
            this.chunks.push(this.allItems.slice(i, i + groupSize));
        }

        this.stats = { total: this.chunks.length, correct: 0, incorrect: 0 };

        // Compatibility: expose remaining chunks as mainQueue for session save/resume
        Object.defineProperty(this, 'mainQueue', {
            get: () => this.chunks.slice(this.position)
        });
    }

    getNextCard() {
        if (this.position < this.chunks.length) {
            this.currentCard = this.chunks[this.position];
            this.position++;
            this.stats.correct = this.position;
            return this.currentCard; // returns an array of items
        }
        this.currentCard = null;
        return null;
    }

    shuffleSentenceAt(index) {
        if (!this.currentCard || index >= this.currentCard.length) return false;
        const item = this.currentCard[index];
        const sentences = item.allSentences;
        if (sentences.length <= 1) return false;
        
        let next;
        do {
            next = sentences[Math.floor(Math.random() * sentences.length)];
        } while (next.id === item.sentence.id && sentences.length > 1);
        
        item.sentence = next;
        return true;
    }

    getProgress() {
        return {
            totalWords: this.stats.total,
            remaining: this.stats.total - this.position,
            percentage: this.stats.total > 0 ? Math.round((this.position / this.stats.total) * 100) : 0,
            stats: this.stats
        };
    }
}

