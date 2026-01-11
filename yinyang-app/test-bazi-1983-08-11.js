// Test to verify BaZi calculation for 1983-08-11
const date = new Date(1983, 7, 11, 12, 0); // month is 0-indexed in JS Date

console.log('Testing BaZi calculation for 1983-08-11');
console.log('Date object:', date.toString());
console.log('Expected:');
console.log('  Year: 癸亥 (stem: 10/癸, branch: 12/亥)');
console.log('  Month: 庚申 (stem: 7/庚, branch: 9/申)');
console.log('  Day: 辛未 (stem: 8/辛, branch: 8/未)');
console.log();
console.log('If actual values differ, calculateBaZi has a bug');
