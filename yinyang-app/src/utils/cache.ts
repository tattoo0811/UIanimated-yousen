// Simple memoization utility for performance optimization
type MemoCache<T> = Map<string, T>;

export function memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
): T {
    const cache: MemoCache<ReturnType<T>> = new Map();

    return ((...args: Parameters<T>) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
}

// Specialized memoization for simple number-based functions
export function memoizeSimple<T>(
    fn: (a: number, b: number) => T
): (a: number, b: number) => T {
    const cache = new Map<string, T>();

    return (a: number, b: number) => {
        const key = `${a},${b}`;

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(a, b);
        cache.set(key, result);
        return result;
    };
}
