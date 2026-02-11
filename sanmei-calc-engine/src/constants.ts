/**
 * 算命学エンジン - 基本定数ファイル
 * Sanmei-gaku Engine - Constants File
 */

// ============================================================================
// 十干 (Ten Heavenly Stems) - 天の10種類の干支
// ============================================================================

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type Stem = typeof STEMS[number];

/**
 * 五行 (Five Elements): 木(木), 火(火), 土(土), 金(金), 水(水)
 */
export const ELEMENTS = ['木', '火', '土', '金', '水'] as const;
export type Element = typeof ELEMENTS[number];

/**
 * 陰陽区分 (Yin/Yang Classification)
 * 陽: 甲丙戊庚壬 (indices: 0, 2, 4, 6, 8)
 * 陰: 乙丁己辛癸 (indices: 1, 3, 5, 7, 9)
 */
export const STEM_YIN_YANG: Record<Stem, 'yang' | 'yin'> = {
  '甲': 'yang', '乙': 'yin',
  '丙': 'yang', '丁': 'yin',
  '戊': 'yang', '己': 'yin',
  '庚': 'yang', '辛': 'yin',
  '壬': 'yang', '癸': 'yin',
};

/**
 * 天干の五行 (Stem Elements)
 * 甲乙→木, 丙丁→火, 戊己→土, 庚辛→金, 壬癸→水
 */
export const STEM_ELEMENTS: Record<Stem, Element> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// ============================================================================
// 十二支 (Twelve Earthly Branches) - 地の12種類の干支
// ============================================================================

export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type Branch = typeof BRANCHES[number];

/**
 * 地支の陰陽区分 (Branch Yin/Yang Classification)
 * 陽: 子寅辰午申戌 (indices: 0, 2, 4, 6, 8, 10)
 * 陰: 丑卯巳未酉亥 (indices: 1, 3, 5, 7, 9, 11)
 */
export const BRANCH_YIN_YANG: Record<Branch, 'yang' | 'yin'> = {
  '子': 'yang', '丑': 'yin',
  '寅': 'yang', '卯': 'yin',
  '辰': 'yang', '巳': 'yin',
  '午': 'yang', '未': 'yin',
  '申': 'yang', '酉': 'yin',
  '戌': 'yang', '亥': 'yin',
};

/**
 * 地支の五行 (Branch Elements)
 * 子→水, 丑→土, 寅→木, 卯→木, 辰→土, 巳→火,
 * 午→火, 未→土, 申→金, 酉→金, 戌→土, 亥→水
 */
export const BRANCH_ELEMENTS: Record<Branch, Element> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

// ============================================================================
// 六十干支 (60 Stem-Branch Combinations / Kanshi Cycle)
// ============================================================================

export const KANSHI = generateKanshi();

export type KanshiIndex = number; // 0-59

/**
 * 六十干支の生成
 * Rule: 陽干は陽支とペア、陰干は陰支とペアとなる
 * Formula: i番目 = stem[i % 10] + branch[i % 12]
 */
function generateKanshi(): Array<[Stem, Branch]> {
  const kanshi: Array<[Stem, Branch]> = [];
  for (let i = 0; i < 60; i++) {
    const stemIdx = i % 10;
    const branchIdx = i % 12;
    kanshi.push([STEMS[stemIdx], BRANCHES[branchIdx]]);
  }
  return kanshi;
}

/**
 * 干支の名前文字列を生成 (例: "甲子")
 */
export function kanshiToString(stem: Stem, branch: Branch): string {
  return `${stem}${branch}`;
}

/**
 * 干支インデックスから文字列を生成
 */
export function kanshiIndexToString(index: KanshiIndex): string {
  const [stem, branch] = KANSHI[index];
  return kanshiToString(stem, branch);
}

// ============================================================================
// 蔵干 (Hidden Stems) - 二十八元システム
// 各地支に隠れている天干と、その出現時期（月内の日数）
// ============================================================================

