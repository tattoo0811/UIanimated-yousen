/**
 * 天将星を含まない代替日付を探す
 * 対象: 陽菜(甲辰,15歳), 日向(丙午,40歳), 灯里(丁酉,25歳)
 */
import { calculateSanmei } from "./sanmei-with-energy-cli.js";

interface Target {
    name: string;
    dayPillar: string;
    age2026: number;
    gender: "male" | "female";
    requiredStars?: string[];
    yearRange: number[];
}

const targets: Target[] = [
    { name: "森川陽菜", dayPillar: "甲辰", age2026: 15, gender: "female", requiredStars: ["龍高星"], yearRange: [2010, 2011, 2012] },
    { name: "日向陽一", dayPillar: "丙午", age2026: 40, gender: "male", yearRange: [1985, 1986, 1987] },
    { name: "灯里奈々", dayPillar: "丁酉", age2026: 25, gender: "female", yearRange: [2000, 2001, 2002] },
];

console.log("=== 天将星を含まない代替日付探索 ===\n");

for (const t of targets) {
    console.log(`--- ${t.name} (${t.dayPillar}, 目標${t.age2026}歳) ---`);

    const candidates: Array<{
        date: string;
        age: number;
        yearPillar: string;
        monthPillar: string;
        stars: string[];
        jusei: Array<{ name: string; score: number }>;
    }> = [];

    for (const birthYear of t.yearRange) {
        for (let m = 1; m <= 12; m++) {
            const daysInMonth = new Date(birthYear, m, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                try {
                    const result = calculateSanmei(birthYear, m, d, t.gender);
                    const dayPillar = result.insen.day.gan + result.insen.day.shi;

                    if (dayPillar === t.dayPillar) {
                        const jusei = [
                            { name: result.yousen.start.name, score: result.yousen.start.score },
                            { name: result.yousen.middle.name, score: result.yousen.middle.score },
                            { name: result.yousen.end.name, score: result.yousen.end.score },
                        ];

                        const hasTenshosei = jusei.some(j => j.name === "天将星");
                        if (hasTenshosei) continue; // 天将星がある日付はスキップ

                        const stars = [
                            result.yousen.north,
                            result.yousen.south,
                            result.yousen.east,
                            result.yousen.west,
                            result.yousen.center,
                        ];

                        // 必須星チェック
                        if (t.requiredStars) {
                            const allFound = t.requiredStars.every(rs => stars.includes(rs));
                            if (!allFound) continue;
                        }

                        const age = 2026 - birthYear - (m > 4 ? 1 : 0);
                        const yearPillar = result.insen.year.gan + result.insen.year.shi;
                        const monthPillar = result.insen.month.gan + result.insen.month.shi;

                        candidates.push({ date: `${birthYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, age, yearPillar, monthPillar, stars, jusei });
                    }
                } catch (e) { }
            }
        }
    }

    // 年齢が合うもの優先
    const correctAge = candidates.filter(c => c.age === t.age2026);
    const closeAge = candidates.filter(c => Math.abs(c.age - t.age2026) <= 1);

    const show = correctAge.length > 0 ? correctAge : closeAge;

    if (show.length > 0) {
        for (const c of show) {
            console.log(`  ✅ ${c.date} (${c.age}歳) | ${c.yearPillar}年 ${c.monthPillar}月 ${t.dayPillar}日`);
            console.log(`     十大主星: ${c.stars.join("・")}`);
            console.log(`     十二大従星: ${c.jusei.map(j => `${j.name}(${j.score})`).join("・")}`);
        }
    } else {
        console.log(`  ❌ 天将星なし + 必須星ありの候補が見つかりません`);
        console.log(`  全候補(天将星あり含む): ${candidates.length}件`);
    }
    console.log();
}
