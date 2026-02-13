import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar, Info, Moon, Sun, BookOpen, Star,
    Activity, Compass, ChevronRight, ChevronLeft, Target
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

// 陰占算出用：二十八元表（初元、中元、本元の日数配分と干）
const ZOKAN_TABLE = {
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

// 数理法用：全蔵干リスト
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

// 数理法エネルギー点数表 (PDF 201804_数理法_rev2.0.2.pdf より)
// (天干, 地支) -> 点数
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

// 十二大従星
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

// 「胎」の起点となる十二支インデックス
const TAI_INDEX = {
    "甲": 9, "乙": 8, "丙": 0, "丁": 11, "戊": 0, "己": 11, "庚": 3, "辛": 2, "壬": 6, "癸": 5
};

// 陰陽順逆
const IS_FORWARD_GAN = {
    "甲": true, "乙": false, "丙": true, "丁": false, "戊": true,
    "己": false, "庚": true, "辛": false, "壬": true, "癸": false
};

// 節入り日計算（簡易）
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

    const dayEl = Math.floor(dayIdx / 2);
    const tgtEl = Math.floor(targetIdx / 2);

    const dayPol = dayIdx % 2; // 0:陽, 1:陰
    const tgtPol = targetIdx % 2;
    const isSame = dayPol === tgtPol;

    const diff = (tgtEl - dayEl + 5) % 5;

    if (diff === 0) return isSame ? "貫索星" : "石門星";
    if (diff === 1) return isSame ? "鳳閣星" : "調舒星";
    if (diff === 2) return isSame ? "禄存星" : "司禄星";
    if (diff === 3) return isSame ? "車騎星" : "牽牛星";
    if (diff === 4) return isSame ? "龍高星" : "玉堂星";
    return "不明";
};

// 数理法・八門法計算ロジック
const calculateSurihoAndHachimon = (yearGan, yearShi, monthGan, monthShi, dayGan, dayShi) => {
    // 1. 数理法
    const multipliersBranches = [yearShi, monthShi, dayShi];
    const targetStems = [yearGan, monthGan, dayGan];

    multipliersBranches.forEach(branch => {
        if (SURIHO_ZOKAN_TABLE[branch]) {
            targetStems.push(...SURIHO_ZOKAN_TABLE[branch]);
        }
    });

    const scores = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

    targetStems.forEach(stem => {
        const gogyo = GOGYO_MAP[stem];
        multipliersBranches.forEach(branch => {
            const point = SURIHO_ENERGY_TABLE[stem]?.[branch] || 0;
            scores[gogyo] += point;
        });
    });

    const totalEnergy = Object.values(scores).reduce((a, b) => a + b, 0);

    // 2. 八門法 (Personal Chart)
    // 日干の五行を基準に配置を決める
    // 北: 生じる(印), 東: 比和(比), 南: 生じる(漏), 西: 剋される(官), 中: 剋す(財)
    const dayGogyo = GOGYO_MAP[dayGan];
    const gogyoTypes = ['木', '火', '土', '金', '水'];
    const dayGogyoIdx = gogyoTypes.indexOf(dayGogyo); // 0:木 ... 4:水

    // 五行インデックス差分: 相手 - 自分 (+5 %5)
    // 0:比和(東), 1:漏(南), 2:財(中), 3:官(西), 4:印(北)

    const hachimon = {
        north: 0, south: 0, east: 0, west: 0, center: 0
    };

    gogyoTypes.forEach((type, idx) => {
        const diff = (idx - dayGogyoIdx + 5) % 5;
        const score = scores[type];
        if (diff === 0) hachimon.east = score;   // 守備（東）
        if (diff === 1) hachimon.south = score;  // 伝達（南）
        if (diff === 2) hachimon.center = score; // 魅力（中央）
        if (diff === 3) hachimon.west = score;   // 攻撃（西）
        if (diff === 4) hachimon.north = score;  // 習得（北）
    });

    // 型の判定
    const values = [
        { dir: '北', score: hachimon.north, type: '玄武型' },
        { dir: '南', score: hachimon.south, type: '朱雀型' },
        { dir: '東', score: hachimon.east, type: '青龍型' },
        { dir: '西', score: hachimon.west, type: '白虎型' },
        { dir: '中', score: hachimon.center, type: '騰蛇型' }
    ];
    // スコアの降順、同点なら優先順位ロジックが必要だが簡易的に最大値
    values.sort((a, b) => b.score - a.score);
    const maxScore = values[0].score;
    const topTypes = values.filter(v => v.score === maxScore);
    const mainType = topTypes.map(t => t.type).join('・');

    return { scores, totalEnergy, hachimon, mainType };
};

