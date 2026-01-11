import { StorageSchemaV1, StorageSchemaV2, STORAGE_VERSION } from './schema';

/**
 * データ移行関数
 * 古いバージョンのデータを新しいスキーマに変換
 */
export async function migrateStorage(oldData: any): Promise<StorageSchemaV2> {
    const oldVersion = oldData?.version || 1;

    console.log(`[Migration] Migrating from v${oldVersion} to v${STORAGE_VERSION}`);

    if (oldVersion === 1) {
        // v1 → v2 移行
        const v1Data = oldData as StorageSchemaV1;

        const migratedData: StorageSchemaV2 = {
            version: 2,
            birthData: v1Data.birthData ? {
                ...v1Data.birthData,
                timezone: 'Asia/Tokyo', // デフォルト値
            } : undefined,
            fortuneResults: v1Data.fortuneResults || [],
            settings: v1Data.settings || {},
            termsAccepted: false, // v2で追加
        };

        console.log('[Migration] v1 → v2 completed');
        return migratedData;
    }

    // すでにv2の場合
    if (oldVersion === 2) {
        return oldData as StorageSchemaV2;
    }

    // 未知のバージョン（将来の拡張用）
    console.warn(`[Migration] Unknown version: ${oldVersion}, using as-is`);
    return oldData as StorageSchemaV2;
}

/**
 * データ検証
 * スキーマに準拠しているか確認
 */
export function validateSchema(data: any): data is StorageSchemaV2 {
    if (!data || typeof data !== 'object') {
        return false;
    }

    if (data.version !== 2) {
        return false;
    }

    // birthDataの検証
    if (data.birthData) {
        const bd = data.birthData;
        if (
            typeof bd.year !== 'number' ||
            typeof bd.month !== 'number' ||
            typeof bd.day !== 'number' ||
            typeof bd.timezone !== 'string'
        ) {
            return false;
        }
    }

    // fortuneResultsの検証
    if (!Array.isArray(data.fortuneResults)) {
        return false;
    }

    return true;
}
