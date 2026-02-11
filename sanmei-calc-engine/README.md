# 算命学エンジン (Sanmei-gaku Engine)

Team A: Core Calculation Engine - TypeScript Implementation

## データベーススキーマ設計

### Turso ベースのキャラクター算命学データベース

以下のファイルを参照してください：

- **`schema.sql`** - SQL スキーマ定義（435行）
  - 7つの主要テーブル設計
  - インデックス、ビュー、トリガー定義
  - 初期データサンプル

- **`ER_DIAGRAM.md`** - ER 図とテーブル詳細定義（574行）
  - Mermaid 形式の ER 図
  - 全テーブルのカラム詳細
  - ビュー定義とクエリ例

- **`TURSO_SETUP.md`** - Turso セットアップ手順（536行）
  - Turso CLI のインストール
  - データベースの作成と接続
  - Node.js/TypeScript からの接続例
  - データのインポート/エクスポート

### データベース構成

#### 主要テーブル

1. **characters** - キャラクター基本情報
2. **birthdata** - 生年月日データ
3. **yinyang** - 陰占データ（四柱推命、天中殺など）
4. **yangsen** - 陽占データ（十大主星、十二大従星）
5. **dayun** - 大運データ（10年周期）
6. **timeline** - 年表データ
7. **verification** - 朱学院照合結果

#### ER 図の概要

```
characters (1) --< (1) birthdata
birthdata (1) --< (1) yinyang
birthdata (1) --< (1) yangsen
birthdata (1) --< (N) dayun
characters (1) --< (N) timeline
birthdata (1) --< (N) verification
```

### クイックスタート

```bash
# 1. Turso データベースの作成
turso db create sanmei-fortune --location nrt

# 2. スキーマの適用
turso db execute sanmei-fortune --file schema.sql

# 3. パッケージのインストール
npm install @libsql/client

# 4. 接続設定
export TURSO_DATABASE_URL="libsql://xxxxx@xxxxx.turso.io"
export TURSO_AUTH_TOKEN="xxxxxxxxxxxxx"
```

### データ型定義との対応

データベーススキーマは以下の型定義ファイルと対応しています：

- `/mobile/src/types/index.ts` - TypeScript 型定義
- `/mobile/lib/logic/*.ts` - 算命学計算ロジック

---

## Created Files

### 1. `/src/constants.ts` (548 lines)
Complete data constants for the Sanmei-gaku system:

#### Included Components:
- **十干 (Ten Heavenly Stems)**: 甲、乙、丙、丁、戊、己、庚、辛、壬、癸
  - Yin/Yang classification (陽/陰)
  - Element mapping (木火土金水)

- **十二支 (Twelve Earthly Branches)**: 子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥
  - Yin/Yang classification
  - Element mapping

- **六十干支 (60 Kanshi Cycle)**: Complete cycle generation with proper pairing rules
  - Generated via `generateKanshi()` function
  - Stem-branch pairing follows yin/yang matching rules

- **蔵干 (Hidden Stems)**: 二十八元 System with timing data
  - Complete data for all 12 branches
  - Day-by-day timing for multiple hidden stems
  - Special corrections: 午月 main stem = 丁 (not 己), 亥月 main stem = 壬 (not 甲)

- **五虎遁 (Wu Hu Dun)**: Year Stem → Month Stem determination
  - Maps year stem index to month stem starting point
  - 5 combinations: 甲/己→丙, 乙/庚→戊, 丙/辛→庚, 丁/壬→壬, 戊/癸→甲

- **五鼠遁 (Wu Shu Dun)**: Day Stem → Hour Stem determination
  - Maps day stem index to hour stem starting point
  - 5 combinations: 甲/己→甲, 乙/庚→丙, 丙/辛→戊, 丁/壬→庚, 戊/癸→壬

- **建禄支 (Build Luck Branch)**: Stem-to-branch lucky branch mapping
  - Complete mapping for all 10 stems
  - Corrected: 戊→午 (not 巳)

