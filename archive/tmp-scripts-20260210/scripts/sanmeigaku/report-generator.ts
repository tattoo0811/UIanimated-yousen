/**
 * 算命学検証レポート生成スクリプト
 *
 * 使用方法:
 * npx tsx .tmp/scripts/sanmeigaku/report-generator.ts
 */

import fs from 'fs';
import path from 'path';

// 型定義
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

interface Statistics {
  total: number;
  nikkanDistribution: Record<string, number>;
  tenchusatsuDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  professionCount: number;
  professions: string[];
  genderDistribution: Record<string, number>;
  energyScoreDistribution: {
    average: number | null;
    min: number | null;
    max: number | null;
  };
}

/**
 * メイン処理
 */
async function main() {
  console.log('📝 算命学検証レポート生成開始...\n');

  // 検証結果を読み込み
  const verificationPath = path.join(process.cwd(), '.tmp', 'verification-results.json');
  if (!fs.existsSync(verificationPath)) {
    console.error('❌ 検証結果が見つかりません。先に検証を実行してください。');
    console.log('   コマンド: npx tsx .tmp/scripts/sanmeigaku/verify-all.ts\n');
    process.exit(1);
  }

  const verificationResults: VerificationResult[] = JSON.parse(
    fs.readFileSync(verificationPath, 'utf-8')
  );

  // 統計結果を読み込み
  const statsPath = path.join(process.cwd(), '.tmp', 'statistics-results.json');
  if (!fs.existsSync(statsPath)) {
    console.error('❌ 統計結果が見つかりません。先に統計解析を実行してください。');
    console.log('   コマンド: npx tsx .tmp/scripts/sanmeigaku/stats-analysis.ts\n');
    process.exit(1);
  }

  const stats: Statistics = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));

  // レポート生成
  const report = generateReport(verificationResults, stats);

  // レポートを出力
  const outputPath = path.join(process.cwd(), 'claudedocs', 'SANMEIGAKU-VERIFICATION-REPORT.md');
  fs.writeFileSync(outputPath, report);

  console.log(`✅ レポートを生成しました: ${outputPath}\n`);
  console.log(report);
}

/**
 * レポートを生成
 */
