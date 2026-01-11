const { julian } = require('astronomia');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Test multiple known dates to find the correct offset
const testCases = [
    { date: '1983-08-11', expected: '丙午' }, // User's test case
    { date: '2000-01-01', expected: '甲辰' }, // Y2K
    { date: '2024-01-01', expected: '庚辰' }, // Recent
    { date: '1984-02-04', expected: '丙子' }, // Leap year start
];

console.log('Testing JD formulas for Day Pillar:\n');

testCases.forEach(({ date, expected }) => {
    const [y, m, d] = date.split('-').map(Number);
    const jd = julian.CalendarGregorianToJD(y, m, d);

    console.log(`Date: ${date}`);
    console.log(`Expected: ${expected}`);
    console.log(`JD: ${jd}`);

    // Try different offsets
    for (let offset = 9; offset <= 15; offset++) {
        const s = ((Math.floor(jd) - offset) % 10 + 10) % 10;
        const b = ((Math.floor(jd) + 1) % 12 + 12) % 12;
        const result = `${STEMS[s]}${BRANCHES[b]}`;

        if (result === expected) {
            console.log(`✓ MATCH with offset ${offset}: ${result}`);
        }
    }
    console.log('');
});

// Also test the traditional formula
console.log('\nTesting with traditional offset -10:');
testCases.forEach(({ date, expected }) => {
    const [y, m, d] = date.split('-').map(Number);
    const jd = julian.CalendarGregorianToJD(y, m, d);

    const s = ((Math.floor(jd) - 10) % 10 + 10) % 10;
    const b = ((Math.floor(jd) + 1) % 12 + 12) % 12;
    const result = `${STEMS[s]}${BRANCHES[b]}`;

    console.log(`${date}: ${result} (expected: ${expected}) ${result === expected ? '✓' : '✗'}`);
});
