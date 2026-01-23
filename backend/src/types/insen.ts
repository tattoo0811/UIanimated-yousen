/**
 * Insen (陰占) Type Definitions for Backend
 * Ported from mobile types for server-side compatibility calculation
 */

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

export type FiveElements = {
  wood: number;   // 木
  fire: number;   // 火
  earth: number;  // 土
  metal: number;  // 金
  water: number;  // 水
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
