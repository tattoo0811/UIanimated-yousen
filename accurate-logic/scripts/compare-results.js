/**
 * 自前ロジックの結果と朱学院の結果を比較
 */

const fs = require('fs').promises;
const path = require('path');

const OUR_LOGIC_FILE = path.join(__dirname, '../our_logic_results.json');
const SHUGAKUIN_FILE = path.join(__dirname, '../claudedocs/shugakuin_results.json');
const OUTPUT_FILE = path.join(__dirname, '../claudedocs/verification_report.json');

/**
 * 二つの文字列を比較（スペースや改行を無視）
 */
function compareStrings(str1, str2) {
  if (!str1 || !str2) return { match: str1 === str2, str1, str2 };
  const s1 = str1.trim().replace(/\s+/g, '');
  const s2 = str2.trim().replace(/\s+/g, '');
  return { match: s1 === s2, str1: s1, str2: s2 };
}

/**
 * 一件分のデータを比較
 */
function compareOneResult(ourResult, shugakuinResult) {
  const comparison = {
    id: ourResult.id,
    date: ourResult.date,
    gender: ourResult.gender,
    fourPillars: {
      year: { match: false, ours: null, shugakuin: null },
      month: { match: false, ours: null, shugakuin: null },
      day: { match: false, ours: null, shugakuin: null }
    },
    tenMajorStars: {
      head: { match: false, ours: null, shugakuin: null },
      chest: { match: false, ours: null, shugakuin: null },
      belly: { match: false, ours: null, shugakuin: null },
      rightHand: { match: false, ours: null, shugakuin: null },
      leftHand: { match: false, ours: null, shugakuin: null }
    },
    twelveMinorStars: {
      leftShoulder: { match: false, ours: null, shugakuin: null },
      leftLeg: { match: false, ours: null, shugakuin: null },
      rightLeg: { match: false, ours: null, shugakuin: null }
    },
    overall: { match: true, issues: [] }
  };

  // 四柱推命の比較
  if (ourResult.fourPillars && shugakuinResult.parsed?.fourPillars) {
    comparison.fourPillars.year = compareStrings(
      ourResult.fourPillars.year.name,
      shugakuinResult.parsed.fourPillars.year
    );
    comparison.fourPillars.month = compareStrings(
      ourResult.fourPillars.month.name,
      shugakuinResult.parsed.fourPillars.month
    );
    comparison.fourPillars.day = compareStrings(
      ourResult.fourPillars.day.name,
      shugakuinResult.parsed.fourPillars.day
    );
  }

  // 十大主星の比較
  if (ourResult.tenMajorStars && shugakuinResult.parsed?.tenMajorStars) {
    comparison.tenMajorStars.head = compareStrings(
      ourResult.tenMajorStars.head,
      shugakuinResult.parsed.tenMajorStars.head
    );
    comparison.tenMajorStars.chest = compareStrings(
      ourResult.tenMajorStars.chest,
      shugakuinResult.parsed.tenMajorStars.chest
    );
    comparison.tenMajorStars.belly = compareStrings(
      ourResult.tenMajorStars.belly,
      shugakuinResult.parsed.tenMajorStars.belly
    );
    comparison.tenMajorStars.rightHand = compareStrings(
      ourResult.tenMajorStars.rightHand,
      shugakuinResult.parsed.tenMajorStars.rightHand
    );
    comparison.tenMajorStars.leftHand = compareStrings(
      ourResult.tenMajorStars.leftHand,
      shugakuinResult.parsed.tenMajorStars.leftHand
    );
  }

  // 十二大従星の比較
  if (ourResult.twelveMinorStars && shugakuinResult.parsed?.twelveMinorStars) {
    comparison.twelveMinorStars.leftShoulder = compareStrings(
      ourResult.twelveMinorStars.leftShoulder.name,
      shugakuinResult.parsed.twelveMinorStars.leftShoulder
    );
    comparison.twelveMinorStars.leftLeg = compareStrings(
      ourResult.twelveMinorStars.leftLeg.name,
      shugakuinResult.parsed.twelveMinorStars.leftLeg
    );
    comparison.twelveMinorStars.rightLeg = compareStrings(
      ourResult.twelveMinorStars.rightLeg.name,
      shugakuinResult.parsed.twelveMinorStars.rightLeg
    );
  }

  // 全体の一致チェック
  const allChecks = [
    ...Object.values(comparison.fourPillars),
    ...Object.values(comparison.tenMajorStars),
    ...Object.values(comparison.twelveMinorStars)
  ];

  const mismatches = allChecks.filter(c => !c.match);
  comparison.overall.match = mismatches.length === 0;
  comparison.overall.issues = mismatches.map((c, i) => {
    // どのフィールドかを特定
    const field = getAllFields().find(f => {
      const val = getNestedValue(comparison, f);
      return val === c;
    });
    return {
      field: field || 'unknown',
      expected: c.str1 || c.ours,
      actual: c.str2 || c.shugakuin
    };
  });

  return comparison;
}

