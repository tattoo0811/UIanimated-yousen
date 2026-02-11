/**
 * 算命学エンジン - 型定義ファイル
 * Sanmei-gaku Engine - Type Definitions File
 */

import type {
  Stem,
  Branch,
  Element,
  KanshiIndex,
  HiddenStemInfo,
} from './constants';

// Re-export types from constants for convenience
export type { Stem, Branch, Element, KanshiIndex, HiddenStemInfo };

// ============================================================================
// 基本型
// ============================================================================

/**
 * 陰陽を表す型
 */
export type YinYang = 'yin' | 'yang';

/**
 * 干支のペア (天干 + 地支)
 */
export interface GanZhi {
  stem: Stem;
  branch: Branch;
  kanshiIndex: KanshiIndex; // 0-59
}

// ============================================================================
// 四柱推命の四柱
// ============================================================================

/**
 * 四柱の1つのデータ（例: 年柱、月柱、日柱、時柱）
 */
export interface Pillar {
  stem: Stem;
  branch: Branch;
  kanshiIndex: KanshiIndex;
  element: Element;
  yinYang: YinYang;
  stemElement: Element;
  branchElement: Element;
}

/**
 * 四柱推命の四柱すべて
 */
export interface FourPillars {
  year: Pillar;   // 年柱
  month: Pillar;  // 月柱
  day: Pillar;    // 日柱
  hour: Pillar;   // 時柱
}

// ============================================================================
// 隠れた天干（蔵干）
// ============================================================================

/**
 * 地支の蔵干情報（月内での日数による干の変化）
 */
export interface PillarHiddenStems {
  branch: Branch;
  currentStem: Stem; // 指定日時点での主要な隠れ干
  timingStem: Stem;  // 時期による干
  hiddenInfo: HiddenStemInfo;
}

// ============================================================================
// 通変星 (Tsuhensei) - Stem Relationships
// ============================================================================

/**
 * 通変星のタイプ（日干を基準）
 */
export type TsuhenSei =
  | '比肩'      // 同じ五行、同じ陰陽
  | '劫財'      // 同じ五行、異なる陰陽
  | '食神'      // 日干が生成、同じ陰陽
  | '傷官'      // 日干が生成、異なる陰陽
  | '偏財'      // 日干が制御、同じ陰陽
  | '正財'      // 日干が制御、異なる陰陽
  | '偏官'      // 日干が制御される、同じ陰陽
  | '正官'      // 日干が制御される、異なる陰陽
  | '偏印'      // 日干が生成される、同じ陰陽
  | '印綬';     // 日干が生成される、異なる陰陽

/**
 * 十大主星のタイプ
 */
export type TenStar =
  | '貫索星'
  | '石門星'
  | '鳳閣星'
  | '調舒星'
  | '禄存星'
  | '司禄星'
  | '車騎星'
  | '牽牛星'
  | '龍高星'
  | '玉堂星';

/**
 * 十大主星の配置情報
 */
export interface TenStarPlacement {
  star: TenStar;
  comparisonStem: Stem;
  position: string;
  isSelf?: boolean;
}

/**
 * 十大主星チャート（人体星図）
 */
export interface TenStarChart {
  head: TenStarPlacement;      // 頭
  chest: TenStarPlacement;     // 胸
  rightHand: TenStarPlacement; // 右手
  leftHand: TenStarPlacement;  // 左手
  belly: TenStarPlacement;     // 腹
}

/**
 * 隠れ干マップ（支→隠れ干インデックス）
 */
export type HiddenStemMap = Record<Branch, Stem[]>;

// ============================================================================
// 十二運 (Twelve Phases) - Life Cycle Stages
// ============================================================================

/**
 * 十二運フェーズのタイプ
 */
export type TwelveStarPhase =
  | '長生'      // 誕生と成長
  | '沐浴'      // 洗礼と試練
  | '冠帯'      // 成人と責任
  | '建禄'      // 官位と権力
  | '帝旺'      // 最盛期と繁栄
  | '衰'        // 衰退と減少
  | '病'        // 病気と苦しみ
  | '死'        // 終焉と変化
  | '墓'        // 埋蔵と隠蔽
  | '絶'        // 断絶と中断
  | '胎'        // 胎児と可能性
  | '養';       // 養育と育成

/**
 * 十二大従星のタイプ
 */
export type TwelveStar =
  | '天貴星'
  | '天恍星'
  | '天南星'
  | '天禄星'
  | '天将星'
  | '天堂星'
  | '天胡星'
  | '天極星'
  | '天庫星'
  | '天馳星'
  | '天報星'
  | '天印星';

/**
 * 十二大従星の配置情報
 */
export interface TwelveStarPlacement {
  star: TwelveStar;
  points: number;
  phase: TwelveStarPhase;
  position: string;
}

