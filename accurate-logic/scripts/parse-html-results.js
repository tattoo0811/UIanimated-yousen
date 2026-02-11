/**
 * スクレイピングしたHTMLから四柱推命、十大主星、十二大従星を抽出
 */

const fs = require('fs').promises;
const path = require('path');

const HTML_DIR = path.join(__dirname, '../claudedocs/html');
const RESULTS_FILE = path.join(__dirname, '../claudedocs/random_100_dates.json');
const OUTPUT_FILE = path.join(__dirname, '../claudedocs/shugakuin_results.json');

/**
 * HTMLファイルからデータを抽出
 */
async function parseHtmlFile(htmlFilePath, id) {
  const html = await fs.readFile(htmlFilePath, 'utf8');

  // 簡易的なパーサーとして正規表現を使用
  const result = {
    id,
    success: false,
    fourPillars: null,
    tenMajorStars: null,
    twelveMinorStars: null,
    error: null
  };

  try {
    // 四柱推命を抽出
    const fourPillarsMatch = html.match(/<td class="result-eto"[^>]*data-id="([^"]+)"/g);
    if (fourPillarsMatch && fourPillarsMatch.length >= 3) {
      result.fourPillars = {
        year: fourPillarsMatch[0].match(/data-id="([^"]+)"/)[1],
        month: fourPillarsMatch[1].match(/data-id="([^"]+)"/)[1],
        day: fourPillarsMatch[2].match(/data-id="([^"]+)"/)[1]
      };
    }

    // 十大主星を抽出（人体図）
    const tenMajorStarsMatch = html.match(/<table class="result-table2">([\s\S]*?)<\/table>/);
    if (tenMajorStarsMatch) {
      const tableContent = tenMajorStarsMatch[1];
      const starMatches = tableContent.match(/<td[^>]*data-id="([^"]+)"/g);

      if (starMatches && starMatches.length >= 5) {
        // 人体図の構造:
        //   [0] 頭（中央上）: 鳳閣星
        //   [1] 左肩（右上）: 天恍星
        //   [2] 左手（左中）: 車輢星
        //   [3] 胸（中央）: 玉堂星
        //   [4] 右手（右中）: 司禄星
        //   [5] 腹（中央下）: 天堂星

        result.tenMajorStars = {
          head: starMatches[0].match(/data-id="([^"]+)"/)[1],
          leftShoulder: starMatches[1].match(/data-id="([^"]+)"/)[1],
          leftHand: starMatches[2].match(/data-id="([^"]+)"/)[1],
          chest: starMatches[3].match(/data-id="([^"]+)"/)[1],
          rightHand: starMatches[4].match(/data-id="([^"]+)"/)[1],
          belly: starMatches[5] ? starMatches[5].match(/data-id="([^"]+)"/)[1] : null
        };
      }
    }

    // 十二大従星を抽出（年齢別テーブル）
    // 年齢ごとのテーブルを検索
    const minorStarPattern = /<td>(\d+)<\/td>\s*<td[^>]*data-id="[^"]+"[^>]*>[^<]*<\/td>\s*<td[^>]*data-id="([^"]+)"[^>]*>[^<]*<\/td>\s*<td[^>]*data-id="([^"]+)"[^>]*>[^<]*<\/td>/g;

    const twelveMinorStars = [];
    let match;
    while ((match = minorStarPattern.exec(html)) !== null) {
      twelveMinorStars.push({
        age: parseInt(match[1]),
        tenMajorStar: match[2],
        twelveMinorStar: match[3]
      });
    }

    // 左肩、左足、右足の星を特定
    // 左肩 = 人体図の右上
    // 左足 = 通常12歳 or 最初の年齢
    // 右足 = 通常42歳 or 中間の年齢
    if (twelveMinorStars.length > 0) {
      const leftShoulder = result.tenMajorStars?.leftShoulder || null;
      const leftLeg = twelveMinorStars[0]?.twelveMinorStar || null;
      const rightLeg = twelveMinorStars.find(s => s.age === 42)?.twelveMinorStar ||
                       twelveMinorStars[Math.floor(twelveMinorStars.length / 2)]?.twelveMinorStar ||
                       null;

      result.twelveMinorStars = {
        leftShoulder,
        leftLeg,
        rightLeg,
        allAges: twelveMinorStars
      };
    }

    result.success = true;
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

/**
 * メイン関数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('HTML解析開始');
  console.log('='.repeat(60));

  // 元データを読み込む
  console.log('\n📂 元データを読み込み中...');
  const rawData = await fs.readFile(RESULTS_FILE, 'utf8');
  const inputData = JSON.parse(rawData);
  console.log(`✅ ${inputData.dates.length}件のデータを読み込み`);

  // 各HTMLファイルを解析
  const results = [];
  for (const dateData of inputData.dates) {
    const htmlFile = path.join(HTML_DIR, `random_${dateData.id}.html`);

    try {
      const parsed = await parseHtmlFile(htmlFile, dateData.id);
      results.push({
        ...dateData,
        parsed
      });
      console.log(`  [ID:${dateData.id}] ${parsed.success ? '✅' : '❌'} ${parsed.error || ''}`);
    } catch (error) {
      results.push({
        ...dateData,
        parsed: {
          id: dateData.id,
          success: false,
          error: error.message
        }
      });
      console.log(`  [ID:${dateData.id}] ❌ エラー: ${error.message}`);
    }
  }

  // 成功数を集計
  const successCount = results.filter(r => r.parsed.success).length;
  const failureCount = results.filter(r => !r.parsed.success).length;

  console.log('\n' + '='.repeat(60));
  console.log('集計結果');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount}/${inputData.dates.length}`);
  console.log(`❌ 失敗: ${failureCount}/${inputData.dates.length}`);

  // 結果を保存
  const output = {
    generated: new Date().toISOString(),
    summary: {
      total: inputData.dates.length,
      success: successCount,
      failure: failureCount,
      successRate: ((successCount / inputData.dates.length) * 100).toFixed(1) + '%'
    },
    results
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n📁 結果を保存: ${OUTPUT_FILE}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ 解析完了');
  console.log('='.repeat(60));
}

// 実行
main().catch(error => {
  console.error('💥 ファイルエラー:', error);
  process.exit(1);
});
