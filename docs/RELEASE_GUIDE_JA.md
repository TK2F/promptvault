# GitHubリリース手順ガイド（開発者向け）

PromptVault をGitHubでリリースする際の詳細な手順です。
すべてGUIで手動操作を行います。

---

## 🆕 Step 0: GitHubリポジトリの作成（初回のみ）

### 0-1: 新規リポジトリ作成ページを開く

1. https://github.com/new にアクセス
   - または GitHub右上の「+」→「New repository」をクリック

### 0-2: リポジトリ情報を入力

| 項目 | 入力内容 |
|------|----------|
| **Repository name** | `promptvault`（小文字推奨） |
| **Description** | 下記参照 |
| **Public / Private** | Public（公開する場合） |
| **Add a README file** | ❌ チェックしない（既存のREADMEを使用） |
| **Add .gitignore** | ❌ チェックしない（既存の.gitignoreを使用） |
| **Choose a license** | None（既存のLICENSEファイルを使用） |

### Description（説明文）

**英語版（推奨）**:
```
Chrome extension for AI power users - Manage 10,000+ prompts with instant search, tags, and one-click copy for ChatGPT/Gemini/Claude
```

**日本語版**:
```
AIヘビーユーザー向けChrome拡張 - ChatGPT/Gemini/Claude用プロンプト管理ツール（即検索・即再利用・即編集）
```

**日英併記版**:
```
Chrome extension for AI prompt management | AIプロンプト管理Chrome拡張 - ChatGPT/Gemini/Claude
```

### 0-3: リポジトリを作成

1. **「Create repository」** ボタンをクリック
2. 空のリポジトリが作成される

### 0-4: ローカルプロジェクトをプッシュ

作成後に表示される手順に従って、ローカルのPromptVaultプロジェクトをプッシュします。

**ターミナル/PowerShellで実行**:
```bash
cd C:\Users\tsuba\AntigravityProjects\browerExtentions\Prompt
git init
git add .
git commit -m "Initial commit: PromptVault v1.5.0"
git branch -M main
git remote add origin https://github.com/tk2f/promptvault.git
git push -u origin main
```

> **注意**: `tk2f` は実際のGitHubユーザー名に置き換えてください

---

## 📋 事前準備チェックリスト

リリース前に以下を確認してください：

- [ ] `npm run build` でビルドが成功している
- [ ] `dist/` フォルダが存在する
- [ ] `public/manifest.json` のバージョンが正しい
- [ ] `CHANGELOG.md` に今回のリリース内容が記載されている
- [ ] 拡張機能をChromeで動作確認済み

---

## 📁 .gitignore について

現在の `.gitignore` は適切に設定されています：

| 除外されるもの | 理由 |
|---------------|------|
| `node_modules/` | 依存関係（npm installで復元可能） |
| `dist/` | ビルド成果物（各自ビルドする想定） |
| `*.zip` | リリース用ZIPファイル |

> **注意**: `dist/` はgitignoreに含まれているので、GitHubリポジトリにはアップロードされません。
> ユーザーが簡単に使えるよう、リリース時に `dist/` を含むZIPファイルを添付します。

---

## 🗜️ リリース用ZIPファイルの作成

### Windows での作成手順

1. **エクスプローラーを開く**
   - フォルダ: `C:\Users\tsuba\AntigravityProjects\browerExtentions\Prompt`

2. **`dist` フォルダを選択**

3. **右クリック → ZIPに圧縮**
   - Windows 11: 右クリック → 「ZIPファイルに圧縮する」
   - Windows 10: 右クリック → 「送る」 → 「圧縮（zip形式）フォルダー」

4. **ファイル名を変更**
   - 例: `promptvault-v1.5.0-chrome.zip`

5. **作成場所**
   - デスクトップなど、わかりやすい場所に保存
   - プロジェクトフォルダ内には置かない（.gitignoreで除外されるので問題ないが、紛らわしい）

---

## 🚀 GitHubリリース作成手順（GUI操作）

### Step 1: GitHubリポジトリページを開く

1. ブラウザで https://github.com/YOUR_USERNAME/promptvault を開く
   - ※ `YOUR_USERNAME` は実際のGitHubユーザー名に置き換え

### Step 2: Releasesページへ移動

1. リポジトリページの右側にある **「Releases」** をクリック
   - または画面右側の「Create a new release」リンクをクリック

### Step 3: 新しいリリースを作成

1. **「Draft a new release」** ボタンをクリック（緑色のボタン）

### Step 4: タグを作成

