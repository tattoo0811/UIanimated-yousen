/**
 * 朱学院の人体図テーブル構造を詳細に分析
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TARGET_DATE = { year: 1984, month: 12, day: 2, gender: 1 };
const BASE_URL = 'https://www.shugakuin.co.jp/fate_calculation';

async function analyzeStructure() {
  console.log('=== 朱学院 人体図構造分析 ===\n');
  console.log(`対象: ${TARGET_DATE.year}年${TARGET_DATE.month}月${TARGET_DATE.day}日 (男性)`);
  console.log(`URL: ${BASE_URL}?ge=${TARGET_DATE.gender}&ye=${TARGET_DATE.year}&mo=${TARGET_DATE.month}&da=${TARGET_DATE.day}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const url = `${BASE_URL}?ge=${TARGET_DATE.gender}&ye=${TARGET_DATE.year}&mo=${TARGET_DATE.month}&da=${TARGET_DATE.day}`;

  try {
    console.log('ページを読み込み中...');
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // スクリーンショットを保存
    const screenshotPath = path.join(__dirname, 'detailed-1984-12-02-male.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`スクリーンショット保存: ${screenshotPath}`);

    // 人体図のテーブルを詳細に分析
    const tableAnalysis = await page.evaluate(() => {
      const results = {
        allTables: [],
        bodyDiagramTable: null,
        fourPillarsTable: null
      };

      // 全てのテーブルを取得
      document.querySelectorAll('table').forEach((table, tableIndex) => {
        const tableInfo = {
          index: tableIndex,
          rows: [],
          className: table.className,
          id: table.id
        };

        table.querySelectorAll('tr').forEach((tr, rowIndex) => {
          const rowInfo = {
            index: rowIndex,
            cells: []
          };

          tr.querySelectorAll('td, th').forEach((cell, cellIndex) => {
            const cellInfo = {
              index: cellIndex,
              tagName: cell.tagName,
              text: cell.textContent.trim(),
              className: cell.className,
              id: cell.id,
              rowspan: cell.rowSpan || 1,
              colspan: cell.colSpan || 1,
              backgroundColor: window.getComputedStyle(cell).backgroundColor,
              position: {
                offsetTop: cell.offsetTop,
                offsetLeft: cell.offsetLeft,
                offsetWidth: cell.offsetWidth,
                offsetHeight: cell.offsetHeight
              }
            };
            rowInfo.cells.push(cellInfo);
          });

          tableInfo.rows.push(rowInfo);
        });

        results.allTables.push(tableInfo);
      });

      // 人体図のテーブルを特定（3x3構造のテーブル）
      results.allTables.forEach(table => {
        const rows = table.rows;
        if (rows.length >= 3) {
          // 各行のセル数を確認
          const cellsInRow = rows.map(r => r.cells.length);

          // 人体図は通常3行で、各行のセル数が3前後
          if (rows.length >= 3 && rows.length <= 5) {
            // 星の名前が含まれているか確認（十大主星や十二大従星）
            const hasStarNames = rows.some(row =>
              row.cells.some(cell =>
                cell.text.match(/鳳閣星|禄存星|車輢星|牽牛星|龍高星|玉堂星|貫索星|石門星|調舒星|司禄星|天堂星|石門星|天将星/)
              )
            );

            if (hasStarNames && !results.bodyDiagramTable) {
              results.bodyDiagramTable = table;
            }
          }
        }

        // 四柱推命のテーブル（最初の小さなテーブル）
        if (rows.length === 1 && rows[0].cells.length === 4) {
          if (!results.fourPillarsTable) {
            results.fourPillarsTable = table;
          }
        }
      });

      return results;
    });

    console.log('\n=== テーブル構造分析 ===\n');

    // 四柱推命テーブル
    if (tableAnalysis.fourPillarsTable) {
      console.log('【四柱推命テーブル】');
      const table = tableAnalysis.fourPillarsTable;
      table.rows.forEach((row, ri) => {
        row.cells.forEach((cell, ci) => {
          console.log(`  [${ri}][${ci}]: "${cell.text}"`);
        });
      });
      console.log('');
    }

    // 人体図テーブル
    if (tableAnalysis.bodyDiagramTable) {
      console.log('【人体図テーブル】詳細構造:');
      const table = tableAnalysis.bodyDiagramTable;

      table.rows.forEach((row, ri) => {
        console.log(`\n行 ${ri}:`);
        row.cells.forEach((cell, ci) => {
          console.log(`  列 ${ci}:`);
          console.log(`    テキスト: "${cell.text}"`);
          console.log(`    位置: top=${cell.position.offsetTop}, left=${cell.position.offsetLeft}`);
          console.log(`    サイズ: ${cell.position.offsetWidth}x${cell.position.offsetHeight}`);
          console.log(`    rowspan=${cell.rowspan}, colspan=${cell.colspan}`);
        });
      });

      // 星の配置を推定
      console.log('\n=== 星の配置推定 ===\n');

      const rows = table.rows;

      // 十大主星（通常は3x3の上2行と中央）
      console.log('【十大主星】');
      let tenMajorStars = {
        head: '',
        chest: '',
        abdomen: '',
        rightHand: '',
        leftHand: ''
      };

      // 行0: [空, 頭?, ?]
      // 行1: [左手?, 胸?, 右手?]
      // 行2: [左肩?, 左足?, 右足?]

      // セルの位置情報から推定
      if (rows.length >= 3) {
        // 1行目
        if (rows[0].cells.length >= 2) {
          tenMajorStars.head = rows[0].cells[1].text;
          if (rows[0].cells.length >= 3) {
            // 腹の可能性
            tenMajorStars.abdomen = rows[0].cells[2]?.text || '';
          }
        }

        // 2行目
        if (rows[1].cells.length >= 3) {
          tenMajorStars.leftHand = rows[1].cells[0].text;
          tenMajorStars.chest = rows[1].cells[1].text;
          tenMajorStars.rightHand = rows[1].cells[2].text;
        }

        console.log(`  頭: ${tenMajorStars.head}`);
        console.log(`  胸: ${tenMajorStars.chest}`);
        console.log(`  腹: ${tenMajorStars.abdomen}`);
        console.log(`  右手: ${tenMajorStars.rightHand}`);
        console.log(`  左手: ${tenMajorStars.leftHand}`);
      }

      // 十二大従星（3行目）
      console.log('\n【十二大従星】');
      let twelveMinorStars = {
        leftShoulder: '',
        leftFoot: '',
        rightFoot: ''
      };

      if (rows.length >= 3 && rows[2].cells.length >= 3) {
        twelveMinorStars.leftShoulder = rows[2].cells[0].text;
        twelveMinorStars.leftFoot = rows[2].cells[1].text;
        twelveMinorStars.rightFoot = rows[2].cells[2].text;

        console.log(`  左肩: ${twelveMinorStars.leftShoulder}`);
        console.log(`  左足: ${twelveMinorStars.leftFoot}`);
        console.log(`  右足: ${twelveMinorStars.rightFoot}`);
      }

      // 結果を保存
      const result = {
        date: TARGET_DATE,
        gender: 'male',
        fourPillars: null,
        tenMajorStars,
        twelveMinorStars,
        tableStructure: tableAnalysis.bodyDiagramTable
      };

      // 四柱推命も抽出
      if (tableAnalysis.fourPillarsTable) {
        const fpRow = tableAnalysis.fourPillarsTable.rows[0];
        result.fourPillars = {
          year: fpRow.cells[1]?.text || '',
          month: fpRow.cells[2]?.text || '',
          day: fpRow.cells[3]?.text || ''
        };
      }

      // JSONに保存
      const outputPath = path.join(__dirname, 'detailed-1984-12-02-analysis.json');
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
      console.log(`\n詳細分析結果を保存: ${outputPath}`);

      // 見やすいサマリー
      console.log('\n=== 最終結果 ===\n');
      console.log(`生年月日: ${TARGET_DATE.year}年${TARGET_DATE.month}月${TARGET_DATE.day}日 (男性)`);
      console.log(`\n四柱推命:`);
      console.log(`  年柱: ${result.fourPillars.year}`);
      console.log(`  月柱: ${result.fourPillars.month}`);
      console.log(`  日柱: ${result.fourPillars.day}`);
      console.log(`\n十大主星:`);
      console.log(`  頭: ${result.tenMajorStars.head}`);
      console.log(`  胸: ${result.tenMajorStars.chest}`);
      console.log(`  腹: ${result.tenMajorStars.abdomen}`);
      console.log(`  右手: ${result.tenMajorStars.rightHand}`);
      console.log(`  左手: ${result.tenMajorStars.leftHand}`);
      console.log(`\n十二大従星:`);
      console.log(`  左肩: ${result.twelveMinorStars.leftShoulder}`);
      console.log(`  左足: ${result.twelveMinorStars.leftFoot}`);
      console.log(`  右足: ${result.twelveMinorStars.rightFoot}`);
    }

  } catch (error) {
    console.error('エラーが発生:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('\n=== 分析完了 ===');
  }
}

analyzeStructure().catch(console.error);
