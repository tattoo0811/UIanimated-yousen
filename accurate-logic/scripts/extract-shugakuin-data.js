/**
 * 朱学院サイトから取得したHTMLを解析して、
 * 四柱推命データを抽出するスクリプト
 */

const fs = require('fs').promises;
const path = require('path');

const HTML_DIR = path.join(__dirname, '../claudedocs/html');
const OUTPUT_FILE = path.join(__dirname, '../claudedocs/shugakuin_extracted_data.json');

/**
 * HTMLから四柱推命データを抽出
 */
function extractDataFromHTML(html, id) {
  // 結果ページに遷移していない場合のチェック
  if (!html.includes('運命鑑定結果') && !html.includes('命式')) {
    return {
      id,
      success: false,
      error: 'No result data found'
    };
  }

  const result = {
    id,
    success: true,
    data: {}
  };

  try {
    // ページテキストを取得
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // 日干を抽出
    const nikkanMatch = text.match(/日干[：:]\s*([甲乙丙丁戊己庚辛壬癸])/);
    if (nikkanMatch) {
      result.data.nikkan = nikkanMatch[1];
    }

    // 日支を抽出
    const nitchiMatch = text.match(/日支[：:]\s*([子丑寅卯辰巳午未申酉戌亥])/);
    if (nitchiMatch) {
      result.data.nitchi = nitchiMatch[1];
    }

    // 月柱を抽出
    const gesshuMatch = text.match(/月柱[：:]\s*([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/);
    if (gesshuMatch) {
      result.data.gesshu = {
        kan: gesshuMatch[1],
        shi: gesshuMatch[2]
      };
    }

    // 年柱を抽出
    const nenshuMatch = text.match(/年柱[：:]\s*([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/);
    if (nenshuMatch) {
      result.data.nenshu = {
        kan: nenshuMatch[1],
        shi: nenshuMatch[2]
      };
    }

    // 時柱を抽出
    const jishuMatch = text.match(/時柱[：:]\s*([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/);
    if (jishuMatch) {
      result.data.jishu = {
        kan: jishuMatch[1],
        shi: jishuMatch[2]
      };
    }

    // 十二大従星を抽出
    const juunishiMatch = text.match(/十二大従星[：:]\s*([^\s]+)/);
    if (juunishiMatch) {
      result.data.juunishi = juunishiMatch[1];
    }

    // 本命星を抽出
    const honmeiseiMatch = text.match(/本命星[：:]\s*([^\s]+)/);
    if (honmeiseiMatch) {
      result.data.honmeisei = honmeiseiMatch[1];
    }

    // 月宿を抽出
    const genshuMatch = text.match(/月宿[：:]\s*([^\s]+)/);
    if (genshuMatch) {
      result.data.genshu = genshuMatch[1];
    }

    // 日宿を抽出
    const nisshukuMatch = text.match(/日宿[：:]\s*([^\s]+)/);
    if (nisshukuMatch) {
      result.data.nisshuku = nisshukuMatch[1];
    }

    // 通変星を抽出（すべての通変星）
    const tsuhenMatches = text.matchAll(/通変星[：:]\s*([^\s]+)/g);
    if (tsuhenMatches) {
      result.data.tsuhen = Array.from(tsuhenMatches).map(m => m[1]);
    }

    // 十二運星を抽出（すべての十二運星）
    const juniunMatches = text.matchAll(/十二運[：:]\s*([^\s]+)/g);
    if (juniunMatches) {
      result.data.juniun = Array.from(juniunMatches).map(m => m[1]);
    }

    // 五行を抽出
    const gogyoMatch = text.match(/五行[：:]\s*([^\s]+)/);
    if (gogyoMatch) {
      result.data.gogyo = gogyoMatch[1];
    }

    // 陰陽を抽出
    const inyoMatch = text.match(/陰陽[：:]\s*([陰陽])/);
    if (inyoMatch) {
      result.data.inyo = inyoMatch[1];
    }

    // テキスト全体も保存（後で詳細分析用）
    result.data.fullText = text.substring(0, 10000); // 最初の10000文字

  } catch (error) {
    result.success = false;
    result.error = error.message;
  }

  return result;
}

/**
 * メイン処理
 */
async function main() {
  console.log('='.repeat(60));
  console.log('朱学院 データ抽出開始');
  console.log('='.repeat(60));

  // HTMLディレクトリのファイルを取得
  const files = await fs.readdir(HTML_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html') && f.startsWith('random_'));

  console.log(`\n📂 ${htmlFiles.length}個のHTMLファイルを処理`);

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const file of htmlFiles) {
    // IDを抽出
    const id = parseInt(file.match(/random_(\d+)\.html/)[1]);

    const filePath = path.join(HTML_DIR, file);
    const html = await fs.readFile(filePath, 'utf8');

    console.log(`  [ID:${id}] 処理中...`);

    const extracted = extractDataFromHTML(html, id);
    results.push(extracted);

    if (extracted.success) {
      successCount++;
      console.log(`  [ID:${id}] ✅ 成功`);
    } else {
      failureCount++;
      console.log(`  [ID:${id}] ❌ 失敗: ${extracted.error}`);
    }
  }

  // 結果をID順にソート
  results.sort((a, b) => a.id - b.id);

  // 保存
  const output = {
    generated: new Date().toISOString(),
    summary: {
      total: results.length,
      success: successCount,
      failure: failureCount,
      successRate: ((successCount / results.length) * 100).toFixed(1) + '%'
    },
    results
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('集計結果');
  console.log('='.repeat(60));
  console.log(`✅ 総成功件数: ${successCount}`);
  console.log(`❌ 総失敗件数: ${failureCount}`);
  console.log(`📊 成功率: ${output.summary.successRate}`);
  console.log(`\n📁 保存先: ${OUTPUT_FILE}`);
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('💥 ファルエラー:', error);
  process.exit(1);
});
