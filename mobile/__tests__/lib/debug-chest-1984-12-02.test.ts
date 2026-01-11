/**
 * 1984-12-02 胸の計算デバッグ
 */

import { calculateBaZi, STEMS, BRANCHES } from '@/src/lib/logic';

describe('1984-12-02 胸のデバッグ', () => {
  it('胸の計算過程を詳細追跡', () => {
    const testDate = new Date(1984, 11, 2, 12, 0, 0);
    const bazi = calculateBaZi(testDate, 135);

    console.log('\n=== 胸の計算デバッグ ===\n');

    console.log('四柱:');
    console.log(`日柱: ${bazi.day.name} (干:${bazi.day.stemStr}=${bazi.day.stem-1}, 支:${bazi.day.branchStr}=${bazi.day.branch-1})`);
    console.log(`月柱: ${bazi.month.name} (干:${bazi.month.stemStr}=${bazi.month.stem-1}, 支:${bazi.month.branchStr}=${bazi.month.branch-1})`);
    console.log('');

    // 蔵干
    const YANGSEN_HIDDEN_STEMS = [
      '癸', '辛', '丙', '乙', '乙', '庚', '丁', '丁',
      '戊', '辛', '丁', '甲'
    ];

    const monthBranchIdx = bazi.month.branch - 1; // 亥 = 11
    const monthHiddenStem = YANGSEN_HIDDEN_STEMS[monthBranchIdx];

    console.log('月支の蔵干:');
    console.log(`  月支: ${bazi.month.branchStr} (${monthBranchIdx})`);
    console.log(`  YANGSEN_HIDDEN_STEMS[${monthBranchIdx}] = ${monthHiddenStem}`);
    console.log('');

    // 日干
    const dayStem = bazi.day.stem - 1; // 庚 = 6
    console.log('日干:');
    console.log(`  ${bazi.day.stemStr} (${dayStem})`);
    console.log('');

    // 十大主星の計算
    const STEM_TO_INDEX: Record<string, number> = {
      '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
      '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
    };

    const monthHiddenIdx = STEM_TO_INDEX[monthHiddenStem];

    const getElement = (stemIdx: number) => Math.floor(stemIdx / 2);
    const getPolarity = (stemIdx: number) => stemIdx % 2;

    const dElem = getElement(dayStem); // 庚 = 3 (金)
    const tElem = getElement(monthHiddenIdx); // 甲 = 0 (木)
    const dPol = getPolarity(dayStem); // 0 (陽)
    const tPol = getPolarity(monthHiddenIdx); // 0 (陽)

    const rel = (tElem - dElem + 5) % 5;
    const polMatch = dPol === tPol ? 0 : 1;
    const index = rel * 2 + polMatch;

    console.log('胸の計算:');
    console.log(`  日干: ${STEMS[dayStem]} (elem:${dElem}, pol:${dPol})`);
    console.log(`  月支蔵干: ${monthHiddenStem} (${monthHiddenIdx}) (elem:${tElem}, pol:${tPol})`);
    console.log(`  関係: (${tElem} - ${dElem} + 5) % 5 = ${rel}`);
    console.log(`  PolMatch: ${polMatch}`);
    console.log(`  Index: ${rel} * 2 + ${polMatch} = ${index}`);

    const TEN_STARS = [
      '貫索星', '石門星', // 0: 比和
      '鳳閣星', '調舒星', // 1: 洩気
      '禄存星', '司禄星', // 2: 財
      '車騎星', '牽牛星', // 3: 官
      '龍高星', '玉堂星'  // 4: 印
    ];

    console.log(`  結果: TEN_STARS[${index}] = ${TEN_STARS[index]}`);
    console.log(`  正解: 鳳閣星 (Index 2)`);
    console.log('');

    // 鳳閣星を得るための条件
    console.log('鳳閣星を得るための条件:');
    console.log('  Index 2 = 関係1（洩気） * 2 + PolMatch 0（同じ陰陽）');
    console.log('  つまり、月支蔵干の五行が日干より+1（洩気関係）で、同じ陰陽が必要');
    console.log('');

    console.log('日干 庚(金=3, 陽=0)に対して洩気関係で陽干:');
    console.log('  金(3)の洩気は水(4)');
    console.log('  水の陽干: 壬(8)');
    console.log('  壬(elem:4, pol:0)の場合:');
    console.log('    関係: (4 - 3 + 5) % 5 = 1 (洩気) ✓');
    console.log('    PolMatch: 0 (同じ陽) ✓');
    console.log('    Index: 1 * 2 + 0 = 2 → 鳳閣星 ✓');
    console.log('');

    console.log('結論:');
    console.log(`  月支 ${bazi.month.branchStr}(${monthBranchIdx})の蔵干が「${monthHiddenStem}」では禄存星になる`);
    console.log('  正解の「鳳閣星」を得るには蔵干が「壬」である必要がある');
    console.log('');

    console.log('疑問点:');
    console.log('  1983-08-11では年支 亥(11)の蔵干が「甲」で正しく動作した');
    console.log('  しかし1984-12-02では月支 亥(11)の蔵干が「甲」だと間違いになる');
    console.log('  → 亥の蔵干は位置（年支/月支/日支）によって異なる可能性がある？');

    expect(true).toBe(true);
  });
});
