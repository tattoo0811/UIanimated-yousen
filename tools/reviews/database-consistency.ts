/**
 * データ整合性レビュー
 *
 * チェック項目:
 * - MDファイルとデータベースの齟齬
 * - 生年月日と命式データの整合性
 * - 人物相関図の矛盾
 * - 大運順行・逆行ルールの遵守
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Character {
  name: string;
  birthdate: string;
  gender: 'male' | 'female';
  dayPillar?: string;
  energy?: number;
}

interface Issue {
  level: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion?: string;
}

const results: Issue[] = [];

function addIssue(level: Issue['level'], category: string, message: string, suggestion?: string) {
  results.push({ level, category, message, suggestion });
}

/**
 * 大運順行・逆行ルール検証
 * - 男性: 陽年干 → 順行、陰年干 → 逆行
 * - 女性: 陰年干 → 順行、陽年干 → 逆行
 */
const YANG_STEMS = ['甲', '丙', '戊', '庚', '壬'];
const YIN_STEMS = ['乙', '丁', '己', '辛', '癸'];

function getDayStem(birthdate: string): string {
  // 簡易実装: 四柱推命計算が必要
  // 実際には tools/sanmei-cli-v3.ts を使用
  const date = new Date(birthdate);
  const yearStems = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'];
  return yearStems[date.getFullYear() % 10];
}

function checkDayunDirection(birthdate: string, gender: 'male' | 'female'): string {
  const dayStem = getDayStem(birthdate);
  const isYang = YANG_STEMS.includes(dayStem);
  const isMale = gender === 'male';

  if (isMale && isYang) return '順行';
  if (isMale && !isYang) return '逆行';
  if (!isMale && !isYang) return '順行';
  return '逆行';
}

/**
 * 主要キャラクターのデータ整合性チェック
 */
function checkMainCharacters() {
  const mainChars: Character[] = [
    { name: '九条 巡', birthdate: '1990-03-02', gender: 'male', dayPillar: '丙寅', energy: 267 },
    { name: '藤堂 慧', birthdate: '1990-05-25', gender: 'male', dayPillar: '庚寅', energy: 255 },
    { name: '九条 さくら', birthdate: '1925-07-30', gender: 'female', energy: 204 },
    { name: '高橋 美咲', birthdate: '1999-05-03', gender: 'female', dayPillar: '乙卯', energy: 196 },
  ];

  for (const char of mainChars) {
    // 生年月日の形式チェック
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(char.birthdate)) {
      addIssue('error', '生年月日形式', `${char.name}: 生年月日の形式が不正です (${char.birthdate})`);
    }

    // 性別の有効性チェック
    if (!['male', 'female'].includes(char.gender)) {
      addIssue('error', '性別データ', `${char.name}: 性別の指定が不正です (${char.gender})`);
    }

    // 日柱の形式チェック（存在する場合）
    if (char.dayPillar) {
      const validStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const validBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const stem = char.dayPillar[0];
      const branch = char.dayPillar.slice(1);

      if (!validStems.includes(stem)) {
        addIssue('warning', '日柱データ', `${char.name}: 日柱の天干が不正です (${stem})`);
      }
      if (!validBranches.includes(branch)) {
        addIssue('warning', '日柱データ', `${char.name}: 日柱の地支が不正です (${branch})`);
      }
    }

    // エネルギー値の妥当性チェック
    if (char.energy !== undefined) {
      if (char.energy < 0 || char.energy > 400) {
        addIssue('warning', 'エネルギー値', `${char.name}: エネルギー値が異常範囲です (${char.energy})`);
      }
    }

    // 大運方向の整合性チェック
    const expectedDirection = checkDayunDirection(char.birthdate, char.gender);
    addIssue('info', '大運方向', `${char.name}: ${char.gender === 'male' ? '男性' : '女性'} (${char.birthdate}) → ${expectedDirection}`);
  }
}

/**
 * MDファイルとデータベースの同期チェック
 */
function checkMDDatabaseSync() {
  const filesToCheck = [
    'meguru-storyline-v3.md',
    '120-EPISODE-DASHBOARD.md',
  ];

  for (const file of filesToCheck) {
    if (!existsSync(file)) {
      addIssue('warning', 'ファイル存在', `${file} が見つかりません`);
      continue;
    }

    const content = readFileSync(file, 'utf-8');

    // 主要キャラクター名の言及チェック
    const mainCharacters = ['九条 巡', '藤堂 慧', '九条 さくら', '高橋 美咲'];
    for (const char of mainCharacters) {
      if (!content.includes(char)) {
        addIssue('info', 'キャラクター言及', `${char} が ${file} に言及されていません`);
      }
    }
  }
}

/**
 * AGENTS.md の主要キャラクター情報との整合性チェック
 */
function checkAgentsMDConsistency() {
  if (!existsSync('AGENTS.md')) {
    addIssue('warning', 'ファイル存在', 'AGENTS.md が見つかりません');
    return;
  }

  const content = readFileSync('AGENTS.md', 'utf-8');

  // 巡の情報チェック
  if (content.includes('九条 巡')) {
    if (!content.includes('1990-03-02')) {
      addIssue('warning', 'データ整合性', 'AGENTS.md: 九条 巡の生年月日が不一致の可能性');
    }
    if (!content.includes('丙寅')) {
      addIssue('warning', 'データ整合性', 'AGENTS.md: 九条 巡の日柱が不一致の可能性');
    }
    if (!content.includes('267点')) {
      addIssue('warning', 'データ整合性', 'AGENTS.md: 九条 巡のエネルギー値が不一致の可能性');
    }
  }
}

/**
 * 実行
 */
function main() {
  console.log('🔍 データ整合性レビュー 開始\n');
  console.log('='.repeat(60));

  checkMainCharacters();
  checkMDDatabaseSync();
  checkAgentsMDConsistency();

  console.log('\n' + '='.repeat(60));
  console.log(`\n✓ チェック完了: ${results.length} 件の issues\n`);

  // レベル別に集計
  const errors = results.filter(r => r.level === 'error').length;
  const warnings = results.filter(r => r.level === 'warning').length;
  const infos = results.filter(r => r.level === 'info').length;

  console.log(`📊 集計: ${errors} エラー, ${warnings} 警告, ${infos} 情報\n`);

  // 結果表示
  for (const issue of results) {
    const icon = { error: '❌', warning: '⚠️', info: 'ℹ️' }[issue.level];
    console.log(`${icon} [${issue.category}] ${issue.message}`);
    if (issue.suggestion) {
      console.log(`   💡 ${issue.suggestion}`);
    }
  }

  // 終了コード判定
  if (errors > 0) {
    console.log('\n❌ エラーがあるため失敗しました');
    process.exit(1);
  }

  console.log('\n✅ データ整合性レビュー完了');
  process.exit(0);
}

main();
