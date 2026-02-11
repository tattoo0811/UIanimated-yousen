/**
 * キャラクターの算命学データを検証・更新するスクリプト
 * エピソード1-30のキャラクターの四柱推命・十大主星・十二大従星を計算
 */

import { calculateBaZi } from '../accurate-logic/src/bazi';
import { calculateYangSen } from '../accurate-logic/src/yangsen';
import { getElement } from '../accurate-logic/src/constants';
import type { FourPillars } from '../accurate-logic/src/types';
import fs from 'fs';
import path from 'path';

// キャラクター型定義
interface Character {
  episode: number;
  name: string;
  name_reading?: string;
  age?: number;
  birth_date?: string;
  birthDate?: string;  // EPISODES-25-48形式
  occupation?: string;
  sanmeigaku?: {
    nikkan?: string;
    gesshi?: string;
    tenchusatsu?: string;
    jugdais?: string[];
    junidai?: string[];
    five_elements?: string;
    total_energy?: number;
  };
}

// 出力用型定義
interface VerifiedCharacter {
  episode: number;
  name: string;
  birth_date: string;
  sanmeigaku_verified: {
    bazi: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    jugdais: string[];
    junidai: Array<{ part: string; star: string; points: number }>;
    five_elements: string;
    total_energy: number;
  };
  persona_traits: string[];
  verified_with_shugakuin: boolean;
  notes: string;
}

/**
 * 生年月日文字列からDateオブジェクトを生成（時刻不明の場合は正午とする）
 */
function parseBirthDate(dateStr: string): Date {
  if (!dateStr) {
    throw new Error('生年月日が空です');
  }

  // ISO 8601形式（時刻付き）
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }

  // YYYY-MM-DD形式（時刻なし、正午とする）
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * 五行エネルギーを計算
 */
function calculateFiveElements(bazi: FourPillars): { wood: number; fire: number; earth: number; metal: number; water: number } {
  const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  // 年干支
  const yearElement = getElement(bazi.year.stem - 1);
  if (yearElement === 0) elements.wood += 36;
  else if (yearElement === 1) elements.fire += 36;
  else if (yearElement === 2) elements.earth += 36;
  else if (yearElement === 3) elements.metal += 36;
  else if (yearElement === 4) elements.water += 36;

  // 月干支
  const monthElement = getElement(bazi.month.stem - 1);
  if (monthElement === 0) elements.wood += 28;
  else if (monthElement === 1) elements.fire += 28;
  else if (monthElement === 2) elements.earth += 28;
  else if (monthElement === 3) elements.metal += 28;
  else if (monthElement === 4) elements.water += 28;

  // 日干支
  const dayElement = getElement(bazi.day.stem - 1);
  if (dayElement === 0) elements.wood += 25;
  else if (dayElement === 1) elements.fire += 25;
  else if (dayElement === 2) elements.earth += 25;
  else if (dayElement === 3) elements.metal += 25;
  else if (dayElement === 4) elements.water += 25;

  // 時干支
  const hourElement = getElement(bazi.hour.stem - 1);
  if (hourElement === 0) elements.wood += 11;
  else if (hourElement === 1) elements.fire += 11;
  else if (hourElement === 2) elements.earth += 11;
  else if (hourElement === 3) elements.metal += 11;
  else if (hourElement === 4) elements.water += 11;

  return elements;
}

/**
 * 五行データを文字列形式に変換
 */
function formatFiveElements(elements: ReturnType<typeof calculateFiveElements>): string {
  return `木${elements.wood}火${elements.fire}土${elements.earth}金${elements.metal}水${elements.water}`;
}

/**
 * キャラクターの算命学データを検証
 */
function verifyCharacter(character: Character): VerifiedCharacter {
  // birth_date または birthDate を使用
  const dateStr = character.birth_date || character.birthDate || '';
  const birthDate = parseBirthDate(dateStr);

  // 四柱推命を計算
  const bazi = calculateBaZi(birthDate);

  // 陽占を計算
  const yangSen = calculateYangSen(bazi, birthDate);

  // 五行を計算
  const fiveElements = calculateFiveElements(bazi);
  // totalEnergyは五行の合計値
  const totalEnergy = fiveElements.wood + fiveElements.fire + fiveElements.earth + fiveElements.metal + fiveElements.water;

  // 既存データとの比較
  const existingNikkan = character.sanmeigaku?.nikkan || '';
  const calculatedNikkan = bazi.day.stemStr;

  const notes: string[] = [];
  if (existingNikkan && existingNikkan !== calculatedNikkan) {
    notes.push(`日干不一致: 既存=${existingNikkan}, 計算=${calculatedNikkan}`);
  }

  const jugdais = [
    yangSen.head,
    yangSen.chest,
    yangSen.belly,
    yangSen.rightHand,
    yangSen.leftHand
  ];

  const junidai = [
    { part: '左肩', star: yangSen.leftShoulder.name, points: yangSen.leftShoulder.score },
    { part: '右足', star: yangSen.rightLeg.name, points: yangSen.rightLeg.score },
    { part: '左足', star: yangSen.leftLeg.name, points: yangSen.leftLeg.score }
  ];

  // 算命学的特徴からペルソナを作成
  const traits = generatePersonaTraits(bazi, yangSen, fiveElements);

  return {
    episode: character.episode,
    name: character.name,
    birth_date: character.birth_date || character.birthDate || '',
    sanmeigaku_verified: {
      bazi: {
        year: bazi.year.name,
        month: bazi.month.name,
        day: bazi.day.name,
        hour: bazi.hour.name
      },
      jugdais,
      junidai,
      five_elements: formatFiveElements(fiveElements),
      total_energy: totalEnergy
    },
    persona_traits: traits,
    verified_with_shugakuin: false, // 朱学院との検証は手動で実施
    notes: notes.join('; ') || '計算完了'
  };
}

