// Debug lunar-javascript in detail
import { Solar } from '../accurate-logic/node_modules/lunar-javascript';

const date = new Date('1991-02-03T12:00:00');
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();

console.log('========== Detailed Debug ==========');
console.log('Input: 1991-02-03T12:00:00');
console.log('Lunar: 1990年12月19日');
console.log('');

// Get the raw GanZhi values
const yearGanZhiRaw = lunar.getYearInGanZhi();
const monthGanZhiRaw = lunar.getMonthInGanZhi();
const dayGanZhiRaw = lunar.getDayInGanZhi();

console.log('Raw values from lunar-javascript:');
console.log('  getYearInGanZhi():', yearGanZhiRaw);
console.log('  getMonthInGanZhi():', monthGanZhiRaw);
console.log('  getDayInGanZhi():', dayGanZhiRaw);
console.log('');

// 朱学院の結果
const shugakuin = {
  year: '庚午',
  month: '己丑',
  day: '甲辰'
};

console.log('朱学院の結果:');
console.log('  年柱:', shugakuin.year);
console.log('  月柱:', shugakuin.month);
console.log('  日柱:', shugakuin.day);
console.log('');

// どのメソッドがどの値を返しているか確認
console.log('Mapping check:');
console.log('  getYearInGanZhi() ===', yearGanZhiRaw === shugakuin.year ? '年柱' : yearGanZhiRaw === shugakuin.month ? '月柱' : yearGanZhiRaw === shugakuin.day ? '日柱' : 'UNKNOWN');
console.log('  getMonthInGanZhi() ===', monthGanZhiRaw === shugakuin.year ? '年柱' : monthGanZhiRaw === shugakuin.month ? '月柱' : monthGanZhiRaw === shugakuin.day ? '日柱' : 'UNKNOWN');
console.log('  getDayInGanZhi() ===', dayGanZhiRaw === shugakuin.year ? '年柱' : dayGanZhiRaw === shugakuin.month ? '月柱' : dayGanZhiRaw === shugakuin.day ? '日柱' : 'UNKNOWN');
console.log('');

console.log('立春 check:');
console.log('  立春: 1991-02-04');
console.log('  1991-02-03 is before 立春, so should use 1990 year pillar (庚午)');
