# 算命学計算モジュール分析レポート

## 1. 使用可能な関数の特定

### 1.1 統一エントリーポイント

**`calculateKanshi(input: KanshiInput): KanshiResult`**
- **場所**: `/mobile/lib/logic/kanshi.ts`
- **概要**: 全ての算命学計算を統合するメイン関数
- **使用方法**:
```typescript
import { calculateKanshi } from '@/lib/logic';

const result = calculateKanshi({
  birthDate: new Date('1990-01-01T12:00:00'),
  gender: 'male',
  longitude: 135,
  includeTaiun: true,
  includeInsen: false
});
```

**戻り値 (KanshiResult)**:
- `bazi`: 四柱推命（年柱・月柱・日柱・時柱）
- `fiveElements`: 五行バランス（木火土金水）
- `yangSen`: 陽占（十大主星・十二大従星）
- `energyScore`: エネルギー点数（3-36点）
- `taiun`: 大運サイクル（オプション）
- `insen`: 陰占チャート（オプション）

---

### 1.2 四柱推命の計算

**`calculateBaZi(date: Date, longitude: number = 135): FourPillars`**
- **場所**: `/mobile/lib/logic/bazi.ts`
- **機能**: 生年月日時から四柱（年柱・月柱・日柱・時柱）を計算
- **使用方法**:
```typescript
import { calculateBaZi } from '@/lib/logic';

const bazi = calculateBaZi(new Date('1990-01-01T12:00:00'), 135);
console.log(bazi.year.name);   // 例: "己巳"
console.log(bazi.month.name);  // 例: "丙子"
console.log(bazi.day.name);    // 例: "甲午"
console.log(bazi.hour.name);   // 例: "甲午"
```

**FourPillars 構造**:
```typescript
{
  year: GanZhi,   // 年柱
  month: GanZhi,  // 月柱
  day: GanZhi,    // 日柱
  hour: GanZhi    // 時柱
}

// GanZhi 構造
{
  stem: number,        // 天干インデックス (1-10)
  branch: number,      // 地支インデックス (1-12)
  stemStr: string,     // 天干文字 (甲乙丙丁戊己庚辛壬癸)
  branchStr: string,   // 地支文字 (子丑寅卯辰巳午未申酉戌亥)
  name: string,        // 干支名 (例: "甲子")
  id: number,          // 干支ID (1-60)
  hiddenStems: string[] // 蔵干
}
```

---

### 1.3 天中殺の判定

**陰計算に含まれています**

**`calculateSanmeigakuInsen(bazi: FourPillars, date: Date): SanmeigakuInsenChart`**
- **場所**: `/mobile/lib/logic/insen.ts`
- **機能**: 陰占チャートを計算（天中殺を含む）
- **使用方法**:
```typescript
import { calculateSanmeigakuInsen, calculateBaZi } from '@/lib/logic';

const bazi = calculateBaZi(new Date('1990-01-01T12:00:00'), 135);
const insen = calculateSanmeigakuInsen(bazi, new Date('1990-01-01T12:00:00'));

console.log(insen.tenchusatsu.type);           // 例: "戌亥天中殺"
console.log(insen.tenchusatsu.missingBranches); // 例: ["戌", "亥"]
```

**天中殺の6種類**:
1. 戌亥天中殺（空亡: 戌, 亥）
2. 申酉天中殺（空亡: 申, 酉）
3. 午未天中殺（空亡: 午, 未）
4. 辰巳天中殺（空亡: 辰, 巳）
5. 寅卯天中殺（空亡: 寅, 卯）
6. 子丑天中殺（空亡: 子, 丑）

---

### 1.4 日干から十大主星を計算

