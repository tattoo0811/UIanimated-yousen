/**
 * キャラクター算命学計算スクリプト
 * エピソード91-120のキャラクターの算命学データを計算
 */

import { calculateBaZi } from './src/bazi';
import { calculateYangSen } from './src/yangsen';
import { getBranchElement, getElement } from './src/constants';
import type { FourPillars, YangSen } from './src/types';

interface CharacterData {
  episode: number;
  name: string;
  name_reading: string;
  birth_date: string;
  birth_time: string;
  age: number;
  gender: 'male' | 'female';
  life_event: string;
  worry: string;
  occupation?: string;
}

interface SanmeigakuResult {
  episode: number;
  name: string;
  name_reading: string;
  birth_date: string;
  birth_time: string;
  age: number;
  gender: number; // 1: male, 2: female
  life_event: string;
  worry: string;
  occupation?: string;
  sanmeigaku_verified: {
    bazi: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    jugdai: [string, string, string, string, string]; // 頭、胸、腹、右手、左手
    junidai: Array<{ part: string; star: string; points: number }>;
    five_elements: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    total_energy: number;
    nikkan: string;
    gesshi: string;
    tenchusatsu: string;
  };
  persona_traits: string[];
  notes: string;
}

// 五行エネルギー計算
function calculateFiveElements(bazi: FourPillars): {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  total: number;
} {
  let wood = 0,
    fire = 0,
    earth = 0,
    metal = 0,
    water = 0;

  // 天干から五行を計算（各2点）
  const stems = [bazi.year.stem, bazi.month.stem, bazi.day.stem, bazi.hour.stem];
  stems.forEach((stemIdx) => {
    const element = getElement(stemIdx - 1);
    switch (element) {
      case 0:
        wood += 2;
        break;
      case 1:
        fire += 2;
        break;
      case 2:
        earth += 2;
        break;
      case 3:
        metal += 2;
        break;
      case 4:
        water += 2;
        break;
    }
  });

  // 地支から五行を計算（各2点）
  const branches = [
    bazi.year.branch,
    bazi.month.branch,
    bazi.day.branch,
    bazi.hour.branch,
  ];
  branches.forEach((branchIdx) => {
    const element = getBranchElement(branchIdx - 1);
    switch (element) {
      case 0:
        wood += 2;
        break;
      case 1:
        fire += 2;
        break;
      case 2:
        earth += 2;
        break;
      case 3:
        metal += 2;
        break;
      case 4:
        water += 2;
        break;
    }
  });

  const total = wood + fire + earth + metal + water;

  return { wood, fire, earth, metal, water, total };
}

// 天中殺判定
function getTenchusatsu(nikkan: string, gesshi: string): string {
  const table: Record<string, Record<string, string>> = {
    甲: { 寅: '寅卯', 卯: '寅卯' },
    乙: { 寅: '寅卯', 卯: '寅卯' },
    丙: { 辰: '辰巳', 巳: '辰巳' },
    丁: { 辰: '辰巳', 巳: '辰巳' },
    戊: { 辰: '辰巳', 巳: '辰巳' },
    己: { 辰: '辰巳', 巳: '辰巳' },
    庚: { 申: '申酉', 酉: '申酉' },
    辛: { 申: '申酉', 酉: '申酉' },
    壬: { 戌: '戌亥', 亥: '戌亥' },
    癸: { 戌: '戌亥', 亥: '戌亥' },
    子: { 子: '子丑', 丑: '子丑' },
    丑: { 子: '子丑', 丑: '子丑' },
  };

  if (table[nikkan] && table[nikkan][gesshi]) {
    return table[nikkan][gesshi] + '天中殺';
  }

  return 'なし';
}

