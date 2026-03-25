// PrettyMaya - Main Application Logic

document.addEventListener('DOMContentLoaded', async () => {
    // ─── DOM Elements ───────────────────────────────────────
    const els = {
        navs: document.querySelectorAll('.nav-link, .mobile-nav-link'),
        views: document.querySelectorAll('.view'),
        
        // Dashboard
        stats: {
            words: document.getElementById('stat-total-words'),
            sentences: document.getElementById('stat-total-sentences'),
            sessions: document.getElementById('stat-total-sessions')
        },
        btnQuickPractice: document.getElementById('btn-quick-practice'),
        btnAddWordsDash: document.getElementById('btn-add-words-dash'),

        // Words
        wordListBody: document.getElementById('word-list-body'),
        searchInput: document.getElementById('input-search-words'),
        btnConfirmAddSlow: document.getElementById('btn-confirm-add-slow'),
        btnShowAddModal: document.getElementById('btn-show-add-modal'),
        btnGenMissing: document.getElementById('btn-generate-missing'),

        // Add Words Modal
        modalAddWords: document.getElementById('modal-add-words'),
        inputWordList: document.getElementById('input-word-list'),
        btnConfirmAdd: document.getElementById('btn-confirm-add'),
        btnCancelAdd: document.getElementById('btn-cancel-add'),
        checkAutoGen: document.getElementById('check-auto-generate'),

        // Word Details Modal
        modalWordDetails: document.getElementById('modal-word-details'),
        detailWordTitle: document.getElementById('detail-word-title'),
        detailSentenceCount: document.getElementById('detail-sentence-count'),
        detailSentencesList: document.getElementById('detail-sentences-list'),
        btnCloseDetailModal1: document.getElementById('btn-close-detail-modal'),
        btnCloseDetailModal2: document.getElementById('btn-close-detail-modal2'),
        btnDetailGenerateAll: document.getElementById('btn-detail-generate-all'),
        btnDeleteWord: document.getElementById('btn-delete-word'),

        // Generation Overlay
        overlayGen: document.getElementById('overlay-generation'),
        genCurrentWord: document.getElementById('gen-current-word'),
        genProgressFill: document.getElementById('gen-progress-fill'),
        genCurrentNum: document.getElementById('gen-current-num'),
        genTotalNum: document.getElementById('gen-total-num'),
        btnCancelGen: document.getElementById('btn-cancel-generation'),

        // Settings
        inputApiKey: document.getElementById('setting-api-key'),
        selectMinSentences: document.getElementById('setting-min-sentences'),
        checkEnableSentenceCreation: document.getElementById('setting-enable-sentence-creation'),
        btnTestApi: document.getElementById('btn-test-api'),
        btnSaveSettings: document.getElementById('btn-save-settings'),
        apiStatus: document.getElementById('api-status'),
        btnResetDB: document.getElementById('btn-danger-reset'),
        btnExportDb: document.getElementById('btn-export-db'),
        inputImportDb: document.getElementById('input-import-db'),
        
        // Sync
        inputGithubToken: document.getElementById('setting-github-token'),
        inputGistId: document.getElementById('setting-github-gist-id'),
        btnSyncTest: document.getElementById('btn-sync-test'),
        btnSyncPush: document.getElementById('btn-sync-push'),
        btnSyncPull: document.getElementById('btn-sync-pull'),
        syncStatus: document.getElementById('sync-status'),
        btnForceRefresh: document.getElementById('btn-force-refresh'),

        // Practice
        practiceSetup: document.getElementById('practice-setup'),
        practiceActive: document.getElementById('practice-active'),
        practiceComplete: document.getElementById('practice-complete'),
        btnStartSession: document.getElementById('btn-start-session'),
        countSelectors: document.querySelectorAll('.word-count-btn'),
        
        // Mode Selectors
        btnModeRecall: document.getElementById('mode-active-recall'),
        btnModeReading: document.getElementById('mode-reading'),
        btnModeMixed: document.getElementById('mode-mixed'),
        btnModeWarmup: document.getElementById('mode-warmup'),
        
        // Custom Practice Modal
        btnShowCustomPractice: document.getElementById('btn-show-custom-practice'),
        modalCustomPractice: document.getElementById('modal-custom-practice'),
        inputCustomPracticeList: document.getElementById('input-custom-practice-list'),
        btnStartCustomPractice: document.getElementById('btn-start-custom-practice'),
        btnCancelCustom: document.getElementById('btn-cancel-custom'),

        // Flashcard Elements
        fcSentence: document.getElementById('fc-sentence'),
        fcInput: document.getElementById('fc-input'),
        btnCheck: document.getElementById('btn-check'),
        btnKnewIt: document.getElementById('btn-knew-it'),
        btnHint: document.getElementById('btn-hint'),
        btnChangeSentence: document.getElementById('btn-change-sentence'),
        checkAutoHint: document.getElementById('check-auto-hint'),
        fcHint: document.getElementById('fc-hint'),
        fcMeaning: document.getElementById('fc-meaning'),
        hintTr: document.getElementById('hint-tr'),
        hintLetter: document.getElementById('hint-letter'),
        retryIndicator: document.getElementById('retry-indicator'),

        phaseQuestion: document.getElementById('phase-question'),
        phaseResult: document.getElementById('phase-result'),
        phaseWriting: document.getElementById('phase-writing'),
        phaseReading: document.getElementById('phase-reading'),
        phaseWarmup: document.getElementById('phase-warmup'),

        warmupWord: document.getElementById('warmup-word'),
        warmupMeanings: document.getElementById('warmup-meanings'),
        btnWarmupNext: document.getElementById('btn-warmup-next'),
        
        readingSentence: document.getElementById('reading-sentence'),
        readingTurkish: document.getElementById('reading-turkish'),
        readingHint: document.getElementById('reading-hint'),
        readingEnglishDef: document.getElementById('reading-english-def'),
        readingEnglishText: document.getElementById('reading-english-text'),
        btnReadingNext: document.getElementById('btn-reading-next'),
        btnQuitSession: document.getElementById('btn-quit-session'),
        
        // Speaking Phase
        btnModeSpeaking: document.getElementById('mode-speaking'),
        speakingOptions: document.getElementById('speaking-options'),
        phaseSpeaking: document.getElementById('phase-speaking'),
        speakingWordsContainer: document.getElementById('speaking-words-container'),
        btnSpeakingNext: document.getElementById('btn-speaking-next'),
        
        // Combined Card Phase
        btnModeCombined: document.getElementById('mode-combined'),
        combinedOptions: document.getElementById('combined-options'),
        phaseCombinedWarmup: document.getElementById('phase-combined-warmup'),
        combinedWarmupWord: document.getElementById('combined-warmup-word'),
        combinedWarmupHint: document.getElementById('combined-warmup-hint'),
        combinedWarmupEn: document.getElementById('combined-warmup-en'),
        btnCombinedWarmupNext: document.getElementById('btn-combined-warmup-next'),
        phaseCombined: document.getElementById('phase-combined'),
        combinedSentencesContainer: document.getElementById('combined-sentences-container'),
        btnCombinedNext: document.getElementById('btn-combined-next'),
        
        // Scan Mode Phase
        btnModeScan: document.getElementById('mode-scan'),
        scanOptions: document.getElementById('scan-options'),
        phaseScan: document.getElementById('phase-scan'),
        scanItemsContainer: document.getElementById('scan-items-container'),

        // Shadowing Phase
        btnModeShadowing: document.getElementById('mode-shadowing'),
        phaseShadowing: document.getElementById('phase-shadowing'),
        shadowingSentences: document.getElementById('shadowing-sentences'),
        shadowingPopupOverlay: document.getElementById('shadowing-popup-overlay'),
        shadowingPopupClose: document.getElementById('shadowing-popup-close'),
        btnShadowingSpeak: document.getElementById('btn-shadowing-speak'),
        btnShadowingShuffle: document.getElementById('btn-shadowing-shuffle'),
        btnShadowingNext: document.getElementById('btn-shadowing-next'),
        shadowingOptions: document.getElementById('shadowing-options'),
        scanPageIndicator: document.getElementById('scan-page-indicator'),
        btnScanPrev: document.getElementById('btn-scan-prev'),
        btnScanNext: document.getElementById('btn-scan-next'),

        // Flow Mode Phase
        btnModeFlow: document.getElementById('mode-flow'),
        phaseFlow: document.getElementById('phase-flow'),
        flowWord: document.getElementById('flow-word'),
        flowReveal: document.getElementById('flow-reveal'),
        flowTurkish: document.getElementById('flow-turkish'),
        flowEnglishDef: document.getElementById('flow-english-def'),
        flowSentence: document.getElementById('flow-sentence'),
        flowSentenceTr: document.getElementById('flow-sentence-tr'),
        flowCounter: document.getElementById('flow-counter'),
        flowTimerFill: document.getElementById('flow-timer-fill'),
        btnFlowPause: document.getElementById('btn-flow-pause'),
        btnFlowSkip: document.getElementById('btn-flow-skip'),
        
        resIcon: document.getElementById('res-icon'),
        resWord: document.getElementById('res-word'),
        resEnglish: document.getElementById('res-english'),
        resTurkish: document.getElementById('res-turkish'),
        resCompareOriginal: document.getElementById('res-compare-original'),
        resCompareAnswer: document.getElementById('res-compare-answer'),
        btnInlineDeleteResult: document.getElementById('btn-inline-delete-result'),
        writingInput: document.getElementById('writing-input'),
        btnNext: document.getElementById('btn-next'),

        // Reading Compare
        readingCompareOriginal: document.getElementById('reading-compare-original'),
        readingCompareAnswer: document.getElementById('reading-compare-answer'),
        btnInlineDeleteReading: document.getElementById('btn-inline-delete-reading'),

        // Gamification & History
        btnGoBack: document.getElementById('btn-go-back'),
        gameScoreDisplay: document.getElementById('game-score-display'),
        gameScore: document.getElementById('game-score'),
        gameStreak: document.getElementById('game-streak'),
        streakCount: document.getElementById('streak-count'),
        xpFlyAnimation: document.getElementById('xp-fly-animation'),

        // Progress
        progCurrent: document.getElementById('session-current'),
        progTotal: document.getElementById('session-total'),
        progCorrect: document.getElementById('session-correct'),
        progIncorrect: document.getElementById('session-incorrect'),
        progFill: document.getElementById('session-progress'),

        // Toast
        toastContainer: document.getElementById('toast-container'),
        
        // Pull to refresh
        mainContent: document.querySelector('.main-content'),
        ptrIndicator: document.getElementById('pull-to-refresh-indicator')
    };

    // ─── State ──────────────────────────────────────────────
    let allWords = [];
    let sentenceCounts = {};
    let allMeaningsGrouped = {};
    let sessionSentencesOriginal = []; // Backup of original order
    
    // Sort states: 'date_desc' (default), 'count_asc', 'count_desc'
    let currentTableSort = 'date_desc';
    let minSentencesRequired = 3;
    let cancelGeneration = false;
    let currentSession = null;
    let selectedWordCount = 20;
    let practiceMode = 'recall'; // 'recall' | 'reading' | 'mixed' | 'scan' | 'flow'
    let currentCardMode = 'recall';

    // ─── Text-to-Speech ──────────────────────────────────
    function speakWord(word) {
        if (!window.speechSynthesis) return;
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(word);
        utter.lang = 'en-US';
        utter.rate = 0.9;
        speechSynthesis.speak(utter);
    }
    window.speakWord = speakWord; // expose for inline onclick

    // ─── Edge TTS Voice System (Microsoft Neural Voices) ─────
    const EDGE_TTS_VOICES = [
        { name: 'en-US-AvaMultilingualNeural', label: '⭐ Ava (Multilingual)', lang: 'en-US', gender: 'Female' },
        { name: 'en-US-AndrewMultilingualNeural', label: '⭐ Andrew (Multilingual)', lang: 'en-US', gender: 'Male' },
        { name: 'en-US-EmmaMultilingualNeural', label: '⭐ Emma (Multilingual)', lang: 'en-US', gender: 'Female' },
        { name: 'en-US-BrianMultilingualNeural', label: '⭐ Brian (Multilingual)', lang: 'en-US', gender: 'Male' },
        { name: 'en-US-JennyNeural', label: 'Jenny', lang: 'en-US', gender: 'Female' },
        { name: 'en-US-GuyNeural', label: 'Guy', lang: 'en-US', gender: 'Male' },
        { name: 'en-US-AriaNeural', label: 'Aria', lang: 'en-US', gender: 'Female' },
        { name: 'en-US-DavisNeural', label: 'Davis', lang: 'en-US', gender: 'Male' },
        { name: 'en-US-JaneNeural', label: 'Jane', lang: 'en-US', gender: 'Female' },
        { name: 'en-US-JasonNeural', label: 'Jason', lang: 'en-US', gender: 'Male' },
        { name: 'en-US-SaraNeural', label: 'Sara', lang: 'en-US', gender: 'Female' },
        { name: 'en-US-TonyNeural', label: 'Tony', lang: 'en-US', gender: 'Male' },
        { name: 'en-US-NancyNeural', label: 'Nancy', lang: 'en-US', gender: 'Female' },
        { name: 'en-US-AmberNeural', label: 'Amber', lang: 'en-US', gender: 'Female' },
        { name: 'en-GB-SoniaNeural', label: 'Sonia (UK)', lang: 'en-GB', gender: 'Female' },
        { name: 'en-GB-RyanNeural', label: 'Ryan (UK)', lang: 'en-GB', gender: 'Male' },
        { name: 'en-AU-NatashaNeural', label: 'Natasha (AU)', lang: 'en-AU', gender: 'Female' },
        { name: 'en-AU-WilliamNeural', label: 'William (AU)', lang: 'en-AU', gender: 'Male' },
    ];

    let _edgeVoiceName = localStorage.getItem('shadowingVoice') || 'en-US-AvaMultilingualNeural';
    let _currentAudio = null;
    let _currentWs = null;
    let _edgeTTSFailed = false; // Cache: if Edge TTS fails once, don't retry
    const _voiceSelect = document.getElementById('shadowing-voice-select');

    // Populate dropdown
    function populateVoiceList() {
        if (!_voiceSelect) return;
        _voiceSelect.innerHTML = '';

        const females = EDGE_TTS_VOICES.filter(v => v.gender === 'Female');
        const males = EDGE_TTS_VOICES.filter(v => v.gender === 'Male');

        [{ label: '👩 Kadın Sesler', list: females }, { label: '👨 Erkek Sesler', list: males }].forEach(group => {
            const grp = document.createElement('optgroup');
            grp.label = group.label;
            group.list.forEach(voice => {
                const opt = document.createElement('option');
                opt.value = voice.name;
                opt.textContent = voice.label + ' (' + voice.lang + ')';
                if (voice.name === _edgeVoiceName) opt.selected = true;
                grp.appendChild(opt);
            });
            _voiceSelect.appendChild(grp);
        });
    }
    populateVoiceList();

    if (_voiceSelect) {
        _voiceSelect.addEventListener('change', function() {
            _edgeVoiceName = _voiceSelect.value;
            localStorage.setItem('shadowingVoice', _edgeVoiceName);
            speakSentence('Hello, this is my voice.');
        });
    }

    // Edge TTS via WebSocket
    function _uuid() {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function _escapeXml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function _cancelEdgeTTS() {
        if (_currentAudio) {
            _currentAudio.pause();
            _currentAudio.src = '';
            _currentAudio = null;
        }
        if (_currentWs) {
            try { _currentWs.close(); } catch(e) {}
            _currentWs = null;
        }
    }

    function edgeTTSSpeak(text, voiceName, rate, onEnd) {
        _cancelEdgeTTS();

        var connId = _uuid();
        var requestId = _uuid();
        var wsUrl = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=' + connId;

        var audioChunks = [];
        var ws;
        var gotAudio = false;
        var fallbackTimer = null;

        // Fallback to Web Speech API if Edge TTS fails
        function fallbackSpeak() {
            if (gotAudio) return;
            _edgeTTSFailed = true;
            console.warn('[EdgeTTS] Fallback → Web Speech API');
            if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
            var utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'en-US';
            utter.rate = rate;
            // Pick best available Web Speech voice
            var voices = speechSynthesis.getVoices();
            var enVoices = voices.filter(function(v) { return v.lang.startsWith('en'); });
            var best = enVoices.find(function(v) { return v.name.includes('Samantha'); })
                || enVoices.find(function(v) { return v.name.includes('Daniel'); })
                || enVoices.find(function(v) { return v.name.includes('Karen'); })
                || enVoices.find(function(v) { return v.lang === 'en-US'; })
                || enVoices[0] || null;
            if (best) utter.voice = best;
            if (onEnd) utter.onend = onEnd;
            speechSynthesis.speak(utter);
        }

        try {
            ws = new WebSocket(wsUrl);
            ws.binaryType = 'arraybuffer'; // Safari compat: receive ArrayBuffer directly
        } catch(e) {
            console.error('[EdgeTTS] WebSocket create failed:', e);
            fallbackSpeak();
            return;
        }

        _currentWs = ws;

        // Timeout: if no audio in 5 seconds, fallback
        fallbackTimer = setTimeout(function() {
            if (!gotAudio) {
                console.warn('[EdgeTTS] Timeout, falling back');
                try { ws.close(); } catch(e) {}
                _currentWs = null;
                fallbackSpeak();
            }
        }, 5000);

        ws.onopen = function() {
            console.log('[EdgeTTS] Connected, sending SSML...');
            // Config message
            var configMsg = 'Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n' +
                JSON.stringify({
                    context: {
                        synthesis: {
                            audio: {
                                metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'false' },
                                outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
                            }
                        }
                    }
                });
            ws.send(configMsg);

            // SSML
            var ratePercent = Math.round((rate - 1) * 100);
            var rateStr = (ratePercent >= 0 ? '+' : '') + ratePercent + '%';

            var ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='" + voiceName.substring(0, 5) + "'>" +
                "<voice name='" + voiceName + "'>" +
                "<prosody rate='" + rateStr + "' pitch='+0Hz'>" + _escapeXml(text) + "</prosody>" +
                "</voice></speak>";

            var ssmlMsg = 'X-RequestId:' + requestId + '\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n' + ssml;
            ws.send(ssmlMsg);
        };

        ws.onmessage = function(event) {
            if (event.data instanceof ArrayBuffer) {
                // Binary audio data (ArrayBuffer mode)
                var buf = event.data;
                var view = new Uint8Array(buf);
                // Edge TTS binary: first 2 bytes = header length (big-endian)
                if (view.length > 2) {
                    var headerLen = (view[0] << 8) | view[1];
                    var audioStart = 2 + headerLen;
                    if (audioStart < buf.byteLength) {
                        audioChunks.push(buf.slice(audioStart));
                    }
                }
            } else if (event.data instanceof Blob) {
                // Blob mode fallback
                var reader = new FileReader();
                reader.onload = function() {
                    var buf = reader.result;
                    var view = new Uint8Array(buf);
                    if (view.length > 2) {
                        var headerLen = (view[0] << 8) | view[1];
                        var audioStart = 2 + headerLen;
                        if (audioStart < buf.byteLength) {
                            audioChunks.push(buf.slice(audioStart));
                        }
                    }
                };
                reader.readAsArrayBuffer(event.data);
            } else if (typeof event.data === 'string') {
                if (event.data.includes('Path:turn.end')) {
                    gotAudio = true;
                    if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
                    ws.close();
                    _currentWs = null;
                    console.log('[EdgeTTS] Received ' + audioChunks.length + ' audio chunks');
                    // Play collected audio
                    if (audioChunks.length > 0) {
                        var blob = new Blob(audioChunks, { type: 'audio/mpeg' });
                        var url = URL.createObjectURL(blob);
                        var audio = new Audio(url);
                        _currentAudio = audio;
                        audio.onended = function() {
                            URL.revokeObjectURL(url);
                            _currentAudio = null;
                            if (onEnd) onEnd();
                        };
                        audio.onerror = function() {
                            console.error('[EdgeTTS] Audio play error');
                            URL.revokeObjectURL(url);
                            _currentAudio = null;
                            fallbackSpeak();
                        };
                        audio.play().catch(function(e) {
                            console.error('[EdgeTTS] Play failed:', e);
                            fallbackSpeak();
                        });
                    } else {
                        fallbackSpeak();
                    }
                }
            }
        };

        ws.onerror = function(err) {
            console.error('[EdgeTTS] WebSocket error:', err);
            _currentWs = null;
            if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
            if (!gotAudio) fallbackSpeak();
        };

        ws.onclose = function() {
            _currentWs = null;
        };
    }

    // Web Speech API direct speak (used when Edge TTS unavailable)
    function webSpeechSpeak(text, rate, onEnd) {
        if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
        speechSynthesis.cancel();
        var utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = rate;
        var voices = speechSynthesis.getVoices();
        var enVoices = voices.filter(function(v) { return v.lang.startsWith('en'); });
        var best = enVoices.find(function(v) { return v.name.includes('Samantha'); })
            || enVoices.find(function(v) { return v.name.includes('Daniel'); })
            || enVoices.find(function(v) { return v.name.includes('Karen'); })
            || enVoices.find(function(v) { return v.lang === 'en-US'; })
            || enVoices[0] || null;
        if (best) utter.voice = best;
        if (onEnd) utter.onend = onEnd;
        speechSynthesis.speak(utter);
    }

    function speakSentence(text, rate, onEnd) {
        if (!text) return;
        rate = rate || 0.9;
        _cancelEdgeTTS();
        if (window.speechSynthesis) speechSynthesis.cancel();
        
        if (_edgeTTSFailed) {
            // Edge TTS previously failed, use Web Speech API directly (no delay)
            webSpeechSpeak(text, rate, onEnd);
        } else {
            edgeTTSSpeak(text, _edgeVoiceName, rate, onEnd);
        }
    }
    window.speakSentence = speakSentence;

    // Shadowing mode state
    let shadowingAutoSpeak = true;
    let shadowingTimerInterval = 0; // 0 = off, 1/2/3 = repeat after N seconds
    let shadowingTimerHandle = null;
    let shadowingGroupSize = 10;

    // Flow mode state
    let flowTimer = null;
    let flowRevealTimer = null;
    let flowTickInterval = null;
    let flowPaused = false;

    let speakingRepeatCount = 2;
    let searchTimeout = null;
    let selectedCategoryId = 'all'; // For word list filtering
    let practiceSource = 'all'; // 'all' or 'category'
    let selectedPracticeCategories = []; // category IDs for practice

    // Gamification & Go Back State
    let goBackHistory = []; // Stores recent cards & modes for "Go Back" functionality
    let isReviewingHistory = false;
    let gameScore = 0;
    let currentStreak = 0;
    let cardStartTime = 0;
    let baseCardXP = 10;
    let currentDetailWord = null;

    // ─── Font Size Control ──────────────────────────────────
    let practiceScale = parseFloat(localStorage.getItem('practiceScale')) || 1;
    const practiceContainer = document.getElementById('practice-active');
    if (practiceContainer) practiceContainer.style.overflowX = 'hidden';
    function applyScale() {
        if (practiceContainer) {
            practiceContainer.style.zoom = practiceScale;
            // Compensate width so zoomed content doesn't overflow on mobile
            practiceContainer.style.width = (100 / practiceScale) + '%';
        }
    }
    applyScale();

    const btnFontUp = document.getElementById('btn-font-up');
    const btnFontDown = document.getElementById('btn-font-down');
    const btnFontDefault = document.getElementById('btn-font-default');
    if (btnFontUp) {
        btnFontUp.addEventListener('click', () => {
            practiceScale = Math.min(1.5, Math.round((practiceScale + 0.1) * 10) / 10);
            localStorage.setItem('practiceScale', practiceScale);
            applyScale();
        });
    }
    if (btnFontDown) {
        btnFontDown.addEventListener('click', () => {
            practiceScale = Math.max(0.7, Math.round((practiceScale - 0.1) * 10) / 10);
            localStorage.setItem('practiceScale', practiceScale);
            applyScale();
        });
    }
    if (btnFontDefault) {
        btnFontDefault.addEventListener('click', () => {
            practiceScale = 1;
            localStorage.setItem('practiceScale', '1');
            applyScale();
        });
    }

    // ─── Session Resume System ───────────────────────────────
    function saveSessionState() {
        if (!currentSession) return;
        try {
            // Speaking mode uses 'chunks' instead of 'mainQueue'
            const queue = currentSession.chunks || currentSession.mainQueue || [];
            const state = {
                practiceMode: practiceMode,
                currentCardMode: currentCardMode,
                mainQueue: queue,
                position: currentSession.position || 0,
                stats: currentSession.stats || { total: 0, correct: 0, incorrect: 0 },
                currentCard: currentSession.currentCard || currentSession.currentCards || null,
                timestamp: Date.now()
            };
            localStorage.setItem('savedSession', JSON.stringify(state));
        } catch (e) {
            console.warn('Session save failed:', e);
        }
    }

    function clearSavedSession() {
        localStorage.removeItem('savedSession');
    }

    function getSavedSession() {
        try {
            const raw = localStorage.getItem('savedSession');
            if (!raw) return null;
            const state = JSON.parse(raw);
            if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
                clearSavedSession();
                return null;
            }
            return state;
        } catch (e) {
            clearSavedSession();
            return null;
        }
    }

    function resumeSession(state) {
        practiceMode = state.practiceMode;
        currentCardMode = state.currentCardMode || practiceMode;
        
        const mode = state.practiceMode;
        // Non-interactive modes auto-count correct on advance
        const autoCount = ['reading', 'warmup', 'speaking', 'combined', 'scan'].includes(mode);

        currentSession = {
            mainQueue: state.mainQueue || [],
            position: state.position || 0,
            stats: state.stats || { total: 0, correct: 0, incorrect: 0 },
            currentCard: state.currentCard,
            wordState: new Map(),
            getNextCard() {
                if (this.mainQueue.length > 0) {
                    this.currentCard = this.mainQueue.shift();
                    this.position++;
                    return this.currentCard;
                }
                return null;
            },
            getProgress() {
                return {
                    totalWords: this.stats.total,
                    percentage: this.stats.total > 0 ? Math.round((this.position / this.stats.total) * 100) : 0,
                    stats: this.stats
                };
            },
            handleAnswer(isCorrect) { 
                if (isCorrect) this.stats.correct++; 
                else this.stats.incorrect++; 
            },
            replaceSentence(idx, newSentence) {
                if (this.currentCard && this.currentCard.items && this.currentCard.items[idx]) {
                    this.currentCard.items[idx].sentence = newSentence;
                }
            }
        };

        resetGamification();
        els.practiceSetup.style.display = 'none';
        els.practiceComplete.style.display = 'none';
        els.practiceActive.style.display = 'block';

        // Push the saved currentCard back into queue front
        // so loadNextCard() will show the same card user was viewing
        if (state.currentCard) {
            currentSession.mainQueue.unshift(state.currentCard);
            currentSession.position = Math.max(0, currentSession.position - 1);
        }

        const prog = currentSession.getProgress();
        els.progTotal.textContent = prog.totalWords;

        loadNextCard();
    }

    // Check for saved session on load
    const savedSession = getSavedSession();
    if (savedSession && savedSession.mainQueue && savedSession.mainQueue.length > 0) {
        const resumeBanner = document.createElement('div');
        resumeBanner.id = 'resume-banner';
        resumeBanner.style.cssText = 'background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;';
        const remaining = savedSession.mainQueue.length;
        const total = savedSession.stats.total;
        const done = total - remaining;
        const modeNames = { recall: 'Hatırlama', reading: 'Okuma', mixed: 'Karışık', warmup: 'Isınma', speaking: 'Konuşma', combined: 'Birleşik Kart', scan: 'Hızlı Tarama' };
        const modeName = modeNames[savedSession.practiceMode] || savedSession.practiceMode;
        resumeBanner.innerHTML = `
            <div>
                <strong style="color: var(--accent-purple-light);">⏸️ Yarım kalan oturum</strong>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${done}/${total} tamamlandı — ${modeName}</div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary btn-sm" id="btn-resume-session">▶ Devam Et</button>
                <button class="btn btn-ghost btn-sm" id="btn-discard-session" style="color: var(--error);">✕ Sil</button>
            </div>
        `;
        if (els.practiceSetup) {
            els.practiceSetup.insertBefore(resumeBanner, els.practiceSetup.firstChild);
            document.getElementById('btn-resume-session').addEventListener('click', () => {
                resumeBanner.remove();
                resumeSession(savedSession);
            });
            document.getElementById('btn-discard-session').addEventListener('click', () => {
                clearSavedSession();
                resumeBanner.remove();
            });
        }
    }

    // Save session on page unload
    window.addEventListener('beforeunload', () => {
        saveSessionState();
    });

    // ─── Gamification Functions ─────────────────────────────
    function resetGamification() {
        gameScore = 0;
        currentStreak = 0;
        goBackHistory = [];
        isReviewingHistory = false;
        els.gameScore.textContent = '0';
        els.streakCount.textContent = '0';
        els.gameScoreDisplay.style.visibility = 'visible';
        els.gameStreak.style.display = 'none';
        els.btnGoBack.style.display = 'none';
    }

    function showXP(amount, isCombo) {
        gameScore += amount;
        els.gameScore.textContent = gameScore;
        
        els.xpFlyAnimation.textContent = `+${amount} XP!`;
        if (isCombo) els.xpFlyAnimation.textContent = `+${amount} XP! (Hızlı 🔥)`;
        
        els.xpFlyAnimation.style.transition = 'none';
        els.xpFlyAnimation.style.opacity = '1';
        els.xpFlyAnimation.style.transform = 'translateY(0)';
        
        // Force reflow
        void els.xpFlyAnimation.offsetWidth;
        
        els.xpFlyAnimation.style.transition = 'all 0.8s ease-out';
        els.xpFlyAnimation.style.opacity = '0';
        els.xpFlyAnimation.style.transform = 'translateY(-40px)';
    }

    function updateStreak(isCorrect) {
        if (isCorrect) {
            currentStreak++;
            if (currentStreak >= 3) {
                els.gameStreak.style.display = 'inline-flex';
                els.streakCount.textContent = currentStreak;
            }
        } else {
            currentStreak = 0;
            els.gameStreak.style.display = 'none';
        }
    }

    // ─── Initialization ─────────────────────────────────────
    try {
        await DB.init();
        await DB.runMigration();
        
        // Auto-import data.json if DB is completely empty (For GitHub / fresh starts)
        const allW = await DB.getAllWords();
        if (allW.length === 0) {
            try {
                const res = await fetch('data.json');
                if (res.ok) {
                    const jsonData = await res.json();
                    await DB.importAll(jsonData);
                    showToast('Başlangıç veritabanı başarıyla yüklendi.', 'success');
                }
            } catch(e) {
                // data.json doesnt exist or couldn't fetch, ignore
            }
        }
        
        await loadSettings();
        await updateDashboard();
        renderCategoryTabs();
        showToast('Veritabanı hazır.', 'success');
    } catch (e) {
        showToast('Veritabanı başlatılamadı!', 'error');
        console.error(e);
    }

    // ─── Navigation ─────────────────────────────────────────
    els.navs.forEach(nav => {
        nav.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.target;
            
            // Switch active target
            els.navs.forEach(n => {
                if(n.dataset.target === target) n.classList.add('active');
                else n.classList.remove('active');
            });
            
            // Switch views
            els.views.forEach(v => {
                if(v.id === target) {
                    v.classList.add('active');
                    if(target === 'view-dashboard') updateDashboard();
                    if(target === 'view-words') renderWordList();

                } else {
                    v.classList.remove('active');
                }
            });
        });
    });

    // ─── Toast System ───────────────────────────────────────
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-circle-info';
        if(type === 'success') icon = 'fa-circle-check';
        if(type === 'error') icon = 'fa-circle-xmark';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        els.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ─── Settings ───────────────────────────────────────────
    async function loadSettings() {
        const apiKey = await DB.getSetting('gemini_api_key');
        if (apiKey) els.inputApiKey.value = apiKey;

        const count = await DB.getSetting('min_sentences');
        if (count) {
            minSentencesRequired = parseInt(count);
            els.selectMinSentences.value = minSentencesRequired;
        }

        const ghToken = await DB.getSetting('github_token');
        if (ghToken) els.inputGithubToken.value = ghToken;

        const gistId = await DB.getSetting('github_gist_id');
        if (gistId) els.inputGistId.value = gistId;

        const enableSentenceCreation = await DB.getSetting('enable_sentence_creation');
        if (enableSentenceCreation !== undefined && enableSentenceCreation !== null) {
            els.checkEnableSentenceCreation.checked = (enableSentenceCreation === 'true');
        } else {
            els.checkEnableSentenceCreation.checked = true; // default on
        }
    }

    els.btnSaveSettings.addEventListener('click', async () => {
        const key = els.inputApiKey.value.trim();
        const minCount = els.selectMinSentences.value;
        const ghToken = els.inputGithubToken.value.trim();
        const gistId = els.inputGistId.value.trim();
        const enableWriting = els.checkEnableSentenceCreation.checked;
        
        await DB.saveSetting('gemini_api_key', key);
        await DB.saveSetting('min_sentences', minCount);
        await DB.saveSetting('github_token', ghToken);
        await DB.saveSetting('github_gist_id', gistId);
        await DB.saveSetting('enable_sentence_creation', enableWriting ? 'true' : 'false');

        minSentencesRequired = parseInt(minCount);
        
        els.btnSaveSettings.innerHTML = '<i class="fa-solid fa-check"></i> Kaydedildi';
        setTimeout(() => els.btnSaveSettings.innerHTML = 'Ayarları Kaydet', 2000);
        showToast('Ayarlar güncellendi', 'success');
    });

    els.btnTestApi.addEventListener('click', async () => {
        // Save current input before testing
        await DB.saveSetting('gemini_api_key', els.inputApiKey.value.trim());
        
        els.btnTestApi.disabled = true;
        els.btnTestApi.textContent = 'Test Ediliyor...';
        els.apiStatus.textContent = '';

        try {
            await GeminiService.testConnection();
            els.apiStatus.innerHTML = '<span style="color: var(--success);"><i class="fa-solid fa-check"></i> Bağlantı başarılı!</span>';
        } catch (e) {
            els.apiStatus.innerHTML = `<span style="color: var(--error);"><i class="fa-solid fa-xmark"></i> Hata: ${e.message}</span>`;
        }

        els.btnTestApi.disabled = false;
        els.btnTestApi.textContent = 'Test Et';
    });

    // ─── Cloud Sync ─────────────────────────────────────────
    els.btnSyncTest.addEventListener('click', async () => {
        const tk = els.inputGithubToken.value.trim();
        els.btnSyncTest.disabled = true;
        els.syncStatus.textContent = "Test ediliyor...";
        try {
            await SyncService.testConnection(tk);
            els.syncStatus.innerHTML = '<span style="color:var(--success);"><i class="fa-solid fa-check"></i> Github Tokensu geçerli!</span>';
            await DB.saveSetting('github_token', tk);
        } catch(e) {
            els.syncStatus.innerHTML = `<span style="color:var(--error);"><i class="fa-solid fa-xmark"></i> Hata: ${e.message}</span>`;
        }
        els.btnSyncTest.disabled = false;
    });

    els.btnSyncPush.addEventListener('click', async () => {
        const tk = els.inputGithubToken.value.trim();
        let gistId = els.inputGistId.value.trim();
        if(!tk) {
            showToast('Lütfen önce GitHub Token girin.', 'error');
            return;
        }

        els.btnSyncPush.disabled = true;
        els.btnSyncPush.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;margin-right:6px"></span> Yükleniyor...';
        
        try {
            const data = await DB.exportAll();
            const dataStr = JSON.stringify(data, null, 2);

            if (gistId) {
                // Update existing
                await SyncService.updateGist(tk, gistId, dataStr);
                showToast('Veriler buluta kaydedildi!', 'success');
            } else {
                // Create new
                const newId = await SyncService.createGist(tk, dataStr);
                els.inputGistId.value = newId;
                await DB.saveSetting('github_gist_id', newId);
                await DB.saveSetting('github_token', tk);
                showToast('Yeni Bulut Yedeği oluşturuldu!', 'success');
            }
        } catch(e) {
            showToast('Push hatası: ' + e.message, 'error');
            els.syncStatus.innerHTML = `<span style="color:var(--error);">${e.message}</span>`;
        } finally {
            els.btnSyncPush.disabled = false;
            els.btnSyncPush.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Buluta Kaydet (Push)';
        }
    });

    els.btnSyncPull.addEventListener('click', async () => {
        const tk = els.inputGithubToken.value.trim();
        const gistId = els.inputGistId.value.trim();
        
        if(!tk || !gistId) {
            showToast('Pull yapmak için Token ve Gist ID gereklidir.', 'error');
            return;
        }
        
        if(!confirm('Buluttaki veriler cihazınızdaki tüm verilerin üzerine yazılacak. Onaylıyor musunuz?')) return;

        els.btnSyncPull.disabled = true;
        els.btnSyncPull.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;margin-right:6px"></span> İndiriliyor...';
        
        try {
            const data = await SyncService.getGist(tk, gistId);
            await DB.importAll(data);
            await DB.saveSetting('github_token', tk);
            await DB.saveSetting('github_gist_id', gistId);
            await updateDashboard();
            renderWordList();
            showToast('Buluttaki veriler cihaza başarıyla indirildi!', 'success');
        } catch(e) {
            showToast('Pull hatası: ' + e.message, 'error');
            console.error(e);
        } finally {
            els.btnSyncPull.disabled = false;
            els.btnSyncPull.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Buluttan Aç (Pull)';
        }
    });

    els.btnForceRefresh.addEventListener('click', () => {
        window.location.href = window.location.pathname + '?v=' + new Date().getTime();
    });

    els.btnResetDB.addEventListener('click', async () => {
        if(confirm('Tüm kelimeleriniz, cümleleriniz ve oturum geçmişiniz SİLİNECEK. Emin misiniz?')) {
            await DB.deleteAllWords();
            await updateDashboard();
            showToast('Tüm veriler temizlendi.', 'success');
        }
    });

    els.btnExportDb.addEventListener('click', async () => {
        try {
            const data = await DB.exportAll();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prettymaya_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Yedek başarıyla indirildi.', 'success');
        } catch(e) {
            showToast('Yedekleme hatası: ' + e.message, 'error');
        }
    });

    els.inputImportDb.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                els.inputImportDb.disabled = true;
                showToast('Yedek yükleniyor... Bu büyük veritabanlarında 10-30 saniye sürebilir.', 'info');
                const data = JSON.parse(ev.target.result);
                
                if (!data.words || !Array.isArray(data.words)) {
                    showToast('Geçersiz dosya formatı: words dizisi bulunamadı.', 'error');
                    return;
                }
                
                await DB.importAll(data);
                await updateDashboard();
                await renderCategoryTabs();
                renderWordList();
                showToast(`Yedek başarıyla yüklendi! ${data.words.length} kelime, ${(data.meanings||[]).length} anlam, ${(data.sentences||[]).length} cümle.`, 'success');
            } catch(error) {
                showToast('Geri yükleme hatası: ' + error.message, 'error');
                console.error('Import error:', error);
            } finally {
                els.inputImportDb.disabled = false;
                els.inputImportDb.value = ''; // reset input
            }
        };
        reader.readAsText(file);
    });

    // ─── Dashboard ──────────────────────────────────────────
    async function updateDashboard() {
        allWords = await DB.getAllWords();
        sentenceCounts = await DB.getAllSentenceCounts();
        
        let totalSentences = 0;
        Object.values(sentenceCounts).forEach(c => totalSentences += c);

        const history = await DB.getSessionHistory();

        // Efficient active meaning count (cursor-based, no full data load)
        const meaningCount = await DB.getActiveMeaningCount();

        els.stats.words.textContent = `${allWords.length} Kelime (${meaningCount} Kart)`;
        els.stats.words.style.fontSize = "1.5rem";
        els.stats.sentences.textContent = totalSentences;
        els.stats.sessions.textContent = history.length;
    }

    els.btnQuickPractice.addEventListener('click', () => {
        document.querySelector('[data-target="view-practice"]').click();
    });

    els.btnAddWordsDash.addEventListener('click', () => {
        document.querySelector('[data-target="view-words"]').click();
        els.modalAddWords.classList.add('visible');
    });

    // ─── Modals Logic ───────────────────────────────────────
    document.querySelectorAll('.modal-close, #btn-close-detail-modal1, #btn-close-detail-modal2').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('visible');
        });
    });

    els.btnShowAddModal.addEventListener('click', () => {
        els.inputWordList.value = '';
        els.modalAddWords.classList.add('visible');
    });

    els.btnCancelAdd.addEventListener('click', () => {
        els.modalAddWords.classList.remove('visible');
    });

    // ─── Word Management ────────────────────────────────────
    
    // Bind sort click handler
    const thSortSentences = document.getElementById('th-sort-sentences');
    if (thSortSentences) {
        thSortSentences.addEventListener('click', () => {
            if (currentTableSort === 'date_desc' || currentTableSort === 'count_desc') {
                currentTableSort = 'count_asc';
                thSortSentences.innerHTML = `Cümle Sayısı <i class="fa-solid fa-sort-up" style="color: var(--accent-purple); margin-left: 4px;"></i>`;
            } else {
                currentTableSort = 'count_desc';
                thSortSentences.innerHTML = `Cümle Sayısı <i class="fa-solid fa-sort-down" style="color: var(--accent-purple); margin-left: 4px;"></i>`;
            }
            // Add a double-click or long-click reset to default if desired, but toggle is usually fine.
            renderWordList(els.searchInput.value);
        });
    }

    // ─── Virtual Scroll State ───────────────────────────────
    let filteredWords = [];
    const ROW_HEIGHT = 56; // approximate row height in px
    const BUFFER_ROWS = 10;
    let virtualScrollBound = false;

    async function renderWordList(filter = '') {
        const lowerFilter = filter.toLowerCase();

        // Load all meanings in one batch (instead of N+1 per-word queries)
        allMeaningsGrouped = await DB.getAllMeaningsGrouped();

        // Load category data for the word list
        const allCategoriesArr = await DB.getAllCategories();
        const catNameMap = {}; // id -> name
        allCategoriesArr.forEach(c => catNameMap[c.id] = c.name);
        const wordCatMap = await DB.getWordCategoriesGrouped(); // word -> [catId, ...]

        // Apply sorting based on currentTableSort
        let sorted = [...allWords];
        
        if (currentTableSort === 'date_desc') {
            sorted.sort((a,b) => new Date(b.addedDate) - new Date(a.addedDate));
        } else if (currentTableSort === 'count_asc') {
            sorted.sort((a,b) => {
                const countA = sentenceCounts[a.word] || 0;
                const countB = sentenceCounts[b.word] || 0;
                return countA - countB;
            });
        } else if (currentTableSort === 'count_desc') {
            sorted.sort((a,b) => {
                const countA = sentenceCounts[a.word] || 0;
                const countB = sentenceCounts[b.word] || 0;
                return countB - countA;
            });
        }

        // Filter
        filteredWords = lowerFilter 
            ? sorted.filter(w => w.word.includes(lowerFilter))
            : sorted;

        // Setup virtual scroll
        const container = els.wordListBody.closest('.word-list-container');
        els.wordListBody.innerHTML = '';

        // Create spacer for total height
        const totalHeight = filteredWords.length * ROW_HEIGHT;
        let spacerTop = document.getElementById('vs-spacer-top');
        let spacerBottom = document.getElementById('vs-spacer-bottom');
        
        if (!spacerTop) {
            spacerTop = document.createElement('tr');
            spacerTop.id = 'vs-spacer-top';
            spacerTop.innerHTML = '<td colspan="5" style="padding:0;border:none;"></td>';
        }
        if (!spacerBottom) {
            spacerBottom = document.createElement('tr');
            spacerBottom.id = 'vs-spacer-bottom';
            spacerBottom.innerHTML = '<td colspan="5" style="padding:0;border:none;"></td>';
        }

        function renderVisibleRows() {
            const scrollTop = container.scrollTop;
            const viewportHeight = container.clientHeight;
            
            const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
            const endIdx = Math.min(filteredWords.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + BUFFER_ROWS);

            // Clear and rebuild only visible rows
            els.wordListBody.innerHTML = '';
            
            // Top spacer
            spacerTop.querySelector('td').style.height = (startIdx * ROW_HEIGHT) + 'px';
            els.wordListBody.appendChild(spacerTop);

            for (let i = startIdx; i < endIdx; i++) {
                const w = filteredWords[i];
                const count = sentenceCounts[w.word] || 0;
                let statusBadge = '';
                
                // Generate tags from cached meanings (no DB query!)
                let tagsHtml = '';
                const meanings = allMeaningsGrouped[w.word] || [];
                const foundTags = new Set();
                meanings.forEach(m => {
                    const txt = m.definition || '';
                    if (txt.includes('[v1]')) foundTags.add('<span class="api-tag api-tag-v1">v1</span>');
                    if (txt.includes('[v2]')) foundTags.add('<span class="api-tag api-tag-v2">v2</span>');
                    if (txt.includes('[Wiki]')) foundTags.add('<span class="api-tag api-tag-wiki">Wiki</span>');
                    if (txt.includes('[🤖 AI]') || txt.includes('(🤖 AI Üretimi)')) foundTags.add('<span class="api-tag api-tag-ai"><i class="fa-solid fa-robot"></i> AI</span>');
                });
                if (foundTags.size === 0 && meanings.length > 0) {
                    foundTags.add('<span class="api-tag api-tag-v1">v1</span>');
                }
                tagsHtml = Array.from(foundTags).join('');
                
                if (count >= minSentencesRequired) {
                    statusBadge = `<span class="sentence-count ready"><i class="fa-solid fa-check"></i> ${count}</span>`;
                } else if (count > 0) {
                    statusBadge = `<span class="sentence-count partial"><i class="fa-solid fa-triangle-exclamation"></i> ${count}/${minSentencesRequired}</span>`;
                } else {
                    statusBadge = `<span class="sentence-count missing"><i class="fa-solid fa-xmark"></i> ${count}</span>`;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="word-cell">
                        <span style="font-weight: 600; font-size: 1.05rem; display: block;">${w.word}</span>
                        <div class="api-tags-container">
                            ${tagsHtml}
                        </div>
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <span class="badge ${count >= minSentencesRequired ? 'badge-purple' : ''}">
                            ${count >= minSentencesRequired ? 'Hazır' : 'Eksik'}
                        </span>
                    </td>
                    <td class="cat-cell">
                        ${(wordCatMap[w.word] || []).map(cid => `<span class="cat-badge">${catNameMap[cid] || cid}</span>`).join('')}
                        <button class="btn-cat-add" data-word="${w.word}" title="Kategoriye ekle/çıkar">+</button>
                    </td>
                    <td class="action-cell">
                        <button class="btn btn-ghost btn-sm btn-word-detail" data-word="${w.word}">
                            Detay
                        </button>
                        <button class="btn btn-ghost btn-sm btn-word-generate-all" data-word="${w.word}" title="Tüm Anlamlara +3 AI Üret" style="color: var(--accent-purple-light); padding: 8px;">
                            <i class="fa-solid fa-plus"></i> <span style="font-weight:bold;">3</span>
                        </button>
                        <button class="btn-cat-add btn-cat-mobile" data-word="${w.word}" title="Kategoriye ekle/çıkar">
                            <i class="fa-solid fa-folder-plus"></i>
                        </button>
                    </td>
                `;
                els.wordListBody.appendChild(tr);
            }

            // Bottom spacer
            const bottomSpace = Math.max(0, (filteredWords.length - endIdx) * ROW_HEIGHT);
            spacerBottom.querySelector('td').style.height = bottomSpace + 'px';
            els.wordListBody.appendChild(spacerBottom);
        }

        renderVisibleRows();

        // Bind scroll listener once
        if (!virtualScrollBound) {
            let scrollTicking = false;
            container.addEventListener('scroll', () => {
                if (!scrollTicking) {
                    scrollTicking = true;
                    requestAnimationFrame(() => {
                        renderVisibleRows();
                        scrollTicking = false;
                    });
                }
            });
            virtualScrollBound = true;
        }
    }
    
    // Global Event Delegation for Word List Buttons
    els.wordListBody.addEventListener('click', async (e) => {
        const detailBtn = e.target.closest('.btn-word-detail');
        if (detailBtn) {
            openWordDetails(detailBtn.dataset.word);
            return;
        }
        
        const generateBtn = e.target.closest('.btn-word-generate-all');
        if (generateBtn) {
            generateSentencesForAllMeanings(generateBtn.dataset.word, 3);
            return;
        }

        // Category add/remove popup
        const catAddBtn = e.target.closest('.btn-cat-add');
        if (catAddBtn) {
            e.stopPropagation();
            // Remove existing popup
            document.querySelector('.cat-popup')?.remove();

            const word = catAddBtn.dataset.word;
            const categories = await DB.getAllCategories();
            const wordCats = await DB.getCategoriesForWord(word);
            const wordCatIds = new Set(wordCats); // Already [categoryId, ...] numbers

            const popup = document.createElement('div');
            popup.className = 'cat-popup';
            popup.style.position = 'absolute';
            
            let html = '';
            for (const cat of categories) {
                const checked = wordCatIds.has(cat.id) ? 'checked' : '';
                html += `<label><input type="checkbox" class="cat-popup-check" data-cat-id="${cat.id}" data-word="${word}" ${checked}> ${cat.name}</label>`;
            }
            popup.innerHTML = html;

            // Position relative to the button
            const rect = catAddBtn.getBoundingClientRect();
            popup.style.top = (rect.bottom + window.scrollY + 4) + 'px';
            popup.style.left = (rect.left + window.scrollX) + 'px';
            document.body.appendChild(popup);

            // Checkbox change handler
            popup.addEventListener('change', async (ev) => {
                const check = ev.target;
                if (!check.classList.contains('cat-popup-check')) return;
                const catId = Number(check.dataset.catId);
                const w = check.dataset.word;
                if (check.checked) {
                    await DB.addWordToCategory(w, catId);
                } else {
                    await DB.removeWordFromCategory(w, catId);
                }
                // Refresh the row's category badges
                await renderCategoryTabs();
                await renderWordList(els.searchInput.value.trim());
                popup.remove();
            });

            // Close popup when clicking outside
            const closePopup = (ev) => {
                if (!popup.contains(ev.target) && ev.target !== catAddBtn) {
                    popup.remove();
                    document.removeEventListener('click', closePopup);
                }
            };
            setTimeout(() => document.addEventListener('click', closePopup), 0);
            return;
        }
    });

    els.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderWordList(e.target.value.trim());
        }, 300);
    });

    // ─── Category System ────────────────────────────────────
    async function renderCategoryTabs() {
        const tabsContainer = document.getElementById('category-tabs');
        if (!tabsContainer) return;
        const categories = await DB.getAllCategories();
        const counts = await DB.getCategoryWordCounts();
        const totalWords = allWords.length;

        tabsContainer.innerHTML = '';
        // "Tümü" tab
        const allBtn = document.createElement('button');
        allBtn.className = `btn btn-sm category-tab ${selectedCategoryId === 'all' ? 'selected' : ''}`;
        allBtn.dataset.catId = 'all';
        allBtn.style.fontSize = '0.8rem';
        allBtn.textContent = `Tümü (${totalWords})`;
        tabsContainer.appendChild(allBtn);

        for (const cat of categories) {
            const btn = document.createElement('button');
            btn.className = `btn btn-sm category-tab ${selectedCategoryId == cat.id ? 'selected' : ''}`;
            btn.dataset.catId = cat.id;
            btn.style.fontSize = '0.8rem';
            btn.innerHTML = `${cat.name} <span style="opacity:0.6">${counts[cat.id] || 0}</span>`;
            tabsContainer.appendChild(btn);
        }

        // Tab click handler
        tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', async () => {
                selectedCategoryId = tab.dataset.catId;
                tabsContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('selected'));
                tab.classList.add('selected');
                await renderWordList(els.searchInput.value.trim());
            });
        });
    }

    // Override renderWordList to support category filter
    const origRenderWordList = renderWordList;
    renderWordList = async function(filter = '') {
        if (selectedCategoryId !== 'all') {
            const catWords = await DB.getWordsInCategory(Number(selectedCategoryId));
            const catWordSet = new Set(catWords);
            // Temporarily filter allWords
            const origAllWords = allWords;
            allWords = origAllWords.filter(w => catWordSet.has(w.word));
            await origRenderWordList(filter);
            allWords = origAllWords;
        } else {
            await origRenderWordList(filter);
        }
    };

    async function renderCategoryManagement() {
        const categories = await DB.getAllCategories();
        const counts = await DB.getCategoryWordCounts();

        // Render category list
        const listEl = document.getElementById('category-list');
        if (listEl) {
            listEl.innerHTML = '';
            for (const cat of categories) {
                const div = document.createElement('div');
                div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--bg-glass);padding:10px 14px;border-radius:var(--radius-md);border:1px solid var(--border);';
                div.innerHTML = `
                    <span style="font-weight:500;">${cat.name} <span style="color:var(--text-muted);font-size:0.85rem;">(${counts[cat.id] || 0} kelime)</span></span>
                    ${cat.isDefault ? '<span style="font-size:0.75rem;color:var(--text-muted);background:var(--bg-glass);padding:2px 8px;border-radius:4px;">Varsayılan</span>' : `<button class="btn btn-ghost btn-sm btn-delete-cat" data-cat-id="${cat.id}" style="color:var(--error);padding:4px 8px;"><i class="fa-solid fa-trash"></i></button>`}
                `;
                listEl.appendChild(div);
            }

            // Delete handlers
            listEl.querySelectorAll('.btn-delete-cat').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
                        await DB.deleteCategory(Number(btn.dataset.catId));
                        showToast('Kategori silindi.', 'success');
                        await renderCategoryManagement();
                        await renderCategoryTabs();
                    }
                });
            });
        }

        // Populate bulk-add select
        const selectEl = document.getElementById('select-bulk-category');
        if (selectEl) {
            selectEl.innerHTML = '';
            for (const cat of categories) {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.name;
                selectEl.appendChild(opt);
            }
        }
    }

    // Toggle panels
    document.getElementById('btn-toggle-cat-panel')?.addEventListener('click', () => {
        const panel = document.getElementById('cat-panel');
        const icon = document.getElementById('btn-toggle-cat-panel').querySelector('i');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            icon.className = 'fa-solid fa-chevron-up';
            renderCategoryManagement();
        } else {
            panel.style.display = 'none';
            icon.className = 'fa-solid fa-chevron-down';
        }
    });

    document.getElementById('btn-toggle-list-gen')?.addEventListener('click', () => {
        const panel = document.getElementById('list-gen-panel');
        const icon = document.getElementById('btn-toggle-list-gen').querySelector('i');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            icon.className = 'fa-solid fa-chevron-up';
            renderListGenCategories();
            renderMlGenCategories();
        } else {
            panel.style.display = 'none';
            icon.className = 'fa-solid fa-chevron-down';
        }
    });

    // Add category
    document.getElementById('btn-add-category')?.addEventListener('click', async () => {
        const name = document.getElementById('input-new-category').value.trim();
        if (!name) { showToast('Kategori adı girin.', 'error'); return; }
        try {
            await DB.addCategory(name);
            document.getElementById('input-new-category').value = '';
            showToast(`"${name}" kategorisi eklendi.`, 'success');
            await renderCategoryManagement();
            await renderCategoryTabs();
        } catch (e) {
            showToast('Bu kategori zaten var.', 'error');
        }
    });

    // Bulk add words to category
    document.getElementById('btn-bulk-add-to-category')?.addEventListener('click', async () => {
        const catId = document.getElementById('select-bulk-category').value;
        const text = document.getElementById('input-bulk-words').value.trim();
        if (!catId || !text) { showToast('Kategori ve kelime listesi gerekli.', 'error'); return; }

        const words = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
        const result = await DB.addBulkWordsToCategory(words, Number(catId));
        document.getElementById('input-bulk-words').value = '';
        let msg = `${result.added.length} kelime eklendi.`;
        if (result.alreadyIn && result.alreadyIn.length > 0) msg += ` ${result.alreadyIn.length} zaten kategorideydi.`;
        if (result.skipped.length > 0) msg += ` ${result.skipped.length} kelime atlandı (DB'de yok).`;
        showToast(msg, 'success');
        await renderCategoryManagement();
        await renderCategoryTabs();
    });

    // ─── List Generator ─────────────────────────────────────
    async function renderListGenCategories() {
        const container = document.getElementById('list-gen-categories');
        if (!container) return;
        const categories = await DB.getAllCategories();
        container.innerHTML = `<label style="color:var(--text-primary);font-size:0.85rem;"><input type="checkbox" class="lg-cat-check" value="all" checked> Tümü</label>`;
        for (const cat of categories) {
            container.innerHTML += `<label style="color:var(--text-primary);font-size:0.85rem;"><input type="checkbox" class="lg-cat-check" value="${cat.id}"> ${cat.name}</label>`;
        }
    }

    document.getElementById('btn-generate-list')?.addEventListener('click', async () => {
        const checkedCats = [...document.querySelectorAll('.lg-cat-check:checked')].map(c => c.value);
        const countVal = document.getElementById('list-gen-count').value;

        // Meaning count filters
        const allowedMeaningCounts = [];
        if (document.getElementById('lg-meaning-1')?.checked) allowedMeaningCounts.push(1);
        if (document.getElementById('lg-meaning-2')?.checked) allowedMeaningCounts.push(2);
        if (document.getElementById('lg-meaning-3')?.checked) allowedMeaningCounts.push(3);
        if (document.getElementById('lg-meaning-4')?.checked) allowedMeaningCounts.push(4); // 4+ means >=4

        // Get eligible words
        let eligibleWords;
        if (checkedCats.includes('all') || checkedCats.length === 0) {
            eligibleWords = allWords.map(w => w.word);
        } else {
            const wordSets = await Promise.all(checkedCats.map(id => DB.getWordsInCategory(Number(id))));
            const merged = new Set();
            wordSets.forEach(ws => ws.forEach(w => merged.add(w)));
            eligibleWords = [...merged];
        }

        // Group by meaning count and filter
        const meaningsGrouped = await DB.getAllMeaningsGrouped();
        const results = [];

        for (const word of eligibleWords) {
            const meanings = meaningsGrouped[word] || [];
            if (meanings.length === 0) continue;

            const mc = Math.min(meanings.length, 4); // cap at 4 for the filter
            if (!allowedMeaningCounts.includes(mc)) continue;

            for (const m of meanings) {
                results.push({ word, meaningId: m.id });
            }
        }

        // Shuffle
        for (let i = results.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [results[i], results[j]] = [results[j], results[i]];
        }

        // Limit
        let limited = results;
        if (countVal !== 'all') {
            const limit = parseInt(countVal);
            limited = results.slice(0, limit);
        }

        // Output
        const output = limited.map(r => `${r.word}:${r.meaningId}`).join('\n');
        document.getElementById('list-gen-output').value = output;
        showToast(`${limited.length} kelime-anlam çifti oluşturuldu.`, 'success');
    });

    document.getElementById('btn-copy-list')?.addEventListener('click', () => {
        const text = document.getElementById('list-gen-output').value;
        if (!text) { showToast('Önce liste oluşturun.', 'error'); return; }
        navigator.clipboard.writeText(text).then(() => showToast('Liste panoya kopyalandı!', 'success'));
    });

    // ─── Meaning List Generator ──────────────────────────────
    document.getElementById('meaning-list-toggle')?.addEventListener('click', () => {
        const panel = document.getElementById('meaning-list-panel');
        if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    async function renderMlGenCategories() {
        const container = document.getElementById('ml-gen-categories');
        if (!container) return;
        const categories = await DB.getAllCategories();
        container.innerHTML = `<label style="color:var(--text-primary);font-size:0.85rem;"><input type="checkbox" class="ml-cat-check" value="all" checked> Tümü</label>`;
        for (const cat of categories) {
            container.innerHTML += `<label style="color:var(--text-primary);font-size:0.85rem;"><input type="checkbox" class="ml-cat-check" value="${cat.id}"> ${cat.name}</label>`;
        }
    }

    document.getElementById('btn-generate-meaning-list')?.addEventListener('click', async () => {
        const checkedCats = [...document.querySelectorAll('.ml-cat-check:checked')].map(c => c.value);
        const count = parseInt(document.getElementById('ml-gen-count').value) || 200;

        // Get eligible words
        let eligibleWords;
        if (checkedCats.includes('all') || checkedCats.length === 0) {
            eligibleWords = allWords.map(w => w.word);
        } else {
            const wordSets = await Promise.all(checkedCats.map(id => DB.getWordsInCategory(Number(id))));
            const merged = new Set();
            wordSets.forEach(ws => ws.forEach(w => merged.add(w)));
            eligibleWords = [...merged];
        }

        // Collect all meanings with definitions
        const meaningsGrouped = await DB.getAllMeaningsGrouped();
        const allMeanings = [];

        for (const word of eligibleWords) {
            const meanings = meaningsGrouped[word] || [];
            for (const m of meanings) {
                if (m.definition) {
                    allMeanings.push({ word, definition: m.definition, meaningId: m.id });
                }
            }
        }

        // Shuffle
        for (let i = allMeanings.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allMeanings[i], allMeanings[j]] = [allMeanings[j], allMeanings[i]];
        }

        // Ensure unique meanings (no duplicate meaningId)
        const seen = new Set();
        const unique = [];
        for (const m of allMeanings) {
            if (!seen.has(m.meaningId)) {
                seen.add(m.meaningId);
                unique.push(m);
            }
        }

        // Limit to requested count
        const limited = unique.slice(0, count);

        // Output: word - definition
        const output = limited.map(r => `${r.word} - ${r.definition}`).join('\n');
        document.getElementById('ml-gen-output').value = output;
        showToast(`${limited.length} anlam oluşturuldu (toplam ${unique.length} benzersiz anlam mevcut).`, 'success');
    });

    document.getElementById('btn-copy-meaning-list')?.addEventListener('click', () => {
        const text = document.getElementById('ml-gen-output').value;
        if (!text) { showToast('Önce liste oluşturun.', 'error'); return; }
        navigator.clipboard.writeText(text).then(() => showToast('Anlam listesi panoya kopyalandı!', 'success'));
    });

    // ─── TR Definition Analysis & Bulk Translate ──────────────
    let trAnalysisMissing = [];

    document.getElementById('btn-analyze-tr-defs')?.addEventListener('click', async () => {
        const resultDiv = document.getElementById('tr-analysis-result');
        const bulkBtn = document.getElementById('btn-bulk-translate-all');
        resultDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analiz ediliyor...';
        
        const allMeanings = await DB.getAllMeanings();
        const withTr = allMeanings.filter(m => m.turkishDefinition);
        const withoutTr = allMeanings.filter(m => !m.turkishDefinition && m.definition);
        trAnalysisMissing = withoutTr;
        
        resultDiv.innerHTML = `
            <div style="margin-top: 8px;">
                <span style="color: var(--success);">✅ Türkçesi var: <strong>${withTr.length}</strong></span> &nbsp;|&nbsp;
                <span style="color: var(--error);">❌ Türkçesi yok: <strong>${withoutTr.length}</strong></span> &nbsp;|&nbsp;
                <span style="color: var(--text-muted);">Toplam: <strong>${allMeanings.length}</strong></span>
            </div>
        `;
        
        if (withoutTr.length > 0) {
            bulkBtn.disabled = false;
            bulkBtn.innerHTML = `<i class="fa-solid fa-language"></i> ${withoutTr.length} Anlamı Çevir`;
        } else {
            bulkBtn.disabled = true;
            bulkBtn.innerHTML = '<i class="fa-solid fa-check"></i> Tüm çeviriler tamam';
        }
    });

    document.getElementById('btn-bulk-translate-all')?.addEventListener('click', async () => {
        if (trAnalysisMissing.length === 0) return;
        const bulkBtn = document.getElementById('btn-bulk-translate-all');
        const resultDiv = document.getElementById('tr-analysis-result');
        bulkBtn.disabled = true;
        
        const total = trAnalysisMissing.length;
        let done = 0;
        let errors = 0;
        const failedWords = [];
        
        for (const m of trAnalysisMissing) {
            try {
                const turkishDef = await GeminiService.translateDefinition(m.word, m.definition);
                await DB.updateMeaning(m.id, { turkishDefinition: turkishDef });
                done++;
            } catch (err) {
                console.error('Bulk translate error for', m.word, ':', err);
                failedWords.push({ id: m.id, word: m.word, definition: m.definition, error: err.message });
                errors++;
                done++;
            }
            bulkBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${done}/${total}`;
            resultDiv.innerHTML = `<span style="color: #fbbf24;">⏳ İşleniyor: ${done}/${total} (${errors} hata)</span>`;
        }
        
        trAnalysisMissing = failedWords; // Keep only failed ones for retry
        showToast(`Çeviri tamamlandı! ${done - errors} başarılı, ${errors} hata.`, errors > 0 ? 'warning' : 'success');
        
        if (failedWords.length > 0) {
            bulkBtn.disabled = false;
            bulkBtn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> ${failedWords.length} Hatayı Tekrar Dene`;
            
            const failedListHtml = failedWords.map(f => 
                `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:rgba(248,113,113,0.1);border-radius:6px;margin-top:4px;">
                    <span style="color:var(--text-primary);font-weight:600;">${f.word}</span>
                    <span style="color:var(--text-muted);font-size:0.75rem;max-width:60%;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${f.error}">${f.error}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `
                <div style="margin-top:8px;">
                    <span style="color:var(--success);">✅ Başarılı: <strong>${done - errors}</strong></span> &nbsp;|&nbsp;
                    <span style="color:var(--error);">❌ Başarısız: <strong>${errors}</strong></span>
                </div>
                <div style="margin-top:8px;max-height:200px;overflow-y:auto;">
                    <p style="color:var(--error);font-size:0.82rem;font-weight:600;margin-bottom:4px;">Hata Alan Kelimeler:</p>
                    ${failedListHtml}
                </div>`;
        } else {
            bulkBtn.innerHTML = '<i class="fa-solid fa-check"></i> Tamamlandı';
            bulkBtn.disabled = true;
            resultDiv.innerHTML = `<span style="color: var(--success);">✅ Tüm çeviriler başarıyla tamamlandı!</span>`;
        }
    });

    // ─── Practice Source Selector ────────────────────────────
    async function renderPracticeCategoryCheckboxes() {
        const container = document.getElementById('practice-category-checkboxes');
        if (!container) return;
        const categories = await DB.getAllCategories();
        const counts = await DB.getCategoryWordCounts();
        container.innerHTML = '';
        for (const cat of categories) {
            const label = document.createElement('label');
            label.style.cssText = 'display:flex;align-items:center;gap:8px;color:var(--text-primary);font-size:0.9rem;cursor:pointer;padding:6px 0;';
            label.innerHTML = `<input type="checkbox" class="practice-cat-check" value="${cat.id}"> ${cat.name} <span style="color:var(--text-muted);font-size:0.8rem;">(${counts[cat.id] || 0})</span>`;
            container.appendChild(label);
        }
    }

    document.getElementById('btn-source-all')?.addEventListener('click', () => {
        practiceSource = 'all';
        document.getElementById('btn-source-all').className = 'btn btn-primary btn-sm';
        document.getElementById('btn-source-category').className = 'btn btn-secondary btn-sm';
        document.getElementById('practice-category-select').style.display = 'none';
    });

    document.getElementById('btn-source-category')?.addEventListener('click', () => {
        practiceSource = 'category';
        document.getElementById('btn-source-category').className = 'btn btn-primary btn-sm';
        document.getElementById('btn-source-all').className = 'btn btn-secondary btn-sm';
        document.getElementById('practice-category-select').style.display = 'block';
        renderPracticeCategoryCheckboxes();
    });

    async function processWordList(isSlowMode) {
        const text = els.inputWordList.value;
        const list = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
        
        if (list.length === 0) {
            showToast('Lütfen en az bir kelime girin.', 'error');
            return;
        }

        const activeBtn = isSlowMode ? els.btnConfirmAddSlow : els.btnConfirmAdd;
        const originalText = activeBtn.innerHTML;

        els.btnConfirmAdd.disabled = true;
        els.btnConfirmAddSlow.disabled = true;

        try {
            // Stage 1: Fast Dictionary Lookup & Word Addition
            const parsedWordsData = [];
            const results = { added: [], existing: [], failed: [] };

            for (let i = 0; i < list.length; i++) {
                const dictWord = list[i];
                activeBtn.innerHTML = `<span class="spinner" style="width:16px;height:16px;"></span> İşleniyor: ${dictWord}...`;
                
                try {
                    // Check if already exists fast using the loaded words list
                    const exists = allWords.some(w => w.word === dictWord.toLowerCase());
                    if (exists) {
                        results.existing.push(dictWord);
                    } else {
                        // Fetch from Dictionary API
                        const dictData = await DictionaryService.fetchWord(dictWord);
                        parsedWordsData.push(dictData);
                        results.added.push(dictData.word.toLowerCase());

                        // Save word & audio to DB immediately
                        await DB.addWords([{ word: dictData.word, audio: dictData.audio }]);
                        
                        // Save basic meanings instantly
                        const addedMeaningIds = await DB.addMeanings(dictData.word.toLowerCase(), dictData.meanings);
                        // Attach the new DB IDs back to the meaning objects for the Gemini stage
                        dictData.meanings.forEach((m, index) => m.id = addedMeaningIds[index]);
                    }

                    // Slow Mode Throttling Logic (Avoid API limits for Free Dictionary API)
                    if (isSlowMode && i < list.length - 1 && !exists) {
                        activeBtn.innerHTML = `<span class="spinner" style="width:16px;height:16px;"></span> 10s bekleniyor...`;
                        await new Promise(r => setTimeout(r, 10000));
                    }
                    
                } catch (e) {
                    console.error("Dictionary Fetch Error:", e);
                    results.failed.push(dictWord);
                    if (isSlowMode && i < list.length - 1) {
                         activeBtn.innerHTML = `<span class="spinner" style="width:16px;height:16px;"></span> Hata sonrası 10s bekleniyor...`;
                         await new Promise(r => setTimeout(r, 10000));
                    }
                }
            }

            els.modalAddWords.classList.remove('visible');
            
            let message = `${results.added.length} kelime başarıyla eklendi.`;
            if (results.existing.length > 0) message += ` ${results.existing.length} zaten vardı.`;
            if (results.failed.length > 0) message += ` ${results.failed.length} kelime bulunamadı.`;
            showToast(message, results.failed.length > 0 ? 'info' : 'success');

            // Stage 2: Automatic Background Translation (if checked)
            if (els.checkAutoGen.checked && parsedWordsData.length > 0) {
                const novelWordsData = parsedWordsData; 
                if (novelWordsData.length > 0) {
                    const countToGenerate = list.length < 10 ? 3 : 1;
                    startDictionaryTranslationProcess(novelWordsData, countToGenerate);
                }
            }

            await updateDashboard();
            renderWordList();
            
        } catch(e) {
            showToast('Toplu ekleme hatası: ' + e.message, 'error');
        } finally {
            els.btnConfirmAdd.disabled = false;
            els.btnConfirmAddSlow.disabled = false;
            activeBtn.innerHTML = originalText;
            els.inputWordList.value = '';
        }
    }

    els.btnConfirmAdd.addEventListener('click', () => processWordList(false));
    els.btnConfirmAddSlow.addEventListener('click', () => processWordList(true));

    // ─── Dictionary & AI Pipeline ───────────────────────────
    els.btnGenMissing.addEventListener('click', async () => {
        // Redesigned to fetch full meanings if sentences are missing
        const missing = allWords.filter(w => (sentenceCounts[w.word] || 0) < 1); // If 0 sentences
        if (missing.length === 0) {
            showToast('Tüm kelimelerin cümlesi var!', 'success');
            return;
        }

        els.btnGenMissing.disabled = true;
        
        try {
            for(let i = 0; i < missing.length; i++) {
                const w = missing[i];
                els.btnGenMissing.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Üretiliyor: ${w.word} (${i+1}/${missing.length})`;
                
                try {
                    // 1. Check if we already have meanings in DB to avoid API spam
                    let existingMeanings = await DB.getMeaningsForWord(w.word);
                    let dictData = { word: w.word, meanings: existingMeanings };
                    
                    if (existingMeanings.length === 0) {
                        // Fallback: Fetch deep dictionary definitions if literally 0 meanings exist
                        dictData = await DictionaryService.fetchWord(w.word);
                        const addedMeaningIds = await DB.addMeanings(w.word, dictData.meanings);
                        dictData.meanings.forEach((m, idx) => m.id = addedMeaningIds[idx]);
                    }
                    
                    // 2. Generate 3 sentences via Gemini
                    await startDictionaryTranslationProcess([dictData], 3); // Await the generation so it finishes before the timeout
                    
                    // 3. User requested 2-second rate limit delay between words
                    if (i < missing.length - 1) {
                         els.btnGenMissing.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> 2s bekleniyor... (${i+1}/${missing.length})`;
                         await new Promise(r => setTimeout(r, 2000));
                    }
                    
                } catch(e) {
                    console.error(`Error generating for ${w.word}:`, e);
                    // On error, let's still wait 2 seconds before hammering the API with the next word
                    if (i < missing.length - 1) {
                         els.btnGenMissing.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Hata (2s bekleme) (${i+1}/${missing.length})`;
                         await new Promise(r => setTimeout(r, 2000));
                    }
                }
            }
            
            showToast("Eksik cümleler başarıyla üretildi!", "success");
            await updateDashboard();
            renderWordList();
            
        } catch(e) {
            showToast("Üretim sırasında hata: " + e.message, "error");
        } finally {
            els.btnGenMissing.disabled = false;
            els.btnGenMissing.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Eksikleri Üret';
        }
    });

    // Generate to ensure every meaning has at least 3 sentences
    const btnMin3 = document.getElementById('btn-generate-min3');
    btnMin3?.addEventListener('click', async () => {
        btnMin3.disabled = true;
        btnMin3.innerHTML = '<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Analiz ediliyor...';

        try {
            // Get all meanings grouped by word, and all sentence counts per meaningId
            const allMeaningsGrouped = await DB.getAllMeaningsGrouped();
            const allSentences = await DB.getAllSentences();

            // Count sentences per meaningId
            const sentenceCountPerMeaning = {};
            for (const s of allSentences) {
                if (s.meaningId) {
                    sentenceCountPerMeaning[s.meaningId] = (sentenceCountPerMeaning[s.meaningId] || 0) + 1;
                }
            }

            // Find words that have at least one meaning with < 3 sentences
            const wordsToProcess = [];
            for (const [word, meanings] of Object.entries(allMeaningsGrouped)) {
                const needsMore = meanings.some(m => (sentenceCountPerMeaning[m.id] || 0) < 3);
                if (needsMore) {
                    // Calculate how many sentences to generate per meaning
                    const neededPerMeaning = {};
                    for (const m of meanings) {
                        const current = sentenceCountPerMeaning[m.id] || 0;
                        if (current < 3) {
                            neededPerMeaning[m.id] = 3 - current;
                        }
                    }
                    wordsToProcess.push({ word, meanings, neededPerMeaning });
                }
            }

            if (wordsToProcess.length === 0) {
                showToast('Tüm anlamların en az 3 cümlesi var! 🎉', 'success');
                btnMin3.disabled = false;
                btnMin3.innerHTML = '<i class="fa-solid fa-fill-drip"></i> Min 3\'e Tamamla';
                return;
            }

            showToast(`${wordsToProcess.length} kelimede eksik cümleler bulundu. Üretim başlıyor...`, 'info');

            for (let i = 0; i < wordsToProcess.length; i++) {
                const item = wordsToProcess[i];
                btnMin3.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> ${item.word} (${i + 1}/${wordsToProcess.length})`;

                try {
                    // For each meaning that needs more sentences, generate the difference
                    const maxNeeded = Math.max(...Object.values(item.neededPerMeaning));
                    const dictData = { word: item.word, meanings: item.meanings };
                    await startDictionaryTranslationProcess([dictData], maxNeeded);

                    if (i < wordsToProcess.length - 1) {
                        btnMin3.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> 2s bekleniyor... (${i + 1}/${wordsToProcess.length})`;
                        await new Promise(r => setTimeout(r, 2000));
                    }
                } catch (e) {
                    console.error(`Error generating for ${item.word}:`, e);
                    if (i < wordsToProcess.length - 1) {
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }
            }

            showToast('Tüm eksik cümleler tamamlandı! 🎉', 'success');
            sentenceCounts = await DB.getAllSentenceCounts();
            await updateDashboard();
            renderWordList();

        } catch (e) {
            showToast('Hata: ' + e.message, 'error');
        } finally {
            btnMin3.disabled = false;
            btnMin3.innerHTML = '<i class="fa-solid fa-fill-drip"></i> Min 3\'e Tamamla';
        }
    });
    
    // Generate For ALL words
    const btnGenerateAll = document.getElementById('btn-generate-all');
    if (btnGenerateAll) {
        btnGenerateAll.addEventListener('click', async () => {
            // Filter out words that have 0 sentences
            const wordsToProcess = allWords.filter(w => (sentenceCounts[w.word] || 0) > 0);
            
            if (wordsToProcess.length === 0) {
                showToast('İşlenecek kelime yok (hepsi 0 cümleli)!', 'info');
                return;
            }

            if (!confirm(`0 cümleli kelimeler HARİÇ toplam (${wordsToProcess.length} kelime) sırayla 3'er cümle üretilecek. Her kelime arasında 2 saniye dinlenme payı olacak. Bu işlem uzun sürebilir. Onaylıyor musun?`)) {
                return;
            }

            btnGenerateAll.disabled = true;
            els.btnGenMissing.disabled = true; // Disable the other one too to avoid conflicts
            
            try {
                for(let i = 0; i < wordsToProcess.length; i++) {
                    const w = wordsToProcess[i];
                    btnGenerateAll.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Üretiliyor: ${w.word} (${i+1}/${wordsToProcess.length})`;
                    
                    try {
                        let existingMeanings = await DB.getMeaningsForWord(w.word);
                        let dictData = { word: w.word, meanings: existingMeanings };
                        
                        if (existingMeanings.length === 0) {
                            dictData = await DictionaryService.fetchWord(w.word);
                            const addedMeaningIds = await DB.addMeanings(w.word, dictData.meanings);
                            dictData.meanings.forEach((m, idx) => m.id = addedMeaningIds[idx]);
                        }
                        
                        await startDictionaryTranslationProcess([dictData], 3); 
                        
                        if (i < wordsToProcess.length - 1) {
                             btnGenerateAll.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> 2s bekleniyor... (${i+1}/${wordsToProcess.length})`;
                             await new Promise(r => setTimeout(r, 2000));
                        }
                        
                    } catch(e) {
                        console.error(`Error generating for ${w.word}:`, e);
                        if (i < wordsToProcess.length - 1) {
                             btnGenerateAll.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Hata (2s bekleme) (${i+1}/${wordsToProcess.length})`;
                             await new Promise(r => setTimeout(r, 2000));
                        }
                    }
                }
                
                showToast("Tüm kelimelere cümle üretimi tamamlandı!", "success");
                await updateDashboard();
                renderWordList();
                
            } catch(e) {
                showToast("Üretim sırasında hata: " + e.message, "error");
            } finally {
                btnGenerateAll.disabled = false;
                els.btnGenMissing.disabled = false;
                btnGenerateAll.innerHTML = '<i class="fa-solid fa-bolt"></i> Tümüne Üret';
            }
        });
    }
    
    // Cleanup Empty Meanings
    const btnCleanupMeanings = document.getElementById('btn-cleanup-meanings');
    if (btnCleanupMeanings) {
        btnCleanupMeanings.addEventListener('click', async () => {
             if (!confirm('Veritabanındaki cümlesi olmayan (boş) Tektip anlamlar kalıcı olarak silinecek. Ayrıca aynı anlama sahip kelimeler birleştirilecek. Bu işlem geri alınamaz. Onaylıyor musunuz?')) return;
             
             btnCleanupMeanings.disabled = true;
             const originalText = btnCleanupMeanings.innerHTML;
             btnCleanupMeanings.innerHTML = '<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Temizleniyor...';
             
             try {
                 let deletedCount = 0;
                 let mergedCount = 0;
                 
                 // Get all meanings and all sentences to cross-reference
                 const allMeanings = await DB.getAllMeanings();
                 const allSentences = await DB.getAllSentences();
                 
                 // Index sentences by meaningId
                 const sentenceCountsByMeaning = {};
                 const sentencesByMeaning = {};
                 allSentences.forEach(s => {
                     if (s.meaningId) {
                         sentenceCountsByMeaning[s.meaningId] = (sentenceCountsByMeaning[s.meaningId] || 0) + 1;
                         if (!sentencesByMeaning[s.meaningId]) sentencesByMeaning[s.meaningId] = [];
                         sentencesByMeaning[s.meaningId].push(s);
                     }
                 });
                 
                 // 1. Delete Orphaned Meanings (0 Sentences)
                 // Note: We might want to keep at least 1 meaning if the word has NO sentences at all, 
                 // but the prompt asked to delete meanings *without sentences*. If a word loses all meanings, 
                 // the fetch pipeline will recreate them anyway.
                 for (const m of allMeanings) {
                     if (!sentenceCountsByMeaning[m.id]) {
                         await DB.deleteMeaning(m.id);
                         deletedCount++;
                     }
                 }
                 
                 // 2. Deduplicate Identical Meanings that DO have sentences
                 // Group surviving meanings by Word + Exact Text
                 const survivingMeanings = await DB.getAllMeanings();
                 const groupedMeanings = {};
                 
                 for (const m of survivingMeanings) {
                     const key = `${m.word}::${m.definition.trim()}`;
                     if (!groupedMeanings[key]) groupedMeanings[key] = [];
                     groupedMeanings[key].push(m);
                 }
                 
                 for (const key in groupedMeanings) {
                     const duplicates = groupedMeanings[key];
                     if (duplicates.length > 1) {
                         // Found identical definitions for the same word. Keep the first one, delete the rest.
                         const targetMeaning = duplicates[0];
                         
                         for (let i = 1; i < duplicates.length; i++) {
                             const dupMeaning = duplicates[i];
                             
                             // Delete all sentences associated with this duplicate meaning
                             const sentencesToDelete = sentencesByMeaning[dupMeaning.id] || [];
                             for (const sm of sentencesToDelete) {
                                 await DB.deleteSentenceById(sm.id);
                             }
                             
                             // Delete the duplicate meaning itself
                             await DB.deleteMeaning(dupMeaning.id);
                             mergedCount++;
                         }
                     }
                 }
                 
                 showToast(`${deletedCount} boş anlam silindi, ${mergedCount} kopya anlam cümlesiyle beraber silindi!`, 'success');
                 await updateDashboard();
                 renderWordList();
             } catch(e) {
                 console.error("Cleanup Error:", e);
                 showToast('Temizleme sırasında hata: ' + e.message, 'error');
             } finally {
                 btnCleanupMeanings.disabled = false;
                 btnCleanupMeanings.innerHTML = originalText;
             }
        });
    }

    // Trim meanings to max 4 per word
    const btnTrimMeanings = document.getElementById('btn-trim-meanings');
    if (btnTrimMeanings) {
        btnTrimMeanings.addEventListener('click', async () => {
            btnTrimMeanings.disabled = true;
            btnTrimMeanings.innerHTML = '<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Analiz ediliyor...';

            try {
                const allMeanings = await DB.getAllMeanings();
                // Group by word
                const byWord = {};
                for (const m of allMeanings) {
                    if (!byWord[m.word]) byWord[m.word] = [];
                    byWord[m.word].push(m);
                }

                // Find words with > 4 meanings
                const wordsToTrim = [];
                let totalToDelete = 0;
                for (const [word, meanings] of Object.entries(byWord)) {
                    if (meanings.length > 4) {
                        // Sort by ID ascending (keep first 4)
                        meanings.sort((a, b) => a.id - b.id);
                        const excess = meanings.slice(4);
                        wordsToTrim.push({ word, excess });
                        totalToDelete += excess.length;
                    }
                }

                if (wordsToTrim.length === 0) {
                    showToast('Tüm kelimeler zaten max 4 anlam içeriyor! 🎉', 'success');
                    return;
                }

                if (!confirm(`${wordsToTrim.length} kelimede ${totalToDelete} fazla anlam bulundu. İlk 4 hariç diğer anlamları ve cümlelerini silmek istediğinize emin misiniz?`)) return;

                btnTrimMeanings.innerHTML = '<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Siliniyor...';

                // Pre-load all sentences and index by meaningId
                const allSentences = await DB.getAllSentences();
                const sentencesByMeaning = {};
                for (const s of allSentences) {
                    if (s.meaningId) {
                        if (!sentencesByMeaning[s.meaningId]) sentencesByMeaning[s.meaningId] = [];
                        sentencesByMeaning[s.meaningId].push(s);
                    }
                }

                let deletedMeanings = 0;
                let deletedSentences = 0;

                for (const { word, excess } of wordsToTrim) {
                    for (const m of excess) {
                        // Delete sentences for this meaning
                        const sentences = sentencesByMeaning[m.id] || [];
                        for (const s of sentences) {
                            await DB.deleteSentenceById(s.id);
                            deletedSentences++;
                        }
                        // Delete the meaning
                        await DB.deleteMeaning(m.id);
                        deletedMeanings++;
                    }
                }

                showToast(`${deletedMeanings} fazla anlam ve ${deletedSentences} cümle silindi!`, 'success');
                sentenceCounts = await DB.getAllSentenceCounts();
                await updateDashboard();
                renderWordList();

            } catch (e) {
                console.error('Trim error:', e);
                showToast('Hata: ' + e.message, 'error');
            } finally {
                btnTrimMeanings.disabled = false;
                btnTrimMeanings.innerHTML = '<i class="fa-solid fa-scissors"></i> Max 4 Anlam';
            }
        });
    }
    els.btnCancelGen.addEventListener('click', () => {
        cancelGeneration = true;
        els.btnCancelGen.textContent = 'İptal Ediliyor...';
    });

    async function startDictionaryTranslationProcess(parsedWordsData, generateCount = 1) {
        const apiKey = await DB.getSetting('gemini_api_key');
        if (!apiKey) {
            showToast('Türkçe çeviri ve AI için Ayarlar\'dan API anahtarı girmelisiniz.', 'error');
            return;
        }

        cancelGeneration = false;
        els.overlayGen.classList.add('visible');
        els.genTotalNum.textContent = parsedWordsData.length;
        els.genCurrentNum.textContent = 0;
        els.genProgressFill.style.width = '0%';
        els.btnCancelGen.textContent = 'İptal Et';
        document.querySelector('.progress-status').textContent = "Türkçeye Çevriliyor...";

        let processed = 0;
        for (const data of parsedWordsData) {
            if (cancelGeneration) break;

            els.genCurrentWord.textContent = data.word;
            
            try {
                // Dynamic generation count logic: if more than 5 meanings, generate 2 to save time/tokens.
                let actualCount = generateCount;
                if (data.meanings.length > 5) {
                    actualCount = Math.min(2, generateCount === 1 ? 1 : 2); // if user asked for 1, keep 1, otherwise max 2
                } else if (generateCount > 1) {
                    actualCount = 3; // Enforce 3 sentences for <= 5 meanings if we're not doing a 1-sentence bulk run
                }

                // Pass meanings to Gemini for pure AI generation
                const finalSentences = await GeminiService.processDictionaryMeanings(data.word, data.meanings, actualCount);
                
                // Save fully processed sentences to DB
                await DB.addSentences(data.word.toLowerCase(), finalSentences);
                
                showToast(`${data.word} tamamlandı.`, 'success');
            } catch (e) {
                console.error(`AI Error for ${data.word}:`, e);
                showToast(`${data.word} çevrilemedi: ${e.message}`, 'error');
            }

            processed++;
            let perc = Math.round((processed / parsedWordsData.length) * 100);
            els.genCurrentNum.textContent = processed;
            els.genProgressFill.style.width = `${perc}%`;
            
            // Brief pause
            await new Promise(r => setTimeout(r, 600));
        }

        els.overlayGen.classList.remove('visible');
        document.querySelector('.progress-status').textContent = "Cümleler Üretiliyor..."; // reset default
        await updateDashboard();
        renderWordList();
        
        if (cancelGeneration) {
            showToast('İşlem iptal edildi.', 'info');
        } else {
            showToast('Tüm çeviriler tamamlandı!', 'success');
        }
    }

    // ─── Word Details ───────────────────────────────────────
    async function openWordDetails(word) {
        currentDetailWord = word;
        
        // Use cached allWords instead of re-fetching all 12K words
        const wordData = allWords.find(w => w.word === word);
        const hasAudio = wordData && wordData.audio;

        els.detailWordTitle.innerHTML = `${word} ${hasAudio ? `<button class="btn btn-ghost btn-sm" onclick="new Audio('${wordData.audio}').play()" style="color:var(--accent-blue); margin-left:10px;"><i class="fa-solid fa-volume-high"></i></button>` : ''}`;
        
        const count = await DB.getSentenceCountForWord(word);
        els.detailSentenceCount.textContent = count;
        
        // Fetch Meanings and Sentences
        const meanings = await DB.getMeaningsForWord(word);
        const sentences = await DB.getSentencesForWord(word);
        els.detailSentencesList.innerHTML = '';
        
        if (sentences.length === 0 && meanings.length === 0) {
            els.detailSentencesList.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--text-muted)">Cümle veya anlam bulunamadı.</td></tr>`;
        } else {
            // Group sentences by meaningId
            const grouped = {};
            meanings.forEach(m => grouped[m.id] = { meaning: m, sentences: [] });
            
            // Uncategorized sentences (fallback)
            grouped['uncategorized'] = { meaning: { partOfSpeech: 'Genel', definition: 'Sözlük harici cümleler' }, sentences: [] };

            sentences.forEach(s => {
                if (s.meaningId && grouped[s.meaningId]) {
                    grouped[s.meaningId].sentences.push(s);
                } else {
                    grouped['uncategorized'].sentences.push(s);
                }
            });

            // Render Groups
            for (const key in grouped) {
                const group = grouped[key];
                if (key !== 'uncategorized' || group.sentences.length > 0) {
                    
                    // Header Row for Meaning
                    const headerTr = document.createElement('tr');
                    const trDef = group.meaning.turkishDefinition
                        ? `<div style="color: #fbbf24; font-size: 0.82rem; margin-top: 4px; font-weight: 500;">🇹🇷 ${group.meaning.turkishDefinition} <button class="btn-del-tr-def" data-meaning-id="${key}" style="background:none;border:none;color:var(--error);cursor:pointer;font-size:0.7rem;padding:1px 4px;" title="TR anlamı sil">✕</button></div>`
                        : '';
                    const trBtn = group.meaning.turkishDefinition
                        ? `<button class="btn btn-ghost btn-sm btn-edit-tr-def" data-word="${word}" data-meaning-id="${key}" title="TR çeviriyi düzenle" style="color: #fbbf24; font-size: 0.7rem; padding: 2px 8px;"><i class="fa-solid fa-pen"></i></button>`
                        : `<button class="btn btn-ghost btn-sm btn-translate-def" data-word="${word}" data-meaning-id="${key}" title="Türkçe anlam üret (AI)" style="color: #fbbf24; font-size: 0.7rem; padding: 2px 8px;"><i class="fa-solid fa-language"></i> 🇹🇷</button><button class="btn btn-ghost btn-sm btn-manual-tr-def" data-word="${word}" data-meaning-id="${key}" title="El ile çeviri ekle" style="color: #fbbf24; font-size: 0.7rem; padding: 2px 8px;"><i class="fa-solid fa-pen"></i> ✍️</button>`;
                    headerTr.innerHTML = `
                        <td colspan="3" style="background: rgba(255,255,255,0.03); padding-top: 15px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div style="color: var(--accent-purple-light); font-weight:600; flex: 1;">
                                    <span style="border: 1px solid var(--accent-purple-light); padding: 2px 6px; border-radius: 4px; font-size:0.7rem; margin-right: 8px;">${group.meaning.partOfSpeech.toUpperCase()}</span>
                                    ${group.meaning.definition}
                                    ${trDef}
                                </div>
                                <div style="display: flex; gap: 4px; align-items: center; flex-shrink: 0;">
                                    ${trBtn}
                                    <button class="btn btn-ghost btn-sm btn-generate-meaning-sentence" data-word="${word}" data-meaning-id="${key}" title="Bu anlama 3 cümle daha üret" style="color: var(--accent-blue);">
                                        <i class="fa-solid fa-robot"></i> +3 Üret
                                    </button>
                                </div>
                            </div>
                        </td>
                    `;
                    els.detailSentencesList.appendChild(headerTr);

                    // Sentences under this meaning
                    if (group.sentences.length === 0) {
                        const emptyTr = document.createElement('tr');
                        emptyTr.innerHTML = `<td colspan="3" style="text-align:center; color: var(--text-muted); font-size:0.85rem; font-style:italic;">Bu anlama ait henüz örnek cümle yok.</td>`;
                        els.detailSentencesList.appendChild(emptyTr);
                    } else {
                        group.sentences.forEach(s => {
                            const tr = document.createElement('tr');
                            const aiBadge = `<span style="background: rgba(var(--accent-purple-rgb), 0.2); color: var(--accent-purple-light); font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--accent-purple-darker); margin-right: 8px;" title="Yapay Zeka tarafından üretildi."><i class="fa-solid fa-robot"></i> AI</span>`;
                            
                            tr.innerHTML = `
                                <td style="font-size: 0.9rem; padding-left: 20px;">
                                    ${aiBadge}
                                    ${s.sentence.replace('___', '<strong style="color:var(--success)">___</strong>')}
                                    <br><span style="font-size:0.75rem; color: var(--text-muted);"><i class="fa-solid fa-angle-right"></i> ${s.turkish}</span>
                                </td>
                                <td><strong>${s.answer}</strong></td>
                                <td><button class="btn btn-ghost btn-sm btn-delete-single-sentence" data-id="${s.id}" style="color:var(--error);"><i class="fa-solid fa-trash"></i></button></td>
                            `;
                            els.detailSentencesList.appendChild(tr);
                        });
                    }
                }
            }
            
            // Attach event listeners for delete
            document.querySelectorAll('.btn-delete-single-sentence').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    if (confirm('Bu cümleyi silmek istediğinize emin misiniz?')) {
                        await DB.deleteSentenceById(id);
                        showToast('Cümle silindi.', 'success');
                        await openWordDetails(currentDetailWord);
                        await updateDashboard();
                        renderWordList();
                    }
                });
            });

            // Attach event listeners for specific meaning generation
            document.querySelectorAll('.btn-generate-meaning-sentence').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const w = e.currentTarget.dataset.word;
                    const mId = e.currentTarget.dataset.meaningId;
                    if(mId === 'uncategorized') {
                        showToast("Bu kategori için üretim yapılamaz.", "error"); return;
                    }
                    generateSentencesForSpecificMeaning(w, Number(mId), 3);
                });
            });

            // Single translate meaning to Turkish
            document.querySelectorAll('.btn-translate-def').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const w = e.currentTarget.dataset.word;
                    const mId = Number(e.currentTarget.dataset.meaningId);
                    const btnEl = e.currentTarget;
                    btnEl.disabled = true;
                    btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                    try {
                        const meanings = await DB.getMeaningsForWord(w);
                        const meaning = meanings.find(m => m.id === mId);
                        if (!meaning) throw new Error('Anlam bulunamadı');
                        const turkishDef = await GeminiService.translateDefinition(w, meaning.definition);
                        await DB.updateMeaning(mId, { turkishDefinition: turkishDef });
                        showToast('Türkçe anlam eklendi!', 'success');
                        openWordDetails(w);
                    } catch (err) {
                        showToast('Çeviri başarısız: ' + err.message, 'error');
                        btnEl.disabled = false;
                        btnEl.innerHTML = '<i class="fa-solid fa-language"></i> 🇹🇷';
                    }
                });
            });

            // Manual TR definition input
            document.querySelectorAll('.btn-manual-tr-def').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const mId = Number(e.currentTarget.dataset.meaningId);
                    const w = e.currentTarget.dataset.word;
                    const input = prompt('Türkçe çeviriyi girin:');
                    if (input && input.trim()) {
                        await DB.updateMeaning(mId, { turkishDefinition: input.trim() });
                        showToast('Türkçe anlam eklendi!', 'success');
                        openWordDetails(w);
                    }
                });
            });

            // Edit TR definition
            document.querySelectorAll('.btn-edit-tr-def').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const mId = Number(e.currentTarget.dataset.meaningId);
                    const w = e.currentTarget.dataset.word;
                    const meanings = await DB.getMeaningsForWord(w);
                    const meaning = meanings.find(m => m.id === mId);
                    const current = meaning?.turkishDefinition || '';
                    const input = prompt('Türkçe çeviriyi düzenle:', current);
                    if (input !== null && input.trim()) {
                        await DB.updateMeaning(mId, { turkishDefinition: input.trim() });
                        showToast('Türkçe anlam güncellendi!', 'success');
                        openWordDetails(w);
                    }
                });
            });

            // Delete TR definition
            document.querySelectorAll('.btn-del-tr-def').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const mId = Number(e.currentTarget.dataset.meaningId);
                    await DB.updateMeaning(mId, { turkishDefinition: null });
                    showToast('Türkçe anlam silindi.', 'info');
                    openWordDetails(currentDetailWord);
                });
            });

            // Bulk translate all meanings for this word
            const bulkBtn = document.getElementById('btn-bulk-translate-word');
            if (bulkBtn) {
                bulkBtn.addEventListener('click', async () => {
                    const w = currentDetailWord;
                    if (!w) return;
                    const meanings = await DB.getMeaningsForWord(w);
                    const toTranslate = meanings.filter(m => !m.turkishDefinition && m.definition);
                    if (toTranslate.length === 0) {
                        showToast('Tüm anlamların Türkçesi zaten mevcut.', 'info'); return;
                    }
                    bulkBtn.disabled = true;
                    bulkBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> 0/${toTranslate.length}`;
                    let done = 0;
                    for (const m of toTranslate) {
                        try {
                            const turkishDef = await GeminiService.translateDefinition(w, m.definition);
                            await DB.updateMeaning(m.id, { turkishDefinition: turkishDef });
                            done++;
                            bulkBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${done}/${toTranslate.length}`;
                        } catch (err) {
                            console.error('Bulk translate error:', err);
                            done++;
                        }
                    }
                    showToast(`${done} anlam çevrildi!`, 'success');
                    openWordDetails(w);
                });
            }
        }
        
        els.modalWordDetails.classList.add('visible');
    }

    els.btnDeleteWord.addEventListener('click', async () => {
        if (!currentDetailWord) return;
        if (confirm(`"${currentDetailWord}" kelimesini ve tüm cümlelerini silmek istediğinize emin misiniz?`)) {
            await DB.deleteWord(currentDetailWord);
            els.modalWordDetails.classList.remove('visible');
            await updateDashboard();
            renderWordList();
            showToast('Kelime silindi.', 'success');
        }
    });

    els.btnDetailGenerateAll.addEventListener('click', () => {
        if (!currentDetailWord) return;
        generateSentencesForAllMeanings(currentDetailWord, 3);
    });

    async function generateSentencesForAllMeanings(word, count = 3) {
        const apiKey = await DB.getSetting('gemini_api_key');
        if (!apiKey) {
            showToast('Lütfen önce Ayarlar\'dan API anahtarı girin.', 'error');
            return;
        }

        const meanings = await DB.getMeaningsForWord(word);
        if(!meanings || meanings.length === 0) {
            showToast("Kelimenin anlamları API'den çekilmemiş.", "error"); return;
        }

        const forcedPayload = meanings.map(m => ({
            id: m.id,
            partOfSpeech: m.partOfSpeech,
            definition: m.definition,
            example: null // Force generation
        }));

        cancelGeneration = false;
        els.overlayGen.classList.add('visible');
        els.genTotalNum.textContent = 1;
        els.genCurrentNum.textContent = 0;
        els.genProgressFill.style.width = '0%';
        els.genCurrentWord.textContent = word + " (Tüm Anlamlar)";
        els.btnCancelGen.textContent = 'İptal Et';

        try {
            let actualCount = count;
            if (meanings.length > 5) {
                actualCount = Math.min(2, count === 1 ? 1 : 2);
            }

            const generatedArr = await GeminiService.processDictionaryMeanings(word, forcedPayload, actualCount);
            await DB.addSentences(word, generatedArr);
            showToast(`${word} için toplam ${generatedArr.length} yeni AI cümlesi eklendi!`, 'success');
        } catch (e) {
            showToast(`Hata: ${e.message}`, 'error');
        } finally {
            els.overlayGen.classList.remove('visible');
            await updateDashboard();
            renderWordList();
        }
    }

    async function generateSentencesForSpecificMeaning(word, meaningId, count = 3) {
        const apiKey = await DB.getSetting('gemini_api_key');
        if (!apiKey) {
            showToast('Lütfen önce Ayarlar\'dan API anahtarı girin.', 'error');
            return;
        }

        const meanings = await DB.getMeaningsForWord(word);
        const targetMeaning = meanings.find(m => m.id === meaningId);
        if(!targetMeaning) {
            showToast("Anlam bulunamadı.", "error"); return;
        }

        // Send a custom forced payload to Gemini telling it to fake "missing example" to enforce generation
        const forcedPayload = [{
            id: targetMeaning.id,
            partOfSpeech: targetMeaning.partOfSpeech,
            definition: targetMeaning.definition,
            example: null // Force generation
        }];

        els.modalWordDetails.classList.remove('visible');
        
        cancelGeneration = false;
        els.overlayGen.classList.add('visible');
        els.genTotalNum.textContent = count;
        els.genCurrentNum.textContent = 0;
        els.genProgressFill.style.width = '0%';
        els.genCurrentWord.textContent = `${word} (${targetMeaning.partOfSpeech})`;
        els.btnCancelGen.textContent = 'İptal Et';

        try {
            const generatedArr = await GeminiService.processDictionaryMeanings(word, forcedPayload, count);
            await DB.addSentences(word, generatedArr);
            showToast(`${word} için toplam ${generatedArr.length} yeni AI cümlesi eklendi!`, 'success');
        } catch (e) {
            showToast(`Hata: ${e.message}`, 'error');
        } finally {
            els.overlayGen.classList.remove('visible');
            await updateDashboard();
            renderWordList();
            
            // Her durumda iptal edilmediyse modalı güncelleyip geri açalım
            if (!cancelGeneration) {
                await openWordDetails(word);
            }
        }
    }

    // ─── Practice Session Logic ─────────────────────────────
    
    // Select count
    els.countSelectors.forEach(btn => {
        btn.addEventListener('click', (e) => {
            els.countSelectors.forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            selectedWordCount = e.currentTarget.dataset.count;
        });
    });

    els.btnShowCustomPractice.addEventListener('click', () => {
        els.inputCustomPracticeList.value = '';
        els.modalCustomPractice.classList.add('visible');
    });

    els.btnCancelCustom.addEventListener('click', () => {
        els.modalCustomPractice.classList.remove('visible');
    });

    els.btnStartCustomPractice.addEventListener('click', async () => {
        const text = els.inputCustomPracticeList.value;
        const rawLines = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
        
        if (rawLines.length === 0) {
            showToast('Lütfen pratik yapmak için kelime girin.', 'error');
            return;
        }

        els.btnStartCustomPractice.disabled = true;
        els.btnStartCustomPractice.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Analiz ediliyor...';

        try {
            // Check if word:meaningId format
            const hasIds = rawLines.some(l => l.includes(':'));
            
            if (hasIds) {
                // Parse word:meaningId pairs — start session with specific meanings
                const pairs = rawLines.map(l => {
                    const [word, mId] = l.split(':');
                    return { word: word.trim(), meaningId: mId ? mId.trim() : null };
                }).filter(p => p.word);

                const uniqueWords = [...new Set(pairs.map(p => p.word))];
                const meaningIdSet = new Set(pairs.filter(p => p.meaningId).map(p => p.meaningId));

                // Start session with these specific meanings
                await startSessionWithSpecificMeanings(uniqueWords, meaningIdSet);
            } else {
                // Regular word-only list (existing behavior)
                const list = rawLines;
                await DB.addWords(list);
                await updateDashboard();

                const missing = list.filter(w => (sentenceCounts[w] || 0) < 1);

                if (missing.length > 0) {
                    els.modalCustomPractice.classList.remove('visible');
                    showToast(`${missing.length} kelime için eksik cümleler üretiliyor...`, 'info');
                    await generateAndStartCustomSession(missing, list);
                } else {
                    els.modalCustomPractice.classList.remove('visible');
                    startSessionWithSpecificList(list);
                }
            }
        } catch(e) {
            showToast('Hata: ' + e.message, 'error');
        } finally {
            els.btnStartCustomPractice.disabled = false;
            els.btnStartCustomPractice.innerHTML = 'Analiz Et ve Başla';
        }
    });

    // Start session with specific word:meaningId pairs
    async function startSessionWithSpecificMeanings(words, meaningIdSet) {
        const readyMeaningsMap = new Map();
        const allSentencesGrouped = await DB.getAllSentencesGrouped();
        const allMeaningsMap = await DB.getAllMeaningsGrouped();

        for (const word of words) {
            const sentences = allSentencesGrouped[word] || [];
            const wordMeanings = allMeaningsMap[word] || [];

            const meaningGroups = {};
            sentences.forEach(s => {
                const mId = s.meaningId;
                if (!mId) return;
                // Only include meanings in our set (if set is not empty)
                if (meaningIdSet.size > 0 && !meaningIdSet.has(mId.toString())) return;
                if (!meaningGroups[mId]) meaningGroups[mId] = [];

                let meaningData = wordMeanings.find(m => m.id.toString() === mId.toString());
                if (!meaningData && wordMeanings.length > 0) meaningData = wordMeanings[0];
                s.englishDefinition = meaningData ? meaningData.definition : "Anlam bulunamadı";
                s.turkishDefinition = meaningData ? meaningData.turkishDefinition : null;

                meaningGroups[mId].push(s);
            });

            for (const [mId, sList] of Object.entries(meaningGroups)) {
                if (sList.length >= 1) {
                    readyMeaningsMap.set(mId, sList);
                }
            }
        }

        if (readyMeaningsMap.size === 0) {
            showToast('Bu kelime-anlam çiftleri için yeterli cümle bulunamadı.', 'error');
            return;
        }

        els.modalCustomPractice.classList.remove('visible');

        if (practiceMode === 'reading') {
            currentSession = new ReadingSessionManager(readyMeaningsMap, 1);
        } else if (practiceMode === 'mixed') {
            currentSession = new SessionManager(readyMeaningsMap, 1);
        } else if (practiceMode === 'warmup') {
            currentSession = new WarmUpSessionManager(readyMeaningsMap, 1);
        } else if (practiceMode === 'speaking') {
            currentSession = new SpeakingSessionManager([...readyMeaningsMap.keys()], readyMeaningsMap, speakingRepeatCount);
        } else if (practiceMode === 'combined') {
            currentSession = new CombinedCardSessionManager(readyMeaningsMap, combinedGroupSize, combinedSPM);
        } else if (practiceMode === 'scan') {
            currentSession = new ScanSessionManager(readyMeaningsMap, scanPageSize);
        } else if (practiceMode === 'flow') {
            currentSession = new FlowSessionManager(readyMeaningsMap);
        } else if (practiceMode === 'shadowing') {
            currentSession = new ShadowingSessionManager(readyMeaningsMap, shadowingGroupSize);
        } else {
            currentSession = new SessionManager(readyMeaningsMap, 1);
        }

        resetGamification();

        els.practiceSetup.style.display = 'none';
        els.practiceComplete.style.display = 'none';
        els.practiceActive.style.display = 'block';

        const prog = currentSession.getProgress();
        els.progTotal.textContent = prog.totalWords;

        document.querySelector('[data-target="view-practice"]').click();
        loadNextCard();
    }

    async function generateAndStartCustomSession(missingWords, targetList) {
        const apiKey = await DB.getSetting('gemini_api_key');
        if (!apiKey) {
            showToast('Cümle üretmek için Ayarlar\'dan API anahtarı girmelisiniz.', 'error');
            return;
        }

        cancelGeneration = false;
        els.overlayGen.classList.add('visible');
        els.genTotalNum.textContent = missingWords.length;
        els.genCurrentNum.textContent = 0;
        els.genProgressFill.style.width = '0%';
        els.btnCancelGen.textContent = 'İptal Et';

        try {
            // we request minSentencesRequired from generator, but since Custom Practice needs fast entry, we just use the global setting
            await GeminiService.generateForMissingWords(missingWords, minSentencesRequired, (processed, total, word, status) => {
                let perc = Math.round((processed / total) * 100);
                els.genCurrentNum.textContent = processed;
                els.genProgressFill.style.width = `${perc}%`;
                els.genCurrentWord.textContent = word;

                if (cancelGeneration) throw new Error('CanceledByUser');
            });
            showToast('Cümle üretimi tamamlandı! Özel oturum başlıyor.', 'success');
            
            await updateDashboard();
            sentenceCounts = await DB.getAllSentenceCounts();
            
            startSessionWithSpecificList(targetList);

        } catch (e) {
            if (e.message === 'CanceledByUser') {
                showToast('Üretim iptal edildi. Oturum başlatılamadı.', 'info');
            } else {
                showToast(`Hata: ${e.message}`, 'error');
            }
        } finally {
            els.overlayGen.classList.remove('visible');
            await updateDashboard();
            renderWordList();
        }
    }

    async function startSessionWithSpecificList(customList) {
        const readyMeaningsMap = new Map();
        
        for (const word of customList) {
            const sentences = await DB.getSentencesForWord(word);
            if (sentences && sentences.length > 0) {
                const wordMeanings = await DB.getMeaningsForWord(word);
                const meaningGroups = {};
                
                sentences.forEach(s => {
                    const mId = s.meaningId;
                    if (!mId) return;
                    if (!meaningGroups[mId]) meaningGroups[mId] = [];
                    
                    let meaningData = wordMeanings.find(m => m.id.toString() === mId.toString());
                    if (!meaningData && wordMeanings.length > 0) meaningData = wordMeanings[0];
                    s.englishDefinition = meaningData ? meaningData.definition : "Anlam bulunamadı";
                    s.turkishDefinition = meaningData ? meaningData.turkishDefinition : null;
                    
                    meaningGroups[mId].push(s);
                });
                
                // Only include meanings that have at least 1 sentence
                for (const [mId, sList] of Object.entries(meaningGroups)) {
                    if (sList.length >= 1) {
                        readyMeaningsMap.set(mId, sList);
                    }
                }
            }
        }

        if (readyMeaningsMap.size === 0) {
            showToast(`Bu kelimeler için yeterli cümle bulunamadı.`, 'error');
            return;
        }

        if (practiceMode === 'reading') {
            currentSession = new ReadingSessionManager(readyMeaningsMap, 1);
        } else if (practiceMode === 'mixed') {
            currentSession = new SessionManager(readyMeaningsMap, 1);
        } else if (practiceMode === 'warmup') {
            currentSession = new WarmUpSessionManager(readyMeaningsMap, 1);
        } else if (practiceMode === 'speaking') {
            currentSession = new SpeakingSessionManager([...readyMeaningsMap.keys()], readyMeaningsMap, speakingRepeatCount);
        } else if (practiceMode === 'combined') {
            currentSession = new CombinedCardSessionManager(readyMeaningsMap, combinedGroupSize, combinedSPM);
        } else if (practiceMode === 'scan') {
            currentSession = new ScanSessionManager(readyMeaningsMap, scanPageSize);
        } else if (practiceMode === 'flow') {
            currentSession = new FlowSessionManager(readyMeaningsMap);
        } else if (practiceMode === 'shadowing') {
            currentSession = new ShadowingSessionManager(readyMeaningsMap, shadowingGroupSize);
        } else {
            currentSession = new SessionManager(readyMeaningsMap, 1);
        }
        
        resetGamification();
        
        els.practiceSetup.style.display = 'none';
        els.practiceComplete.style.display = 'none';
        els.practiceActive.style.display = 'block';
        
        const prog = currentSession.getProgress();
        els.progTotal.textContent = prog.totalWords;

        document.querySelector('[data-target="view-practice"]').click();
        loadNextCard();
    }

        // Mode toggles
    els.btnModeRecall.addEventListener('click', () => {
        practiceMode = 'recall';
        resetAllModeButtons();
        els.btnModeRecall.className = 'btn btn-primary';
        els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Kaç kelimeyle pratik yapmak istiyorsun?';
        els.countSelectors[0].parentElement.style.display = 'flex';
    });
    
    els.btnModeReading.addEventListener('click', () => {
        practiceMode = 'reading';
        resetAllModeButtons();
        els.btnModeReading.className = 'btn btn-primary';
        els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Kaç kelime okumak istiyorsun?';
        els.countSelectors[0].parentElement.style.display = 'flex';
    });

    els.btnModeMixed.addEventListener('click', () => {
        practiceMode = 'mixed';
        resetAllModeButtons();
        els.btnModeMixed.className = 'btn btn-primary';
        els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Kaç kelimeyle karma pratik istiyorsun?';
        els.countSelectors[0].parentElement.style.display = 'flex';
    });

    els.btnModeWarmup.addEventListener('click', () => {
        practiceMode = 'warmup';
        resetAllModeButtons();
        els.btnModeWarmup.className = 'btn btn-primary';
        els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Kaç kelimeyle ısınma yapmak istiyorsun?';
        els.countSelectors[0].parentElement.style.display = 'flex';
    });
    
    if (els.btnModeSpeaking) {
        els.btnModeSpeaking.addEventListener('click', () => {
            practiceMode = 'speaking';
            resetAllModeButtons();
            els.btnModeSpeaking.className = 'btn btn-primary';
            els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Sohbette kullanmak için kaç kelime istiyorsun?';
            els.countSelectors[0].parentElement.style.display = 'flex';
            if (els.speakingOptions) els.speakingOptions.style.display = 'block';
        });
    }

    // Speaking repeat count buttons
    document.querySelectorAll('.speaking-repeat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            speakingRepeatCount = parseInt(btn.dataset.repeat);
            document.querySelectorAll('.speaking-repeat-btn').forEach(b => b.className = 'btn btn-secondary btn-sm speaking-repeat-btn');
            btn.className = 'btn btn-primary btn-sm speaking-repeat-btn';
        });
    });
    
    // Combined card mode state
    let combinedGroupSize = 3;
    let combinedSPM = 1;

    // Scan mode state
    let scanPageSize = 20;

    function resetAllModeButtons() {
        els.btnModeRecall.className = 'btn btn-secondary';
        els.btnModeReading.className = 'btn btn-secondary';
        els.btnModeMixed.className = 'btn btn-secondary';
        els.btnModeWarmup.className = 'btn btn-secondary';
        if (els.btnModeSpeaking) els.btnModeSpeaking.className = 'btn btn-secondary';
        if (els.btnModeCombined) els.btnModeCombined.className = 'btn btn-secondary';
        if (els.btnModeScan) els.btnModeScan.className = 'btn btn-secondary';
        if (els.btnModeFlow) els.btnModeFlow.className = 'btn btn-secondary';
        if (els.btnModeShadowing) els.btnModeShadowing.className = 'btn btn-secondary';
        if (els.combinedOptions) els.combinedOptions.style.display = 'none';
        if (els.scanOptions) els.scanOptions.style.display = 'none';
        if (els.speakingOptions) els.speakingOptions.style.display = 'none';
        if (els.shadowingOptions) els.shadowingOptions.style.display = 'none';
    }

    // Shadowing mode handler
    if (els.btnModeShadowing) {
        els.btnModeShadowing.addEventListener('click', () => {
            practiceMode = 'shadowing';
            resetAllModeButtons();
            els.btnModeShadowing.className = 'btn btn-primary';
            els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Kaç cümle ile pratik yapmak istiyorsun?';
            els.countSelectors[0].parentElement.style.display = 'flex';
            if (els.shadowingOptions) els.shadowingOptions.style.display = 'block';
        });
    }

    // Shadowing group size buttons
    document.querySelectorAll('.shadowing-group-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            shadowingGroupSize = parseInt(btn.dataset.group);
            document.querySelectorAll('.shadowing-group-btn').forEach(b => b.className = 'btn btn-secondary btn-sm shadowing-group-btn');
            btn.className = 'btn btn-primary btn-sm shadowing-group-btn';
        });
    });

    // Shadowing control event listeners
    document.getElementById('shadowing-auto-speak')?.addEventListener('change', (e) => {
        shadowingAutoSpeak = e.target.checked;
    });
    document.querySelectorAll('.shadowing-timer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            shadowingTimerInterval = parseInt(btn.dataset.timer);
            document.querySelectorAll('.shadowing-timer-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    if (els.btnModeCombined) {
        els.btnModeCombined.addEventListener('click', () => {
            practiceMode = 'combined';
            resetAllModeButtons();
            els.btnModeCombined.className = 'btn btn-primary';
            els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Birleşik kartta her grup ayrı gösterilir.';
            els.countSelectors[0].parentElement.style.display = 'flex';
            if (els.combinedOptions) els.combinedOptions.style.display = 'block';
        });
    }

    if (els.btnModeScan) {
        els.btnModeScan.addEventListener('click', () => {
            practiceMode = 'scan';
            resetAllModeButtons();
            els.btnModeScan.className = 'btn btn-primary';
            els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Hızlı taramada kaç anlam işlemek istiyorsun?';
            els.countSelectors[0].parentElement.style.display = 'flex';
            if (els.scanOptions) els.scanOptions.style.display = 'block';
        });
    }

    if (els.btnModeFlow) {
        els.btnModeFlow.addEventListener('click', () => {
            practiceMode = 'flow';
            resetAllModeButtons();
            els.btnModeFlow.className = 'btn btn-primary';
            els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Akış modunda kaç anlam ile çalışmak istiyorsun?';
            els.countSelectors[0].parentElement.style.display = 'flex';
        });
    }

    // Group size buttons
    document.querySelectorAll('.combined-group-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            combinedGroupSize = parseInt(btn.dataset.size);
            document.querySelectorAll('.combined-group-btn').forEach(b => b.className = 'btn btn-secondary btn-sm combined-group-btn');
            btn.className = 'btn btn-primary btn-sm combined-group-btn';
        });
    });

    // Sentences per meaning buttons
    document.querySelectorAll('.combined-spm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            combinedSPM = parseInt(btn.dataset.spm);
            document.querySelectorAll('.combined-spm-btn').forEach(b => b.className = 'btn btn-secondary btn-sm combined-spm-btn');
            btn.className = 'btn btn-primary btn-sm combined-spm-btn';
        });
    });

    // Scan page size buttons
    document.querySelectorAll('.scan-page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            scanPageSize = parseInt(btn.dataset.pageSize);
            document.querySelectorAll('.scan-page-btn').forEach(b => b.className = 'btn btn-secondary btn-sm scan-page-btn');
            btn.className = 'btn btn-primary btn-sm scan-page-btn';
        });
    });
    
    els.btnWarmupNext.addEventListener('click', () => {
        loadNextCard();
    });

    els.btnReadingNext.addEventListener('click', () => {
        if (!isReviewingHistory) {
            showXP(5, false); // Reading flat XP
        }
        if (practiceMode === 'mixed' && currentSession instanceof SessionManager && !isReviewingHistory) {
            currentSession.handleAnswer(true);
        }
        loadNextCard();
    });

    if (els.btnSpeakingNext) {
        els.btnSpeakingNext.addEventListener('click', () => {
            loadNextCard();
        });
    }

    if (els.btnCombinedWarmupNext) {
        els.btnCombinedWarmupNext.addEventListener('click', () => {
            loadNextCard();
        });
    }
    if (els.btnCombinedNext) {
        els.btnCombinedNext.addEventListener('click', () => {
            loadNextCard();
        });
    }

    els.btnGoBack.addEventListener('click', () => {
        if (goBackHistory.length < 2) return;
        
        // Remove current card from history
        const currentData = goBackHistory.pop();
        if (currentSession.currentCard) {
            // Push it back to queue so it can be answered again
            currentSession.mainQueue.unshift(currentSession.currentCard);
            currentSession.position--;
        }

        // Get previous card (leave it in history)
        const prevData = goBackHistory[goBackHistory.length - 1];
        
        // Sync internal pointer so inline actions target the correct historical card
        if (currentSession) {
            currentSession.currentCard = prevData.card;
        }

        isReviewingHistory = true;
        els.btnGoBack.style.display = goBackHistory.length > 1 ? 'inline-flex' : 'none';
        
        if (prevData.mode === 'warmup') {
            currentCardMode = 'warmup';
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            els.phaseReading.style.display = 'none';
            
            els.warmupWord.textContent = prevData.card.word;
            els.warmupMeanings.innerHTML = '';
            prevData.card.meanings.forEach(meaning => {
                const div = document.createElement('div');
                div.style.background = 'rgba(249, 115, 22, 0.1)';
                div.style.color = '#f97316';
                div.style.padding = '12px 24px';
                div.style.borderRadius = '12px';
                div.style.border = '1px solid rgba(249, 115, 22, 0.2)';
                div.style.fontSize = '1.1rem';
                div.style.fontWeight = '500';
                div.textContent = meaning;
                els.warmupMeanings.appendChild(div);
            });
            
            els.phaseWarmup.style.display = 'flex';
            els.btnWarmupNext.focus();
        } else if (prevData.mode === 'reading') {
            currentCardMode = 'reading';
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            els.phaseWarmup.style.display = 'none';
            
            const parts = prevData.card.sentence.sentence.split('___');
            els.readingSentence.innerHTML = parts[0] + `<strong style="color:var(--accent-purple-light)">${prevData.card.sentence.answer}</strong>` + (parts[1] || '');
            els.readingTurkish.textContent = prevData.card.sentence.turkish;
            els.readingHint.textContent = prevData.card.sentence.hint;
            
            // Populate Comparison inline badge
            els.readingCompareOriginal.textContent = prevData.card.word;
            els.readingCompareAnswer.textContent = prevData.card.sentence.answer;
            
            els.retryIndicator.style.display = 'none';
            els.phaseReading.style.display = 'block';
            els.btnReadingNext.focus();
        } else {
            currentCardMode = 'recall';
            els.phaseWarmup.style.display = 'none';
            showResultPhase(prevData.result || {
                word: prevData.card.word,
                isCorrect: false,
                correctAnswer: prevData.card.sentence.answer,
                fullSentence: prevData.card.sentence.sentence,
                turkishTranslation: prevData.card.sentence.turkish
            }, true);
        }
    });

    els.btnQuitSession.addEventListener('click', () => {
        clearFlowTimers();
        if(confirm('Oturumu kaydet ve sonra devam et?')) {
            saveSessionState();
            els.practiceActive.style.display = 'none';
            els.practiceSetup.style.display = 'block';
            currentSession = null;
        }
    });

    els.btnStartSession.addEventListener('click', async () => {
        els.btnStartSession.disabled = true;
        els.btnStartSession.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Hazırlanıyor...';
        
        try {
        const readyMeaningsMap = new Map();
        
        // Get words to practice based on source selection
        let wordsToUse = allWords;
        if (practiceSource === 'category') {
            const checkedBoxes = document.querySelectorAll('.practice-cat-check:checked');
            const selectedCatIds = [...checkedBoxes].map(c => Number(c.value));
            if (selectedCatIds.length > 0) {
                const wordSets = await Promise.all(selectedCatIds.map(id => DB.getWordsInCategory(id)));
                const mergedWords = new Set();
                wordSets.forEach(ws => ws.forEach(w => mergedWords.add(w)));
                wordsToUse = allWords.filter(w => mergedWords.has(w.word));
            }
        }
        
        // Batch load ALL sentences and meanings in just 2 queries (instead of 24K+)
        const allSentencesGrouped = await DB.getAllSentencesGrouped();
        const allMeaningsMap = await DB.getAllMeaningsGrouped();
        
        for (const w of wordsToUse) {
            const word = w.word;
            const sentences = allSentencesGrouped[word] || [];
            const wordMeanings = allMeaningsMap[word] || [];
            
            // Group sentences by meaningId
            const meaningGroups = {};
            sentences.forEach(s => {
                const mId = s.meaningId || `uncategorized_${word}`;
                if (!meaningGroups[mId]) meaningGroups[mId] = [];
                
                // Embed the English dictionary definition for Hints
                let meaningData = wordMeanings.find(m => m.id.toString() === mId.toString());
                if (!meaningData && wordMeanings.length > 0) meaningData = wordMeanings[0];
                s.englishDefinition = meaningData ? meaningData.definition : "Anlam bulunamadı";
                s.turkishDefinition = meaningData ? meaningData.turkishDefinition : null;
                
                meaningGroups[mId].push(s);
            });

            // Only include meanings that have at least 1 sentence
            for (const [mId, sList] of Object.entries(meaningGroups)) {
                if (sList.length >= 1) {
                    readyMeaningsMap.set(mId, sList);
                }
            }
        }

        if (readyMeaningsMap.size === 0) {
            showToast(`Pratik yapmak için cümlesi olan hiçbir kelime bulunamadı. Lütfen önce "Eksikleri Üret" butonunu kullanın.`, 'error');
            return;
        }

        // Apply limit based on meanings, not base words
        let meaningsToUse = Array.from(readyMeaningsMap.entries());
        
        // Shuffle all valid meanings first
        for (let i = meaningsToUse.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [meaningsToUse[i], meaningsToUse[j]] = [meaningsToUse[j], meaningsToUse[i]];
        }

        if (selectedWordCount !== 'all') {
            const limit = parseInt(selectedWordCount);
            if (meaningsToUse.length > limit) {
                meaningsToUse = meaningsToUse.slice(0, limit);
            }
        }

        const filteredMap = new Map(meaningsToUse);

        // Init Session Manager based on mode
        if (practiceMode === 'reading') {
            currentSession = new ReadingSessionManager(filteredMap, 1);
        } else if (practiceMode === 'mixed') {
            currentSession = new SessionManager(filteredMap, 1);
        } else if (practiceMode === 'warmup') {
            currentSession = new WarmUpSessionManager(filteredMap, 1);
        } else if (practiceMode === 'speaking') {
            currentSession = new SpeakingSessionManager([...filteredMap.keys()], filteredMap, speakingRepeatCount);
        } else if (practiceMode === 'combined') {
            currentSession = new CombinedCardSessionManager(filteredMap, combinedGroupSize, combinedSPM);
        } else if (practiceMode === 'scan') {
            currentSession = new ScanSessionManager(filteredMap, scanPageSize);
        } else if (practiceMode === 'flow') {
            currentSession = new FlowSessionManager(filteredMap);
        } else if (practiceMode === 'shadowing') {
            currentSession = new ShadowingSessionManager(filteredMap, shadowingGroupSize);
        } else {
            currentSession = new SessionManager(filteredMap, 1);
        }
        
        resetGamification();
        
        // UI Reset
        els.practiceSetup.style.display = 'none';
        els.practiceComplete.style.display = 'none';
        els.practiceActive.style.display = 'block';
        
        const prog = currentSession.getProgress();
        els.progTotal.textContent = prog.totalWords;

        loadNextCard();
        } finally {
            els.btnStartSession.disabled = false;
            els.btnStartSession.innerHTML = 'Oturumu Başlat <i class="fa-solid fa-arrow-right"></i>';
        }
    });

    function updateProgressUI() {
        const prog = currentSession.getProgress();
        let displayCurrent = 1;
        
        if (practiceMode === 'reading' || practiceMode === 'warmup' || practiceMode === 'speaking' || practiceMode === 'combined' || practiceMode === 'scan' || practiceMode === 'flow' || practiceMode === 'shadowing') {
            displayCurrent = prog.stats.correct || 1;
        } else {
            const retries = currentSession.retryInserts ? currentSession.retryInserts.length : 0;
            displayCurrent = (currentSession.stats.total - currentSession.mainQueue.length - retries);
            if (displayCurrent < 1) displayCurrent = 1;
        }
        
        els.progCurrent.textContent = displayCurrent;
        if (displayCurrent > prog.totalWords && prog.totalWords > 0) {
           els.progCurrent.textContent = prog.totalWords; 
        }

        els.progCorrect.textContent = prog.stats.correct;
        els.progIncorrect.textContent = prog.stats.incorrect;
        els.progFill.style.width = `${prog.percentage}%`;
    }

    function loadNextCard() {
        if (!currentSession) return;
        
        let card;
        if (isReviewingHistory) {
            isReviewingHistory = false;
        }
        
        card = currentSession.getNextCard();
        
        if (!card) {
            // Session Complete
            finishSessionUI();
            return;
        }

        updateProgressUI();
        saveSessionState();

        currentCardMode = practiceMode;
        if (practiceMode === 'mixed') {
            currentCardMode = Math.random() > 0.5 ? 'recall' : 'reading';
        }
        
        if (!isReviewingHistory) {
            goBackHistory.push({ card, mode: currentCardMode, result: null });
            if (goBackHistory.length > 20) goBackHistory.shift();
        }
        
        els.btnGoBack.style.display = goBackHistory.length > 1 ? 'inline-flex' : 'none';
        cardStartTime = Date.now();

        // Reset container width (speaking mode will override to 1200px)
        els.practiceActive.style.maxWidth = '800px';

        if (currentCardMode === 'warmup') {
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            els.phaseReading.style.display = 'none';
            if (els.phaseSpeaking) els.phaseSpeaking.style.display = 'none';
            if (els.phaseCombinedWarmup) els.phaseCombinedWarmup.style.display = 'none';
            if (els.phaseCombined) els.phaseCombined.style.display = 'none';
            if (els.phaseScan) els.phaseScan.style.display = 'none';
            if (els.phaseShadowing) els.phaseShadowing.style.display = 'none';
            
            els.warmupWord.textContent = card.word;
            
            // Render meanings
            els.warmupMeanings.innerHTML = '';
            card.meanings.forEach(meaning => {
                const div = document.createElement('div');
                div.style.background = 'rgba(249, 115, 22, 0.1)';
                div.style.color = '#f97316'; // orange-500
                div.style.padding = '12px 24px';
                div.style.borderRadius = '12px';
                div.style.border = '1px solid rgba(249, 115, 22, 0.2)';
                div.style.fontSize = '1.1rem';
                div.style.fontWeight = '500';
                div.textContent = meaning;
                els.warmupMeanings.appendChild(div);
            });
            
            els.phaseWarmup.style.display = 'flex';
            els.btnWarmupNext.focus();
            return;
        }

        if (currentCardMode === 'reading') {
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            if (els.phaseSpeaking) els.phaseSpeaking.style.display = 'none';
            if (els.phaseCombinedWarmup) els.phaseCombinedWarmup.style.display = 'none';
            if (els.phaseCombined) els.phaseCombined.style.display = 'none';
            if (els.phaseScan) els.phaseScan.style.display = 'none';
            if (els.phaseShadowing) els.phaseShadowing.style.display = 'none';
            
            // Prepare reading card
            const parts = card.sentence.sentence.split('___');
            // Ensure proper spacing when joining parts
            els.readingSentence.innerHTML = parts[0] + `<strong style="color:var(--accent-purple-light)">${card.sentence.answer}</strong>` + (parts[1] || '');
            els.readingTurkish.textContent = card.sentence.turkish;
            els.readingHint.textContent = card.sentence.hint;
            
            // Show English Definition
            if (card.sentence.englishDefinition && card.sentence.englishDefinition !== "Anlam bulunamadı") {
                els.readingEnglishText.textContent = card.sentence.englishDefinition;
                els.readingEnglishDef.style.display = 'block';
            } else {
                els.readingEnglishDef.style.display = 'none';
            }
            
            // Populate Comparison inline badge
            els.readingCompareOriginal.textContent = card.word;
            els.readingCompareAnswer.textContent = card.sentence.answer;
            
            els.retryIndicator.style.display = 'none';
            els.phaseReading.style.display = 'block';
            els.btnReadingNext.focus();
            return;
        }

        if (currentCardMode === 'speaking') {
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            els.phaseReading.style.display = 'none';
            els.phaseWarmup.style.display = 'none';
            if (els.phaseCombinedWarmup) els.phaseCombinedWarmup.style.display = 'none';
            if (els.phaseCombined) els.phaseCombined.style.display = 'none';
            if (els.phaseScan) els.phaseScan.style.display = 'none';
            if (els.phaseShadowing) els.phaseShadowing.style.display = 'none';
            
            // Expand container for speaking mode
            els.practiceActive.style.maxWidth = '1400px';
            
            if (els.speakingWordsContainer) {
                els.speakingWordsContainer.innerHTML = '';
                els.speakingWordsContainer.className = 'speaking-grid';
                
                // card is an array of up to 3 cards for speaking mode
                card.forEach((c, index) => {
                    const safeWord = c.word.replace(/'/g, "\\'");
                    const meaningId = c.meaningId;
                    
                    // TR definition section with delete/regenerate
                    let trDefHtml = '';
                    if (c.turkishDefinition) {
                        trDefHtml = `<div class="speaking-tr-def" data-card-idx="${index}">
                            <span>🇹🇷 ${c.turkishDefinition}</span>
                            <button class="speaking-tr-del" data-card-idx="${index}" data-meaning-id="${meaningId}" title="TR çeviriyi sil">✕</button>
                        </div>`;
                    } else {
                        trDefHtml = `<div class="speaking-tr-actions" data-card-idx="${index}">
                            <button class="speaking-tr-gen" data-card-idx="${index}" data-meaning-id="${meaningId}" data-word="${safeWord}" title="Türkçe çeviri üret">
                                <i class="fa-solid fa-language"></i> 🇹🇷 Çeviri Üret
                            </button>
                        </div>`;
                    }
                    
                    // EN definition
                    const enDefHtml = c.englishDefinition && c.englishDefinition !== "Anlam bulunamadı"
                        ? `<div class="speaking-en-def">🇬🇧 ${c.englishDefinition}</div>`
                        : '';

                    const cardHtml = `<div class="speaking-card" data-card-idx="${index}">
                        <div class="speaking-card-header">
                            <h3 class="speaking-card-word">${c.word}</h3>
                            <button onclick="speakWord('${safeWord}')" class="speaking-audio-btn" title="Seslendir">🔊</button>
                        </div>
                        ${trDefHtml}
                        ${enDefHtml}
                        <button class="speaking-details-toggle" data-card-idx="${index}">
                            <i class="fa-solid fa-chevron-down"></i> Detayları Göster
                        </button>
                        <div class="speaking-details-panel" id="speaking-details-${index}" style="display:none;">
                            <div class="speaking-detail-sentence" id="speaking-sentence-${index}">
                                <span class="speaking-detail-label">Cümle:</span>
                                <span class="speaking-detail-text" id="speaking-sentence-text-${index}">Yükleniyor...</span>
                            </div>
                            <div class="speaking-detail-turkish" id="speaking-turkish-${index}">
                                <span class="speaking-detail-label">Türkçe:</span>
                                <span class="speaking-detail-text" id="speaking-turkish-text-${index}"></span>
                            </div>
                            <div class="speaking-detail-hint" id="speaking-hint-${index}">
                                <span class="speaking-detail-label">İpucu:</span>
                                <span class="speaking-detail-text" id="speaking-hint-text-${index}"></span>
                            </div>
                            <button class="speaking-shuffle-btn" data-card-idx="${index}" data-meaning-id="${meaningId}">
                                <i class="fa-solid fa-shuffle"></i> Başka Cümle
                            </button>
                        </div>
                    </div>`;
                    els.speakingWordsContainer.insertAdjacentHTML('beforeend', cardHtml);
                });
                
                // --- Attach Speaking Card Event Handlers ---
                
                // Details toggle
                els.speakingWordsContainer.querySelectorAll('.speaking-details-toggle').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idx = btn.dataset.cardIdx;
                        const panel = document.getElementById(`speaking-details-${idx}`);
                        const isOpen = panel.style.display !== 'none';
                        
                        if (isOpen) {
                            panel.style.display = 'none';
                            btn.innerHTML = '<i class="fa-solid fa-chevron-down"></i> Detayları Göster';
                        } else {
                            panel.style.display = 'block';
                            btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Detayları Gizle';
                            
                            // Load a random sentence for this meaning
                            const c = card[idx];
                            const sentences = currentSession.meaningSentences.get(c.meaningId) || [];
                            if (sentences.length > 0) {
                                const randSentence = sentences[Math.floor(Math.random() * sentences.length)];
                                const parts = randSentence.sentence.split('___');
                                const fullSentence = parts[0] + randSentence.answer + (parts[1] || '');
                                document.getElementById(`speaking-sentence-text-${idx}`).textContent = fullSentence;
                                document.getElementById(`speaking-turkish-text-${idx}`).textContent = randSentence.turkish || '';
                                document.getElementById(`speaking-hint-text-${idx}`).textContent = randSentence.hint || '';
                            } else {
                                document.getElementById(`speaking-sentence-text-${idx}`).textContent = 'Bu anlam için cümle bulunamadı.';
                            }
                        }
                    });
                });
                
                // Shuffle sentence button
                els.speakingWordsContainer.querySelectorAll('.speaking-shuffle-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idx = btn.dataset.cardIdx;
                        const meaningId = btn.dataset.meaningId;
                        const sentences = currentSession.meaningSentences.get(meaningId) || [];
                        if (sentences.length > 0) {
                            const randSentence = sentences[Math.floor(Math.random() * sentences.length)];
                            const parts = randSentence.sentence.split('___');
                            const fullSentence = parts[0] + randSentence.answer + (parts[1] || '');
                            document.getElementById(`speaking-sentence-text-${idx}`).textContent = fullSentence;
                            document.getElementById(`speaking-turkish-text-${idx}`).textContent = randSentence.turkish || '';
                            document.getElementById(`speaking-hint-text-${idx}`).textContent = randSentence.hint || '';
                        }
                    });
                });
                
                // TR Delete button
                els.speakingWordsContainer.querySelectorAll('.speaking-tr-del').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const idx = btn.dataset.cardIdx;
                        const meaningId = Number(btn.dataset.meaningId);
                        try {
                            await DB.updateMeaning(meaningId, { turkishDefinition: null });
                            showToast('TR çeviri silindi.', 'info');
                            // Update the card data
                            card[idx].turkishDefinition = null;
                            // Re-render just the TR section
                            const cardEl = els.speakingWordsContainer.querySelector(`.speaking-card[data-card-idx="${idx}"]`);
                            const trDefEl = cardEl.querySelector('.speaking-tr-def');
                            if (trDefEl) {
                                const safeWord = card[idx].word.replace(/'/g, "\\'");
                                trDefEl.outerHTML = `<div class="speaking-tr-actions" data-card-idx="${idx}">
                                    <button class="speaking-tr-gen" data-card-idx="${idx}" data-meaning-id="${meaningId}" data-word="${safeWord}" title="Türkçe çeviri üret">
                                        <i class="fa-solid fa-language"></i> 🇹🇷 Çeviri Üret
                                    </button>
                                </div>`;
                                // Re-attach gen handler
                                cardEl.querySelector('.speaking-tr-gen')?.addEventListener('click', handleSpeakingTrGen);
                            }
                        } catch (err) {
                            showToast('Silme hatası: ' + err.message, 'error');
                        }
                    });
                });
                
                // TR Generate button handler
                async function handleSpeakingTrGen(e) {
                    const btn = e.currentTarget;
                    const idx = btn.dataset.cardIdx;
                    const meaningId = Number(btn.dataset.meaningId);
                    const word = btn.dataset.word;
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Üretiliyor...';
                    try {
                        const meanings = await DB.getMeaningsForWord(word);
                        const meaning = meanings.find(m => m.id === meaningId);
                        if (!meaning) throw new Error('Anlam bulunamadı');
                        const turkishDef = await GeminiService.translateDefinition(word, meaning.definition);
                        await DB.updateMeaning(meaningId, { turkishDefinition: turkishDef });
                        showToast('TR çeviri üretildi!', 'success');
                        // Update card data
                        card[idx].turkishDefinition = turkishDef;
                        // Re-render TR section
                        const cardEl = els.speakingWordsContainer.querySelector(`.speaking-card[data-card-idx="${idx}"]`);
                        const trActionsEl = cardEl.querySelector('.speaking-tr-actions');
                        if (trActionsEl) {
                            trActionsEl.outerHTML = `<div class="speaking-tr-def" data-card-idx="${idx}">
                                <span>🇹🇷 ${turkishDef}</span>
                                <button class="speaking-tr-del" data-card-idx="${idx}" data-meaning-id="${meaningId}" title="TR çeviriyi sil">✕</button>
                            </div>`;
                            // Re-attach delete handler
                            cardEl.querySelector('.speaking-tr-del')?.addEventListener('click', async function() {
                                try {
                                    await DB.updateMeaning(meaningId, { turkishDefinition: null });
                                    showToast('TR çeviri silindi.', 'info');
                                    card[idx].turkishDefinition = null;
                                    const safeWord = card[idx].word.replace(/'/g, "\\'");
                                    this.closest('.speaking-tr-def').outerHTML = `<div class="speaking-tr-actions" data-card-idx="${idx}">
                                        <button class="speaking-tr-gen" data-card-idx="${idx}" data-meaning-id="${meaningId}" data-word="${safeWord}" title="Türkçe çeviri üret">
                                            <i class="fa-solid fa-language"></i> 🇹🇷 Çeviri Üret
                                        </button>
                                    </div>`;
                                    cardEl.querySelector('.speaking-tr-gen')?.addEventListener('click', handleSpeakingTrGen);
                                } catch (err) {
                                    showToast('Silme hatası: ' + err.message, 'error');
                                }
                            });
                        }
                    } catch (err) {
                        // On failure, offer manual input
                        const manualInput = prompt(`"${word}" için AI çeviri başarısız oldu.\nEl ile Türkçe çeviri girin:`);
                        if (manualInput && manualInput.trim()) {
                            await DB.updateMeaning(meaningId, { turkishDefinition: manualInput.trim() });
                            showToast('TR çeviri eklendi (el ile)!', 'success');
                            card[idx].turkishDefinition = manualInput.trim();
                            const cardEl = els.speakingWordsContainer.querySelector(`.speaking-card[data-card-idx="${idx}"]`);
                            const trActionsEl = cardEl.querySelector('.speaking-tr-actions');
                            if (trActionsEl) {
                                trActionsEl.outerHTML = `<div class="speaking-tr-def" data-card-idx="${idx}">
                                    <span>🇹🇷 ${manualInput.trim()}</span>
                                    <button class="speaking-tr-del" data-card-idx="${idx}" data-meaning-id="${meaningId}" title="TR çeviriyi sil">✕</button>
                                </div>`;
                            }
                        } else {
                            showToast('Çeviri hatası: ' + err.message, 'error');
                            btn.disabled = false;
                            btn.innerHTML = '<i class="fa-solid fa-language"></i> 🇹🇷 Çeviri Üret';
                        }
                    }
                }
                
                els.speakingWordsContainer.querySelectorAll('.speaking-tr-gen').forEach(btn => {
                    btn.addEventListener('click', handleSpeakingTrGen);
                });
            }

            if (els.phaseSpeaking) els.phaseSpeaking.style.display = 'block';
            if (els.btnSpeakingNext) els.btnSpeakingNext.focus();
            return;
        }

        // ═══ SHADOWING MODE ═══
        if (currentCardMode === 'shadowing') {
            // Hide all other phases
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            els.phaseReading.style.display = 'none';
            els.phaseWarmup.style.display = 'none';
            if (els.phaseSpeaking) els.phaseSpeaking.style.display = 'none';
            if (els.phaseCombinedWarmup) els.phaseCombinedWarmup.style.display = 'none';
            if (els.phaseCombined) els.phaseCombined.style.display = 'none';
            if (els.phaseScan) els.phaseScan.style.display = 'none';
            if (els.phaseShadowing) els.phaseShadowing.style.display = 'none';

            // Container width
            els.practiceActive.style.maxWidth = '900px';

            // Clear timer & TTS
            if (shadowingTimerHandle) { clearTimeout(shadowingTimerHandle); shadowingTimerHandle = null; }
            _cancelEdgeTTS();
            if (window.speechSynthesis) speechSynthesis.cancel();

            // card is an array of items (grouped)
            const items = card;

            // Build full text for TTS (replace ___ with answer word)
            function getShadowingFullText() {
                return items.map(function(it) {
                    var answer = it.sentence.answer || it.word;
                    return (it.sentence.sentence || '').replace(/___/g, answer);
                }).join('. ');
            }

            // Render all sentences with highlighted clickable words
            function renderShadowingGrouped() {
                let html = '';
                items.forEach((item, idx) => {
                    const sentence = item.sentence;
                    const answer = sentence.answer || item.word;
                    let sentenceText = sentence.sentence || '';
                    
                    // Replace ___ with highlighted answer word
                    const highlightSpan = '<span class="shadowing-highlight" data-idx="' + idx + '">' + answer + '</span>';
                    let highlighted = sentenceText.replace(/___/g, highlightSpan);
                    
                    // Also highlight any other occurrences of the word
                    if (!sentenceText.includes('___')) {
                        const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp('\\b(' + escaped + ')\\b', 'gi');
                        highlighted = sentenceText.replace(regex, 
                            '<span class="shadowing-highlight" data-idx="' + idx + '">$1</span>'
                        );
                    }
                    
                    html += '<div class="shadowing-sentence-line" data-idx="' + idx + '">' + highlighted + '</div>';
                });
                els.shadowingSentences.innerHTML = html;

                // Click handler for highlighted words -> show popup
                els.shadowingSentences.querySelectorAll('.shadowing-highlight').forEach(function(el) {
                    el.addEventListener('click', function(e) {
                        e.stopPropagation();
                        var idx = parseInt(el.dataset.idx);
                        var item = items[idx];
                        if (!item) return;
                        
                        document.getElementById('shadowing-pop-word').textContent = item.word || '';
                        document.getElementById('shadowing-pop-hint').textContent = item.sentence.hint || '';
                        document.getElementById('shadowing-pop-en').textContent = item.englishDefinition || '';
                        document.getElementById('shadowing-pop-tr').textContent = item.turkishDefinition || '—';
                        document.getElementById('shadowing-pop-sentence-tr').textContent = item.sentence.turkish || '—';
                        
                        els.shadowingPopupOverlay.style.display = 'flex';
                    });
                });
            }
            renderShadowingGrouped();

            // Popup close handlers
            els.shadowingPopupClose.onclick = function() {
                els.shadowingPopupOverlay.style.display = 'none';
            };
            els.shadowingPopupOverlay.onclick = function(e) {
                if (e.target === els.shadowingPopupOverlay) {
                    els.shadowingPopupOverlay.style.display = 'none';
                }
            };

            // Auto-speak with repeat-after-speech
            function doShadowingSpeak() {
                var text = getShadowingFullText();
                if (!text) return;
                speakSentence(text, 0.85, function() {
                    if (shadowingTimerInterval > 0) {
                        shadowingTimerHandle = setTimeout(function() {
                            doShadowingSpeak();
                        }, shadowingTimerInterval * 1000);
                    }
                });
            }

            if (shadowingAutoSpeak) {
                setTimeout(function() { doShadowingSpeak(); }, 300);
            }

            // Speak button
            els.btnShadowingSpeak.onclick = function() {
                if (shadowingTimerHandle) { clearTimeout(shadowingTimerHandle); shadowingTimerHandle = null; }
                doShadowingSpeak();
            };

            // Shuffle all sentences
            els.btnShadowingShuffle.onclick = function() {
                var anyShuffled = false;
                items.forEach(function(_, idx) {
                    if (currentSession && currentSession.shuffleSentenceAt) {
                        if (currentSession.shuffleSentenceAt(idx)) anyShuffled = true;
                    }
                });
                if (anyShuffled) {
                    renderShadowingGrouped();
                    if (shadowingAutoSpeak) {
                        if (shadowingTimerHandle) { clearTimeout(shadowingTimerHandle); shadowingTimerHandle = null; }
                        doShadowingSpeak();
                    }
                } else {
                    showToast('Ba\u015fka c\u00fcmle bulunamad\u0131.', 'info');
                }
            };

            // Next button
            els.btnShadowingNext.onclick = function() {
                if (shadowingTimerHandle) { clearTimeout(shadowingTimerHandle); shadowingTimerHandle = null; }
                _cancelEdgeTTS();
                if (window.speechSynthesis) speechSynthesis.cancel();
                loadNextCard();
            };

            if (els.phaseShadowing) els.phaseShadowing.style.display = 'block';
            return;
        }







        if (card.type === 'warmup' && practiceMode === 'combined') {
            // Combined warmup phase
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            els.phaseReading.style.display = 'none';
            els.phaseWarmup.style.display = 'none';
            if (els.phaseSpeaking) els.phaseSpeaking.style.display = 'none';
            if (els.phaseCombined) els.phaseCombined.style.display = 'none';
            if (els.phaseScan) els.phaseScan.style.display = 'none';
            if (els.phaseShadowing) els.phaseShadowing.style.display = 'none';
            
            els.combinedWarmupWord.textContent = card.word;
            els.combinedWarmupHint.textContent = card.hint || '';
            els.combinedWarmupEn.textContent = card.englishDefinition || '';
            
            els.retryIndicator.style.display = 'none';
            els.phaseCombinedWarmup.style.display = 'block';
            els.btnCombinedWarmupNext.focus();
            return;
        }

        if (card.type === 'combined' && practiceMode === 'combined') {
            // Combined card phase — multiple sentences together
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            els.phaseReading.style.display = 'none';
            els.phaseWarmup.style.display = 'none';
            if (els.phaseSpeaking) els.phaseSpeaking.style.display = 'none';
            if (els.phaseCombinedWarmup) els.phaseCombinedWarmup.style.display = 'none';
            if (els.phaseScan) els.phaseScan.style.display = 'none';
            if (els.phaseShadowing) els.phaseShadowing.style.display = 'none';
            
            els.combinedSentencesContainer.innerHTML = '';
            
            card.items.forEach((item, idx) => {
                const row = document.createElement('div');
                row.className = 'combined-sentence-row';
                
                // Build sentence with highlighted word
                const sentenceText = item.sentence.sentence || '';
                const parts = sentenceText.split('___');
                const answer = item.sentence.answer || item.word;
                const fullSentence = parts[0] + answer + (parts[1] || '');
                
                const sentenceHtml = parts[0] + 
                    `<span class="combined-highlight" data-idx="${idx}">${answer}</span>` + 
                    (parts[1] || '');
                
                row.innerHTML = `
                    <div class="combined-sentence-text">${sentenceHtml}</div>
                    <div class="combined-mini-hint" id="combined-hint-${idx}">${item.hint || ''}</div>
                    <button class="combined-detail-btn" id="combined-detail-btn-${idx}">Detaylı Göster ▼</button>
                    <div class="combined-detail-panel" id="combined-detail-${idx}">
                        <div class="detail-row">
                            <span class="detail-label">TR Cümle</span>
                            <span class="detail-value">${item.sentence.turkish || ''}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">EN Tanım</span>
                            <span class="detail-value">${item.englishDefinition || ''}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Kelime</span>
                            <span class="detail-value">${item.word} → ${answer}</span>
                        </div>
                        <div class="detail-actions">
                            <button class="btn-detail-action btn-change-sentence" data-idx="${idx}" data-meaning-id="${item.meaningId}" data-current-id="${item.sentence.id}">🔄 Cümle Değiştir</button>
                            <button class="btn-detail-action danger btn-delete-sentence" data-idx="${idx}" data-sentence-id="${item.sentence.id}">🗑️ Cümle Sil</button>
                        </div>
                    </div>
                `;
                
                els.combinedSentencesContainer.appendChild(row);
            });
            
            // Attach click handlers for highlights
            els.combinedSentencesContainer.querySelectorAll('.combined-highlight').forEach(hl => {
                hl.addEventListener('click', () => {
                    const idx = hl.dataset.idx;
                    const hint = document.getElementById(`combined-hint-${idx}`);
                    const detailBtn = document.getElementById(`combined-detail-btn-${idx}`);
                    const detail = document.getElementById(`combined-detail-${idx}`);
                    
                    if (hl.classList.contains('active')) {
                        // Close everything
                        hl.classList.remove('active');
                        hint.classList.remove('visible');
                        detailBtn.style.display = 'none';
                        detail.classList.remove('visible');
                    } else {
                        // Open compact hint
                        hl.classList.add('active');
                        hint.classList.add('visible');
                        detailBtn.style.display = 'inline-block';
                    }
                });
            });
            
            // Detail panel toggle
            els.combinedSentencesContainer.querySelectorAll('.combined-detail-btn').forEach(btn => {
                btn.style.display = 'none';
                btn.addEventListener('click', () => {
                    const idx = btn.id.replace('combined-detail-btn-', '');
                    const panel = document.getElementById(`combined-detail-${idx}`);
                    if (panel.classList.contains('visible')) {
                        panel.classList.remove('visible');
                        btn.textContent = 'Detaylı Göster ▼';
                    } else {
                        panel.classList.add('visible');
                        btn.textContent = 'Detayı Gizle ▲';
                    }
                });
            });
            
            // Change sentence handler
            els.combinedSentencesContainer.querySelectorAll('.btn-change-sentence').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const idx = parseInt(btn.dataset.idx);
                    const meaningId = btn.dataset.meaningId;
                    const currentId = parseInt(btn.dataset.currentId);
                    try {
                        const allSentences = await DB.getSentencesForMeaning(meaningId);
                        const other = allSentences.filter(s => s.id !== currentId);
                        if (other.length === 0) {
                            showToast('Bu anlam için başka cümle yok.', 'info');
                            return;
                        }
                        const newSentence = other[Math.floor(Math.random() * other.length)];
                        currentSession.replaceSentence(idx, newSentence);
                        // Push current card back to re-render with updated sentence
                        currentSession.mainQueue.unshift(currentSession.currentCard);
                        currentSession.position--;
                        loadNextCard();
                    } catch (e) {
                        showToast('Cümle değiştirme hatası.', 'error');
                    }
                });
            });
            
            // Delete sentence handler
            els.combinedSentencesContainer.querySelectorAll('.btn-delete-sentence').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const sentenceId = parseInt(btn.dataset.sentenceId);
                    if (confirm('Bu cümleyi silmek istediğinize emin misiniz?')) {
                        try {
                            await DB.deleteSentenceById(sentenceId);
                            showToast('Cümle silindi.', 'success');
                            const idx = parseInt(btn.dataset.idx);
                            // Remove this row from UI
                            btn.closest('.combined-sentence-row').remove();
                        } catch (e) {
                            showToast('Silme hatası.', 'error');
                        }
                    }
                });
            });
            
            els.retryIndicator.style.display = 'none';
            els.phaseCombined.style.display = 'block';
            els.btnCombinedNext.focus();
            return;
        }

        // ─── Flow Mode ────────────────────────────────────────
        if (practiceMode === 'flow') {
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            els.phaseReading.style.display = 'none';
            els.phaseWarmup.style.display = 'none';
            if (els.phaseSpeaking) els.phaseSpeaking.style.display = 'none';
            if (els.phaseCombinedWarmup) els.phaseCombinedWarmup.style.display = 'none';
            if (els.phaseCombined) els.phaseCombined.style.display = 'none';
            if (els.phaseScan) els.phaseScan.style.display = 'none';
            if (els.phaseShadowing) els.phaseShadowing.style.display = 'none';
            if (els.phaseFlow) els.phaseFlow.style.display = 'block';

            renderFlowCard(card);
            return;
        }

        // ─── Scan Mode ────────────────────────────────────────
        if (card.type === 'scan-page' && practiceMode === 'scan') {
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            els.phaseReading.style.display = 'none';
            els.phaseWarmup.style.display = 'none';
            if (els.phaseSpeaking) els.phaseSpeaking.style.display = 'none';
            if (els.phaseCombinedWarmup) els.phaseCombinedWarmup.style.display = 'none';
            if (els.phaseCombined) els.phaseCombined.style.display = 'none';
            if (els.phaseFlow) els.phaseFlow.style.display = 'none';
            
            renderScanPage(card);
            return;
        }

        // Active Recall Mode
        els.phaseReading.style.display = 'none';
        els.phaseWarmup.style.display = 'none';
        if (els.phaseSpeaking) els.phaseSpeaking.style.display = 'none';
        if (els.phaseCombinedWarmup) els.phaseCombinedWarmup.style.display = 'none';
        if (els.phaseCombined) els.phaseCombined.style.display = 'none';
        if (els.phaseScan) els.phaseScan.style.display = 'none';
        if (els.phaseFlow) els.phaseFlow.style.display = 'none';

        // Check if retry
        const state = currentSession.wordState.get(card.cardKey);
        if (state.needsConfirmation) {
            els.retryIndicator.style.display = 'inline-flex';
        } else {
            els.retryIndicator.style.display = 'none';
        }

        // Render Card
        const parts = card.sentence.sentence.split('___');
        const badge = `<span style="background: rgba(var(--accent-purple-rgb), 0.2); color: var(--accent-purple-light); font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--accent-purple-darker); vertical-align: middle; margin-right: 8px;" title="Yapay Zeka"><i class="fa-solid fa-robot"></i> AI</span>`;
        els.fcSentence.innerHTML = badge + parts[0] + '<span class="blank">___</span>' + (parts[1] || '');

        // Render Dictionary Meaning
        els.fcMeaning.style.display = 'none';
        els.fcMeaning.innerHTML = '';
        if (card.sentence.meaningId) {
            DB.getMeaningsForWord(card.word).then(meanings => {
                const targetMeaning = meanings.find(m => m.id === card.sentence.meaningId);
                if (targetMeaning) {
                    els.fcMeaning.innerHTML = `
                        <span style="border: 1px solid var(--accent-purple-light); color: var(--accent-purple-light); padding: 1px 4px; border-radius: 4px; font-size:0.65rem; margin-right: 4px; text-transform: uppercase;">
                            ${targetMeaning.partOfSpeech}
                        </span>
                        <span>${targetMeaning.definition}</span>
                    `;
                    els.fcMeaning.style.display = 'block';
                }
            });
        }
        
        els.fcInput.value = '';
        els.fcInput.className = 'flashcard-input'; // reset classes
        els.fcInput.disabled = false;
        
        els.fcHint.classList.remove('visible');
        els.fcHint.style.display = 'none';

        els.phaseQuestion.style.display = 'block';
        els.phaseResult.classList.remove('visible');
        els.phaseWriting.classList.remove('visible');

        els.fcInput.focus();

        if (els.checkAutoHint.checked) {
            showHint();
        }
    }

    els.fcInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCheck();
    });

    els.btnCheck.addEventListener('click', handleCheck);

    els.btnKnewIt.addEventListener('click', () => {
        if (!currentSession) return;
        const result = currentSession.handleAnswer(true);
        updateProgressUI();
        
        const isQuick = (Date.now() - cardStartTime) < 4000;
        let xpGained = baseCardXP;
        if (isQuick) xpGained = Math.floor(baseCardXP * 1.5);
        showXP(xpGained, isQuick);
        updateStreak(true);
        
        if (goBackHistory.length > 0) goBackHistory[goBackHistory.length - 1].result = result;
        
        els.fcInput.disabled = true;
        els.fcInput.classList.add('correct');
        els.fcInput.value = result.correctAnswer;
        
        setTimeout(() => {
            showResultPhase(result);
        }, 300);
    });

    function showHint() {
        const hint = currentSession.getHint();
        if (hint) {
            els.hintTr.textContent = `Aman dikkat: ${hint.turkishMeaning}`;
            els.hintLetter.textContent = `İlk Harf: ${hint.firstLetter}`;
            els.fcHint.style.display = 'block';
            els.fcHint.classList.add('visible');
            els.fcInput.focus();
        }
    }

    els.btnHint.addEventListener('click', showHint);

    els.btnChangeSentence.addEventListener('click', () => {
        if (!currentSession || currentCardMode === 'reading') return;
        const changed = currentSession.skipToDifferentSentence();
        if (changed) {
            showToast('Farklı bir cümle getirildi 🎉', 'info');
            currentSession.mainQueue.unshift(currentSession.currentCard);
            if (!isReviewingHistory && goBackHistory.length > 0) {
                goBackHistory.pop();
            }
            loadNextCard(); // re-render with the newly picked sentence
        } else {
            showToast('Bu kelime için sırada başka cümle yok.', 'warning');
        }
    });

    // ─── Scan Mode: Render and Navigation ─────────────────────
    function renderScanPage(card) {
        const container = els.scanItemsContainer;
        container.innerHTML = '';
        
        const totalPages = currentSession.pages ? currentSession.pages.length : 1;
        const currentPage = card.pageIndex + 1;
        const pageOffset = card.pageIndex * (currentSession.pageSize || 20);
        
        els.scanPageIndicator.textContent = `Sayfa ${currentPage} / ${totalPages}`;
        
        // Update prev/next button states
        if (els.btnScanPrev) els.btnScanPrev.disabled = (card.pageIndex <= 0);
        if (els.btnScanNext) {
            els.btnScanNext.textContent = (currentPage >= totalPages) ? 'Bitir ✔' : 'Sonraki ▶';
            els.btnScanNext.innerHTML = (currentPage >= totalPages) 
                ? 'Bitir <i class="fa-solid fa-check"></i>' 
                : 'Sonraki <i class="fa-solid fa-chevron-right"></i>';
        }
        
        card.items.forEach((item, idx) => {
            const sentenceText = item.sentence.sentence || '';
            const parts = sentenceText.split('___');
            const answer = item.sentence.answer || item.word;
            const sentenceHtml = parts[0] + `<span class="scan-highlight">${answer}</span>` + (parts[1] || '');
            const globalNum = pageOffset + idx + 1;
            
            const div = document.createElement('div');
            div.className = 'scan-item';
            div.dataset.idx = idx;
            
            let englishHtml = '';
            if (item.englishDefinition && item.englishDefinition !== 'Anlam bulunamadı') {
                englishHtml = `<div class="scan-item-english">🇬🇧 ${item.englishDefinition}</div>`;
            }
            
            div.innerHTML = `
                <div class="scan-item-header">
                    <div class="scan-item-number">${globalNum}</div>
                    <div class="scan-item-word">${item.word}</div>
                    <button onclick="speakWord('${item.word.replace(/'/g, "\\'")}')"
                        style="background: none; border: none; color: var(--info); cursor: pointer; font-size: 0.95rem; padding: 2px 6px; flex-shrink: 0;"
                        title="Seslendir">🔊</button>
                </div>
                ${englishHtml}
                <div class="scan-item-turkish">🇹🇷 ${item.hint}</div>
                <div class="scan-item-sentence">${sentenceHtml}</div>
                <div class="scan-item-sentence-turkish">${item.sentence.turkish || ''}</div>
                <div class="scan-item-actions">
                    <button class="btn btn-ghost btn-sm scan-change-btn" data-idx="${idx}" data-meaning-id="${item.meaningId}" data-current-id="${item.sentence.id}" title="Başka cümle getir">
                        <i class="fa-solid fa-shuffle"></i> Değiştir
                    </button>
                    <button class="btn btn-ghost btn-sm scan-delete-btn" data-idx="${idx}" data-sentence-id="${item.sentence.id}" style="color: var(--error);" title="Bu cümleyi sil">
                        <i class="fa-solid fa-trash"></i> Sil
                    </button>
                </div>
            `;
            
            container.appendChild(div);
        });
        
        // Attach sentence change handlers
        container.querySelectorAll('.scan-change-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const idx = parseInt(btn.dataset.idx);
                const meaningId = btn.dataset.meaningId;
                const currentId = parseInt(btn.dataset.currentId);
                try {
                    const allSentences = await DB.getSentencesForMeaning(meaningId);
                    const other = allSentences.filter(s => s.id !== currentId);
                    if (other.length === 0) {
                        showToast('Bu anlam için başka cümle yok.', 'info');
                        return;
                    }
                    const newSentence = other[Math.floor(Math.random() * other.length)];
                    currentSession.replaceSentence(idx, newSentence);
                    renderScanPage(currentSession.currentCard);
                    showToast('Cümle değiştirildi 🔄', 'success');
                } catch (e) {
                    showToast('Cümle değiştirme hatası.', 'error');
                }
            });
        });
        
        // Attach sentence delete handlers
        container.querySelectorAll('.scan-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const sentenceId = parseInt(btn.dataset.sentenceId);
                if (confirm('Bu cümleyi silmek istediğinize emin misiniz?')) {
                    try {
                        await DB.deleteSentenceById(sentenceId);
                        showToast('Cümle silindi.', 'success');
                        btn.closest('.scan-item').remove();
                    } catch (e) {
                        showToast('Silme hatası.', 'error');
                    }
                }
            });
        });
        
        els.retryIndicator.style.display = 'none';
        els.phaseScan.style.display = 'block';
        
        // Scroll to top of scan container
        els.phaseScan.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Scan Navigation Handlers
    if (els.btnScanNext) {
        els.btnScanNext.addEventListener('click', () => {
            loadNextCard();
        });
    }
    
    if (els.btnScanPrev) {
        els.btnScanPrev.addEventListener('click', () => {
            if (currentSession && currentSession.getPrevCard) {
                const prevCard = currentSession.getPrevCard();
                if (prevCard) {
                    updateProgressUI();
                    saveSessionState();
                    renderScanPage(prevCard);
                } else {
                    showToast('İlk sayfadasınız.', 'info');
                }
            }
        });
    }

    function handleCheck() {
        const inputStr = els.fcInput.value.trim();
        const isCorrect = currentSession.checkAnswer(inputStr);

        if (!isReviewingHistory) {
            const result = currentSession.handleAnswer(isCorrect);

            if (isCorrect) {
                const elapsed = Date.now() - cardStartTime;
                const fast = elapsed < 8000;
                const xp = fast ? baseCardXP * 2 : baseCardXP;
                showXP(xp, fast);
                updateStreak(true);
            } else {
                updateStreak(false);
            }

            if (goBackHistory.length > 0) {
                goBackHistory[goBackHistory.length - 1].result = result;
            }

            els.fcInput.disabled = true;
            if (isCorrect) {
                els.fcInput.classList.add('correct');
                els.fcInput.value = result.correctAnswer;
            } else {
                els.fcInput.classList.add('incorrect');
            }

            setTimeout(() => {
                showResultPhase(result);
            }, 300);
        } else {
            // Reviewing history — just show the result
            const card = currentSession.currentCard;
            showResultPhase({
                word: card.word,
                isCorrect,
                correctAnswer: card.sentence.answer,
                fullSentence: card.sentence.sentence,
                turkishTranslation: card.sentence.turkish,
                isRetry: false,
                isDone: false
            });
        }
    }

    function showResultPhase(result) {
        els.phaseQuestion.style.display = 'none';
        els.phaseResult.classList.add('visible');

        els.resIcon.textContent = result.isCorrect ? '✅' : '❌';
        els.resWord.textContent = result.correctAnswer;
        els.resWord.className = result.isCorrect ? 'result-word correct-word' : 'result-word incorrect-word';

        const parts = result.fullSentence.split('___');
        const fullHtml = parts[0] + `<strong style="color: var(--success); text-decoration: underline;">${result.correctAnswer}</strong>` + (parts[1] || '');
        els.resEnglish.innerHTML = fullHtml;
        els.resTurkish.textContent = result.turkishTranslation || '';

        if (els.resCompareOriginal) els.resCompareOriginal.textContent = result.word;
        if (els.resCompareAnswer) els.resCompareAnswer.textContent = result.correctAnswer;

        els.btnInlineDeleteResult.style.display = 'inline-flex';

        updateProgressUI();
        saveSessionState();
    }

    // Delete sentence from result phase
    els.btnInlineDeleteResult.addEventListener('click', async () => {
        const card = currentSession.currentCard;
        if (!card || !card.sentence) return;
        const sentenceId = card.sentence.id;
        if (sentenceId && confirm('Bu cümleyi silmek istediğinize emin misiniz?')) {
            try {
                await DB.deleteSentenceById(sentenceId);
                showToast('Cümle silindi.', 'success');
                els.btnInlineDeleteResult.style.display = 'none';
            } catch(e) {
                showToast('Silme hatası.', 'error');
            }
        }
    });

    if (els.btnInlineDeleteReading) {
        els.btnInlineDeleteReading.addEventListener('click', async () => {
            const card = currentSession.currentCard;
            if (!card || !card.sentence) return;
            const sentenceId = card.sentence.id;
            if (sentenceId && confirm('Bu cümleyi silmek istediğinize emin misiniz?')) {
                try {
                    await DB.deleteSentenceById(sentenceId);
                    showToast('Cümle silindi.', 'success');
                    els.btnInlineDeleteReading.style.display = 'none';
                } catch(e) {
                    showToast('Silme hatası.', 'error');
                }
            }
        });
    }

    // Next button after result
    els.btnNext.addEventListener('click', () => {
        els.phaseResult.classList.remove('visible');
        els.phaseWriting.classList.remove('visible');
        els.fcInput.disabled = false;
        els.fcInput.classList.remove('correct', 'incorrect');
        els.fcInput.value = '';
        loadNextCard();
    });

    // Session Complete UI
    // ─── Flow Mode Rendering ─────────────────────────────────
    function clearFlowTimers() {
        if (flowTimer) { clearTimeout(flowTimer); flowTimer = null; }
        if (flowRevealTimer) { clearTimeout(flowRevealTimer); flowRevealTimer = null; }
        if (flowTickInterval) { clearInterval(flowTickInterval); flowTickInterval = null; }
    }

    function renderFlowCard(card) {
        clearFlowTimers();
        flowPaused = false;
        if (els.btnFlowPause) {
            els.btnFlowPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }

        const prog = currentSession.getProgress();
        els.flowCounter.textContent = `${prog.stats.correct} / ${prog.totalWords}`;

        // Phase 1: Show word only
        els.flowWord.textContent = card.word;
        speakWord(card.word);
        els.flowWord.style.animation = 'none';
        void els.flowWord.offsetHeight; // trigger reflow
        els.flowWord.style.animation = 'flowPulse 0.4s ease-out';
        els.flowReveal.style.opacity = '0';

        // Prepare reveal content
        const s = card.sentence;
        els.flowTurkish.textContent = '🇹🇷 ' + (s.hint || '');
        
        if (card.englishDefinition && card.englishDefinition !== 'Anlam bulunamadı') {
            els.flowEnglishDef.textContent = '🇬🇧 ' + card.englishDefinition;
            els.flowEnglishDef.style.display = 'block';
        } else {
            els.flowEnglishDef.style.display = 'none';
        }

        const parts = s.sentence.split('___');
        const sentenceHtml = parts[0] + '<span class="flow-highlight">' + s.answer + '</span>' + (parts[1] || '');
        els.flowSentence.innerHTML = sentenceHtml;
        els.flowSentenceTr.textContent = s.turkish || '';

        // Timer bar animation
        els.flowTimerFill.style.transition = 'none';
        els.flowTimerFill.style.width = '0%';

        let elapsed = 0;
        const WORD_PHASE = 2000; // 2s word only
        const REVEAL_PHASE = 2000; // 2s with meaning
        const TOTAL = WORD_PHASE + REVEAL_PHASE;
        const TICK = 50;

        flowTickInterval = setInterval(() => {
            if (flowPaused) return;
            elapsed += TICK;
            const pct = Math.min((elapsed / TOTAL) * 100, 100);
            els.flowTimerFill.style.width = pct + '%';
        }, TICK);

        // Phase 2: Reveal meaning after 2s
        flowRevealTimer = setTimeout(() => {
            els.flowReveal.style.opacity = '1';
        }, WORD_PHASE);

        // Phase 3: Auto-advance after 4s total
        flowTimer = setTimeout(() => {
            flowAdvanceNext();
        }, TOTAL);

        updateProgressUI();
    }

    function flowAdvanceNext() {
        clearFlowTimers();
        const card = currentSession.getNextCard();
        if (!card) {
            finishSessionUI();
        } else {
            renderFlowCard(card);
            updateProgressUI();
        }
    }

    // Flow Pause/Resume
    if (els.btnFlowPause) {
        els.btnFlowPause.addEventListener('click', () => {
            if (!flowPaused) {
                flowPaused = true;
                if (flowTimer) { clearTimeout(flowTimer); flowTimer = null; }
                if (flowRevealTimer) { clearTimeout(flowRevealTimer); flowRevealTimer = null; }
                els.btnFlowPause.innerHTML = '<i class="fa-solid fa-play"></i>';
            } else {
                flowPaused = false;
                // Resume: reveal immediately if not shown, then advance after 2s
                els.flowReveal.style.opacity = '1';
                flowTimer = setTimeout(() => {
                    flowAdvanceNext();
                }, 2000);
                els.btnFlowPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
            }
        });
    }

    // Flow Skip
    if (els.btnFlowSkip) {
        els.btnFlowSkip.addEventListener('click', () => {
            flowAdvanceNext();
        });
    }

    function finishSessionUI() {
        clearSavedSession();
        // Clear shadowing timer & TTS
        if (shadowingTimerHandle) { clearTimeout(shadowingTimerHandle); shadowingTimerHandle = null; }
        _cancelEdgeTTS();
        if (window.speechSynthesis) speechSynthesis.cancel();
        els.practiceActive.style.display = 'none';
        els.practiceComplete.style.display = 'block';

        const prog = currentSession ? currentSession.getProgress() : { stats: { correct: 0, incorrect: 0 } };
        const elCorrect = document.getElementById('complete-correct');
        const elIncorrect = document.getElementById('complete-incorrect');
        if (elCorrect) elCorrect.textContent = prog.stats.correct;
        if (elIncorrect) elIncorrect.textContent = prog.stats.incorrect;
    }

    document.getElementById('btn-finish-session').addEventListener('click', async () => {
        els.practiceComplete.style.display = 'none';
        els.practiceSetup.style.display = 'block';
        currentSession = null;
        await updateDashboard();
        document.querySelector('[data-target="view-practice"]').click();
    });

});
