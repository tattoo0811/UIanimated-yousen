// 60 GanZhi cycle
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Generate all 60 GanZhi combinations
const ganzhiCycle = [];
for (let i = 0; i < 60; i++) {
    const stem = STEMS[i % 10];
    const branch = BRANCHES[i % 12];
    ganzhiCycle.push({ index: i, name: stem + branch, stem: i % 10, branch: i % 12 });
}

// Find specific ganZhi
const searchGanZhi = ['甲辰', '丙午', '庚辰', '丙子', '癸未'];

console.log('60 GanZhi Cycle Lookup:\n');
searchGanZhi.forEach(gzName => {
    const found = ganzhiCycle.find(gz => gz.name === gzName);
    if (found) {
        console.log(`${gzName}: Index ${found.index}, Stem ${found.stem}, Branch ${found.branch}`);
    }
});

console.log('\n\nFirst 20 GanZhi:');
ganzhiCycle.slice(0, 20).forEach(gz => {
    console.log(`${gz.index}: ${gz.name}`);
});

console.log('\n\nAround index 40:');
ganzhiCycle.slice(38, 48).forEach(gz => {
    console.log(`${gz.index}: ${gz.name}`);
});
