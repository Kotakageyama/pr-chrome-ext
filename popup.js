// DOM要素の取得
const elements = {
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('errorMessage'),
    content: document.getElementById('content'),
    refreshBtn: document.getElementById('refreshBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    reviewTab: document.getElementById('reviewTab'),
    myPrsTab: document.getElementById('myPrsTab'),
    reviewSection: document.getElementById('reviewSection'),
    myPrsSection: document.getElementById('myPrsSection'),
    reviewList: document.getElementById('reviewList'),
    myPrsList: document.getElementById('myPrsList'),
    reviewCount: document.getElementById('reviewCount'),
    myPrsCount: document.getElementById('myPrsCount')
};

// 現在のタブ
let currentTab = 'review';

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadPRs();
});

// イベントリスナーの設定
function setupEventListeners() {
    elements.refreshBtn.addEventListener('click', loadPRs);
    elements.settingsBtn.addEventListener('click', openSettings);

    elements.reviewTab.addEventListener('click', () => switchTab('review'));
    elements.myPrsTab.addEventListener('click', () => switchTab('myPrs'));
}

// タブの切り替え
function switchTab(tab) {
    currentTab = tab;

    // タブボタンの状態更新
    elements.reviewTab.classList.toggle('active', tab === 'review');
    elements.myPrsTab.classList.toggle('active', tab === 'myPrs');

    // セクションの表示切り替え
    elements.reviewSection.classList.toggle('active', tab === 'review');
    elements.myPrsSection.classList.toggle('active', tab === 'myPrs');
}

// PRデータの読み込み
async function loadPRs() {
    showLoading();

    try {
        const token = await getStoredToken();
        if (!token) {
            showError('GitHub Personal Access Tokenが設定されていません。設定ページで設定してください。');
            return;
        }

        const [reviewPRs, myPRs] = await Promise.all([
            fetchReviewPRs(token),
            fetchMyPRs(token)
        ]);

        displayPRs(reviewPRs, elements.reviewList, elements.reviewCount);
        displayPRs(myPRs, elements.myPrsList, elements.myPrsCount);

        showContent();
    } catch (error) {
        console.error('Error loading PRs:', error);
        showError('PRの読み込みに失敗しました: ' + error.message);
    }
}

// GitHub APIでレビュー待ちPRを取得
async function fetchReviewPRs(token) {
    const query = 'is:open is:pr review-requested:@me -author:@me archived:false';
    return await searchPRs(token, query);
}

// GitHub APIで自分のPRを取得
async function fetchMyPRs(token) {
    const query = 'is:open is:pr author:@me archived:false';
    return await searchPRs(token, query);
}

// GitHub APIでPRを検索
async function searchPRs(token, query) {
    const response = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('認証に失敗しました。Personal Access Tokenを確認してください。');
        }
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items;
}

// PRリストの表示
function displayPRs(prs, listElement, countElement) {
    listElement.innerHTML = '';
    countElement.textContent = prs.length;

    if (prs.length === 0) {
        listElement.innerHTML = `
            <div class="empty-state">
                <p>該当するPRはありません</p>
            </div>
        `;
        return;
    }

    prs.forEach(pr => {
        const prElement = createPRElement(pr);
        listElement.appendChild(prElement);
    });
}

// PR要素の作成
function createPRElement(pr) {
    const element = document.createElement('div');
    element.className = 'pr-item';
    element.addEventListener('click', () => openPR(pr.html_url));

    const status = pr.draft ? 'draft' : 'open';
    const statusText = pr.draft ? 'Draft' : 'Open';

    // CIステータスの取得（簡易版）
    const ciStatus = '⏳'; // デフォルトは待機中

    element.innerHTML = `
        <img class="avatar" src="${pr.user.avatar_url}" alt="${pr.user.login}">
        <div class="pr-info">
            <div class="pr-title" title="${pr.title}">${pr.title}</div>
            <div class="pr-meta">
                <span class="repo-name">${extractRepoName(pr.repository_url)}</span>
                <span>by ${pr.user.login}</span>
                <span>${formatDate(pr.updated_at)}</span>
            </div>
        </div>
        <div class="status">
            <span class="status-badge status-${status}">${statusText}</span>
            <span class="ci-status" title="CI Status">${ciStatus}</span>
        </div>
    `;

    return element;
}

// リポジトリ名の抽出
function extractRepoName(repositoryUrl) {
    const parts = repositoryUrl.split('/');
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

// 日付のフォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return `${diffMinutes}分前`;
        }
        return `${diffHours}時間前`;
    } else if (diffDays === 1) {
        return '昨日';
    } else if (diffDays < 7) {
        return `${diffDays}日前`;
    } else {
        return date.toLocaleDateString('ja-JP');
    }
}

// PRページを開く
function openPR(url) {
    chrome.tabs.create({ url });
}

// 設定ページを開く
function openSettings() {
    chrome.runtime.openOptionsPage();
}

// 保存されたトークンを取得
async function getStoredToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['githubToken'], (result) => {
            resolve(result.githubToken);
        });
    });
}

// UI状態の管理
function showLoading() {
    elements.loading.classList.remove('hidden');
    elements.error.classList.add('hidden');
    elements.content.classList.add('hidden');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.loading.classList.add('hidden');
    elements.error.classList.remove('hidden');
    elements.content.classList.add('hidden');
}

function showContent() {
    elements.loading.classList.add('hidden');
    elements.error.classList.add('hidden');
    elements.content.classList.remove('hidden');
}
