# 開発者向け Git & GitHub 操作ガイド (PowerShell版)

トクツーさんが開発を進める中で頻繁に使用するコマンドや、特定の状況での対処法をまとめたマニュアルです。

---

## 1. 開発の基本サイクル (日常業務)

コードを修正した後に GitHub へ反映させる手順です。

### Step 1: 変更の確認
現在のファイルのステータスを確認します。
```powershell
git status
```

### Step 2: ステージング
コミットするファイルを選択します（`.` は全変更を意味します）。
```powershell
git add .
```

### Step 3: コミット
変更内容に名前（メッセージ）を付けて記録します。
```powershell
git commit -m "v1.5.1: 検索UIの微調整"
```

### Step 4: 送信 (Push)
ローカルの変更を GitHub へアップロードします。
```powershell
git push
```
> ※ 最初の一回 `git push -u origin main` を行っていれば、次からは `git push` だけで OK です。

---

## 2. GitHub CLI によるリポジトリ作成 (GUI不要)

ブラウザを開かずに、PowerShell から直接 GitHub リポジトリを作成する方法です。

### インストール (未導入の場合)
```powershell
winget install --id GitHub.cli
```

### ログイン
```powershell
gh auth login
```

### リポジトリの作成とプッシュ
```powershell
# カレントディレクトリの名前でリポジトリを作成し、Publicにする
gh repo create promptvault --public --source=. --remote=origin --push
```

---

## 3. バージョンアップ時の対応 (Release)

### タグを付けてリリースを管理する
特定のバージョンを「タグ」として記録しておくと、後からその時点のコードに戻りやすくなります。

```powershell
# 1. ローカルでタグを作成（アノテーション付き推奨）
git tag -a v1.6.0 -m "v1.6.0: Context menu, unconfigured filter, blank line settings"

# 2. タグを GitHub に送信
git push origin v1.6.0
```

### GitHub Releases でリリースを公開する

#### 方法A: GitHub CLI を使う（推奨）

```powershell
# 1. distフォルダをZIP化
Compress-Archive -Path dist\* -DestinationPath PromptVault-v1.6.0.zip -Force

# 2. リリースを作成（ZIPファイル添付付き）
gh release create v1.6.0 `
  --title "v1.6.0: Context Menu & Quick Guide" `
  --notes-file RELEASE_NOTES_v1.6.0.md `
  PromptVault-v1.6.0.zip
```

#### 方法B: ブラウザで手動作成

1. **GitHub Releasesページを開く**: https://github.com/TK2F/promptvault/releases/new
2. **タグを選択**: ドロップダウンから `v1.6.0` を選択
3. **タイトル入力**: `v1.6.0: Context Menu & Quick Guide`
4. **説明入力**: `RELEASE_NOTES_v1.6.0.md` の内容をコピー&ペースト
5. **ファイルをアップロード**: `PromptVault-v1.6.0.zip` をドラッグ&ドロップ
6. **「Publish release」をクリック**

### リリースノートの書き方（日英バイリンガル推奨）

```markdown
## 🇺🇸 What's New in v1.6.0

### ✨ New Features
- **Feature Name**: Description

---

## 🇯🇵 v1.6.0 の新機能

### ✨ 新機能
- **機能名**: 説明
```

## 4. 「こんな時はどうする？」Q&A

### Q: コミットメッセージを間違えた！
直前のコミットメッセージを修正します。
```powershell
git commit --amend -m "正しいメッセージ"
```

### Q: 特定のファイルだけ add を取り消したい
```powershell
git restore --staged <ファイル名>
```

### Q: 最後にコミットした状態まで強制的に戻したい (危険!)
未保存の変更はすべて消えます。
```powershell
git reset --hard HEAD
```

### Q: 複数のPCで開発していて、GitHub側の最新コードを取り込みたい
```powershell
git pull
```

---

## 5. 便利なエイリアス (短縮コマンド)

PowerShell のプロファイルに追加しておくと便利な短縮コマンド例です。

```powershell
# git status を 'gs' だけで実行できるようにする例
New-Alias -Name gs -Value git status
```

---

## 6. 今回の作業の振り返り

トクツーさんが行った `git branch -M main` は、デフォルトのブランチ名を `master` から `main` に変更する重要なステップでした。
現在の GitHub の標準は `main` ですので、今後もこの手順を含めるのが正解です。

### 今後の新規プロジェクト開始テンプレート:
```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
gh repo create <リポジトリ名> --public --source=. --remote=origin --push
```
↑ `gh` (GitHub CLI) を使うと、今回ブラウザで行った作業も1行で完結します。
