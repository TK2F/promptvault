import { create } from 'zustand';
import type { Prompt, Settings } from '@/types/prompt';
import { DEFAULT_SETTINGS } from '@/types/prompt';
import { saveData, loadData } from '@/lib/storage';
import { searchPrompts, sortByUpdatedAt, clearSearchCache } from '@/lib/search';
import { generateId, now, parseTags } from '@/lib/utils';

interface PromptStore {
    // State
    prompts: Prompt[];
    recentPromptIds: string[];
    pinnedPromptIds: string[];
    settings: Settings;
    searchQuery: string;
    filterTags: string[];
    filterCategories: string[];
    showUnconfigured: boolean;
    isLoading: boolean;
    isReadOnly: boolean;
    selectedPromptId: string | null;
    isEditing: boolean;
    hasUnsavedChanges: boolean;

    // Computed
    filteredPrompts: () => Prompt[];
    pinnedPrompts: () => Prompt[];
    recentPrompts: () => Prompt[];
    selectedPrompt: () => Prompt | null;

    // Actions
    initialize: () => Promise<void>;
    setSearchQuery: (query: string) => void;
    selectPrompt: (id: string | null) => void;

    // CRUD
    createPrompt: (name: string, content: string, category?: string, tags?: string[]) => Promise<Prompt>;
    updatePrompt: (id: string, updates: Partial<Pick<Prompt, 'name' | 'content' | 'category' | 'tags'>>) => Promise<void>;
    deletePrompt: (id: string) => Promise<void>;

    // Pin
    togglePin: (id: string) => Promise<void>;

    // Reorder
    reorderPrompts: (activeId: string, overId: string) => Promise<void>;

    // Edit mode
    startEditing: () => void;
    cancelEditing: () => void;
    setHasUnsavedChanges: (value: boolean) => void;

    // Settings
    updateSettings: (updates: Partial<Settings>) => Promise<void>;

    // Recent
    addToRecent: (id: string) => Promise<void>;

    // Import/Export
    importPrompts: (prompts: Partial<Prompt>[]) => Promise<void>;

    // Filters
    addTagFilter: (tag: string) => void;
    removeTagFilter: (tag: string) => void;
    addCategoryFilter: (category: string) => void;
    removeCategoryFilter: (category: string) => void;
    clearFilters: () => void;
    hasActiveFilters: () => boolean;
    toggleShowUnconfigured: () => void;
    allCategories: () => string[];
    allTags: () => string[];
}

const MAX_RECENT = 10;

