/**
 * 複数の計算ロジックによる命式の整合性検証
 *
 * 4つのテストケースで3つの計算ロジックを比較:
 * - ロジックA: mobile版（二十八元に基づく動的蔵干）
 * - ロジックB: yinyang-app版（固定蔵干）
 * - ユーザー確認値
 */

import { calculateKanshi } from '../mobile/lib/logic';

// ============================================================
// 共通定数
// ============================================================

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const STEM_TO_INDEX: Record<string, number> = {
    '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
    '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

// 十大主星
const TEN_STARS = [
    '貫索星', '石門星', // 0: 比和
    '鳳閣星', '調舒星', // 1: 洩気
    '禄存星', '司禄星', // 2: 財
    '車騎星', '牽牛星', // 3: 官
    '龍高星', '玉堂星'  // 4: 印
];

// 十二大従星
const TWELVE_STARS: Record<number, string> = {
    12: '天将星', 11: '天禄星', 10: '天南星', 9: '天貴星',
    8: '天堂星', 7: '天恍星', 6: '天印星', 5: '天庫星',
    4: '天胡星', 3: '天報星', 2: '天極星', 1: '天馳星'
};

// エネルギー点数表
const ENERGY_TABLE = [
    [7, 8, 11, 12, 10, 6, 3, 1, 5, 2, 4, 9], // 甲
    [4, 5, 2, 1, 12, 8, 6, 9, 10, 7, 11, 3], // 乙
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 丙
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 丁
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 戊
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 己
    [4, 6, 1, 9, 5, 2, 8, 12, 11, 10, 3, 7], // 庚
    [9, 6, 3, 1, 4, 10, 11, 12, 8, 5, 2, 7], // 辛
    [12, 11, 10, 7, 9, 3, 6, 5, 4, 1, 8, 2], // 壬
    [12, 6, 1, 3, 9, 8, 4, 5, 2, 7, 10, 11]  // 癸
];

// 天中殺
const TENCHUSATSU_TYPES = ['戌亥天中殺', '申酉天中殺', '午未天中殺', '辰巳天中殺', '寅卯天中殺', '子丑天中殺'];

// ============================================================
// ヘルパー関数
// ============================================================

function getElement(stemIdx: number): number {
    return Math.floor(stemIdx / 2);
}

function getPolarity(stemIdx: number): number {
    return stemIdx % 2;
}

function getTenGreatStar(dayStemIdx: number, targetStemIdx: number): string {
    const dElem = getElement(dayStemIdx);
    const tElem = getElement(targetStemIdx);
    const dPol = getPolarity(dayStemIdx);
    const tPol = getPolarity(targetStemIdx);

    const rel = (tElem - dElem + 5) % 5;
    const polMatch = dPol === tPol ? 0 : 1;
    const index = rel * 2 + polMatch;

    return TEN_STARS[index];
}

function getTwelveGreatStar(dayStemIdx: number, branchIdx: number): { name: string; score: number } {
    const score = ENERGY_TABLE[dayStemIdx][branchIdx];
    return {
        name: TWELVE_STARS[score],
        score: score
    };
}

function calculateTenchusatsu(ganZhiId: number): string {
    const group = Math.floor((ganZhiId - 1) / 10);
    return TENCHUSATSU_TYPES[group];
}

// ============================================================
// ロジックB: yinyang-app版（固定蔵干）
// ============================================================

const YANGSEN_HIDDEN_STEMS_FIXED = [
    '癸', // 子 (0)
    '辛', // 丑 (1)
    '丙', // 寅 (2)
    '乙', // 卯 (3)
    '乙', // 辰 (4)
    '庚', // 巳 (5)
    '丁', // 午 (6)
    '丁', // 未 (7)
    '戊', // 申 (8)
    '辛', // 酉 (9)
    '丁', // 戌 (10)
    '甲'  // 亥 (11)
];

function calculateYangSenFixed(bazi: any): any {
    const dayStemIdx = bazi.day.stem - 1;

    const head = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);
    const dayBranchHiddenStem = YANGSEN_HIDDEN_STEMS_FIXED[bazi.day.branch - 1];
    const rightHand = getTenGreatStar(dayStemIdx, STEM_TO_INDEX[dayBranchHiddenStem]);
    const monthBranchHiddenStem = YANGSEN_HIDDEN_STEMS_FIXED[bazi.month.branch - 1];
    const chest = getTenGreatStar(dayStemIdx, STEM_TO_INDEX[monthBranchHiddenStem]);
    const yearBranchHiddenStem = YANGSEN_HIDDEN_STEMS_FIXED[bazi.year.branch - 1];
    const leftHand = getTenGreatStar(dayStemIdx, STEM_TO_INDEX[yearBranchHiddenStem]);
    const belly = getTenGreatStar(dayStemIdx, bazi.month.stem - 1);

    const leftShoulder = getTwelveGreatStar(dayStemIdx, bazi.year.branch - 1);
    const rightLeg = getTwelveGreatStar(dayStemIdx, bazi.month.branch - 1);
    const leftLeg = getTwelveGreatStar(dayStemIdx, bazi.day.branch - 1);

    return {
        head, rightHand, chest, leftHand, belly,
        leftShoulder, rightLeg, leftLeg,
        dayBranchHiddenStem, monthBranchHiddenStem, yearBranchHiddenStem
    };
}

// ============================================================
// テストケース定義
// ============================================================

