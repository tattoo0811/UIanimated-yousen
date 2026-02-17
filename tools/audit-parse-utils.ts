/**
 * キャラクターデータ解析ユーティリティ
 */

import fs from "fs";
import path from "path";
import {
  ParsedEPCharacter,
  ParsedIdentity,
  IndexedCharacter,
} from "./audit-types.ts";

// 正規表現パターン（文字列として定義）
// 日本語の括弧をエスケープ
const LEFT_PAREN = "\\（";
const RIGHT_PAREN = "\\）";

const EP_SECTION_PATTERN = new RegExp(
  `^## EP(\\d+|11-20|21-30|31-40|41-50|51-60|61-70|71-80|81-90|91-100|101-120):\\s*([^\\n]+${LEFT_PAREN}(\\d+)歳・([^${RIGHT_PAREN}]+)${RIGHT_PAREN})`,
  "gm"
);

const TITLE_PATTERN = new RegExp(
  `^([^\\n\\（]+)\\（(\\d+)歳・([^\\）]+)\\）`
);

const BIRTH_DATE_PATTERN = /\*\*生年月日\*\*:\s*(\d{4})年(\d{1,2})月(\d{1,2})日/;

/**
 * EPファイルからキャラクターをパース
 */
export function parseEPFile(filePath: string): ParsedEPCharacter[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const characters: ParsedEPCharacter[] = [];

  // セクションごとに分割
  const sections = content.split(/^## /gm);

  for (const section of sections) {
    if (!section.trim()) continue;

    const epMatch = section.match(/^EP(\d+|11-20|21-30|31-40|41-50|51-60|61-70|71-80|81-90|91-100|101-120):\s*/);
    if (!epMatch) continue;

    const episodeNumber = epMatch[1];

    // セクションタイトルから名前を抽出: 高橋美咲（27歳・女性）
    const titleMatch = section.match(TITLE_PATTERN);
    if (!titleMatch) continue;

    let [, name, ageStr, genderStr] = titleMatch;
    // 名前からEPプレフィックスを削除（例: "EP1: 高橋美咲" -> "高橋美咲"）
    name = name.replace(/^EP\d+:\s*/, "").trim();
    const age = parseInt(ageStr, 10);
    const gender = genderStr.includes("男") ? "male" : "female";

    // 生年月日を抽出
    const birthDateMatch = section.match(BIRTH_DATE_PATTERN);
    let birthDate: string | undefined;
    if (birthDateMatch) {
      const [, year, month, day] = birthDateMatch;
      birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // 職業を抽出（複数のパターンを試す）
    let occupation = "";
    const occupationMatch = section.match(/\*\*職業\*\*:\s*([^\n]+)/) ||
                           section.match(/職業[:：]\s*([^\n]+)/);
    if (occupationMatch) {
      occupation = occupationMatch[1].trim();
    }

    // 家族構成を抽出
    let family = "";
    const familyMatch = section.match(/\（([^）]+)\）/);
    if (familyMatch) {
      family = familyMatch[1];
    }

    characters.push({
      episodeNumber,
      name: name.trim(),
      age,
      gender,
      birthDate,
      occupation,
      family,
      rawText: section.substring(0, 500), // 最初の500文字を保存
    });
  }

  return characters;
}

/**
 * Identity.mdファイルから情報をパース
 */
export function parseIdentityFile(filePath: string): ParsedIdentity | null {
  const content = fs.readFileSync(filePath, "utf-8");

  // EP番号を抽出（ヘッダーから）
  const epMatch = content.match(/\>\s*\*\*EP(\d+)患者\*\*/);
  const episode = epMatch ? epMatch[1] : "";

  // 性別を抽出（ヘッダーから）
  const headerGenderMatch = content.match(/\|\s*\d+歳・(男性|女性)\s*\|/);
  const genderFromHeader = headerGenderMatch
    ? headerGenderMatch[1] === "男性" ? "male" : "female"
    : "unknown";

  // テーブル形式のidentity.mdかどうかを判定
  const isTableFormat = content.includes("| 項目 | 値 |");

  if (isTableFormat) {
    // テーブル形式のパース（tetsuda-tsuyoshiなど）
    // 名前をタイトルから抽出
    const titleMatch = content.match(/^#\s*[^\n]+──\s*identity\.md/);
    const titleNameMatch = content.match(/^#([^\n（]+)/);
    const name = titleNameMatch ? titleNameMatch[1].trim() : "";

    // 読みを抽出
    const readingMatch = content.match(/\（([ぁ-ん\u3042-\u3093]+\s+[ぁ-ん\u3042-\u3093]+)\）/);
    const reading = readingMatch ? readingMatch[1] : "";

    // 生年月日を抽出（テーブルから）
    const birthDateMatch = content.match(/\|\s*生年月日\s*\|\s*(\d{4})年(\d{1,2})月(\d{1,2})日\s*\|/);
    if (!birthDateMatch) return null;
    const [, year, month, day] = birthDateMatch;
    const birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    // 年齢を抽出（テーブルから）
    const ageMatch = content.match(/\|\s*年齢.*?\|\s*(\d+)歳/);
    const age = ageMatch ? parseInt(ageMatch[1], 10) : 0;

    // 性別を抽出（テーブルから）
    const genderMatch = content.match(/\|\s*性別\s*\|\s*(男性|女性)\s*\|/);
    const gender = genderMatch
      ? genderMatch[1] === "男性" ? "male" : "female"
      : genderFromHeader;

    // 職業を抽出（テーブルから）
    const occupationMatch = content.match(/\|\s*職業\s*\|\s*([^\n|]+)\s*\|/);
    const occupation = occupationMatch ? occupationMatch[1].trim() : "";

    // 出身を抽出（テーブルから）
    const birthplaceMatch = content.match(/\|\s*出身\s*\|\s*([^\n|]+)\s*\|/);
    const birthplace = birthplaceMatch ? birthplaceMatch[1].trim() : "";

    // 家族構成（テーブル形式の場合は空）
    const family = "";

    // personaディレクトリ名を取得
    const personaDir = path.basename(path.dirname(filePath));

    return {
      name,
      reading,
      birthDate,
      age,
      gender,
      occupation,
      birthplace,
      family,
      episode,
      personaPath: `novel/characters/personas/${personaDir}`,
    };
  }

  // リスト形式のパース（kujo-meguruなど）
  // 名前を抽出
  const nameMatch = content.match(/-\s*\*\*名前\*\*:\s*([^\n]+)/);
  if (!nameMatch) return null;
  const name = nameMatch[1].trim();

  // 読みを抽出
  const readingMatch = content.match(/\（([ぁ-ん\u3042-\u3093]+\s+[ぁ-ん\u3042-\u3093]+)\）/);
  const reading = readingMatch ? readingMatch[1] : "";

  // 生年月日を抽出
  const birthDateMatch = content.match(/\*\*生年月日\*\*:\s*(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!birthDateMatch) return null;
  const [, year, month, day] = birthDateMatch;
  const birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

  // 年齢を抽出
  const ageMatch = content.match(/\*\*年齢\*\*:\s*(\d+)歳/);
  const age = ageMatch ? parseInt(ageMatch[1], 10) : 0;

  // 性別を抽出（リストにはないのでヘッダーから）
  const gender = genderFromHeader;

  // 職業を抽出
  const occupationMatch = content.match(/\*\*職業\*\*:\s*([^\n]+)/);
  const occupation = occupationMatch ? occupationMatch[1].trim() : "";

  // 出身を抽出
  const birthplaceMatch = content.match(/\*\*出身\*\*:\s*([^\n]+)/);
  const birthplace = birthplaceMatch ? birthplaceMatch[1].trim() : "";

  // 家族構成を抽出
  const familyMatch = content.match(/\*\*家族構成\*\*:\s*([^\n]+(?:\n\s{2,}-[^\n]+)*)/);
  let family = "";
  if (familyMatch) {
    // 複数行の家族構成を結合
    family = familyMatch[1].trim().replace(/\n\s*-\s*/g, ", ");
  }

  // personaディレクトリ名を取得
  const personaDir = path.basename(path.dirname(filePath));

  return {
    name,
    reading,
    birthDate,
    age,
    gender,
    occupation,
    birthplace,
    family,
    episode,
    personaPath: `novel/characters/personas/${personaDir}`,
  };
}

/**
 * 名前を苗字と名前に分割
 */
export function splitName(
  fullName: string,
): { surname: string; given: string } {
  // スペースがある場合はスペースで分割
  if (fullName.includes(" ")) {
    const parts = fullName.split(" ");
    return { surname: parts[0], given: parts.slice(1).join(" ") };
  }

  // 日本語の名前の推測（最初の1-2文字が苗字）
  if (fullName.length <= 2) {
    return { surname: fullName, given: "" };
  }

  // 一般的な苗字の長さ（1-2文字）
  for (let i = 2; i >= 1; i--) {
    if (fullName.length > i) {
      return { surname: fullName.substring(0, i), given: fullName.substring(i) };
    }
  }

  return { surname: fullName, given: "" };
}

/**
 * キャラクターIDを生成
 */
export function generateCharacterId(
  episode: string,
  surname: string,
  given: string,
): string {
  const cleanSurname = surname.toLowerCase().replace(/[^a-z]/g, "");
  const cleanGiven = given.toLowerCase().replace(/[^a-z]/g, "");
  return `ep${episode}-${cleanSurname}-${cleanGiven}`;
}

/**
 * 読みがなをローマ字に変換（簡易版）
 */
export function readingToRomaji(reading: string): string {
  const kanaToRomaji: Record<string, string> = {
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
    "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "を": "wo", "ん": "n",
    "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
    "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
    "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
    "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
    "ゃ": "", "ゅ": "", "ょ": "", "っ": "",
    "ー": "-",
  };

  let result = reading.toLowerCase();
  for (const [kana, romaji] of Object.entries(kanaToRomaji)) {
    result = result.replace(new RegExp(kana, "g"), romaji);
  }

  return result.replace(/\s+/g, "-");
}

/**
 * 年齢から生年月日を計算（2026年時点）
 */
export function calculateBirthDate(age: number): string {
  const currentYear = 2026;
  const birthYear = currentYear - age;
  // 誕生日を過ぎているかどうかわからないので、簡易的に1月1日とする
  return `${birthYear}-01-01`;
}

/**
 * 生年月日から年齢を計算（2026年時点）
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const current = new Date("2026-04-01");
  let age = current.getFullYear() - birth.getFullYear();
  const monthDiff = current.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && current.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
