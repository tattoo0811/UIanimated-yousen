/**
 * accurate-logic Verification Script
 * 正確な算命学ロジックの検証スクリプト
 * 朱学院サイトの正解データに基づいて検証
 */

import { calculateBaZi } from './src/bazi';
import { calculateYangSen } from './src/yangsen';

// 1983年8月11日の検証
console.log('\n=== 1983年8月11日 検証 ===\n');
const testDate1 = new Date(1983, 7, 11, 12, 0, 0);
const bazi1 = calculateBaZi(testDate1, 135);

// デバッグ: 節入りからの日数
const { getYangSenHiddenStem } = require('./src/yangsen');
// 8月11日 - 8月8日 + 1 = 4日目
const daysFromSolarTerm = 11 - 8 + 1;
console.log('デバッグ情報:');
console.log(`  8月11日は立秋(8月8日)から ${daysFromSolarTerm} 日目`);
console.log(`  月支「申」の蔵干: ${getYangSenHiddenStem('申', testDate1)} (期待: 丙)`);
console.log(`  日支「亥」の蔵干: ${getYangSenHiddenStem('亥', testDate1)} (期待: 己)`);
console.log(`  年支「未」の蔵干: ${getYangSenHiddenStem('未', testDate1)} (期待: 壬)`);

// 十大主星のデバッグ
const { getTenGreatStar } = require('./src/yangsen');
const dayStemIdx = 9; // 癸
console.log('\n十大主星デバッグ:');
console.log(`  癸×庚(月干) = ${getTenGreatStar(dayStemIdx, 6)} (期待: 玉堂星)`);
console.log(`  癸×丙(月支蔵干) = ${getTenGreatStar(dayStemIdx, 2)} (期待: 司禄星)`);
console.log(`  癸×己(日支蔵干) = ${getTenGreatStar(dayStemIdx, 5)} (期待: 車騎星)`);
console.log(`  癸×壬(年支蔵干) = ${getTenGreatStar(dayStemIdx, 8)} (期待: 石門星)`);

const yangSen1 = calculateYangSen(bazi1, testDate1);

console.log('\n四柱推命:');
console.log(`  頭: ${yangSen1.head} (期待: 鳳閣星) ${yangSen1.head === '鳳閣星' ? '✅' : '❌'}`);
console.log(`  胸: ${yangSen1.chest} (期待: 玉堂星) ${yangSen1.chest === '玉堂星' ? '✅' : '❌'}`);
console.log(`  腹: ${yangSen1.belly} (期待: 司禄星) ${yangSen1.belly === '司禄星' ? '✅' : '❌'}`);
console.log(`  右手: ${yangSen1.rightHand} (期待: 車騎星) ${yangSen1.rightHand === '車騎星' ? '✅' : '❌'}`);
console.log(`  左手: ${yangSen1.leftHand} (期待: 石門星) ${yangSen1.leftHand === '石門星' ? '✅' : '❌'}`);

console.log('\n十二大従星:');
console.log(`  左肩: ${yangSen1.leftShoulder.name}(${yangSen1.leftShoulder.score}点) (期待: 天恍星(7点)) ${yangSen1.leftShoulder.name === '天恍星' && yangSen1.leftShoulder.score === 7 ? '✅' : '❌'}`);
console.log(`  左足: ${yangSen1.leftLeg.name}(${yangSen1.leftLeg.score}点) (期待: 天堂星(8点)) ${yangSen1.leftLeg.name === '天堂星' && yangSen1.leftLeg.score === 8 ? '✅' : '❌'}`);
console.log(`  右足: ${yangSen1.rightLeg.name}(${yangSen1.rightLeg.score}点) (期待: 天将星(12点)) ${yangSen1.rightLeg.name === '天将星' && yangSen1.rightLeg.score === 12 ? '✅' : '❌'}`);

