/**
 * 庚(6)の行の正しい値を推定
 */

describe('庚の行分析', () => {
  it('値の配置パターンを分析', () => {
    console.log('\n=== 庚(6)の行分析 ===\n');

    const current = [4, 6, 1, 9, 5, 2, 8, 12, 11, 10, 7, 3];
    const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    console.log('現在の配列:');
    current.forEach((val, idx) => {
      console.log(`  [${idx}] ${BRANCHES[idx]}: ${val}`);
    });
    console.log('');

    // 既知の修正
    const knownCorrections = [
      { idx: 0, branch: '子', current: 4, correct: 2 },
      { idx: 6, branch: '午', current: 8, correct: 4 },
      { idx: 11, branch: '亥', current: 3, correct: 7 }
    ];

    console.log('既知の修正:');
    knownCorrections.forEach(corr => {
      console.log(`  [${corr.idx}] ${corr.branch}: ${corr.current} → ${corr.correct}`);
    });
    console.log('');

    // 値の位置マッピング
    const valueToPosition: Record<number, number> = {};
    current.forEach((val, idx) => {
      valueToPosition[val] = idx;
    });

    console.log('移動する値の追跡:');
    knownCorrections.forEach(corr => {
      const currentPosOfCorrectValue = valueToPosition[corr.correct];
      const currentValAtTargetPos = corr.current;
      const posOfCurrentVal = valueToPosition[currentValAtTargetPos];

      console.log(`  ${corr.branch}(${corr.idx})に${corr.correct}が必要:`);
      console.log(`    値${corr.correct}は現在位置${currentPosOfCorrectValue}(${BRANCHES[currentPosOfCorrectValue]})にある`);
      console.log(`    位置${corr.idx}には現在値${currentValAtTargetPos}があり、値${currentValAtTargetPos}は位置${posOfCurrentVal}に移動すべき？`);
    });
    console.log('');

    // 循環パターンの検出
    console.log('値の移動パターン:');
    console.log('  値2: 位置5(巳) → 位置0(子)');
    console.log('  値4: 位置0(子) → 位置6(午)');
    console.log('  値7: 位置10(戌) → 位置11(亥)');
    console.log('');

    // 推測：複数の値が循環している可能性
    console.log('仮説1: 3つの独立した交換');
    console.log('  [0]↔[5]: 4↔2');
    console.log('  [6]↔[0]: 8↔4 (ただし[0]はすでに2になっている)');
    console.log('  [10]↔[11]: 7↔3');
    console.log('');

    // 修正を試行
    const attempt1 = [...current];
    // [0]と[5]を交換
    [attempt1[0], attempt1[5]] = [attempt1[5], attempt1[0]]; // [2, 6, 1, 9, 5, 4, ...]
    // [6]と新しい[5]を交換
    [attempt1[6], attempt1[5]] = [attempt1[5], attempt1[6]]; // [2, 6, 1, 9, 5, 8, 4, ...]
    // [10]と[11]を交換
    [attempt1[10], attempt1[11]] = [attempt1[11], attempt1[10]]; // [..., 3, 7]

    console.log('修正試行1:');
    console.log(`  [${attempt1.join(', ')}]`);
    console.log('  検証:');
    console.log(`    [0] 子: ${attempt1[0]} (期待: 2) ${attempt1[0] === 2 ? '✅' : '❌'}`);
    console.log(`    [6] 午: ${attempt1[6]} (期待: 4) ${attempt1[6] === 4 ? '✅' : '❌'}`);
    console.log(`    [11] 亥: ${attempt1[11]} (期待: 7) ${attempt1[11] === 7 ? '✅' : '❌'}`);
    console.log('');

    // すべての値が1-12で一意か確認
    const values = new Set(attempt1);
    const allUnique = values.size === 12 && attempt1.every(v => v >= 1 && v <= 12);
    console.log(`  すべての値が1-12で一意: ${allUnique ? '✅' : '❌'}`);

    if (allUnique) {
      console.log('\n=== 推奨される修正 ===');
      console.log('庚(6)の行を以下に修正:');
      console.log(`[${attempt1.join(', ')}]`);
    }

    expect(attempt1[0]).toBe(2);
    expect(attempt1[6]).toBe(4);
    expect(attempt1[11]).toBe(7);
  });
});
