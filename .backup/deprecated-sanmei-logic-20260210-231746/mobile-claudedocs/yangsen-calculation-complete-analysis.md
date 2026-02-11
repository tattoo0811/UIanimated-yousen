# 陽占（人体図）計算ロジック完全分析

## 目的

算命学の陽占（九点構成）計算において、特に「胸（中心星）」の計算ルールに矛盾が発生しています。
このドキュメントは現在の実装ロジック、テストケース、矛盾点を包括的にまとめ、正しい計算ルールの特定を目指します。

---

## 1. 陽占（人体図）の構造

### 九点構成（正式人体図）

```
        頭（第四命星）

左肩    右手    胸（中心星）    左手    右肩

        腹（第二命星）

左足    右足              左足
```

### 各位置の計算基準（ユーザー提供の仕様）

| 位置 | 計算に使う干支 | 計算方法 | 星の種類 |
|------|---------------|----------|----------|
| 頭（第四命星） | 年干 | 日干 × 年干 | 十大主星 |
| 右手（第一命星） | 年支の本気 | 日干 × 年支蔵干(本気) | 十大主星 |
| 胸（中心星） | 日干 | 日干 × 日干 | 十大主星 |
| 左手（第三命星） | 月支の本気 | 日干 × 月支蔵干(本気) | 十大主星 |
| 腹（第二命星） | 月干 | 日干 × 月干 | 十大主星 |
| 左肩 | 年支 | 位相計算 | 十二大従星 |
| 右足 | 月支 | 位相計算 | 十二大従星 |
| 左足 | 日支 | 位相計算 | 十二大従星 |

**注意**: 上記は当初の仕様だが、テストケースとの矛盾が発生している。

---

## 2. 現在の実装ロジック

### 2.1 十大主星の計算

#### 天干と五行のマッピング

```typescript
const STEM_TO_ELEMENT = {
    '甲': 0, // 木・陽
    '乙': 0, // 木・陰
    '丙': 1, // 火・陽
    '丁': 1, // 火・陰
    '戊': 2, // 土・陽
    '己': 2, // 土・陰
    '庚': 3, // 金・陽
    '辛': 3, // 金・陰
    '壬': 4, // 水・陽
    '癸': 4  // 水・陰
};

インデックス:
甲=0, 乙=1, 丙=2, 丁=3, 戊=4, 己=5, 庚=6, 辛=7, 壬=8, 癸=9
```

#### getTenGreatStar関数

```typescript
export function getTenGreatStar(dayStemIdx: number, otherStemIdx: number): string {
    const TEN_STARS = [
        '比和', '洩気', '財', '官', '印',
        '比和', '洩気', '財', '官', '印'
    ];

    const dayElement = Math.floor(dayStemIdx / 2);
    const otherElement = Math.floor(otherStemIdx / 2);
    const isOtherYang = otherStemIdx % 2 === 0;

    const diff = (otherElement - dayElement + 5) % 5;
    const index = diff * 2 + (isOtherYang ? 0 : 1);

    return TEN_STARS[index];
}
```

#### 十大主星のマッピング（陽干基準）

| 五行差 | 関係 | 陽干 | 陰干 |
|-------|------|------|------|
| 0 | 比和 | 貫索星 | 石門星 |
| 1 | 洩気 | 鳳閣星 | 調舒星 |
| 2 | 財 | 禄存星 | 司禄星 |
| 3 | 官 | 車騎星 | 牽牛星 |
| 4 | 印 | 龍高星 | 玉堂星 |

#### 現在の計算ロジック（calculateYangSen関数）

```typescript
export function calculateYangSen(bazi: FourPillars): YangSen {
    const dayStemIdx = bazi.day.stem - 1;

    // 頭（第四命星）: 年干
    const head = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

    // 右手: 年支の本気
    const yearBranchHiddenStem = getYangSenHiddenStem(bazi.year.branchStr, 'year');
    const yearBranchHiddenIdx = STEM_TO_INDEX[yearBranchHiddenStem];
    const rightHand = getTenGreatStar(dayStemIdx, yearBranchHiddenIdx);

    // 胸（中心星）: 日干
    const chest = getTenGreatStar(dayStemIdx, dayStemIdx); // ← ここが問題

    // 左手: 月支の本気
    const monthBranchHiddenStem = getYangSenHiddenStem(bazi.month.branchStr, 'month');
    const monthBranchHiddenIdx = STEM_TO_INDEX[monthBranchHiddenStem];
    const leftHand = getTenGreatStar(dayStemIdx, monthBranchHiddenIdx);

    // 腹: 月干
    const belly = getTenGreatStar(dayStemIdx, bazi.month.stem - 1);

    // 十二大従星（省略）
    ...
}
```

### 2.2 蔵干の選択ルール

算命学では**本気（主気）のみ**を使用：

