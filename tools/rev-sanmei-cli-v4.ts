/**
 * 算命学計算 CLIツール (Sanmei Logic Core) v2.0
 * * 概要:
 * 生年月日と性別を入力とし、陰占・陽占・大運（位相法・天中殺込み）・数理法・八門法を計算して
 * 詳細なJSON形式で出力します。
 * * * 主な機能強化:
 * 1. 厳密な立運（大運開始年齢）計算
 * 2. 大運における位相法（散法・合法）および天中殺の判定
 * 3. 蔵干（二十八元）の初元・中元・本元の詳細算出
 * 4. 数理法・八門法の計算
 * * * 実行方法 (要: ts-node):
 * $ npx ts-node sanmei-cli.ts 1980-05-06 male
 */

// --- 型定義 ---

type Gender = 'male' | 'female';
type ZokanType = 'initial' | 'middle' | 'main';

interface ZokanCandidates {
    initial: string;
    middle?: string;
    main: string;
}

interface ZokanResult {
    selected: string;
    type: ZokanType;
    candidates: ZokanCandidates;
}

interface GanShi {
    gan: string;
    shi: string;
    zokan: ZokanResult;
}

interface Insen {
    year: GanShi;
    month: GanShi;
    day: GanShi;
    setsuiriDay: number;
}

interface Yousen {
    north: string;
    south: string;
    east: string;
    west: string;
    center: string;
    start: JuseiInfo;
    middle: JuseiInfo;
    end: JuseiInfo;
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
    west: string;   // 日柱との位相法
    center: string; // 月柱との位相法
    east: string;   // 年柱との位相法
    isTenchu: boolean;
}

interface TenchusatsuInfo {
    my: string;       // 自分の天中殺（日干支由来）
    year: string;     // 年干支の天中殺（親の天中殺）
    isSeinen: boolean;
    isSeigetsu: boolean;
    isSeijitsu: boolean;
    isNichiza: boolean;
    isNikkyo: boolean;
    isGokan: boolean;
}

interface SurihoResult {
    total_energy: number;
    gogyo_scores: Record<string, number>;
    hachimon: {
        north: number;
        south: number;
        east: number;
        west: number;
        center: number;
    };
    mainType: string; // 八門法の型
}

interface SanmeiResult {
    input: {
        date: string;
        gender: Gender;
    };
    insen: Insen;
    yousen: Yousen;
    tenchusatsu: TenchusatsuInfo;
    suriho: SurihoResult;
    taiun: {
        isForward: boolean;
        ritsuun: number;
        list: TaiunRow[];
    };
}

// --- 定数データ ---

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const GOGYO_MAP: Record<string, string> = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
    "寅": "木", "卯": "木", "巳": "火", "午": "火", "申": "金", "酉": "金", "亥": "水", "子": "水", "辰": "土", "未": "土", "戌": "土", "丑": "土"
};

// 二十八元表
const ZOKAN_TABLE: Record<string, { days: number; gan: string; type: string }[]> = {
    "子": [{ days: 10, gan: "壬", type: "初元" }, { days: 21, gan: "癸", type: "本元" }],
    "丑": [{ days: 9, gan: "癸", type: "初元" }, { days: 3, gan: "辛", type: "中元" }, { days: 19, gan: "己", type: "本元" }],
    "寅": [{ days: 7, gan: "戊", type: "初元" }, { days: 7, gan: "丙", type: "中元" }, { days: 17, gan: "甲", type: "本元" }],
    "卯": [{ days: 10, gan: "甲", type: "初元" }, { days: 21, gan: "乙", type: "本元" }],
    "辰": [{ days: 9, gan: "乙", type: "初元" }, { days: 3, gan: "癸", type: "中元" }, { days: 19, gan: "戊", type: "本元" }],
    "巳": [{ days: 5, gan: "戊", type: "初元" }, { days: 9, gan: "庚", type: "中元" }, { days: 17, gan: "丙", type: "本元" }],
    "午": [{ days: 10, gan: "丙", type: "初元" }, { days: 9, gan: "己", type: "中元" }, { days: 12, gan: "丁", type: "本元" }],
    "未": [{ days: 9, gan: "丁", type: "初元" }, { days: 3, gan: "乙", type: "中元" }, { days: 19, gan: "己", type: "本元" }],
    "申": [{ days: 7, gan: "戊", type: "初元" }, { days: 7, gan: "壬", type: "中元" }, { days: 17, gan: "庚", type: "本元" }],
    "酉": [{ days: 10, gan: "庚", type: "初元" }, { days: 21, gan: "辛", type: "本元" }],
    "戌": [{ days: 9, gan: "辛", type: "初元" }, { days: 3, gan: "丁", type: "中元" }, { days: 19, gan: "戊", type: "本元" }],
    "亥": [{ days: 7, gan: "甲", type: "初元" }, { days: 24, gan: "壬", type: "本元" }]
};

