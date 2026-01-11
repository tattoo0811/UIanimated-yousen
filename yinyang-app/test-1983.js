const { julian, solar } = require('astronomia');

// 1983年8月11日のテスト
const date = new Date('1983-08-11T00:00:00+09:00');
const jd = julian.CalendarGregorianToJD(1983, 8, 11);

console.log('=== 1983年8月11日 診断テスト ===\n');
console.log('JD:', jd);

// Day Pillar with correct formula
const jd2000 = 2451544.5;
const ref_ganzhi_2000 = 40;
const daysPassed = Math.floor(jd - jd2000);
let ganzhi_index = (ref_ganzhi_2000 + daysPassed) % 60;
if (ganzhi_index < 0) ganzhi_index += 60;

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const dayStem = ganzhi_index % 10;
const dayBranch = ganzhi_index % 12;

console.log(`日柱: ${STEMS[dayStem]}${BRANCHES[dayBranch]} (期待値: 丙午)`);
console.log(`日干: ${STEMS[dayStem]} (index: ${dayStem})`);
console.log(`日支: ${BRANCHES[dayBranch]} (index: ${dayBranch})\n`);

// Year calculation (simplified - assumes birth after Lichun)
const year = 1983;
const yearStem = (year - 3 - 1) % 10;
const yearBranch = (year - 3 - 1) % 12;
console.log(`年柱: ${STEMS[(yearStem + 10) % 10]}${BRANCHES[(yearBranch + 12) % 12]}`);

// Solar longitude for month
const solarLon = solar.apparentLongitude(jd) * 180 / Math.PI;
const solarLonNorm = (solarLon + 360) % 360;
console.log(`太陽黄経: ${solarLonNorm.toFixed(2)}度`);

// Month branch from solar longitude
let monthBranchIdx = Math.floor(((solarLonNorm - 315 + 360) % 360) / 30) + 2;
monthBranchIdx = monthBranchIdx % 12;

// Month stem from year stem (Five Tigers)
const startStem = ((yearStem % 5) * 2 + 2) % 10;
const monthStem = (startStem + (monthBranchIdx - 2 + 12) % 12) % 10;

console.log(`月柱: ${STEMS[monthStem]}${BRANCHES[monthBranchIdx]}\n`);

// 十大主星のテスト
const TEN_STARS = [
    '貫索星', '石門星', // 比和 (Same)
    '鳳閣星', '調舒星', // 洩気 (Output: 我生)
    '禄存星', '司禄星', // 財星 (Wealth: 我剋)
    '車騎星', '牽牛星', // 官星 (Power: 剋我)
    '龍高星', '玉堂星'  // 印星 (Input: 生我)
];

function getElement(stemIdx) {
    return Math.floor(stemIdx / 2); // 0=Wood, 1=Fire, 2=Earth, 3=Metal, 4=Water
}

function getTenStar(dayStemIdx, targetStemIdx) {
    const dElem = getElement(dayStemIdx);
    const tElem = getElement(targetStemIdx);
    const dPol = dayStemIdx % 2;
    const tPol = targetStemIdx % 2;

    // Five element relationship
    const rel = (tElem - dElem + 5) % 5;
    const polMatch = dPol === tPol ? 0 : 1;
    const index = rel * 2 + polMatch;

    return TEN_STARS[index];
}

console.log('=== 十大主星 ===');
console.log(`年干 (${STEMS[(yearStem + 10) % 10]}): ${getTenStar(dayStem, (yearStem + 10) % 10)}`);
console.log(`月干 (${STEMS[monthStem]}): ${getTenStar(dayStem, monthStem)}`);
console.log(`日干 (${STEMS[dayStem]}): 自分`);
