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
export declare function calculateTenchusatsu(dayKanshiIndex: number): Tenchusatsu;
/**
 * 支が天中殺に含まれるかをチェック
 *
 * @param branchIndex - チェック対象の支のインデックス (0-11)
 * @param tenchusatsu - 天中殺のオブジェクト
 * @returns 天中殺に含まれる場合true
 */
export declare function isBranchInVoid(branchIndex: number, tenchusatsu: Tenchusatsu): boolean;
/**
 * 干支から天中殺を判定する場合
 * 干支インデックスが虚の支に当たるかをチェック
 *
 * @param kanshiIndex - 干支インデックス (0-59)
 * @param tenchusatsu - 天中殺のオブジェクト
 * @returns 天中殺に当たる場合true
 */
export declare function isKanshiInVoid(kanshiIndex: number, tenchusatsu: Tenchusatsu): boolean;
/**
 * 天中殺の情報を人間が読める形式で出力
 *
 * @param tenchusatsu - 天中殺のオブジェクト
 * @returns 整形された説明文
 */
export declare function formatTenchusatsu(tenchusatsu: Tenchusatsu): string;
