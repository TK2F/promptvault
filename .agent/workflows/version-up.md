---
description: Chrome拡張機能のバージョンアップ手順
---

# Chrome拡張 バージョンアップ ワークフロー

このワークフローはChrome拡張機能のバージョンアップ時に使用します。

## 手順

// turbo-all

### 1. バージョン番号の更新

以下のファイルのバージョン番号を更新します：
- `public/manifest.json` の `version` フィールド
- `package.json` の `version` フィールド

### 2. CHANGELOG.mdの更新

`CHANGELOG.md` の先頭に新しいバージョンのエントリを追加します。

### 3. ビルドの実行

```bash
npm run build
```

### 4. ビルド成果物の確認

`dist/` フォルダに以下が存在することを確認：
- `sidepanel.html`
- `manifest.json`
- `assets/` フォルダ

### 5. Gitコミット

```bash
git add .
git commit -m "Release vX.X.X: [変更内容の要約]"
git tag vX.X.X
git push origin main --tags
```

### 6. リリースZIPの作成（配布用）

`dist/` フォルダをZIP化：
- Windows: 右クリック → ZIPに圧縮
- PowerShell: `Compress-Archive -Path dist\* -DestinationPath promptvault-vX.X.X.zip`

### 7. GitHubリリース

- GitHubでリリースを作成
- タグを選択
- リリースノートを記載（CHANGELOGからコピー）
- ZIPファイルを添付
