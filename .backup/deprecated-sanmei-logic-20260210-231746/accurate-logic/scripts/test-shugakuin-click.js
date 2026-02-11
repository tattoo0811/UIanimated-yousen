const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.shugakuin.co.jp/fate_calculation', {
    waitUntil: 'networkidle2'
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // 年を選択
  await page.select('#input-year', '1980');
  console.log('年を選択しました');

  // 月を選択
  await page.select('#input-month', '1');
  console.log('月を選択しました');

  // 日を選択
  await page.select('#input-day', '24');
  console.log('日を選択しました');

  // 性別を選択 - evaluateで直接設定
  await page.evaluate(() => {
    const radio = document.querySelector('input[name="ge"][value="2"]');
    if (radio) {
      radio.checked = true;
      // changeイベントを発火
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  console.log('性別を選択しました（女性）');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // スクリーンショット
  await page.screenshot({ path: 'test-form-filled.png' });
  console.log('スクリーンショットを保存しました');

  // フォームを送信
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
    page.evaluate(() => {
      document.querySelector('form').submit();
    })
  ]);

  console.log('フォームを送信しました');

  // 結果ページのスクリーンショット
  await page.screenshot({ path: 'test-result.png', fullPage: true });
  console.log('結果ページのスクリーンショットを保存しました');

  await browser.close();
})();
