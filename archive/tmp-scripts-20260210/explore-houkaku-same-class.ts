import { calculateKanshi } from '../mobile/lib/logic';

/**
 * 同学年範囲（1990年4月2日〜1991年4月1日）で鳳閣星がある生年月日を探索
 */

interface Result {
  date: string;
  dayPillar: string;
  tenchusatsu: string;
  yangSen: {
    head: string;
    leftHand: string;
    chest: string;
    belly: string;
  };
  juunishi: {
    leftShoulder: { name: string; score: number };
    rightLeg: { name: string; score: number };
    leftLeg: { name: string; score: number };
  };
  hasHoukaku: boolean;
  hasRokuso: boolean;
  hasChoujo: boolean;
}

const results: Result[] = [];
const startDate = new Date('1990-04-02');
const endDate = new Date('1991-04-01');

console.log('=================================================');
console.log('同学年範囲（1990年4月2日〜1991年4月1日）鳳閣星探索');
console.log('=================================================\n');

let currentDate = startDate;
let checkedCount = 0;
let houkakuFound = 0;

while (currentDate <= endDate) {
  checkedCount++;

  try {
    const result = calculateKanshi({
      birthDate: currentDate,
      gender: 'male',
      longitude: 135,
      includeTaiun: true,
      includeInsen: true
    });

    const hasHoukaku = Object.values(result.yangSen.twelveStars || {}).includes('鳳閣星');
    const hasRokuso = Object.values(result.yangSen.twelveStars || {}).includes('禄存星');
    const hasChoujo = Object.values(result.yangSen.twelveStars || {}).includes('調舒星');

    // 天中殺の判定
    const dayBranch = result.bazi.day.branchStr;
    const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const tenchusatsuPatterns: Record<string, number[]> = {
      '寅': [1, 2], '卯': [1, 2], '辰': [1, 2], '巳': [1, 2], '午': [1, 2], '未': [1, 2],
      '申': [3, 4], '酉': [3, 4], '戌': [3, 4], '亥': [3, 4],
      '子': [5, 6], '丑': [5, 6]
    };

    let tenchusatsu = 'なし';
    const ts = tenchusatsuPatterns[dayBranch];
    if (ts) {
      const tsBranches = ts.map(id => BRANCHES[id - 1]);
      tenchusatsu = tsBranches.join('・');
    }

    const dateStr = currentDate.toISOString().split('T')[0];

    const record: Result = {
      date: dateStr,
      dayPillar: `${result.bazi.day.stemStr}${result.bazi.day.branchStr}`,
      tenchusatsu,
      yangSen: {
        head: result.yangSen.head,
        leftHand: result.yangSen.leftHand,
        chest: result.yangSen.chest,
        belly: result.yangSen.belly
      },
      juunishi: {
        leftShoulder: result.yangSen.leftShoulder,
        rightLeg: result.yangSen.rightLeg,
        leftLeg: result.yangSen.leftLeg
      },
      hasHoukaku,
      hasRokuso,
      hasChoujo
    };

    results.push(record);

    if (hasHoukaku) {
      houkakuFound++;
      console.log(`\n✓ 鳳閣星発見: ${dateStr}`);
      console.log(`  日柱: ${record.dayPillar}`);
      console.log(`  天中殺: ${tenchusatsu}`);
      console.log(`  十大主星: ${record.yangSen.head}・${record.yangSen.leftHand}・${record.yangSen.chest}・${record.yangSen.belly}`);
      console.log(`  十二大従星: ${record.juunishi.leftShoulder.name}(${record.juunishi.leftShoulder.score}点)・${record.juunishi.rightLeg.name}(${record.juunishi.rightLeg.score}点)・${record.juunishi.leftLeg.name}(${record.juunishi.leftLeg.score}点)`);
    }

    // 進捗表示（50日ごと）
    if (checkedCount % 50 === 0) {
      console.log(`進捗: ${checkedCount}日チェック済み...`);
    }

  } catch (error) {
    // エラーはスキップ
  }

  // 次の日へ
  currentDate.setDate(currentDate.getDate() + 1);
}

