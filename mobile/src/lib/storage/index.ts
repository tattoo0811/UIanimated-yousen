import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageSchemaV2, STORAGE_VERSION } from './schema';
import { migrateStorage, validateSchema } from './migrations';

const STORAGE_KEY = 'gogyo_app_data';

/**
 * ストレージからデータを読み込み
 * 自動的にマイグレーションを実行
 */
export async function loadStorage(): Promise<StorageSchemaV2> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (!raw) {
            // 初回起動: デフォルトデータ
            return getDefaultStorage();
        }

        const parsed = JSON.parse(raw);

        // マイグレーション実行
        const migrated = await migrateStorage(parsed);

        // 検証
        if (!validateSchema(migrated)) {
            console.error('[Storage] Invalid schema after migration');
            return getDefaultStorage();
        }

        // マイグレーション後のデータを保存
        if (parsed.version !== STORAGE_VERSION) {
            await saveStorage(migrated);
        }

        return migrated;
    } catch (error) {
        console.error('[Storage] Load error:', error);
        return getDefaultStorage();
    }
}

/**
 * ストレージにデータを保存
 */
export async function saveStorage(data: StorageSchemaV2): Promise<void> {
    try {
        const json = JSON.stringify(data);
        await AsyncStorage.setItem(STORAGE_KEY, json);
    } catch (error) {
        console.error('[Storage] Save error:', error);
        throw error;
    }
}

/**
 * デフォルトのストレージデータ
 */
function getDefaultStorage(): StorageSchemaV2 {
    return {
        version: STORAGE_VERSION,
        fortuneResults: [],
        settings: {},
    };
}

/**
 * ストレージをクリア（開発用）
 */
export async function clearStorage(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
}
