/**
 * 1983年8月11日の陽占計算
 * このテストケースで申の本気が「戊」であることを検証
 */

import { calculateBaZi, calculateYangSen, calculateFiveElements, calculateEnergyScore } from '@/src/lib/logic';

describe('1983年8月11日 12:00の陽占計算', () => {
    const testDate = new Date(1983, 7, 11, 12, 0, 0); // 1983-08-11 12:00
    const longitude = 135;

    it('完全な陽占結果を出力', () => {
        const bazi = calculateBaZi(testDate, longitude);
        const yangSen = calculateYangSen(bazi, testDate);
        const fiveElements = calculateFiveElements(bazi);
        const energyScore = calculateEnergyScore(bazi);

        console.log('\n=== 1983年8月11日 12:00 陽占結果 ===\n');

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

        // 胸の検証（重要: 月支=申で玉堂星になるか）
        console.log('=== 胸の検証 ===');
        console.log(`月支: ${bazi.month.branchStr} (申)`);
        console.log(`胸: ${yangSen.chest}`);
        console.log('');
        console.log('計算過程:');
        console.log('  日干: 辛(金=3, 陰=1)');
        console.log('  月支=申の本気: 戊(土=2, 陽=0)  ← 算命学・陽占用');
        console.log('  関係: (2-3+5)%5 = 4 (印)');
        console.log('  PolMatch: 1 (異なる陰陽)');
        console.log('  Index: 4*2+1 = 9 → 玉堂星');
        console.log('');

        // 胸が玉堂星であることを検証
        console.log(`胸: ${yangSen.chest} (正解: 玉堂星) ${yangSen.chest === '玉堂星' ? '✅' : '❌'}`);

        // 検証用のアサーション
        expect(yangSen.chest).toBe('玉堂星');
    });
});
