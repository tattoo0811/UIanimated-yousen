// Generate destiny_map.json from birthdata using accurate-logic
import { calculateBaZi } from '../accurate-logic/src/index';
import { calculateYangSen } from '../accurate-logic/src/yangsen';
import { readFileSync, writeFileSync } from 'fs';
import type { FourPillars } from '../accurate-logic/src/types';

// Load birthdata
const birthdata = JSON.parse(readFileSync('./beads/astrology/birthdata.json', 'utf-8'));

// Calculate destiny map for each character
const destinyMap = {
  $schema: '../schemas/astrology-destiny-map.json',
  version: '1.0',
  last_updated: new Date().toISOString().split('T')[0],
  note: 'accurate-logicで自動生成された命式データ',
  destinies: []
};

// 天中殺計算
function getTenchusatsu(yearBranch: string): string {
  const tensuMap: { [key: string]: string } = {
    '子': '申酉', '丑': '申酉',
    '寅': '亥子', '卯': '亥子',
    '辰': '寅卯', '巳': '寅卯', '午': '寅卯',
    '未': '申酉',
    '申': '巳午', '酉': '巳午',
    '戌': '辰巳', '亥': '辰巳'
  };
  return tensuMap[yearBranch] || '';
}

// 五行バランス計算
function calculateFiveElements(bazi: FourPillars) {
  const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  const stems = [bazi.year.stemStr, bazi.month.stemStr, bazi.day.stemStr, bazi.hour.stemStr];
  const branches = [bazi.year.branchStr, bazi.month.branchStr, bazi.day.branchStr, bazi.hour.branchStr];

  // 天干の五行
  stems.forEach(s => {
    if (['甲', '乙'].includes(s)) elements.wood++;
    if (['丙', '丁'].includes(s)) elements.fire++;
    if (['戊', '己'].includes(s)) elements.earth++;
    if (['庚', '辛'].includes(s)) elements.metal++;
    if (['壬', '癸'].includes(s)) elements.water++;
  });

  // 地支の五行（簡略版）
  branches.forEach(b => {
    if (['寅', '卯'].includes(b)) elements.wood++;
    if (['巳', '午'].includes(b)) elements.fire++;
    if (['辰', '戌', '丑', '未'].includes(b)) elements.earth++;
    if (['申', '酉'].includes(b)) elements.metal++;
    if (['亥', '子'].includes(b)) elements.water++;
  });

  return elements;
}

birthdata.births.forEach(birth => {
  const date = new Date(`${birth.date}T${birth.time}`);
  const bazi = calculateBaZi(date, birth.longitude || 135);
  const yangSen = calculateYangSen(bazi, date);
  const fiveElements = calculateFiveElements(bazi);

  const destiny = {
    birth_id: birth.birth_id,
    character_id: birth.character_id,
    system: 'four_pillars',

    // 四柱推命
    four_pillars: {
      year: { pillar: bazi.year.name, stem: bazi.year.stemStr, branch: bazi.year.branchStr },
      month: { pillar: bazi.month.name, stem: bazi.month.stemStr, branch: bazi.month.branchStr },
      day: { pillar: bazi.day.name, stem: bazi.day.stemStr, branch: bazi.day.branchStr },
      hour: { pillar: bazi.hour.name, stem: bazi.hour.stemStr, branch: bazi.hour.branchStr }
    },

    // 日主
    day_master: {
      stem: bazi.day.stemStr,
      yin_yang: ['甲', '丙', '戊', '庚', '壬'].includes(bazi.day.stemStr) ? 'yang' : 'yin',
      element: (() => {
        const s = bazi.day.stemStr;
        if (['甲', '乙'].includes(s)) return 'wood';
        if (['丙', '丁'].includes(s)) return 'fire';
        if (['戊', '己'].includes(s)) return 'earth';
        if (['庚', '辛'].includes(s)) return 'metal';
        return 'water';
      })()
    },

    // 天中殺
    tenchusatsu: getTenchusatsu(bazi.year.branchStr),

    // 陽占（十二大従星）
    yangsen: {
      head: yangSen.head,
      chest: yangSen.chest,
      belly: yangSen.belly,
      left_hand: yangSen.leftHand,
      right_hand: yangSen.rightHand,
      left_shoulder: { name: yangSen.leftShoulder.name, score: yangSen.leftShoulder.score },
      right_leg: { name: yangSen.rightLeg.name, score: yangSen.rightLeg.score },
      left_leg: { name: yangSen.leftLeg.name, score: yangSen.leftLeg.score }
    },

    // 五行バランス
    five_elements_balance: fiveElements,

    // 主要ライフサイクル
    major_cycles: []
  };

  // ライフサイクルを追加（慧・巡用）
  if (birth.character_id === 'C001') { // 巡
    destiny.major_cycles = [
      { start_age: 18, end_age: 22, theme: '西洛大学理学類', period: '2009-2013' },
      { start_age: 20, end_age: 26, theme: '医学部医学科', period: '2011-2017' },
      { start_age: 26, end_age: 31, theme: '外科医・MedAI設立', period: '2017-2022' },
      { start_age: 31, end_age: 33, theme: '裏切り・うつ状態', period: '2022-2024' },
      { start_age: 33, end_age: 35, theme: '運命診断師開業', period: '2024-2026' }
    ];
  } else if (birth.character_id === 'C002') { // 慧
    destiny.major_cycles = [
      { start_age: 18, end_age: 22, theme: '西洛大学理学類', period: '2009-2013' },
      { start_age: 20, end_age: 24, theme: '工学部卒業', period: '2011-2014' },
      { start_age: 24, end_age: 26, theme: 'NeuralWorks', period: '2014-2016' },
      { start_age: 26, end_age: 30, theme: 'Horizon Capital', period: '2016-2018' },
      { start_age: 30, end_age: 34, theme: 'MedAI設立・成功', period: '2018-2024' },
      { start_age: 34, end_age: 36, theme: '「星みてる」開発', period: '2024-2026' }
    ];
  }

  destinyMap.destinies.push(destiny);
});

// Write destiny_map.json
writeFileSync('./beads/astrology/destiny_map.json', JSON.stringify(destinyMap, null, 2));

console.log('✅ destiny_map.json generated successfully');
console.log(`   ${destinyMap.destinies.length} characters processed`);
