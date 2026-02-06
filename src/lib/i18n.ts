/**
 * 多言語対応 (i18n) - 日本語/英語
 */

export type Language = 'ja' | 'en';

export interface Translations {
    // 共通
    appName: string;
    settings: string;
    cancel: string;
    save: string;
    delete: string;
    copy: string;
    edit: string;
    add: string;
    close: string;

    // 検索
    search: string;
    searchPlaceholder: string;
    caseSensitive: string;
    noResults: string;
    noPrompts: string;
    tryDifferentKeyword: string;
    addNewPrompt: string;

    // フィルター
    clearFilters: string;
    filterByTag: string;
    filterByCategory: string;
    activeFilters: string;
    clearAll: string;

    // プロンプト
    promptName: string;
    promptContent: string;
    category: string;
    tags: string;
    tagsHint: string;
    enterTagsPlaceholder: string;
    pin: string;
    unpin: string;
    pinned: string;
    recentlyUsed: string;
    allPrompts: string;
    searchResults: string;

    // ダイアログ
    addNewPromptTitle: string;
    editPromptTitle: string;
    required: string;
    optional: string;
    paste: string;
    pasteSuccess: string;
    pasteFailed: string;
    clipboardPermission: string;

    // 設定
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    fontSize: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    language: string;
    storageUsage: string;
    promptsCount: string;
    dataManagement: string;

    // エクスポート
    export: string;
    exportAll: string;
    exportByCategory: string;
    exportSuccess: string;
    exportFailed: string;

    // メッセージ
    copied: string;
    copyFailed: string;
    saved: string;
    deleted: string;
    added: string;
    addFailed: string;
    pinned_msg: string;
    unpinned: string;
    unsavedChanges: string;
    discardChanges: string;
    confirmDelete: string;
    nameRequired: string;
    contentRequired: string;

    // インポート
    import: string;
    importJson: string;
    importSuccess: string;
    importFailed: string;
    importInvalid: string;
    selectFile: string;

    // Danger Zone
    dangerZone: string;
    deleteAllData: string;
    deleteAllDataDesc: string;
    deleteAllConfirm: string;
    deleteAllSuccess: string;
    typeToConfirm: string;
}

const ja: Translations = {
    // 共通
    appName: 'PromptVault',
    settings: '設定',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    copy: 'コピー',
    edit: '編集',
    add: '追加',
    close: '閉じる',

    // 検索
    search: '検索',
    searchPlaceholder: 'プロンプトを検索...',
    caseSensitive: '大文字/小文字を区別',
    noResults: '検索結果がありません',
    noPrompts: 'プロンプトがありません',
    tryDifferentKeyword: '別のキーワードで検索してください',
    addNewPrompt: '「+」ボタンで新しいプロンプトを追加',

    // フィルター
    clearFilters: 'フィルターをクリア',
    filterByTag: 'タグで絞り込み',
    filterByCategory: 'カテゴリで絞り込み',
    activeFilters: '有効なフィルター',
    clearAll: 'すべてクリア',

    // プロンプト
    promptName: 'プロンプト名',
    promptContent: 'プロンプトの内容',
    category: 'カテゴリ',
    tags: 'タグ',
    tagsHint: 'カンマ、スペース、タブで区切り',
    enterTagsPlaceholder: 'タグを入力してEnter',
    pin: 'ピン留め',
    unpin: 'ピン留め解除',
    pinned: 'ピン留め',
    recentlyUsed: '最近使用',
    allPrompts: 'すべてのプロンプト',
    searchResults: '検索結果',

    // ダイアログ
    addNewPromptTitle: '新しいプロンプトを追加',
    editPromptTitle: 'プロンプトを編集',
    required: '必須',
    optional: 'オプション',
    paste: '貼り付け',
    pasteSuccess: '貼り付けました',
    pasteFailed: '貼り付けに失敗しました',
    clipboardPermission: 'クリップボードへのアクセスを許可してください',

    // 設定
    theme: 'テーマ',
    themeLight: 'ライト',
    themeDark: 'ダーク',
    themeSystem: '自動',
    fontSize: 'フォントサイズ',
    fontSizeSmall: '小',
    fontSizeMedium: '中',
    fontSizeLarge: '大',
    language: '言語',
    storageUsage: 'ストレージ使用量',
    promptsCount: '件のプロンプト',
    dataManagement: 'データ管理',

    // エクスポート
    export: 'エクスポート',
    exportAll: '全件出力',
    exportByCategory: 'カテゴリ別',
    exportSuccess: 'エクスポートしました',
    exportFailed: 'エクスポートに失敗しました',

    // メッセージ
    copied: 'コピーしました',
    copyFailed: 'コピーに失敗しました',
    saved: '保存しました',
    deleted: '削除しました',
    added: '追加しました',
    addFailed: '追加に失敗しました',
    pinned_msg: 'ピン留めしました',
    unpinned: 'ピン留め解除',
    unsavedChanges: '未保存の変更があります。破棄しますか？',
    discardChanges: '変更を破棄',
    confirmDelete: 'を削除しますか？',
    nameRequired: '名前を入力してください',
    contentRequired: '内容を入力してください',

    // インポート
    import: 'インポート',
    importJson: 'JSONからインポート',
    importSuccess: 'インポートしました',
    importFailed: 'インポートに失敗しました',
    importInvalid: 'ファイル形式が不正です',
    selectFile: 'ファイルを選択',

    // Danger Zone
    dangerZone: 'Danger Zone',
    deleteAllData: '全データを削除',
    deleteAllDataDesc: 'すべてのプロンプトと設定を削除します。この操作は取り消せません。',
    deleteAllConfirm: '本当に全データを削除しますか？',
    deleteAllSuccess: '全データを削除しました',
    typeToConfirm: '確認のため「DELETE」と入力してください',
};

