/**
 * エピソード61-90話 キャラクター 完全算命学計算
 * accurate-logic + mobile 計算ライブラリ統合
 */

import { calculateBaZi } from '../accurate-logic/src/bazi';
import { calculateFiveElements, calculateEnergyScore } from '../mobile/lib/logic/fiveElements';
import { calculateYangSen } from '../mobile/lib/logic/yangsen';
import { calculateTaiun } from '../mobile/lib/logic/taiun';

// キャラクターデータ定義
interface CharacterData {
  episode: number;
  name: string;
  birth_date: string;
  longitude: number;
  gender: 'male' | 'female';
}

// 天中殺判定
function getTenchusatsu(nikkan: string, gesshi: string): string {
  const tensuMap: { [key: string]: string[] } = {
    '甲': ['寅', '卯'],
    '乙': ['寅', '卯'],
    '丙': ['巳', '午'],
    '丁': ['巳', '午'],
    '戊': ['巳', '午'],
    '己': ['辰', '巳'],
    '庚': ['申', '酉'],
    '辛': ['申', '酉'],
    '壬': ['亥', '子'],
    '癸': ['亥', '子'],
  };

  const tensuBranches = tensuMap[nikkan];
  if (!tensuBranches) return 'なし';

  if (tensuBranches.includes(gesshi)) {
    // 天中殺の名称を返す
    if (tensuBranches[0] === '寅' && tensuBranches[1] === '卯') return '寅卯天中殺';
    if (tensuBranches[0] === '巳' && tensuBranches[1] === '午') return '巳午天中殺';
    if (tensuBranches[0] === '辰' && tensuBranches[1] === '巳') return '辰巳天中殺';
    if (tensuBranches[0] === '申' && tensuBranches[1] === '酉') return '申酉天中殺';
    if (tensuBranches[0] === '亥' && tensuBranches[1] === '子') return '亥子天中殺';
  }

  // 他の天中殺パターンも確認
  if ((nikkan === '甲' || nikkan === '乙') && (gesshi === '辰' || gesshi === '巳')) return '辰巳天中殺';
  if ((nikkan === '丙' || nikkan === '丁' || nikkan === '戊') && (gesshi === '未' || gesshi === '申')) return '午未天中殺';
  if ((nikkan === '庚' || nikkan === '辛') && (gesshi === '戌' || gesshi === '亥')) return '戌亥天中殺';
  if ((nikkan === '壬' || nikkan === '癸') && (gesshi === '丑' || gesshi === '寅')) return '丑寅天中殺';

  return 'なし';
}

// エピソード61-90のキャラクター
const characters: CharacterData[] = [
  // エピソード61-72
  { episode: 61, name: "上原 芳子", birth_date: "1964-12-07T16:30:00", longitude: 135, gender: 'female' },
  { episode: 62, name: "佐々木 玲奈", birth_date: "1989-08-21T19:45:00", longitude: 138, gender: 'female' },
  { episode: 63, name: "山本 慎太郎", birth_date: "1993-03-27T10:15:00", longitude: 135, gender: 'male' },
  { episode: 64, name: "藤堂 慧", birth_date: "1990-06-11T11:30:00", longitude: 139, gender: 'male' },
  { episode: 65, name: "松本 奏", birth_date: "1997-02-18T13:00:00", longitude: 135, gender: 'female' },
  { episode: 66, name: "大野 翔", birth_date: "2001-04-12T03:30:00", longitude: 135, gender: 'male' },
  { episode: 66, name: "大野 颯太", birth_date: "2001-04-12T03:35:00", longitude: 135, gender: 'male' },
  { episode: 67, name: "水野 健一", birth_date: "1995-12-25T14:00:00", longitude: 135, gender: 'male' },
  { episode: 68, name: "工藤 遥", birth_date: "1999-05-28T02:00:00", longitude: 138, gender: 'female' },
  { episode: 69, name: "大杉 美和子", birth_date: "1996-10-15T23:00:00", longitude: 135, gender: 'female' },
  { episode: 70, name: "宮本 蓮", birth_date: "1995-01-22T22:00:00", longitude: 135, gender: 'male' },
  { episode: 71, name: "神崎 舞", birth_date: "2002-07-30T12:00:00", longitude: 135, gender: 'female' },
  { episode: 72, name: "秋山 翔", birth_date: "1998-03-08T10:00:00", longitude: 135, gender: 'male' },

  // エピソード73-90（来院者があるエピソードのみ）
  { episode: 74, name: "江崎 優人", birth_date: "1994-05-20T12:00:00", longitude: 135, gender: 'male' },
  { episode: 75, name: "岩渕 舞", birth_date: "1989-11-15T12:00:00", longitude: 135, gender: 'female' },
  { episode: 76, name: "奥山 拓真", birth_date: "1982-08-30T12:00:00", longitude: 135, gender: 'male' },
  { episode: 77, name: "小柳 玲奈", birth_date: "1996-03-22T12:00:00", longitude: 135, gender: 'female' },
  { episode: 78, name: "香川 翔太", birth_date: "1991-07-08T12:00:00", longitude: 135, gender: 'male' },
  { episode: 79, name: "増田 美咲", birth_date: "1993-12-05T12:00:00", longitude: 135, gender: 'female' },
  { episode: 80, name: "関口 陽一", birth_date: "1979-06-18T12:00:00", longitude: 135, gender: 'male' },
  { episode: 81, name: "桜井 瑠奈", birth_date: "2001-09-12T12:00:00", longitude: 135, gender: 'female' },
  { episode: 82, name: "島田 健二", birth_date: "1986-04-25T12:00:00", longitude: 135, gender: 'male' },
  { episode: 83, name: "岡本 菜々子", birth_date: "1995-10-03T12:00:00", longitude: 135, gender: 'female' },
  { episode: 84, name: "池田 修一", birth_date: "1957-02-14T12:00:00", longitude: 135, gender: 'male' },
  { episode: 85, name: "松本 健太", birth_date: "1997-01-20T12:00:00", longitude: 135, gender: 'male' },
  { episode: 88, name: "佐藤 陽菜", birth_date: "1990-08-22T12:00:00", longitude: 135, gender: 'female' },
];

