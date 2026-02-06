// PromptVault Background Service Worker
// Action ボタンクリックでSide Panelを開く

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
