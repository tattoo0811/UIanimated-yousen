#!/usr/bin/env node
/**
 * 算命学計算 CLIツール (スタンドアローン版)
 */

// --- 定数 ---

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 五行定義
const GOGYO_MAP = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
};

// 陰占算出用：二十八元表
const ZOKAN_TABLE = {
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

// 数理法用：蔵干表
const SURIHO_ZOKAN_TABLE = {
    '子': ['癸'],
    '丑': ['癸', '辛', '己'],
    '寅': ['戊', '丙', '甲'],
    '卯': ['乙'],
    '辰': ['乙', '癸', '戊'],
    '巳': ['戊', '庚', '丙'],
    '午': ['己', '丁'],
    '未': ['丁', '乙', '己'],
    '申': ['戊', '壬', '庚'],
    '酉': ['辛'],
    '戌': ['辛', '丁', '戊'],
    '亥': ['甲', '壬']
};

// 数理法用：十二大従星エネルギー点数表（修正済み）
const SURIHO_ENERGY_TABLE = {
    // 木性
    '甲': { '子': 7, '丑': 10, '寅': 11, '卯': 12, '辰': 8, '巳': 4, '午': 2, '未': 5, '申': 1, '酉': 3, '戌': 6, '亥': 9 },
    '乙': { '子': 4, '丑': 8, '寅': 12, '卯': 11, '辰': 10, '巳': 7, '午': 9, '未': 6, '申': 3, '酉': 1, '戌': 5, '亥': 2 },
    // 火性
    '丙': { '子': 3, '丑': 6, '寅': 9, '卯': 7, '辰': 10, '巳': 11, '午': 12, '未': 8, '申': 4, '酉': 2, '戌': 5, '亥': 1 },
    '丁': { '子': 1, '丑': 5, '寅': 2, '卯': 4, '辰': 8, '巳': 12, '午': 11, '未': 10, '申': 7, '酉': 9, '戌': 6, '亥': 3 },
    // 土性
    '戊': { '子': 3, '丑': 6, '寅': 9, '卯': 7, '辰': 10, '巳': 11, '午': 12, '未': 8, '申': 4, '酉': 2, '戌': 5, '亥': 1 },
    '己': { '子': 1, '丑': 5, '寅': 2, '卯': 4, '辰': 8, '巳': 12, '午': 11, '未': 10, '申': 7, '酉': 9, '戌': 6, '亥': 3 },
    // 金性
    '庚': { '子': 2, '丑': 5, '寅': 1, '卯': 3, '辰': 6, '巳': 9, '午': 7, '未': 10, '申': 11, '酉': 12, '戌': 8, '亥': 4 },
    '辛': { '子': 9, '丑': 6, '寅': 3, '卯': 1, '辰': 5, '巳': 2, '午': 4, '未': 8, '申': 12, '酉': 11, '戌': 10, '亥': 7 },
    // 水性
    '壬': { '子': 12, '丑': 8, '寅': 4, '卯': 2, '辰': 5, '巳': 1, '午': 3, '未': 6, '申': 9, '酉': 7, '戌': 10, '亥': 11 },
    '癸': { '子': 11, '丑': 10, '寅': 7, '卯': 9, '辰': 6, '巳': 3, '午': 1, '未': 5, '申': 2, '酉': 4, '戌': 8, '亥': 12 }
};

// 十二大従星リスト
const JUSEI_ORDER = [
    { name: "天報星", sub: "胎", score: 3 },
    { name: "天印星", sub: "養", score: 6 },
    { name: "天貴星", sub: "長生", score: 9 },
    { name: "天恍星", sub: "沐浴", score: 7 },
    { name: "天南星", sub: "冠帯", score: 10 },
    { name: "天禄星", sub: "建禄", score: 11 },
    { name: "天将星", sub: "帝旺", score: 12 },
    { name: "天堂星", sub: "衰", score: 8 },
    { name: "天胡星", sub: "病", score: 4 },
    { name: "天極星", sub: "死", score: 2 },
    { name: "天庫星", sub: "墓", score: 5 },
    { name: "天馳星", sub: "絶", score: 1 }
];

// 各日干から見た「胎（天報星）」となる十二支のインデックス
const TAI_INDEX = {
    "甲": 9, "乙": 8, "丙": 0, "丁": 11, "戊": 0,
    "己": 11, "庚": 3, "辛": 2, "壬": 6, "癸": 5
};

// 陰陽順逆
const IS_FORWARD_GAN = {
    "甲": true, "乙": false, "丙": true, "丁": false, "戊": true,
    "己": false, "庚": true, "辛": false, "壬": true, "癸": false
};

// 節入り日計算
const getSetsuiriMoment = (year, month) => {
    const baseDay = [6, 4, 6, 5, 6, 6, 7, 8, 8, 9, 8, 7];
    return baseDay[month - 1];
};

// 十二大従星算出
const getJunidaiJusei = (dayGan, shi) => {
    const shiIdx = SHI.indexOf(shi);
    const startShiIdx = TAI_INDEX[dayGan];
    const isForward = IS_FORWARD_GAN[dayGan];

    let distance;
    if (isForward) {
        distance = (shiIdx - startShiIdx + 12) % 12;
    } else {
        distance = (startShiIdx - shiIdx + 12) % 12;
    }
    return JUSEI_ORDER[distance];
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

// 数理法エネルギー計算（個数を掛ける）
const calculateSuriho = (yearGan, yearShi, monthGan, monthShi, dayGan, dayShi) => {
    // 1. 宿命の十二支リスト（重複を許容する）
    const multipliersBranches = [yearShi, monthShi, dayShi];

    // 2. 宿命内の全十干リストを作成
    const allStemsInDestiny = [];

    // 天干を追加
    allStemsInDestiny.push(yearGan, monthGan, dayGan);

    // 蔵干を追加（各支に含まれる全ての蔵干を展開）
    multipliersBranches.forEach(branch => {
        if (SURIHO_ZOKAN_TABLE[branch]) {
            allStemsInDestiny.push(...SURIHO_ZOKAN_TABLE[branch]);
        }
    });

    // 3. 各十干（甲〜癸）の個数をカウント
    const ganCounts = {};
    GAN.forEach(g => ganCounts[g] = 0);
    allStemsInDestiny.forEach(stem => {
        ganCounts[stem]++;
    });

    // 4. 計算実行
    const scores = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    const details = [];

    // 各十干について計算
    GAN.forEach(stem => {
        const count = ganCounts[stem];
        if (count === 0) return; // 宿命に存在しない十干はスキップ

        const gogyoType = GOGYO_MAP[stem];
        let baseScore = 0;

        // 3支との組み合わせで基本点数を計算
        multipliersBranches.forEach(branch => {
            const point = SURIHO_ENERGY_TABLE[stem]?.[branch] || 0;
            baseScore += point;
        });

        // 基本点数に個数を掛ける（これが重要！）
        const finalScore = baseScore * count;

        scores[gogyoType] += finalScore;

        details.push({
            stem,
            gogyo: gogyoType,
            branches: [...multipliersBranches],
            count: count,
            baseScore: baseScore,
            finalScore: finalScore
        });
    });

    const totalEnergy = Object.values(scores).reduce((a, b) => a + b, 0);

    return {
        total_energy: totalEnergy,
        gogyo_scores: scores,
        details: details
    };
};

// 命式全体計算
const calculateSanmei = (year, month, day, gender) => {
    const setsuiriDay = getSetsuiriMoment(year, month);

    // 1. 年月の補正
    let sanmeiYear = year;
    let sanmeiMonth = month;

    if (day < setsuiriDay) {
        if (month === 1) {
            sanmeiYear = year - 1;
            sanmeiMonth = 12;
        } else {
            sanmeiMonth = month - 1;
        }
    }

    // 2. 年干支
    let yOffset = (sanmeiYear - 1924) % 60;
    if (yOffset < 0) yOffset += 60;
    const yearGan = GAN[yOffset % 10];
    const yearShi = SHI[yOffset % 12];

    // 3. 月干支
    const yearGanIdx = GAN.indexOf(yearGan);
    const monthStartGanIdx = ((yearGanIdx % 5) * 2 + 2) % 10;
    const monthOffset = (sanmeiMonth + 10) % 12;
    const monthGan = GAN[(monthStartGanIdx + monthOffset) % 10];
    const monthShi = SHI[(monthOffset + 2) % 12];

    // 4. 日干支
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let dOffset = (10 + diffDays) % 60;
    if (dOffset < 0) dOffset += 60;
    const dayGan = GAN[dOffset % 10];
    const dayShi = SHI[dOffset % 12];

    // 5. 蔵干
    let daysFromSetsuiri = 0;
    if (day >= setsuiriDay) {
        daysFromSetsuiri = day - setsuiriDay;
    } else {
        // 前月の節入りからの日数 (概算)
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const daysInLastMonth = new Date(year, month - 1, 0).getDate();
        const lastSetsuiri = getSetsuiriMoment(lastYear, lastMonth);
        daysFromSetsuiri = (daysInLastMonth - lastSetsuiri) + day;
    }

    const getZokan = (shi, passedDays) => {
        const table = ZOKAN_TABLE[shi];
        let current = 0;
        for (let item of table) {
            current += item.days;
            if (passedDays < current) return item.gan;
        }
        return table[table.length - 1].gan;
    };

    const yearZokan = getZokan(yearShi, daysFromSetsuiri);
    const monthZokan = getZokan(monthShi, daysFromSetsuiri);
    const dayZokan = getZokan(dayShi, daysFromSetsuiri);

    // 6. 陽占構築
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

    // 7. 数理法（エネルギー）計算
    const suriho = calculateSuriho(yearGan, yearShi, monthGan, monthShi, dayGan, dayShi);

    // 8. 大運構築
    const isYearYang = GAN.indexOf(yearGan) % 2 === 0;
    const isMale = gender === 'male';
    const isForward = (isYearYang && isMale) || (!isYearYang && !isMale);

    // 立運計算（簡易版）
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
        } else {
            daysToSetsuiri = currentSetsuiri - day;
        }
    } else {
        if (day >= currentSetsuiri) {
            daysToSetsuiri = day - currentSetsuiri;
        } else {
            const daysLeftInPrevMonth = new Date(year, month - 1, 0).getDate() - prevSetsuiri;
            daysToSetsuiri = daysLeftInPrevMonth + day;
        }
    }

    let ritsuun = Math.ceil(daysToSetsuiri / 3);
    if (ritsuun < 1) ritsuun = 1;
    if (ritsuun > 10) ritsuun = 10;

    return {
        input: {
            date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            gender
        },
        insen: {
            year: { gan: yearGan, shi: yearShi, zokan: yearZokan },
            month: { gan: monthGan, shi: monthShi, zokan: monthZokan },
            day: { gan: dayGan, shi: dayShi, zokan: dayZokan },
            setsuiriDay
        },
        yousen,
        suriho,
        taiun: {
            isForward,
            ritsuun
        }
    };
};

// --- CLI実行部 ---

const args = process.argv.slice(2);

if (args.length < 2) {
    console.error("Usage: node calculate-energy.mjs <YYYY-MM-DD> <male|female>");
    process.exit(1);
}

const dateStr = args[0];
const genderStr = args[1];

if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
    console.error("Error: Date must be YYYY-MM-DD");
    process.exit(1);
}

if (genderStr !== 'male' && genderStr !== 'female') {
    console.error("Error: Gender must be 'male' or 'female'");
    process.exit(1);
}

const [y, m, d] = dateStr.split('-').map(Number);
const result = calculateSanmei(y, m, d, genderStr);

console.log(JSON.stringify(result, null, 2));
