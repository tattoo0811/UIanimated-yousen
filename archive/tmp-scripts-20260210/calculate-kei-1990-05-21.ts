import { calculateKanshi } from '../mobile/lib/logic';

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 藤堂慧（1990年5月21日生まれ）の命式計算
 *
 * 物語上の設定:
 * - 年齢: 36歳（2026年時点）
 * - 西洛大学理学類入学（2009年）→ 工学部編入（2011年）
 * - NeuralWorks入社（2012年）→ Horizon Capital入社（2014年）
 * - MedAI設立（2017年）
 * - 巡を裏切り（2019年）
 */

// 1990年5月21日 12:00生まれ（仮定）
const birthDate = new Date('1990-05-21T12:00:00');
const gender: 'male' = 'male';

console.log('=================================================');
console.log('藤堂慧（1990年5月21日生まれ）命式計算結果');
console.log('=================================================\n');

const result = calculateKanshi({
  birthDate,
  gender,
  longitude: 135, // 日本標準時
  includeTaiun: true,
  includeInsen: true
});

// 結果を表示
console.log('【四柱推命】');
console.log(`年柱: ${result.bazi.year.name} (${result.bazi.year.stemStr}${result.bazi.year.branchStr})`);
console.log(`月柱: ${result.bazi.month.name} (${result.bazi.month.stemStr}${result.bazi.month.branchStr})`);
console.log(`日柱: ${result.bazi.day.name} (${result.bazi.day.stemStr}${result.bazi.day.branchStr})`);
console.log(`時柱: ${result.bazi.hour.name} (${result.bazi.hour.stemStr}${result.bazi.hour.branchStr})`);
console.log('');

console.log('【十大主星 - 人体図】');
console.log('');
console.log('        頭');
console.log(`       ${result.yangSen.head}`);
console.log('');
console.log('   左手   胸');
console.log(`  ${result.yangSen.leftHand} ${result.yangSen.chest}`);
console.log('');
console.log('        腹');
console.log(`       ${result.yangSen.belly}`);
console.log('');

console.log('【十二大従星】');
console.log(`左肩: ${result.yangSen.leftShoulder.name} (${result.yangSen.leftShoulder.score}点)`);
console.log(`右足: ${result.yangSen.rightLeg.name} (${result.yangSen.rightLeg.score}点)`);
console.log(`左足: ${result.yangSen.leftLeg.name} (${result.yangSen.leftLeg.score}点)`);
console.log(`合計: ${result.yangSen.leftShoulder.score + result.yangSen.rightLeg.score + result.yangSen.leftLeg.score}点`);
console.log('');

console.log('【五行バランス】');
console.log(`木: ${result.fiveElements.wood}`);
console.log(`火: ${result.fiveElements.fire}`);
console.log(`土: ${result.fiveElements.earth}`);
console.log(`金: ${result.fiveElements.metal}`);
console.log(`水: ${result.fiveElements.water}`);
console.log('');

console.log('【エネルギー点数】');
console.log(`${result.energyScore}点 / 120点`);
console.log('');

// 天中殺チェック
console.log('\n--- 天中殺チェック ---');
const dayBranch = result.bazi.day.branchStr;
const dayBranchId = result.bazi.day.branch;

console.log(`日支: ${dayBranch} (ID: ${dayBranchId})`);

// 天中殺判定（日支ベース）
const tenchusatsuPatterns = {
  '寅': [1, 2], // 申酉
  '卯': [1, 2],
  '辰': [1, 2],
  '巳': [1, 2],
  '午': [1, 2],
  '未': [1, 2],
  '申': [3, 4], // 寅卯
  '酉': [3, 4],
  '戌': [3, 4],
  '亥': [3, 4],
  '子': [5, 6], // 巳午
  '丑': [5, 6]
};

const ts = tenchusatsuPatterns[dayBranch as keyof typeof tenchusatsuPatterns];
if (ts) {
  const tsBranches = ts.map(id => BRANCHES[id - 1]);
  console.log(`天中殺: ${tsBranches.join('・')}`);
}

// 十大主星チェック
console.log('\n--- 十大主星チェック ---');
console.log('人体図配置:');
console.log(`        頭: ${result.yangSen.head}`);
console.log(`   左手   胸`);
console.log(`  ${result.yangSen.leftHand}   ${result.yangSen.chest}`);
console.log(`        腹: ${result.yangSen.belly}`);
console.log(`   右手: ${result.yangSen.rightHand}`);

// 禄存星の有無
const hasRokuso = result.yangSen.head === '禄存星';
console.log(`\n禄存星: ${hasRokuso ? '✓ あり（頭）' : '✗ なし'}`);

// 鳳閣星の有無
const hasHoukaku = result.yangSen.rightHand === '鳳閣星';
console.log(`鳳閣星: ${hasHoukaku ? '✓ あり（右手）' : '✗ なし'}`);

// 調舒星の有無
const hasChoujo = result.yangSen.belly === '調舒星';
console.log(`調舒星: ${hasChoujo ? '✓ あり（腹）' : '✗ なし'}`);

console.log('\n=================================================');
console.log('整合性チェック結果');
console.log('=================================================');

// 物語の記述との照合
const checks = {
  '同学年（巡:1991年3月7日）': true, // 1990年5月21日と1991年3月7日は同学年
  '禄存星: あり': hasRokuso,
  '鳳閣星: あり': hasHoukaku,
  '調舒星: あり': hasChoujo
};

console.log('\n物語の記述との照合:');
Object.entries(checks).forEach(([key, value]) => {
  console.log(`  ${value ? '✓' : '✗'} ${key}: ${value ? '一致' : '不一致'}`);
});

const allMatch = Object.values(checks).every(v => v);
console.log(`\n結論: ${allMatch ? '✓ すべて一致 - このままでOK' : '✗ 不一致あり - 要確認'}`);
