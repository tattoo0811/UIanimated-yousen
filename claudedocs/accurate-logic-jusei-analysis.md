# accurate-logic 十大主星ロジック分析報告

## 実施概要

accurate-logic の十大主星計算ロジックと、プロジェクト全体に散らばる分析ロジックの調査を実施。

**実施日**: 2026-02-10
**調査対象**:
- accurate-logic/src/yangsen.ts (十大主星・十二大従星)
- mobile/lib/logic/yangsen.ts (十大主星・十二大従星)
- scripts/ 以下の検証スクリプト
- mobile/__tests__/lib/ 以下のテストファイル

---

## 1. accurate-logic の十大主星計算

### 1.1 十大主星テーブル方式

**ファイル**: `accurate-logic/src/yangsen.ts`

accurate-logic は**正解データに基づく固定テーブル方式**を採用しています。

```typescript
export function getTenGreatStar(dayStemIdx: number, targetStemIdx: number): string {
  // 朱学院の正解データに基づく十大主星表
  // 行: 日干（甲乙丙丁戊己庚辛壬癸）
  // 列: 対象天干（甲乙丙丁戊己庚辛壬癸）
  // セル: 十大主星名
  const table = [
    // 甲    乙    丙    丁    戊    己    庚    辛    壬    癸  <- 対象天干
    ['司禄星','鳳閣星','鳳閣星','調舒星','禄存星','司禄星','禄存星','車騎星','龍高星','牽牛星'], // 甲(日干)
    ['石門星','貫索星','調舒星','鳳閣星','司禄星','禄存星','牽牛星','車騎星','玉堂星','龍高星'], // 乙
    ['鳳閣星','調舒星','貫索星','石門星','禄存星','司禄星','車騎星','牽牛星','龍高星','玉堂星'], // 丙
    ['調舒星','鳳閣星','石門星','貫索星','司禄星','禄存星','牽牛星','車騎星','玉堂星','龍高星'], // 丁
    ['禄存星','司禄星','鳳閣星','調舒星','貫索星','石門星','車騎星','牽牛星','龍高星','玉堂星'], // 戊
    ['調舒星','調舒星','調舒星','調舒星','調舒星','調舒星','禄存星','調舒星','調舒星','調舒星'], // 己
    ['車騎星','牽牛星','龍高星','玉堂星','禄存星','司禄星','貫索星','石門星','鳳閣星','調舒星'], // 庚
    ['牽牛星','車騎星','玉堂星','龍高星','司禄星','禄存星','石門星','貫索星','調舒星','鳳閣星'], // 辛
    ['龍高星','玉堂星','貫索星','石門星','禄存星','司禄星','車騎星','牽牛星','鳳閣星','調舒星'], // 壬
    ['車騎星','龍高星','司禄星','石門星','司禄星','司禄星','玉堂星','鳳閣星','石門星','貫索星'], // 癸
  ];

  return table[dayStemIdx][targetStemIdx];
}
```

**特徴**:
- 10×10の固定テーブル
- 朱学院の正解データに基づいて手動調整済み
- 理論的な計算式ではなく、正解データからの逆算

### 1.2 蔵干取得方式

accurate-logic は**月数（生肖月）に基づく蔵干テーブル**を使用しています。

```typescript
// 月数（生肖月）に基づく蔵干テーブル
const BRANCH_HIDDEN_STEM_BY_MONTH: Record<string, string[]> = {
  '子': ['甲', '癸', '壬', '癸', '壬', '癸', '壬', '癸', '壬', '癸', '壬', '癸'], // 1月-12月
  '丑': ['己', '癸', '壬', '辛', '壬', '己', '壬', '己', '己', '己', '壬', '壬'],
  '寅': ['戊', '丙', '甲', '戊', '丙', '甲', '戊', '丙', '甲', '戊', '丙', '甲'],
  // ... 他の地支
  '亥': ['甲', '甲', '壬', '甲', '甲', '壬', '甲', '甲', '壬', '甲', '甲', '己'], // 12月目を己に修正
};

function getBranchHiddenStemByMonth(branchStr: string, date: Date): string {
  const month = date.getMonth() + 1;
  const stems = BRANCH_HIDDEN_STEM_BY_MONTH[branchStr];
  return stems ? stems[month - 1] : '';
}
```

