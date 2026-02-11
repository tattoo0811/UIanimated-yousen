/**
 * EPISODES-1-24-CHARACTERS.json 再計算スクリプト
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

function recalculateCharacter(char: Character): Character {
  const birthTime = char.birth_time || '12:00';
  const [hour, minute] = birthTime.split(':').map(Number);

  const birthDate = new Date(char.birth_date);
  birthDate.setHours(hour, minute, 0, 0);

  const bazi = calculateBaZi(birthDate, 135);
  const yangsen = calculateYangSen(bazi, birthDate);

  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

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
      five_elements: char.sanmeigaku.five_elements,
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

async function main() {
  console.log('EPISODES-1-24-CHARACTERS.json 再計算開始...\n');

  const filePath = path.join(process.cwd(), 'claudedocs/EPISODES-1-24-CHARACTERS.json');

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const characters: Character[] = JSON.parse(content);

    console.log(`対象キャラクター数: ${characters.length}\n`);

    const recalculated = characters.map(char => {
      if (char.name === '（来院者なし）') {
        return char;
      }
      return recalculateCharacter(char);
    });

    const outputPath = path.join(process.cwd(), 'claudedocs/EPISODES-1-24-CHARACTERS-UPDATED.json');
    fs.writeFileSync(outputPath, JSON.stringify(recalculated, null, 2), 'utf-8');

    console.log('\n✓ 再計算完了');
    console.log(`  出力先: ${outputPath}`);
    console.log(`  キャラクター数: ${recalculated.length}`);

  } catch (error) {
    console.error('✗ エラー:', error);
  }
}

main().catch(console.error);