// 新規キャラクターデータ（97-120話用）
const newCharacters: CharacterData[] = [
  // 第1優先
  {
    episode: 97,
    name: '山本 大輔',
    name_reading: 'やまもと だいすけ',
    birth_date: '2005-04-15',
    birth_time: '10:30',
    age: 19,
    gender: 'male',
    life_event: 'E05: 大学受験',
    worry: '2浪目。予備校寮に住み、親への罪悪感と合格への焦燥感',
    occupation: '浪人生（予備校生）',
  },
  {
    episode: 98,
    name: '山本 敏子',
    name_reading: 'やまもと としこ',
    birth_date: '1976-08-22',
    birth_time: '14:00',
    age: 48,
    gender: 'female',
    life_event: 'E05: 大学受験（親）',
    worry: '長男の浪人による経済的負担と親戚への顔向け',
    occupation: 'パート（事務）',
  },
  {
    episode: 99,
    name: '高橋 優子',
    name_reading: 'たかはし ゆうこ',
    birth_date: '1996-03-10',
    birth_time: '08:45',
    age: 28,
    gender: 'female',
    life_event: 'F05: 出産・育児',
    worry: '第一子出産後、産後うつ。赤ちゃんを愛せない罪悪感',
    occupation: '育児休業中（元事務）',
  },
  {
    episode: 100,
    name: '渡辺 由美',
    name_reading: 'わたなべ ゆみ',
    birth_date: '1986-05-18',
    birth_time: '16:20',
    age: 38,
    gender: 'female',
    life_event: 'F08: 離婚',
    worry: '夫のDVで離婚決意。シングルマザーとして就職、経済的苦困',
    occupation: '求職中（シングルマザー）',
  },
  {
    episode: 101,
    name: '林 真一',
    name_reading: 'はやし しんいち',
    birth_date: '1984-02-28',
    birth_time: '09:00',
    age: 40,
    gender: 'male',
    life_event: 'M03: うつ病',
    worry: '職場のパワハラでうつ病発症。3ヶ月休職、復帰への不安',
    occupation: '休職中（元営業）',
  },
  {
    episode: 102,
    name: '近藤 誠一',
    name_reading: 'こんどう せいいち',
    birth_date: '1982-11-05',
    birth_time: '12:00',
    age: 42,
    gender: 'male',
    life_event: 'X05: 自己破産',
    worry: 'ギャンブル依存で借金1500万円、自己破産申請。妻との別居危機',
    occupation: '無職（元会社員）',
  },
  // 第2優先
  {
    episode: 103,
    name: '伊藤 弘子',
    name_reading: 'いとう ひろこ',
    birth_date: '1976-07-12',
    birth_time: '11:30',
    age: 48,
    gender: 'female',
    life_event: 'F11: 親の介護',
    worry: '母の介護で離職。経済的不安と母の認知症進行への恐怖',
    occupation: '介護離職中',
  },
  {
    episode: 104,
    name: '斎藤 瞳',
    name_reading: 'さいとう ひとみ',
    birth_date: '1989-09-25',
    birth_time: '15:00',
    age: 35,
    gender: 'female',
    life_event: 'F04: 不妊治療',
    worry: '不妊治療3年目。体外受精2回失敗。治療費400万円超',
    occupation: '会社員',
  },
  {
    episode: 105,
    name: '中川 隆',
    name_reading: 'なかがわ たかし',
    birth_date: '1989-02-14',
    birth_time: '10:00',
    age: 35,
    gender: 'male',
    life_event: 'H06: マイホーム購入',
    worry: '住宅ローン4000万円契約。金利上昇不安',
    occupation: '会社員（年収650万円）',
  },
  {
    episode: 106,
    name: '小林 奈緒',
    name_reading: 'こばやし なお',
    birth_date: '2002-06-08',
    birth_time: '14:00',
    age: 22,
    gender: 'female',
    life_event: 'E06: 就職活動',
    worry: '大学院生。就活開始が遅れ、内定ゼロ。自己肯定感の低下',
    occupation: '大学院生',
  },
  {
    episode: 107,
    name: '村田 健太郎',
    name_reading: 'むらた けんたろう',
    birth_date: '1964-03-20',
    birth_time: '09:00',
    age: 60,
    gender: 'male',
    life_event: 'O01: 定年退職',
    worry: '定年退職。役割喪失でうつ的状態、妻との関係悪化',
    occupation: '定年退職（元会社員）',
  },
  // 第3優先
  {
    episode: 108,
    name: '吉田 明日香',
    name_reading: 'よしだ あすか',
    birth_date: '1991-03-15',
    birth_time: '11:00',
    age: 33,
    gender: 'female',
    life_event: 'F01: 婚活',
    worry: '婚活アプリ5社利用、婚活パーティー多数参加。親からの急かし',
    occupation: '会社員',
  },
  {
    episode: 109,
    name: '宮下 美咲',
    name_reading: 'みやした みさき',
    birth_date: '1989-07-30',
    birth_time: '16:00',
    age: 35,
    gender: 'female',
    life_event: 'F07: 不倫・浮気',
    worry: '夫の浮気発覚。子供のために離婚せず、信頼回復の苦悩',
    occupation: 'パート',
  },
  {
    episode: 110,
    name: '中村 翔太',
    name_reading: 'なかむら しょうた',
    birth_date: '2012-05-20',
    birth_time: '10:00',
    age: 12,
    gender: 'male',
    life_event: 'E03: 中学受験',
    worry: '中学受験塾に通う小学生。好きなサッカーを諦め、親の期待に応えるストレス',
    occupation: '小学6年生（受験生）',
  },
  {
    episode: 111,
    name: '青田 誠一',
    name_reading: 'あおた せいいち',
    birth_date: '1992-01-18',
    birth_time: '09:00',
    age: 32,
    gender: 'male',
    life_event: 'E07: 転職',
    worry: '残業常態化の企業から転職希望。転職サイトに登録し続けるが不採用',
    occupation: '会社員（年収550万円）',
  },
  {
    episode: 112,
    name: '佐藤 美咲',
    name_reading: 'さとう みさき',
    birth_date: '1994-04-10',
    birth_time: '14:00',
    age: 30,
    gender: 'female',
    life_event: 'E01: 幼稚園受験',
    worry: '第一子の幼稚園受験に奔走。夫との教育方針の対立、母親同士の競争に疲弊',
    occupation: '専業主婦（元会社員）',
  },
  // エピソード113-120用
  {
    episode: 113,
    name: '石井 健太郎',
    name_reading: 'いしい けんたろう',
    birth_date: '1979-03-25',
    birth_time: '10:00',
    age: 45,
    gender: 'male',
    life_event: 'E08: 早期退職',
    worry: '希望退職制度に応募。退職金で起業を計画するが失敗の恐怖',
    occupation: '退職予定（元会社員）',
  },
  {
    episode: 114,
    name: '大石 文子',
    name_reading: 'おおいし ふみこ',
    birth_date: '1974-06-12',
    birth_time: '15:30',
    age: 50,
    gender: 'female',
    life_event: 'M01: がん診断',
    worry: '乳がん診断。抗がん剤治療と仕事の両立、髪の毛が抜ける恐怖',
    occupation: '会社員',
  },
  {
    episode: 115,
    name: '岡本 莉子',
    name_reading: 'おかもと りこ',
    birth_date: '1996-08-20',
    birth_time: '12:00',
    age: 28,
    gender: 'female',
    life_event: 'F07: 不倫・浮気（相手側）',
    worry: '既婚者と知りながら恋愛、別れられない依存',
    occupation: '会社員',
  },
  {
    episode: 116,
    name: '渡辺 翔太',
    name_reading: 'わたなべ しょうた',
    birth_date: '2014-03-15',
    birth_time: '10:00',
    age: 10,
    gender: 'male',
    life_event: 'F08: 離婚（子供）',
    worry: '父親がいないことでcomplex、学校でのいじめ',
    occupation: '小学4年生',
  },
  {
    episode: 117,
    name: '斎藤 翔太',
    name_reading: 'さいとう しょうた',
    birth_date: '1986-11-08',
    birth_time: '09:00',
    age: 38,
    gender: 'male',
    life_event: 'F04: 不妊治療（男性）',
    worry: '男性不妊の診断を受け、プライドが傷つく',
    occupation: '会社員',
  },
  {
    episode: 118,
    name: '高橋 健太',
    name_reading: 'たかはし けんた',
    birth_date: '1994-01-22',
    birth_time: '11:00',
    age: 30,
    gender: 'male',
    life_event: 'F05: 出産・育児（夫）',
    worry: '育児参加への無理解、「妻がやればいい」',
    occupation: '会社員（年収500万円）',
  },
  {
    episode: 119,
    name: '近藤 美咲',
    name_reading: 'こんどう みさき',
    birth_date: '1984-07-18',
    birth_time: '14:00',
    age: 40,
    gender: 'female',
    life_event: 'X05: 自己破産（妻）',
    worry: '夫の借金発覚、離婚を考える',
    occupation: 'パート',
  },
  {
    episode: 120,
    name: '村田 和子',
    name_reading: 'むらた かずこ',
    birth_date: '1966-09-30',
    birth_time: '16:00',
    age: 58,
    gender: 'female',
    life_event: 'O01: 定年退職（妻）',
    worry: '夫が家にずっといて鬱陶しい、自分の時間がない',
    occupation: 'パート',
  },
];