/**
 * 算命学的特徴からペルソナを生成
 */
function generatePersonaTraits(
  bazi: FourPillars,
  yangSen: ReturnType<typeof calculateYangSen>,
  fiveElements: ReturnType<typeof calculateFiveElements>
): string[] {
  const traits: string[] = [];

  // 日干の基本性質
  const dayStem = bazi.day.stemStr;
  const dayElement = getElement(bazi.day.stem - 1);
  const elementNames = ['木', '火', '土', '金', '水'];
  const dayElementName = elementNames[dayElement];

  traits.push(`日干が${dayStem}（${dayElementName}属性）`);

  // 十大主星の特徴
  const jugdaiSet = new Set([yangSen.head, yangSen.chest, yangSen.belly, yangSen.rightHand, yangSen.leftHand]);
  const dominantStars = Array.from(jugdaiSet);
  if (dominantStars.length <= 2) {
    traits.push(`十大主星が${dominantStars.join('・')}に集中（一貫性のある性格）`);
  } else {
    traits.push(`十大主星が多岐にわたる（多面的な性格）`);
  }

  // 十二大従星の特徴
  const junidaiScores = [
    yangSen.leftShoulder.score,
    yangSen.rightLeg.score,
    yangSen.leftLeg.score
  ];
  const avgJunidaiScore = junidaiScores.reduce((a, b) => a + b, 0) / 3;

  if (avgJunidaiScore >= 10) {
    traits.push('十二大従星が高得力（行動力・実行力が強い）');
  } else if (avgJunidaiScore <= 4) {
    traits.push('十二大従星が低得力（内省的・慎重な性格）');
  }

  // 五行バランス
  const maxElement = Object.entries(fiveElements).sort((a, b) => b[1] - a[1])[0];
  const minElement = Object.entries(fiveElements).sort((a, b) => a[1] - b[1])[0];

  if (maxElement[1] > minElement[1] * 2) {
    const elementNamesJP = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
    traits.push(`${elementNamesJP[maxElement[0] as keyof typeof elementNamesJP]}属性が強く偏重`);
  }

  return traits;
}

/**
 * メイン処理
 */
async function main() {
  // キャラクターデータを読み込み
  const episodes1to24 = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../claudedocs/EPISODES-1-24-CHARACTERS.json'), 'utf-8')
  ) as Character[];

  const episodes25to48Raw = fs.readFileSync(
    path.join(__dirname, '../claudedocs/EPISODES-25-48-CHARACTERS.json'),
    'utf-8'
  );
  const episodes25to48 = JSON.parse(episodes25to48Raw) as { characters: Character[] };

  // エピソード25-30のみ抽出
  const episodes25to30 = episodes25to48.characters.filter(c => c.episode >= 25 && c.episode <= 30);

  // 全キャラクターを統合（エピソード1-30）
  const allCharacters = [...episodes1to24, ...episodes25to30];

  // 生年月日があるキャラクターのみ処理
  const charactersWithBirthDate = allCharacters.filter(c => c.birth_date && c.birth_date.length > 0);

  console.log(`処理対象キャラクター数: ${charactersWithBirthDate.length}`);

  // 検証結果を格納
  const verifiedCharacters: VerifiedCharacter[] = [];

  for (const character of charactersWithBirthDate) {
    try {
      const verified = verifyCharacter(character);
      verifiedCharacters.push(verified);
      console.log(`✓ エピソード${character.episode}: ${character.name}`);
    } catch (error) {
      console.error(`✗ エピソード${character.episode}: ${character.name} - ${error}`);
    }
  }

  // 結果を出力
  const outputPath = path.join(__dirname, '../claudedocs/EPISODES-1-30-CHARACTERS-VERIFIED.json');
  fs.writeFileSync(outputPath, JSON.stringify(verifiedCharacters, null, 2), 'utf-8');

  console.log(`\n出力完了: ${outputPath}`);
  console.log(`検証完了: ${verifiedCharacters.length}名`);
}

// 実行
main().catch(console.error);