**`getTenGreatStar(dayStemIdx: number, targetStemIdx: number): string`**
- **場所**: `/mobile/lib/logic/yangsen.ts`
- **機能**: 日干と対象天干から十大主星を計算
- **使用方法**:
```typescript
import { getTenGreatStar, STEM_TO_INDEX } from '@/lib/logic';

const dayStemIdx = STEM_TO_INDEX['甲'] - 1;  // 0
const targetStemIdx = STEM_TO_INDEX['丙'] - 1; // 2

const star = getTenGreatStar(dayStemIdx, targetStemIdx);
console.log(star); // "禄存星"
```

**十大主星一覧**:
- 比和（2星）: 貫索星、石門星
- 洩気（2星）: 鳳閣星、調舒星
- 財（2星）: 禄存星、司禄星
- 官（2星）: 車騎星、牽牛星
- 印（2星）: 龍高星、玉堂星

**`calculateYangSen(bazi: FourPillars, date?: Date): YangSen`**
- **場所**: `/mobile/lib/logic/yangsen.ts`
- **機能**: 陽占人体図全体を計算
- **使用方法**:
```typescript
import { calculateYangSen, calculateBaZi } from '@/lib/logic';

const bazi = calculateBaZi(new Date('1990-01-01T12:00:00'), 135);
const yangSen = calculateYangSen(bazi, new Date('1990-01-01T12:00:00'));

console.log(yangSen.head);       // 頭: 日干 × 年干
console.log(yangSen.chest);      // 胸: 日干 × 月支蔵干
console.log(yangSen.belly);      // 腹: 日干 × 月干
console.log(yangSen.leftHand);   // 左手: 日干 × 年支蔵干
console.log(yangSen.rightHand);  // 右手: 日干 × 日支蔵干
```

---

### 1.5 通変星の計算

**陰占計算に含まれています**

**`calculateSanmeigakuInsen()` の戻り値に `tsuhensei` プロパティが含まれます**

```typescript
const insen = calculateSanmeigakuInsen(bazi, date);

insen.tsuhensei.forEach(ts => {
  console.log(`${ts.pillar}: ${ts.stem} → ${ts.name}`);
  // 出力例:
  // year: 甲 → 玉堂星
  // month: 丙 → 禄存星
  // day: 甲 → 貫索星
});
```

**通変星の種類**:
- 比和: 同じ五行
- 洩気: 我が生ずる（木→火、火→土、土→金、金→水、水→木）
- 財: 我を生ずる（木→水、火→木、土→火、金→土、水→金）
- 官: 我を剋する（木→土、火→金、土→水、金→木、水→火）
- 印: 我が剛する（木→金、火→水、土→木、金→火、水→土）

---

### 1.6 十二運（十二大従星）の計算

**`getTwelveGreatStar(dayStemIdx: number, branchIdx: number): { name: string; score: number }`**
- **場所**: `/mobile/lib/logic/yangsen.ts`
- **機能**: 日干と地支から十二大従星を計算
- **使用方法**:
```typescript
import { getTwelveGreatStar, STEM_TO_INDEX, BRANCHES } from '@/lib/logic';

const dayStemIdx = STEM_TO_INDEX['甲'] - 1;  // 0
const branchIdx = BRANCHES.indexOf('子');     // 0

const star = getTwelveGreatStar(dayStemIdx, branchIdx);
console.log(star.name);  // "天貴星"
console.log(star.score); // 9
```

**十二大従星一覧**:
1. 天禄星（11点）- 建禄
2. 天将星（12点）- 帝旺
3. 天堂星（8点）- 衰
4. 天胡星（4点）- 病
5. 天極星（2点）- 死
6. 天庫星（5点）- 墓
7. 天馳星（1点）- 絶
8. 天報星（3点）- 胎
9. 天印星（6点）- 養
10. 天貴星（9点）- 長生
11. 天恍星（7点）- 沐浴
12. 天南星（10点）- 冠帯

---

### 1.7 総エネルギー（エネルギー点数）の計算

