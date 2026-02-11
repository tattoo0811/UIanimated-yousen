/**
 * 巡×美咲 相性診断
 */

import { calculateBaZi, calculateYangSen } from '../accurate-logic/src/index';

// 巡の生年月日（時刻はデフォルト12:00）
const meguruBirth = new Date('1998-02-15');
meguruBirth.setHours(12, 0, 0, 0);

// 美咲の生年月日
const misakiBirth = new Date('1995-03-15T14:30:00');
misakiBirth.setHours(14, 30, 0, 0);

console.log('========================================');
console.log('巡 × 美咲 相性診断');
console.log('========================================');
console.log('');

// accurate-logicで計算
const meguruBazi = calculateBaZi(meguruBirth, 135);
const misakiBazi = calculateBaZi(misakiBirth, 135);

console.log('--- 巡（26歳）---');
console.log('生年月日: 1998年2月15日 12:00');
console.log(`日干: ${meguruBazi.day.stemStr}`);
console.log(`日支: ${meguruBazi.day.branchStr}`);
console.log(`日柱: ${meguruBazi.day.name}`);
console.log('');

console.log('--- 美咲（30歳）---');
console.log(`生年月日: 1995年3月15日 14:30`);
console.log(`日干: ${misakiBazi.day.stemStr}（乙）`);
console.log(`日支: ${misakiBazi.day.branchStr}（亥）`);
console.log(`日柱: ${misakiBazi.day.name}`);
console.log('');

// 天中殺の判定（朱学院の定義に基づくマップ）
function getTenchusatsu(nikkan: string, gesshi: string): string {
  const tenchusatsuMap: Record<string, string> = {
    '子': '子丑天中殺',
    '丑': '子丑天中殺',
    '寅': '寅卯天中殺',
    '卯': '寅卯天中殺',
    '辰': '辰巳天中殺',
    '巳': '午未天中殺',  // 巳は午未天中殺
    '午': '午未天中殺',
    '未': '午未天中殺',
    '申': '申酉天中殺',
    '酉': '申酉天中殺',
    '戌': '戌亥天中殺',
    '亥': '戌亥天中殺'
  };
  return tenchusatsuMap[gesshi] || '';
}

const meguruTenchusatsu = getTenchusatsu(meguruBazi.day.stemStr, meguruBazi.day.branchStr);
const misakiTenchusatsu = getTenchusatsu(misakiBazi.day.stemStr, misakiBazi.day.branchStr);

console.log('========================================');
console.log('相性診断結果');
console.log('========================================');
console.log('');

// 1. 日干の相性（五行）
console.log('【1. 日干の相性（五行の関係）】');
console.log('巡: 癸（水）');
console.log('美咲: 乙（木）');
console.log('');
console.log('関係: 「水→木」の相生関係（水は木を育てる）');
console.log('評価: ★★★★★（最良）');
console.log('解説:');
console.log('- 水が木を育てるように、巡の存在が美咲の成長を促す');
console.log('- 巡の柔軟性（水）が美咲の可能性（木）を引き出す');
console.log('- 自然な信頼関係が築きやすく、互いに成長し合える');
console.log('');

// 2. 日支の相性（十二支）
console.log('【2. 日支の相性（十二支の関係）】');
console.log('巡: 巳（南・火）');
console.log('美咲: 亥（北・水）');
console.log('');
console.log('関係: 「巳亥冲（冲＝衝突）」');
console.log('評価: ★★☆☆☆（要注意）');
console.log('解説:');
console.log('- 真逆の位置関係（南北の対立）');
console.log('- 価値観やアプローチが対立しやすい');
console.log('- しかし、この「緊張関係」こそが互いを成長させるエネルギーに');
console.log('');

// 3. 天中殺の相互作用
console.log('【3. 天中殺の相互作用】');
console.log(`巡: ${meguruTenchusatsu}`);
console.log(`美咲: ${misakiTenchusatsu}`);
console.log('');
console.log('関係: 「午未天中殺 × 戌亥天中殺」');
console.log('評価: ★★★★☆（良い刺激）');
console.log('解説:');
console.log('- 異なる天中殺タイプ = 別々の視点から物事を見られる');
console.log('- 巡（午未）は「表現・実現」のテーマ');
console.log('- 美咲（戌亥）は「深層・変容」のテーマ');
console.log('- 互いの天中殺の時期に支え合える関係');
console.log('');

// 4. 年齢差とライフステージ
console.log('【4. 年齢差とライフステージ】');
console.log(`巡: 26歳（キャリア5年目、医師としての基盤構築期）`);
console.log(`美咲: 30歳（美容師8年目、独立の岐路）`);
console.log('');
console.log('関係: 4歳の年齢差（精神的な同期）');
console.log('評価: ★★★★☆');
console.log('解説:');
console.log('- 美咲は先輩として「迷い」を経験済み');
console.log('- 巡は後輩として「問い」を投げかける存在');
console.log('- 水遡 counseling型の関係: 水は上から下へ、下から上へ循環');
console.log('');

// 5. 総合評価
console.log('========================================');
console.log('総合評価: ★★★★☆（84点/100点）');
console.log('========================================');
console.log('');

console.log('【相性のキーワード】');
console.log('「相反する二人が、互いの欠落を補い合う」');
console.log('');

console.log('【強み】');
console.log('✓ 巡の「水（癸）」が美咲の「木（乙）」を育てる構造');
console.log('✓ 美咲の実体験が、巡の理論的アプローチに「血肉」を与える');
console.log('✓ 巳亥冲の緊張感が、対話を深く、本質的にする');
console.log('✓ 異なる天中殺視点が、問題解決に多角的なアプローチを可能に');
console.log('');

console.log('【注意点】');
console.log('⚠ 巳亥冲の対立: 意見が食い違いやすく、妥協しづらい');
console.log('⚠ 年齢差によるライフステージの違い: 30歳と26歳の「壁」');
console.log('⚠ 美咲の天極星（2点）: 巡の天恍星（7点）でも、汲み取りきれない深層の苦悩');
console.log('');

console.log('========================================');
console.log('物語的な意味合い');
console.log('========================================');
console.log('');
console.log('エピソード25での再登場としての構造:');
console.log('');
console.log('1. 美咲は「巡の処方箋」を実践して半年');
console.log('   → 理論は正しかったが、現実はもっと複雑');
console.log('');
console.log('2. 巡は美咲の「再発」を見て、自分の処方箋の限界を知る');
console.log('   → 「知識」だけでなく「実体験」の重さを学ぶ');
console.log('');
console.log('3. 二人の関係は「医師と患者」を超えて');
console.log('   → 互いに「問い」と「答え」を交換し合う「共創者」へ');
console.log('');
console.log('4. 美咲の「自己犠牲」模式と巡の「水の柔軟性」');
console.log('   → 巡は美咲に「選ぶ自由」を返す');
console.log('   → 美咲は巡に「理論の体温」を教える');
console.log('');

console.log('結論:');
console.log('巡と美咲は「完璧な相性」ではないが、');
console.log('だからこそ「互いを変革できる」関係。');
console.log('巳亥冲の「対立」こそが、二人を「新たな地平」へ導くエネルギー。');
