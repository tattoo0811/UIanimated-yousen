/**
 * 算命学計算ロジック
 * tools/sanmei-with-energy-cli.ts と同一（1990-03-02→丙寅・267点で検証済み）
 * 位相法・天中殺を含む大運データ出力対応 (2026-02-14)
 */

import { getRelationLabel, type IsohoLabel, getRelationLabels } from './isouhou';

export type Gender = 'male' | 'female';

export interface JuseiInfo {
  name: string;
  sub: string;
  score: number;
}

export interface TaiunRow {
  age: number;
  eto: string;
  gan: string;
  shi: string;
  star: string;
  jusei: string;
  west: string;    // vs 日柱（位相法ラベル）
  center: string;  // vs 月柱（位相法ラベル）
  east: string;    // vs 年柱（位相法ラベル）
  westLabels: IsohoLabel[];   // vs 日柱（構造化）
  centerLabels: IsohoLabel[]; // vs 月柱（構造化）
  eastLabels: IsohoLabel[];   // vs 年柱（構造化）
  isTenchu: boolean;
}

export interface TenchusatsuInfo {
  my: string;          // 日干支由来の天中殺名（例: "子丑"）
  branches: string[];  // 天中殺の地支リスト
}

export interface SanmeiResult {
  input: { date: string; gender: Gender };
  insen: {
    year: { gan: string; shi: string; zokan: string };
    month: { gan: string; shi: string; zokan: string };
    day: { gan: string; shi: string; zokan: string };
    setsuiriDay: number;
  };
  yousen: {
    north: string;
    south: string;
    east: string;
    west: string;
    center: string;
    start: JuseiInfo;
    middle: JuseiInfo;
    end: JuseiInfo;
  };
  suriho: {
    total_energy: number;
    gogyo_scores: Record<string, number>;
    details: Array<{
      stem: string;
      gogyo: string;
      branches: string[];
      count: number;
      baseScore: number;
      finalScore: number;
    }>;
  };
  tenchusatsu: TenchusatsuInfo;
  taiun: {
    isForward: boolean;
    ritsuun: number;
    list: TaiunRow[];
  };
}

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const SHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const GOGYO_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
  '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

const ZOKAN_TABLE: Record<string, { days: number; gan: string }[]> = {
  '子': [{ days: 10, gan: '壬' }, { days: 21, gan: '癸' }],
  '丑': [{ days: 9, gan: '癸' }, { days: 3, gan: '辛' }, { days: 19, gan: '己' }],
  '寅': [{ days: 7, gan: '戊' }, { days: 7, gan: '丙' }, { days: 17, gan: '甲' }],
  '卯': [{ days: 10, gan: '甲' }, { days: 21, gan: '乙' }],
  '辰': [{ days: 9, gan: '乙' }, { days: 3, gan: '癸' }, { days: 19, gan: '戊' }],
  '巳': [{ days: 5, gan: '戊' }, { days: 9, gan: '庚' }, { days: 17, gan: '丙' }],
  '午': [{ days: 10, gan: '丙' }, { days: 9, gan: '丁' }, { days: 12, gan: '己' }],
  '未': [{ days: 9, gan: '丁' }, { days: 3, gan: '乙' }, { days: 19, gan: '己' }],
  '申': [{ days: 7, gan: '戊' }, { days: 7, gan: '壬' }, { days: 17, gan: '庚' }],
  '酉': [{ days: 10, gan: '庚' }, { days: 21, gan: '辛' }],
  '戌': [{ days: 9, gan: '辛' }, { days: 3, gan: '丁' }, { days: 19, gan: '戊' }],
  '亥': [{ days: 7, gan: '甲' }, { days: 24, gan: '壬' }]
};

// 陽占（人体星図）用：本元蔵干（ZOKAN_TABLEの最後の要素 = 各支の本元）
// 午: 己（土）= 算命学では午の本元を己として扱う流派が多い
const getMainZokan = (shi: string): string => {
  const table = ZOKAN_TABLE[shi];
  return table[table.length - 1].gan;
};

const SURIHO_ZOKAN_TABLE: Record<string, string[]> = {
  '子': ['癸'], '丑': ['癸', '辛', '己'], '寅': ['戊', '丙', '甲'], '卯': ['乙'],
  '辰': ['乙', '癸', '戊'], '巳': ['戊', '庚', '丙'], '午': ['己', '丁'], '未': ['丁', '乙', '己'],
  '申': ['戊', '壬', '庚'], '酉': ['辛'], '戌': ['辛', '丁', '戊'], '亥': ['甲', '壬']
};

