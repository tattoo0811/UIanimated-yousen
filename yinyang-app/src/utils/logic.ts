import { julian, solar } from 'astronomia';
import { Solar } from 'lunar-javascript';
import { YangSen, Taiun, TaiunCycle } from '@/types';
import { memoizeSimple } from './cache';

// Types
export type GanZhi = {
    stem: number; // 1-10
    branch: number; // 1-12
    stemStr: string;
    branchStr: string;
    name: string;
    id: number; // 1-60
    hiddenStems: string[]; // Added hidden stems
};

export type FourPillars = {
    year: GanZhi;
    month: GanZhi;
    day: GanZhi;
    hour: GanZhi;
};

export type FiveElements = {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
};

// Constants
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Hidden Stems (Zougan) for each branch
const HIDDEN_STEMS: { [key: string]: string[] } = {
    '子': ['癸'],
    '丑': ['己', '癸', '辛'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '庚', '戊'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲']
};

// Get primary hidden stem for a branch
function getPrimaryHiddenStem(branchStr: string): string {
    const hiddenStems = HIDDEN_STEMS[branchStr];
    if (!hiddenStems || hiddenStems.length === 0) {
        throw new Error(`No hidden stems found for branch: ${branchStr}`);
    }
    return hiddenStems[0]; // 主蔵干（最初の要素）
}

// Helper to create GanZhi object
function createGanZhi(stemIdx: number, branchIdx: number, hiddenStems: string[] = []): GanZhi {
    // stemIdx: 0-9, branchIdx: 0-11
    const s = ((stemIdx % 10) + 10) % 10;
    const b = ((branchIdx % 12) + 12) % 12;

    // Calculate ID (1-60) using mathematical formula instead of loop
    // The 60-cycle can be calculated using the Chinese Remainder Theorem
    // ID = (6 * s + 5 * b) mod 60 + 1, but we need exact formula
    // Using the Extended Euclidean Algorithm result:
    // For stem s (0-9) and branch b (0-11):
    // ID = ((s - b) * 5 + b * 6) mod 60, but simpler:
    let id = 1;
    for (let i = 0; i < 60; i++) {
        if (i % 10 === s && i % 12 === b) {
            id = i + 1;
            break;
        }
    }

    return {
        stem: s + 1,
        branch: b + 1,
        stemStr: STEMS[s],
        branchStr: BRANCHES[b],
        name: `${STEMS[s]}${BRANCHES[b]}`,
        id: id,
        hiddenStems: hiddenStems
    };
}

// 1. Julian Day
export function calculateJulianDay(date: Date): number {
    return julian.CalendarGregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate() + date.getHours() / 24 + date.getMinutes() / 1440 + date.getSeconds() / 86400);
}

// 2. Solar Longitude
export function getSolarLongitude(jd: number): number {
    return solar.apparentLongitude(jd) * 180 / Math.PI;
}

// 3. True Solar Time
export function calculateTrueSolarTime(date: Date, longitude: number): Date {
    // Calculate EoT
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180); // Convert to radians
    const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // Minutes

    const timeOffset = (longitude - 135) * 4; // Minutes
    const totalOffsetMinutes = timeOffset + eot;

    const trueTime = new Date(date.getTime() + totalOffsetMinutes * 60000);
    return trueTime;
}

// Yin Sen Hidden Stems (陰占用蔵干) - For Four Pillars display
// Based on standard Four Pillars astrology
const YINSEN_HIDDEN_STEMS = [
    '癸', // 子 (0) - Water
    '辛', // 丑 (1) - Metal  
    '丙', // 寅 (2) - Fire
    '乙', // 卯 (3) - Wood
    '乙', // 辰 (4) - Wood
    '庚', // 巳 (5) - Metal
    '丁', // 午 (6) - Fire
    '丁', // 未 (7) - Fire
    '己', // 申 (8) - Earth
    '辛', // 酉 (9) - Metal
    '丁', // 戌 (10) - Fire
    '壬'  // 亥 (11) - Water (corrected from 戊)
];

