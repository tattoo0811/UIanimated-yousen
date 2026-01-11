// Test the Ten Great Stars calculation for 1983-08-11
// According to standard Sanmei Gaku (算命学)

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Expected BaZi for 1983-08-11 (from web search):
// 年: 癸亥 (Year)
// 月: 庚申 (Month) - August is 7th month, corresponds to 申 in solar calendar
// 日: 辛未 (Day) - verified

// Day stem index: 7 (辛)
const dayStem = 7; // 辛

// Main hidden stems (元命)
const MAIN_HIDDEN = [
    '癸', // Rat
    '己', // Ox  
    '甲', // Tiger
    '乙', // Rabbit
    '戊', // Dragon
    '丙', // Snake
    '丁', // Horse
    '己', // Sheep
    '庚', // Monkey
    '辛', // Rooster
    '戊', // Dog
    '壬'  // Boar
];

// For 1983-08-11:
// Year branch: 亥 (11) -> Main: 壬
// Month branch: 申 (8) -> Main: 庚  
// Day branch: 未 (7) -> Main: 己

const yearBranch = 11; // 亥
const monthBranch = 8; // 申
const dayBranch = 7; // 未

const yearMainStem = STEMS.indexOf(MAIN_HIDDEN[yearBranch]); // 壬 = 8
const monthMainStem = STEMS.indexOf(MAIN_HIDDEN[monthBranch]); // 庚 = 6
const dayMainStem = STEMS.indexOf(MAIN_HIDDEN[dayBranch]); // 己 = 5

console.log('=== 1983-08-11 BaZi ===');
console.log('日干: 辛 (index 7)');
console.log('年支元命: 壬 (index 8)');
console.log('月支元命: 庚 (index 6)');
console.log('日支元命: 己 (index 5)');
console.log();

// Ten Great Stars based on Five Element relationships
// Element assignment: 0,1=Wood, 2,3=Fire, 4,5=Earth, 6,7=Metal, 8,9=Water
function getElement(stemIdx) {
    return Math.floor(stemIdx / 2);
}

function getRelationship(dayStem, targetStem) {
    const dElem = getElement(dayStem);
    const tElem = getElement(targetStem);

    // Five element cycle: Wood(0) -> Fire(1) -> Earth(2) -> Metal(3) -> Water(4) -> Wood
    // Relationship from day to target:
    // 0: Same (比和)
    // 1: Output/Child (洩気 - day generates target)
    // 2: Wealth (財 - day controls target)  
    // 3: Power (官 - target controls day)
    // 4: Resource (印 - target generates day)

    const rel = (tElem - dElem + 5) % 5;
    return rel;
}

function getPolarity(stemIdx) {
    return stemIdx % 2; // 0=Yang, 1=Yin
}

// Ten Stars mapping:
// rel=0: 貫索星(same pol), 石門星(diff pol)
// rel=1: 鳳閣星(same), 調舒星(diff)  
// rel=2: 禄存星(same), 司禄星(diff)
// rel=3: 車騎星(same), 牽牛星(diff)
// rel=4: 龍高星(same), 玉堂星(diff)

const TEN_STARS = [
    '貫索星', '石門星', // rel=0 (比和)
    '鳳閣星', '調舒星', // rel=1 (洩気)
    '禄存星', '司禄星', // rel=2 (財)
    '車騎星', '牽牛星', // rel=3 (官)
    '龍高星', '玉堂星'  // rel=4 (印)
];

function getTenStar(dayStem, targetStem) {
    const rel = getRelationship(dayStem, targetStem);
    const dPol = getPolarity(dayStem);
    const tPol = getPolarity(targetStem);
    const polDiff = dPol === tPol ? 0 : 1;

    return TEN_STARS[rel * 2 + polDiff];
}

console.log('=== Ten Great Stars Calculation ===');
console.log('Day Stem Element:', getElement(dayStem), '(Metal)');
console.log();

// Test each position
console.log('年支元命 (壬):', getTenStar(dayStem, yearMainStem));
console.log('月支元命 (庚):', getTenStar(dayStem, monthMainStem));
console.log('日支元命 (己):', getTenStar(dayStem, dayMainStem));
console.log();

// Also test with stems
const yearStem = 9; // 癸
const monthStem = 6; // 庚

console.log('年干 (癸):', getTenStar(dayStem, yearStem));
console.log('月干 (庚):', getTenStar(dayStem, monthStem));
