/**
 * Year Fortune Calculator
 * Calculates year fortune based on user's day stem and year characteristics
 * Reuses compatibility patterns from compatibilityCalculator
 */

import type { SanmeigakuInsenChart } from '../types/insen';
import type {
  YearData,
  YearFortuneResult,
  FiveElementType,
  YearRelationshipType,
} from '../types/yearFortune';

// Reuse constants from compatibilityCalculator
const STEM_TO_ELEMENT: Record<string, FiveElementType> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

const ELEMENT_RELATIONS: Record<string, Record<string, number>> = {
  wood: { wood: 70, fire: 90, earth: 40, metal: 30, water: 85 },
  fire: { wood: 85, fire: 70, earth: 90, metal: 40, water: 30 },
  earth: { wood: 40, fire: 85, earth: 70, metal: 90, water: 40 },
  metal: { wood: 30, fire: 40, earth: 85, metal: 70, water: 90 },
  water: { wood: 90, fire: 30, earth: 40, metal: 85, water: 70 },
};

const KANGO_COMBINATIONS = [
  ['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']
];

/**
 * Extensible year data registry
 * Add new years as needed (2027, 2028, etc.)
 */
const YEAR_DATA_MAP: Record<number, YearData> = {
  2026: {
    year: 2026,
    kanshi: '丙午',
    tenStem: '丙',
    twelveBranch: '午',
    element: 'fire',
    yinYang: 'yang',
    description: '丙午は火のエネルギーが最も強まる年。情熱、変革、エネルギッシュな一年になる。火の気が燃え上がるように、新しい始まりに適した年。',
    themes: ['情熱', '変革', 'エネルギー', '新しい始まり'],
  },
  // Future years can be added here
  // 2027: { year: 2027, kanshi: '丁未', ... }
};

/**
 * Get year data from registry
 * @throws Error if year data not found
 */
export function getYearData(year: number): YearData {
  const yearData = YEAR_DATA_MAP[year];
  if (!yearData) {
    throw new Error(`Year data not found for year: ${year}. Available years: ${Object.keys(YEAR_DATA_MAP).join(', ')}`);
  }
  return yearData;
}

/**
 * Get user's element from day stem
 * Reuses logic from compatibilityCalculator
 */
function getDayStemElement(insen: SanmeigakuInsenChart): FiveElementType {
  const dayStem = insen.meta.dayStem;
  return STEM_TO_ELEMENT[dayStem] || 'earth';
}

/**
 * Calculate element compatibility score
 * Reuses logic from compatibilityCalculator
 */
function calculateElementCompatibility(
  element1: FiveElementType,
  element2: FiveElementType
): number {
  return ELEMENT_RELATIONS[element1][element2];
}

/**
 * Check for 干合 (kango) combination
 */
function checkKango(stem1: string, stem2: string): boolean {
  return KANGO_COMBINATIONS.some(pair =>
    (pair[0] === stem1 && pair[1] === stem2) ||
    (pair[0] === stem2 && pair[1] === stem1)
  );
}

/**
 * Determine relationship type between user and year
 */
function determineRelationship(
  userElement: FiveElementType,
  yearElement: FiveElementType,
  score: number
): YearRelationshipType {
  if (userElement === yearElement) return 'same';
  if (score >= 85) return 'productive';
  if (score < 50) return 'controlling';
  return 'neutral';
}

/**
 * Generate fortune content based on year and user compatibility
 */
