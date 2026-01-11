// 既知の正しい日柱のデータから基準日を計算する

const { julian } = require('astronomia');

// Web検索で確認された正しいデータ
const knownDates = [
    { date: [1983, 8, 11], day: '辛未', dayIndex: 7 },   //  Stem 7(辛), Branch 7(未)
    { date: [2000, 1, 1], day: '甲辰', dayIndex: 40 },   // Stem 0(甲), Branch 4(辰)
];

// Calculate what the "epoch" should be
knownDates.forEach(({ date, day, dayIndex }) => {
    const jd = julian.CalendarGregorianToJD(...date);
    console.log(`${date.join('-')}: ${day} (index ${dayIndex})`);
    console.log(`  JD: ${jd}`);
    console.log(`  JD (floored): ${Math.floor(jd)}`);
    console.log(`  JD (rounded): ${Math.floor(jd + 0.5)}`);

    // What would be the "epoch" JD where GanZhi index = 0 (甲子)?
    // If current date is index X at JD Y
    // Then index 0 was at JD (Y - X) or (Y - X + 60*k) for some k

    const jdFloored = Math.floor(jd + 0.5);
    const epochJD = jdFloored - dayIndex;
    console.log(`  Implied epoch JD (index 0): ${epochJD}`);
    console.log(`  Epoch date: JD ${epochJD} mod 60 = ${epochJD % 60}`);
    console.log('');
});

// See if they agree on an epoch
console.log('\n=== Checking consistency ===');
const jd1 = Math.floor(julian.CalendarGregorianToJD(1983, 8, 11) + 0.5);
const jd2 = Math.floor(julian.CalendarGregorianToJD(2000, 1, 1) + 0.5);

const epoch1 = jd1 - 7;   // 1983-08-11 is index 7
const epoch2 = jd2 - 40;  // 2000-01-01 is index 40

console.log('Epoch from 1983-08-11:', epoch1);
console.log('Epoch from 2000-01-01:', epoch2);
console.log('Difference:', epoch2 - epoch1);
console.log('Difference mod 60:', (epoch2 - epoch1) % 60);

// The difference mod 60 should be 0 if they're consistent
// Or (40 - 7) = 33 if we need to adjust

const daysBetween = jd2 - jd1;
console.log('\nDays between 1983-08-11 and 2000-01-01:', daysBetween);
console.log('Days mod 60:', daysBetween % 60);
console.log('Expected index change: 40 - 7 = 33');
console.log('Actual mod 60:', daysBetween % 60);
console.log('Match:', (daysBetween % 60) === 33);
