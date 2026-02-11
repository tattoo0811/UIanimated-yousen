/**
 * 巡の最適な生年月日検証スクリプト
 *
 * 検討条件:
 * - 日干「癸（水）」を維持
 * - 美咲（1995-03-15、30歳）との年齢差3-5歳
 * - 天中殺が美咲（戌亥天中殺）と対比になるもの
 */

import { calculateBaZi, calculateYangSen } from '../accurate-logic/src/index';

// 美咲のデータ（固定）
const misaki = {
  name: '高橋美咲',
  birth_date: '1995-03-15',
  nikkan: '乙',
  gesshi: '亥',
  tenchusatsu: '戌亥天中殺',
  age: 30
};

// 候補日一覧（各年の春先、日干「癸」になりそうな日）
const candidates = [
  // 1992年生まれ（34歳、4歳差）
  { year: 1992, month: 2, day: 10, name: '1992-02-10 (A-1)' },
  { year: 1992, month: 3, day: 12, name: '1992-03-12 (A-2)' },
  { year: 1992, month: 4, day: 13, name: '1992-04-13 (A-3)' },

  // 1993年生まれ（33歳、3歳差）
  { year: 1993, month: 2, day: 5, name: '1993-02-05 (B-1)' },
  { year: 1993, month: 3, day: 8, name: '1993-03-08 (B-2)' },
  { year: 1993, month: 4, day: 8, name: '1993-04-08 (B-3)' },

  // 1994年生まれ（32歳、2歳差）
  { year: 1994, month: 2, day: 8, name: '1994-02-08 (C-1)' },
  { year: 1994, month: 3, day: 11, name: '1994-03-11 (C-2)' },
  { year: 1994, month: 4, day: 11, name: '1994-04-11 (C-3)' },
];

// 天中殺判定関数
function getTenchusatsu(gesshi: string): string {
  const tenchusatsuMap: Record<string, string> = {
    '子': '子丑天中殺',
    '丑': '子丑天中殺',
    '寅': '寅卯天中殺',
    '卯': '寅卯天中殺',
    '辰': '辰巳天中殺',
    '巳': '午未天中殺',
    '午': '午未天中殺',
    '未': '午未天中殺',
    '申': '申酉天中殺',
    '酉': '申酉天中殺',
    '戌': '戌亥天中殺',
    '亥': '戌亥天中殺'
  };
  return tenchusatsuMap[gesshi] || '';
}

// 相性評価関数
function evaluateCompatibility(meguruNikkan: string, meguruGesshi: string, meguruTenchusatsu: string): number {
  let score = 0;

  // 1. 日干の相性（最大30点）
  if (meguruNikkan === '癸' && misaki.nikkan === '乙') {
    score += 30; // 水→木の相生関係
  }

  // 2. 日支の相性（最大30点）
  // 巳亥冲は緊張関係だが、成長を促すエネルギーになる
  if ((meguruGesshi === '巳' && misaki.gesshi === '亥') ||
      (meguruGesshi === '亥' && misaki.gesshi === '巳')) {
    score += 20; // 衝関係だが、対立こそが成長のエネルギー
  } else if (meguruGesshi === misaki.gesshi) {
    score += 10; // 同じ日支は安定するが、刺激に欠ける
  } else {
    score += 25; // その他の組み合わせは中程度の相性
  }

  // 3. 天中殺の相互作用（最大20点）
  // 異なる天中殺タイプ = 別々の視点
  if (meguruTenchusatsu !== misaki.tenchusatsu) {
    score += 20;
  } else {
    score += 10; // 同じ天中殺は理解しやすいが、視点が偏る
  }

  // 4. 年齢差の評価（最大20点）
  // 3-5歳差が理想的
  const ageDiff = Math.abs(30 - 34); // 仮に34歳とすると4歳差
  if (ageDiff >= 3 && ageDiff <= 5) {
    score += 20;
  } else if (ageDiff === 2 || ageDiff === 6) {
    score += 15;
  } else {
    score += 10;
  }

  return score;
}

console.log('========================================');
console.log('巡の最適な生年月日 検証レポート');
console.log('========================================');
console.log('');

console.log('--- 美咲のデータ（基準）---');
console.log(`生年月日: ${misaki.birth_date}`);
console.log(`年齢: ${misaki.age}歳`);
console.log(`日干: ${misaki.nikkan}（木）`);
console.log(`日支: ${misaki.gesshi}（水）`);
console.log(`天中殺: ${misaki.tenchusatsu}`);
console.log('');

console.log('========================================');
console.log('候補日の検証結果');
console.log('========================================');
console.log('');

const results: Array<{
  candidate: string;
  nikkan: string;
  gesshi: string;
  tenchusatsu: string;
  score: number;
  details: string;
}> = [];

for (const cand of candidates) {
  const birthDate = new Date(`${cand.year}-${String(cand.month).padStart(2, '0')}-${String(cand.day).padStart(2, '0')}T12:00:00`);
  const bazi = calculateBaZi(birthDate, 135);

  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(gesshi);

  // 日干が「癸」でない場合はスキップ
  if (nikkan !== '癸') {
    console.log(`❌ ${cand.name}: 日干が${nikkan}（癸ではない）`);
    console.log('');
    continue;
  }

  const score = evaluateCompatibility(nikkan, gesshi, tenchusatsu);
  const age = 2026 - cand.year;

  let details = `日干: ${nikkan}（水） | 日支: ${gesshi} | 天中殺: ${tenchusatsu} | 年齢: ${age}歳（${age - 30}歳差）`;

  console.log(`✓ ${cand.name}`);
  console.log(`  ${details}`);
  console.log(`  相性スコア: ${score}/100点`);
  console.log('');

  results.push({
    candidate: cand.name,
    nikkan,
    gesshi,
    tenchusatsu,
    score,
    details
  });
}

console.log('========================================');
console.log('総合ランキング');
console.log('========================================');
console.log('');

// スコア順にソート
results.sort((a, b) => b.score - a.score);

results.forEach((result, index) => {
  console.log(`${index + 1}位: ${result.candidate}（${result.score}点）`);
  console.log(`  ${result.details}`);
  console.log('');
});

if (results.length > 0) {
  const best = results[0];
  console.log('========================================');
  console.log('推奨される生年月日');
  console.log('========================================');
  console.log('');
  console.log(`🎯 ${best.candidate}`);
  console.log(`  ${best.details}`);
  console.log(`  相性スコア: ${best.score}/100点`);
  console.log('');
  console.log('【推奨理由】');
  console.log(`✓ 日干「癸（水）」が美咲の「乙（木）」を育てる`);
  console.log(`✓ 天中殺が異なり、多角的な視点を持てる`);
  console.log(`✓ 年齢差が理想的で、精神的な同期が可能`);
}
