/**
 * 処方箋データシステム 検証スクリプト
 * Prescription Data System Validation Script
 */

import { getAllPilotPrescriptions, calibratePrescription } from '../data/prescriptions';

async function validatePrescriptions() {
  console.log('=== 処方箋データシステム検証 ===\n');

  // 1. 全パイロット処方箋を取得
  const prescriptions = getAllPilotPrescriptions();
  console.log(`✓ パイロット処方箋数: ${prescriptions.length}件`);

  // 2. 各処方箋の基本情報を表示
  console.log('\n--- 処方箋一覧 ---');
  prescriptions.forEach((p) => {
    console.log(`\n[${p.kanshi}] ${p.characterName} (${p.element})`);
    console.log(`  病名: ${p.diseaseName}`);
    console.log(`  サブタイトル: ${p.diseaseSubtitle}`);
    console.log(`  症状数: ${p.symptoms.length}件`);
    console.log(`  副作用数: ${p.sideEffects.length}件`);
  });

  // 3. 品質キャリブレーションを実行
  console.log('\n--- 品質キャリブレーション結果 ---');
  let totalScore = 0;
  let passCount = 0;

  prescriptions.forEach((p) => {
    const result = calibratePrescription(p);
    totalScore += result.totalScore;
    if (result.passed) passCount++;

    console.log(`\n${result.kanshi}: ${result.totalScore}点 (${result.passed ? '✓ 合格' : '✗ 不合格'})`);
    console.log(`  キャッチ力: ${result.scores.catchiness}/10 (25%)`);
    console.log(`  共感度: ${result.scores.empathy}/10 (25%)`);
    console.log(`  実用性: ${result.scores.practicality}/10 (20%)`);
    console.log(`  ユーモア: ${result.scores.humor}/10 (20%)`);
    console.log(`  SNS映え: ${result.scores.shareability}/10 (10%)`);

    if (result.feedback.length > 0) {
      console.log(`  フィードバック: ${result.feedback.join(', ')}`);
    }
  });

  // 4. 集計結果
  const averageScore = totalScore / prescriptions.length;
  const passRate = (passCount / prescriptions.length) * 100;

  console.log('\n=== 集計結果 ===');
  console.log(`平均点: ${Math.round(averageScore * 10) / 10}点`);
  console.log(`合格率: ${Math.round(passRate)}% (${passCount}/${prescriptions.length}件)`);
  console.log(`合格基準: 7.0点以上`);

  // 5. 最終判定
  if (averageScore >= 7.0 && passRate >= 80) {
    console.log('\n✓ 処方箋システム品質チェック合格');
    console.log('  Phase 1: パイロット生成完了');
    console.log('  次のステップ: Phase 2（全60干支生成）へ進むことができます');
  } else {
    console.log('\n✗ 処方箋システム品質チェック不合格');
    console.log('  要改善: 平均点が7.0未満、または合格率が80%未満');
    console.log('  次のステップ: コンテンツを見直してください');
  }
}

// 実行
validatePrescriptions().catch(console.error);
