#!/usr/bin/env npx tsx
/**
 * rev-sanmei-cli-v6.ts — v6 検証CLI
 * 
 * v6 変更点:
 *   1. SURIHO_ENERGY_TABLE の修正 (ユーザー指摘: 癸-巳=3点など)
 *   2. 数理法(Energy Calculation)の実装を追加 (v5 CLIにはなかった)
 *   3. 1980-05-06 などの日付で正しいエネルギー点数が出るか検証可能に
 *
 * Usage: bunx tsx tools/rev-sanmei-cli-v6.ts YYYY-MM-DD [male|female]
 */

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const GOGYO_MAP: Record<string, string> = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
    "寅": "木", "卯": "木", "巳": "火", "午": "火", "申": "金", "酉": "金", "亥": "水", "子": "水", "辰": "土", "未": "土", "戌": "土", "丑": "土"
};

const ZOKAN_TABLE: Record<string, { days: number; gan: string; type: string }[]> = {
    '子': [{ days: 10, gan: '壬', type: '初元' }, { days: 21, gan: '癸', type: '本元' }],
    '丑': [{ days: 9, gan: '癸', type: '初元' }, { days: 3, gan: '辛', type: '中元' }, { days: 19, gan: '己', type: '本元' }],
    '寅': [{ days: 7, gan: '戊', type: '初元' }, { days: 7, gan: '丙', type: '中元' }, { days: 17, gan: '甲', type: '本元' }],
    '卯': [{ days: 10, gan: '甲', type: '初元' }, { days: 21, gan: '乙', type: '本元' }],
    '辰': [{ days: 9, gan: '乙', type: '初元' }, { days: 3, gan: '癸', type: '中元' }, { days: 19, gan: '戊', type: '本元' }],
    '巳': [{ days: 5, gan: '戊', type: '初元' }, { days: 9, gan: '庚', type: '中元' }, { days: 17, gan: '丙', type: '本元' }],
    '午': [{ days: 10, gan: '丙', type: '初元' }, { days: 9, gan: '丁', type: '中元' }, { days: 12, gan: '己', type: '本元' }],
    '未': [{ days: 9, gan: '丁', type: '初元' }, { days: 3, gan: '乙', type: '中元' }, { days: 19, gan: '己', type: '本元' }],
    '申': [{ days: 7, gan: '戊', type: '初元' }, { days: 7, gan: '壬', type: '中元' }, { days: 17, gan: '庚', type: '本元' }],
    '酉': [{ days: 10, gan: '庚', type: '初元' }, { days: 21, gan: '辛', type: '本元' }],
    '戌': [{ days: 9, gan: '辛', type: '初元' }, { days: 3, gan: '丁', type: '中元' }, { days: 19, gan: '戊', type: '本元' }],
    '亥': [{ days: 7, gan: '甲', type: '初元' }, { days: 24, gan: '壬', type: '本元' }]
};

// 数理法用：全蔵干リスト
const SURIHO_ZOKAN_TABLE: Record<string, string[]> = {
    '子': ['癸'], '丑': ['癸', '辛', '己'], '寅': ['戊', '丙', '甲'], '卯': ['乙'],
    '辰': ['乙', '癸', '戊'], '巳': ['戊', '庚', '丙'], '午': ['己', '丁'], '未': ['丁', '乙', '己'],
    '申': ['戊', '壬', '庚'], '酉': ['辛'], '戌': ['辛', '丁', '戊'], '亥': ['甲', '壬']
};

/**
 * 数理法エネルギー点数表 (v6 修正版)
 * 2026-02-15: ユーザー指摘に基づき修正
 * 特に 癸-巳=3 (天報星相当) など
 */
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

