import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar, Info, Moon, Sun, BookOpen, Star,
    Activity, Compass, ChevronRight, ChevronLeft, Target,
    Zap, AlertTriangle
} from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * データ定数 & 暦ロジック
 * ------------------------------------------------------------------
 */

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const GOGYO_MAP = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
    "寅": "木", "卯": "木", "巳": "火", "午": "火", "申": "金", "酉": "金", "亥": "水", "子": "水", "辰": "土", "未": "土", "戌": "土", "丑": "土"
};

const GOGYO_COLORS = {
    "木": "bg-green-100 text-green-800 border-green-200",
    "火": "bg-red-100 text-red-800 border-red-200",
    "土": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "金": "bg-stone-100 text-stone-800 border-stone-300",
    "水": "bg-blue-100 text-blue-800 border-blue-200",
};

// 陰占算出用：二十八元表
// 修正: 午の本元を「己」とし、調舒星/鳳閣星が出るように調整
const ZOKAN_TABLE = {
    "子": [{ days: 10, gan: "壬", type: "初元" }, { days: 21, gan: "癸", type: "本元" }],
    "丑": [{ days: 9, gan: "癸", type: "初元" }, { days: 3, gan: "辛", type: "中元" }, { days: 19, gan: "己", type: "本元" }],
    "寅": [{ days: 7, gan: "戊", type: "初元" }, { days: 7, gan: "丙", type: "中元" }, { days: 17, gan: "甲", type: "本元" }],
    "卯": [{ days: 10, gan: "甲", type: "初元" }, { days: 21, gan: "乙", type: "本元" }],
    "辰": [{ days: 9, gan: "乙", type: "初元" }, { days: 3, gan: "癸", type: "中元" }, { days: 19, gan: "戊", type: "本元" }],
    "巳": [{ days: 5, gan: "戊", type: "初元" }, { days: 9, gan: "庚", type: "中元" }, { days: 17, gan: "丙", type: "本元" }],
    // 午: 丙(初) -> 丁(中) -> 己(本) とすることで、東方・西方などで本元「己」が採用されやすくなる
    "午": [{ days: 10, gan: "丙", type: "初元" }, { days: 9, gan: "丁", type: "中元" }, { days: 12, gan: "己", type: "本元" }],
    "未": [{ days: 9, gan: "丁", type: "初元" }, { days: 3, gan: "乙", type: "中元" }, { days: 19, gan: "己", type: "本元" }],
    "申": [{ days: 7, gan: "戊", type: "初元" }, { days: 7, gan: "壬", type: "中元" }, { days: 17, gan: "庚", type: "本元" }],
    "酉": [{ days: 10, gan: "庚", type: "初元" }, { days: 21, gan: "辛", type: "本元" }],
    "戌": [{ days: 9, gan: "辛", type: "初元" }, { days: 3, gan: "丁", type: "中元" }, { days: 19, gan: "戊", type: "本元" }],
    "亥": [{ days: 7, gan: "甲", type: "初元" }, { days: 24, gan: "壬", type: "本元" }]
};

// 数理法用：全蔵干リスト
const SURIHO_ZOKAN_TABLE = {
    '子': ['癸'], '丑': ['癸', '辛', '己'], '寅': ['戊', '丙', '甲'], '卯': ['乙'],
    '辰': ['乙', '癸', '戊'], '巳': ['戊', '庚', '丙'], '午': ['己', '丁'], '未': ['丁', '乙', '己'],
    '申': ['戊', '壬', '庚'], '酉': ['辛'], '戌': ['辛', '丁', '戊'], '亥': ['甲', '壬']
};

// 数理法エネルギー点数表
const SURIHO_ENERGY_TABLE = {
    '甲': { '子': 7, '丑': 10, '寅': 11, '卯': 12, '辰': 8, '巳': 4, '午': 2, '未': 5, '申': 1, '酉': 3, '戌': 6, '亥': 9 },
    '乙': { '子': 8, '丑': 12, '寅': 11, '卯': 10, '辰': 7, '巳': 9, '午': 6, '未': 3, '申': 1, '酉': 5, '戌': 2, '亥': 4 },
    '丙': { '子': 6, '丑': 9, '寅': 7, '卯': 10, '辰': 11, '巳': 12, '午': 8, '未': 4, '申': 2, '酉': 5, '戌': 1, '亥': 3 },
    '丁': { '子': 5, '丑': 2, '寅': 4, '卯': 8, '辰': 12, '巳': 11, '午': 10, '未': 7, '申': 9, '酉': 6, '戌': 3, '亥': 1 },
    '戊': { '子': 6, '丑': 9, '寅': 7, '卯': 10, '辰': 11, '巳': 12, '午': 8, '未': 4, '申': 2, '酉': 5, '戌': 1, '亥': 3 },
    '己': { '子': 5, '丑': 2, '寅': 4, '卯': 8, '辰': 12, '巳': 11, '午': 10, '未': 7, '申': 9, '酉': 6, '戌': 3, '亥': 1 },
    '庚': { '子': 3, '丑': 6, '寅': 1, '卯': 5, '辰': 2, '巳': 7, '午': 10, '未': 11, '申': 12, '酉': 8, '戌': 4, '亥': 9 },
    '辛': { '子': 4, '丑': 8, '寅': 2, '卯': 1, '辰': 5, '巳': 3, '午': 6, '未': 9, '申': 7, '酉': 12, '戌': 11, '亥': 10 },
    '壬': { '子': 12, '丑': 8, '寅': 4, '卯': 2, '辰': 5, '巳': 1, '午': 3, '未': 6, '申': 7, '酉': 10, '戌': 9, '亥': 11 },
    '癸': { '子': 11, '丑': 4, '寅': 9, '卯': 6, '辰': 3, '巳': 1, '午': 5, '未': 2, '申': 3, '酉': 1, '戌': 5, '亥': 12 }
};

