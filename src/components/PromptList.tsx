import * as React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pin, GripVertical, Loader2, Clock } from "lucide-react";
import { PromptCard } from "@/components/PromptCard";
import { usePromptStore } from "@/stores/promptStore";
import { getTranslation } from "@/lib/i18n";
import type { Prompt } from "@/types/prompt";

// ページネーション設定（10,000件対応）
const INITIAL_LOAD = 50;
const LOAD_MORE_COUNT = 50;

interface SortablePromptItemProps {
    prompt: Prompt;
    isPinned?: boolean;
    isRecent?: boolean;
}

function SortablePromptItem({ prompt, isPinned, isRecent }: SortablePromptItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: prompt.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/drag flex items-stretch">
            {/* ドラッグハンドル - カードの左側に配置 */}
            <div
                className="flex items-center justify-center w-6 shrink-0 cursor-grab active:cursor-grabbing touch-none opacity-30 hover:opacity-100 transition-opacity rounded-l-md hover:bg-muted/50"
                {...attributes}
                {...listeners}
                title="ドラッグで並び替え"
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <PromptCard prompt={prompt} isPinned={isPinned} isRecent={isRecent} />
            </div>
        </div>
    );
}

// 読み取り専用のプロンプトアイテム（ドラッグ不可）
function ReadOnlyPromptItem({ prompt, isPinned, isRecent }: SortablePromptItemProps) {
    return (
        <div className="relative">
            <PromptCard prompt={prompt} isPinned={isPinned} isRecent={isRecent} />
        </div>
    );
}

export function PromptList() {
    const {
        searchQuery,
        filteredPrompts,
        pinnedPrompts,
        recentPrompts,
        pinnedPromptIds,
        reorderPrompts,
        settings,
        prompts: allPrompts,
        filterTags,
        filterCategories,
    } = usePromptStore();

    const t = getTranslation(settings.language);
    const [visibleCount, setVisibleCount] = React.useState(INITIAL_LOAD);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    const listRef = React.useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const prompts = filteredPrompts();
    const pinned = pinnedPrompts();
    const recent = recentPrompts();

    // フィルターがアクティブかどうか
    const hasFilters = searchQuery || filterTags.length > 0 || filterCategories.length > 0;

    const showPinned = pinned.length > 0;
    // フィルターアクティブ時には「最近使用」セクションを非表示
    const showRecent = !hasFilters && recent.length > 0;
    const hasAnyPrompts = prompts.length > 0 || showPinned || showRecent;

    // 表示するプロンプト（遅延ロード対応）
    const visiblePrompts = prompts.slice(0, visibleCount);
    const hasMore = prompts.length > visibleCount;

    // 検索クエリ・フィルター変更時にリセット
    React.useEffect(() => {
        setVisibleCount(INITIAL_LOAD);
    }, [searchQuery, filterTags.length, filterCategories.length]);

    // スクロール検知で追加ロード
    const handleScroll = React.useCallback(() => {
        if (!listRef.current || isLoadingMore || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        const scrollRatio = (scrollTop + clientHeight) / scrollHeight;

        // 80%スクロールで追加ロード
        if (scrollRatio > 0.8) {
            setIsLoadingMore(true);
            // 少し遅延を入れてスムーズに
            requestAnimationFrame(() => {
                setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, prompts.length));
                setIsLoadingMore(false);
            });
        }
    }, [isLoadingMore, hasMore, prompts.length]);

    // スクロールイベントリスナー
    React.useEffect(() => {
        const listElement = listRef.current;
        if (!listElement) return;

        listElement.addEventListener('scroll', handleScroll, { passive: true });
        return () => listElement.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // 「すべてのプロンプト」セクション内のみ並べ替え可能
            const allPromptsIds = prompts.map((p) => p.id);
            if (allPromptsIds.includes(active.id as string) && allPromptsIds.includes(over.id as string)) {
                await reorderPrompts(active.id as string, over.id as string);
            }
        }
    };

    if (!hasAnyPrompts) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <p className="text-sm">
                    {hasFilters ? t.noResults : t.noPrompts}
                </p>
                <p className="text-xs mt-1">
                    {hasFilters ? t.tryDifferentKeyword : t.addNewPrompt}
                </p>
                {allPrompts.length > 0 && (
                    <p className="text-xs mt-4 text-muted-foreground/50">
                        {allPrompts.length.toLocaleString()} {t.promptsCount}
                    </p>
                )}
            </div>
        );
    }

    // 「すべてのプロンプト」のみドラッグ可能
    const sortableIds = visiblePrompts.map((p) => p.id);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div
                ref={listRef}
                className="flex flex-col gap-2 p-3 overflow-y-auto flex-1"
            >
                {/* ピン留めセクション（ドラッグ不可） */}
                {showPinned && (
                    <>
                        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1">
                            <Pin className="h-3 w-3" />
                            {t.pinned}
                        </h2>
                        <div className="flex flex-col gap-2 mb-4">
                            {pinned.map((prompt) => (
                                <ReadOnlyPromptItem
                                    key={prompt.id}
                                    prompt={prompt}
                                    isPinned={true}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* 最近使用セクション（ドラッグ不可） */}
                {showRecent && (
                    <>
                        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t.recentlyUsed}
                        </h2>
                        <div className="flex flex-col gap-2 mb-4">
                            {recent.slice(0, 5).map((prompt) => (
                                <ReadOnlyPromptItem
                                    key={prompt.id}
                                    prompt={prompt}
                                    isRecent
                                    isPinned={pinnedPromptIds.includes(prompt.id)}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* すべてのプロンプト（ドラッグ可能） */}
                {visiblePrompts.length > 0 && (
                    <SortableContext
                        items={sortableIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {(showPinned || showRecent) && (
                            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                                {hasFilters ? t.searchResults : t.allPrompts}
                            </h2>
                        )}
                        <div className="flex flex-col gap-2">
                            {visiblePrompts.map((prompt) => (
                                <SortablePromptItem
                                    key={prompt.id}
                                    prompt={prompt}
                                    isPinned={pinnedPromptIds.includes(prompt.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                )}

                {/* ロード中インジケータ */}
                {isLoadingMore && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                )}

                {/* 件数表示 */}
                <div className="text-center text-xs text-muted-foreground/50 py-2">
                    {hasMore
                        ? `${visibleCount.toLocaleString()} / ${prompts.length.toLocaleString()} ${t.promptsCount}`
                        : `${(pinned.length + prompts.length).toLocaleString()} ${t.promptsCount}`
                    }
                </div>
            </div>
        </DndContext>
    );
}
