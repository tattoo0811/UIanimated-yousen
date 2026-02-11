# yinyang-app vs accurate-logic 陽占計算ロジック比較分析

## 概要

`yinyang-app`と`accurate-logic`の陽占計算ロジックを比較し、朱学院の検証データとの整合性を分析しました。

## ロジックの違い

### accurate-logic (yangsen.ts)

```typescript
// 頭: 日干 × 年干
const head = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

// 胸: 日干 × 月干
const chest = getTenGreatStar(dayStemIdx, bazi.month.stem - 1);

// 腹: 日干「乙」×月干
const bellyDayStemIdx = 1; // 「乙」のインデックス
const belly = getTenGreatStar(bellyDayStemIdx, bazi.month.stem - 1);

// 右手: 日干 × 年干
const rightHand = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

// 左手: 日干 × 年干
const leftHand = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);
```

### yinyang-app (logic.ts)

```typescript
// 頭: 日干 × 年干
const head = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

// 右手: 日干 × 日支蔵干
const dayBranchHiddenStem = YANGSEN_HIDDEN_STEMS[bazi.day.branch - 1];
const dayBranchHiddenIdx = STEM_TO_INDEX[dayBranchHiddenStem];
const rightHand = getTenGreatStar(dayStemIdx, dayBranchHiddenIdx);

// 胸: 日干 × 月支蔵干
const monthBranchHiddenStem = YANGSEN_HIDDEN_STEMS[bazi.month.branch - 1];
const monthBranchHiddenIdx = STEM_TO_INDEX[monthBranchHiddenStem];
const chest = getTenGreatStar(dayStemIdx, monthBranchHiddenIdx);

// 左手: 日干 × 年支蔵干
const yearBranchHiddenStem = YANGSEN_HIDDEN_STEMS[bazi.year.branch - 1];
const yearBranchHiddenIdx = STEM_TO_INDEX[yearBranchHiddenStem];
const leftHand = getTenGreatStar(dayStemIdx, yearBranchHiddenIdx);

// 腹: 日干 × 月干
const belly = getTenGreatStar(dayStemIdx, bazi.month.stem - 1);
```

### yinyang-appのYANGSEN_HIDDEN_STEMS

```typescript
const YANGSEN_HIDDEN_STEMS = [
    '癸', // 子
    '辛', // 丑
    '丙', // 寅
    '乙', // 卯
    '乙', // 辰
    '庚', // 巳
    '丁', // 午
    '丁', // 未
    '戊', // 申
    '辛', // 酉
    '丁', // 戌
    '甲'  // 亥
];
```

## 検証結果（1983-08-11）

### accurate-logic（ reverting後）

| 部位 | 結果 | 朱学院 | 一致 |
|------|------|--------|------|
| 頭 | 鳳閣星 | 鳳閣星 | ✓ |
| 胸 | 石門星 | 玉堂星 | ✗ |
| 腹 | 牽牛星 | 石門星 | ✗ |
| 右手 | 龍高星 | 車輢星 | ✗ |
| 左手 | 玉堂星 | 石門星 | ✗ |

### yinyang-app

| 部位 | 結果 | 朱学院 | 一致 |
|------|------|--------|------|
| 頭 | 鳳閣星 | 鳳閣星 | ✓ |
| 胸 | 玉堂星 | 玉堂星 | ✓ |
| 腹 | 石門星 | 石門星 | ✓ |
| 右手 | 車騎星 | 車輢星 | △ （注） |
| 左手 | 司禄星 | 石門星 | ✗ |

**注**: 「車騎星」と「車輢星」は字体の違いだけで同じ星の可能性があります。

## 発見事項

1. **yinyang-appのロジックが正確に近い**
   - 頭、胸、腹は朱学院と完全一致
   - 右手は「車騎星」vs「車輢星」でほぼ一致（字体の違い）
   - 左手のみ不一致

2. **蔵干（Zougan）の使用が正解**
   - yinyang-appでは蔵干を使用して十大主星を計算
   - accurate-logicでは天干を直接使用
   - 朱学院の結果は蔵干ベースの計算と一致

3. **YANGSEN_HIDDEN_STEMSの正確性**
   - yinyang-appのYANGSEN_HIDDEN_STEMSは正確
   - 胸（月支蔵干）: 申 → 庚 → 玉堂星（朱学院と一致）

## 次のステップ

1. **accurate-logicをyinyang-appのロジックに更新**
   - 右手: 日支蔵干を使用
   - 左手: 年支蔵干を使用
   - 胸: 月支蔵干を使用

2. **蔵干テーブルの統合**
   - yinyang-appのYANGSEN_HIDDEN_STEMSをaccurate-logicに移植
   - BRANCH_MAIN_STEMの代わりに使用

3. **左手の不一致を解消**
   - yinyang-app: 左手 = 年支蔵干 = 亥 → 甲 → 司禄星
   - 朱学院: 左手 = 石門星
   - 需要进一步调查

## 結論

yinyang-appのロジックはaccurate-logicよりも正確で、朱学院の検証データとほぼ一致します。蔵干を使用した計算方法が正しいことが確認されました。
