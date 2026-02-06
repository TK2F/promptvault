import * as React from "react";
import { Download, FileJson, FileSpreadsheet, Check, Tag, FolderOpen } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePromptStore } from "@/stores/promptStore";
import { toast } from "@/hooks/use-toast";
import { getTranslation } from "@/lib/i18n";
import type { Prompt } from "@/types/prompt";

type ExportFormat = "json" | "csv";

export function ExportDialog() {
    const [open, setOpen] = React.useState(false);
    const [format, setFormat] = React.useState<ExportFormat>("json");
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

    const { prompts, settings, allCategories, allTags } = usePromptStore();
    const t = getTranslation(settings.language);

    const categories = allCategories();
    const tags = allTags();

    // カテゴリ選択を切り替え
    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    // タグ選択を切り替え
    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    // 全選択/全解除
    const selectAllCategories = () => setSelectedCategories([...categories]);
    const selectNoneCategories = () => setSelectedCategories([]);
    const selectAllTags = () => setSelectedTags([...tags]);
    const selectNoneTags = () => setSelectedTags([]);

    // エクスポート対象のプロンプトを取得
    const getExportPrompts = (): Prompt[] => {
        let filtered = prompts;

        // カテゴリフィルター
        if (selectedCategories.length > 0) {
            filtered = filtered.filter((p) =>
                p.category && selectedCategories.includes(p.category)
            );
        }

        // タグフィルター
        if (selectedTags.length > 0) {
            filtered = filtered.filter((p) =>
                p.tags?.some((tag) => selectedTags.includes(tag))
            );
        }

        return filtered;
    };

    // CSVエスケープ
    const escapeCSV = (value: string | undefined | null): string => {
        if (value === undefined || value === null) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // CSV生成
    const generateCSV = (data: Prompt[]): string => {
        const headers = [
            "id",
            "name",
            "content",
            "category",
            "tags",
            "isPinned",
            "sortOrder",
            "createdAt",
            "updatedAt",
        ];

        const rows = data.map((p) => [
            escapeCSV(p.id),
            escapeCSV(p.name),
            escapeCSV(p.content),
            escapeCSV(p.category),
            escapeCSV(p.tags?.join(", ")),
            p.isPinned ? "true" : "false",
            String(p.sortOrder ?? ""),
            new Date(p.createdAt).toISOString(),
            new Date(p.updatedAt).toISOString(),
        ]);

        return [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");
    };

    // JSON生成
    const generateJSON = (data: Prompt[]): string => {
        const exportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            prompts: data,
            recentPromptIds: [],
            pinnedPromptIds: data.filter((p) => p.isPinned).map((p) => p.id),
            settings: settings,
        };
        return JSON.stringify(exportData, null, 2);
    };

    // ダウンロード処理
    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // エクスポート実行
    const handleExport = () => {
        const exportPrompts = getExportPrompts();

        if (exportPrompts.length === 0) {
            toast({
                title: settings.language === "ja" ? "エクスポート対象がありません" : "No prompts to export",
                variant: "destructive",
            });
            return;
        }

        const date = new Date().toISOString().split("T")[0];
        const filterCount = selectedCategories.length + selectedTags.length;
        const filterLabel = filterCount > 0 ? `_filtered${filterCount}` : "_all";

        if (format === "json") {
            const content = generateJSON(exportPrompts);
            const filename = `promptvault${filterLabel}_${date}.json`;
            downloadFile(content, filename, "application/json");
        } else {
            const content = generateCSV(exportPrompts);
            const filename = `promptvault${filterLabel}_${date}.csv`;
            downloadFile(content, filename, "text/csv");
        }

        toast({
            title: t.exportSuccess,
            description: `${exportPrompts.length} ${t.promptsCount}`,
            variant: "success",
        });
        setOpen(false);
    };

    const exportPromptsCount = getExportPrompts().length;
    const hasFilters = selectedCategories.length > 0 || selectedTags.length > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    {t.export}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.export}</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* フォーマット選択 */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {settings.language === "ja" ? "フォーマット" : "Format"}
                        </label>
                        <Tabs value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="json" className="gap-1.5">
                                    <FileJson className="h-4 w-4" />
                                    JSON
                                </TabsTrigger>
                                <TabsTrigger value="csv" className="gap-1.5">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    CSV
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* カテゴリ選択 */}
                    {categories.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
                                    {settings.language === "ja" ? "カテゴリ" : "Categories"}
                                </label>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={selectAllCategories}
                                    >
                                        {settings.language === "ja" ? "全選択" : "All"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={selectNoneCategories}
                                    >
                                        {settings.language === "ja" ? "解除" : "None"}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border rounded-md bg-muted/30">
                                {categories.map((category) => {
                                    const isSelected = selectedCategories.includes(category);
                                    const count = prompts.filter((p) => p.category === category).length;
                                    return (
                                        <button
                                            key={category}
                                            onClick={() => toggleCategory(category)}
                                            className={`
                                                inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                                                transition-all duration-150
                                                ${isSelected
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25"
                                                }
                                            `}
                                        >
                                            {isSelected && <Check className="h-3 w-3" />}
                                            {category}
                                            <span className="opacity-60">({count})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* タグ選択 */}
                    {tags.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Tag className="h-3.5 w-3.5 text-emerald-500" />
                                    {settings.language === "ja" ? "タグ" : "Tags"}
                                </label>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={selectAllTags}
                                    >
                                        {settings.language === "ja" ? "全選択" : "All"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={selectNoneTags}
                                    >
                                        {settings.language === "ja" ? "解除" : "None"}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border rounded-md bg-muted/30">
                                {tags.map((tag) => {
                                    const isSelected = selectedTags.includes(tag);
                                    const count = prompts.filter((p) => p.tags?.includes(tag)).length;
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`
                                                inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                                                transition-all duration-150
                                                ${isSelected
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                                                }
                                            `}
                                        >
                                            {isSelected && <Check className="h-3 w-3" />}
                                            {tag}
                                            <span className="opacity-60">({count})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* フィルター説明 */}
                    <p className="text-xs text-muted-foreground">
                        {settings.language === "ja"
                            ? hasFilters ? "選択した条件に一致するプロンプトを出力" : "選択なし = 全件出力"
                            : hasFilters ? "Export prompts matching selected filters" : "No selection = Export all"
                        }
                    </p>

                    {/* エクスポート対象数 */}
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        {settings.language === "ja"
                            ? `${exportPromptsCount}件のプロンプトを${format.toUpperCase()}形式でエクスポートします`
                            : `Export ${exportPromptsCount} prompts as ${format.toUpperCase()}`
                        }
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        {t.cancel}
                    </Button>
                    <Button onClick={handleExport} disabled={exportPromptsCount === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        {t.export}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
