// Search for 庚午 and 辛未 in 1990
import { calculateBaZi } from '../accurate-logic/src/index';

console.log('========== 1990年の命式探索 ==========\n');

// Search for 庚午 (for 慧)
console.log('【慧】庚午の日を探す（1990年）\n');
let gengWuCount = 0;
const gengWuResults = [];

for (let month = 1; month <= 12; month++) {
  for (let day = 1; day <= 31; day++) {
    try {
      const dateStr = `1990-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`;
      const birth = new Date(dateStr);
      const bazi = calculateBaZi(birth, 135);

      if (bazi.day.stemStr === '庚' && bazi.day.branchStr === '午') {
        gengWuCount++;
        gengWuResults.push({
          date: dateStr,
          year: bazi.year.name,
          month: bazi.month.name,
          day: bazi.day.name
        });

        console.log(`${gengWuCount}. ${dateStr}`);
        console.log(`   年柱: ${bazi.year.name}, 月柱: ${bazi.month.name}, 日柱: ${bazi.day.name}`);
        console.log('');
      }
    } catch (e) {
      // Invalid date, skip
    }
  }
}

console.log(`\n計: ${gengWuCount}日の庚午\n`);

// Search for 辛未 (for 巡)
console.log('【巡】辛未の日を探す（1990年）\n');
let xinWeiCount = 0;
const xinWeiResults = [];

for (let month = 1; month <= 12; month++) {
  for (let day = 1; day <= 31; day++) {
    try {
      const dateStr = `1990-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`;
      const birth = new Date(dateStr);
      const bazi = calculateBaZi(birth, 135);

      if (bazi.day.stemStr === '辛' && bazi.day.branchStr === '未') {
        xinWeiCount++;
        xinWeiResults.push({
          date: dateStr,
          year: bazi.year.name,
          month: bazi.month.name,
          day: bazi.day.name
        });

        console.log(`${xinWeiCount}. ${dateStr}`);
        console.log(`   年柱: ${bazi.year.name}, 月柱: ${bazi.month.name}, 日柱: ${bazi.day.name}`);
        console.log('');
      }
    } catch (e) {
      // Invalid date, skip
    }
  }
}

console.log(`\n計: ${xinWeiCount}日の辛未\n`);

// Summary
console.log('========== まとめ ==========');
console.log(`慧（庚午）: ${gengWuCount}件`);
console.log(`巡（辛未）: ${xinWeiCount}件`);

if (gengWuCount > 0 && xinWeiCount > 0) {
  console.log('\n✅ 両方の命式が1990年に見つかりました');
  console.log('\n候補日:');
  console.log('\n【慧】庚午の日:');
  gengWuResults.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.date} (年柱: ${r.year}, 月柱: ${r.month})`);
  });

  console.log('\n【巡】辛未の日:');
  xinWeiResults.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.date} (年柱: ${r.year}, 月柱: ${r.month})`);
  });

  console.log('\n→ これらの中から、1990年度の同級生として適切な組み合わせを選べます');
} else {
  console.log('\n❌ 1990年には両方の命式が見つかりませんでした');
}
