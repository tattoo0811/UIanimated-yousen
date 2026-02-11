// Debug lunar-javascript for 1991-02-03
import { Solar } from '../accurate-logic/node_modules/lunar-javascript';

const date = new Date('1991-02-03T12:00:00');
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();

console.log('========== 1991-02-03 Debug ==========');
console.log('Input (Solar):', date.toISOString());
console.log('');
console.log('=== Lunar Conversion ===');
console.log('Lunar Year:', lunar.getYear(), lunar.getYearInChinese());
console.log('Lunar Month:', lunar.getMonth(), '月', lunar.getMonthInChinese());
console.log('Lunar Day:', lunar.getDay(), '日', lunar.getDayInChinese());
console.log('');
console.log('=== GanZhi from lunar-javascript ===');
console.log('getYearInGanZhi():', lunar.getYearInGanZhi());
console.log('getMonthInGanZhi():', lunar.getMonthInGanZhi());
console.log('getDayInGanZhi():', lunar.getDayInGanZhi());
console.log('');
console.log('=== Solar Terms (節気) ===');
const prevJieQi = lunar.getPrevJieQi();
const nextJieQi = lunar.getNextJieQi();
console.log('Previous JieQi:', prevJieQi.getName(), prevJieQi.getSolar().toYmd());
console.log('Next JieQi:', nextJieQi.getName(), nextJieQi.getSolar().toYmd());
console.log('');
console.log('=== Expected (朱学院) ===');
console.log('Year: 甲辰');
console.log('Month: 己丑');
console.log('Day: 庚午');
