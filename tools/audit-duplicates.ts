/**
 * 拡張重複検出ツール
 *
 * 完全一致・部分一致・読み一致を検出し、
 * 職業・家族構成の類似性も検出する。
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  CharacterIndex,
  DuplicateReport,
  ExactDuplicate,
  PartialDuplicate,
  SimilarSettings,
} from "./audit-types.ts";
import { splitName, readingToRomaji } from "./audit-parse-utils.ts";

// ESMで__dirname互換
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルート
const ROOT = path.resolve(__dirname, "..");
const EP_DIR = path.join(ROOT, "novel/characters");
const INDEX_FILE = path.join(EP_DIR, "CHARACTER-INDEX.json");
const OUTPUT_FILE = path.join(
  EP_DIR,
  `AUDIT-DUPLICATES-${new Date().toISOString().split("T")[0]}.md`,
);

/**
 * 読みの類似度を計算（レーベンシュタイン距離）
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // 挿入
        matrix[j - 1][i] + 1, // 削除
        matrix[j - 1][i - 1] + cost, // 置換
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * 読みが類似しているか判定
 */
function isReadingSimilar(a: string, b: string): boolean {
  const romajiA = readingToRomaji(a);
  const romajiB = readingToRomaji(b);
  const distance = levenshteinDistance(romajiA, romajiB);
  const maxLen = Math.max(romajiA.length, romajiB.length);
  return maxLen > 0 && distance / maxLen <= 0.4; // 40%以内の差異
}

/**
 * 職業が類似しているか判定
 */
function isOccupationSimilar(a: string, b: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[\s・，、]/g, "");
  const normA = normalize(a);
  const normB = normalize(b);

  // 完全一致
  if (normA === normB) return true;

  // 片方がもう片方を含む
  if (normA.includes(normB) || normB.includes(normA)) return true;

  // よくある職業クラスター
  const occupationClusters = [
    ["教師", "教員", "講師", "先生"],
    ["医者", "医師", "ドクター"],
    ["クリエイター", "デザイナー", "イラストレーター"],
    ["エンジニア", "プログラマー", "開発者"],
    ["工場", "作業員", "社員"],
  ];

  for (const cluster of occupationClusters) {
    const aInCluster = cluster.some((k) => normA.includes(k));
    const bInCluster = cluster.some((k) => normB.includes(k));
    if (aInCluster && bInCluster) return true;
  }

  return false;
}

/**
 * 家族構成が類似しているか判定
 */
function isFamilySimilar(a: string, b: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[\s・，、]/g, "");

  // シングルマザー/シングルファーザー
  const aSingle = normalize(a).includes("ひとり") ||
                  normalize(a).includes("シングル") ||
                  normalize(a).includes("離婚");
  const bSingle = normalize(b).includes("ひとり") ||
                  normalize(b).includes("シングル") ||
                  normalize(b).includes("離婚");

  return aSingle && bSingle;
}

/**
 * 重複レポートを生成
 */
