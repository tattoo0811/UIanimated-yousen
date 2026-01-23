/**
 * Storage Schema Version 2
 *
 * データバージョニングシステム
 * アプリアップデート時のデータ互換性を保証
 */

import type { CalculationResult } from '../../types';

export const STORAGE_VERSION = 2;

export interface BirthData {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    timezone: string; // v2で追加
}

export interface FortuneResult {
    id: string;
    birthDate: string;
    resultType: string;
    resultData: CalculationResult | null;
    createdAt: number;
    nickname?: string;  // ユーザーのニックネーム（タイピング演出用）
}

export interface UserSettings {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
}

export interface StorageSchemaV2 {
    version: 2;
    birthData?: BirthData;
    fortuneResults: FortuneResult[];
    settings: UserSettings;
    termsAccepted?: boolean;
}

export interface StorageSchemaV1 {
    version?: 1;
    birthData?: {
        year: number;
        month: number;
        day: number;
        hour?: number;
        minute?: number;
        // timezone なし
    };
    fortuneResults?: any[];
    settings?: any;
}

export type StorageSchema = StorageSchemaV2 | StorageSchemaV1;
