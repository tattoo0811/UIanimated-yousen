/**
 * 川原家族の算命学データ生成スクリプト
 *
 * 家族構成:
 * - 康和（夫）: 1968.8.29（戸籍8.31）
 * - 涼子（妻・主婦）: 1977.8.20
 * - 佑真（息子）: 2013.8.30
 * - 智矢（娘）: 2017.11.30
 */

import { calculateBaZi } from '../accurate-logic/src/bazi';
import { calculateYangSen } from '../accurate-logic/src/yangsen';
import { getBranchElement, getElement } from '../accurate-logic/src/constants';
import type { FourPillars } from '../accurate-logic/src/types';

interface FamilyMember {
  name: string;
  name_reading: string;
  role: string;
  birth_date: string;
  birth_time: string;
  age_2025: number;
  gender: 'male' | 'female';
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

// 家族データ
const familyMembers: FamilyMember[] = [
  {
    name: '康和',
    name_reading: 'やすかず',
    role: '夫（父）',
    birth_date: '1968-08-29',
    birth_time: '10:00', // 仮定
    age_2025: 57,
    gender: 'male',
  },
  {
    name: '涼子',
    name_reading: 'りょうこ',
    role: '妻（母）',
    birth_date: '1977-08-20',
    birth_time: '14:00', // 仮定
    age_2025: 48,
    gender: 'female',
  },
  {
    name: '佑真',
    name_reading: 'ゆうま',
    role: '息子（長男）',
    birth_date: '2013-08-30',
    birth_time: '11:00', // 仮定
    age_2025: 12,
    gender: 'male',
  },
  {
    name: '智矢',
    name_reading: 'ともや',
    role: '娘（長女）',
    birth_date: '2017-11-30',
    birth_time: '15:00', // 仮定
    age_2025: 8,
    gender: 'female',
  },
];

// メイン処理
function main() {
  console.log('川原家族の算命学データ生成開始...\n');

  const results: any[] = [];

  for (const member of familyMembers) {
    console.log(`計算中: ${member.name} (${member.role})`);

    const birthDate = new Date(member.birth_date + 'T' + member.birth_time + ':00');
    const bazi = calculateBaZi(birthDate, 135);
    const yangsen = calculateYangSen(bazi, birthDate);
    const fiveElements = calculateFiveElements(bazi);

    const nikkan = bazi.day.stemStr;
    const gesshi = bazi.day.branchStr;
    const tenchusatsu = getTenchusatsu(nikkan, gesshi);

    const result = {
      basic_info: {
        name: member.name,
        name_reading: member.name_reading,
        role: member.role,
        birth_date: member.birth_date,
        birth_time: member.birth_time,
        age_2025: member.age_2025,
        gender: member.gender === 'male' ? '男' : '女',
      },
      four_pillars: {
        year_pillar: bazi.year.name,
        month_pillar: bazi.month.name,
        day_pillar: bazi.day.name,
        hour_pillar: bazi.hour.name,
        nikkan: nikkan,
        gesshi: gesshi,
        tenchusatsu: tenchusatsu,
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

    results.push(result);
    console.log(`  日干: ${nikkan}, 天中殺: ${tenchusatsu}`);
    console.log(`  中心星（胸）: ${yangsen.chest}`);
    console.log(`  五行総合: ${fiveElements.total}点\n`);
  }

  // 結果をJSONファイルに出力
  const fs = require('fs');
  const outputPath = '/Users/kitamuratatsuhiko/UIanimated/claudedocs/KAWAHARA-FAMILY-sanmeigaku.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`結果を出力: ${outputPath}`);

  // 家族全体の分析
  console.log('\n=== 川原家族の算命学分析 ===');

  // 天中殺の確認
  console.log('\n【天中殺キャラクター】');
  results.forEach((r) => {
    if (r.four_pillars.tenchusatsu !== 'なし') {
      console.log(`  ${r.basic_info.name}: ${r.four_pillars.tenchusatsu}`);
    }
  });

  // 夫婦の相性
  const husband = results.find((r) => r.basic_info.role === '夫（父）');
  const wife = results.find((r) => r.basic_info.role === '妻（母）');

  console.log('\n【夫婦の相性】');
  console.log(`  夫（康和）の中心星: ${husband.jugdai.chest}`);
  console.log(`  妻（涼子）の中心星: ${wife.jugdai.chest}`);
  console.log(`  夫の日干: ${husband.four_pillars.nikkan} vs 妻の日干: ${wife.four_pillars.nikkan}`);

  // 子供たちの特徴
  console.log('\n【子供たちの特徴】');
  const son = results.find((r) => r.basic_info.role === '息子（長男）');
  const daughter = results.find((r) => r.basic_info.role === '娘（長女）');

  console.log(`  息子（佑真）の中心星: ${son.jugdai.chest}, 日干: ${son.four_pillars.nikkan}`);
  console.log(`  娘（智矢）の中心星: ${daughter.jugdai.chest}, 日干: ${daughter.four_pillars.nikkan}`);

  // 家族全体の五行バランス
  console.log('\n【家族全体の五行バランス】');
  const familyFive = {
    wood: results.reduce((sum, r) => sum + r.five_elements.wood, 0),
    fire: results.reduce((sum, r) => sum + r.five_elements.fire, 0),
    earth: results.reduce((sum, r) => sum + r.five_elements.earth, 0),
    metal: results.reduce((sum, r) => sum + r.five_elements.metal, 0),
    water: results.reduce((sum, r) => sum + r.five_elements.water, 0),
  };
  console.log(`  木: ${familyFive.wood}点`);
  console.log(`  火: ${familyFive.fire}点`);
  console.log(`  土: ${familyFive.earth}点`);
  console.log(`  金: ${familyFive.metal}点`);
  console.log(`  水: ${familyFive.water}点`);

  console.log('\n✅ 川原家族の算命学データ生成完了！');
}

main();