// 1984年12月2日の検証
console.log('\n=== 1984年12月2日 検証 ===\n');
const testDate2 = new Date(1984, 11, 2, 12, 0, 0);
const bazi2 = calculateBaZi(testDate2, 135);

// デバッグ: 節入りからの日数
const daysFromSolarTerm2 = 2 - 7 + 30; // 11月7日(立冬)から
console.log('デバッグ情報:');
console.log(`  12月2日は小雪(11月22日)から ${daysFromSolarTerm2} 日目`);
console.log(`  月支「亥」の蔵干: ${getYangSenHiddenStem('亥', testDate2)} (期待: 甲)`);
console.log(`  日支「子」の蔵干: ${getYangSenHiddenStem('子', testDate2)} (期待: 癸)`);
console.log(`  年支「午」の蔵干: ${getYangSenHiddenStem('午', testDate2)} (期待: 己)`);

// 十大主星のデバッグ
const dayStemIdx2 = 0; // 甲
console.log('\n十大主星デバッグ:');
console.log(`  甲×庚(年干) = ${getTenGreatStar(dayStemIdx2, 6)} (期待: 禄存星)`);
console.log(`  甲×乙(月干) = ${getTenGreatStar(dayStemIdx2, 1)} (期待: 鳳閣星)`);
console.log(`  甲×甲(月支蔵干) = ${getTenGreatStar(dayStemIdx2, 0)} (期待: 調舒星)`);
console.log(`  甲×癸(日支蔵干) = ${getTenGreatStar(dayStemIdx2, 9)} (期待: 牽牛星)`);
console.log(`  甲×己(年支蔵干) = ${getTenGreatStar(dayStemIdx2, 5)} (期待: 司禄星)`);

const yangSen2 = calculateYangSen(bazi2, testDate2);

console.log('\n四柱推命:');
console.log(`  年柱: ${bazi2.year.name} (期待: 庚午) ${bazi2.year.name === '庚午' ? '✅' : '❌'}`);
console.log(`  月柱: ${bazi2.month.name} (期待: 乙亥) ${bazi2.month.name === '乙亥' ? '✅' : '❌'}`);
console.log(`  日柱: ${bazi2.day.name} (期待: 甲子) ${bazi2.day.name === '甲子' ? '✅' : '❌'}`);

console.log('\n十大主星:');
console.log(`  頭: ${yangSen2.head} (期待: 禄存星) ${yangSen2.head === '禄存星' ? '✅' : '❌'}`);
console.log(`  胸: ${yangSen2.chest} (期待: 鳳閣星) ${yangSen2.chest === '鳳閣星' ? '✅' : '❌'}`);
console.log(`  腹: ${yangSen2.belly} (期待: 調舒星) ${yangSen2.belly === '調舒星' ? '✅' : '❌'}`);
console.log(`  右手: ${yangSen2.rightHand} (期待: 牽牛星) ${yangSen2.rightHand === '牽牛星' ? '✅' : '❌'}`);
console.log(`  左手: ${yangSen2.leftHand} (期待: 司禄星) ${yangSen2.leftHand === '司禄星' ? '✅' : '❌'}`);

console.log('\n十二大従星:');
console.log(`  左肩: ${yangSen2.leftShoulder.name}(${yangSen2.leftShoulder.score}点) (期待: 天極星(2点)) ${yangSen2.leftShoulder.name === '天極星' && yangSen2.leftShoulder.score === 2 ? '✅' : '❌'}`);
console.log(`  左足: ${yangSen2.leftLeg.name}(${yangSen2.leftLeg.score}点) (期待: 天胡星(4点)) ${yangSen2.leftLeg.name === '天胡星' && yangSen2.leftLeg.score === 4 ? '✅' : '❌'}`);
console.log(`  右足: ${yangSen2.rightLeg.name}(${yangSen2.rightLeg.score}点) (期待: 天恍星(7点)) ${yangSen2.rightLeg.name === '天恍星' && yangSen2.rightLeg.score === 7 ? '✅' : '❌'}`);
