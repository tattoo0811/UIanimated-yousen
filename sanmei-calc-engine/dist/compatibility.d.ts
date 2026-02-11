/**
 * compatibility.ts - 相性計算エンジン
 *
 * 決定論的（非ランダム）な算命学相性判定システム。
 * 二人の四柱推命命式を比較し、相性スコアと詳細なアドバイスを生成します。
 *
 * 計算要素：
 * 1. 日干の五行関係スコア（基本 0-30点）
 * 2. 干合ボーナス（0-20点）
 * 3. 地支相性スコア（0-25点）
 * 4. 年柱調和スコア（0-15点）
 * 5. 五行バランス比較（0-10点）
 */
import type { CompatibilityResult } from './types';
/**
 * 相性結果の詳細スコア
 */
export interface DetailedCompatibilityScore {
    baseElementScore: number;
    kangoBonus: number;
    branchScore: number;
    yearHarmonyScore: number;
    elementBalanceScore: number;
    totalScore: number;
    details: string[];
}
/**
 * 二人の人物の基本情報（干支データ）
 */
export interface PersonGanZhi {
    yearStem: string;
    yearBranch: string;
    monthStem: string;
    monthBranch: string;
    dayStem: string;
    dayBranch: string;
    hourStem?: string;
    hourBranch?: string;
}
/**
 * 二人の相性を包括的に計算
 * 決定論的アルゴリズム（乱数なし）
 *
 * @param person1 - 人物1の干支データ（四柱推命命式の日干、月干、年干などを含む）
 * @param person2 - 人物2の干支データ
 * @returns 相性スコア（0-100）と詳細情報
 */
export declare function calculateCompatibility(person1: PersonGanZhi, person2: PersonGanZhi): CompatibilityResult;
/**
 * 相性スコアから日本語のアドバイスを生成
 * @param result - 相性計算結果
 * @returns 日本語のアドバイステキスト
 */
export declare function generateCompatibilityAdvice(result: CompatibilityResult): string;
/**
 * 相性結果を人間が読みやすい形式でフォーマット
 * @param result - 相性計算結果
 * @returns フォーマットされたテキスト
 */
export declare function formatCompatibilityResult(result: CompatibilityResult): string;
