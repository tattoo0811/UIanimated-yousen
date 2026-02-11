/**
 * 朱学院のスクレイピング結果から四大主星と十二大従星を抽出
 */

const fs = require('fs');
const path = require('path');

// スクレイピング結果を読み込み
const results = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'shugakuin-results.json'), 'utf-8')
);

/**
 * 人体図のテーブルデータから星を抽出
 */
function extractStarsFromTable(structuredData) {
  // テーブル1が人体図のテーブル
  const bodyTable = structuredData.tables[1];

  if (!bodyTable || bodyTable.rows.length < 3) {
    return null;
  }

  // 人体図の構造:
  // 行1: [空, 頭(右上), 胸(中右), 腹(右下)]
  // 行2: [左手(中左), 胸(中央), 右手(右中)]
  // 行3: [左肩(下左), 左足(下中), 右足(下右)]

  const rows = bodyTable.rows;

  return {
    tenMajorStars: {
      head: rows[0][1] || '',           // 頭 (右上)
      chest: rows[1][1] || '',          // 胸 (中央)
      abdomen: rows[0][2] || '',        // 腹 (右下) - 注: 実際の配置を確認
      rightHand: rows[1][2] || '',      // 右手 (右中)
      leftHand: rows[1][0] || '',       // 左手 (中左)
    },
    twelveMinorStars: {
      leftShoulder: rows[2][0] || '',   // 左肩 (下左)
      leftFoot: rows[2][1] || '',       // 左足 (下中)
      rightFoot: rows[2][2] || '',      // 右足 (下右)
    }
  };
}

/**
 * 四柱推命データを抽出
 */
function extractFourPillars(structuredData) {
  // テーブル0が四柱推命のテーブル
  const fourPillarsTable = structuredData.tables[0];

  if (!fourPillarsTable || !fourPillarsTable.rows[0]) {
    return null;
  }

  const row = fourPillarsTable.rows[0];

  return {
    year: row[1] || '',   // 年柱
    month: row[2] || '',  // 月柱
    day: row[3] || '',    // 日柱
  };
}

/**
 * メイン処理
 */
const extractedData = results.map((result, index) => {
  console.log(`\nケース ${result.caseNumber} のデータを抽出中...`);

  const fourPillars = extractFourPillars(result.structuredData);
  const stars = extractStarsFromTable(result.structuredData);

  return {
    caseNumber: result.caseNumber,
    birthdate: result.birthdate,
    gender: result.gender,
    url: `https://www.shugakuin.co.jp/fate_calculation?ge=${result.gender === 'male' ? 1 : 2}&ye=${result.birthdate.split('/')[0]}&mo=${result.birthdate.split('/')[1]}&da=${result.birthdate.split('/')[2]}`,
    fourPillars,
    tenMajorStars: stars.tenMajorStars,
    twelveMinorStars: stars.twelveMinorStars,
  };
});

// 結果を表示
console.log('\n=== 抽出結果 ===');
extractedData.forEach(data => {
  console.log(`\nケース ${data.caseNumber}: ${data.birthdate} (${data.gender === 'male' ? '男性' : '女性'})`);
  console.log('四柱推命:');
  console.log(`  年柱: ${data.fourPillars.year}`);
  console.log(`  月柱: ${data.fourPillars.month}`);
  console.log(`  日柱: ${data.fourPillars.day}`);
  console.log('十大主星:');
  console.log(`  頭: ${data.tenMajorStars.head}`);
  console.log(`  胸: ${data.tenMajorStars.chest}`);
  console.log(`  腹: ${data.tenMajorStars.abdomen}`);
  console.log(`  右手: ${data.tenMajorStars.rightHand}`);
  console.log(`  左手: ${data.tenMajorStars.leftHand}`);
  console.log('十二大従星:');
  console.log(`  左肩: ${data.twelveMinorStars.leftShoulder}`);
  console.log(`  左足: ${data.twelveMinorStars.leftFoot}`);
  console.log(`  右足: ${data.twelveMinorStars.rightFoot}`);
});

// JSONファイルに保存
const outputPath = path.join(__dirname, 'shugakuin-extracted.json');
fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2), 'utf-8');
console.log(`\n抽出結果を ${outputPath} に保存しました`);