export const usePromptStore = create<PromptStore>((set, get) => ({
    // Initial state
    prompts: [],
    recentPromptIds: [],
    pinnedPromptIds: [],
    settings: { ...DEFAULT_SETTINGS },
    searchQuery: '',
    filterTags: [],
    filterCategories: [],
    showUnconfigured: false,
    isLoading: true,
    isReadOnly: false,
    selectedPromptId: null,
    isEditing: false,
    hasUnsavedChanges: false,

    // Computed - ピン留めを除く、更新日順
    filteredPrompts: () => {
        const { prompts, searchQuery, settings, pinnedPromptIds, filterTags, filterCategories, showUnconfigured } = get();
        let filtered = searchPrompts(prompts, searchQuery, settings.caseSensitiveSearch);

        // タグフィルター適用
        if (filterTags.length > 0) {
            filtered = filtered.filter((p) =>
                p.tags?.some((tag) => filterTags.includes(tag))
            );
        }

        // カテゴリフィルター適用
        if (filterCategories.length > 0) {
            filtered = filtered.filter((p) =>
                p.category && filterCategories.includes(p.category)
            );
        }

        // 未設定フィルター適用
        if (showUnconfigured) {
            filtered = filtered.filter((p) =>
                !p.category && (!p.tags || p.tags.length === 0)
            );
        }

        // ピン留め以外をフィルタ
        const nonPinned = filtered.filter((p) => !pinnedPromptIds.includes(p.id));
        return sortByUpdatedAt(nonPinned);
    },

    // ピン留めされたプロンプト（フィルター適用）
    pinnedPrompts: () => {
        const { prompts, pinnedPromptIds, searchQuery, settings, filterTags, filterCategories } = get();

        // ピン留めIDに基づいてプロンプトを取得
        let pinned = pinnedPromptIds
            .map((id) => prompts.find((p) => p.id === id))
            .filter((p): p is Prompt => p !== undefined);

        // 検索フィルター適用
        if (searchQuery) {
            const searchResults = searchPrompts(prompts, searchQuery, settings.caseSensitiveSearch);
            const searchIds = new Set(searchResults.map((p) => p.id));
            pinned = pinned.filter((p) => searchIds.has(p.id));
        }

        // タグフィルター適用
        if (filterTags.length > 0) {
            pinned = pinned.filter((p) =>
                p.tags?.some((tag) => filterTags.includes(tag))
            );
        }

        // カテゴリフィルター適用
        if (filterCategories.length > 0) {
            pinned = pinned.filter((p) =>
                p.category && filterCategories.includes(p.category)
            );
        }

        return pinned;
    },

    recentPrompts: () => {
        const { prompts, recentPromptIds, pinnedPromptIds } = get();
        return recentPromptIds
            .filter((id) => !pinnedPromptIds.includes(id)) // ピン留めは除外
            .map((id) => prompts.find((p) => p.id === id))
            .filter((p): p is Prompt => p !== undefined);
    },

    selectedPrompt: () => {
        const { prompts, selectedPromptId } = get();
        return prompts.find((p) => p.id === selectedPromptId) || null;
    },

    // Actions
    initialize: async () => {
        try {
            const data = await loadData();
            set({
                prompts: data.prompts,
                recentPromptIds: data.recentPromptIds,
                pinnedPromptIds: data.pinnedPromptIds || [],
                settings: data.settings,
                isLoading: false,
                isReadOnly: false,
            });
        } catch (error) {
            console.error('Failed to initialize store:', error);
            set({
                isLoading: false,
                isReadOnly: true,
            });
        }
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    selectPrompt: (id: string | null) => {
        const { hasUnsavedChanges } = get();
        if (hasUnsavedChanges) {
            return;
        }
        set({ selectedPromptId: id, isEditing: false });
    },

    // CRUD
    createPrompt: async (name, content, category, tags) => {
        const { prompts, recentPromptIds, pinnedPromptIds, settings, isReadOnly } = get();

        if (isReadOnly) {
            throw new Error('Read-only mode: Cannot create prompts');
        }

        const timestamp = now();
        const newPrompt: Prompt = {
            id: generateId(),
            name,
            content,
            category,
            tags,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const newPrompts = [newPrompt, ...prompts];
        const newRecentIds = [newPrompt.id, ...recentPromptIds].slice(0, MAX_RECENT);

        set({ prompts: newPrompts, recentPromptIds: newRecentIds });
        clearSearchCache(); // プロンプト変更時にキャッシュクリア

        await saveData({
            prompts: newPrompts,
            recentPromptIds: newRecentIds,
            pinnedPromptIds,
            settings,
            version: 1,
        });

        return newPrompt;
    },

    updatePrompt: async (id, updates) => {
        const { prompts, recentPromptIds, pinnedPromptIds, settings, isReadOnly } = get();

        if (isReadOnly) {
            throw new Error('Read-only mode: Cannot update prompts');
        }

        const newPrompts = prompts.map((p) =>
            p.id === id
                ? { ...p, ...updates, updatedAt: now() }
                : p
        );

        set({ prompts: newPrompts, isEditing: false, hasUnsavedChanges: false });

        await saveData({
            prompts: newPrompts,
            recentPromptIds,
            pinnedPromptIds,
            settings,
            version: 1,
        });
    },

    deletePrompt: async (id) => {
        const { prompts, recentPromptIds, pinnedPromptIds, settings, isReadOnly, selectedPromptId } = get();

        if (isReadOnly) {
            throw new Error('Read-only mode: Cannot delete prompts');
        }

        const newPrompts = prompts.filter((p) => p.id !== id);
        const newRecentIds = recentPromptIds.filter((rid) => rid !== id);
        const newPinnedIds = pinnedPromptIds.filter((pid) => pid !== id);

        set({
            prompts: newPrompts,
            recentPromptIds: newRecentIds,
            pinnedPromptIds: newPinnedIds,
            selectedPromptId: selectedPromptId === id ? null : selectedPromptId,
        });

        await saveData({
            prompts: newPrompts,
            recentPromptIds: newRecentIds,
            pinnedPromptIds: newPinnedIds,
            settings,
            version: 1,
        });
    },

    // Pin toggle
    togglePin: async (id) => {
        const { prompts, recentPromptIds, pinnedPromptIds, settings, isReadOnly } = get();

        if (isReadOnly) {
            throw new Error('Read-only mode: Cannot pin prompts');
        }

        const isPinned = pinnedPromptIds.includes(id);
        const newPinnedIds = isPinned
            ? pinnedPromptIds.filter((pid) => pid !== id)
            : [...pinnedPromptIds, id];

        // プロンプトのisPinnedフラグも更新
        const newPrompts = prompts.map((p) =>
            p.id === id ? { ...p, isPinned: !isPinned } : p
        );

        set({ pinnedPromptIds: newPinnedIds, prompts: newPrompts });

        await saveData({
            prompts: newPrompts,
            recentPromptIds,
            pinnedPromptIds: newPinnedIds,
            settings,
            version: 1,
        });
    },

    // Reorder prompts (drag and drop)
    reorderPrompts: async (activeId, overId) => {
        const { prompts, recentPromptIds, pinnedPromptIds, settings, isReadOnly } = get();

        if (isReadOnly) {
            throw new Error('Read-only mode: Cannot reorder prompts');
        }

        const oldIndex = prompts.findIndex((p) => p.id === activeId);
        const newIndex = prompts.findIndex((p) => p.id === overId);

        if (oldIndex === -1 || newIndex === -1) return;

        const newPrompts = [...prompts];
        const [removed] = newPrompts.splice(oldIndex, 1);
        newPrompts.splice(newIndex, 0, removed);

        // sortOrderを更新
        const updatedPrompts = newPrompts.map((p, index) => ({
            ...p,
            sortOrder: index,
        }));

        set({ prompts: updatedPrompts });

        await saveData({
            prompts: updatedPrompts,
            recentPromptIds,
            pinnedPromptIds,
            settings,
            version: 1,
        });
    },

    // Edit mode
    startEditing: () => {
        set({ isEditing: true });
    },

    cancelEditing: () => {
        set({ isEditing: false, hasUnsavedChanges: false });
    },

    setHasUnsavedChanges: (value: boolean) => {
        set({ hasUnsavedChanges: value });
    },

    // Settings
    updateSettings: async (updates) => {
        const { prompts, recentPromptIds, pinnedPromptIds, settings } = get();

        const newSettings = { ...settings, ...updates };
        set({ settings: newSettings });

        await saveData({
            prompts,
            recentPromptIds,
            pinnedPromptIds,
            settings: newSettings,
            version: 1,
        });
    },

    // Recent
    addToRecent: async (id) => {
        const { prompts, recentPromptIds, pinnedPromptIds, settings } = get();

        const newRecentIds = [id, ...recentPromptIds.filter((rid) => rid !== id)].slice(0, MAX_RECENT);
        set({ recentPromptIds: newRecentIds });

        await saveData({
            prompts,
            recentPromptIds: newRecentIds,
            pinnedPromptIds,
            settings,
            version: 1,
        });
    },

    // Import
    importPrompts: async (promptsToImport) => {
        const { prompts, recentPromptIds, pinnedPromptIds, settings, isReadOnly } = get();

        if (isReadOnly) {
            throw new Error('Read-only mode: Cannot import prompts');
        }

        const timestamp = now();
        const newPrompts: Prompt[] = promptsToImport.map((p) => ({
            id: generateId(),
            name: p.name || 'Untitled',
            content: p.content || '',
            category: p.category,
            tags: p.tags ? parseTags(p.tags.join(',')) : undefined,
            createdAt: timestamp,
            updatedAt: timestamp,
        }));

        const allPrompts = [...newPrompts, ...prompts];
        set({ prompts: allPrompts });

        await saveData({
            prompts: allPrompts,
            recentPromptIds,
            pinnedPromptIds,
            settings,
            version: 1,
        });
    },

    // Filters
    addTagFilter: (tag) => {
        const { filterTags } = get();
        if (!filterTags.includes(tag)) {
            set({ filterTags: [...filterTags, tag] });
        }
    },

    removeTagFilter: (tag) => {
        const { filterTags } = get();
        set({ filterTags: filterTags.filter((t) => t !== tag) });
    },

    addCategoryFilter: (category) => {
        const { filterCategories } = get();
        if (!filterCategories.includes(category)) {
            set({ filterCategories: [...filterCategories, category] });
        }
    },

    removeCategoryFilter: (category) => {
        const { filterCategories } = get();
        set({ filterCategories: filterCategories.filter((c) => c !== category) });
    },

    clearFilters: () => {
        set({ filterTags: [], filterCategories: [], searchQuery: '', showUnconfigured: false });
    },

    hasActiveFilters: () => {
        const { filterTags, filterCategories, searchQuery, showUnconfigured } = get();
        return filterTags.length > 0 || filterCategories.length > 0 || searchQuery !== '' || showUnconfigured;
    },

    toggleShowUnconfigured: () => {
        const { showUnconfigured } = get();
        set({ showUnconfigured: !showUnconfigured });
    },

    allCategories: () => {
        const { prompts } = get();
        const cats = new Set<string>();
        prompts.forEach((p) => {
            if (p.category) cats.add(p.category);
        });
        return Array.from(cats).sort();
    },

    allTags: () => {
        const { prompts } = get();
        const tags = new Set<string>();
        prompts.forEach((p) => {
            p.tags?.forEach((tag) => tags.add(tag));
        });
        return Array.from(tags).sort();
    },
}));