/**
 * 十二大従星チャート
 */
export interface TwelveStarChart {
  rightLeg: TwelveStarPlacement;     // 右足
  leftLeg: TwelveStarPlacement;      // 左足
  leftShoulder: TwelveStarPlacement; // 左肩
  totalPoints: number;
}

// ============================================================================
// 天中殺 (Tenchusatsu) - The Null Period
// ============================================================================

/**
 * 天中殺: 60干支周期における虚の支（2つ）の期間
 */
export interface Tenchusatsu {
  type: string;                    // 天中殺の種類（例："戌亥天中殺"）
  branch1: number;                 // 第1の虚の支インデックス (0-11)
  branch1Name: Branch;             // 第1の虚の支名
  branch2: number;                 // 第2の虚の支インデックス (0-11)
  branch2Name: Branch;             // 第2の虚の支名
  groupIndex: number;              // グループ番号 (0-5)
  affectedYears: number[];         // 影響を受ける年の配列
  description: string;             // 説明文
}

// ============================================================================
// 相性判定 (Compatibility)
// ============================================================================

/**
 * 相性判定の結果
 */
export interface CompatibilityResult {
  score: number; // 0-100
  rating: 'excellent' | 'good' | 'normal' | 'poor' | 'incompatible';
  elements: {
    stemCompatibility: number;
    branchCompatibility: number;
    pilarCompatibility: number;
  };
  details: string[];
}

// ============================================================================
// 大運 (Major Periods / Luck Cycles)
// ============================================================================

/**
 * 大運: 10年ごとの運の流れ
 */
export interface MajorPeriod {
  index: number; // 1st, 2nd, 3rd...
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  stem: Stem;
  branch: Branch;
  kanshiIndex: KanshiIndex;
  element: Element;
  description: string;
}

// ============================================================================
// 年運 (Yearly Luck)
// ============================================================================

/**
 * 年運: 1年ごとの運気
 */
export interface YearlyLuck {
  year: number;
  age: number;
  stem: Stem;
  branch: Branch;
  kanshiIndex: KanshiIndex;
  element: Element;
  tenchusatsu: Tenchusatsu;
  majorPeriod: MajorPeriod | null;
  description: string;
}

// ============================================================================
// 十二運 (Twelve Phases of Life)
// ============================================================================

/**
 * 十二運: 人生の12段階
 */
export type TwelvePhaseType =
  | 'gaikoku'   // 胎
  | 'yochu'     // 養
  | 'kotoku'    // 長生
  | 'batai'     // 沐浴
  | 'kanpai'    // 冠帯
  | 'kenroku'   // 建禄
  | 'teizai'    // 帝旺
  | 'seisui'    // 衰
  | 'byo'       // 病
  | 'shi'       // 死
  | 'mozoku'    // 墓
  | 'ketsu';    // 絶

export interface TwelvePhase {
  type: TwelvePhaseType;
  phase: number; // 1-12
  description: string;
  meaning: string;
}

// ============================================================================
// 命式全体
// ============================================================================

/**
 * 四柱推命の完全なチャート
 */
export interface SanmeiChart {
  // 基本情報
  birthDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };

  // 四柱
  fourPillars: FourPillars;

  // 十干十二支の情報
  stemBranchInfo: {
    [key in 'year' | 'month' | 'day' | 'hour']: {
      stem: Stem;
      branch: Branch;
      element: Element;
      yinYang: YinYang;
      hiddenStems: PillarHiddenStems;
    };
  };

  // 日干（基準）
  dayStem: Stem;
  dayElement: Element;
  dayYinYang: YinYang;

  // 五運六気
  goUn: {
    element: Element;
    yinYang: YinYang;
  };

  // 十星
  tenStars: {
    [key in 'year' | 'month' | 'day' | 'hour']: TenStar[];
  };

  // 十二支の関係
  twelveStars: {
    [key in 'year' | 'month' | 'day' | 'hour']: TwelveStar[];
  };

  // 天中殺
  tenchusatsu: Tenchusatsu;

  // 大運
  majorPeriods: MajorPeriod[];

  // 命式の特徴
  characteristics: {
    hasSpecialPattern: boolean;
    pattern: string | null;
    strengthOfElement: Record<Element, number>; // -100 to +100
    fortuneLevel: number; // -100 to +100
  };

  // 生涯運
  lifeFortuneByAge: YearlyLuck[];
}

// ============================================================================
// 計算オプション
// ============================================================================

/**
 * 四柱計算のオプション
 */
export interface FourPillarsCalculationOptions {
  includeHiddenStems?: boolean;
  includeTenStars?: boolean;
  includeTwelveStars?: boolean;
  includeTenchusatsu?: boolean;
  includeMajorPeriods?: boolean;
  timezoneOffset?: number; // UTC からのオフセット（時間）
}
