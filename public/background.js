// PromptVault Background Service Worker
// Action ボタンクリックでSide Panelを開く + コンテキストメニュー

// Side Panel の動作設定
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

// コンテキストメニューの作成（インストール時）
chrome.runtime.onInstalled.addListener(() => {
    // クイック追加メニュー
    chrome.contextMenus.create({
        id: "promptvault-quick-add",
        title: "PromptVaultに追加",
        contexts: ["selection"]
    });
});

// 設定を取得する関数
async function getSettings() {
    try {
        const result = await chrome.storage.local.get("promptvault_data");
        if (result.promptvault_data?.settings) {
            return result.promptvault_data.settings;
        }
    } catch (e) {
        console.warn("Could not get settings:", e);
    }
    // デフォルト設定
    return { blankLineMode: 'keep-one' };
}

// 選択テキストを正確に取得する関数（改行を保持）
async function getSelectedTextFromTab(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => window.getSelection()?.toString() || ""
        });
        if (results && results[0] && results[0].result) {
            return results[0].result;
        }
    } catch (e) {
        console.warn("Could not execute script to get selection:", e);
    }
    return null;
}

// テキストを正規化する関数
function normalizeText(text, blankLineMode) {
    let normalized = text
        .replace(/\r\n/g, '\n')           // CRLF → LF
        .replace(/\r/g, '\n')             // CR → LF
        .replace(/[ \t]+$/gm, '')         // 行末空白削除
        .trim();                           // 先頭末尾の空白削除

    if (blankLineMode === 'remove-all') {
        // 連続改行 → 単一改行（空行を全削除）
        normalized = normalized.replace(/\n{2,}/g, '\n');
    } else {
        // keep-one: 3つ以上の連続改行 → 2つ（空行は1つまで保持）
        normalized = normalized.replace(/\n{3,}/g, '\n\n');
    }

    return normalized;
}

// コンテキストメニュークリック時の処理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "promptvault-quick-add") {
        return;
    }

    // タブIDが必要
    if (!tab?.id) {
        console.error("No tab ID available");
        return;
    }

    // 設定を取得
    const settings = await getSettings();

    // Scripting APIで選択テキストを取得（改行を保持）
    // フォールバック: info.selectionText（改行なし）
    let selectedText = await getSelectedTextFromTab(tab.id);
    if (!selectedText) {
        selectedText = info.selectionText || "";
    }

    if (!selectedText) {
        return;
    }

    // テキストの正規化（設定に応じて）
    selectedText = normalizeText(selectedText, settings.blankLineMode);

    // 長すぎる場合は10KBで切り捨て
    const MAX_TEXT_LENGTH = 10240;
    if (selectedText.length > MAX_TEXT_LENGTH) {
        selectedText = selectedText.substring(0, MAX_TEXT_LENGTH);
    }

    // サイドパネルを開く
    if (tab?.windowId) {
        try {
            await chrome.sidePanel.open({ windowId: tab.windowId });
        } catch (e) {
            console.error("Failed to open side panel:", e);
        }
    }

    // 少し待ってからメッセージを送信（サイドパネルの準備待ち）
    setTimeout(() => {
        // クイック追加：名前は先頭30文字（改行は除去して名前生成）
        const nameText = selectedText.replace(/[\r\n]+/g, ' ').trim();
        const autoName = nameText.substring(0, 30) + (nameText.length > 30 ? "..." : "");

        chrome.runtime.sendMessage({
            type: "QUICK_ADD_PROMPT",
            data: {
                name: autoName,
                content: selectedText,
                category: "",
                tags: []
            }
        }).catch(() => {
            // サイドパネルがまだ準備できていない場合は無視
            console.log("Message could not be delivered - side panel may not be ready");
        });
    }, 500);
});
