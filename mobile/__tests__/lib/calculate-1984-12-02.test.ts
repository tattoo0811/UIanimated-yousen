/**
 * 1984年12月2日の陽占計算
 */

import { calculateBaZi, calculateYangSen, calculateFiveElements, calculateEnergyScore } from '@/src/lib/logic';

describe('1984年12月2日 12:00の陽占計算', () => {
  const testDate = new Date(1984, 11, 2, 12, 0, 0); // 1984-12-02 12:00
  const longitude = 135;

  it('完全な陽占結果を出力', () => {
    const bazi = calculateBaZi(testDate, longitude);
    const yangSen = calculateYangSen(bazi, testDate);
    const fiveElements = calculateFiveElements(bazi);
    const energyScore = calculateEnergyScore(bazi);

    console.log('\n=== 1984年12月2日 12:00 陽占結果 ===\n');

    // 四柱推命
    console.log('【四柱推命】');
    console.log(`年柱: ${bazi.year.name} (${bazi.year.stemStr}${bazi.year.branchStr})`);
    console.log(`月柱: ${bazi.month.name} (${bazi.month.stemStr}${bazi.month.branchStr})`);
    console.log(`日柱: ${bazi.day.name} (${bazi.day.stemStr}${bazi.day.branchStr})`);
    console.log(`時柱: ${bazi.hour.name} (${bazi.hour.stemStr}${bazi.hour.branchStr})`);
    console.log('');

    // 十大主星（人体図）
    console.log('【十大主星 - 人体図】');
    console.log('');
    console.log('        頭');
    console.log(`       ${yangSen.head}`);
    console.log('');
    console.log('   左手   胸');
    console.log(`  ${yangSen.leftHand} ${yangSen.chest}`);
    console.log('');
    console.log('        腹');
    console.log(`       ${yangSen.belly}`);
    console.log('');

    // 十二大従星
    console.log('【十二大従星】');
    console.log(`左肩: ${yangSen.leftShoulder.name} (${yangSen.leftShoulder.score}点)`);
    console.log(`右足: ${yangSen.rightLeg.name} (${yangSen.rightLeg.score}点)`);
    console.log(`左足: ${yangSen.leftLeg.name} (${yangSen.leftLeg.score}点)`);
    console.log(`合計: ${yangSen.leftShoulder.score + yangSen.rightLeg.score + yangSen.leftLeg.score}点`);
    console.log('');

    // 五行バランス
    console.log('【五行バランス】');
    console.log(`木: ${fiveElements.wood}`);
    console.log(`火: ${fiveElements.fire}`);
    console.log(`土: ${fiveElements.earth}`);
    console.log(`金: ${fiveElements.metal}`);
    console.log(`水: ${fiveElements.water}`);
    console.log('');

    // エネルギー点数
    console.log('【エネルギー点数】');
    console.log(`${energyScore}点 / 120点`);
    console.log('');

    // 画像の正解値と比較
    console.log('=== 正解との比較 ===');
    console.log(`頭: ${yangSen.head} (正解: 禄存星) ${yangSen.head === '禄存星' ? '✅' : '❌'}`);
    console.log(`胸: ${yangSen.chest} (正解: 鳳閣星) ${yangSen.chest === '鳳閣星' ? '✅' : '❌'}`);
    console.log(`左手: ${yangSen.leftHand} (正解: 調舒星) ${yangSen.leftHand === '調舒星' ? '✅' : '❌'}`);
    console.log(`腹: ${yangSen.belly} (正解: 司禄星) ${yangSen.belly === '司禄星' ? '✅' : '❌'}`);
    console.log(`左肩: ${yangSen.leftShoulder.name}(${yangSen.leftShoulder.score}点) (正解: 天極星(2点)) ${yangSen.leftShoulder.name === '天極星' && yangSen.leftShoulder.score === 2 ? '✅' : '❌'}`);
    console.log(`右足: ${yangSen.rightLeg.name}(${yangSen.rightLeg.score}点) (正解: 天恍星(7点)) ${yangSen.rightLeg.name === '天恍星' && yangSen.rightLeg.score === 7 ? '✅' : '❌'}`);
    console.log(`左足: ${yangSen.leftLeg.name}(${yangSen.leftLeg.score}点) (正解: 天胡星(4点)) ${yangSen.leftLeg.name === '天胡星' && yangSen.leftLeg.score === 4 ? '✅' : '❌'}`);
    console.log('');

    // 検証用のアサーション
    expect(yangSen.head).toBe('禄存星');
    expect(yangSen.chest).toBe('鳳閣星');
    expect(yangSen.leftHand).toBe('調舒星');
    expect(yangSen.belly).toBe('司禄星');
    // 十二大従星検証（参照サイトで検証済み）
    // 1984-12-02: 日干=庚, 年支=子, 月支=亥, 日支=午
    expect(yangSen.leftShoulder.name).toBe('天極星');  // 年支子→左肩
    expect(yangSen.leftShoulder.score).toBe(2);
    expect(yangSen.rightLeg.name).toBe('天恍星');      // 日支午→右足
    expect(yangSen.rightLeg.score).toBe(7);
    expect(yangSen.leftLeg.name).toBe('天胡星');       // 月支亥→左足
    expect(yangSen.leftLeg.score).toBe(4);
  });
});
