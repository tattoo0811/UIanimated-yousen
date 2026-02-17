/**
 * Soul.md整合性検証ツール
 *
 * identity.mdとのデータ整合性、タイムラインの一貫性、
 * 物語的な矛盾チェック（キャラクター関係性の一貫性）を検証する。
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  SoulValidation,
  Inconsistency,
  ValidationError,
} from "./audit-types.ts";
import { parseIdentityFile, calculateAge } from "./audit-parse-utils.ts";

// ESMで__dirname互換
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルート
const ROOT = path.resolve(__dirname, "..");
const EP_DIR = path.join(ROOT, "novel/characters");
const PERSONA_DIR = path.join(EP_DIR, "personas");
const OUTPUT_FILE = path.join(
  EP_DIR,
  `AUDIT-SOUL-${new Date().toISOString().split("T")[0]}.md`,
);

/**
 * Soul.mdファイルを検証
 */
function validateSoulFile(
  soulPath: string,
  identityPath: string,
): SoulValidation {
  const result: SoulValidation = {
    characterId: path.basename(path.dirname(soulPath)),
    file: soulPath,
    valid: true,
    errors: [],
    inconsistencies: [],
  };

  const soulContent = fs.readFileSync(soulPath, "utf-8");
  const identity = parseIdentityFile(identityPath);

  if (!identity) {
    result.errors.push({
      field: "identity.md",
      message: "identity.mdの読み込みに失敗しました",
      severity: "error",
    });
    result.valid = false;
    return result;
  }

  // 1. 生年月日の整合性チェック
  const soulBirthMatch = soulContent.match(
    /-\s*\*\*生年月日\*\*:\s*(\d{4})年(\d{1,2})月(\d{1,2})日/,
  );
  if (soulBirthMatch) {
    const [, year, month, day] = soulBirthMatch;
    const soulBirthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    if (soulBirthDate !== identity.birthDate) {
      result.inconsistencies.push({
        field: "生年月日",
        identityValue: identity.birthDate,
        soulValue: soulBirthDate,
        severity: "error",
      });
      result.valid = false;
    }
  }

  // 2. エネルギー値の整合性チェック
  const identityEnergyMatch = soulContent.match(
    /(?:identity\.md|エネルギー).*?(\d+)点/,
  );
  const soulEnergyMatch = soulContent.match(/\*\*総エネルギー\*\*:\s*(\d+)点/);
  if (identityEnergyMatch && soulEnergyMatch) {
    const identityEnergy = parseInt(identityEnergyMatch[1], 10);
    const soulEnergy = parseInt(soulEnergyMatch[1], 10);

    if (identityEnergy !== soulEnergy) {
      result.inconsistencies.push({
        field: "エネルギー値",
        identityValue: String(identityEnergy),
        soulValue: String(soulEnergy),
        severity: "warning",
      });
    }
  }

  // 3. 天中殺の整合性チェック
  const identityTenchuMatch = soulContent.match(
    /(?:identity\.md|天中殺).*?天中殺:\s*([^\n]+)/,
  );
  const soulTenchuMatch = soulContent.match(/\*\*種類\*\*:\s*([^\n]+天中殺)/);
  if (identityTenchuMatch && soulTenchuMatch) {
    const identityTenchu = identityTenchuMatch[1].trim();
    const soulTenchu = soulTenchuMatch[1].trim();

    if (identityTenchu !== soulTenchu) {
      result.inconsistencies.push({
        field: "天中殺",
        identityValue: identityTenchu,
        soulValue: soulTenchu,
        severity: "error",
      });
      result.valid = false;
    }
  }

  // 4. タイムラインの一貫性チェック（年齢順序）
  const timelineMatches = soulContent.matchAll(
    /\|\s*(\d+)\s*\|\s*(\d{4})\s*\|/g,
  );
  const timeline: { age: number; year: number }[] = [];
  for (const match of timelineMatches) {
    timeline.push({
      age: parseInt(match[1], 10),
      year: parseInt(match[2], 10),
    });
  }

  // 年齢と年の整合性をチェック
  for (const entry of timeline) {
    const expectedYear = parseInt(identity.birthDate.split("-")[0]) + entry.age;
    if (Math.abs(entry.year - expectedYear) > 1) {
      result.errors.push({
        field: "タイムライン",
        message: `${entry.age}歳の年が ${entry.year}年ですが、${identity.birthDate}生まれの場合 ${expectedYear}年前後であるべきです`,
        severity: "warning",
      });
    }
  }

  // 年齢の昇順チェック
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].age <= timeline[i - 1].age) {
      result.errors.push({
        field: "タイムライン",
        message: `年齢が昇順になっていません: ${timeline[i - 1].age}歳 → ${timeline[i].age}歳`,
        severity: "error",
      });
      result.valid = false;
    }
  }

  // 5. 物語的な矛盾チェック（キャラクター関係性）
  // 人間関係マップの整合性を簡易チェック
  const relationshipMatches = soulContent.matchAll(
    /\|\s*([^\|]+)\s*\|\s*([^\|]+)\s*\|\s*([^\|]+)\s*\|\s*([^\|]+)\s*\|/g,
  );
  const mentionedCharacters = new Set<string>();
  for (const match of relationshipMatches) {
    const characterName = match[1].trim();
    if (
      characterName !== "相手" &&
      characterName !== "九条巡" &&
      characterName !== "高橋美咲" &&
      characterName !== "藤堂慧"
    ) {
      mentionedCharacters.add(characterName);
    }
  }

  // 言及されているキャラクターが存在するかチェックは、別途インデックスが必要

  return result;
}

