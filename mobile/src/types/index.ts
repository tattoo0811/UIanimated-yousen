// 型定義 - PC版からの移植
// Source: /Users/kitamuratatsuhiko/UIanimated/yinyang-app/src/utils/logic.ts

/**
 * 干支（かんし）型
 * 天干（十干）と地支（十二支）の組み合わせ
 */
export type GanZhi = {
  stem: number;        // 天干インデックス 1-10
  branch: number;      // 地支インデックス 1-12
  stemStr: string;     // 天干文字列 (甲-癸)
  branchStr: string;   // 地支文字列 (子-亥)
  name: string;        // 干支名 (例: "癸亥")
  id: number;          // 六十干支ID 1-60
  hiddenStems: string[]; // 蔵干（地支に隠れた天干）
};

/**
 * 四柱推命の四柱（年柱・月柱・日柱・時柱）
 */
export type FourPillars = {
  year: GanZhi;   // 年柱
  month: GanZhi;  // 月柱
  day: GanZhi;    // 日柱
  hour: GanZhi;   // 時柱
};

/**
 * 五行バランス（木火土金水の点数）
 */
export type FiveElements = {
  wood: number;   // 木
  fire: number;   // 火
  earth: number;  // 土
  metal: number;  // 金
  water: number;  // 水
};

/**
 * 陽占（人体図）
 * 正式な九点構成: 日干を基準に年干・年支・月干・月支で計算
 */
export type YangSen = {
  head: string;           // 頭（第一命星）: 年干
  rightHand: string;      // 右手: 年支の本気
  chest: string;          // 胸（中心星）: 日干
  leftHand: string;       // 左手: 月支の本気
  belly: string;          // 腹: 月干
  leftShoulder: { name: string; score: number };  // 左肩（十二大従星・年支）
  rightLeg: { name: string; score: number };      // 右足（十二大従星・月支）
  leftLeg: { name: string; score: number };       // 左足（十二大従星・日支）
};

/**
 * 大運サイクル
 */
export type TaiunCycle = {
  startAge: number;   // 開始年齢
  endAge: number;     // 終了年齢
  stem: string;       // 天干
  branch: string;     // 地支
  name: string;       // 干支名
  tenStar: string;    // 十大主星
  twelveStar: string; // 十二大従星
};

/**
 * 大運（10年ごとの運勢サイクル）
 */
export type Taiun = {
  gender: 'male' | 'female';           // 性別
  direction: 'forward' | 'backward';   // 順行/逆行
  startAge: number;                    // 立運年齢
  cycles: TaiunCycle[];                // 大運サイクル配列
};

// ==========================================================
// 陰占（SanmeigakuInsenChart）用型定義
// ==========================================================

export type InsenPillar = {
  stem: string;   // 天干
  branch: string; // 地支
};

export type InsenHiddenStem = {
  pillar: 'year' | 'month' | 'day';
  branch: string;
  type: 'main' | 'sub' | 'extra'; // main(本気), sub(中気), extra(余気/初気)
  stem: string;
};

export type InsenTsuhensei = {
  pillar: 'year' | 'month' | 'day';
  source: 'heavenlyStem' | 'hiddenStem';
  hiddenType?: 'main' | 'sub' | 'extra';
  stem: string;
  name: string; // 通変星名
};

export type InsenJunishiUn = {
  pillar: 'year' | 'month' | 'day';
  branch: string;
  state: string; // 長生, 沐浴, etc.
};

export type InsenPhaseRelation = {
  from: 'year' | 'month' | 'day';
  to: 'year' | 'month' | 'day';
  relation: string; // 合, 冲, 刑, 害, 破, etc.
};

export type InsenTenchusatsu = {
  type: string; // 天中殺の種類 (例: "子丑天中殺")
  missingBranches: string[]; // 空亡の地支 (例: ["子", "丑"])
};

export type SanmeigakuInsenChart = {
  meta: {
    dayStem: string;
    calendar: 'solar' | 'lunar';
  };
  pillars: {
    year: InsenPillar;
    month: InsenPillar;
    day: InsenPillar;
  };
  hiddenStems: InsenHiddenStem[];
  tsuhensei: InsenTsuhensei[];
  junishiUn: InsenJunishiUn[];
  fiveElements: {
    distribution: FiveElements;
    dayStemStrength: 'strong' | 'weak' | 'balanced'; // 身強/身弱
  };
  phaseRelations: InsenPhaseRelation[];
  tenchusatsu: InsenTenchusatsu;
  extensions?: Record<string, unknown>;
};

/**
 * 計算結果全体
 */
export type CalculationResult = {
  input: {
    birthDate: string;  // 生年月日 (ISO 8601形式)
    gender: 'male' | 'female';  // 性別
    longitude: number;  // 経度（真太陽時計算用）
  };
  result: {
    bazi: FourPillars;         // 四柱推命
    fiveElements: FiveElements; // 五行バランス
    yangSen: YangSen;          // 陽占
    energyScore: number;       // エネルギー点数
    insen?: SanmeigakuInsenChart; // 陰占 (Sanmeigaku Insen Chart)
    taiun?: Taiun;             // 大運（オプション）
  };
  timestamp: string;  // 計算日時 (ISO 8601形式)
};

// ==========================================================
// Video-related types
// ==========================================================

/**
 * Video metadata for caching and sharing
 */
export interface VideoMetadata {
  url: string;
  localPath?: string;
  cachedAt?: number;
  duration?: number;
  size?: number;
}

/**
 * Video share result
 */
export interface VideoShareResult {
  success: boolean;
  method: 'camera-roll' | 'share-sheet';
  cached: boolean;
  error?: string;
}
