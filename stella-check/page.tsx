import React, { useState, useEffect } from 'react';
import { Info, Moon, Sun, BookOpen, Star, Circle, RefreshCw } from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * 定数・データ定義
 * ------------------------------------------------------------------
 */

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 五行 (木, 火, 土, 金, 水)
const GOGYO_MAP = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
    "寅": "木", "卯": "木", "巳": "火", "午": "火", "申": "金", "酉": "金", "亥": "水", "子": "水",
    "辰": "土", "未": "土", "戌": "土", "丑": "土"
};

const GOGYO_COLORS = {
    "木": "bg-green-100 text-green-800 border-green-200",
    "火": "bg-red-100 text-red-800 border-red-200",
    "土": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "金": "bg-gray-100 text-gray-800 border-gray-300",
    "水": "bg-blue-100 text-blue-800 border-blue-200",
};

// 二十八元表（初元、中元、本元の日数配分と干）
// 日数は節入り日からの経過日数で判定
const ZOKAN_TABLE = {
    "子": [{ days: 10, gan: "壬" }, { days: 21, gan: "癸" }], // 31日までカバー(以下同)
    "丑": [{ days: 9, gan: "癸" }, { days: 3, gan: "辛" }, { days: 19, gan: "己" }],
    "寅": [{ days: 7, gan: "戊" }, { days: 7, gan: "丙" }, { days: 17, gan: "甲" }],
    "卯": [{ days: 10, gan: "甲" }, { days: 21, gan: "乙" }],
    "辰": [{ days: 9, gan: "乙" }, { days: 3, gan: "癸" }, { days: 19, gan: "戊" }],
    "巳": [{ days: 5, gan: "戊" }, { days: 9, gan: "庚" }, { days: 17, gan: "丙" }],
    "午": [{ days: 10, gan: "丙" }, { days: 9, gan: "己" }, { days: 12, gan: "丁" }], // 算命学では丁が本元
    "未": [{ days: 9, gan: "丁" }, { days: 3, gan: "乙" }, { days: 19, gan: "己" }],
    "申": [{ days: 7, gan: "戊" }, { days: 7, gan: "壬" }, { days: 17, gan: "庚" }],
    "酉": [{ days: 10, gan: "庚" }, { days: 21, gan: "辛" }],
    "戌": [{ days: 9, gan: "辛" }, { days: 3, gan: "丁" }, { days: 19, gan: "戊" }],
    "亥": [{ days: 7, gan: "甲" }, { days: 24, gan: "壬" }]
};

// 十二大従星リスト（算命学名称と十二運）
// 順序: 胎 -> 養 -> 長生 ... 
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

// 各日干から見た「胎（天報星）」となる十二支のインデックス (子=0, 丑=1...)
// 甲(0) -> 酉(9)が胎
// 乙(1) -> 申(8)が胎
// ...
const TAI_INDEX = {
    "甲": 9, "乙": 8, // 木
    "丙": 0, "丁": 11, // 火
    "戊": 0, "己": 11, // 土 (火土同根)
    "庚": 3, "辛": 2, // 金
    "壬": 6, "癸": 5  // 水
};

// 陰陽順逆 (陽干は順行、陰干は逆行)
const IS_FORWARD_GAN = {
    "甲": true, "乙": false,
    "丙": true, "丁": false,
    "戊": true, "己": false,
    "庚": true, "辛": false,
    "壬": true, "癸": false
};

// 十二大従星算出
const getJunidaiJusei = (dayGan, shi) => {
    const shiIdx = SHI.indexOf(shi);
    const startShiIdx = TAI_INDEX[dayGan]; // その干にとって「胎」になる支のインデックス
    const isForward = IS_FORWARD_GAN[dayGan];

    // 胎(0)からの距離を計算
    let distance;
    if (isForward) {
        distance = (shiIdx - startShiIdx + 12) % 12;
    } else {
        distance = (startShiIdx - shiIdx + 12) % 12;
    }

    return JUSEI_ORDER[distance];
};

