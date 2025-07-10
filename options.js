// DOM要素の取得
const elements = {
    tokenInput: document.getElementById('tokenInput'),
    toggleToken: document.getElementById('toggleToken'),
    saveBtn: document.getElementById('saveBtn'),
    testBtn: document.getElementById('testBtn'),
    status: document.getElementById('status'),
    autoRefresh: document.getElementById('autoRefresh'),
    showNotifications: document.getElementById('showNotifications')
};

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    elements.saveBtn.addEventListener('click', saveSettings);
    elements.testBtn.addEventListener('click', testConnection);
    elements.toggleToken.addEventListener('click', toggleTokenVisibility);

    // Enterキーでも保存できるように
    elements.tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveSettings();
        }
    });
}

// 設定の読み込み
async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['githubToken', 'autoRefresh', 'showNotifications'], (result) => {
            if (result.githubToken) {
                elements.tokenInput.value = result.githubToken;
            }
            elements.autoRefresh.checked = result.autoRefresh || false;
            elements.showNotifications.checked = result.showNotifications || false;
            resolve();
        });
    });
}

// 設定の保存
async function saveSettings() {
    const token = elements.tokenInput.value.trim();
    const autoRefresh = elements.autoRefresh.checked;
    const showNotifications = elements.showNotifications.checked;

    if (!token) {
        showStatus('Personal Access Tokenを入力してください。', 'error');
        return;
    }

    // トークンの形式をチェック
    if (!isValidTokenFormat(token)) {
        showStatus('無効なトークン形式です。GitHub Personal Access Tokenを確認してください。', 'error');
        return;
    }

    try {
        // 設定を保存
        await new Promise((resolve) => {
            chrome.storage.local.set({
                githubToken: token,
                autoRefresh: autoRefresh,
                showNotifications: showNotifications
            }, resolve);
        });

        showStatus('設定が保存されました。', 'success');

        // 自動更新の設定
        if (autoRefresh) {
            setupAutoRefresh();
        } else {
            clearAutoRefresh();
        }

    } catch (error) {
        console.error('Error saving settings:', error);
        showStatus('設定の保存に失敗しました。', 'error');
    }
}

// 接続テスト
async function testConnection() {
    const token = elements.tokenInput.value.trim();

    if (!token) {
        showStatus('Personal Access Tokenを入力してください。', 'error');
        return;
    }

    showStatus('接続をテスト中...', 'info');

    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const user = await response.json();
            showStatus(`接続成功！ GitHub ユーザー: ${user.login}`, 'success');
        } else if (response.status === 401) {
            showStatus('認証に失敗しました。Personal Access Tokenを確認してください。', 'error');
        } else {
            showStatus(`接続エラー: ${response.status}`, 'error');
        }
    } catch (error) {
        console.error('Connection test error:', error);
        showStatus('接続テストに失敗しました。ネットワーク接続を確認してください。', 'error');
    }
}

// トークンの表示/非表示切り替え
function toggleTokenVisibility() {
    const isPassword = elements.tokenInput.type === 'password';
    elements.tokenInput.type = isPassword ? 'text' : 'password';
    elements.toggleToken.textContent = isPassword ? '🙈' : '👁️';
}

// トークン形式の検証
function isValidTokenFormat(token) {
    // GitHub Personal Access Token (classic) の形式: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    // GitHub Fine-grained personal access token の形式: github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    return /^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})$/.test(token);
}

// ステータスメッセージの表示
function showStatus(message, type) {
    elements.status.textContent = message;
    elements.status.className = `status ${type}`;
    elements.status.classList.remove('hidden');

    // 成功メッセージは3秒後に自動で隠す
    if (type === 'success') {
        setTimeout(() => {
            elements.status.classList.add('hidden');
        }, 3000);
    }
}

// 自動更新の設定
function setupAutoRefresh() {
    chrome.alarms.create('autoRefresh', {
        delayInMinutes: 15,
        periodInMinutes: 15
    });
}

// 自動更新のクリア
function clearAutoRefresh() {
    chrome.alarms.clear('autoRefresh');
}
