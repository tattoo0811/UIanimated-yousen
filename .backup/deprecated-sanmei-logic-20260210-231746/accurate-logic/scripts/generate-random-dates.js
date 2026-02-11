/**
 * ランダムな生年月日を100個生成するスクリプト
 */

// ランダムな日付を生成する関数
function generateRandomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const date = new Date(randomTime);

  // 時間を00:00に設定
  date.setHours(0, 0, 0, 0);

  return date;
}

// 日付をフォーマットする関数
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 性別をランダムに選択
function getRandomGender() {
  return Math.random() < 0.5 ? '男性' : '女性';
}

// 100個のランダムな生年月日を生成
const randomDates = [];
const usedDates = new Set();

for (let i = 0; i < 100; i++) {
  let date;
  let dateStr;

  // 重複を避ける
  do {
    date = generateRandomDate(1980, 2022);
    dateStr = formatDate(date);
  } while (usedDates.has(dateStr));

  usedDates.add(dateStr);

  randomDates.push({
    id: i + 1,
    date: dateStr,
    gender: getRandomGender(),
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  });
}

// ソート（生年月日でソート）
randomDates.sort((a, b) => {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
});

// JSONファイルとして保存
const fs = require('fs');
const output = {
  generated: new Date().toISOString(),
  total: 100,
  dates: randomDates
};

fs.writeFileSync(
  '/Users/kitamuratatsuhiko/UIanimated/accurate-logic/claudedocs/random_100_dates.json',
  JSON.stringify(output, null, 2),
  'utf8'
);

// 10個のグループに分割（各10件）
const groups = [];
for (let i = 0; i < 10; i++) {
  groups.push({
    groupId: i + 1,
    dates: randomDates.slice(i * 10, (i + 1) * 10)
  });
}

fs.writeFileSync(
  '/Users/kitamuratatsuhiko/UIanimated/accurate-logic/claudedocs/random_100_dates_groups.json',
  JSON.stringify(groups, null, 2),
  'utf8'
);

console.log('✅ 100個のランダムな生年月日を生成しました！');
console.log(`範囲: 1980年1月1日 〜 2022年12月31日`);
console.log(`保存先: /Users/kitamuratatsuhiko/UIanimated/accurate-logic/claudedocs/random_100_dates.json`);
console.log(`グループ分割: /Users/kitamuratatsuhiko/UIanimated/accurate-logic/claudedocs/random_100_dates_groups.json`);

// 最初の5件を表示
console.log('\n最初の5件:');
randomDates.slice(0, 5).forEach(d => {
  console.log(`  ${d.id}. ${d.date} (${d.gender})`);
});