**`calculateEnergyScore(bazi: FourPillars): number`**
- **場所**: `/mobile/lib/logic/fiveElements.ts`
- **機能**: 日干と三支（年支・月支・日支）のエネルギー点数を計算
- **戻り値**: 3-36点
- **使用方法**:
```typescript
import { calculateEnergyScore, calculateBaZi } from '@/lib/logic';

const bazi = calculateBaZi(new Date('1990-01-01T12:00:00'), 135);
const score = calculateEnergyScore(bazi);
console.log(`${score}点 / 36点`);
```

**計算方法**:
- 日干と年支の組み合わせ: ENERGY_TABLE[dayStemIdx][yearBranchIdx]
- 日干と月支の組み合わせ: ENERGY_TABLE[dayStemIdx][monthBranchIdx]
- 日干と日支の組み合わせ: ENERGY_TABLE[dayStemIdx][dayBranchIdx]
- 合計: s1 + s2 + s3

---

## 2. 既存のテストケースからキャラクター設定の確認

### 2.1 テストファイル一覧

場所: `/mobile/__tests__/lib/`

| ファイル名 | 説明 | 生年月日 |
|-----------|------|----------|
| `calculate-1983-08-11.test.ts` | 1983年8月11日生まれの検証 | 1983-08-11 |
| `calculate-1984-12-02.test.ts` | 1984年12月2日生まれの検証 | 1984-12-02 |
| `calculate-2016-10-27.test.ts` | 2016年10月27日生まれの検証 | 2016-10-27 |
| `calculate-2018-03-31.test.ts` | 2018年3月31日生まれの検証 | 2018-03-31 |
| `logic-bazi.test.ts` | 四柱推命の論理テスト | - |
| `logic.test.ts` | 全般の論理テスト | - |

### 2.2 検証済みキャラクター（テストケース）

#### キャラクター1: 1983年8月11日生まれ
```typescript
birthDate: new Date(1983, 7, 11, 12, 0, 0); // 1983-08-11 12:00

【四柱推命】
年柱: 癸亥 (癸亥)
月柱: 庚申 (庚申)
日柱: 辛未 (辛未)
時柱: 甲午 (甲午)

【十大主星 - 人体図】
頭:   鳳閣星
胸:   玉堂星 ★ 重要検証ポイント
腹:   石門星
左手: 司禄星
右手: 車騎星

【十二大従星】
左肩: 天印星 (6点)
右足: 天報星 (3点)
左足: 天極星 (2点)
合計: 11点

【天中殺】
種類: 戌亥天中殺
空亡: 戌, 亥
```

**重要**: このテストケースでは、月支=申の蔵干が「戊」であることを検証しています。

---

#### キャラクター2: 1984年12月2日生まれ
```typescript
birthDate: new Date(1984, 11, 2, 12, 0, 0); // 1984-12-02 12:00

【四柱推命】
年柱: 甲子 (甲子)
月柱: 乙亥 (乙亥)
日柱: 庚午 (庚午)
時柱: 丙午 (丙午)

【十大主星 - 人体図】
頭:   禄存星 ✅
胸:   鳳閣星 ✅
左手: 調舒星 ✅
腹:   司禄星 ✅

【十二大従星】
左肩: 天極星 (2点) ✅
右足: 天恍星 (7点) ✅
左足: 天胡星 (4点) ✅
合計: 13点 ✅

【天中殺】
種類: 午未天中殺
空亡: 午, 未
```

---

## 3. JSONデータファイルの確認

### 3.1 ファイル情報

- **ファイル名**: `meguri-96episodes-final.json`
- **場所**: `/Users/kitamuratatsuhiko/UIanimated/meguri-96episodes-final.json`
- **サイズ**: 2.6MB
- **エピソード数**: 96話

### 3.2 キャラクターの生年月日データ

JSON構造:
```json
{
  "episodes": [
    {
      "episode_number": 1,
      "patient": {
        "name": "患者名",
        "birth_date": "2003-02-20"  // YYYY-MM-DD形式
      }
    }
  ]
}
```