// 算命学計算実行
console.log("=".repeat(80));
console.log("エピソード61-90話 キャラクター 完全算命学計算");
console.log("=".repeat(80));

const results = characters.map(char => {
  const date = new Date(char.birth_date);

  // 1. 四柱推命
  const bazi = calculateBaZi(date, char.longitude);

  // 2. 五行バランス
  const fiveElements = calculateFiveElements(bazi);

  // 3. エネルギー点数
  const energyScore = calculateEnergyScore(bazi);

  // 4. 陽占（十大主星）
  const yangSen = calculateYangSen(bazi, date);

  // 5. 大運（陰占）
  const taiun = calculateTaiun(bazi, date, char.gender);

  // 6. 天中殺判定
  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

  // 結果を整形
  return {
    episode: char.episode,
    name: char.name,
    birth_date: char.birth_date,
    gender: char.gender,
    sanmeigaku_verified: {
      bazi: {
        year: `${bazi.year.stemStr}${bazi.year.branchStr}`,
        month: `${bazi.month.stemStr}${bazi.month.branchStr}`,
        day: `${bazi.day.stemStr}${bazi.day.branchStr}`,
        hour: `${bazi.hour.stemStr}${bazi.hour.branchStr}`,
      },
      jugdai: [
        yangSen.head,
        yangSen.chest,
        yangSen.belly,
        yangSen.rightHand,
        yangSen.leftHand,
      ],
      junidai: [
        { part: "左肩", star: yangSen.leftShoulder.name, points: yangSen.leftShoulder.score },
        { part: "右足", star: yangSen.rightLeg.name, points: yangSen.rightLeg.score },
        { part: "左足", star: yangSen.leftLeg.name, points: yangSen.leftLeg.score },
      ],
      five_elements: `木${fiveElements.wood}火${fiveElements.fire}土${fiveElements.earth}金${fiveElements.metal}水${fiveElements.water}`,
      total_energy: energyScore,
    },
    nikkan: nikkan,
    gesshi: gesshi,
    tenchusatsu: tenchusatsu,
    verified_with_shugakuin: false, // 後で手動検証
    notes: "",
  };
});

// 結果表示
results.forEach(r => {
  console.log(`\n[エピソード${r.episode}] ${r.name}`);
  console.log(`生年月日: ${r.birth_date}`);
  console.log(`性別: ${r.gender === 'male' ? '男性' : '女性'}`);
  console.log(`四柱: ${r.sanmeigaku_verified.bazi.year} | ${r.sanmeigaku_verified.bazi.month} | ${r.sanmeigaku_verified.bazi.day} | ${r.sanmeigaku_verified.bazi.hour}`);
  console.log(`天中殺: ${r.tenchusatsu}`);
  console.log(`十大主星: 頭${r.sanmeigaku_verified.jugdai[0]} 胸${r.sanmeigaku_verified.jugdai[1]} 腹${r.sanmeigaku_verified.jugdai[2]} 右手${r.sanmeigaku_verified.jugdai[3]} 左手${r.sanmeigaku_verified.jugdai[4]}`);
  console.log(`十二大従星: ${r.sanmeigaku_verified.junidai.map(j => `${j.part}:${j.star}(${j.points})`).join(' ')}`);
  console.log(`五行: ${r.sanmeigaku_verified.five_elements}`);
  console.log(`エネルギー点数: ${r.sanmeigaku_verified.total_energy}`);
});

// JSONファイルに出力
const fs = require('fs');
const outputPath = '/Users/kitamuratatsuhiko/UIanimated/claudedocs/EPISODES-61-90-SANMEIGAKU-VERIFIED.json';
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
console.log(`\nJSON出力完了: ${outputPath}`);
