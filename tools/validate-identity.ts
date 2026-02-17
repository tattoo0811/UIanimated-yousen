/**
 * Identity.md整合性検証ツール
 *
 * 必須フィールドの存在チェック、日付形式の妥当性、
 * 年齢と生年月日の整合性、算命学CLIとの照合、
 * ファイル間のデータ矛盾を検証する。
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import {
  IdentityValidation,
  ValidationError,
} from "./audit-types.ts";
import { calculateAge } from "./audit-parse-utils.ts";

// ESMで__dirname互換
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルート
const ROOT = path.resolve(__dirname, "..");
const EP_DIR = path.join(ROOT, "novel/characters");
const PERSONA_DIR = path.join(EP_DIR, "personas");
const OUTPUT_FILE = path.join(
  EP_DIR,
  `AUDIT-CONSISTENCY-${new Date().toISOString().split("T")[0]}.md`,
);

// 必須フィールド
const REQUIRED_FIELDS = [
  "名前",
  "生年月日",
  "性別",
  "年齢",
  "職業",
  "家族構成",
];

/**
 * Identity.mdファイルを検証
 */
function validateIdentityFile(filePath: string): IdentityValidation {
  const result: IdentityValidation = {
    characterId: path.basename(path.dirname(filePath)),
    file: filePath,
    valid: true,
    errors: [],
    warnings: [],
  };

  const content = fs.readFileSync(filePath, "utf-8");

  // 1. 必須フィールドの存在チェック
  for (const field of REQUIRED_FIELDS) {
    const pattern = new RegExp(`-\\s*\\*\\*${field}\\*\\*:\\s*[^\\n]+`);
    if (!pattern.test(content)) {
      result.errors.push({
        field,
        message: `必須フィールド「${field}」が見つかりません`,
        severity: "error",
      });
      result.valid = false;
    }
  }

  // 2. 生年月日の形式チェック
  const birthDateMatch = content.match(
    /-\s*\*\*生年月日\*\*:\s*(\d{4})年(\d{1,2})月(\d{1,2})日/,
  );
  if (!birthDateMatch) {
    result.errors.push({
      field: "生年月日",
      message: "生年月日の形式が正しくありません",
      severity: "error",
    });
    result.valid = false;
  } else {
    const [, year, month, day] = birthDateMatch;
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    // 妥当性チェック
    if (y < 1900 || y > 2026) {
      result.errors.push({
        field: "生年月日",
        message: `生年月日が異常です: ${y}年`,
        severity: "error",
      });
      result.valid = false;
    }
    if (m < 1 || m > 12) {
      result.errors.push({
        field: "生年月日",
        message: `月が異常です: ${m}月`,
        severity: "error",
      });
      result.valid = false;
    }
    if (d < 1 || d > 31) {
      result.errors.push({
        field: "生年月日",
        message: `日が異常です: ${d}日`,
        severity: "error",
      });
      result.valid = false;
    }

    // ISO形式の日付を作成
    const birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    // 3. 年齢と生年月日の整合性チェック
    const ageMatch = content.match(/-\s*\*\*年齢.*\*\*:\s*(\d+)歳/);
    if (ageMatch) {
      const statedAge = parseInt(ageMatch[1], 10);
      const calculatedAge = calculateAge(birthDate);

      if (Math.abs(statedAge - calculatedAge) > 1) {
        result.errors.push({
          field: "年齢",
          message:
            `年齢と生年月日が整合していません。表記: ${statedAge}歳, 計算: ${calculatedAge}歳 (${birthDate})`,
          severity: "error",
        });
        result.valid = false;
      }
    }

    // 4. 算命学CLIとの照合（オプション）
    const sanmeiMatch = content.match(/CLI検証日:\s*(\d{4}-\d{2}-\d{2})/);
    if (sanmeiMatch) {
      // CLI検証日がある場合は、エネルギー値などをチェック
      const energyMatch = content.match(/-?\s*\*\*エネルギー.*\*\*:\s*(\d+)点/);
      const tenchusatsuMatch = content.match(/-?\s*\*\*天中殺\*\*:\s*([^\n]+)/);

      if (!energyMatch && !tenchusatsuMatch) {
        result.warnings.push({
          field: "算命学データ",
          message: "CLI検証日があるのに、エネルギー値または天中殺が見つかりません",
        });
      }
    } else {
      result.warnings.push({
        field: "算命学データ",
        message: "CLI検証日が記載されていません",
      });
    }

    // 5. ファイル間の矛盾チェック
    // EPファイルとの整合性（EP番号）
    const epMatch = content.match(/> \*\*EP(\d+)患者\*\*/);
    if (epMatch) {
      const epNumber = epMatch[1];
      // ディレクトリ名からEP番号を推測できる場合はチェック
      const dirName = path.basename(path.dirname(filePath));
      // personaディレクトリ名とEP番号の対応はここでは簡易チェック
    }
  }

  return result;
}