### 3.3 抽出されたキャラクター一覧（一部抜粋）

| # | 名前 | 生年月日 | 中心星 | 合計点 | 天中殺 |
|---|------|----------|--------|--------|--------|
| 1 | 佐藤 翔 | 2003-02-20 | 貫索星 | 23点 | 戌亥天中殺 |
| 2 | 神谷 優 | 1996-01-19 | 禄存星 | 21点 | 子丑天中殺 |
| 3 | 小鳥遊 健 | 1987-02-24 | 貫索星 | 31点 | 寅卯天中殺 |
| 4 | 岩田 美月 | 1999-02-12 | 調舒星 | 30点 | 辰巳天中殺 |
| 5 | 五十嵐 陽菜 | 2001-02-12 | 貫索星 | 32点 | 寅卯天中殺 |
| 6 | 八木 澪 | 1994-01-31 | 鳳閣星 | 26点 | 子丑天中殺 |
| 7 | 熊田 誠一 | 1976-01-07 | 司禄星 | 25点 | 子丑天中殺 |
| 8 | 奥田 沙織 | 1989-02-18 | 牽牛星 | 23点 | 寅卯天中殺 |
| 9 | 辻本 龍一 | 1997-02-27 | 禄存星 | 8点 | 辰巳天中殺 |
| 10 | 犬養 茜 | 1996-02-24 | 司禄星 | 13点 | 午未天中殺 |
| 11 | 月岡 蒼 | 1994-01-16 | 玉堂星 | 19点 | 辰巳天中殺 |
| 12 | 天野 奏 | 2002-01-15 | 龍高星 | 18点 | 申酉天中殺 |

**完全な一覧は `.tmp/test-kanshi-calculation.ts` の実行結果を参照してください**

---

## 4. 関数の使い方と実行例

### 4.1 基本的な使用例

```typescript
import { calculateKanshi } from '@/lib/logic';

// キャラクター「佐藤 翔」（2003-02-20生まれ）
const result = calculateKanshi({
  birthDate: new Date('2003-02-20T12:00:00'),
  gender: 'male',
  includeTaiun: true,
  includeInsen: true
});

// 四柱推命
console.log(`年柱: ${result.bazi.year.name}`);     // "癸未"
console.log(`月柱: ${result.bazi.month.name}`);    // "甲寅"
console.log(`日柱: ${result.bazi.day.name}`);      // "甲子"
console.log(`時柱: ${result.bazi.hour.name}`);     // "庚午"

// 陽占（十大主星）
console.log(`頭: ${result.yangSen.head}`);         // "玉堂星"
console.log(`胸: ${result.yangSen.chest}`);        // "貫索星"
console.log(`腹: ${result.yangSen.belly}`);        // "貫索星"
console.log(`左手: ${result.yangSen.leftHand}`);   // "司禄星"
console.log(`右手: ${result.yangSen.rightHand}`);  // "玉堂星"

// 十二大従星
console.log(`左肩: ${result.yangSen.leftShoulder.name}`); // "天庫星"
console.log(`右足: ${result.yangSen.rightLeg.name}`);     // "天恍星"
console.log(`左足: ${result.yangSen.leftLeg.name}`);      // "天禄星"
const totalScore = result.yangSen.leftShoulder.score +
                   result.yangSen.rightLeg.score +
                   result.yangSen.leftLeg.score;
console.log(`合計: ${totalScore}点`); // 23点

// 五行バランス
console.log(`木: ${result.fiveElements.wood}`);    // 72
console.log(`火: ${result.fiveElements.fire}`);    // 44
console.log(`土: ${result.fiveElements.earth}`);   // 44
console.log(`金: ${result.fiveElements.metal}`);   // 0
console.log(`水: ${result.fiveElements.water}`);   // 36

// エネルギー点数
console.log(`${result.energyScore}点`); // 19点

// 天中殺
console.log(`種類: ${result.insen.tenchusatsu.type}`); // "戌亥天中殺"
console.log(`空亡: ${result.insen.tenchusatsu.missingBranches.join(', ')}`); // "戌, 亥"
```

