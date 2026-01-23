/**
 * Compatibility Calculator
 * Multi-person compatibility calculation based on 陰陽五行 (In-Yo Gogyo) principles
 */

import type { PersonData, CompatibilityResult, CompatibilityScore, MultiPersonComparison } from '../types/compatibility';
import type { SanmeigakuInsenChart } from '../types/insen';

// Five elements (五行) mapping from heavenly stems (天干)
const STEM_TO_ELEMENT: Record<string, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

// 相生 (productive) and 相剋 (controlling) relationships
const ELEMENT_RELATIONS: Record<string, Record<string, number>> = {
  wood: { wood: 70, fire: 90, earth: 40, metal: 30, water: 85 },
  fire: { wood: 85, fire: 70, earth: 90, metal: 40, water: 30 },
  earth: { wood: 40, fire: 85, earth: 70, metal: 90, water: 40 },
  metal: { wood: 30, fire: 40, earth: 85, metal: 70, water: 90 },
  water: { wood: 90, fire: 30, earth: 40, metal: 85, water: 70 },
};

// 十干 (ten stems) compatibility combinations (干合)
const KANGO_COMBINATIONS = [
  ['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']
];

function getDayStemElement(insen: SanmeigakuInsenChart): 'wood' | 'fire' | 'earth' | 'metal' | 'water' {
  const dayStem = insen.meta.dayStem;
  return STEM_TO_ELEMENT[dayStem] || 'earth';
}

function calculateElementCompatibility(
  element1: 'wood' | 'fire' | 'earth' | 'metal' | 'water',
  element2: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
): number {
  return ELEMENT_RELATIONS[element1][element2];
}

function checkKango(stem1: string, stem2: string): boolean {
  return KANGO_COMBINATIONS.some(pair =>
    (pair[0] === stem1 && pair[1] === stem2) ||
    (pair[0] === stem2 && pair[1] === stem1)
  );
}

export function calculateCompatibility(
  person1: PersonData,
  person2: PersonData
): CompatibilityResult {
  const stem1 = person1.insen.meta.dayStem;
  const stem2 = person2.insen.meta.dayStem;
  const element1 = getDayStemElement(person1.insen);
  const element2 = getDayStemElement(person2.insen);

  // Base score from element relationship
  let baseScore = calculateElementCompatibility(element1, element2);

  // Bonus for 干合 (kango) combinations
  const isKango = checkKango(stem1, stem2);
  if (isKango) baseScore += 20;

  // Calculate aspect scores with slight variations
  const loveScore = Math.min(100, baseScore + (isKango ? 10 : 0));
  const workScore = Math.min(100, baseScore + (element1 === element2 ? 5 : -5));
  const friendshipScore = Math.min(100, baseScore + (Math.abs(baseScore - 70) < 10 ? 5 : 0));

  const overallScore = Math.floor((loveScore * 0.35 + workScore * 0.3 + friendshipScore * 0.35));

  const level = getCompatibilityLevel(overallScore);
  const message = getCompatibilityMessage(level);
  const advice = generateAdvice(person1, person2, level);

  return {
    scores: {
      overall: overallScore,
      love: loveScore,
      work: workScore,
      friendship: friendshipScore,
    },
    level,
    message,
    advice,
    comparisons: [{
      person1: person1.name,
      person2: person2.name,
      score: overallScore,
      strengths: generateStrengths(element1, element2, isKango),
      challenges: generateChallenges(element1, element2),
    }],
  };
}

export function compareMultiplePeople(people: PersonData[]): MultiPersonComparison {
  const n = people.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

  // Fill compatibility matrix
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const result = calculateCompatibility(people[i], people[j]);
      matrix[i][j] = result.scores.overall;
      matrix[j][i] = result.scores.overall; // Symmetric
    }
  }

  // Calculate rankings
  const rankings = people.map((person, i) => {
    const scores = matrix[i].filter((_, j) => j !== i);
    const averageScore = scores.reduce((a, b) => a + b, 0) / (n - 1);
    const bestMatchIndex = scores.indexOf(Math.max(...scores));
    const bestMatch = people[bestMatchIndex].name;
    const bestMatchScore = matrix[i][bestMatchIndex];

    return {
      person: person.name,
      averageScore: Math.round(averageScore),
      bestMatch,
      bestMatchScore,
    };
  }).sort((a, b) => b.averageScore - a.averageScore);

  return { people, matrix, rankings };
}

function getCompatibilityLevel(score: number): CompatibilityResult['level'] {
  if (score >= 90) return 'perfect';
  if (score >= 75) return 'great';
  if (score >= 60) return 'good';
  if (score >= 40) return 'neutral';
  return 'challenging';
}

function getCompatibilityMessage(level: CompatibilityResult['level']): string {
  const messages = {
    perfect: '運命の相手！奇跡的な相性です✨',
    great: '素晴らしい相性！長く続く関係が築けそう💕',
    good: '良い相性！努力次第でさらに良くなる😊',
    neutral: '普通の相性。お互いの理解が鍵🤝',
    challenging: '試練の相性。乗り越えれば強い絆に💪',
  };
  return messages[level];
}

function generateAdvice(
  person1: PersonData,
  person2: PersonData,
  level: CompatibilityResult['level']
): string {
  const element1 = getDayStemElement(person1.insen);
  const element2 = getDayStemElement(person2.insen);

  if (level === 'perfect' || level === 'great') {
    return `${person1.name}と${person2.name}は、お互いの強みを活かせる最高の組み合わせ！自然体でいられる関係が続きます。`;
  } else if (level === 'good') {
    return `${person1.name}と${person2.name}は、歩み寄り次第でさらに深まれる関係。違いを成長のチャンスにしましょう。`;
  } else {
    return `${person1.name}と${person2.name}は、違いを認め合うことが大切。コミュニケーションを大切にすれば強い絆になります。`;
  }
}

function generateStrengths(
  element1: string,
  element2: string,
  isKango: boolean
): string[] {
  const strengths: string[] = [];

  if (isKango) strengths.push('干合の運命的な繋がり');
  if (element1 === element2) strengths.push('同じ五行で理解し合える');
  if (ELEMENT_RELATIONS[element1][element2] >= 85) {
    strengths.push('相生関係で高め合える');
  }

  return strengths.length > 0 ? strengths : ['刺激し合える関係'];
}

function generateChallenges(element1: string, element2: string): string[] {
  const challenges: string[] = [];

  if (ELEMENT_RELATIONS[element1][element2] < 50) {
    challenges.push('相剋関係で衝突しやすい');
  }
  if (element1 !== element2 && ELEMENT_RELATIONS[element1][element2] < 85) {
    challenges.push('価値観の違いを乗り越える必要あり');
  }

  return challenges.length > 0 ? challenges : ['特になし'];
}
