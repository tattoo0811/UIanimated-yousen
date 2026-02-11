"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTenchusatsu = exports.calculateTwelveStars = exports.calculateTenStars = exports.calculateFourPillars = void 0;
exports.calculateSanmeiChart = calculateSanmeiChart;
exports.formatChart = formatChart;
exports.calculateSanmeiCompatibility = calculateSanmeiCompatibility;
exports.debugChart = debugChart;
__exportStar(require("./constants"), exports);
__exportStar(require("./types"), exports);
var fourPillars_1 = require("./fourPillars");
Object.defineProperty(exports, "calculateFourPillars", { enumerable: true, get: function () { return fourPillars_1.calculateFourPillars; } });
__exportStar(require("./fiveElements"), exports);
__exportStar(require("./compatibility"), exports);
var tenStars_1 = require("./tenStars");
Object.defineProperty(exports, "calculateTenStars", { enumerable: true, get: function () { return tenStars_1.calculateTenStars; } });
var twelveStars_1 = require("./twelveStars");
Object.defineProperty(exports, "calculateTwelveStars", { enumerable: true, get: function () { return twelveStars_1.calculateTwelveStars; } });
var tenchusatsu_1 = require("./tenchusatsu");
Object.defineProperty(exports, "calculateTenchusatsu", { enumerable: true, get: function () { return tenchusatsu_1.calculateTenchusatsu; } });
const fourPillars_2 = require("./fourPillars");
const constants_1 = require("./constants");
const fiveElements_1 = require("./fiveElements");
const compatibility_1 = require("./compatibility");
const tenchusatsu_2 = require("./tenchusatsu");
const tenStars_2 = require("./tenStars");
const twelveStars_2 = require("./twelveStars");
/**
 * 隠れ干データを四柱から抽出
 * @param pillars - 四柱データ
 * @returns 各ポジションの隠れ干データ配列
 */