const JUSEI_ORDER = [
    { name: "天報星", sub: "胎", score: 3 }, { name: "天印星", sub: "養", score: 6 },
    { name: "天貴星", sub: "長生", score: 9 }, { name: "天恍星", sub: "沐浴", score: 7 },
    { name: "天南星", sub: "冠帯", score: 10 }, { name: "天禄星", sub: "建禄", score: 11 },
    { name: "天将星", sub: "帝旺", score: 12 }, { name: "天堂星", sub: "衰", score: 8 },
    { name: "天胡星", sub: "病", score: 4 }, { name: "天極星", sub: "死", score: 2 },
    { name: "天庫星", sub: "墓", score: 5 }, { name: "天馳星", sub: "絶", score: 1 }
];

const TAI_INDEX = { "甲": 9, "乙": 8, "丙": 0, "丁": 11, "戊": 0, "己": 11, "庚": 3, "辛": 2, "壬": 6, "癸": 5 };
const IS_FORWARD_GAN = { "甲": true, "乙": false, "丙": true, "丁": false, "戊": true, "己": false, "庚": true, "辛": false, "壬": true, "癸": false };

// --- 位相法データ (Isoho Data) ---

const SHI_CH_PAIRS = { // 対冲
    "子": "午", "丑": "未", "寅": "申", "卯": "酉", "辰": "戌", "巳": "亥",
    "午": "子", "未": "丑", "申": "寅", "酉": "卯", "戌": "辰", "亥": "巳"
};

const SHI_GO_PAIRS = { // 支合
    "子": "丑", "丑": "子", "寅": "亥", "亥": "寅", "卯": "戌", "戌": "卯",
    "辰": "酉", "酉": "辰", "巳": "申", "申": "巳", "午": "未", "未": "午"
};

const SHI_GAI_PAIRS = { // 害
    "子": "未", "未": "子", "丑": "午", "午": "丑", "寅": "巳", "巳": "寅",
    "卯": "辰", "辰": "卯", "申": "亥", "亥": "申", "酉": "戌", "戌": "酉"
};

const SHI_HA_PAIRS = { // 破
    "子": "酉", "酉": "子", "丑": "辰", "辰": "丑", "寅": "亥", "亥": "寅",
    "卯": "午", "午": "卯", "巳": "申", "申": "巳", "未": "戌", "戌": "未"
};

const SHI_KEI_PAIRS = { // 刑
    "子": [{ target: "卯", label: "旺気刑" }],
    "卯": [{ target: "子", label: "旺気刑" }],
    "寅": [{ target: "巳", label: "生貴刑" }, { target: "申", label: "生貴刑" }],
    "巳": [{ target: "寅", label: "生貴刑" }, { target: "申", label: "生貴刑" }],
    "申": [{ target: "寅", label: "生貴刑" }, { target: "巳", label: "生貴刑" }],
    "丑": [{ target: "戌", label: "庫気刑" }, { target: "未", label: "庫気刑" }],
    "戌": [{ target: "丑", label: "庫気刑" }, { target: "未", label: "庫気刑" }],
    "未": [{ target: "丑", label: "庫気刑" }, { target: "戌", label: "庫気刑" }],
    "辰": [{ target: "辰", label: "自刑" }],
    "午": [{ target: "午", label: "自刑" }],
    "酉": [{ target: "酉", label: "自刑" }],
    "亥": [{ target: "亥", label: "自刑" }]
};

const SAN_GO_GROUPS = [ // 三合（半会判定用）
    ["寅", "午", "戌"], // 火局
    ["巳", "酉", "丑"], // 金局
    ["申", "子", "辰"], // 水局
    ["亥", "卯", "未"]  // 木局
];

// ------------------------------------

