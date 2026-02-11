"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 朱学院参照実装との整合性テスト
 * 検証対象: 月柱計算の修正確認
 */
const fourPillars_1 = require("./fourPillars");
const { getChineseMonth } = fourPillars_1.internalFunctions;
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   朱学院 参照実装との整合性テスト                          ║');
console.log('║   月柱計算バグ修正の検証                                  ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log();
const testCases = [
    {
        name: 'テスト1: 1995年9月14日（朱学院参照）',
        year: 1995, month: 9, day: 14, hour: 12,
        expected: {
            yearStem: '乙', yearBranch: '亥',
            monthStem: '乙', monthBranch: '酉', // 朱学院: 乙酉
            dayStem: '戊', dayBranch: '申',
        },
    },
    {
        name: 'テスト2: 1995年9月15日（朱学院参照）',
        year: 1995, month: 9, day: 15, hour: 12,
        expected: {
            yearStem: '乙', yearBranch: '亥',
            monthStem: '乙', monthBranch: '酉', // 朱学院: 乙酉
            dayStem: '己', dayBranch: '酉',
        },
    },
    {
        name: 'テスト3: 2000年9月15日（朱学院参照）',
        year: 2000, month: 9, day: 15, hour: 12,
        expected: {
            yearStem: '庚', yearBranch: '辰',
            monthStem: '乙', monthBranch: '酉', // 朱学院: 乙酉
            dayStem: '丙', dayBranch: '子',
        },
    },
];
// ============================================================
// テスト実行
// ============================================================
let passCount = 0;
let failCount = 0;
for (const tc of testCases) {
    console.log(`============================================================`);
    console.log(`${tc.name}`);
    console.log(`============================================================`);
    // 旧暦月デバッグ
    const chineseMonth = getChineseMonth(tc.year, tc.month, tc.day);
    console.log(`  旧暦月(Chinese Month): ${chineseMonth}`);
    const pillars = (0, fourPillars_1.calculateFourPillars)(tc.year, tc.month, tc.day, tc.hour);
    const results = [
        { label: '年柱・干', actual: pillars.year.stem, expected: tc.expected.yearStem },
        { label: '年柱・支', actual: pillars.year.branch, expected: tc.expected.yearBranch },
        { label: '月柱・干', actual: pillars.month.stem, expected: tc.expected.monthStem },
        { label: '月柱・支', actual: pillars.month.branch, expected: tc.expected.monthBranch },
        { label: '日柱・干', actual: pillars.day.stem, expected: tc.expected.dayStem },
        { label: '日柱・支', actual: pillars.day.branch, expected: tc.expected.dayBranch },
    ];
    let allPass = true;
    for (const r of results) {
        const ok = r.actual === r.expected;
        const mark = ok ? '✅' : '❌';
        console.log(`  ${mark} ${r.label}: ${r.actual} (期待: ${r.expected})`);
        if (!ok)
            allPass = false;
    }
    console.log(`  四柱: ${pillars.year.stem}${pillars.year.branch} ${pillars.month.stem}${pillars.month.branch} ${pillars.day.stem}${pillars.day.branch} ${pillars.hour.stem}${pillars.hour.branch}`);
    if (allPass) {
        passCount++;
        console.log(`  → ✅ PASS`);
    }
    else {
        failCount++;
        console.log(`  → ❌ FAIL`);
    }
    console.log();
}
// ============================================================
// 追加: 境界テスト（節入り前後）
// ============================================================
console.log(`============================================================`);
console.log(`追加: 節入り境界テスト`);
console.log(`============================================================`);
// 白露(Sep 8)の前後
const beforeBailu = (0, fourPillars_1.calculateFourPillars)(1995, 9, 7, 12); // 白露前 → 申月(7)
const afterBailu = (0, fourPillars_1.calculateFourPillars)(1995, 9, 8, 12); // 白露当日 → 酉月(8)
const afterBailu2 = (0, fourPillars_1.calculateFourPillars)(1995, 9, 9, 12); // 白露後 → 酉月(8)
console.log(`  白露前 (1995/9/7):  月柱=${beforeBailu.month.stem}${beforeBailu.month.branch} (期待: 甲申 = 申月)`);
console.log(`  白露当日(1995/9/8): 月柱=${afterBailu.month.stem}${afterBailu.month.branch} (期待: 乙酉 = 酉月)`);
console.log(`  白露後 (1995/9/9):  月柱=${afterBailu2.month.stem}${afterBailu2.month.branch} (期待: 乙酉 = 酉月)`);
const bOk1 = beforeBailu.month.branch === '申';
const bOk2 = afterBailu.month.branch === '酉';
const bOk3 = afterBailu2.month.branch === '酉';
console.log(`  ${bOk1 ? '✅' : '❌'} 白露前: 申月`);
console.log(`  ${bOk2 ? '✅' : '❌'} 白露当日: 酉月`);
console.log(`  ${bOk3 ? '✅' : '❌'} 白露後: 酉月`);
if (bOk1 && bOk2 && bOk3)
    passCount += 3;
else
    failCount += 3;
// 立春(Feb 4)の前後
const beforeLichun = (0, fourPillars_1.calculateFourPillars)(1995, 2, 3, 12); // 立春前 → 丑月(12)
const afterLichun = (0, fourPillars_1.calculateFourPillars)(1995, 2, 4, 12); // 立春当日 → 寅月(1)
console.log();
console.log(`  立春前 (1995/2/3):  月柱=${beforeLichun.month.stem}${beforeLichun.month.branch} (期待: 丁丑 = 丑月)`);
console.log(`  立春当日(1995/2/4): 月柱=${afterLichun.month.stem}${afterLichun.month.branch} (期待: 戊寅 = 寅月)`);
const lOk1 = beforeLichun.month.branch === '丑';
const lOk2 = afterLichun.month.branch === '寅';
console.log(`  ${lOk1 ? '✅' : '❌'} 立春前: 丑月`);
console.log(`  ${lOk2 ? '✅' : '❌'} 立春当日: 寅月`);
if (lOk1 && lOk2)
    passCount += 2;
else
    failCount += 2;
// 1月テスト（小寒前後）
const jan3 = (0, fourPillars_1.calculateFourPillars)(1995, 1, 3, 12); // 小寒前 → 子月(11)
const jan6 = (0, fourPillars_1.calculateFourPillars)(1995, 1, 6, 12); // 小寒後 → 丑月(12)
console.log();
console.log(`  小寒前 (1995/1/3):  月柱=${jan3.month.stem}${jan3.month.branch} (期待: 子月)`);
console.log(`  小寒後 (1995/1/6):  月柱=${jan6.month.stem}${jan6.month.branch} (期待: 丑月)`);
const jOk1 = jan3.month.branch === '子';
const jOk2 = jan6.month.branch === '丑';
console.log(`  ${jOk1 ? '✅' : '❌'} 小寒前: 子月`);
console.log(`  ${jOk2 ? '✅' : '❌'} 小寒後: 丑月`);
if (jOk1 && jOk2)
    passCount += 2;
else
    failCount += 2;
// ============================================================
// 結果サマリー
// ============================================================
console.log();
console.log(`════════════════════════════════════════════════════════════`);
console.log(`テスト結果: ${passCount} PASS / ${failCount} FAIL (total: ${passCount + failCount})`);
if (failCount === 0) {
    console.log(`✅ ALL TESTS PASSED`);
}
else {
    console.log(`❌ SOME TESTS FAILED`);
}
console.log(`════════════════════════════════════════════════════════════`);
