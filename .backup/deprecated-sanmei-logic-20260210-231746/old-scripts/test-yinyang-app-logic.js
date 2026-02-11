#!/usr/bin/env node
/**
 * yinyang-appのロジックを直接テスト
 */

// TypeScriptファイルを直接実行するため、ts-nodeを使用
const { execSync } = require('child_process');
const fs = require('fs');

// テストスクリプトを一時的に作成
const testScript = `
import { calculateBaZi, calculateYangSen } from '../yinyang-app/src/utils/logic.ts';

const date = new Date(1983, 7, 11, 12, 0); // 1983-08-11 12:00
const bazi = calculateBaZi(date, 135);
const yangSen = calculateYangSen(bazi);

console.log('=== yinyang-app 直接実行結果 ===');
console.log('四柱推命:');
console.log('  年柱:', bazi.year.name);
console.log('  月柱:', bazi.month.name);
console.log('  日柱:', bazi.day.name);
console.log('');
console.log('十大主星:');
console.log('  頭:', yangSen.head);
console.log('  胸:', yangSen.chest);
console.log('  腹:', yangSen.belly);
console.log('  右手:', yangSen.rightHand);
console.log('  左手:', yangSen.leftHand);
console.log('');
console.log('十二大従星:');
console.log('  左肩:', yangSen.leftShoulder.name);
console.log('  左足:', yangSen.leftLeg.name);
console.log('  右足:', yangSen.rightLeg.name);
`;

fs.writeFileSync('/tmp/test-yinyang-logic.mjs', testScript);

try {
  const result = execSync(
    'npx ts-node /tmp/test-yinyang-logic.mjs',
    { cwd: '/Users/kitamuratatsuhiko/UIanimated', encoding: 'utf8' }
  );
  console.log(result);
} catch (error) {
  console.error('エラー:', error.message);
  console.error('stdout:', error.stdout);
}
