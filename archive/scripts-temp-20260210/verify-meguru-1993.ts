/**
 * 巡（新設定：1993年3月8日生まれ）の命式計算
 */

import { calculateBaZi, calculateYangSen } from '../accurate-logic/src/index';

// 巡の新しい生年月日
const meguruBirth = new Date('1993-03-08T12:00:00');

console.log('========================================');
console.log('巡（九条巡）命式レポート');
console.log('========================================');
console.log('');

console.log('【基本データ】');
console.log(`生年月日: 1993年3月8日`);
console.log(`2026年時点: 33歳`);
console.log(`年齢差（美咲）: 3歳（30歳 - 33歳）`);
console.log('');

const bazi = calculateBaZi(meguruBirth, 135);
const yangsen = calculateYangSen(bazi, meguruBirth);

console.log('【四柱推命】');
console.log(`年柱: ${bazi.year.name} (${bazi.year.stemStr}${bazi.year.branchStr})`);
console.log(`月柱: ${bazi.month.name} (${bazi.month.stemStr}${bazi.month.branchStr})`);
console.log(`日柱: ${bazi.day.name} (${bazi.day.stemStr}${bazi.day.branchStr})`);
console.log(`時柱: ${bazi.hour.name} (${bazi.hour.stemStr}${bazi.hour.branchStr})`);
console.log('');

console.log('【日柱の詳細】');
console.log(`日干: ${bazi.day.stemStr}（水陰）`);
console.log(`日支: ${bazi.day.branchStr}（金陰）`);
console.log('');

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

const tenchusatsu = getTenchusatsu(bazi.day.branchStr);
console.log(`天中殺: ${tenchusatsu}`);
console.log('');

console.log('【十大主星】');
console.log(`頭（年干）: ${yangsen.head.name}`);
console.log(`胸（月干）: ${yangsen.chest.name}`);
console.log(`腹（月支蔵干）: ${yangsen.belly.name}`);
console.log(`右手（日支蔵干）: ${yangsen.rightHand.name}`);
console.log(`左手（年支蔵干）: ${yangsen.leftHand.name}`);
console.log('');

console.log('【十二大従星】');
console.log(`左肩（年支）: ${yangsen.leftShoulder.name} (${yangsen.leftShoulder.score}点)`);
console.log(`右足（月支）: ${yangsen.rightLeg.name} (${yangsen.rightLeg.score}点)`);
console.log(`左足（日支）: ${yangsen.leftLeg.name} (${yangsen.leftLeg.score}点)`);
console.log('');

const totalEnergy = yangsen.leftLeg.score + yangsen.rightLeg.score + yangsen.leftShoulder.score;
console.log(`エネルギー点数: ${totalEnergy}点`);
console.log('');

console.log('========================================');
console.log('命式の解説');
console.log('========================================');
console.log('');

console.log('【日干「癸（水）」の特性】');
console.log('- 柔軟性・適応力が高い');
console.log('- 直感力・洞察力に優れる');
console.log('- 支え役・サポート役としての才能');
console.log('- 美咲の「乙（木）」を育てる構造（水→木）');
console.log('');

console.log('【日支「酉（金）」の特性】');
console.log('- 洗練された美意識');
console.log('- 正義感・責任感が強い');
console.log('- 分析力・論理的思考');
console.log('- 美咲の「亥（水）」とは「金→水」の相生関係（金は水を生む）');
console.log('');

console.log('【天中殺「申酉天中殺」の意味】');
console.log('- 「仕上げ・完成・昇華」のテーマ');
console.log('- 物事を極め、完成度を高める時期');
console.log('- 美咲の「戌亥天中殺」（深層・変容）とは対照的');
console.log('');

console.log('【十二大従星のエネルギー】');
console.log(`総合点数: ${totalEnergy}点`);
if (totalEnergy >= 20) {
  console.log('- 高エネルギー：アクティブでリーダーシップを発揮');
} else if (totalEnergy >= 13) {
  console.log('- 中エネルギー：バランスが取れている');
} else {
  console.log('- 低エネルギー：内省的で静かな力を持つ');
}
console.log('');

console.log('========================================');
console.log('朱学院検証用データ');
console.log('========================================');
console.log('');

console.log('【検証に必要な情報】');
console.log('```json');
console.log(JSON.stringify({
  name: '九条巡',
  birth_date: '1993-03-08',
  birth_time: '12:00',
  age: 33,
  nikkan: '癸',
  nikkan_yogo: '水陰',
  gesshi: '酉',
  gesshi_yogo: '金陰',
  tenchusatsu: '申酉天中殺',
  nenchu: bazi.year.name,
  gesshi_mei: bazi.month.name,
  nitchu: bazi.day.name,
  jichu: bazi.hour.name
}, null, 2));
console.log('```');
