const { Solar } = require('lunar-javascript');
const date = new Date(1984, 11, 2, 12, 0); // Month is 0-indexed in JS Date
console.log('=== 1984年12月2日の四柱推命 ===');
console.log('Input Date:', date);

const solar = Solar.fromDate(date);
const lunar = solar.getLunar();

console.log('Year GanZhi:', lunar.getYearInGanZhi());
console.log('Month GanZhi:', lunar.getMonthInGanZhi());
console.log('Day GanZhi:', lunar.getDayInGanZhi());

// Calculate Day Pillar ID (1-60 cycle)
const dayGanZhi = lunar.getDayInGanZhi();
console.log('\nDay Pillar:', dayGanZhi);

// Map to ID
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const dayStem = dayGanZhi.charAt(0);
const dayBranch = dayGanZhi.charAt(1);
const stemIdx = STEMS.indexOf(dayStem);
const branchIdx = BRANCHES.indexOf(dayBranch);

console.log('Day Stem:', dayStem, '(index:', stemIdx, ')');
console.log('Day Branch:', dayBranch, '(index:', branchIdx, ')');

// Calculate ID (1-60)
let id = 1;
let ts = 0;
let tb = 0;
while (ts !== stemIdx || tb !== branchIdx) {
    ts = (ts + 1) % 10;
    tb = (tb + 1) % 12;
    id++;
}

console.log('\nCalculated Day Pillar ID:', id);
console.log('Expected Character Name:', dayGanZhi);
