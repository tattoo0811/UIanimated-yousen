#!/usr/bin/env node
/**
 * 提供されたReactコードの計算ロジックを検証
 */

// コードから抽出した定数と関数
const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 二十八元表（ZOKAN_TABLE）- 提供されたコードの値
const ZOKAN_TABLE = {
  "子": [ { days: 10, gan: "壬" }, { days: 21, gan: "癸" } ],
  "丑": [ { days: 9, gan: "癸" }, { days: 3, gan: "辛" }, { days: 19, gan: "己" } ],
  "寅": [ { days: 7, gan: "戊" }, { days: 7, gan: "丙" }, { days: 17, gan: "甲" } ],
  "卯": [ { days: 10, gan: "甲" }, { days: 21, gan: "乙" } ],
  "辰": [ { days: 9, gan: "乙" }, { days: 3, gan: "癸" }, { days: 19, gan: "戊" } ],
  "巳": [ { days: 5, gan: "戊" }, { days: 9, gan: "庚" }, { days: 17, gan: "丙" } ],
  "午": [ { days: 10, gan: "丙" }, { days: 9, gan: "己" }, { days: 12, gan: "丁" } ],
  "未": [ { days: 9, gan: "丁" }, { days: 3, gan: "乙" }, { days: 19, gan: "己" } ],
  "申": [ { days: 7, gan: "戊" }, { days: 7, gan: "壬" }, { days: 17, gan: "庚" } ],
  "酉": [ { days: 10, gan: "庚" }, { days: 21, gan: "辛" } ],
  "戌": [ { days: 9, gan: "辛" }, { days: 3, gan: "丁" }, { days: 19, gan: "戊" } ],
  "亥": [ { days: 7, gan: "甲" }, { days: 24, gan: "壬" } ]
};

// 十大主星算出
const getJudaiShusei = (dayGan, targetGan) => {
  const dayIdx = GAN.indexOf(dayGan);
  const targetIdx = GAN.indexOf(targetGan);

  const dayYinYang = dayIdx % 2;
  const targetYinYang = targetIdx % 2;
  const isSamePol = dayYinYang === targetYinYang;

  const dayEl = Math.floor(dayIdx / 2);
  const tgtEl = Math.floor(targetIdx / 2);

  const diff = (tgtEl - dayEl + 5) % 5;

  if (diff === 0) return isSamePol ? "貫索星" : "石門星";
  if (diff === 1) return isSamePol ? "鳳閣星" : "調舒星";
  if (diff === 2) return isSamePol ? "禄存星" : "司禄星";
  if (diff === 3) return isSamePol ? "車騎星" : "牽牛星";
  if (diff === 4) return isSamePol ? "龍高星" : "玉堂星";
  return "不明";
};

// accurate-logicの四柱推命を使用
const { calculateBaZi } = require('/Users/kitamuratatsuhiko/UIanimated/accurate-logic/dist/src/bazi.js');

// 二十八元に基づいて蔵干を計算（accurate-logicの関数を使用）
const { getHiddenStemByDays } = require('/Users/kitamuratatsuhiko/UIanimated/accurate-logic/dist/src/yangsen.js');

function calculateSanmei(year, month, day, gender) {
  const date = new Date(year, month - 1, day, 12, 0);
  const bazi = calculateBaZi(date, 135);

  // 二十八元に基づいて蔵干を計算
  // 節入りからの経過日数を計算
  const daysFromSetsuiri = 5; // 仮定値（月の中日）

  const yearZokan = getHiddenStemByDays(bazi.year.branchStr, daysFromSetsuiri);
  const monthZokan = getHiddenStemByDays(bazi.month.branchStr, daysFromSetsuiri);
  const dayZokan = getHiddenStemByDays(bazi.day.branchStr, daysFromSetsuiri);

  return {
    year: { gan: bazi.year.stemStr, shi: bazi.year.branchStr, zokan: yearZokan },
    month: { gan: bazi.month.stemStr, shi: bazi.month.branchStr, zokan: monthZokan },
    day: { gan: bazi.day.stemStr, shi: bazi.day.branchStr, zokan: dayZokan },
  };
}

