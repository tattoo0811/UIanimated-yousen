/**
 * キャラクター設計用算命学計算スクリプト
 * 生年月日から算命学データを計算してJSON出力
 */

interface KanshiResult {
  rokujukkoushi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  nikkan: string;
  gesshi: string;
  tenchusatsu: string;
  jugdais: string[];
  junidai: string[];
  five_elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  total_energy: number;
}

// 生年月日から六十干支を計算する簡易関数
function getSexagenaryCycle(year: number, month: number, day: number): {
  year: string;
  month: string;
  day: string;
} {
  // 十干
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  // 十二支
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 年干支（立春ベース）
  const yearStemIdx = (year - 4) % 10;
  const yearBranchIdx = (year - 4) % 12;
  const yearKanshi = stems[(yearStemIdx + 10) % 10] + branches[(yearBranchIdx + 12) % 12];

  // 月干支（簡易計算：寅月=2月基準）
  const monthBranchIdx = (month + 1) % 12; // 寅(1)→2月
  const yearStemForMonth = (year - 4) % 10;
  const monthStemBase = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 甲寅=2, 丙寅=4...
  const monthStemIdx = (monthStemBase[yearStemForMonth] + monthBranchIdx - 1) % 10;
  const monthKanshi = stems[monthStemIdx] + branches[monthBranchIdx];

  // 日干支（簡易計算：基準日からの経過日数）
  const baseDate = new Date(2024, 0, 1); // 2024-01-01 = 甲子
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayStemIdx = (daysDiff + 1) % 10;
  const dayBranchIdx = (daysDiff + 1) % 12;
  const dayKanshi = stems[(dayStemIdx + 10) % 10] + branches[(dayBranchIdx + 12) % 12];

  return {
    year: yearKanshi,
    month: monthKanshi,
    day: dayKanshi
  };
}

// 天中殺を判定
function getTenchusatsu(nikkan: string, gesshi: string): string {
  const nikkanStem = nikkan.charAt(0);
  const gesshiBranch = gesshi;

  const tenchusatsuMap: Record<string, string[]> = {
    '甲': ['午', '未', '申', '酉'],
    '乙': ['巳', '午', '未', '申', '酉'],
    '丙': ['辰', '巳'],
    '丁': ['卯', '辰', '巳'],
    '戊': ['寅', '卯', '辰'],
    '己': ['丑', '寅', '卯', '辰'],
    '庚': ['子', '丑', '寅'],
    '辛': ['亥', '子', '丑', '寅'],
    '壬': ['戌', '亥'],
    '癸': ['酉', '戌', '亥']
  };

  const tenchusatsuBranches = tenchusatsuMap[nikkanStem] || [];

  if (tenchusatsuBranches.includes(gesshiBranch)) {
    return `${nikkanStem}支天中殺`;
  }

  // 天中殺でない場合は空文字
  return '';
}

// 十大主星を計算（簡易版）
function getJugdai(nikkan: string, otherKan: string): string {
  const jugdaiMap: Record<string, Record<string, string>> = {
    '甲': {
      '甲': '貫索星', '乙': '石門星', '丙': '調舒星', '丁': '禄存星',
      '戊': '鎮座星', '己': '仙塢星', '庚': '調舒星', '辛': '石門星',
      '壬': '貫索星', '癸': '禄存星'
    },
    '乙': {
      '甲': '石門星', '乙': '貫索星', '丙': '禄存星', '丁': '調舒星',
      '戊': '仙塢星', '己': '鎮座星', '庚': '石門星', '辛': '調舒星',
      '壬': '禄存星', '癸': '貫索星'
    },
    '丙': {
      '甲': '調舒星', '乙': '禄存星', '丙': '司禄星', '丁': '披印星',
      '戊': '鳳閣星', '己': '車驎星', '庚': '司禄星', '辛': '披印星',
      '壬': '調舒星', '癸': '禄存星'
    },
    '丁': {
      '甲': '禄存星', '乙': '調舒星', '丙': '披印星', '丁': '司禄星',
      '戊': '車驎星', '己': '鳳閣星', '庚': '披印星', '辛': '司禄星',
      '壬': '禄存星', '癸': '調舒星'
    },
    '戊': {
      '甲': '鎮座星', '乙': '仙塢星', '丙': '鳳閣星', '丁': '車驎星',
      '戊': '印長星', '己': '牧笛星', '庚': '鳳閣星', '辛': '車驎星',
      '壬': '鎮座星', '癸': '仙塢星'
    },
    '己': {
      '甲': '仙塢星', '乙': '鎮座星', '丙': '車驎星', '丁': '鳳閣星',
      '戊': '牧笛星', '己': '印長星', '庚': '車驎星', '辛': '鳳閣星',
      '壬': '仙塢星', '癸': '鎮座星'
    },
    '庚': {
      '甲': '調舒星', '乙': '石門星', '丙': '司禄星', '丁': '披印星',
      '戊': '鳳閣星', '己': '車驎星', '庚': '司禄星', '辛': '披印星',
      '壬': '調舒星', '癸': '石門星'
    },
    '辛': {
      '甲': '石門星', '乙': '調舒星', '丙': '披印星', '丁': '司禄星',
      '戊': '車驎星', '己': '鳳閣星', '庚': '披印星', '辛': '司禄星',
      '壬': '石門星', '癸': '調舒星'
    },
    '壬': {
      '甲': '貫索星', '乙': '禄存星', '丙': '調舒星', '丁': '禄存星',
      '戊': '鎮座星', '己': '仙塢星', '庚': '調舒星', '辛': '禄存星',
      '壬': '貫索星', '癸': '司禄星'
    },
    '癸': {
      '甲': '禄存星', '乙': '貫索星', '丙': '禄存星', '丁': '調舒星',
      '戊': '仙塢星', '己': '鎮座星', '庚': '禄存星', '辛': '調舒星',
      '壬': '司禄星', '癸': '貫索星'
    }
  };

  return jugdaiMap[nikkan]?.[otherKan] || '未知';
}

