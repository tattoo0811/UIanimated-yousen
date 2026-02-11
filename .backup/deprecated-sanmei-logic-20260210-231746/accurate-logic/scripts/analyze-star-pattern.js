/**
 * 正解データから十大主星表のパターンを分析
 */

// 正解データ
const knownData = [
  // 1983-08-11: 日干=癸
  { date: '1983-08-11', dayStem: '癸', yearStem: '辛', monthStem: '庚',
    head: '鳳閣星', chest: '玉堂星', belly: '司禄星',
    rightHand: '車輪星', leftHand: '石門星' },

  // 1984-12-02: 日干=甲
  { date: '1984-12-02', dayStem: '甲', yearStem: '庚', monthStem: '乙',
    head: '禄存星', chest: '鳳閣星', belly: '司禄星',
    rightHand: '牽牛星', leftHand: '調舒星' },

  // 1980-01-24: 日干=己
  { date: '1980-01-24', dayStem: '己', yearStem: '丙', monthStem: '丁',
    head: '調舒星', chest: '調舒星', belly: '調舒星',
    rightHand: '調舒星', leftHand: '禄存星' },
];

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

console.log('=== 十大主星表の正解データ分析 ===\n');

knownData.forEach(data => {
  console.log(`【${data.date}】日干=${data.dayStem}`);
  console.log(`  頭（${data.dayStem}×${data.yearStem}）: ${data.head}`);
  console.log(`  胸（${data.dayStem}×${data.monthStem}）: ${data.chest}`);
  console.log(`  腹（${data.dayStem}×月干）: ${data.belly}`);
  console.log(`  右手: ${data.rightHand}`);
  console.log(`  左手: ${data.leftHand}`);
  console.log('');
});

// 日干ごとのマッピングを作成
console.log('=== 日干ごとの十大主星（頭＝日干×年干）===\n');

const stemIndex = { '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4, '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9 };

// 日干=癸の行
console.log('【日干=癸（行9）】');
console.log(`  × 辛(7) = 鳳閣星`);
console.log(`  × 庚(6) = 司禄星（腹）`);

// 日干=甲の行
console.log('\n【日干=甲（行0）】');
console.log(`  × 庚(6) = 禄存星（頭）`);
console.log(`  × 乙(1) = 司禄星（腹）`);
console.log(`  × ?(?) = 調舒星（左手）`);
console.log(`  × ?(?) = 鳳閣星（胸）`);
console.log(`  × ?(?) = 牽牛星（右手）`);

// 日干=己の行
console.log('\n【日干=己（行5）】');
console.log(`  × 丙(2) = 調舒星（頭）`);
console.log(`  × 丁(3) = 調舒星（胸）`);
console.log(`  × 己(5) = 調舒星（腹、月支の蔵干）`);
console.log(`  × 壬(8) = 調舒星（右手、日支の蔵干）`);
console.log(`  × 庚(6) = 禄存星（左手、年支の蔵干）`);

console.log('\n=== 分析 ===\n');
console.log('1. 日干=己の場合、ほとんどの天干との組み合わせで「調舒星」になる');
console.log('2. 日干=己×庚のみ「禄存星」になる');
console.log('3. 日干=甲×庚は「禄存星」');
console.log('4. 日干=癸×辛は「鳳閣星」');
console.log('5. 日干=癸×庚は「司禄星」');
console.log('6. 日干=甲×乙は「司禄星」');

console.log('\n→ 現在のyangsen.tsのテーブルと比較して修正が必要');