const JUSEI_ORDER = [
    { name: "天報星", sub: "胎", score: 3 }, { name: "天印星", sub: "養", score: 6 },
    { name: "天貴星", sub: "長生", score: 9 }, { name: "天恍星", sub: "沐浴", score: 7 },
    { name: "天南星", sub: "冠帯", score: 10 }, { name: "天禄星", sub: "建禄", score: 11 },
    { name: "天将星", sub: "帝旺", score: 12 }, { name: "天堂星", sub: "衰", score: 8 },
    { name: "天胡星", sub: "病", score: 4 }, { name: "天極星", sub: "死", score: 2 },
    { name: "天庫星", sub: "墓", score: 5 }, { name: "天馳星", sub: "絶", score: 1 }
];

const TAI_INDEX: Record<string, number> = { "甲": 9, "乙": 8, "丙": 0, "丁": 11, "戊": 0, "己": 11, "庚": 3, "辛": 2, "壬": 6, "癸": 5 };
const IS_FORWARD_GAN: Record<string, boolean> = { "甲": true, "乙": false, "丙": true, "丁": false, "戊": true, "己": false, "庚": true, "辛": false, "壬": true, "癸": false };

const getSetsuiriMoment = (_year: number, month: number) => [6, 4, 6, 5, 6, 6, 7, 8, 8, 9, 8, 7][month - 1];

const getJunidaiJusei = (dayGan: string, shi: string) => {
    const shiIdx = SHI.indexOf(shi);
    const startShiIdx = TAI_INDEX[dayGan];
    const isForward = IS_FORWARD_GAN[dayGan];
    const distance = isForward ? (shiIdx - startShiIdx + 12) % 12 : (startShiIdx - shiIdx + 12) % 12;
    return JUSEI_ORDER[distance];
};

const getJudaiShusei = (dayGan: string, targetGan: string) => {
    const dayIdx = GAN.indexOf(dayGan);
    const targetIdx = GAN.indexOf(targetGan);
    const dayEl = Math.floor(dayIdx / 2);
    const tgtEl = Math.floor(targetIdx / 2);
    const isSame = (dayIdx % 2) === (targetIdx % 2);
    const diff = (tgtEl - dayEl + 5) % 5;
    if (diff === 0) return isSame ? "貫索星" : "石門星";
    if (diff === 1) return isSame ? "鳳閣星" : "調舒星";
    if (diff === 2) return isSame ? "禄存星" : "司禄星";
    if (diff === 3) return isSame ? "車騎星" : "牽牛星";
    if (diff === 4) return isSame ? "龍高星" : "玉堂星";
    return "不明";
};

const getMainZokan = (shi: string): string => {
    const table = ZOKAN_TABLE[shi];
    return table[table.length - 1].gan;
};

function calcTenchusatsu(gan: string, shi: string) {
    const gIdx = GAN.indexOf(gan);
    const sIdx = SHI.indexOf(shi);
    let diff = (sIdx - gIdx + 12) % 12;
    if (diff === 0) return { name: "戌亥", branches: ["戌", "亥"] };
    if (diff === 2) return { name: "子丑", branches: ["子", "丑"] };
    if (diff === 4) return { name: "寅卯", branches: ["寅", "卯"] };
    if (diff === 6) return { name: "辰巳", branches: ["辰", "巳"] };
    if (diff === 8) return { name: "午未", branches: ["午", "未"] };
    return { name: "申酉", branches: ["申", "酉"] };
}

