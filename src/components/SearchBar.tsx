import * as React from "react";
import { Search, X, CaseSensitive, Tag, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePromptStore } from "@/stores/promptStore";
import { debounce } from "@/lib/utils";
import { getTranslation } from "@/lib/i18n";

export function SearchBar() {
    const [inputValue, setInputValue] = React.useState("");
    const {
        setSearchQuery,
        settings,
        updateSettings,
        filterTags,
        filterCategories,
        removeTagFilter,
        removeCategoryFilter,
        clearFilters,
        hasActiveFilters,
    } = usePromptStore();
    const inputRef = React.useRef<HTMLInputElement>(null);

    const t = getTranslation(settings.language);
    const isActive = hasActiveFilters();

    // debounced search
    const debouncedSearch = React.useMemo(
        () => debounce((query: string) => setSearchQuery(query), 300),
        [setSearchQuery]
    );

    // Auto focus on mount
    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        debouncedSearch(value);
    };

    const handleClear = () => {
        setInputValue("");
        setSearchQuery("");
        inputRef.current?.focus();
    };

    const handleClearAll = () => {
        setInputValue("");
        clearFilters();
        inputRef.current?.focus();
    };

    const toggleCaseSensitive = () => {
        updateSettings({ caseSensitiveSearch: !settings.caseSensitiveSearch });
    };

    return (
        <div className="flex flex-col gap-2 p-3 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={inputValue}
                        onChange={handleInputChange}
                        className="pl-9 pr-9"
                    />
                    {inputValue && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={handleClear}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Case Sensitive Toggle - Modern Switch Style */}
                <button
                    onClick={toggleCaseSensitive}
                    className={`
                        relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                        transition-all duration-200 ease-out
                        ${settings.caseSensitiveSearch
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                        }
                    `}
                    title={t.caseSensitive}
                >
                    <CaseSensitive className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Aa</span>
                    <span className={`
                        w-6 h-3.5 rounded-full relative transition-all duration-200
                        ${settings.caseSensitiveSearch ? "bg-white/30" : "bg-foreground/10"}
                    `}>
                        <span className={`
                            absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-200
                            ${settings.caseSensitiveSearch
                                ? "left-3 bg-white"
                                : "left-0.5 bg-foreground/40"
                            }
                        `} />
                    </span>
                </button>
            </div>

            {/* Active Filters */}
            {(filterTags.length > 0 || filterCategories.length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {/* Category Filters */}
                    {filterCategories.map((category) => (
                        <button
                            key={`cat-${category}`}
                            onClick={() => removeCategoryFilter(category)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                                bg-blue-500/20 text-blue-700 dark:text-blue-300
                                hover:bg-blue-500/30 transition-colors group"
                        >
                            <FolderOpen className="h-3 w-3" />
                            <span>{category}</span>
                            <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                        </button>
                    ))}

                    {/* Tag Filters */}
                    {filterTags.map((tag) => (
                        <button
                            key={`tag-${tag}`}
                            onClick={() => removeTagFilter(tag)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                                bg-emerald-500/20 text-emerald-700 dark:text-emerald-300
                                hover:bg-emerald-500/30 transition-colors group"
                        >
                            <Tag className="h-3 w-3" />
                            <span>{tag}</span>
                            <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                        </button>
                    ))}

                    {/* Clear All */}
                    {isActive && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline ml-1"
                        >
                            {t.clearAll}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
