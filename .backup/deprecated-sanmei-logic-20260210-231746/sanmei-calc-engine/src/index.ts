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

import type {
  FourPillars,
  SanmeiChart,
  CompatibilityResult,
  TenStarChart,
  TwelveStarChart,
} from './types';
import { calculateFourPillars } from './fourPillars';
import { STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS, HIDDEN_STEMS } from './constants';
import {
  analyzeFiveElementsBalance,
  type FiveElementsBalance,
  type HiddenStemData,
} from './fiveElements';
import { calculateCompatibility, type PersonGanZhi } from './compatibility';
import { calculateTenchusatsu } from './tenchusatsu';
import { calculateTenStars } from './tenStars';
import { calculateTwelveStars } from './twelveStars';

/**
 * 隠れ干データを四柱から抽出
 * @param pillars - 四柱データ
 * @returns 各ポジションの隠れ干データ配列
 */
function extractHiddenStems(pillars: FourPillars): HiddenStemData[] {
  const hiddenStems: HiddenStemData[] = [];

  const positions = ['year', 'month', 'day', 'hour'] as const;

  positions.forEach((pos) => {
    const pillar = pillars[pos];
    if (pillar) {
      const branch = pillar.branch;
      const hiddenInfo = HIDDEN_STEMS[branch];

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
export function calculateSanmeiChart(
  year: number,
  month: number,
  day: number,
  hour: number = 12
): SanmeiChart {
  // ステップ1: 四柱を計算
  const fourPillars = calculateFourPillars(year, month, day, hour);

  // ステップ2: 隠れ干を抽出
  const hiddenStems = extractHiddenStems(fourPillars);

  // ステップ3: 五行バランスを分析
  const fiveElementsBalance = analyzeFiveElementsBalance(fourPillars, hiddenStems);

  // ステップ4: 十大主星を計算
  const tenStarChart = calculateTenStars(fourPillars);

  // ステップ5: 十二大従星を計算
  const twelveStarChart = calculateTwelveStars(
    STEMS.indexOf(fourPillars.day.stem),
    {
      year: BRANCHES.indexOf(fourPillars.year.branch),
      month: BRANCHES.indexOf(fourPillars.month.branch),
      day: BRANCHES.indexOf(fourPillars.day.branch),
    }
  );

  // ステップ6: 天中殺を計算
  const tenchusatsu = calculateTenchusatsu(fourPillars.day.kanshiIndex);

  const allBranches = BRANCHES;

  // ステップ5: チャートをパッケージ化
  const chart: SanmeiChart = {
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
        element: STEM_ELEMENTS[fourPillars.year.stem],
        yinYang: fourPillars.year.yinYang,
        hiddenStems: {
          branch: fourPillars.year.branch,
          currentStem: HIDDEN_STEMS[fourPillars.year.branch].main,
          timingStem: HIDDEN_STEMS[fourPillars.year.branch].main,
          hiddenInfo: HIDDEN_STEMS[fourPillars.year.branch],
        },
      },
      month: {
        stem: fourPillars.month.stem,
        branch: fourPillars.month.branch,
        element: STEM_ELEMENTS[fourPillars.month.stem],
        yinYang: fourPillars.month.yinYang,
        hiddenStems: {
          branch: fourPillars.month.branch,
          currentStem: HIDDEN_STEMS[fourPillars.month.branch].main,
          timingStem: HIDDEN_STEMS[fourPillars.month.branch].main,
          hiddenInfo: HIDDEN_STEMS[fourPillars.month.branch],
        },
      },
      day: {
        stem: fourPillars.day.stem,
        branch: fourPillars.day.branch,
        element: STEM_ELEMENTS[fourPillars.day.stem],
        yinYang: fourPillars.day.yinYang,
        hiddenStems: {
          branch: fourPillars.day.branch,
          currentStem: HIDDEN_STEMS[fourPillars.day.branch].main,
          timingStem: HIDDEN_STEMS[fourPillars.day.branch].main,
          hiddenInfo: HIDDEN_STEMS[fourPillars.day.branch],
        },
      },
      hour: {
        stem: fourPillars.hour.stem,
        branch: fourPillars.hour.branch,
        element: STEM_ELEMENTS[fourPillars.hour.stem],
        yinYang: fourPillars.hour.yinYang,
        hiddenStems: {
          branch: fourPillars.hour.branch,
          currentStem: HIDDEN_STEMS[fourPillars.hour.branch].main,
          timingStem: HIDDEN_STEMS[fourPillars.hour.branch].main,
          hiddenInfo: HIDDEN_STEMS[fourPillars.hour.branch],
        },
      },
    },

    // 日干（基準となる天干）
    dayStem: fourPillars.day.stem,
    dayElement: STEM_ELEMENTS[fourPillars.day.stem],
    dayYinYang: fourPillars.day.yinYang,

    // 五運六気（簡略版）
    goUn: {
      element: STEM_ELEMENTS[fourPillars.month.stem],
      yinYang: fourPillars.month.yinYang,
    },

    // 十星（十大主星）
    tenStars: {
      year: [{ type: '比肩', stem: fourPillars.year.stem, element: STEM_ELEMENTS[fourPillars.year.stem], description: tenStarChart.head.star }] as any,
      month: [{ type: '食神', stem: fourPillars.month.stem, element: STEM_ELEMENTS[fourPillars.month.stem], description: tenStarChart.belly.star }] as any,
      day: [{ type: '自分', stem: fourPillars.day.stem, element: STEM_ELEMENTS[fourPillars.day.stem], description: tenStarChart.rightHand.star }] as any,
      hour: [{ type: '時間', stem: fourPillars.hour.stem, element: STEM_ELEMENTS[fourPillars.hour.stem], description: '' }] as any,
    },

    // 十二大従星
    twelveStars: {
      year: [] as any,
      month: [] as any,
      day: [] as any,
      hour: [] as any,
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
export function formatChart(chart: SanmeiChart): string {
  const birthDate = chart.birthDate;
  const fp = chart.fourPillars;

  // 五行バランスを再計算
  const hiddenStems = extractHiddenStems(fp);
  const fiveElementsBalance = analyzeFiveElementsBalance(fp, hiddenStems);

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
export function calculateSanmeiCompatibility(
  person1Data: {
    year: number;
    month: number;
    day: number;
    hour?: number;
  },
  person2Data: {
    year: number;
    month: number;
    day: number;
    hour?: number;
  }
): CompatibilityResult {
  // 各人物の四柱を計算
  const chart1 = calculateSanmeiChart(
    person1Data.year,
    person1Data.month,
    person1Data.day,
    person1Data.hour || 12
  );

  const chart2 = calculateSanmeiChart(
    person2Data.year,
    person2Data.month,
    person2Data.day,
    person2Data.hour || 12
  );

  // 干支データを抽出
  const person1GanZhi: PersonGanZhi = {
    yearStem: chart1.fourPillars.year.stem,
    yearBranch: chart1.fourPillars.year.branch,
    monthStem: chart1.fourPillars.month.stem,
    monthBranch: chart1.fourPillars.month.branch,
    dayStem: chart1.fourPillars.day.stem,
    dayBranch: chart1.fourPillars.day.branch,
    hourStem: chart1.fourPillars.hour.stem,
    hourBranch: chart1.fourPillars.hour.branch,
  };

  const person2GanZhi: PersonGanZhi = {
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
  return calculateCompatibility(person1GanZhi, person2GanZhi);
}

/**
 * デバッグ用：チャート情報をコンソール出力
 * @param chart - 算命学チャート
 */
export function debugChart(chart: SanmeiChart): void {
  console.log('=== Sanmei Chart Debug Info ===');
  console.log('Birth Date:', chart.birthDate);
  console.log('Four Pillars:', chart.fourPillars);
  console.log('Day Stem:', chart.dayStem, 'Element:', chart.dayElement);
  console.log('Tenchusatsu:', chart.tenchusatsu);
  console.log('==============================');
}
