/**
 * 朱学院の占い計算サイトからスクレイピングするスクリプト
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// 出力ディレクトリ
const OUTPUT_DIR = '/Users/kitamuratatsuhiko/UIanimated/accurate-logic/claudedocs';
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, 'screenshots');

/**
 * スクリーンショットを保存
 */
async function saveScreenshot(page, filename) {
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Screenshot saved: ${filepath}`);
  return filepath;
}

/**
 * 朱学院サイトで計算を実行
 */
async function calculateFortune(browser, birthDate, gender) {
  const page = await browser.newPage();

  try {
    console.log(`\n========================================`);
    console.log(`Calculating: ${birthDate} (${gender})`);
    console.log(`========================================`);

    // ページにアクセス
    await page.goto('https://www.shugakuin.co.jp/fate_calculation', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // フォームに入力前に少し待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 性別を選択（男性 = "1", 女性 = "2"）
    const genderValue = gender === '男性' ? '1' : '2';
    await page.evaluate((val) => {
      document.querySelector(`input[type="radio"][name="ge"][value="${val}"]`).checked = true;
    }, genderValue);

    // 生年月日を入力
    const [year, month, day] = birthDate.split('-').map(Number);
    await page.select('select[name="ye"]', year.toString());
    await page.select('select[name="mo"]', month.toString());
    await page.select('select[name="da"]', day.toString());

    // 計算実行ボタンをクリック
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click('button[type="submit"]')
    ]);

    // 結果が表示されるのを待機
    await new Promise(resolve => setTimeout(resolve, 3000));

    // スクリーンショットを撮影
    const screenshotFilename = `fortune-${birthDate}-${gender}.png`;
    await saveScreenshot(page, screenshotFilename);

    // JavaScript実行後の完全なHTMLを取得
    const resultHtml = await page.content();
    const htmlFile = path.join(OUTPUT_DIR, `result-${birthDate}.html`);
    await fs.writeFile(htmlFile, resultHtml, 'utf8');
    console.log(`Result HTML saved to: ${htmlFile}`);

    // ページのテキストデータを取得
    const pageText = await page.evaluate(() => {
      return document.body.innerText;
    });

    // テキスト全体も保存
    const textFile = path.join(OUTPUT_DIR, `result-${birthDate}.txt`);
    await fs.writeFile(textFile, pageText, 'utf8');
    console.log(`Result text saved to: ${textFile}`);

    // 陰占宿命セクションを抽出
    const lines = pageText.split('\n');
    let inssenSection = false;
    let bodyDiagramSection = false;
    const inssenLines = [];

    for (const line of lines) {
      if (line.includes('陰占宿命')) {
        inssenSection = true;
        continue;
      }
      if (line.includes('人体図')) {
        bodyDiagramSection = true;
        inssenSection = false;
        continue;
      }
      if (inssenSection && line.trim()) {
        inssenLines.push(line.trim());
      }
      if (bodyDiagramSection && line.includes('※算出の際には')) {
        break;
      }
    }

    // 四柱推命を抽出（年柱、月柱、日柱の順）
    const fourPillars = {};
    // 陰占宿命の後の3行が四柱推命
    if (inssenLines.length >= 3) {
      // 天中殺の次の行から
      const startIndex = inssenLines.findIndex(l => l.includes('天中殺'));
      if (startIndex >= 0 && inssenLines.length > startIndex + 3) {
        fourPillars.年柱 = inssenLines[startIndex + 1];
        fourPillars.月柱 = inssenLines[startIndex + 2];
        fourPillars.日柱 = inssenLines[startIndex + 3];
      }
    }

    // 人体図から十大主星と十二大従星を抽出
    const tenMajorStars = {};
    const twelveMinorStars = {};

    // 点数取得ヘルパー関数
    function getStarScore(starName) {
      const scores = {
        '天報星': 3, '天印星': 6, '天貴星': 9, '天恍星': 7,
        '天南星': 10, '天禄星': 11, '天将星': 12, '天堂星': 8,
        '天胡星': 4, '天極星': 2, '天庫星': 5, '天馳星': 1
      };
      return scores[starName] || null;
    }

    // 人体図のセクションを抽出
    const bodyDiagramStart = lines.findIndex(l => l.includes('人体図'));
    if (bodyDiagramStart >= 0) {
      // 人体図の次の数行から星の配置を抽出
      // フォーマット: 　頭の星\t左肩の星
      //              右手の星\t胸の星\t左手の星
      //              右足の星\t腹の星\t左足の星

      const diagramLine1 = lines[bodyDiagramStart + 2] || ''; // +1は空行
      const diagramLine2 = lines[bodyDiagramStart + 3] || '';
      const diagramLine3 = lines[bodyDiagramStart + 4] || '';

      // タブで分割
      const parts1 = diagramLine1.split('\t').filter(p => p.trim());
      const parts2 = diagramLine2.split('\t').filter(p => p.trim());
      const parts3 = diagramLine3.split('\t').filter(p => p.trim());

      // 十大主星を抽出
      if (parts1.length >= 1) {
        tenMajorStars.頭 = parts1[0].trim();
      }
      if (parts2.length >= 3) {
        tenMajorStars.右手 = parts2[0].trim();
        tenMajorStars.胸 = parts2[1].trim();
        tenMajorStars.左手 = parts2[2].trim();
      }
      if (parts3.length >= 3) {
        tenMajorStars.右足 = parts3[0].trim();
        tenMajorStars.腹 = parts3[1].trim();
        tenMajorStars.左足 = parts3[2].trim();
      }

      // 十二大従星を抽出（左肩、左足、右足）
      twelveMinorStars.左肩 = { 星: parts1.length >= 2 ? parts1[1].trim() : '', 点数: null };
      twelveMinorStars.右足 = { 星: parts3.length >= 1 ? parts3[0].trim() : '', 点数: null };
      twelveMinorStars.左足 = { 星: parts3.length >= 3 ? parts3[2].trim() : '', 点数: null };

      // 十二大従星の点数を年齢テーブルから取得
      for (let i = bodyDiagramStart + 5; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('年齢')) continue; // ヘッダー
        if (line.includes('※算出')) break; // 終了

        const parts = line.split('\t').filter(p => p.trim());
        if (parts.length >= 4) {
          const age = parseInt(parts[0]);
          if (age === 2 && !isNaN(age)) {
            twelveMinorStars.左肩.点数 = getStarScore(parts[3]);
          }
        }
      }
    }

    const result = {
      誕生日: birthDate,
      性別: gender,
      陰占宿命: {
        四柱推命: fourPillars,
        十大主星: tenMajorStars,
        十二大従星: twelveMinorStars
      },
      生のテキスト: pageText.substring(0, 1000) // 最初の1000文字のみ保存
    };

    console.log(`✓ Calculation completed for ${birthDate}`);
    console.log(`  十大主星: 頭=${tenMajorStars.頭}, 胸=${tenMajorStars.胸}, 腹=${tenMajorStars.腹}`);
    console.log(`  十二大従星: 左肩=${twelveMinorStars.左肩?.星}, 左足=${twelveMinorStars.左足?.星}, 右足=${twelveMinorStars.右足?.星}`);

    return result;

  } catch (error) {
    console.error(`✗ Error calculating ${birthDate}:`, error.message);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * メイン処理
 */
async function main() {
  // 出力ディレクトリを作成
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  // ブラウザを起動
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const results = [];

    // 1983年8月11日（男性）を計算
    const result1 = await calculateFortune(browser, '1983-08-11', '男性');
    results.push(result1);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 待機

    // 1984年12月2日（男性）を計算
    const result2 = await calculateFortune(browser, '1984-12-02', '男性');
    results.push(result2);

    // 結果をJSONファイルに保存
    const outputJson = path.join(OUTPUT_DIR, 'expected_values_verified.json');
    await fs.writeFile(
      outputJson,
      JSON.stringify({ results }, null, 2),
      'utf8'
    );
    console.log(`\n✓ Results saved to: ${outputJson}`);

    // 結果を表示
    console.log('\n========================================');
    console.log('SUMMARY OF RESULTS');
    console.log('========================================');
    results.forEach(r => {
      console.log(`\n【${r.誕生日}（${r.性別}）】`);
      console.log('四柱推命:');
      console.log(`  年柱: ${r.陰占宿命.四柱推命.年柱}`);
      console.log(`  月柱: ${r.陰占宿命.四柱推命.月柱}`);
      console.log(`  日柱: ${r.陰占宿命.四柱推命.日柱}`);
      console.log('十大主星:');
      console.log(`  頭: ${r.陰占宿命.十大主星.頭}`);
      console.log(`  胸: ${r.陰占宿命.十大主星.胸}`);
      console.log(`  腹: ${r.陰占宿命.十大主星.腹}`);
      console.log(`  右手: ${r.陰占宿命.十大主星.右手}`);
      console.log(`  左手: ${r.陰占宿命.十大主星.左手}`);
      console.log('十二大従星:');
      console.log(`  左肩: ${r.陰占宿命.十二大従星.左肩.星} (${r.陰占宿命.十二大従星.左肩.点数}点)`);
      console.log(`  左足: ${r.陰占宿命.十二大従星.左足.星} (${r.陰占宿命.十二大従星.左足.点数}点)`);
      console.log(`  右足: ${r.陰占宿命.十二大従星.右足.星} (${r.陰占宿命.十二大従星.右足.点数}点)`);
    });

  } finally {
    await browser.close();
  }
}

// 実行
main().catch(console.error);
