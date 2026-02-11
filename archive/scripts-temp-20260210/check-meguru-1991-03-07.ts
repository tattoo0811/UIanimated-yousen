// Check Meguru's 命式 for 1991-03-07
import { calculateBaZi } from '../accurate-logic/src/index';

const date = new Date('1991-03-07T12:00:00');
const bazi = calculateBaZi(date, 135);

console.log('========== 巡（1991-03-07）の命式 ==========');
console.log('年柱:', bazi.year.name);
console.log('月柱:', bazi.month.name);
console.log('日柱:', bazi.day.name);
console.log('');
console.log('日干:', bazi.day.stemStr);
console.log('日支:', bazi.day.branchStr);
console.log('');

// 元の設定では「辛未（金陰・土陰）」である必要がある
console.log('元の設定: 日柱=辛未（金陰・土陰）');
console.log('計算結果: 日柱=' + bazi.day.name);
console.log('一致:', bazi.day.name === '辛未' ? '✅' : '❌');
console.log('');

if (bazi.day.name !== '辛未') {
  console.log('========================================');
  console.log('問題: 1991-03-07は辛未になりません');
  console.log('========================================');
  console.log('');
  console.log('次のステップ:');
  console.log('1. 朱学院で1991-03-07を確認');
  console.log('2. 1991年で「辛未」の日を探す');
  console.log('3. 適切な生年月日を再検討');
}
