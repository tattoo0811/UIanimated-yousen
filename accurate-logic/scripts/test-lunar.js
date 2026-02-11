const { Solar } = require('lunar-javascript');

// テスト日付
const date1 = new Date(1983, 7, 11, 12, 0, 0); // 1983-08-11
const date2 = new Date(1984, 11, 2, 12, 0, 0); // 1984-12-02

console.log('=== 1983年8月11日 ===');
const solar1 = Solar.fromDate(date1);
const lunar1 = solar1.getLunar();
console.log('年柱:', lunar1.getYearInGanZhi(), '(正解: 辛未)');
console.log('月柱:', lunar1.getMonthInGanZhi(), '(正解: 庚申)');
console.log('日柱:', lunar1.getDayInGanZhi(), '(正解: 癸亥)');

console.log('\n=== 1984年12月2日 ===');
const solar2 = Solar.fromDate(date2);
const lunar2 = solar2.getLunar();
console.log('年柱:', lunar2.getYearInGanZhi(), '(正解: 庚午)');
console.log('月柱:', lunar2.getMonthInGanZhi(), '(正解: 乙亥)');
console.log('日柱:', lunar2.getDayInGanZhi(), '(正解: 甲子)');
