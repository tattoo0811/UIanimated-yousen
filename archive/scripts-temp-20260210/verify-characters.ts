/**
 * 既存キャラクターの生年月日検証スクリプト
 *
 * 目的:
 * 1. 既存キャラクターの生年月日から算命学データを再計算
 * 2. 既存のsanmeigakuデータと照合
 * 3. テーマとの整合性を確認
 * 4. 調整必要リストを作成
 */

import { calculateBaZi, calculateYangSen, type FourPillars, type YangSen } from '../accurate-logic/src/index';
import * as fs from 'fs';
import * as path from 'path';

interface Character {
  episode: number;
  name: string;
  name_reading: string;
  age: number;
  birth_date: string;
  occupation: string;
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

interface VerificationResult {
  episode: number;
  name: string;
  birth_date: string;
  calculated: {
    nikkan: string;
    gesshi: string;
    tenchusatsu: string;
    jugdais: string[];
    junidai: string[];
    five_elements: string;
    total_energy: number;
  };
  existing: {
    nikkan: string;
    gesshi: string;
    tenchusatsu: string;
    jugdais: string[];
    junidai: string[];
    five_elements: string;
    total_energy: number;
  };
  matches: {
    nikkan: boolean;
    gesshi: boolean;
    jugdais: boolean;
    junidai: boolean;
  };
  theme_consistency: {
    appropriate_age: boolean;
    appropriate_tenchusatsu: boolean;
    notes: string;
  };
  needsAdjustment: boolean;
  adjustment_reason?: string;
}

/**
 * 生年月日から年齢を計算（2026年時点）
 */
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const current = new Date('2026-04-01'); // ストーリーの時点
  let age = current.getFullYear() - birth.getFullYear();
  const monthDiff = current.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && current.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * 天中殺を判定
 */
function getTenchusatsu(nikkan: string, gesshi: string): string {
  const nikkanIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(nikkan);
  const gesshiIdx = '子丑寅卯辰巳午未申酉戌亥'.indexOf(gesshi);

  // 天中殺パターン
  if (gesshiIdx >= 0 && gesshiIdx <= 1) return '子丑天中殺';
  if (gesshiIdx >= 2 && gesshiIdx <= 3) return '寅卯天中殺';
  if (gesshiIdx >= 4 && gesshiIdx <= 5) return '辰巳天中殺';
  if (gesshiIdx >= 6 && gesshiIdx <= 7) return '午未天中殺';
  if (gesshiIdx >= 8 && gesshiIdx <= 9) return '申酉天中殺';
  if (gesshiIdx >= 10 && gesshiIdx <= 11) return '戌亥天中殺';

  return '';
}

/**
 * キャラクターを検証
 */
function verifyCharacter(char: Character, episodeTheme: string): VerificationResult {
  const birthDate = new Date(char.birth_date);
  const calculatedAge = calculateAge(char.birth_date);

  // accurate-logicで計算
  const bazi: FourPillars = calculateBaZi(birthDate, 135);
  const yangsen: YangSen = calculateYangSen(bazi, birthDate);

  const nikkan = bazi.day.stemStr;
  const gesshi = bazi.day.branchStr;
  const tenchusatsu = getTenchusatsu(nikkan, gesshi);

  // 既存データとの照合
  const nikkanMatch = nikkan === char.sanmeigaku.nikkan;
  const gesshiMatch = gesshi === char.sanmeigaku.gesshi;
  const jugdaisMatch = JSON.stringify(yangsen.jugdai) === JSON.stringify(char.sanmeigaku.jugdais);
  const junidaiMatch = JSON.stringify(yangsen.junidai) === JSON.stringify(char.sanmeigaku.junidai);

  // 年齢の妥当性確認
  const ageDiff = Math.abs(calculatedAge - char.age);
  const appropriateAge = ageDiff <= 1; // 1歳以内の誤差は許容

  // テーマとの整合性確認
  let appropriateTenchusatsu = true;
  let notes = '';

  // 天中殺の整合性チェック（簡易版）
  if (char.sanmeigaku.tenchusatsu && char.sanmeigaku.tenchusatsu !== tenchusatsu) {
    if (char.sanmeigaku.tenchusatsu !== '') {
      appropriateTenchusatsu = false;
      notes += `天中殺不一致: 既存=${char.sanmeigaku.tenchusatsu}, 計算=${tenchusatsu}. `;
    }
  }

  // 調整が必要か判定
  const needsAdjustment = !appropriateAge || !appropriateTenchusatsu || !nikkanMatch || !gesshiMatch;

  const result: VerificationResult = {
    episode: char.episode,
    name: char.name,
    birth_date: char.birth_date,
    calculated: {
      nikkan,
      gesshi,
      tenchusatsu,
      jugdais: yangsen.jugdai,
      junidai: yangsen.junidai,
      five_elements: char.sanmeigaku.five_elements, // TODO: 正しく計算
      total_energy: yangsen.totalEnergy
    },
    existing: char.sanmeigaku,
    matches: {
      nikkan: nikkanMatch,
      gesshi: gesshiMatch,
      jugdais: jugdaisMatch,
      junidai: junidaiMatch
    },
    theme_consistency: {
      appropriate_age: appropriateAge,
      appropriate_tenchusatsu: appropriateTenchusatsu,
      notes: notes
    },
    needsAdjustment,
    adjustment_reason: needsAdjustment ? `年齢${appropriateAge ? 'OK' : 'NG'}, 天中殺${appropriateTenchusatsu ? 'OK' : 'NG'}, 日干${nikkanMatch ? 'OK' : 'NG'}` : undefined
  };

  return result;
}

/**
 * メイン処理
 */
async function main() {
  console.log('既存キャラクター検証開始...\n');

  // キャラクターファイルを読み込み
  const episodes124 = JSON.parse(fs.readFileSync(path.join(__dirname, '../claudedocs/EPISODES-1-24-CHARACTERS.json'), 'utf-8'));
  // 他のエピソードも同様に読み込み...

  const results: VerificationResult[] = [];

  // エピソード1-24を検証
  console.log('エピソード1-24を検証中...');
  for (const char of episodes124) {
    if (char.name === '（来院者なし）') continue;

    const result = verifyCharacter(char as Character, '');
    results.push(result);

    console.log(`エピソード${result.episode}: ${result.name}`);
    console.log(`  日干: ${result.calculated.nikkan} (${result.matches.nikkan ? 'OK' : 'NG'})`);
    console.log(`  年齢: ${calculateAge(char.birth_date)}歳 (記録: ${char.age}歳) ${result.theme_consistency.appropriate_age ? 'OK' : 'NG'}`);
    console.log(`  調整要: ${result.needsAdjustment ? 'YES' : 'NO'}`);
    if (result.adjustment_reason) {
      console.log(`  理由: ${result.adjustment_reason}`);
    }
    console.log('');
  }

  // 結果サマリー
  const needsAdjustmentCount = results.filter(r => r.needsAdjustment).length;
  console.log(`\n検証完了:`);
  console.log(`  総数: ${results.length}`);
  console.log(`  調整必要: ${needsAdjustmentCount}`);
  console.log(`  問題なし: ${results.length - needsAdjustmentCount}`);

  // レポート出力
  const reportPath = path.join(__dirname, '../claudedocs/VERIFICATION-REPORT-EPISODES-1-24.md');
  fs.writeFileSync(reportPath, generateReport(results));
  console.log(`\nレポート出力: ${reportPath}`);
}

/**
 * レポート生成
 */
function generateReport(results: VerificationResult[]): string {
  let markdown = '# 既存キャラクター検証レポート\n\n';
  markdown += '**作成日**: ' + new Date().toISOString() + '\n\n';

  markdown += '## サマリー\n\n';
  markdown += `- 総数: ${results.length}\n`;
  markdown += `- 調整必要: ${results.filter(r => r.needs_adjustment).length}\n`;
  markdown += `- 問題なし: ${results.filter(r => !r.needs_adjustment).length}\n\n`;

  markdown += '## 調整必要キャラクター\n\n';
  const needsAdjustment = results.filter(r => r.needsAdjustment);
  if (needsAdjustment.length > 0) {
    for (const result of needsAdjustment) {
      markdown += `### エピソード${result.episode}: ${result.name}\n\n`;
      markdown += `- 生年月日: ${result.birth_date}\n`;
      markdown += `- 理由: ${result.adjustment_reason}\n`;
      markdown += `- 詳細: ${result.theme_consistency.notes}\n\n`;
    }
  } else {
    markdown += '調整必要なキャラクターはありません。\n\n';
  }

  return markdown;
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}

export { verifyCharacter, calculateAge, getTenchusatsu };
