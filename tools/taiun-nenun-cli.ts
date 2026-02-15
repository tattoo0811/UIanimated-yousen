/**
 * 大運・年運 詳細鑑定 CLI
 *
 * 大運（10年単位）と年運（1年単位）に
 * 西方/中央/東方の関係指標（位相法）を付与。
 * AI創作用の構造化データ出力。
 *
 * Usage: npx tsx tools/taiun-nenun-cli.ts <YYYY-MM-DD> <male|female> [startYear] [endYear]
 * 例: npx tsx tools/taiun-nenun-cli.ts 1990-03-02 male 2020 2035
 */

import { calculateSanmei } from './sanmei-with-energy-cli.js';
import { getRelationLabel } from './lib/isouhou.js';

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const SHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 天中殺: 三柱に現れない連続2支 */
function getTenchusatsu(yearShi: string, monthShi: string, dayShi: string): string {
  const used = new Set([yearShi, monthShi, dayShi]);
  const pairs: [string, string][] = [
    ['子', '丑'], ['寅', '卯'], ['辰', '巳'], ['午', '未'], ['申', '酉'], ['戌', '亥'],
  ];
  for (const [a, b] of pairs) {
    if (!used.has(a) && !used.has(b)) return a + b;
  }
  return '';
}

/** 指定の支が天中殺に含まれるか */
function isInTenchusatsu(shi: string, tenchusatsu: string): boolean {
  if (!tenchusatsu) return false;
  return tenchusatsu.includes(shi);
}

interface TaiunDetailRow {
  age: number;
  year: number;
  eto: string;
  gan: string;
  shi: string;
  star: string;
  jusei: string;
  west: string;
  center: string;
  east: string;
  tenchusatsu: boolean;
}

interface NenunRow {
  age: number;
  year: number;
  eto: string;
  gan: string;
  shi: string;
  star: string;
  jusei: string;
  west: string;
  center: string;
  east: string;
  tenchusatsu: boolean;
}

function expandTaiunWithRelations(
  taiunList: { age: number; eto: string; gan: string; shi: string; star: string; jusei: string }[],
  yearGan: string, yearShi: string,
  monthGan: string, monthShi: string,
  dayGan: string, dayShi: string
): TaiunDetailRow[] {
  const tenchusatsu = getTenchusatsu(yearShi, monthShi, dayShi);
  const birthYear = 1990; // 仮 - 実際は引数から

  // 西方=大運vs日支(配偶者) 中央=大運vs日柱(自分) 東方=大運vs年柱(親・社会)
  const HONKI: Record<string, string> = {
    '子':'癸','丑':'己','寅':'甲','卯':'乙','辰':'戊','巳':'丙',
    '午':'丁','未':'己','申':'庚','酉':'辛','戌':'戊','亥':'壬',
  };
  const dayHonki = HONKI[dayShi] ?? dayGan;

  return taiunList.map((row) => {
    const year = birthYear + row.age;
    return {
      age: row.age,
      year,
      eto: row.eto,
      gan: row.gan,
      shi: row.shi,
      star: row.star,
      jusei: row.jusei,
      west: getRelationLabel(row.gan, row.shi, dayHonki, dayShi),
      center: getRelationLabel(row.gan, row.shi, dayGan, dayShi),
      east: getRelationLabel(row.gan, row.shi, yearGan, yearShi),
      tenchusatsu: isInTenchusatsu(row.shi, tenchusatsu),
    };
  });
}

/** 年運リスト生成（指定年範囲）月柱から立春ごとに1年ずつ進む */
function getNenunList(
  birthYear: number, birthMonth: number, birthDay: number,
  monthGan: string, monthShi: string,
  dayGan: string, dayShi: string,
  yearGan: string, yearShi: string,
  isForward: boolean,
  _ritsuun: number,
  startYear: number, endYear: number
): NenunRow[] {
  const tenchusatsu = getTenchusatsu(yearShi, monthShi, dayShi);

  // 年運 = 月柱から (年 - 誕生年) 分進めた干支。立春基準で簡略化
  let ganIdx = GAN.indexOf(monthGan);
  let shiIdx = SHI.indexOf(monthShi);
  const offset = startYear - birthYear;
  for (let i = 0; i < offset; i++) {
    if (isForward) {
      ganIdx = (ganIdx + 1) % 10;
      shiIdx = (shiIdx + 1) % 12;
    } else {
      ganIdx = (ganIdx - 1 + 10) % 10;
      shiIdx = (shiIdx - 1 + 12) % 12;
    }
  }

  const rows: NenunRow[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const age = y - birthYear - (birthMonth >= 4 || (birthMonth === 3 && birthDay >= 6) ? 0 : 1);
    if (age < 0) continue;

    const tGan = GAN[ganIdx];
    const tShi = SHI[shiIdx];
    const eto = tGan + tShi;

    const HONKI: Record<string, string> = {
      '子':'癸','丑':'己','寅':'甲','卯':'乙','辰':'戊','巳':'丙',
      '午':'丁','未':'己','申':'庚','酉':'辛','戌':'戊','亥':'壬',
    };
    const dayHonki = HONKI[dayShi] ?? dayGan;

    rows.push({
      age,
      year: y,
      eto,
      gan: tGan,
      shi: tShi,
      star: '—',
      jusei: '—',
      west: getRelationLabel(tGan, tShi, dayHonki, dayShi),
      center: getRelationLabel(tGan, tShi, dayGan, dayShi),
      east: getRelationLabel(tGan, tShi, yearGan, yearShi),
      tenchusatsu: isInTenchusatsu(tShi, tenchusatsu),
    });

    if (isForward) {
      ganIdx = (ganIdx + 1) % 10;
      shiIdx = (shiIdx + 1) % 12;
    } else {
      ganIdx = (ganIdx - 1 + 10) % 10;
      shiIdx = (shiIdx - 1 + 12) % 12;
    }
  }
  return rows;
}

