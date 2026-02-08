import * as React from "react";
import { HelpCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePromptStore } from "@/stores/promptStore";
import { getTranslation } from "@/lib/i18n";

const guideContentJa = `
## 基本操作

### プロンプトの追加
1. **「＋」ボタン**をクリック
2. 名前、内容、カテゴリ、タグを入力
3. 「保存」をクリック

### 右クリックで追加（クイック追加）
1. Webページでテキストをハイライト
2. **右クリック → 「PromptVaultに追加」**
3. 自動的に保存されます

### プロンプトの使用
- **クリック**でプロンプトを選択
- **コピーボタン**でクリップボードにコピー
- **編集ボタン**で内容を編集

### フィルタリング
- **検索バー**でテキスト検索
- **タグ/カテゴリ**をクリックでフィルタ
- **再クリック**でフィルター解除
- **◯ボタン**で未設定のみ表示

### 並び替え順
- **↑↓ボタン**（ヘッダー）または**設定**から切替
- **カスタム順** - ドラッグ&ドロップで設定
- **更新/登録日時** - 新→古、古→新から選択
- **名前順** - A→Z、Z→Aから選択

### データ管理
- 設定 → エクスポート（JSON/CSV）
- 設定 → インポート（追加/置換モード）

---

**空行の処理**: 設定で「空行を保持（1つまで）」または「空行を削除」を選べます。
`;

const guideContentEn = `
## Basic Operations

### Adding Prompts
1. Click the **"+" button**
2. Enter name, content, category, and tags
3. Click "Save"

### Quick Add (Right-Click)
1. Highlight text on any webpage
2. **Right-click → "Add to PromptVault"**
3. Automatically saved

### Using Prompts
- **Click** to select a prompt
- **Copy button** to copy to clipboard
- **Edit button** to modify content

### Filtering
- **Search bar** for text search
- Click **tags/categories** to filter
- **Click again** to remove filter
- **◯ button** to show unconfigured only

### Sort Order
- **↑↓ button** (header) or **Settings** to change
- **Custom** - Set via drag & drop
- **Updated/Created** - Choose New→Old or Old→New
- **Name** - Choose A→Z or Z→A

### Data Management
- Settings → Export (JSON/CSV)
- Settings → Import (Add/Replace mode)

---

**Blank line handling**: In settings, choose "Keep blank lines (max 1)" or "Remove all".
`;

export function QuickGuide() {
    const [open, setOpen] = React.useState(false);
    const { settings } = usePromptStore();
    const t = getTranslation(settings.language);

    const guideContent = settings.language === 'ja' ? guideContentJa : guideContentEn;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title={t.quickGuide}>
                    <HelpCircle className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        {t.quickGuideTitle}
                    </DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div
                        className="text-sm space-y-3"
                        dangerouslySetInnerHTML={{
                            __html: guideContent
                                .replace(/^## (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
                                .replace(/^### (.+)$/gm, '<h4 class="text-sm font-medium mt-3 mb-1">$1</h4>')
                                .replace(/^\d\. \*\*(.+?)\*\*(.*)$/gm, '<p class="ml-2">• <strong>$1</strong>$2</p>')
                                .replace(/^- \*\*(.+?)\*\*(.*)$/gm, '<p class="ml-2">• <strong>$1</strong>$2</p>')
                                .replace(/^---$/gm, '<hr class="my-3 border-muted"/>')
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n\n/g, '')
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
