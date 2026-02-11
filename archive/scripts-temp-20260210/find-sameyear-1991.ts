// Find 辛未 dates in 1991 that are 同学年 with 慧 (1990-11-01)
import { calculateBaZi } from '../accurate-logic/src/index';

console.log('========== 1991年の辛未で同学年を探す ==========\n');

console.log('慧: 1990-11-01生まれ（早生まれ）→ 2009年入学（18歳）');
console.log('巡: 1991年生まれ（早生まれ）→ 2009年入学（17歳で4月に18歳）\n');

// Search for 辛未 in 1991 (before April)
console.log('【巡】1991年1月〜3月の辛未の日\n');

const candidates = [];

for (let month = 1; month <= 3; month++) {
  for (let day = 1; day <= 31; day++) {
    try {
      const dateStr = `1991-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`;
      const birth = new Date(dateStr);
      const bazi = calculateBaZi(birth, 135);

      if (bazi.day.stemStr === '辛' && bazi.day.branchStr === '未') {
        candidates.push({
          date: dateStr.substring(0, 10),
          year: bazi.year.name,
          month: bazi.month.name,
          day: bazi.day.name
        });

        console.log(`${dateStr.substring(0, 10)}: 年柱=${bazi.year.name}, 月柱=${bazi.month.name}, 日柱=${bazi.day.name}`);
      }
    } catch (e) {
      // Invalid date, skip
    }
  }
}

console.log(`\n計: ${candidates.length}件見つかりました`);

if (candidates.length > 0) {
  console.log('\n========== おすすめの組み合わせ ==========');
  console.log('慧: 1990-11-01（庚午・天中殺=寅卯）');
  console.log('巡: 1991-03-XX（辛未・天中殺=申酉）');
  console.log('\n✅ 両方とも早生まれで2009年入学の同学年');
  console.log('✅ 年齢差: 約4ヶ月（慧が年上）');
  console.log('✅ 天中殺の補完関係: 寅卯 × 申酉');
}
