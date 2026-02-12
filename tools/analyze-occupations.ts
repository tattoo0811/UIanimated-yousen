
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const claudeDocsDir = path.join(__dirname, '..', 'claudedocs');

interface CharacterOccupation {
    episode: number;
    name: string;
    occupation: string;
    source: string;
}

const targetKeywords = [
    "YouTuber", "VTuber", "配信者", "インフルエンサー", "動画", "編集",
    "AI", "エンジニア", "プログラマー", "データ", "IT", "SaaS", "ブロックチェーン", "Web3",
    "フリーランス", "副業", "ライター", "デザイナー", "Uber", "配達", "ギグ",
    "奨学金", "就活", "派遣", "契約社員", "パート", "アルバイト", "期間工",
    "起業", "スタートアップ", "コンサル", "マーケター", "民泊"
];

async function main() {
    const allChars: CharacterOccupation[] = [];

    // EP 1-24
    const ep1 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-1-24-CHARACTERS.json'), 'utf8'));
    for (const c of ep1) {
        if (c.episode === 1) continue;
        allChars.push({ episode: c.episode || c.episodeNumber, name: c.name, occupation: c.occupation || "不明", source: 'EP1-24' });
    }

    // EP 25-48
    const ep2 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-25-48-CHARACTERS.json'), 'utf8'));
    for (const c of ep2.characters) {
        allChars.push({ episode: c.episode, name: c.name, occupation: c.occupation || "不明", source: 'EP25-48' });
    }

    // EP 49-72
    const ep3 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-49-72-CHARACTERS.json'), 'utf8'));
    for (const c of ep3.characters) {
        if (c.name === "藤堂 慧") continue;
        allChars.push({ episode: c.episode, name: c.name, occupation: c.occupation || "不明", source: 'EP49-72' });
    }

    // EP 73-96
    const ep4 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-73-96-CHARACTERS.json'), 'utf8'));
    for (const [key, phase] of Object.entries(ep4.episodes) as any) {
        if (phase.patients) {
            for (const p of phase.patients) {
                const pt = p.patient;
                if (!pt || pt.name === '（来院者なし）') continue;
                allChars.push({ episode: p.episode, name: pt.name, occupation: pt.occupation || "不明", source: 'EP73-96' });
            }
        }
        if (phase.episodes_detail) {
            for (const d of phase.episodes_detail) {
                const pt = d.patient;
                if (!pt || pt.name === '（来院者なし）') continue;
                // Avoid dupes if already added
                if (!allChars.some(c => c.episode === d.episode)) {
                    allChars.push({ episode: d.episode, name: pt.name, occupation: pt.occupation || "不明", source: 'EP73-96' });
                }
            }
        }
    }

    // EP 91-120
    const ep5 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-91-120-CHARACTERS.json'), 'utf8'));
    for (let i = 0; i < 30; i++) {
        const c = ep5[String(i)];
        if (!c) continue;
        allChars.push({ episode: c.episode, name: c.name, occupation: c.occupation || "不明", source: 'EP91-120' });
    }

    // Analyze
    console.log(`Total Characters: ${allChars.length}`);

    // 1. Keyword match
    console.log("\n=== Modern/Target Occupations found ===");
    const matches = allChars.filter(c => targetKeywords.some(k => c.occupation.includes(k)));
    matches.forEach(c => {
        console.log(`EP${c.episode} ${c.name}: ${c.occupation}`);
    });
    console.log(`Total Matches: ${matches.length} / ${allChars.length} (${(matches.length / allChars.length * 100).toFixed(1)}%)`);

    // 2. List all unique occupations
    const occCounts: Record<string, number> = {};
    allChars.forEach(c => {
        occCounts[c.occupation] = (occCounts[c.occupation] || 0) + 1;
    });

    console.log("\n=== Top Occupations ===");
    Object.entries(occCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .forEach(([occ, count]) => console.log(`${occ}: ${count}`));

    // 3. Check specific missing ones
    const missing = targetKeywords.filter(k => !allChars.some(c => c.occupation.includes(k)));
    if (missing.length > 0) {
        console.log("\n=== Missing Keywords ===");
        console.log(missing.join(", "));
    }
}

main().catch(console.error);
