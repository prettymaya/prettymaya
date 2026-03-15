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
        const correct = this.currentCard.sentence.answer.toLowerCase().trim();
        const input = userInput.toLowerCase().trim();
        return input === correct;
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
    constructor(meaningList, meaningSentencesMap) {
        this.meaningList = [...meaningList];
        this.meaningSentences = meaningSentencesMap;
        this.mainQueue = [];
        this.position = 0;
        this.stats = { total: 0, correct: 0, incorrect: 0 };
        this.currentCards = null;

        // Build queue
        for (const mId of this.meaningList) {
            const sentences = this.meaningSentences.get(mId) || [];
            if (sentences.length === 0) continue;
            const word = sentences[0].word;
            const englishDefinition = sentences[0].englishDefinition;
            
            const shuffledSentences = [...sentences].sort(() => 0.5 - Math.random());
            const selectedSentences = shuffledSentences.slice(0, 3);
            const meanings = selectedSentences.map(s => s.hint);

            this.mainQueue.push({
                word: word,
                meaningId: mId,
                englishDefinition: englishDefinition || "Anlam bulunamadı.",
                meanings: [...new Set(meanings)]
            });
        }
        
        // Shuffle the entire queue
        for (let i = this.mainQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.mainQueue[i], this.mainQueue[j]] = [this.mainQueue[j], this.mainQueue[i]];
        }
        
        // Chunk by 3 for standard layout
        this.chunks = [];
        for (let i = 0; i < this.mainQueue.length; i += 3) {
            this.chunks.push(this.mainQueue.slice(i, i + 3));
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
