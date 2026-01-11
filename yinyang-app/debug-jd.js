const { julian } = require('astronomia');

// Debug JD calculation
const jd1983 = julian.CalendarGregorianToJD(1983, 8, 11);
const jd2000 = julian.CalendarGregorianToJD(2000, 1, 1);

console.log('JD 1983-08-11:', jd1983);
console.log('JD 2000-01-01:', jd2000);
console.log('Days difference:', jd1983 - jd2000);
console.log('Days difference (floored):', Math.floor(jd1983 - jd2000));

// Expected: 丙午 = index 42
// Reference: 甲辰 = index 40 at 2000-01-01
// 1983-08-11 is BEFORE 2000-01-01, so daysPassed is negative

const daysPassed = Math.floor(jd1983 - jd2000);
console.log('\nDays passed:', daysPassed);

let ganzhi_index = (40 + daysPassed) % 60;
console.log('GanZhi index (before fix):', ganzhi_index);

if (ganzhi_index < 0) ganzhi_index += 60;
console.log('GanZhi index (after fix):', ganzhi_index);

// Should be 42
console.log('\nExpected index: 42 (丙午)');
console.log('Difference:', ganzhi_index - 42);

// Let's calculate backwards
console.log('\n=== Reverse calculation ===');
// If we want index 42 from 40 (2000-01-01)
// We need daysPassed such that (40 + daysPassed) % 60 = 42
// or (40 + daysPassed) % 60 = 42 + 60*k for some k
// Since we're going backward, k should be negative

// From 1983-08-11 to 2000-01-01
const daysForward = Math.floor(jd2000 - jd1983);
console.log('Days from 1983 to 2000:', daysForward);

// If we start at index 42 (1983-08-11) and go forward daysForward days
// We should get index 40 (2000-01-01)
const check = (42 + daysForward) % 60;
console.log('Check: (42 + ' + daysForward + ') % 60 =', check);
console.log('Expected: 40');
console.log('Match:', check === 40);
