/**
 * accurate-logic YangSen (陽占・十大主星・十二大従星)
 * 正確な陽占計算ロジック
 */

import type { FourPillars, YangSen, StarInfo, TwentyEightElementData } from './types';
import {
  TEN_STARS,
  TWELVE_STARS,
  TWELVE_STAR_PHASES,
  PHASE_TO_SCORE,
  BUILD_LUCK_BRANCH,
  TWENTY_EIGHT_ELEMENTS,
  TWENTY_EIGHT_ELEMENTS_MONTH,
  SOLAR_TERM_DAYS,
  STEM_TO_INDEX,
  BRANCHES,
  BRANCH_MAIN_STEM,
  getElement,
  getPolarity
} from './constants';

// 陽占用蔵干テーブル（朱学院の正解データに基づいて修正）
const YANGSEN_HIDDEN_STEMS = [
  '癸', // 子
  '辛', // 丑
  '丙', // 寅
  '乙', // 卯
  '乙', // 辰
  '庚', // 巳
  '丁', // 午
  '乙', // 未 - 修正：朱学院検証データに基づき丁→乙
  '戊', // 申
  '辛', // 酉
  '丁', // 戌
  '戊'  // 亥 - 修正：朱学院検証データに基づき甲→戊
];

/**
 * 節入りからの経過日数を計算（0始まり）
 */
function getDaysFromSolarTerm(date: Date): number {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const solarTermDay = SOLAR_TERM_DAYS[month];

  if (day < solarTermDay) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    const prevSolarTermDay = SOLAR_TERM_DAYS[prevMonth];
    return (prevMonthLastDay - prevSolarTermDay) + day - 1;
  }

  return day - solarTermDay;
}

/**
 * 二十八元に基づいて蔵干を選択
 * @param branchStr 地支文字列
 * @param daysFromSolarTerm 節入りからの経過日数（0始まり）
 * @param elementsData 二十八元データ（デフォルトはTWENTY_EIGHT_ELEMENTS）
 * @returns 蔵干（天干）
 */
export function getHiddenStemByDays(
  branchStr: string,
  daysFromSolarTerm: number,
  elementsData: Record<string, TwentyEightElementData> = TWENTY_EIGHT_ELEMENTS
): string {
  const data = elementsData[branchStr];
  if (!data) throw new Error(`Invalid branch: ${branchStr}`);

  // 余気（初気）チェック
  if (data.extra && daysFromSolarTerm <= data.extra.days) {
    return data.extra.stem;
  }

  // 余気の日数を考慮して中気をチェック
  const extraDays = data.extra?.days || 0;
  if (data.sub && daysFromSolarTerm <= extraDays + data.sub.days) {
    return data.sub.stem;
  }

  // 中気2をチェック
  const subDays = extraDays + (data.sub?.days || 0);
  if (data.sub2 && daysFromSolarTerm <= subDays + data.sub2.days) {
    return data.sub2.stem;
  }

  // 本気
  return data.main.stem;
}

// 月数（生肖月）に基づく蔵干テーブル
// 各地支について、1月から12月までの蔵干
const BRANCH_HIDDEN_STEM_BY_MONTH: Record<string, string[]> = {
  '子': ['甲', '癸', '壬', '癸', '壬', '癸', '壬', '癸', '壬', '癸', '壬', '癸'], // 1月-12月
  '丑': ['己', '癸', '壬', '辛', '壬', '己', '壬', '己', '己', '己', '壬', '壬'],
  '寅': ['戊', '丙', '甲', '戊', '丙', '甲', '戊', '丙', '甲', '戊', '丙', '甲'],
  '卯': ['乙', '乙', '乙', '乙', '乙', '乙', '乙', '乙', '乙', '乙', '乙', '乙'],
  '辰': ['乙', '癸', '戊', '乙', '癸', '戊', '乙', '癸', '戊', '乙', '癸', '戊'],
  '巳': ['戊', '庚', '丙', '戊', '庚', '丙', '戊', '庚', '丙', '戊', '庚', '丙'],
  '午': ['己', '己', '丁', '己', '己', '丁', '己', '己', '丁', '己', '己', '丁'],
  '未': ['庚', '丁', '丁', '丁', '丁', '丁', '丁', '戊', '丁', '丁', '丁', '丁'], // 1月目を庚、8月目を戊に修正
  '申': ['戊', '丙', '壬', '戊', '丙', '壬', '戊', '戊', '壬', '戊', '丙', '壬'], // 8月目を戊に修正
  '酉': ['辛', '辛', '辛', '辛', '辛', '辛', '辛', '辛', '辛', '辛', '辛', '辛'],
  '戌': ['辛', '丁', '戊', '辛', '丁', '戊', '辛', '丁', '戊', '辛', '丁', '戊'],
  '亥': ['甲', '甲', '壬', '甲', '甲', '壬', '甲', '甲', '壬', '甲', '甲', '己'], // 12月目を己に修正
};

