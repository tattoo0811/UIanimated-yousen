/**
 * compatibility.ts - 相性計算エンジン
 *
 * 決定論的（非ランダム）な算命学相性判定システム。
 * 二人の四柱推命命式を比較し、相性スコアと詳細なアドバイスを生成します。
 *
 * 計算要素：
 * 1. 日干の五行関係スコア（基本 0-30点）
 * 2. 干合ボーナス（0-20点）
 * 3. 地支相性スコア（0-25点）
 * 4. 年柱調和スコア（0-15点）
 * 5. 五行バランス比較（0-10点）
 */

import {
  STEMS,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  BRANCHES,
} from './constants';
import type { Element } from './constants';
import type { CompatibilityResult } from './types';
import {
  getElement,
  getBranchElement,
  getRelationship,
  checkKango,
  checkBranchPartnership,
  checkBranchClash,
  checkTriad,
  analyzeFiveElementsBalance,
} from './fiveElements';

/**
 * 相性結果の詳細スコア
 */
export interface DetailedCompatibilityScore {
  baseElementScore: number;
  kangoBonus: number;
  branchScore: number;
  yearHarmonyScore: number;
  elementBalanceScore: number;
  totalScore: number;
  details: string[];
}

/**
 * 二人の人物の基本情報（干支データ）
 */
export interface PersonGanZhi {
  yearStem: string;
  yearBranch: string;
  monthStem: string;
  monthBranch: string;
  dayStem: string;
  dayBranch: string;
  hourStem?: string;
  hourBranch?: string;
}

/**
 * 日干の五行関係に基づくベーススコア計算
 * - 同じ要素: 20点
 * - 生成関係 (相生): 30点
 * - 逆生成: 25点
 * - 制御関係 (相剋): 5点
 * - 逆制御: 10点
 *
 * @param person1DayStem - 人物1の日干インデックス
 * @param person2DayStem - 人物2の日干インデックス
 * @returns スコアと説明
 */
function calculateBaseElementScore(
  person1DayStem: number,
  person2DayStem: number
): { score: number; explanation: string } {
  const element1 = getElement(person1DayStem);
  const element2 = getElement(person2DayStem);
  const relationship = getRelationship(element1, element2);

  let score = 0;
  let explanation = '';

  switch (relationship) {
    case 'same':
      score = 20;
      explanation = `日干の五行が同じ（${element1}）- 価値観が一致しやすい`;
      break;
    case 'generates':
      score = 30;
      explanation = `${element1}→${element2}の相生関係 - 最高の相性`;
      break;
    case 'generated_by':
      score = 25;
      explanation = `${element2}→${element1}の相生関係 - 互いに支え合える`;
      break;
    case 'controls':
      score = 5;
      explanation = `${element1}が${element2}を制御 - 衝突の可能性`;
      break;
    case 'controlled_by':
      score = 10;
      explanation = `${element2}が${element1}を制御 - 調整が必要`;
      break;
  }

  return { score, explanation };
}

/**
 * 日干の干合ボーナス
 * 干合がある場合は+20点のボーナス
 *
 * @param person1DayStemIndex - 人物1の日干インデックス
 * @param person2DayStemIndex - 人物2の日干インデックス
 * @returns スコアと説明
 */
function calculateKangoBonus(
  person1DayStemIndex: number,
  person2DayStemIndex: number
): { score: number; explanation: string } {
  const kango = checkKango(person1DayStemIndex, person2DayStemIndex);

  if (kango.isKango) {
    return {
      score: 20,
      explanation: `日干の干合あり（${kango.resultElement}化）- 強い結合の契機`,
    };
  }

  return { score: 0, explanation: '日干の干合なし' };
}

/**
 * 地支相性スコア
 * - 支合: +25点
 * - 三合（3者以上）: +15点
 * - 支冲: -10点（最小0）
 * - 中立: +10点
 *
 * @param person1DayBranch - 人物1の日支
 * @param person2DayBranch - 人物2の日支
 * @returns スコアと説明
 */
function calculateBranchScore(
  person1DayBranch: string,
  person2DayBranch: string
): { score: number; explanation: string } {
  // 地支は文字列として渡される想定
  const branch1 = person1DayBranch as any;
  const branch2 = person2DayBranch as any;

  // 支合の確認
  const partnership = checkBranchPartnership(branch1, branch2);
  if (partnership.isPartnership) {
    return {
      score: 25,
      explanation: `日支が支合（${partnership.resultElement}化）- 強い調和`,
    };
  }

  // 支冲の確認
  if (checkBranchClash(branch1, branch2)) {
    return {
      score: 0, // 最小値に設定
      explanation: `日支が支冲 - 対立のリスク`,
    };
  }

  // デフォルト（中立）
  return {
    score: 10,
    explanation: `日支は特殊な関係なし - 基本的な調和`,
  };
}

