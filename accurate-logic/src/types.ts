/**
 * accurate-logic Type Definitions
 * 算命学・陰陽五行の正確な計算ロジック用型定義
 */

// 干支出力構造
export interface GanZhi {
  stem: number;       // 天干 (1-10)
  branch: number;     // 地支 (1-12)
  stemStr: string;    // 天干文字
  branchStr: string;  // 地支文字
  name: string;       // 干支名
  id: number;         // 干支ID (1-60)
  hiddenStems?: string[]; // 蔵干（複数）
}

// 四柱推命
export interface FourPillars {
  year: GanZhi;
  month: GanZhi;
  day: GanZhi;
  hour: GanZhi;
}

// 十大主星（人体図）
export interface YangSen {
  head: string;        // 頭：年干
  chest: string;       // 胸：月支の蔵干（二十八元考慮）
  belly: string;       // 腹：月干
  rightHand: string;   // 右手：日支の蔵干（二十八元考慮）
  leftHand: string;    // 左手：年支の蔵干（二十八元考慮）
  leftShoulder: StarInfo;  // 左肩：年支の十二大従星
  rightLeg: StarInfo;      // 右足：日支の十二大従星
  leftLeg: StarInfo;       // 左足：月支の十二大従星
}

// 星情報（十二大従星用）
export interface StarInfo {
  name: string;
  score: number;
}

// 五行バランス
export interface FiveElements {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

// 蔵干情報
export interface HiddenStemInfo {
  pillar: 'year' | 'month' | 'day' | 'hour';
  branch: string;
  main: string;     // 本気
  sub?: string;     // 中気
  extra?: string;   // 余気（初気）
}

// 二十八元データ型
export interface TwentyEightElementData {
  extra?: { stem: string; days: number };
  sub?: { stem: string; days: number };
  sub2?: { stem: string; days: number };
  main: { stem: string };
}