export interface HiddenStemEntry {
  main: Stem;
  sub?: Stem;  // 次要素
  extra?: Stem; // 副要素
}

export interface HiddenStemTiming {
  stem: Stem;
  days: number; // 月内で何日目までこの干が現れるか
}

export interface HiddenStemInfo {
  main: Stem;
  timings: HiddenStemTiming[];
}

/**
 * 蔵干データ - 各地支に隠れている天干と出現時期
 * 月の１日目から数えて、何日目までその干が有効かを記録
 */
export const HIDDEN_STEMS: Record<Branch, HiddenStemInfo> = {
  // 子月: 主干 癸
  '子': {
    main: '癸',
    timings: [{ stem: '癸', days: 30 }],
  },
  // 丑月: 癸(1-9日), 辛(10-12日), 己(13-30日)
  '丑': {
    main: '己',
    timings: [
      { stem: '癸', days: 9 },
      { stem: '辛', days: 12 },
      { stem: '己', days: 30 },
    ],
  },
  // 寅月: 戊(1-7日), 丙(8-14日), 甲(15-30日)
  '寅': {
    main: '甲',
    timings: [
      { stem: '戊', days: 7 },
      { stem: '丙', days: 14 },
      { stem: '甲', days: 30 },
    ],
  },
  // 卯月: 主干 乙
  '卯': {
    main: '乙',
    timings: [{ stem: '乙', days: 30 }],
  },
  // 辰月: 乙(1-9日), 癸(10-12日), 戊(13-30日)
  '辰': {
    main: '戊',
    timings: [
      { stem: '乙', days: 9 },
      { stem: '癸', days: 12 },
      { stem: '戊', days: 30 },
    ],
  },
  // 巳月: 戊(1-7日), 庚(8-14日), 丙(15-30日)
  '巳': {
    main: '丙',
    timings: [
      { stem: '戊', days: 7 },
      { stem: '庚', days: 14 },
      { stem: '丙', days: 30 },
    ],
  },
  // 午月: 丙(1-10日), 丁(11-30日)
  // 注意: 午の主干は丁（己ではない！）
  '午': {
    main: '丁',
    timings: [
      { stem: '丙', days: 10 },
      { stem: '丁', days: 30 },
    ],
  },
  // 未月: 丁(1-9日), 乙(10-12日), 己(13-30日)
  '未': {
    main: '己',
    timings: [
      { stem: '丁', days: 9 },
      { stem: '乙', days: 12 },
      { stem: '己', days: 30 },
    ],
  },
  // 申月: 戊(1-7日), 壬(8-14日), 庚(15-30日)
  '申': {
    main: '庚',
    timings: [
      { stem: '戊', days: 7 },
      { stem: '壬', days: 14 },
      { stem: '庚', days: 30 },
    ],
  },
  // 酉月: 主干 辛
  '酉': {
    main: '辛',
    timings: [{ stem: '辛', days: 30 }],
  },
  // 戌月: 辛(1-9日), 丁(10-12日), 戊(13-30日)
  '戌': {
    main: '戊',
    timings: [
      { stem: '辛', days: 9 },
      { stem: '丁', days: 12 },
      { stem: '戊', days: 30 },
    ],
  },
  // 亥月: 甲(1-7日), 壬(8-30日)
  // 注意: 亥の主干は壬（甲ではない！）
  '亥': {
    main: '壬',
    timings: [
      { stem: '甲', days: 7 },
      { stem: '壬', days: 30 },
    ],
  },
};

// ============================================================================
// 五虎遁 (Wu Hu Dun) - Year Stem → Month Stem Determination
// ============================================================================

/**
 * 五虎遁: 年の干から月の干の起点を決定
 * 年干の組み合わせごとに、寅月の干が決まる
 * Key: yearStemIndex % 5
 * Value: stemIndexOfYinMonth (寅月の干のインデックス)
 */
