/**
 * 朱学院サイトから100件の運命計算データを取得するスクリプト
 * 10個のグループに並列実行
 */

const fs = require('fs').promises;
const path = require('path');

// 入力データのパス
const INPUT_FILE = path.join(__dirname, '../claudedocs/random_100_dates.json');
const OUTPUT_DIR = path.join(__dirname, '../claudedocs');
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, 'screenshots');
const HTML_DIR = path.join(OUTPUT_DIR, 'html');

// 待機時間（ミリ秒）
const WAIT_BETWEEN_REQUESTS = 2500;

/**
 * 1件のデータをスクレイピングする
 */
async function scrapeOneDate(browser, dateData) {
  const page = await browser.newPage();
  const result = {
    id: dateData.id,
    date: dateData.date,
    gender: dateData.gender,
    success: false,
    error: null,
    data: null
  };

  try {
    console.log(`  [ID:${dateData.id}] 開始: ${dateData.date} (${dateData.gender})`);

    // ページを開く
    await page.goto('https://www.shugakuin.co.jp/fate_calculation', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 待機
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 生年月日を入力
    const year = dateData.year;
    const month = dateData.month;
    const day = dateData.day;

    // 年入力
    await page.select('#input-year', year.toString());

    // 月入力
    await page.select('#input-month', month.toString());

    // 日入力
    await page.select('#input-day', day.toString());

    // 性別を選択（男性:1, 女性:2）
    const genderValue = dateData.gender === '男性' ? '1' : '2';
    // evaluateで直接設定
    await page.evaluate((val) => {
      const radio = document.querySelector(`input[name="ge"][value="${val}"]`);
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, genderValue);

    // 追加の待機
    await new Promise(resolve => setTimeout(resolve, 1000));

    // URLを確認（結果ページに遷移したかチェック）
    const currentUrl = page.url();

    // フォームを送信
    try {
      // フォームを送信
      await page.evaluate(() => {
        document.querySelector('form').submit();
      });

      // ナビゲーションを待機
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      // 結果ページの読み込みを待機
      await page.waitForFunction(() => {
        // URLが変更されたか確認
        const url = window.location.href;
        return url.includes('ge=') && url.includes('ye=');
      }, { timeout: 10000 });

    } catch (e) {
      console.log(`  [ID:${dateData.id}] ナビゲーション待機中... エラー: ${e.message}`);
    }

    // 追加の待機
    await new Promise(resolve => setTimeout(resolve, 3000));

    // スクリーンショットを保存
    const screenshotPath = path.join(SCREENSHOT_DIR, `random_${dateData.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  [ID:${dateData.id}] スクリーンショット保存: ${screenshotPath}`);

    // HTMLを保存
    const html = await page.content();
    const htmlPath = path.join(HTML_DIR, `random_${dateData.id}.html`);
    await fs.writeFile(htmlPath, html, 'utf8');
    console.log(`  [ID:${dateData.id}] HTML保存: ${htmlPath}`);

    // テキストデータを抽出
    const textData = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : '';
      };

      const getAllText = () => {
        return document.body.textContent
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 10000); // 最初の10000文字
      };

      return {
        fullText: getAllText(),
        scrapedAt: new Date().toISOString()
      };
    });

    result.data = textData;
    result.success = true;
    console.log(`  [ID:${dateData.id}] ✅ 完了`);

  } catch (error) {
    result.error = error.message;
    console.error(`  [ID:${dateData.id}] ❌ エラー: ${error.message}`);
  } finally {
    await page.close();
  }

  return result;
}

/**
 * グループ単位で処理を実行
 */
async function processGroup(groupNumber, dates) {
  console.log(`\n🚀 グループ${groupNumber} 開始 (${dates.length}件)`);

  const results = {
    groupNumber,
    total: dates.length,
    results: [],
    startTime: new Date().toISOString()
  };

  const browser = await require('puppeteer').launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    for (let i = 0; i < dates.length; i++) {
      const dateData = dates[i];
      const result = await scrapeOneDate(browser, dateData);
      results.results.push(result);

      // 進捗表示
      console.log(`グループ${groupNumber}: ${i + 1}/${dates.length} 完了`);

      // 次のリクエスト前に待機（最後のリクエスト以外）
      if (i < dates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, WAIT_BETWEEN_REQUESTS));
      }
    }
  } finally {
    await browser.close();
  }

  results.endTime = new Date().toISOString();
  results.successCount = results.results.filter(r => r.success).length;
  results.failureCount = results.results.filter(r => !r.success).length;

  console.log(`\n✅ グループ${groupNumber} 完成: 成功${results.successCount}件 失敗${results.failureCount}件`);

  return results;
}

/**
 * メイン関数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('朱学院 運命計算 スクレイピング開始');
  console.log('='.repeat(60));

  // データを読み込む
  console.log('\n📂 データ読み込み中...');
  const rawData = await fs.readFile(INPUT_FILE, 'utf8');
  const inputData = JSON.parse(rawData);
  console.log(`✅ ${inputData.dates.length}件のデータを読み込み`);

  // 10個のグループに分割
  const groups = [];
  for (let i = 0; i < 10; i++) {
    const startIdx = i * 10;
    const endIdx = startIdx + 10;
    groups.push(inputData.dates.slice(startIdx, endIdx));
  }
  console.log(`✅ ${groups.length}個のグループに分割`);

  // 並列実行
  console.log('\n🔄 並列実行開始...');
  const groupPromises = groups.map((group, index) =>
    processGroup(index + 1, group)
  );

  const allGroupResults = await Promise.all(groupPromises);

  // 全体の結果を集計
  console.log('\n' + '='.repeat(60));
  console.log('全体の集計');
  console.log('='.repeat(60));

  const totalSuccess = allGroupResults.reduce((sum, g) => sum + g.successCount, 0);
  const totalFailure = allGroupResults.reduce((sum, g) => sum + g.failureCount, 0);

  console.log(`✅ 総成功件数: ${totalSuccess}`);
  console.log(`❌ 総失敗件数: ${totalFailure}`);
  console.log(`📊 成功率: ${((totalSuccess / 100) * 100).toFixed(1)}%`);

  // 各グループの結果を保存
  for (const groupResult of allGroupResults) {
    const outputFile = path.join(OUTPUT_DIR, `verification_group_${groupResult.groupNumber}.json`);
    await fs.writeFile(outputFile, JSON.stringify(groupResult, null, 2), 'utf8');
    console.log(`📁 グループ${groupResult.groupNumber}の結果を保存: ${outputFile}`);
  }

  // 全体の結果を統合
  const allResults = {
    generated: new Date().toISOString(),
    summary: {
      total: 100,
      success: totalSuccess,
      failure: totalFailure,
      successRate: ((totalSuccess / 100) * 100).toFixed(1) + '%'
    },
    groups: allGroupResults.map(g => ({
      group: g.groupNumber,
      success: g.successCount,
      failure: g.failureCount,
      results: g.results
    }))
  };

  const allResultsFile = path.join(OUTPUT_DIR, 'verification_all_results.json');
  await fs.writeFile(allResultsFile, JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`\n📁 全体の結果を保存: ${allResultsFile}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ すべて完了');
  console.log('='.repeat(60));
}

// 実行
main().catch(error => {
  console.error('💥 ファルエラー:', error);
  process.exit(1);
});
