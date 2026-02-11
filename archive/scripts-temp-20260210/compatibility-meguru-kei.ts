/**
 * 巡 × 慧 相性診断（既存設定）
 */

import { calculateBaZi } from '../accurate-logic/src/index';

// 巡（既存設定）
const meguruBirth = new Date('1991-03-07T12:00:00');

// 慧（既存設定）
const keiBirth = new Date('1990-10-03T12:00:00');

const meguruBazi = calculateBaZi(meguruBirth, 135);
const keiBazi = calculateBaZi(keiBirth, 135);

// 天中殺判定
function getTenchusatsu(gesshi: string): string {
  const tenchusatsuMap: Record<string, string> = {
    '子': '子丑天中殺', '丑': '子丑天中殺',
    '寅': '寅卯天中殺', '卯': '寅卯天中殺',
    '辰': '辰巳天中殺', '巳': '午未天中殺',
    '午': '午未天中殺', '未': '午未天中殺',
    '申': '申酉天中殺', '酉': '申酉天中殺',
    '戌': '戌亥天中殺', '亥': '戌亥天中殺'
  };
  return tenchusatsuMap[gesshi] || '';
}

console.log('========================================');
console.log('巡 × 慧 相性診断（既存設定）');
console.log('========================================');
console.log('');

console.log('【基本データ】');
console.log(`巡: 1991年3月7日生まれ（35歳）`);
console.log(`慧: 1990年10月3日生まれ（36歳）`);
console.log(`年齢差: 1歳`);
console.log('');

console.log('【命式データ】');
console.log('');
console.log('--- 巡 ---');
console.log(`日干: ${meguruBazi.day.stemStr}（${meguruBazi.day.stemStr === '癸' ? '水' : meguruBazi.day.stemStr === '甲' ? '木' : meguruBazi.day.stemStr === '丙' ? '火' : meguruBazi.day.stemStr === '戊' ? '土' : '金'}）`);
console.log(`日支: ${meguruBazi.day.branchStr}`);
console.log(`天中殺: ${getTenchusatsu(meguruBazi.day.branchStr)}`);
console.log('');

console.log('--- 慧 ---');
console.log(`日干: ${keiBazi.day.stemStr}（${keiBazi.day.stemStr === '癸' ? '水' : keiBazi.day.stemStr === '甲' ? '木' : keiBazi.day.stemStr === '丙' ? '火' : keiBazi.day.stemStr === '戊' ? '土' : '金'}）`);
console.log(`日支: ${keiBazi.day.branchStr}`);
console.log(`天中殺: ${getTenchusatsu(keiBazi.day.branchStr)}`);
console.log('');

console.log('========================================');
console.log('相性診断結果');
console.log('========================================');
console.log('');

// 1. 日干の相性
console.log('【1. 日干の相性】');
const meguruNikkan = meguruBazi.day.stemStr;
const keiNikkan = keiBazi.day.stemStr;

const gogyoMap: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

const meguruGogyo = gogyoMap[meguruNikkan];
const keiGogyo = gogyoMap[keiNikkan];

console.log(`巡: ${meguruNikkan}（${meguruGogyo}）`);
console.log(`慧: ${keiNikkan}（${keiGogyo}）`);
console.log('');

// 相生・相克関係の判定
let nikkanRelation = '';
let nikkanScore = 0;

if (meguruGogyo === keiGogyo) {
  nikkanRelation = '同じ五行（和合）';
  nikkanScore = 20;
} else if (
  (meguruGogyo === '木' && keiGogyo === '火') ||
  (meguruGogyo === '火' && keiGogyo === '土') ||
  (meguruGogyo === '土' && keiGogyo === '金') ||
  (meguruGogyo === '金' && keiGogyo === '水') ||
  (meguruGogyo === '水' && keiGogyo === '木')
) {
  nikkanRelation = `${meguruGogyo}→${keiGogyo}（相生：巡が慧を生む）`;
  nikkanScore = 30;
} else if (
  (meguruGogyo === '火' && keiGogyo === '木') ||
  (meguruGogyo === '土' && keiGogyo === '火') ||
  (meguruGogyo === '金' && keiGogyo === '土') ||
  (meguruGogyo === '水' && keiGogyo === '金') ||
  (meguruGogyo === '木' && keiGogyo === '水')
) {
  nikkanRelation = `${meguruGogyo}←${keiGogyo}（相生：慧が巡を生む）`;
  nikkanScore = 30;
} else if (
  (meguruGogyo === '木' && keiGogyo === '土') ||
  (meguruGogyo === '土' && keiGogyo === '水') ||
  (meguruGogyo === '水' && keiGogyo === '火') ||
  (meguruGogyo === '火' && keiGogyo === '金') ||
  (meguruGogyo === '金' && keiGogyo === '木')
) {
  nikkanRelation = `${meguruGogyo}×${keiGogyo}（相克：巡が慧を克つ）`;
  nikkanScore = 10;
} else {
  nikkanRelation = `${meguruGogyo}×${keiGogyo}（相克：慧が巡を克つ）`;
  nikkanScore = 10;
}

