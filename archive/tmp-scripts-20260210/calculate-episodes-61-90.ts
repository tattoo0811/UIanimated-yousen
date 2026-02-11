/**
 * エピソード61-90話のキャラクター算命学計算
 * accurate-logic ライブラリ使用
 */

import { calculateBaZi } from '../accurate-logic/src/bazi';

// キャラクターデータ定義
interface CharacterData {
  episode: number;
  name: string;
  birth_date: string;
  longitude: number;
}

// エピソード61-90のキャラクター
const characters: CharacterData[] = [
  // エピソード61-72
  { episode: 61, name: "上原 芳子", birth_date: "1964-12-07T16:30:00", longitude: 135 },
  { episode: 62, name: "佐々木 玲奈", birth_date: "1989-08-21T19:45:00", longitude: 138 },
  { episode: 63, name: "山本 慎太郎", birth_date: "1993-03-27T10:15:00", longitude: 135 },
  { episode: 64, name: "藤堂 慧", birth_date: "1990-06-11T11:30:00", longitude: 139 },
  { episode: 65, name: "松本 奏", birth_date: "1997-02-18T13:00:00", longitude: 135 },
  { episode: 66, name: "大野 翔", birth_date: "2001-04-12T03:30:00", longitude: 135 },
  { episode: 66, name: "大野 颯太", birth_date: "2001-04-12T03:35:00", longitude: 135 },
  { episode: 67, name: "水野 健一", birth_date: "1995-12-25T14:00:00", longitude: 135 },
  { episode: 68, name: "工藤 遥", birth_date: "1999-05-28T02:00:00", longitude: 138 },
  { episode: 69, name: "大杉 美和子", birth_date: "1996-10-15T23:00:00", longitude: 135 },
  { episode: 70, name: "宮本 蓮", birth_date: "1995-01-22T22:00:00", longitude: 135 },
  { episode: 71, name: "神崎 舞", birth_date: "2002-07-30T12:00:00", longitude: 135 },
  { episode: 72, name: "秋山 翔", birth_date: "1998-03-08T10:00:00", longitude: 135 },

  // エピソード73-90（来院者があるエピソードのみ）
  { episode: 74, name: "江崎 優人", birth_date: "1994-05-20T12:00:00", longitude: 135 },
  { episode: 75, name: "岩渕 舞", birth_date: "1989-11-15T12:00:00", longitude: 135 },
  { episode: 76, name: "奥山 拓真", birth_date: "1982-08-30T12:00:00", longitude: 135 },
  { episode: 77, name: "小柳 玲奈", birth_date: "1996-03-22T12:00:00", longitude: 135 },
  { episode: 78, name: "香川 翔太", birth_date: "1991-07-08T12:00:00", longitude: 135 },
  { episode: 79, name: "増田 美咲", birth_date: "1993-12-05T12:00:00", longitude: 135 },
  { episode: 80, name: "関口 陽一", birth_date: "1979-06-18T12:00:00", longitude: 135 },
  { episode: 81, name: "桜井 瑠奈", birth_date: "2001-09-12T12:00:00", longitude: 135 },
  { episode: 82, name: "島田 健二", birth_date: "1986-04-25T12:00:00", longitude: 135 },
  { episode: 83, name: "岡本 菜々子", birth_date: "1995-10-03T12:00:00", longitude: 135 },
  { episode: 84, name: "池田 修一", birth_date: "1957-02-14T12:00:00", longitude: 135 },
  { episode: 85, name: "松本 健太", birth_date: "1997-01-20T12:00:00", longitude: 135 },
  { episode: 88, name: "佐藤 陽菜", birth_date: "1990-08-22T12:00:00", longitude: 135 },
];

// 四柱推命計算実行
console.log("=".repeat(80));
console.log("エピソード61-90話 キャラクター 四柱推命計算");
console.log("=".repeat(80));

const results = characters.map(char => {
  const date = new Date(char.birth_date);
  const bazi = calculateBaZi(date, char.longitude);

  return {
    episode: char.episode,
    name: char.name,
    birth_date: char.birth_date,
    bazi: {
      year: `${bazi.year.stemStr}${bazi.year.branchStr}`,
      month: `${bazi.month.stemStr}${bazi.month.branchStr}`,
      day: `${bazi.day.stemStr}${bazi.day.branchStr}`,
      hour: `${bazi.hour.stemStr}${bazi.hour.branchStr}`,
    },
    nikkan: bazi.day.stemStr,
    gesshi: bazi.day.branchStr,
  };
});

// 結果表示
results.forEach(r => {
  console.log(`\n[エピソード${r.episode}] ${r.name}`);
  console.log(`生年月日: ${r.birth_date}`);
  console.log(`年柱: ${r.bazi.year} | 月柱: ${r.bazi.month} | 日柱: ${r.bazi.day} | 時柱: ${r.bazi.hour}`);
  console.log(`日干: ${r.nikkan} | 日支: ${r.gesshi}`);
});

// JSON出力
console.log("\n" + "=".repeat(80));
console.log("JSON出力");
console.log("=".repeat(80));

const jsonOutput = JSON.stringify(results, null, 2);
console.log(jsonOutput);
