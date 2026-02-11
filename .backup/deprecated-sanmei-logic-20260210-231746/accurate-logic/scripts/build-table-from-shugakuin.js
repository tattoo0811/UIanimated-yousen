/**
 * 朱学院から十大主星表を構築
 * 特定の日干について、すべての天干の組み合わせをテスト
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function buildTenGreatStarTable() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    // 日干=甲のケースについて、すべての天干（甲乙丙丁戊己庚辛壬癸）をテスト
    // 年干を変えることで頭の星を取得できる

    const dayStem = '甲'; // 日干
    const targetYears = [
      { year: 2024, month: 2, day: 10, name: '甲年' },   // 年干=甲
      { year: 2025, month: 2, day: 4, name: '乙年' },    // 年干=乙（1985年2月4日は乙年）
      { year: 2026, month: 2, day: 4, name: '丙年' },    // 年干=丙
      { year: 2027, month: 2, day: 4, name: '丁年' },    // 年干=丁
      { year: 2028, month: 2, day: 5, name: '戊年' },    // 年干=戊
      { year: 2029, month: 2, day: 4, name: '己年' },    // 年干=己
      { year: 2030, month: 2, day: 4, name: '庚年' },    // 年干=庚
      { year: 2031, month: 2, 4, name: '辛年' },         // 年干=辛
      { year: 2032, month: 2, day: 5, name: '壬年' },    // 年干=壬
      { year: 2033, month: 2, day: 4, name: '癸年' },    // 年干=癸
    ];

    console.log(`=== 日干=${dayStem}の十大主星表を構築 ===\n`);

    const results = [];

    for (const target of targetYears) {
      const url = `https://www.shugakuin.co.jp/fate_calculation?ge=1&ye=${target.year}&mo=${target.month}&da=${target.day}&button=`;

      console.log(`テスト中: ${target.name} (${target.year}-${target.month}-${target.day})`);

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const starName = await page.evaluate(() => {
        // 頭（日干×年干）の星を取得
        const headStar = document.querySelector('table.result-table2 td:nth-child(1) .font15');
        return headStar ? headStar.textContent.trim() : '';
      });

      if (starName) {
        results.push({ targetStem: target.name[0], star: starName });
        console.log(`  ${dayStem} × ${target.name[0]} = ${starName}`);
      }

      // 待機して負荷を軽減
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n=== 結果まとめ ===\n');
    results.forEach(r => {
      console.log(`['${r.star}',`); // テーブル行用のフォーマット
    });

    await browser.close();

    return results;

  } catch (error) {
    console.error('エラー:', error);
    await browser.close();
    throw error;
  }
}

// 実行
buildTenGreatStarTable().catch(error => {
  console.error('致命的なエラー:', error);
  process.exit(1);
});
