# EP2-120 キャラクターデータ整備 引継書

## 1. 現状 (2026-02-15)

`src/data/ep1-120-characters.ts` の状態:
*   **EP1-10**: **不整合あり**。EP3が大山明になっているが、`storyline-v3.md` (正本) では森川真紀。主役4名 (巡、慧、さくら、美咲) 以外は正本から再抽出して置換が必要。
*   **EP11-30**: **完了**。`storyline-v3.md` に基づき、CLI検証済みデータが反映されている。
*   **EP31-100**: **未着手**。データなし。抽出が必要。
*   **EP101-120**: **要修正**。現在のデータは仮置きのため、全削除して正本から正しいキャラを再抽出する。

## 2. 次の作業手順

### Step 1: データ抽出 (Source: `novel/storyline-v3.md`)
以下のエピソードブロックごとに、患者名、年齢、生年月日、性別、職業、悩みを抽出する。
*   **EP2-10**: 再抽出 (9名)
*   **EP31-40**: 新規抽出 (10名)
*   **EP41-50**: 新規抽出 (10名)
*   **EP51-60**: 新規抽出 (10名)
*   **EP61-70**: 新規抽出 (10名)
*   **EP71-80**: 新規抽出 (10名)
*   **EP81-90**: 新規抽出 (10名)
*   **EP91-100**: 新規抽出 (10名)
*   **EP101-120**: 新規抽出 (主要人物)

### Step 2: 算命学データの計算とJSON生成
抽出したデータに対し、`rev-sanmei-cli-v5.ts` のロジックを用いて算命学データ (日柱、天中殺、エネルギー点数) を計算し、検証済みのJSONファイル (`ep31-40-characters.json` 等) を生成する。

**推奨アプローチ**:
以前のスクリプト (`extract-prescriptions.js`) は大量データを一度に処理しようとしてタイムアウトしたため、**10エピソード単位で小さなスクリプトを作成・実行する**ことを推奨する。

例: `scripts/process-ep31-40.ts`
```typescript
import { calculateSanmei } from '../src/lib/sanmei';
// 手動または正規表現で抽出したデータ配列
const rawData = [ ... ]; 
// 計算と検証
rawData.forEach(char => {
  const result = calculateSanmei(...);
  // 結果をコンソール出力またはJSON保存
});
```

### Step 3: `src/data/ep1-120-characters.ts` への統合
生成された検証済みデータを、TypeScriptファイルに統合する。
1. `EP1_10_CHARACTERS` の主役以外を更新。
2. `EP31_40_CHARACTERS` 等の新しい定数を追加。
3. `EP101_120_MAIN_CAST` を更新。
4. 全てを `EP1_120_CHARACTERS` 配列にスプレッド構文で追加。

## 3. 参照ファイル
*   **正本**: `novel/storyline-v3.md`
*   **実装**: `src/data/ep1-120-characters.ts`
*   **ロジック**: `src/lib/sanmei.ts`