// キャラクターの算命学計算
function calculateCharacter(character: CharacterData): SanmeigakuResult {
  const birthDate = new Date(character.birth_date + 'T' + character.birth_time + ':00');
  const bazi = calculateBaZi(birthDate, 135);
  const yangsen = calculateYangSen(bazi, birthDate);
  const fiveElements = calculateFiveElements(bazi);

  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

  // ペルソナ特性の生成
  const personaTraits = generatePersonaTraits(
    character,
    bazi,
    yangsen,
    fiveElements,
    tenchusatsu
  );

  return {
    episode: character.episode,
    name: character.name,
    name_reading: character.name_reading,
    birth_date: character.birth_date,
    birth_time: character.birth_time,
    age: character.age,
    gender: character.gender === 'male' ? 1 : 2,
    life_event: character.life_event,
    worry: character.worry,
    occupation: character.occupation,
    sanmeigaku_verified: {
      bazi: {
        year: bazi.year.name,
        month: bazi.month.name,
        day: bazi.day.name,
        hour: bazi.hour.name,
      },
      jugdai: [
        yangsen.head, // 頭
        yangsen.chest, // 胸
        yangsen.belly, // 腹
        yangsen.rightHand, // 右手
        yangsen.leftHand, // 左手
      ],
      junidai: [
        { part: '左肩', star: yangsen.leftShoulder.name, points: yangsen.leftShoulder.score },
        { part: '左足', star: yangsen.leftLeg.name, points: yangsen.leftLeg.score },
        { part: '右足', star: yangsen.rightLeg.name, points: yangsen.rightLeg.score },
      ],
      five_elements: {
        wood: fiveElements.wood,
        fire: fiveElements.fire,
        earth: fiveElements.earth,
        metal: fiveElements.metal,
        water: fiveElements.water,
      },
      total_energy: fiveElements.total,
      nikkan,
      gesshi,
      tenchusatsu,
    },
    persona_traits: personaTraits,
    notes: 'accurate-logic ライブラリで計算。朱学院での検証が必要。',
  };
}