// 数理法・八門法計算
const calculateSurihoAndHachimon = (yearGan: string, yearShi: string, monthGan: string, monthShi: string, dayGan: string, dayShi: string) => {
    const multipliersBranches = [yearShi, monthShi, dayShi];
    const targetStems = [yearGan, monthGan, dayGan];
    multipliersBranches.forEach(branch => {
        if (SURIHO_ZOKAN_TABLE[branch]) targetStems.push(...SURIHO_ZOKAN_TABLE[branch]);
    });

    const scores: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    const details = [];

    // 干ごとに集計
    // 同じ干が複数ある場合、それぞれ計算して合算
    // ここでは単純化して、出現する干すべてに対して計算する
    // targetStemsに重複があっても、それぞれ計算する必要がある（例：甲が2つあれば、それぞれ点数を持つ）

    targetStems.forEach(stem => {
        const gogyo = GOGYO_MAP[stem];
        let stemScore = 0;
        multipliersBranches.forEach(branch => {
            stemScore += (SURIHO_ENERGY_TABLE[stem]?.[branch] || 0);
        });
        scores[gogyo] += stemScore;
        details.push({ stem, gogyo, score: stemScore });
    });

    const totalEnergy = Object.values(scores).reduce((a, b) => a + b, 0);

    const dayGogyo = GOGYO_MAP[dayGan];
    const gogyoTypes = ['木', '火', '土', '金', '水'];
    const dayGogyoIdx = gogyoTypes.indexOf(dayGogyo);

    const hachimon = { north: 0, south: 0, east: 0, west: 0, center: 0 };
    gogyoTypes.forEach((type, idx) => {
        const diff = (idx - dayGogyoIdx + 5) % 5;
        if (diff === 0) hachimon.east = scores[type];
        if (diff === 1) hachimon.south = scores[type];
        if (diff === 2) hachimon.center = scores[type];
        if (diff === 3) hachimon.west = scores[type];
        if (diff === 4) hachimon.north = scores[type];
    });

    const values = [
        { dir: '北', score: hachimon.north, type: '玄武型' },
        { dir: '南', score: hachimon.south, type: '朱雀型' },
        { dir: '東', score: hachimon.east, type: '青龍型' },
        { dir: '西', score: hachimon.west, type: '白虎型' },
        { dir: '中', score: hachimon.center, type: '騰蛇型' }
    ];
    values.sort((a, b) => b.score - a.score);
    const mainType = values.filter(v => v.score === values[0].score).map(t => t.type).join('・');

    return { scores, totalEnergy, hachimon, mainType, details };
};

function calculate(year: number, month: number, day: number, gender: string) {
    const setsuiriDay = getSetsuiriMoment(year, month);
    let sYear = year, sMonth = month;
    if (day < setsuiriDay) {
        if (month === 1) { sYear = year - 1; sMonth = 12; } else { sMonth = month - 1; }
    }

    let yOffset = (sYear - 1924) % 60; if (yOffset < 0) yOffset += 60;
    const yGan = GAN[yOffset % 10];
    const yShi = SHI[yOffset % 12];
    const yGanIdx = GAN.indexOf(yGan);
    const mStart = ((yGanIdx % 5) * 2 + 2) % 10;
    const mOffset = (sMonth + 10) % 12;
    const mGan = GAN[(mStart + mOffset) % 10];
    const mShi = SHI[(mOffset + 2) % 12];

    // UTC ベース日干支計算
    const baseDate = Date.UTC(1900, 0, 1);
    const targetDate = Date.UTC(year, month - 1, day);
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((targetDate - baseDate) / msPerDay);
    let dOffset = (10 + diffDays) % 60; if (dOffset < 0) dOffset += 60;
    const dGan = GAN[dOffset % 10];
    const dShi = SHI[dOffset % 12];

    // 蔵干
    let daysFromSetsuiri = 0;
    if (day >= setsuiriDay) {
        daysFromSetsuiri = day - setsuiriDay;
    } else {
        const daysInPrev = new Date(year, month - 1, 0).getDate();
        const prevM = month === 1 ? 12 : month - 1;
        const prevY = month === 1 ? year - 1 : year;
        const prevSetsuiri = getSetsuiriMoment(prevY, prevM);
        daysFromSetsuiri = (daysInPrev - prevSetsuiri) + day;
    }

    const getZokanInfo = (shi: string, passed: number) => {
        const list = ZOKAN_TABLE[shi];
        let cur = 0;
        for (const item of list) {
            cur += item.days;
            if (passed < cur) return item;
        }
        return list[list.length - 1];
    };

    const yZokan = getZokanInfo(yShi, daysFromSetsuiri);
    const mZokan = getZokanInfo(mShi, daysFromSetsuiri);
    const dZokan = getZokanInfo(dShi, daysFromSetsuiri);

    // 陽占: 全て「節入り深さ考慮」の蔵干を使用 (v6修正)
    const yousen = {
        north: getJudaiShusei(dGan, yGan),
        south: getJudaiShusei(dGan, mGan),
        east: getJudaiShusei(dGan, yZokan.gan),   // 東: 年支蔵干(節入り深さ考慮)
        west: getJudaiShusei(dGan, dZokan.gan),   // 西: 日支蔵干(節入り深さ考慮)
        center: getJudaiShusei(dGan, mZokan.gan), // 中央: 月支蔵干(節入り深さ考慮)
        start: getJunidaiJusei(dGan, yShi),
        middle: getJunidaiJusei(dGan, mShi), // Note: reverted to dGan
        end: getJunidaiJusei(dGan, dShi)
    };

    const tenchu = calcTenchusatsu(dGan, dShi);

    // 数理法
    const suriho = calculateSurihoAndHachimon(yGan, yShi, mGan, mShi, dGan, dShi);

    return {
        input: { date: `${year}-${month}-${day}`, gender },
        insen: {
            year: { gan: yGan, shi: yShi, zokan: yZokan },
            month: { gan: mGan, shi: mShi, zokan: mZokan },
            day: { gan: dGan, shi: dShi, zokan: dZokan },
            setsuiriDay,
            daysFromSetsuiri,
        },
        yousen,
        tenchusatsu: tenchu,
        suriho
    };
}