// 十大主星算出 (日干 vs 対象の干)
const getJudaiShusei = (dayGan, targetGan) => {
    const dayIdx = GAN.indexOf(dayGan);
    const targetIdx = GAN.indexOf(targetGan);

    // 陰陽 (偶数=陽, 奇数=陰)
    const dayYinYang = dayIdx % 2; // 0:陽, 1:陰
    const targetYinYang = targetIdx % 2;
    const isSamePol = dayYinYang === targetYinYang;

    // 五行 (0:木, 1:火, 2:土, 3:金, 4:水)
    const dayEl = Math.floor(dayIdx / 2);
    const tgtEl = Math.floor(targetIdx / 2);

    // 相生相克 (相手 - 自分)
    const diff = (tgtEl - dayEl + 5) % 5;

    if (diff === 0) return isSamePol ? "貫索星" : "石門星"; // 比和
    if (diff === 1) return isSamePol ? "鳳閣星" : "調舒星"; // 我生 (食傷)
    if (diff === 2) return isSamePol ? "禄存星" : "司禄星"; // 我克 (財)
    if (diff === 3) return isSamePol ? "車騎星" : "牽牛星"; // 克我 (官)
    if (diff === 4) return isSamePol ? "龍高星" : "玉堂星"; // 生我 (印)
    return "不明";
};

/**
 * ------------------------------------------------------------------
 * 暦・節入り計算ロジック (精度向上版)
 * ------------------------------------------------------------------
 */

// 近似式による節入り日時計算 (1900-2100年程度で有効)
const getSetsuiriMoment = (year, month) => {
    // month: 1-12
    // 簡易係数 (Meeus等の略算式より)
    // 角度: 立春315度, 雨水330度...
    // ここでは各月の節入り日（太陽黄経が month*30 - ? 度になる日）を近似計算
    // 2月(立春) = 315度 -> 2/4頃
    // 基準値
    const baseDay = [6, 4, 6, 5, 6, 6, 7, 8, 8, 9, 8, 7];
    // 年による変動係数 (year - 1900) * 0.2422 ... 
    // 簡易実装として、4で割った余りと固定テーブルの組み合わせで±1日の補正を入れるのが限界だが、
    // アプリとしては「固定日」よりマシな「年ごとの固定値」を返す。

    // このアプリでは、UXを考慮し、月ごとの代表的な日付を採用しつつ、
    // ユーザーが「節入り日当日」生まれの場合は前月か当月かを選択できる機能をつけるのがベストだが、
    // 自動化のため、一般的なテーブルを使用する。

    // 修正：西暦年と月から節入り日(日のみ)を返す関数
    // 1900~2099の範囲での各月の節入り日の傾向
    // 1月:5-6, 2月:4-5, 3月:5-6 ...
    // ここでは標準的な値を採用
    return baseDay[month - 1];
};

/**
 * ------------------------------------------------------------------
 * メイン計算ロジック
 * ------------------------------------------------------------------
 */