const en: Translations = {
    // Common
    appName: 'PromptVault',
    settings: 'Settings',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    copy: 'Copy',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',

    // Search
    search: 'Search',
    searchPlaceholder: 'Search prompts...',
    caseSensitive: 'Case Sensitive',
    noResults: 'No results found',
    noPrompts: 'No prompts yet',
    tryDifferentKeyword: 'Try a different keyword',
    addNewPrompt: 'Click + to add a new prompt',

    // Filters
    clearFilters: 'Clear Filters',
    filterByTag: 'Filter by Tag',
    filterByCategory: 'Filter by Category',
    activeFilters: 'Active Filters',
    clearAll: 'Clear All',

    // Prompts
    promptName: 'Name',
    promptContent: 'Content',
    category: 'Category',
    tags: 'Tags',
    tagsHint: 'Separate with comma, space, or tab',
    enterTagsPlaceholder: 'Enter tags and press Enter',
    pin: 'Pin',
    unpin: 'Unpin',
    pinned: 'Pinned',
    recentlyUsed: 'Recently Used',
    allPrompts: 'All Prompts',
    searchResults: 'Search Results',

    // Dialogs
    addNewPromptTitle: 'Add New Prompt',
    editPromptTitle: 'Edit Prompt',
    required: 'required',
    optional: 'optional',
    paste: 'Paste',
    pasteSuccess: 'Pasted',
    pasteFailed: 'Failed to paste',
    clipboardPermission: 'Please allow clipboard access',

    // Settings
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    fontSize: 'Font Size',
    fontSizeSmall: 'Small',
    fontSizeMedium: 'Medium',
    fontSizeLarge: 'Large',
    language: 'Language',
    storageUsage: 'Storage Usage',
    promptsCount: 'prompts',
    dataManagement: 'Data Management',

    // Export
    export: 'Export',
    exportAll: 'Export All',
    exportByCategory: 'By Category',
    exportSuccess: 'Exported successfully',
    exportFailed: 'Export failed',

    // Messages
    copied: 'Copied',
    copyFailed: 'Failed to copy',
    saved: 'Saved',
    deleted: 'Deleted',
    added: 'Added',
    addFailed: 'Failed to add',
    pinned_msg: 'Pinned',
    unpinned: 'Unpinned',
    unsavedChanges: 'You have unsaved changes. Discard them?',
    discardChanges: 'Discard Changes',
    confirmDelete: 'Delete this prompt?',
    nameRequired: 'Name is required',
    contentRequired: 'Content is required',

    // Import
    import: 'Import',
    importJson: 'Import from JSON',
    importSuccess: 'Imported successfully',
    importFailed: 'Import failed',
    importInvalid: 'Invalid file format',
    selectFile: 'Select File',

    // Danger Zone
    dangerZone: 'Danger Zone',
    deleteAllData: 'Delete All Data',
    deleteAllDataDesc: 'This will delete all prompts and settings. This action cannot be undone.',
    deleteAllConfirm: 'Are you sure you want to delete all data?',
    deleteAllSuccess: 'All data deleted',
    typeToConfirm: 'Type "DELETE" to confirm',
};

export const translations: Record<Language, Translations> = { ja, en };

export function getTranslation(lang: Language): Translations {
    return translations[lang];
}