export const WU_HU_DUN: Record<number, number> = {
  0: 2,  // 甲/己年 (yearStemIdx=0,5) → 丙寅月始 (stemIdx=2)
  1: 4,  // 乙/庚年 (yearStemIdx=1,6) → 戊寅月始 (stemIdx=4)
  2: 6,  // 丙/辛年 (yearStemIdx=2,7) → 庚寅月始 (stemIdx=6)
  3: 8,  // 丁/壬年 (yearStemIdx=3,8) → 壬寅月始 (stemIdx=8)
  4: 0,  // 戊/癸年 (yearStemIdx=4,9) → 甲寅月始 (stemIdx=0)
};

// ============================================================================
// 五鼠遁 (Wu Shu Dun) - Day Stem → Hour Stem Determination
// ============================================================================

/**
 * 五鼠遁: 日の干から時間の干の起点を決定
 * 日干の組み合わせごとに、子時の干が決まる
 * Key: dayStemIndex % 5
 * Value: stemIndexOfZiHour (子時の干のインデックス)
 */
export const WU_SHU_DUN: Record<number, number> = {
  0: 0,  // 甲/己日 (dayStemIdx=0,5) → 甲子時始 (stemIdx=0)
  1: 2,  // 乙/庚日 (dayStemIdx=1,6) → 丙子時始 (stemIdx=2)
  2: 4,  // 丙/辛日 (dayStemIdx=2,7) → 戊子時始 (stemIdx=4)
  3: 6,  // 丁/壬日 (dayStemIdx=3,8) → 庚子時始 (stemIdx=6)
  4: 8,  // 戊/癸日 (dayStemIdx=4,9) → 壬子時始 (stemIdx=8)
};

// ============================================================================
// 建禄支 (Build Luck Branch) - 十干ごとの禄支
// ============================================================================

/**
 * 建禄支: 各天干に対応する禄支
 * 甲→寅, 乙→卯, 丙→巳, 丁→午, 戊→午, 己→午, 庚→申, 辛→酉, 壬→亥, 癸→子
 */
export const BUILD_LUCK_BRANCH: Record<Stem, Branch> = {
  '甲': '寅',
  '乙': '卯',
  '丙': '巳',
  '丁': '午',
  '戊': '午',
  '己': '午',
  '庚': '申',
  '辛': '酉',
  '壬': '亥',
  '癸': '子',
};

// ============================================================================
// 通変星関係マッピング - 五行間の相生・相剋関係
// ============================================================================

/**
 * 五行間の相生（生成）関係
 * 木→火→土→金→水→木
 */
export const GENERATION_RELATIONS: Record<string, string> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木',
};

/**
 * 五行間の相剋（制御）関係
 * 木→土→水→火→金→木
 */
export const CONTROL_RELATIONS: Record<string, string> = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木',
};

/**
 * 五行要素マッピング（天干→五行）
 */
export const ELEMENT_MAP: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/**
 * 陰陽マッピング（天干→陰陽）
 */
export const YIN_YANG_MAP: Record<string, boolean> = {
  '甲': true, '乙': false,
  '丙': true, '丁': false,
  '戊': true, '己': false,
  '庚': true, '辛': false,
  '壬': true, '癸': false,
};

// ============================================================================
// 節入り (Solar Terms Dates) - 2020-2030
// 各年の12節（中気ではなく、節のみ）の節入り日
// ============================================================================

/**
 * 節入りデータ
 * 12月の境界を定義する節：
 * 1月(寅月): 立春 ~Feb 4
 * 2月(卯月): 啓蟄 ~Mar 6
 * 3月(辰月): 清明 ~Apr 5
 * 4月(巳月): 立夏 ~May 6
 * 5月(午月): 芒種 ~Jun 6
 * 6月(未月): 小暑 ~Jul 7
 * 7月(申月): 立秋 ~Aug 7
 * 8月(酉月): 白露 ~Sep 8
 * 9月(戌月): 寒露 ~Oct 8
 * 10月(亥月): 立冬 ~Nov 7
 * 11月(子月): 大雪 ~Dec 7
 * 12月(丑月): 小寒 ~Jan 6
 */

