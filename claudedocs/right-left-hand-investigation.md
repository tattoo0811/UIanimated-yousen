# 右手・左手の計算ロジック調査

## 現在の計算ロジック（yangsen.ts）

```typescript
// 右手: 日干 × 日支の蔭干（月に基づく蔵干）
const dayBranchHiddenStem = getBranchHiddenStemByMonth(bazi.day.branchStr, date);
const rightHand = getTenGreatStar(dayStemIdx, dayHiddenStemIdx);

// 左手: 日干 × 年支の蔭干（月に基づく蔵干）
const yearBranchHiddenStem = getBranchHiddenStemByMonth(bazi.year.branchStr, date);
const leftHand = getTenGreatStar(dayStemIdx, yearHiddenStemIdx);
```

## 涼子（1977-08-20）の検証

### 四柱推命
- 年柱: 丁巳（年干丁、年支巳）
- 月柱: 戊申（月干戊、月支申）
- 日柱: 己酉（日干己、日支酉）

### 現在の計算結果
- 頭: 龍高星 ✓（日干「己」×年干「丁」）
- 胸: 司禄星 ✓（日干「己」×月干「戊」）
- 腹: 司禄星 ✗（期待: 石門星）
- 右手: 貫索星 ✗（期待: 鳳閣星）
- 左手: 禄存星 ✗（期待: 調舒星）
- 左肩: 天将星 ✓
- 左足: 天貴星 ✓
- 右足: 天堂星 ✗（期待: 天恍星）

### 朱学院の期待値から逆算

- **右手: 鳳閣星**
  - 日干「乙」×年干「丁」= 鳳閣星
  - 日干「丙」×年干「丁」= 鳳閣星

- **左手: 調舒星**
  - 日干「丙」×年干「乙」= 調舒星
  - 日干「己」×年干「丙」= 調舒星
  - 日干「丙」×月干「戊」= 貫索星 ✗
  - 日干「乙」×月干「丙」= 調舒星

## 分析

### 仮説1: 日干の変更

右手・左手の計算で、日干を固定せずに変更するルールがある可能性：

- **右手**: 年干「丁」×日支「酉」→ 日干を「丙」に変更 → 丙×丁 = 鳳閣星
- **左手**: 月干「戊」×年支「巳」→ 日干を「丙」に変更 → 丙×乙(?) = 調舒星

しかし、左手の計算で「月干「戊」」が「年干「乙」」に変わる理由が不明。

### 仮説2: 蔭干の使用方法が間違っている

現在の実装では、蔭干を月数（1-12）に基づいて取得しています：

```typescript
function getBranchHiddenStemByMonth(branchStr: string, date: Date): string {
  const month = date.getMonth() + 1;
  const stems = BRANCH_HIDDEN_STEM_BY_MONTH[branchStr];
  return stems ? stems[month - 1] : '';
}
```

この方法が正しいか検証が必要。

### 仮説3: 節入りからの日数を使用

蔭干の決定に、節入りからの日数を使用する必要があるかもしれません。

```typescript
function getHiddenStemByDays(branchStr: string, daysFromSolarTerm: number): string {
  // 二十八元データを使用
}
```

## 次のステップ

1. **算命学Stockを直接確認**: 正しい計算ロジックを特定
2. **複数の検証データを収集**: パターンを特定
3. **蔭干の決定方法を検証**: 月数 vs 節入り日数
4. **正しいロジックを実装**: yangsen.tsを修正

## 参考リンク

- [算命学総本校 高尾学館 | 星出し](https://www.sanmei-gaku.com/yourself/)
- [算命学【十大主星】調舒星（ちょうじょせい）の特徴を解説](https://rensa.jp.net/s-ju004)
- [十大主星の解説 | さる山さる子の算命学](https://sarumeigaku.com/meishiki/judaisyusei/)
