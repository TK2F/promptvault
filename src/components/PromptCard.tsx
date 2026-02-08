import { Copy, Edit2, Trash2, Clock, Pin, PinOff, Tag, FolderOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePromptStore } from "@/stores/promptStore";
import { toast } from "@/hooks/use-toast";
import { truncate, formatDate } from "@/lib/utils";
import { getTranslation } from "@/lib/i18n";
import type { Prompt } from "@/types/prompt";

interface PromptCardProps {
    prompt: Prompt;
    isRecent?: boolean;
    isPinned?: boolean;
}

export function PromptCard({ prompt, isRecent, isPinned }: PromptCardProps) {
    const {
        selectPrompt,
        deletePrompt,
        addToRecent,
        togglePin,
        settings,
        addTagFilter,
        removeTagFilter,
        addCategoryFilter,
        removeCategoryFilter,
        filterTags,
        filterCategories,
    } = usePromptStore();
    const t = getTranslation(settings.language);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
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

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`「${prompt.name}」${t.confirmDelete}`)) {
            await deletePrompt(prompt.id);
            toast({
                title: t.deleted,
                description: prompt.name,
            });
        }
    };

    const handleTogglePin = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await togglePin(prompt.id);
        toast({
            title: isPinned ? t.unpinned : t.pinned_msg,
            description: prompt.name,
        });
    };

    const handleClick = () => {
        selectPrompt(prompt.id);
    };

    // タグクリック：トグル動作（選択済みなら解除、未選択なら追加）
    const handleTagClick = (e: React.MouseEvent, tag: string) => {
        e.stopPropagation();
        if (filterTags.includes(tag)) {
            removeTagFilter(tag);
        } else {
            addTagFilter(tag);
        }
    };

    // カテゴリクリック：トグル動作（選択済みなら解除、未選択なら追加）
    const handleCategoryClick = (e: React.MouseEvent, category: string) => {
        e.stopPropagation();
        if (filterCategories.includes(category)) {
            removeCategoryFilter(category);
        } else {
            addCategoryFilter(category);
        }
    };

    return (
        <Card
            className={`group p-3 cursor-pointer hover:bg-accent/50 transition-colors animate-fade-in ${isPinned ? "border-primary/30 bg-primary/5" : ""
                }`}
            onClick={handleClick}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {isPinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                        {isRecent && !isPinned && <Clock className="h-3 w-3 text-muted-foreground shrink-0" />}
                        <h3 className="font-medium text-sm truncate">{prompt.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {truncate(prompt.content, 100)}
                    </p>
                    {/* カテゴリ・タグ表示（クリックでフィルター） */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {prompt.category && (
                            <button
                                onClick={(e) => handleCategoryClick(e, prompt.category!)}
                                className={`
                                    inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full
                                    transition-all duration-150 hover:scale-105
                                    ${filterCategories.includes(prompt.category)
                                        ? "bg-blue-500 text-white"
                                        : "bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25"
                                    }
                                `}
                            >
                                <FolderOpen className="h-2.5 w-2.5" />
                                {prompt.category}
                            </button>
                        )}
                        {prompt.tags?.map((tag) => (
                            <button
                                key={tag}
                                onClick={(e) => handleTagClick(e, tag)}
                                className={`
                                    inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full
                                    transition-all duration-150 hover:scale-105
                                    ${filterTags.includes(tag)
                                        ? "bg-emerald-500 text-white"
                                        : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                                    }
                                `}
                            >
                                <Tag className="h-2.5 w-2.5" />
                                {tag}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDate(prompt.updatedAt)}
                    </p>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleTogglePin}
                        title={isPinned ? t.unpin : t.pin}
                    >
                        {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCopy}
                        title={t.copy}
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); selectPrompt(prompt.id); }}
                        title={t.edit}
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={handleDelete}
                        title={t.delete}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