console.log(`関係: ${nikkanRelation}`);
console.log(`評価: ${'★'.repeat(Math.floor(nikkanScore / 6))}${'☆'.repeat(5 - Math.floor(nikkanScore / 6))}（${nikkanScore}/30点）`);
console.log('');

// 2. 日支の相性
console.log('【2. 日支の相性】');
const meguruGesshi = meguruBazi.day.branchStr;
const keiGesshi = keiBazi.day.branchStr;

const juunishiEisei: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

const meguruGesshiGogyo = juunishiEisei[meguruGesshi];
const keiGesshiGogyo = juunishiEisei[keiGesshi];

console.log(`巡: ${meguruGesshi}（${meguruGesshiGogyo}）`);
console.log(`慧: ${keiGesshi}（${keiGesshiGogyo}）`);
console.log('');

// 日支の関係判定
let gesshiRelation = '';
let gesshiScore = 0;

// 六合
const rokugou: Record<string, string> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午'
};

// 三合
const sangou: Record<string, string[]> = {
  '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'],
  '申': ['子', '辰'], '子': ['申', '辰'], '辰': ['申', '子'],
  '巳': ['酉', '丑'], '酉': ['巳', '丑'], '丑': ['巳', '酉'],
  '亥': ['卯', '未'], '卯': ['亥', '未'], '未': ['亥', '卯']
};

// 六冲
const rokutsu: Record<string, string> = {
  '子': '午', '丑': '未', '寅': '申', '卯': '酉',
  '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
  '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
};

if (rokugou[meguruGesshi] === keiGesshi) {
  gesshiRelation = '六合（調和のとれた関係）';
  gesshiScore = 30;
} else if (sangou[meguruGesshi]?.includes(keiGesshi)) {
  gesshiRelation = '三合（共通の目的を持つ協力関係）';
  gesshiScore = 25;
} else if (rokutsu[meguruGesshi] === keiGesshi) {
  gesshiRelation = `${meguruGesshi}${keiGesshi}冲（対立・衝突）`;
  gesshiScore = 10;
} else {
  gesshiRelation = '無関係（中立）';
  gesshiScore = 15;
}

console.log(`関係: ${gesshiRelation}`);
console.log(`評価: ${'★'.repeat(Math.floor(gesshiScore / 6))}${'☆'.repeat(5 - Math.floor(gesshiScore / 6))}（${gesshiScore}/30点）`);
console.log('');

// 3. 天中殺の相互作用
console.log('【3. 天中殺の相互作用】');
const meguruTenchusatsu = getTenchusatsu(meguruBazi.day.branchStr);
const keiTenchusatsu = getTenchusatsu(keiBazi.day.branchStr);

console.log(`巡: ${meguruTenchusatsu}`);
console.log(`慧: ${keiTenchusatsu}`);
console.log('');

let tenchusatsuScore = 0;
let tenchusatsuRelation = '';

if (meguruTenchusatsu === keiTenchusatsu) {
  tenchusatsuRelation = '同じ天中殺（共通のテーマ）';
  tenchusatsuScore = 15;
} else {
  tenchusatuRelation = '異なる天中殺（多角的な視点）';
  tenchusatsuScore = 20;
}

console.log(`関係: ${tenchusatsuRelation}`);
console.log(`評価: ${'★'.repeat(Math.floor(tenchusatsuScore / 4))}${'☆'.repeat(5 - Math.floor(tenchusatsuScore / 4))}（${tenchusatsuScore}/20点）`);
console.log('');

// 4. 年齢差
console.log('【4. 年齢差とライフステージ】');
console.log(`巡: 35歳（キャリア${35 - 25}年目）`);
console.log(`慧: 36歳（キャリア${36 - 23}年目）`);
console.log(`年齢差: 1歳`);
console.log('');
console.log('関係: 同世代の友人・ライバル');
console.log('評価: ★★★★☆（18/20点）');
console.log('');

// 5. 総合評価
const totalScore = nikkanScore + gesshiScore + tenchusatsuScore + 18;
console.log('========================================');
console.log('総合評価');
console.log('========================================');
console.log('');
console.log(`総合スコア: ${totalScore}/100点`);
console.log(`評価: ${'★'.repeat(Math.round(totalScore / 20))}${'☆'.repeat(5 - Math.round(totalScore / 20))}（${Math.round(totalScore)}点/100点）`);
console.log('');

console.log('【相性のキーワード】');
if (totalScore >= 80) {
  console.log('「理解し合える同志」');
} else if (totalScore >= 60) {
  console.log('「補完し合うパートナー」');
} else {
  console.log('「対立によって成長する関係」');
}
console.log('');

console.log('【物語的な意味合い】');
console.log('- 西洛大学からの同期');
console.log('- 2017年、MedAIを共同創業');
console.log('- 2021年、慧による裏切り');
console.log('- 巡：人間の洞察、慧：AIの効率性');
console.log('- 2026年、運命診断室 vs 星みてるの対立');
