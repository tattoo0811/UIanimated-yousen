/**
 * ENERGY_TABLE 全体検証
 * 既知のテストケースから正しい値を確認
 */

// TODO: Restore import when lib file is available
// import { calculateBaZi, calculateYangSen, STEMS, BRANCHES } from '@/src/lib/logic';

// Stub implementations for disabled tests
const calculateBaZi = () => ({ year: { name: '' }, month: { name: '' }, day: { name: '' }, hour: { name: '' } });
const calculateYangSen = () => ({});

describe('ENERGY_TABLE 検証', () => {
  const testCases = [
    {
      name: '1983-08-11 12:00',
      date: new Date(1983, 7, 11, 12, 0, 0),
      expected: {
        bazi: { day: { stem: '辛', branch: '未' } },
        leftShoulder: { branch: '亥', name: '天恍星', score: 7 },   // 年支亥→左肩
        rightLeg: { branch: '未', name: '天堂星', score: 8 },       // 日支未→右足
        leftLeg: { branch: '申', name: '天将星', score: 12 }        // 月支申→左足
      }
    },
    {
      name: '1984-12-02 12:00',
      date: new Date(1984, 11, 2, 12, 0, 0),
      expected: {
        bazi: { day: { stem: '庚', branch: '午' } },
        leftShoulder: { branch: '子', name: '天極星', score: 2 },   // 年支子→左肩
        rightLeg: { branch: '午', name: '天恍星', score: 7 },       // 日支午→右足
        leftLeg: { branch: '亥', name: '天胡星', score: 4 }         // 月支亥→左足
      }
    }
  ];

  // 十二大従星の検証テスト（参照サイトで確認済み）
  it('既知のテストケースで検証', () => {
    console.log('\n=== ENERGY_TABLE 検証 ===\n');

    const STEM_TO_INDEX: Record<string, number> = {
      '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
      '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
    };

    const BRANCH_TO_INDEX: Record<string, number> = {
      '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
      '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11
    };

    const errors: Array<{
      testCase: string;
      position: string;
      dayStem: string;
      branch: string;
      expected: { name: string; score: number };
      actual: { name: string; score: number };
    }> = [];

    testCases.forEach(testCase => {
      const bazi = calculateBaZi(testCase.date, 135);
      const yangSen = calculateYangSen(bazi, testCase.date);

      console.log(`${testCase.name}:`);
      console.log(`  日干: ${bazi.day.stemStr} (${bazi.day.stem - 1})`);
      console.log('');

      // 左肩の検証
      const leftShoulderMatch =
        yangSen.leftShoulder.name === testCase.expected.leftShoulder.name &&
        yangSen.leftShoulder.score === testCase.expected.leftShoulder.score;

      console.log(`  左肩（年支 ${bazi.year.branchStr}）:`);
      console.log(`    期待: ${testCase.expected.leftShoulder.name} (${testCase.expected.leftShoulder.score}点)`);
      console.log(`    実際: ${yangSen.leftShoulder.name} (${yangSen.leftShoulder.score}点)`);
      console.log(`    判定: ${leftShoulderMatch ? '✅' : '❌'}`);

      if (!leftShoulderMatch) {
        errors.push({
          testCase: testCase.name,
          position: '左肩',
          dayStem: bazi.day.stemStr,
          branch: bazi.year.branchStr,
          expected: testCase.expected.leftShoulder,
          actual: yangSen.leftShoulder
        });
      }

      // 右足の検証
      const rightLegMatch =
        yangSen.rightLeg.name === testCase.expected.rightLeg.name &&
        yangSen.rightLeg.score === testCase.expected.rightLeg.score;

      console.log(`  右足（日支 ${bazi.day.branchStr}）:`);
      console.log(`    期待: ${testCase.expected.rightLeg.name} (${testCase.expected.rightLeg.score}点)`);
      console.log(`    実際: ${yangSen.rightLeg.name} (${yangSen.rightLeg.score}点)`);
      console.log(`    判定: ${rightLegMatch ? '✅' : '❌'}`);

      if (!rightLegMatch) {
        errors.push({
          testCase: testCase.name,
          position: '右足',
          dayStem: bazi.day.stemStr,
          branch: bazi.day.branchStr,  // 日支→右足
          expected: testCase.expected.rightLeg,
          actual: yangSen.rightLeg
        });
      }

      // 左足の検証
      const leftLegMatch =
        yangSen.leftLeg.name === testCase.expected.leftLeg.name &&
        yangSen.leftLeg.score === testCase.expected.leftLeg.score;

      console.log(`  左足（月支 ${bazi.month.branchStr}）:`);
      console.log(`    期待: ${testCase.expected.leftLeg.name} (${testCase.expected.leftLeg.score}点)`);
      console.log(`    実際: ${yangSen.leftLeg.name} (${yangSen.leftLeg.score}点)`);
      console.log(`    判定: ${leftLegMatch ? '✅' : '❌'}`);
      console.log('');

      if (!leftLegMatch) {
        errors.push({
          testCase: testCase.name,
          position: '左足',
          dayStem: bazi.day.stemStr,
          branch: bazi.month.branchStr,  // 月支→左足
          expected: testCase.expected.leftLeg,
          actual: yangSen.leftLeg
        });
      }
    });

    if (errors.length > 0) {
      console.log('=== エラーサマリー ===\n');

      // 干ごとにグループ化
      const errorsByStem: Record<string, Array<{
        branch: string;
        branchIdx: number;
        expected: number;
        actual: number;
      }>> = {};

      errors.forEach(error => {
        if (!errorsByStem[error.dayStem]) {
          errorsByStem[error.dayStem] = [];
        }
        errorsByStem[error.dayStem].push({
          branch: error.branch,
          branchIdx: BRANCH_TO_INDEX[error.branch],
          expected: error.expected.score,
          actual: error.actual.score
        });
      });

      Object.entries(errorsByStem).forEach(([stem, stemErrors]) => {
        const stemIdx = STEM_TO_INDEX[stem];
        console.log(`${stem} (インデックス ${stemIdx}) の行でエラー:`);
        stemErrors.forEach(err => {
          console.log(`  [${err.branchIdx}] ${err.branch}: ${err.actual} → ${err.expected} に修正が必要`);
        });
        console.log('');
      });

      console.log('=== 修正が必要なENERGY_TABLE行 ===\n');

      // 現在のENERGY_TABLE
      const CURRENT_ENERGY_TABLE = [
        [7, 8, 11, 12, 10, 6, 3, 1, 5, 2, 4, 9], // 甲
        [4, 5, 2, 1, 12, 8, 6, 9, 10, 7, 11, 3], // 乙
        [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 丙
        [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 丁
        [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 戊
        [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 己
        [4, 6, 1, 9, 5, 2, 8, 12, 11, 10, 7, 3], // 庚
        [9, 6, 3, 1, 4, 10, 11, 12, 8, 5, 2, 7], // 辛 (corrected)
        [12, 11, 10, 7, 9, 3, 6, 5, 4, 1, 8, 2], // 壬
        [12, 6, 1, 3, 9, 8, 4, 5, 2, 7, 10, 11]  // 癸
      ];

      Object.entries(errorsByStem).forEach(([stem, stemErrors]) => {
        const stemIdx = STEM_TO_INDEX[stem];
        const currentRow = [...CURRENT_ENERGY_TABLE[stemIdx]];

        console.log(`${stem} (${stemIdx}) 現在の値:`);
        console.log(`  [${currentRow.join(', ')}]`);
        console.log('  必要な修正:');
        stemErrors.forEach(err => {
          console.log(`    [${err.branchIdx}]: ${currentRow[err.branchIdx]} → ${err.expected}`);
        });
        console.log('');
      });
    } else {
      console.log('✅ すべてのテストケースが合格しました！');
    }

    expect(errors.length).toBe(0);
  });
});