```typescript
const YANGSEN_HIDDEN_STEMS_DATA: Record<string, HiddenStemData> = {
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

---

## 3. テストケースの詳細分析

### テストケース1: 2018-03-31 12:00

#### 四柱データ
```
年柱: 戊戌（戊=4, 戌=10）
月柱: 乙卯（乙=1, 卯=3）
日柱: 壬戌（壬=8, 戌=10）
時柱: 不明
```

#### 画像の正解データ
```
十大主星:
  頭: 車騎星
  右手: 車騎星
  胸: 貫索星
  左手: 調舒星
  腹: 調舒星

十二大従星:
  左肩: 天南星(10点)
  右足: 天南星(10点)
  左足: 天極星(2点)
```

#### 現在の計算結果
```
日干インデックス: 8 (壬)

頭 = getTenGreatStar(8, 4) // 壬 × 戊
  dayElement = 4 (水)
  otherElement = 2 (土)
  diff = (2-4+5)%5 = 3 (官)
  isOtherYang = true
  index = 3*2+0 = 6
  結果: 車騎星 ✅

右手 = getTenGreatStar(8, STEM_TO_INDEX['戊']) // 壬 × 戌蔵干(戊)
  = getTenGreatStar(8, 4)
  結果: 車騎星 ✅

胸 = getTenGreatStar(8, 8) // 壬 × 壬
  dayElement = 4 (水)
  otherElement = 4 (水)
  diff = (4-4+5)%5 = 0 (比和)
  isOtherYang = true
  index = 0*2+0 = 0
  結果: 貫索星 ✅

左手 = getTenGreatStar(8, STEM_TO_INDEX['乙']) // 壬 × 卯蔵干(乙)
  = getTenGreatStar(8, 1)
  dayElement = 4 (水)
  otherElement = 0 (木)
  diff = (0-4+5)%5 = 1 (洩気)
  isOtherYang = false
  index = 1*2+1 = 3
  結果: 調舒星 ✅

腹 = getTenGreatStar(8, 1) // 壬 × 乙
  結果: 調舒星 ✅
```

**結論**: このケースでは「胸 = 日干×日干」ルールが成立 ✅

---

### テストケース2: 1984-12-02 12:00

#### 四柱データ
```
年柱: 甲子（甲=0, 子=0）
月柱: 乙亥（乙=1, 亥=11）
日柱: 庚午（庚=6, 午=6）
時柱: 壬午（壬=8, 午=6）
```

#### 画像の正解データ
```
十大主星:
  頭: 禄存星
  右手: 牽牛星
  胸: 鳳閣星 ← 注目
  左手: 調舒星
  腹: 司禄星

十二大従星:
  左肩: 天極星(2点)
  右足: 天恍星(7点) ※画像では「天悦星」だが天恍星の別名
  左足: 天胡星(4点)
```

#### 現在の計算結果
```
日干インデックス: 6 (庚)

頭 = getTenGreatStar(6, 0) // 庚 × 甲
  dayElement = 3 (金)
  otherElement = 0 (木)
  diff = (0-3+5)%5 = 2 (財)
  isOtherYang = true
  index = 2*2+0 = 4
  結果: 禄存星 ✅

右手 = getTenGreatStar(6, STEM_TO_INDEX['癸']) // 庚 × 子蔵干(癸)
  = getTenGreatStar(6, 9)
  dayElement = 3 (金)
  otherElement = 4 (水)
  diff = (4-3+5)%5 = 1 (洩気)
  isOtherYang = false
  index = 1*2+1 = 3
  結果: 調舒星 ❌ (正解: 牽牛星)

胸 = getTenGreatStar(6, 6) // 庚 × 庚
  dayElement = 3 (金)
  otherElement = 3 (金)
  diff = (3-3+5)%5 = 0 (比和)
  isOtherYang = true
  index = 0*2+0 = 0
  結果: 貫索星 ❌ (正解: 鳳閣星)

左手 = getTenGreatStar(6, STEM_TO_INDEX['壬']) // 庚 × 亥蔵干(壬)
  = getTenGreatStar(6, 8)
  dayElement = 3 (金)
  otherElement = 4 (水)
  diff = (4-3+5)%5 = 1 (洩気)
  isOtherYang = true
  index = 1*2+0 = 2
  結果: 鳳閣星 ❌ (正解: 調舒星)

腹 = getTenGreatStar(6, 1) // 庚 × 乙
  dayElement = 3 (金)
  otherElement = 0 (木)
  diff = (0-3+5)%5 = 2 (財)
  isOtherYang = false
  index = 2*2+1 = 5
  結果: 司禄星 ✅
```

#### 鳳閣星を得るための計算

鳳閣星 = 洩気 + 陽干
庚(金陽)が洩気する五行 = 水
水の陽干 = 壬

```
庚 × 壬 = getTenGreatStar(6, 8)
  diff = (4-3+5)%5 = 1 (洩気)
  isOtherYang = true
  index = 1*2+0 = 2
  結果: 鳳閣星 ✅