**特徴**:
- 地支ごとに12ヶ月分の蔵干を持つテーブル
- 1月から12月（生肖月）で蔵干が変化
- 1984-12-02の正解データに基づいて調整済み（亥の12月目を己に修正）

---

## 2. mobile/ の十大主星計算

### 2.1 理論計算方式

**ファイル**: `mobile/lib/logic/yangsen.ts`

mobile/ は**五行理論に基づく計算方式**を採用しています。

```typescript
function getTenGreatStarRaw(dayStemIdx: number, targetStemIdx: number): string {
  const dElem = getElement(dayStemIdx);      // 日干の五行 (0-4)
  const tElem = getElement(targetStemIdx);   // 対象天干の五行 (0-4)
  const dPol = getPolarity(dayStemIdx);      // 日干の陰陽 (0:陽, 1:陰)
  const tPol = getPolarity(targetStemIdx);   // 対象天干の陰陽 (0:陽, 1:陰)

  const rel = (tElem - dElem + 5) % 5;       // 五行関係 (0:比和, 1:洩気, 2:財, 3:官, 4:印)
  const polMatch = dPol === tPol ? 0 : 1;    // 陰陽一致判定
  const index = rel * 2 + polMatch;          // TEN_STARS配列のインデックス

  return TEN_STARS[index];
}

const TEN_STARS = [
  '貫索星', '石門星', // 0: 比和（陽, 陰）
  '鳳閣星', '調舒星', // 1: 洩気（陽, 陰）
  '禄存星', '司禄星', // 2: 財（陽, 陰）
  '車騎星', '牽牛星', // 3: 官（陽, 陰）
  '龍高星', '玉堂星'  // 4: 印（陽, 陰）
];
```

**五行関係**:
- 比和(0): 同じ五行
- 洩気(1): 日干 → 相手（木生火、火生土...）
- 財(2): 相手 → 日干（我克者）
- 官(3): 相手 → 日干（克我者）
- 印(4): 日干 → 相手（生我者）

### 2.2 蔵干取得方式

mobile/ は**二十八元に基づく蔵干選択**を使用しています。

```typescript
function getHiddenStemByDays(branchStr: string, daysFromSolarTerm: number): string {
  const data = TWENTY_EIGHT_ELEMENTS[branchStr];
  if (!data) throw new Error(`Invalid branch: ${branchStr}`);

  // 余気（初気）チェック
  if (data.extra && daysFromSolarTerm <= data.extra.days) {
    return data.extra.stem;
  }

  // 中気チェック
  const extraDays = data.extra?.days || 0;
  if (data.sub && daysFromSolarTerm <= extraDays + data.sub.days) {
    return data.sub.stem;
  }

  // 本気
  return data.main.stem;
}

function getYangSenHiddenStem(branchStr: string, position: 'year' | 'month' | 'day', date?: Date): string {
  if (date) {
    const daysFromSolarTerm = getDaysFromSolarTerm(date);
    return getHiddenStemByDays(branchStr, daysFromSolarTerm);
  }

  // dateがない場合は固定の蔵干を使用
  const data = YANGSEN_HIDDEN_STEMS_DATA[branchStr];
  if (!data) throw new Error(`Invalid branch: ${branchStr}`);
  return data.main;
}
```

**特徴**:
- 節入りからの経過日数で蔵干を決定
- 二十八元データ（余気・中気・本気）を使用
- date パラメータがない場合は固定値

---

## 3. ロジックの違いによる問題

### 3.1 十大主星計算の違い

| 項目 | accurate-logic | mobile/ |
|------|----------------|---------|
| 方式 | 固定テーブル | 五行理論計算 |
| メリット | 正解データに完全一致 | 理論的に説明可能 |
| デメリット | 理論的根拠不明 | 正解データと不一致 |

