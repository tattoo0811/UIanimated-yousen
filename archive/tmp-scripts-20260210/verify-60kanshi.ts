/**
 * 60干支の元素属性検証スクリプト
 *
 * 目的: shohousen-all-60.htmlから抽出したデータが正しい元素属性を持っているか検証
 */

// 十干の元素属性定義
const STEM_ELEMENTS = {
  '甲': 'wood',   // 木
  '乙': 'wood',   // 木
  '丙': 'fire',   // 火
  '丁': 'fire',   // 火
  '戊': 'earth',  // 土
  '己': 'earth',  // 土
  '庚': 'metal',  // 金
  '辛': 'metal',  // 金
  '壬': 'water',  // 水
  '癸': 'water',  // 水
} as const;

// 十二支の元素属性定義
const BRANCH_ELEMENTS = {
  '子': 'water',  // 水
  '丑': 'earth',  // 土
  '寅': 'wood',   // 木
  '卯': 'wood',   // 木
  '辰': 'earth',  // 土
  '巳': 'fire',   // 火
  '午': 'fire',   // 火
  '未': 'earth',  // 土
  '申': 'metal',  // 金
  '酉': 'metal',  // 金
  '戌': 'earth',  // 土
  '亥': 'water',  // 水
} as const;

// 60干支の正しい組み合わせ（順番通り）
const KANSHI_60 = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
];

// HTMLから抽出したデータ（data-elem-group属性に基づく）
// shohousen-all-60.html の干支タブ配置順序
const EXTRACTED_DATA = [
  // 木グループ (data-elem-group="木")
  { kanshi: '甲子', no: 1, element: 'wood' },
  { kanshi: '乙丑', no: 2, element: 'wood' },
  { kanshi: '甲戌', no: 11, element: 'wood' },
  { kanshi: '乙亥', no: 12, element: 'wood' },
  { kanshi: '甲申', no: 21, element: 'wood' },
  { kanshi: '乙酉', no: 22, element: 'wood' },
  { kanshi: '甲午', no: 31, element: 'wood' },
  { kanshi: '乙未', no: 32, element: 'wood' },
  { kanshi: '甲辰', no: 41, element: 'wood' },
  { kanshi: '乙巳', no: 42, element: 'wood' },
  { kanshi: '甲寅', no: 51, element: 'wood' },
  { kanshi: '乙卯', no: 52, element: 'wood' },

  // 火グループ (data-elem-group="火")
  { kanshi: '丙寅', no: 3, element: 'fire' },
  { kanshi: '丁卯', no: 4, element: 'fire' },
  { kanshi: '丙子', no: 13, element: 'fire' },
  { kanshi: '丁丑', no: 14, element: 'fire' },
  { kanshi: '丙戌', no: 23, element: 'fire' },
  { kanshi: '丁亥', no: 24, element: 'fire' },
  { kanshi: '丙申', no: 33, element: 'fire' },
  { kanshi: '丁酉', no: 34, element: 'fire' },
  { kanshi: '丙午', no: 43, element: 'fire' },
  { kanshi: '丁未', no: 44, element: 'fire' },
  { kanshi: '丙辰', no: 53, element: 'fire' },
  { kanshi: '丁巳', no: 54, element: 'fire' },

  // 土グループ (data-elem-group="土")
  { kanshi: '戊辰', no: 5, element: 'earth' },
  { kanshi: '己巳', no: 6, element: 'earth' },
  { kanshi: '戊寅', no: 15, element: 'earth' },
  { kanshi: '己卯', no: 16, element: 'earth' },
  { kanshi: '戊子', no: 25, element: 'earth' },
  { kanshi: '己丑', no: 26, element: 'earth' },
  { kanshi: '戊戌', no: 35, element: 'earth' },
  { kanshi: '己亥', no: 36, element: 'earth' },
  { kanshi: '戊申', no: 45, element: 'earth' },
  { kanshi: '己酉', no: 46, element: 'earth' },
  { kanshi: '戊午', no: 55, element: 'earth' },
  { kanshi: '己未', no: 56, element: 'earth' },

  // 金グループ (data-elem-group="金")
  { kanshi: '庚午', no: 7, element: 'metal' },
  { kanshi: '辛未', no: 8, element: 'metal' },
  { kanshi: '庚辰', no: 17, element: 'metal' },
  { kanshi: '辛巳', no: 18, element: 'metal' },
  { kanshi: '庚寅', no: 27, element: 'metal' },
  { kanshi: '辛卯', no: 28, element: 'metal' },
  { kanshi: '庚子', no: 37, element: 'metal' },
  { kanshi: '辛丑', no: 38, element: 'metal' },
  { kanshi: '庚戌', no: 47, element: 'metal' },
  { kanshi: '辛亥', no: 48, element: 'metal' },
  { kanshi: '庚申', no: 57, element: 'metal' },
  { kanshi: '辛酉', no: 58, element: 'metal' },

  // 水グループ (data-elem-group="水")
  { kanshi: '壬申', no: 9, element: 'water' },
  { kanshi: '癸酉', no: 10, element: 'water' },
  { kanshi: '壬午', no: 19, element: 'water' },
  { kanshi: '癸未', no: 20, element: 'water' },
  { kanshi: '壬辰', no: 29, element: 'water' },
  { kanshi: '癸巳', no: 30, element: 'water' },
  { kanshi: '壬寅', no: 39, element: 'water' },
  { kanshi: '癸卯', no: 40, element: 'water' },
  { kanshi: '壬子', no: 49, element: 'water' },
  { kanshi: '癸丑', no: 50, element: 'water' },
  { kanshi: '壬戌', no: 59, element: 'water' },
  { kanshi: '癸亥', no: 60, element: 'water' },
];