// 数理法用データ
const SURIHO_ZOKAN_TABLE: Record<string, string[]> = {
    '子': ['癸'], '丑': ['癸', '辛', '己'], '寅': ['戊', '丙', '甲'], '卯': ['乙'],
    '辰': ['乙', '癸', '戊'], '巳': ['戊', '庚', '丙'], '午': ['己', '丁'], '未': ['丁', '乙', '己'],
    '申': ['戊', '壬', '庚'], '酉': ['辛'], '戌': ['辛', '丁', '戊'], '亥': ['甲', '壬']
};

const SURIHO_ENERGY_TABLE: Record<string, Record<string, number>> = {
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

const JUSEI_ORDER: JuseiInfo[] = [
    { name: "天報星", sub: "胎", score: 3 }, { name: "天印星", sub: "養", score: 6 },
    { name: "天貴星", sub: "長生", score: 9 }, { name: "天恍星", sub: "沐浴", score: 7 },
    { name: "天南星", sub: "冠帯", score: 10 }, { name: "天禄星", sub: "建禄", score: 11 },
    { name: "天将星", sub: "帝旺", score: 12 }, { name: "天堂星", sub: "衰", score: 8 },
    { name: "天胡星", sub: "病", score: 4 }, { name: "天極星", sub: "死", score: 2 },
    { name: "天庫星", sub: "墓", score: 5 }, { name: "天馳星", sub: "絶", score: 1 }
];

const TAI_INDEX: Record<string, number> = { "甲": 9, "乙": 8, "丙": 0, "丁": 11, "戊": 0, "己": 11, "庚": 3, "辛": 2, "壬": 6, "癸": 5 };
const IS_FORWARD_GAN: Record<string, boolean> = { "甲": true, "乙": false, "丙": true, "丁": false, "戊": true, "己": false, "庚": true, "辛": false, "壬": true, "癸": false };

// --- 位相法データ ---

const SHI_CH_PAIRS: Record<string, string> = { // 対冲
    "子": "午", "丑": "未", "寅": "申", "卯": "酉", "辰": "戌", "巳": "亥",
    "午": "子", "未": "丑", "申": "寅", "酉": "卯", "戌": "辰", "亥": "巳"
};

const SHI_GO_PAIRS: Record<string, string> = { // 支合
    "子": "丑", "丑": "子", "寅": "亥", "亥": "寅", "卯": "戌", "戌": "卯",
    "辰": "酉", "酉": "辰", "巳": "申", "申": "巳", "午": "未", "未": "午"
};

const SHI_GAI_PAIRS: Record<string, string> = { // 害
    "子": "未", "未": "子", "丑": "午", "午": "丑", "寅": "巳", "巳": "寅",
    "卯": "辰", "辰": "卯", "申": "亥", "亥": "申", "酉": "戌", "戌": "酉"
};

const SHI_HA_PAIRS: Record<string, string> = { // 破
    "子": "酉", "酉": "子", "丑": "辰", "辰": "丑", "寅": "亥", "亥": "寅",
    "卯": "午", "午": "卯", "巳": "申", "申": "巳", "未": "戌", "戌": "未"
};

const SHI_KEI_PAIRS: Record<string, Array<{ target: string, label: string }>> = { // 刑
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

const SAN_GO_GROUPS = [ // 三合
    ["寅", "午", "戌"], // 火局
    ["巳", "酉", "丑"], // 金局
    ["申", "子", "辰"], // 水局
    ["亥", "卯", "未"]  // 木局
];

// --- ヘルパー関数 ---

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

// 蔵干算出ロジック
const getZokanData = (shi: string, passedDays: number): ZokanResult => {
    const table = ZOKAN_TABLE[shi];

    // 候補リスト
    let candidates: ZokanCandidates;
    if (table.length === 2) {
        candidates = { initial: table[0].gan, main: table[1].gan };
    } else {
        candidates = { initial: table[0].gan, middle: table[1].gan, main: table[2].gan };
    }

    // 採用蔵干
    let current = 0;
    let selectedGan = table[table.length - 1].gan;
    let selectedType: ZokanType = 'main';

    for (let i = 0; i < table.length; i++) {
        current += table[i].days;
        if (passedDays < current) {
            selectedGan = table[i].gan;
            if (table.length === 2) {
                selectedType = i === 0 ? 'initial' : 'main';
            } else {
                selectedType = i === 0 ? 'initial' : (i === 1 ? 'middle' : 'main');
            }
            break;
        }
    }

    return { selected: selectedGan, type: selectedType, candidates };
};

// 位相法リスト取得
const getIsohoList = (tGan: string, tShi: string, rGan: string, rShi: string): string => {
    const list: string[] = [];
    const tGanIdx = GAN.indexOf(tGan);
    const rGanIdx = GAN.indexOf(rGan);

    const ganDiff = Math.abs(tGanIdx - rGanIdx);
    const isGanKoku = (ganDiff === 4 || ganDiff === 6); // 七殺
    const isGanSame = (tGan === rGan); // 比和
    const isGanGou = (ganDiff === 5); // 干合

    const isShiChu = (SHI_CH_PAIRS[tShi] === rShi); // 対冲

    if (isGanKoku && isShiChu) list.push("天剋地冲");
    else if (isShiChu) list.push("対冲");

    if (isGanSame && isShiChu) list.push("納音");
    if (isGanSame && tShi === rShi) list.push("律音");

    if (isGanGou) {
        if (SHI_GO_PAIRS[tShi] === rShi) list.push("干合支合");
        else if (SHI_GAI_PAIRS[tShi] === rShi) list.push("干合支害");
        else list.push("干合");
    }

    if (SHI_GO_PAIRS[tShi] === rShi && !list.includes("干合支合")) list.push("支合");

    if (SHI_KEI_PAIRS[tShi]) {
        const kei = SHI_KEI_PAIRS[tShi].find(k => k.target === rShi);
        if (kei) list.push(kei.label);
    }

    if (SHI_GAI_PAIRS[tShi] === rShi && !list.includes("干合支害")) list.push("害");

    if (SHI_HA_PAIRS[tShi] === rShi && !isShiChu) list.push("破");

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
const calcTenchusatsu = (gan: string, shi: string) => {
    const gIdx = GAN.indexOf(gan);
    const sIdx = SHI.indexOf(shi);
    let diff = (gIdx - sIdx);
    if (diff < 0) diff += 12;

    if (diff === 0) return { name: "戌亥", branches: ["戌", "亥"] };
    if (diff === 2) return { name: "子丑", branches: ["子", "丑"] };
    if (diff === 4) return { name: "寅卯", branches: ["寅", "卯"] };
    if (diff === 6) return { name: "辰巳", branches: ["辰", "巳"] };
    if (diff === 8) return { name: "午未", branches: ["午", "未"] };
    return { name: "申酉", branches: ["申", "酉"] };
};

// 数理法・八門法計算
const calculateSurihoAndHachimon = (yearGan: string, yearShi: string, monthGan: string, monthShi: string, dayGan: string, dayShi: string): SurihoResult => {
    const multipliersBranches = [yearShi, monthShi, dayShi];
    const targetStems = [yearGan, monthGan, dayGan];
    multipliersBranches.forEach(branch => {
        if (SURIHO_ZOKAN_TABLE[branch]) targetStems.push(...SURIHO_ZOKAN_TABLE[branch]);
    });

    const scores: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
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
    const maxScore = values[0].score;
    // 同点処理などは簡易的に先頭を採用
    const mainType = values.filter(v => v.score === maxScore).map(t => t.type).join('・');

    return { total_energy: totalEnergy, gogyo_scores: scores, hachimon, mainType };
};

// メイン計算
const calculateSanmei = (year: number, month: number, day: number, gender: Gender): SanmeiResult => {
    const setsuiriDay = getSetsuiriMoment(year, month);

    let sYear = year;
    let sMonth = month;

    if (day < setsuiriDay) {
        if (month === 1) { sYear = year - 1; sMonth = 12; }
        else { sMonth = month - 1; }
    }

    // 年干支
    let yOffset = (sYear - 1924) % 60;
    if (yOffset < 0) yOffset += 60;
    const yearGan = GAN[yOffset % 10];
    const yearShi = SHI[yOffset % 12];

    // 月干支
    const yGanIdx = GAN.indexOf(yearGan);
    const mStart = ((yGanIdx % 5) * 2 + 2) % 10;
    const mOffset = (sMonth + 10) % 12;
    const monthGan = GAN[(mStart + mOffset) % 10];
    const monthShi = SHI[(mOffset + 2) % 12];

    // 日干支
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let dOffset = (10 + diffDays) % 60;
    if (dOffset < 0) dOffset += 60;
    const dayGan = GAN[dOffset % 10];
    const dayShi = SHI[dOffset % 12];

    // 蔵干計算
    let daysFromSetsuiri = 0;
    if (day >= setsuiriDay) {
        daysFromSetsuiri = day - setsuiriDay;
    } else {
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const daysInLastMonth = new Date(year, month - 1, 0).getDate(); // last month of prev year if month=1? No, logic is simple
        const prevMonthIdx = month - 1; // 0-11
        // Actually simpler:
        let pY = year, pM = month - 1;
        if (pM < 1) { pM = 12; pY--; }
        const prevSetsuiri = getSetsuiriMoment(pY, pM);
        // Days in PREVIOUS month
        const daysInPrev = new Date(year, month - 1, 0).getDate(); // month is 1-based. 0 is last day of prev month.
        daysFromSetsuiri = (daysInPrev - prevSetsuiri) + day;
    }

    const yearZokan = getZokanData(yearShi, daysFromSetsuiri);
    const monthZokan = getZokanData(monthShi, daysFromSetsuiri);
    const dayZokan = getZokanData(dayShi, daysFromSetsuiri);

    // 陽占
    const yousen: Yousen = {
        north: getJudaiShusei(dayGan, yearGan),
        south: getJudaiShusei(dayGan, monthGan),
        east: getJudaiShusei(dayGan, yearZokan.selected),
        west: getJudaiShusei(dayGan, dayZokan.selected),
        center: getJudaiShusei(dayGan, monthZokan.selected),
        start: getJunidaiJusei(dayGan, yearShi),
        middle: getJunidaiJusei(dayGan, monthShi),
        end: getJunidaiJusei(dayGan, dayShi)
    };

    // 天中殺
    const myTenchu = calcTenchusatsu(dayGan, dayShi);
    const yearTenchu = calcTenchusatsu(yearGan, yearShi);
    const tenchusatsu: TenchusatsuInfo = {
        my: myTenchu.name,
        year: yearTenchu.name,
        isSeinen: myTenchu.branches.includes(yearShi),
        isSeigetsu: myTenchu.branches.includes(monthShi),
        isSeijitsu: yearTenchu.branches.includes(dayShi),
        isNichiza: (dayGan === "甲" && dayShi === "戌") || (dayGan === "乙" && dayShi === "亥"),
        isNikkyo: (dayGan === "甲" && dayShi === "辰") || (dayGan === "乙" && dayShi === "巳"),
        isGokan: myTenchu.branches.includes(yearShi) && yearTenchu.branches.includes(dayShi) // 互換中殺
    };

    // 大運
    const isYearYang = GAN.indexOf(yearGan) % 2 === 0;
    const isMale = gender === 'male';
    let isForward = (isYearYang && isMale) || (!isYearYang && !isMale);

    // 立運計算
    let daysDiffTaiun = 0;
    const currentMonthSetsuiri = getSetsuiriMoment(year, month);
    let nextY = year, nextM = month + 1;
    if (nextM > 12) { nextM = 1; nextY++; }
    const nextMonthSetsuiri = getSetsuiriMoment(nextY, nextM);
    let prevY = year, prevM = month - 1;
    if (prevM < 1) { prevM = 12; prevY--; }
    const prevMonthSetsuiri = getSetsuiriMoment(prevY, prevM);

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
    if (ritsuun === 0) ritsuun = 1;
    if (ritsuun > 10) ritsuun = 10;

    const taiunList: TaiunRow[] = [];
    let currGanIdx = GAN.indexOf(monthGan);
    let currShiIdx = SHI.indexOf(monthShi);

    for (let i = 0; i < 10; i++) {
        if (isForward) {
            currGanIdx = (currGanIdx + 1) % 10;
            currShiIdx = (currShiIdx + 1) % 12;
        } else {
            currGanIdx = (currGanIdx - 1 + 10) % 10;
            currShiIdx = (currShiIdx - 1 + 12) % 12;
        }
        const tGan = GAN[currGanIdx];
        const tShi = SHI[currShiIdx];

        // 位相法
        const westIsoho = getIsohoList(tGan, tShi, dayGan, dayShi);
        const centerIsoho = getIsohoList(tGan, tShi, monthGan, monthShi);
        const eastIsoho = getIsohoList(tGan, tShi, yearGan, yearShi);
        const isTenchu = myTenchu.branches.includes(tShi);

        taiunList.push({
            age: (i * 10) + ritsuun,
            eto: tGan + tShi,
            gan: tGan,
            shi: tShi,
            star: getJudaiShusei(dayGan, tGan),
            jusei: getJunidaiJusei(dayGan, tShi).name,
            west: westIsoho,
            center: centerIsoho,
            east: eastIsoho,
            isTenchu
        });
    }

    // 数理法
    const suriho = calculateSurihoAndHachimon(yearGan, yearShi, monthGan, monthShi, dayGan, dayShi);

    return {
        input: { date: `${year}-${month}-${day}`, gender },
        insen: {
            year: { gan: yearGan, shi: yearShi, zokan: yearZokan },
            month: { gan: monthGan, shi: monthShi, zokan: monthZokan },
            day: { gan: dayGan, shi: dayShi, zokan: dayZokan },
            setsuiriDay
        },
        yousen,
        tenchusatsu,
        suriho,
        taiun: {
            isForward,
            ritsuun,
            list: taiunList
        }
    };
};

// --- CLI実行部 ---

const main = () => {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error("Usage: npx ts-node sanmei-cli.ts <YYYY-MM-DD> <male|female>");
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
    const result = calculateSanmei(y, m, d, genderStr as Gender);

    // JSON出力
    console.log(JSON.stringify(result, null, 2));
};

if (require.main === module) {
    main();
}

export { calculateSanmei, SanmeiResult };