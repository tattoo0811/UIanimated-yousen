/**
 * twelveStars.ts - 十二大従星計算エンジン
 *
 * 十二大従星（じゅうにたいしゅうせい）は十二運から派生する12の従属星。
 * 人生のエネルギー段階を表し、大きなポイント価値を持ちます。
 */
import type { TwelveStarChart, TwelveStarPhase, TwelveStar } from './types';
/**
 * 日干と各支から十二大従星チャートを計算
 *
 * 十二大従星の配置：
 * - 右足（Right Leg）：日干 vs 日支
 * - 左足（Left Leg）：日干 vs 月支
 * - 左肩（Left Shoulder）：日干 vs 年支
 *
 * @param dayStem - 日干のインデックス (0-9)
 * @param branches - 支のオブジェクト {year, month, day} (各0-11)
 * @returns 十二大従星チャート
 */
export declare function calculateTwelveStars(dayStem: number, branches: {
    year: number;
    month: number;
    day: number;
}): TwelveStarChart;
/**
 * 十二運フェーズ名から日本語の説明を取得
 * @param phase - 十二運フェーズ
 * @returns フェーズの説明
 */
export declare function getPhaseExplanation(phase: TwelveStarPhase): string;
/**
 * フェーズの詳細情報を取得
 * @param dayStem - 日干のインデックス
 * @param branch - 支のインデックス
 * @returns フェーズの詳細情報を含むオブジェクト
 */
export declare function getTwelveStarDetail(dayStem: number, branch: number): {
    phase: TwelveStarPhase;
    star: TwelveStar;
    points: number;
    explanation: string;
    stemName: string;
    branchName: string;
};