// 五行エネルギーを計算
function calculateFiveElements(kanshi: string): {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
} {
  const stemElements: Record<string, string> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  };

  const branchElements: Record<string, string> = {
    '寅': 'wood', '卯': 'wood',
    '巳': 'fire', '午': 'fire',
    '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
    '申': 'metal', '酉': 'metal',
    '亥': 'water', '子': 'water'
  };

  const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  for (const char of kanshi) {
    const elem = stemElements[char] || branchElements[char];
    if (elem) {
      elements[elem as keyof typeof elements]++;
    }
  }

  return elements;
}

// メイン計算関数
function calculateCharacter(birthDate: string): KanshiResult {
  const [year, month, day] = birthDate.split('-').map(Number);

  const kanshi = getSexagenaryCycle(year, month, day);
  const nikkan = kanshi.day.charAt(0);
  const gesshi = kanshi.month.charAt(1);

  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

  // 十大主星（日干×年干、日干×月干、日干×日干、日干×時干）
  const jugdais = [
    getJugdai(nikkan, kanshi.year.charAt(0)),
    getJugdai(nikkan, kanshi.month.charAt(0)),
    getJugdai(nikkan, kanshi.day.charAt(0)),
    getJugdai(nikkan, kanshi.year.charAt(0)), // 時干は年干で代用
    getJugdai(nikkan, kanshi.month.charAt(0))  // 5つ目の星
  ];

  // 十二大従星（簡易版）
  const junidaiMap: Record<string, string[]> = {
    '甲': ['天厨星', '天胡星', '天親星'],
    '乙': ['天胡星', '天印星', '天廟星'],
    '丙': ['天印星', '天貴星', '天堂星'],
    '丁': ['天貴星', '天将星', '天糧星'],
    '戊': ['天堂星', '天印星', '天禄星'],
    '己': ['天禄星', '天庫星', '天知星'],
    '庚': ['天将星', '天印星', '天剛星'],
    '辛': ['天剛星', '天南星', '天楚星'],
    '壬': ['天禄星', '天馳星', '天虛星'],
    '癸': ['天庫星', '天禄星', '天馳星']
  };

  const junidai = junidaiMap[nikkan] || ['天印星', '天禄星', '天剛星'];

  const fiveElements = calculateFiveElements(
    kanshi.year + kanshi.month + kanshi.day
  );

  const totalEnergy =
    fiveElements.wood * 3 +
    fiveElements.fire * 2 +
    fiveElements.earth * 5 +
    fiveElements.metal * 4 +
    fiveElements.water * 1;

  return {
    rokujukkoushi: {
      year: kanshi.year,
      month: kanshi.month,
      day: kanshi.day,
      hour: '甲午' // デフォルト値
    },
    nikkan,
    gesshi,
    tenchusatsu,
    jugdais,
    junidai,
    five_elements: fiveElements,
    total_energy: totalEnergy
  };
}

// テスト実行
const testDates = [
  '2003-02-20', // エピソード2: 佐藤翔
  '1999-05-15', // テスト用
  '1985-08-22'  // テスト用
];

console.log('=== キャラクター算命学計算 ===\n');

testDates.forEach(date => {
  console.log(`生年月日: ${date}`);
  const result = calculateCharacter(date);
  console.log(JSON.stringify(result, null, 2));
  console.log('\n---\n');
});

export { calculateCharacter };