/**
 * ネストされたオブジェクトから値を取得
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * すべてのフィールドパスを取得
 */
function getAllFields() {
  return [
    'fourPillars.year',
    'fourPillars.month',
    'fourPillars.day',
    'tenMajorStars.head',
    'tenMajorStars.chest',
    'tenMajorStars.belly',
    'tenMajorStars.rightHand',
    'tenMajorStars.leftHand',
    'twelveMinorStars.leftShoulder',
    'twelveMinorStars.leftLeg',
    'twelveMinorStars.rightLeg'
  ];
}

/**
 * メイン関数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('検証比較開始');
  console.log('='.repeat(60));

  // データを読み込む
  console.log('\n📂 データを読み込み中...');
  const ourLogicData = JSON.parse(await fs.readFile(OUR_LOGIC_FILE, 'utf8'));
  const shugakuinData = JSON.parse(await fs.readFile(SHUGAKUIN_FILE, 'utf8'));
  console.log(`✅ 自前ロジック: ${ourLogicData.results.length}件`);
  console.log(`✅ 朱学院: ${shugakuinData.results.length}件`);

  // IDでマッピング
  const shugakuinMap = new Map(
    shugakuinData.results.map(r => [r.id, r])
  );

  // 各データを比較
  const comparisons = [];
  for (const ourResult of ourLogicData.results) {
    const shugakuinResult = shugakuinMap.get(ourResult.id);
    if (shugakuinResult) {
      const comparison = compareOneResult(ourResult, shugakuinResult);
      comparisons.push(comparison);

      if (!comparison.overall.match) {
        console.log(`  [ID:${ourResult.id}] ❌ ${comparison.overall.issues.length}件の不一致`);
        for (const issue of comparison.overall.issues) {
          console.log(`    - ${issue.field}: 期待=${issue.expected}, 実際=${issue.actual}`);
        }
      }
    }
  }

  // 集計
  const perfectMatch = comparisons.filter(c => c.overall.match).length;
  const hasMismatch = comparisons.filter(c => !c.overall.match).length;

  // フィールド別の不一致数を集計
  const fieldStats = {};
  for (const comparison of comparisons) {
    for (const issue of comparison.overall.issues) {
      if (!fieldStats[issue.field]) {
        fieldStats[issue.field] = 0;
      }
      fieldStats[issue.field]++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('比較結果');
  console.log('='.repeat(60));
  console.log(`✅ 完全一致: ${perfectMatch}/${comparisons.length} (${((perfectMatch / comparisons.length) * 100).toFixed(1)}%)`);
  console.log(`❌ 不一致あり: ${hasMismatch}/${comparisons.length} (${((hasMismatch / comparisons.length) * 100).toFixed(1)}%)`);

  if (Object.keys(fieldStats).length > 0) {
    console.log('\nフィールド別の不一致数:');
    for (const [field, count] of Object.entries(fieldStats)) {
      console.log(`  ${field}: ${count}件`);
    }
  }

  // 結果を保存
  const output = {
    generated: new Date().toISOString(),
    summary: {
      total: comparisons.length,
      perfectMatch,
      hasMismatch,
      matchRate: ((perfectMatch / comparisons.length) * 100).toFixed(1) + '%',
      fieldStats
    },
    comparisons
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n📁 結果を保存: ${OUTPUT_FILE}`);

  console.log('\n' + '='.repeat(60));
  if (perfectMatch === comparisons.length) {
    console.log('🎉 すべての検証に成功しました！');
  } else {
    console.log('⚠️  一致しない結果があります。詳細はレポートを確認してください。');
  }
  console.log('='.repeat(60));
}

// 実行
main().catch(error => {
  console.error('💥 ファイルエラー:', error);
  process.exit(1);
});
