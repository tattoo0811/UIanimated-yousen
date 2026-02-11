/**
 * tenStars.ts - 十大主星計算エンジン
 *
 * 十大主星（じゅうたいしゅうせい）は通変星から派生する10の主要な星。
 * 四柱推命の基本となる星の配置を計算します。
 */
import type { FourPillars, TenStarChart } from './types';
/**
 * 四柱から十大主星チャートを計算
 *
 * 十大主星の配置（人体星図）：
 * - 頭：年干 vs 日干
 * - 胸：月支の蔵干 vs 日干
 * - 右手：日支の蔵干 vs 日干（自分の星）
 * - 左手：年支の蔵干 vs 日干
 * - 腹：月干 vs 日干
 *
 * @param fourPillars - 四柱 {year, month, day, hour} (各Pillar型)
 * @returns 十大主星チャート
 */
export declare function calculateTenStars(fourPillars: FourPillars): TenStarChart;
/**
 * 通変星から日干と対象天干の関係を説明
 * @param dayStemValue - 日干の文字
 * @param targetStemValue - 対象天干の文字
 * @returns 日本語の関係説明
 */
export declare function getTsuhenExplanation(dayStemValue: string, targetStemValue: string): string;