/**
 * ------------------------------------------------------------------
 * メイン計算ロジック
 * ------------------------------------------------------------------
 */

const calculateAll = (year, month, day, gender) => {
    const setsuiriDay = getSetsuiriMoment(year, month);

    let sYear = year;
    let sMonth = month;

    if (day < setsuiriDay) {
        if (month === 1) { sYear = year - 1; sMonth = 12; }
        else { sMonth = month - 1; }
    }

    // 干支算出
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

    // 日干支
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate - baseDate) / 86400000);
    let dOffset = (10 + diffDays) % 60; if (dOffset < 0) dOffset += 60;
    const dGan = GAN[dOffset % 10];
    const dShi = SHI[dOffset % 12];

    // 蔵干算出 (節入り経過日数)
    let daysFromSetsuiri = 0;
    if (day >= setsuiriDay) {
        daysFromSetsuiri = day - setsuiriDay;
    } else {
        // 前月の節入りからの日数
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
    const yousen = {
        north: getJudaiShusei(dGan, yGan),
        south: getJudaiShusei(dGan, mGan),
        east: getJudaiShusei(dGan, yZokan.gan),
        west: getJudaiShusei(dGan, dZokan.gan),
        center: getJudaiShusei(dGan, mZokan.gan),
        start: getJunidaiJusei(dGan, yShi),
        middle: getJunidaiJusei(dGan, mShi),
        end: getJunidaiJusei(dGan, dShi)
    };

    // 大運
    // 陽年(甲丙戊庚壬)生まれの男性、陰年(乙丁己辛癸)生まれの女性 → 順行
    // 陰年生まれの男性、陽年生まれの女性 → 逆行
    const isMale = gender === 'male';
    const isYGanYang = GAN.indexOf(yGan) % 2 === 0;
    const isForward = (isYGanYang && isMale) || (!isYGanYang && !isMale);

    // ===== 立運（大運の開始年齢）計算 =====
    // 基本ルール: 日数差 ÷ 3 = 立運（小数点以下切り上げ）
    //
    // 【順行の場合】
    //   誕生日から「次の節入り日」までの日数を計算
    //   - 節入り後生まれ: 当月末日までの日数 + 翌月節入り日
    //   - 節入り前生まれ: 当月の節入り日 - 誕生日
    //
    // 【逆行の場合】
    //   誕生日から「前の節入り日」までの日数を計算
    //   - 節入り後生まれ: 誕生日 - 当月の節入り日
    //   - 節入り前生まれ: 前月末日 - 前月節入り日 + 誕生日

    const currentSetsuiri = getSetsuiriMoment(year, month);

    // 翌月の節入り日（年をまたぐ場合に対応）
    let nextY = year, nextM = month + 1;
    if (nextM > 12) { nextM = 1; nextY++; }
    const nextSetsuiri = getSetsuiriMoment(nextY, nextM);

    // 前月の節入り日（年をまたぐ場合に対応）
    let prevY = year, prevM = month - 1;
    if (prevM < 1) { prevM = 12; prevY--; }
    const prevSetsuiri = getSetsuiriMoment(prevY, prevM);

    let daysToSetsuiri = 0;

    if (isForward) {
        // 順行: 誕生日 → 次の節入り日
        if (day >= currentSetsuiri) {
            // 節入り後生まれ: 当月の残り日数 + 翌月の節入り日
            const daysLeftInMonth = new Date(year, month, 0).getDate() - day;
            daysToSetsuiri = daysLeftInMonth + nextSetsuiri;
        } else {
            // 節入り前生まれ: 当月の節入り日まで
            daysToSetsuiri = currentSetsuiri - day;
        }
    } else {
        // 逆行: 誕生日 → 前の節入り日
        if (day >= currentSetsuiri) {
            // 節入り後生まれ: 当月の節入り日から誕生日まで
            daysToSetsuiri = day - currentSetsuiri;
        } else {
            // 節入り前生まれ: 前月の残り日数 + 誕生日
            const daysLeftInPrevMonth = new Date(year, month - 1, 0).getDate() - prevSetsuiri;
            daysToSetsuiri = daysLeftInPrevMonth + day;
        }
    }

    // 立運 = 日数差 ÷ 3（小数点以下切り上げ、最小1歳、最大10歳）
    let ritsuun = Math.ceil(daysToSetsuiri / 3);
    if (ritsuun < 1) ritsuun = 1;
    if (ritsuun > 10) ritsuun = 10;

    const taiun = [];
    let currG = GAN.indexOf(mGan);
    let currS = SHI.indexOf(mShi);

    for (let i = 0; i < 10; i++) {
        if (isForward) { currG = (currG + 1) % 10; currS = (currS + 1) % 12; }
        else { currG = (currG - 1 + 10) % 10; currS = (currS - 1 + 12) % 12; }

        const tg = GAN[currG];
        const ts = SHI[currS];
        taiun.push({
            age: (i * 10) + ritsuun,
            eto: tg + ts,
            star: getJudaiShusei(dGan, tg),
            jusei: getJunidaiJusei(dGan, ts).name
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
    const [date, setDate] = useState("1995-06-15");
    const [gender, setGender] = useState("female");
    const [tab, setTab] = useState("insen"); // insen | taiun | suriho

    const result = useMemo(() => {
        const [y, m, d] = date.split('-').map(Number);
        return calculateAll(y, m, d, gender);
    }, [date, gender]);

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-12">
            <header className="bg-indigo-900 text-white p-4 shadow-lg sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-yellow-400" />
                        <h1 className="text-lg font-bold tracking-widest">算命学・数理法 命式詳解</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Input */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <input
                            type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="bg-stone-50 border border-stone-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => setGender('female')} className={`flex-1 px-4 py-2 rounded border ${gender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white text-stone-400'}`}>女性</button>
                        <button onClick={() => setGender('male')} className={`flex-1 px-4 py-2 rounded border ${gender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-stone-400'}`}>男性</button>
                    </div>
                </div>

                {/* Tab Nav */}
                <div className="flex border-b border-stone-200">
                    {[
                        { id: 'insen', label: '命式 (陰占/陽占)', icon: Sun },
                        { id: 'taiun', label: '大運表', icon: BookOpen },
                        { id: 'suriho', label: '数理法・八門法', icon: Compass }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${tab === t.id ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            <t.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {tab === 'insen' && <InsenView data={result} />}
                    {tab === 'taiun' && <TaiunView data={result} />}
                    {tab === 'suriho' && <SurihoView data={result.suriho} />}
                </div>
            </main>
        </div>
    );
}

// ---------------- VIEWS ----------------

const InsenView = ({ data }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        {/* 陰占 */}
        <section className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 font-bold text-stone-700">陰占 (Insen)</div>
            <div className="p-6">
                <div className="grid grid-cols-4 gap-4 text-center max-w-lg mx-auto">
                    <div className="text-xs text-stone-400 self-end pb-2"></div>
                    <div className="text-xs text-stone-400 pb-1">日柱<br />(自分)</div>
                    <div className="text-xs text-stone-400 pb-1">月柱<br />(家系)</div>
                    <div className="text-xs text-stone-400 pb-1">年柱<br />(ルーツ)</div>

                    <div className="font-bold text-stone-500 text-sm flex items-center justify-end">天干</div>
                    <KanjiBox char={data.insen.d.gan} />
                    <KanjiBox char={data.insen.m.gan} />
                    <KanjiBox char={data.insen.y.gan} />

                    <div className="font-bold text-stone-500 text-sm flex items-center justify-end">地支</div>
                    <KanjiBox char={data.insen.d.shi} />
                    <KanjiBox char={data.insen.m.shi} />
                    <KanjiBox char={data.insen.y.shi} />

                    <div className="font-bold text-stone-500 text-sm flex items-center justify-end h-16">蔵干<br /><span className="text-[10px] font-normal">(二十八元)</span></div>
                    <ZokanBox info={data.insen.d.zokan} />
                    <ZokanBox info={data.insen.m.zokan} />
                    <ZokanBox info={data.insen.y.zokan} />
                </div>
            </div>
        </section>

        {/* 陽占 */}
        <section className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 font-bold text-stone-700">陽占 (Yousen - 人体星図)</div>
            <div className="p-6">
                <div className="max-w-md mx-auto aspect-square grid grid-cols-3 gap-2">
                    {/* Top Row: - / North / Start */}
                    <div className="flex items-center justify-center"></div>
                    <StarCard title={data.yousen.north} sub="北 (親/目上)" color="blue" />
                    <JuseiCard star={data.yousen.start} pos="初年期 (右上)" />

                    {/* Middle: West / Center / East */}
                    <StarCard title={data.yousen.west} sub="西 (家庭)" color="blue" />
                    <StarCard title={data.yousen.center} sub="中央 (自分)" color="red" />
                    <StarCard title={data.yousen.east} sub="東 (社会)" color="blue" />

                    {/* Bottom: End / South / Middle */}
                    <JuseiCard star={data.yousen.end} pos="晩年期 (左下)" />
                    <StarCard title={data.yousen.south} sub="南 (子供/目下)" color="blue" />
                    <JuseiCard star={data.yousen.middle} pos="中年期 (右下)" />
                </div>
            </div>
        </section>
    </div>
);

const TaiunView = ({ data }) => (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden animate-in fade-in">
        <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex justify-between items-center">
            <h2 className="font-bold text-stone-700">大運 (Taiun)</h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200">
                {data.isForward ? "順行" : "逆行"} {data.ritsuun}歳運
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                    <tr>
                        <th className="px-4 py-3">年齢</th>
                        <th className="px-4 py-3">干支</th>
                        <th className="px-4 py-3">主星</th>
                        <th className="px-4 py-3">従星</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {data.taiun.map((row, i) => (
                        <tr key={i} className="hover:bg-amber-50/50">
                            <td className="px-4 py-3 font-medium text-stone-600">{row.age}歳 ~</td>
                            <td className="px-4 py-3 font-bold">{row.eto}</td>
                            <td className="px-4 py-3 text-stone-600">{row.star}</td>
                            <td className="px-4 py-3 text-stone-600">{row.jusei}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const SurihoView = ({ data }) => {
    // Chart calculation
    const maxScore = Math.max(...Object.values(data.scores), 1);
    const getBarHeight = (score) => Math.max((score / maxScore) * 100, 5); // min 5%

    return (
        <div className="space-y-6 animate-in fade-in">

            {/* Total Energy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-6 rounded-xl shadow-md flex flex-col justify-center items-center">
                    <div className="text-indigo-200 text-sm font-medium mb-1">総エネルギー数</div>
                    <div className="text-5xl font-bold tracking-tight">{data.totalEnergy}</div>
                    <div className="text-indigo-300 text-xs mt-2">数理法による潜在エネルギー</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col justify-center items-center">
                    <div className="text-stone-500 text-sm font-medium mb-2">八門法による型</div>
                    <div className="text-3xl font-bold text-stone-800 mb-1">{data.mainType}</div>
                    <div className="text-xs text-stone-400 text-center px-4">
                        最も数値が高い方向性の生き方が、あなたの宿命に合っています。
                    </div>
                </div>
            </div>

            {/* 2 Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 気図法 (Natural Chart) */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="font-bold text-stone-700 mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-600" /> 気図法 (五行バランス)
                    </h3>
                    <div className="flex items-end justify-between h-48 px-2">
                        {['木', '火', '土', '金', '水'].map(g => (
                            <div key={g} className="flex flex-col items-center gap-2 w-1/6 group">
                                <span className="text-xs font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6">
                                    {data.scores[g]}
                                </span>
                                <div
                                    className={`w-full rounded-t-md transition-all duration-500 ${GOGYO_COLORS[g].split(' ')[0]}`}
                                    style={{ height: `${getBarHeight(data.scores[g])}%` }}
                                />
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${GOGYO_COLORS[g]}`}>
                                    {g}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-xs text-stone-400 text-center">
                        北=水, 南=火, 東=木, 西=金, 中=土 として配置した自然界の分布
                    </div>
                </section>

                {/* 八門法 (Personal Chart) */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative">
                    <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-red-600" /> 八門法 (能力適性)
                    </h3>

                    <div className="relative w-full h-64 mx-auto max-w-xs">
                        {/* Cross Lines */}
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-stone-200" />
                        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-stone-200" />

                        {/* Center */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-stone-100 rounded-full border border-stone-300 flex flex-col items-center justify-center z-10">
                            <span className="text-[10px] text-stone-400">中央(財)</span>
                            <span className="font-bold text-lg">{data.hachimon.center}</span>
                        </div>

                        {/* North */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="font-bold text-lg text-blue-700">{data.hachimon.north}</span>
                            <span className="text-[10px] text-stone-400">北(印/習得)</span>
                        </div>

                        {/* South */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="text-[10px] text-stone-400">南(漏/伝達)</span>
                            <span className="font-bold text-lg text-red-700">{data.hachimon.south}</span>
                        </div>

                        {/* East */}
                        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col items-center">
                            <span className="font-bold text-lg text-green-700">{data.hachimon.east}</span>
                            <span className="text-[10px] text-stone-400">東(比/守備)</span>
                        </div>

                        {/* West */}
                        <div className="absolute top-1/2 left-2 -translate-y-1/2 flex flex-col items-center">
                            <span className="font-bold text-lg text-stone-600">{data.hachimon.west}</span>
                            <span className="text-[10px] text-stone-400">西(官/攻撃)</span>
                        </div>
                    </div>

                    <div className="mt-2 text-xs text-stone-400 text-center">
                        ※ 日干を基準にしたエネルギー配置
                    </div>
                </section>
            </div>
        </div>
    );
};

// ---------------- UI PARTS ----------------

const KanjiBox = ({ char }) => {
    const gogyo = GOGYO_MAP[char];
    const color = GOGYO_COLORS[gogyo] || "bg-gray-100";
    return (
        <div className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg border ${color} mx-auto shadow-sm`}>
            {char}
        </div>
    );
};

const ZokanBox = ({ info }) => {
    const gogyo = GOGYO_MAP[info.gan];
    const color = GOGYO_COLORS[gogyo] || "bg-gray-100";
    return (
        <div className="flex flex-col items-center justify-center h-16">
            <div className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-lg border mb-1 ${color}`}>
                {info.gan}
            </div>
            <div className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">
                {info.type}
            </div>
        </div>
    );
};

const StarCard = ({ title, sub, color }) => {
    const isRed = color === 'red';
    return (
        <div className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 h-full transition-all hover:scale-[1.02]
      ${isRed ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-stone-200 text-stone-800'}`}>
            <span className="font-bold text-sm sm:text-base">{title}</span>
            <span className="text-[10px] text-stone-400 mt-1">{sub}</span>
        </div>
    );
};

const JuseiCard = ({ star, pos }) => (
    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-stone-50 border border-stone-200 h-full text-stone-600">
        <span className="font-bold text-sm sm:text-base">{star.name}</span>
        <span className="text-[10px] text-stone-400 mt-1">{star.sub} ({star.score}点)</span>
        <span className="text-[9px] text-stone-300 mt-0.5">{pos}</span>
    </div>
);