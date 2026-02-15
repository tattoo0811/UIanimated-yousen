/**
 * 村田健一の生年月日探索 — 年齢制限なし
 * 己卯 + 天将星(12) の組み合わせを全年で探す
 * 40代前後（1975-1986年生まれ）が物語的に妥当
 */
import { calculateSanmei } from "./sanmei-with-energy-cli.js";

console.log("=== 村田健一 己卯+天将星(12) 探索 ===\n");

for (let birthYear = 1975; birthYear <= 1986; birthYear++) {
    for (let m = 1; m <= 12; m++) {
        const daysInMonth = new Date(birthYear, m, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            try {
                const result = calculateSanmei(birthYear, m, d, "male");
                const dayPillar = result.insen.day.gan + result.insen.day.shi;

                if (dayPillar === "己卯") {
                    const jusei = [result.yousen.start, result.yousen.middle, result.yousen.end];
                    const hasTenshosei = jusei.some(j => j.name === "天将星" && j.score === 12);

                    if (hasTenshosei) {
                        const yearPillar = result.insen.year.gan + result.insen.year.shi;
                        const monthPillar = result.insen.month.gan + result.insen.month.shi;
                        const stars = [
                            result.yousen.north,
                            result.yousen.south,
                            result.yousen.east,
                            result.yousen.west,
                            result.yousen.center,
                        ];
                        const age2026 = 2026 - birthYear - (m > 4 ? 1 : 0);

                        console.log(`✅ ${birthYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} (${age2026}歳@2026/4)`);
                        console.log(`   命式: ${yearPillar}年 ${monthPillar}月 己卯日`);
                        console.log(`   十大主星: ${stars.join("・")}`);
                        console.log(`   十二大従星: ${jusei.map(j => `${j.name}(${j.score})`).join("・")}`);
                        console.log();
                    }
                }
            } catch (e) {
                // skip
            }
        }
    }
}
