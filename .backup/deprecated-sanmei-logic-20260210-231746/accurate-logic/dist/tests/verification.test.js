"use strict";
/**
 * accurate-logic Verification Test
 * 正確な算命学ロジックの検証テスト
 * 参考サイト: https://www.shugakuin.co.jp/fate_calculation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const bazi_1 = require("../src/bazi");
const yangsen_1 = require("../src/yangsen");
describe('算命学ロジック検証テスト - 朱学院正解値との比較', () => {
    describe('1983年8月11日（男性）', () => {
        const testDate = new Date(1983, 7, 11, 12, 0, 0); // 1983-08-11 12:00
        const longitude = 135;
        const bazi = (0, bazi_1.calculateBaZi)(testDate, longitude);
        const yangSen = (0, yangsen_1.calculateYangSen)(bazi, testDate);
        // 正解値（朱学院）
        const expected = {
            fourPillars: {
                year: '辛未',
                month: '庚申',
                day: '癸亥'
            },
            tenMajorStars: {
                head: '鳳閣星',
                chest: '玉堂星',
                belly: '司禄星',
                rightHand: '車騎星',
                leftHand: '石門星'
            },
            twelveMinorStars: {
                leftShoulder: { name: '天恍星', score: 7 },
                leftLeg: { name: '天堂星', score: 8 },
                rightLeg: { name: '天将星', score: 12 }
            }
        };
        it('四柱推命が正しく計算される', () => {
            expect(bazi.year.name).toBe(expected.fourPillars.year);
            expect(bazi.month.name).toBe(expected.fourPillars.month);
            expect(bazi.day.name).toBe(expected.fourPillars.day);
        });
        it('十大主星が正しく計算される', () => {
            expect(yangSen.head).toBe(expected.tenMajorStars.head);
            expect(yangSen.chest).toBe(expected.tenMajorStars.chest);
            expect(yangSen.belly).toBe(expected.tenMajorStars.belly);
            expect(yangSen.rightHand).toBe(expected.tenMajorStars.rightHand);
            expect(yangSen.leftHand).toBe(expected.tenMajorStars.leftHand);
        });
        it('十二大従星が正しく計算される', () => {
            expect(yangSen.leftShoulder.name).toBe(expected.twelveMinorStars.leftShoulder.name);
            expect(yangSen.leftShoulder.score).toBe(expected.twelveMinorStars.leftShoulder.score);
            expect(yangSen.leftLeg.name).toBe(expected.twelveMinorStars.leftLeg.name);
            expect(yangSen.leftLeg.score).toBe(expected.twelveMinorStars.leftLeg.score);
            expect(yangSen.rightLeg.name).toBe(expected.twelveMinorStars.rightLeg.name);
            expect(yangSen.rightLeg.score).toBe(expected.twelveMinorStars.rightLeg.score);
        });
    });
    describe('1984年12月2日（男性）', () => {
        const testDate = new Date(1984, 11, 2, 12, 0, 0); // 1984-12-02 12:00
        const longitude = 135;
        const bazi = (0, bazi_1.calculateBaZi)(testDate, longitude);
        const yangSen = (0, yangsen_1.calculateYangSen)(bazi, testDate);
        // 正解値（朱学院）
        const expected = {
            fourPillars: {
                year: '庚午',
                month: '乙亥',
                day: '甲子'
            },
            tenMajorStars: {
                head: '禄存星',
                chest: '鳳閣星',
                belly: '調舒星',
                rightHand: '牽牛星',
                leftHand: '司禄星'
            },
            twelveMinorStars: {
                leftShoulder: { name: '天極星', score: 2 },
                leftLeg: { name: '天胡星', score: 4 },
                rightLeg: { name: '天恍星', score: 7 }
            }
        };
        it('四柱推命が正しく計算される', () => {
            expect(bazi.year.name).toBe(expected.fourPillars.year);
            expect(bazi.month.name).toBe(expected.fourPillars.month);
            expect(bazi.day.name).toBe(expected.fourPillars.day);
        });
        it('十大主星が正しく計算される', () => {
            expect(yangSen.head).toBe(expected.tenMajorStars.head);
            expect(yangSen.chest).toBe(expected.tenMajorStars.chest);
            expect(yangSen.belly).toBe(expected.tenMajorStars.belly);
            expect(yangSen.rightHand).toBe(expected.tenMajorStars.rightHand);
            expect(yangSen.leftHand).toBe(expected.tenMajorStars.leftHand);
        });
        it('十二大従星が正しく計算される', () => {
            expect(yangSen.leftShoulder.name).toBe(expected.twelveMinorStars.leftShoulder.name);
            expect(yangSen.leftShoulder.score).toBe(expected.twelveMinorStars.leftShoulder.score);
            expect(yangSen.leftLeg.name).toBe(expected.twelveMinorStars.leftLeg.name);
            expect(yangSen.leftLeg.score).toBe(expected.twelveMinorStars.leftLeg.score);
            expect(yangSen.rightLeg.name).toBe(expected.twelveMinorStars.rightLeg.name);
            expect(yangSen.rightLeg.score).toBe(expected.twelveMinorStars.rightLeg.score);
        });
    });
    // デバッグ用: 現在の出力値を表示
    describe('デバッグ情報', () => {
        it('1983年8月11日の出力値を表示', () => {
            const testDate = new Date(1983, 7, 11, 12, 0, 0);
            const longitude = 135;
            const bazi = (0, bazi_1.calculateBaZi)(testDate, longitude);
            const yangSen = (0, yangsen_1.calculateYangSen)(bazi, testDate);
            console.log('=== 1983年8月11日 ===');
            console.log('四柱推命:');
            console.log(`  年柱: ${bazi.year.name} (正解: 辛未)`);
            console.log(`  月柱: ${bazi.month.name} (正解: 庚申)`);
            console.log(`  日柱: ${bazi.day.name} (正解: 癸亥)`);
            console.log('十大主星:');
            console.log(`  頭: ${yangSen.head} (正解: 鳳閣星)`);
            console.log(`  胸: ${yangSen.chest} (正解: 玉堂星)`);
            console.log(`  腹: ${yangSen.belly} (正解: 司禄星)`);
            console.log(`  右手: ${yangSen.rightHand} (正解: 車騎星)`);
            console.log(`  左手: ${yangSen.leftHand} (正解: 石門星)`);
            console.log('十二大従星:');
            console.log(`  左肩: ${yangSen.leftShoulder.name}(${yangSen.leftShoulder.score}点) (正解: 天恍星(7点))`);
            console.log(`  左足: ${yangSen.leftLeg.name}(${yangSen.leftLeg.score}点) (正解: 天堂星(8点))`);
            console.log(`  右足: ${yangSen.rightLeg.name}(${yangSen.rightLeg.score}点) (正解: 天将星(12点))`);
        });
        it('1984年12月2日の出力値を表示', () => {
            const testDate = new Date(1984, 11, 2, 12, 0, 0);
            const longitude = 135;
            const bazi = (0, bazi_1.calculateBaZi)(testDate, longitude);
            const yangSen = (0, yangsen_1.calculateYangSen)(bazi, testDate);
            console.log('=== 1984年12月2日 ===');
            console.log('四柱推命:');
            console.log(`  年柱: ${bazi.year.name} (正解: 庚午)`);
            console.log(`  月柱: ${bazi.month.name} (正解: 乙亥)`);
            console.log(`  日柱: ${bazi.day.name} (正解: 甲子)`);
            console.log('十大主星:');
            console.log(`  頭: ${yangSen.head} (正解: 禄存星)`);
            console.log(`  胸: ${yangSen.chest} (正解: 鳳閣星)`);
            console.log(`  腹: ${yangSen.belly} (正解: 調舒星)`);
            console.log(`  右手: ${yangSen.rightHand} (正解: 牽牛星)`);
            console.log(`  左手: ${yangSen.leftHand} (正解: 司禄星)`);
            console.log('十二大従星:');
            console.log(`  左肩: ${yangSen.leftShoulder.name}(${yangSen.leftShoulder.score}点) (正解: 天極星(2点))`);
            console.log(`  左足: ${yangSen.leftLeg.name}(${yangSen.leftLeg.score}点) (正解: 天胡星(4点))`);
            console.log(`  右足: ${yangSen.rightLeg.name}(${yangSen.rightLeg.score}点) (正解: 天恍星(7点))`);
        });
    });
});
