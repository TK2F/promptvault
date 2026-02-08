import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Edit2, Copy, Save, X, Pin, PinOff, FolderOpen, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePromptStore } from "@/stores/promptStore";
import { toast } from "@/hooks/use-toast";
import { parseTags } from "@/lib/utils";
import { getTranslation } from "@/lib/i18n";

export function PromptDetail() {
    const {
        selectedPrompt,
        selectPrompt,
        updatePrompt,
        addToRecent,
        togglePin,
        pinnedPromptIds,
        isEditing,
        startEditing,
        cancelEditing,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        settings,
        addTagFilter,
        removeTagFilter,
        addCategoryFilter,
        removeCategoryFilter,
        filterTags,
        filterCategories,
    } = usePromptStore();

    const t = getTranslation(settings.language);
    const prompt = selectedPrompt();

    const [editName, setEditName] = React.useState("");
    const [editContent, setEditContent] = React.useState("");
    const [editCategory, setEditCategory] = React.useState("");
    const [tagsInput, setTagsInput] = React.useState("");
    const [editTags, setEditTags] = React.useState<string[]>([]);

    const isPinned = prompt ? pinnedPromptIds.includes(prompt.id) : false;

    // Sync editing state with selected prompt
    React.useEffect(() => {
        if (prompt) {
            setEditName(prompt.name);
            setEditContent(prompt.content);
            setEditCategory(prompt.category || "");
            setEditTags(prompt.tags || []);
            setTagsInput("");
        }
    }, [prompt]);

    // Track unsaved changes
    React.useEffect(() => {
        if (prompt && isEditing) {
            const hasChanges =
                editName !== prompt.name ||
                editContent !== prompt.content ||
                editCategory !== (prompt.category || "") ||
                JSON.stringify(editTags) !== JSON.stringify(prompt.tags || []);
            setHasUnsavedChanges(hasChanges);
        }
    }, [editName, editContent, editCategory, editTags, prompt, isEditing, setHasUnsavedChanges]);

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isEditing) {
                if (e.key === "Escape") {
                    handleCancel();
                } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                    e.preventDefault();
                    handleSave();
                }
            } else if (e.key === "Escape" && prompt) {
                selectPrompt(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEditing, editName, editContent, editCategory, editTags, prompt]);

    if (!prompt) {
        return null;
    }

    // タグ入力のハンドリング
    const handleTagsInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
            e.preventDefault();
            addTagsFromInput();
        }
    };

    const addTagsFromInput = () => {
        const newTags = parseTags(tagsInput);
        if (newTags.length > 0) {
            setEditTags((prev) => [...new Set([...prev, ...newTags])]);
            setTagsInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setEditTags((prev) => prev.filter((t) => t !== tagToRemove));
    };

    const handleBack = () => {
        if (hasUnsavedChanges) {
            if (confirm(t.unsavedChanges)) {
                cancelEditing();
                selectPrompt(null);
            }
        } else {
            cancelEditing();
            selectPrompt(null);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt.content);
            await addToRecent(prompt.id);
            toast({
                title: t.copied,
                description: prompt.name,
                variant: "success",
            });
        } catch {
            toast({
                title: t.copyFailed,
                variant: "destructive",
            });
        }
    };

    const handleTogglePin = async () => {
        await togglePin(prompt.id);
        toast({
            title: isPinned ? t.unpinned : t.pinned_msg,
            description: prompt.name,
        });
    };

    const handleSave = async () => {
        if (!editName.trim()) {
            toast({
                title: t.nameRequired,
                variant: "destructive",
            });
            return;
        }

        // 残りのタグ入力も処理
        const finalTags = [...new Set([...editTags, ...parseTags(tagsInput)])];

        await updatePrompt(prompt.id, {
            name: editName.trim(),
            content: editContent,
            category: editCategory.trim() || undefined,
            tags: finalTags.length > 0 ? finalTags : undefined,
        });

        toast({
            title: t.saved,
            variant: "success",
        });
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            if (confirm(t.unsavedChanges)) {
                setEditName(prompt.name);
                setEditContent(prompt.content);
                setEditCategory(prompt.category || "");
                setEditTags(prompt.tags || []);
                setTagsInput("");
                cancelEditing();
            }
        } else {
            cancelEditing();
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>

                {isEditing ? (
                    <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 font-medium"
                        placeholder={t.promptName}
                    />
                ) : (
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                        {isPinned && <Pin className="h-4 w-4 text-primary shrink-0" />}
                        <h2 className="font-medium truncate">{prompt.name}</h2>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" size="icon" onClick={handleCancel} title={`${t.cancel} (Esc)`}>
                                <X className="h-4 w-4" />
                            </Button>
                            <Button variant="default" size="icon" onClick={handleSave} title={`${t.save} (Ctrl+S)`}>
                                <Save className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="icon" onClick={handleTogglePin} title={isPinned ? t.unpin : t.pin}>
                                {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleCopy} title={t.copy}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={startEditing} title={t.edit}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {isEditing ? (
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">{t.category}</label>
                            <Input
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                placeholder={`${t.category} (${t.optional})`}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                                {t.tags}
                                <span className="text-xs text-muted-foreground ml-2">
                                    {t.tagsHint}
                                </span>
                            </label>
                            <Input
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                onKeyDown={handleTagsInputKeyDown}
                                onBlur={addTagsFromInput}
                                placeholder={t.enterTagsPlaceholder}
                            />
                            {editTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {editTags.map((tag) => (
                                        <span key={tag} className="tag">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="tag-remove ml-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">{t.promptContent}</label>
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[400px] font-mono text-sm"
                                placeholder={t.promptContent}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        {/* カテゴリ・タグ表示（クリックでフィルター適用してリストに戻る） */}
                        <div className="flex flex-wrap gap-1 mb-4 not-prose">
                            {prompt.category && (
                                <button
                                    onClick={() => {
                                        if (filterCategories.includes(prompt.category!)) {
                                            removeCategoryFilter(prompt.category!);
                                        } else {
                                            addCategoryFilter(prompt.category!);
                                        }
                                        selectPrompt(null);
                                    }}
                                    className={`
                                        inline-flex items-center gap-0.5 px-2 py-1 text-xs rounded-full
                                        transition-all duration-150 hover:scale-105
                                        ${filterCategories.includes(prompt.category)
                                            ? "bg-blue-500 text-white"
                                            : "bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25"
                                        }
                                    `}
                                >
                                    <FolderOpen className="h-3 w-3" />
                                    {prompt.category}
                                </button>
                            )}
                            {prompt.tags?.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        if (filterTags.includes(tag)) {
                                            removeTagFilter(tag);
                                        } else {
                                            addTagFilter(tag);
                                        }
                                        selectPrompt(null);
                                    }}
                                    className={`
                                        inline-flex items-center gap-0.5 px-2 py-1 text-xs rounded-full
                                        transition-all duration-150 hover:scale-105
                                        ${filterTags.includes(tag)
                                            ? "bg-emerald-500 text-white"
                                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                                        }
                                    `}
                                >
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {prompt.content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
