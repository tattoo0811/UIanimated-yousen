/**
 * 全キャラクター再計算スクリプト
 *
 * 目的:
 * 1. 全キャラクターにデフォルト時刻（12:00）を設定
 * 2. accurate-logicで正しいsanmeigakuデータを計算
 * 3. 更新されたJSONファイルを出力
 */

import { calculateBaZi, calculateYangSen } from '../accurate-logic/src/index';
import * as fs from 'fs';
import * as path from 'path';

interface Character {
  episode: number;
  name: string;
  name_reading: string;
  age: number;
  birth_date: string;
  birth_time?: string;
  occupation: string;
  economic: {
    income: string;
    assets: string;
  };
  family: string;
  sns: {
    twitter: boolean;
    instagram: boolean;
    tiktok: boolean;
  };
  worry: string;
  sanmeigaku: {
    nikkan: string;
    gesshi: string;
    tenchusatsu: string;
    jugdais: string[];
    junidai: string[];
    five_elements: string;
    total_energy: number;
  };
}

interface RecalculatedCharacter extends Character {
  birth_time: string;
  sanmeigaku_updated: true;
}

/**
 * EPISODES-25-48用: birthDateをDateに変換
 */
function parseBirthDate2548(birthDate: string): Date {
  // ISO形式: "1995-03-15T14:30:00"
  return new Date(birthDate);
}

/**
 * EPISODES-25-48用: キャラクターを再計算
 */
function recalculateCharacter2548(char: any): any {
  const birthDate = parseBirthDate2548(char.birthDate);

  // accurate-logicで計算
  const bazi = calculateBaZi(birthDate, 135);
  const yangsen = calculateYangSen(bazi, birthDate);

  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

  console.log(`エピソード${char.episode}: ${char.name} → 日干:${nikkan}, 日支:${gesshi}, 天中殺:${tenchusatsu}`);

  // YangSen型からkanshiData形式に変換
  const jugdais = [
    yangsen.chest,
    yangsen.belly,
    yangsen.rightHand,
    yangsen.leftHand,
    yangsen.head
  ];

  const junidai = [
    yangsen.leftLeg.name,
    yangsen.rightLeg.name,
    yangsen.leftShoulder.name
  ];

  const totalEnergy = yangsen.leftLeg.score + yangsen.rightLeg.score + yangsen.leftShoulder.score;

  return {
    ...char,
    kanshiData: {
      ...char.kanshiData,
      bazi: {
        year: bazi.year,
        month: bazi.month,
        day: bazi.day,
        hour: bazi.hour
      },
      nikkan,
      gesshi,
      tenchusatsu,
      jugdais,
      junidai,
      total_energy: totalEnergy
    }
  };
}

/**
 * EPISODES-49-72用: birth_dateをDateに変換（ISO形式対応）
 */
function parseBirthDate4972(birthDate: string): Date {
  // ISO形式: "1997-02-18T13:00:00" または "1998-01-27T14:30:00"
  // 双子などの特殊ケース: "2001-04-12T03:30:00（翔）, 2001-04-12T03:35:00（颯太）"

  // カンマで分割（双子などのケース）
  let dateStr = birthDate;
  if (birthDate.includes(',')) {
    dateStr = birthDate.split(',')[0].trim();
  }

  // ISO日付フォーマットのみを抽出（YYYY-MM-DDTHH:mm:ss）
  const isoDateMatch = dateStr.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  if (isoDateMatch) {
    return new Date(isoDateMatch[1]);
  }

  return new Date(dateStr);
}

/**
 * EPISODES-49-72用: キャラクターを再計算
 */
