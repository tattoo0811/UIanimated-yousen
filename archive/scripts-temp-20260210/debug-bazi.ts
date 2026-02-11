/**
 * calculateBaZi 関数のデバッグ
 */

import { calculateBaZi } from '../accurate-logic/src/index';

// 巡の生年月日（時刻はデフォルト12:00）
const meguruBirth = new Date('1998-02-15');
meguruBirth.setHours(12, 0, 0, 0);

console.log('巡の生年月日: 1998年2月15日 12:00');
console.log('Dateオブジェクト:', meguruBirth);
console.log('toISOString:', meguruBirth.toISOString());
console.log('getTime:', meguruBirth.getTime());
console.log('');

const bazi = calculateBaZi(meguruBirth, 135);

console.log('--- calculateBaZi 出力 ---');
console.log('年柱:', bazi.year);
console.log('  - stem:', bazi.year.stem, 'stemStr:', bazi.year.stemStr);
console.log('  - branch:', bazi.year.branch, 'branchStr:', bazi.year.branchStr);
console.log('  - name:', bazi.year.name);
console.log('');
console.log('月柱:', bazi.month);
console.log('  - stem:', bazi.month.stem, 'stemStr:', bazi.month.stemStr);
console.log('  - branch:', bazi.month.branch, 'branchStr:', bazi.month.branchStr);
console.log('  - name:', bazi.month.name);
console.log('');
console.log('日柱:', bazi.day);
console.log('  - stem:', bazi.day.stem, 'stemStr:', bazi.day.stemStr);
console.log('  - branch:', bazi.day.branch, 'branchStr:', bazi.day.branchStr);
console.log('  - name:', bazi.day.name);
console.log('');
console.log('時柱:', bazi.hour);
console.log('  - stem:', bazi.hour.stem, 'stemStr:', bazi.hour.stemStr);
console.log('  - branch:', bazi.hour.branch, 'branchStr:', bazi.hour.branchStr);
console.log('  - name:', bazi.hour.name);
