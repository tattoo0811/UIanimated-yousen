const fs = require('fs');
const data = JSON.parse(fs.readFileSync('claudedocs/PERSONA-SHEETS.json', 'utf8'));

// 名前でグループ化
const nameGroups = {};
data.personas.forEach(p => {
    const cleanName = p.name.replace(/（再登場）/g, '').replace(/\s&\s.+$/, '').trim();
    if (!nameGroups[cleanName]) nameGroups[cleanName] = [];
    nameGroups[cleanName].push({ ep: p.episode, birth: p.birthDate, gender: p.gender });
});

// 重複している名前だけ表示
console.log('=== 名前の重複 ===');
Object.entries(nameGroups)
    .filter(([name, chars]) => chars.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([name, chars]) => {
        console.log(`${name}: ${chars.length}件`);
        chars.forEach(c => console.log(`  EP${c.ep} (${c.birth}, ${c.gender})`));
    });

// 年代別の名前カウント
console.log('\n=== 年代別キャラクター数 ===');
const ageGroups = {
    '10-20代': 0,
    '30代': 0,
    '40代': 0,
    '50代': 0,
    '60代以上': 0
};

data.personas.forEach(p => {
    const birthYear = parseInt(p.birthDate.split('-')[0]);
    const age = 2026 - birthYear;
    if (age < 30) ageGroups['10-20代']++;
    else if (age < 40) ageGroups['30代']++;
    else if (age < 50) ageGroups['40代']++;
    else if (age < 60) ageGroups['50代']++;
    else ageGroups['60代以上']++;
});

Object.entries(ageGroups).forEach(([group, count]) => {
    console.log(`${group}: ${count}名`);
});
