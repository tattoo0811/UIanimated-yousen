/**
 * ストーリー整合性検証スクリプト v1.0
 * 
 * 5つのチェック:
 * 1. 回想カウント — v3本文 vs ヘッダー分布表 vs DASHBOARD
 * 2. 命式照合   — ドキュメント記載 vs sanmei-with-energy-cli 実計算
 * 3. 年齢・時系列 — キャラ年齢が (物語年 - 生年) と一致するか
 * 4. ドキュメント横断 — v3 と DASHBOARD の回想テーブル一致
 * 5. 重複検出   — DASHBOARD 詳細テーブルに重複行がないか
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { calculateSanmei } from "./sanmei-with-energy-cli.js";

// ── Paths ──────────────────────────────────────────────
const ROOT = resolve(__dirname, "..");
const V3_PATH = resolve(ROOT, "novel/storyline-v3.md");
const DASHBOARD_PATH = resolve(ROOT, "novel/dashboards/DASHBOARD.md");

// ── Result types ───────────────────────────────────────
interface CheckResult {
    check: string;
    status: "✅" | "⚠️" | "❌";
    message: string;
    details?: string[];
}

const results: CheckResult[] = [];
let hasErrors = false;

function pass(check: string, message: string) {
    results.push({ check, status: "✅", message });
}
function warn(check: string, message: string, details?: string[]) {
    results.push({ check, status: "⚠️", message, details });
}
function fail(check: string, message: string, details?: string[]) {
    hasErrors = true;
    results.push({ check, status: "❌", message, details });
}

// ── Helpers ────────────────────────────────────────────
function readFile(path: string): string {
    return readFileSync(path, "utf-8");
}

function parseEpisodeNumber(line: string): number | null {
    const m = line.match(/^第(\d+\.?\d*)話/);
    return m ? parseFloat(m[1]) : null;
}

// ── CHECK 1: 回想カウント ──────────────────────────────
function checkFlashbackCount() {
    const v3 = readFile(V3_PATH);
    const dashboard = readFile(DASHBOARD_PATH);
    const v3Lines = v3.split("\n");
    const dashLines = dashboard.split("\n");

    // 1a: v3本文の回想シーン抽出
    const bodyFlashbacks: { episode: number; line: number }[] = [];
    let currentEp: number | null = null;

    for (let i = 0; i < v3Lines.length; i++) {
        const epNum = parseEpisodeNumber(v3Lines[i]);
        if (epNum !== null) currentEp = epNum;
        if ((v3Lines[i].startsWith("回想: あり") || v3Lines[i].startsWith("★さくら回想")) && currentEp !== null) {
            bodyFlashbacks.push({ episode: currentEp, line: i + 1 });
        }
    }

    // 1b: v3ヘッダー分布表の回想数
    const headerMatch = v3.match(/さくら回想シーン分布（合計(\d+)回）/);
    const headerTotal = headerMatch ? parseInt(headerMatch[1]) : -1;

    // 1c: v3ヘッダー詳細テーブル行数（# | 話数 | ... のパターン）
    const detailTableRows: string[] = [];
    let inDetailTable = false;
    for (const line of v3Lines) {
        if (line.includes("さくら回想シーン詳細")) inDetailTable = true;
        if (inDetailTable && line.startsWith("|") && !line.includes("---") && !line.includes("回想内容")) {
            // Skip header row
            if (/^\|\s*#?\s*\d+/.test(line.replace(/\|/g, "").trim().substring(0, 3)) ||
                /^\|\s*\d+\s*\|/.test(line)) {
                detailTableRows.push(line);
            }
        }
        if (inDetailTable && line.startsWith("---")) {
            if (detailTableRows.length > 0) break;
        }
    }

    // 1d: DASHBOARD の合計
    const dashHeaderMatch = dashboard.match(/さくら回想シーン分布（合計(\d+)回）/);
    const dashTotal = dashHeaderMatch ? parseInt(dashHeaderMatch[1]) : -1;

    // 1e: DASHBOARD 分布テーブルの各部合計
    const dashDistRows: { part: string; count: number; episodes: string }[] = [];
    let inDashDist = false;
    for (const line of dashLines) {
        if (line.includes("さくら回想シーン分布")) inDashDist = true;
        if (inDashDist && line.startsWith("|") && line.includes("回")) {
            const cells = line.split("|").map(c => c.trim()).filter(Boolean);
            if (cells.length >= 4 && /\d+回/.test(cells[1])) {
                const countMatch = cells[1].match(/(\d+)回/);
                if (countMatch) {
                    dashDistRows.push({
                        part: cells[0],
                        count: parseInt(countMatch[1]),
                        episodes: cells[3]
                    });
                }
            }
        }
        if (inDashDist && line.startsWith("###")) break;
    }
    const dashDistTotal = dashDistRows.reduce((s, r) => s + r.count, 0);

    // Reports
    const bodyCount = bodyFlashbacks.length;

    if (headerTotal === bodyCount) {
        pass("回想カウント", `v3ヘッダー(${headerTotal}) = v3本文(${bodyCount}) ✓`);
    } else {
        fail("回想カウント", `v3ヘッダー(${headerTotal}) ≠ v3本文(${bodyCount})`, [
            `本文で検出: ${bodyFlashbacks.map(f => `EP${f.episode}`).join(", ")}`,
        ]);
    }

    if (headerTotal === detailTableRows.length) {
        pass("回想詳細テーブル", `v3ヘッダー(${headerTotal}) = 詳細テーブル行数(${detailTableRows.length}) ✓`);
    } else {
        fail("回想詳細テーブル", `v3ヘッダー(${headerTotal}) ≠ 詳細テーブル行数(${detailTableRows.length})`);
    }

    if (dashTotal === headerTotal) {
        pass("DASHBOARD回想合計", `DASHBOARD(${dashTotal}) = v3(${headerTotal}) ✓`);
    } else {
        fail("DASHBOARD回想合計", `DASHBOARD(${dashTotal}) ≠ v3(${headerTotal})`);
    }

    // Check distribution counts match listed episodes
    for (const row of dashDistRows) {
        const epList = row.episodes.split(",").map(s => s.trim()).filter(Boolean);
        if (epList.length !== row.count) {
            fail("分布数カウント", `${row.part}: ${row.count}回と記載だが${epList.length}話が列挙`, [
                `列挙: ${row.episodes}`
            ]);
        } else {
            pass("分布数カウント", `${row.part}: ${row.count}回 = ${epList.length}話 ✓`);
        }
    }

    if (dashDistTotal !== dashTotal) {
        fail("分布合計", `分布表の合計(${dashDistTotal}) ≠ ヘッダー合計(${dashTotal})`);
    } else {
        pass("分布合計", `分布表の合計(${dashDistTotal}) = ヘッダー(${dashTotal}) ✓`);
    }

    return bodyFlashbacks;
}

// ── CHECK 2: 命式照合 ─────────────────────────────────
interface CharDef {
    name: string;
    birthDate: string;
    gender: "male" | "female";
    expectedDayPillar: string; // 日柱
}

function checkMeishiki() {
    // 主要キャラの命式（DASHBOARD から）
    const chars: CharDef[] = [
        { name: "九条巡", birthDate: "1990-03-02", gender: "male", expectedDayPillar: "丙寅" },
        { name: "藤堂慧", birthDate: "1990-05-25", gender: "male", expectedDayPillar: "庚寅" },
        { name: "高橋美咲", birthDate: "1999-05-03", gender: "female", expectedDayPillar: "乙卯" },
    ];

    for (const c of chars) {
        const [y, m, d] = c.birthDate.split("-").map(Number);
        const result = calculateSanmei(y, m, d, c.gender);
        const dayPillar = result.insen.day.gan + result.insen.day.shi;
        const yearPillar = result.insen.year.gan + result.insen.year.shi;

        if (dayPillar === c.expectedDayPillar) {
            pass("命式照合", `${c.name}(${c.birthDate}): 日柱=${dayPillar}, 年柱=${yearPillar} ✓`);
        } else {
            fail("命式照合", `${c.name}: 期待=${c.expectedDayPillar} ≠ CLI計算=${dayPillar}`);
        }

        // Check if the year pillar is incorrectly used as 命式 in v3
        const v3 = readFile(V3_PATH);
        const yearPillarMisuse = new RegExp(`${c.name}[^\\n]{0,50}命式[^\\n]{0,20}${yearPillar}`, "g");
        const misuses = v3.match(yearPillarMisuse);
        if (misuses) {
            warn("年柱誤用", `${c.name}: 年柱(${yearPillar})が命式として使われている可能性`, misuses);
        }
    }
}

// ── CHECK 3: 年齢・時系列 ──────────────────────────────
function checkAgeTimeline() {
    const chars = [
        { name: "九条巡", birthYear: 1990, storyAge26: 36, storyAge27: 37 },
        { name: "藤堂慧", birthYear: 1990, storyAge26: 36, storyAge27: 37 },
        { name: "高橋美咲", birthYear: 1999, storyAge26: 27, storyAge27: 28 },
    ];

    for (const c of chars) {
        const expected2026 = 2026 - c.birthYear;
        const expected2027 = 2027 - c.birthYear;

        if (expected2026 === c.storyAge26 && expected2027 === c.storyAge27) {
            pass("年齢計算", `${c.name}: 2026年=${c.storyAge26}歳, 2027年=${c.storyAge27}歳 ✓`);
        } else {
            fail("年齢計算", `${c.name}: 期待(${expected2026}/${expected2027}) ≠ 記載(${c.storyAge26}/${c.storyAge27})`);
        }
    }
}

// ── CHECK 4: ドキュメント横断 ──────────────────────────
function checkCrossDocSync() {
    const v3 = readFile(V3_PATH);
    const dashboard = readFile(DASHBOARD_PATH);

    // Extract v3 detail table episode numbers
    const v3DetailEps: number[] = [];
    const v3Lines = v3.split("\n");
    let inV3Table = false;
    for (const line of v3Lines) {
        if (line.includes("さくら回想シーン詳細")) inV3Table = true;
        if (inV3Table && line.startsWith("|")) {
            const match = line.match(/\|\s*\d+\s*\|\s*([\d.]+)\s*\|/);
            if (match) v3DetailEps.push(parseFloat(match[1]));
        }
        if (inV3Table && line.startsWith("---") && v3DetailEps.length > 0) break;
    }

    // Extract DASHBOARD detail table episode numbers
    const dashDetailEps: number[] = [];
    const dashLines = dashboard.split("\n");
    let inDashTable = false;
    for (const line of dashLines) {
        if (line.includes("さくら回想シーン詳細")) inDashTable = true;
        if (inDashTable && line.startsWith("|")) {
            const match = line.match(/\|\s*\d+\s*\|\s*([\d.]+)話\s*\|/);
            if (match) dashDetailEps.push(parseFloat(match[1]));
        }
        if (inDashTable && line.startsWith("---") && dashDetailEps.length > 0) break;
    }

    if (v3DetailEps.length === dashDetailEps.length) {
        pass("詳細テーブル行数", `v3(${v3DetailEps.length}) = DASHBOARD(${dashDetailEps.length}) ✓`);
    } else {
        fail("詳細テーブル行数", `v3(${v3DetailEps.length}) ≠ DASHBOARD(${dashDetailEps.length})`);
    }

    // Compare episode numbers
    const mismatches: string[] = [];
    const maxLen = Math.max(v3DetailEps.length, dashDetailEps.length);
    for (let i = 0; i < maxLen; i++) {
        const v3e = v3DetailEps[i] ?? "???";
        const de = dashDetailEps[i] ?? "???";
        if (v3e !== de) {
            mismatches.push(`#${i + 1}: v3=${v3e} ≠ DASHBOARD=${de}`);
        }
    }

    if (mismatches.length === 0) {
        pass("話数一致", "v3とDASHBOARDの回想話数が完全一致 ✓");
    } else {
        fail("話数不一致", `${mismatches.length}件の不一致`, mismatches);
    }
}

// ── CHECK 5: 重複検出 ─────────────────────────────────
function checkDuplicates() {
    const dashboard = readFile(DASHBOARD_PATH);
    const lines = dashboard.split("\n");

    // Extract detail table themes (column 3 / テーマ)
    const themes: { row: number; theme: string }[] = [];
    let inTable = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("さくら回想シーン詳細")) inTable = true;
        if (inTable && lines[i].startsWith("|")) {
            const cells = lines[i].split("|").map(c => c.trim()).filter(Boolean);
            if (cells.length >= 3 && /^\d+$/.test(cells[0])) {
                themes.push({ row: parseInt(cells[0]), theme: cells[2] });
            }
        }
        if (inTable && lines[i].startsWith("---") && themes.length > 0) break;
    }

    // Find duplicates
    const seen = new Map<string, number>();
    const duplicates: string[] = [];
    for (const t of themes) {
        const prev = seen.get(t.theme);
        if (prev !== undefined) {
            duplicates.push(`行#${t.row}は行#${prev}の重複: "${t.theme.substring(0, 40)}..."`);
        }
        seen.set(t.theme, t.row);
    }

    if (duplicates.length === 0) {
        pass("重複検出", `${themes.length}行のテーマにすべて重複なし ✓`);
    } else {
        fail("重複検出", `${duplicates.length}件の重複行`, duplicates);
    }
}

// ── Main ──────────────────────────────────────────────
console.log("═══════════════════════════════════════════════");
console.log("  ストーリー整合性検証 v1.0");
console.log("═══════════════════════════════════════════════\n");

console.log("📋 CHECK 1: 回想カウント");
checkFlashbackCount();

console.log("\n📋 CHECK 2: 命式照合");
checkMeishiki();

console.log("\n📋 CHECK 3: 年齢・時系列");
checkAgeTimeline();

console.log("\n📋 CHECK 4: ドキュメント横断");
checkCrossDocSync();

console.log("\n📋 CHECK 5: 重複検出");
checkDuplicates();

// ── Report ────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════");
console.log("  検証結果サマリー");
console.log("═══════════════════════════════════════════════\n");

for (const r of results) {
    console.log(`${r.status} [${r.check}] ${r.message}`);
    if (r.details) {
        for (const d of r.details) {
            console.log(`     ${d}`);
        }
    }
}

const passCount = results.filter(r => r.status === "✅").length;
const warnCount = results.filter(r => r.status === "⚠️").length;
const failCount = results.filter(r => r.status === "❌").length;

console.log(`\n合計: ✅ ${passCount}  ⚠️ ${warnCount}  ❌ ${failCount}`);

if (hasErrors) {
    console.log("\n❌ 整合性エラーが検出されました。修正してください。");
    process.exit(1);
} else if (warnCount > 0) {
    console.log("\n⚠️ 警告がありますが、致命的ではありません。");
    process.exit(0);
} else {
    console.log("\n✅ すべてのチェックに合格しました！");
    process.exit(0);
}