function recalculateCharacter4972(char: any): any {
  // 双子などの特殊ケースに対応（カンマで区切られた複数の誕生日）
  let birthDateStr = char.birth_date;
  if (birthDateStr.includes(',')) {
    // 最初の誕生日を使用
    birthDateStr = birthDateStr.split(',')[0].trim();
  }

  const birthDate = parseBirthDate4972(birthDateStr);

  // accurate-logicで計算
  const bazi = calculateBaZi(birthDate, 135);
  const yangsen = calculateYangSen(bazi, birthDate);

  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

  console.log(`エピソード${char.episode}: ${char.name} → 日干:${nikkan}, 日支:${gesshi}, 天中殺:${tenchusatsu}`);

  // YangSen型から既存データ形式に変換
  const jugdais = [
    yangsen.chest,
    yangsen.belly,
    yangsen.rightHand,
    yangsen.leftHand,
    yangsen.head
  ];

  const junidai = [
    yangsen.leftLeg.name,
    yangsen.rightLeg.name,
    yangsen.leftShoulder.name
  ];

  const totalEnergy = yangsen.leftLeg.score + yangsen.rightLeg.score + yangsen.leftShoulder.score;

  return {
    ...char,
    sanmeigaku: {
      nikkan,
      gesshi,
      tenchusatsu,
      jugdais,
      junidai,
      total_energy: totalEnergy
    }
  };
}

/**
 * EPISODES-73-96用: キャラクターを再計算
 */
function recalculateCharacter7396(char: any): any {
  const birthDate = new Date(char.patient.birth_date);

  // accurate-logicで計算
  const bazi = calculateBaZi(birthDate, 135);
  const yangsen = calculateYangSen(bazi, birthDate);

  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

  console.log(`エピソード${char.episode}: ${char.patient.name} → 日干:${nikkan}, 日支:${gesshi}, 天中殺:${tenchusatsu}`);

  // 既存のfortune構造を維持しつつ更新
  return {
    ...char,
    patient: {
      ...char.patient,
      fortune: {
        ...char.patient.fortune,
        rokujukkoushi: {
          year: bazi.year.name,
          month: bazi.month.name,
          day: bazi.day.name,
          hour: bazi.hour.name
        },
        nikkan,
        gesshi,
        tenchusatsu,
        yangsen: {
          head: yangsen.head,
          chest: yangsen.chest,
          leftHand: yangsen.leftHand,
          rightHand: yangsen.rightHand,
          belly: yangsen.belly
        },
        twelve_stars: {
          leftShoulder: { name: yangsen.leftShoulder.name, score: yangsen.leftShoulder.score },
          rightLeg: { name: yangsen.rightLeg.name, score: yangsen.rightLeg.score },
          leftLeg: { name: yangsen.leftLeg.name, score: yangsen.leftLeg.score }
        },
        energy_score: yangsen.leftLeg.score + yangsen.rightLeg.score + yangsen.leftShoulder.score
      }
    }
  };
}

/**
 * キャラクターを再計算
 */
