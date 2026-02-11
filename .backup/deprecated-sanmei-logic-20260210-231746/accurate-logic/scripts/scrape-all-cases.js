/**
 * 3つのテストケースを朱学院からスクレイピング
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeShugakuin(year, month, day, gender) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    const genderParam = gender === '男性' ? '1' : '2';
    const url = `https://www.shugakuin.co.jp/fate_calculation?ge=${genderParam}&ye=${year}&mo=${month}&da=${day}&button=`;

    console.log(`アクセス中: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // 人体図テーブルを取得
    const result = await page.evaluate(() => {
      // すべてのテーブルを取得
      const allTables = Array.from(document.querySelectorAll('table'));

      // 人体図テーブルを特定（十大主星や十二大従星の名前が含まれるテーブル）
      const bodyTable = allTables.find(table => {
        const text = table.textContent;
        // 十大主星の星名が含まれるかチェック
        const majorStars = ['貫索星', '石門星', '鳳閣星', '調舒星', '禄存星', '司禄星', '車騎星', '牽牛星', '龍高星', '玉堂星'];
        return majorStars.some(star => text.includes(star));
      });

      if (!bodyTable) return null;

      const rows = Array.from(bodyTable.querySelectorAll('tr'));

      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        return cells.map(cell => {
          let text = cell.textContent.trim();
          // 改行や余分なスペースを削除
          text = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
          return text;
        });
      });
    });

    await browser.close();
    return {
      date: `${year}-${month}-${day}`,
      gender,
      table: result
    };

  } catch (error) {
    console.error('エラー:', error);
    await browser.close();
    throw error;
  }
}

// メイン処理
async function main() {
  const cases = [
    { year: 1983, month: 8, day: 11, gender: '男性' },
    { year: 1984, month: 12, day: 2, gender: '男性' },
    { year: 1980, month: 1, day: 24, gender: '女性' }
  ];

  const results = [];

  for (const testCase of cases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${testCase.year}-${testCase.month}-${testCase.day} ${testCase.gender}`);
    console.log(`${'='.repeat(60)}`);

    const result = await scrapeShugakuin(testCase.year, testCase.month, testCase.day, testCase.gender);
    results.push(result);

    console.log('\n人体図テーブル:');
    result.table.forEach((row, idx) => {
      console.log(`  行${idx}: [${row.join('] [')}]`);
    });
  }

  // 結果を保存
  await fs.writeFile('scripts/all-cases-scraped.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('\n結果保存: scripts/all-cases-scraped.json');
}

main().catch(error => {
  console.error('致命的なエラー:', error);
  process.exit(1);
});