/**
 * 干支から正しい元素属性を判定
 * @param kanshi 干支（例: "甲子"）
 * @returns 正しい元素属性
 */
function getCorrectElement(kanshi: string): 'wood' | 'fire' | 'earth' | 'metal' | 'water' {
  const stem = kanshi[0];
  const branch = kanshi[1];

  const stemElement = STEM_ELEMENTS[stem as keyof typeof STEM_ELEMENTS];
  const branchElement = BRANCH_ELEMENTS[branch as keyof typeof BRANCH_ELEMENTS];

  // 十干の元素を優先（陰陽五行説の原則）
  return stemElement;
}

/**
 * 検証実行
 */
function verify(): void {
  console.log('=== 60干支元素属性検証 ===\n');

  const errors: Array<{kanshi: string, no: number, assigned: string, correct: string}> = [];
  const elementCounts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  EXTRACTED_DATA.forEach((data) => {
    const correctElement = getCorrectElement(data.kanshi);

    // 元素カウント
    elementCounts[correctElement]++;

    // 検証
    if (data.element !== correctElement) {
      errors.push({
        kanshi: data.kanshi,
        no: data.no,
        assigned: data.element,
        correct: correctElement,
      });
    }
  });

  // 結果出力
  console.log('【元素配分】正しい配分（各12件ずつ）');
  console.log(JSON.stringify(elementCounts, null, 2));
  console.log('');

  if (errors.length === 0) {
    console.log('✅ 全ての干支が正しい元素属性を持っています');
  } else {
    console.log(`❌ ${errors.length}件の不整合が見つかりました\n`);
    console.log('【不整合リスト】');
    errors.forEach((err) => {
      console.log(`No.${err.no.toString().padStart(2, '0')} ${err.kanshi}: 割当済み="${err.assigned}" 正解="${err.correct}"`);
    });
    console.log('');
  }

  // 正しいデータセットを生成
  console.log('\n【正しいデータセット】');
  const correctData = EXTRACTED_DATA.map((data) => ({
    kanshi: data.kanshi,
    no: data.no,
    element: getCorrectElement(data.kanshi),
  }));

  console.log(JSON.stringify(correctData, null, 2));
}

// 実行
verify();
