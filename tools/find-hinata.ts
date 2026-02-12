/**
 * 日向陽一: 丙火の日柱で天将星を含まないものを探す
 * 丙午は構造的に天将星（帝旺@午）が出るため、別の丙○日柱を検討
 * 条件: 40歳前後、男性、丙火の日干
 */
import { calculateSanmei } from "./sanmei-cli-v3.js";

console.log("=== 日向陽一 丙火×天将星なし 探索 ===\n");

// 丙の十二支で帝旺(天将星)が出ない組み合わせを探す
// 丙の帝旺 = 午 なので、日支が午以外なら日柱からは天将星が出ない
// ただし年柱・月柱の地支が午の場合は出る可能性がある

const targetYears = [1985, 1986, 1987];

for (const birthYear of targetYears) {
    for (let m = 1; m <= 12; m++) {
        const daysInMonth = new Date(birthYear, m, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            try {
                const result = calculateSanmei(birthYear, m, d, "male");
                const dayGan = result.insen.day.gan;
                const dayShi = result.insen.day.shi;

                if (dayGan !== "丙") continue; // 丙火のみ
                if (dayShi === "午") continue; // 丙午は除外（必ず天将星）

                const jusei = [result.yousen.start, result.yousen.middle, result.yousen.end];
                const hasTenshosei = jusei.some(j => j.name === "天将星");
                if (hasTenshosei) continue;

                const age = 2026 - birthYear - (m > 4 ? 1 : 0);
                if (age < 38 || age > 42) continue; // 40歳前後

                const dayPillar = dayGan + dayShi;
                const yearPillar = result.insen.year.gan + result.insen.year.shi;
                const monthPillar = result.insen.month.gan + result.insen.month.shi;
                const stars = [
                    result.yousen.north,
                    result.yousen.south,
                    result.yousen.east,
                    result.yousen.west,
                    result.yousen.center,
                ];

                console.log(`✅ ${birthYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} (${age}歳) | ${yearPillar}年 ${monthPillar}月 ${dayPillar}日`);
                console.log(`   十大主星: ${stars.join("・")}`);
                console.log(`   十二大従星: ${jusei.map(j => `${j.name}(${j.score})`).join("・")}`);
            } catch (e) { }
        }
    }
}
