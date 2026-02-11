/**
 * キャラクター詳細分析スクリプト
 *
 * 目的: 既存キャラクターのsanmeigakuデータとaccurate-logic計算結果の詳細比較
 */

import { calculateBaZi, calculateYangSen } from '../accurate-logic/src/index';
import * as fs from 'fs';
import * as path from 'path';

interface Character {
  episode: number;
  name: string;
  birth_date: string;
  age: number;
  sanmeigaku: {
    nikkan: string;
    gesshi: string;
    jugdais: string[];
    junidai: string[];
    five_elements: string;
    total_energy: number;
  };
}

function analyzeCharacter(char: Character): void {
  console.log('\n' + '='.repeat(80));
  console.log(`エピソード${char.episode}: ${char.name}`);
  console.log('='.repeat(80));

  const birthDate = new Date(char.birth_date);
  console.log(`生年月日: ${char.birth_date}`);
  console.log(`年齢（記録）: ${char.age}歳`);
  console.log(`年齢（2026年時点）: ${calculateAge(char.birth_date)}歳`);
  console.log('');

  // accurate-logicで計算
  const bazi = calculateBaZi(birthDate, 135);
  const yangsen = calculateYangSen(bazi, birthDate);

  console.log('--- 既存データ ---');
  console.log(`日干: ${char.sanmeigaku.nikkan}`);
  console.log(`月支: 未記録`);
  console.log(`日支: ${char.sanmeigaku.gesshi}`);
  console.log(`天中殺: ${char.sanmeigaku.tenchusatsu || '未記録'}`);
  console.log(`十大主星: ${JSON.stringify(char.sanmeigaku.jugdais)}`);
  console.log(`十二大従星: ${JSON.stringify(char.sanmeigaku.junidai)}`);
  console.log(`五行: ${char.sanmeigaku.five_elements}`);
  console.log(`エネルギー点数: ${char.sanmeigaku.total_energy}`);
  console.log('');

  console.log('--- accurate-logic 計算結果 ---');
  console.log(`年柱: ${bazi.year.name}`);
  console.log(`月柱: ${bazi.month.name}`);
  console.log(`日柱: ${bazi.day.name}`);
  console.log(`時柱: 時刻未記録のため未計算`);
  console.log('');
  console.log(`日干: ${bazi.day.stemStr}`);
  console.log(`日支: ${bazi.day.branchStr}`);
  console.log(`天中殺: ${getTenchusatsu(bazi.day.stemStr, bazi.day.branchStr)}`);
  console.log(`十大主星: ${JSON.stringify(yangsen.jugdai)}`);
  console.log(`十二大従星: ${JSON.stringify(yangsen.junidai)}`);
  console.log(`エネルギー点数: ${yangsen.totalEnergy}`);
  console.log('');

  // 比較
  console.log('--- 比較 ---');
  console.log(`日干: ${char.sanmeigaku.nikkan} → ${bazi.day.stemStr} (${char.sanmeigaku.nikkan === bazi.day.stemStr ? '✓ 一致' : '✗ 不一致'})`);
  console.log(`日支: ${char.sanmeigaku.gesshi} → ${bazi.day.branchStr} (${char.sanmeigaku.gesshi === bazi.day.branchStr ? '✓ 一致' : '✗ 不一致'})`);
  console.log(`十大主星: ${JSON.stringify(char.sanmeigaku.jugdais) === JSON.stringify(yangsen.jugdai) ? '✓ 一致' : '✗ 不一致'}`);
  console.log(`十二大従星: ${JSON.stringify(char.sanmeigaku.junidai) === JSON.stringify(yangsen.junidai) ? '✓ 一致' : '✗ 不一致'}`);
  console.log(`エネルギー点数: ${char.sanmeigaku.total_energy} → ${yangsen.totalEnergy} (${char.sanmeigaku.total_energy === yangsen.totalEnergy ? '✓ 一致' : '✗ 不一致'})`);
  console.log('');

  // 問題の診断
  console.log('--- 診断 ---');
  if (char.sanmeigaku.nikkan !== bazi.day.stemStr) {
    console.log('⚠️  日干が不一致です。既存データは誤りです。');
  }
  if (char.sanmeigaku.gesshi !== bazi.day.branchStr) {
    console.log('⚠️  日支が不一致です。既存データは誤りです。');
  }
  if (JSON.stringify(char.sanmeigaku.jugdais) !== JSON.stringify(yangsen.jugdai)) {
    console.log('⚠️  十大主星が不一致です。既存データは誤りです。');
  }
  if (JSON.stringify(char.sanmeigaku.junidai) !== JSON.stringify(yangsen.junidai)) {
    console.log('⚠️  十二大従星が不一致です。既存データは誤りです。');
  }
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
  console.log('既存キャラクター詳細分析開始...\n');

  const episodes124 = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../claudedocs/EPISODES-1-24-CHARACTERS.json'), 'utf-8')
  );

  // 最初の数キャラクターを詳細分析
  const sampleSize = 3;
  let count = 0;

  for (const char of episodes124) {
    if (char.name === '（来院者なし）') continue;

    analyzeCharacter(char as Character);

    count++;
    if (count >= sampleSize) break;
  }

  console.log('\n' + '='.repeat(80));
  console.log('結論');
  console.log('='.repeat(80));
  console.log('既存キャラクターのsanmeigakuデータは、accurate-logicでの計算結果と');
  console.log('一致していません。全キャラクターの再計算が必要です。');
  console.log('');
  console.log('次のステップ:');
  console.log('1. 全キャラクターの正しいsanmeigakuデータを計算');
  console.log('2. JSONファイルを更新');
  console.log('3. 朱学院でダブルチェック');
}

main().catch(console.error);