### 4.2 個別関数の使用例

#### 四柱のみ計算
```typescript
import { calculateBaZi } from '@/lib/logic';

const bazi = calculateBaZi(new Date('2003-02-20T12:00:00'), 135);
console.log(bazi.year.name); // "癸未"
```

#### 陽占のみ計算
```typescript
import { calculateBaZi, calculateYangSen } from '@/lib/logic';

const bazi = calculateBaZi(new Date('2003-02-20T12:00:00'), 135);
const yangSen = calculateYangSen(bazi, new Date('2003-02-20T12:00:00'));
console.log(yangSen.chest); // "貫索星"
```

#### 十大主星を個別に計算
```typescript
import { getTenGreatStar, STEM_TO_INDEX } from '@/lib/logic';

const dayStemIdx = STEM_TO_INDEX['甲'] - 1;  // 0
const targetStemIdx = STEM_TO_INDEX['丙'] - 1; // 2
const star = getTenGreatStar(dayStemIdx, targetStemIdx);
console.log(star); // "禄存星"
```

#### 天中殺を判定
```typescript
import { calculateBaZi, calculateSanmeigakuInsen } from '@/lib/logic';

const bazi = calculateBaZi(new Date('2003-02-20T12:00:00'), 135);
const insen = calculateSanmeigakuInsen(bazi, new Date('2003-02-20T12:00:00'));
console.log(insen.tenchusatsu.type); // "戌亥天中殺"
```

---

## 5. 使用すべき関数のまとめ

### 5.1 推奨される使用方法

**統一エントリーポイント `calculateKanshi()` を使用することをお勧めします**

理由:
- 全ての計算を一度に実行可能
- 内部でモジュール間の依存関係を解決
- オプションで大運・陰占の追加が可能
- 将来的な機能追加にも対応しやすい

### 5.2 関数選択ガイド

| 目的 | 推奨関数 | 場所 |
|------|----------|------|
| 全ての算命学データを取得 | `calculateKanshi()` | `kanshi.ts` |
| 四柱のみ取得 | `calculateBaZi()` | `bazi.ts` |
| 陽占のみ取得 | `calculateYangSen()` | `yangsen.ts` |
| 十大主星のみ取得 | `getTenGreatStar()` | `yangsen.ts` |
| 十二大従星のみ取得 | `getTwelveGreatStar()` | `yangsen.ts` |
| 五行バランスのみ取得 | `calculateFiveElements()` | `fiveElements.ts` |
| エネルギー点数のみ取得 | `calculateEnergyScore()` | `fiveElements.ts` |
| 天中殺のみ取得 | `calculateSanmeigakuInsen()` → `tenchusatsu` | `insen.ts` |
| 通変星のみ取得 | `calculateSanmeigakuInsen()` → `tsuhensei` | `insen.ts` |
| 大運を取得 | `calculateTaiun()` または `calculateKanshi()` | `taiun.ts` または `kanshi.ts` |

### 5.3 注意点

1. **経度パラメータ**
   - デフォルト: 135度（日本標準時）
   - 真太陽時の計算に使用
   - 日本国内であれば135度で問題なし

2. **日時パラメータ**
   - `Date` オブジェクトを使用
   - 時刻は12:00を推奨（昼12時が基準）
   - 誕生時刻が正確にわかる場合はその時刻を使用

3. **二十八元法（陽占の蔵干選択）**
   - 陽占計算では、節入りからの日数に基づいて蔵干を選択
   - 二十八元データ: `TWENTY_EIGHT_ELEMENTS`
   - 日付を指定しない場合は代表蔵干を使用

