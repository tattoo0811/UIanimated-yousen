// Search for all 辛未 days in 1990
import { calculateBaZi } from '../accurate-logic/src/index';

console.log('Searching for all 辛未 day pillars in 1990...\n');

let count = 0;
for (let month = 1; month <= 12; month++) {
  for (let day = 1; day <= 31; day++) {
    try {
      const dateStr = `1990-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`;
      const birth = new Date(dateStr);
      const bazi = calculateBaZi(birth, 135);

      if (bazi.day.stemStr === '辛' && bazi.day.branchStr === '未') {
        count++;
        console.log(`${count}. ${dateStr}`);
        console.log(`   Year: ${bazi.year.stemStr}${bazi.year.branchStr}`);
        console.log(`   Month: ${bazi.month.stemStr}${bazi.month.branchStr}`);
        console.log(`   Day: ${bazi.day.stemStr}${bazi.day.branchStr}`);
        console.log(`   天中殺: ${bazi.year.branchStr === '申' || bazi.year.branchStr === '酉' ? '申酉' : 'Other'}`);
        console.log('');
      }
    } catch (e) {
      // Invalid date, skip
    }
  }
}

console.log(`\nTotal: ${count} days with 辛未 day pillar in 1990`);
