const { julian, solar } = require('astronomia');

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function getGanZhi(jd) {
    // Formula from logic.ts
    const jdInt = Math.floor(jd + 0.5); // Round to nearest integer? Or floor?
    // logic.ts uses: ((Math.floor(jdAtMidnight) - 11) % 10 + 10) % 10
    // Let's test both.

    const s = ((Math.floor(jd) - 11) % 10 + 10) % 10;
    const b = ((Math.floor(jd) + 1) % 12 + 12) % 12;
    return `${STEMS[s]}${BRANCHES[b]}`;
}

const date = new Date('1983-08-11T00:00:00+09:00'); // JST
const jd = julian.CalendarGregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());

console.log('Date:', date.toISOString());
console.log('JD (astronomia):', jd);
console.log('Calculated GanZhi:', getGanZhi(jd));

// Target: 丙午 (Bing Wu) -> Stem 2 (丙), Branch 6 (午)
// Stem: (JD - 11) % 10 = 2 => JD % 10 = 3.
// Branch: (JD + 1) % 12 = 6 => JD % 12 = 5.

console.log('Target: 丙午');
console.log('JD % 10:', Math.floor(jd) % 10);
console.log('JD % 12:', Math.floor(jd) % 12);
