// メモ化キャッシュ実装
// PC版からの移植: /Users/kitamuratatsuhiko/UIanimated/yinyang-app/src/utils/cache.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * シンプルなメモ化関数
 * 引数をJSON文字列化してキーとして使用
 * @param fn メモ化する関数
 * @returns メモ化された関数
 */
export function memoizeSimple<T extends (...args: unknown[]) => unknown>(fn: T): T {
    const cache = new Map<string, unknown>();
    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key)! as ReturnType<T>;
        }
        const result = fn(...args);
        cache.set(key, result);
        return result as ReturnType<T>;
    }) as T;
}

// ============================================================
// Image Prompt Caching Functions
// ============================================================

interface ImagePromptData {
  prompts: Record<string, unknown>;
  timestamp: number;
}

/**
 * Save image prompts to AsyncStorage cache
 * @param kanshi Day stem + branch (e.g., "丙午")
 * @param tone Content tone
 * @param theme Visual theme
 * @param prompts Prompt data to cache
 */
export async function saveImagePrompt(
  kanshi: string,
  tone: string,
  theme: string,
  prompts: Record<string, unknown>
): Promise<void> {
  try {
    const cacheKey = `@image_prompt_${kanshi}_${tone}_${theme}`;
    const cacheData: ImagePromptData = {
      prompts,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to save image prompt cache:', error);
    throw error;
  }
}

/**
 * Load image prompts from AsyncStorage cache
 * @param kanshi Day stem + branch (e.g., "丙午")
 * @param tone Content tone
 * @param theme Visual theme
 * @param maxAge Maximum cache age in milliseconds (default: 24 hours)
 * @returns Cached prompt data or null if not found/expired
 */
export async function loadImagePrompt(
  kanshi: string,
  tone: string,
  theme: string,
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<Record<string, unknown> | null> {
  try {
    const cacheKey = `@image_prompt_${kanshi}_${tone}_${theme}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const parsed: ImagePromptData = JSON.parse(cachedData);
    const cacheAge = Date.now() - parsed.timestamp;

    // Check if cache is still valid
    if (cacheAge > maxAge) {
      // Cache expired, delete it
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return parsed.prompts;
  } catch (error) {
    console.error('Failed to load image prompt cache:', error);
    return null;
  }
}

/**
 * Clear all image prompt caches
 * Useful for theme changes or testing
 */
export async function clearImagePromptCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const imagePromptKeys = allKeys.filter(key => key.startsWith('@image_prompt_'));

    if (imagePromptKeys.length > 0) {
      await AsyncStorage.multiRemove(imagePromptKeys);
    }
  } catch (error) {
    console.error('Failed to clear image prompt cache:', error);
    throw error;
  }
}