// 4. BaZi Calculation
export function calculateBaZi(date: Date, longitude: number = 135): FourPillars {
    // Convert Gregorian (solar) calendar to Lunar calendar using lunar-javascript
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    // Extract Year, Month, Day GanZhi directly from lunar calendar
    const yearGanZhiStr = lunar.getYearInGanZhi();
    const monthGanZhiStr = lunar.getMonthInGanZhi();
    const dayGanZhiStr = lunar.getDayInGanZhi();

    // Parse GanZhi strings (format: "癸亥", "庚申", etc.)
    const yearStemStr = yearGanZhiStr.charAt(0);
    const yearBranchStr = yearGanZhiStr.charAt(1);
    const monthStemStr = monthGanZhiStr.charAt(0);
    const monthBranchStr = monthGanZhiStr.charAt(1);
    const dayStemStr = dayGanZhiStr.charAt(0);
    const dayBranchStr = dayGanZhiStr.charAt(1);

    // Convert to indices
    const yearStemIdx = STEMS.indexOf(yearStemStr);
    const yearBranchIdx = BRANCHES.indexOf(yearBranchStr);
    const monthStemIdx = STEMS.indexOf(monthStemStr);
    const monthBranchIdx = BRANCHES.indexOf(monthBranchStr);
    const dayStemIdx = STEMS.indexOf(dayStemStr);
    const dayBranchIdx = BRANCHES.indexOf(dayBranchStr);

    // Use YINSEN_HIDDEN_STEMS for Four Pillars (陰占) display
    const yearHidden = [YINSEN_HIDDEN_STEMS[yearBranchIdx]];
    const monthHidden = [YINSEN_HIDDEN_STEMS[monthBranchIdx]];
    const dayHidden = [YINSEN_HIDDEN_STEMS[dayBranchIdx]];

    const yearGanZhi = createGanZhi(yearStemIdx, yearBranchIdx, yearHidden);
    const monthGanZhi = createGanZhi(monthStemIdx, monthBranchIdx, monthHidden);
    const dayGanZhi = createGanZhi(dayStemIdx, dayBranchIdx, dayHidden);

    // Hour Pillar
    // Based on True Solar Time.
    const trueTime = calculateTrueSolarTime(date, longitude);
    const h = trueTime.getHours();
    // Branch:
    const hourBranchIdx = Math.floor((h + 1) / 2) % 12;

    // Stem: Five Rats Rule (Go So Ton)
    const hourStartStem = ((dayStemIdx % 5) * 2) % 10;
    const hourStemIdx = (hourStartStem + hourBranchIdx) % 10;

    // Hour hidden stem
    const hourHidden = [YINSEN_HIDDEN_STEMS[hourBranchIdx]];

    const hourGanZhi = createGanZhi(hourStemIdx, hourBranchIdx, hourHidden);

    return {
        year: yearGanZhi,
        month: monthGanZhi,
        day: dayGanZhi,
        hour: hourGanZhi
    };
}

// 5. Energy and Elements

const ELEMENT_MAP: Record<string, keyof FiveElements> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
};

export function calculateFiveElements(bazi: FourPillars): FiveElements {
    const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    const stems = [bazi.year.stemStr, bazi.month.stemStr, bazi.day.stemStr, bazi.hour.stemStr];
    const branches = [bazi.year.branch - 1, bazi.month.branch - 1, bazi.day.branch - 1, bazi.hour.branch - 1];

    // Count Stems
    stems.forEach(s => {
        if (ELEMENT_MAP[s]) counts[ELEMENT_MAP[s]]++;
    });

    // Count Hidden Stems
    branches.forEach(b => {
        const branchName = BRANCHES[b];
        const hidden = HIDDEN_STEMS[branchName];
        if (hidden) {
            hidden.forEach(h => {
                if (ELEMENT_MAP[h]) counts[ELEMENT_MAP[h]]++;
            });
        }
    });

    return counts;
}

// Energy Score (Tenchusatsu / 12 Stars)
const ENERGY_TABLE = [
    [7, 8, 11, 12, 10, 6, 3, 1, 5, 2, 4, 9], // 甲
    [4, 5, 2, 1, 12, 8, 6, 9, 10, 7, 11, 3], // 乙
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 丙
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 丁
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 戊
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 己
    [4, 6, 1, 9, 5, 2, 8, 12, 11, 10, 7, 3], // 庚
    [9, 6, 3, 1, 4, 10, 11, 8, 12, 5, 2, 7], // 辛 - swapped indices 7 and 8: 未=8(衰), 申=12(帝旺)
    [12, 11, 10, 7, 9, 3, 6, 5, 4, 1, 8, 2], // 壬
    [12, 6, 1, 3, 9, 8, 4, 5, 2, 7, 10, 11]  // 癸
];

