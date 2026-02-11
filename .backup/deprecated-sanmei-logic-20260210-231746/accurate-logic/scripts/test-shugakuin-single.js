/**
 * 朱学院サイトでのテストスクレイピング
 * 1件だけテストして動作を確認
 */

const fs = require('fs').promises;
const path = require('path');

const DEBUG_DIR = path.join(__dirname, '../scripts/debug-screenshots');

async function testScraping() {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    headless: false, // ブラウザを表示
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log('📍 サイトにアクセス中...');
    await page.goto('https://www.shugakuin.co.jp/fate_calculation', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // テストデータ
    const testData = {
      year: 1984,
      month: 12,
      day: 2,
      gender: '男性'
    };

    console.log(`\n🎯 テスト入力: ${testData.year}年${testData.month}月${testData.day}日 ${testData.gender}`);

    // 生年月日を入力
    console.log('  - 年を選択...');
    await page.select('#input-year', testData.year.toString());
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('  - 月を選択...');
    await page.select('#input-month', testData.month.toString());
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('  - 日を選択...');
    await page.select('#input-day', testData.day.toString());
    await new Promise(resolve => setTimeout(resolve, 500));

    // 性別を選択
    console.log('  - 性別を選択...');
    const genderValue = testData.gender === '男性' ? '1' : '2';

    // ラジオボタンをJavaScriptでチェック
    await page.evaluate((val) => {
      const radio = document.querySelector(`input[name="ge"][value="${val}"]`);
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, genderValue);
    await new Promise(resolve => setTimeout(resolve, 500));

    // 送信ボタンをクリックして結果ページへ
    console.log('  - 送信ボタンをクリック...');

    // ナビゲーションを待機
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);

    console.log('✅ 結果ページに遷移しました');

    // 結果ページのスクリーンショット
    await page.screenshot({ path: path.join(DEBUG_DIR, 'result-page.png'), fullPage: true });
    console.log('✅ 結果ページのスクリーンショットを保存');

    // 結果ページのHTMLを保存
    const resultHtml = await page.content();
    await fs.writeFile(path.join(DEBUG_DIR, 'result-page.html'), resultHtml, 'utf8');
    console.log('✅ 結果ページのHTMLを保存');

    // 結果ページからデータを抽出
    console.log('\n📊 結果データの抽出:');

    const extractedData = await page.evaluate(() => {
      // ページ全体のテキスト
      const fullText = document.body.textContent
        .replace(/\s+/g, ' ')
        .trim();

      // 特定の要素を探す
      const getAllTexts = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => el.textContent.trim());
      };

      // 四柱推命、十大主星、十二大従星を探す
      const resultSections = [];

      // 見出しを探す
      document.querySelectorAll('h1, h2, h3, h4, .title, .result-title').forEach(el => {
        const text = el.textContent.trim();
        if (text.includes('四柱') || text.includes('十大') || text.includes('十二大') || text.includes('主星')) {
          resultSections.push({
            type: 'heading',
            text: text
          });
        }
      });

      // 特定のクラス名を探す
      const byClassName = getAllTexts('[class*="result"], [class*="star"], [class*="fortune"]');

      // 強調テキストを探す
      const boldTexts = getAllTexts('b, strong, .emphasis, .highlight');

      return {
        url: window.location.href,
        fullText: fullText.substring(0, 5000),
        resultSections,
        byClassName: byClassName.slice(0, 20),
        boldTexts: boldTexts.slice(0, 20)
      };
    });

    console.log('\n📄 抽出結果:');
    console.log('  URL:', extractedData.url);
    console.log('  見出しセクション:', extractedData.resultSections);

    // 抽出データを保存
    await fs.writeFile(
      path.join(DEBUG_DIR, 'extracted-data.json'),
      JSON.stringify(extractedData, null, 2),
      'utf8'
    );
    console.log('✅ 抽出データを保存');

    console.log('\n⏸️ 10秒間ブラウザを開いたままにします...');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// 実行
testScraping().catch(console.error);
