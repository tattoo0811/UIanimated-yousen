/**
 * twelveStars.ts - 十二大従星計算エンジン
 *
 * 十二大従星（じゅうにたいしゅうせい）は十二運から派生する12の従属星。
 * 人生のエネルギー段階を表し、大きなポイント価値を持ちます。
 */

import type { TwelveStarChart, TwelveStarPhase, TwelveStar } from './types';
import type { Branch } from './constants';
import { STEMS, BRANCHES, YIN_YANG_MAP } from './constants';

/**
 * 天干の陰陽を取得
 * @param stem - 天干のインデックス (0-9)
 * @returns true = 陽, false = 陰
 */
function getStemPolarity(stem: number): boolean {
  return YIN_YANG_MAP[STEMS[stem]];
}

/**
 * 各天干における長生の開始支
 * 十二運は長生から始まり、特定の支から開始します
 */
const CHOSEI_START_BRANCH: Record<number, number> = {
  0: 10, // 甲(Yang Wood): 長生 at 亥 (index 10)
  1: 5,  // 乙(Yin Wood): 長生 at 午 (index 5)
  2: 2,  // 丙(Yang Fire): 長生 at 寅 (index 2)
  3: 9,  // 丁(Yin Fire): 長生 at 酉 (index 9)
  4: 2,  // 戊(Yang Earth): 長生 at 寅 (index 2, same as 丙)
  5: 9,  // 己(Yin Earth): 長生 at 酉 (index 9, same as 丁)
  6: 4,  // 庚(Yang Metal): 長生 at 巳 (index 4)
  7: 0,  // 辛(Yin Metal): 長生 at 子 (index 0)
  8: 7,  // 壬(Yang Water): 長生 at 申 (index 7)
  9: 3   // 癸(Yin Water): 長生 at 卯 (index 3)
};

/**
 * 十二運フェーズの順序
 * 陽干の場合は長生から順時計方向に進む
 * 陰干の場合は長生から逆時計方向に進む
 */
const PHASES: TwelveStarPhase[] = [
  '長生',
  '沐浴',
  '冠帯',
  '建禄',
  '帝旺',
  '衰',
  '病',
  '死',
  '墓',
  '絶',
  '胎',
  '養'
];

/**
 * 十二運から十二大従星へのマッピング
 */
const PHASE_TO_STAR: Record<TwelveStarPhase, { star: TwelveStar; points: number }> = {
  '長生': { star: '天貴星', points: 9 },
  '沐浴': { star: '天恍星', points: 7 },
  '冠帯': { star: '天南星', points: 10 },
  '建禄': { star: '天禄星', points: 11 },
  '帝旺': { star: '天将星', points: 12 },
  '衰': { star: '天堂星', points: 8 },
  '病': { star: '天胡星', points: 4 },
  '死': { star: '天極星', points: 2 },
  '墓': { star: '天庫星', points: 5 },
  '絶': { star: '天馳星', points: 1 },
  '胎': { star: '天報星', points: 3 },
  '養': { star: '天印星', points: 6 }
};

/**
 * 支のインデックスを取得（支名から）
 * @param branchName - 支の名前
 * @returns インデックス (0-11)
 */
function getBranchIndex(branchName: Branch): number {
  return BRANCHES.indexOf(branchName);
}

/**
 * 指定された支から対象支までの距離を計算（陽干用）
 * 陽干は順時計方向にカウント
 *
 * @param startBranch - 開始支のインデックス
 * @param targetBranch - 対象支のインデックス
 * @returns 0-11の距離（フェーズインデックス）
 */
function calculatePhaseIndexForYang(startBranch: number, targetBranch: number): number {
  return (targetBranch - startBranch + 12) % 12;
}

/**
 * 指定された支から対象支までの距離を計算（陰干用）
 * 陰干は逆時計方向にカウント
 *
 * @param startBranch - 開始支のインデックス
 * @param targetBranch - 対象支のインデックス
 * @returns 0-11の距離（フェーズインデックス）
 */
function calculatePhaseIndexForYin(startBranch: number, targetBranch: number): number {
  return (startBranch - targetBranch + 12) % 12;
}

/**
 * 天干と支から十二運フェーズを導出
 *
 * アルゴリズム：
 * 1. 天干から長生の開始支を取得
 * 2. 天干が陽か陰かを判定
 * 3. 陽の場合：開始支から対象支への順時計距離
 * 4. 陰の場合：開始支から対象支への逆時計距離
 * 5. フェーズインデックスを十二運に変換
 *
 * @param stem - 天干のインデックス (0-9)
 * @param branch - 支のインデックス (0-11)
 * @returns 十二運フェーズ
 */
