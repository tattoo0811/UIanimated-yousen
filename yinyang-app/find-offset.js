const { julian } = require('astronomia');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// The standard formula in many BaZi calculators:
// Stem = (JD - 11) % 10
// Branch = (JD - 3) % 12
// BUT we need to adjust for the .5 in JD

// Test both with floor and round
function testFormula(name, jd, expectedGZ, stemOffset, branchOffset) {
    const jdInt = Math.floor(jd + 0.5); // Round to nearest int
    const stem = ((jdInt - stemOffset) % 10 + 10) % 10;
    const branch = ((jdInt - branchOffset) % 12 + 12) % 12;
    const gz = STEMS[stem] + BRANCHES[branch];
    const match = gz === expectedGZ;
    console.log(`${name}: ${gz} (expected: ${expectedGZ}) ${match ? '✓' : '✗'} [Stem offset: ${stemOffset}, Branch offset: ${branchOffset}]`);
    return match;
}

const tests = [
    { date: [1983, 8, 11], expected: '辛未' },
    { date: [2000, 1, 1], expected: '甲辰' },
    { date: [2025, 11, 30], expected: '癸未' },
];

console.log('Testing different offset combinations:\n');

// Try various offset combinations
for (let stemOff = 9; stemOff <= 13; stemOff++) {
    for (let branchOff = 1; branchOff <= 5; branchOff++) {
        let allMatch = true;
        const results = tests.map(({ date, expected }) => {
            const jd = julian.CalendarGregorianToJD(...date);
            return testFormula(date.join('-'), jd, expected, stemOff, branchOff);
        });

        if (results.every(r => r)) {
            console.log(`\n✓✓✓ FOUND WORKING OFFSETS: Stem=${stemOff}, Branch=${branchOff} ✓✓✓\n`);
        }
    }
}
