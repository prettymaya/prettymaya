const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const { JSDOM } = require("jsdom");

const dom = new JSDOM(html);
const document = dom.window.document;

// Copy parts of app.js defining els
const els = {
    // ─── DOM Elements ───────────────────────────────────────
    // Modals
    overlayAddWords: document.getElementById('modal-add-words'),
    inputWordList: document.getElementById('input-word-list'),
    checkAutoGenerate: document.getElementById('check-auto-generate'),
    btnClassAddModal: document.getElementById('btn-close-add-modal'),
    btnCancelAdd: document.getElementById('btn-cancel-add'),
    btnConfirmAdd: document.getElementById('btn-confirm-add'),

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
    overlayGeneration: document.getElementById('overlay-generation'),
    genWord: document.getElementById('gen-current-word'),
    genProgressFill: document.getElementById('gen-progress-fill'),
    genCurrentNum: document.getElementById('gen-current-num'),
    genTotalNum: document.getElementById('gen-total-num'),
    btnCancelGeneration: document.getElementById('btn-cancel-generation'),

    // Dashboard
    statWord: document.getElementById('stat-total-words'),
    statSentence: document.getElementById('stat-total-sentences'),
    statSession: document.getElementById('stat-total-sessions'),
    btnQuickPractice: document.getElementById('btn-quick-practice'),
    btnAddWordsDash: document.getElementById('btn-add-words-dash'),

    // Words
    btnShowAddModal: document.getElementById('btn-show-add-modal'),
    btnGenerateMissing: document.getElementById('btn-generate-missing'),
    inputSearchWords: document.getElementById('input-search-words'),
    wordListBody: document.getElementById('word-list-body'),

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
    btnCloseCustomModal: document.getElementById('btn-close-custom-modal'),
    btnCancelCustom: document.getElementById('btn-cancel-custom'),
    btnStartCustomPractice: document.getElementById('btn-start-custom-practice'),

    progCurrent: document.getElementById('session-current'),
    progTotal: document.getElementById('session-total'),
    progCorrect: document.getElementById('session-correct'),
    progIncorrect: document.getElementById('session-incorrect'),
    progFill: document.getElementById('session-progress'),

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

    // Complete view
    compCorrect: document.getElementById('complete-correct'),
    compIncorrect: document.getElementById('complete-incorrect'),
    btnFinishSession: document.getElementById('btn-finish-session')
};

for (const [k, v] of Object.entries(els)) {
    if (!v) console.log('Null element:', k);
}