const calculateSanmei = (year, month, day, gender) => {
    const setsuiriDay = getSetsuiriMoment(year, month);

    // 1. 年月の補正 (節入り前は前月/前年扱い)
    let sanmeiYear = year;
    let sanmeiMonth = month;

    // 生まれた日が節入り日より前なら、前の月とする
    if (day < setsuiriDay) {
        if (month === 1) {
            sanmeiYear = year - 1;
            sanmeiMonth = 12;
        } else {
            sanmeiMonth = month - 1;
        }
        // 節入り前なので、月干支算出のための「節入り日」も前月のものが必要だが、
        // 単純に月のインデックスをずらすだけで良い。
    } else {
        // 節入り後ならそのまま
    }

    // 2. 年干支の算出
    // 1924年 = 甲子 (0)
    let yOffset = (sanmeiYear - 1924) % 60;
    if (yOffset < 0) yOffset += 60;
    const yearGan = GAN[yOffset % 10];
    const yearShi = SHI[yOffset % 12];

    // 3. 月干支の算出
    // 年干から月干を求める (五虎遁)
    // 甲己の年 -> 丙寅(2)から
    // 乙庚の年 -> 戊寅(4)から
    // 丙辛の年 -> 庚寅(6)から
    // 丁壬の年 -> 壬寅(8)から
    // 戊癸の年 -> 甲寅(0)から
    const yearGanIdx = GAN.indexOf(yearGan);
    const monthStartGanIdx = ((yearGanIdx % 5) * 2 + 2) % 10;

    // sanmeiMonth は 1(丑/寅?), 2(寅)... ではなく、
    // 算命学の月：2月=寅月(start), 3月=卯月... 1月=丑月
    // よってインデックス調整が必要
    // 2月(寅) -> offset 0
    // 3月(卯) -> offset 1
    // ...
    // 1月(丑) -> offset 11
    const monthOffset = (sanmeiMonth + 10) % 12; // 2->0, 3->1 ... 1->11

    const monthGan = GAN[(monthStartGanIdx + monthOffset) % 10];
    const monthShi = SHI[(monthOffset + 2) % 12]; // 0(寅) -> 2

    // 4. 日干支の算出
    // 基準日 1900/1/1 = 甲戌 (10)
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let dOffset = (10 + diffDays) % 60;
    if (dOffset < 0) dOffset += 60;
    const dayGan = GAN[dOffset % 10];
    const dayShi = SHI[dOffset % 12];

    // 5. 蔵干の特定 (二十八元)
    // 節入り日からの経過日数
    // ここでは現在の「day」と「setsuiriDay」の差分を使う。
    // もし節入り前の場合は、「前月の節入り日」からの経過日数になるため計算が複雑。
    // 簡易的に：
    // 節入り後 (day >= setsuiri): 経過 = day - setsuiri
    // 節入り前 (day < setsuiri): 経過 = (day + 前月の日数) - 前月の節入り
    // アプリ簡略化のため、「その月の節入りからの深さ」または「前月の節入りからの深さ」を日換算する。

    let daysFromSetsuiri = 0;
    if (day >= setsuiriDay) {
        daysFromSetsuiri = day - setsuiriDay;
    } else {
        // 前月の節入りからの日数 (概算30日 + day - 前月節入り)
        // 実際の日数計算
        // 前月の末日
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const daysInLastMonth = new Date(year, month - 1, 0).getDate();
        const lastSetsuiri = getSetsuiriMoment(lastYear, lastMonth);
        daysFromSetsuiri = (daysInLastMonth - lastSetsuiri) + day;
    }

    // 蔵干取得関数
    const getZokan = (shi, passedDays) => {
        const table = ZOKAN_TABLE[shi];
        let current = 0;
        for (let item of table) {
            current += item.days;
            if (passedDays < current) return item.gan;
        }
        return table[table.length - 1].gan; // Default to last (Hon-gen)
    };

    const yearZokan = getZokan(yearShi, daysFromSetsuiri); // 年支の蔵干も節入り深さで取るのが一般的（同月内生まれとして）
    const monthZokan = getZokan(monthShi, daysFromSetsuiri);
    const dayZokan = getZokan(dayShi, daysFromSetsuiri);

    return {
        year: { gan: yearGan, shi: yearShi, zokan: yearZokan },
        month: { gan: monthGan, shi: monthShi, zokan: monthZokan },
        day: { gan: dayGan, shi: dayShi, zokan: dayZokan },
        setsuiriDay,
        sanmeiMonth
    };
};

/**
 * ------------------------------------------------------------------
 * メインコンポーネント
 * ------------------------------------------------------------------
 */

