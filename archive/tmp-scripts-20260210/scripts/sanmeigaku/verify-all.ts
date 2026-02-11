/**
 * 算命学検証スクリプト（全キャラクター一括検証）
 *
 * 使用方法:
 * npx tsx .tmp/scripts/sanmeigaku/verify-all.ts
 */

import fs from 'fs';
import path from 'path';
import { calculateKanshi } from '../../mobile/lib/logic/kanshi';

// 型定義
interface Character {
  episode: number;
  name: string;
  name_kana: string;
  birth_date: string;
  gender?: 'male' | 'female';
  age?: number;
  profession?: string;
  sanmeigaku: {
    nikkan: string;
    tenchusatsu: string;
    five_elements?: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    stars?: string[];
    energy_score?: number;
  };
}

interface VerificationResult {
  episode: number;
  name: string;
  name_kana: string;
  status: 'pass' | 'warning' | 'critical';
  errors: {
    field: string;
    expected: unknown;
    actual: unknown;
    severity: 'critical' | 'warning';
  }[];
}

/**
 * 五行バランスを比較（許容誤差±5%）
 */
function compareFiveElements(
  calculated: { wood: number; fire: number; earth: number; metal: number; water: number },
  expected?: { wood: number; fire: number; earth: number; metal: number; water: number }
): boolean {
  if (!expected) return true; // 比較対象がない場合はOK

  const tolerance = 0.05; // 5%の許容誤差

  return (
    Math.abs(calculated.wood - expected.wood) / expected.wood <= tolerance &&
    Math.abs(calculated.fire - expected.fire) / expected.fire <= tolerance &&
    Math.abs(calculated.earth - expected.earth) / expected.earth <= tolerance &&
    Math.abs(calculated.metal - expected.metal) / expected.metal <= tolerance &&
    Math.abs(calculated.water - expected.water) / expected.water <= tolerance
  );
}

/**
 * キャラクターを検証
 */
function verifyCharacter(character: Character): VerificationResult {
  const errors: VerificationResult['errors'] = [];

  try {
    // 算命学計算を実行
    const result = calculateKanshi({
      birthDate: new Date(character.birth_date),
      gender: character.gender || 'female',
      includeTaiun: false,
      includeInsen: true
    });

    // 1. 日干の検証（Critical）
    if (result.bazi.day.stemStr !== character.sanmeigaku.nikkan) {
      errors.push({
        field: 'nikkan',
        expected: character.sanmeigaku.nikkan,
        actual: result.bazi.day.stemStr,
        severity: 'critical'
      });
    }

    // 2. 天中殺の検証（Critical）
    const calculatedTenchusatsu = result.insen?.tenchusatsu?.type || '';
    if (calculatedTenchusatsu !== character.sanmeigaku.tenchusatsu) {
      errors.push({
        field: 'tenchusatsu',
        expected: character.sanmeigaku.tenchusatsu,
        actual: calculatedTenchusatsu,
        severity: 'critical'
      });
    }

    // 3. 五行バランスの検証（Warning）
    if (character.sanmeigaku.five_elements) {
      if (!compareFiveElements(result.fiveElements, character.sanmeigaku.five_elements)) {
        errors.push({
          field: 'five_elements',
          expected: character.sanmeigaku.five_elements,
          actual: result.fiveElements,
          severity: 'warning'
        });
      }
    }

    // 4. エネルギー点数の検証（Warning、許容誤差±3点）
    if (character.sanmeigaku.energy_score !== undefined) {
      if (Math.abs(result.energyScore - character.sanmeigaku.energy_score) > 3) {
        errors.push({
          field: 'energy_score',
          expected: character.sanmeigaku.energy_score,
          actual: result.energyScore,
          severity: 'warning'
        });
      }
    }

  } catch (error) {
    errors.push({
      field: 'calculation_error',
      expected: 'success',
      actual: error instanceof Error ? error.message : String(error),
      severity: 'critical'
    });
  }

  // ステータスを判定
  const hasCritical = errors.some(e => e.severity === 'critical');
  const hasWarning = errors.some(e => e.severity === 'warning');

  return {
    episode: character.episode,
    name: character.name,
    name_kana: character.name_kana,
    status: hasCritical ? 'critical' : hasWarning ? 'warning' : 'pass',
    errors
  };
}

/**
 * メイン処理
 */
async function main() {
  console.log('🔍 算命学検証開始...\n');

  // 全キャラクターファイルを読み込み
  const files = [
    'EPISODES-1-24-CHARACTERS.json',
    'EPISODES-25-48-CHARACTERS.json',
    'EPISODES-49-72-CHARACTERS.json',
    'EPISODES-73-96-CHARACTERS.json'
  ];

  const allCharacters: Character[] = [];
  const missingFiles: string[] = [];

  for (const file of files) {
    const filePath = path.join(process.cwd(), 'claudedocs', file);

    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      allCharacters.push(...data.characters);
      console.log(`✅ ${file}: ${data.characters.length}キャラクター`);
    } catch (error) {
      console.error(`❌ ${file} の読み込みに失敗:`, error);
    }
  }

  if (missingFiles.length > 0) {
    console.log(`\n⚠️  以下のファイルがまだ作成されていません:`);
    missingFiles.forEach(f => console.log(`   - ${f}`));
    console.log('\nデザインチームの作業完了をお待ちください。\n');
    return;
  }

  console.log(`\n📊 全キャラクター数: ${allCharacters.length}名\n`);

  // 検証実行
  const results: VerificationResult[] = [];
  let passCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  for (const character of allCharacters) {
    const result = verifyCharacter(character);
    results.push(result);

    if (result.status === 'pass') passCount++;
    else if (result.status === 'warning') warningCount++;
    else if (result.status === 'critical') criticalCount++;

    // 進捗表示
    if (result.status !== 'pass') {
      console.log(
        `${result.status === 'critical' ? '🔴' : '🟡'} ` +
        `Ep.${result.episode} ${result.name_kana} (${result.errors.length} errors)`
      );
    }
  }

  // 結果サマリー
  console.log('\n' + '='.repeat(60));
  console.log('検証結果サマリー');
  console.log('='.repeat(60));
  console.log(`✅ 合格: ${passCount}名 (${((passCount / allCharacters.length) * 100).toFixed(1)}%)`);
  console.log(`🟡 警告: ${warningCount}名 (${((warningCount / allCharacters.length) * 100).toFixed(1)}%)`);
  console.log(`🔴 重大: ${criticalCount}名 (${((criticalCount / allCharacters.length) * 100).toFixed(1)}%)`);
  console.log('='.repeat(60) + '\n');

  // 詳細結果をJSONで出力
  const outputPath = path.join(process.cwd(), '.tmp', 'verification-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`📄 詳細結果: ${outputPath}\n`);

  // Criticalエラーがある場合は警告
  if (criticalCount > 0) {
    console.log('⚠️  重大なエラーが見つかりました。修正が必要です。\n');
    process.exit(1);
  }
}

main().catch(console.error);
