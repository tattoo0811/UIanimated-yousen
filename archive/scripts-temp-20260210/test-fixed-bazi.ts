// Test fixed accurate-logic
import { calculateBaZi } from '../accurate-logic/src/index';

console.log('========== Testing Fixed accurate-logic ==========\n');

// Test case 1: 慧 (1991-02-03)
console.log('【慧】1991-02-03');
console.log('Expected (朱学院): 年柱=庚午, 月柱=己丑, 日柱=甲辰');
const kei = calculateBaZi(new Date('1991-02-03T12:00:00'), 135);
console.log('Result (fixed):    年柱=' + kei.year.name + ', 月柱=' + kei.month.name + ', 日柱=' + kei.day.name);
console.log('Match:', kei.year.name === '庚午' && kei.month.name === '己丑' && kei.day.name === '甲辰' ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test case 2: 巡 (1991-03-07)
console.log('【巡】1991-03-07');
const meguru = calculateBaZi(new Date('1991-03-07T12:00:00'), 135);
console.log('Result (fixed):    年柱=' + meguru.year.name + ', 月柱=' + meguru.month.name + ', 日柱=' + meguru.day.name);
console.log('');

// Additional info for 慧
console.log('=== Additional Info for 慧 ===');
console.log('Year Stem:', kei.year.stemStr, 'Branch:', kei.year.branchStr);
console.log('Month Stem:', kei.month.stemStr, 'Branch:', kei.month.branchStr);
console.log('Day Stem:', kei.day.stemStr, 'Branch:', kei.day.branchStr);