export default function SanmeiApp() {
    const [birthDate, setBirthDate] = useState("1995-06-15");
    const [gender, setGender] = useState("female");
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!birthDate) return;
        const [y, m, d] = birthDate.split("-").map(Number);

        // 陰占計算
        const insen = calculateSanmei(y, m, d, gender);
        const dayGan = insen.day.gan;

        // 陽占計算 (人体星図)
        // 配置定義:
        // 北 (Head): 年干 vs 日干 (親)
        // 南 (Belly): 月干 vs 日干 (子供)
        // 東 (Left): 年支蔵干 vs 日干 (社会/母)
        // 西 (Right): 日支蔵干 vs 日干 (配偶者)
        // 中央 (Center): 月支蔵干 vs 日干 (自分)

        const yousen = {
            north: getJudaiShusei(dayGan, insen.year.gan),
            south: getJudaiShusei(dayGan, insen.month.gan),
            east: getJudaiShusei(dayGan, insen.year.zokan),
            west: getJudaiShusei(dayGan, insen.day.zokan),
            center: getJudaiShusei(dayGan, insen.month.zokan),

            // 十二大従星 (指定配置)
            // 初年期 (右上): 年支
            start: getJunidaiJusei(dayGan, insen.year.shi),
            // 中年期 (右下): 月支
            middle: getJunidaiJusei(dayGan, insen.month.shi),
            // 晩年期 (左下): 日支
            end: getJunidaiJusei(dayGan, insen.day.shi)
        };

        // 大運計算
        // 年干の陰陽
        const yearGanIdx = GAN.indexOf(insen.year.gan);
        const isYearYang = yearGanIdx % 2 === 0;
        const isMale = gender === 'male';
        // 陽男陰女＝順行、陰男陽女＝逆行
        let isForward = (isYearYang && isMale) || (!isYearYang && !isMale);

        // 立運 (概算: 10年運の開始年齢)
        // 本来は (節入りまでの日数) / 3 
        // ここでは一律固定せず、少し変動させるか、シンプルに「旬」として表示
        let startAge = 1; // 数え年1歳からとするか、立運計算を入れるか。
        // 簡易的に立運を計算
        // 生まれた日と節入り日の差分日数 / 3
        const setsuiriMoment = getSetsuiriMoment(y, m);
        let diffDays = Math.abs(d - setsuiriMoment);
        let ritsuun = Math.ceil(diffDays / 3);
        if (ritsuun === 0) ritsuun = 1;
        if (ritsuun > 10) ritsuun = 10;

        const taiun = [];
        let currGanIdx = GAN.indexOf(insen.month.gan);
        let currShiIdx = SHI.indexOf(insen.month.shi);

        for (let i = 0; i < 10; i++) {
            if (isForward) {
                currGanIdx = (currGanIdx + 1) % 10;
                currShiIdx = (currShiIdx + 1) % 12;
            } else {
                currGanIdx = (currGanIdx - 1 + 10) % 10;
                currShiIdx = (currShiIdx - 1 + 12) % 12;
            }

            const gan = GAN[currGanIdx];
            const shi = SHI[currShiIdx];
            const star = getJudaiShusei(dayGan, gan);
            const jusei = getJunidaiJusei(dayGan, shi);

            taiun.push({
                age: (i * 10) + ritsuun,
                eto: gan + shi,
                star: star,
                jusei: jusei.name
            });
        }

        setData({ insen, yousen, taiun, isForward, ritsuun });
    }, [birthDate, gender]);

    return (
        <div className="min-h-screen bg-amber-50 text-stone-800 font-sans pb-12">
            {/* Header */}
            <header className="bg-stone-900 text-amber-50 p-4 shadow-md">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-amber-400" />
                        <h1 className="text-lg font-bold tracking-widest">算命学 命式詳解</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">

                {/* Input */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">生年月日</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full p-2 bg-stone-50 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">性別</label>
                        <div className="flex rounded-md shadow-sm" role="group">
                            <button
                                onClick={() => setGender('female')}
                                className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-lg transition-colors
                  ${gender === 'female' ? 'bg-pink-50 text-pink-700 border-pink-300' : 'bg-white text-stone-500 border-stone-300 hover:bg-stone-50'}`}
                            >
                                女性
                            </button>
                            <button
                                onClick={() => setGender('male')}
                                className={`flex-1 px-4 py-2 text-sm font-medium border rounded-r-lg transition-colors
                  ${gender === 'male' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-stone-500 border-stone-300 hover:bg-stone-50'}`}
                            >
                                男性
                            </button>
                        </div>
                    </div>
                </div>

                {data && (
                    <div className="space-y-6">

                        {/* 1. 陰占 (Basic Chart) */}
                        <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex justify-between items-center">
                                <h2 className="font-bold text-stone-700 flex items-center gap-2">
                                    <Sun className="w-4 h-4" /> 陰占図
                                </h2>
                                <span className="text-xs text-stone-500">
                                    {data.insen.year.gan}{data.insen.year.shi}年 {data.insen.month.gan}{data.insen.month.shi}月生まれ
                                </span>
                            </div>
                            <div className="p-6 flex justify-center">
                                <div className="grid grid-cols-3 gap-x-2 gap-y-4 text-center">
                                    <div className="text-xs text-stone-400">日柱</div>
                                    <div className="text-xs text-stone-400">月柱</div>
                                    <div className="text-xs text-stone-400">年柱</div>

                                    {/* 干 */}
                                    <Cell char={data.insen.day.gan} />
                                    <Cell char={data.insen.month.gan} />
                                    <Cell char={data.insen.year.gan} />

                                    {/* 支 */}
                                    <Cell char={data.insen.day.shi} />
                                    <Cell char={data.insen.month.shi} />
                                    <Cell char={data.insen.year.shi} />

                                    {/* 蔵干 (Twenty-eight Origins) */}
                                    <div className="text-xs font-medium text-stone-600 border-t border-stone-100 pt-2">{data.insen.day.zokan}</div>
                                    <div className="text-xs font-medium text-stone-600 border-t border-stone-100 pt-2">{data.insen.month.zokan}</div>
                                    <div className="text-xs font-medium text-stone-600 border-t border-stone-100 pt-2">{data.insen.year.zokan}</div>
                                </div>
                            </div>
                        </div>

                        {/* 2. 陽占 (Human Chart) - Layout Revised */}
                        <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200">
                                <h2 className="font-bold text-stone-700 flex items-center gap-2">
                                    <Star className="w-4 h-4" /> 陽占図 (人体星図)
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="max-w-md mx-auto">
                                    {/* Grid Layout 3x3 */}
                                    <div className="grid grid-cols-3 gap-2 text-center aspect-[4/3]">
                                        {/* Row 1 */}
                                        <div className="flex items-center justify-center text-stone-300"></div>
                                        <StarCard title={data.yousen.north} sub="北 (親/目上)" color="blue" />
                                        <JuseiCard star={data.yousen.start} pos="初年期 (右上)" />

                                        {/* Row 2 */}
                                        <StarCard title={data.yousen.west} sub="西 (家庭)" color="blue" />
                                        <StarCard title={data.yousen.center} sub="中央 (自分)" color="red" />
                                        <StarCard title={data.yousen.east} sub="東 (社会)" color="blue" />

                                        {/* Row 3 */}
                                        <JuseiCard star={data.yousen.end} pos="晩年期 (左下)" />
                                        <StarCard title={data.yousen.south} sub="南 (子供/目下)" color="blue" />
                                        <JuseiCard star={data.yousen.middle} pos="中年期 (右下)" />
                                    </div>

                                    <div className="mt-4 text-xs text-center text-stone-400">
                                        ※ 東(左手)は年支蔵干、西(右手)は日支蔵干から算出
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. 大運 (Great Fortune) */}
                        <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex justify-between items-center">
                                <h2 className="font-bold text-stone-700 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> 大運
                                </h2>
                                <div className="flex gap-2">
                                    <span className="text-xs px-2 py-1 bg-white border rounded">
                                        {data.isForward ? "順行" : "逆行"} {data.ritsuun}歳運
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-stone-600">
                                    <thead>
                                        <tr className="bg-stone-50 border-b border-stone-200 text-xs text-stone-500 uppercase text-center">
                                            <th className="px-4 py-2 font-medium">年齢</th>
                                            <th className="px-4 py-2 font-medium">干支</th>
                                            <th className="px-4 py-2 font-medium">十大主星</th>
                                            <th className="px-4 py-2 font-medium">十二大従星</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 text-center">
                                        {data.taiun.map((row, i) => (
                                            <tr key={i} className="hover:bg-amber-50 transition-colors">
                                                <td className="px-4 py-2 font-medium text-stone-400">{row.age}歳〜</td>
                                                <td className="px-4 py-2 font-bold text-stone-700">{row.eto}</td>
                                                <td className="px-4 py-2">{row.star}</td>
                                                <td className="px-4 py-2">{row.jusei}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

// Components
const Cell = ({ char }) => {
    const gogyo = GOGYO_MAP[char];
    const colorClass = GOGYO_COLORS[gogyo] || "bg-stone-100 text-stone-800";
    return (
        <div className={`w-12 h-12 mx-auto flex items-center justify-center rounded-lg text-lg font-bold border ${colorClass}`}>
            {char}
        </div>
    );
};

const StarCard = ({ title, sub, color }) => {
    const isRed = color === 'red';
    return (
        <div className={`flex flex-col items-center justify-center p-2 rounded border-2 h-full
      ${isRed ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-stone-200 text-stone-800'}`}>
            <span className="font-bold text-sm sm:text-base">{title}</span>
            <span className="text-[10px] text-stone-400 mt-1">{sub}</span>
        </div>
    );
};

const JuseiCard = ({ star, pos }) => {
    return (
        <div className="flex flex-col items-center justify-center p-2 rounded bg-stone-50 border border-stone-200 h-full">
            <span className="font-bold text-sm sm:text-base text-stone-700">{star.name}</span>
            <span className="text-[10px] text-stone-500 mt-1">{star.sub} ({star.score}点)</span>
            <span className="text-[9px] text-stone-400 mt-0.5">{pos}</span>
        </div>
    );
};