// バックグラウンドスクリプト
chrome.runtime.onInstalled.addListener(() => {
    console.log('GitHub PR Manager extension installed');
});

// 自動更新のアラーム
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'autoRefresh') {
        refreshPRData();
    }
});

// PRデータの更新
async function refreshPRData() {
    try {
        const result = await chrome.storage.local.get(['githubToken']);
        if (!result.githubToken) {
            return;
        }

        // ここで実際のデータ更新処理を行う
        // 通知機能も実装可能
        console.log('Auto-refreshing PR data...');

    } catch (error) {
        console.error('Error auto-refreshing PR data:', error);
    }
}
