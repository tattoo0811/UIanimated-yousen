# 現在の陽占実装ロジック

## ① 陰占の確定

```typescript
// lunar-javascript ライブラリを使用
const lunar = solar.getLunar();

year: {
  stem: lunar.getYearGan(),    // 年干
  branch: lunar.getYearZhi()   // 年支
}
month: {
  stem: lunar.getMonthGan(),   // 月干
  branch: lunar.getMonthZhi()  // 月支（節入り基準）
}
day: {
  stem: lunar.getDayGan(),     // 日干
  branch: lunar.getDayZhi()    // 日支
}
```

**注意**: lunar-javascriptは自動的に節入りを考慮します。

## ② 使用する干の選定

**現在の実装**:
```typescript
function getYangSenHiddenStem(branchStr: string, position: 'year' | 'month' | 'day'): string {
    const data = YANGSEN_HIDDEN_STEMS_DATA[branchStr];

    // ✅ 修正済: 全ての位置で本気のみ使用
    return data.main;
}
```

**蔵干データ（算命学・陽占用）**:
```typescript
const YANGSEN_HIDDEN_STEMS_DATA = {
    '子': { main: '癸' },
    '丑': { main: '己', sub: '癸', extra: '辛' },
    '寅': { main: '甲', sub: '丙', extra: '戊' },
    '卯': { main: '乙' },
    '辰': { main: '戊', sub: '乙', extra: '癸' },
    '巳': { main: '戊', sub: '丙', extra: '庚' }, // 算命学: 戊が本気
    '午': { main: '丁' },
    '未': { main: '己', sub: '丁', extra: '乙' },
    '申': { main: '戊', sub: '庚', extra: '壬' }, // 算命学: 戊が本気
    '酉': { main: '辛' },
    '戌': { main: '戊', sub: '辛', extra: '丁' },
    '亥': { main: '壬', sub: '甲' }
};
```

## ③ 日干基準で主星を決定

```typescript
function getTenGreatStar(dayStemIdx: number, targetStemIdx: number): string {
    // 五行計算（干支番号 ÷ 2）
    const dayStemElement = Math.floor(dayStemIdx / 2);
    const targetElement = Math.floor(targetStemIdx / 2);

    // 陰陽判定（干支番号 % 2）
    const dayStemPolarity = dayStemIdx % 2;
    const targetPolarity = targetStemIdx % 2;

    // 五行関係（0=木, 1=火, 2=土, 3=金, 4=水）
    const relation = (targetElement - dayStemElement + 5) % 5;

    // 陰陽一致判定
    const polarityMatch = (dayStemPolarity === targetPolarity) ? 0 : 1;

    // 主星インデックス
    const starIndex = relation * 2 + polarityMatch;

    // 十大主星マッピング
    const TEN_STARS = [
        '貫索星', '石門星',  // 0: 比和（同じ五行）
        '鳳閣星', '調舒星',  // 1: 洩気（日干が生じる）
        '禄存星', '司禄星',  // 2: 財（日干が剋する）
        '車騎星', '牽牛星',  // 3: 官（日干が剋される）
        '龍高星', '玉堂星'   // 4: 印（日干が生じられる）
    ];

    return TEN_STARS[starIndex];
}
```

**例**: 日干=壬(8), 目標干=戊(4)
- 壬の五行: 8 ÷ 2 = 4（水）
- 戊の五行: 4 ÷ 2 = 2（土）
- 壬の陰陽: 8 % 2 = 0（陽）
- 戊の陰陽: 4 % 2 = 0（陽）
- 関係: (2 - 4 + 5) % 5 = 3（官 = 日干が剋される）
- 陰陽一致: 0（同じ陽）
- インデックス: 3 * 2 + 0 = 6
- 結果: **車騎星** ✅

## ④ 位置と従星の割当

```typescript
export function calculateYangSen(bazi: FourPillars): YangSen {
    const dayStemIdx = bazi.day.stem - 1;

    // 中央（頭）: 日干 ← ここが間違い？
    const head = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

    // 東方（胸）: 月支の本気
    const monthBranchHiddenStem = getYangSenHiddenStem(bazi.month.branchStr, 'month');
    const monthBranchHiddenIdx = STEM_TO_INDEX[monthBranchHiddenStem];
    const chest = getTenGreatStar(dayStemIdx, monthBranchHiddenIdx);

    // 西方（左手）: 年支の本気
    const yearBranchHiddenStem = getYangSenHiddenStem(bazi.year.branchStr, 'year');
    const yearBranchHiddenIdx = STEM_TO_INDEX[yearBranchHiddenStem];
    const leftHand = getTenGreatStar(dayStemIdx, yearBranchHiddenIdx);

    // 右手: 日支の本気
    const dayBranchHiddenStem = getYangSenHiddenStem(bazi.day.branchStr, 'day');
    const dayBranchHiddenIdx = STEM_TO_INDEX[dayBranchHiddenStem];
    const rightHand = getTenGreatStar(dayStemIdx, dayBranchHiddenIdx);

    // 腹: 月干
    const belly = getTenGreatStar(dayStemIdx, bazi.month.stem - 1);

    // 従星（ENERGY_TABLEを使用）
    const leftShoulder = getTwelveGreatStar(dayStemIdx, bazi.year.branch - 1);
    const rightLeg = getTwelveGreatStar(dayStemIdx, bazi.month.branch - 1);
    const leftLeg = getTwelveGreatStar(dayStemIdx, bazi.day.branch - 1);

    return { head, rightHand, chest, leftHand, belly, leftShoulder, rightLeg, leftLeg };
}
```

## 🔴 問題点の推定

### 2018-03-21のケース
```
陰占:
- 日柱: 壬子
- 月柱: 乙卯
- 年柱: 戊戌

現在の計算結果:
- 右手（日支=子の本気=癸）: 石門星 ❌
- 左手（年支=戌の本気=戊）: 車騎星 ✅

正解:
- 右手: 車騎星（戊が必要）
- 左手: 車騎星
```

**仮説**:
1. **子の本気データが間違っている**：癸ではなく戊？
2. **位置の割当が間違っている**：「頭」に年干を使っているが、これが誤り？
3. **日支に特別なルールがある**：日支だけは本気以外を使う？

ご指摘いただければ修正します。
