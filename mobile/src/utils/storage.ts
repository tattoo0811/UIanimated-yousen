// AsyncStorage操作関数

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalculationResult } from '@/src/types';
import { StorageError } from './errors';

/**
 * 計算結果を保存
 * @param data 計算結果
 * @returns 保存されたキー
 */
export async function saveResult(data: CalculationResult): Promise<string> {
  try {
    const key = `result_${Date.now()}`;
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return key;
  } catch (error) {
    throw new StorageError('結果の保存に失敗しました', error as Error);
  }
}

/**
 * 計算結果を読み込み
 * @param key 結果のキー
 * @returns 計算結果（存在しない場合はnull）
 */
export async function loadResult(key: string): Promise<CalculationResult | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (!jsonValue) return null;
    return JSON.parse(jsonValue) as CalculationResult;
  } catch (error) {
    console.error('読み込みエラー:', error);
    return null;
  }
}

/**
 * すべての計算結果を取得
 * @returns 計算結果の配列
 */
export async function getAllResults(): Promise<CalculationResult[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const resultKeys = keys.filter(k => k.startsWith('result_'));
    const results = await AsyncStorage.multiGet(resultKeys);
    return results
      .map(([_, value]) => value ? JSON.parse(value) : null)
      .filter((item): item is CalculationResult => item !== null);
  } catch (error) {
    console.error('一覧取得エラー:', error);
    return [];
  }
}