/**
 * 全Soul.mdファイルを検証
 */
function validateAllSouls(): SoulValidation[] {
  const results: SoulValidation[] = [];

  const personaDirs = fs.readdirSync(PERSONA_DIR).filter((d) => {
    const dirPath = path.join(PERSONA_DIR, d);
    return fs.statSync(dirPath).isDirectory();
  });

  for (const dir of personaDirs) {
    const soulPath = path.join(PERSONA_DIR, dir, "soul.md");
    const identityPath = path.join(PERSONA_DIR, dir, "identity.md");

    if (fs.existsSync(soulPath) && fs.existsSync(identityPath)) {
      results.push(validateSoulFile(soulPath, identityPath));
    }
  }

  return results;
}

/**
 * Markdownレポートを生成
 */
function generateMarkdownReport(results: SoulValidation[]): string {
  const lines: string[] = [];

  lines.push("# Soul.md 整合性検証レポート");
  lines.push("");
  lines.push(
    `> 生成日時: ${new Date().toLocaleString("ja-JP")}`,
  );
  lines.push("");

  // サマリー
  const validCount = results.filter((r) => r.valid).length;
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
  const inconsistencyCount = results.reduce(
    (sum, r) => sum + r.inconsistencies.length,
    0,
  );

  lines.push("## サマリー");
  lines.push("");
  lines.push(`| 項目 | 数値 |`);
  lines.push(`|------|------|`);
  lines.push(`| 検証ファイル数 | ${results.length} |`);
  lines.push(`| 有効なファイル | ${validCount} |`);
  lines.push(`| エラー数 | ${errorCount} |`);
  lines.push(`| 不一致数 | ${inconsistencyCount} |`);
  lines.push("");

  // 不一致詳細
  const withInconsistencies = results.filter(
    (r) => r.inconsistencies.length > 0,
  );
  if (withInconsistencies.length > 0) {
    lines.push("## identity.mdとの不一致");
    lines.push("");

    for (const result of withInconsistencies) {
      lines.push(`### ${result.characterId}`);
      lines.push("");
      for (const inc of result.inconsistencies) {
        const severity = inc.severity === "error" ? "❌" : "⚠️";
        lines.push(
          `- ${severity} [${inc.field}] identity.md: ${inc.identityValue} / soul.md: ${inc.soulValue}`,
        );
      }
      lines.push("");
    }
  }

  // エラー詳細
  const errorsOnly = results.filter((r) => r.errors.length > 0);
  if (errorsOnly.length > 0) {
    lines.push("## エラー詳細");
    lines.push("");

    for (const result of errorsOnly) {
      lines.push(`### ${result.characterId}`);
      lines.push("");
      for (const error of result.errors) {
        const severity = error.severity === "error" ? "❌" : "⚠️";
        lines.push(`- ${severity} [${error.field}] ${error.message}`);
      }
      lines.push("");
    }
  }

  // 有効なファイル
  if (validCount > 0) {
    lines.push("## 有効なファイル");
    lines.push("");
    for (const result of results.filter((r) => r.valid)) {
      lines.push(`- ${result.characterId}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * メイン処理
 */
async function main() {
  console.log("🔄 Soul.md整合性検証ツール");
  console.log("=".repeat(50));

  console.log("\n🔍 検証中...");
  const results = validateAllSouls();

  const validCount = results.filter((r) => r.valid).length;
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
  const inconsistencyCount = results.reduce(
    (sum, r) => sum + r.inconsistencies.length,
    0,
  );

  console.log(`\n📊 検証結果:`);
  console.log(`  検証ファイル数: ${results.length}`);
  console.log(`  有効なファイル: ${validCount}`);
  console.log(`  エラー数: ${errorCount}`);
  console.log(`  不一致数: ${inconsistencyCount}`);

  // Markdownレポートを出力
  console.log(`\n💾 レポートを保存: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, generateMarkdownReport(results), "utf-8");

  console.log("\n✅ 完了");
  console.log("=".repeat(50));

  if (errorCount > 0 || inconsistencyCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
