"use strict";
/**
 * 算命学エンジン - 四柱推命計算ファイル
 * Sanmei-gaku Engine - Four Pillars Calculation File
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalFunctions = void 0;
exports.calculateFourPillars = calculateFourPillars;
const constants_1 = require("./constants");
// ============================================================================
// ユーティリティ関数
// ============================================================================
/**
 * 天干のインデックスを取得
 * '甲' = 0, '乙' = 1, ... '癸' = 9
 */
function getStemIndex(stem) {
    return constants_1.STEMS.indexOf(stem);
}
/**
 * 地支のインデックスを取得
 * '子' = 0, '丑' = 1, ... '亥' = 11
 */
function getBranchIndex(branch) {
    return constants_1.BRANCHES.indexOf(branch);
}
/**
 * インデックスから天干を取得
 */
function getStemByIndex(index) {
    return constants_1.STEMS[Math.abs(index) % 10];
}
/**
 * インデックスから地支を取得
 */
function getBranchByIndex(index) {
    return constants_1.BRANCHES[Math.abs(index) % 12];
}
/**
 * ユリウス通日（Julian Day Number）を計算
 * グレゴリオ暦の日付をJDNに変換
 *
 * 参考: 2000-01-01 JDN = 2451545
 */
function gregorianToJDN(year, month, day) {
    // グレゴリオ暦 → ユリウス通日の計算式
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return (day +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        Math.floor(y / 100) +
        Math.floor(y / 400) -
        32045);
}
/**
 * 立春の日付を取得（月柱計算用）
 * 指定された年の立春が何月何日に訪れるかを返す
 *
 * 戻り値: { month, day }
 */
function getLichunDate(year) {
    // 立春（節入り）は概ね2月4日
    // 例外: 2020年は2月4日、2021年は2月4日...
    // 簡略化: 常に2月4日と仮定
    // 実際には年によって2月3日～5日の幅がある
    // テーブルから取得を試みる
    const termData = (0, constants_1.getSolarTermData)(year);
    return {
        month: 2,
        day: termData.terms[1], // 立春は月1に対応
    };
}
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
function getChineseMonth(year, month, day) {
    // グレゴリオ月 → 節入りインデックス / 参照年の決定
    let termIndex;
    let termYear;
    if (month === 1) {
        // 1月の節は小寒(terms[12])で、前年のデータに格納
        // 例: 2025年1月5日の小寒 → 2024年データの terms[12]
        termIndex = 12;
        termYear = year - 1;
    }
    else {
        // 2月以降: グレゴリオ月 N → terms[N-1]
        // 例: 9月(Sep) → terms[8](白露)
        termIndex = month - 1;
        termYear = year;
    }
    const termData = (0, constants_1.getSolarTermData)(termYear);
    const termDay = termData.terms[termIndex];
    if (day >= termDay) {
        // 節入り当日以降: termIndex が示す旧暦月
        return termIndex;
    }
    else {
        // 節入り前: 一つ前の旧暦月
        return termIndex === 1 ? 12 : termIndex - 1;
    }
}
// ============================================================================
// 四柱の計算
// ============================================================================
/**
 * 年柱を計算
 *
 * アルゴリズム:
 * 1. 立春の日付を確認
 * 2. 日付が立春前なら、年 = year - 1 で計算
 * 3. 干のインデックス: (year - 4) % 10
 * 4. 支のインデックス: (year - 4) % 12
 * 5. 六十干支のインデックス: (year - 4) % 60
 */
function calculateYearPillar(year, month, day) {
    // 立春を確認
    const lichun = getLichunDate(year);
    // 立春前なら year を -1
    let adjustedYear = year;
    if (month < lichun.month || (month === lichun.month && day < lichun.day)) {
        adjustedYear = year - 1;
    }
    // 干のインデックス: (year - 4) % 10
    const stemIndex = (adjustedYear - 4) % 10;
    const stem = getStemByIndex(stemIndex);
    // 支のインデックス: (year - 4) % 12
    const branchIndex = (adjustedYear - 4) % 12;
    const branch = getBranchByIndex(branchIndex);
    // 六十干支のインデックス: (year - 4) % 60
    const kanshiIndex = (adjustedYear - 4) % 60;
    return createPillar(stem, branch, kanshiIndex);
}
/**
 * 月柱を計算
 *
 * アルゴリズム:
 * 1. 旧暦の月を決定（節入りの日付から）
 * 2. 月支: 寅(1), 卯(2), ..., 丑(12)
 * 3. 月干: 五虎遁を使って計算
 *    - 年干の index % 5 で 五虎遁テーブルを参照
 *    - 月干の開始インデックスを取得
 *    - 月数分進める（旧暦の月1=寅月から）
 */