function extractHiddenStems(pillars) {
    const hiddenStems = [];
    const positions = ['year', 'month', 'day', 'hour'];
    positions.forEach((pos) => {
        const pillar = pillars[pos];
        if (pillar) {
            const branch = pillar.branch;
            const hiddenInfo = constants_1.HIDDEN_STEMS[branch];
            if (hiddenInfo) {
                const mainStem = hiddenInfo.main;
                // 副干と副副干を取得（蔵干テーブルから）
                // 注：HIDDEN_STEMSは主干のみを含むため、副干は別途計算
                // ここではシンプルに主干のみを使用
                hiddenStems.push({
                    branch,
                    mainStem,
                    subStem: undefined,
                    extraStem: undefined,
                });
            }
        }
    });
    return hiddenStems;
}
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
function calculateSanmeiChart(year, month, day, hour = 12) {
    // ステップ1: 四柱を計算
    const fourPillars = (0, fourPillars_2.calculateFourPillars)(year, month, day, hour);
    // ステップ2: 隠れ干を抽出
    const hiddenStems = extractHiddenStems(fourPillars);
    // ステップ3: 五行バランスを分析
    const fiveElementsBalance = (0, fiveElements_1.analyzeFiveElementsBalance)(fourPillars, hiddenStems);
    // ステップ4: 十大主星を計算
    const tenStarChart = (0, tenStars_2.calculateTenStars)(fourPillars);
    // ステップ5: 十二大従星を計算
    const twelveStarChart = (0, twelveStars_2.calculateTwelveStars)(constants_1.STEMS.indexOf(fourPillars.day.stem), {
        year: constants_1.BRANCHES.indexOf(fourPillars.year.branch),
        month: constants_1.BRANCHES.indexOf(fourPillars.month.branch),
        day: constants_1.BRANCHES.indexOf(fourPillars.day.branch),
    });
    // ステップ6: 天中殺を計算
    const tenchusatsu = (0, tenchusatsu_2.calculateTenchusatsu)(fourPillars.day.kanshiIndex);
    const allBranches = constants_1.BRANCHES;
    // ステップ5: チャートをパッケージ化
    const chart = {
        // 基本情報
        birthDate: {
            year,
            month,
            day,
            hour,
            minute: 0, // デフォルト値
        },
        // 四柱
        fourPillars,
        // 十干十二支の情報
        stemBranchInfo: {
            year: {
                stem: fourPillars.year.stem,
                branch: fourPillars.year.branch,
                element: constants_1.STEM_ELEMENTS[fourPillars.year.stem],
                yinYang: fourPillars.year.yinYang,
                hiddenStems: {
                    branch: fourPillars.year.branch,
                    currentStem: constants_1.HIDDEN_STEMS[fourPillars.year.branch].main,
                    timingStem: constants_1.HIDDEN_STEMS[fourPillars.year.branch].main,
                    hiddenInfo: constants_1.HIDDEN_STEMS[fourPillars.year.branch],
                },
            },
            month: {
                stem: fourPillars.month.stem,
                branch: fourPillars.month.branch,
                element: constants_1.STEM_ELEMENTS[fourPillars.month.stem],
                yinYang: fourPillars.month.yinYang,
                hiddenStems: {
                    branch: fourPillars.month.branch,
                    currentStem: constants_1.HIDDEN_STEMS[fourPillars.month.branch].main,
                    timingStem: constants_1.HIDDEN_STEMS[fourPillars.month.branch].main,
                    hiddenInfo: constants_1.HIDDEN_STEMS[fourPillars.month.branch],
                },
            },
            day: {
                stem: fourPillars.day.stem,
                branch: fourPillars.day.branch,
                element: constants_1.STEM_ELEMENTS[fourPillars.day.stem],
                yinYang: fourPillars.day.yinYang,
                hiddenStems: {
                    branch: fourPillars.day.branch,
                    currentStem: constants_1.HIDDEN_STEMS[fourPillars.day.branch].main,
                    timingStem: constants_1.HIDDEN_STEMS[fourPillars.day.branch].main,
                    hiddenInfo: constants_1.HIDDEN_STEMS[fourPillars.day.branch],
                },
            },
            hour: {
                stem: fourPillars.hour.stem,
                branch: fourPillars.hour.branch,
                element: constants_1.STEM_ELEMENTS[fourPillars.hour.stem],
                yinYang: fourPillars.hour.yinYang,
                hiddenStems: {
                    branch: fourPillars.hour.branch,
                    currentStem: constants_1.HIDDEN_STEMS[fourPillars.hour.branch].main,
                    timingStem: constants_1.HIDDEN_STEMS[fourPillars.hour.branch].main,
                    hiddenInfo: constants_1.HIDDEN_STEMS[fourPillars.hour.branch],
                },
            },
        },
        // 日干（基準となる天干）
        dayStem: fourPillars.day.stem,
        dayElement: constants_1.STEM_ELEMENTS[fourPillars.day.stem],
        dayYinYang: fourPillars.day.yinYang,
        // 五運六気（簡略版）
        goUn: {
            element: constants_1.STEM_ELEMENTS[fourPillars.month.stem],
            yinYang: fourPillars.month.yinYang,
        },
        // 十星（十大主星）
        tenStars: {
            year: [{ type: '比肩', stem: fourPillars.year.stem, element: constants_1.STEM_ELEMENTS[fourPillars.year.stem], description: tenStarChart.head.star }],
            month: [{ type: '食神', stem: fourPillars.month.stem, element: constants_1.STEM_ELEMENTS[fourPillars.month.stem], description: tenStarChart.belly.star }],
            day: [{ type: '自分', stem: fourPillars.day.stem, element: constants_1.STEM_ELEMENTS[fourPillars.day.stem], description: tenStarChart.rightHand.star }],
            hour: [{ type: '時間', stem: fourPillars.hour.stem, element: constants_1.STEM_ELEMENTS[fourPillars.hour.stem], description: '' }],
        },
        // 十二大従星
        twelveStars: {
            year: [],
            month: [],
            day: [],
            hour: [],
        },
        // 天中殺
        tenchusatsu: tenchusatsu,
        // 大運（プレースホルダー）
        majorPeriods: [],
        // 命式の特徴
        characteristics: {
            hasSpecialPattern: false,
            pattern: null,
            strengthOfElement: {
                '木': 0,
                '火': 0,
                '土': 0,
                '金': 0,
                '水': 0,
            },
            fortuneLevel: 0,
        },
        // 生涯運（プレースホルダー）
        lifeFortuneByAge: [],
    };
    return chart;
}
/**
 * チャートを人間が読みやすい日本語テキスト形式にフォーマット
 * @param chart - 算命学チャート
 * @returns フォーマットされたテキスト表現
 */
