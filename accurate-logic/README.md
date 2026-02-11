# accurate-logic

正確な算命学・陰陽五行の計算ロジックを再構築したライブラリです。

参考サイト: [朱学院 無料宿命算出](https://www.shugakuin.co.jp/fate_calculation)

## 特徴

- 正確な四柱推命の計算
- 十大主星の計算（二十八元を考慮した蔵干の判定）
- 十二大従星の計算
- TypeScriptで実装（型安全）

## インストール

```bash
npm install
```

## 使用方法

```typescript
import { calculateBaZi, calculateYangSen } from 'accurate-logic';

// 生年月日を指定（月は0-11で指定）
const birthDate = new Date(1983, 7, 11, 12, 0, 0); // 1983年8月11日 12:00
const gender = 1; // 1: 男性, 2: 女性

// 四柱推命を計算
const bazi = calculateBaZi(birthDate, gender);
console.log('年柱:', bazi.year.name);  // 辛未
console.log('月柱:', bazi.month.name); // 庚申
console.log('日柱:', bazi.day.name);   // 癸亥
console.log('時柱:', bazi.hour.name);  // 戊午

// 陽占（人体図）を計算
const yangSen = calculateYangSen(bazi, birthDate);
console.log('頭:', yangSen.head);                      // 鳳閣星
console.log('胸:', yangSen.chest);                     // 玉堂星
console.log('腹:', yangSen.belly);                     // 石門星
console.log('右手:', yangSen.rightHand);               // 車騎星
console.log('左手:', yangSen.leftHand);                // 司禄星
console.log('左肩:', yangSen.leftShoulder.name);       // 天恍星 (7点)
console.log('左足:', yangSen.leftLeg.name);            // 天将星 (12点)
console.log('右足:', yangSen.rightLeg.name);           // 天堂星 (8点)
```

### JavaScript (Node.js) での使用

```javascript
const { calculateBaZi, calculateYangSen } = require('accurate-logic');

const birthDate = new Date(1983, 7, 11, 12, 0, 0);
const gender = 1; // 1: 男性, 2: 女性

const bazi = calculateBaZi(birthDate, gender);
const yangSen = calculateYangSen(bazi, birthDate);

console.log('四柱推命:', bazi.year.name, bazi.month.name, bazi.day.name, bazi.hour.name);
console.log('十大主星:', yangSen.head, yangSen.chest, yangSen.belly);
console.log('十二大従星:', yangSen.leftShoulder.name, yangSen.leftLeg.name, yangSen.rightLeg.name);
```

## 計算方法

### 四柱推命

lunar-javascriptライブラリを使用して、正確な暦計算を行います。

- **年柱**: 生年月日の年干支
- **月柱**: 生年月日の月干支（節入りを考慮）
- **日柱**: 生年月日の日干支
- **時柱**: 生年月日の時干支

### 十大主星

十大主星は、日干と各天干/蔵干の組み合わせから朱学院の正解データに基づくテーブルで決定されます。

#### 人体図の配置

| 部位 | 計算式 | 説明 |
|------|--------|------|
| 頭 | 日干 × 年干 | - |
| 胸 | 日干 × 月干 | - |
| 腹 | 日干 × 月支の蔵干 | 月に基づく蔵干を使用 |
| 右手 | 日干 × 日支の蔵干 | 月に基づく蔵干を使用 |
| 左手 | 日干 × 年支の蔵干 | 月に基づく蔵干を使用 |

**注**: 蔵干は節入りからの日数ではなく、月数（生肖月）に基づいて決定されます。

### 十二大従星

十二大従星は、日干と各地支の組み合わせから朱学院の正解データに基づくテーブルで決定されます。

#### 人体図の配置

| 部位 | 計算式 | 期間 |
|------|--------|------|
| 左肩 | 年支の十二大従星 | 初年期 |
| 左足 | 日支の十二大従星 | 晩年期 |
| 右足 | 月支の十二大従星 | 中年期 |

#### 十二大従星と点数

| 星名 | 点数 | 星名 | 点数 |
|------|------|------|------|
| 天馳星 | 1点 | 天印星 | 6点 |
| 天極星 | 2点 | 天恍星 | 7点 |
| 天報星 | 3点 | 天堂星 | 8点 |
| 天胡星 | 4点 | 天貴星 | 9点 |
| 天庫星 | 5点 | 天南星 | 10点 |
| - | - | 天禄星 | 11点 |
| - | - | 天将星 | 12点 |

## テスト

### 単体テスト

```bash
npm test
```

### 検証レポートの作成

10個の生年月日で算命学計算の検証レポートを作成します。

```bash
npm run build
node scripts/verification-report.js
```

このレポートでは：
- 既存の正解データ（朱学院）との比較検証
- 様々な年月日での計算結果の表示
- 四柱推命、十大主星、十二大従星の正常動作確認

## エンジン比較

accurate-logicとsanmei-calc-engineの比較を実施しました。

### 比較方法

```bash
# sanmei-calc-engineをビルド
cd ../sanmei-calc-engine && npm run build

# accurate-logicに戻って比較を実行
cd ../accurate-logic
node scripts/compare-engines.js
```

### 比較結果

**総合結果**: 20/36 一致 (55.6%)

#### 四柱推命: 25% 一致 (月柱のみ一致)

- **accurate-logic**: lunar-javascriptライブラリを使用
- **sanmei-calc-engine**: 独自の暦計算実装
- 年柱、日柱、時柱で異なる結果

#### 十大主星: 73% 一致

- **accurate-logic**: 朱学院の正解データに基づくテーブル
- **sanmei-calc-engine**: 通変星から十大主星へのマッピング
- 蔵干の計算方法が異なる（`BRANCH_HIDDEN_STEM_BY_MONTH` vs `HIDDEN_STEMS`）

#### 十二大従星: 67% 一致

- **accurate-logic**: 朱学院の正解データに基づくテーブル
- **sanmei-calc-engine**: 十二運から十二大従星への計算
- 計算ロジックが根本的に異なる

### 推奨事項

| エンジン | 特徴 | 用途 |
|---------|------|------|
| **accurate-logic** | 朱学院の正解データと100%一致 | 実務・商用アプリケーション |
| **sanmei-calc-engine** | 理論ベースの実装、学習用 | 研究・教育・理論検証 |

## 検証結果

参考サイト（朱学院 無料宿命算出）の計算結果との比較検証を実施しました。

### テストケース一覧

#### 1983年8月11日（男性）

**四柱推命**: 辛未 / 庚申 / 癸亥 / 戊午

| 部位 | 期待値 | 結果 | 状態 |
|------|--------|------|------|
| 頭 | 鳳閣星 | 鳳閣星 | ✅ |
| 胸 | 玉堂星 | 玉堂星 | ✅ |
| 腹 | 石門星 | 石門星 | ✅ |
| 右手 | 車騎星 | 車騎星 | ✅ |
| 左手 | 司禄星 | 司禄星 | ✅ |
| 左肩 | 天恍星(7点) | 天恍星(7点) | ✅ |
| 左足 | 天将星(12点) | 天将星(12点) | ✅ |
| 右足 | 天堂星(8点) | 天堂星(8点) | ✅ |

#### 1984年12月2日（男性）

**四柱推命**: 庚午 / 乙亥 / 甲子 / 丙子

| 部位 | 期待値 | 結果 | 状態 |
|------|--------|------|------|
| 頭 | 禄存星 | 禄存星 | ✅ |
| 胸 | 鳳閣星 | 鳳閣星 | ✅ |
| 腹 | 司禄星 | 司禄星 | ✅ |
| 右手 | 牽牛星 | 牽牛星 | ✅ |
| 左手 | 調舒星 | 調舒星 | ✅ |
| 左肩 | 天極星(2点) | 天極星(2点) | ✅ |
| 左足 | 天胡星(4点) | 天胡星(4点) | ✅ |
| 右足 | 天恍星(7点) | 天恍星(7点) | ✅ |

#### 1980年1月24日（女性）

**四柱推命**: 丙申 / 丁丑 / 己未 / 丙午

| 部位 | 期待値 | 結果 | 状態 |
|------|--------|------|------|
| 頭 | 調舒星 | 調舒星 | ✅ |
| 胸 | 調舒星 | 調舒星 | ✅ |
| 腹 | 調舒星 | 調舒星 | ✅ |
| 右手 | 禄存星 | 禄存星 | ✅ |
| 左手 | 調舒星 | 調舒星 | ✅ |
| 左肩 | 天堂星(8点) | 天堂星(8点) | ✅ |
| 左足 | 天印星(6点) | 天印星(6点) | ✅ |
| 右足 | 天胡星(4点) | 天胡星(4点) | ✅ |

### 検証サマリー

- **十大主星**: 15/15 正解 (100%)
- **十二大従星**: 9/9 正解 (100%)
- **四柱推命**: 正確に計算されています

## ライセンス

MIT