function generateDuplicateReport(index: CharacterIndex): DuplicateReport {
  const report: DuplicateReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalCharacters: index.characters.length,
      duplicatesFound: 0,
      priority1: 0,
      priority2: 0,
      priority3: 0,
    },
    priority1: [],
    priority2: [],
    priority3: [],
  };

  const chars = index.characters;

  // Priority 1: 完全な名前重複
  const nameGroups = new Map<string, typeof chars>();
  for (const char of chars) {
    const key = char.name.kanji;
    if (!nameGroups.has(key)) {
      nameGroups.set(key, []);
    }
    nameGroups.get(key)!.push(char);
  }

  for (const [name, characters] of nameGroups) {
    if (characters.length > 1) {
      const ids = characters.map((c) => `${c.id} (${c.name.kanji})`);
      report.priority1.push({
        type: "完全一致",
        characters: ids,
        field: "名前",
        details: `完全に同じ名前: ${name}`,
      });
      report.summary.priority1++;
    }
  }

  // Priority 2: 部分一致
  const surnameGroups = new Map<string, typeof chars>();
  const givenGroups = new Map<string, typeof chars>();
  const readingGroups = new Map<string, typeof chars>();

  for (const char of chars) {
    const { surname, given } = char.name;

    // 苗字グループ
    if (!surnameGroups.has(surname)) {
      surnameGroups.set(surname, []);
    }
    surnameGroups.get(surname)!.push(char);

    // 名前グループ
    if (given && !givenGroups.has(given)) {
      givenGroups.set(given, []);
    }
    if (given) {
      givenGroups.get(given)!.push(char);
    }

    // 読みグループ
    if (char.name.reading) {
      if (!readingGroups.has(char.name.reading)) {
        readingGroups.set(char.name.reading, []);
      }
      readingGroups.get(char.name.reading)!.push(char);
    }
  }

  // 苗字の重複（2人以上で、かつ完全重複でないもの）
  for (const [surname, characters] of surnameGroups) {
    if (characters.length > 1 && surname.length >= 2) {
      // 完全重複は除外
      const filtered = characters.filter(
        (c) => !report.priority1.some((p) => p.characters.includes(c.id)),
      );
      if (filtered.length > 1) {
        const ids = filtered.map((c) => `${c.id} (${c.name.kanji})`);
        report.priority2.push({
          type: "部分一致",
          characters: ids,
          field: "同じ苗字",
          details: `同じ苗字: ${surname} (${filtered.length}人)`,
        });
        report.summary.priority2++;
      }
    }
  }

  // 名前の重複
  for (const [given, characters] of givenGroups) {
    if (characters.length > 1) {
      const filtered = characters.filter(
        (c) => !report.priority1.some((p) => p.characters.includes(c.id)),
      );
      if (filtered.length > 1) {
        const ids = filtered.map((c) => `${c.id} (${c.name.kanji})`);
        report.priority2.push({
          type: "部分一致",
          characters: ids,
          field: "同じ名前",
          details: `同じ名前: ${given} (${filtered.length}人)`,
        });
        report.summary.priority2++;
      }
    }
  }

  // 読みの類似
  for (const [reading, characters] of readingGroups) {
    if (characters.length > 1) {
      const filtered = characters.filter(
        (c) => !report.priority1.some((p) => p.characters.includes(c.id)),
      );
      if (filtered.length > 1) {
        const ids = filtered.map((c) => `${c.id} (${c.name.kanji})`);
        report.priority2.push({
          type: "部分一致",
          characters: ids,
          field: "同じ読み",
          details: `同じ読み: ${reading}`,
        });
        report.summary.priority2++;
      }
    }
  }

  // Priority 3: 設定類似
  // 職業の類似
  const occupationGroups = new Map<string, typeof chars>();
  for (const char of chars) {
    if (!char.occupation) continue;
    const key = char.occupation.toLowerCase().split(" ")[0]; // 最初の語
    if (!occupationGroups.has(key)) {
      occupationGroups.set(key, []);
    }
    occupationGroups.get(key)!.push(char);
  }

  for (const [occ, characters] of occupationGroups) {
    if (characters.length > 1) {
      // 完全重複・部分重複を除外
      const filtered = characters.filter(
        (c) =>
          !report.priority1.some((p) => p.characters.includes(c.id)) &&
          !report.priority2.some((p) => p.characters.includes(c.id)),
      );
      if (filtered.length > 1) {
        const ids = filtered.map((c) => `${c.id} (${c.name.kanji})`);
        report.priority3.push({
          type: "設定類似",
          characters: ids,
          field: "職業",
          details: `同じ職業: ${occ} (${filtered.length}人)`,
        });
        report.summary.priority3++;
      }
    }
  }

  // 家族構成の類似（シングルマザー等）
  const singleParents = chars.filter((c) =>
    c.family.toLowerCase().includes("ひとり") ||
    c.family.toLowerCase().includes("シングル") ||
    c.family.toLowerCase().includes("離婚")
  );

  if (singleParents.length > 1) {
    const ids = singleParents.map((c) => `${c.id} (${c.name.kanji})`);
    report.priority3.push({
      type: "設定類似",
      characters: ids,
      field: "家族構成",
      details: `ひとり親/シングルマザー: ${singleParents.length}人`,
    });
    report.summary.priority3++;
  }

  report.summary.duplicatesFound =
    report.summary.priority1 + report.summary.priority2 + report.summary.priority3;

  return report;
}

/**
 * レポートをMarkdown形式で出力
 */
