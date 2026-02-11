# 人体図レイアウトと右手・左手の認識問題

## 人体図の正しいレイアウト

```
         [頭]    [左肩]
   [右手]   [胸]    [左手]
   [右足]   [腹]    [左足]
```

## 朱学院のデータ構造解析

### スナップショットからの配置確認

朱学院のHTML構造（スナップショット順）：
```
uid=4_44 StaticText "牽牛星"    <- 頭
uid=4_45 StaticText "天堂星"    <- 左肩（十二大従星）
uid=4_46 StaticText "貫索星"    <- 右手（十大主星）
uid=4_47 StaticText "貫索星"    <- 胸
uid=4_48 StaticText "石門星"    <- 左手（十大主星）
uid=4_49 StaticText "天庫星"    <- 左足（十二大従星）
uid=4_50 StaticText "龍高星"    <- 腹
uid=4_51 StaticText "天庫星"    <- 右足（十二大従星）
```

**重要発見**: スナップショットの順序と、HTMLの実際の構造が異なる可能性

### 朱学院のHTML構造（推測）

一般的な3x3テーブル構造：
```
<table>
  <tr>
    <td></td>
    <td>頭の星</td>
    <td>左肩の星</td>
  </tr>
  <tr>
    <td>右手の星</td>
    <td>胸の星</td>
    <td>左手の星</td>
  </tr>
  <tr>
    <td>右足の星</td>
    <td>腹の星</td>
    <td>左足の星</td>
  </tr>
</table>
```

## 問題点の特定

### 涼子（1977-08-20）の朱学院データ

HTML構造を考慮すると：
```
行1: 空白  龍高星  天将星
行2: 鳳閣星  司禄星  調舒星
行3: 天恍星  石門星  天貴星
```

これを人体図にマッピング：
- 頭: 龍高星 ✓
- 左肩: 天将星 ✓
- **右手（画面左）**: 鳳閣星
- 胸: 司禄星 ✓
- **左手（画面右）**: 調舒星
- **右足（画面左）**: 天恍星（十二大従星）
- 腹: 石門星
- **左足（画面右）**: 天貴星

**結論**:
- 朱学院の「右手」= 画面左側の十大主星
- 朱学院の「左手」= 画面右側の十大主星

## yangsen.tsの計算ロジック確認

現在の実装：
```typescript
// 右手: 日干 × 日支の蔭干
const dayBranchHiddenStem = getBranchHiddenStemByMonth(bazi.day.branchStr, date);
const dayHiddenStemIdx = STEM_TO_INDEX[dayBranchHiddenStem];
const rightHand = getTenGreatStar(dayStemIdx, dayHiddenStemIdx);

// 左手: 日干 × 年支の蔭干
const yearBranchHiddenStem = getBranchHiddenStemByMonth(bazi.year.branchStr, date);
const yearHiddenStemIdx = STEM_TO_INDEX[yearBranchHiddenStem];
const leftHand = getTenGreatStar(dayStemIdx, yearHiddenStemIdx);
```

**問題点**:
- 右手と左手の定義が反対になっている可能性
- 画面配置（左/右）と変数名（rightHand/leftHand）の対応関係

## 検証計画

1. **HTML構造の確認**: 朱学院の実際のHTMLを解析して、正確なマッピングを特定
2. **変数名の修正**: rightHand/leftHandの定義を修正
3. **テストケースの追加**: 複数の日付で検証
