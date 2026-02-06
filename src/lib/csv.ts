import Papa from 'papaparse';
import type { Prompt } from '@/types/prompt';

/**
 * プロンプトをCSVにエクスポート
 * @param prompts エクスポートするプロンプト配列
 * @param filename ファイル名
 */
export function exportToCSV(prompts: Prompt[], filename: string = 'prompts.csv'): void {
    const data = prompts.map((prompt) => ({
        id: prompt.id,
        name: prompt.name,
        content: prompt.content,
        category: prompt.category || '',
        tags: prompt.tags?.join(', ') || '',
        createdAt: new Date(prompt.createdAt).toISOString(),
        updatedAt: new Date(prompt.updatedAt).toISOString(),
    }));

    const csv = Papa.unparse(data, {
        header: true,
        quotes: true,
    });

    // UTF-8 BOM を追加（Excel互換性）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * カテゴリ別にCSVをエクスポート
 * @param prompts エクスポートするプロンプト配列
 */
export function exportByCategory(prompts: Prompt[]): void {
    // カテゴリごとにグループ化
    const grouped = prompts.reduce((acc, prompt) => {
        const category = prompt.category || 'uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(prompt);
        return acc;
    }, {} as Record<string, Prompt[]>);

    // 各カテゴリをエクスポート
    for (const [category, categoryPrompts] of Object.entries(grouped)) {
        const filename = `prompts_${category}_${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(categoryPrompts, filename);
    }
}

/**
 * CSVからプロンプトをインポート
 * @param file CSVファイル
 * @returns パースされたプロンプト配列
 */
export function importFromCSV(file: File): Promise<Partial<Prompt>[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const prompts = (results.data as Record<string, string>[]).map((row) => ({
                    name: row.name || '',
                    content: row.content || '',
                    category: row.category || undefined,
                    tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
                }));
                resolve(prompts);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}