```

**時干が壬** → もし「胸 = 日干×時干」なら、庚×壬=鳳閣星で一致

**結論**: このケースでは「胸 = 日干×時干」の可能性 ⚠️

---

### テストケース3: 1983-08-11 12:00

#### 四柱データ
```
年柱: 癸亥（癸=9, 亥=11）
月柱: 庚申（庚=6, 申=8）
日柱: 辛未（辛=7, 未=7）
時柱: 甲午（甲=0, 午=6）
```

#### 画像の正解データ
```
十大主星:
  頭: 鳳閣星
  右手: 車騎星
  胸: 玉堂星 ← 注目
  左手: 司禄星
  腹: 石門星

十二大従星:
  左肩: 天悦星(天恍星)(7点)
  右足: 天堂星(8点)
  左足: 天将星(12点)
```

#### 現在の計算結果
```
日干インデックス: 7 (辛)

頭 = getTenGreatStar(7, 9) // 辛 × 癸
  dayElement = 3 (金)
  otherElement = 4 (水)
  diff = (4-3+5)%5 = 1 (洩気)
  isOtherYang = false
  index = 1*2+1 = 3
  結果: 調舒星 ❌ (正解: 鳳閣星)
  ※要検証

胸 = getTenGreatStar(7, 7) // 辛 × 辛
  dayElement = 3 (金)
  otherElement = 3 (金)
  diff = (3-3+5)%5 = 0 (比和)
  isOtherYang = false
  index = 0*2+1 = 1
  結果: 石門星 ❌ (正解: 玉堂星)
```

#### 玉堂星を得るための計算

玉堂星 = 印 + 陰干
辛(金陰)を生じる五行 = 土
土の陰干 = 己

```
辛 × 己 = getTenGreatStar(7, 5)
  dayElement = 3 (金)
  otherElement = 2 (土)
  diff = (2-3+5)%5 = 4 (印)
  isOtherYang = false
  index = 4*2+1 = 9
  結果: 玉堂星 ✅
```

**日支 = 未** → 未の蔵干(本気) = 己
→ もし「胸 = 日干×日支蔵干」なら、辛×己=玉堂星で一致

**時干 = 甲** → 辛×甲なら牽牛星（不一致）

**結論**: このケースでは「胸 = 日干×日支蔵干(本気)」の可能性 ⚠️

---

## 4. 矛盾点の整理

### 胸（中心星）の計算ルール

| テストケース | 日柱 | 時柱 | 日干×日干 | 日干×時干 | 日干×日支蔵干 | 画像の正解 | 一致 |
|-------------|------|------|-----------|-----------|---------------|-----------|------|
| 2018-03-31 | 壬戌 | 不明 | 貫索星 | 不明 | 車騎星 | 貫索星 | 日干×日干 ✅ |
| 1984-12-02 | 庚午 | 壬午 | 貫索星 | 鳳閣星 | 車騎星 | 鳳閣星 | 日干×時干 ⚠️ |
| 1983-08-11 | 辛未 | 甲午 | 石門星 | 牽牛星 | 玉堂星 | 玉堂星 | 日干×日支蔵干 ⚠️ |

### 問題点

1. **計算ルールが一貫していない**
   - 2018-03-31: 日干×日干で成立
   - 1984-12-02: 日干×時干で成立
   - 1983-08-11: 日干×日支蔵干で成立

2. **時柱の有無による分岐？**
   - 2018-03-31は時柱情報が不明（もしかしたら存在しない？）
   - 1984-12-02と1983-08-11は時柱が存在

3. **条件による分岐の可能性**
   - 何らかの条件（陰陽、五行、特定の組み合わせなど）で計算方法が変わる？

---

## 5. 仮説

### 仮説A: 条件分岐ルール

```
IF 時柱が存在しない THEN
    胸 = 日干 × 日干
ELSE IF [特定の条件X] THEN
    胸 = 日干 × 時干
ELSE
    胸 = 日干 × 日支蔵干(本気)
END IF
```

**特定の条件X**の候補:
- 時干と日干の五行関係（洩気、財、官など）
- 時干の陰陽
- 日支との関係
- その他の複雑な条件

### 仮説B: 2018-03-31も時柱が存在する

もし2018-03-31にも時柱が存在し、その時干が「壬」なら：
```
胸 = 日干 × 時干
壬 × 壬 = 貫索星 ✅
```

しかし、この場合も1983-08-11との矛盾は解消されない。

### 仮説C: 優先順位ルール

```
1. 時干との計算結果が特定の星（比和系、印系など）になる場合
   → 日干×時干を使う
2. そうでない場合
   → 日干×日支蔵干を使う
