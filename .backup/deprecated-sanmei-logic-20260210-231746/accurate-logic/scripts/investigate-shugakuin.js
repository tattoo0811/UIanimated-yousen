/**
 * 朱学院サイトの構造調査スクリプト
 * 正しいセレクタを特定するための調査
 */

const fs = require('fs').promises;
const path = require('path');

const DEBUG_DIR = path.join(__dirname, '../scripts/debug-screenshots');

async function investigateSite() {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    headless: false, // ブラウザを表示してデバッグ
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log('📍 サイトにアクセス中...');
    await page.goto('https://www.shugakuin.co.jp/fate_calculation', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ページのHTMLを保存
    const html = await page.content();
    await fs.writeFile(path.join(DEBUG_DIR, 'page-source.html'), html, 'utf8');
    console.log('✅ ページのHTMLを保存しました');

    // スクリーンショット
    await page.screenshot({ path: path.join(DEBUG_DIR, 'initial-page.png'), fullPage: true });
    console.log('✅ 初期画面のスクリーンショットを保存');

    // フォーム要素を調査
    console.log('\n🔍 フォーム要素の調査:');

    // 全てのinput要素
    const inputs = await page.evaluate(() => {
      const elements = [];
      document.querySelectorAll('input, select').forEach(el => {
        elements.push({
          tag: el.tagName,
          type: el.type || 'N/A',
          name: el.name || 'N/A',
          id: el.id || 'N/A',
          value: el.value || 'N/A',
          className: el.className || 'N/A'
        });
      });
      return elements;
    });

    console.log('\n📋 発見されたフォーム要素:');
    inputs.forEach((input, i) => {
      console.log(`  ${i + 1}. ${input.tag} - type:${input.type}, name:${input.name}, id:${input.id}, class:${input.className}`);
    });

    // セレクタテスト
    console.log('\n🧪 セレクタテスト:');

    // 年セレクタ
    const yearSelectors = [
      '#input-year',
      'select[name="year"]',
      '#year',
      'select[name="birth[year]"]'
    ];

    for (const selector of yearSelectors) {
      const exists = await page.$(selector);
      console.log(`  年フィールド "${selector}": ${exists ? '✅ 存在' : '❌ 不在'}`);
    }

    // 月セレクタ
    const monthSelectors = [
      '#input-month',
      'select[name="month"]',
      '#month',
      'select[name="birth[month]"]'
    ];

    for (const selector of monthSelectors) {
      const exists = await page.$(selector);
      console.log(`  月フィールド "${selector}": ${exists ? '✅ 存在' : '❌ 不在'}`);
    }

    // 日セレクタ
    const daySelectors = [
      '#input-day',
      'select[name="day"]',
      '#day',
      'select[name="birth[day]"]'
    ];

    for (const selector of daySelectors) {
      const exists = await page.$(selector);
      console.log(`  日フィールド "${selector}": ${exists ? '✅ 存在' : '❌ 不在'}`);
    }

    // 性別セレクタ
    const genderSelectors = [
      'input[name="ge"]',
      'input[name="gender"]',
      'input[type="radio"]'
    ];

    for (const selector of genderSelectors) {
      const exists = await page.$(selector);
      console.log(`  性別フィールド "${selector}": ${exists ? '✅ 存在' : '❌ 不在'}`);
    }

    // 送信ボタン
    const submitSelectors = [
      'input[type="submit"]',
      'button[type="submit"]',
      'input[value*="計算"]',
      'button:contains("計算")'
    ];

    for (const selector of submitSelectors) {
      try {
        const exists = await page.$(selector);
        console.log(`  送信ボタン "${selector}": ${exists ? '✅ 存在' : '❌ 不在'}`);
      } catch (e) {
        console.log(`  送信ボタン "${selector}": ❌ エラー`);
      }
    }

    // 実際に値を入力してみる
    console.log('\n🎯 テスト入力: 1984年12月2日 男性');

    // 調査で見つかった要素を使って入力を試みる
    try {
      // select要素を探す
      const selectElements = await page.evaluate(() => {
        const selects = [];
        document.querySelectorAll('select').forEach((sel, index) => {
          const options = [];
          sel.querySelectorAll('option').forEach(opt => {
            options.push({ value: opt.value, text: opt.text });
          });
          selects.push({
            index,
            id: sel.id,
            name: sel.name,
            className: sel.className,
            optionCount: options.length,
            sampleOptions: options.slice(0, 5)
          });
        });
        return selects;
      });

      console.log('\n📋 select要素の詳細:');
      selectElements.forEach((sel) => {
        console.log(`  Select[${sel.index}] - id:${sel.id}, name:${sel.name}`);
        console.log(`    オプション数: ${sel.optionCount}`);
        console.log(`    サンプルオプション:`, sel.sampleOptions.map(o => `${o.value}=${o.text}`).join(', '));
      });

    } catch (e) {
      console.error('入力テストエラー:', e.message);
    }

    console.log('\n⏸️ 30秒間ブラウザを開いたままにします。手動で確認してください...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
}

// ディレクトリ作成
fs.mkdir(DEBUG_DIR, { recursive: true })
  .then(() => investigateSite())
  .catch(console.error);
