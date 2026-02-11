#!/usr/bin/env node
/**
 * ランダムな日付で算命学計算を実行して検証
 */

const { calculateBaZi } = require('/Users/kitamuratatsuhiko/UIanimated/accurate-logic/dist/src/bazi.js');
const { calculateYangSen } = require('/Users/kitamuratatsuhiko/UIanimated/accurate-logic/dist/src/yangsen.js');

// ランダムな日付を10個生成
const randomDates = [
  { date: '1983-08-11', time: '12:00', name: 'Random-1' },
  { date: '1990-03-15', time: '14:30', name: 'Random-2' },
  { date: '1975-12-25', time: '09:00', name: 'Random-3' },
  { date: '1988-06-08', time: '16:45', name: 'Random-4' },
  { date: '2001-09-22', time: '11:20', name: 'Random-5' },
  { date: '1968-02-14', time: '08:00', name: 'Random-6' },
  { date: '1995-07-30', time: '15:15', name: 'Random-7' },
  { date: '1982-11-05', time: '10:30', name: 'Random-8' },
  { date: '1979-04-18', time: '13:00', name: 'Random-9' },
  { date: '1998-01-27', time: '17:00', name: 'Random-10' },
];

console.log('═══════════════════════════════════════════════════════════════');
console.log('ランダム検証: 10個の日付で算命学計算を実行');
console.log('═══════════════════════════════════════════════════════════════\n');

const results = [];

randomDates.forEach(({ date, time, name }, index) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const dateObj = new Date(year, month - 1, day, hour, minute);

  try {
    const fourPillars = calculateBaZi(dateObj, 135);
    const yangSen = calculateYangSen(fourPillars, dateObj);

    results.push({
      index: index + 1,
      name,
      date,
      time,
      fourPillars: {
        year: `${fourPillars.year.stemStr}${fourPillars.year.branchStr}`,
        month: `${fourPillars.month.stemStr}${fourPillars.month.branchStr}`,
        day: `${fourPillars.day.stemStr}${fourPillars.day.branchStr}`,
      },
      jugdai: {
        head: yangSen.head,
        chest: yangSen.chest,
        belly: yangSen.belly,
        rightHand: yangSen.rightHand,
        leftHand: yangSen.leftHand,
      },
      junidai: {
        leftShoulder: yangSen.leftShoulder.name,
        leftLeg: yangSen.leftLeg.name,
        rightLeg: yangSen.rightLeg.name,
      }
    });

    console.log(`【${name}】${date} ${time}`);
    console.log(`  四柱推命: ${results[index].fourPillars.year} / ${results[index].fourPillars.month} / ${results[index].fourPillars.day}`);
    console.log(`  十大主星:`);
    console.log(`    頭: ${yangSen.head}`);
    console.log(`    胸: ${yangSen.chest}`);
    console.log(`    腹: ${yangSen.belly}`);
    console.log(`    右手: ${yangSen.rightHand}`);
    console.log(`    左手: ${yangSen.leftHand}`);
    console.log(`  十二大従星:`);
    console.log(`    左肩: ${yangSen.leftShoulder.name}`);
    console.log(`    左足: ${yangSen.leftLeg.name}`);
    console.log(`    右足: ${yangSen.rightLeg.name}`);
    console.log();
  } catch (error) {
    console.error(`エラー: ${name} (${date}): ${error.message}`);
  }
});

// 結果をJSONファイルに保存
const fs = require('fs');
const outputPath = '/Users/kitamuratatsuhiko/UIanimated/claudedocs/random-validation-results.json';
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');

console.log('═══════════════════════════════════════════════════════════════');
console.log(`結果を保存しました: ${outputPath}`);
console.log('═══════════════════════════════════════════════════════════════');
