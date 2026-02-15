#!/usr/bin/env npx tsx
/**
 * rev-sanmei-cli-v5.ts — v5 検証CLI
 * 
 * v5 変更点:
 *   1. UTC ベース日干支計算（タイムゾーンズレ回避）
 *   2. 午の本元 = 己（算命学流派準拠）
 *   3. 陽占 東・西 = 本元蔵干を使用、中央 = 節入り深さ考慮
 *
 * Usage: bunx tsx tools/rev-sanmei-cli-v5.ts 1978-03-15 male
 */

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

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

    // 陽占: 東・西 = 本元、中央 = 節入り深さ考慮
    const yousen = {
        north: getJudaiShusei(dGan, yGan),
        south: getJudaiShusei(dGan, mGan),
        east: getJudaiShusei(dGan, getMainZokan(yShi)),
        west: getJudaiShusei(dGan, getMainZokan(dShi)),
        center: getJudaiShusei(dGan, getMainZokan(mShi)),
        start: getJunidaiJusei(dGan, yShi),
        middle: getJunidaiJusei(dGan, mShi),
        end: getJunidaiJusei(dGan, dShi)
    };

    const tenchu = calcTenchusatsu(dGan, dShi);

    // 大運
    const isMale = gender === 'male';
    const isYGanYang = GAN.indexOf(yGan) % 2 === 0;
    const isForward = (isYGanYang && isMale) || (!isYGanYang && !isMale);

    let daysDiffTaiun = 0;
    const currentSetsuiri = getSetsuiriMoment(year, month);
    let nextYear = year, nextMonth = month + 1;
    if (nextMonth > 12) { nextMonth = 1; nextYear++; }
    const nextSetsuiri = getSetsuiriMoment(nextYear, nextMonth);
    let prevYear = year, prevMonth = month - 1;
    if (prevMonth < 1) { prevMonth = 12; prevYear--; }
    const prevSetsuiri = getSetsuiriMoment(prevYear, prevMonth);

    if (isForward) {
        if (day >= currentSetsuiri) {
            const daysInMonth = new Date(year, month, 0).getDate();
            daysDiffTaiun = (daysInMonth - day) + nextSetsuiri;
        } else {
            daysDiffTaiun = currentSetsuiri - day;
        }
    } else {
        if (day >= currentSetsuiri) {
            daysDiffTaiun = day - currentSetsuiri;
        } else {
            const daysInPrev = new Date(year, month - 1, 0).getDate();
            daysDiffTaiun = (daysInPrev - prevSetsuiri) + day;
        }
    }
    let ritsuun = Math.ceil(daysDiffTaiun / 3);
    if (ritsuun < 1) ritsuun = 1; if (ritsuun > 10) ritsuun = 10;

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
        taiun: { isForward, ritsuun },
    };
}

// --- Main ---
const [dateArg, genderArg] = process.argv.slice(2);
if (!dateArg) {
    console.error('Usage: bunx tsx tools/rev-sanmei-cli-v5.ts YYYY-MM-DD [male|female]');
    process.exit(1);
}
const [y, m, d] = dateArg.split('-').map(Number);
const result = calculate(y, m, d, genderArg || 'male');

console.log('=== 算命学 v5 計算結果 ===');
console.log(`入力: ${result.input.date} (${result.input.gender})`);
console.log('');
console.log('--- 陰占 (命式) ---');
const { insen } = result;
console.log(`年柱: ${insen.year.gan}${insen.year.shi}  蔵干=${insen.year.zokan.gan}(${insen.year.zokan.type})`);
console.log(`月柱: ${insen.month.gan}${insen.month.shi}  蔵干=${insen.month.zokan.gan}(${insen.month.zokan.type})`);
console.log(`日柱: ${insen.day.gan}${insen.day.shi}  蔵干=${insen.day.zokan.gan}(${insen.day.zokan.type})`);
console.log(`節入日: ${insen.setsuiriDay}日 / 経過日数: ${insen.daysFromSetsuiri}日`);
console.log('');
console.log('--- 陽占 (人体星図) ---');
const { yousen } = result;
console.log(`         ${yousen.north}`);
console.log(`  ${result.yousen.start.name}(${result.yousen.start.score})`);
console.log(`${yousen.west}  ${yousen.center}  ${yousen.east}`);
console.log(`  ${result.yousen.end.name}(${result.yousen.end.score})`);
console.log(`         ${yousen.south}`);
console.log(`  ${result.yousen.middle.name}(${result.yousen.middle.score})`);
console.log('');
console.log('--- 蔵干の使い分け ---');
console.log(`東(年支${insen.year.shi}の本元): ${getMainZokan(insen.year.shi)} → ${yousen.east}`);
console.log(`西(日支${insen.day.shi}の本元): ${getMainZokan(insen.day.shi)} → ${yousen.west}`);
console.log(`中央(月支${insen.month.shi}の蔵干@${insen.daysFromSetsuiri}日): ${insen.month.zokan.gan}(${insen.month.zokan.type}) → ${yousen.center}`);
console.log('');
console.log(`天中殺: ${result.tenchusatsu.name}天中殺`);
console.log(`大運: ${result.taiun.isForward ? '順行' : '逆行'} / 立運: ${result.taiun.ritsuun}歳`);
