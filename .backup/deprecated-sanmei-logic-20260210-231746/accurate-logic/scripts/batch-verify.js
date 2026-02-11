/**
 * 朱学院サイトで複数の生年月日を一括検証するスクリプト
 */

const fs = require('fs');
const { generateRandomDate } = require('./generate-random-dates.js');

// グループで検証するための修正版
async function verifySingleDate(id, dateStr, gender) {
  const puppeteer = require('puppeteer');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://www.shugakuin.co.jp/fate_calculation', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 性別を選択
    if (gender === '男性') {
      await page.click('#gender_man');
    } else {
      await page.click('#gender_woman');
    }

    // 生年月日を入力
    const [year, month, day] = dateStr.split('-');
    await page.select('#birth_year', year);
    await page.select('#birth_month', month);
    await page.select('#birth_day', day);

    // 計算ボタンをクリック
    await Promise.all([
      page.click('input[type="submit"]'),
      page.waitForSelector('.result_area, .calc_result, .fortune-result', { timeout: 10000 })
    ]);

    // 少し待機して結果が表示されるのを待つ
    await page.waitForTimeout(2000);

    // 結果を取得
    const result = await page.evaluate(() => {
      const getTextContent = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : '';
      };

      // 結果エリアを特定
      const resultArea = document.querySelector('.result_area, .calc_result, .fortune-result');
      if (!resultArea) return null;

      // テキストコンテンツを取得
      return resultArea.textContent;
    });

    await browser.close();

    return {
      id,
      date: dateStr,
      gender,
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    await browser.close();
    return {
      id,
      date: dateStr,
      gender,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// コマンドライン引数からグループIDとファイルパスを取得
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node batch-verify.js <groupId> <jsonFilePath>');
  process.exit(1);
}

const groupId = parseInt(args[0]);
const jsonFilePath = args[1];

// JSONファイルを読み込む
const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
const dates = data.dates.slice((groupId - 1) * 10, groupId * 10);

console.log(`\n📊 グループ ${groupId}: ${dates.length}件の検証を開始します...`);

// 並列で検証（同時に3件ずつ）
const results = [];
for (let i = 0; i < dates.length; i += 3) {
  const batch = dates.slice(i, i + 3);
  const batchResults = await Promise.all(
    batch.map(d => verifySingleDate(d.id, d.date, d.gender))
  );
  results.push(...batchResults);

  console.log(`  进度: ${Math.min(i + 3, dates.length)}/${dates.length} 件完了`);
}

// 結果を保存
const output = {
  groupId,
  timestamp: new Date().toISOString(),
  total: dates.length,
  success: results.filter(r => r.success).length,
  failed: results.filter(r => r.success === false).length,
  results
};

fs.writeFileSync(
  `/Users/kitamuratatsuhiko/UIanimated/accurate-logic/claudedocs/verification_group_${groupId}.json`,
  JSON.stringify(output, null, 2),
  'utf8'
);

console.log(`\n✅ グループ ${groupId} が完了しました！`);
console.log(`  成功: ${output.success}/${output.total}`);
console.log(`  失敗: ${output.failed}/${output.total}`);
console.log(`  保存先: verification_group_${groupId}.json`);
