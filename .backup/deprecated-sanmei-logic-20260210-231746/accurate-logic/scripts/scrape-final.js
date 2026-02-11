/**
 * 朱学院の占い計算サイトから、最も正確な方法でデータを抽出
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeShugakuinDetailed(year, month, day, gender) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    const genderParam = gender === '男性' ? '1' : '2';
    const url = `https://www.shugakuin.co.jp/fate_calculation?ge=${genderParam}&ye=${year}&mo=${month}&da=${day}&button=`;

    console.log(`アクセス中: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // ページ全体のHTMLを取得
    const html = await page.content();
    await fs.writeFile('scripts/page-source.html', html, 'utf8');

    // すべてのテキストを取得
    const result = await page.evaluate(() => {
      const output = {
        allText: document.body.textContent,
        tables: []
      };

      // すべてのテーブルを取得
      const tables = Array.from(document.querySelectorAll('table'));
      tables.forEach((table, index) => {
        const tableData = {
          index,
          rows: []
        };

        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          const rowData = cells.map(cell => ({
            text: cell.textContent.trim(),
            html: cell.innerHTML.substring(0, 200) // 最初の200文字
          }));
          tableData.rows.push(rowData);
        });

        output.tables.push(tableData);
      });

      return output;
    });

    // 結果を保存
    await fs.writeFile('scripts/scrape-detailed.json', JSON.stringify(result, null, 2), 'utf8');

    console.log('\n=== テーブル情報 ===\n');
    result.tables.forEach((table, idx) => {
      console.log(`\nテーブル ${idx}:`);
      table.rows.forEach((row, rowIdx) => {
        console.log(`  行${rowIdx}:`);
        row.forEach(cell => {
          console.log(`    [${cell.text}]`);
        });
      });
    });

    // スクリーンショットを保存
    await page.screenshot({ path: 'scripts/screenshot-detailed.png', fullPage: true });
    console.log('\nスクリーンショット保存: scripts/screenshot-detailed.png');

    await browser.close();
    return result;

  } catch (error) {
    console.error('エラー:', error);
    await browser.close();
    throw error;
  }
}

// メイン処理
async function main() {
  await scrapeShugakuinDetailed(1984, 12, 2, '男性');
}

main().catch(error => {
  console.error('致命的なエラー:', error);
  process.exit(1);
});
