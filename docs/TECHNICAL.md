# Technical Specification / 技術仕様書

## Architecture / アーキテクチャ

```
src/
├── components/          # React UI コンポーネント
│   ├── ui/              # shadcn/ui ベースコンポーネント
│   ├── PromptCard.tsx   # プロンプトカード（タグ/カテゴリフィルター対応）
│   ├── PromptList.tsx   # プロンプトリスト（遅延ロード対応）
│   ├── PromptDetail.tsx # プロンプト詳細・編集
│   ├── SearchBar.tsx    # 検索バー（フィルターバッジ付き）
│   ├── Settings.tsx     # 設定ダイアログ
│   ├── ExportDialog.tsx # エクスポートダイアログ（タグ/カテゴリフィルター）
│   └── ImportDialog.tsx # プロンプト追加ダイアログ
├── lib/
│   ├── i18n.ts          # 多言語対応（日本語/英語）
│   ├── search.ts        # 検索ロジック（キャッシュ付き）
│   ├── storage.ts       # Chrome Storage API ラッパー
│   └── utils.ts         # ユーティリティ関数
├── stores/
│   └── promptStore.ts   # Zustand ストア
├── types/
│   └── prompt.ts        # TypeScript 型定義
└── hooks/
    └── use-toast.ts     # トースト通知フック
```

---

## Data Models / データモデル

### Prompt

```typescript
interface Prompt {
  id: string;           // ユニーク ID (UUID v4)
  name: string;         // プロンプト名
  content: string;      // プロンプト本文（Markdown対応）
  category?: string;    // カテゴリ
  tags?: string[];      // タグ配列
  isPinned?: boolean;   // ピン留めフラグ
  sortOrder?: number;   // 並び順（D&D用）
  createdAt: number;    // 作成日時（Unix timestamp）
  updatedAt: number;    // 更新日時（Unix timestamp）
}
```

### Settings

```typescript
interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: 'ja' | 'en';
  caseSensitiveSearch: boolean;
}
```

### StorageData

```typescript
interface StorageData {
  prompts: Prompt[];
  recentPromptIds: string[];  // 最大10件
  pinnedPromptIds: string[];
  settings: Settings;
  version: number;            // データマイグレーション用
}
```

---

## Storage / ストレージ

| Storage | Limit | Usage |
|---------|-------|-------|
| `chrome.storage.local` | 5MB | プロンプト、設定、履歴 |

### Capacity Estimation / 容量見積もり

| Prompts | Avg. Size | Total |
|---------|-----------|-------|
| 10,000 | ~500 bytes | ~5 MB |

> プロンプトサイズにより上限は変動します。大きなプロンプトが多い場合は警告を表示します。

---

## Performance Optimizations / パフォーマンス最適化

### Search / 検索

1. **キャッシュ**: 同一クエリの結果をキャッシュ（最大100件）
2. **早期終了**: 名前 → カテゴリ → タグ → 内容の順でチェック、マッチしたら即終了
3. **正規化**: クエリは事前にトリム＆小文字化

### Rendering / 描画

1. **遅延ロード**: 初期50件、スクロールで追加（50件ずつ）
2. **スクロール検知**: `requestAnimationFrame` でスムーズな追加
3. **メモ化**: `React.useMemo` で不要な再計算を防止

### State Management / 状態管理

1. **Zustand**: シンプルで高速な状態管理
2. **セレクタ**: 必要なデータのみ購読

---

## Browser APIs / ブラウザ API

| API | Purpose |
|-----|---------|
| `chrome.storage.local` | データ永続化 |
| `chrome.sidePanel` | サイドパネル表示 |
| `navigator.clipboard` | クリップボードコピー |

---

## Build / ビルド

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
```

### Output

| File | Size (gzip) |
|------|-------------|
| sidepanel.js | ~160 KB |
| sidepanel.css | ~8 KB |

---

## Testing / テスト

### Manual Testing Checklist

- [ ] プロンプト追加/編集/削除
- [ ] 検索（大文字/小文字区別）
- [ ] タグ/カテゴリフィルタリング
- [ ] ピン留め/解除
- [ ] ドラッグ&ドロップ
- [ ] エクスポート（JSON/CSV、タグ/カテゴリフィルター）
- [ ] インポート（JSON/CSV、追加/置換モード）
- [ ] テーマ切り替え
- [ ] 言語切り替え
- [ ] 10,000件でのパフォーマンス

---

## Known Limitations / 既知の制限

1. **ストレージ上限**: chrome.storage.local は 5MB まで
2. **大きなプロンプト**: 1プロンプト > 100KB は非推奨
3. **同期非対応**: chrome.storage.sync は使用していません（100KB制限のため）

---

## Future Improvements / 将来の改善

- [ ] クラウド同期（Firebase等）
- [ ] テンプレート変数（`{{variable}}`）
- [ ] フォルダ構造
- [ ] 履歴・バージョン管理
- [ ] E2Eテスト
