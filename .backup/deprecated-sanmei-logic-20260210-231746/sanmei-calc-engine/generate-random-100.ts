/**
 * 100種類ランダム検証データ生成スクリプト
 * 1900-2000年のランダムな生年月日を100個生成し、算命学データを計算してTursoに登録
 */

import { createClient } from '@libsql/client';
import { calculateBaZi } from '../accurate-logic/src/bazi';
import { calculateYangSen } from '../accurate-logic/src/yangsen';
import { getBranchElement, getElement } from '../accurate-logic/src/constants';
import type { FourPillars, YangSen } from '../accurate-logic/src/types';
import * as fs from 'fs';
import * as path from 'path';

interface BirthData {
  birth_id: string;
  calendar: string;
  birth_date: string;
  birth_time: string;
  timezone: string;
  location: string;
  latitude: number;
  longitude: number;
  sex: string;
  source: string;
  immutable: number;
}

interface YinyangData {
  yinyang_id: string;
  birth_id: string;
  year_pillar: string;
  year_stem: string;
  year_branch: string;
  month_pillar: string;
  month_stem: string;
  month_branch: string;
  day_pillar: string;
  day_stem: string;
  day_branch: string;
  hour_pillar: string;
  hour_stem: string;
  hour_branch: string;
  day_master_stem: string;
  day_master_yinyang: string;
  day_master_element: string;
  tenchusatsu: string;
  tenchusatsu_branches: string;
  five_wood: number;
  five_fire: number;
  five_earth: number;
  five_metal: number;
  five_water: number;
}

interface YangsenData {
  yangsen_id: string;
  birth_id: string;
  head_star: string;
  chest_star: string;
  belly_star: string;
  left_hand_star: string;
  right_hand_star: string;
  left_shoulder_star: string;
  left_shoulder_score: number;
  right_leg_star: string;
  right_leg_score: number;
  left_leg_star: string;
  left_leg_score: number;
  total_energy_score: number;
}

interface VerificationData {
  birthDataId: string;
  shugakuin_bazi_year: string;
  shugakuin_bazi_month: string;
  shugakuin_bazi_day: string;
  shugakuin_bazi_hour: string;
  shugakuin_tenchusatsu: string;
  shugakuin_jugdai_head: string;
  shugakuin_jugdai_chest: string;
  shugakuin_jugdai_belly: string;
  shugakuin_jugdai_right_hand: string;
  shugakuin_jugdai_left_hand: string;
  bazi_match: boolean;
  tenchusatsu_match: boolean;
  jugdai_match: boolean;
  verified_at: string;
  notes: string;
}

// Tursoクライアント初期化
const tursoUrl = process.env.TURSO_URL || 'libsql://sanmei-sanmei.aws-ap-northeast-1.turso.io';
const tursoToken = process.env.TURSO_TOKEN || '';
const client = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

// ランダムな生年月日生成（1900-2000年）
function generateRandomBirthDate(index: number): { date: string; time: string } {
  const startYear = 1900;
  const endYear = 2000;
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const maxDay = month === 2 ? 28 : 30; // 簡略化
  const day = Math.floor(Math.random() * maxDay) + 1;
  const hour = Math.floor(Math.random() * 13) + 6; // 6-18時
  const minute = Math.floor(Math.random() * 60);

  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return { date, time };
}

// 五行エネルギー計算
function calculateFiveElements(bazi: FourPillars): {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  total: number;
} {
  let wood = 0, fire = 0, earth = 0, metal = 0, water = 0;

  const stems = [bazi.year.stem, bazi.month.stem, bazi.day.stem, bazi.hour.stem];
  stems.forEach((stemIdx) => {
    const element = getElement(stemIdx - 1);
    switch (element) {
      case 0: wood += 2; break;
      case 1: fire += 2; break;
      case 2: earth += 2; break;
      case 3: metal += 2; break;
      case 4: water += 2; break;
    }
  });

  const branches = [bazi.year.branch, bazi.month.branch, bazi.day.branch, bazi.hour.branch];
  branches.forEach((branchIdx) => {
    const element = getBranchElement(branchIdx - 1);
    switch (element) {
      case 0: wood += 2; break;
      case 1: fire += 2; break;
      case 2: earth += 2; break;
      case 3: metal += 2; break;
      case 4: water += 2; break;
    }
  });

  const total = wood + fire + earth + metal + water;
  return { wood, fire, earth, metal, water, total };
}

