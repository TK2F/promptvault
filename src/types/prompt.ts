/**
 * プロンプトデータモデル
 * 最大1000件を想定
 */
export interface Prompt {
    id: string;
    name: string;
    content: string;          // 長文、Markdown対応
    category?: string;
    tags?: string[];
    parentPromptId?: string;  // 親プロンプト（1つのみ）、将来拡張用
    isPinned?: boolean;       // ピン留め
    sortOrder?: number;       // カスタム並び順
    createdAt: number;
    updatedAt: number;
}

/**
 * アプリケーション設定
 */
export interface Settings {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    language: 'ja' | 'en';
    caseSensitiveSearch: boolean;
    blankLineMode: 'keep-one' | 'remove-all';  // 空行処理モード
}

/**
 * ストレージデータ構造
 */
export interface StorageData {
    prompts: Prompt[];
    recentPromptIds: string[];  // 最大10件
    pinnedPromptIds: string[];  // ピン留めされたプロンプトID
    settings: Settings;
    version: number;  // データバージョン（マイグレーション用）
}

/**
 * バックアップデータ
 */
export interface BackupData {
    data: StorageData;
    timestamp: number;
}

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS: Settings = {
    theme: 'system',
    fontSize: 'medium',
    language: 'ja',
    caseSensitiveSearch: false,
    blankLineMode: 'keep-one',
};

/**
 * デフォルトストレージデータ
 */
export const DEFAULT_STORAGE_DATA: StorageData = {
    prompts: [],
    recentPromptIds: [],
    pinnedPromptIds: [],
    settings: DEFAULT_SETTINGS,
    version: 1,
};
