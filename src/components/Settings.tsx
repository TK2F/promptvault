import * as React from "react";
import { Settings as SettingsIcon, Moon, Sun, Monitor, Globe, AlertTriangle, Upload, Plus, Replace } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePromptStore } from "@/stores/promptStore";
import { ExportDialog } from "@/components/ExportDialog";
import { getStorageUsage, clearAllData } from "@/lib/storage";
import { getTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import type { StorageData, Prompt, SortMode } from "@/types/prompt";
import { validateData } from "@/lib/storage";
import { generateId, now } from "@/lib/utils";

type ImportMode = "add" | "replace";

export function Settings() {
    const [open, setOpen] = React.useState(false);
    const [storageUsed, setStorageUsed] = React.useState(0);
    const [storageTotal, setStorageTotal] = React.useState(0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);

    // インポート関連
    const [importDialogOpen, setImportDialogOpen] = React.useState(false);
    const [importMode, setImportMode] = React.useState<ImportMode>("add");
    const [pendingImportData, setPendingImportData] = React.useState<Prompt[] | null>(null);
    const [importFileName, setImportFileName] = React.useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { settings, updateSettings, prompts, importPrompts } = usePromptStore();
    const t = getTranslation(settings.language);
    const { toast } = useToast();

    React.useEffect(() => {
        if (open) {
            getStorageUsage().then(({ used, total }) => {
                setStorageUsed(used);
                setStorageTotal(total);
            });
        }
    }, [open]);

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // CSVをパース
    const parseCSV = (text: string): Prompt[] => {
        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const prompts: Prompt[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length < 2) continue;

            const obj: Record<string, string> = {};
            headers.forEach((header, idx) => {
                obj[header] = values[idx] || "";
            });

            const prompt: Prompt = {
                id: obj.id || generateId(),
                name: obj.name || `Prompt ${i}`,
                content: obj.content || "",
                category: obj.category || undefined,
                tags: obj.tags ? obj.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
                isPinned: obj.ispinned === "true",
                sortOrder: obj.sortorder ? parseInt(obj.sortorder, 10) : undefined,
                createdAt: obj.createdat ? new Date(obj.createdat).getTime() : now(),
                updatedAt: obj.updatedat ? new Date(obj.updatedat).getTime() : now(),
            };

            if (prompt.name && prompt.content) {
                prompts.push(prompt);
            }
        }

        return prompts;
    };

    // CSV行をパース（クォート対応）
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    // ファイル選択時
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportFileName(file.name);

        try {
            const text = await file.text();
            let importedPrompts: Prompt[] = [];

            if (file.name.endsWith(".json")) {
                const data = JSON.parse(text);

                // StorageData形式かPrompt配列か判定
                if (validateData(data)) {
                    importedPrompts = (data as StorageData).prompts;
                } else if (Array.isArray(data)) {
                    // 配列の各要素がPrompt形式かを検証
                    const validPrompts = data.filter((item: unknown) => {
                        if (!item || typeof item !== 'object') return false;
                        const p = item as Record<string, unknown>;
                        return typeof p.name === 'string' && typeof p.content === 'string';
                    }) as Prompt[];

                    if (validPrompts.length === 0) {
                        toast({
                            title: t.importInvalid,
                            variant: "destructive",
                        });
                        return;
                    }
                    importedPrompts = validPrompts;
                } else {
                    toast({
                        title: t.importInvalid,
                        variant: "destructive",
                    });
                    return;
                }
            } else if (file.name.endsWith(".csv")) {
                importedPrompts = parseCSV(text);
            } else {
                toast({
                    title: t.importInvalid,
                    variant: "destructive",
                });
                return;
            }

            if (importedPrompts.length === 0) {
                toast({
                    title: settings.language === "ja" ? "インポートするプロンプトがありません" : "No prompts to import",
                    variant: "destructive",
                });
                return;
            }

            // 確認ダイアログを表示
            setPendingImportData(importedPrompts);
            setImportDialogOpen(true);
        } catch (err) {
            toast({
                title: t.importFailed,
                variant: "destructive",
            });
        }

        // ファイル入力をリセット
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // インポート実行
    const handleImportConfirm = async () => {
        if (!pendingImportData) return;

        try {
            if (importMode === "replace") {
                // 既存データをクリアしてからインポート
                await clearAllData();
            }

            await importPrompts(pendingImportData);

            toast({
                title: t.importSuccess,
                description: `${pendingImportData.length} ${t.promptsCount}`,
                variant: "success",
            });

            if (importMode === "replace") {
                // ページをリロード
                setTimeout(() => window.location.reload(), 500);
            }
        } catch {
            toast({
                title: t.importFailed,
                variant: "destructive",
            });
        } finally {
            setImportDialogOpen(false);
            setPendingImportData(null);
            setImportFileName("");
        }
    };

    // 全データ削除処理
    const handleDeleteAll = async () => {
        if (deleteConfirmText !== "DELETE") return;

        setIsDeleting(true);
        try {
            await clearAllData();

            toast({
                title: t.deleteAllSuccess,
                variant: "success",
            });

            setTimeout(() => window.location.reload(), 500);
        } catch {
            toast({
                title: t.importFailed,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setDeleteConfirmText("");
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" title={t.settings}>
                        <SettingsIcon className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t.settings}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Language */}
                        <div>
                            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                {t.language}
                            </label>
                            <Tabs
                                value={settings.language}
                                onValueChange={(value) => updateSettings({ language: value as 'ja' | 'en' })}
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="ja" className="gap-1.5">
                                        🇯🇵 日本語
                                    </TabsTrigger>
                                    <TabsTrigger value="en" className="gap-1.5">
                                        🇺🇸 English
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Theme */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">{t.theme}</label>
                            <Tabs
                                value={settings.theme}
                                onValueChange={(value) => updateSettings({ theme: value as 'light' | 'dark' | 'system' })}
                            >
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="light" className="gap-1">
                                        <Sun className="h-3.5 w-3.5" />
                                        {t.themeLight}
                                    </TabsTrigger>
                                    <TabsTrigger value="dark" className="gap-1">
                                        <Moon className="h-3.5 w-3.5" />
                                        {t.themeDark}
                                    </TabsTrigger>
                                    <TabsTrigger value="system" className="gap-1">
                                        <Monitor className="h-3.5 w-3.5" />
                                        {t.themeSystem}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Font Size */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">{t.fontSize}</label>
                            <Tabs
                                value={settings.fontSize}
                                onValueChange={(value) => updateSettings({ fontSize: value as 'small' | 'medium' | 'large' })}
                            >
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="small">{t.fontSizeSmall}</TabsTrigger>
                                    <TabsTrigger value="medium">{t.fontSizeMedium}</TabsTrigger>
                                    <TabsTrigger value="large">{t.fontSizeLarge}</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Blank Line Mode (for Quick Add) */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">{t.blankLineMode}</label>
                            <Tabs
                                value={settings.blankLineMode || 'keep-one'}
                                onValueChange={(value) => updateSettings({ blankLineMode: value as 'keep-one' | 'remove-all' })}
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="keep-one" className="text-xs">
                                        {t.blankLineModeKeepOne}
                                    </TabsTrigger>
                                    <TabsTrigger value="remove-all" className="text-xs">
                                        {t.blankLineModeRemoveAll}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Sort Mode */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">{t.sortMode}</label>
                            <div className="grid grid-cols-1 gap-1">
                                {[
                                    { value: 'custom', label: t.sortModeCustom },
                                    { value: 'updatedAt-desc', label: t.sortModeUpdatedAtDesc },
                                    { value: 'updatedAt-asc', label: t.sortModeUpdatedAtAsc },
                                    { value: 'createdAt-desc', label: t.sortModeCreatedAtDesc },
                                    { value: 'createdAt-asc', label: t.sortModeCreatedAtAsc },
                                    { value: 'name-asc', label: t.sortModeNameAsc },
                                    { value: 'name-desc', label: t.sortModeNameDesc },
                                ].map((mode) => (
                                    <button
                                        key={mode.value}
                                        onClick={() => updateSettings({ sortMode: mode.value as SortMode })}
                                        className={`
                                            w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md
                                            transition-colors text-left
                                            ${settings.sortMode === mode.value
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary hover:bg-secondary/80"
                                            }
                                        `}
                                    >
                                        <span className="flex-1">{mode.label}</span>
                                        {settings.sortMode === mode.value && (
                                            <span>✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Storage Info */}
                        <div className="pt-4 border-t">
                            <label className="text-sm font-medium mb-2 block">{t.storageUsage}</label>
                            <div className="text-sm text-muted-foreground">
                                <p>{prompts.length} {t.promptsCount}</p>
                                <p>{formatBytes(storageUsed)} / {formatBytes(storageTotal)}</p>
                                <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="pt-4 border-t">
                            <label className="text-sm font-medium mb-3 block">{t.dataManagement}</label>
                            <div className="flex flex-col gap-2">
                                {/* Export */}
                                <ExportDialog />

                                {/* Import */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".json,.csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4" />
                                    {settings.language === "ja" ? "インポート (JSON/CSV)" : "Import (JSON/CSV)"}
                                </Button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-4 border-t border-destructive/30">
                            <label className="text-sm font-medium mb-2 block flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-4 w-4" />
                                {t.dangerZone}
                            </label>
                            <p className="text-xs text-muted-foreground mb-3">
                                {t.deleteAllDataDesc}
                            </p>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => setDeleteConfirmOpen(true)}
                            >
                                {t.deleteAllData}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Import Confirmation Dialog */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            {t.import}
                        </DialogTitle>
                        <DialogDescription>
                            {importFileName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="text-sm bg-muted/50 p-3 rounded-md">
                            {settings.language === "ja"
                                ? `${pendingImportData?.length || 0}件のプロンプトをインポートします`
                                : `Import ${pendingImportData?.length || 0} prompts`
                            }
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {settings.language === "ja" ? "インポート方法" : "Import Mode"}
                            </label>
                            <Tabs value={importMode} onValueChange={(v) => setImportMode(v as ImportMode)}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="add" className="gap-1.5">
                                        <Plus className="h-4 w-4" />
                                        {settings.language === "ja" ? "追加" : "Add"}
                                    </TabsTrigger>
                                    <TabsTrigger value="replace" className="gap-1.5">
                                        <Replace className="h-4 w-4" />
                                        {settings.language === "ja" ? "置換" : "Replace"}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <p className="text-xs text-muted-foreground mt-2">
                                {importMode === "add"
                                    ? (settings.language === "ja"
                                        ? "既存のプロンプトに追加されます"
                                        : "Will be added to existing prompts")
                                    : (settings.language === "ja"
                                        ? "⚠️ 既存のプロンプトは全て削除されます"
                                        : "⚠️ All existing prompts will be deleted")
                                }
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setImportDialogOpen(false);
                                setPendingImportData(null);
                            }}
                        >
                            {t.cancel}
                        </Button>
                        <Button onClick={handleImportConfirm}>
                            {t.import}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            {t.deleteAllData}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            {t.deleteAllConfirm}
                        </p>
                        <p className="text-sm mb-2">{t.typeToConfirm}</p>
                        <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="font-mono"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteConfirmOpen(false);
                                setDeleteConfirmText("");
                            }}
                        >
                            {t.cancel}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAll}
                            disabled={deleteConfirmText !== "DELETE" || isDeleting}
                        >
                            {isDeleting ? "..." : t.delete}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