function calculateMonthPillar(yearStem, year, month, day) {
    // 旧暦の月を計算（1-12, 1=寅月）
    const chineseMonth = getChineseMonth(year, month, day);
    // 月支: 寅(index=2), 卯(index=3), ..., 丑(index=1)
    // chineseMonth=1 → 寅(index=2)
    // chineseMonth=2 → 卯(index=3)
    // ...
    // chineseMonth=12 → 丑(index=1)
    const branchIndex = (chineseMonth + 1) % 12;
    const branch = getBranchByIndex(branchIndex);
    // 月干を計算（五虎遁）
    const yearStemIndex = getStemIndex(yearStem);
    const wuHuBase = constants_1.WU_HU_DUN[yearStemIndex % 5];
    // 寅月(chineseMonth=1)から何ヶ月か
    const monthOffset = chineseMonth - 1;
    const stemIndex = (wuHuBase + monthOffset) % 10;
    const stem = getStemByIndex(stemIndex);
    // 六十干支のインデックスを計算
    const kanshiIndex = (getStemIndex(stem) * 12 + branchIndex) % 60;
    return createPillar(stem, branch, kanshiIndex);
}
/**
 * 日柱を計算
 *
 * アルゴリズム（ユリウス通日を使用）:
 * 1. グレゴリオ暦 → ユリウス通日（JDN）に変換
 * 2. 干のインデックス: (JDN + 9) % 10
 *    （調整値は、既知の基準日がマッチするように決定）
 * 3. 支のインデックス: (JDN + 1) % 12
 *
 * 基準日：
 * - 1900-01-01 = 甲戌 (stem=甲/0, branch=戌/10)
 * - 検証: JDN(1900-01-01) = 2415021
 *   - (2415021 + 9) % 10 = 2415030 % 10 = 0 ✓ (甲)
 *   - (2415021 + 1) % 12 = 2415022 % 12 = 10 ✓ (戌)
 */
function calculateDayPillar(year, month, day) {
    // グレゴリオ暦 → JDN
    const jdn = gregorianToJDN(year, month, day);
    // 干のインデックス
    const stemIndex = (jdn + 9) % 10;
    const stem = getStemByIndex(stemIndex);
    // 支のインデックス
    const branchIndex = (jdn + 1) % 12;
    const branch = getBranchByIndex(branchIndex);
    // 六十干支のインデックス
    const kanshiIndex = (stemIndex * 12 + branchIndex) % 60;
    return createPillar(stem, branch, kanshiIndex);
}
/**
 * 時柱を計算
 *
 * アルゴリズム:
 * 1. 時間を地支に変換
 *    - 子時(23:00-00:59): hour=23 または hour=0
 *    - 丑時(01:00-02:59): hour=1-2
 *    - 寅時(03:00-04:59): hour=3-4
 *    - ...
 *    - 亥時(21:00-22:59): hour=21-22
 *    計算式: branchIndex = floor((hour + 1) / 2) % 12
 *
 * 2. 時干を計算（五鼠遁）
 *    - 日干の index % 5 で 五鼠遁テーブルを参照
 *    - 子時(hour=0)の干の開始インデックスを取得
 *    - 時支のインデックス分進める
 *
 * 重要な注意：
 * - 23:00-00:59 は子時で、次の日の干支を使う
 * - 現在のコードでは hour >= 23 のチェックが必要
 */
function calculateHourPillar(dayStem, hour) {
    // 実際の hour を 0-23 に正規化
    let normalizedHour = hour % 24;
    // 時支のインデックスを計算
    // hour=23 → (23+1)/2 = 12 → 12%12 = 0 (子)
    // hour=0 → (0+1)/2 = 0.5 → floor = 0 (子)
    // hour=1 → (1+1)/2 = 1 (丑)
    // hour=2 → (2+1)/2 = 1.5 → floor = 1 (丑)
    // hour=3 → (3+1)/2 = 2 (寅)
    const branchIndex = Math.floor((normalizedHour + 1) / 2) % 12;
    const branch = getBranchByIndex(branchIndex);
    // 時干を計算（五鼠遁）
    const dayStemIndex = getStemIndex(dayStem);
    const wuShuBase = constants_1.WU_SHU_DUN[dayStemIndex % 5];
    // 子時(branchIndex=0)から何時間か
    const stemIndex = (wuShuBase + branchIndex) % 10;
    const stem = getStemByIndex(stemIndex);
    // 六十干支のインデックス
    const kanshiIndex = (stemIndex * 12 + branchIndex) % 60;
    return createPillar(stem, branch, kanshiIndex);
}
// ============================================================================
// ヘルパー関数
// ============================================================================
/**
 * Pillar オブジェクトを作成
 */
function createPillar(stem, branch, kanshiIndex) {
    return {
        stem,
        branch,
        kanshiIndex: kanshiIndex % 60,
        element: constants_1.STEM_ELEMENTS[stem], // 天干の五行
        yinYang: constants_1.STEM_YIN_YANG[stem], // 天干の陰陽
        stemElement: constants_1.STEM_ELEMENTS[stem],
        branchElement: constants_1.BRANCH_ELEMENTS[branch],
    };
}
// ============================================================================
// メイン関数
// ============================================================================
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
function calculateFourPillars(year, month, day, hour) {
    // 入力値の検証
    if (year < 1800 || year > 2100) {
        throw new Error('Year must be between 1800 and 2100');
    }
    if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
    }
    if (day < 1 || day > 31) {
        throw new Error('Day must be between 1 and 31');
    }
    if (hour < 0 || hour > 23) {
        throw new Error('Hour must be between 0 and 23');
    }
    // 各柱を計算
    const yearPillar = calculateYearPillar(year, month, day);
    // 月柱の計算には年干が必要
    const monthPillar = calculateMonthPillar(yearPillar.stem, year, month, day);
    // 日柱を計算
    const dayPillar = calculateDayPillar(year, month, day);
    // 時柱の計算には日干が必要
    const hourPillar = calculateHourPillar(dayPillar.stem, hour);
    return {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar,
    };
}
// ============================================================================
// デバッグ用エクスポート
// ============================================================================
/**
 * 内部関数をテスト用にエクスポート
 * （開発時のデバッグ用）
 */
exports.internalFunctions = {
    gregorianToJDN,
    getChineseMonth,
    getLichunDate,
    getStemIndex,
    getBranchIndex,
    getStemByIndex,
    getBranchByIndex,
};