/**
 * 年柱の調和スコア
 * - 年干の干合: +10点
 * - 年支の支合: +5点
 *
 * @param person1YearStemIndex - 人物1の年干インデックス
 * @param person2YearStemIndex - 人物2の年干インデックス
 * @param person1YearBranch - 人物1の年支
 * @param person2YearBranch - 人物2の年支
 * @returns スコアと説明
 */
function calculateYearHarmonyScore(
  person1YearStemIndex: number,
  person2YearStemIndex: number,
  person1YearBranch: string,
  person2YearBranch: string
): { score: number; explanation: string } {
  let score = 0;
  const details: string[] = [];

  // 年干の干合
  const yearKango = checkKango(person1YearStemIndex, person2YearStemIndex);
  if (yearKango.isKango) {
    score += 10;
    details.push('年干の干合あり');
  }

  // 年支の支合
  const branch1 = person1YearBranch as any;
  const branch2 = person2YearBranch as any;
  const yearPartnership = checkBranchPartnership(branch1, branch2);
  if (yearPartnership.isPartnership) {
    score += 5;
    details.push('年支の支合あり');
  }

  const explanation =
    details.length > 0
      ? `年柱調和: ${details.join(', ')}`
      : '年柱に特殊な関係なし';

  return { score, explanation };
}

/**
 * 五行バランス比較スコア
 * 二人の五行分布が似ているか、またはお互いを補完しているかを評価
 *
 * @param person1Stems - 人物1の全天干インデックス配列
 * @param person1Branches - 人物1の全地支配列
 * @param person2Stems - 人物2の全天干インデックス配列
 * @param person2Branches - 人物2の全地支配列
 * @returns スコアと説明
 */
function calculateElementBalanceScore(
  person1Stems: number[],
  person1Branches: string[],
  person2Stems: number[],
  person2Branches: string[]
): { score: number; explanation: string } {
  // 簡略版: 各人物の支配的な要素を比較
  const countElements = (stems: number[], branches: string[]) => {
    const counts: Record<string, number> = {
      '木': 0,
      '火': 0,
      '土': 0,
      '金': 0,
      '水': 0,
    };

    stems.forEach((stem) => {
      const element = getElement(stem);
      counts[element]++;
    });

    branches.forEach((branch) => {
      const element = getBranchElement(
        BRANCHES.indexOf(branch as typeof BRANCHES[number])
      );
      counts[element]++;
    });

    return counts;
  };

  const counts1 = countElements(person1Stems, person1Branches);
  const counts2 = countElements(person2Stems, person2Branches);

  // 要素の多様性を比較
  const variety1 = Object.values(counts1).filter((c) => c > 0).length;
  const variety2 = Object.values(counts2).filter((c) => c > 0).length;

  let score = 0;
  let explanation = '';

  if (variety1 >= 4 && variety2 >= 4) {
    // 両者とも多様な五行を持つ
    score = 10;
    explanation = '五行バランス: 両者ともバランス型で相互補完的';
  } else if (variety1 >= 3 && variety2 >= 3) {
    score = 8;
    explanation = '五行バランス: 基本的に相互補完的';
  } else {
    score = 2;
    explanation = '五行バランス: 強い偏りがあり、調整が必要';
  }

  return { score, explanation };
}

/**
 * 二人の相性を包括的に計算
 * 決定論的アルゴリズム（乱数なし）
 *
 * @param person1 - 人物1の干支データ（四柱推命命式の日干、月干、年干などを含む）
 * @param person2 - 人物2の干支データ
 * @returns 相性スコア（0-100）と詳細情報
 */
