/**
 * URLパラメータ方式のテストスクリプト
 * 1件だけテスト実行
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../claudedocs');
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, 'screenshots');
const HTML_DIR = path.join(OUTPUT_DIR, 'html');

async function testOneDate() {
  console.log('🧪 テスト: URLパラメータ方式で1件スクレイピング\n');

  // テストデータ: 1983年8月11日 男性
  const testData = {
    id: 999,
    date: '1983-08-11',
    year: 1983,
    month: 8,
    day: 11,
    gender: '男性'
  };

  const browser = await puppeteer.launch({
    headless: false, // テストなのでブラウザを見えるように
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 性別パラメータ（1=男性、2=女性）
    const genderParam = testData.gender === '男性' ? '1' : '2';

    // URLパラメータで直接アクセス
    const url = `https://www.shugakuin.co.jp/fate_calculation?ge=${genderParam}&ye=${testData.year}&mo=${testData.month}&da=${testData.day}&button=`;

    console.log(`📅 日付: ${testData.date}`);
    console.log(`👤 性別: ${testData.gender}`);
    console.log(`🔗 URL: ${url}\n`);

    // ページを開く
    console.log('⏳ ページを開いています...');
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 待機
    console.log('⏳ 結果ページの読み込みを待機しています...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 現在のURLを確認
    const currentUrl = page.url();
    console.log(`✅ 現在のURL: ${currentUrl}\n`);

    // スクリーンショットを保存
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
    await fs.mkdir(HTML_DIR, { recursive: true });

    const screenshotPath = path.join(SCREENSHOT_DIR, `test_${testData.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 スクリーンショット保存: ${screenshotPath}`);

    // HTMLを保存
    const html = await page.content();
    const htmlPath = path.join(HTML_DIR, `test_${testData.id}.html`);
    await fs.writeFile(htmlPath, html, 'utf8');
    console.log(`💾 HTML保存: ${htmlPath}\n`);

    // ページタイトルを取得
    const title = await page.title();
    console.log(`📄 ページタイトル: ${title}\n`);

    // ページ内のテキストを一部表示
    const pageText = await page.evaluate(() => {
      // 最初の2000文字を取得
      return document.body.textContent.substring(0, 2000);
    });
    console.log(`📝 ページテキスト（最初の2000文字）:`);
    console.log('─'.repeat(60));
    console.log(pageText);
    console.log('─'.repeat(60));

    console.log('\n✅ テスト完了！');

  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// 実行
testOneDate().catch(error => {
  console.error('💥 ファイルエラー:', error);
  process.exit(1);
});
