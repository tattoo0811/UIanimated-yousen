#!/usr/bin/env node
/**
 * 算命学計算CLIツール
 *
 * 使い方:
 *   node calculate-sanmeigaku.js "名前" "生年月日(YYYY-MM-DD)" "生時刻(HH:MM)"
 *
 * 例:
 *   node calculate-sanmeigaku.js "涼子" "1977-08-20" "14:00"
 */

const path = require('path');

// accurate-logicからインポート
const baziModule = require('../accurate-logic/dist/src/bazi.js');
const yangsenModule = require('../accurate-logic/dist/src/yangsen.js');
const constantsModule = require('../accurate-logic/dist/src/constants.js');

const { calculateBaZi } = baziModule;
const { calculateYangSen } = yangsenModule;

function calculate(name, birthDate, birthTime) {
  try {
    // Dateオブジェクト作成
    const date = new Date(`${birthDate}T${birthTime}:00`);

    // 四柱推命計算
    const fourPillars = calculateBaZi(date, 135); // 経度135度（日本標準）

    // 十大主星・十二大従星計算
    const yangSen = calculateYangSen(fourPillars, date);

    // 結果を構築
    const result = {
      params: {
        name,
        birthDate,
        birthTime
      },
      fourPillars: {
        year: {
          stem: fourPillars.year.stemStr,
          branch: fourPillars.year.branchStr,
          stemStr: fourPillars.year.stemStr,
          branchStr: fourPillars.year.branchStr
        },
        month: {
          stem: fourPillars.month.stemStr,
          branch: fourPillars.month.branchStr,
          stemStr: fourPillars.month.stemStr,
          branchStr: fourPillars.month.branchStr
        },
        day: {
          stem: fourPillars.day.stemStr,
          branch: fourPillars.day.branchStr,
          stemStr: fourPillars.day.stemStr,
          branchStr: fourPillars.day.branchStr
        },
        hour: {
          stem: fourPillars.hour.stemStr,
          branch: fourPillars.hour.branchStr,
          stemStr: fourPillars.hour.stemStr,
          branchStr: fourPillars.hour.branchStr
        }
      },
      jugdai: {
        head: yangSen.head,
        chest: yangSen.chest,
        belly: yangSen.belly,
        rightHand: yangSen.rightHand,
        leftHand: yangSen.leftHand
      },
      junidai: {
        leftShoulder: yangSen.leftShoulder.name,
        leftLeg: yangSen.leftLeg.name,
        rightLeg: yangSen.rightLeg.name
      }
    };

    return result;
  } catch (error) {
    return {
      error: error.message,
      stack: error.stack
    };
  }
}

// コマンドライン引数の解析
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error(`
使い方: node calculate-sanmeigaku.js <name> <birthdate> <birthtime>

例:
  node calculate-sanmeigaku.js "涼子" "1977-08-20" "14:00"

引数:
  name: キャラクター名
  birthdate: 生年月日 (YYYY-MM-DD)
  birthtime: 出生時刻 (HH:MM)
  `);
  process.exit(1);
}

const [name, birthDate, birthTime] = args;

// 計算実行
const result = calculate(name, birthDate, birthTime);

// 結果出力
if (result.error) {
  console.error('❌ エラーが発生しました:', result.error);
  console.error(result.stack);
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log(`算命学計算結果: ${name}`);
console.log('═══════════════════════════════════════════════════════════════');
console.log(`生年月日: ${birthDate}`);
console.log(`出生時刻: ${birthTime}`);
console.log('');

console.log('【四柱推命】');
console.log(`  年柱: ${result.fourPillars.year.stemStr}${result.fourPillars.year.branchStr}`);
console.log(`  月柱: ${result.fourPillars.month.stemStr}${result.fourPillars.month.branchStr}`);
console.log(`  日柱: ${result.fourPillars.day.stemStr}${result.fourPillars.day.branchStr}`);
console.log(`  時柱: ${result.fourPillars.hour.stemStr}${result.fourPillars.hour.branchStr}`);
console.log('');

console.log('【十大主星】');
console.log(`  頭: ${result.jugdai.head}`);
console.log(`  胸: ${result.jugdai.chest}`);
console.log(`  腹: ${result.jugdai.belly}`);
console.log(`  右手: ${result.jugdai.rightHand}`);
console.log(`  左手: ${result.jugdai.leftHand}`);
console.log('');

console.log('【十二大従星】');
console.log(`  左肩: ${result.junidai.leftShoulder}`);
console.log(`  左足: ${result.junidai.leftLeg}`);
console.log(`  右足: ${result.junidai.rightLeg}`);
console.log('');

console.log('═══════════════════════════════════════════════════════════════');
console.log('人体図イメージ:');
console.log('');
console.log('         ' + result.jugdai.head + '    ' + result.junidai.leftShoulder);
console.log('  ' + result.jugdai.rightHand + '   ' + result.jugdai.chest + '   ' + result.jugdai.leftHand);
console.log('  ' + result.junidai.rightLeg + '   ' + result.jugdai.belly + '   ' + result.junidai.leftLeg);
console.log('');

// JSONも保存（オプション）
if (process.argv.includes('--json')) {
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(__dirname, `../claudedocs/calculation-${name}-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`💾 JSON保存: ${jsonPath}`);
}