```

### 仮説D: テストデータの誤り

テストケースの期待値自体に誤りがある可能性。
ただし、ユーザー提供の画像データとも一致しているため可能性は低い。

---

## 6. 検証が必要な項目

1. **2018-03-31の時柱データ確認**
   - 時柱が存在するか？
   - 存在する場合、時干は何か？

2. **他のテストケース（2016-10-27）の検証**
   - 追加のデータポイントで仮説を検証

3. **算命学の原典確認**
   - 正式な算命学の書籍・文献での「胸（中心星）」計算ルールの確認

4. **右手・左手の計算も再検証**
   - 1984-12-02で右手と左手も不一致（右手: 調舒星→牽牛星、左手: 鳳閣星→調舒星）
   - 蔵干の選択ルールに問題がある可能性

---

## 7. 追加の問題点

### 右手・左手の不一致（1984-12-02）

```
右手の計算:
現在: 庚 × 子蔵干(癸) = 調舒星
正解: 牽牛星

牽牛星を得るには:
庚 × 丙 = 官 + 陰干 = 牽牛星
または
庚 × 戊 の可能性も（要検証）

左手の計算:
現在: 庚 × 亥蔵干(壬) = 鳳閣星
正解: 調舒星

調舒星を得るには:
庚 × 癸 = 洩気 + 陰干 = 調舒星
```

**疑問**: 年支と月支で使う蔵干が異なる可能性？
- 年支=子 → 癸を使う？それとも別の干？
- 月支=亥 → 壬ではなく癸を使う？

---

## 8. 次のアクションプラン

1. **2018-03-31の時柱を確定**
   - 元画像に時柱情報があるか確認
   - ない場合は計算で求める（真太陽時）

2. **2016-10-27のテストケース実行**
   - 追加データで仮説を検証

3. **蔵干選択ルールの再検証**
   - 年支・月支・日支で異なる蔵干を使う可能性を検証

4. **算命学の専門家・文献に確認**
   - 正式なルールの確認

---

## 9. 現在のコード実装

### calculateYangSen関数（問題箇所）

```typescript
// src/lib/logic.ts (行番号は概算)

export function calculateYangSen(bazi: FourPillars): YangSen {
    const dayStemIdx = bazi.day.stem - 1;

    // 頭（第四命星）: 年干
    const head = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

    // 右手: 年支の本気
    const yearBranchHiddenStem = getYangSenHiddenStem(bazi.year.branchStr, 'year');
    const yearBranchHiddenIdx = STEM_TO_INDEX[yearBranchHiddenStem];
    const rightHand = getTenGreatStar(dayStemIdx, yearBranchHiddenIdx);

    // 胸（中心星）: 日干 ← ここが問題
    const chest = getTenGreatStar(dayStemIdx, dayStemIdx);

    // 左手: 月支の本気
    const monthBranchHiddenStem = getYangSenHiddenStem(bazi.month.branchStr, 'month');
    const monthBranchHiddenIdx = STEM_TO_INDEX[monthBranchHiddenStem];
    const leftHand = getTenGreatStar(dayStemIdx, monthBranchHiddenIdx);

    // 腹: 月干
    const belly = getTenGreatStar(dayStemIdx, bazi.month.stem - 1);

    // 十二大従星の計算
    const leftShoulder = getTwelveGreatStar(dayStemIdx, bazi.year.branch - 1, 'leftShoulder');
    const rightLeg = getTwelveGreatStar(dayStemIdx, bazi.month.branch - 1, 'rightLeg');
    const leftLeg = getTwelveGreatStar(dayStemIdx, bazi.day.branch - 1, 'leftLeg');

    return {
        head,
        rightHand,
        chest,
        leftHand,
        belly,
        leftShoulder,
        rightLeg,
        leftLeg
    };
}
```

---

## 10. まとめ

### 確実な事実

1. **2018-03-31では「胸 = 日干×日干」が成立**
2. **1984-12-02では「胸 = 日干×時干」で正解が得られる**
3. **1983-08-11では「胸 = 日干×日支蔵干」で正解が得られる**
4. **右手・左手の計算も1984-12-02で不一致**

### 不明な点

1. **胸（中心星）の正確な計算ルール**
2. **時柱の有無による分岐の有無**
3. **2018-03-31の時柱データ**
4. **年支・月支で使う蔵干の選択ルール**

### 推奨アクション

**他のAIへの質問**:
「算命学の陽占（九点構成）において、胸（中心星）の計算は以下のどれが正しいですか？また、その条件分岐があれば教えてください。

1. 常に日干×日干
2. 時柱がある場合は日干×時干、ない場合は日干×日干
3. 日干×日支蔵干(本気)
4. 条件によって変わる（条件を教えてください）

また、年支・月支の蔵干選択についても、位置（年支/月支）によって異なる蔵干を使う可能性はありますか？」
