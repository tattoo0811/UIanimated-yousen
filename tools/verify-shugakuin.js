#!/usr/bin/env node

/**
 * 朱学院自動検証スクリプト
 *
 * 使い方:
 *   node verify-shugakuin.js <name> <birthdate> <birthtime> <gender>
 *
 * 例:
 *   node verify-shugakuin.js "涼子" "1977-08-20" "14:00" "female"
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * 朱学院サイトで算命学データを検証
 */
async function verifyAtShugakuin(params) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`\n=== 朱学院検証開始: ${params.name} ===\n`);

    // サイトアクセス
    console.log('1. サイトアクセス...');
    await page.goto('https://www.shugakuin.co.jp/fate_calculation', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // ページが完全に読み込まれるまで待機
    await page.waitForTimeout(2000);

    // データ入力
    console.log('2. データ入力...');
    const [year, month, day] = params.birthDate.split('-');
    const [hour, minute] = params.birthTime.split(':');

    // 生年月日入力（セレクタまたは入力フォーム）
    try {
      await page.selectOption('select[name="birth_year"]', year, { timeout: 5000 });
    } catch {
      await page.fill('input[name="birth_year"]', year);
    }

    try {
      await page.selectOption('select[name="birth_month"]', month.padStart(2, '0'), { timeout: 5000 });
    } catch {
      await page.fill('input[name="birth_month"]', month.padStart(2, '0'));
    }

    try {
      await page.selectOption('select[name="birth_day"]', day.padStart(2, '0'), { timeout: 5000 });
    } catch {
      await page.fill('input[name="birth_day"]', day.padStart(2, '0'));
    }

    // 出生時刻入力
    try {
      await page.selectOption('select[name="birth_hour"]', hour.padStart(2, '0'), { timeout: 5000 });
    } catch {
      await page.fill('input[name="birth_hour"]', hour.padStart(2, '0'));
    }

    try {
      await page.selectOption('select[name="birth_minute"]', minute.padStart(2, '0'), { timeout: 5000 });
    } catch {
      await page.fill('input[name="birth_minute"]', minute.padStart(2, '0'));
    }

    // 性別選択
    if (params.gender === 'male') {
      await page.click('input[value="male"]', { timeout: 5000 });
    } else {
      await page.click('input[value="female"]', { timeout: 5000 });
    }

    // 場所選択（オプション）
    if (params.location) {
      try {
        await page.selectOption('select[name="location"]', params.location, { timeout: 3000 });
      } catch {
        // 場所セレクタがない場合はスキップ
        console.log('  場所セレクタが見つかりません。スキップします。');
      }
    }

    // 結果計算ボタンクリック
    console.log('3. 結果計算実行...');
    try {
      await page.click('button[type="submit"], button:has-text("計算する"), input[type="submit"]', { timeout: 5000 });
    } catch {
      // 複数の可能性を試す
      await page.click('button', { timeout: 5000 });
    }

    // 結果表示を待機
    console.log('4. 結果取得中...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // スクリーンショット保存
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotDir = '/Users/kitamuratatsuhiko/UIanimated/claudedocs/screenshots/shugakuin';

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, `${params.name}-${timestamp}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`  スクリーンショット保存: ${screenshotPath}`);

    // データ抽出
    console.log('5. データ抽出...');

    // 四柱推命
    const fourPillars = await page.evaluate(() => {
      // 様々な可能性を試す
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent?.trim() : null;
      };

      const year = getText('.year-pillar')
        || getText('[class*="year"]')
        || getText('.pillar-year');

      const month = getText('.month-pillar')
        || getText('[class*="month"]')
        || getText('.pillar-month');

      const day = getText('.day-pillar')
        || getText('[class*="day"]')
        || getText('.pillar-day');

      const hour = getText('.hour-pillar')
        || getText('[class*="hour"]')
        || getText('.pillar-hour');

      if (!year || !month || !day) {
        throw new Error('四柱推命の取得に失敗しました');
      }

      return {
        year: year,
        month: month,
        day: day,
        hour: hour || '不明'
      };
    });

    // 十大主星
    const jugdai = await page.evaluate(() => {
      // 人体図の構造に基づいてセレクタを試す
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent?.trim() : null;
      };

      // 様々なセレクタパターン
      const selectors = {
        head: [
          '.jugdai-head',
          '[class*="head"]',
          '.star-head',
          '.position-head'
        ],
        chest: [
          '.jugdai-chest',
          '[class*="chest"]',
          '.star-center',
          '.position-chest'
        ],
        belly: [
          '.jugdai-belly',
          '[class*="belly"]',
          '.star-belly',
          '.position-belly'
        ],
        rightHand: [
          '.jugdai-right-hand',
          '[class*="right-hand"]',
          '.star-right-hand',
          '.position-right-hand'
        ],
        leftHand: [
          '.jugdai-left-hand',
          '[class*="left-hand"]',
          '.star-left-hand',
          '.position-left-hand'
        ]
      };

      const getStar = (selectorList) => {
        for (const selector of selectorList) {
          const text = getText(selector);
          if (text) return text;
        }
        return null;
      };

      return {
        head: getStar(selectors.head) || '取得失敗',
        chest: getStar(selectors.chest) || '取得失敗',
        belly: getStar(selectors.belly) || '取得失敗',
        rightHand: getStar(selectors.rightHand) || '取得失敗',
        leftHand: getStar(selectors.leftHand) || '取得失敗'
      };
    });

    // 十二大従星
    const junidai = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent?.trim() : null;
      };

      const selectors = {
        leftShoulder: [
          '.junidai-left-shoulder',
          '[class*="left-shoulder"]',
          '.star-left-shoulder'
        ],
        leftLeg: [
          '.junidai-left-leg',
          '[class*="left-leg"]',
          '.star-left-leg'
        ],
        rightLeg: [
          '.junidai-right-leg',
          '[class*="right-leg"]',
          '.star-right-leg'
        ]
      };

      const getStar = (selectorList) => {
        for (const selector of selectorList) {
          const text = getText(selector);
          if (text) return text;
        }
        return null;
      };

      return {
        leftShoulder: getStar(selectors.leftShoulder) || '取得失敗',
        leftLeg: getStar(selectors.leftLeg) || '取得失敗',
        rightLeg: getStar(selectors.rightLeg) || '取得失敗'
      };
    });

    // 天中殺
    const tenchusatsu = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent?.trim() : null;
      };

      return getText('.tenchusatsu')
        || getText('[class*="tenchusatsu"]')
        || getText('.ten-chusatsu')
        || '不明';
    });

    // 結果を表示
    console.log('\n=== 検証結果 ===\n');
    console.log('【四柱推命】');
    console.log(`  年柱: ${fourPillars.year}`);
    console.log(`  月柱: ${fourPillars.month}`);
    console.log(`  日柱: ${fourPillars.day}`);
    console.log(`  時柱: ${fourPillars.hour}`);

    console.log('\n【十大主星】');
    console.log(`  頭: ${jugdai.head}`);
    console.log(`  胸: ${jugdai.chest}`);
    console.log(`  腹: ${jugdai.belly}`);
    console.log(`  右手: ${jugdai.rightHand}`);
    console.log(`  左手: ${jugdai.leftHand}`);

    console.log('\n【十二大従星】');
    console.log(`  左肩: ${junidai.leftShoulder}`);
    console.log(`  左足: ${junidai.leftLeg}`);
    console.log(`  右足: ${junidai.rightLeg}`);

    console.log(`\n天中殺: ${tenchusatsu}`);

    // JSONファイルにも保存
    const resultJson = {
      params,
      data: {
        basicInfo: {
          name: params.name,
          birthDate: params.birthDate,
          birthTime: params.birthTime,
          gender: params.gender,
          location: params.location
        },
        fourPillars,
        jugdai,
        junidai,
        tenchusatsu,
        screenshot: screenshotPath,
        verifiedAt: new Date().toISOString()
      }
    };

    const jsonPath = path.join(screenshotDir, `${params.name}-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(resultJson, null, 2), 'utf-8');
    console.log(`  JSON保存: ${jsonPath}`);

    return {
      success: true,
      params,
      data: resultJson.data,
      screenshot: screenshotPath
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ エラーが発生しました: ${errorMsg}\n`);

    return {
      success: false,
      params,
      error: errorMsg
    };

  } finally {
    await context.close();
    await browser.close();
  }
}

// コマンドライン引数の解析
const args = process.argv.slice(2);

if (args.length < 4) {
  console.error(`
使い方: node verify-shugakuin.js <name> <birthdate> <birthtime> <gender>

例:
  node verify-shugakuin.js "涼子" "1977-08-20" "14:00" "female"

引数:
  name: キャラクター名
  birthdate: 生年月日 (YYYY-MM-DD)
  birthtime: 出生時刻 (HH:MM)
  gender: 性別 (male または female)
  location: 場所 (オプション)
  `);
  process.exit(1);
}

const [name, birthDate, birthTime, gender, location] = args;

const params = {
  name,
  birthDate,
  birthTime,
  gender: gender,
  location
};

// 検証実行
verifyAtShugakuin(params)
  .then(result => {
    if (result.success) {
      console.log('\n✅ 検証完了！');
      process.exit(0);
    } else {
      console.error('\n❌ 検証失敗:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 予期せぬエラー:', error);
    process.exit(1);
  });
