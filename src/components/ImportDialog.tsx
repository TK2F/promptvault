import * as React from "react";
import { Plus, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePromptStore } from "@/stores/promptStore";
import { toast } from "@/hooks/use-toast";
import { parseTags } from "@/lib/utils";
import { getTranslation } from "@/lib/i18n";

export function ImportDialog() {
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [content, setContent] = React.useState("");
    const [category, setCategory] = React.useState("");
    const [tagsInput, setTagsInput] = React.useState("");
    const [tags, setTags] = React.useState<string[]>([]);

    const { createPrompt, settings } = usePromptStore();
    const t = getTranslation(settings.language);

    // タグ入力のハンドリング
    const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagsInput(e.target.value);
    };

    const handleTagsInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Enter、Tab、カンマでタグを確定
        if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
            e.preventDefault();
            addTagsFromInput();
        }
    };

    const handleTagsInputBlur = () => {
        addTagsFromInput();
    };

    const addTagsFromInput = () => {
        const newTags = parseTags(tagsInput);
        if (newTags.length > 0) {
            setTags((prev) => [...new Set([...prev, ...newTags])]);
            setTagsInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags((prev) => prev.filter((t) => t !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast({
                title: t.nameRequired,
                variant: "destructive",
            });
            return;
        }

        if (!content.trim()) {
            toast({
                title: t.contentRequired,
                variant: "destructive",
            });
            return;
        }

        try {
            // 残りのタグ入力も処理
            const finalTags = [...new Set([...tags, ...parseTags(tagsInput)])];

            await createPrompt(
                name.trim(),
                content,
                category.trim() || undefined,
                finalTags.length > 0 ? finalTags : undefined
            );

            toast({
                title: t.added,
                description: name,
                variant: "success",
            });

            // Reset form
            setName("");
            setContent("");
            setCategory("");
            setTagsInput("");
            setTags([]);
            setOpen(false);
        } catch {
            toast({
                title: t.addFailed,
                variant: "destructive",
            });
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setContent(text);
            toast({
                title: t.pasteSuccess,
            });
        } catch {
            toast({
                title: t.pasteFailed,
                description: t.clipboardPermission,
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-4 right-4 h-14 w-14 rounded-full fab-glow"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t.addNewPromptTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                {t.promptName} <span className="text-destructive">*</span>
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t.promptName}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                {t.category} <span className="text-xs text-muted-foreground">({t.optional})</span>
                            </label>
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder={t.category}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                {t.tags}
                                <span className="text-xs text-muted-foreground ml-2">
                                    {t.tagsHint}
                                </span>
                            </label>
                            <Input
                                value={tagsInput}
                                onChange={handleTagsInputChange}
                                onKeyDown={handleTagsInputKeyDown}
                                onBlur={handleTagsInputBlur}
                                placeholder={t.enterTagsPlaceholder}
                            />
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {tags.map((tag) => (
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
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium">
                                    {t.promptContent} <span className="text-destructive">*</span>
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePaste}
                                >
                                    {t.paste}
                                </Button>
                            </div>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={t.promptContent}
                                className="min-h-[200px] font-mono text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            {t.cancel}
                        </Button>
                        <Button type="submit">{t.add}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