console.log('\n=================================================');
console.log('探索結果サマリー');
console.log('=================================================');
console.log(`チェックした日数: ${checkedCount}日`);
console.log(`鳳閣星があった日数: ${houkakuFound}日`);
console.log(`鳳閣星発見率: ${(houkakuFound / checkedCount * 100).toFixed(1)}%`);

if (houkakuFound > 0) {
  console.log('\n=================================================');
  console.log('鳳閣星がある生年月日一覧');
  console.log('=================================================');

  const houkakuResults = results.filter(r => r.hasHoukaku);

  houkakuResults.forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.date}`);
    console.log(`   日柱: ${r.dayPillar}`);
    console.log(`   天中殺: ${r.tenchusatsu}`);
    console.log(`   十大主星: ${r.yangSen.head}・${r.yangSen.leftHand}・${r.yangSen.chest}・${r.yangSen.belly}`);
    console.log(`   十二大従星: ${r.juunishi.leftShoulder.name}(${r.juunishi.leftShoulder.score}点)・${r.juunishi.rightLeg.name}(${r.juunishi.rightLeg.score}点)・${r.juunishi.leftLeg.name}(${r.juunishi.leftLeg.score}点)`);
    console.log(`   禄存星: ${r.hasRokuso ? '○' : '×'}`);
    console.log(`   調舒星: ${r.hasChoujo ? '○' : '×'}`);
  });

  console.log('\n=================================================');
  console.log('物語重要要素チェック');
  console.log('=================================================');

  // 物語重要要素でフィルタリング
  const storyImportantResults = houkakuResults.filter(r => {
    return r.hasRokuso && r.hasChoujo && r.juunishi.leftShoulder.score === 12;
  });

  if (storyImportantResults.length > 0) {
    console.log(`\n✓ 条件を満たす日付: ${storyImportantResults.length}件`);

    storyImportantResults.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.date}`);
      console.log(`   日柱: ${r.dayPillar} | 天中殺: ${r.tenchusatsu}`);
      console.log(`   十大主星: ${r.yangSen.head}・${r.yangSen.leftHand}・${r.yangSen.chest}・${r.yangSen.belly}`);
      console.log(`   十二大従星: ${r.juunishi.leftShoulder.name}(12点)・${r.juunishi.rightLeg.name}(${r.juunishi.rightLeg.score}点)・${r.juunishi.leftLeg.name}(${r.juunishi.leftLeg.score}点)`);
    });
  } else {
    console.log('\n✗ すべての条件を満たす日付はありませんでした');
    console.log('   条件: 鳳閣星 + 禄存星 + 調舒星 + 天将星(12点)');

    console.log('\n部分的に一致する日付:');
    houkakuResults.forEach((r, i) => {
      const matches = [];
      if (r.hasRokuso) matches.push('禄存星');
      if (r.hasChoujo) matches.push('調舒星');
      if (r.juunishi.leftShoulder.score === 12) matches.push('天将星12点');

      console.log(`${i + 1}. ${r.date}: ${matches.length > 0 ? matches.join('・') : '(条件一致なし)'}`);
    });
  }
} else {
  console.log('\n✗ 鳳閣星がある日付は見つかりませんでした');
  console.log('\n=================================================');
  console.log('代替案：禄存星と調舒星がある日付');
  console.log('=================================================');

  const rokusoChoujoResults = results.filter(r => r.hasRokuso && r.hasChoujo);
  console.log(`該当数: ${rokusoChoujoResults.length}件`);

  if (rokusoChoujoResults.length > 0 && rokusoChoujoResults.length <= 20) {
    rokusoChoujoResults.slice(0, 20).forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.date}`);
      console.log(`   日柱: ${r.dayPillar} | 天中殺: ${r.tenchusatsu}`);
      console.log(`   十大主星: ${r.yangSen.head}・${r.yangSen.leftHand}・${r.yangSen.chest}・${r.yangSen.belly}`);
      console.log(`   十二大従星: ${r.juunishi.leftShoulder.name}(${r.juunishi.leftShoulder.score}点)・${r.juunishi.rightLeg.name}(${r.juunishi.rightLeg.score}点)・${r.juunishi.leftLeg.name}(${r.juunishi.leftLeg.score}点)`);
    });
  }
}

console.log('\n=================================================');
console.log('探索完了');
console.log('=================================================');