function recalculateCharacter(char: Character): RecalculatedCharacter {
  // 時刻を設定（デフォルト: 12:00）
  const birthTime = char.birth_time || '12:00';
  const [hour, minute] = birthTime.split(':').map(Number);

  const birthDate = new Date(char.birth_date);
  birthDate.setHours(hour, minute, 0, 0);

  // accurate-logicで計算
  const bazi = calculateBaZi(birthDate, 135);
  const yangsen = calculateYangSen(bazi, birthDate);

  // 天中殺を判定
  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

  // 年齢を再計算（2026年時点）
  const calculatedAge = calculateAge(char.birth_date);

  console.log(`エピソード${char.episode}: ${char.name} → 日干:${nikkan}, 日支:${gesshi}, 天中殺:${tenchusatsu}`);

  // YangSen型から既存データ形式に変換
  // jugdais: [胸, 腹, 右手, 左手, 頭]の順（既存データに合わせる）
  const jugdais = [
    yangsen.chest,
    yangsen.belly,
    yangsen.rightHand,
    yangsen.leftHand,
    yangsen.head
  ];

  // junidai: [左足, 右足, 左肩]の順（既存データに合わせる）
  const junidai = [
    yangsen.leftLeg.name,
    yangsen.rightLeg.name,
    yangsen.leftShoulder.name
  ];

  // total_energyの計算（十二大従星の点数の合計）
  const totalEnergy = yangsen.leftLeg.score + yangsen.rightLeg.score + yangsen.leftShoulder.score;

  return {
    ...char,
    birth_time: birthTime,
    age: calculatedAge,
    sanmeigaku: {
      nikkan,
      gesshi,
      tenchusatsu,
      jugdais,
      junidai,
      five_elements: char.sanmeigaku.five_elements, // TODO: 正しく計算
      total_energy: totalEnergy
    }
  };
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const current = new Date('2026-04-01');
  let age = current.getFullYear() - birth.getFullYear();
  const monthDiff = current.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && current.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getTenchusatsu(nikkan: string, gesshi: string): string {
  const gesshiIdx = '子丑寅卯辰巳午未申酉戌亥'.indexOf(gesshi);
  if (gesshiIdx >= 0 && gesshiIdx <= 1) return '子丑天中殺';
  if (gesshiIdx >= 2 && gesshiIdx <= 3) return '寅卯天中殺';
  if (gesshiIdx >= 4 && gesshiIdx <= 5) return '辰巳天中殺';
  if (gesshiIdx >= 6 && gesshiIdx <= 7) return '午未天中殺';
  if (gesshiIdx >= 8 && gesshiIdx <= 9) return '申酉天中殺';
  if (gesshiIdx >= 10 && gesshiIdx <= 11) return '戌亥天中殺';
  return '';
}

/**
 * ファイルからキャラクターリストを抽出
 */
function extractCharacters(data: any, filename: string): Character[] {
  if (Array.isArray(data)) {
    // EPISODES-1-24: 配列構造
    return data;
  } else if (data.characters && Array.isArray(data.characters)) {
    // EPISODES-25-48, 49-72: characters配列
    return data.characters;
  } else if (data.patients && Array.isArray(data.patients)) {
    // EPISODES-73-96: patients配列
    return data.patients;
  } else {
    throw new Error(`未対応のファイル構造: ${filename}`);
  }
}

/**
 * キャラクターリストをファイル構造に戻す
 */
function reconstructFile(data: any, characters: any[], filename: string): any {
  if (Array.isArray(data)) {
    // EPISODES-1-24: 配列構造
    return characters;
  } else if (data.characters && Array.isArray(data.characters)) {
    // EPISODES-25-48, 49-72: characters配列
    return { ...data, characters };
  } else if (data.patients && Array.isArray(data.patients)) {
    // EPISODES-73-96: patients配列
    return { ...data, patients: characters };
  } else {
    throw new Error(`未対応のファイル構造: ${filename}`);
  }
}

async function main() {
  console.log('全キャラクター再計算開始...\n');

  // 各ファイルの処理
  await processEpisodes124();
  await processEpisodes2548();
  await processEpisodes4972();
  await processEpisodes7396();

  console.log('\n' + '='.repeat(80));
  console.log('再計算完了');
  console.log('='.repeat(80));
  console.log('\n次のステップ:');
  console.log('1. 出力されたファイル（*-UPDATED.json）を確認');
  console.log('2. 元のファイルをバックアップ');
  console.log('3. UPDATEDファイルで元のファイルを上書き');
  console.log('4. 朱学院でのダブルチェック実施');
}

/**
 * EPISODES-1-24を処理
 */
async function processEpisodes124() {
  const file = 'EPISODES-1-24-CHARACTERS.json';
  console.log(`\n処理中: ${file}`);
  console.log('-'.repeat(80));

  const filePath = path.join(process.cwd(), 'claudedocs', file);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const characters: Character[] = JSON.parse(content);

    const recalculated: RecalculatedCharacter[] = [];

    for (const char of characters) {
      if (char.name === '（来院者なし）') {
        recalculated.push(char as any);
        continue;
      }

      const updated = recalculateCharacter(char);
      recalculated.push(updated);
    }

    // 更新されたファイルを出力
    const outputPath = path.join(process.cwd(), 'claudedocs', file.replace('.json', '-UPDATED.json'));
    fs.writeFileSync(outputPath, JSON.stringify(recalculated, null, 2), 'utf-8');

    console.log(`✓ 完了: ${file} (${recalculated.length}キャラクター)`);
    console.log(`  出力先: ${outputPath}`);

  } catch (error) {
    console.error(`✗ エラー: ${file}`);
    console.error(`  ${error}`);
  }
}