const SURIHO_ENERGY_TABLE: Record<string, Record<string, number>> = {
  // 甲 (木): 亥で長生(9)
  '甲': { '子': 7, '丑': 10, '寅': 11, '卯': 12, '辰': 8, '巳': 4, '午': 1, '未': 5, '申': 2, '酉': 3, '戌': 6, '亥': 9 },
  // 乙 (木): 午で長生(9) ※逆行
  '乙': { '子': 4, '丑': 8, '寅': 12, '卯': 11, '辰': 10, '巳': 7, '午': 9, '未': 6, '申': 3, '酉': 1, '戌': 5, '亥': 2 },
  // 丙 (火): 寅で長生(9)
  '丙': { '子': 3, '丑': 5, '寅': 9, '卯': 7, '辰': 10, '巳': 11, '午': 12, '未': 8, '申': 4, '酉': 2, '戌': 5, '亥': 1 },
  // 丁 (火): 酉で長生(9) ※逆行
  '丁': { '子': 1, '丑': 5, '寅': 2, '卯': 4, '辰': 8, '巳': 12, '午': 11, '未': 10, '申': 7, '酉': 9, '戌': 6, '亥': 3 },
  // 戊 (土): 丙と同じ（火土同根）
  '戊': { '子': 3, '丑': 5, '寅': 9, '卯': 7, '辰': 10, '巳': 11, '午': 12, '未': 8, '申': 4, '酉': 2, '戌': 5, '亥': 1 },
  // 己 (土): 丁と同じ（火土同根）
  '己': { '子': 1, '丑': 5, '寅': 2, '卯': 4, '辰': 8, '巳': 12, '午': 11, '未': 10, '申': 7, '酉': 9, '戌': 6, '亥': 3 },
  // 庚 (金): 巳で長生(9)
  '庚': { '子': 2, '丑': 5, '寅': 1, '卯': 3, '辰': 6, '巳': 9, '午': 7, '未': 10, '申': 11, '酉': 12, '戌': 8, '亥': 4 },
  // 辛 (金): 子で長生(9) ※逆行
  '辛': { '子': 9, '丑': 6, '寅': 3, '卯': 1, '辰': 5, '巳': 2, '午': 4, '未': 8, '申': 12, '酉': 11, '戌': 10, '亥': 7 },
  // 壬 (水): 申で長生(9)
  '壬': { '子': 12, '丑': 8, '寅': 4, '卯': 2, '辰': 5, '巳': 1, '午': 3, '未': 6, '申': 9, '酉': 7, '戌': 10, '亥': 11 },
  // 癸 (水): 卯で長生(9) ※逆行
  '癸': { '子': 11, '丑': 10, '寅': 7, '卯': 9, '辰': 6, '巳': 3, '午': 1, '未': 5, '申': 2, '酉': 4, '戌': 8, '亥': 12 }
};

const JUSEI_ORDER: JuseiInfo[] = [
  { name: '天報星', sub: '胎', score: 3 }, { name: '天印星', sub: '養', score: 6 },
  { name: '天貴星', sub: '長生', score: 9 }, { name: '天恍星', sub: '沐浴', score: 7 },
  { name: '天南星', sub: '冠帯', score: 10 }, { name: '天禄星', sub: '建禄', score: 11 },
  { name: '天将星', sub: '帝旺', score: 12 }, { name: '天堂星', sub: '衰', score: 8 },
  { name: '天胡星', sub: '病', score: 4 }, { name: '天極星', sub: '死', score: 2 },
  { name: '天庫星', sub: '墓', score: 5 }, { name: '天馳星', sub: '絶', score: 1 }
];

const TAI_INDEX: Record<string, number> = {
  '甲': 9, '乙': 8, '丙': 0, '丁': 11, '戊': 0, '己': 11, '庚': 3, '辛': 2, '壬': 6, '癸': 5
};

const IS_FORWARD_GAN: Record<string, boolean> = {
  '甲': true, '乙': false, '丙': true, '丁': false, '戊': true,
  '己': false, '庚': true, '辛': false, '壬': true, '癸': false
};

