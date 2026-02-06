---
name: Chrome拡張開発ベストプラクティス
description: Chrome Manifest V3拡張機能の開発における設計パターン、権限管理、バージョン管理のガイドライン
---

# Chrome拡張開発 ベストプラクティス

このスキルは、PromptVaultプロジェクトから得られた知見をまとめたものです。

---

## 1. プロジェクト構成

```
project/
├── public/           # 静的ファイル（ビルド時コピー）
│   ├── manifest.json # 拡張機能設定
│   ├── background.js # Service Worker
│   └── icons/
├── src/              # React/TypeScriptソース
├── dist/             # ビルド成果物（.gitignore対象）
└── docs/             # ドキュメント
```

---

## 2. Manifest V3 権限設計

### 最小権限の原則

必要な権限のみを宣言する。追加時は既存機能への影響を確認。

| 権限 | 用途 |
|------|------|
| `storage` | データ永続化 |
| `sidePanel` | サイドパネル表示 |
| `contextMenus` | 右クリックメニュー |
| `activeTab` | 現在のタブ情報取得 |

### host_permissions

`<all_urls>` は強力だが審査に影響。可能なら特定ドメインに限定。

---

## 3. バージョン管理チェックリスト

バージョンアップ時に更新が必要なファイル：

- [ ] `public/manifest.json` - `version` フィールド
- [ ] `package.json` - `version` フィールド
- [ ] `CHANGELOG.md` - 新バージョンエントリ

### バージョン命名規則（SemVer）

| 変更内容 | 例 |
|----------|-----|
| バグ修正 | 1.5.0 → 1.5.1 |
| 新機能追加 | 1.5.0 → 1.6.0 |
| 破壊的変更 | 1.5.0 → 2.0.0 |

---

## 4. Service Worker (background.js) パターン

### コンテキストメニュー登録

```javascript
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "quick-add",
        title: "PromptVaultに追加",
        contexts: ["selection"]  // テキスト選択時のみ表示
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "quick-add" && info.selectionText) {
        // サイドパネルにメッセージ送信
        chrome.runtime.sendMessage({
            type: "QUICK_ADD",
            text: info.selectionText
        });
    }
});
```

---

## 5. サイドパネル ↔ Service Worker 通信

### メッセージ受信（React側）

```typescript
useEffect(() => {
    const listener = (message: { type: string; text?: string }) => {
        if (message.type === "QUICK_ADD" && message.text) {
            // プロンプト追加処理
        }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
}, []);
```

---

## 6. エラーハンドリング

| 状況 | 対応 |
|------|------|
| 権限不足 | 適切なエラーメッセージ表示 |
| ストレージ容量超過 | 警告表示、古いデータの削除提案 |
| 通信エラー | リトライまたはフォールバック |

---

## 7. リリースフロー

1. ビルド確認 (`npm run build`)
2. バージョン番号更新（上記3ファイル）
3. CHANGELOG更新
4. Gitコミット・タグ付け
5. dist/ をZIP化してGitHubリリースに添付
6. （任意）Chrome Web Storeにアップロード
