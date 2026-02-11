/**
 * 算命学計算 CLIツール (Sanmei Logic Core) v1.1
 * * 概要:
 * 生年月日と性別を入力とし、陰占・陽占・大運を計算してJSON形式で出力します。
 * 節入り日および二十八元（蔵干）の精密計算に対応しています。
 * * 実行方法 (要: ts-node):
 * $ npx ts-node sanmei-cli.ts 1995-06-15 female
 */

// --- 型定義 ---

type Gender = 'male' | 'female';
type ZokanType = 'initial' | 'middle' | 'main';

// 蔵干の候補リスト（その地支が持つ全ての可能性）
interface ZokanCandidates {
    initial: string; // 初元 (余気: 前の季節の残気)
    middle?: string; // 中元 (三合会局の気など)
    main: string;    // 本元 (その支の本質的な気)
}

// 蔵干の計算結果
interface ZokanResult {
    selected: string;            // 節入り経過日数により実際に採用された干
    type: ZokanType;             // 採用された干の区分
    candidates: ZokanCandidates; // 分析用: その地支の全蔵干データ
}

interface GanShi {
    gan: string;
    shi: string;
    zokan: ZokanResult; // 文字列ではなく詳細オブジェクトに変更
}

interface Insen {
    year: GanShi;
    month: GanShi;
    day: GanShi;
    setsuiriDay: number;
}