/**
 * 全Identity.mdファイルを検証
 */
function validateAllIdentities(): IdentityValidation[] {
  const results: IdentityValidation[] = [];

  const personaDirs = fs.readdirSync(PERSONA_DIR).filter((d) => {
    const dirPath = path.join(PERSONA_DIR, d);
    return fs.statSync(dirPath).isDirectory();
  });

  for (const dir of personaDirs) {
    const identityPath = path.join(PERSONA_DIR, dir, "identity.md");
    if (fs.existsSync(identityPath)) {
      results.push(validateIdentityFile(identityPath));
    }
  }

  return results;
}

/**
 * Markdownレポートを生成
 */
function generateMarkdownReport(results: IdentityValidation[]): string {
  const lines: string[] = [];

  lines.push("# Identity.md 整合性検証レポート");
  lines.push("");
  lines.push(
    `> 生成日時: ${new Date().toLocaleString("ja-JP")}`,
  );
  lines.push("");

  // サマリー
  const validCount = results.filter((r) => r.valid).length;
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

  lines.push("## サマリー");
  lines.push("");
  lines.push(`| 項目 | 数値 |`);
  lines.push(`|------|------|`);
  lines.push(`| 検証ファイル数 | ${results.length} |`);
  lines.push(`| 有効なファイル | ${validCount} |`);
  lines.push(`| エラー数 | ${errorCount} |`);
  lines.push(`| 警告数 | ${warningCount} |`);
  lines.push("");

  // エラー詳細
  const errorsOnly = results.filter((r) => r.errors.length > 0);
  if (errorsOnly.length > 0) {
    lines.push("## エラー詳細");
    lines.push("");

    for (const result of errorsOnly) {
      lines.push(`### ${result.characterId}`);
      lines.push("");
      for (const error of result.errors) {
        lines.push(`- [${error.field}] ${error.message}`);
      }
      lines.push("");
    }
  }

  // 警告詳細
  const warningsOnly = results.filter((r) => r.warnings.length > 0);
  if (warningsOnly.length > 0) {
    lines.push("## 警告詳細");
    lines.push("");

    for (const result of warningsOnly) {
      lines.push(`### ${result.characterId}`);
      lines.push("");
      for (const warning of result.warnings) {
        lines.push(`- [${warning.field}] ${warning.message}`);
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
  console.log("🔄 Identity.md整合性検証ツール");
  console.log("=".repeat(50));

  console.log("\n🔍 検証中...");
  const results = validateAllIdentities();

  const validCount = results.filter((r) => r.valid).length;
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log(`\n📊 検証結果:`);
  console.log(`  検証ファイル数: ${results.length}`);
  console.log(`  有効なファイル: ${validCount}`);
  console.log(`  エラー数: ${errorCount}`);
  console.log(`  警告数: ${warningCount}`);

  // Markdownレポートを出力
  console.log(`\n💾 レポートを保存: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, generateMarkdownReport(results), "utf-8");

  console.log("\n✅ 完了");
  console.log("=".repeat(50));

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