export function calculateCompatibility(
  person1: PersonGanZhi,
  person2: PersonGanZhi
): CompatibilityResult {
  // 干支をインデックスに変換
  const person1DayStemIdx = STEMS.indexOf(person1.dayStem as typeof STEMS[number]);
  const person2DayStemIdx = STEMS.indexOf(person2.dayStem as typeof STEMS[number]);
  const person1YearStemIdx = STEMS.indexOf(person1.yearStem as typeof STEMS[number]);
  const person2YearStemIdx = STEMS.indexOf(person2.yearStem as typeof STEMS[number]);
  const person1MonthStemIdx = STEMS.indexOf(person1.monthStem as typeof STEMS[number]);
  const person2MonthStemIdx = STEMS.indexOf(person2.monthStem as typeof STEMS[number]);

  const details: string[] = [];

  // 1. 日干の五行関係スコア
  const baseScore = calculateBaseElementScore(
    person1DayStemIdx,
    person2DayStemIdx
  );
  details.push(baseScore.explanation);

  // 2. 日干の干合ボーナス
  const kangoBonus = calculateKangoBonus(person1DayStemIdx, person2DayStemIdx);
  if (kangoBonus.score > 0) {
    details.push(kangoBonus.explanation);
  }

  // 3. 地支相性スコア
  const branchScore = calculateBranchScore(
    person1.dayBranch,
    person2.dayBranch
  );
  details.push(branchScore.explanation);

  // 4. 年柱の調和スコア
  const yearScore = calculateYearHarmonyScore(
    person1YearStemIdx,
    person2YearStemIdx,
    person1.yearBranch,
    person2.yearBranch
  );
  if (yearScore.score > 0) {
    details.push(yearScore.explanation);
  }

  // 5. 五行バランス比較
  const allStems1 = [person1DayStemIdx, person1MonthStemIdx, person1YearStemIdx];
  const allBranches1 = [person1.dayBranch, person1.monthBranch, person1.yearBranch];
  const allStems2 = [person2DayStemIdx, person2MonthStemIdx, person2YearStemIdx];
  const allBranches2 = [person2.dayBranch, person2.monthBranch, person2.yearBranch];

  const elementBalance = calculateElementBalanceScore(
    allStems1,
    allBranches1,
    allStems2,
    allBranches2
  );
  details.push(elementBalance.explanation);

  // 総合スコアを計算
  const totalScore =
    baseScore.score +
    kangoBonus.score +
    branchScore.score +
    yearScore.score +
    elementBalance.score;

  // 0-100スケールに正規化
  const normalizedScore = Math.min(100, Math.max(0, totalScore));

  // レーティングを決定
  let rating: CompatibilityResult['rating'];
  if (normalizedScore >= 90) {
    rating = 'excellent';
  } else if (normalizedScore >= 70) {
    rating = 'good';
  } else if (normalizedScore >= 50) {
    rating = 'normal';
  } else if (normalizedScore >= 30) {
    rating = 'poor';
  } else {
    rating = 'incompatible';
  }

  // 結果をまとめる
  return {
    score: Math.round(normalizedScore),
    rating,
    elements: {
      stemCompatibility: baseScore.score,
      branchCompatibility: branchScore.score,
      pilarCompatibility: yearScore.score,
    },
    details,
  };
}

/**
 * 相性スコアから日本語のアドバイスを生成
 * @param result - 相性計算結果
 * @returns 日本語のアドバイステキスト
 */
export function generateCompatibilityAdvice(
  result: CompatibilityResult
): string {
  const baseAdvice: Record<CompatibilityResult['rating'], string> = {
    excellent:
      '最高の相性です。二人は互いに補い合い、自然な調和が生まれやすいでしょう。深い信頼と共感に基づく関係が築けます。',
    good: '良い相性です。基本的な価値観が共通しており、良好な関係を築きやすいでしょう。小さな違いは成長の機会となります。',
    normal: '普通の相性です。互いに理解し尊重することで、良好な関係を築くことができます。違いを受け入れることが大切です。',
    poor: '相性に注意が必要です。価値観の違いや衝突の可能性があります。相互理解と歩み寄りが不可欠です。',
    incompatible:
      '相性に大きな課題があります。二人の基本的な価値観が異なる可能性があります。強い意志と努力によって関係を築くことは可能ですが、挑戦的になるでしょう。',
  };

  return baseAdvice[result.rating];
}

/**
 * 相性結果を人間が読みやすい形式でフォーマット
 * @param result - 相性計算結果
 * @returns フォーマットされたテキスト
 */
export function formatCompatibilityResult(result: CompatibilityResult): string {
  const ratingText: Record<CompatibilityResult['rating'], string> = {
    excellent: '最高の相性',
    good: '良い相性',
    normal: '普通の相性',
    poor: '注意が必要',
    incompatible: '努力が必要',
  };

  let output = '';
  output += `相性スコア: ${result.score}/100\n`;
  output += `評価: ${ratingText[result.rating]}\n\n`;

  output += '詳細:\n';
  result.details.forEach((detail) => {
    output += `  - ${detail}\n`;
  });

  output += `\nアドバイス:\n${generateCompatibilityAdvice(result)}\n`;

  return output;
}
