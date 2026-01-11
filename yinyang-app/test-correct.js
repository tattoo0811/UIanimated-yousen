const { julian } = require('astronomia');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Correct reference according to web search:
// 1983-08-11: 辛未 (Kanoto-Hitsuji) = index 7 (Stem 7辛, Branch 7未)
// 癸亥年 庚申月 辛未日

const testDates = [
    { date: [1983, 8, 11], expected: { year: '癸亥', month: '庚申', day: '辛未' } },
    { date: [2000, 1, 1], expected: { day: '甲辰' } },
];

// Let's find the correct reference
// 辛未 = index 7 (0-indexed: Stem 7,Branch 7)
const jd1983 = julian.CalendarGregorianToJD(1983, 8, 11);
const expected_index_1983 = 7; // 辛未

console.log('1983-08-11 JD:', jd1983);
console.log('Expected: 辛未 (index 7)\n');

// Try different reference dates to find the pattern
// If 1983-08-11 should be index 7, and 2000-01-01 should be index 40
const jd2000 = julian.CalendarGregorianToJD(2000, 1, 1);
const days_1983_to_2000 = Math.floor(jd2000 - jd1983);

console.log('Days from 1983-08-11 to 2000-01-01:', days_1983_to_2000);
const index_check = (7 + days_1983_to_2000) % 60;
console.log('If we start at index 7 and add', days_1983_to_2000, 'days:');
console.log('Result index:', index_check);
console.log('Expected: 40 (甲辰)');
console.log('Match:', index_check === 40, '\n');

// Now let's use 1983-08-11 as reference
testDates.forEach(({ date, expected }) => {
    const jd = julian.CalendarGregorianToJD(...date);
    const days = Math.floor(jd - jd1983);

    let idx = (7 + days) % 60;
    if (idx < 0) idx += 60;

    const stem = idx % 10;
    const branch = idx % 12;
    const ganZhi = STEMS[stem] + BRANCHES[branch];

    console.log(`${date.join('-')}:`);
    console.log(`  Days from 1983-08-11: ${days}`);
    console.log(`  Calculated day pillar: ${ganZhi} (index ${idx})`);
    console.log(`  Expected: ${expected.day}`);
    console.log(`  Match: ${ganZhi === expected.day ? '✓' : '✗'}\n`);
});
