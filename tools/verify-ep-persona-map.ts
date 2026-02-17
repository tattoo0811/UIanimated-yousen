/**
 * EP-Personaマッピング検証ツール
 *
 * EPキャラクターとpersonaディレクトリの双方向マッピング検証。
 * 孤立したpersonaの検出、personaがないキャラクターの検出。
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  MappingValidation,
  MappingError,
} from "./audit-types.ts";
import { parseEPFile, parseIdentityFile, splitName } from "./audit-parse-utils.ts";

// ESMで__dirname互換
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルート
const ROOT = path.resolve(__dirname, "..");
const EP_DIR = path.join(ROOT, "novel/characters");
const PERSONA_DIR = path.join(EP_DIR, "personas");
const OUTPUT_FILE = path.join(
  EP_DIR,
  `AUDIT-MAPPING-${new Date().toISOString().split("T")[0]}.md`,
);

// EPファイルのリスト
const EP_FILES = [
  "ep1-10.md",
  "ep11-20.md",
  "ep21-30.md",
  "ep31-40.md",
  "ep41-50.md",
  "ep51-60.md",
  "ep61-70.md",
  "ep71-80.md",
  "ep81-90.md",
  "ep91-100.md",
  "ep101-120.md",
];

/**
 * マッピングを検証
 */
function validateMapping(): MappingValidation {
  const result: MappingValidation = {
    charactersInEp: 0,
    personasFound: 0,
    orphanedPersonas: [],
    missingPersonas: [],
    mappingErrors: [],
  };

  const epCharacters = new Map<string, string>(); // name -> episode
  const personaCharacters = new Map<string, string>(); // name -> personaDir

  // ステップ1: EPファイルからキャラクターを抽出
  for (const epFile of EP_FILES) {
    const filePath = path.join(EP_DIR, epFile);
    if (!fs.existsSync(filePath)) continue;

    const characters = parseEPFile(filePath);
    for (const char of characters) {
      const key = char.name;
      epCharacters.set(key, char.episodeNumber);
      result.charactersInEp++;
    }
  }

  // ステップ2: personaディレクトリからキャラクターを抽出
  const personaDirs = fs.readdirSync(PERSONA_DIR).filter((d) => {
    const dirPath = path.join(PERSONA_DIR, d);
    return fs.statSync(dirPath).isDirectory();
  });

  for (const dir of personaDirs) {
    const identityPath = path.join(PERSONA_DIR, dir, "identity.md");
    if (!fs.existsSync(identityPath)) continue;

    const identity = parseIdentityFile(identityPath);
    if (identity) {
      personaCharacters.set(identity.name, dir);
      result.personasFound++;
    }
  }

  // ステップ3: 孤立したpersonaを検出（EPにいないpersona）
  for (const [name, dir] of personaCharacters) {
    if (!epCharacters.has(name)) {
      result.orphanedPersonas.push(`${name} (${dir})`);
    }
  }

  // ステップ4: personaがないキャラクターを検出
  for (const [name, episode] of epCharacters) {
    if (!personaCharacters.has(name)) {
      result.missingPersonas.push(`${name} (EP${episode})`);
    }
  }

  // ステップ5: マッピングエラーを検出（EP番号の不一致など）
  for (const [name, dir] of personaCharacters) {
    const identityPath = path.join(PERSONA_DIR, dir, "identity.md");
    const identity = parseIdentityFile(identityPath);

    if (identity && identity.episode) {
      const epFromName = epCharacters.get(name);
      if (epFromName && epFromName !== identity.episode) {
        result.mappingErrors.push({
          epFile: `ep${epFromName}*.md`,
          characterName: name,
          expectedPersona: `EP${identity.episode}`,
          actualPersona: `EP${epFromName}`,
        });
      }
    }
  }

  return result;
}

/**
 * Markdownレポートを生成
 */
function generateMarkdownReport(result: MappingValidation): string {
  const lines: string[] = [];

  lines.push("# EP-Personaマッピング検証レポート");
  lines.push("");
  lines.push(
    `> 生成日時: ${new Date().toLocaleString("ja-JP")}`,
  );
  lines.push("");

  // サマリー
  lines.push("## サマリー");
  lines.push("");
  lines.push(`| 項目 | 数値 |`);
  lines.push(`|------|------|`);
  lines.push(`| EPキャラクター数 | ${result.charactersInEp} |`);
  lines.push(`| Personaディレクトリ数 | ${result.personasFound} |`);
  lines.push(`| 孤立したPersona | ${result.orphanedPersonas.length} |`);
  lines.push(`| 欠損Persona | ${result.missingPersonas.length} |`);
  lines.push(`| マッピングエラー | ${result.mappingErrors.length} |`);
  lines.push("");

  // 孤立したPersona
  if (result.orphanedPersonas.length > 0) {
    lines.push("## 孤立したPersona（EPにいない）");
    lines.push("");
    lines.push(
      "これらのキャラクターはpersonaディレクトリに存在しますが、EPファイルに見つかりません。",
    );
    lines.push("");
    for (const orphan of result.orphanedPersonas) {
      lines.push(`- ${orphan}`);
    }
    lines.push("");
  }

  // 欠損Persona
  if (result.missingPersonas.length > 0) {
    lines.push("## 欠損Persona（personaディレクトリがない）");
    lines.push("");
    lines.push(
      "これらのキャラクターはEPファイルに存在しますが、personaディレクトリがありません。",
    );
    lines.push("");
    for (const missing of result.missingPersonas) {
      lines.push(`- ${missing}`);
    }
    lines.push("");
  }

  // マッピングエラー
  if (result.mappingErrors.length > 0) {
    lines.push("## マッピングエラー（EP番号の不一致など）");
    lines.push("");
    for (const error of result.mappingErrors) {
      lines.push(
        `- ${error.characterName}: ${error.expectedPersona} expected, ${error.actualPersona} found`,
      );
    }
    lines.push("");
  }

  // 正常なマッピング
  const validCount = result.personasFound - result.orphanedPersonas.length;
  if (validCount > 0) {
    lines.push("## 正常なマッピング");
    lines.push("");
    lines.push(`${validCount}個のキャラクターで正しくマッピングされています。`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * メイン処理
 */
async function main() {
  console.log("🔄 EP-Personaマッピング検証ツール");
  console.log("=".repeat(50));

  console.log("\n🔍 検証中...");
  const result = validateMapping();

  console.log(`\n📊 検証結果:`);
  console.log(`  EPキャラクター数: ${result.charactersInEp}`);
  console.log(`  Personaディレクトリ数: ${result.personasFound}`);
  console.log(`  孤立したPersona: ${result.orphanedPersonas.length}`);
  console.log(`  欠損Persona: ${result.missingPersonas.length}`);
  console.log(`  マッピングエラー: ${result.mappingErrors.length}`);

  // Markdownレポートを出力
  console.log(`\n💾 レポートを保存: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, generateMarkdownReport(result), "utf-8");

  console.log("\n✅ 完了");
  console.log("=".repeat(50));

  if (
    result.orphanedPersonas.length > 0 ||
    result.missingPersonas.length > 0 ||
    result.mappingErrors.length > 0
  ) {
    console.log("\n⚠️  マッピング問題が検出されました。レポートを確認してください。");
  }
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
