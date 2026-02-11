/**
 * 特定の生年月日について朱学院サイトからデータをスクレイピング
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function scrapeSingle(date, gender, outputDir) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    // URLパラメータを使用
    const genderParam = gender === '男性' ? '1' : '2';
    const url = `https://www.shugakuin.co.jp/fate_calculation?ge=${genderParam}&ye=${date.year}&mo=${date.month}&da=${date.day}&button=`;

    console.log(`スクレイピング開始: ${date.year}-${date.month}-${date.day} (${gender})`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // HTMLを保存
    const html = await page.content();
    const htmlPath = path.join(outputDir, `single-${date.year}-${date.month}-${date.day}.html`);
    await fs.writeFile(htmlPath, html, 'utf8');
    console.log(`HTML保存: ${htmlPath}`);

    // スクリーンショットを保存
    const screenshotPath = path.join(outputDir, `single-${date.year}-${date.month}-${date.day}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`スクリーンショット保存: ${screenshotPath}`);

    // 人体図から十大主星・十二大従星を抽出
    const result = await page.evaluate(() => {
      // 十大主星（人体図テーブル）
      const starCells = document.querySelectorAll('table.result-table2 td');
      const tenMajorStars = {};
      const positions = ['head', 'chest', 'belly', 'rightHand', 'leftHand'];
      const positionNames = ['頭', '胸', '腹', '右手', '左手'];

      starCells.forEach((cell, i) => {
        if (i < positions.length) {
          const starName = cell.querySelector('.font15')?.textContent?.trim() || '';
          tenMajorStars[positionNames[i]] = starName;
        }
      });

      // 十二大従星（図の下側）
      const minorStarCells = document.querySelectorAll('table.result-table3 td');
      const twelveMinorStars = {};
      const minorPositions = ['leftShoulder', 'leftLeg', 'rightLeg'];
      const minorPositionNames = ['左肩', '左足', '右足'];

      minorStarCells.forEach((cell, i) => {
        if (i < minorPositions.length) {
          const starName = cell.querySelector('.font15')?.textContent?.trim() || '';
          twelveMinorStars[minorPositionNames[i]] = starName;
        }
      });

      // 四柱推命
      const fourPillarsCells = document.querySelectorAll('td.result-eto');
      const pillarNames = ['年柱', '月柱', '日柱'];
      const fourPillars = {};

      fourPillarsCells.forEach((cell, i) => {
        if (i < pillarNames.length) {
          const pillarName = cell.getAttribute('data-id') || '';
          fourPillars[pillarNames[i]] = pillarName;
        }
      });

      return {
        tenMajorStars,
        twelveMinorStars,
        fourPillars
      };
    });

    console.log('\n=== 朱学院の結果 ===\n');
    console.log('【四柱推命】');
    Object.entries(result.fourPillars).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log('\n【十大主星】');
    Object.entries(result.tenMajorStars).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log('\n【十二大従星】');
    Object.entries(result.twelveMinorStars).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log('\n---');

    return result;

  } catch (error) {
    console.error('エラー:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// ID:42（1980-01-24 女性）
scrapeSingle(
  { year: 1980, month: 1, day: 24 },
  '女性',
  '/Users/kitamuratatsuhiko/UIanimated/accurate-logic/data'
).catch(error => {
  console.error('致命的なエラー:', error);
  process.exit(1);
});
