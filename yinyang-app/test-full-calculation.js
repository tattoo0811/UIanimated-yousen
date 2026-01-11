const { Solar } = require('lunar-javascript');
const charactersData = require('./src/data/characters.json');

// Simulate the same calculation as analyzeFate
const dateStr = '1984-12-02';
const timeStr = '12:00';
const [year, month, day] = dateStr.split('-').map(Number);
const [hours, minutes] = timeStr.split(':').map(Number);
const date = new Date(year, month - 1, day, hours, minutes);

console.log('=== Full Calculation Test ===');
console.log('Input Date:', date);

// Calculate BaZi using lunar-javascript
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();

const yearGanZhiStr = lunar.getYearInGanZhi();
const monthGanZhiStr = lunar.getMonthInGanZhi();
const dayGanZhiStr = lunar.getDayInGanZhi();

console.log('\nFour Pillars:');
console.log('Year:', yearGanZhiStr);
console.log('Month:', monthGanZhiStr);
console.log('Day:', dayGanZhiStr);

// Calculate Day Pillar ID
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const dayStemStr = dayGanZhiStr.charAt(0);
const dayBranchStr = dayGanZhiStr.charAt(1);
const dayStemIdx = STEMS.indexOf(dayStemStr);
const dayBranchIdx = BRANCHES.indexOf(dayBranchStr);

// Calculate ID (1-60)
let id = 1;
let ts = 0;
let tb = 0;
while (ts !== dayStemIdx || tb !== dayBranchIdx) {
    ts = (ts + 1) % 10;
    tb = (tb + 1) % 12;
    id++;
}

console.log('\nDay Pillar ID:', id);

// Find character
const character = charactersData.find(c => c.id === id);

if (!character) {
    console.error('ERROR: Character not found for ID:', id);
} else {
    console.log('\nCharacter Found:');
    console.log('ID:', character.id);
    console.log('Name:', character.name);
    console.log('Reading:', character.reading);
    console.log('Character Name:', character.character_name);
    console.log('\nConclusion: Character data exists and can be retrieved successfully!');
}
