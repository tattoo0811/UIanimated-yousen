// 1983-08-11のデータで詳細にテスト

const dayStem = 7; // 辛
const yearBranch = 11; // 亥 (0-indexed)
const monthBranch = 8; // 申 (0-indexed)
const dayBranch = 7; // 未 (0-indexed)

const yearStem = 9; // 癸
const monthStem = 6; // 庚

// 蔵干
const YANGSEN_HIDDEN_STEMS = [
    '癸', // 子 (0)
    '辛', // 丑 (1)
    '丙', // 寅 (2)
    '乙', // 卯 (3)
    '乙', // 辰 (4)
    '庚', // 巳 (5)
    '丁', // 午 (6)
    '丁', // 未 (7)
    '戊', // 申 (8)
    '辛', // 酉 (9)
    '丁', // 戌 (10)
    '甲'  // 亥 (11)
];

const STEM_TO_INDEX = {
    '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
    '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

console.log('=== BaZi Indices (0-indexed) ===');
console.log('Day Stem:', dayStem, '(辛)');
console.log('Year Branch:', yearBranch, '(亥)');
console.log('Month Branch:', monthBranch, '(申)');
console.log('Day Branch:', dayBranch, '(未)');
console.log('Year Stem:', yearStem, '(癸)');
console.log('Month Stem:', monthStem, '(庚)\n');

console.log('=== Hidden Stems ===');
console.log('Year Branch Hidden:', YANGSEN_HIDDEN_STEMS[yearBranch]);
console.log('Month Branch Hidden:', YANGSEN_HIDDEN_STEMS[monthBranch]);
console.log('Day Branch Hidden:', YANGSEN_HIDDEN_STEMS[dayBranch]);
console.log();

// 十大主星計算
const TEN_STARS = [
    '貫索星', '石門星', // 0: 比和
    '鳳閣星', '調舒星', // 1: 洩気
    '禄存星', '司禄星', // 2: 財
    '車騎星', '牽牛星', // 3: 官
    '龍高星', '玉堂星'  // 4: 印
];

function getElement(stemIdx) {
    return Math.floor(stemIdx / 2);
}

function getPolarity(stemIdx) {
    return stemIdx % 2;
}

function getTenStar(dayStemIdx, targetStemIdx, targetName) {
    const dElem = getElement(dayStemIdx);
    const tElem = getElement(targetStemIdx);
    const dPol = getPolarity(dayStemIdx);
    const tPol = getPolarity(targetStemIdx);

    const rel = (tElem - dElem + 5) % 5;
    const polMatch = dPol === tPol ? 0 : 1;
    const index = rel * 2 + polMatch;

    console.log(`${targetName}:`);
    console.log(`  Target: index ${targetStemIdx}, elem ${tElem}, pol ${tPol}`);
    console.log(`  Relation: ${rel}, Polarity: ${polMatch}, Index: ${index}`);
    console.log(`  Star: ${TEN_STARS[index]}`);

    return TEN_STARS[index];
}

console.log('=== Ten Great Stars ===');
console.log('Day: elem', getElement(dayStem), 'pol', getPolarity(dayStem));
console.log();

getTenStar(dayStem, yearStem, '頭（年干 癸）');
console.log('  Expected: 鳳閣星\n');

const dayHidden = STEM_TO_INDEX[YANGSEN_HIDDEN_STEMS[dayBranch]];
getTenStar(dayStem, dayHidden, '右手（日支蔵干 ' + YANGSEN_HIDDEN_STEMS[dayBranch] + '）');
console.log('  Expected: 車騎星\n');

const monthHidden = STEM_TO_INDEX[YANGSEN_HIDDEN_STEMS[monthBranch]];
getTenStar(dayStem, monthHidden, '胸（月支蔵干 ' + YANGSEN_HIDDEN_STEMS[monthBranch] + '）');
console.log('  Expected: 玉堂星\n');

const yearHidden = STEM_TO_INDEX[YANGSEN_HIDDEN_STEMS[yearBranch]];
getTenStar(dayStem, yearHidden, '左手（年支蔵干 ' + YANGSEN_HIDDEN_STEMS[yearBranch] + '）');
console.log('  Expected: 司禄星\n');

getTenStar(dayStem, monthStem, '腹（月干 庚）');
console.log('  Expected: 石門星\n');

// 十二大従星
const ENERGY_TABLE = [
    [7, 8, 11, 12, 10, 6, 3, 1, 5, 2, 4, 9], // 甲
    [4, 5, 2, 1, 12, 8, 6, 9, 10, 7, 11, 3], // 乙
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 丙
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 丁
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 戊
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 己
    [4, 6, 1, 9, 5, 2, 8, 12, 11, 10, 7, 3], // 庚
    [9, 6, 3, 1, 4, 10, 11, 12, 8, 5, 2, 7], // 辛 (corrected)
    [12, 11, 10, 7, 9, 3, 6, 5, 4, 1, 8, 2], // 壬
    [12, 6, 1, 3, 9, 8, 4, 5, 2, 7, 10, 11]  // 癸
];

const TWELVE_STARS = {
    12: '天将星',
    11: '天禄星',
    10: '天南星',
    9: '天貴星',
    8: '天堂星',
    7: '天恍星',
    6: '天印星',
    5: '天庫星',
    4: '天胡星',
    3: '天報星',
    2: '天極星',
    1: '天馳星'
};

console.log('\n=== Twelve Great Stars ===');
console.log('Day Stem:', dayStem, '(辛)');

const leftShoulderScore = ENERGY_TABLE[dayStem][yearBranch];
console.log('Left Shoulder (Year Branch', yearBranch, '亥):', TWELVE_STARS[leftShoulderScore], leftShoulderScore + '点');
console.log('  Expected: 天恍星');

const rightLegScore = ENERGY_TABLE[dayStem][monthBranch];
console.log('Right Leg (Month Branch', monthBranch, '申):', TWELVE_STARS[rightLegScore], rightLegScore + '点');
console.log('  Expected: 天堂星');

const leftLegScore = ENERGY_TABLE[dayStem][dayBranch];
console.log('Left Leg (Day Branch', dayBranch, '未):', TWELVE_STARS[leftLegScore], leftLegScore + '点');
console.log('  Expected: 天将星');
