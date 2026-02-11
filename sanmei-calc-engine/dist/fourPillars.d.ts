/**
 * 算命学エンジン - 四柱推命計算ファイル
 * Sanmei-gaku Engine - Four Pillars Calculation File
 */
import type { Stem, Branch } from './constants';
import type { FourPillars } from './types';
/**
 * 天干のインデックスを取得
 * '甲' = 0, '乙' = 1, ... '癸' = 9
 */
declare function getStemIndex(stem: Stem): number;
/**
 * 地支のインデックスを取得
 * '子' = 0, '丑' = 1, ... '亥' = 11
 */
declare function getBranchIndex(branch: Branch): number;
/**
 * インデックスから天干を取得
 */
declare function getStemByIndex(index: number): Stem;
/**
 * インデックスから地支を取得
 */
declare function getBranchByIndex(index: number): Branch;
/**
 * ユリウス通日（Julian Day Number）を計算
 * グレゴリオ暦の日付をJDNに変換
 *
 * 参考: 2000-01-01 JDN = 2451545
 */
declare function gregorianToJDN(year: number, month: number, day: number): number;
/**
 * 立春の日付を取得（月柱計算用）
 * 指定された年の立春が何月何日に訪れるかを返す
 *
 * 戻り値: { month, day }
 */
declare function getLichunDate(year: number): {
    month: number;
    day: number;
};
/**
 * 指定された日付が何月（旧暦の月）に属するかを計算
 * 旧暦の月は節入りの日付によって変わる
 *
 * 戻り値: 旧暦の月 (1-12, where 1=寅月, 2=卯月, ..., 12=丑月)
 *
 * ■ 節入り（節気）と旧暦月の対応:
 *   terms[1] = 立春 (~Feb 4)  → 寅月(1月)開始
 *   terms[2] = 啓蟄 (~Mar 5)  → 卯月(2月)開始
 *   terms[3] = 清明 (~Apr 5)  → 辰月(3月)開始
 *   terms[4] = 立夏 (~May 5)  → 巳月(4月)開始
 *   terms[5] = 芒種 (~Jun 6)  → 午月(5月)開始
 *   terms[6] = 小暑 (~Jul 7)  → 未月(6月)開始
 *   terms[7] = 立秋 (~Aug 7)  → 申月(7月)開始
 *   terms[8] = 白露 (~Sep 8)  → 酉月(8月)開始
 *   terms[9] = 寒露 (~Oct 8)  → 戌月(9月)開始
 *   terms[10] = 立冬 (~Nov 7) → 亥月(10月)開始
 *   terms[11] = 大雪 (~Dec 7) → 子月(11月)開始
 *   terms[12] = 小寒 (~Jan 5) → 丑月(12月)開始
 *
 * ■ グレゴリオ月と節のマッピング:
 *   Greg月 1(Jan) → terms[12] (小寒) ※前年データ
 *   Greg月 2(Feb) → terms[1]  (立春)
 *   Greg月 3(Mar) → terms[2]  (啓蟄)
 *   ...
 *   Greg月 9(Sep) → terms[8]  (白露) ← 重要: terms[9]ではない！
 *   ...
 *   Greg月 12(Dec) → terms[11] (大雪)
 */
declare function getChineseMonth(year: number, month: number, day: number): number;
/**
 * 生年月日から四柱を計算
 *
 * @param year - 西暦年
 * @param month - 月 (1-12)
 * @param day - 日 (1-31)
 * @param hour - 時間 (0-23, 0=午前0時, 23=午後11時)
 * @returns FourPillars - 四柱推命の四柱
 *
 * 例）
 * calculateFourPillars(1985, 4, 18, 10)
 * → { year, month, day, hour }
 */
export declare function calculateFourPillars(year: number, month: number, day: number, hour: number): FourPillars;
/**
 * 内部関数をテスト用にエクスポート
 * （開発時のデバッグ用）
 */
export declare const internalFunctions: {
    gregorianToJDN: typeof gregorianToJDN;
    getChineseMonth: typeof getChineseMonth;
    getLichunDate: typeof getLichunDate;
    getStemIndex: typeof getStemIndex;
    getBranchIndex: typeof getBranchIndex;
    getStemByIndex: typeof getStemByIndex;
    getBranchByIndex: typeof getBranchByIndex;
};
export {};
