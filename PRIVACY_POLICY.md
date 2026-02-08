# Privacy Policy / プライバシーポリシー

**Last Updated: 2026-02-09**

## English

### Data Collection

PromptVault does **NOT** collect, transmit, or share any personal data. All user data is stored locally in your browser using Chrome's built-in storage APIs.

### Data Stored Locally

The following data is stored locally on your device:

| Data Type | Storage Method | Purpose |
|-----------|----------------|---------|
| Prompts | chrome.storage.local | Store your prompt library |
| Recent history | chrome.storage.local | Track recently used prompts |
| Pinned prompts | chrome.storage.local | Remember pinned items |
| User settings | chrome.storage.local | Remember preferences |

### Network Communications

This extension makes **NO** external network requests. All functionality operates entirely offline within your browser.

### Third-Party Services

PromptVault does **NOT** connect to any third-party services. All processing happens locally in your browser.

### Data Sharing

Your data is **NEVER**:
- Sent to external servers
- Shared with third parties
- Used for advertising
- Sold or monetized

### Data Security

- All data is stored exclusively in `chrome.storage.local`, which is isolated to this extension
- Data is encrypted at the browser level by Chrome
- No external scripts or services have access to your stored data
- Backups are stored locally for data recovery

### Data Deletion

To delete all stored data:
1. Open Chrome Extensions page (`chrome://extensions`)
2. Find PromptVault and click "Remove"

All associated data will be deleted when you remove the extension.

Alternatively, use the "Delete All Data" option in Settings to clear data while keeping the extension installed.

### Permissions Explained

| Permission | Why We Need It |
|------------|----------------|
| `storage` | Save your prompts and settings locally |
| `sidePanel` | Display the interface in Chrome's side panel |
| `contextMenus` | Enable right-click menu to add prompts from selected text (v1.6+) |
| `activeTab` | Read selected text from the current tab for Quick Add feature |
| `scripting` | Execute the text selection script for Quick Add feature |
| `host_permissions` | Required for scripting permission to work on all websites |

**Note**: The `activeTab`, `scripting`, and `host_permissions` are only used when you explicitly right-click and select "Add to PromptVault". We do not read any page content automatically or in the background.

### Contact

For privacy-related questions, please open an issue on our GitHub repository.

---

## 日本語

### データ収集について

PromptVault は個人データの収集、送信、共有を**一切行いません**。すべてのユーザーデータは Chrome の組み込みストレージ API を使用してブラウザ内にローカル保存されます。

### ローカルに保存されるデータ

以下のデータがデバイス上にローカル保存されます：

| データ種別 | 保存方法 | 目的 |
|-----------|---------|------|
| プロンプト | chrome.storage.local | プロンプトライブラリの保存 |
| 使用履歴 | chrome.storage.local | 最近使用したプロンプトの追跡 |
| ピン留め | chrome.storage.local | ピン留めしたアイテムの記憶 |
| ユーザー設定 | chrome.storage.local | 設定の記憶 |

### ネットワーク通信

この拡張機能は外部へのネットワークリクエストを**一切行いません**。すべての機能はブラウザ内で完全にオフラインで動作します。

### サードパーティサービス

PromptVault はサードパーティサービスに**接続しません**。すべての処理はブラウザ内でローカルに行われます。

### データ共有

あなたのデータは**決して**：
- 外部サーバーに送信されません
- 第三者と共有されません
- 広告に使用されません
- 販売・収益化されません

### データセキュリティ

- すべてのデータは `chrome.storage.local` に排他的に保存され、この拡張機能に隔離されています
- データはChromeによりブラウザレベルで暗号化されています
- 外部スクリプトやサービスが保存データにアクセスすることはできません
- データ復旧のためのバックアップはローカルに保存されます

### データの削除

保存されたすべてのデータを削除するには：
1. Chrome 拡張機能ページ (`chrome://extensions`) を開く
2. PromptVault を見つけて「削除」をクリック

拡張機能を削除すると、関連するすべてのデータが削除されます。

または、設定内の「全データを削除」オプションを使用して、拡張機能をインストールしたままデータをクリアすることもできます。

### 権限の説明

| 権限 | 必要な理由 |
|------|-----------|
| `storage` | プロンプトと設定をローカルに保存 |
| `sidePanel` | Chrome のサイドパネルにインターフェースを表示 |
| `contextMenus` | 選択テキストからプロンプトを追加する右クリックメニューを有効化（v1.6以降） |
| `activeTab` | クイック追加機能で現在のタブから選択テキストを読み取る |
| `scripting` | クイック追加機能でテキスト選択スクリプトを実行 |
| `host_permissions` | スクリプト権限がすべてのウェブサイトで動作するために必要 |

**注意**: `activeTab`、`scripting`、`host_permissions` は、明示的に右クリックして「PromptVaultに追加」を選択した場合にのみ使用されます。自動的にまたはバックグラウンドでページコンテンツを読み取ることはありません。

### お問い合わせ

プライバシーに関するご質問は、GitHub リポジトリで Issue を作成してください。