function derivePhase(stem: number, branch: number): TwelveStarPhase {
  const isYang = getStemPolarity(stem);
  const choseiStartBranch = CHOSEI_START_BRANCH[stem];

  let phaseIndex: number;

  if (isYang) {
    // 陽干：順時計方向
    phaseIndex = calculatePhaseIndexForYang(choseiStartBranch, branch);
  } else {
    // 陰干：逆時計方向
    phaseIndex = calculatePhaseIndexForYin(choseiStartBranch, branch);
  }

  return PHASES[phaseIndex];
}

/**
 * 十二運から十二大従星を取得
 * @param phase - 十二運フェーズ
 * @returns 十二大従星と点数のオブジェクト
 */
function getStarFromPhase(phase: TwelveStarPhase): { star: TwelveStar; points: number } {
  return PHASE_TO_STAR[phase];
}

/**
 * 日干と支から十二大従星を計算
 *
 * @param dayStem - 日干のインデックス (0-9)
 * @param targetBranch - 対象支のインデックス (0-11)
 * @returns 十二大従星と点数を含むオブジェクト
 */
function calculateSingleTwelveStar(
  dayStem: number,
  targetBranch: number
): { star: TwelveStar; points: number; phase: TwelveStarPhase } {
  const phase = derivePhase(dayStem, targetBranch);
  const { star, points } = getStarFromPhase(phase);

  return { star, points, phase };
}

/**
 * 日干と各支から十二大従星チャートを計算
 *
 * 十二大従星の配置：
 * - 右足（Right Leg）：日干 vs 日支
 * - 左足（Left Leg）：日干 vs 月支
 * - 左肩（Left Shoulder）：日干 vs 年支
 *
 * @param dayStem - 日干のインデックス (0-9)
 * @param branches - 支のオブジェクト {year, month, day} (各0-11)
 * @returns 十二大従星チャート
 */
export function calculateTwelveStars(
  dayStem: number,
  branches: { year: number; month: number; day: number }
): TwelveStarChart {
  const rightLeg = calculateSingleTwelveStar(dayStem, branches.day);
  const leftLeg = calculateSingleTwelveStar(dayStem, branches.month);
  const leftShoulder = calculateSingleTwelveStar(dayStem, branches.year);

  return {
    rightLeg: {
      star: rightLeg.star,
      points: rightLeg.points,
      phase: rightLeg.phase,
      position: '右足'
    },
    leftLeg: {
      star: leftLeg.star,
      points: leftLeg.points,
      phase: leftLeg.phase,
      position: '左足'
    },
    leftShoulder: {
      star: leftShoulder.star,
      points: leftShoulder.points,
      phase: leftShoulder.phase,
      position: '左肩'
    },
    totalPoints: rightLeg.points + leftLeg.points + leftShoulder.points
  };
}

/**
 * 十二運フェーズ名から日本語の説明を取得
 * @param phase - 十二運フェーズ
 * @returns フェーズの説明
 */
export function getPhaseExplanation(phase: TwelveStarPhase): string {
  const explanations: Record<TwelveStarPhase, string> = {
    '長生': '誕生と成長の段階。新しい始まり。',
    '沐浴': '洗礼と試練。困難な時期。',
    '冠帯': '成人と責任。大人への成長。',
    '建禄': '官位と権力。安定と確立。',
    '帝旺': '最盛期と繁栄。人生の絶頂。',
    '衰': '衰退と減少。エネルギーの低下。',
    '病': '病気と苦しみ。困難と制限。',
    '死': '終焉と変化。大きな転換点。',
    '墓': '埋蔵と隠蔽。潜在的な力。',
    '絶': '断絶と中断。完全な停止。',
    '胎': '胎児と可能性。潜伏期。',
    '養': '養育と育成。準備と蓄積。'
  };
  return explanations[phase];
}

/**
 * フェーズの詳細情報を取得
 * @param dayStem - 日干のインデックス
 * @param branch - 支のインデックス
 * @returns フェーズの詳細情報を含むオブジェクト
 */
export function getTwelveStarDetail(dayStem: number, branch: number): {
  phase: TwelveStarPhase;
  star: TwelveStar;
  points: number;
  explanation: string;
  stemName: string;
  branchName: string;
} {
  const phase = derivePhase(dayStem, branch);
  const { star, points } = getStarFromPhase(phase);

  return {
    phase,
    star,
    points,
    explanation: getPhaseExplanation(phase),
    stemName: STEMS[dayStem],
    branchName: BRANCHES[branch]
  };
}
