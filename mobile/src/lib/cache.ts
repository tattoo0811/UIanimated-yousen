// メモ化キャッシュ実装
// PC版からの移植: /Users/kitamuratatsuhiko/UIanimated/yinyang-app/src/utils/cache.ts

/**
 * シンプルなメモ化関数
 * 引数をJSON文字列化してキーとして使用
 * @param fn メモ化する関数
 * @returns メモ化された関数
 */
export function memoizeSimple<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();
    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key)!;
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
}
