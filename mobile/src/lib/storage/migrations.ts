import { StorageSchemaV1, StorageSchemaV2, STORAGE_VERSION } from './schema';

/**
 * データ移行関数
 * 古いバージョンのデータを新しいスキーマに変換
 */
export async function migrateStorage(oldData: unknown): Promise<StorageSchemaV2> {
    // 型ガード: oldDataがオブジェクトであることを確認
    if (!oldData || typeof oldData !== 'object') {
        console.warn('[Migration] Invalid old data, returning default v2 schema');
        return {
            version: 2,
            fortuneResults: [],
            settings: {},
        };
    }

    const data = oldData as Record<string, unknown>;
    const oldVersion = (data.version as number) || 1;

    console.log(`[Migration] Migrating from v${oldVersion} to v${STORAGE_VERSION}`);

    if (oldVersion === 1) {
        // v1 → v2 移行
        const v1Data = data as StorageSchemaV1;

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

    // すでにv2の場合 - 型を確認
    if (oldVersion === 2) {
        // StorageSchemaV2の必須プロパティを確認
        const v2Data = data as unknown as StorageSchemaV2;
        if (Array.isArray(v2Data.fortuneResults) && typeof v2Data.settings === 'object') {
            return v2Data;
        }
        // 不正なv2データの場合はデフォルトを返す
        return {
            version: 2,
            fortuneResults: [],
            settings: {},
        };
    }

    // 未知のバージョン（将来の拡張用）
    console.warn(`[Migration] Unknown version: ${oldVersion}, returning default v2 schema`);
    // 安全のためデフォルト値を返す
    return {
        version: 2,
        fortuneResults: [],
        settings: {},
    };
}

/**
 * データ検証
 * スキーマに準拠しているか確認
 */
export function validateSchema(data: unknown): data is StorageSchemaV2 {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const obj = data as Record<string, unknown>;

    if (obj.version !== 2) {
        return false;
    }

    // birthDataの検証
    if (obj.birthData) {
        const bd = obj.birthData as Record<string, unknown>;
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
    if (!Array.isArray(obj.fortuneResults)) {
        return false;
    }

    return true;
}