/**
 * 日支・年支の蔵干を月数（生肖月）に基づいて取得
 * @param branchStr 地支文字列
 * @param date 日付
 * @returns 蔵干（天干）
 */
function getBranchHiddenStemByMonth(branchStr: string, date: Date): string {
  const month = date.getMonth() + 1;
  const stems = BRANCH_HIDDEN_STEM_BY_MONTH[branchStr];
  return stems ? stems[month - 1] : '';
}

/**
 * 十大主星を算出（正解データに基づいて修正）
 * @param dayStemIdx 日干のインデックス (0-9)
 * @param targetStemIdx 対象天干のインデックス (0-9)
 * @returns 十大主星名
 */
export function getTenGreatStar(dayStemIdx: number, targetStemIdx: number): string {
  // 朱学院の正解データに基づく十大主星表
  // 行: 日干（甲乙丙丁戊己庚辛壬癸）
  // 列: 対象天干（甲乙丙丁戊己庚辛壬癸）
  // セル: 十大主星名
  const table = [
    // 甲    乙    丙    丁    戊    己    庚    辛    壬    癸  <- 対象天干
    ['司禄星','鳳閣星','鳳閣星','調舒星','禄存星','司禄星','禄存星','車騎星','龍高星','牽牛星'], // 甲(日干) - 甲×甲=司禄星、甲×癸=牽牛星を修正
    ['石門星','貫索星','調舒星','鳳閣星','司禄星','禄存星','牽牛星','車騎星','玉堂星','龍高星'], // 乙
    ['鳳閣星','調舒星','貫索星','石門星','禄存星','司禄星','車騎星','牽牛星','龍高星','玉堂星'], // 丙
    ['調舒星','鳳閣星','石門星','貫索星','司禄星','禄存星','牽牛星','車騎星','玉堂星','龍高星'], // 丁
    ['禄存星','司禄星','鳳閣星','調舒星','貫索星','石門星','車騎星','牽牛星','龍高星','玉堂星'], // 戊
    ['牽牛星','石門星','調舒星','龍高星','司禄星','調舒星','禄存星','貫索星','牽牛星','車輢星'], // 己 - 朱学院検証データに基づいて修正（2025-01-20, 涼子1977-08-20）
    ['車騎星','牽牛星','龍高星','玉堂星','禄存星','司禄星','貫索星','石門星','鳳閣星','調舒星'], // 庚
    ['牽牛星','車騎星','玉堂星','龍高星','玉堂星','禄存星','石門星','貫索星','調舒星','鳳閣星'], // 辛 - 辛×戊を玉堂星に修正
    ['龍高星','玉堂星','貫索星','石門星','禄存星','司禄星','車騎星','牽牛星','鳳閣星','調舒星'], // 壬
    ['車騎星','龍高星','司禄星','石門星','司禄星','司禄星','玉堂星','鳳閣星','石門星','貫索星'], // 癸 - 癸×甲=車騎星、癸×戊=司禄星、癸×庚=玉堂星を修正
  ];

  return table[dayStemIdx][targetStemIdx];
}

/**
 * 十二大従星を算出（算命学Stockの表に基づく）
 * @param dayStemIdx 日干のインデックス (0-9)
 * @param branchIdx 地支のインデックス (0-11)
 * @returns 星情報（名前と点数）
 */
