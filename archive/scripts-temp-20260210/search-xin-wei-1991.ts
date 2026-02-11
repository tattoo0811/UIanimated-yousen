// Search for all 辛未 days in 1991
import { calculateBaZi } from '../accurate-logic/src/index';

console.log('Searching for all 辛未 day pillars in 1991...\n');

let count = 0;
const results = [];

for (let month = 1; month <= 12; month++) {
  for (let day = 1; day <= 31; day++) {
    try {
      const dateStr = `1991-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`;
      const birth = new Date(dateStr);
      const bazi = calculateBaZi(birth, 135);

      if (bazi.day.stemStr === '辛' && bazi.day.branchStr === '未') {
        count++;
        results.push({
          date: dateStr,
          year: bazi.year.name,
          month: bazi.month.name,
          day: bazi.day.name
        });

        console.log(`${count}. ${dateStr}`);
        console.log(`   Year: ${bazi.year.name}`);
        console.log(`   Month: ${bazi.month.name}`);
        console.log(`   Day: ${bazi.day.name}`);
        console.log('');
      }
    } catch (e) {
      // Invalid date, skip
    }
  }
}

console.log(`\nTotal: ${count} days with 辛未 day pillar in 1991`);

if (count > 0) {
  console.log('\n=== Candidate birthdates for 巡 ===');
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.date}`);
    console.log(`   年柱: ${r.year}, 月柱: ${r.month}, 日柱: ${r.day}`);
  });
}
