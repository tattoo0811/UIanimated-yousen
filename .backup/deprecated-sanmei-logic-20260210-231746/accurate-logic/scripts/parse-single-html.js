/**
 * 単一HTMLファイルから朱学院の結果を解析
 */

const fs = require('fs').promises;

async function parseSingleHtml() {
  const html = await fs.readFile('/Users/kitamuratatsuhiko/UIanimated/accurate-logic/data/single-1980-1-24.html', 'utf8');

  console.log('=== HTML解析開始 ===\n');

  // 四柱推命の抽出
  const fourPillarsMatch = html.match(/<td class="result-eto"[^>]*data-id="([^"]+)"/g);
  console.log('【四柱推命】');
  if (fourPillarsMatch) {
    fourPillarsMatch.forEach((match, i) => {
      const name = match.match(/data-id="([^"]+)"/)[1];
      const pillarNames = ['年柱', '月柱', '日柱'];
      console.log(`  ${pillarNames[i]}: ${name}`);
    });
  }

  // 十大主星の抽出（result-table2）
  const tenMajorTableMatch = html.match(/<table class="result-table2">([\s\S]*?)<\/table>/);
  if (tenMajorTableMatch) {
    const tableHtml = tenMajorTableMatch[1];
    const starMatches = tableHtml.match(/<div class="font15">([^<]+)<\/div>/g);
    console.log('\n【十大主星】');
    const positions = ['頭', '胸', '腹', '右手', '左手'];
    if (starMatches) {
      starMatches.forEach((match, i) => {
        const starName = match.match(/<div class="font15">([^<]+)<\/div>/)[1];
        console.log(`  ${positions[i]}: ${starName}`);
      });
    } else {
      console.log('  (見つかりませんでした)');
      // デバッグ用: テーブル内の全テキストを表示
      const allText = tableHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(`  デバッグ: "${allText.substring(0, 200)}"`);
    }
  }

  // 十二大従星の抽出
  const twelveMinorTableMatch = html.match(/<table class="result-table3">([\s\S]*?)<\/table>/);
  if (twelveMinorTableMatch) {
    const tableHtml = twelveMinorTableMatch[1];
    const starMatches = tableHtml.match(/<div class="font15">([^<]+)<\/div>/g);
    console.log('\n【十二大従星】');
    const positions = ['左肩', '左足', '右足'];
    if (starMatches) {
      starMatches.forEach((match, i) => {
        const starName = match.match(/<div class="font15">([^<]+)<\/div>/)[1];
        console.log(`  ${positions[i]}: ${starName}`);
      });
    } else {
      console.log('  (見つかりませんでした)');
      // デバッグ用
      const allText = tableHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(`  デバッグ: "${allText.substring(0, 200)}"`);
    }
  }

  // 蔵干の表示（確認用）
  const hiddenStemMatch = html.match(/蔵干.*?<td[^>]*>([^<]+)<\/td>/g);
  if (hiddenStemMatch) {
    console.log('\n【蔵干】');
    hiddenStemMatch.forEach((match, i) => {
      const stem = match.match(/<td[^>]*>([^<]+)<\/td>/)[1];
      console.log(`  ${i + 1}: ${stem}`);
    });
  }
}

parseSingleHtml().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