/** 天中殺算出（日干支から） */
function calcTenchusatsu(gan: string, shi: string): TenchusatsuInfo {
  const gIdx = GAN.indexOf(gan);
  const sIdx = SHI.indexOf(shi);
  // 六十甲子のグループ開始位置を求める（支の位から干の位を引く）
  let diff = (sIdx - gIdx + 12) % 12;

  if (diff === 0) return { my: '戌亥', branches: ['戌', '亥'] };
  if (diff === 2) return { my: '子丑', branches: ['子', '丑'] };
  if (diff === 4) return { my: '寅卯', branches: ['寅', '卯'] };
  if (diff === 6) return { my: '辰巳', branches: ['辰', '巳'] };
  if (diff === 8) return { my: '午未', branches: ['午', '未'] };
  return { my: '申酉', branches: ['申', '酉'] };
}

const getSetsuiriMoment = (year: number, month: number): number => {
  const baseDay = [6, 4, 6, 5, 6, 6, 7, 8, 8, 9, 8, 7];
  return baseDay[month - 1];
};

const getJunidaiJusei = (dayGan: string, shi: string): JuseiInfo => {
  const shiIdx = SHI.indexOf(shi);
  const startShiIdx = TAI_INDEX[dayGan];
  const isForward = IS_FORWARD_GAN[dayGan];
  const distance = isForward ? (shiIdx - startShiIdx + 12) % 12 : (startShiIdx - shiIdx + 12) % 12;
  return JUSEI_ORDER[distance];
};

const getJudaiShusei = (dayGan: string, targetGan: string): string => {
  const dayIdx = GAN.indexOf(dayGan);
  const targetIdx = GAN.indexOf(targetGan);
  const dayYinYang = dayIdx % 2;
  const targetYinYang = targetIdx % 2;
  const isSamePol = dayYinYang === targetYinYang;
  const dayEl = Math.floor(dayIdx / 2);
  const tgtEl = Math.floor(targetIdx / 2);
  const diff = (tgtEl - dayEl + 5) % 5;
  if (diff === 0) return isSamePol ? '貫索星' : '石門星';
  if (diff === 1) return isSamePol ? '鳳閣星' : '調舒星';
  if (diff === 2) return isSamePol ? '禄存星' : '司禄星';
  if (diff === 3) return isSamePol ? '車騎星' : '牽牛星';
  if (diff === 4) return isSamePol ? '龍高星' : '玉堂星';
  return '不明';
};

const calculateSuriho = (
  yearGan: string, yearShi: string, monthGan: string, monthShi: string, dayGan: string, dayShi: string
) => {
  const multipliersBranches = [yearShi, monthShi, dayShi];
  const allStemsInDestiny: string[] = [yearGan, monthGan, dayGan];
  multipliersBranches.forEach(branch => {
    if (SURIHO_ZOKAN_TABLE[branch]) allStemsInDestiny.push(...SURIHO_ZOKAN_TABLE[branch]);
  });
  const ganCounts: Record<string, number> = {};
  GAN.forEach(g => ganCounts[g] = 0);
  allStemsInDestiny.forEach(stem => { ganCounts[stem]++; });
  const scores: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const details: Array<{ stem: string; gogyo: string; branches: string[]; count: number; baseScore: number; finalScore: number }> = [];
  GAN.forEach(stem => {
    const count = ganCounts[stem];
    if (count === 0) return;
    const gogyoType = GOGYO_MAP[stem];
    let baseScore = 0;
    multipliersBranches.forEach(branch => { baseScore += SURIHO_ENERGY_TABLE[stem]?.[branch] || 0; });
    const finalScore = baseScore * count;
    scores[gogyoType] += finalScore;
    details.push({ stem, gogyo: gogyoType, branches: [...multipliersBranches], count, baseScore, finalScore });
  });
  return {
    total_energy: Object.values(scores).reduce((a, b) => a + b, 0),
    gogyo_scores: scores,
    details
  };
};

