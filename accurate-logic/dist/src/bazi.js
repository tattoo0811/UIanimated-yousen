"use strict";
/**
 * accurate-logic BaZi (四柱推命)
 * 正確な四柱推命の計算ロジック
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBaZi = calculateBaZi;
const lunar_javascript_1 = require("lunar-javascript");
const constants_1 = require("./constants");
/**
 * 干支オブジェクト生成
 */
function createGanZhi(stemIdx, branchIdx, hiddenStems = []) {
    const s = ((stemIdx % 10) + 10) % 10;
    const b = ((branchIdx % 12) + 12) % 12;
    // 干支ID（1-60）を計算
    let id = 1;
    for (let i = 0; i < 60; i++) {
        if (i % 10 === s && i % 12 === b) {
            id = i + 1;
            break;
        }
    }
    return {
        stem: s + 1,
        branch: b + 1,
        stemStr: constants_1.STEMS[s],
        branchStr: constants_1.BRANCHES[b],
        name: `${constants_1.STEMS[s]}${constants_1.BRANCHES[b]}`,
        id: id,
        hiddenStems: hiddenStems
    };
}
/**
 * 四柱推命（BaZi）を計算
 * @param date グレゴリオ暦の生年月日時刻
 * @param longitude 経度（デフォルト: 135度）
 * @returns 四柱（年柱・月柱・日柱・時柱）
 */
function calculateBaZi(date, longitude = 135) {
    const solarDate = lunar_javascript_1.Solar.fromDate(date);
    const lunar = solarDate.getLunar();
    // 年柱・月柱・日柱を取得
    // lunar-javascriptは正しく四柱推命を計算し返す
    // - getYearInGanZhi() は年柱を返す
    // - getMonthInGanZhi() は月柱を返す
    // - getDayInGanZhi() は日柱を返す
    const yearGanZhiStr = lunar.getYearInGanZhi();
    const monthGanZhiStr = lunar.getMonthInGanZhi();
    const dayGanZhiStr = lunar.getDayInGanZhi();
    // 天干・地支を分割
    const yearStemStr = yearGanZhiStr.charAt(0);
    const yearBranchStr = yearGanZhiStr.charAt(1);
    const monthStemStr = monthGanZhiStr.charAt(0);
    const monthBranchStr = monthGanZhiStr.charAt(1);
    const dayStemStr = dayGanZhiStr.charAt(0);
    const dayBranchStr = dayGanZhiStr.charAt(1);
    // インデックスを取得
    const yearStemIdx = constants_1.STEM_TO_INDEX[yearStemStr];
    const yearBranchIdx = constants_1.BRANCH_TO_INDEX[yearBranchStr];
    const monthStemIdx = constants_1.STEM_TO_INDEX[monthStemStr];
    const monthBranchIdx = constants_1.BRANCH_TO_INDEX[monthBranchStr];
    const dayStemIdx = constants_1.STEM_TO_INDEX[dayStemStr];
    const dayBranchIdx = constants_1.BRANCH_TO_INDEX[dayBranchStr];
    // 四柱を生成（蔵干は後で設定）
    const yearGanZhi = createGanZhi(yearStemIdx, yearBranchIdx);
    const monthGanZhi = createGanZhi(monthStemIdx, monthBranchIdx);
    const dayGanZhi = createGanZhi(dayStemIdx, dayBranchIdx);
    // 時柱の計算
    const h = date.getHours();
    // 地支: (h+1)/2 % 12
    const hourBranchIdx = Math.floor((h + 1) / 2) % 12;
    // 天干: 五鼠遁（日干から時干を求める）
    // 甲己 → 甲, 乙庚 → 丙, 丙辛 → 戊, 丁壬 → 庚, 戊癸 → 壬
    const hourStartStem = ((dayStemIdx % 5) * 2) % 10;
    const hourStemIdx = (hourStartStem + hourBranchIdx) % 10;
    const hourGanZhi = createGanZhi(hourStemIdx, hourBranchIdx);
    return {
        year: yearGanZhi,
        month: monthGanZhi,
        day: dayGanZhi,
        hour: hourGanZhi
    };
}
