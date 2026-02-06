import type {
    StorageData,
    BackupData,
} from '@/types/prompt';
import { DEFAULT_STORAGE_DATA } from '@/types/prompt';

const STORAGE_KEY = 'promptvault_data';
const BACKUP_KEY_PREFIX = 'promptvault_backup_';
const MAX_BACKUPS = 3;

/**
 * chrome.storage.local が利用可能かチェック
 */
function isChromeStorageAvailable(): boolean {
    return (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local !== undefined
    );
}

/**
 * ローカルストレージにデータを保存（フォールバック用）
 */
function saveToLocalStorage(key: string, data: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

/**
 * ローカルストレージからデータを読み込み（フォールバック用）
 */
function loadFromLocalStorage<T>(key: string): T | null {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
        return null;
    }
}

/**
 * データを保存
 */
export async function saveData(data: StorageData): Promise<void> {
    // バックアップを作成
    await createBackup();

    if (isChromeStorageAvailable()) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    } else {
        saveToLocalStorage(STORAGE_KEY, data);
    }
}

/**
 * データを読み込み
 */
export async function loadData(): Promise<StorageData> {
    if (isChromeStorageAvailable()) {
        return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
                const data = result[STORAGE_KEY] as StorageData | undefined;
                if (data && validateData(data)) {
                    resolve(data);
                } else {
                    // データが破損している場合、バックアップから復元を試みる
                    restoreFromBackup().then((backupData) => {
                        if (backupData) {
                            resolve(backupData);
                        } else {
                            resolve({ ...DEFAULT_STORAGE_DATA });
                        }
                    });
                }
            });
        });
    } else {
        const data = loadFromLocalStorage<StorageData>(STORAGE_KEY);
        if (data && validateData(data)) {
            return data;
        }
        return { ...DEFAULT_STORAGE_DATA };
    }
}

/**
 * データの整合性をチェック
 */
export function validateData(data: unknown): data is StorageData {
    if (!data || typeof data !== 'object') return false;

    const d = data as Record<string, unknown>;

    if (!Array.isArray(d.prompts)) return false;
    if (!Array.isArray(d.recentPromptIds)) return false;
    // pinnedPromptIdsはオプショナル（既存データ互換）
    if (d.pinnedPromptIds !== undefined && !Array.isArray(d.pinnedPromptIds)) return false;
    if (!d.settings || typeof d.settings !== 'object') return false;
    if (typeof d.version !== 'number') return false;

    // 各プロンプトの検証
    for (const prompt of d.prompts) {
        if (!prompt || typeof prompt !== 'object') return false;
        const p = prompt as Record<string, unknown>;
        if (typeof p.id !== 'string') return false;
        if (typeof p.name !== 'string') return false;
        if (typeof p.content !== 'string') return false;
        if (typeof p.createdAt !== 'number') return false;
        if (typeof p.updatedAt !== 'number') return false;
    }

    return true;
}

/**
 * バックアップを作成
 */
async function createBackup(): Promise<void> {
    const currentData = await loadData();

    const backup: BackupData = {
        data: currentData,
        timestamp: Date.now(),
    };

    const backupKey = `${BACKUP_KEY_PREFIX}${Date.now()}`;

    if (isChromeStorageAvailable()) {
        // 古いバックアップを削除
        await pruneBackups();

        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [backupKey]: backup }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    } else {
        saveToLocalStorage(backupKey, backup);
    }
}

/**
 * 古いバックアップを削除（最新3件を保持）
 */
async function pruneBackups(): Promise<void> {
    if (!isChromeStorageAvailable()) return;

    return new Promise((resolve) => {
        chrome.storage.local.get(null, (items) => {
            const backupKeys = Object.keys(items)
                .filter((key) => key.startsWith(BACKUP_KEY_PREFIX))
                .sort()
                .reverse();

            const keysToRemove = backupKeys.slice(MAX_BACKUPS);

            if (keysToRemove.length > 0) {
                chrome.storage.local.remove(keysToRemove, resolve);
            } else {
                resolve();
            }
        });
    });
}

/**
 * バックアップから復元
 */
async function restoreFromBackup(): Promise<StorageData | null> {
    if (!isChromeStorageAvailable()) {
        // localStorage からバックアップを探す
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(BACKUP_KEY_PREFIX)) {
                const backup = loadFromLocalStorage<BackupData>(key);
                if (backup && validateData(backup.data)) {
                    return backup.data;
                }
            }
        }
        return null;
    }

    return new Promise((resolve) => {
        chrome.storage.local.get(null, (items) => {
            const backupKeys = Object.keys(items)
                .filter((key) => key.startsWith(BACKUP_KEY_PREFIX))
                .sort()
                .reverse();

            for (const key of backupKeys) {
                const backup = items[key] as BackupData;
                if (backup && validateData(backup.data)) {
                    console.log('Restored from backup:', key);
                    resolve(backup.data);
                    return;
                }
            }

            resolve(null);
        });
    });
}

/**
 * 全データをクリア（デバッグ用）
 */
export async function clearAllData(): Promise<void> {
    if (isChromeStorageAvailable()) {
        return new Promise((resolve) => {
            chrome.storage.local.clear(resolve);
        });
    } else {
        localStorage.clear();
    }
}

/**
 * ストレージ使用量を取得
 */
export async function getStorageUsage(): Promise<{ used: number; total: number }> {
    if (isChromeStorageAvailable()) {
        return new Promise((resolve) => {
            chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
                resolve({
                    used: bytesInUse,
                    total: chrome.storage.local.QUOTA_BYTES,
                });
            });
        });
    }

    // localStorage の概算
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            used += (localStorage.getItem(key) || '').length * 2;
        }
    }

    return { used, total: 5 * 1024 * 1024 }; // 5MB
}
