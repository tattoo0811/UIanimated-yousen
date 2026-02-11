/**
 * 算命学計算テストスクリプト
 * meguri-96episodes-final.json から抽出したキャラクターの生年月日を使用
 */

import { calculateKanshi } from '../mobile/lib/logic';

interface TestCharacter {
  name: string;
  birthDate: string;
  expected?: {
    centerStar?: string;
    description?: string;
  };
}

const testCharacters: TestCharacter[] = [
  { name: "佐藤 翔", birthDate: "2003-02-20" },
  { name: "神谷 優", birthDate: "1996-01-19" },
  { name: "小鳥遊 健", birthDate: "1987-02-24" },
  { name: "岩田 美月", birthDate: "1999-02-12" },
  { name: "五十嵐 陽菜", birthDate: "2001-02-12" },
  { name: "八木 澪", birthDate: "1994-01-31" },
  { name: "熊田 誠一", birthDate: "1976-01-07" },
  { name: "奥田 沙織", birthDate: "1989-02-18" },
  { name: "辻本 龍一", birthDate: "1997-02-27" },
  { name: "犬養 茜", birthDate: "1996-02-24" },
  { name: "月岡 蒼", birthDate: "1994-01-16" },
  { name: "天野 奏", birthDate: "2002-01-15" },
];

function formatKanshiResult(character: TestCharacter, result: any) {
  console.log('\n' + '='.repeat(80));
  console.log(`キャラクター: ${character.name} (${character.birthDate})`);
  console.log('='.repeat(80));

  // 四柱推命
  console.log('\n【四柱推命】');
  console.log(`年柱: ${result.bazi.year.name} (${result.bazi.year.stemStr}${result.bazi.year.branchStr})`);
  console.log(`月柱: ${result.bazi.month.name} (${result.bazi.month.stemStr}${result.bazi.month.branchStr})`);
  console.log(`日柱: ${result.bazi.day.name} (${result.bazi.day.stemStr}${result.bazi.day.branchStr})`);
  console.log(`時柱: ${result.bazi.hour.name} (${result.bazi.hour.stemStr}${result.bazi.hour.branchStr})`);

  // 陽占（十大主星）
  console.log('\n【十大主星 - 人体図】');
  console.log(`頭:   ${result.yangSen.head}`);
  console.log(`胸:   ${result.yangSen.chest}`);
  console.log(`腹:   ${result.yangSen.belly}`);
  console.log(`左手: ${result.yangSen.leftHand}`);
  console.log(`右手: ${result.yangSen.rightHand}`);

  // 十二大従星
  console.log('\n【十二大従星】');
  console.log(`左肩: ${result.yangSen.leftShoulder.name} (${result.yangSen.leftShoulder.score}点)`);
  console.log(`右足: ${result.yangSen.rightLeg.name} (${result.yangSen.rightLeg.score}点)`);
  console.log(`左足: ${result.yangSen.leftLeg.name} (${result.yangSen.leftLeg.score}点)`);
  const totalScore = result.yangSen.leftShoulder.score + result.yangSen.rightLeg.score + result.yangSen.leftLeg.score;
  console.log(`合計: ${totalScore}点`);

  // 五行バランス
  console.log('\n【五行バランス】');
  console.log(`木: ${result.fiveElements.wood}`);
  console.log(`火: ${result.fiveElements.fire}`);
  console.log(`土: ${result.fiveElements.earth}`);
  console.log(`金: ${result.fiveElements.metal}`);
  console.log(`水: ${result.fiveElements.water}`);

  // エネルギー点数
  console.log('\n【エネルギー点数】');
  console.log(`${result.energyScore}点`);

  // 天中殺（陰占がある場合）
  if (result.insen) {
    console.log('\n【天中殺】');
    console.log(`種類: ${result.insen.tenchusatsu.type}`);
    console.log(`空亡: ${result.insen.tenchusatsu.missingBranches.join(', ')}`);
  }

  return result;
}

// メイン実行関数
function main() {
  console.log('\n算命学計算テスト');
  console.log(`対象キャラクター数: ${testCharacters.length}`);

  const results: any[] = [];

  testCharacters.forEach((character) => {
    const birthDate = new Date(`${character.birthDate}T12:00:00`);
    const result = calculateKanshi({
      birthDate,
      gender: 'male',
      includeTaiun: true,
      includeInsen: true
    });

    results.push({
      character: character.name,
      birthDate: character.birthDate,
      result: result
    });

    formatKanshiResult(character, result);
  });

  // サマリー
  console.log('\n' + '='.repeat(80));
  console.log('【サマリー】');
  console.log('='.repeat(80));

  results.forEach(({ character, result }) => {
    console.log(`\n${character}:`);
    console.log(`  中心星: ${result.yangSen.chest}`);
    console.log(`  合計点: ${result.yangSen.leftShoulder.score + result.yangSen.rightLeg.score + result.yangSen.leftLeg.score}点`);
    console.log(`  天中殺: ${result.insen.tenchusatsu.type}`);
  });
}

// スクリプト実行
main();
