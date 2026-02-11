/**
 * 尚美の算命学データ生成スクリプト
 *
 * キャラクター:
 * - 尚美: 1981.12.4 生まれ（44歳）
 * - ストーリー: 気は強いが男性には甘やかせてずるずると付き合い続けていた女性が、
 *           見切りをつけて新たな出会いを見つける話
 */

import { calculateBaZi } from '../accurate-logic/src/bazi';
import { calculateYangSen } from '../accurate-logic/src/yangsen';
import { getBranchElement, getElement } from '../accurate-logic/src/constants';
import type { FourPillars } from '../accurate-logic/src/types';

// 五行エネルギー計算
function calculateFiveElements(bazi: FourPillars): {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  total: number;
} {
  let wood = 0, fire = 0, earth = 0, metal = 0, water = 0;

  const stems = [bazi.year.stem, bazi.month.stem, bazi.day.stem, bazi.hour.stem];
  stems.forEach((stemIdx) => {
    const element = getElement(stemIdx - 1);
    switch (element) {
      case 0: wood += 2; break;
      case 1: fire += 2; break;
      case 2: earth += 2; break;
      case 3: metal += 2; break;
      case 4: water += 2; break;
    }
  });

  const branches = [bazi.year.branch, bazi.month.branch, bazi.day.branch, bazi.hour.branch];
  branches.forEach((branchIdx) => {
    const element = getBranchElement(branchIdx - 1);
    switch (element) {
      case 0: wood += 2; break;
      case 1: fire += 2; break;
      case 2: earth += 2; break;
      case 3: metal += 2; break;
      case 4: water += 2; break;
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

// メイン処理
function main() {
  console.log('尚美の算命学データ生成開始...\n');

  const name = '尚美';
  const name_reading = 'なおみ';
  const birth_date = '1981-12-04';
  const birth_time = '12:00'; // 正午（仮定）
  const age_2025 = 44;
  const gender: 'male' | 'female' = 'female';

  console.log(`計算中: ${name} (${birth_date} ${birth_time})\n`);

  const birthDate = new Date(birth_date + 'T' + birth_time + ':00');
  const bazi = calculateBaZi(birthDate, 135);
  const yangsen = calculateYangSen(bazi, birthDate);
  const fiveElements = calculateFiveElements(bazi);

  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

  const result = {
    basic_info: {
      name,
      name_reading,
      birth_date,
      birth_time,
      age_2025,
      gender,
    },
    four_pillars: {
      year_pillar: bazi.year.name,
      month_pillar: bazi.month.name,
      day_pillar: bazi.day.name,
      hour_pillar: bazi.hour.name,
      nikkan,
      gesshi,
      tenchusatsu,
    },
    jugdai: {
      head: yangsen.head,
      chest: yangsen.chest,
      belly: yangsen.belly,
      right_hand: yangsen.rightHand,
      left_hand: yangsen.leftHand,
    },
    junidai: {
      left_shoulder: `${yangsen.leftShoulder.name} (${yangsen.leftShoulder.score}点)`,
      left_leg: `${yangsen.leftLeg.name} (${yangsen.leftLeg.score}点)`,
      right_leg: `${yangsen.rightLeg.name} (${yangsen.rightLeg.score}点)`,
    },
    five_elements: {
      wood: fiveElements.wood,
      fire: fiveElements.fire,
      earth: fiveElements.earth,
      metal: fiveElements.metal,
      water: fiveElements.water,
      total: fiveElements.total,
    },
  };

  // 結果をJSONファイルに出力
  const fs = require('fs');
  const outputPath = '/Users/kitamuratatsuhiko/UIanimated/claudedocs/NAOMI-sanmeigaku.json';
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`結果を出力: ${outputPath}\n`);

  // 分析と解説
  console.log('=== 尚美の算命学分析 ===\n');

  console.log('【基本データ】');
  console.log(`  名前: ${result.basic_info.name} (${result.basic_info.name_reading})`);
  console.log(`  生年月日: ${result.basic_info.birth_date}`);
  console.log(`  2025年の年齢: ${result.basic_info.age_2025}歳\n`);

  console.log('【四柱推命】');
  console.log(`  年柱: ${result.four_pillars.year_pillar}`);
  console.log(`  月柱: ${result.four_pillars.month_pillar}`);
  console.log(`  日柱: ${result.four_pillars.day_pillar}`);
  console.log(`  時柱: ${result.four_pillars.hour_pillar}`);
  console.log(`  日干（命主）: ${result.four_pillars.nikkan}`);
  console.log(`  日支: ${result.four_pillars.gesshi}`);
  console.log(`  天中殺: ${result.four_pillars.tenchusatsu}\n`);

  console.log('【十大主星（9点配置）】');
  console.log(`  頭（第一命星）: ${result.jugdai.head}`);
  console.log(`  胸（中心星）: ${result.jugdai.chest} ← 性格の中心`);
  console.log(`  腹: ${result.jugdai.belly}`);
  console.log(`  右手: ${result.jugdai.right_hand}`);
  console.log(`  左手: ${result.jugdai.left_hand}\n`);

  console.log('【十二大従星（3点配置）】');
  console.log(`  左肩（年支）: ${result.junidai.left_shoulder}`);
  console.log(`  左足（日支）: ${result.junidai.left_leg}`);
  console.log(`  右足（月支）: ${result.junidai.right_leg}\n`);

  console.log('【五行バランス】');
  console.log(`  木: ${result.five_elements.wood}点`);
  console.log(`  火: ${result.five_elements.fire}点`);
  console.log(`  土: ${result.five_elements.earth}点`);
  console.log(`  金: ${result.five_elements.metal}点`);
  console.log(`  水: ${result.five_elements.water}点`);
  console.log(`  総合エネルギー: ${result.five_elements.total}点\n`);

  // ストーリー展開のヒント
  console.log('=== ストーリー展開のヒント ===\n');

  // 日干の性格
  const nikkanTraits: Record<string, string> = {
    甲: '木の陽：直情的、芯が強い、成長意欲がある。リーダーシップを取りたがる。',
    乙: '木の陰：柔軟、協調性がある、しなやか。尽くすタイプ。',
    丙: '火の陽：情熱的、明るい、表現豊か。目立ちたがり。',
    丁: '火の陰：知的、繊細、内気な燃え上がり。献身的。',
    戊: '土の陽：安定志向、信頼性がある、大らか。頼りになる。',
    己: '土の陰：包容力、養う、母性的。面倒見が良い。',
    庚: '金の陽：鋭い、断定力がある、正義感が強い。頑固。',
    辛: '金の陰：繊細、完成、美意識。プライドが高い。',
    壬: '水の陽：適応力、自由、変化を好む。好奇心旺盛。',
    癸: '水の陰：深い洞察力、神秘性、包容力。感受性豊か。',
  };

  console.log('【性格の核（日干）】');
  console.log(`  ${nikkanTraits[result.four_pillars.nikkan]}\n`);

  // 中心星の性格
  const chestStar = result.jugdai.chest;
  const chestTraits: Record<string, string> = {
    司禄星: '財運に恵まれる、実利的、安定を求める。地に足をつけて生きる。',
    禄存星: '蓄財、保守的、堅実。堅実な積み立てを好む。',
    貫索星: '自己実現、独立心、理想主義。夢を追い求める。',
    石門星: '学習、研究、知識欲。理論や正しさを追求する。',
    鳳閣星: '表現、芸術、華やかさ。クリエイティブな表現を好む。',
    調舒星: '個の確立、自立、マイペース。自分のペースを崩さない。',
    車騎星: '行動力、変化、挑戦。新しいことに挑戦したがる。',
    牽牛星: '責任感、忍耐、奉仕。尽くすことで自己実感を得る。',
    龍高星: '哲学、内省、精神性。深い考えを持つ。',
    玉堂星: '名声、地位、名誉。社会的評価を気にする。',
  };

  console.log('【中心星（胸）の特性】');
  console.log(`  ${chestTraits[chestStar]}\n`);

  // 左足（日支）＝恋愛運・対人関係
  const leftLegStar = yangsen.leftLeg.name;
  const legTraits: Record<string, string> = {
    天将星: '家長的、保護者、責任感が強い。パートナーを守ろうとする。',
    天禄星: '壮年期、活動的、実行力。リードしたがる。',
    天南星: '青年的、社交的、挑戦。刺激を求める。',
    天貴星: '児童、純粋、可愛らしい。純粋な愛を求める。',
    天堂星: '老人的、穏やか、経験則。落ち着いた関係を好む。',
    天恍星: '少年少女、多感、成長期。不安定な時期。',
    天印星: '赤ん坊、無邪気、可能性。新しい始まり。',
    天庫星: '入墓、保存、保守。安定を重視。',
    天胡星: '病人、回復期、ケアが必要。癒しが必要。',
    天極星: '死人、変革、再生。生まれ変わる変化。',
    天馳星: 'あの世、超越、神秘。精神的なつながり。',
    天報星: '胎児、新生、始まり。新しい関係の始まり。',
  };

  console.log('【恋愛運（十二大従星・左足）】');
  console.log(`  ${legTraits[leftLegStar]}\n`);

  // 天中殺の影響
  if (result.four_pillars.tenchusatsu !== 'なし') {
    console.log('【天中殺の影響】');
    console.log(`  ${result.four_pillars.tenchusatsu}を持つため、以下の時期に運命の転機が訪れる:`);
    console.log(`  ・44歳（2025年）: 天中殺本命`);
    console.log(`  ・54-63歳: 次の天中殺期`);
    console.log(`  天中殺期は、今までのやり方が通用しなくなり、変化を迫られる時期。`);
    console.log(`  恋愛や結婚に対する価値観を見直す良い機会になる。\n`);
  }

  // 五行バランスからのアドバイス
  const maxElement = Object.entries(result.five_elements)
    .filter(([key]) => key !== 'total')
    .sort(([, a], [, b]) => b - a)[0];

  const elementNames: Record<string, string> = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水',
  };

  const elementAdvice: Record<string, string> = {
    wood: '成長・創造性のエネルギーが強い。新しいことを始めるのに適している。',
    fire: '情熱・表現のエネルギーが強い。情熱的に行動すると良い結果が出る。',
    earth: '安定・信頼のエネルギーが強い。堅実な関係を築くのに適している。',
    metal: '固執・厳格のエネルギーが強い。柔軟性を持つことで運気が開ける。',
    water: '適応・知恵のエネルギーが強い。状況に合わせて柔軟に対応すると良い。',
  };

  if (maxElement) {
    const [key, value] = maxElement;
    console.log('【五行バランスからのアドバイス】');
    console.log(`  最強の五行: ${elementNames[key]} (${value}点)`);
    console.log(`  ${elementAdvice[key]}`);
    console.log(`  ${value > 30 ? '⚠️ 過剰気味。バランスを取ることで運気が安定する。' : '✅ バランス型。調和が取れている。'}\n`);
  }

  console.log('✅ 尚美の算命学データ生成完了！');
}

main();
