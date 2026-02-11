import { calculateKanshi } from '../mobile/lib/logic';

/**
 * 1995年9月14日 女性（日柱: 戊申）の詳細検証
 */

const birthDate = new Date('1995-09-14T12:00:00');
const gender: 'female' = 'female';

console.log('=================================================');
console.log('1995年9月14日 女性（日柱: 戊申）詳細検証');
console.log('=================================================\n');

const result = calculateKanshi({
  birthDate,
  gender,
  longitude: 135,
  includeTaiun: true,
  includeInsen: true
});

// 四柱推命
console.log('【四柱推命】');
console.log(`年柱: ${result.bazi.year.name} (${result.bazi.year.stemStr}${result.bazi.year.branchStr}) ID:${result.bazi.year.id}`);
console.log(`月柱: ${result.bazi.month.name} (${result.bazi.month.stemStr}${result.bazi.month.branchStr}) ID:${result.bazi.month.id}`);
console.log(`日柱: ${result.bazi.day.name} (${result.bazi.day.stemStr}${result.bazi.day.branchStr}) ID:${result.bazi.day.id}`);
console.log(`時柱: ${result.bazi.hour.name} (${result.bazi.hour.stemStr}${result.bazi.hour.branchStr}) ID:${result.bazi.hour.id}`);
console.log('');

// 陰占の天中殺（正しい計算）
console.log('【天中殺（陰占）】');
console.log(`タイプ: ${result.insen.tenchusatsu.type}`);
console.log(`空亡: ${result.insen.tenchusatsu.missingBranches.join('・')}`);
console.log('');

// 陽占（人体図）
console.log('【十大主星 - 人体図】');
console.log(`        頭: ${result.yangSen.head}`);
console.log(`   左手   胸: ${result.yangSen.leftHand}   ${result.yangSen.chest}`);
console.log(`        腹: ${result.yangSen.belly}`);
console.log(`   右手: ${result.yangSen.rightHand}`);
console.log('');

// 十二大従星
console.log('【十二大従星】');
console.log(`左肩: ${result.yangSen.leftShoulder.name} (${result.yangSen.leftShoulder.score}点)`);
console.log(`右足: ${result.yangSen.rightLeg.name} (${result.yangSen.rightLeg.score}点)`);
console.log(`左足: ${result.yangSen.leftLeg.name} (${result.yangSen.leftLeg.score}点)`);
console.log(`合計: ${result.yangSen.leftShoulder.score + result.yangSen.rightLeg.score + result.yangSen.leftLeg.score}点`);
console.log('');

// 五行バランス
console.log('【五行バランス】');
console.log(`木: ${result.fiveElements.wood}`);
console.log(`火: ${result.fiveElements.fire}`);
console.log(`土: ${result.fiveElements.earth}`);
console.log(`金: ${result.fiveElements.metal}`);
console.log(`水: ${result.fiveElements.water}`);
console.log('');

// エネルギー点数
console.log('【エネルギー点数】');
console.log(`${result.energyScore}点 / 120点`);
console.log('');

// ユーザー確認値との照合
console.log('=================================================');
console.log('ユーザー確認値との照合');
console.log('=================================================');

const userConfirmedChest = '調舒星';
const actualChest = result.yangSen.chest;

console.log(`\n胸の値:`);
console.log(`  ユーザー確認値: ${userConfirmedChest}`);
console.log(`  計算値: ${actualChest}`);
console.log(`  一致: ${userConfirmedChest === actualChest ? '✓' : '✗'}`);

const userConfirmedTenchusatsu = '寅卯';
const actualTenchusatsu = result.insen.tenchusatsu.type;

console.log(`\n天中殺:`);
console.log(`  ユーザー確認値: ${userConfirmedTenchusatsu}天中殺`);
console.log(`  計算値: ${actualTenchusatsu}`);
console.log(`  一致: ${userConfirmedTenchusatsu === actualTenchusatsu ? '✓' : '✗'}`);

// 蔵干の詳細確認
console.log('\n=================================================');
console.log('蔵干の詳細確認');
console.log('=================================================');

console.log(`\n日支（申）の蔵干: ${result.bazi.day.hiddenStems.join('・')}`);
console.log(`月支（酉）の蔵干: ${result.bazi.month.hiddenStems.join('・')}`);
console.log(`年支（亥）の蔵干: ${result.bazi.year.hiddenStems.join('・')}`);

// 節入りからの日数計算
const SOLAR_TERM_APPROX_DAYS = {
  1: 6, 2: 4, 3: 6, 4: 5, 5: 6, 6: 6,
  7: 7, 8: 8, 9: 8, 10: 8, 11: 7, 12: 7
};
const month = birthDate.getMonth() + 1;
const day = birthDate.getDate();
const solarTermDay = SOLAR_TERM_APPROX_DAYS[month];
const daysFromSolarTerm = day - solarTermDay + 1;

console.log(`\n節入りからの日数: ${daysFromSolarTerm}日目`);
console.log(`9月の節入り: 白露（9月8日頃）`);

console.log('\n=================================================');
console.log('検証完了');
console.log('=================================================');