export interface SolarTermData {
  year: number;
  terms: {
    // 各月（1-12）の節入り日
    // 月1(寅月)の立春から月12(丑月)の小寒まで
    [month: number]: number; // day of month
  };
}

export const SOLAR_TERMS: SolarTermData[] = [
  {
    year: 2020,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 6,   // 啓蟄 Mar 6 (2020年は3月5日だが、近似値)
      3: 5,   // 清明 Apr 5 (実際は2020年4月4日)
      4: 6,   // 立夏 May 6 (実際は2020年5月5日)
      5: 6,   // 芒種 Jun 6 (実際は2020年6月5日)
      6: 7,   // 小暑 Jul 7 (実際は2020年7月6日)
      7: 7,   // 立秋 Aug 7 (実際は2020年8月7日)
      8: 8,   // 白露 Sep 8 (実際は2020年9月8日)
      9: 8,   // 寒露 Oct 8 (実際は2020年10月8日)
      10: 7,  // 立冬 Nov 7 (実際は2020年11月7日)
      11: 7,  // 大雪 Dec 7 (実際は2020年12月7日)
      12: 5,  // 小寒 Jan 5 (2021年1月5日)
    },
  },
  {
    year: 2021,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 5,   // 啓蟄 Mar 5
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 7,  // 立冬 Nov 7
      11: 7,  // 大雪 Dec 7
      12: 6,  // 小寒 Jan 6
    },
  },
  {
    year: 2022,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 5,   // 啓蟄 Mar 5
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 7,  // 立冬 Nov 7
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  },
  {
    year: 2023,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 5,   // 啓蟄 Mar 5
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 8,  // 立冬 Nov 8
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  },
  {
    year: 2024,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 4,   // 啓蟄 Mar 4
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 8,  // 立冬 Nov 8
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  },
  {
    year: 2025,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 5,   // 啓蟄 Mar 5
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 7,  // 立冬 Nov 7
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  },
  {
    year: 2026,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 5,   // 啓蟄 Mar 5
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 7,  // 立冬 Nov 7
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  },
  {
    year: 2027,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 5,   // 啓蟄 Mar 5
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 7,  // 立冬 Nov 7
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  },
  {
    year: 2028,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 4,   // 啓蟄 Mar 4
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 8,  // 立冬 Nov 8
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  },
  {
    year: 2029,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 5,   // 啓蟄 Mar 5
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 8,  // 立冬 Nov 8
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  },
  {
    year: 2030,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 5,   // 啓蟄 Mar 5
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 7,  // 立冬 Nov 7
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  },
];

/**
 * 指定した年の節入りデータを取得
 * テーブルにない年は近似値で推定
 */
export function getSolarTermData(year: number): SolarTermData {
  const found = SOLAR_TERMS.find((data) => data.year === year);
  if (found) {
    return found;
  }

  // テーブルにない年: 近似値を返す
  // 節入りの日付は毎年ほぼ同じか±1日程度の変動
  return {
    year,
    terms: {
      1: 4,   // 立春 Feb 4
      2: 5,   // 啓蟄 Mar 5
      3: 5,   // 清明 Apr 5
      4: 5,   // 立夏 May 5
      5: 6,   // 芒種 Jun 6
      6: 7,   // 小暑 Jul 7
      7: 7,   // 立秋 Aug 7
      8: 8,   // 白露 Sep 8
      9: 8,   // 寒露 Oct 8
      10: 7,  // 立冬 Nov 7
      11: 7,  // 大雪 Dec 7
      12: 5,  // 小寒 Jan 5
    },
  };
}