4. **大運の方向**
   - 陽年男・陰年女 → 順行
   - 陰年男・陽年女 → 逆行
   - 自動的に判定される

5. **天中殺の特殊ケース**
   - 生年天中殺: 年支が空亡
   - 生月天中殺: 月支が空亡
   - 生日天中殺: 日支が空亡

---

## 6. 実行方法

### 6.1 テストスクリプトの実行

```bash
# プロジェクトルートで実行
npx tsx .tmp/test-kanshi-calculation.ts
```

### 6.2 既存テストの実行

```bash
# モバイルディレクトリで実行
cd mobile
npm test -- calculate-1983-08-11
npm test -- calculate-1984-12-02
npm test -- calculate-2016-10-27
npm test -- calculate-2018-03-31
```

---

## 7. 参考資料

### 7.1 主要なファイル

- **統合エントリーポイント**: `/mobile/lib/logic/kanshi.ts`
- **四柱推命**: `/mobile/lib/logic/bazi.ts`
- **五行バランス**: `/mobile/lib/logic/fiveElements.ts`
- **陽占**: `/mobile/lib/logic/yangsen.ts`
- **陰占**: `/mobile/lib/logic/insen.ts`
- **大運**: `/mobile/lib/logic/taiun.ts`
- **定数**: `/mobile/lib/logic/constants.ts`
- **天文計算**: `/mobile/lib/logic/astronomy.ts`
- **使用例**: `/mobile/lib/logic/examples.ts`
- **README**: `/mobile/lib/logic/README.md`

### 7.2 テストファイル

- **場所**: `/mobile/__tests__/lib/`
- **主要テスト**:
  - `calculate-1983-08-11.test.ts`
  - `calculate-1984-12-02.test.ts`
  - `calculate-2016-10-27.test.ts`
  - `calculate-2018-03-31.test.ts`
  - `logic-bazi.test.ts`
  - `logic.test.ts`

### 7.3 JSONデータ

- **エピソードデータ**: `/meguri-96episodes-final.json`
- **キャラクター生年月日**: `episodes[].patient.birth_date`

---

## 8. サマリー

### 8.1 使用可能な主要な関数

1. **`calculateKanshi()`** - 全ての算命学計算の統合エントリーポイント
2. **`calculateBaZi()`** - 四柱推命の計算
3. **`calculateYangSen()`** - 陽占（十大主星・十二大従星）の計算
4. **`getTenGreatStar()`** - 十大主星の個別計算
5. **`getTwelveGreatStar()`** - 十二大従星の個別計算
6. **`calculateFiveElements()`** - 五行バランスの計算
7. **`calculateEnergyScore()`** - エネルギー点数の計算
8. **`calculateSanmeigakuInsen()`** - 陰占チャートの計算（天中殺を含む）
9. **`calculateTaiun()`** - 大運サイクルの計算

### 8.2 既存のキャラクターデータ

- **検証済みテストケース**: 4件（1983-08-11, 1984-12-02, 2016-10-27, 2018-03-31）
- **JSONから抽出**: 12件の主要キャラクター
- **完全な一覧**: `.tmp/test-kanshi-calculation.ts` の実行結果を参照

### 8.3 推奨されるワークフロー

1. **統一エントリーポイントを使用**
   ```typescript
   const result = calculateKanshi({
     birthDate: new Date('YYYY-MM-DDT12:00:00'),
     gender: 'male' | 'female',
     includeTaiun: true,
     includeInsen: true
   });
   ```

2. **結果から必要なデータを抽出**
   ```typescript
   const bazi = result.bazi;
   const yangSen = result.yangSen;
   const fiveElements = result.fiveElements;
   const energyScore = result.energyScore;
   const tenchusatsu = result.insen.tenchusatsu;
   ```

3. **必要に応じて個別関数を使用**
   - 特定の星のみ取得したい場合
   - カスタム計算を行いたい場合

---

以上で算命学計算モジュールの分析を完了します。