/**
 * EPISODES-25-48を処理
 */
async function processEpisodes2548() {
  const file = 'EPISODES-25-48-CHARACTERS.json';
  console.log(`\n処理中: ${file}`);
  console.log('-'.repeat(80));

  const filePath = path.join(process.cwd(), 'claudedocs', file);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const characters = data.characters;

    const recalculated = [];

    for (const char of characters) {
      if (!char.birthDate) continue;

      const updated = recalculateCharacter2548(char);
      recalculated.push(updated);
    }

    // ファイル構造を再構築
    const updatedData = { ...data, characters: recalculated };

    // 更新されたファイルを出力
    const outputPath = path.join(process.cwd(), 'claudedocs', file.replace('.json', '-UPDATED.json'));
    fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 2), 'utf-8');

    console.log(`✓ 完了: ${file} (${recalculated.length}キャラクター)`);
    console.log(`  出力先: ${outputPath}`);

  } catch (error) {
    console.error(`✗ エラー: ${file}`);
    console.error(`  ${error}`);
  }
}

/**
 * EPISODES-49-72を処理
 */
async function processEpisodes4972() {
  const file = 'EPISODES-49-72-CHARACTERS.json';
  console.log(`\n処理中: ${file}`);
  console.log('-'.repeat(80));

  const filePath = path.join(process.cwd(), 'claudedocs', file);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const characters = data.characters;

    const recalculated = [];

    for (const char of characters) {
      if (!char.birth_date) continue;

      const updated = recalculateCharacter4972(char);
      recalculated.push(updated);
    }

    // ファイル構造を再構築
    const updatedData = { ...data, characters: recalculated };

    // 更新されたファイルを出力
    const outputPath = path.join(process.cwd(), 'claudedocs', file.replace('.json', '-UPDATED.json'));
    fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 2), 'utf-8');

    console.log(`✓ 完了: ${file} (${recalculated.length}キャラクター)`);
    console.log(`  出力先: ${outputPath}`);

  } catch (error) {
    console.error(`✗ エラー: ${file}`);
    console.error(`  ${error}`);
  }
}

/**
 * EPISODES-73-96を処理
 */
async function processEpisodes7396() {
  const file = 'EPISODES-73-96-CHARACTERS.json';
  console.log(`\n処理中: ${file}`);
  console.log('-'.repeat(80));

  const filePath = path.join(process.cwd(), 'claudedocs', file);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // patientsはepisodes.phase_1.patientsとepisodes.phase_2.patientsに分かれている
    const patientsPhase1 = data.episodes?.phase_1?.patients || [];
    const patientsPhase2 = data.episodes?.phase_2?.patients || [];
    const allPatients = [...patientsPhase1, ...patientsPhase2];

    const recalculatedPhase1 = [];
    const recalculatedPhase2 = [];

    for (const char of patientsPhase1) {
      if (!char.patient?.birth_date) continue;

      const updated = recalculateCharacter7396(char);
      recalculatedPhase1.push(updated);
    }

    for (const char of patientsPhase2) {
      if (!char.patient?.birth_date) continue;

      const updated = recalculateCharacter7396(char);
      recalculatedPhase2.push(updated);
    }

    // ファイル構造を再構築
    const updatedData = {
      ...data,
      episodes: {
        ...data.episodes,
        phase_1: {
          ...data.episodes.phase_1,
          patients: recalculatedPhase1
        },
        phase_2: {
          ...data.episodes.phase_2,
          patients: recalculatedPhase2
        }
      }
    };

    // 更新されたファイルを出力
    const outputPath = path.join(process.cwd(), 'claudedocs', file.replace('.json', '-UPDATED.json'));
    fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 2), 'utf-8');

    const totalRecalculated = recalculatedPhase1.length + recalculatedPhase2.length;
    console.log(`✓ 完了: ${file} (${totalRecalculated}キャラクター)`);
    console.log(`  出力先: ${outputPath}`);

  } catch (error) {
    console.error(`✗ エラー: ${file}`);
    console.error(`  ${error}`);
  }
}

main().catch(console.error);