interface Yousen {
    north: string;  // 北: 親・目上
    south: string;  // 南: 子供・目下
    east: string;   // 東: 社会・母 (年支より算出)
    west: string;   // 西: 配偶者 (日支より算出)
    center: string; // 中央: 自分 (月支より算出)
    start: JuseiInfo;  // 初年期 (年支)
    middle: JuseiInfo; // 中年期 (月支)
    end: JuseiInfo;    // 晩年期 (日支)
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

interface SanmeiResult {
    input: {
        date: string;
        gender: Gender;
    };
    insen: Insen;
    yousen: Yousen;
    taiun: {
        isForward: boolean;
        ritsuun: number; // 立運（歳運）
        list: TaiunRow[];
    };
}

// --- 定数データ ---

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 二十八元表（初元、中元、本元の日数配分と干）
// 配列順序: [初元, 中元(あれば), 本元] の順で格納
// ※日数は標準的な算命学の配分を採用
const ZOKAN_TABLE: Record<string, { days: number; gan: string }[]> = {
    "子": [{ days: 10, gan: "壬" }, { days: 21, gan: "癸" }], // 初元:壬, 本元:癸
    "丑": [{ days: 9, gan: "癸" }, { days: 3, gan: "辛" }, { days: 19, gan: "己" }], // 初:癸, 中:辛, 本:己
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

// 十二大従星リスト
const JUSEI_ORDER: JuseiInfo[] = [
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
const TAI_INDEX: Record<string, number> = {
    "甲": 9, "乙": 8, "丙": 0, "丁": 11, "戊": 0,
    "己": 11, "庚": 3, "辛": 2, "壬": 6, "癸": 5
};

// 陰陽順逆 (陽干は順行、陰干は逆行)
const IS_FORWARD_GAN: Record<string, boolean> = {
    "甲": true, "乙": false, "丙": true, "丁": false, "戊": true,
    "己": false, "庚": true, "辛": false, "壬": true, "癸": false
};

// --- 計算ロジック関数 ---

// 節入り日計算 (簡易版: 1900-2099年対応)
const getSetsuiriMoment = (year: number, month: number): number => {
    const baseDay = [6, 4, 6, 5, 6, 6, 7, 8, 8, 9, 8, 7];
    return baseDay[month - 1];
};

// 十二大従星算出
const getJunidaiJusei = (dayGan: string, shi: string): JuseiInfo => {
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

// 蔵干算出ロジック (日数配分に基づく詳細計算)
const getZokanData = (shi: string, passedDays: number): ZokanResult => {
    const table = ZOKAN_TABLE[shi];

    // A. 候補リスト(Candidates)の作成
    // その地支が持つ全ての蔵干を抽出
    let candidates: ZokanCandidates;
    if (table.length === 2) {
        // 2つの場合: 初元 -> 本元
        candidates = {
            initial: table[0].gan,
            main: table[1].gan
        };
    } else {
        // 3つの場合: 初元 -> 中元 -> 本元
        candidates = {
            initial: table[0].gan,
            middle: table[1].gan,
            main: table[2].gan
        };
    }

    // B. 採用蔵干(Selected)の判定
    // 節入り日からの経過日数(passedDays)に基づいて決定
    let current = 0;
    let selectedGan = table[table.length - 1].gan; // デフォルトは本元
    let selectedType: ZokanType = 'main';

    for (let i = 0; i < table.length; i++) {
        current += table[i].days;
        if (passedDays < current) {
            selectedGan = table[i].gan;
            if (table.length === 2) {
                // 2つの場合: 0=Initial, 1=Main
                selectedType = i === 0 ? 'initial' : 'main';
            } else {
                // 3つの場合: 0=Initial, 1=Middle, 2=Main
                selectedType = i === 0 ? 'initial' : (i === 1 ? 'middle' : 'main');
            }
            break;
        }
    }

    return {
        selected: selectedGan,
        type: selectedType,
        candidates
    };
};

// 命式全体計算
const calculateSanmei = (year: number, month: number, day: number, gender: Gender): SanmeiResult => {
    const setsuiriDay = getSetsuiriMoment(year, month);

    // 1. 年月の補正 (節入り考慮)
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

    // 3. 月干支 (五虎遁)
    const yearGanIdx = GAN.indexOf(yearGan);
    const monthStartGanIdx = ((yearGanIdx % 5) * 2 + 2) % 10;
    const monthOffset = (sanmeiMonth + 10) % 12;
    const monthGan = GAN[(monthStartGanIdx + monthOffset) % 10];
    const monthShi = SHI[(monthOffset + 2) % 12];

    // 4. 日干支 (基準日からの経過日)
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let dOffset = (10 + diffDays) % 60;
    if (dOffset < 0) dOffset += 60;
    const dayGan = GAN[dOffset % 10];
    const dayShi = SHI[dOffset % 12];

    // 5. 蔵干計算のための経過日数算出
    let daysFromSetsuiri = 0;
    if (day >= setsuiriDay) {
        daysFromSetsuiri = day - setsuiriDay;
    } else {
        // 前月の節入りからの日数
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const daysInLastMonth = new Date(year, month - 1, 0).getDate();
        const lastSetsuiri = getSetsuiriMoment(lastYear, lastMonth);
        daysFromSetsuiri = (daysInLastMonth - lastSetsuiri) + day;
    }

    // 陰占の各柱の蔵干データを取得
    const yearZokan = getZokanData(yearShi, daysFromSetsuiri);
    const monthZokan = getZokanData(monthShi, daysFromSetsuiri);
    const dayZokan = getZokanData(dayShi, daysFromSetsuiri);

    // 6. 陽占構築 (人体星図)
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

    // 7. 大運構築
    // 陽年(甲丙戊庚壬)生まれの男性、陰年(乙丁己辛癸)生まれの女性 → 順行
    // 陰年生まれの男性、陽年生まれの女性 → 逆行
    const isYearYang = GAN.indexOf(yearGan) % 2 === 0;
    const isMale = gender === 'male';
    const isForward = (isYearYang && isMale) || (!isYearYang && !isMale);

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

        taiunList.push({
            age: (i * 10) + ritsuun,
            eto: tGan + tShi,
            gan: tGan,
            shi: tShi,
            star: getJudaiShusei(dayGan, tGan),
            jusei: getJunidaiJusei(dayGan, tShi).name
        });
    }

    return {
        input: {
            date: `${year}-${month}-${day}`,
            gender
        },
        insen: {
            year: { gan: yearGan, shi: yearShi, zokan: yearZokan },
            month: { gan: monthGan, shi: monthShi, zokan: monthZokan },
            day: { gan: dayGan, shi: dayShi, zokan: dayZokan },
            setsuiriDay
        },
        yousen,
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