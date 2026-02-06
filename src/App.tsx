import * as React from "react";
import { SearchBar } from "@/components/SearchBar";
import { PromptList } from "@/components/PromptList";
import { PromptDetail } from "@/components/PromptDetail";
import { ImportDialog } from "@/components/ImportDialog";
import { Settings } from "@/components/Settings";
import { Toaster } from "@/components/ui/toaster";
import { usePromptStore } from "@/stores/promptStore";
import { cn } from "@/lib/utils";

function App() {
    const { initialize, isLoading, isReadOnly, selectedPromptId, settings } = usePromptStore();

    // Initialize store on mount
    React.useEffect(() => {
        initialize();
    }, [initialize]);

    // Apply theme
    React.useEffect(() => {
        const root = document.documentElement;

        if (settings.theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            root.classList.toggle("dark", mediaQuery.matches);

            const handler = (e: MediaQueryListEvent) => {
                root.classList.toggle("dark", e.matches);
            };
            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        } else {
            root.classList.toggle("dark", settings.theme === "dark");
        }
    }, [settings.theme]);

    // Apply font size
    React.useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("font-small", "font-medium", "font-large");
        root.classList.add(`font-${settings.fontSize}`);
    }, [settings.fontSize]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-screen bg-background")}>
            {/* Read-only warning */}
            {isReadOnly && (
                <div className="bg-destructive text-destructive-foreground px-3 py-1.5 text-xs text-center">
                    ⚠️ 読み取り専用モード：データが破損している可能性があります
                </div>
            )}

            {/* Main content */}
            {selectedPromptId ? (
                <PromptDetail />
            ) : (
                <>
                    {/* Header with search */}
                    <div className="flex items-center gap-2 pr-2">
                        <div className="flex-1">
                            <SearchBar />
                        </div>
                        <Settings />
                    </div>

                    {/* Prompt list */}
                    <PromptList />

                    {/* FAB for adding new prompt */}
                    {!isReadOnly && <ImportDialog />}
                </>
            )}

            <Toaster />
        </div>
    );
}

export default App;
