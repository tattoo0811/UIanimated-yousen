const { julian } = require('astronomia');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// More test cases with verified dates
const testCases = [
    { date: '1983-08-11', expected: '丙午', stem: 2, branch: 6 },
    { date: '2000-01-01', expected: '甲辰', stem: 0, branch: 4 },
    { date: '2024-01-01', expected: '庚辰', stem: 6, branch: 4 },
    { date: '1984-02-04', expected: '丙子', stem: 2, branch: 0 },
    { date: '2025-11-30', expected: '癸未', stem: 9, branch: 7 }, // Today
];

console.log('Finding correct offset for Stem calculation:\n');

// Test offset 15 for all cases
testCases.forEach(({ date, expected, stem: expectedStem, branch: expectedBranch }) => {
    const [y, m, d] = date.split('-').map(Number);
    const jd = julian.CalendarGregorianToJD(y, m, d);

    const s = ((Math.floor(jd) - 15) % 10 + 10) % 10;
    const b = ((Math.floor(jd) + 1) % 12 + 12) % 12;
    const result = `${STEMS[s]}${BRANCHES[b]}`;

    const match = (s === expectedStem && b === expectedBranch);
    console.log(`${date}: ${result} (expected: ${expected}) ${match ? '✓' : '✗'} - Stem: ${s}, Branch: ${b}`);
});

console.log('\n\nTesting Branch offset:\n');

// Test branch offset
testCases.forEach(({ date, expected, stem: expectedStem, branch: expectedBranch }) => {
    const [y, m, d] = date.split('-').map(Number);
    const jd = julian.CalendarGregorianToJD(y, m, d);

    const s = ((Math.floor(jd) - 15) % 10 + 10) % 10;

    for (let offset = -2; offset <= 4; offset++) {
        const b = ((Math.floor(jd) + offset) % 12 + 12) % 12;
        if (b === expectedBranch) {
            console.log(`${date}: Branch offset ${offset} works (${BRANCHES[b]})`);
        }
    }
});