// 天中殺判定
function getTenchusatsu(nikkan: string, gesshi: string): string {
  const table: Record<string, Record<string, string>> = {
    甲: { 寅: '寅卯', 卯: '寅卯' },
    乙: { 寅: '寅卯', 卯: '寅卯' },
    丙: { 辰: '辰巳', 巳: '辰巳' },
    丁: { 辰: '辰巳', 巳: '辰巳' },
    戊: { 辰: '辰巳', 巳: '辰巳' },
    己: { 辰: '辰巳', 巳: '辰巳' },
    庚: { 申: '申酉', 酉: '申酉' },
    辛: { 申: '申酉', 酉: '申酉' },
    壬: { 戌: '戌亥', 亥: '戌亥' },
    癸: { 戌: '戌亥', 亥: '戌亥' },
    子: { 子: '子丑', 丑: '子丑' },
    丑: { 子: '子丑', 丑: '子丑' },
  };

  if (table[nikkan] && table[nikkan][gesshi]) {
    return table[nikkan][gesshi] + '天中殺';
  }
  return 'なし';
}

// キャラクターID生成
function generateCharacterId(index: number): string {
  return `RAND-${String(index + 1).padStart(3, '0')}`;
}

// メイン処理
async function main() {
  console.log('100種類ランダム検証データ生成開始...\n');

  const birthDataArray: BirthData[] = [];
  const sanmeigakuDataArray: SanmeigakuData[] = [];
  const verificationDataArray: VerificationData[] = [];

  for (let i = 0; i < 100; i++) {
    const characterId = generateCharacterId(i);
    const { date, time } = generateRandomBirthDate(i);
    const name = `検証キャラクター${String(i + 1).padStart(3, '0')}`;

    console.log(`[${i + 1}/100] ${name} (${date} ${time})`);

    // 生年月日データ
    const birthData: BirthData = {
      id: characterId,
      name,
      birth_date: date,
      birth_time: time,
      birth_location: '東京',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 'Asia/Tokyo',
    };
    birthDataArray.push(birthData);

    // 算命学計算
    const birthDate = new Date(date + 'T' + time + ':00');
    const bazi = calculateBaZi(birthDate, 135);
    const yangsen = calculateYangSen(bazi, birthDate);
    const fiveElements = calculateFiveElements(bazi);

    const nikkan = bazi.day.stemStr;
    const gesshi = bazi.day.branchStr;
    const tenchusatsu = getTenchusatsu(nikkan, gesshi);

    // 算命学データ
    const sanmeigakuData: SanmeigakuData = {
      birthDataId: characterId,
      bazi_year: bazi.year.name,
      bazi_month: bazi.month.name,
      bazi_day: bazi.day.name,
      bazi_hour: bazi.hour.name,
      nikkan,
      gesshi,
      tenchusatsu,
      jugdai_head: yangsen.head,
      jugdai_chest: yangsen.chest,
      jugdai_belly: yangsen.belly,
      jugdai_right_hand: yangsen.rightHand,
      jugdai_left_hand: yangsen.leftHand,
      junidai_left_shoulder: yangsen.leftShoulder.name,
      junidai_left_shoulder_score: yangsen.leftShoulder.score,
      junidai_left_leg: yangsen.leftLeg.name,
      junidai_left_leg_score: yangsen.leftLeg.score,
      junidai_right_leg: yangsen.rightLeg.name,
      junidai_right_leg_score: yangsen.rightLeg.score,
      five_wood: fiveElements.wood,
      five_fire: fiveElements.fire,
      five_earth: fiveElements.earth,
      five_metal: fiveElements.metal,
      five_water: fiveElements.water,
      five_total: fiveElements.total,
    };
    sanmeigakuDataArray.push(sanmeigakuData);

    // 検証データ（初期値：未検証）
    const verificationData: VerificationData = {
      birthDataId: characterId,
      shugakuin_bazi_year: null,
      shugakuin_bazi_month: null,
      shugakuin_bazi_day: null,
      shugakuin_bazi_hour: null,
      shugakuin_tenchusatsu: null,
      shugakuin_jugdai_head: null,
      shugakuin_jugdai_chest: null,
      shugakuin_jugdai_belly: null,
      shugakuin_jugdai_right_hand: null,
      shugakuin_jugdai_left_hand: null,
      bazi_match: null,
      tenchusatsu_match: null,
      jugdai_match: null,
      verified_at: null,
      notes: 'accurate-logicで計算。朱学院での検証待ち。',
    };
    verificationDataArray.push(verificationData);
  }

  console.log('\nデータベース登録開始...\n');

  // データベース登録
  for (let i = 0; i < birthDataArray.length; i++) {
    const birthData = birthDataArray[i];
    const sanmeigakuData = sanmeigakuDataArray[i];
    const verificationData = verificationDataArray[i];

    try {
      // birthdata テーブル
      await client.execute({
        sql: `INSERT INTO birthdata (id, name, birth_date, birth_time, birth_location, latitude, longitude, timezone, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          birthData.id,
          birthData.name,
          birthData.birth_date,
          birthData.birth_time,
          birthData.birth_location,
          birthData.latitude,
          birthData.longitude,
          birthData.timezone,
        ],
      });

      // yinyang テーブル
      await client.execute({
        sql: `INSERT INTO yinyang (birth_data_id, bazi_year, bazi_month, bazi_day, bazi_hour, nikkan, gesshi, tenchusatsu, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          sanmeigakuData.birthDataId,
          sanmeigakuData.bazi_year,
          sanmeigakuData.bazi_month,
          sanmeigakuData.bazi_day,
          sanmeigakuData.bazi_hour,
          sanmeigakuData.nikkan,
          sanmeigakuData.gesshi,
          sanmeigakuData.tenchusatsu,
        ],
      });

      // yangsen テーブル
      await client.execute({
        sql: `INSERT INTO yangsen (birth_data_id, head, chest, belly, right_hand, left_hand, left_shoulder, left_shoulder_score, left_leg, left_leg_score, right_leg, right_leg_score, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          sanmeigakuData.birthDataId,
          sanmeigakuData.jugdai_head,
          sanmeigakuData.jugdai_chest,
          sanmeigakuData.jugdai_belly,
          sanmeigakuData.jugdai_right_hand,
          sanmeigakuData.jugdai_left_hand,
          sanmeigakuData.junidai_left_shoulder,
          sanmeigakuData.junidai_left_shoulder_score,
          sanmeigakuData.junidai_left_leg,
          sanmeigakuData.junidai_left_leg_score,
          sanmeigakuData.junidai_right_leg,
          sanmeigakuData.junidai_right_leg_score,
        ],
      });

      // verification テーブル
      await client.execute({
        sql: `INSERT INTO verification (birth_data_id, shugakuin_bazi_year, shugakuin_bazi_month, shugakuin_bazi_day, shugakuin_bazi_hour, shugakuin_tenchusatsu, shugakuin_jugdai_head, shugakuin_jugdai_chest, shugakuin_jugdai_belly, shugakuin_jugdai_right_hand, shugakuin_jugdai_left_hand, bazi_match, tenchusatsu_match, jugdai_match, verified_at, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          verificationData.birthDataId,
          verificationData.shugakuin_bazi_year,
          verificationData.shugakuin_bazi_month,
          verificationData.shugakuin_bazi_day,
          verificationData.shugakuin_bazi_hour,
          verificationData.shugakuin_tenchusatsu,
          verificationData.shugakuin_jugdai_head,
          verificationData.shugakuin_jugdai_chest,
          verificationData.shugakuin_jugdai_belly,
          verificationData.shugakuin_jugdai_right_hand,
          verificationData.shugakuin_jugdai_left_hand,
          verificationData.bazi_match,
          verificationData.tenchusatsu_match,
          verificationData.jugdai_match,
          verificationData.verified_at,
          verificationData.notes,
        ],
      });

      console.log(`[${i + 1}/100] ${birthData.name} を登録完了`);
    } catch (error) {
      console.error(`[${i + 1}/100] ${birthData.name} の登録に失敗:`, error);
    }
  }

  // JSON出力
  const outputPath = path.join(__dirname, 'claudedocs', 'random-100-verification-data.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        birth_data: birthDataArray,
        sanmeigaku_data: sanmeigakuDataArray,
        verification_data: verificationDataArray,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log('\n=== 完了レポート ===');
  console.log(`生成キャラクター数: ${birthDataArray.length}`);
  console.log(`登録完了数: ${birthDataArray.length}`);
  console.log(`JSON出力: ${outputPath}`);

  // 統計
  const tenchusatsuCount = sanmeigakuDataArray.filter((d) => d.tenchusatsu !== 'なし').length;
  console.log(`\n天中殺キャラクター数: ${tenchusatsuCount} (${((tenchusatsuCount / 100) * 100).toFixed(1)}%)`);

  // 平均エネルギー点数
  const avgEnergy = sanmeigakuDataArray.reduce((sum, d) => sum + d.five_total, 0) / 100;
  console.log(`平均エネルギー点数: ${avgEnergy.toFixed(1)}`);

  // 五行バランス
  const avgFive = {
    wood: sanmeigakuDataArray.reduce((sum, d) => sum + d.five_wood, 0) / 100,
    fire: sanmeigakuDataArray.reduce((sum, d) => sum + d.five_fire, 0) / 100,
    earth: sanmeigakuDataArray.reduce((sum, d) => sum + d.five_earth, 0) / 100,
    metal: sanmeigakuDataArray.reduce((sum, d) => sum + d.five_metal, 0) / 100,
    water: sanmeigakuDataArray.reduce((sum, d) => sum + d.five_water, 0) / 100,
  };
  console.log('\n五行バランス（平均）:');
  console.log(`  木: ${avgFive.wood.toFixed(1)}`);
  console.log(`  火: ${avgFive.fire.toFixed(1)}`);
  console.log(`  土: ${avgFive.earth.toFixed(1)}`);
  console.log(`  金: ${avgFive.metal.toFixed(1)}`);
  console.log(`  水: ${avgFive.water.toFixed(1)}`);

  console.log('\n✅ 100種類ランダム検証データ生成・登録完了！');
}

main().catch(console.error);
