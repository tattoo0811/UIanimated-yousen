/**
 * 統合キャラクターインデックス作成ツール
 *
 * 全EPファイルとpersona/identity.mdファイルをパースし、
 * 統合JSONインデックス CHARACTER-INDEX.json を生成する。
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  CharacterIndex,
  IndexedCharacter,
  ParsedEPCharacter,
  ParsedIdentity,
} from "./audit-types.ts";
import {
  parseEPFile,
  parseIdentityFile,
  splitName,
  generateCharacterId,
  readingToRomaji,
  calculateAge,
} from "./audit-parse-utils.ts";

// ESMで__dirname互換
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルート
const ROOT = path.resolve(__dirname, "..");
const EP_DIR = path.join(ROOT, "novel/characters");
const PERSONA_DIR = path.join(EP_DIR, "personas");
const OUTPUT_FILE = path.join(EP_DIR, "CHARACTER-INDEX.json");

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
 * メイン処理
 */
async function main() {
  console.log("🔄 統合キャラクターインデックス作成ツール");
  console.log("=" .repeat(50));

  const characterMap = new Map<string, IndexedCharacter>();
  const epCharacters: ParsedEPCharacter[] = [];
  const personaMap = new Map<string, ParsedIdentity>();

  // ステップ1: EPファイルをパース
  console.log("\n📖 ステップ1: EPファイルをパース中...");
  for (const epFile of EP_FILES) {
    const filePath = path.join(EP_DIR, epFile);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  ファイルが存在しません: ${epFile}`);
      continue;
    }

    const characters = parseEPFile(filePath);
    console.log(`  ✓ ${epFile}: ${characters.length}キャラクター`);
    epCharacters.push(...characters);
  }

  // ステップ2: persona/identity.mdファイルをパース
  console.log("\n📖 ステップ2: persona/identity.mdをパース中...");
  const personaDirs = fs.readdirSync(PERSONA_DIR).filter((d) => {
    const dirPath = path.join(PERSONA_DIR, d);
    return fs.statSync(dirPath).isDirectory();
  });

  for (const dir of personaDirs) {
    const identityPath = path.join(PERSONA_DIR, dir, "identity.md");
    if (!fs.existsSync(identityPath)) {
      console.warn(`⚠️  identity.mdが存在しません: ${dir}`);
      continue;
    }

    const identity = parseIdentityFile(identityPath);
    if (identity) {
      personaMap.set(dir, identity);
    }
  }
  console.log(`  ✓ ${personaMap.size}個のidentity.mdをパース完了`);

  // ステップ3: キャラクターを統合
  console.log("\n🔄 ステップ3: キャラクターを統合中...");

  // まずEPキャラクターを追加
  for (const epChar of epCharacters) {
    const { surname, given } = splitName(epChar.name);
    const id = generateCharacterId(epChar.episodeNumber, surname, given);

    // 対応するpersonaを探す
    const matchedPersona = Array.from(personaMap.values()).find(
      (p) => p.name === epChar.name || p.episode === epChar.episodeNumber,
    );

    const indexedChar: IndexedCharacter = {
      id,
      episode: epChar.episodeNumber,
      name: {
        kanji: epChar.name,
        reading: matchedPersona?.reading || "",
        surname,
        given,
      },
      birthDate: epChar.birthDate || calculateBirthDate(epChar.age),
      age: epChar.age,
      occupation: epChar.occupation || "",
      family: epChar.family || "",
      gender: epChar.gender,
      hasPersona: !!matchedPersona,
      personaPath: matchedPersona?.personaPath,
    };

    characterMap.set(id, indexedChar);
  }

  // personaのみのキャラクターも追加（EPファイルにない場合）
  for (const [dir, identity] of personaMap) {
    const { surname, given } = splitName(identity.name);
    const id = generateCharacterId(identity.episode || "unknown", surname, given);

    if (!characterMap.has(id)) {
      characterMap.set(id, {
        id,
        episode: identity.episode || "unknown",
        name: {
          kanji: identity.name,
          reading: identity.reading,
          surname,
          given,
        },
        birthDate: identity.birthDate,
        age: identity.age,
        occupation: identity.occupation,
        family: identity.family,
        gender: identity.gender,
        hasPersona: true,
        personaPath: identity.personaPath,
      });
    }
  }

  // ステップ4: JSONインデックスを生成
  console.log("\n💾 ステップ4: JSONインデックスを生成中...");
  const index: CharacterIndex = {
    characters: Array.from(characterMap.values()).sort((a, b) => {
      const epA = parseInt(a.episode.replace(/\D/g, "")) || 0;
      const epB = parseInt(b.episode.replace(/\D/g, "")) || 0;
      return epA - epB || a.id.localeCompare(b.id);
    }),
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), "utf-8");

  // 統計情報
  console.log("\n📊 統計情報:");
  console.log(`  総キャラクター数: ${index.characters.length}`);
  console.log(`  persona有り: ${index.characters.filter((c) => c.hasPersona).length}`);
  console.log(`  persona無し: ${index.characters.filter((c) => !c.hasPersona).length}`);

  // 重複チェック（簡易）
  const nameMap = new Map<string, string[]>();
  for (const char of index.characters) {
    const key = char.name.kanji;
    if (!nameMap.has(key)) {
      nameMap.set(key, []);
    }
    nameMap.get(key)!.push(char.id);
  }

  const duplicates = Array.from(nameMap.entries())
    .filter(([_, ids]) => ids.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  if (duplicates.length > 0) {
    console.log("\n⚠️  名前の重複を検出:");
    for (const [name, ids] of duplicates.slice(0, 10)) {
      console.log(`  ${name}: ${ids.length}件 (${ids.join(", ")})`);
    }
  }

  console.log(`\n✅ インデックスを保存: ${OUTPUT_FILE}`);
  console.log("=" .repeat(50));
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