export function calculateSanmei(year: number, month: number, day: number, gender: Gender): SanmeiResult {
  const setsuiriDay = getSetsuiriMoment(year, month);
  let sanmeiYear = year;
  let sanmeiMonth = month;
  if (day < setsuiriDay) {
    if (month === 1) { sanmeiYear = year - 1; sanmeiMonth = 12; } else { sanmeiMonth = month - 1; }
  }
  let yOffset = (sanmeiYear - 1924) % 60;
  if (yOffset < 0) yOffset += 60;
  const yearGan = GAN[yOffset % 10];
  const yearShi = SHI[yOffset % 12];
  const yearGanIdx = GAN.indexOf(yearGan);
  const monthStartGanIdx = ((yearGanIdx % 5) * 2 + 2) % 10;
  const monthOffset = (sanmeiMonth + 10) % 12;
  const monthGan = GAN[(monthStartGanIdx + monthOffset) % 10];
  const monthShi = SHI[(monthOffset + 2) % 12];
  // UTC を使用してタイムゾーンによる日数ズレを回避
  const baseDate = Date.UTC(1900, 0, 1);
  const targetDate = Date.UTC(year, month - 1, day);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((targetDate - baseDate) / msPerDay);
  let dOffset = (10 + diffDays) % 60;
  if (dOffset < 0) dOffset += 60;
  const dayGan = GAN[dOffset % 10];
  const dayShi = SHI[dOffset % 12];
  let daysFromSetsuiri = 0;
  if (day >= setsuiriDay) {
    daysFromSetsuiri = day - setsuiriDay;
  } else {
    const lastMonth = month === 1 ? 12 : month - 1;
    const lastYear = month === 1 ? year - 1 : year;
    const daysInLastMonth = new Date(year, month - 1, 0).getDate();
    const lastSetsuiri = getSetsuiriMoment(lastYear, lastMonth);
    daysFromSetsuiri = (daysInLastMonth - lastSetsuiri) + day;
  }
  const getZokan = (shi: string, passedDays: number) => {
    const table = ZOKAN_TABLE[shi];
    let current = 0;
    for (const item of table) {
      current += item.days;
      if (passedDays < current) return item.gan;
    }
    return table[table.length - 1].gan;
  };
  const yearZokan = getZokan(yearShi, daysFromSetsuiri);
  const monthZokan = getZokan(monthShi, daysFromSetsuiri);
  const dayZokan = getZokan(dayShi, daysFromSetsuiri);
  // 陽占: 全て「節入り深さ考慮」の蔵干を使用 (ユーザー要望により東・西もmainZokanではなくCalculated Zokanへ変更)
  const yousen = {
    north: getJudaiShusei(dayGan, yearGan),
    south: getJudaiShusei(dayGan, monthGan),
    east: getJudaiShusei(dayGan, yearZokan),   // 東: 年支蔵干(節入り深さ考慮)
    west: getJudaiShusei(dayGan, dayZokan),    // 西: 日支蔵干(節入り深さ考慮)
    center: getJudaiShusei(dayGan, monthZokan), // 中央: 月支蔵干(節入り深さ考慮)
    start: getJunidaiJusei(dayGan, yearShi),
    middle: getJunidaiJusei(dayGan, monthShi),
    end: getJunidaiJusei(dayGan, dayShi)
  };
  const suriho = calculateSuriho(yearGan, yearShi, monthGan, monthShi, dayGan, dayShi);
  const isYearYang = GAN.indexOf(yearGan) % 2 === 0;
  const isMale = gender === 'male';
  const isForward = (isYearYang && isMale) || (!isYearYang && !isMale);
  const currentSetsuiri = getSetsuiriMoment(year, month);
  let nextY = year, nextM = month + 1;
  if (nextM > 12) { nextM = 1; nextY++; }
  const nextSetsuiri = getSetsuiriMoment(nextY, nextM);
  let prevY = year, prevM = month - 1;
  if (prevM < 1) { prevM = 12; prevY--; }
  const prevSetsuiri = getSetsuiriMoment(prevY, prevM);
  let daysToSetsuiri = 0;
  if (isForward) {
    if (day >= currentSetsuiri) daysToSetsuiri = new Date(year, month, 0).getDate() - day + nextSetsuiri;
    else daysToSetsuiri = currentSetsuiri - day;
  } else {
    if (day >= currentSetsuiri) daysToSetsuiri = day - currentSetsuiri;
    else daysToSetsuiri = (new Date(year, month - 1, 0).getDate() - prevSetsuiri) + day;
  }
  let ritsuun = Math.ceil(daysToSetsuiri / 3);
  if (ritsuun < 1) ritsuun = 1;
  if (ritsuun > 10) ritsuun = 10;
  // 天中殺
  const tenchusatsu = calcTenchusatsu(dayGan, dayShi);

  const taiunList: TaiunRow[] = [];
  let currGanIdx = GAN.indexOf(monthGan);
  let currShiIdx = SHI.indexOf(monthShi);
  for (let i = 0; i < 10; i++) {
    if (isForward) { currGanIdx = (currGanIdx + 1) % 10; currShiIdx = (currShiIdx + 1) % 12; }
    else { currGanIdx = (currGanIdx - 1 + 10) % 10; currShiIdx = (currShiIdx - 1 + 12) % 12; }
    const tGan = GAN[currGanIdx];
    const tShi = SHI[currShiIdx];

    // 位相法: 大運 vs 日柱/月柱/年柱
    const westLabels = getRelationLabels(tGan, tShi, dayGan, dayShi);
    const centerLabels = getRelationLabels(tGan, tShi, monthGan, monthShi);
    const eastLabels = getRelationLabels(tGan, tShi, yearGan, yearShi);

    taiunList.push({
      age: (i * 10) + ritsuun,
      eto: tGan + tShi,
      gan: tGan,
      shi: tShi,
      star: getJudaiShusei(dayGan, tGan),
      jusei: getJunidaiJusei(dayGan, tShi).name,
      west: westLabels.map(l => l.name).join('・') || '―',
      center: centerLabels.map(l => l.name).join('・') || '―',
      east: eastLabels.map(l => l.name).join('・') || '―',
      westLabels,
      centerLabels,
      eastLabels,
      isTenchu: tenchusatsu.branches.includes(tShi),
    });
  }
  return {
    input: { date: `${year}-${month}-${day}`, gender },
    insen: {
      year: { gan: yearGan, shi: yearShi, zokan: yearZokan },
      month: { gan: monthGan, shi: monthShi, zokan: monthZokan },
      day: { gan: dayGan, shi: dayShi, zokan: dayZokan },
      setsuiriDay
    },
    yousen,
    suriho,
    tenchusatsu,
    taiun: { isForward, ritsuun, list: taiunList }
  };
}

