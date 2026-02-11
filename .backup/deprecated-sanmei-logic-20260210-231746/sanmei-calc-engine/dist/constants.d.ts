/**
 * 算命学エンジン - 基本定数ファイル
 * Sanmei-gaku Engine - Constants File
 */
export declare const STEMS: readonly ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export type Stem = typeof STEMS[number];
/**
 * 五行 (Five Elements): 木(木), 火(火), 土(土), 金(金), 水(水)
 */
export declare const ELEMENTS: readonly ["木", "火", "土", "金", "水"];
export type Element = typeof ELEMENTS[number];
/**
 * 陰陽区分 (Yin/Yang Classification)
 * 陽: 甲丙戊庚壬 (indices: 0, 2, 4, 6, 8)
 * 陰: 乙丁己辛癸 (indices: 1, 3, 5, 7, 9)
 */
export declare const STEM_YIN_YANG: Record<Stem, 'yang' | 'yin'>;
/**
 * 天干の五行 (Stem Elements)
 * 甲乙→木, 丙丁→火, 戊己→土, 庚辛→金, 壬癸→水
 */
export declare const STEM_ELEMENTS: Record<Stem, Element>;
export declare const BRANCHES: readonly ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
export type Branch = typeof BRANCHES[number];
/**
 * 地支の陰陽区分 (Branch Yin/Yang Classification)
 * 陽: 子寅辰午申戌 (indices: 0, 2, 4, 6, 8, 10)
 * 陰: 丑卯巳未酉亥 (indices: 1, 3, 5, 7, 9, 11)
 */
export declare const BRANCH_YIN_YANG: Record<Branch, 'yang' | 'yin'>;
/**
 * 地支の五行 (Branch Elements)
 * 子→水, 丑→土, 寅→木, 卯→木, 辰→土, 巳→火,
 * 午→火, 未→土, 申→金, 酉→金, 戌→土, 亥→水
 */
export declare const BRANCH_ELEMENTS: Record<Branch, Element>;
export declare const KANSHI: ["甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸", "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥"][];
export type KanshiIndex = number;
/**
 * 干支の名前文字列を生成 (例: "甲子")
 */
export declare function kanshiToString(stem: Stem, branch: Branch): string;
/**
 * 干支インデックスから文字列を生成
 */
export declare function kanshiIndexToString(index: KanshiIndex): string;
export interface HiddenStemEntry {
    main: Stem;
    sub?: Stem;
    extra?: Stem;
}
export interface HiddenStemTiming {
    stem: Stem;
    days: number;
}
export interface HiddenStemInfo {
    main: Stem;
    timings: HiddenStemTiming[];
}
/**
 * 蔵干データ - 各地支に隠れている天干と出現時期
 * 月の１日目から数えて、何日目までその干が有効かを記録
 */
export declare const HIDDEN_STEMS: Record<Branch, HiddenStemInfo>;
/**
 * 五虎遁: 年の干から月の干の起点を決定
 * 年干の組み合わせごとに、寅月の干が決まる
 * Key: yearStemIndex % 5
 * Value: stemIndexOfYinMonth (寅月の干のインデックス)
 */
export declare const WU_HU_DUN: Record<number, number>;
/**
 * 五鼠遁: 日の干から時間の干の起点を決定
 * 日干の組み合わせごとに、子時の干が決まる
 * Key: dayStemIndex % 5
 * Value: stemIndexOfZiHour (子時の干のインデックス)
 */
export declare const WU_SHU_DUN: Record<number, number>;
/**
 * 建禄支: 各天干に対応する禄支
 * 甲→寅, 乙→卯, 丙→巳, 丁→午, 戊→午, 己→午, 庚→申, 辛→酉, 壬→亥, 癸→子
 */
export declare const BUILD_LUCK_BRANCH: Record<Stem, Branch>;
/**
 * 五行間の相生（生成）関係
 * 木→火→土→金→水→木
 */
export declare const GENERATION_RELATIONS: Record<string, string>;
/**
 * 五行間の相剋（制御）関係
 * 木→土→水→火→金→木
 */
export declare const CONTROL_RELATIONS: Record<string, string>;
/**
 * 五行要素マッピング（天干→五行）
 */
export declare const ELEMENT_MAP: Record<string, string>;
/**
 * 陰陽マッピング（天干→陰陽）
 */
export declare const YIN_YANG_MAP: Record<string, boolean>;
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
        [month: number]: number;
    };
}
export declare const SOLAR_TERMS: SolarTermData[];
/**
 * 指定した年の節入りデータを取得
 * テーブルにない年は近似値で推定
 */
export declare function getSolarTermData(year: number): SolarTermData;