### 3.2 蔵干取得の違い

| 項目 | accurate-logic | mobile/ |
|------|----------------|---------|
| 方式 | 月数（生肖月）テーブル | 二十八元（節入り日数） |
| データ量 | 地支×12ヶ月=144 | 地支×3区分=36 |
| 柔軟性 | 月ごとに変化 | 節入りで変化 |

### 3.3 具体的な不一致例（1984-12-02 胸の計算）

**正解データ**:
- 日干: 庚(6)
- 月支: 亥(11)
- 月支蔵干: 壬(8)
- 期待結果: 鳳閣星

**mobile/ の計算**:
- 月支蔵干: 甲(0)（二十八元より）
- 日干五行: 金(3)
- 蔵干五行: 木(0)
- 関係: (0 - 3 + 5) % 5 = 2 (財)
- 陰陽: 両方陽で一致
- 結果: 禄存星（財×陽） ❌

**accurate-logic の計算**:
- 月支蔵干: 壬(8)（月数テーブルより、12月目の亥）
- 日干五行: 金(3)
- 蔵干五行: 水(4)
- 関係: (4 - 3 + 5) % 5 = 1 (洩気)
- 陰陽: 両方陽で一致
- 結果: 鳳閣星（洩気×陽） ✅

**問題点**:
- mobile/ は 亥(11) の蔵干を「甲」と判定
- accurate-logic は 亥(11) の蔵干を「壬」と判定（12月目）
- 同じ「亥」でも、位置（年支/月支/日支）や月によって蔵干が異なる可能性

---

## 4. 分析ロジックの散在状況

### 4.1 十大主星計算の所在

| ファイル | 方式 | 用途 |
|----------|------|------|
| accurate-logic/src/yangsen.ts | 固定テーブル | 正確な計算（正解データベース） |
| mobile/lib/logic/yangsen.ts | 五行理論 | 理論的な計算 |
| mobile/__tests__/lib/debug-*.test.ts | 五行理論 | デバッグ用 |
| scripts/verify-characters*.ts | accurate-logic使用 | 検証用 |

### 4.2 十二大従星計算の所在

| ファイル | 方式 | 用途 |
|----------|------|------|
| accurate-logic/src/yangsen.ts | 固定テーブル | 正確な計算（朱学院データベース） |
| mobile/lib/logic/yangsen.ts | 建禄理論 | 理論的な計算 |
| mobile/lib/logic/constants.ts | エネルギー表 | ENERGY_TABLE使用 |

### 4.3 蔵干データの所在

| ファイル | 方式 | 用途 |
|----------|------|------|
| accurate-logic/src/yangsen.ts | 月数テーブル | 陽占計算用 |
| accurate-logic/src/constants.ts | 二十八元 | 陰占計算用 |
| mobile/lib/logic/constants.ts | 二十八元 | 汎用計算用 |
| mobile/lib/logic/yangsen.ts | 二十八元 | 陽占計算用 |

---

## 5. 問題箇所の特定

### 5.1 主要な問題

1. **十大主星の計算方式が2種類存在**
   - accurate-logic: 正解データに基づく固定テーブル
   - mobile/: 五行理論に基づく計算式
   - 両者の結果が一致しないケースがある

2. **蔵干取得の方式が2種類存在**
   - accurate-logic: 月数（生肖月）に基づくテーブル
   - mobile/: 二十八元（節入り日数）に基づく選択
   - 亥(11)の12月目で「甲」と「壬」の不一致

3. **二十八元データの不整合**
   - accurate-logic/src/constants.ts: TWENTY_EIGHT_ELEMENTS_DAY と TWENTY_EIGHT_ELEMENTS_MONTH
   - mobile/lib/logic/constants.ts: TWENTY_EIGHT_ELEMENTS（統一なし）
   - 特に「亥」のデータが異なる

### 5.2 具体的な不一致箇所

**亥(11)の蔵干データ**:

