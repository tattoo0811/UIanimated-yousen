/**
 * 正解データから蔵干を逆算
 *
 * 十大主星表から、正解の星になる組み合わせを探す
 */

// 朱学院の十大主星表
const tenMajorStarsTable = [
  // 甲    乙    丙    丁    戊    己    庚    辛    壬    癸  <- 対象天干
  ['司禄星','鳳閣星','鳳閣星','調舒星','禄存星','司禄星','禄存星','車騎星','龍高星','牽牛星'], // 甲
  ['石門星','貫索星','調舒星','鳳閣星','司禄星','禄存星','牽牛星','車騎星','玉堂星','龍高星'], // 乙
  ['鳳閣星','調舒星','貫索星','石門星','禄存星','司禄星','車騎星','牽牛星','龍高星','玉堂星'], // 丙
  ['調舒星','鳳閣星','石門星','貫索星','司禄星','禄存星','牽牛星','車騎星','玉堂星','龍高星'], // 丁
  ['禄存星','司禄星','鳳閣星','調舒星','貫索星','石門星','車騎星','牽牛星','龍高星','玉堂星'], // 戊
  ['調舒星','調舒星','調舒星','調舒星','調舒星','調舒星','禄存星','調舒星','調舒星','調舒星'], // 己
  ['車騎星','牽牛星','龍高星','玉堂星','禄存星','司禄星','貫索星','石門星','鳳閣星','調舒星'], // 庚
  ['牽牛星','車騎星','玉堂星','龍高星','司禄星','禄存星','石門星','貫索星','調舒星','鳳閣星'], // 辛
  ['龍高星','玉堂星','貫索星','石門星','禄存星','司禄星','車騎星','牽牛星','鳳閣星','調舒星'], // 壬
  ['車騎星','龍高星','司禄星','石門星','司禄星','司禄星','玉堂星','鳳閣星','石門星','貫索星'], // 癸
];

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/**
 * 日干と目的星から、必要な対象天干を全て列挙
 */
function findRequiredStems(dayStem, targetStar) {
  const dayStemIdx = STEMS.indexOf(dayStem);
  const result = [];

  for (let targetStemIdx = 0; targetStemIdx < 10; targetStemIdx++) {
    const star = tenMajorStarsTable[dayStemIdx][targetStemIdx];
    if (star === targetStar) {
      result.push(STEMS[targetStemIdx]);
    }
  }

  return result;
}

// テストケース
const testCases = [
  {
    label: '1983-08-11',
    dayStem: '癸',
    leftHandExpected: '車騎星',
    rightHandExpected: '司禄星',
    dayBranch: '亥',
    yearBranch: '未',
    month: 8
  },
  {
    label: '1980-01-24',
    dayStem: '己',
    leftHandExpected: '禄存星',
    rightHandExpected: '調舒星',
    dayBranch: '未',
    yearBranch: '申',
    month: 1
  }
];

testCases.forEach(({ label, dayStem, leftHandExpected, rightHandExpected, dayBranch, yearBranch, month }) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`【${label}】日干=${dayStem}, 月=${month}`);
  console.log(`${'='.repeat(60)}`);

  console.log('\n【左手】日支の蔵干（正解=' + leftHandExpected + '）');
  const leftRequired = findRequiredStems(dayStem, leftHandExpected);
  console.log(`  ${dayStem}×? = ${leftHandExpected}`);
  console.log(`  必要な天干: ${leftRequired.join(' または ')}`);
  console.log(`  → 日支(${dayBranch})の${month}月目の蔵干は、どれかであるべき`);

  console.log('\n【右手】年支の蔵干（正解=' + rightHandExpected + '）');
  const rightRequired = findRequiredStems(dayStem, rightHandExpected);
  console.log(`  ${dayStem}×? = ${rightHandExpected}`);
  console.log(`  必要な天干: ${rightRequired.join(' または ')}`);
  console.log(`  → 年支(${yearBranch})の${month}月目の蔵干は、どれかであるべき`);

  console.log('\n【分析】');
  if (leftRequired.length === 1) {
    console.log(`  左手: ${dayBranch}の${month}月目の蔵干は「${leftRequired[0]}」であるべき`);
  } else {
    console.log(`  左手: ${dayBranch}の${month}月目の蔵干は[${leftRequired.join(', ')}]のどれか`);
  }

  if (rightRequired.length === 1) {
    console.log(`  右手: ${yearBranch}の${month}月目の蔵干は「${rightRequired[0]}」であるべき`);
  } else {
    console.log(`  右手: ${yearBranch}の${month}月目の蔵干は[${rightRequired.join(', ')}]のどれか`);
  }
});
