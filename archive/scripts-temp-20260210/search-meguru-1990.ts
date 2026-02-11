// Search for 辛未 in April 1990 for 巡
import { calculateBaZi } from '../accurate-logic/src/index';

console.log('Searching for 辛未 day pillar in April 1990...\n');

for (let day = 2; day <= 30; day++) {
  const dateStr = `1990-04-${day.toString().padStart(2, '0')}T12:00:00`;
  const birth = new Date(dateStr);
  const bazi = calculateBaZi(birth, 135);

  if (bazi.day.stemStr === '辛' && bazi.day.branchStr === '未') {
    console.log('✓ Found 辛未:', dateStr);
    console.log(`  Year: ${bazi.year.stemStr}${bazi.year.branchStr}`);
    console.log(`  Month: ${bazi.month.stemStr}${bazi.month.branchStr}`);
    console.log(`  Day: ${bazi.day.stemStr}${bazi.day.branchStr}`);
    console.log(`  Day Stem: ${bazi.day.stemStr} (${bazi.day.stem})`);
    console.log(`  Day Branch: ${bazi.day.branchStr} (${bazi.day.branch})`);
    break;
  }
}
