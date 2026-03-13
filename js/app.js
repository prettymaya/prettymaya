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
        btnGenerate5Sentences: document.getElementById('btn-generate-5-sentences'),
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
        readingSetupOpts: document.getElementById('reading-setup-options'),
        selectReadingCount: document.getElementById('reading-sentence-count'),
        
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
        hintTr: document.getElementById('hint-tr'),
        hintLetter: document.getElementById('hint-letter'),
        retryIndicator: document.getElementById('retry-indicator'),

        phaseQuestion: document.getElementById('phase-question'),
        phaseResult: document.getElementById('phase-result'),
        phaseWriting: document.getElementById('phase-writing'),
        phaseReading: document.getElementById('phase-reading'),
        
        readingSentence: document.getElementById('reading-sentence'),
        readingTurkish: document.getElementById('reading-turkish'),
        readingHint: document.getElementById('reading-hint'),
        btnReadingNext: document.getElementById('btn-reading-next'),
        btnQuitSession: document.getElementById('btn-quit-session'),
        
        resIcon: document.getElementById('res-icon'),
        resWord: document.getElementById('res-word'),
        resEnglish: document.getElementById('res-english'),
        resTurkish: document.getElementById('res-turkish'),
        writingInput: document.getElementById('writing-input'),
        btnNext: document.getElementById('btn-next'),

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
        toastContainer: document.getElementById('toast-container')
    };

    // ─── State ──────────────────────────────────────────────
    let allWords = [];
    let sentenceCounts = {};
    let minSentencesRequired = 10;
    let cancelGeneration = false;
    let currentSession = null;
    let selectedWordCount = 20;
    let practiceMode = 'recall'; // 'recall' | 'reading' | 'mixed'
    let currentCardMode = 'recall';
    let searchTimeout = null;

    // Gamification & Go Back State
    let goBackHistory = []; // Stores recent cards & modes for "Go Back" functionality
    let isReviewingHistory = false;
    let gameScore = 0;
    let currentStreak = 0;
    let cardStartTime = 0;
    let baseCardXP = 10;
    let currentDetailWord = null;

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
    }

    els.btnSaveSettings.addEventListener('click', async () => {
        const key = els.inputApiKey.value.trim();
        const minCount = els.selectMinSentences.value;
        const ghToken = els.inputGithubToken.value.trim();
        const gistId = els.inputGistId.value.trim();
        
        await DB.saveSetting('gemini_api_key', key);
        await DB.saveSetting('min_sentences', minCount);
        await DB.saveSetting('github_token', ghToken);
        await DB.saveSetting('github_gist_id', gistId);

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
                showToast('Yedek yükleniyor...', 'info');
                const data = JSON.parse(ev.target.result);
                await DB.importAll(data);
                await updateDashboard();
                renderWordList();
                showToast('Yedek başarıyla geri yüklendi!', 'success');
            } catch(error) {
                showToast('Geri yükleme hatası: Geçersiz dosya.', 'error');
                console.error(error);
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

        els.stats.words.textContent = allWords.length;
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
    function renderWordList(filter = '') {
        els.wordListBody.innerHTML = '';
        const lowerFilter = filter.toLowerCase();

        // Sort by addedDate desc
        const sorted = [...allWords].sort((a,b) => new Date(b.addedDate) - new Date(a.addedDate));

        sorted.forEach(w => {
            if (filter && !w.word.includes(lowerFilter)) return;

            const count = sentenceCounts[w.word] || 0;
            let statusBadge = '';
            
            if (count >= minSentencesRequired) {
                statusBadge = `<span class="sentence-count ready"><i class="fa-solid fa-check"></i> ${count}</span>`;
            } else if (count > 0) {
                statusBadge = `<span class="sentence-count partial"><i class="fa-solid fa-triangle-exclamation"></i> ${count}/${minSentencesRequired}</span>`;
            } else {
                statusBadge = `<span class="sentence-count missing"><i class="fa-solid fa-xmark"></i> ${count}</span>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="word-cell">${w.word}</td>
                <td>${statusBadge}</td>
                <td>
                    <span class="badge ${count >= minSentencesRequired ? 'badge-purple' : ''}">
                        ${count >= minSentencesRequired ? 'Hazır' : 'Eksik'}
                    </span>
                </td>
                <td style="display: flex; gap: 4px; justify-content: center; align-items: center;">
                    <button class="btn btn-ghost btn-sm btn-word-detail" data-word="${w.word}">
                        Detay
                    </button>
                    <button class="btn btn-ghost btn-sm btn-word-generate-5" data-word="${w.word}" title="+5 Cümle Üret" style="color: var(--accent-purple-light); padding: 8px;">
                        <i class="fa-solid fa-plus"></i> <span style="font-weight:bold;">5</span>
                    </button>
                </td>
            `;

            els.wordListBody.appendChild(tr);
        });

        // Bind detail buttons
        document.querySelectorAll('.btn-word-detail').forEach(btn => {
            btn.addEventListener('click', (e) => openWordDetails(e.currentTarget.dataset.word));
        });

        // Bind generator buttons
        document.querySelectorAll('.btn-word-generate-5').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const w = e.currentTarget.dataset.word;
                generate5SentencesForWord(w, false);
            });
        });
    }

    els.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderWordList(e.target.value.trim());
        }, 300);
    });

    els.btnConfirmAdd.addEventListener('click', async () => {
        const text = els.inputWordList.value;
        const list = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
        
        if (list.length === 0) {
            showToast('Lütfen en az bir kelime girin.', 'error');
            return;
        }

        els.btnConfirmAdd.disabled = true;
        els.btnConfirmAdd.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Ekleniyor...';

        const result = await DB.addWords(list);
        await updateDashboard();
        
        els.btnConfirmAdd.disabled = false;
        els.btnConfirmAdd.innerHTML = 'Kelimeleri Ekle';
        els.modalAddWords.classList.remove('visible');

        showToast(`${result.added.length} kelime eklendi, ${result.existing.length} kelime zaten vardı.`, 'success');
        
        renderWordList();

        if (els.checkAutoGen.checked && result.added.length > 0) {
            startGenerationProcess(result.added);
        }
    });

    // ─── Sentence Generation ────────────────────────────────
    els.btnGenMissing.addEventListener('click', () => {
        const missing = allWords.filter(w => (sentenceCounts[w.word] || 0) < minSentencesRequired);
        if (missing.length === 0) {
            showToast('Tüm kelimelerin cümlesi tam!', 'success');
            return;
        }
        startGenerationProcess(missing.map(w => w.word));
    });

    els.btnCancelGen.addEventListener('click', () => {
        cancelGeneration = true;
        els.btnCancelGen.textContent = 'İptal Ediliyor...';
    });

    async function startGenerationProcess(wordsToProcess) {
        const apiKey = await DB.getSetting('gemini_api_key');
        if (!apiKey) {
            showToast('Cümle üretmek için Ayarlar\'dan API anahtarı girmelisiniz.', 'error');
            return;
        }

        cancelGeneration = false;
        els.overlayGen.classList.add('visible');
        els.genTotalNum.textContent = wordsToProcess.length;
        els.genCurrentNum.textContent = 0;
        els.genProgressFill.style.width = '0%';
        els.btnCancelGen.textContent = 'İptal Et';

        try {
            await GeminiService.generateForMissingWords(wordsToProcess, minSentencesRequired, (processed, total, word, status) => {
                let perc = Math.round((processed / total) * 100);
                els.genCurrentNum.textContent = processed;
                els.genProgressFill.style.width = `${perc}%`;
                els.genCurrentWord.textContent = word;

                if (cancelGeneration) throw new Error('CanceledByUser');
            });
            showToast('Cümle üretimi tamamlandı!', 'success');
        } catch (e) {
            if (e.message === 'CanceledByUser') {
                showToast('Üretim iptal edildi.', 'info');
            } else {
                showToast(`Hata: ${e.message}`, 'error');
            }
        } finally {
            els.overlayGen.classList.remove('visible');
            await updateDashboard();
            renderWordList();
        }
    }

    // ─── Word Details ───────────────────────────────────────
    async function openWordDetails(word) {
        currentDetailWord = word;
        els.detailWordTitle.textContent = word;
        
        const count = await DB.getSentenceCountForWord(word);
        els.detailSentenceCount.textContent = count;
        
        const sentences = await DB.getSentencesForWord(word);
        els.detailSentencesList.innerHTML = '';
        
        if (sentences.length === 0) {
            els.detailSentencesList.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--text-muted)">Cümle bulunamadı.</td></tr>`;
        } else {
            sentences.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-size: 0.9rem;">${s.sentence.replace('___', '<strong style="color:var(--accent-purple-light)">___</strong>')}</td>
                    <td><strong>${s.answer}</strong></td>
                    <td><button class="btn btn-ghost btn-sm btn-delete-single-sentence" data-id="${s.id}" style="color:var(--error);"><i class="fa-solid fa-trash"></i></button></td>
                `;
                els.detailSentencesList.appendChild(tr);
            });
            
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

    els.btnGenerate5Sentences.addEventListener('click', () => {
        if (!currentDetailWord) return;
        generate5SentencesForWord(currentDetailWord, true);
    });

    async function generate5SentencesForWord(word, isFromModal = false) {
        const apiKey = await DB.getSetting('gemini_api_key');
        if (!apiKey) {
            showToast('Lütfen önce Ayarlar\'dan API anahtarı girin.', 'error');
            return;
        }

        if (isFromModal) {
            els.modalWordDetails.classList.remove('visible');
        }
        
        cancelGeneration = false;
        els.overlayGen.classList.add('visible');
        els.genTotalNum.textContent = 1;
        els.genCurrentNum.textContent = 0;
        els.genProgressFill.style.width = '0%';
        els.genCurrentWord.textContent = word;
        els.btnCancelGen.textContent = 'İptal Et';

        try {
            const added = await GeminiService.addMoreSentences(word, 5);
            els.genCurrentNum.textContent = 1;
            els.genProgressFill.style.width = '100%';
            showToast(`${word} için ${added} yeni cümle eklendi!`, 'success');
        } catch (e) {
            showToast(`Hata: ${e.message}`, 'error');
        } finally {
            els.overlayGen.classList.remove('visible');
            await updateDashboard();
            renderWordList();
            
            // Eğer isFromModal ise modalı güncelleyip geri açabiliriz
            if (isFromModal && !cancelGeneration) {
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
        const list = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
        
        if (list.length === 0) {
            showToast('Lütfen pratik yapmak için kelime girin.', 'error');
            return;
        }

        els.btnStartCustomPractice.disabled = true;
        els.btnStartCustomPractice.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Analiz ediliyor...';

        try {
            await DB.addWords(list);
            await updateDashboard();

            sentenceCounts = await DB.getAllSentenceCounts();
            const missing = list.filter(w => (sentenceCounts[w] || 0) < minSentencesRequired);

            if (missing.length > 0) {
                els.modalCustomPractice.classList.remove('visible');
                showToast(`${missing.length} kelime için eksik cümleler üretiliyor...`, 'info');
                await generateAndStartCustomSession(missing, list);
            } else {
                els.modalCustomPractice.classList.remove('visible');
                startSessionWithSpecificList(list);
            }
        } catch(e) {
            showToast('Hata: ' + e.message, 'error');
        } finally {
            els.btnStartCustomPractice.disabled = false;
            els.btnStartCustomPractice.innerHTML = 'Analiz Et ve Başla';
        }
    });

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
        const readyWordsMap = new Map();
        for (const word of customList) {
            const count = sentenceCounts[word] || 0;
            if (count > 0) {
                const sentences = await DB.getSentencesForWord(word);
                readyWordsMap.set(word, sentences);
            }
        }

        if (readyWordsMap.size === 0) {
            showToast(`Bu kelimeler için yeterli cümle bulunamadı.`, 'error');
            return;
        }

        if (practiceMode === 'reading') {
            const c = parseInt(els.selectReadingCount.value);
            currentSession = new ReadingSessionManager(readyWordsMap, c);
        } else if (practiceMode === 'mixed') {
            const c = parseInt(els.selectReadingCount.value);
            currentSession = new SessionManager(readyWordsMap, c);
        } else {
            currentSession = new SessionManager(readyWordsMap, 1);
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
        els.btnModeRecall.className = 'btn btn-primary';
        els.btnModeReading.className = 'btn btn-secondary';
        els.btnModeMixed.className = 'btn btn-secondary';
        els.readingSetupOpts.style.display = 'none';
        els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Kaç kelimeyle pratik yapmak istiyorsun?';
        els.countSelectors[0].parentElement.style.display = 'flex';
    });
    
    els.btnModeReading.addEventListener('click', () => {
        practiceMode = 'reading';
        els.btnModeReading.className = 'btn btn-primary';
        els.btnModeRecall.className = 'btn btn-secondary';
        els.btnModeMixed.className = 'btn btn-secondary';
        els.readingSetupOpts.style.display = 'block';
        els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Kaç kelime okumak istiyorsun?';
        els.countSelectors[0].parentElement.style.display = 'flex';
    });

    els.btnModeMixed.addEventListener('click', () => {
        practiceMode = 'mixed';
        els.btnModeMixed.className = 'btn btn-primary';
        els.btnModeRecall.className = 'btn btn-secondary';
        els.btnModeReading.className = 'btn btn-secondary';
        els.readingSetupOpts.style.display = 'block';
        els.countSelectors[0].parentElement.previousElementSibling.textContent = 'Kaç kelimeyle karma pratik istiyorsun?';
        els.countSelectors[0].parentElement.style.display = 'flex';
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
        
        isReviewingHistory = true;
        els.btnGoBack.style.display = goBackHistory.length > 1 ? 'inline-flex' : 'none';
        
        if (prevData.mode === 'reading') {
            currentCardMode = 'reading';
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            
            const parts = prevData.card.sentence.sentence.split('___');
            els.readingSentence.innerHTML = parts[0] + `<strong style="color:var(--accent-purple-light)">${prevData.card.sentence.answer}</strong>` + (parts[1] || '');
            els.readingTurkish.textContent = prevData.card.sentence.turkish;
            els.readingHint.textContent = prevData.card.sentence.hint;
            
            els.retryIndicator.style.display = 'none';
            els.phaseReading.style.display = 'block';
            els.btnReadingNext.focus();
        } else {
            currentCardMode = 'recall';
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
        if(confirm('Pratik oturumunu şu anki ilerlemenizle bitirmek istediğinize emin misiniz?')) {
            finishSessionUI();
        }
    });

    els.btnStartSession.addEventListener('click', async () => {
        const readyWordsMap = new Map();
        for (const w of allWords) {
            const word = w.word;
            const count = sentenceCounts[word] || 0;
            // Strict minimum filter
            if (count >= minSentencesRequired) {
                const sentences = await DB.getSentencesForWord(word);
                readyWordsMap.set(word, sentences);
            }
        }

        if (readyWordsMap.size === 0) {
            showToast(`Pratik yapmak için en az ${minSentencesRequired} cümlesi olan kelimelere ihtiyacınız var. Kelimeler sekmesinden "Eksikleri Üret" butonuna basın.`, 'error');
            return;
        }

        // Apply limit
        let wordsToUse = Array.from(readyWordsMap.entries());
        
        // Shuffle all valid words first
        for (let i = wordsToUse.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wordsToUse[i], wordsToUse[j]] = [wordsToUse[j], wordsToUse[i]];
        }

        if (selectedWordCount !== 'all') {
            const limit = parseInt(selectedWordCount);
            if (wordsToUse.length > limit) {
                wordsToUse = wordsToUse.slice(0, limit);
            }
        }

        const filteredMap = new Map(wordsToUse);

        // Init Session Manager based on mode
        if (practiceMode === 'reading') {
            const c = parseInt(els.selectReadingCount.value);
            currentSession = new ReadingSessionManager(filteredMap, c);
        } else if (practiceMode === 'mixed') {
            const c = parseInt(els.selectReadingCount.value);
            currentSession = new SessionManager(filteredMap, c);
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
    });

    function updateProgressUI() {
        const prog = currentSession.getProgress();
        let displayCurrent = 1;
        
        if (practiceMode === 'reading') {
            displayCurrent = prog.stats.correct; // in reading, correct maps to position
        } else {
            displayCurrent = (currentSession.stats.total - currentSession.mainQueue.length - currentSession.retryInserts.length) + 1;
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

        if (currentCardMode === 'reading') {
            els.phaseQuestion.style.display = 'none';
            els.phaseResult.classList.remove('visible');
            els.phaseWriting.classList.remove('visible');
            
            // Prepare reading card
            const parts = card.sentence.sentence.split('___');
            // Ensure proper spacing when joining parts
            els.readingSentence.innerHTML = parts[0] + `<strong style="color:var(--accent-purple-light)">${card.sentence.answer}</strong>` + (parts[1] || '');
            els.readingTurkish.textContent = card.sentence.turkish;
            els.readingHint.textContent = card.sentence.hint;
            
            els.retryIndicator.style.display = 'none';
            els.phaseReading.style.display = 'block';
            els.btnReadingNext.focus();
            return;
        }

        // Active Recall Mode
        els.phaseReading.style.display = 'none';

        // Check if retry
        const state = currentSession.wordState.get(card.cardKey);
        if (state.needsConfirmation) {
            els.retryIndicator.style.display = 'inline-flex';
        } else {
            els.retryIndicator.style.display = 'none';
        }

        // Render Card
        const parts = card.sentence.sentence.split('___');
        els.fcSentence.innerHTML = parts[0] + '<span class="blank">___</span>' + (parts[1] || '');
        
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
            loadNextCard(); // re-render with the newly picked sentence
        } else {
            showToast('Bu kelime için sırada başka cümle yok.', 'warning');
        }
    });

    function handleCheck() {
        const inputStr = els.fcInput.value.trim();
        if (!inputStr) {
            els.fcInput.classList.add('shake');
            setTimeout(() => els.fcInput.classList.remove('shake'), 400);
            return;
        }

        const isCorrect = currentSession.checkAnswer(inputStr);
        const result = currentSession.handleAnswer(isCorrect);
        
        const isQuick = (Date.now() - cardStartTime) < 4000;
        let xpGained = baseCardXP;
        if (isCorrect) {
            if (isQuick) xpGained = Math.floor(baseCardXP * 1.5);
            showXP(xpGained, isQuick);
        }
        updateStreak(isCorrect);
        
        if (goBackHistory.length > 0) goBackHistory[goBackHistory.length - 1].result = result;
        
        updateProgressUI();

        // Visual Feedback on Input
        els.fcInput.disabled = true;
        if (isCorrect) {
            els.fcInput.classList.add('correct');
            els.fcInput.value = result.correctAnswer;
        } else {
            els.fcInput.classList.add('incorrect');
            els.fcInput.classList.add('shake');
            setTimeout(() => els.fcInput.classList.remove('shake'), 400);
        }

        // Wait a tiny bit then show result phase
        setTimeout(() => {
            showResultPhase(result);
        }, 500);
    }

    function showResultPhase(result, isHistoryReview = false) {
        els.phaseQuestion.style.display = 'none';
        
        els.resIcon.textContent = result.isCorrect ? '✅' : '❌';
        els.resWord.textContent = result.correctAnswer;
        els.resWord.className = `result-word ${result.isCorrect ? 'correct-word' : 'incorrect-word'}`;
        
        // Render english sentence with highlight
        const parts = result.fullSentence.split('___');
        const highlightedSent = parts[0] + `<strong style="color:var(--accent-purple-light)">${result.correctAnswer}</strong>` + (parts[1] || '');
        els.resEnglish.innerHTML = highlightedSent;

        els.resTurkish.textContent = result.turkishTranslation;

        els.phaseResult.classList.add('visible');

        if (isHistoryReview) {
            els.phaseWriting.classList.remove('visible');
            els.btnNext.innerHTML = 'Kaldığım Yerden Devam Et <i class="fa-solid fa-chevron-right"></i>';
            els.btnNext.focus();
        } else {
            els.btnNext.innerHTML = 'Sıradaki <i class="fa-solid fa-chevron-right"></i>';
            if (result.isCorrect) {
                els.phaseWriting.classList.add('visible');
                els.writingInput.value = '';
                els.writingInput.focus();
                
                // Allow skipping writing by pressing Enter
                els.writingInput.onkeypress = (e) => {
                    if (e.key === 'Enter') els.btnNext.click();
                };
            } else {
                els.btnNext.focus();
            }
        }
    }

    els.btnNext.addEventListener('click', () => {
        loadNextCard();
    });

    async function finishSessionUI() {
        els.practiceActive.style.display = 'none';
        
        const prog = currentSession.getProgress();
        els.document.getElementById('complete-correct').textContent = prog.stats.correct;
        els.document.getElementById('complete-incorrect').textContent = prog.stats.incorrect;
        
        els.practiceComplete.style.display = 'block';
        
        // Save to History
        await DB.addSessionHistory({
            totalWords: prog.totalWords,
            correct: prog.stats.correct,
            incorrect: prog.stats.incorrect
        });

        await updateDashboard();
    }

    els.btnFinishSession.addEventListener('click', () => {
        els.practiceComplete.style.display = 'none';
        els.practiceSetup.style.display = 'block';
        document.querySelector('[data-target="view-dashboard"]').click();
        currentSession = null;
    });

});
