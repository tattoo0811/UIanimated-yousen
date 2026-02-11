/**
 * 朱学院の占い計算サイトから、十大主星と十二大従星を正確にスクレイピング
 * 十大主星と十二大従星を明確に区別
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// 十大主星のリスト（検証用）
const TEN_MAJOR_STARS = [
  '貫索星', '石門星', '鳳閣星', '調舒星', '禄存星',
  '司禄星', '車騎星', '牽牛星', '龍高星', '玉堂星', '車輪星'
];

// 十二大従星のリスト（検証用）
const TWELVE_MINOR_STARS = [
  '天馳星', '天極星', '天報星', '天胡星', '天庫星', '天印星',
  '天恍星', '天堂星', '天貴星', '天南星', '天禄星', '天将星'
];

function isTenMajorStar(starName) {
  return TEN_MAJOR_STARS.includes(starName);
}

function isTwelveMinorStar(starName) {
  return TWELVE_MINOR_STARS.includes(starName);
}

async function scrapeShugakuin(year, month, day, gender) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    const genderParam = gender === '男性' ? '1' : '2';
    const url = `https://www.shugakuin.co.jp/fate_calculation?ge=${genderParam}&ye=${year}&mo=${month}&da=${day}&button=`;

    console.log(`アクセス中: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // すべてのテーブルを取得
    const tables = await page.evaluate(() => {
      const result = [];

      // 人体図テーブルを検索
      const bodyTables = Array.from(document.querySelectorAll('table')).filter(table => {
        const text = table.textContent;
        return text.includes('頭') && (text.includes('左手') || text.includes('右手'));
      });

      bodyTables.forEach((table, index) => {
        const rows = Array.from(table.querySelectorAll('tr'));
        const tableData = [];

        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          const rowData = cells.map(cell => {
            // テキストを取得して整形
            let text = cell.textContent.trim();
            // 改行や余分なスペースを削除
            text = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
            return text;
          });
          tableData.push(rowData);
        });

        result.push({
          index,
          rows: tableData,
          html: table.outerHTML
        });
      });

      // 四柱推命のテーブルも取得
      const baziTable = Array.from(document.querySelectorAll('table')).find(table => {
        const text = table.textContent;
        return text.includes('年柱') && text.includes('月柱') && text.includes('日柱');
      });

      let bazi = null;
      if (baziTable) {
        const rows = Array.from(baziTable.querySelectorAll('tr'));
        bazi = rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return cells.map(cell => cell.textContent.trim());
        });
      }

      return { bodyTables: result, bazi };
    });

    console.log('\n=== テーブル構造 ===\n');
    tables.bodyTables.forEach((table, idx) => {
      console.log(`テーブル ${idx}:`);
      table.rows.forEach((row, rowIdx) => {
        console.log(`  行${rowIdx}:`, row);
      });
      console.log('');
    });

    // 十大主星と十二大従星を抽出
    const result = {
      date: `${year}-${month}-${day}`,
      gender,
      fourPillars: {},
      tenMajorStars: {},
      twelveMinorStars: {}
    };

    // 四柱推命を抽出
    if (tables.bazi && tables.bazi.length > 0) {
      tables.bazi.forEach(row => {
        if (row.length >= 2) {
          if (row[0].includes('年柱')) result.fourPillars.year = row[1];
          if (row[0].includes('月柱')) result.fourPillars.month = row[1];
          if (row[0].includes('日柱')) result.fourPillars.day = row[1];
        }
      });
    }

    // 人体図から星を抽出
    if (tables.bodyTables.length > 0) {
      const mainTable = tables.bodyTables[0];

      // テーブル構造を分析して、十大主星と十二大従星を分離
      mainTable.rows.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          const cellText = cell.trim();

          // 部位名を検出
          if (cellText === '頭' || cellText === '胸' || cellText === '腹' ||
              cellText === '右手' || cellText === '左手') {
            // 次のセルまたは同じセル内の値を取得
            // 通常、部位名と星は別のセルにある
          }

          // 十大主星を検出
          if (isTenMajorStar(cellText)) {
            // 位置から部位を判断
            if (rowIdx === 0 && colIdx === 1) result.tenMajorStars.head = cellText;
            else if (rowIdx === 1 && colIdx === 1) result.tenMajorStars.chest = cellText;
            else if (rowIdx === 0 && colIdx === 2) result.tenMajorStars.belly = cellText;
            else if (rowIdx === 1 && colIdx === 2) result.tenMajorStars.rightHand = cellText;
            else if (rowIdx === 1 && colIdx === 0) result.tenMajorStars.leftHand = cellText;
          }

          // 十二大従星を検出
          if (isTwelveMinorStar(cellText)) {
            if (rowIdx === 2 && colIdx === 0) result.twelveMinorStars.leftShoulder = cellText;
            else if (rowIdx === 2 && colIdx === 1) result.twelveMinorStars.leftLeg = cellText;
            else if (rowIdx === 2 && colIdx === 2) result.twelveMinorStars.rightLeg = cellText;
          }
        });
      });
    }

    console.log('\n=== 抽出結果 ===\n');
    console.log('四柱推命:', result.fourPillars);
    console.log('十大主星:', result.tenMajorStars);
    console.log('十二大従星:', result.twelveMinorStars);

    // スクリーンショットを保存
    const screenshotPath = `scripts/screenshot-${year}-${month}-${day}-precise.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\nスクリーンショット保存: ${screenshotPath}`);

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
  const year = 1984;
  const month = 12;
  const day = 2;
  const gender = '男性';

  const result = await scrapeShugakuin(year, month, day, gender);

  // 結果を保存
  const outputPath = 'scripts/shugakuin-precise-result.json';
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n結果保存: ${outputPath}`);
}

main().catch(error => {
  console.error('致命的なエラー:', error);
  process.exit(1);
});
