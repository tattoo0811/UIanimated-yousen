/**
 * 2016年10月27日の陽占計算
 * 画像との比較検証
 */

// TODO: Restore import when lib file is available
// import { calculateBaZi, calculateYangSen } from '@/src/lib/logic';

// Stub implementations for disabled tests
const calculateBaZi = () => ({ year: { name: '' }, month: { name: '' }, day: { name: '' }, hour: { name: '' } });
const calculateYangSen = () => ({});

describe('2016年10月27日 12:00の陽占計算', () => {
    const testDate = new Date(2016, 9, 27, 12, 0, 0); // 2016-10-27 12:00
    const longitude = 135;

    it('完全な陽占結果を出力', () => {
        const bazi = calculateBaZi(testDate, longitude);
        const yangSen = calculateYangSen(bazi);

        console.log('\n=== 2016年10月27日 12:00 陽占結果 ===\n');

        // 四柱推命（陰占）
        console.log('【四柱推命（陰占）】');
        console.log(`年柱: ${bazi.year.name}`);
        console.log(`月柱: ${bazi.month.name}`);
        console.log(`日柱: ${bazi.day.name}`);
        console.log(`時柱: ${bazi.hour.name}`);
        console.log('');

        // 十大主星（人体図）
        console.log('【十大主星 - 人体図】');
        console.log('');
        console.log(`        ${yangSen.leftShoulder.name}(${yangSen.leftShoulder.score})    頭: ${yangSen.head}`);
        console.log('');
        console.log(`   左手: ${yangSen.leftHand}   胸: ${yangSen.chest}   `);
        console.log('');
        console.log(`   ${yangSen.leftLeg.name}(${yangSen.leftLeg.score})   腹: ${yangSen.belly}   ${yangSen.rightLeg.name}(${yangSen.rightLeg.score})`);
        console.log('');

        // 出力（画像と比較用）
        console.log('=== 画像との比較用出力 ===');
        console.log('十大主星:');
        console.log(`  頭: ${yangSen.head}`);
        console.log(`  左手: ${yangSen.leftHand}`);
        console.log(`  胸: ${yangSen.chest}`);
        console.log(`  `);
        console.log(`  腹: ${yangSen.belly}`);
        console.log('');
        console.log('十二大従星:');
        console.log(`  左肩: ${yangSen.leftShoulder.name} (${yangSen.leftShoulder.score}点)`);
        console.log(`  右足: ${yangSen.rightLeg.name} (${yangSen.rightLeg.score}点)`);
        console.log(`  左足: ${yangSen.leftLeg.name} (${yangSen.leftLeg.score}点)`);

        // 基本的なアサーション（四柱）
        expect(bazi.year.name).toBe('丙申');
        expect(bazi.month.name).toBe('戊戌');
        expect(bazi.day.name).toBe('壬午');
    });
});