function generateFortuneContent(
  yearData: YearData,
  userElement: FiveElementType,
  relationship: YearRelationshipType,
  compatibilityScore: number
): YearFortuneResult['fortune'] {
  const isHighCompatibility = compatibilityScore >= 75;
  const isLowCompatibility = compatibilityScore < 50;

  // Base fortunes for 2026 (丙午 - fire year)
  const baseFortunes = {
    fire: {
      overall: '火のエネルギーが最も強まる年！あなたの情熱が爆発的一年に。大胆な行動が吉。',
      love: '恋愛運爆上がり！直感を行動に移せば、運命的な出会いがあるかも。',
      work: 'リーダーシップを発揮する年。プロジェクトの主宰者として成功を掴もう。',
      health: 'エネルギッシュすぎて疲れがち。意識的な休息が重要。',
      advice: '火の気を使い切る勢いで行こう。ただし、燃え尽きないように。',
    },
    wood: {
      overall: '木生火の相生関係！あなたの成長が火を熾し、大きな成功を呼び込む。',
      love: '自己成長が恋愛運をアップ。趣味や学びを通じて出会いが広がる。',
      work: '新しいスキルの習得がキャリアを加速。学びの年に。',
      health: '活動的な一年。運動習慣でエネルギーを循環させよう。',
      advice: '自分を磨き続ければ、自然と火がつく。成長の年に。',
    },
    earth: {
      overall: '火生土の流れ。変化のエネルギーが着実な実を結ぶ年。',
      love: '安定志向の中に刺激が入る。バランスの良い関係が築ける。',
      work: '変化をチャンスに変える知恵が試される。着実な積み上げが大事。',
      health: '消化器系に注意。バランスの取れた食事を心がけて。',
      advice: '急がば回れ。変化に翻弄されず、地に足をつけて。',
    },
    metal: {
      overall: '火剋金の相剋関係。プレッシャーのかかる年だが、試練を乗り越えれば大きな飛躍に。',
      love: '熱い感情ぶつかり合いも。衝突を乗り越えれば深い絆に。',
      work: '厳しい局面に直面。でもそれがあなたを鍛える年。',
      health: 'ストレス管理が重要。心の平静を保つ工夫を。',
      advice: '試練は成長の証。プレッシャーを力に変えるマインドセットで。',
    },
    water: {
      overall: '水剋火の相剋関係。変化の波に翻弄されやすいが、柔軟性が武器に。',
      love: '情熱と理性のバランスが問われる。衝動的な行動は控えめに。',
      work: '急な変化や方針転換に対応する柔軟さが求められる。',
      health: '熱くなりすぎないよう、クールダウンを意識して。',
      advice: '変化に抵抗せず、流れに乗る柔軟さを。水の如く。',
    },
  };

  const base = baseFortunes[userElement] || baseFortunes.earth;

  // Adjust based on compatibility
  if (isHighCompatibility) {
    return {
      overall: base.overall + '最高の一年になりそう！',
      love: base.love + '積極的に行動すれば、願望実現の可能性大。',
      work: base.work + '好機到来。チャンスを逃さず掴もう。',
      health: base.health + '調子の良い一年。万全の状態を維持して。',
      advice: base.advice + '流れに乗っていこう。',
    };
  } else if (isLowCompatibility) {
    return {
      overall: base.overall + '注意が必要な一年。慎重に進もう。',
      love: base.love + '無理をせず、自分を大切に。',
      work: base.work + '焦らず、着実な積み上げを。',
      health: base.health + '健康管理に特に注意して。',
      advice: base.advice + '自分のペースを守ることが重要。',
    };
  } else {
    return base;
  }
}

/**
 * Generate highlights based on compatibility and year
 */
function generateHighlights(
  yearData: YearData,
  userElement: FiveElementType,
  userStem: string,
  compatibilityScore: number,
  relationship: YearRelationshipType
): string[] {
  const highlights: string[] = [];

  // Year-specific highlights
  highlights.push(...yearData.themes.map(theme => `${yearData.year}は${theme}の年`));

  // Relationship highlights
  if (relationship === 'same') {
    highlights.push('年の五行と同じ五行で、エネルギーが共鳴');
  } else if (relationship === 'productive') {
    highlights.push('相生関係で、年との相性が良い');
  } else if (relationship === 'controlling') {
    highlights.push('相剋関係で、試練と成長の年');
  }

  // Compatibility highlights
  if (compatibilityScore >= 90) {
    highlights.push('最高の運勢！何をしてもうまくいくかも');
  } else if (compatibilityScore >= 75) {
    highlights.push('運勢上昇中。チャンスを逃さずに');
  }

  // Kango highlight
  if (checkKango(userStem, yearData.tenStem)) {
    highlights.push('干合の運命的な繋がり！特別な一年に');
  }

  return highlights.length > 0 ? highlights : ['新しい一年の始まり'];
}

/**
 * Calculate year fortune for a user
 * @param insen - User's SanmeigakuInsenChart
 * @param year - Target year (default: 2026)
 * @returns YearFortuneResult
 */
export function calculateYearFortune(
  insen: SanmeigakuInsenChart,
  year: number = 2026
): YearFortuneResult {
  // Get year data
  const yearData = getYearData(year);

  // Get user's element
  const userElement = getDayStemElement(insen);
  const userStem = insen.meta.dayStem;

  // Calculate base compatibility score
  let compatibilityScore = calculateElementCompatibility(userElement, yearData.element);

  // Apply bonus for 干合 combinations
  if (checkKango(userStem, yearData.tenStem)) {
    compatibilityScore = Math.min(100, compatibilityScore + 20);
  }

  // Determine relationship type
  const relationship = determineRelationship(userElement, yearData.element, compatibilityScore);

  // Generate fortune content
  const fortune = generateFortuneContent(yearData, userElement, relationship, compatibilityScore);

  // Generate highlights
  const highlights = generateHighlights(yearData, userElement, userStem, compatibilityScore, relationship);

  return {
    yearData,
    userElement,
    userStem,
    compatibilityScore,
    relationship,
    fortune,
    highlights,
  };
}

/**
 * Get all available years
 */
export function getAvailableYears(): number[] {
  return Object.keys(YEAR_DATA_MAP).map(Number).sort((a, b) => a - b);
}
