/**
 * 1984-12-02 詳細デバッグ - 計算過程を追跡
 */

import { calculateBaZi, STEMS, BRANCHES } from '@/src/lib/logic';

describe('1984-12-02 詳細デバッグ', () => {
  it('計算過程を詳細に出力', () => {
    const testDate = new Date(1984, 11, 2, 12, 0, 0);
    const longitude = 135;

    const bazi = calculateBaZi(testDate, longitude);

    console.log('\n=== 四柱推命結果 ===');
    console.log('年柱:', bazi.year.name, `(干:${bazi.year.stemStr}=${bazi.year.stem-1}, 支:${bazi.year.branchStr}=${bazi.year.branch-1})`);
    console.log('月柱:', bazi.month.name, `(干:${bazi.month.stemStr}=${bazi.month.stem-1}, 支:${bazi.month.branchStr}=${bazi.month.branch-1})`);
    console.log('日柱:', bazi.day.name, `(干:${bazi.day.stemStr}=${bazi.day.stem-1}, 支:${bazi.day.branchStr}=${bazi.day.branch-1})`);
    console.log('時柱:', bazi.hour.name, `(干:${bazi.hour.stemStr}=${bazi.hour.stem-1}, 支:${bazi.hour.branchStr}=${bazi.hour.branch-1})`);
    console.log('');

    // 蔵干の確認
    console.log('=== 蔵干（YANGSEN用）===');
    const YANGSEN_HIDDEN_STEMS = [
      '癸', '辛', '丙', '乙', '乙', '庚', '丁', '丁',
      '戊', '辛', '丁', '甲'
    ];

    console.log('年支', bazi.year.branchStr, `(${bazi.year.branch-1})の蔵干:`, YANGSEN_HIDDEN_STEMS[bazi.year.branch-1]);
    console.log('月支', bazi.month.branchStr, `(${bazi.month.branch-1})の蔵干:`, YANGSEN_HIDDEN_STEMS[bazi.month.branch-1]);
    console.log('日支', bazi.day.branchStr, `(${bazi.day.branch-1})の蔵干:`, YANGSEN_HIDDEN_STEMS[bazi.day.branch-1]);
    console.log('');

    // 十大主星の計算ロジックを手動実行
    console.log('=== 十大主星の計算 ===');
    const dayStem = bazi.day.stem - 1; // 庚
    console.log('日干:', STEMS[dayStem], `(${dayStem})`);
    console.log('');

    // 胸の計算（月支蔵干から）
    const monthBranchIdx = bazi.month.branch - 1; // 亥 = 11
    const monthHiddenStem = YANGSEN_HIDDEN_STEMS[monthBranchIdx]; // 甲
    const STEM_TO_INDEX: Record<string, number> = {
      '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
      '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
    };
    const monthHiddenIdx = STEM_TO_INDEX[monthHiddenStem];

    console.log('胸の計算:');
    console.log('  月支:', bazi.month.branchStr, `(${monthBranchIdx})`);
    console.log('  月支蔵干:', monthHiddenStem, `(${monthHiddenIdx})`);
    console.log('  日干:', STEMS[dayStem], `(${dayStem})`);

    // 五行計算
    const getElement = (stemIdx: number) => Math.floor(stemIdx / 2);
    const getPolarity = (stemIdx: number) => stemIdx % 2;

    const dElem = getElement(dayStem); // 庚 = 3 (金)
    const tElem = getElement(monthHiddenIdx); // 甲 = 0 (木)
    const dPol = getPolarity(dayStem); // 0 (陽)
    const tPol = getPolarity(monthHiddenIdx); // 0 (陽)
    const rel = (tElem - dElem + 5) % 5;
    const polMatch = dPol === tPol ? 0 : 1;
    const index = rel * 2 + polMatch;

    console.log('  日干五行:', dElem, '陰陽:', dPol);
    console.log('  月支蔵干五行:', tElem, '陰陽:', tPol);
    console.log('  関係:', rel, 'PolMatch:', polMatch, 'Index:', index);

    const TEN_STARS = [
      '貫索星', '石門星', // 0: 比和
      '鳳閣星', '調舒星', // 1: 洩気
      '禄存星', '司禄星', // 2: 財
      '車騎星', '牽牛星', // 3: 官
      '龍高星', '玉堂星'  // 4: 印
    ];
    console.log('  結果:', TEN_STARS[index]);
    console.log('  正解: 鳳閣星');
    console.log('');

    // 十二大従星の計算
    console.log('=== 十二大従星の計算 ===');
    const ENERGY_TABLE = [
      [7, 8, 11, 12, 10, 6, 3, 1, 5, 2, 4, 9], // 甲
      [4, 5, 2, 1, 12, 8, 6, 9, 10, 7, 11, 3], // 乙
      [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 丙
      [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 丁
      [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 戊
      [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 己
      [4, 6, 1, 9, 5, 2, 8, 12, 11, 10, 7, 3], // 庚
      [9, 6, 3, 1, 4, 10, 11, 12, 8, 5, 2, 7], // 辛
      [12, 11, 10, 7, 9, 3, 6, 5, 4, 1, 8, 2], // 壬
      [12, 6, 1, 3, 9, 8, 4, 5, 2, 7, 10, 11]  // 癸
    ];

    const TWELVE_STARS: Record<number, string> = {
      12: '天将星', 11: '天禄星', 10: '天南星', 9: '天貴星',
      8: '天堂星', 7: '天恍星', 6: '天印星', 5: '天庫星',
      4: '天胡星', 3: '天報星', 2: '天極星', 1: '天馳星'
    };

    // 左肩（年支から）
    const yearBranchIdx = bazi.year.branch - 1; // 子 = 0
    const leftShoulderScore = ENERGY_TABLE[dayStem][yearBranchIdx];
    console.log('左肩:');
    console.log('  日干:', STEMS[dayStem], `(${dayStem})`);
    console.log('  年支:', bazi.year.branchStr, `(${yearBranchIdx})`);
    console.log('  ENERGY_TABLE[${dayStem}][${yearBranchIdx}] =', leftShoulderScore);
    console.log('  結果:', TWELVE_STARS[leftShoulderScore], `(${leftShoulderScore}点)`);
    console.log('  正解: 天極星 (2点)');
    console.log('');

    // 右足（月支から）
    const rightLegScore = ENERGY_TABLE[dayStem][monthBranchIdx];
    console.log('右足:');
    console.log('  日干:', STEMS[dayStem], `(${dayStem})`);
    console.log('  月支:', bazi.month.branchStr, `(${monthBranchIdx})`);
    console.log('  ENERGY_TABLE[${dayStem}][${monthBranchIdx}] =', rightLegScore);
    console.log('  結果:', TWELVE_STARS[rightLegScore], `(${rightLegScore}点)`);
    console.log('  正解: 天恍星 (7点)');
    console.log('');

    // 左足（日支から）
    const dayBranchIdx = bazi.day.branch - 1; // 午 = 6
    const leftLegScore = ENERGY_TABLE[dayStem][dayBranchIdx];
    console.log('左足:');
    console.log('  日干:', STEMS[dayStem], `(${dayStem})`);
    console.log('  日支:', bazi.day.branchStr, `(${dayBranchIdx})`);
    console.log('  ENERGY_TABLE[${dayStem}][${dayBranchIdx}] =', leftLegScore);
    console.log('  結果:', TWELVE_STARS[leftLegScore], `(${leftLegScore}点)`);
    console.log('  正解: 天胡星 (4点)');
    console.log('');

    expect(true).toBe(true);
  });
});