// Nenun (Annual Luck) definitions
export interface NenunRow {
  age: number;
  year: number;
  eto: string;
  gan: string;
  shi: string;
  star: string;      // vs Day Gan (Lord)
  jusei: string;     // vs Day Gan (Lord)
  west: string;      // vs Day Pillar
  center: string;    // vs Month Pillar
  east: string;      // vs Year Pillar
  westLabels: IsohoLabel[];
  centerLabels: IsohoLabel[];
  eastLabels: IsohoLabel[];
  isTenchu: boolean;
}

/**
 * Calculate Annual Luck (Nenun) for a specific range of ages.
 */
export function calculateNenun(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  gender: Gender,
  startAge: number = 0,
  endAge: number = 100
): NenunRow[] {
  // 1. Calculate basic Sanmei info (Day Gan, Month Pillar, Year Pillar, Tenchusatsu)
  const baseInfo = calculateSanmei(birthYear, birthMonth, birthDay, gender);
  const { insen, tenchusatsu } = baseInfo;
  const dayGan = insen.day.gan;
  const dayShi = insen.day.shi;
  const monthGan = insen.month.gan;
  const monthShi = insen.month.shi;
  const yearGan = insen.year.gan;
  const yearShi = insen.year.shi;

  const list: NenunRow[] = [];

  // 2. Iterate through each age
  for (let age = startAge; age <= endAge; age++) {
    const targetYear = birthYear + age;

    // Calculate Annual Pillar (Nen-un)
    // Setsubun (Feb 4th approx) is the boundary, but typically just using the year's Eto is sufficient for simple tables.
    // However, exact calculation requires verifying if the birthday has passed slightly or if we just want the "Year's Luck".
    // Usually "2024's Luck" corresponds to the Eto of 2024 (Feb-Feb).

    // Formula for Year Gan/Shi:
    // 1924 = 甲子 (Start of a cycle)
    let yOffset = (targetYear - 1924) % 60;
    if (yOffset < 0) yOffset += 60;
    const nGan = GAN[yOffset % 10];
    const nShi = SHI[yOffset % 12];

    // 3. Calculate relations

    // Stars (Shusei, Jusei)
    const star = getJudaiShusei(dayGan, nGan);
    const jusei = getJunidaiJusei(dayGan, nShi).name;

    // Isouhou
    // West: vs Day Pillar
    const westLabels = getRelationLabels(nGan, nShi, dayGan, dayShi);
    // Center: vs Month Pillar
    const centerLabels = getRelationLabels(nGan, nShi, monthGan, monthShi);
    // East: vs Year Pillar
    const eastLabels = getRelationLabels(nGan, nShi, yearGan, yearShi);

    list.push({
      age,
      year: targetYear,
      eto: nGan + nShi,
      gan: nGan,
      shi: nShi,
      star,
      jusei,
      west: westLabels.map(l => l.name).join('・') || '―',
      center: centerLabels.map(l => l.name).join('・') || '―',
      east: eastLabels.map(l => l.name).join('・') || '―',
      westLabels,
      centerLabels,
      eastLabels,
      isTenchu: tenchusatsu.branches.includes(nShi),
    });
  }

  return list;
}

