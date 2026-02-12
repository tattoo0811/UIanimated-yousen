/**
 * 各患者の日柱と年齢から正しい生年月日を逆算するスクリプト
 * 干支は60日周期で循環する
 * 基準日: 1900年1月1日 = 庚子日
 */

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 60干支表
const KANSHI_60: string[] = [];
for (let i = 0; i < 60; i++) {
    KANSHI_60.push(GAN[i % 10] + SHI[i % 12]);
}

// 基準日: 1900-01-01 は甲子日 (index 0) ではなく庚子日 (index 36)
// より正確には、2000-01-01 = 甲午 (index 30) を使う
// 実は1900年1月1日 = 庚子 → index 36
const BASE_DATE = new Date(1900, 0, 1); // 1900-01-01
const BASE_KANSHI_INDEX = 36; // 庚子

function getDayKanshi(year: number, month: number, day: number): string {
    const targetDate = new Date(year, month - 1, day);
    const diffTime = targetDate.getTime() - BASE_DATE.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const index = ((diffDays + BASE_KANSHI_INDEX) % 60 + 60) % 60;
    return KANSHI_60[index];
}

interface PatientTarget {
    episode: number;
    name: string;
    dayPillar: string; // 日柱
    age2026: number;   // 2026年時点の年齢
    gender: "male" | "female";
}

const targets: PatientTarget[] = [
    { episode: 2, name: "村田健一", dayPillar: "己卯", age2026: 45, gender: "male" },
    { episode: 3, name: "森川真紀", dayPillar: "庚子", age2026: 43, gender: "female" },
    { episode: 3, name: "森川陽菜", dayPillar: "甲辰", age2026: 15, gender: "female" },
    { episode: 4, name: "田中健太", dayPillar: "戊辰", age2026: 32, gender: "male" },
    { episode: 5, name: "佐藤雅人", dayPillar: "壬申", age2026: 38, gender: "male" },
    { episode: 6, name: "大林拓也", dayPillar: "甲寅", age2026: 34, gender: "male" },
    { episode: 7, name: "草野千穂", dayPillar: "乙未", age2026: 29, gender: "female" },
    { episode: 8, name: "日向陽一", dayPillar: "丙午", age2026: 40, gender: "male" },
    { episode: 9, name: "灯里奈々", dayPillar: "丁酉", age2026: 25, gender: "female" },
    { episode: 10, name: "岩田剛", dayPillar: "戊戌", age2026: 50, gender: "male" },
];

console.log("=== EP1-10 患者 生年月日探索 ===\n");

for (const t of targets) {
    const birthYear = 2026 - t.age2026;
    const candidates: string[] = [];

    // 誕生年の1月1日〜12月31日を走査
    for (let m = 1; m <= 12; m++) {
        const daysInMonth = new Date(birthYear, m, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const kanshi = getDayKanshi(birthYear, m, d);
            if (kanshi === t.dayPillar) {
                // 年齢チェック: 2026年4月時点 (物語開始)
                const ageAtStory = 2026 - birthYear - (m > 4 ? 1 : 0);
                candidates.push(`${birthYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} (${kanshi}) age@2026/4=${ageAtStory}`);
            }
        }
    }

    console.log(`EP${t.episode} ${t.name} (${t.dayPillar}, ${t.age2026}歳, born ${birthYear}):`);
    if (candidates.length > 0) {
        candidates.forEach(c => console.log(`  ✓ ${c}`));
    } else {
        console.log(`  ✗ No match found for birth year ${birthYear}`);
    }
    console.log();
}