// 検証実行
const testCases = [
  { name: "1983-08-11", year: 1983, month: 8, day: 11, gender: "male" },
  { name: "涼子", year: 1977, month: 8, day: 20, gender: "female" },
];

console.log("═══════════════════════════════════════════════════════════════");
console.log("提供コードの検証（朱学院比較）");
console.log("═══════════════════════════════════════════════════════════════\n");

testCases.forEach(({ name, year, month, day, gender }) => {
  const sanmei = calculateSanmei(year, month, day, gender);
  const dayGan = sanmei.day.gan;

  // 陽占計算
  const yousen = {
    north: getJudaiShusei(dayGan, sanmei.year.gan),      // 頭: 日干 × 年干
    south: getJudaiShusei(dayGan, sanmei.month.gan),     // 腹: 日干 × 月干
    east: getJudaiShusei(dayGan, sanmei.year.zokan),     // 左手: 日干 × 年支蔵干
    west: getJudaiShusei(dayGan, sanmei.day.zokan),      // 右手: 日干 × 日支蔵干
    center: getJudaiShusei(dayGan, sanmei.month.zokan),  // 胸: 日干 × 月支蔵干
  };

  console.log(`【${name}】${year}-${month}-${day}`);
  console.log(`四柱推命: ${sanmei.year.gan}${sanmei.year.shi} / ${sanmei.month.gan}${sanmei.month.shi} / ${sanmei.day.gan}${sanmei.day.shi}`);
  console.log(`蔵干(28元): 年=${sanmei.year.zokan}, 月=${sanmei.month.zokan}, 日=${sanmei.day.zokan}`);
  console.log(`十大主星:`);
  console.log(`  頭(北/年干): ${yousen.north}`);
  console.log(`  胸(中央/月支蔵): ${yousen.center}`);
  console.log(`  腹(南/月干): ${yousen.south}`);
  console.log(`  右手(西/日支蔵): ${yousen.west}`);
  console.log(`  左手(東/年支蔵): ${yousen.east}`);

  // 朱学院の正解データ
  const shugakuinData = name === "1983-08-11" ? {
    head: "鳳閣星",
    chest: "玉堂星",
    belly: "石門星",
    rightHand: "車輢星", // 車騎星と同じ
    leftHand: "石門星"
  } : {
    head: "龍高星",
    chest: "司禄星",
    belly: "石門星",
    rightHand: "鳳閣星",
    leftHand: "調舒星"
  };

  console.log(`朱学院:`);
  console.log(`  頭: ${shugakuinData.head}`);
  console.log(`  胸: ${shugakuinData.chest}`);
  console.log(`  腹: ${shugakuinData.belly}`);
  console.log(`  右手: ${shugakuinData.rightHand}`);
  console.log(`  左手: ${shugakuinData.leftHand}`);

  // 一致判定
  console.log(`一致:`);
  console.log(`  頭: ${yousen.north === shugakuinData.head ? '✓' : '✗'} (${yousen.north} vs ${shugakuinData.head})`);
  console.log(`  胸: ${yousen.center === shugakuinData.chest ? '✓' : '✗'} (${yousen.center} vs ${shugakuinData.chest})`);
  console.log(`  腹: ${yousen.south === shugakuinData.belly ? '✓' : '✗'} (${yousen.south} vs ${shugakuinData.belly})`);
  console.log(`  右手: ${yousen.west === shugakuinData.rightHand || (yousen.west === "車騎星" && shugakuinData.rightHand === "車輢星") ? '✓' : '✗'} (${yousen.west} vs ${shugakuinData.rightHand})`);
  console.log(`  左手: ${yousen.east === shugakuinData.leftHand ? '✓' : '✗'} (${yousen.east} vs ${shugakuinData.leftHand})`);
  console.log();
});
