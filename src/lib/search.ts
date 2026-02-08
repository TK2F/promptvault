import type { Prompt } from '@/types/prompt';

// 検索結果のキャッシュ
const searchCache = new Map<string, Prompt[]>();
const CACHE_MAX_SIZE = 100;

/**
 * キャッシュキーを生成
 */
function getCacheKey(query: string, caseSensitive: boolean, promptCount: number): string {
    return `${query}|${caseSensitive}|${promptCount}`;
}

/**
 * キャッシュをクリア（プロンプト更新時に呼び出す）
 */
export function clearSearchCache(): void {
    searchCache.clear();
}

/**
 * プロンプトを検索する（最適化版）
 * - 10,000件対応
 * - 結果キャッシュ
 * - 早期終了最適化
 * 
 * @param prompts 検索対象のプロンプト配列
 * @param query 検索クエリ
 * @param caseSensitive 大文字小文字を区別するか
 * @param limit 最大結果数（0で無制限）
 * @returns マッチしたプロンプト配列
 */
export function searchPrompts(
    prompts: Prompt[],
    query: string,
    caseSensitive: boolean = false,
    limit: number = 0
): Prompt[] {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
        return prompts;
    }

    // キャッシュチェック
    const cacheKey = getCacheKey(trimmedQuery, caseSensitive, prompts.length);
    const cached = searchCache.get(cacheKey);
    if (cached) {
        return limit > 0 ? cached.slice(0, limit) : cached;
    }

    const normalizedQuery = caseSensitive ? trimmedQuery : trimmedQuery.toLowerCase();
    const results: Prompt[] = [];

    // 大量データ対応のため、早期終了を検討
    for (const prompt of prompts) {
        if (matchesQuery(prompt, normalizedQuery, caseSensitive)) {
            results.push(prompt);
            // 大量のマッチがある場合は上限で終了（表示パフォーマンス対策）
            if (limit > 0 && results.length >= limit) {
                break;
            }
        }
    }

    // キャッシュに保存（サイズ制限付き）
    if (searchCache.size >= CACHE_MAX_SIZE) {
        const firstKey = searchCache.keys().next().value;
        if (firstKey) searchCache.delete(firstKey);
    }
    searchCache.set(cacheKey, results);

    return results;
}

/**
 * プロンプトがクエリにマッチするかチェック
 */
function matchesQuery(prompt: Prompt, normalizedQuery: string, caseSensitive: boolean): boolean {
    // 名前を最初にチェック（最も頻繁にマッチ）
    const name = caseSensitive ? prompt.name : prompt.name.toLowerCase();
    if (name.includes(normalizedQuery)) {
        return true;
    }

    // カテゴリチェック（短いので速い）
    if (prompt.category) {
        const category = caseSensitive ? prompt.category : prompt.category.toLowerCase();
        if (category.includes(normalizedQuery)) {
            return true;
        }
    }

    // タグチェック
    if (prompt.tags && prompt.tags.length > 0) {
        const matchesTag = prompt.tags.some((tag) => {
            const normalizedTag = caseSensitive ? tag : tag.toLowerCase();
            return normalizedTag.includes(normalizedQuery);
        });
        if (matchesTag) {
            return true;
        }
    }

    // コンテンツは最後にチェック（最も長いので最もコスト高）
    const content = caseSensitive ? prompt.content : prompt.content.toLowerCase();
    return content.includes(normalizedQuery);
}

/**
 * プロンプトを更新日時で降順ソート
 */
export function sortByUpdatedAt(prompts: Prompt[]): Prompt[] {
    return [...prompts].sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * プロンプトをソート順でソート（カスタム順序優先）
 */
export function sortBySortOrder(prompts: Prompt[]): Prompt[] {
    return [...prompts].sort((a, b) => {
        // sortOrderがある場合はそれを使用
        const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        // sortOrderが同じ場合は更新日時でソート
        return b.updatedAt - a.updatedAt;
    });
}

/**
 * プロンプトを名前でソート
 */
export function sortByName(prompts: Prompt[]): Prompt[] {
    return [...prompts].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

/**
 * プロンプトを作成日時で降順ソート
 */
export function sortByCreatedAt(prompts: Prompt[]): Prompt[] {
    return [...prompts].sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * 統計情報を取得
 */
export function getPromptStats(prompts: Prompt[]): {
    total: number;
    byCategory: Map<string, number>;
    byTag: Map<string, number>;
} {
    const byCategory = new Map<string, number>();
    const byTag = new Map<string, number>();

    for (const prompt of prompts) {
        // カテゴリ集計
        const category = prompt.category || '未分類';
        byCategory.set(category, (byCategory.get(category) || 0) + 1);

        // タグ集計
        if (prompt.tags) {
            for (const tag of prompt.tags) {
                byTag.set(tag, (byTag.get(tag) || 0) + 1);
            }
        }
    }

    return {
        total: prompts.length,
        byCategory,
        byTag,
    };
}