function formatChart(chart) {
    const birthDate = chart.birthDate;
    const fp = chart.fourPillars;
    // 五行バランスを再計算
    const hiddenStems = extractHiddenStems(fp);
    const fiveElementsBalance = (0, fiveElements_1.analyzeFiveElementsBalance)(fp, hiddenStems);
    let output = '';
    output += '═══════════════════════════════════════════\n';
    output += '        【算命学 命式チャート】\n';
    output += '═══════════════════════════════════════════\n\n';
    // 基本情報
    output += `【生年月日時】\n`;
    output += `${birthDate.year}年${birthDate.month}月${birthDate.day}日 ${String(birthDate.hour).padStart(2, '0')}時\n\n`;
    // 四柱
    output += `【四柱（年柱・月柱・日柱・時柱）】\n`;
    output += `年柱: ${fp.year.stem}${fp.year.branch}  `;
    output += `月柱: ${fp.month.stem}${fp.month.branch}  `;
    output += `日柱: ${fp.day.stem}${fp.day.branch}  `;
    output += `時柱: ${fp.hour.stem}${fp.hour.branch}\n\n`;
    // 五行分布
    output += `【五行バランス】\n`;
    output += `木(Wood): ${(fiveElementsBalance.percentages['木'].toFixed(1))}%\n`;
    output += `火(Fire):  ${(fiveElementsBalance.percentages['火'].toFixed(1))}%\n`;
    output += `土(Earth): ${(fiveElementsBalance.percentages['土'].toFixed(1))}%\n`;
    output += `金(Metal): ${(fiveElementsBalance.percentages['金'].toFixed(1))}%\n`;
    output += `水(Water): ${(fiveElementsBalance.percentages['水'].toFixed(1))}%\n`;
    output += `バランススコア: ${(fiveElementsBalance.balanceScore.toFixed(1))}/100\n`;
    output += `支配的要素: ${fiveElementsBalance.dominant}\n`;
    output += `最弱要素: ${fiveElementsBalance.weakest}\n\n`;
    // 日干
    output += `【日干（基準となる天干）】\n`;
    output += `日干: ${chart.dayStem} (${chart.dayElement})\n`;
    output += `陰陽: ${chart.dayYinYang === 'yang' ? '陽' : '陰'}\n\n`;
    // 天中殺
    output += `【天中殺】\n`;
    output += `${chart.tenchusatsu.type}\n`;
    output += `該当: ${chart.tenchusatsu.affectedYears.length > 0 ? 'はい' : 'いいえ'}\n\n`;
    output += '═══════════════════════════════════════════\n';
    return output;
}
/**
 * 二人の相性を計算するラッパー関数
 * @param person1Data - 人物1のデータ {year, month, day, hour}
 * @param person2Data - 人物2のデータ {year, month, day, hour}
 * @returns 相性計算結果
 */
function calculateSanmeiCompatibility(person1Data, person2Data) {
    // 各人物の四柱を計算
    const chart1 = calculateSanmeiChart(person1Data.year, person1Data.month, person1Data.day, person1Data.hour || 12);
    const chart2 = calculateSanmeiChart(person2Data.year, person2Data.month, person2Data.day, person2Data.hour || 12);
    // 干支データを抽出
    const person1GanZhi = {
        yearStem: chart1.fourPillars.year.stem,
        yearBranch: chart1.fourPillars.year.branch,
        monthStem: chart1.fourPillars.month.stem,
        monthBranch: chart1.fourPillars.month.branch,
        dayStem: chart1.fourPillars.day.stem,
        dayBranch: chart1.fourPillars.day.branch,
        hourStem: chart1.fourPillars.hour.stem,
        hourBranch: chart1.fourPillars.hour.branch,
    };
    const person2GanZhi = {
        yearStem: chart2.fourPillars.year.stem,
        yearBranch: chart2.fourPillars.year.branch,
        monthStem: chart2.fourPillars.month.stem,
        monthBranch: chart2.fourPillars.month.branch,
        dayStem: chart2.fourPillars.day.stem,
        dayBranch: chart2.fourPillars.day.branch,
        hourStem: chart2.fourPillars.hour.stem,
        hourBranch: chart2.fourPillars.hour.branch,
    };
    // 相性を計算
    return (0, compatibility_1.calculateCompatibility)(person1GanZhi, person2GanZhi);
}
/**
 * デバッグ用：チャート情報をコンソール出力
 * @param chart - 算命学チャート
 */
function debugChart(chart) {
    console.log('=== Sanmei Chart Debug Info ===');
    console.log('Birth Date:', chart.birthDate);
    console.log('Four Pillars:', chart.fourPillars);
    console.log('Day Stem:', chart.dayStem, 'Element:', chart.dayElement);
    console.log('Tenchusatsu:', chart.tenchusatsu);
    console.log('==============================');
}
