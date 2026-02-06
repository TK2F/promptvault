# 導入ガイド（インストール方法）

## 必要な環境

- **Node.js** 18以上
- **npm** 9以上
- **Google Chrome** 最新版

## インストール手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/YOUR_USERNAME/promptvault.git
cd promptvault
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. ビルド

```bash
npm run build
```

ビルドが成功すると、`dist` フォルダが作成されます。

### 4. Chromeに読み込む

1. Chromeを開き、アドレスバーに `chrome://extensions` と入力
2. 右上の「**デベロッパーモード**」をオンにする
3. 「**パッケージ化されていない拡張機能を読み込む**」をクリック
4. `dist` フォルダを選択

![Extensions page](../docs/images/extensions-page.png)

### 5. サイドパネルを有効化

PromptVaultはサイドパネルとして動作します。

1. ツールバーのPromptVaultアイコン（🔖）をクリック
2. サイドパネルが開きます

## アップデート方法

1. 最新コードを取得
   ```bash
   git pull origin main
   ```

2. 再ビルド
   ```bash
   npm install
   npm run build
   ```

3. Chromeの拡張機能ページで「更新」ボタンをクリック

## トラブルシューティング

### ビルドエラーが発生する

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
npm run build
```

### 拡張機能が読み込まれない

- `dist` フォルダが存在することを確認
- `dist/manifest.json` が存在することを確認
- デベロッパーモードがオンになっていることを確認

### サイドパネルが開かない

- Chromeのバージョンが114以上であることを確認
- 拡張機能を一度無効にしてから再度有効化
