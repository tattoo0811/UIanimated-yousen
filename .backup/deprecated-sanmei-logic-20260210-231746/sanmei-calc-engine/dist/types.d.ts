/**
 * 算命学エンジン - 型定義ファイル
 * Sanmei-gaku Engine - Type Definitions File
 */
import type { Stem, Branch, Element, KanshiIndex, HiddenStemInfo } from './constants';
export type { Stem, Branch, Element, KanshiIndex, HiddenStemInfo };
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
    kanshiIndex: KanshiIndex;
}
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
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
}
/**
 * 地支の蔵干情報（月内での日数による干の変化）
 */
export interface PillarHiddenStems {
    branch: Branch;
    currentStem: Stem;
    timingStem: Stem;
    hiddenInfo: HiddenStemInfo;
}
/**
 * 通変星のタイプ（日干を基準）
 */
export type TsuhenSei = '比肩' | '劫財' | '食神' | '傷官' | '偏財' | '正財' | '偏官' | '正官' | '偏印' | '印綬';
/**
 * 十大主星のタイプ
 */
export type TenStar = '貫索星' | '石門星' | '鳳閣星' | '調舒星' | '禄存星' | '司禄星' | '車騎星' | '牽牛星' | '龍高星' | '玉堂星';
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
    head: TenStarPlacement;
    chest: TenStarPlacement;
    rightHand: TenStarPlacement;
    leftHand: TenStarPlacement;
    belly: TenStarPlacement;
}
/**
 * 隠れ干マップ（支→隠れ干インデックス）
 */
export type HiddenStemMap = Record<Branch, Stem[]>;
/**
 * 十二運フェーズのタイプ
 */
export type TwelveStarPhase = '長生' | '沐浴' | '冠帯' | '建禄' | '帝旺' | '衰' | '病' | '死' | '墓' | '絶' | '胎' | '養';
/**
 * 十二大従星のタイプ
 */
export type TwelveStar = '天貴星' | '天恍星' | '天南星' | '天禄星' | '天将星' | '天堂星' | '天胡星' | '天極星' | '天庫星' | '天馳星' | '天報星' | '天印星';
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
    rightLeg: TwelveStarPlacement;
    leftLeg: TwelveStarPlacement;
    leftShoulder: TwelveStarPlacement;
    totalPoints: number;
}
/**
 * 天中殺: 60干支周期における虚の支（2つ）の期間
 */
export interface Tenchusatsu {
    type: string;
    branch1: number;
    branch1Name: Branch;
    branch2: number;
    branch2Name: Branch;
    groupIndex: number;
    affectedYears: number[];
    description: string;
}
/**
 * 相性判定の結果
 */
export interface CompatibilityResult {
    score: number;
    rating: 'excellent' | 'good' | 'normal' | 'poor' | 'incompatible';
    elements: {
        stemCompatibility: number;
        branchCompatibility: number;
        pilarCompatibility: number;
    };
    details: string[];
}
/**
 * 大運: 10年ごとの運の流れ
 */
export interface MajorPeriod {
    index: number;
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
/**
 * 十二運: 人生の12段階
 */
export type TwelvePhaseType = 'gaikoku' | 'yochu' | 'kotoku' | 'batai' | 'kanpai' | 'kenroku' | 'teizai' | 'seisui' | 'byo' | 'shi' | 'mozoku' | 'ketsu';
export interface TwelvePhase {
    type: TwelvePhaseType;
    phase: number;
    description: string;
    meaning: string;
}
/**
 * 四柱推命の完全なチャート
 */
export interface SanmeiChart {
    birthDate: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
    };
    fourPillars: FourPillars;
    stemBranchInfo: {
        [key in 'year' | 'month' | 'day' | 'hour']: {
            stem: Stem;
            branch: Branch;
            element: Element;
            yinYang: YinYang;
            hiddenStems: PillarHiddenStems;
        };
    };
    dayStem: Stem;
    dayElement: Element;
    dayYinYang: YinYang;
    goUn: {
        element: Element;
        yinYang: YinYang;
    };
    tenStars: {
        [key in 'year' | 'month' | 'day' | 'hour']: TenStar[];
    };
    twelveStars: {
        [key in 'year' | 'month' | 'day' | 'hour']: TwelveStar[];
    };
    tenchusatsu: Tenchusatsu;
    majorPeriods: MajorPeriod[];
    characteristics: {
        hasSpecialPattern: boolean;
        pattern: string | null;
        strengthOfElement: Record<Element, number>;
        fortuneLevel: number;
    };
    lifeFortuneByAge: YearlyLuck[];
}
/**
 * 四柱計算のオプション
 */
export interface FourPillarsCalculationOptions {
    includeHiddenStems?: boolean;
    includeTenStars?: boolean;
    includeTwelveStars?: boolean;
    includeTenchusatsu?: boolean;
    includeMajorPeriods?: boolean;
    timezoneOffset?: number;
}