- **節入り (Solar Terms)**: 2020-2030 accurate dates
  - 12 节 dates per year for month boundary calculation
  - Approximation formula for years outside the table
  - Terms included: 立春, 啓蟄, 清明, 立夏, 芒種, 小暑, 立秋, 白露, 寒露, 立冬, 大雪, 小寒

### 2. `/src/types.ts` (312 lines)
Complete TypeScript type definitions:

#### Type Categories:
- **Basic Types**: `Stem`, `Branch`, `Element`, `YinYang`, `GanZhi`
- **Four Pillars**: `Pillar`, `FourPillars` with all attributes
- **Hidden Stems**: `PillarHiddenStems`, `HiddenStemInfo`
- **Ten Stars**: `TenStar`, `TenStarType` (10 relationship types)
- **Twelve Stars**: `TwelveStar`, `TwelveStarType` (12 branch relationships)
- **Tenchusatsu**: `Tenchusatsu` null period type
- **Compatibility**: `CompatibilityResult` for matching charts
- **Major Periods**: `MajorPeriod` for 10-year luck cycles
- **Yearly Luck**: `YearlyLuck` for annual forecasts
- **Twelve Phases**: `TwelvePhase` and `TwelvePhaseType` for life stages
- **Complete Chart**: `SanmeiChart` - the main data structure
- **Options**: `FourPillarsCalculationOptions` for flexible calculation

### 3. `/src/fourPillars.ts` (414 lines)
Core four pillars calculation engine:

#### Main Function:
```typescript
export function calculateFourPillars(
  year: number,
  month: number,
  day: number,
  hour: number
): FourPillars
```

#### Algorithm Implementations:

**Year Pillar (年柱)**:
- Checks 立春 (Lichun) date to determine if year adjustment needed
- Formula: stem = (year - 4) % 10, branch = (year - 4) % 12
- Kanshi index = (year - 4) % 60

**Month Pillar (月柱)**:
- Uses solar terms to determine which month (寅-丑) the date falls in
- Applies 五虎遁 (Wu Hu Dun) formula with year stem
- monthStemIdx = (yearStemIdx % 5) * 2 + monthOffset

**Day Pillar (日柱)**:
- Uses Julian Day Number (JDN) conversion
- Formula: stemIdx = (JDN + 9) % 10, branchIdx = (JDN + 1) % 12
- Reference validation: 1900-01-01 = 甲戌 (stem=0, branch=10)

**Hour Pillar (時柱)**:
- Converts hour (0-23) to branch: branchIdx = floor((hour + 1) / 2) % 12
- Applies 五鼠遁 (Wu Shu Dun) formula with day stem
- Special handling: hour 23 uses next day's stem

#### Utility Functions:
- `gregorianToJDN()`: Date to Julian Day Number conversion
- `getChineseMonth()`: Determines lunar month from solar date
- `getLichunDate()`: Gets Lichun (start of spring) date for year

#### Input Validation:
- Year: 1800-2100
- Month: 1-12
- Day: 1-31
- Hour: 0-23

#### Debug Exports:
- `internalFunctions` object for testing and validation

## Code Quality

- **Pure TypeScript**: No external dependencies
- **Well-Commented**: Japanese documentation throughout
- **Type-Safe**: Full TypeScript strict mode compliance
- **Tested Formulas**: 
  - JDN calculation verified against known dates
  - Kanshi cycle generation with correct pairing rules
  - Solar terms data for accurate month boundaries

## Notes on Corrections Applied

1. **午月 (Horse Month)**: Main hidden stem is 丁, NOT 己
2. **亥月 (Pig Month)**: Main hidden stem is 壬, with 甲 as extra (first 7 days)
3. **戊/己年 Build Luck**: Both map to 午支, NOT 巳
4. **Reference Date for Day Pillar**: 1900-01-01 = 甲戌 (verified for JDN calculation)

## Future Extensions

This foundation supports:
- 十星 (Ten Star) relationship calculations
- 天中殺 (Tenchusatsu / Null Period) detection
- 大運 (Major Period) 10-year cycle forecasting
- 年運 (Yearly Luck) forecasting
- Compatibility analysis between charts
- Life phase (十二運) calculations