1. **「Choose a tag」** ドロップダウンをクリック
2. タグ名を入力: `v1.5.0`（例）
3. **「Create new tag: v1.5.0 on publish」** をクリック

### Step 5: リリースタイトルを入力

**Release title** 欄に入力：

```
PromptVault v1.5.0 - Tag/Category Filtering
```

または日本語で：

```
PromptVault v1.5.0 - タグ/カテゴリフィルタリング機能
```

### Step 6: リリースノートを入力

**Describe this release** 欄にCHANGELOG.mdの内容をコピー＆ペースト：

```markdown
## What's New / 新機能

### Added
- **Tag/Category Filtering** - Click tags or categories to filter prompts
- **Combined Filters** - Mix tags, categories, and search keywords
- **Filter Badges** - Visual indicators for active filters below search bar
- **Tag Filter for Export** - Export by tags, categories, or both

### Changed
- **Drag & Drop** - Only "All Prompts" section is sortable; Pinned and Recent are read-only
- **Case Sensitivity Toggle** - Modern switch-style design

---

## Installation / インストール方法

1. Download `promptvault-v1.5.0-chrome.zip` below
2. Extract the ZIP file
3. Open Chrome → `chrome://extensions`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder
6. Click the PromptVault icon to open the side panel

---

1. 下の `promptvault-v1.5.0-chrome.zip` をダウンロード
2. ZIPファイルを解凍
3. Chrome で `chrome://extensions` を開く
4. 「デベロッパーモード」を有効化
5. 「パッケージ化されていない拡張機能を読み込む」をクリックし、解凍したフォルダを選択
6. PromptVaultアイコンをクリックしてサイドパネルを開く
```

### Step 7: ZIPファイルを添付

1. **「Attach binaries by dropping them here or selecting them」** エリアに
2. 作成した `promptvault-v1.5.0-chrome.zip` をドラッグ＆ドロップ
   - または「selecting them」をクリックしてファイルを選択

### Step 8: リリースを公開

1. **「Publish release」** ボタン（緑色）をクリック

> **ヒント**: まだ準備中なら「Save draft」で下書き保存できます

---

## 💚 GitHub Sponsors の設定

### FUNDING.yml について

`.github/FUNDING.yml` ファイルを作成済みです。
このファイルにより、リポジトリに「Sponsor」ボタンが表示されます。

### 設定内容

```yaml
github: tk2f
```

### 表示される場所

- リポジトリページの右側に「💚 Sponsor」ボタンが表示される
- クリックすると https://github.com/sponsors/tk2f に遷移

### GitHub Sponsorsの有効化（まだの場合）

1. https://github.com/sponsors にアクセス
2. 「Get started」をクリック
3. 指示に従ってプロフィール、支払い情報を設定
4. 承認されると「Sponsor」ボタンが有効になる

---

## 📊 バージョン命名規則

| 変更内容 | バージョン変更 | 例 |
|----------|---------------|-----|
| バグ修正のみ | パッチ（Z） | 1.5.0 → 1.5.1 |
| 新機能追加 | マイナー（Y） | 1.5.0 → 1.6.0 |
| 破壊的変更 | メジャー（X） | 1.5.0 → 2.0.0 |

### バージョンを更新する場所

| ファイル | 変更箇所 |
|----------|----------|
| `public/manifest.json` | `"version": "X.X.X"` |
| `package.json` | `"version": "X.X.X"` |
| `CHANGELOG.md` | 新しいバージョンのセクションを追加 |

---

## ✅ リリース後の確認

1. Releasesページに新しいリリースが表示されている
2. ZIPファイルがダウンロード可能
3. タグが正しく作成されている（Codeタブの「tags」で確認）
4. 「Sponsor」ボタンが表示されている（FUNDING.yml設定後）

---

## 🔧 トラブルシューティング

### ZIPファイルが正しく動作しない

- `dist/` フォルダの中身が正しいか確認
- `manifest.json` が `dist/` ではなく `dist/` 内にコピーされているか確認
- ビルド後、`dist/` に以下のファイルがあることを確認：
  - `sidepanel.html`
  - `assets/sidepanel.js`
  - `assets/sidepanel.css`
  - `background.js`（publicからコピーされる）
  - `icons/`（publicからコピーされる）

### Sponsorボタンが表示されない

- `.github/FUNDING.yml` が正しくプッシュされているか確認
- GitHub Sponsorsが有効化されているか確認
- ファイル名が正確に `FUNDING.yml`（大文字小文字注意）か確認
