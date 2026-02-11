/**
 * バッチ算命学算出スクリプト
 * 全エピソードの患者キャラクターを一括で sanmei-with-energy-cli.ts の calculateSanmei で算出し、
 * claudedocs/ALL-CHARACTERS-SANMEI.json に統合出力する。
 *
 * 実行: npx tsx tools/batch-sanmei-calculate.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// --- sanmei-with-energy-cli.ts の calculateSanmei をそのまま組み込み ---
// （import だと CLI 部分も実行されるため、ロジックだけ抽出）

type Gender = 'male' | 'female';

interface GanShi {
    gan: string;
    shi: string;
    zokan?: string;
}

interface JuseiInfo {
    name: string;
    sub: string;
    score: number;
}

interface TaiunRow {
    age: number;
    eto: string;
    gan: string;
    shi: string;
    star: string;
    jusei: string;
}

interface SurihoResult {
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
}

interface SanmeiResult {
    input: { date: string; gender: Gender; };
    insen: { year: GanShi; month: GanShi; day: GanShi; setsuiriDay: number; };
    yousen: {
        north: string; south: string; east: string; west: string; center: string;
        start: JuseiInfo; middle: JuseiInfo; end: JuseiInfo;
    };
    suriho: SurihoResult;
    taiun: { isForward: boolean; ritsuun: number; list: TaiunRow[]; };
}

// --- 定数 ---
const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const GOGYO_MAP: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
    '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

const ZOKAN_TABLE: Record<string, { days: number; gan: string }[]> = {
    "子": [{ days: 10, gan: "壬" }, { days: 21, gan: "癸" }],
    "丑": [{ days: 9, gan: "癸" }, { days: 3, gan: "辛" }, { days: 19, gan: "己" }],
    "寅": [{ days: 7, gan: "戊" }, { days: 7, gan: "丙" }, { days: 17, gan: "甲" }],
    "卯": [{ days: 10, gan: "甲" }, { days: 21, gan: "乙" }],
    "辰": [{ days: 9, gan: "乙" }, { days: 3, gan: "癸" }, { days: 19, gan: "戊" }],
    "巳": [{ days: 5, gan: "戊" }, { days: 9, gan: "庚" }, { days: 17, gan: "丙" }],
    "午": [{ days: 10, gan: "丙" }, { days: 9, gan: "己" }, { days: 12, gan: "丁" }],
    "未": [{ days: 9, gan: "丁" }, { days: 3, gan: "乙" }, { days: 19, gan: "己" }],
    "申": [{ days: 7, gan: "戊" }, { days: 7, gan: "壬" }, { days: 17, gan: "庚" }],
    "酉": [{ days: 10, gan: "庚" }, { days: 21, gan: "辛" }],
    "戌": [{ days: 9, gan: "辛" }, { days: 3, gan: "丁" }, { days: 19, gan: "戊" }],
    "亥": [{ days: 7, gan: "甲" }, { days: 24, gan: "壬" }]
};

const SURIHO_ZOKAN_TABLE: Record<string, string[]> = {
    '子': ['癸'], '丑': ['癸', '辛', '己'], '寅': ['戊', '丙', '甲'], '卯': ['乙'],
    '辰': ['乙', '癸', '戊'], '巳': ['戊', '庚', '丙'], '午': ['己', '丁'],
    '未': ['丁', '乙', '己'], '申': ['戊', '壬', '庚'], '酉': ['辛'],
    '戌': ['辛', '丁', '戊'], '亥': ['甲', '壬']
};

const SURIHO_ENERGY_TABLE: Record<string, Record<string, number>> = {
    '甲': { '子': 7, '丑': 10, '寅': 11, '卯': 12, '辰': 8, '巳': 4, '午': 2, '未': 5, '申': 1, '酉': 3, '戌': 6, '亥': 9 },
    '乙': { '子': 4, '丑': 8, '寅': 11, '卯': 10, '辰': 7, '巳': 9, '午': 6, '未': 3, '申': 1, '酉': 5, '戌': 2, '亥': 4 },
    '丙': { '子': 3, '丑': 6, '寅': 9, '卯': 7, '辰': 10, '巳': 11, '午': 12, '未': 8, '申': 4, '酉': 2, '戌': 5, '亥': 1 },
    '丁': { '子': 1, '丑': 5, '寅': 2, '卯': 4, '辰': 8, '巳': 12, '午': 11, '未': 10, '申': 7, '酉': 9, '戌': 6, '亥': 3 },
    '戊': { '子': 3, '丑': 6, '寅': 9, '卯': 7, '辰': 10, '巳': 11, '午': 12, '未': 8, '申': 4, '酉': 2, '戌': 5, '亥': 1 },
    '己': { '子': 1, '丑': 5, '寅': 2, '卯': 4, '辰': 8, '巳': 12, '午': 11, '未': 10, '申': 7, '酉': 9, '戌': 6, '亥': 3 },
    '庚': { '子': 2, '丑': 5, '寅': 1, '卯': 3, '辰': 6, '巳': 9, '午': 7, '未': 10, '申': 11, '酉': 12, '戌': 8, '亥': 4 },
    '辛': { '子': 9, '丑': 6, '寅': 3, '卯': 1, '辰': 5, '巳': 2, '午': 4, '未': 8, '申': 12, '酉': 11, '戌': 10, '亥': 7 },
    '壬': { '子': 12, '丑': 8, '寅': 4, '卯': 2, '辰': 5, '巳': 1, '午': 3, '未': 6, '申': 9, '酉': 7, '戌': 10, '亥': 11 },
    '癸': { '子': 11, '丑': 10, '寅': 7, '卯': 9, '辰': 6, '巳': 3, '午': 1, '未': 5, '申': 2, '酉': 4, '戌': 8, '亥': 12 }
};

const JUSEI_ORDER: JuseiInfo[] = [
    { name: "天報星", sub: "胎", score: 3 }, { name: "天印星", sub: "養", score: 6 },
    { name: "天貴星", sub: "長生", score: 9 }, { name: "天恍星", sub: "沐浴", score: 7 },
    { name: "天南星", sub: "冠帯", score: 10 }, { name: "天禄星", sub: "建禄", score: 11 },
    { name: "天将星", sub: "帝旺", score: 12 }, { name: "天堂星", sub: "衰", score: 8 },
    { name: "天胡星", sub: "病", score: 4 }, { name: "天極星", sub: "死", score: 2 },
    { name: "天庫星", sub: "墓", score: 5 }, { name: "天馳星", sub: "絶", score: 1 }
];

const TAI_INDEX: Record<string, number> = {
    "甲": 9, "乙": 8, "丙": 0, "丁": 11, "戊": 0,
    "己": 11, "庚": 3, "辛": 2, "壬": 6, "癸": 5
};

const IS_FORWARD_GAN: Record<string, boolean> = {
    "甲": true, "乙": false, "丙": true, "丁": false, "戊": true,
    "己": false, "庚": true, "辛": false, "壬": true, "癸": false
};

// --- 計算ロジック ---

const getSetsuiriMoment = (year: number, month: number): number => {
    const baseDay = [6, 4, 6, 5, 6, 6, 7, 8, 8, 9, 8, 7];
    return baseDay[month - 1];
};

const getJunidaiJusei = (dayGan: string, shi: string): JuseiInfo => {
    const shiIdx = SHI.indexOf(shi);
    const startShiIdx = TAI_INDEX[dayGan];
    const isForward = IS_FORWARD_GAN[dayGan];
    let distance;
    if (isForward) { distance = (shiIdx - startShiIdx + 12) % 12; }
    else { distance = (startShiIdx - shiIdx + 12) % 12; }
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
    if (diff === 0) return isSamePol ? "貫索星" : "石門星";
    if (diff === 1) return isSamePol ? "鳳閣星" : "調舒星";
    if (diff === 2) return isSamePol ? "禄存星" : "司禄星";
    if (diff === 3) return isSamePol ? "車騎星" : "牽牛星";
    if (diff === 4) return isSamePol ? "龍高星" : "玉堂星";
    return "不明";
};

const calculateSuriho = (yearGan: string, yearShi: string, monthGan: string, monthShi: string, dayGan: string, dayShi: string): SurihoResult => {
    const multipliersBranches = [yearShi, monthShi, dayShi];
    const allStemsInDestiny: string[] = [];
    allStemsInDestiny.push(yearGan, monthGan, dayGan);
    multipliersBranches.forEach(branch => {
        if (SURIHO_ZOKAN_TABLE[branch]) allStemsInDestiny.push(...SURIHO_ZOKAN_TABLE[branch]);
    });
    const ganCounts: Record<string, number> = {};
    GAN.forEach(g => ganCounts[g] = 0);
    allStemsInDestiny.forEach(stem => { ganCounts[stem]++; });
    const scores: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    const details: SurihoResult['details'] = [];
    GAN.forEach(stem => {
        const count = ganCounts[stem];
        if (count === 0) return;
        const gogyoType = GOGYO_MAP[stem];
        let baseScore = 0;
        multipliersBranches.forEach(branch => {
            const point = SURIHO_ENERGY_TABLE[stem]?.[branch] || 0;
            baseScore += point;
        });
        const finalScore = baseScore * count;
        scores[gogyoType] += finalScore;
        details.push({ stem, gogyo: gogyoType, branches: [...multipliersBranches], count, baseScore, finalScore });
    });
    const totalEnergy = Object.values(scores).reduce((a, b) => a + b, 0);
    return { total_energy: totalEnergy, gogyo_scores: scores, details };
};

const calculateSanmei = (year: number, month: number, day: number, gender: Gender): SanmeiResult => {
    const setsuiriDay = getSetsuiriMoment(year, month);
    let sanmeiYear = year;
    let sanmeiMonth = month;
    if (day < setsuiriDay) {
        if (month === 1) { sanmeiYear = year - 1; sanmeiMonth = 12; }
        else { sanmeiMonth = month - 1; }
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

    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let dOffset = (10 + diffDays) % 60;
    if (dOffset < 0) dOffset += 60;
    const dayGan = GAN[dOffset % 10];
    const dayShi = SHI[dOffset % 12];

    let daysFromSetsuiri = 0;
    if (day >= setsuiriDay) { daysFromSetsuiri = day - setsuiriDay; }
    else {
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const daysInLastMonth = new Date(year, month - 1, 0).getDate();
        const lastSetsuiri = getSetsuiriMoment(lastYear, lastMonth);
        daysFromSetsuiri = (daysInLastMonth - lastSetsuiri) + day;
    }

    const getZokan = (shi: string, passedDays: number) => {
        const table = ZOKAN_TABLE[shi];
        let current = 0;
        for (let item of table) { current += item.days; if (passedDays < current) return item.gan; }
        return table[table.length - 1].gan;
    };

    const yearZokan = getZokan(yearShi, daysFromSetsuiri);
    const monthZokan = getZokan(monthShi, daysFromSetsuiri);
    const dayZokan = getZokan(dayShi, daysFromSetsuiri);

    const yousen = {
        north: getJudaiShusei(dayGan, yearGan),
        south: getJudaiShusei(dayGan, monthGan),
        east: getJudaiShusei(dayGan, yearZokan),
        west: getJudaiShusei(dayGan, dayZokan),
        center: getJudaiShusei(dayGan, monthZokan),
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
        if (day >= currentSetsuiri) {
            const daysLeftInMonth = new Date(year, month, 0).getDate() - day;
            daysToSetsuiri = daysLeftInMonth + nextSetsuiri;
        } else { daysToSetsuiri = currentSetsuiri - day; }
    } else {
        if (day >= currentSetsuiri) { daysToSetsuiri = day - currentSetsuiri; }
        else {
            const daysLeftInPrevMonth = new Date(year, month - 1, 0).getDate() - prevSetsuiri;
            daysToSetsuiri = daysLeftInPrevMonth + day;
        }
    }

    let ritsuun = Math.ceil(daysToSetsuiri / 3);
    if (ritsuun < 1) ritsuun = 1;
    if (ritsuun > 10) ritsuun = 10;

    const taiunList: TaiunRow[] = [];
    let currGanIdx = GAN.indexOf(monthGan);
    let currShiIdx = SHI.indexOf(monthShi);
    for (let i = 0; i < 10; i++) {
        if (isForward) { currGanIdx = (currGanIdx + 1) % 10; currShiIdx = (currShiIdx + 1) % 12; }
        else { currGanIdx = (currGanIdx - 1 + 10) % 10; currShiIdx = (currShiIdx - 1 + 12) % 12; }
        const tGan = GAN[currGanIdx];
        const tShi = SHI[currShiIdx];
        taiunList.push({
            age: (i * 10) + ritsuun,
            eto: tGan + tShi,
            gan: tGan, shi: tShi,
            star: getJudaiShusei(dayGan, tGan),
            jusei: getJunidaiJusei(dayGan, tShi).name
        });
    }

    return {
        input: { date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, gender },
        insen: {
            year: { gan: yearGan, shi: yearShi, zokan: yearZokan },
            month: { gan: monthGan, shi: monthShi, zokan: monthZokan },
            day: { gan: dayGan, shi: dayShi, zokan: dayZokan },
            setsuiriDay
        },
        yousen, suriho,
        taiun: { isForward, ritsuun, list: taiunList }
    };
};

// --- 天中殺グループ判定 ---
const TENCHUSATSU_GROUPS: Record<string, string> = {
    "子丑": "子丑天中殺", "寅卯": "寅卯天中殺", "辰巳": "辰巳天中殺",
    "午未": "午未天中殺", "申酉": "申酉天中殺", "戌亥": "戌亥天中殺"
};

function getTenchusatsu(dayShi: string): string {
    // 日支から六十干支の番号を取得し、天中殺グループを判定
    // 簡易版: 日支のインデックスから計算
    const shiIdx = SHI.indexOf(dayShi);
    // 天中殺は日干支の組み合わせで決定される（六十干支の組番号）
    // 日干支の干支番号 % 12 でグループ判定
    // 実際の天中殺は「甲子〜癸酉 = 戌亥」「甲戌〜癸未 = 申酉」...
    // ここでは日支ベースの簡易判定
    const groups = [
        { shi: ["戌", "亥"], name: "戌亥天中殺" },
        { shi: ["申", "酉"], name: "申酉天中殺" },
        { shi: ["午", "未"], name: "午未天中殺" },
        { shi: ["辰", "巳"], name: "辰巳天中殺" },
        { shi: ["寅", "卯"], name: "寅卯天中殺" },
        { shi: ["子", "丑"], name: "子丑天中殺" }
    ];

    // より正確な計算: 六十干支ベース
    // 干支の組番号で判定
    return ""; // 後で sanmei 結果のinsenから直接判定する
}

function getTenchusatsuFromKanshi(dayGanIdx: number, dayShiIdx: number): string {
    // 六十干支のインデックスで天中殺を正確に判定
    // 天干（日干）のインデックスから空亡を計算
    // 甲の日 = 戌亥が空亡（天中殺）
    // 基準: 甲子(0)→戌亥, 甲戌(10)→申酉, 甲申(20)→午未, 甲午(30)→辰巳, 甲辰(40)→寅卯, 甲寅(50)→子丑
    const kanshiIdx = (dayGanIdx * 6 + dayShiIdx) % 60; // 概算
    // もっとシンプルに: 干支番号からグループを算出
    // 干支番号 = (干idx, 支idx) が合致する最小の60干支表インデックス
    // 60干支: 甲子=0, 乙丑=1, ..., 癸亥=59
    // 組番号 = 干支インデックス / 10 の商
    // → 空亡 = 組に含まれない2つの支

    // 実装: 干支のインデックスから60干支番号を計算
    // 60干支番号 n を求める: n ≡ dayGanIdx (mod 10), n ≡ dayShiIdx (mod 12)
    // CRT (中国剰余定理) で解く
    // n = dayGanIdx + 10 * ((6 * (dayShiIdx - dayGanIdx)) % 12)  // 簡易
    let n = dayGanIdx;
    while (n % 12 !== dayShiIdx) n += 10;
    const groupIdx = Math.floor(n / 10); // 0-5
    const missingShiStart = (10 - (groupIdx * 2 + 10) % 12 + 12) % 12;

    // より単純なアプローチ: 組ごとの空亡
    const kuubou: [string, string][] = [
        ["戌", "亥"], // 甲子組(0)
        ["申", "酉"], // 甲戌組(1)
        ["午", "未"], // 甲申組(2)
        ["辰", "巳"], // 甲午組(3)
        ["寅", "卯"], // 甲辰組(4)
        ["子", "丑"], // 甲寅組(5)
    ];

    const pair = kuubou[groupIdx % 6];
    return `${pair[0]}${pair[1]}天中殺`;
}

// --- キャラクターリスト定義 ---
interface CharacterInput {
    episode: number;
    name: string;
    birthDate: string; // YYYY-MM-DD
    gender: Gender;
    age?: number;
    source: string;
}

// 物語タイムライン: 2026年4月〜2027年12月
// age妥当性チェック: 2026年時点の年齢
function validateAge(birthDate: string, expectedAge: number | undefined, name: string): string[] {
    const warnings: string[] = [];
    if (!expectedAge) return warnings;
    const birthYear = parseInt(birthDate.split('-')[0]);
    const calculatedAge = 2026 - birthYear;
    if (Math.abs(calculatedAge - expectedAge) > 2) {
        warnings.push(`${name}: 設定年齢${expectedAge}歳 vs 計算年齢${calculatedAge}歳 (生年月日${birthDate}) — 差${Math.abs(calculatedAge - expectedAge)}歳以上`);
    }
    return warnings;
}

function parseDateOnly(dateStr: string): [number, number, number] {
    // "YYYY-MM-DD" or "YYYY-MM-DDThh:mm:ss" → [Y, M, D]
    const parts = dateStr.split('T')[0].split('-').map(Number);
    return [parts[0], parts[1], parts[2]];
}

// --- メイン処理 ---
async function main() {
    const claudeDocsDir = path.join(__dirname, '..', 'claudedocs');

    const allCharacters: CharacterInput[] = [];
    const warnings: string[] = [];

    // ===== EP 1-24 =====
    const ep1Data = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-1-24-CHARACTERS.json'), 'utf8'));
    const ep1Genders: Record<number, Gender> = {
        2: 'male',    // 佐藤 翔
        3: 'female',  // 双子の姉妹（葵・凛）
        4: 'female',  // 田中 優子
        5: 'male',    // 山田 太郎
        6: 'female',  // 佐々木 美咲
        7: 'male',    // 中村 大輔
        8: 'female',  // 小林 真由
        9: 'male',    // 加藤 誠
        10: 'female', // 松本 愛
        11: 'male',   // 井上 健一
        12: 'female', // 木村 彩花
        13: 'male',   // 林 翔太
        14: 'female', // 斎藤 舞
        15: 'male',   // 清水 隆之
        16: 'female', // 渡辺 和子
        17: 'male',   // 伊藤 拓哉
        18: 'female', // 遠藤 萌
        19: 'male',   // 武田 健二
        20: 'female', // 上原 里奈
        21: 'male',   // 森田 悠真
        22: 'female', // 土屋 美穂
        23: 'male',   // 大野 翔
        24: 'female', // 菊地 真理子
    };

    for (const c of ep1Data) {
        const ep = c.episode || c.episodeNumber;
        if (ep === 1 || !c.birth_date) continue; // ep1 は来院者なし
        const gender = ep1Genders[ep];
        if (!gender) { warnings.push(`EP${ep} ${c.name}: 性別不明`); continue; }
        allCharacters.push({
            episode: ep, name: c.name, birthDate: c.birth_date, gender, source: 'EPISODES-1-24'
        });
    }

    // ===== EP 25-48 =====
    const ep2Data = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-25-48-CHARACTERS.json'), 'utf8'));
    for (const c of ep2Data.characters) {
        allCharacters.push({
            episode: c.episode, name: c.name,
            birthDate: c.birthDate.split('T')[0], // datetime → date only
            gender: c.gender, source: 'EPISODES-25-48'
        });
    }

    // ===== EP 49-72 =====
    const ep3Data = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-49-72-CHARACTERS.json'), 'utf8'));
    for (const c of ep3Data.characters) {
        if (c.name === "藤堂 慧") continue; // 主要キャラは別管理
        if (c.name.includes('&')) {
            // 双子 (EP66: 星野 蓮 & 星野 颯太 など) → 一人目だけ処理（代表）
            const names = c.name.split('&').map(n => n.trim());
            const primaryName = names[0];
            // birth_date format: "2001-04-12T03:30:00（蓮）, ..."
            // Simply take the first 10 chars for YYYY-MM-DD
            const birthDate = c.birth_date.substring(0, 10);

            allCharacters.push({
                episode: c.episode, name: primaryName, birthDate: birthDate,
                gender: c.gender, age: c.age, source: 'EPISODES-49-72'
            });
            continue;
        }
        allCharacters.push({
            episode: c.episode, name: c.name,
            birthDate: c.birth_date.split('T')[0],
            gender: c.gender, age: c.age, source: 'EPISODES-49-72'
        });
    }

    // ===== EP 73-96 =====
    const ep4Data = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-73-96-CHARACTERS.json'), 'utf8'));
    for (const [phaseName, phaseData] of Object.entries(ep4Data.episodes) as any) {
        // phase_1.patients
        if (phaseData.patients) {
            for (const p of phaseData.patients) {
                const pt = p.patient || {};
                if (!pt.name || pt.name === '（来院者なし）' || !pt.birth_date) continue;
                allCharacters.push({
                    episode: p.episode, name: pt.name,
                    birthDate: pt.birth_date.split('T')[0],
                    gender: pt.gender, age: pt.age, source: 'EPISODES-73-96'
                });
            }
        }
        // episodes_detail
        if (phaseData.episodes_detail) {
            for (const d of phaseData.episodes_detail) {
                if (!d.patient || d.patient.name === '（来院者なし）' || !d.patient.birth_date) continue;
                // Skip if already added from patients
                const alreadyAdded = allCharacters.some(c => c.episode === d.episode);
                if (alreadyAdded) continue;
                allCharacters.push({
                    episode: d.episode, name: d.patient.name,
                    birthDate: d.patient.birth_date.split('T')[0],
                    gender: d.patient.gender, age: d.patient.age, source: 'EPISODES-73-96'
                });
            }
        }
    }

    // ===== EP 91-120 =====
    const ep5Data = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-91-120-CHARACTERS.json'), 'utf8'));
    for (let i = 0; i < 30; i++) {
        const c = ep5Data[String(i)];
        if (!c || !c.birth_date) continue;
        // gender: 1=male, 2=female
        const gender: Gender = c.gender === 1 ? 'male' : 'female';
        allCharacters.push({
            episode: c.episode, name: c.name,
            birthDate: c.birth_date,
            gender, age: c.age, source: 'EPISODES-91-120'
        });
    }

    // --- 年齢妥当性チェック ---
    for (const c of allCharacters) {
        const ageWarnings = validateAge(c.birthDate, c.age, `EP${c.episode} ${c.name}`);
        warnings.push(...ageWarnings);
    }

    console.log(`\n📊 キャラクター総数: ${allCharacters.length}`);
    console.log(`📋 EP分布:`);
    const groups: Record<string, number> = {};
    for (const c of allCharacters) { groups[c.source] = (groups[c.source] || 0) + 1; }
    for (const [src, count] of Object.entries(groups)) console.log(`  ${src}: ${count}名`);

    if (warnings.length > 0) {
        console.log(`\n⚠️ 警告 (${warnings.length}件):`);
        warnings.forEach(w => console.log(`  - ${w}`));
    }

    // --- 命式一括算出 ---
    console.log(`\n🔮 命式算出開始...`);

    interface CharacterSanmei {
        episode: number;
        name: string;
        birthDate: string;
        gender: Gender;
        age?: number;
        source: string;
        sanmei: SanmeiResult;
        tenchusatsu: string;
    }

    const results: CharacterSanmei[] = [];
    const errors: string[] = [];

    for (const c of allCharacters) {
        try {
            const [y, m, d] = parseDateOnly(c.birthDate);
            const result = calculateSanmei(y, m, d, c.gender);

            // 天中殺判定
            const dayGanIdx = GAN.indexOf(result.insen.day.gan);
            const dayShiIdx = SHI.indexOf(result.insen.day.shi);
            const tenchusatsu = getTenchusatsuFromKanshi(dayGanIdx, dayShiIdx);

            results.push({
                episode: c.episode,
                name: c.name,
                birthDate: c.birthDate,
                gender: c.gender,
                age: c.age,
                source: c.source,
                sanmei: result,
                tenchusatsu
            });
        } catch (e: any) {
            errors.push(`EP${c.episode} ${c.name}: ${e.message}`);
        }
    }

    console.log(`✅ 算出完了: ${results.length}/${allCharacters.length}`);
    if (errors.length > 0) {
        console.log(`❌ エラー (${errors.length}件):`);
        errors.forEach(e => console.log(`  - ${e}`));
    }

    // --- 統計情報 ---
    const tenchusatsuDist: Record<string, number> = {};
    for (const r of results) {
        tenchusatsuDist[r.tenchusatsu] = (tenchusatsuDist[r.tenchusatsu] || 0) + 1;
    }
    console.log(`\n📊 天中殺グループ分布:`);
    for (const [group, count] of Object.entries(tenchusatsuDist).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${group}: ${count}名`);
    }

    // --- JSON出力 ---
    const outputPath = path.join(claudeDocsDir, 'ALL-CHARACTERS-SANMEI.json');
    const output = {
        metadata: {
            generated: new Date().toISOString(),
            tool: 'batch-sanmei-calculate.ts (sanmei-with-energy-cli logic)',
            totalCharacters: results.length,
            warnings: warnings,
            errors: errors,
            tenchusatsuDistribution: tenchusatsuDist
        },
        characters: results
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`\n💾 保存: ${outputPath}`);
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
