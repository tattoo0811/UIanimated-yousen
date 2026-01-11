const { julian } = require('astronomia');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Use a different, more standard reference date
// The Chinese sexagenary cycle is fixed from ancient times
// Let's use the known cycle starting point

// According to standard texts, the cycle repeats every 60 days
// A known reference: 1900-01-01 is 庚子 (Geng Zi)
// 庚子 = index 36 (Stem 6, Branch 0)

const jd1900 = julian.CalendarGregorianToJD(1900, 1, 1);
console.log('JD 1900-01-01:', jd1900);
console.log('Expected: 庚子 (index 36)\n');

// Test dates
const tests = [
    { year: 1983, month: 8, day: 11, expected: '丙午', expectedIdx: 42 },
    { year: 2000, month: 1, day: 1, expected: '甲辰', expectedIdx: 40 },
    { year: 1900, month: 1, day: 1, expected: '庚子', expectedIdx: 36 },
];

tests.forEach(test => {
    const jd = julian.CalendarGregorianToJD(test.year, test.month, test.day);
    const days = Math.floor(jd - jd1900);

    let idx = (36 + days) % 60; // 36 is index of 庚子 at 1900-01-01
    if (idx < 0) idx += 60;

    const stem = idx % 10;
    const branch = idx % 12;
    const ganZhi = STEMS[stem] + BRANCHES[branch];

    console.log(`${test.year}-${test.month}-${test.day}:`);
    console.log(`  Days from 1900-01-01: ${days}`);
    console.log(`  Calculated: ${ganZhi} (index ${idx})`);
    console.log(`  Expected: ${test.expected} (index ${test.expectedIdx})`);
    console.log(`  Match: ${ganZhi === test.expected ? '✓' : '✗'}\n`);
});
