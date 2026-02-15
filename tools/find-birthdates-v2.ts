/**
 * CLIの内部エンジンを直接使って、
 * 各患者の日柱に一致する生年月日を正確に探索する
 */
import { calculateSanmei } from "./sanmei-with-energy-cli.js";

interface PatientTarget {
    episode: number;
    name: string;
    dayPillar: string;
    age2026: number;
    gender: "male" | "female";
    requiredStars?: string[];
    requiredJusei?: string;
    requiredJuseiScore?: number;
}

const targets: PatientTarget[] = [
    { episode: 2, name: "村田健一", dayPillar: "己卯", age2026: 45, gender: "male", requiredJusei: "天将星", requiredJuseiScore: 12 },
    { episode: 3, name: "森川真紀", dayPillar: "庚子", age2026: 43, gender: "female" },
    { episode: 3, name: "森川陽菜", dayPillar: "甲辰", age2026: 15, gender: "female", requiredStars: ["龍高星"] },
    { episode: 4, name: "田中健太", dayPillar: "戊辰", age2026: 32, gender: "male" },
    { episode: 5, name: "佐藤雅人", dayPillar: "壬申", age2026: 38, gender: "male" },
    { episode: 6, name: "大林拓也", dayPillar: "甲寅", age2026: 34, gender: "male" },
    { episode: 7, name: "草野千穂", dayPillar: "乙未", age2026: 29, gender: "female" },
    { episode: 8, name: "日向陽一", dayPillar: "丙午", age2026: 40, gender: "male" },
    { episode: 9, name: "灯里奈々", dayPillar: "丁酉", age2026: 25, gender: "female" },
    { episode: 10, name: "岩田剛", dayPillar: "戊戌", age2026: 50, gender: "male" },
];

console.log("=== EP1-10 患者 生年月日探索 (CLIエンジン使用) ===\n");

for (const t of targets) {
    const birthYear = 2026 - t.age2026;
    const candidates: Array<{
        date: string;
        age: number;
        yearPillar: string;
        monthPillar: string;
        dayPillar: string;
        stars: string[];
        jusei: Array<{ name: string; score: number }>;
        starsMatch: boolean;
        juseiMatch: boolean;
    }> = [];

    // 誕生年の全日を走査
    for (let m = 1; m <= 12; m++) {
        const daysInMonth = new Date(birthYear, m, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            try {
                const result = calculateSanmei(birthYear, m, d, t.gender);
                const dayPillar = result.insen.day.gan + result.insen.day.shi;

                if (dayPillar === t.dayPillar) {
                    const age = 2026 - birthYear - (m > 4 ? 1 : 0);
                    const yearPillar = result.insen.year.gan + result.insen.year.shi;
                    const monthPillar = result.insen.month.gan + result.insen.month.shi;
                    const stars = [
                        result.yousen.north,
                        result.yousen.south,
                        result.yousen.east,
                        result.yousen.west,
                        result.yousen.center,
                    ];
                    const jusei = [
                        { name: result.yousen.start.name, score: result.yousen.start.score },
                        { name: result.yousen.middle.name, score: result.yousen.middle.score },
                        { name: result.yousen.end.name, score: result.yousen.end.score },
                    ];

                    let starsMatch = true;
                    if (t.requiredStars) {
                        for (const rs of t.requiredStars) {
                            if (!stars.includes(rs)) starsMatch = false;
                        }
                    }

                    let juseiMatch = true;
                    if (t.requiredJusei) {
                        const found = jusei.find(j => j.name === t.requiredJusei);
                        if (!found) juseiMatch = false;
                        else if (t.requiredJuseiScore && found.score !== t.requiredJuseiScore) juseiMatch = false;
                    }

                    candidates.push({
                        date: `${birthYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                        age,
                        yearPillar,
                        monthPillar,
                        dayPillar,
                        stars,
                        jusei,
                        starsMatch,
                        juseiMatch,
                    });
                }
            } catch (e) {
                // skip
            }
        }
    }

    console.log(`EP${t.episode} ${t.name} (${t.dayPillar}, ${t.age2026}歳, born ${birthYear}):`);

    // Filter for correct age first, then show best matches
    const correctAge = candidates.filter(c => c.age === t.age2026);
    const bestMatches = correctAge.filter(c => c.starsMatch && c.juseiMatch);

    if (bestMatches.length > 0) {
        console.log(`  ★ 完全一致 (${bestMatches.length}件):`);
        for (const c of bestMatches) {
            console.log(`    ${c.date} | ${c.yearPillar}年 ${c.monthPillar}月 ${c.dayPillar}日 | ${c.stars.join("・")} | ${c.jusei.map(j => j.name + "(" + j.score + ")").join("・")}`);
        }
    } else if (correctAge.length > 0) {
        console.log(`  △ 日柱+年齢一致 (${correctAge.length}件, 星/十二大従星に注意):`);
        for (const c of correctAge) {
            const flags = [];
            if (!c.starsMatch) flags.push("星不一致");
            if (!c.juseiMatch) flags.push("十二大従星不一致");
            console.log(`    ${c.date} | ${c.yearPillar}年 ${c.monthPillar}月 ${c.dayPillar}日 | ${c.stars.join("・")} | ${c.jusei.map(j => j.name + "(" + j.score + ")").join("・")} ${flags.length ? "⚠ " + flags.join(", ") : ""}`);
        }
    } else if (candidates.length > 0) {
        console.log(`  ○ 日柱一致のみ (年齢不一致, ${candidates.length}件):`);
        for (const c of candidates.slice(0, 3)) {
            console.log(`    ${c.date} age=${c.age} | ${c.yearPillar}年 ${c.monthPillar}月 ${c.dayPillar}日 | ${c.stars.join("・")}`);
        }
    } else {
        console.log(`  ✗ 一致なし`);
    }
    console.log();
}