// 十大主星・十二大従星の再計算（年運用）
const JUSEI_ORDER = [
  { name: '天報星', score: 3 }, { name: '天印星', score: 6 }, { name: '天貴星', score: 9 },
  { name: '天恍星', score: 7 }, { name: '天南星', score: 10 }, { name: '天禄星', score: 11 },
  { name: '天将星', score: 12 }, { name: '天堂星', score: 8 }, { name: '天胡星', score: 4 },
  { name: '天極星', score: 2 }, { name: '天庫星', score: 5 }, { name: '天馳星', score: 1 },
];
const TAI_INDEX: Record<string, number> = {
  '甲': 9, '乙': 8, '丙': 0, '丁': 11, '戊': 0, '己': 11, '庚': 3, '辛': 2, '壬': 6, '癸': 5,
};
const IS_FORWARD_GAN: Record<string, boolean> = {
  '甲': true, '乙': false, '丙': true, '丁': false, '戊': true,
  '己': false, '庚': true, '辛': false, '壬': true, '癸': false,
};
function getJudaiShusei(dayGan: string, targetGan: string): string {
  const dayIdx = GAN.indexOf(dayGan);
  const targetIdx = GAN.indexOf(targetGan);
  const isSamePol = (dayIdx % 2) === (targetIdx % 2);
  const dayEl = Math.floor(dayIdx / 2);
  const tgtEl = Math.floor(targetIdx / 2);
  const diff = (tgtEl - dayEl + 5) % 5;
  const stars = [
    ['貫索星', '石門星'], ['鳳閣星', '調舒星'], ['禄存星', '司禄星'],
    ['車騎星', '牽牛星'], ['龍高星', '玉堂星'],
  ];
  return stars[diff][isSamePol ? 0 : 1];
}
function getJunidaiJusei(dayGan: string, shi: string): { name: string } {
  const shiIdx = SHI.indexOf(shi);
  const start = TAI_INDEX[dayGan];
  const isForward = IS_FORWARD_GAN[dayGan];
  const dist = isForward ? (shiIdx - start + 12) % 12 : (start - shiIdx + 12) % 12;
  return JUSEI_ORDER[dist];
}

// 年運の星を補完
function fillNenunStars(rows: NenunRow[], dayGan: string): void {
  rows.forEach((r) => {
    r.star = getJudaiShusei(dayGan, r.gan);
    r.jusei = getJunidaiJusei(dayGan, r.shi).name;
  });
}

// --- CLI ---

const main = () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: npx tsx tools/taiun-nenun-cli.ts <YYYY-MM-DD> <male|female> [startYear] [endYear]');
    process.exit(1);
  }

  const [dateStr, genderStr] = args;
  const startYear = args[2] ? parseInt(args[2], 10) : 2020;
  const endYear = args[3] ? parseInt(args[3], 10) : 2040;

  const [y, m, d] = dateStr.split('-').map(Number);
  const result = calculateSanmei(y, m, d, genderStr as 'male' | 'female');

  const { insen, taiun } = result;
  const birthYear = y;

  const taiunDetail = expandTaiunWithRelations(
    taiun.list,
    insen.year.gan, insen.year.shi,
    insen.month.gan, insen.month.shi,
    insen.day.gan, insen.day.shi
  );

  const nenun = getNenunList(
    birthYear, m, d,
    insen.month.gan, insen.month.shi,
    insen.day.gan, insen.day.shi,
    insen.year.gan, insen.year.shi,
    taiun.isForward,
    taiun.ritsuun,
    startYear,
    endYear
  );
  fillNenunStars(nenun, insen.day.gan);

  const tenchusatsu = getTenchusatsu(insen.year.shi, insen.month.shi, insen.day.shi);

  const output = {
    input: result.input,
    insen: {
      year: `${insen.year.gan}${insen.year.shi}`,
      month: `${insen.month.gan}${insen.month.shi}`,
      day: `${insen.day.gan}${insen.day.shi}`,
      tenchusatsu,
    },
    taiun: {
      isForward: taiun.isForward,
      ritsuun: taiun.ritsuun,
      columns: ['歳', '西暦', '干支', '主星', '従星', '西方', '中央', '東方', '天中殺'],
      list: taiunDetail.map((r) => ({
        age: r.age,
        year: r.year,
        eto: r.eto,
        star: r.star,
        jusei: r.jusei,
        west: r.west,
        center: r.center,
        east: r.east,
        tenchusatsu: r.tenchusatsu ? '〇' : '',
      })),
    },
    nenun: {
      range: [startYear, endYear],
      columns: ['歳', '西暦', '干支', '主星', '従星', '西方', '中央', '東方', '天中殺'],
      list: nenun.map((r) => ({
        age: r.age,
        year: r.year,
        eto: r.eto,
        star: r.star,
        jusei: r.jusei,
        west: r.west,
        center: r.center,
        east: r.east,
        tenchusatsu: r.tenchusatsu ? '〇' : '',
      })),
    },
  };

  console.log(JSON.stringify(output, null, 2));
};

main();
