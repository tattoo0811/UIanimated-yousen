/**
 * 朱学院 1984年12月2日（男性）の詳細スクレイピング
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeDetailed() {
  console.log('=== 1984年12月2日（男性）詳細スクレイピング ===\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const url = 'https://www.shugakuin.co.jp/fate_calculation?ge=1&ye=1984&mo=12&da=2';

  try {
    console.log('URL:', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // ページが完全に読み込まれるのを待機
    await new Promise(resolve => setTimeout(resolve, 3000));

    // スクリーンショット
    const screenshotPath = path.join(__dirname, '1984-12-02-male-detailed.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('✓ スクリーンショット保存:', screenshotPath);

    // 全テーブルを取得
    const tables = await page.evaluate(() => {
      const allTables = [];

      document.querySelectorAll('table').forEach((table, tableIndex) => {
        const tableData = {
          index: tableIndex,
          className: table.className,
          rows: []
        };

        table.querySelectorAll('tr').forEach((tr, rowIndex) => {
          const rowData = {
            index: rowIndex,
            cells: []
          };

          tr.querySelectorAll('td, th').forEach((cell, cellIndex) => {
            const cellData = {
              index: cellIndex,
              text: cell.textContent.trim(),
              rowspan: cell.rowSpan || 1,
              colspan: cell.colSpan || 1,
              bgColor: cell.style.backgroundColor || ''
            };
            rowData.cells.push(cellData);
          });

          tableData.rows.push(rowData);
        });

        allTables.push(tableData);
      });

      return allTables;
    });

    // テーブルを解析
    console.log('\n=== テーブル構造 ===\n');

    let fourPillars = null;
    let bodyDiagram = null;

    tables.forEach((table, idx) => {
      if (table.rows.length === 1 && table.rows[0].cells.length === 4) {
        // 四柱推命のテーブル
        console.log(`テーブル${idx}: 四柱推命`);
        const cells = table.rows[0].cells;
        fourPillars = {
          year: cells[1].text,
          month: cells[2].text,
          day: cells[3].text
        };
        console.log(`  年柱: ${fourPillars.year}`);
        console.log(`  月柱: ${fourPillars.month}`);
        console.log(`  日柱: ${fourPillars.day}\n`);
      } else if (table.rows.length === 3) {
        // 人体図の可能性
        const hasStars = table.rows.some(row =>
          row.cells.some(cell => cell.text.includes('星'))
        );

        if (hasStars) {
          console.log(`テーブル${idx}: 人体図`);
          bodyDiagram = table;

          table.rows.forEach((row, ri) => {
            console.log(`  行${ri}:`);
            row.cells.forEach((cell, ci) => {
              console.log(`    [${ci}]: "${cell.text}" (rowspan=${cell.rowspan}, colspan=${cell.colspan})`);
            });
          });
          console.log('');
        }
      }
    });

    // 星の配置を決定
    let tenMajorStars = {
      head: '',
      chest: '',
      abdomen: '',
      rightHand: '',
      leftHand: ''
    };

    let twelveMinorStars = {
      leftShoulder: '',
      leftFoot: '',
      rightFoot: ''
    };

    if (bodyDiagram) {
      const rows = bodyDiagram.rows;

      // 行1: [空, 頭, 腹] または [空, 頭, 空]
      if (rows[0].cells.length >= 2) {
        tenMajorStars.head = rows[0].cells[1].text;
        if (rows[0].cells.length >= 3 && rows[0].cells[2].text.includes('星')) {
          tenMajorStars.abdomen = rows[0].cells[2].text;
        }
      }

      // 行2: [左手, 胸, 右手]
      if (rows[1].cells.length >= 3) {
        tenMajorStars.leftHand = rows[1].cells[0].text;
        tenMajorStars.chest = rows[1].cells[1].text;
        tenMajorStars.rightHand = rows[1].cells[2].text;
      }

      // 行3: [左肩, 左足, 右足]
      if (rows[2].cells.length >= 3) {
        twelveMinorStars.leftShoulder = rows[2].cells[0].text;
        twelveMinorStars.leftFoot = rows[2].cells[1].text;
        twelveMinorStars.rightFoot = rows[2].cells[2].text;
      }
    }

    // 結果
    const result = {
      date: '1984年12月2日',
      gender: '男性',
      url: url,
      fourPillars: fourPillars,
      tenMajorStars: tenMajorStars,
      twelveMinorStars: twelveMinorStars
    };

    console.log('=== 最終結果 ===\n');
    console.log('生年月日: 1984年12月2日（男性）');
    console.log('\n四柱推命:');
    console.log(`  年柱: ${result.fourPillars.year}`);
    console.log(`  月柱: ${result.fourPillars.month}`);
    console.log(`  日柱: ${result.fourPillars.day}`);
    console.log('\n十大主星:');
    console.log(`  頭: ${result.tenMajorStars.head}`);
    console.log(`  胸: ${result.tenMajorStars.chest}`);
    console.log(`  腹: ${result.tenMajorStars.abdomen}`);
    console.log(`  右手: ${result.tenMajorStars.rightHand}`);
    console.log(`  左手: ${result.tenMajorStars.leftHand}`);
    console.log('\n十二大従星:');
    console.log(`  左肩: ${result.twelveMinorStars.leftShoulder}`);
    console.log(`  左足: ${result.twelveMinorStars.leftFoot}`);
    console.log(`  右足: ${result.twelveMinorStars.rightFoot}`);

    // JSON保存
    const outputPath = path.join(__dirname, '1984-12-02-male-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n✓ 結果保存: ${outputPath}`);

  } catch (error) {
    console.error('エラー:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('\n=== 完了 ===');
  }
}

scrapeDetailed().catch(console.error);
