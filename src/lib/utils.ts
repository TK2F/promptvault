import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSクラス名をマージするユーティリティ
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * ユニークIDを生成
 */
export function generateId(): string {
    return crypto.randomUUID();
}

/**
 * debounce関数
 * @param fn 実行する関数
 * @param delay 遅延時間（ミリ秒）
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

/**
 * 現在のタイムスタンプを取得
 */
export function now(): number {
    return Date.now();
}

/**
 * 日付をフォーマット
 */
export function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(timestamp));
}

/**
 * テキストを切り詰める
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * タグ文字列をパースして配列に変換
 * カンマ、タブ、半角スペース、全角スペースで区切り
 */
export function parseTags(input: string): string[] {
    if (!input.trim()) return [];

    // カンマ、タブ、半角スペース、全角スペースで分割
    const tags = input
        .split(/[,\t\s　]+/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

    // 重複を削除
    return [...new Set(tags)];
}

/**
 * タグ配列を表示用文字列に変換
 */
export function formatTags(tags: string[]): string {
    return tags.join(', ');
}