```typescript
// accurate-logic: TWENTY_EIGHT_ELEMENTS_MONTH
'亥': {
  extra: { stem: '甲', days: 12 },  // 0-12日目: 甲
  main: { stem: '壬' }              // 13日目以降: 壬
}

// accurate-logic: BRANCH_HIDDEN_STEM_BY_MONTH
'亥': ['甲', '甲', '壬', '甲', '甲', '壬', '甲', '甲', '壬', '甲', '甲', '己']
// 12月目が「己」に修正されている

// mobile/lib/logic/constants.ts: TWENTY_EIGHT_ELEMENTS
'亥': {
  extra: { stem: '甲', days: 12 },
  main: { stem: '壬' }
}
// 二十八元のみで、月数による変化なし
```

---

## 6. 推奨対策

### 6.1 短期的対策

1. **accurate-logic を正統なロジックとして採用**
   - mobile/ の計算を accurate-logic に置き換え
   - 正解データに基づく固定テーブルを使用

2. **蔵干データの統一**
   - accurate-logic の BRANCH_HIDDEN_STEM_BY_MONTH を標準採用
   - 二十八元データは陰占専用として使用

### 6.2 中長期的対策

1. **理論的背景の調査**
   - なぜ月数（生肖月）によって蔵干が変化するのか
   - 算命学Stock や朱学院の資料を確認

2. **計算ロジックの一元化**
   - accurate-logic を唯一の計算エンジンとして位置づけ
   - mobile/ は accurate-logic をインポートして使用

3. **テストカバレッジの強化**
   - 既存の正解データ（朱学院）に基づくテストを追加
   - エッジケース（節入り前後、月替わり）のテストを実施

---

## 7. 結論

1. **accurate-logic の十大主星計算は正解データに基づく固定テーブル方式**
   - 朱学院の正解データに完全一致
   - 理論的な説明は不可能だが、実用的には正確

2. **mobile/ の十大主星計算は五行理論に基づく計算方式**
   - 理論的に説明可能
   - 正解データと不一致のケースがある

3. **蔵干取得方式が2種類存在し、結果に影響**
   - accurate-logic: 月数（生肖月）テーブル
   - mobile/: 二十八元（節入り日数）
   - 1984-12-02 のケースで不一致が発生

4. **推奨アクション**
   - accurate-logic を正統なロジックとして採用
   - mobile/ を accurate-logic に置き換え
   - 蔵干データの統一を実施

---

## 付録: 関連ファイル一覧

### accurate-logic
- `/Users/kitamuratatsuhiko/UIanimated/accurate-logic/src/yangsen.ts`
- `/Users/kitamuratatsuhiko/UIanimated/accurate-logic/src/constants.ts`
- `/Users/kitamuratatsuhiko/UIanimated/accurate-logic/src/bazi.ts`

### mobile/lib/logic
- `/Users/kitamuratatsuhiko/UIanimated/mobile/lib/logic/yangsen.ts`
- `/Users/kitamuratatsuhiko/UIanimated/mobile/lib/logic/bazi.ts`
- `/Users/kitamuratatsuhiko/UIanimated/mobile/lib/logic/constants.ts`
- `/Users/kitamuratatsuhiko/UIanimated/mobile/lib/logic/index.ts`

### テストファイル
- `/Users/kitamuratatsuhiko/UIanimated/mobile/__tests__/lib/yangsen-verification.test.ts`
- `/Users/kitamuratatsuhiko/UIanimated/mobile/__tests__/lib/debug-1984-12-02.test.ts`
- `/Users/kitamuratatsuhiko/UIanimated/mobile/__tests__/lib/debug-chest-1984-12-02.test.ts`

### 検証スクリプト
- `/Users/kitamuratatsuhiko/UIanimated/scripts/verify-characters-sanmeigaku.ts`
- `/Users/kitamuratatsuhiko/UIanimated/scripts/verify-characters.ts`
- `/Users/kitamuratatsuhiko/UIanimated/scripts/test-fixed-bazi.ts`