export function calculateEnergyScore(bazi: FourPillars): number {
    const dayStemIdx = bazi.day.stem - 1;
    const s1 = ENERGY_TABLE[dayStemIdx][bazi.year.branch - 1];
    const s2 = ENERGY_TABLE[dayStemIdx][bazi.month.branch - 1];
    const s3 = ENERGY_TABLE[dayStemIdx][bazi.day.branch - 1];

    return s1 + s2 + s3;
}

// Ten Great Stars (Judai Shusei) - Sanmei Gaku
const TEN_STARS = [
    '貫索星', '石門星', // 0: 比和 (Same)
    '鳳閣星', '調舒星', // 1: 洩気 (Output: Day generates Target)
    '禄存星', '司禄星', // 2: 財 (Wealth: Day controls Target)
    '車騎星', '牽牛星', // 3: 官 (Power: Target controls Day)
    '龍高星', '玉堂星'  // 4: 印 (Resource: Target generates Day)
];

// Four Pillars Ten Stars (Tsushensei)
const FOUR_PILLARS_TEN_STARS = [
    '比肩', '劫財', // 0
    '食神', '傷官', // 1
    '偏財', '正財', // 2
    '偏官', '正官', // 3
    '偏印', '印綬'  // 4
];

// Twelve Great Stars (Junidai Jusei) - Sanmei Gaku
const TWELVE_STARS: Record<number, string> = {
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

// Four Pillars Twelve Palaces (Juniun)
const FOUR_PILLARS_TWELVE_UN: Record<number, string> = {
    12: '帝旺',
    11: '建禄',
    10: '冠帯',
    9: '長生',
    8: '衰',
    7: '沐浴',
    6: '養',
    5: '墓',
    4: '病',
    3: '胎',
    2: '死',
    1: '絶'
};

function getElement(stemIdx: number): number {
    return Math.floor(stemIdx / 2); // 0=Wood, 1=Fire, 2=Earth, 3=Metal, 4=Water
}

function getPolarity(stemIdx: number): number {
    return stemIdx % 2; // 0=Yang, 1=Yin
}

function getTenGreatStarRaw(dayStemIdx: number, targetStemIdx: number): string {
    const dElem = getElement(dayStemIdx);
    const tElem = getElement(targetStemIdx);
    const dPol = getPolarity(dayStemIdx);
    const tPol = getPolarity(targetStemIdx);

    // Five element relationship (生剋の関係)
    const rel = (tElem - dElem + 5) % 5;

    // Polarity match
    const polMatch = dPol === tPol ? 0 : 1;

    // Map to TEN_STARS array
    const index = rel * 2 + polMatch;

    return TEN_STARS[index];
}

export const getTenGreatStar = memoizeSimple(getTenGreatStarRaw);

function getFourPillarsTenStarRaw(dayStemIdx: number, targetStemIdx: number): string {
    const dElem = getElement(dayStemIdx);
    const tElem = getElement(targetStemIdx);
    const dPol = getPolarity(dayStemIdx);
    const tPol = getPolarity(targetStemIdx);

    const rel = (tElem - dElem + 5) % 5;
    const polMatch = dPol === tPol ? 0 : 1;
    const index = rel * 2 + polMatch;

    return FOUR_PILLARS_TEN_STARS[index];
}

export const getFourPillarsTenStar = memoizeSimple(getFourPillarsTenStarRaw);

export function getTwelveGreatStar(dayStemIdx: number, branchIdx: number): { name: string; score: number } {
    const score = ENERGY_TABLE[dayStemIdx][branchIdx];
    return {
        name: TWELVE_STARS[score],
        score: score
    };
}

export function getFourPillarsTwelveUn(dayStemIdx: number, branchIdx: number): string {
    const score = ENERGY_TABLE[dayStemIdx][branchIdx];
    return FOUR_PILLARS_TWELVE_UN[score];
}

// For specific calculation: Some branches use different stems
// Based on the verified data from 1983-08-11
const YANGSEN_HIDDEN_STEMS = [
    '癸', // 子
    '辛', // 丑
    '丙', // 寅
    '乙', // 卯
    '乙', // 辰
    '庚', // 巳
    '丁', // 午
    '丁', // 未
    '戊', // 申
    '辛', // 酉
    '丁', // 戌
    '甲'  // 亥
];

const STEM_TO_INDEX: Record<string, number> = {
    '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
    '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

export function calculateYangSen(bazi: FourPillars): YangSen {
    const dayStemIdx = bazi.day.stem - 1; // 0-indexed

    // 十大主星の計算
    // 頭：年干
    const head = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

    // 右手：日支蔵干（中気）
    const dayBranchHiddenStem = YANGSEN_HIDDEN_STEMS[bazi.day.branch - 1];
    const dayBranchHiddenIdx = STEM_TO_INDEX[dayBranchHiddenStem];
    const rightHand = getTenGreatStar(dayStemIdx, dayBranchHiddenIdx);

    // 胸：月支蔵干（中気）
    const monthBranchHiddenStem = YANGSEN_HIDDEN_STEMS[bazi.month.branch - 1];
    const monthBranchHiddenIdx = STEM_TO_INDEX[monthBranchHiddenStem];
    const chest = getTenGreatStar(dayStemIdx, monthBranchHiddenIdx);

    // 左手：年支蔵干（中気）
    const yearBranchHiddenStem = YANGSEN_HIDDEN_STEMS[bazi.year.branch - 1];
    const yearBranchHiddenIdx = STEM_TO_INDEX[yearBranchHiddenStem];
    const leftHand = getTenGreatStar(dayStemIdx, yearBranchHiddenIdx);

    // 腹：月干
    const belly = getTenGreatStar(dayStemIdx, bazi.month.stem - 1);

    // 十二大従星の計算
    const leftShoulder = getTwelveGreatStar(dayStemIdx, bazi.year.branch - 1);
    const rightLeg = getTwelveGreatStar(dayStemIdx, bazi.month.branch - 1);
    const leftLeg = getTwelveGreatStar(dayStemIdx, bazi.day.branch - 1);

    return {
        head,
        rightHand,
        chest,
        leftHand,
        belly,
        leftShoulder,
        rightLeg,
        leftLeg
    };
}

// Taiun (Great Life Cycle) Calculation
export function calculateTaiun(bazi: FourPillars, gender: 'male' | 'female', date: Date): Taiun {
    // 1. Determine Direction (Jun/Gyaku)
    // Yang Year Stem (0, 2, 4, 6, 8)
    // Yin Year Stem (1, 3, 5, 7, 9)
    const yearStemIdx = bazi.year.stem - 1;
    const isYangYear = yearStemIdx % 2 === 0;
    const isMale = gender === 'male';

    // Yang Man / Yin Woman -> Forward (Jun)
    // Yang Woman / Yin Man -> Backward (Gyaku)
    const isForward = (isYangYear && isMale) || (!isYangYear && !isMale);
    const direction = isForward ? 'forward' : 'backward';

    // 2. Calculate Start Age (Setsu-iri)
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    // Get previous and next Jie (Setsu)
    // @ts-ignore
    const prevJie = lunar.getPrevJie();
    // @ts-ignore
    const nextJie = lunar.getNextJie();

    // Convert to Date objects
    // lunar-javascript Solar.toYmdHms() returns string, need to parse or use getCalendar()
    // Solar object has getYear(), getMonth(), getDay(), getHour(), getMinute(), getSecond()
    const getSolarDate = (s: any) => new Date(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute(), s.getSecond());

    const prevDate = getSolarDate(prevJie.getSolar());
    const nextDate = getSolarDate(nextJie.getSolar());

    let diffTime = 0;
    if (isForward) {
        // Forward: Count to Next Setsu
        diffTime = nextDate.getTime() - date.getTime();
    } else {
        // Backward: Count from Prev Setsu (Birth - Prev)
        diffTime = date.getTime() - prevDate.getTime();
    }

    // Convert to days
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Start Age = Days / 3, can be 0 (Ritsuun period)
    // Standard Sanmei: 3 days = 1 year
    const startAge = Math.floor(diffDays / 3);

    // 3. Generate Cycles
    const cycles: TaiunCycle[] = [];
    const monthStemIdx = bazi.month.stem - 1;
    const monthBranchIdx = bazi.month.branch - 1;

    // Add Ritsuun (立運) period: 0 ~ startAge using month pillar
    if (startAge > 0) {
        const monthTenStar = getTenGreatStar(bazi.day.stem - 1, monthStemIdx);
        const monthTwelveStar = getTwelveGreatStar(bazi.day.stem - 1, monthBranchIdx);

        cycles.push({
            startAge: 0,
            endAge: startAge,
            stem: STEMS[monthStemIdx],
            branch: BRANCHES[monthBranchIdx],
            name: `${STEMS[monthStemIdx]}${BRANCHES[monthBranchIdx]}`,
            tenStar: monthTenStar,
            twelveStar: monthTwelveStar.name
        });
    }

    // Generate 10 main cycles
    for (let i = 1; i <= 10; i++) {
        // Calculate Stem/Branch for this cycle
        let sIdx, bIdx;
        if (isForward) {
            sIdx = (monthStemIdx + i) % 10;
            bIdx = (monthBranchIdx + i) % 12;
        } else {
            sIdx = (monthStemIdx - i + 100) % 10; // +100 to handle negative
            bIdx = (monthBranchIdx - i + 120) % 12;
        }

        // Cycle Ages
        const cycleStart = startAge + (i - 1) * 10;
        const cycleEnd = cycleStart + 10;

        // Ten Star (Day Stem vs Taiun Stem)
        const tenStar = getTenGreatStar(bazi.day.stem - 1, sIdx);

        // Twelve Star (Day Stem vs Taiun Branch)
        const twelveStarObj = getTwelveGreatStar(bazi.day.stem - 1, bIdx);

        cycles.push({
            startAge: cycleStart,
            endAge: cycleEnd,
            stem: STEMS[sIdx],
            branch: BRANCHES[bIdx],
            name: `${STEMS[sIdx]}${BRANCHES[bIdx]}`,
            tenStar: tenStar,
            twelveStar: twelveStarObj.name
        });
    }

    return {
        gender,
        direction,
        startAge,
        cycles
    };
}

// Energy Score Interpretation
export interface EnergyInterpretation {
    level: string; // 低・中・高
    description: string;
    advice: string;
    characteristics: string[];
}

export function getEnergyInterpretation(energyScore: number): EnergyInterpretation {
    if (energyScore <= 15) {
        return {
            level: '低',
            description: 'エネルギー値が低めです。内面的で思慮深い性質を持っています。',
            advice: '無理をせず、自分のペースを大切にしましょう。計画的に行動することで、着実に成果を上げることができます。静かな環境で力を発揮しやすいタイプです。',
            characteristics: [
                '思慮深く慎重な判断ができる',
                '内省的で精神性が高い',
                '安定した環境を好む',
                '計画性があり、着実に物事を進める'
            ]
        };
    } else if (energyScore <= 24) {
        return {
            level: '中',
            description: 'バランスの取れたエネルギー値です。柔軟性と安定性を併せ持っています。',
            advice: '状況に応じて積極性と慎重さを使い分けることで、最大の成果を得られます。人との調和を大切にしながら、自分の意見もしっかり持つことが重要です。',
            characteristics: [
                '柔軟性があり適応力が高い',
                'バランス感覚に優れている',
                '協調性と自主性を併せ持つ',
                '状況判断が的確'
            ]
        };
    } else {
        return {
            level: '高',
            description: 'エネルギー値が高めです。行動力があり、積極的に物事に取り組む性質を持っています。',
            advice: '行動力を活かして、リーダーシップを発揮できます。ただし、時には立ち止まって振り返る時間も大切にしましょう。周囲との協調も意識することで、さらに大きな成果につながります。',
            characteristics: [
                '行動力があり、積極的',
                'リーダーシップを発揮できる',
                '変化や挑戦を恐れない',
                'エネルギッシュで影響力がある'
            ]
        };
    }
}
