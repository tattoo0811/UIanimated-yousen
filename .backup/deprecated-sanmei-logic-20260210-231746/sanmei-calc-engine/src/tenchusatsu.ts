/**
 * tenchusatsu.ts - 天中殺計算エンジン
 *
 * 天中殺（てんちゅうさつ）は運命学における「虚の時間」を示します。
 * 60干支周期は6つの旬（じゅん）に分けられ、各旬には12支のうち2つが欠けます。
 * その欠けた2つの支の期間が「天中殺」です。
 *
 * 天中殺の期間中に該当する支に関する運や事柄は影響を受けやすくなります。
 */

import type { Tenchusatsu } from './types';
import { BRANCHES } from './constants';

/**
 * 60干支周期を6つの旬に分類
 * 各旬は10個の干と最初の10個の支を使用する（1つの支は共有）
 *
 * 旬の分類と虚の支：
 * - Group 0 (甲子旬, 干支index 0-9): 虚の支 = 戌,亥 (index 10,11) → 戌亥天中殺
 * - Group 1 (甲戌旬, 干支index 10-19): 虚の支 = 申,酉 (index 8,9) → 申酉天中殺
 * - Group 2 (甲申旬, 干支index 20-29): 虚の支 = 午,未 (index 6,7) → 午未天中殺
 * - Group 3 (甲午旬, 干支index 30-39): 虚の支 = 辰,巳 (index 4,5) → 辰巳天中殺
 * - Group 4 (甲辰旬, 干支index 40-49): 虚の支 = 寅,卯 (index 2,3) → 寅卯天中殺
 * - Group 5 (甲寅旬, 干支index 50-59): 虚の支 = 子,丑 (index 0,1) → 子丑天中殺
 */

/**
 * 虚の支を計算するための定数
 * 公式: voidBranch = (10 - groupIndex * 2) % 12
 */
const VOID_BRANCH_MAP: Record<number, { branch1: number; branch2: number; name: string }> = {
  0: { branch1: 10, branch2: 11, name: '戌亥天中殺' },
  1: { branch1: 8, branch2: 9, name: '申酉天中殺' },
  2: { branch1: 6, branch2: 7, name: '午未天中殺' },
  3: { branch1: 4, branch2: 5, name: '辰巳天中殺' },
  4: { branch1: 2, branch2: 3, name: '寅卯天中殺' },
  5: { branch1: 0, branch2: 1, name: '子丑天中殺' }
};

/**
 * 干支インデックスからグループ番号を計算
 *
 * @param kanshiIndex - 干支インデックス (0-59)
 * @returns グループ番号 (0-5)
 */
function calculateGroupIndex(kanshiIndex: number): number {
  return Math.floor(kanshiIndex / 10);
}

/**
 * グループ番号から虚の支を取得
 *
 * @param groupIndex - グループ番号 (0-5)
 * @returns 虚の支のオブジェクト {branch1, branch2, name}
 */
function getVoidBranches(groupIndex: number): { branch1: number; branch2: number; name: string } {
  if (!VOID_BRANCH_MAP[groupIndex]) {
    throw new Error(`Invalid group index: ${groupIndex}. Must be between 0 and 5.`);
  }
  return VOID_BRANCH_MAP[groupIndex];
}

/**
 * 干支インデックスから天中殺を計算
 *
 * アルゴリズム：
 * 1. 日柱の干支インデックスからグループ番号を計算（index / 10）
 * 2. グループ番号から虚の支を取得
 * 3. 虚の支の名前を決定
 * 4. 虚の支の期間を計算
 *
 * @param dayKanshiIndex - 日柱の干支インデックス (0-59)
 * @returns 天中殺のオブジェクト
 */
export function calculateTenchusatsu(dayKanshiIndex: number): Tenchusatsu {
  // バリデーション
  if (dayKanshiIndex < 0 || dayKanshiIndex > 59) {
    throw new Error(`Invalid kanshi index: ${dayKanshiIndex}. Must be between 0 and 59.`);
  }

  // グループ番号を計算（0-5）
  const groupIndex = calculateGroupIndex(dayKanshiIndex);

  // 虚の支を取得
  const voidInfo = getVoidBranches(groupIndex);

  // 虚の支の名前を取得（支の名前から）
  const voidBranch1Name = BRANCHES[voidInfo.branch1];
  const voidBranch2Name = BRANCHES[voidInfo.branch2];

  // 天中殺の期間を計算（12年周期内での位置）
  // グループ内での干支インデックス
  const indexInGroup = dayKanshiIndex % 10;

  // 天中殺がその人の運に影響を与える期間
  // 虚の支に関連する事柄に影響がある期間は、その人の生年月日による
  const affectedYears = calculateAffectedYears(groupIndex, indexInGroup);

  return {
    type: voidInfo.name,
    branch1: voidInfo.branch1,
    branch1Name: voidBranch1Name,
    branch2: voidInfo.branch2,
    branch2Name: voidBranch2Name,
    groupIndex,
    affectedYears,
    description: generateTenchusatsuDescription(voidInfo.name)
  };
}