function outputMarkdownReport(report: DuplicateReport): string {
  const lines: string[] = [];

  lines.push("# キャラクター重複監査レポート");
  lines.push("");
  lines.push(
    `> 生成日時: ${new Date(report.generatedAt).toLocaleString("ja-JP")}`,
  );
  lines.push("");

  lines.push("## サマリー");
  lines.push("");
  lines.push(`| 項目 | 数値 |`);
  lines.push(`|------|------|`);
  lines.push(`| 総キャラクター数 | ${report.summary.totalCharacters} |`);
  lines.push(
    `| 重複検出数 | ${report.summary.duplicatesFound} |`,
  );
  lines.push(
    `| Priority 1 (完全一致) | ${report.summary.priority1} |`,
  );
  lines.push(
    `| Priority 2 (部分一致) | ${report.summary.priority2} |`,
  );
  lines.push(
    `| Priority 3 (設定類似) | ${report.summary.priority3} |`,
  );
  lines.push("");

  // Priority 1
  if (report.priority1.length > 0) {
    lines.push("## Priority 1: 完全一致（要修正）");
    lines.push("");
    lines.push(
      "完全に同じ名前のキャラクターが存在します。物語の矛盾を避けるため、修正が必要です。",
    );
    lines.push("");

    for (const dup of report.priority1) {
      lines.push(`### ${dup.details}`);
      lines.push("");
      lines.push("**対象キャラクター:**");
      for (const char of dup.characters) {
        lines.push(`- ${char}`);
      }
      lines.push("");
    }
  }

  // Priority 2
  if (report.priority2.length > 0) {
    lines.push("## Priority 2: 部分一致（要検証）");
    lines.push("");
    lines.push(
      "同じ苗字、名前、または読みを持つキャラクターが存在します。",
    );
    lines.push("");

    for (const dup of report.priority2) {
      lines.push(`### ${dup.details}`);
      lines.push("");
      lines.push("**対象キャラクター:**");
      for (const char of dup.characters) {
        lines.push(`- ${char}`);
      }
      lines.push("");
    }
  }

  // Priority 3
  if (report.priority3.length > 0) {
    lines.push("## Priority 3: 設定類似（要確認）");
    lines.push("");
    lines.push(
      "職業や家族構成が類似しているキャラクターが存在します。",
    );
    lines.push("");

    for (const dup of report.priority3) {
      lines.push(`### ${dup.details}`);
      lines.push("");
      lines.push("**対象キャラクター:**");
      for (const char of dup.characters) {
        lines.push(`- ${char}`);
      }
      lines.push("");
    }
  }

  // 修正推奨事項
  lines.push("## 修正推奨事項");
  lines.push("");
  lines.push(
    "### 優先度の高い修正対象",
  );
  lines.push("");
  lines.push("1. **完全一致**: 可能な限り早期に改名を検討してください。");
  lines.push(
    "2. **部分一致**: 物語上の関係性を考慮し、必要に応じて修正してください。",
  );
  lines.push(
    "3. **設定類似**: キャラクターの個性を高めるため、設定を差別化してください。",
  );
  lines.push("");

  return lines.join("\n");
}

/**
 * メイン処理
 */
async function main() {
  console.log("🔄 拡張重複検出ツール");
  console.log("=".repeat(50));

  // インデックスファイルを読み込み
  if (!fs.existsSync(INDEX_FILE)) {
    console.error(
      `❌ インデックスファイルが見つかりません: ${INDEX_FILE}`,
    );
    console.log(
      "まずは npx tsx tools/audit-build-character-index.ts を実行してください。",
    );
    process.exit(1);
  }

  const indexContent = fs.readFileSync(INDEX_FILE, "utf-8");
  const index: CharacterIndex = JSON.parse(indexContent);

  console.log(`📊 キャラクター数: ${index.characters.length}`);

  // 重複検出
  console.log("\n🔍 重複を検出中...");
  const report = generateDuplicateReport(index);

  console.log(`\n📊 検出結果:`);
  console.log(`  Priority 1 (完全一致): ${report.summary.priority1}`);
  console.log(`  Priority 2 (部分一致): ${report.summary.priority2}`);
  console.log(`  Priority 3 (設定類似): ${report.summary.priority3}`);
  console.log(`  合計: ${report.summary.duplicatesFound}`);

  // Markdownレポートを出力
  console.log(`\n💾 レポートを保存: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, outputMarkdownReport(report), "utf-8");

  console.log("\n✅ 完了");
  console.log("=".repeat(50));
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
