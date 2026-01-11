/**
 * 2018年3月31日の陽占計算
 * ユーザー提供の正解データで検証
 */

import { calculateBaZi, calculateYangSen } from '@/src/lib/logic';

describe('2018年3月31日 12:00の陽占計算', () => {
    const testDate = new Date(2018, 2, 31, 12, 0, 0);
    const longitude = 135;

    it('陽占結果を出力', () => {
        const bazi = calculateBaZi(testDate, longitude);
        const yangSen = calculateYangSen(bazi, testDate);

        console.log('\n=== 2018年3月31日 12:00 陽占結果 ===\n');

        // 四柱推命（陰占）
        console.log('【四柱推命（陰占）】');
        console.log(`年柱: ${bazi.year.name}`);
        console.log(`月柱: ${bazi.month.name}`);
        console.log(`日柱: ${bazi.day.name}`);
        console.log('');

        // ユーザー提供の正解データ
        console.log('=== ユーザー提供の正解データ ===');
        console.log('陰占:');
        console.log('  年柱: 戊戌');
        console.log('  月柱: 乙卯');
        console.log('  日柱: 壬子 ← 注意: これは2018-03-21のデータ');
        console.log('');
        console.log('陽占:');
        console.log('  頭: 車騎星');
        console.log('  左手: 車騎星, 胸: 調舒星');
        console.log('  腹: 調舒星');
        console.log('  左肩: 天南星, 右足: 天南星, 左足: 天極星');
        console.log('');

        // 実際の2018-03-31の計算結果
        console.log('=== 実際の2018-03-31の計算結果 ===');
        console.log('陰占:');
        console.log(`  年柱: ${bazi.year.name} ${bazi.year.name === '戊戌' ? '✅' : '❌'}`);
        console.log(`  月柱: ${bazi.month.name} ${bazi.month.name === '乙卯' ? '✅' : '❌'}`);
        console.log(`  日柱: ${bazi.day.name} (実際は壬戌)`);
        console.log('');

        console.log('陽占（十大主星）:');
        console.log(`  頭（第一命星）: ${yangSen.head} (期待: 車騎星) ${yangSen.head === '車騎星' ? '✅' : '❌'}`);
        console.log(`  右手: ${yangSen.rightHand} (期待: 車騎星) ${yangSen.rightHand === '車騎星' ? '✅' : '❌'}`);
        console.log(`  胸（中心星）: ${yangSen.chest} (期待: 調舒星) ${yangSen.chest === '調舒星' ? '✅' : '❌'}`);
        console.log(`  左手: ${yangSen.leftHand} (期待: 車騎星) ${yangSen.leftHand === '車騎星' ? '✅' : '❌'}`);
        console.log(`  腹: ${yangSen.belly} (期待: 調舒星) ${yangSen.belly === '調舒星' ? '✅' : '❌'}`);
        console.log('');

        console.log('陽占（十二大従星）:');
        console.log(`  左肩: ${yangSen.leftShoulder.name} (${yangSen.leftShoulder.score}点)`);
        console.log(`  右足: ${yangSen.rightLeg.name} (${yangSen.rightLeg.score}点)`);
        console.log(`  左足: ${yangSen.leftLeg.name} (${yangSen.leftLeg.score}点)`);
        console.log('');

        // 計算の詳細
        console.log('=== 計算詳細 ===');
        console.log(`日干: ${bazi.day.stemStr}(${bazi.day.stem - 1})`);
        console.log(`年干: ${bazi.year.stemStr}(${bazi.year.stem - 1})`);
        console.log(`月干: ${bazi.month.stemStr}(${bazi.month.stem - 1})`);
        console.log(`年支: ${bazi.year.branchStr}(${bazi.year.branch - 1})`);
        console.log(`月支: ${bazi.month.branchStr}(${bazi.month.branch - 1})`);
        console.log(`日支: ${bazi.day.branchStr}(${bazi.day.branch - 1})`);
        console.log('');

        // 検証（2018-03-31の実データ）
        expect(bazi.year.name).toBe('戊戌');
        expect(bazi.month.name).toBe('乙卯');
        expect(bazi.day.name).toBe('壬戌');

        // 陽占検証
        expect(yangSen.head).toBe('車騎星');
        expect(yangSen.rightHand).toBe('車騎星');
        expect(yangSen.chest).toBe('調舒星');   // 日干壬 × 月支蔵干乙（卯の蔵干）
        expect(yangSen.leftHand).toBe('車騎星'); // 日干壬 × 年支蔵干戊（戌の蔵干）
        expect(yangSen.belly).toBe('調舒星');   // 日干壬 × 月干乙
    });
});