const testCases = [
    {
        id: 1,
        date: new Date('1985-07-15T12:00:00'),
        gender: 'male',
        name: 'テストケース1',
        expected: {
            tenchusatsu: null // 未確認
        }
    },
    {
        id: 2,
        date: new Date('1992-03-28T12:00:00'),
        gender: 'female',
        name: 'テストケース2',
        expected: {
            tenchusatsu: '辰巳天中殺' // ユーザー確認値
        }
    },
    {
        id: 3,
        date: new Date('1978-11-05T12:00:00'),
        gender: 'male',
        name: 'テストケース3',
        expected: {
            tenchusatsu: null // 未確認
        }
    },
    {
        id: 4,
        date: new Date('1995-09-12T12:00:00'),
        gender: 'female',
        name: 'テストケース4',
        expected: {
            rightHand: '調舒星' // ユーザー確認値
        }
    }
];

// ============================================================
// メイン処理
// ============================================================

async function main() {
    console.log('='.repeat(80));
    console.log('複数の計算ロジックによる命式の整合性検証');
    console.log('='.repeat(80));
    console.log();

    for (const testCase of testCases) {
        console.log('─'.repeat(80));
        console.log(`テストケース${testCase.id}: ${testCase.name}`);
        console.log(`生年月日: ${testCase.date.toISOString().split('T')[0]} 性別: ${testCase.gender === 'male' ? '男性' : '女性'}`);
        console.log('─'.repeat(80));
        console.log();

        // ロジックA: mobile版
        console.log('【ロジックA: mobile版（二十八元に基づく動的蔵干）】');
        const resultA = calculateKanshi({
            birthDate: testCase.date,
            gender: testCase.gender,
            longitude: 135,
            includeTaiun: false,
            includeInsen: false
        });

        console.log('四柱推命:');
        console.log(`  年柱: ${resultA.bazi.year.name} (${resultA.bazi.year.id})`);
        console.log(`  月柱: ${resultA.bazi.month.name} (${resultA.bazi.month.id})`);
        console.log(`  日柱: ${resultA.bazi.day.name} (${resultA.bazi.day.id})`);
        console.log(`  時柱: ${resultA.bazi.hour.name} (${resultA.bazi.hour.id})`);

        // 天中殺を計算
        const tenchusatsuA = calculateTenchusatsu(resultA.bazi.day.id);
        console.log(`天中殺: ${tenchusatsuA}`);

        console.log('十大主星（人体図）:');
        console.log(`  頭: ${resultA.yangSen.head}`);
        console.log(`  右手: ${resultA.yangSen.rightHand}`);
        console.log(`  胸: ${resultA.yangSen.chest}`);
        console.log(`  左手: ${resultA.yangSen.leftHand}`);
        console.log(`  腹: ${resultA.yangSen.belly}`);

        console.log('十二大従星:');
        console.log(`  左肩: ${resultA.yangSen.leftShoulder.name} (${resultA.yangSen.leftShoulder.score}点)`);
        console.log(`  右足: ${resultA.yangSen.rightLeg.name} (${resultA.yangSen.rightLeg.score}点)`);
        console.log(`  左足: ${resultA.yangSen.leftLeg.name} (${resultA.yangSen.leftLeg.score}点)`);
        console.log();

        // ロジックB: yinyang-app版（固定蔵干）
        console.log('【ロジックB: yinyang-app版（固定蔵干）】');
        const resultB = calculateYangSenFixed(resultA.bazi);

        console.log('十大主星（人体図）:');
        console.log(`  頭: ${resultB.head}`);
        console.log(`  右手: ${resultB.rightHand} (日支蔵干: ${resultB.dayBranchHiddenStem})`);
        console.log(`  胸: ${resultB.chest} (月支蔵干: ${resultB.monthBranchHiddenStem})`);
        console.log(`  左手: ${resultB.leftHand} (年支蔵干: ${resultB.yearBranchHiddenStem})`);
        console.log(`  腹: ${resultB.belly}`);

        console.log('十二大従星:');
        console.log(`  左肩: ${resultB.leftShoulder.name} (${resultB.leftShoulder.score}点)`);
        console.log(`  右足: ${resultB.rightLeg.name} (${resultB.rightLeg.score}点)`);
        console.log(`  左足: ${resultB.leftLeg.name} (${resultB.leftLeg.score}点)`);
        console.log();

        // 比較
        console.log('【比較】');
        console.log('十大主星の差異:');
        const tenStarsDiff = [];
        if (resultA.yangSen.head !== resultB.head) tenStarsDiff.push('頭');
        if (resultA.yangSen.rightHand !== resultB.rightHand) tenStarsDiff.push('右手');
        if (resultA.yangSen.chest !== resultB.chest) tenStarsDiff.push('胸');
        if (resultA.yangSen.leftHand !== resultB.leftHand) tenStarsDiff.push('左手');
        if (resultA.yangSen.belly !== resultB.belly) tenStarsDiff.push('腹');

        if (tenStarsDiff.length === 0) {
            console.log('  ✓ 差異なし');
        } else {
            console.log(`  ✗ 差異あり: ${tenStarsDiff.join(', ')}`);
        }

        // ユーザー確認値との照合
        if (testCase.expected.tenchusatsu) {
            const match = tenchusatsuA === testCase.expected.tenchusatsu;
            console.log(`  ${match ? '✓' : '✗'} 天中殺: ${tenchusatsuA} (期待値: ${testCase.expected.tenchusatsu})`);
        }

        if (testCase.expected.rightHand) {
            const match = resultA.yangSen.rightHand === testCase.expected.rightHand;
            console.log(`  ${match ? '✓' : '✗'} 右手: ${resultA.yangSen.rightHand} (期待値: ${testCase.expected.rightHand})`);
        }

        console.log();
    }

    console.log('='.repeat(80));
    console.log('検証完了');
    console.log('='.repeat(80));
}

main().catch(console.error);
