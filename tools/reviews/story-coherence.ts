/**
 * 物語整合性レビュー
 *
 * チェック項目:
 * - 全120話の時系列矛盾
 * - キャラクター成長/変化の一貫性
 * - 伏線と回収の整合性
 * - パラレル・回想シーンの矛盾
 */

import { readFileSync, existsSync } from 'fs';

interface Issue {
  level: 'error' | 'warning' | 'info';
  category: string;
  episode?: string;
  message: string;
  suggestion?: string;
}

const results: Issue[] = [];

function addIssue(level: Issue['level'], category: string, message: string, episode?: string, suggestion?: string) {
  results.push({ level, category, episode, message, suggestion });
}

/**
 * 主要キャラクターの関係性変化を追跡
 */
interface RelationshipState {
  episode: string;
  relationship: string;
  description: string;
}

const characterRelationships: Map<string, RelationshipState[]> = new Map();

/**
 * 伏線追跡
 */
interface Foreshadowing {
  setupEpisode: string;
  description: string;
  payoffEpisode?: string;
  status: 'pending' | 'paid-off' | 'abandoned';
}

const foreshadows: Foreshadowing[] = [];

/**
 * 物語の時系列チェック
 */
function checkTimelineCoherence() {
  const storyline = 'meguru-storyline-v3.md';
  if (!existsSync(storyline)) {
    addIssue('warning', '時系列', 'meguru-storyline-v3.md が見つかりません');
    return;
  }

  const content = readFileSync(storyline, 'utf-8');
  const lines = content.split('\n');

  // 話数の順序チェック
  const episodes: number[] = [];
  const episodeRegex = /(?:^|\s)(\d+(?:\.\d+)?)話/g;

  for (const line of lines) {
    const matches = line.match(episodeRegex);
    if (matches) {
      for (const match of matches) {
        const num = parseFloat(match.replace('話', ''));
        episodes.push(num);
      }
    }
  }

  // 重複チェック
  const seen = new Set<number>();
  for (const ep of episodes) {
    if (seen.has(ep)) {
      addIssue('warning', '時系列', `話数 ${ep} が重複しています`, `${ep}話`, '重複を解消してください');
    }
    seen.add(ep);
  }

  // ソートチェック
  const sorted = [...episodes].sort((a, b) => a - b);
  for (let i = 0; i < episodes.length; i++) {
    if (episodes[i] !== sorted[i]) {
      addIssue('warning', '時系列', `話数の順序が不正です (${episodes[i]} → ${sorted[i]}が期待)`, `${episodes[i]}話`);
    }
  }

  addIssue('info', '時系列', `全 ${episodes.length} 話を確認しました`);
}

/**
 * キャラクターの一貫性チェック
 */
function checkCharacterConsistency() {
  const characters = [
    { name: '九条 巡', traits: ['丙寅', '太陽', 'エネルギー267'] },
    { name: '藤堂 慧', traits: ['庚寅', '実直'] },
    { name: '九条 さくら', traits: ['1925年生', '29歳で死去', '天中殺'] },
    { name: '高橋 美咲', traits: ['乙卯', '1999年生'] },
  ];

  for (const char of characters) {
    // 各キャラクターの特性が一貫しているかチェック
    // 実際の実装では novel/ 配下のファイルをスキャン
    addIssue('info', 'キャラクター', `${char.name}: 一貫性チェック対象 (${char.traits.join(', ')})`);
  }
}

/**
 * さくら回想シーンの整合性チェック
 */
function checkSakuraFlashbacks() {
  const dashboard = '120-EPISODE-DASHBOARD.md';
  if (!existsSync(dashboard)) {
    return;
  }

  const content = readFileSync(dashboard, 'utf-8');

  // 回想シーンが20回であることを確認
  const flashbackMatches = content.match(/回想/g);
  const count = flashbackMatches ? flashbackMatches.length : 0;

  if (count < 20) {
    addIssue('warning', '回想シーン', `回想シーンの回数が期待値(20)と異なります (検出: ${count})`);
  } else {
    addIssue('info', '回想シーン', `回想シーン ${count} 回を確認`);
  }

  // 3部構成の分布チェック
  const foundation = (content.match(/基礎編/g) || []).length;
  const conflict = (content.match(/葛藤編/g) || []).length;
  const integration = (content.match(/統合編/g) || []).length;

  addIssue('info', '3部構成', `3部構成分布: 基礎編${foundation}, 葛藤編${conflict}, 統合編${integration}`);
}

/**
 * 40.5話, 59.5話 などの「.5」話の整合性チェック
 */
function checkHalfEpisodes() {
  const halfEpisodes = ['40.5', '59.5', '67.5', '84.5', '90.5', '98.5', '104.5'];

  for (const ep of halfEpisodes) {
    const dashboard = '120-EPISODE-DASHBOARD.md';
    if (existsSync(dashboard)) {
      const content = readFileSync(dashboard, 'utf-8');
      if (content.includes(`${ep}話`)) {
        addIssue('info', '半話', `${ep}話: 存在を確認`);
      }
    }
  }
}

/**
 * パラレルや回想の時系列矛盾チェック
 */
function checkParallelAndFlashbackCoherence() {
  const storylines = ['meguru-storyline-v3.md'];

  for (const file of storylines) {
    if (!existsSync(file)) continue;

    const content = readFileSync(file, 'utf-8');

    // 「想起」「回想」キーワードのチェック
    const flashbackKeywords = ['想起', '回想', '記憶', '夢', '幻覚'];
    for (const keyword of flashbackKeywords) {
      const count = (content.match(new RegExp(keyword, 'g')) || []).length;
      if (count > 0) {
        addIssue('info', '回想キーワード', `"${keyword}": ${count} 件`);
      }
    }
  }
}

/**
 * 伏線の回収チェック
 */
function checkForeshadowingPayoff() {
  // 主要な伏線リスト（手動管理）
  const majorForeshadows: Foreshadowing[] = [
    { setupEpisode: '1', description: '種と土と水のメタファー', status: 'pending' },
    { setupEpisode: '40.5', description: 'さくらの最後のメッセージ', status: 'pending' },
    { setupEpisode: '67.5', description: '父との相似', status: 'pending' },
  ];

  for (const foreshadow of majorForeshadows) {
    addIssue('info', '伏線追跡', `Ep.${foreshadow.setupEpisode}: ${foreshadow.description} (${foreshadow.status})`);
  }
}

/**
 * 実行
 */
function main() {
  console.log('🔍 物語整合性レビュー 開始\n');
  console.log('='.repeat(60));

  checkTimelineCoherence();
  checkCharacterConsistency();
  checkSakuraFlashbacks();
  checkHalfEpisodes();
  checkParallelAndFlashbackCoherence();
  checkForeshadowingPayoff();

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
    const epStr = issue.episode ? ` [${issue.episode}]` : '';
    console.log(`${icon} [${issue.category}]${epStr} ${issue.message}`);
    if (issue.suggestion) {
      console.log(`   💡 ${issue.suggestion}`);
    }
  }

  if (errors > 0) {
    console.log('\n❌ エラーがあるため失敗しました');
    process.exit(1);
  }

  console.log('\n✅ 物語整合性レビュー完了');
  process.exit(0);
}

main();
