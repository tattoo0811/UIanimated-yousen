/**
 * 100個のランダムな生年月日で四柱推命と陰陽五行を計算するスクリプト
 */

import { calculateBaZi, calculateYangSen } from '../src/index';
import type { FourPillars, YangSen } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

// 入力データの型定義
interface RandomDate {
  id: number;
  date: string;
  gender: string;
  year: number;
  month: number;
  day: number;
}

interface InputData {
  generated: string;
  total: number;
  dates: RandomDate[];
}

// 出力データの型定義
interface ResultItem {
  id: number;
  date: string;
  gender: string;
  fourPillars: {
    year: { name: string; stemStr: string; branchStr: string; id: number };
    month: { name: string; stemStr: string; branchStr: string; id: number };
    day: { name: string; stemStr: string; branchStr: string; id: number };
    hour: { name: string; stemStr: string; branchStr: string; id: number };
  };
  tenMajorStars: {
    head: string;
    chest: string;
    belly: string;
    rightHand: string;
    leftHand: string;
  };
  twelveMinorStars: {
    leftShoulder: { name: string; score: number };
    leftLeg: { name: string; score: number };
    rightLeg: { name: string; score: number };
  };
}

interface OutputData {
  timestamp: string;
  total: number;
  results: ResultItem[];
}

/**
 * 干支をシンプルなオブジェクトに変換
 */
function simplifyGanZhi(ganZhi: { name: string; stemStr: string; branchStr: string; id: number }) {
  return {
    name: ganZhi.name,
    stemStr: ganZhi.stemStr,
    branchStr: ganZhi.branchStr,
    id: ganZhi.id
  };
}

/**
 * メイン処理
 */
function main() {
  // 入力ファイルを読み込み
  const inputPath = path.join(__dirname, '../claudedocs/random_100_dates.json');
  const inputData: InputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log(`生年月日データを読み込みました: ${inputData.total}件`);

  // 結果を格納する配列
  const results: ResultItem[] = [];

  // 各生年月日で計算を実行
  for (const item of inputData.dates) {
    try {
      // 生年月日からDateオブジェクトを作成（正午を設定）
      const date = new Date(item.year, item.month - 1, item.day, 12, 0, 0);

      // 四柱推命を計算
      const bazi: FourPillars = calculateBaZi(date);

      // 陽占を計算
      const yangSen: YangSen = calculateYangSen(bazi, date);

      // 結果を格納
      const result: ResultItem = {
        id: item.id,
        date: item.date,
        gender: item.gender,
        fourPillars: {
          year: simplifyGanZhi(bazi.year),
          month: simplifyGanZhi(bazi.month),
          day: simplifyGanZhi(bazi.day),
          hour: simplifyGanZhi(bazi.hour)
        },
        tenMajorStars: {
          head: yangSen.head,
          chest: yangSen.chest,
          belly: yangSen.belly,
          rightHand: yangSen.rightHand,
          leftHand: yangSen.leftHand
        },
        twelveMinorStars: {
          leftShoulder: yangSen.leftShoulder,
          leftLeg: yangSen.leftLeg,
          rightLeg: yangSen.rightLeg
        }
      };

      results.push(result);

      // 進捗表示
      if (results.length % 10 === 0) {
        console.log(`処理中... ${results.length}/${inputData.total}`);
      }
    } catch (error) {
      console.error(`エラーが発生しました (ID: ${item.id}, Date: ${item.date}):`, error);
      // エラーが発生しても続行
    }
  }

  // 出力データを作成
  const outputData: OutputData = {
    timestamp: new Date().toISOString(),
    total: results.length,
    results: results
  };

  // 結果をJSONファイルに保存
  const outputPath = path.join(__dirname, '../our_logic_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

  console.log(`\n完了！`);
  console.log(`処理件数: ${results.length}/${inputData.total}`);
  console.log(`出力ファイル: ${outputPath}`);
}

// スクリプトを実行
main();
