// Verify Kei's BaZi for 1990-04-01
import { calculateBaZi } from '../accurate-logic/src/index';

const candidates = [
  '1990-04-01T12:00:00',
  '1990-03-31T23:59:59',
  '1990-04-02T00:00:01',
  '1990-10-03T12:00:00', // original
];

for (const dateStr of candidates) {
  const birth = new Date(dateStr);
  const bazi = calculateBaZi(birth, 135);

  console.log('==========');
  console.log('Birth Date:', dateStr);
  console.log('Year Pillar:', bazi.year.stemStr, bazi.year.branchStr);
  console.log('Month Pillar:', bazi.month.stemStr, bazi.month.branchStr);
  console.log('Day Pillar:', bazi.day.stemStr, bazi.day.branchStr);
  console.log('Day Stem:', bazi.day.stemStr);
  console.log('Day Branch:', bazi.day.branchStr);
}
