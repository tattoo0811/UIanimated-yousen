/**
 * 正解データから十大主星表を再構築
 */

// 正解データから推測される十大主星の組み合わせ
const knownCases = [
  { dayStem: '癸', targetStem: '庚', star: '司禄星' },  // 1983-08-11 腹
  { dayStem: '甲', targetStem: '乙', star: '司禄星' },  // 1984-12-02 腹
  { dayStem: '甲', targetStem: '庚', star: '禄存星' },  // 1984-12-02 頭
  { dayStem: '癸', targetStem: '辛', star: '鳳閣星' },  // 1983-08-11 頭
  { dayStem: '甲', targetStem: '?', star: '調舒星' },   // 1984-12-02 左手（年支の蔵干）
  { dayStem: '甲', targetStem: '?', star: '鳳閣星' },   // 1984-12-02 胸（月支の蔵干）
  { dayStem: '甲', targetStem: '?', star: '牽牛星' },   // 1984-12-02 右手（日支の蔵干）
];

// 朱学院の1980-01-24（日干=己）の結果
// 頭、胸、腹、右手がすべて調舒星、左手が禄存星
const jicolorCases = [
  { targetStem: '丙', star: '調舒星' },  // 年干→頭
  { targetStem: '丁', star: '調舒星' },  // 月干→胸
  { targetStem: '己', star: '調舒星' },  // 月支の蔵干（己）→腹
  { targetStem: '壬', star: '調舒星' },  // 日支の蔵干（壬）→右手
  { targetStem: '庚', star: '禄存星' },  // 年支の蔵干（庚）→左手
];

console.log('=== 十大主星表の再構築 ===\n');

console.log('【既知のケース】');
knownCases.forEach(c => {
  console.log(`  ${c.dayStem} × ${c.targetStem} = ${c.star}`);
});

console.log('\n【日干=己のケース（1980-01-24）】');
jicolorCases.forEach(c => {
  console.log(`  己 × ${c.targetStem} = ${c.star}`);
});

console.log('\n=== 分析 ===\n');
console.log('日干=己の場合：');
console.log('  己 × 丙 = 調舒星（水・陰）');
console.log('  己 × 丁 = 調舒星（水・陰）');
console.log('  己 × 己 = 調舒星（水・陰）');
console.log('  己 × 壬 = 調舒星（水・陰）');
console.log('  己 × 庚 = 禄存星（土・陽）');

console.log('\n五行関係から推測：');
console.log('  己（土・陰）× 丙（火・陽）→ 火生土 → 印 → 調舒星（水・陰）');
console.log('  己（土・陰）× 丁（火・陰）→ 火生土 → 印 → 調舒星（水・陰）');
console.log('  己（土・陰）× 己（土・陰）→ 比和 → 石門星（木・陰）ではなく調舒星？');
console.log('  己（土・陰）× 壬（水・陽）→ 土克水 → 財 → 禄存星（土・陽）ではなく調舒星？');
console.log('  己（土・陰）× 庚（金・陽）→ 土生金 → 洩気 → 鳳閣星（火・陽）ではなく禄存星？');

console.log('\n→ 現在の五行関係の計算が間違っている可能性があります！');

// 十大主星の標準パターン
console.log('\n=== 十大主星の標準パターン ===\n');
console.log('比和（木）: 貫索星（陽）、石門星（陰）');
console.log('洩気（火）: 鳳閣星（陽）、調舒星（陰）');
console.log('財（土）: 禄存星（陽）、司禄星（陰）');
console.log('官（金）: 車騎星（陽）、牽牛星（陰）');
console.log('印（水）: 龍高星（陽）、玉堂星（陰）');