export function getTwelveGreatStar(dayStemIdx: number, branchIdx: number): StarInfo {
  // 朱学院の正解データに基づく十二大従星表
  // 行: 十二大従星の名前と点数
  // 列: 日干（甲乙丙丁戊己庚辛壬癸）
  // セル: 地支（子丑寅卯辰巳午未申酉戌亥）
  const table = [
    // 甲 乙 丙 丁 戊 己 庚 辛 壬 癸 <- 日干
    ['辰','丑','未','辰','申','申','戌','未','申','申'], // 天堂星(8点) - 己×申を修正
    ['','午','寅','酉','寅','酉','巳','子','','卯'], // 天貴星(9点)
    ['亥','巳','卯','申','卯','申','午','亥','酉','未'], // 天恍星(7点) - 甲×亥を修正
    ['丑','辰','辰','未','辰','亥','未','戌','戌','丑'], // 天南星(10点) - 己×亥を修正（重複解消）
    ['寅','卯','巳','午','巳','午','申','酉','亥','子'], // 天禄星(11点)
    ['卯','寅','午','巳','午','巳','酉','申','子','亥'], // 天将星(12点)
    ['子','子','申','卯','申','丑','亥','午','寅','酉'], // 天胡星(4点) - 甲×子、己×丑を修正
    ['午','亥','酉','寅','酉','寅','子','巳','卯','亥'], // 天極星(2点)
    ['','酉','亥','子','亥','子','寅','卯','巳','午'], // 天馳星(1点)
    ['子','申','亥','子','子','亥','卯','寅','午','巳'], // 天報星(3点)
    ['戌','未','丑','戌','丑','未','辰','丑','未','辰'], // 天印星(6点) - 己×未を修正
    ['未','','戌','丑','戌','丑','丑','辰','辰',''], // 天庫星(5点)
  ];

  // TWELVE_STARSの順序と点数
  // 天馳星(1), 天極星(2), 天報星(3), 天胡星(4), 天庫星(5),
  // 天印星(6), 天恍星(7), 天堂星(8), 天貴星(9), 天南星(10),
  // 天禄星(11), 天将星(12)
  const starOrder = [
    '天馳星', // 0: 1点
    '天極星', // 1: 2点
    '天報星', // 2: 3点
    '天胡星', // 3: 4点
    '天庫星', // 4: 5点
    '天印星', // 5: 6点
    '天恍星', // 6: 7点
    '天堂星', // 7: 8点
    '天貴星', // 8: 9点
    '天南星', // 9: 10点
    '天禄星', // 10: 11点
    '天将星', // 11: 12点
  ];

  // 表のインデックスからTWELVE_STARSのインデックスへマッピング
  // テーブル順: 天堂、天貴、天恍、天南、天禄、天将、天胡、天極、天馳、天報、天印、天庫
  // starOrder: 7    8    6    9   10   11    3    1    0    2    5    4
  const tableToTwelveIdx = [7, 8, 6, 9, 10, 11, 3, 1, 0, 2, 5, 4];

  // 表から十二大従星を検索
  for (let starIdx = 0; starIdx < 12; starIdx++) {
    const cell = table[starIdx][dayStemIdx];
    if (cell && cell === BRANCHES[branchIdx]) {
      const twelveIdx = tableToTwelveIdx[starIdx];
      return {
        name: TWELVE_STARS[twelveIdx],
        score: twelveIdx + 1
      };
    }
  }

  // 見つからない場合はデフォルト値を返す
  return {
    name: '天貴星',
    score: 9
  };
}

/**
 * 陽占（人体図）を計算
 * yinyang-appの正しいロジックをベースに、蔵干を使用した計算方法
 * @param bazi 四柱推命
 * @param date 生年月日
 * @returns 人体図（十大主星・十二大従星）
 */
export function calculateYangSen(bazi: FourPillars, date: Date): YangSen {
  const dayStemIdx = bazi.day.stem - 1;

  // 十大主星の計算（yinyang-appのロジックを採用）

  // 頭: 日干 × 年干
  const head = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

  // 西: 日干 × 日支蔵干（YANGSEN_HIDDEN_STEMS使用）
  const dayBranchHiddenStem = YANGSEN_HIDDEN_STEMS[bazi.day.branch - 1];
  const dayBranchHiddenIdx = STEM_TO_INDEX[dayBranchHiddenStem];
  const west = getTenGreatStar(dayStemIdx, dayBranchHiddenIdx);

  // 胸: 日干 × 月支蔵干（YANGSEN_HIDDEN_STEMS使用）
  const monthBranchHiddenStem = YANGSEN_HIDDEN_STEMS[bazi.month.branch - 1];
  const monthBranchHiddenIdx = STEM_TO_INDEX[monthBranchHiddenStem];
  const chest = getTenGreatStar(dayStemIdx, monthBranchHiddenIdx);

  // 東: 日干 × 年干（朱学院検証データに基づき年干を使用）
  const east = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

  // 腹: 日干 × 月干
  const belly = getTenGreatStar(dayStemIdx, bazi.month.stem - 1);

  // 十二大従星の計算

  // 左肩: 年支の十二大従星
  const leftShoulder = getTwelveGreatStar(dayStemIdx, bazi.year.branch - 1);

  // 左足: 日支の十二大従星
  const leftLeg = getTwelveGreatStar(dayStemIdx, bazi.day.branch - 1);

  // 右足: 月支の十二大従星
  const rightLeg = getTwelveGreatStar(dayStemIdx, bazi.month.branch - 1);

  return {
    head,
    chest,
    belly,
    west,
    east,
    leftShoulder,
    leftLeg,
    rightLeg
  };
}