// --- Main ---
const [dateArg, genderArg] = process.argv.slice(2);
if (!dateArg) {
    console.error('Usage: bunx tsx tools/rev-sanmei-cli-v6.ts YYYY-MM-DD [male|female]');
    process.exit(1);
}
const [y, m, d] = dateArg.split('-').map(Number);
const result = calculate(y, m, d, genderArg || 'male');

console.log('=== 算命学 v6 計算結果 ===');
console.log(`入力: ${result.input.date} (${result.input.gender})`);
console.log('');
console.log('--- 陰占 (命式) ---');
const { insen } = result;
console.log(`年柱: ${insen.year.gan}${insen.year.shi}  蔵干=${insen.year.zokan.gan}(${insen.year.zokan.type})`);
console.log(`月柱: ${insen.month.gan}${insen.month.shi}  蔵干=${insen.month.zokan.gan}(${insen.month.zokan.type})`);
console.log(`日柱: ${insen.day.gan}${insen.day.shi}  蔵干=${insen.day.zokan.gan}(${insen.day.zokan.type})`);
console.log('');
console.log('--- 陽占 (人体星図) ---');
console.log(`         ${result.yousen.north}`);
console.log(`  ${result.yousen.start.name}(${result.yousen.start.score})`);
console.log(`${result.yousen.west}  ${result.yousen.center}  ${result.yousen.east}`);
console.log(`  ${result.yousen.end.name}(${result.yousen.end.score})`);
console.log(`         ${result.yousen.south}`);
console.log(`  ${result.yousen.middle.name}(${result.yousen.middle.score})`);
console.log('');
console.log(`--- 天中殺 ---`);
console.log(`${result.tenchusatsu.name}天中殺 (${result.tenchusatsu.branches.join('・')})`);
console.log('');
console.log('--- 数理法 (エネルギー) ---');
console.log(`総エネルギー数: ${result.suriho.totalEnergy}`);
console.log(`八門法型: ${result.suriho.mainType}`);
console.log('五行内訳:', result.suriho.scores);
console.log('詳細点数:');
result.suriho.details.forEach(d => {
    console.log(`  ${d.stem} (${d.gogyo}): ${d.score}点`);
});
