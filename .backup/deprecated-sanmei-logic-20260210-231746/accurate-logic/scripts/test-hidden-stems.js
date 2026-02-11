const { Solar } = require('lunar-javascript');

// 1983年8月11日
const date = new Date(1983, 7, 11, 12, 0, 0);
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();

console.log('=== 1983年8月11日 ===');
console.log('年柱:', lunar.getDayInGanZhi()); // 辛未
console.log('月柱:', lunar.getMonthInGanZhi()); // 庚申
console.log('日柱:', lunar.getYearInGanZhi()); // 癸亥
console.log('年支:', lunar.getDayInGanZhi().charAt(1)); // 未
console.log('月支:', lunar.getMonthInGanZhi().charAt(1)); // 申
console.log('日支:', lunar.getYearInGanZhi().charAt(1)); // 亥

// 8月11日は節入り（立秋: 8月8日）から3日後
// 未の蔵干: 初気丁(9日), 中気乙(3日), 本気己
// 節入りからの日数: 11 - 8 = 3日
// 3 <= 9 → 初気丁

console.log('\n節入りからの日数計算:');
console.log('8月8日が立秋');
console.log('8月11日は立秋から3日後');
console.log('未の蔵干: 初気丁(9日), 中気乙(3日), 本気己');
console.log('3日目 → 初気丁（火）');

// 申の蔵干: 初気戊(10日), 中気壬(3日), 本気庚
console.log('\n申の蔵干: 初気戊(10日), 中気壬(3日), 本気庚');
console.log('立秋から3日 → まだ前の月（7月7日小暑から）');
console.log('7月7日から8月11日 → 35日');
console.log('小暑から35日 → 35 > 10 + 3 → 本気庚（金）');

// 亥の蔵干: 初気甲(12日), 本気壬
console.log('\n亥の蔵干: 初気甲(12日), 本気壬');
console.log('立秋から3日 → まだ前の月');
console.log('亥は11月（立冬11月7日から）');
console.log('8月11日 → 11月7日までは前のサイクル');
console.log('12月7日大雪から8月11日 → ??');

// 実際に二十八元の計算を確認
console.log('\n=== 二十八元計算の確認 ===');

// 節入り日データ
const SOLAR_TERM_DAYS = {
  1: 6, 2: 4, 3: 6, 4: 5, 5: 6, 6: 6,
  7: 7, 8: 8, 9: 8, 10: 8, 11: 7, 12: 7
};

function getDaysFromSolarTerm(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const solarTermDay = SOLAR_TERM_DAYS[month];

  if (day < solarTermDay) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    const prevSolarTermDay = SOLAR_TERM_DAYS[prevMonth];
    return (prevMonthLastDay - prevSolarTermDay) + day;
  }

  return day - solarTermDay + 1;
}

console.log('\n8月11日の節入りからの日数:', getDaysFromSolarTerm(date));
console.log('8月の節入り日は8日（立秋）');
console.log('8月11日は立秋から', 11 - 8 + 1, '日目');

// 1984年12月2日
const date2 = new Date(1984, 11, 2, 12, 0, 0);
const solar2 = Solar.fromDate(date2);
const lunar2 = solar2.getLunar();

console.log('\n=== 1984年12月2日 ===');
console.log('年柱:', lunar2.getDayInGanZhi()); // 庚午
console.log('月柱:', lunar2.getMonthInGanZhi()); // 乙亥
console.log('日柱:', lunar2.getYearInGanZhi()); // 甲子
console.log('年支:', lunar2.getDayInGanZhi().charAt(1)); // 午
console.log('月支:', lunar2.getMonthInGanZhi().charAt(1)); // 亥
console.log('日支:', lunar2.getYearInGanZhi().charAt(1)); // 子

console.log('\n12月2日の節入りからの日数:', getDaysFromSolarTerm(date2));
console.log('12月の節入り日は7日（大雪）');
console.log('12月2日は大雪前 → 11月7日から', 30 + 2 - 7 + 1, '日目');
