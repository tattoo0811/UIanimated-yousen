/**
 * 美咲の最適な生年月日検証スクリプト
 *
 * 検討条件:
 * - 巡（1991年生まれ、35歳、日干癸）との相性を最大化
 * - 日干は「木」系（甲・乙）が理想（水→木の相生）
 * - 年齢差は2-5歳が理想的
 */

import { calculateBaZi } from '../accurate-logic/src/index';

// 巡（既存設定を維持）
const meguru = {
  name: '九条巡',
  birth_date: '1991-03-07',
  age: 35,
  nikkan: '癸',
  nikkan_yogo: '水陰',
  gesshi: '卯',
  gesshi_yogo: '木陰',
  tenchusatsu: '午未天中殺'
};

// 美咲の候補日（1993-1997年生まれ、日干「木」系）
const candidates = [
  // 1993年生まれ（32歳、3歳差）
  { year: 1993, month: 3, day: 15, name: '1993-03-15 (A-1)' },
  { year: 1993, month: 4, day: 14, name: '1993-04-14 (A-2)' },

  // 1994年生まれ（31歳、4歳差）
  { year: 1994, month: 3, day: 5, name: '1994-03-05 (B-1)' },
  { year: 1994, month: 4, day: 4, name: '1994-04-04 (B-2)' },

  // 1995年生まれ（30歳、5歳差）- 現行設定
  { year: 1995, month: 3, day: 15, name: '1995-03-15 (C-1: 現行)' },

  // 1996年生まれ（29歳、6歳差）
  { year: 1996, month: 3, day: 15, name: '1996-03-15 (D-1)' },
  { year: 1996, month: 4, day: 13, name: '1996-04-13 (D-2)' },
];

// 天中殺判定
function getTenchusatsu(gesshi: string): string {
  const map: Record<string, string> = {
    '子': '子丑天中殺', '丑': '子丑天中殺',
    '寅': '寅卯天中殺', '卯': '寅卯天中殺',
    '辰': '辰巳天中殺', '巳': '午未天中殺',
    '午': '午未天中殺', '未': '午未天中殺',
    '申': '申酉天中殺', '酉': '申酉天中殺',
    '戌': '戌亥天中殺', '亥': '戌亥天中殺'
  };
  return map[gesshi] || '';
}

// 五行判定
function getGogyo(nikkan: string): string {
  const map: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return map[nikkan] || '';
}

// 相性評価
function evaluateCompatibility(misakiNikkan: string, misakiGesshi: string, misakiTenchusatsu: string, ageDiff: number): number {
  let score = 0;

  // 1. 日干の相性（最大30点）
  const misakiGogyo = getGogyo(misakiNikkan);
  if (misakiGogyo === '木') {
    score += 30; // 水→木の相生
  } else if (misakiGogyo === '火') {
    score += 15; // 水→火（相生だが、水は火を消す）
  } else if (misakiGogyo === '金') {
    score += 10; // 金×水（中和）
  } else {
    score += 20; // 土×水（相克だが、土は水を濁らせる）
  }

  // 2. 日支の相性（最大30点）
  const gogyoMap: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水'
  };
  const misakiGesshiGogyo = gogyoMap[misakiGesshi];
  const meguruGesshiGogyo = gogyoMap[meguru.gesshi];

  if (meguruGesshiGogyo === '木' && misakiGesshiGogyo === '水') {
    score += 20; // 木×水（水は木を育てる）
  } else if (meguruGesshiGogyo === '木' && misakiGesshiGogyo === '火') {
    score += 25; // 木→火（相生）
  } else if (meguruGesshiGogyo === '木' && misakiGesshiGogyo === '木') {
    score += 15; // 同じ五行
  } else {
    score += 20; // その他
  }

  // 3. 天中殺の相互作用（最大20点）
  if (misakiTenchusatsu !== meguru.tenchusatsu) {
    score += 20; // 異なる天中殺 = 多角的な視点
  } else {
    score += 10; // 同じ天中殺 = 共通のテーマ
  }

  // 4. 年齢差の評価（最大20点）
  if (ageDiff >= 3 && ageDiff <= 5) {
    score += 20; // 理想的
  } else if (ageDiff === 2 || ageDiff === 6) {
    score += 15; // 許容範囲
  } else {
    score += 10; // やや離れている
  }

  return score;
}

console.log('========================================');
console.log('美咲の最適な生年月日 検証レポート');
console.log('========================================');
console.log('');

console.log('--- 巡のデータ（基準・既存設定維持）---');
console.log(`生年月日: ${meguru.birth_date}`);
console.log(`年齢: ${meguru.age}歳`);
console.log(`日干: ${meguru.nikkan}（${meguru.nikkan_yogo}）`);
console.log(`日支: ${meguru.gesshi}（${meguru.gesshi_yogo}）`);
console.log(`天中殺: ${meguru.tenchusatsu}`);
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
  age: number;
  ageDiff: number;
  score: number;
}> = [];

for (const cand of candidates) {
  const birthDate = new Date(`${cand.year}-${String(cand.month).padStart(2, '0')}-${String(cand.day).padStart(2, '0')}T12:00:00`);
  const bazi = calculateBaZi(birthDate, 135);

  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(gesshi);
  const age = 2026 - cand.year;
  const ageDiff = meguru.age - age;

  // 日干が「木」系でない場合はスキップ
  if (getGogyo(nikkan) !== '木') {
    console.log(`❌ ${cand.name}: 日干が${nikkan}（${getGogyo(nikkan)}）`);
    console.log('');
    continue;
  }

  const score = evaluateCompatibility(nikkan, gesshi, tenchusatsu, ageDiff);

  console.log(`✓ ${cand.name}`);
  console.log(`  日干: ${nikkan}（${getGogyo(nikkan)}）| 日支: ${gesshi} | 天中殺: ${tenchusatsu}`);
  console.log(`  年齢: ${age}歳（${ageDiff}歳差）`);
  console.log(`  相性スコア: ${score}/100点`);
  console.log('');

  results.push({
    candidate: cand.name,
    nikkan,
    gesshi,
    tenchusatsu,
    age,
    ageDiff,
    score
  });
}

if (results.length > 0) {
  // スコア順にソート
  results.sort((a, b) => b.score - a.score);

  console.log('========================================');
  console.log('総合ランキング');
  console.log('========================================');
  console.log('');

  results.forEach((result, index) => {
    console.log(`${index + 1}位: ${result.candidate}（${result.score}点）`);
    console.log(`  日干: ${result.nikkan}（木）| 日支: ${result.gesshi} | 天中殺: ${result.tenchusatsu}`);
    console.log(`  年齢: ${result.age}歳（${result.ageDiff}歳差）`);
    console.log('');
  });

  const best = results[0];
  console.log('========================================');
  console.log('推奨される生年月日');
  console.log('========================================');
  console.log('');
  console.log(`🎯 ${best.candidate}`);
  console.log(`  日干: ${best.nikkan}（木）| 日支: ${best.gesshi} | 天中殺: ${best.tenchusatsu}`);
  console.log(`  年齢: ${best.age}歳（${best.ageDiff}歳差）`);
  console.log(`  相性スコア: ${best.score}/100点`);
  console.log('');
  console.log('【推奨理由】');
  console.log(`✓ 日干「木」が巡の「水」を育てられる（水→木の相生）`);
  console.log(`✓ 年齢差${best.ageDiff}歳は精神的な同期に最適`);
  console.log(`✓ 天中殺が巡と異なり、多角的な視点を持てる`);
} else {
  console.log('条件に合致する候補日が見つかりませんでした。');
}
