const fs = require('fs').promises;
const path = require('path');

async function checkHTML() {
  const htmlPath = path.join(__dirname, '../claudedocs/html/random_1.html');
  const html = await fs.readFile(htmlPath, 'utf8');

  // テキスト化
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  // 最初の5000文字を表示
  console.log('===== 最初の5000文字 =====');
  console.log(text.substring(0, 5000));

  // キーワード検索
  const keywords = ['日干', '日支', '月柱', '年柱', '時柱', '命式', '運命', '鑑定', '従星', '本命'];
  console.log('\n===== キーワード検索 =====');
  for (const keyword of keywords) {
    const found = text.includes(keyword);
    console.log(`${keyword}: ${found ? '✅' : '❌'}`);
    if (found) {
      const index = text.indexOf(keyword);
      console.log(`  位置: ${index}`);
      console.log(`  周辺: ...${text.substring(Math.max(0, index - 50), index + 100)}...`);
    }
  }
}

checkHTML().catch(console.error);
