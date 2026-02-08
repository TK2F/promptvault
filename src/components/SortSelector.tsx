import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePromptStore } from "@/stores/promptStore";
import { getTranslation } from "@/lib/i18n";
import type { SortMode } from "@/types/prompt";

export function SortSelector() {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const { settings, updateSettings } = usePromptStore();
    const t = getTranslation(settings.language);

    const sortModes: { value: SortMode; label: string }[] = [
        { value: "custom", label: t.sortModeCustom },
        { value: "updatedAt-desc", label: t.sortModeUpdatedAtDesc },
        { value: "updatedAt-asc", label: t.sortModeUpdatedAtAsc },
        { value: "createdAt-desc", label: t.sortModeCreatedAtDesc },
        { value: "createdAt-asc", label: t.sortModeCreatedAtAsc },
        { value: "name-asc", label: t.sortModeNameAsc },
        { value: "name-desc", label: t.sortModeNameDesc },
    ];

    // 外側クリックで閉じる
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (mode: SortMode) => {
        updateSettings({ sortMode: mode });
        setIsOpen(false);
    };

    const currentMode = sortModes.find((m) => m.value === settings.sortMode) || sortModes[0];

    // ダークモードかどうかを判定
    const isDark = document.documentElement.classList.contains("dark");

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                title={`${t.sortMode}: ${currentMode.label}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <ArrowUpDown className="h-4 w-4" />
            </Button>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-1 z-50 w-52 p-1 rounded-md shadow-xl border"
                    style={{
                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                    }}
                >
                    <div
                        className="px-2 py-1.5 text-xs font-medium mb-1 border-b"
                        style={{
                            color: isDark ? '#a1a1aa' : '#71717a',
                            borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                        }}
                    >
                        {t.sortMode}
                    </div>
                    {sortModes.map((mode) => (
                        <button
                            key={mode.value}
                            onClick={() => handleSelect(mode.value)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-colors text-left whitespace-nowrap"
                            style={{
                                backgroundColor: settings.sortMode === mode.value
                                    ? (isDark ? '#3f3f46' : '#e4e4e7')
                                    : 'transparent',
                                color: isDark ? '#fafafa' : '#18181b',
                                fontWeight: settings.sortMode === mode.value ? 500 : 400,
                            }}
                            onMouseEnter={(e) => {
                                if (settings.sortMode !== mode.value) {
                                    e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f4f4f5';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (settings.sortMode !== mode.value) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span className="flex-1">{mode.label}</span>
                            {settings.sortMode === mode.value && (
                                <span style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