/**
 * 天中殺が影響する年を計算
 * 虚の支に当たる年（12年周期）が該当します
 *
 * @param groupIndex - グループ番号 (0-5)
 * @param indexInGroup - グループ内でのインデックス (0-9)
 * @returns 影響を受ける年の配列
 */
function calculateAffectedYears(groupIndex: number, indexInGroup: number): number[] {
  // 天中殺の影響は12年周期
  const voidInfo = VOID_BRANCH_MAP[groupIndex];

  // その人の天中殺の期間は、生年月日に基づきます
  // ここでは虚の支が該当する年を計算
  const affectedYears: number[] = [];

  // 虚の支に該当する干支のインデックスを計算
  for (let i = 0; i < 6; i++) {
    const kanshiIndex1 = groupIndex * 10 + i * 2 + (12 - (voidInfo.branch1 - groupIndex * 2 * 2)) % 12;
    const kanshiIndex2 = groupIndex * 10 + i * 2 + (12 - (voidInfo.branch2 - groupIndex * 2 * 2)) % 12;

    // より簡単な計算：虚の支は12年ごと
    if (i < 6) {
      affectedYears.push(i * 12 + (voidInfo.branch1 + 12 - groupIndex * 2) % 12);
      affectedYears.push(i * 12 + (voidInfo.branch2 + 12 - groupIndex * 2) % 12);
    }
  }

  return affectedYears.filter((y, i, arr) => arr.indexOf(y) === i).slice(0, 12);
}

/**
 * 天中殺の説明を生成
 *
 * @param tenchusatsuType - 天中殺の種類（例："戌亥天中殺"）
 * @returns 日本語の説明文
 */
function generateTenchusatsuDescription(tenchusatsuType: string): string {
  const descriptions: Record<string, string> = {
    '戌亥天中殺':
      '戌亥の方向（北西）に関する運が低下します。不動産や家族関係、長期計画に影響が出やすい時期です。',
    '申酉天中殺':
      '申酉の方向（西）に関する運が低下します。対人関係、契約、金銭面に影響が出やすい時期です。',
    '午未天中殺':
      '午未の方向（南）に関する運が低下します。恋愛、結婚、健康面に影響が出やすい時期です。',
    '辰巳天中殺':
      '辰巳の方向（南東）に関する運が低下します。仕事、成長、発展に影響が出やすい時期です。',
    '寅卯天中殺':
      '寅卯の方向（東）に関する運が低下します。新規事業、発進、決断に影響が出やすい時期です。',
    '子丑天中殺':
      '子丑の方向（北）に関する運が低下します。基盤、安定、内面に影響が出やすい時期です。'
  };

  return descriptions[tenchusatsuType] || '天中殺の影響を注視してください。';
}

/**
 * 支が天中殺に含まれるかをチェック
 *
 * @param branchIndex - チェック対象の支のインデックス (0-11)
 * @param tenchusatsu - 天中殺のオブジェクト
 * @returns 天中殺に含まれる場合true
 */
export function isBranchInVoid(branchIndex: number, tenchusatsu: Tenchusatsu): boolean {
  return branchIndex === tenchusatsu.branch1 || branchIndex === tenchusatsu.branch2;
}

/**
 * 干支から天中殺を判定する場合
 * 干支インデックスが虚の支に当たるかをチェック
 *
 * @param kanshiIndex - 干支インデックス (0-59)
 * @param tenchusatsu - 天中殺のオブジェクト
 * @returns 天中殺に当たる場合true
 */
export function isKanshiInVoid(kanshiIndex: number, tenchusatsu: Tenchusatsu): boolean {
  // 干支のブランチ部分を取得（干支 % 12）
  const branchInKanshi = kanshiIndex % 12;

  return (
    branchInKanshi === tenchusatsu.branch1 ||
    branchInKanshi === tenchusatsu.branch2
  );
}

/**
 * 天中殺の情報を人間が読める形式で出力
 *
 * @param tenchusatsu - 天中殺のオブジェクト
 * @returns 整形された説明文
 */
export function formatTenchusatsu(tenchusatsu: Tenchusatsu): string {
  return `
天中殺の種類: ${tenchusatsu.type}
虚の支: ${tenchusatsu.branch1Name} (${tenchusatsu.branch1}) と ${tenchusatsu.branch2Name} (${tenchusatsu.branch2})
グループ: ${tenchusatsu.groupIndex} (${['甲子旬', '甲戌旬', '甲申旬', '甲午旬', '甲辰旬', '甲寅旬'][tenchusatsu.groupIndex]})
説明: ${tenchusatsu.description}
影響を受ける年: ${tenchusatsu.affectedYears.join(', ')}年ごと（12年周期）
  `.trim();
}
