/**
 * 朱学院の占い計算サイトからデータをスクレイピング
 *
 * 注意: このスクリプトは学習目的での使用を想定しています。
 * サイトの利用規約を遵守し、過度なリクエストを送信しないでください。
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.shugakuin.co.jp/fate_calculation';

const testCases = [
  { caseNumber: 1, year: 1983, month: 8, day: 11, gender: 1, genderText: 'male' },
  { caseNumber: 2, year: 1984, month: 12, day: 2, gender: 1, genderText: 'male' },
  { caseNumber: 3, year: 1980, month: 1, day: 24, gender: 2, genderText: 'female' },
];

/**
 * ページを読み込み、データを抽出
 */
async function scrapeCase(browser, testCase) {
  const page = await browser.newPage();
  const url = `${BASE_URL}?ge=${testCase.gender}&ye=${testCase.year}&mo=${testCase.month}&da=${testCase.day}`;

  console.log(`\nケース ${testCase.caseNumber} をスクレイピング中...`);
  console.log(`URL: ${url}`);

  try {
    // ページを読み込み（日本語ページ用に設定）
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // ページが読み込まれるのを待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ページ全体のテキストを取得
    const pageText = await page.evaluate(() => {
      return document.body.innerText;
    });

    // スクリーンショットを保存（デバッグ用）
    const screenshotPath = path.join(__dirname, `screenshot-case-${testCase.caseNumber}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`スクリーンショットを保存: ${screenshotPath}`);

    // HTMLを取得（デバッグ用）
    const bodyHtml = await page.evaluate(() => {
      return document.body.innerHTML;
    });

    // ページのテキスト内容を解析して四柱推命と星のデータを抽出
    const lines = pageText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log('\nページ内容（最初の50行）:');
    lines.slice(0, 50).forEach((line, i) => console.log(`${i}: ${line}`));

    // 四柱推命のパターンマッチ
    let fourPillars = { year: '', month: '', day: '' };
    let tenMajorStars = { head: '', chest: '', abdomen: '', rightHand: '', leftHand: '' };
    let twelveMinorStars = { leftShoulder: '', leftFoot: '', rightFoot: '' };

    // ページ内のテーブルや構造化されたデータを探す
    const structuredData = await page.evaluate(() => {
      const results = {
        tables: [],
        lists: [],
        divs: []
      };

      // 全てのテーブルを取得
      document.querySelectorAll('table').forEach((table, i) => {
        const rows = [];
        table.querySelectorAll('tr').forEach(row => {
          const cells = [];
          row.querySelectorAll('td, th').forEach(cell => {
            cells.push(cell.textContent.trim());
          });
          if (cells.length > 0) {
            rows.push(cells);
          }
        });
        if (rows.length > 0) {
          results.tables.push({ index: i, rows });
        }
      });

      // 全てのリストを取得
      document.querySelectorAll('ul, ol').forEach((list, i) => {
        const items = [];
        list.querySelectorAll('li').forEach(li => {
          const text = li.textContent.trim();
          if (text) items.push(text);
        });
        if (items.length > 0) {
          results.lists.push({ index: i, items });
        }
      });

      // 重要なdiv要素を取得
      document.querySelectorAll('div[class], div[id]').forEach((div, i) => {
        const text = div.textContent.trim();
        if (text && text.length < 200 && text.length > 0) {
          results.divs.push({
            index: i,
            className: div.className,
            id: div.id,
            text: text.substring(0, 100)
          });
        }
      });

      return results;
    });

    console.log('\n構造化データ:');
    console.log('テーブル数:', structuredData.tables.length);
    structuredData.tables.forEach((table, i) => {
      console.log(`\nテーブル ${i}:`, table.rows);
    });

    console.log('\nリスト数:', structuredData.lists.length);
    structuredData.lists.forEach((list, i) => {
      if (i < 5) { // 最初の5つだけ表示
        console.log(`\nリスト ${i}:`, list.items);
      }
    });

    // 特定のキーワードを含む行を検索
    const keywords = ['頭', '胸', '腹', '右手', '左手', '左肩', '左足', '右足', '年柱', '月柱', '日柱'];
    const foundLines = lines.filter(line =>
      keywords.some(keyword => line.includes(keyword))
    );

    console.log('\nキーワードを含む行:');
    foundLines.forEach(line => console.log(line));

    const result = {
      caseNumber: testCase.caseNumber,
      birthdate: `${testCase.year}/${testCase.month}/${testCase.day}`,
      gender: testCase.genderText,
      fourPillars,
      tenMajorStars,
      twelveMinorStars,
      pageText: pageText.substring(0, 3000),
      lines: lines.slice(0, 100),
      structuredData,
      foundLines,
    };

    console.log(`\nケース ${testCase.caseNumber} のデータ抽出完了`);

    return result;
  } catch (error) {
    console.error(`ケース ${testCase.caseNumber} のスクレイピング中にエラーが発生:`, error);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== 朱学院スクレイピング開始 ===');
  console.log('注意: サイトのサーバーに負荷をかけないよう、リクエスト間に遅延を設定します\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  try {
    for (const testCase of testCases) {
      const data = await scrapeCase(browser, testCase);
      results.push(data);

      // サーバーへの負荷を軽減するため、リクエスト間に3秒待機
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // 結果をJSONファイルに保存
    const outputPath = path.join(__dirname, 'shugakuin-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n結果を ${outputPath} に保存しました`);

  } catch (error) {
    console.error('スクレイピング中にエラーが発生:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('\n=== スクレイピング完了 ===');
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, scrapeCase };