// ペルソナ特性生成
function generatePersonaTraits(
  character: CharacterData,
  bazi: FourPillars,
  yangsen: YangSen,
  fiveElements: { wood: number; fire: number; earth: number; metal: number; water: number; total: number },
  tenchusatsu: string
): string[] {
  const traits: string[] = [];

  // 日干の特性
  const nikkan = bazi.day.stemStr;
  const nikkanTraits: Record<string, string> = {
    甲: '木の陽：直情的、芯が強い、成長意欲がある',
    乙: '木の陰：柔軟、協調性がある、しなやか',
    丙: '火の陽：情熱的、リーダーシップ、明るい',
    丁: '火の陰：知的、繊細、内気な燃え上がり',
    戊: '土の陽：安定志向、信頼性、大らか',
    己: '土の陰：包容力、養う、母性',
    庚: '金の陽：鋭い、断定力、正義感',
    辛: '金の陰：繊細、完成、美意識',
    壬: '水の陽：適応力、自由、変化を好む',
    癸: '水の陰：深い洞察力、神秘性、包容力',
  };

  if (nikkanTraits[nikkan]) {
    traits.push(`日干：${nikkanTraits[nikkan]}`);
  }

  // 陽占の中心星（胸）
  const chestStar = yangsen.chest;
  const chestTraits: Record<string, string> = {
    司禄星: '財運に恵まれる、実利的、安定を求める',
    禄存星: '蓄財、保守的、堅実',
    貫索星: '自己実現、独立心、理想主義',
    石門星: '学習、研究、知識欲',
    鳳閣星: '表現、芸術、華やかさ',
    調舒星: '個の確立、自立、マイペース',
    車騎星: '行動力、 moving、変化',
    牽牛星: '責任感、忍耐、奉仕',
    龍高星: '哲学、内省、精神性',
    玉堂星: '名声、地位、名誉',
  };

  if (chestTraits[chestStar]) {
    traits.push(`中心星（胸）：${chestTraits[chestStar]}`);
  }

  // 十二大従星（左足・日支）
  const leftLegStar = yangsen.leftLeg.name;
  const legTraits: Record<string, string> = {
    天将星: '家長的、保護者、責任感が強い',
    天禄星: '壮年期、活動的、実行力',
    天南星: '青年的、社交的、挑戦',
    天貴星: '児童、純粋、可愛らしい',
    天堂星: '老人的、穏やか、経験則',
    天恍星: '少年少女、多感、成長期',
    天印星: '赤ん坊、無邪気、可能性',
    天庫星: '入墓、保存、保守',
    天胡星: '病人、回復期、ケアが必要',
    天極星: '死人、変革、再生',
    天馳星: 'あの世、超越、神秘',
    天報星: '胎児、新生、始まり',
  };

  if (legTraits[leftLegStar]) {
    traits.push(`十二大従星（左足）：${legTraits[leftLegStar]}`);
  }

  // 五行バランス
  const maxElement = Object.entries(fiveElements)
    .filter(([key]) => key !== 'total')
    .sort(([, a], [, b]) => b - a)[0];

  const elementNames: Record<string, string> = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水',
  };

  if (maxElement) {
    const [key, value] = maxElement;
    traits.push(`五行：${elementNames[key]}が最強（${value}点）。${value > 30 ? '過剰気味' : 'バランス型'}`);
  }

  // 天中殺
  if (tenchusatsu !== 'なし') {
    traits.push(`天中殺：${tenchusatsu}。運命の転機期`);
  }

  // エネルギー点数
  if (fiveElements.total < 20) {
    traits.push(`エネルギー点数：${fiveElements.total}点（低）。エネルギー不足、疲れやすい`);
  } else if (fiveElements.total > 30) {
    traits.push(`エネルギー点数：${fiveElements.total}点（高）。エネルギー過剰、行動的`);
  }

  return traits;
}

// メイン処理
function main() {
  console.log('キャラクター算命学計算開始...\n');

  const results: SanmeigakuResult[] = [];

  for (const character of newCharacters) {
    console.log(`計算中: ${character.name} (エピソード${character.episode})`);
    const result = calculateCharacter(character);
    results.push(result);
  }

  console.log('\n全キャラクターの計算完了！\n');

  // 結果をJSONファイルに出力
  const fs = require('fs');
  const outputPath = '/Users/kitamuratatsuhiko/UIanimated/claudedocs/EPISODES-91-120-CHARACTERS.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`結果を出力: ${outputPath}`);

  // まとめを表示
  console.log('\n=== 計算結果まとめ ===');
  console.log(`対象キャラクター数: ${results.length}`);
  console.log(`エピソード範囲: ${results[0].episode} - ${results[results.length - 1].episode}`);
  console.log('\n天中殺キャラクター:');
  results.forEach((r) => {
    if (r.sanmeigaku_verified.tenchusatsu !== 'なし') {
      console.log(`  ${r.name} (${r.sanmeigaku_verified.tenchusatsu})`);
    }
  });
}

main();
