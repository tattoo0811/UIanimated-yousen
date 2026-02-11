/**
 * index.ts - 算命学エンジン メインエントリーポイント
 *
 * このファイルは他のすべてのモジュールを統合し、
 * 完全な算命学チャート計算エンジンを提供します。
 *
 * 主な機能：
 * 1. 四柱推命の計算（年月日時の干支）
 * 2. 蔵干（隠れた天干）の抽出
 * 3. 十大主星の配置計算
 * 4. 十二大従星の配置計算
 * 5. 天中殺の計算
 * 6. 五行バランス分析
 * 7. 相性計算
 */
export * from './constants';
export * from './types';
export { calculateFourPillars } from './fourPillars';
export * from './fiveElements';
export * from './compatibility';
export { calculateTenStars } from './tenStars';
export { calculateTwelveStars } from './twelveStars';
export { calculateTenchusatsu } from './tenchusatsu';
import type { SanmeiChart, CompatibilityResult } from './types';
/**
 * メイン計算関数：生年月日から完全な算命学チャートを生成
 *
 * @param year - 西暦年
 * @param month - 月 (1-12)
 * @param day - 日 (1-31)
 * @param hour - 時間 (0-23, デフォルト 12 = 正午)
 * @returns 完全な算命学チャート
 *
 * 処理フロー：
 * 1. calculateFourPillars で四柱を計算
 * 2. extractHiddenStems で各地支の蔵干を抽出
 * 3. analyzeFiveElementsBalance で五行バランスを計算
 * 4. calculateTenchusatsu で天中殺を計算
 * 5. すべての結果を SanmeiChart にパッケージ化
 */
export declare function calculateSanmeiChart(year: number, month: number, day: number, hour?: number): SanmeiChart;
/**
 * チャートを人間が読みやすい日本語テキスト形式にフォーマット
 * @param chart - 算命学チャート
 * @returns フォーマットされたテキスト表現
 */
export declare function formatChart(chart: SanmeiChart): string;
/**
 * 二人の相性を計算するラッパー関数
 * @param person1Data - 人物1のデータ {year, month, day, hour}
 * @param person2Data - 人物2のデータ {year, month, day, hour}
 * @returns 相性計算結果
 */
export declare function calculateSanmeiCompatibility(person1Data: {
    year: number;
    month: number;
    day: number;
    hour?: number;
}, person2Data: {
    year: number;
    month: number;
    day: number;
    hour?: number;
}): CompatibilityResult;
/**
 * デバッグ用：チャート情報をコンソール出力
 * @param chart - 算命学チャート
 */
export declare function debugChart(chart: SanmeiChart): void;
