/**
 * 高橋美咲の命式計算
 */

import { calculateBaZi, calculateYangSen } from '../accurate-logic/src/index';

// 高橋美咲の生年月日
const birthDate = new Date('1995-03-15T14:30:00');
birthDate.setHours(14, 30, 0, 0);

console.log('========================================');
console.log('高橋美咲の命式');
console.log('========================================');
console.log(`生年月日: 1995年3月15日 14:30`);
console.log(`性別: 女性`);
console.log(`年齢: 30歳（2026年時点）`);
console.log('');

// accurate-logicで計算
const bazi = calculateBaZi(birthDate, 135);
const yangsen = calculateYangSen(bazi, birthDate);

console.log('--- 四柱推命 ---');
console.log(`年柱: ${bazi.year.name} (${bazi.year.stemStr}${bazi.year.branchStr})`);
console.log(`月柱: ${bazi.month.name} (${bazi.month.stemStr}${bazi.month.branchStr})`);
console.log(`日柱: ${bazi.day.name} (${bazi.day.stemStr}${bazi.day.branchStr})`);
console.log(`時柱: ${bazi.hour.name} (${bazi.hour.stemStr}${bazi.hour.branchStr})`);
console.log('');

console.log('--- 陰陽五行 ---');
console.log(`日干: ${bazi.day.stemStr}`);
console.log(`日支: ${bazi.day.branchStr}`);

// 天中殺の判定
function getTenchusatsu(nikkan: string, gesshi: string): string {
  const gesshiIdx = '子丑寅卯辰巳午未申酉戌亥'.indexOf(gesshi);
  if (gesshiIdx >= 0 && gesshiIdx <= 1) return '子丑天中殺';
  if (gesshiIdx >= 2 && gesshiIdx <= 3) return '寅卯天中殺';
  if (gesshiIdx >= 4 && gesshiIdx <= 5) return '辰巳天中殺';
  if (gesshiIdx >= 6 && gesshiIdx <= 7) return '午未天中殺';
  if (gesshiIdx >= 8 && gesshiIdx <= 9) return '申酉天中殺';
  if (gesshiIdx >= 10 && gesshiIdx <= 11) return '戌亥天中殺';
  return '';
}

const tenchusatsu = getTenchusatsu(bazi.day.stemStr, bazi.day.branchStr);
console.log(`天中殺: ${tenchusatsu}`);
console.log('');

console.log('--- 十大主星（人体図）---');
console.log(`頭（年干）: ${yangsen.head}`);
console.log(`胸（月干）: ${yangsen.chest}`);
console.log(`腹（月支蔵干）: ${yangsen.belly}`);
console.log(`右手（日支蔵干）: ${yangsen.rightHand}`);
console.log(`左手（年支蔵干）: ${yangsen.leftHand}`);
console.log('');

console.log('--- 十二大従星 ---');
console.log(`左肩（年支）: ${yangsen.leftShoulder.name} (${yangsen.leftShoulder.score}点)`);
console.log(`右足（月支）: ${yangsen.rightLeg.name} (${yangsen.rightLeg.score}点)`);
console.log(`左足（日支）: ${yangsen.leftLeg.name} (${yangsen.leftLeg.score}点)`);
console.log(`エネルギー点数: ${yangsen.leftShoulder.score + yangsen.rightLeg.score + yangsen.leftLeg.score}点`);
console.log('');

console.log('========================================');
console.log('美咲のキーマンとしての特徴');
console.log('========================================');
console.log(`日干が${bazi.day.stemStr}（木）の女性: 柔軟性、成長力、協調性`);
console.log(`天中殺が${tenchusatsu}: ${tenchusatsu === '戌亥天中殺' ? '8歳年齢の節目' : '特定の年齢で変化'}`);
console.log('');
console.log('エピソード25での再登場:');
console.log('- 自己評価の低さにぶつかり、独立を迷う');
console.log('- 「自己犠牲」から「自己選択」への成長');
console.log('- 半年前の処方箋の実践と、新たな課題の顕在化');
