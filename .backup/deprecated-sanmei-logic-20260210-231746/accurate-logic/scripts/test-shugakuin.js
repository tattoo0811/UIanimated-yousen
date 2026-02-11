const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.shugakuin.co.jp/fate_calculation', {
    waitUntil: 'networkidle2'
  });

  // ページの構造を調査
  const structure = await page.evaluate(() => {
    // 全てのフォーム要素を取得
    const inputs = Array.from(document.querySelectorAll('input, select'));
    const forms = Array.from(document.querySelectorAll('form'));

    return {
      url: window.location.href,
      title: document.title,
      forms: forms.map(f => ({
        action: f.action,
        method: f.method,
        id: f.id,
        name: f.name
      })),
      inputs: inputs.map(input => ({
        tag: input.tagName,
        type: input.type,
        id: input.id,
        name: input.name,
        value: input.value
      }))
    };
  });

  console.log('ページ構造:');
  console.log(JSON.stringify(structure, null, 2));

  // スクリーンショット
  await page.screenshot({ path: 'test-page.png', fullPage: true });

  await browser.close();
})();