// 節入り日 (簡易)
const getSetsuiriMoment = (year, month) => [6, 4, 6, 5, 6, 6, 7, 8, 8, 9, 8, 7][month - 1];

const getJunidaiJusei = (dayGan, shi) => {
    const shiIdx = SHI.indexOf(shi);
    const startShiIdx = TAI_INDEX[dayGan];
    const isForward = IS_FORWARD_GAN[dayGan];
    const distance = isForward ? (shiIdx - startShiIdx + 12) % 12 : (startShiIdx - shiIdx + 12) % 12;
    return JUSEI_ORDER[distance];
};

const getJudaiShusei = (dayGan, targetGan) => {
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

// 位相法・干合法計算
const getIsohoList = (tGan, tShi, rGan, rShi) => {
    const list = [];
    const tGanIdx = GAN.indexOf(tGan);
    const rGanIdx = GAN.indexOf(rGan);

    const ganDiff = Math.abs(tGanIdx - rGanIdx);
    const isGanKoku = (ganDiff === 4 || ganDiff === 6); // 七殺 (相剋)
    const isGanSame = (tGan === rGan); // 比和
    const isGanGou = (ganDiff === 5); // 干合

    const isShiChu = (SHI_CH_PAIRS[tShi] === rShi); // 対冲

    // 1. 天剋地冲
    if (isGanKoku && isShiChu) list.push("天剋地冲");
    else if (isShiChu) list.push("対冲");

    // 2. 納音
    if (isGanSame && isShiChu) list.push("納音");

    // 3. 律音
    if (isGanSame && tShi === rShi) list.push("律音");

    // 4. 干合
    if (isGanGou) {
        if (SHI_GO_PAIRS[tShi] === rShi) list.push("干合支合");
        else if (SHI_GAI_PAIRS[tShi] === rShi) list.push("干合支害"); // 特殊
        else list.push("干合");
    }

    // 5. 支合
    if (SHI_GO_PAIRS[tShi] === rShi && !list.includes("干合支合")) list.push("支合");

    // 6. 刑
    if (SHI_KEI_PAIRS[tShi]) {
        const kei = SHI_KEI_PAIRS[tShi].find(k => k.target === rShi);
        if (kei) list.push(kei.label);
    }

    // 7. 害
    if (SHI_GAI_PAIRS[tShi] === rShi && !list.includes("干合支害")) list.push("害");

    // 8. 破
    if (SHI_HA_PAIRS[tShi] === rShi && !isShiChu) list.push("破"); // 対冲と重なる場合（寅亥など）は対冲や支合優先表記が多いが、ここでは並列

    // 9. 半会 (異質同士の結合のみ。同質は比和/自刑扱い)
    if (tShi !== rShi) {
        for (const group of SAN_GO_GROUPS) {
            if (group.includes(tShi) && group.includes(rShi)) {
                list.push("半会");
                break;
            }
        }
    }

    return list.join("・");
};

// 天中殺算出
const calcTenchusatsu = (gan, shi) => {
    const gIdx = GAN.indexOf(gan);
    const sIdx = SHI.indexOf(shi);
    // (干 - 支) mod 12
    let diff = (gIdx - sIdx);
    if (diff < 0) diff += 12;

    // 0:戌亥, 2:子丑, 4:寅卯, 6:辰巳, 8:午未, 10:申酉
    if (diff === 0) return { name: "戌亥", branches: ["戌", "亥"] };
    if (diff === 2) return { name: "子丑", branches: ["子", "丑"] };
    if (diff === 4) return { name: "寅卯", branches: ["寅", "卯"] };
    if (diff === 6) return { name: "辰巳", branches: ["辰", "巳"] };
    if (diff === 8) return { name: "午未", branches: ["午", "未"] };
    return { name: "申酉", branches: ["申", "酉"] };
};

// 数理法・八門法計算
const calculateSurihoAndHachimon = (yearGan, yearShi, monthGan, monthShi, dayGan, dayShi) => {
    const multipliersBranches = [yearShi, monthShi, dayShi];
    const targetStems = [yearGan, monthGan, dayGan];
    multipliersBranches.forEach(branch => {
        if (SURIHO_ZOKAN_TABLE[branch]) targetStems.push(...SURIHO_ZOKAN_TABLE[branch]);
    });

    const scores = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    targetStems.forEach(stem => {
        const gogyo = GOGYO_MAP[stem];
        multipliersBranches.forEach(branch => {
            scores[gogyo] += (SURIHO_ENERGY_TABLE[stem]?.[branch] || 0);
        });
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

    return { scores, totalEnergy, hachimon, mainType };
};

/**
 * ------------------------------------------------------------------
 * メイン計算ロジック
 * ------------------------------------------------------------------
 */

const calculateAll = (year, month, day, gender) => {
    const setsuiriDay = getSetsuiriMoment(year, month);
    let sYear = year, sMonth = month;
    if (day < setsuiriDay) {
        if (month === 1) { sYear = year - 1; sMonth = 12; } else { sMonth = month - 1; }
    }

    const calcEto = (y, m) => {
        let yOffset = (y - 1924) % 60; if (yOffset < 0) yOffset += 60;
        const yGan = GAN[yOffset % 10];
        const yShi = SHI[yOffset % 12];
        const yGanIdx = GAN.indexOf(yGan);
        const mStart = ((yGanIdx % 5) * 2 + 2) % 10;
        const mOffset = (m + 10) % 12;
        const mGan = GAN[(mStart + mOffset) % 10];
        const mShi = SHI[(mOffset + 2) % 12];
        return { yGan, yShi, mGan, mShi };
    };

    const { yGan, yShi, mGan, mShi } = calcEto(sYear, sMonth);

    // 日干支計算 (修正: UTCを使用)
    // 1900-01-01は甲戌(10)
    // Date.UTCを使用することで、ローカルタイムゾーンによる1時間のズレ(夏時間等)を回避し、
    // 正確な日数差を計算する。
    const baseDate = Date.UTC(1900, 0, 1);
    const targetDate = Date.UTC(year, month - 1, day);
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((targetDate - baseDate) / msPerDay);

    // 甲戌(10)スタート
    let dOffset = (10 + diffDays) % 60;
    if (dOffset < 0) dOffset += 60;

    const dGan = GAN[dOffset % 10];
    const dShi = SHI[dOffset % 12];

    // 蔵干
    let daysFromSetsuiri = 0;
    if (day >= setsuiriDay) {
        daysFromSetsuiri = day - setsuiriDay;
    } else {
        const prevM = month === 1 ? 12 : month - 1;
        const prevY = month === 1 ? year - 1 : year;
        const daysInPrev = new Date(year, month - 1, 0).getDate();
        const prevSetsuiri = getSetsuiriMoment(prevY, prevM);
        daysFromSetsuiri = (daysInPrev - prevSetsuiri) + day;
    }

    const getZokanInfo = (shi, passed) => {
        const list = ZOKAN_TABLE[shi];
        let cur = 0;
        for (let item of list) {
            cur += item.days;
            if (passed < cur) return item;
        }
        return list[list.length - 1];
    };

    const yZokan = getZokanInfo(yShi, daysFromSetsuiri);
    const mZokan = getZokanInfo(mShi, daysFromSetsuiri);
    const dZokan = getZokanInfo(dShi, daysFromSetsuiri);

    // 陽占
    // 修正: 東・西・南・北は「本元（Main Zokan）」を使用する。
    // 中央のみ「月支の蔵干（節入り深さ考慮）」を使用する。
    const getMainZokan = (shi) => {
        const table = ZOKAN_TABLE[shi];
        return table[table.length - 1].gan; // 常に最後の要素(本元)を返す
    };

    const yousen = {
        north: getJudaiShusei(dGan, yGan), // 北: 年干
        south: getJudaiShusei(dGan, mGan), // 南: 月干
        // 東: 年支本元 (通常、陽占の東は年支蔵干の「本元」を使用)
        east: getJudaiShusei(dGan, getMainZokan(yShi)),
        // 西: 日支本元
        west: getJudaiShusei(dGan, getMainZokan(dShi)),
        // 中央: 月支蔵干 (節入り深さによる)
        center: getJudaiShusei(dGan, mZokan.gan),

        start: getJunidaiJusei(dGan, yShi),
        middle: getJunidaiJusei(dGan, mShi),
        end: getJunidaiJusei(dGan, dShi)
    };

    // 天中殺 & 宿命天中殺判定
    const myTenchu = calcTenchusatsu(dGan, dShi);
    const yearTenchu = calcTenchusatsu(yGan, yShi);

    const isSeinen = myTenchu.branches.includes(yShi);
    const isSeigetsu = myTenchu.branches.includes(mShi);
    const isSeijitsu = yearTenchu.branches.includes(dShi);
    const isNichiza = (dGan === "甲" && dShi === "戌") || (dGan === "乙" && dShi === "亥");
    const isNikkyo = (dGan === "甲" && dShi === "辰") || (dGan === "乙" && dShi === "巳");
    const isGokan = isSeinen && isSeijitsu;

    // 大運
    const isMale = gender === 'male';
    const isYGanYang = GAN.indexOf(yGan) % 2 === 0;
    const isForward = (isYGanYang && isMale) || (!isYGanYang && !isMale);

    // 立運
    let daysDiffTaiun = 0;
    const currentMonthSetsuiri = getSetsuiriMoment(year, month);
    let nextYear = year, nextMonth = month + 1;
    if (nextMonth > 12) { nextMonth = 1; nextYear++; }
    const nextMonthSetsuiri = getSetsuiriMoment(nextYear, nextMonth);
    let prevYear = year, prevMonth = month - 1;
    if (prevMonth < 1) { prevMonth = 12; prevYear--; }
    const prevMonthSetsuiri = getSetsuiriMoment(prevYear, prevMonth);

    if (isForward) {
        if (day >= currentMonthSetsuiri) {
            const daysInThisMonth = new Date(year, month, 0).getDate();
            daysDiffTaiun = (daysInThisMonth - day) + nextMonthSetsuiri;
        } else {
            daysDiffTaiun = currentMonthSetsuiri - day;
        }
    } else {
        if (day >= currentMonthSetsuiri) {
            daysDiffTaiun = day - currentMonthSetsuiri;
        } else {
            const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
            daysDiffTaiun = (daysInPrevMonth - prevMonthSetsuiri) + day;
        }
    }
    let ritsuun = Math.ceil(daysDiffTaiun / 3);
    if (ritsuun === 0) ritsuun = 1; if (ritsuun > 10) ritsuun = 10;

    const taiun = [];
    let currG = GAN.indexOf(mGan), currS = SHI.indexOf(mShi);
    for (let i = 0; i < 10; i++) {
        if (isForward) { currG = (currG + 1) % 10; currS = (currS + 1) % 12; }
        else { currG = (currG - 1 + 10) % 10; currS = (currS - 1 + 12) % 12; }
        const tg = GAN[currG], ts = SHI[currS];

        // 位相法チェック
        const westIsoho = getIsohoList(tg, ts, dGan, dShi);
        const centerIsoho = getIsohoList(tg, ts, mGan, mShi);
        const eastIsoho = getIsohoList(tg, ts, yGan, yShi);
        const isTenchu = myTenchu.branches.includes(ts);

        taiun.push({
            age: (i * 10) + ritsuun,
            eto: tg + ts,
            star: getJudaiShusei(dGan, tg),
            jusei: getJunidaiJusei(dGan, ts).name,
            west: westIsoho,
            center: centerIsoho,
            east: eastIsoho,
            isTenchu
        });
    }

    // 数理法 & 八門法
    const suriho = calculateSurihoAndHachimon(yGan, yShi, mGan, mShi, dGan, dShi);

    return {
        insen: {
            y: { gan: yGan, shi: yShi, zokan: yZokan },
            m: { gan: mGan, shi: mShi, zokan: mZokan },
            d: { gan: dGan, shi: dShi, zokan: dZokan },
        },
        yousen,
        taiun,
        suriho,
        tenchusatsu: {
            my: myTenchu.name,
            year: yearTenchu.name,
            isSeinen, isSeigetsu, isSeijitsu, isNichiza, isNikkyo, isGokan
        },
        ritsuun,
        isForward
    };
};

/**
 * ------------------------------------------------------------------
 * コンポーネント
 * ------------------------------------------------------------------
 */

export default function SanmeiFullApp() {
    const [date, setDate] = useState("1978-03-15");
    const [gender, setGender] = useState("male");
    const [tab, setTab] = useState("insen");

    const result = useMemo(() => {
        const [y, m, d] = date.split('-').map(Number);
        return calculateAll(y, m, d, gender);
    }, [date, gender]);

    return (
        <div className= "min-h-screen bg-stone-50 text-stone-800 font-sans pb-12" >
        <header className="bg-indigo-900 text-white p-4 shadow-lg sticky top-0 z-10" >
            <div className="max-w-4xl mx-auto flex items-center justify-between" >
                <div className="flex items-center gap-2" >
                    <Moon className="w-5 h-5 text-yellow-400" />
                        <h1 className="text-lg font-bold tracking-widest" > 算命学・数理法・天中殺 </h1>
                            </div>
                            </div>
                            </header>

                            < main className = "max-w-4xl mx-auto p-4 space-y-6" >
                                {/* Input */ }
                                < div className = "bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col sm:flex-row gap-4 items-center" >
                                    <div className="flex items-center gap-2 w-full sm:w-auto" >
                                        <Calendar className="w-5 h-5 text-indigo-500" />
                                            <input 
               type="date" value = { date } onChange = { e => setDate(e.target.value) }
    className = "bg-stone-50 border border-stone-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
        />
        </div>
        < div className = "flex gap-2 w-full sm:w-auto" >
            <button onClick={ () => setGender('female') } className = {`flex-1 px-4 py-2 rounded border ${gender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white text-stone-400'}`
}> 女性 </button>
    < button onClick = {() => setGender('male')} className = {`flex-1 px-4 py-2 rounded border ${gender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-stone-400'}`}> 男性 </button>
        </div>
        </div>

{/* Tab Nav */ }
<div className="flex overflow-x-auto border-b border-stone-200" >
{
    [
        { id: 'insen', label: '命式・天中殺', icon: Sun },
        { id: 'taiun', label: '大運表', icon: BookOpen },
        { id: 'suriho', label: '数理法・八門法', icon: Compass }
    ].map(t => (
        <button 
              key= { t.id }
              onClick = {() => setTab(t.id)}
className = {`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
    <t.icon className="w-4 h-4" />
        <span>{ t.label } </span>
        </button>
          ))}
</div>

{/* Content */ }
<div className="min-h-[400px]" >
    { tab === 'insen' && <InsenView data={ result } />}
{ tab === 'taiun' && <TaiunView data={ result } /> }
{ tab === 'suriho' && <SurihoView data={ result.suriho } /> }
</div>
    </main>
    </div>
  );
}

// ---------------- VIEWS ----------------

const InsenView = ({ data }) => (
    <div className= "space-y-8 animate-in fade-in slide-in-from-bottom-2" >

    {/* 宿命天中殺パネル */ }
    < section className = "bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden" >
        <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 font-bold text-stone-700 flex justify-between" >
            <span>天中殺・宿命 </span>
            < span className = "text-indigo-600 bg-white px-2 rounded border border-indigo-100" > { data.tenchusatsu.my }天中殺 </span>
                </div>
                < div className = "p-4" >
                    <div className="grid grid-cols-6 gap-2 text-center text-sm" >
                        <div className="font-bold text-stone-500" > 生日中殺 < br /> <span className="text-[10px]" > (西方) < /span></div >
                            <div className="font-bold text-stone-500" > 生月中殺 < br /> <span className="text-[10px]" > (中央) < /span></div >
                                <div className="font-bold text-stone-500" > 生年中殺 < br /> <span className="text-[10px]" > (東方) < /span></div >
                                    <div className="font-bold text-stone-500" > 日座中殺 </div>
                                        < div className = "font-bold text-stone-500" > 日居中殺 </div>
                                            < div className = "font-bold text-stone-500" > 互換中殺 </div>

                                                < StatusCircle active = { data.tenchusatsu.isSeijitsu } />
                                                    <StatusCircle active={ data.tenchusatsu.isSeigetsu } />
                                                        < StatusCircle active = { data.tenchusatsu.isSeinen } />
                                                            <StatusCircle active={ data.tenchusatsu.isNichiza } />
                                                                < StatusCircle active = { data.tenchusatsu.isNikkyo } />
                                                                    <StatusCircle active={ data.tenchusatsu.isGokan } />
                                                                        </div>
                                                                        </div>
                                                                        </section>

{/* 陰占 */ }
<section className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden" >
    <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 font-bold text-stone-700" > 陰占(Insen) </div>
        < div className = "p-6" >
            <div className="grid grid-cols-4 gap-4 text-center max-w-lg mx-auto" >
                <div className="text-xs text-stone-400 self-end pb-2" > </div>
                    < div className = "text-xs text-stone-400 pb-1" > 日柱 < br /> (自分) </div>
                        < div className = "text-xs text-stone-400 pb-1" > 月柱 < br /> (家系) </div>
                            < div className = "text-xs text-stone-400 pb-1" > 年柱 < br /> (ルーツ) </div>

                                < div className = "font-bold text-stone-500 text-sm flex items-center justify-end" > 天干 </div>
                                    < KanjiBox char = { data.insen.d.gan } />
                                        <KanjiBox char={ data.insen.m.gan } />
                                            < KanjiBox char = { data.insen.y.gan } />

                                                <div className="font-bold text-stone-500 text-sm flex items-center justify-end" > 地支 </div>
                                                    < KanjiBox char = { data.insen.d.shi } isTenchu = { data.tenchusatsu.my === "天中殺" } />
                                                        <KanjiBox char={ data.insen.m.shi } />
                                                            < KanjiBox char = { data.insen.y.shi } />

                                                                <div className="font-bold text-stone-500 text-sm flex items-center justify-end h-16" > 蔵干 < br /> <span className="text-[10px] font-normal" > (二十八元) < /span></div >
                                                                    <ZokanBox info={ data.insen.d.zokan } />
                                                                        < ZokanBox info = { data.insen.m.zokan } />
                                                                            <ZokanBox info={ data.insen.y.zokan } />
                                                                                </div>
                                                                                </div>
                                                                                </section>

{/* 陽占 */ }
<section className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden" >
    <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 font-bold text-stone-700" > 陽占(Yousen - 人体星図) </div>
        < div className = "p-6" >
            <div className="max-w-md mx-auto aspect-square grid grid-cols-3 gap-2" >
                {/* Top Row: - / North / Start */ }
                < div className = "flex items-center justify-center" > </div>
                    < StarCard title = { data.yousen.north } sub = "北 (親/目上)" color = "blue" />
                        <JuseiCard star={ data.yousen.start } pos = "初年期 (右上)" />

                            {/* Middle: West / Center / East */ }
                            < StarCard title = { data.yousen.west } sub = "西 (家庭)" color = "blue" />
                                <StarCard title={ data.yousen.center } sub = "中央 (自分)" color = "red" />
                                    <StarCard title={ data.yousen.east } sub = "東 (社会)" color = "blue" />

                                        {/* Bottom: End / South / Middle */ }
                                        < JuseiCard star = { data.yousen.end } pos = "晩年期 (左下)" />
                                            <StarCard title={ data.yousen.south } sub = "南 (子供/目下)" color = "blue" />
                                                <JuseiCard star={ data.yousen.middle } pos = "中年期 (右下)" />
                                                    </div>
                                                    </div>
                                                    </section>
                                                    </div>
);

const TaiunView = ({ data }) => (
    <div className= "bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden animate-in fade-in" >
    <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex justify-between items-center" >
        <h2 className="font-bold text-stone-700" > 大運(Taiun) </h2>
            < span className = "text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200" >
                { data.isForward ? "順行" : "逆行" } { data.ritsuun } 歳運
                    </span>
                    </div>
                    < div className = "overflow-x-auto" >
                        <table className="w-full text-sm text-left" >
                            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 text-xs uppercase" >
                                <tr>
                                <th className="px-4 py-3" > 年齢 </th>
                                    < th className = "px-4 py-3" > 干支 </th>
                                        < th className = "px-4 py-3" > 主星 </th>
                                            < th className = "px-4 py-3" > 従星 </th>
                                                < th className = "px-4 py-3 bg-red-50 text-red-800" > 西方 < br /> <span className="text-[9px]" > 日柱(結果) < /span></th >
                                                    <th className="px-4 py-3 bg-blue-50 text-blue-800" > 中央 < br /> <span className="text-[9px]" > 月柱(現在) < /span></th >
                                                        <th className="px-4 py-3 bg-green-50 text-green-800" > 東方 < br /> <span className="text-[9px]" > 年柱(未来) < /span></th >
                                                            <th className="px-4 py-3" > 天中殺 </th>
                                                                </tr>
                                                                </thead>
                                                                < tbody className = "divide-y divide-stone-100" >
                                                                {
                                                                    data.taiun.map((row, i) => (
                                                                        <tr key= { i } className = {`hover:bg-amber-50/50 ${row.isTenchu ? 'bg-stone-50' : ''}`} >
                                                                    <td className="px-4 py-3 font-medium text-stone-600" > { row.age }歳 ~</td>
                                                                        < td className = "px-4 py-3 font-bold" > { row.eto } </td>
                                                                            < td className = "px-4 py-3 text-stone-600" > { row.star } </td>
                                                                                < td className = "px-4 py-3 text-stone-600" > { row.jusei } </td>
{/* 位相法カラム */ }
<td className="px-4 py-3 text-red-700 font-medium text-xs" > { row.west || "-" } </td>
    < td className = "px-4 py-3 text-blue-700 font-medium text-xs" > { row.center || "-" } </td>
        < td className = "px-4 py-3 text-green-700 font-medium text-xs" > { row.east || "-" } </td>
{/* 天中殺 */ }
<td className="px-4 py-3 text-center" >
    { row.isTenchu && <span className="text-xs border border-stone-400 rounded px-1 text-stone-500"> 天中殺 </span> }
    </td>
    </tr>
          ))}
</tbody>
    </table>
    </div>
    < div className = "p-2 text-xs text-stone-400 bg-stone-50 border-t text-center" >
      ※ 西方 = 家庭・結果 / 中央=自分・現在 / 東方=仕事・社会・未来 との関係性
    </div>
    </div>
);

const SurihoView = ({ data }) => {
    const maxScore = Math.max(...Object.values(data.scores), 1);
    const getBarHeight = (score) => Math.max((score / maxScore) * 100, 5);

    return (
        <div className= "space-y-6 animate-in fade-in" >
        {/* Total Energy */ }
        < div className = "grid grid-cols-1 md:grid-cols-2 gap-4" >
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-6 rounded-xl shadow-md flex flex-col justify-center items-center" >
                <div className="text-indigo-200 text-sm font-medium mb-1" > 総エネルギー数 </div>
                    < div className = "text-5xl font-bold tracking-tight" > { data.totalEnergy } </div>
                        < div className = "text-indigo-300 text-xs mt-2" > 数理法による潜在エネルギー </div>
                            </div>

                            < div className = "bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col justify-center items-center" >
                                <div className="text-stone-500 text-sm font-medium mb-2" > 八門法による型 </div>
                                    < div className = "text-3xl font-bold text-stone-800 mb-1" > { data.mainType } </div>
                                        </div>
                                        </div>

                                        < div className = "grid grid-cols-1 lg:grid-cols-2 gap-6" >
                                            {/* 気図法 */ }
                                            < section className = "bg-white p-6 rounded-xl shadow-sm border border-stone-200" >
                                                <h3 className="font-bold text-stone-700 mb-6 flex items-center gap-2" >
                                                    <Activity className="w-4 h-4 text-green-600" /> 気図法(五行バランス)
                                                        </h3>
                                                        < div className = "flex items-end justify-between h-48 px-2" >
                                                        {
                                                            ['木', '火', '土', '金', '水'].map(g => (
                                                                <div key= { g } className = "flex flex-col items-center gap-2 w-1/6 group" >
                                                                <span className="text-xs font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6" >
                                                                { data.scores[g] }
                                                                </span>
                                                            < div 
                  className = {`w-full rounded-t-md transition-all duration-500 ${GOGYO_COLORS[g].split(' ')[0]}`}
    style = {{ height: `${getBarHeight(data.scores[g])}%` }
}
                />
    < div className = {`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${GOGYO_COLORS[g]}`}>
        { g }
        </div>
        </div>
            ))}
</div>
    </section>

{/* 八門法 */ }
<section className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative" >
    <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2" >
        <Target className="w-4 h-4 text-red-600" /> 八門法(能力適性)
            </h3>
            < div className = "relative w-full h-64 mx-auto max-w-xs" >
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-stone-200" />
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-stone-200" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-stone-100 rounded-full border border-stone-300 flex flex-col items-center justify-center z-10" >
                            <span className="text-[10px] text-stone-400" > 中央(財) </span>
                                < span className = "font-bold text-lg" > { data.hachimon.center } </span>
                                    </div>
                                    < div className = "absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center" >
                                        <span className="font-bold text-lg text-blue-700" > { data.hachimon.north } </span>
                                            < span className = "text-[10px] text-stone-400" > 北(印) </span>
                                                </div>
                                                < div className = "absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center" >
                                                    <span className="text-[10px] text-stone-400" > 南(漏) </span>
                                                        < span className = "font-bold text-lg text-red-700" > { data.hachimon.south } </span>
                                                            </div>
                                                            < div className = "absolute top-1/2 right-2 -translate-y-1/2 flex flex-col items-center" >
                                                                <span className="font-bold text-lg text-green-700" > { data.hachimon.east } </span>
                                                                    < span className = "text-[10px] text-stone-400" > 東(比) </span>
                                                                        </div>
                                                                        < div className = "absolute top-1/2 left-2 -translate-y-1/2 flex flex-col items-center" >
                                                                            <span className="font-bold text-lg text-stone-600" > { data.hachimon.west } </span>
                                                                                < span className = "text-[10px] text-stone-400" > 西(官) </span>
                                                                                    </div>
                                                                                    </div>
                                                                                    </section>
                                                                                    </div>
                                                                                    </div>
  );
};

// ---------------- UI PARTS ----------------

const StatusCircle = ({ active }) => (
    <div className= {`w-8 h-8 mx-auto rounded-full flex items-center justify-center border ${active ? 'bg-red-50 border-red-400 text-red-600' : 'bg-stone-50 border-stone-200 text-stone-300'}`}>
        { active? "〇": "ー" }
        </div>
);

const KanjiBox = ({ char }) => {
    const gogyo = GOGYO_MAP[char];
    const color = GOGYO_COLORS[gogyo] || "bg-gray-100";
    return (
        <div className= {`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg border ${color} mx-auto shadow-sm`
}>
    { char }
    </div>
  );
};

const ZokanBox = ({ info }) => {
    const gogyo = GOGYO_MAP[info.gan];
    const color = GOGYO_COLORS[gogyo] || "bg-gray-100";
    return (
        <div className= "flex flex-col items-center justify-center h-16" >
        <div className={ `w-10 h-10 flex items-center justify-center text-lg font-bold rounded-lg border mb-1 ${color}` }>
            { info.gan }
            </div>
            < div className = "text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200" >
                { info.type }
                </div>
                </div>
  );
};

const StarCard = ({ title, sub, color }) => {
    const isRed = color === 'red';
    return (
        <div className= {`flex flex-col items-center justify-center p-2 rounded-lg border-2 h-full transition-all hover:scale-[1.02]
      ${isRed ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-stone-200 text-stone-800'}`
}>
    <span className="font-bold text-sm sm:text-base" > { title } </span>
        < span className = "text-[10px] text-stone-400 mt-1" > { sub } </span>
            </div>
  );
};

const JuseiCard = ({ star, pos }) => (
    <div className= "flex flex-col items-center justify-center p-2 rounded-lg bg-stone-50 border border-stone-200 h-full text-stone-600" >
    <span className="font-bold text-sm sm:text-base" > { star.name } </span>
        < span className = "text-[10px] text-stone-400 mt-1" > { star.sub }({ star.score }点) </span>
            < span className = "text-[9px] text-stone-300 mt-0.5" > { pos } </span>
                </div>
);