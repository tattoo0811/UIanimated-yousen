/**
 * バッチ検証: 各患者の生年月日候補をCLIで算出し
 * v3ストーリーラインの要件と照合する
 */
import { calculateSanmei } from "./sanmei-cli-v3.js";

interface PatientCheck {
    episode: number;
    name: string;
    birthDate: string;
    gender: "male" | "female";
    requiredDayPillar: string;      // v3指定の日柱
    requiredStars?: string[];       // v3で言及された特定の星
    requiredJusei?: string;         // v3で言及された十二大従星
    requiredJuseiScore?: number;    // v3で言及されたスコア
    notes: string;                  // v3での要件メモ
}

const patients: PatientCheck[] = [
    {
        episode: 1, name: "高橋美咲", birthDate: "1999-05-03", gender: "female",
        requiredDayPillar: "乙卯",
        requiredStars: ["貫索星", "司禄星", "禄存星"],
        notes: "確定済み。貫索星×2＋司禄星の組み合わせ"
    },
    {
        episode: 2, name: "村田健一", birthDate: "1981-02-04", gender: "male",
        requiredDayPillar: "己卯",
        requiredJusei: "天将星", requiredJuseiScore: 12,
        notes: "天将星12点が必須（v3記載）"
    },
    {
        episode: 3, name: "森川真紀", birthDate: "1983-04-16", gender: "female",
        requiredDayPillar: "庚子",
        notes: "庚金の母。金剋木の関係"
    },
    {
        episode: 3, name: "森川陽菜", birthDate: "2011-03-24", gender: "female",
        requiredDayPillar: "甲辰",
        requiredStars: ["龍高星"],
        notes: "甲木の娘。龍高星を持つ（v3記載）"
    },
    {
        episode: 4, name: "田中健太", birthDate: "1994-03-17", gender: "male",
        requiredDayPillar: "戊辰",
        notes: "戊土。完璧主義のSE。土が極端に強い"
    },
    {
        episode: 5, name: "佐藤雅人", birthDate: "1988-02-21", gender: "male",
        requiredDayPillar: "壬申",
        notes: "壬水。天中殺期間中の転職悩み"
    },
    {
        episode: 6, name: "大林拓也", birthDate: "1992-03-13", gender: "male",
        requiredDayPillar: "甲寅",
        notes: "甲木。建設会社社長。事業成功＋家庭崩壊"
    },
    {
        episode: 7, name: "草野千穂", birthDate: "1997-03-28", gender: "female",
        requiredDayPillar: "乙未",
        notes: "乙木。フリーランスイラストレーター"
    },
    {
        episode: 8, name: "日向陽一", birthDate: "1986-04-06", gender: "male",
        requiredDayPillar: "丙午",
        notes: "丙火。巡と同じ丙火の日干"
    },
    {
        episode: 9, name: "灯里奈々", birthDate: "2001-03-09", gender: "female",
        requiredDayPillar: "丁酉",
        notes: "丁火。保育士。蝋燭の火"
    },
    {
        episode: 10, name: "岩田剛", birthDate: "1976-03-21", gender: "male",
        requiredDayPillar: "戊戌",
        notes: "戊土。消防署隊長。不動の霊山"
    },
];

console.log("=== EP1-10 患者 命式一括検証 ===\n");

let hasErrors = false;

for (const p of patients) {
    const [y, m, d] = p.birthDate.split("-").map(Number);
    const result = calculateSanmei(y, m, d, p.gender);

    const dayPillar = result.insen.day.gan + result.insen.day.shi;
    const yearPillar = result.insen.year.gan + result.insen.year.shi;
    const monthPillar = result.insen.month.gan + result.insen.month.shi;

    const stars = [
        result.yousen.north,
        result.yousen.south,
        result.yousen.east,
        result.yousen.west,
        result.yousen.center,
    ];

    const jusei = [result.yousen.start, result.yousen.middle, result.yousen.end];

    // 日柱チェック
    const dayMatch = dayPillar === p.requiredDayPillar;

    // 星チェック
    let starMatch = true;
    if (p.requiredStars) {
        for (const rs of p.requiredStars) {
            if (!stars.includes(rs)) {
                starMatch = false;
            }
        }
    }

    // 十二大従星チェック
    let juseiMatch = true;
    if (p.requiredJusei) {
        const found = jusei.find(j => j.name === p.requiredJusei);
        if (!found) {
            juseiMatch = false;
        } else if (p.requiredJuseiScore && found.score !== p.requiredJuseiScore) {
            juseiMatch = false;
        }
    }

    const overall = dayMatch && starMatch && juseiMatch;
    if (!overall) hasErrors = true;

    console.log(`${overall ? "✅" : "❌"} EP${p.episode} ${p.name} (${p.birthDate}, ${p.gender})`);
    console.log(`  命式: ${yearPillar}年 ${monthPillar}月 ${dayPillar}日`);
    console.log(`  日柱: ${dayPillar} ${dayMatch ? "✓" : "✗ expected " + p.requiredDayPillar}`);
    console.log(`  十大主星: ${stars.join("・")}`);
    console.log(`  十二大従星: ${jusei.map(j => `${j.name}(${j.score})`).join("・")}`);

    if (p.requiredStars && !starMatch) {
        console.log(`  ⚠ 星の不足: ${p.requiredStars.filter(rs => !stars.includes(rs)).join(", ")}`);
    }
    if (p.requiredJusei && !juseiMatch) {
        console.log(`  ⚠ 十二大従星不一致: wanted ${p.requiredJusei}(${p.requiredJuseiScore ?? "any"}) not found`);
    }
    console.log(`  [v3要件] ${p.notes}`);

    // 天中殺
    console.log(`  天中殺: 節入日=${result.insen.setsuiriDay}`);
    console.log();
}

if (hasErrors) {
    console.log("\n⚠️ 一部の患者で矛盾が検出されました。生年月日の再選定が必要です。");
} else {
    console.log("\n✅ 全患者の命式が v3 要件と一致しています。");
}