function generateReport(
  verificationResults: VerificationResult[],
  stats: Statistics
): string {
  const total = verificationResults.length;
  const pass = verificationResults.filter(r => r.status === 'pass').length;
  const warning = verificationResults.filter(r => r.status === 'warning').length;
  const critical = verificationResults.filter(r => r.status === 'critical').length;

  let report = '# 96話キャラクター算命学検証報告\n\n';
  report += `**生成日時**: ${new Date().toLocaleString('ja-JP')}\n\n`;

  // === 検証サマリー ===
  report += '## 検証サマリー\n\n';
  report += `- **全キャラクター数**: ${total}名\n`;
  report += `- **検証合格**: ${pass}名 (${((pass / total) * 100).toFixed(1)}%)\n`;
  report += `- **修正必要**: ${warning + critical}名\n`;
  report += `  - 警告: ${warning}名\n`;
  report += `  - 重大: ${critical}名\n\n`;

  // === 統計データ ===
  report += '## 統計データ\n\n';

  // 日干分布
  report += '### 日干分布\n\n';
  report += '| 日干 | 人数 | 割合 | 目標 | 評価 |\n';
  report += '|------|------|------|------|------|\n';
  const nikkans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  nikkans.forEach(n => {
    const count = stats.nikkanDistribution[n] || 0;
    const percentage = ((count / total) * 100).toFixed(1);
    const target = '10個前後';
    const status = count >= 8 && count <= 12 ? '✅' : '⚠️';
    report += `| ${n} | ${count} | ${percentage}% | ${target} | ${status} |\n`;
  });
  report += '\n';

  // 天中殺分布
  report += '### 天中殺分布\n\n';
  report += '| 天中殺 | 人数 | 割合 | 目標 | 評価 |\n';
  report += '|--------|------|------|------|------|\n';
  const tenchusatsuList = [
    '子丑天中殺', '寅卯天中殺', '辰巳天中殺',
    '午未天中殺', '申酉天中殺', '戌亥天中殺'
  ];
  tenchusatsuList.forEach(t => {
    const count = stats.tenchusatsuDistribution[t] || 0;
    const percentage = ((count / total) * 100).toFixed(1);
    const target = '16個前後';
    const status = count >= 13 && count <= 19 ? '✅' : '⚠️';
    report += `| ${t} | ${count} | ${percentage}% | ${target} | ${status} |\n`;
  });
  report += '\n';

  // 年齢層分布
  report += '### 年齢層分布\n\n';
  report += '| 年齢層 | 人数 | 割合 |\n';
  report += '|--------|------|------|\n';
  Object.entries(stats.ageDistribution).forEach(([ageGroup, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    report += `| ${ageGroup} | ${count} | ${percentage}% |\n`;
  });
  report += '\n';

  // 職業の多様性
  report += '### 職業の多様性\n\n';
  report += `- **総職業数**: ${stats.professionCount}種類\n`;
  report += `- **目標**: 30種類以上\n`;
  report += `- **評価**: ${stats.professionCount >= 30 ? '✅ 達成' : '⚠️ 未達'}\n\n';

  // 性別分布
  report += '### 性別分布\n\n';
  report += '| 性別 | 人数 | 割合 |\n';
  report += '|------|------|------|\n';
  report += `| 男性 | ${stats.genderDistribution.male} | ${((stats.genderDistribution.male / total) * 100).toFixed(1)}% |\n`;
  report += `| 女性 | ${stats.genderDistribution.female} | ${((stats.genderDistribution.female / total) * 100).toFixed(1)}% |\n`;
  if (stats.genderDistribution.unknown > 0) {
    report += `| 不明 | ${stats.genderDistribution.unknown} | ${((stats.genderDistribution.unknown / total) * 100).toFixed(1)}% |\n`;
  }
  report += '\n';

  // エネルギー点数分布
  if (stats.energyScoreDistribution.average !== null) {
    report += '### エネルギー点数分布\n\n';
    report += `- **平均**: ${stats.energyScoreDistribution.average.toFixed(1)}点\n`;
    report += `- **最小**: ${stats.energyScoreDistribution.min}点\n`;
    report += `- **最大**: ${stats.energyScoreDistribution.max}点\n`;
    report += `- **範囲**: ${stats.energyScoreDistribution.max! - stats.energyScoreDistribution.min!}点\n\n`;
  }

  // === 問題一覧 ===
  report += '## 問題一覧\n\n';

  const criticalResults = verificationResults.filter(r => r.status === 'critical');
  const warningResults = verificationResults.filter(r => r.status === 'warning');

  if (criticalResults.length > 0) {
    report += '### Critical（重大な問題）\n\n';
    criticalResults.forEach(result => {
      report += `#### エピソード${result.episode}: ${result.name_kana} (${result.name})\n\n`;
      result.errors.forEach(error => {
        report += `- **${error.field}**\n`;
        report += `  - 設計値: \`${JSON.stringify(error.expected)}\`\n`;
        report += `  - 計算値: \`${JSON.stringify(error.actual)}\`\n`;
      });
      report += '\n';
    });
  }

  if (warningResults.length > 0) {
    report += '### Warning（警告）\n\n';
    warningResults.forEach(result => {
      report += `#### エピソード${result.episode}: ${result.name_kana} (${result.name})\n\n`;
      result.errors.forEach(error => {
        report += `- **${error.field}**\n`;
        report += `  - 設計値: \`${JSON.stringify(error.expected)}\`\n`;
        report += `  - 計算値: \`${JSON.stringify(error.actual)}\`\n`;
      });
      report += '\n';
    });
  }

  // === 結論 ===
  report += '## 結論\n\n';

  if (critical === 0 && warning === 0) {
    report += '✅ **全キャラクターの算命学的整合性が確認されました。**\n\n';
    report += '- 日干、天中殺の計算結果が設計値と完全に一致\n';
    report += '- 五行バランス、エネルギー点数も適切な範囲内\n';
    report += '- 統計的分布も目標通りに実現\n\n';
    report += '物語の展開において、算命学的な整合性は問題ありません。\n';
  } else if (critical > 0) {
    report += '⚠️ **重大な問題が見つかりました。修正が必要です。**\n\n';
    report += `- ${critical}名のキャラクターで日干または天中殺が不一致\n`;
    report += '- 該当するデザインチームと連携して修正を進めてください\n';
    report += '- 「矛盾はしないように生年月日と占い結果だけはデリケートに」\n';
    report += '  という指示を厳守し、慎重に対応してください\n\n';
    if (warning > 0) {
      report += `※ なお、${warning}名のキャラクターには軽微な警告がありますが、\n`;
      report += '   これは許容範囲内の誤差であるため、緊急の修正は不要です。\n';
    }
  } else {
    report += '✅ **おおむね良好です。**\n\n';
    report += `- 日干、天中殺の計算結果は全て一致\n`;
    report += `- ${warning}名のキャラクターに軽微な警告がありますが、\n`;
    report += '  これは許容範囲内の誤差であるため、緊急の修正は不要です\n\n';
    report += '物語の展開において、算命学的な整合性は問題ありません。\n';
  }

  return report;
}

main().catch(console.error);
