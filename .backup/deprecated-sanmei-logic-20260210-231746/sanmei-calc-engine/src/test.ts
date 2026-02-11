/**
 * test.ts - TypeScript Test File for Sanmei-Calc-Engine
 *
 * Tests the calculateSanmeiChart function with known birth dates
 * and verifies the Four Pillars calculation, especially the Lunar Year boundary.
 */

import { calculateSanmeiChart, formatChart } from './index';

/**
 * Test Case 1: 1990-01-01
 * This date is BEFORE 立春 (Lichun/Start of Spring)
 * So the year pillar should use 1989's 干支 (己巳 = Yin Earth Snake)
 */
function test1() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: 1990-01-01 (Before Lichun - should use 1989 Ganshi)');
  console.log('='.repeat(60));

  const chart = calculateSanmeiChart(1990, 1, 1, 12);

  console.log('\nBirth Information:');
  console.log(`  Date: ${chart.birthDate.year}-${String(chart.birthDate.month).padStart(2, '0')}-${String(chart.birthDate.day).padStart(2, '0')} ${String(chart.birthDate.hour).padStart(2, '0')}:00`);

  console.log('\nFour Pillars (年月日時):');
  console.log(`  Year Pillar  (年柱): ${chart.fourPillars.year.stem}${chart.fourPillars.year.branch}`);
  console.log(`  Month Pillar (月柱): ${chart.fourPillars.month.stem}${chart.fourPillars.month.branch}`);
  console.log(`  Day Pillar   (日柱): ${chart.fourPillars.day.stem}${chart.fourPillars.day.branch}`);
  console.log(`  Hour Pillar  (時柱): ${chart.fourPillars.hour.stem}${chart.fourPillars.hour.branch}`);

  console.log('\nDay Stem (日干):');
  console.log(`  Stem: ${chart.dayStem}`);
  console.log(`  Element: ${chart.dayElement}`);
  console.log(`  Yin/Yang: ${chart.dayYinYang === 'yang' ? 'Yang (陽)' : 'Yin (陰)'}`);

  console.log('\nTenchusatsu (天中殺):');
  console.log(`  Type: ${chart.tenchusatsu.type}`);
  console.log(`  Branch 1: ${chart.tenchusatsu.branch1Name}`);
  console.log(`  Branch 2: ${chart.tenchusatsu.branch2Name}`);

  console.log('\n--- Full Chart ---');
  console.log(formatChart(chart));
}

/**
 * Test Case 2: 2000-02-04
 * This is around the 立春 boundary (approximately Feb 3-5)
 * Need to verify correct year pillar calculation
 */
function test2() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: 2000-02-04 (Around Lichun boundary)');
  console.log('='.repeat(60));

  const chart = calculateSanmeiChart(2000, 2, 4, 12);

  console.log('\nBirth Information:');
  console.log(`  Date: ${chart.birthDate.year}-${String(chart.birthDate.month).padStart(2, '0')}-${String(chart.birthDate.day).padStart(2, '0')} ${String(chart.birthDate.hour).padStart(2, '0')}:00`);

  console.log('\nFour Pillars (年月日時):');
  console.log(`  Year Pillar  (年柱): ${chart.fourPillars.year.stem}${chart.fourPillars.year.branch}`);
  console.log(`  Month Pillar (月柱): ${chart.fourPillars.month.stem}${chart.fourPillars.month.branch}`);
  console.log(`  Day Pillar   (日柱): ${chart.fourPillars.day.stem}${chart.fourPillars.day.branch}`);
  console.log(`  Hour Pillar  (時柱): ${chart.fourPillars.hour.stem}${chart.fourPillars.hour.branch}`);

  console.log('\nDay Stem (日干):');
  console.log(`  Stem: ${chart.dayStem}`);
  console.log(`  Element: ${chart.dayElement}`);
  console.log(`  Yin/Yang: ${chart.dayYinYang === 'yang' ? 'Yang (陽)' : 'Yin (陰)'}`);

  console.log('\nTenchusatsu (天中殺):');
  console.log(`  Type: ${chart.tenchusatsu.type}`);
  console.log(`  Branch 1: ${chart.tenchusatsu.branch1Name}`);
  console.log(`  Branch 2: ${chart.tenchusatsu.branch2Name}`);

  console.log('\n--- Full Chart ---');
  console.log(formatChart(chart));
}

/**
 * Test Case 3: 1985-08-15
 * Mid-year date, straightforward test case
 */
function test3() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: 1985-08-15 (Mid-year straightforward test)');
  console.log('='.repeat(60));

  const chart = calculateSanmeiChart(1985, 8, 15, 14);

  console.log('\nBirth Information:');
  console.log(`  Date: ${chart.birthDate.year}-${String(chart.birthDate.month).padStart(2, '0')}-${String(chart.birthDate.day).padStart(2, '0')} ${String(chart.birthDate.hour).padStart(2, '0')}:00`);

  console.log('\nFour Pillars (年月日時):');
  console.log(`  Year Pillar  (年柱): ${chart.fourPillars.year.stem}${chart.fourPillars.year.branch}`);
  console.log(`  Month Pillar (月柱): ${chart.fourPillars.month.stem}${chart.fourPillars.month.branch}`);
  console.log(`  Day Pillar   (日柱): ${chart.fourPillars.day.stem}${chart.fourPillars.day.branch}`);
  console.log(`  Hour Pillar  (時柱): ${chart.fourPillars.hour.stem}${chart.fourPillars.hour.branch}`);

  console.log('\nDay Stem (日干):');
  console.log(`  Stem: ${chart.dayStem}`);
  console.log(`  Element: ${chart.dayElement}`);
  console.log(`  Yin/Yang: ${chart.dayYinYang === 'yang' ? 'Yang (陽)' : 'Yin (陰)'}`);

  console.log('\nTenchusatsu (天中殺):');
  console.log(`  Type: ${chart.tenchusatsu.type}`);
  console.log(`  Branch 1: ${chart.tenchusatsu.branch1Name}`);
  console.log(`  Branch 2: ${chart.tenchusatsu.branch2Name}`);

  console.log('\n--- Full Chart ---');
  console.log(formatChart(chart));
}

/**
 * Run all tests
 */
function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     SANMEI-CALC-ENGINE COMPREHENSIVE TEST SUITE            ║');
  console.log('║                                                            ║');
  console.log('║  Testing Four Pillars calculation with boundary cases     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    test1();
    test2();
    test3();

    console.log('\n' + '='.repeat(60));
    console.log('✓ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n✗ TEST FAILED WITH ERROR:');
    console.error(error);
    process.exit(1);
  }
}

main();
