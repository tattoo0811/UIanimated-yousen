const { julian } = require('astronomia');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Standard formula used in Chinese astrology万年暦
// Based on a known reference date: 1900-01-01 = 庚子 (Stem 6, Branch 0)
// Or use the cycle starting point

function getDayPillar(year, month, day) {
    const jd = julian.CalendarGregorianToJD(year, month, day);

    // Method 1: Use the standard JD offset
    // The sexagenary cycle started on a known JD
    // JD 0 (Nov 24, 4713 BC, 12:00 UT in proleptic Julian calendar) 
    // We need to find what GanZhi corresponds to JD 0 or a known reference point

    // According to Chinese calendar calculations:
    // The formula is typically: (JD + offset) mod 60
    // Where offset aligns with a known reference date

    //知られている基準日: 2000-01-01 = 甲辰 (GanZhi #40, 0-indexed: 40)
    // JD(2000-01-01) = 2451544.5
    // #40 in 60-cycle (0-indexed) = Stem 0, Branch 4

    const jd2000 = 2451544.5;
    const ref_ganzhi = 40; // 甲辰 is the 41st (1-indexed) or 40th (0-indexed)

    const daysPassed = Math.floor(jd - jd2000);
    let ganzhi_index = (ref_ganzhi + daysPassed) % 60;
    if (ganzhi_index < 0) ganzhi_index += 60;

    // Convert to stem and branch
    let stem = ganzhi_index % 10;
    let branch = ganzhi_index % 12;
    if (stem < 0) stem += 10;
    if (branch < 0) branch += 12;

    return {
        ganZhi: `${STEMS[stem]}${BRANCHES[branch]}`,
        stem,
        branch,
        ganzhi_index
    };
}

// Test with known dates
const testCases = [
    { date: [2000, 1, 1], expected: '甲辰', expectedIndex: 40 },
    { date: [1983, 8, 11], expected: '丙午', expectedIndex: 42 },
    { date: [2024, 1, 1], expected: '庚辰', expectedIndex: 46 },
    { date: [1984, 2, 4], expected: '丙子', expectedIndex: 12 },
    { date: [2025, 11, 30], expected: '癸未', expectedIndex: 19 },
];

console.log('Testing Day Pillar with 60-cycle calculation:\n');

testCases.forEach(({ date, expected, expectedIndex }) => {
    const result = getDayPillar(...date);
    const match = result.ganZhi === expected;
    console.log(`${date.join('-')}: ${result.ganZhi} (expected: ${expected}) ${match ? '✓' : '✗'}`);
    console.log(`  GanZhi Index: ${result.ganzhi_index} (expected: ${expectedIndex})`);
    console.log(`  Stem: ${result.stem}, Branch: ${result.branch}`);
    console.log('');
});
