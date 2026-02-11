/**
 * 検証結果のパターン分析
 */

const fs = require('fs').promises;

async function analyzePatterns() {
  const data = JSON.parse(
    await fs.readFile('/Users/kitamuratatsuhiko/UIanimated/accurate-logic/claudedocs/verification_report.json', 'utf8')
  );

  console.log('=== 四柱推命の不一致分析 ===\n');

  const pillarMismatch = data.comparisons.filter(c =>
    !c.fourPillars.year.match ||
    !c.fourPillars.month.match ||
    !c.fourPillars.day.match
  );

  console.log('四柱推命に不一致があるケース:', pillarMismatch.length, '件\n');

  // 不一致の詳細を表示
  pillarMismatch.slice(0, 10).forEach(c => {
    console.log('ID:', c.id, '日付:', c.date);
    if (!c.fourPillars.year.match) {
      console.log('  年柱: 期待=' + c.fourPillars.year.str2 + ', 実際=' + c.fourPillars.year.str1);
    }
    if (!c.fourPillars.month.match) {
      console.log('  月柱: 期待=' + c.fourPillars.month.str2 + ', 実際=' + c.fourPillars.month.str1);
    }
    if (!c.fourPillars.day.match) {
      console.log('  日柱: 期待=' + c.fourPillars.day.str2 + ', 実際=' + c.fourPillars.day.str1);
    }
    console.log('');
  });

  // 完全一致のケース
  const perfectMatch = data.comparisons.filter(c => c.overall.match);
  console.log('=== 完全一致のケース ===\n');
  console.log('件数:', perfectMatch.length, '件 /', data.comparisons.length, '件 (', (perfectMatch.length / data.comparisons.length * 100).toFixed(1), '%)\n');

  if (perfectMatch.length > 0) {
    console.log('完全一致のサンプル:');
    perfectMatch.slice(0, 5).forEach(c => {
      console.log('  ID:', c.id, '日付:', c.date);
    });
  }
}

analyzePatterns().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
