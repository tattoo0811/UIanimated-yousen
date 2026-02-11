# 算命学検証実行計画

## 検証チーム状況
- **担当**: 算命学検証チーム
- **対象**: 4つのデザインチームが作成する96キャラクター
- **優先度**: 最高（算命学的整合性は物語の根幹）

## 検証プロセス詳細

### フェーズ1: 準備完了 ✅
- [x] 検証ライブラリの確認 (`/mobile/lib/logic/index.ts` に `calculateKanshi` が存在)
- [x] 型定義の確認 (`/mobile/src/types/index.ts` に必要な型が定義済み)
- [x] 検証スクリプトの作成
- [ ] キャラクターデータの待機

### フェーズ2: データ収集（待機中）
4つのファイルが作成されるのを待機：
1. `/claudedocs/EPISODES-1-24-CHARACTERS.json`
2. `/claudedocs/EPISODES-25-48-CHARACTERS.json`
3. `/claudedocs/EPISODES-49-72-CHARACTERS.json`
4. `/claudedocs/EPISODES-73-96-CHARACTERS.json`

### フェーズ3: 個別検証（実装済み）

#### 検証項目
```typescript
import { calculateKanshi } from '@/mobile/lib/logic/kanshi';

// 各キャラクターについて検証
const result = calculateKanshi({
  birthDate: new Date(character.birth_date),
  gender: character.gender || 'female',
  includeTaiun: false,
  includeInsen: true
});

// 検証チェックリスト
checks = {
  // 1. 日干の整合性
  nikkan: result.bazi.day.stemStr === character.sanmeigaku.nikkan,

  // 2. 天中殺の整合性
  tenchusatsu: result.insen.tenchusatsu.type === character.sanmeigaku.tenchusatsu,

  // 3. 五行バランスの整合性（許容誤差±5%）
  fiveElements: compareFiveElements(result.fiveElements, character.sanmeigaku.five_elements),

  // 4. 十大主星の整合性
  tenDaiShusei: verifyTenDaiShusei(result.insen.tsuhensei, character.sanmeigaku.stars),

  // 5. エネルギー点数の整合性（許容誤差±3点）
  energyScore: Math.abs(result.energyScore - character.sanmeigaku.energy_score) <= 3,
}
```

#### 重大度レベル
- **🔴 Critical**: 日干、天中殺が不一致 → 即時修正必要
- **🟡 Warning**: 五行、エネルギー点数が多少異なる → 検討の上、必要なら修正
- **🟢 Info**: 軽微な計算誤差（±1-2点） → 許容範囲

### フェーズ4: 統計検証

#### 目標分布
- **日干**: 甲乙丙丁戊己庚辛壬癸 → 各10個前後（±2）
- **天中殺**: 子丑、寅卯、辰巳、午未、申酉、戌亥 → 各16個前後（±3）
- **年齢層**:
  - 10代: 15-20名
  - 20代: 25-30名
  - 30代: 25-30名
  - 40代: 15-20名
  - 50代+: 5-10名
- **職業**: 30種類以上（重複を避ける）

#### 統計検証コード
```typescript
// 日干分布
const nikkanDistribution = {
  甲: count(c => c.sanmeigaku.nikkan === '甲'),
  乙: count(c => c.sanmeigaku.nikkan === '乙'),
  // ... 他の日干も同様
};

// 天中殺分布
const tenchusatsuDistribution = {
  '子丑': count(c => c.sanmeigaku.tenchusatsu === '子丑天中殺'),
  '寅卯': count(c => c.sanmeigaku.tenchusatsu === '寅卯天中殺'),
  // ... 他の天中殺も同様
};

// 年齢層分布
const ageDistribution = {
  teens: count(c => calculateAge(c) < 20),
  twenties: count(c => calculateAge(c) >= 20 && calculateAge(c) < 30),
  // ... 他の年齢層も同様
};

// 職業の多様性
const uniqueProfessions = new Set(allCharacters.map(c => c.profession));
```

### フェーズ5: 問題検出と修正

#### 修正ワークフロー
1. 問題を検出 → `verification-results.json` に記録
2. 重大度レベルを判定
3. Critical/Warningの場合:
   - 該当キャラクターの情報を抽出
   - 問題の詳細を分析
   - デザインチームに修正依頼を発行
4. 修正完了後 → 再検証
5. 全て合格になるまで繰り返し

#### 修正依頼フォーマット
```markdown
## 算命学検証エラー報告

### キャラクター
- エピソード: XX
- 名前: ◯◯◯△□
- 生年月日: YYYY-MM-DD

### 検証エラー
**重大度**: 🔴 Critical

**不一致項目**:
1. 日干: 設計値="甲"、計算値="乙"
2. 天中殺: 設計値="子丑天中殺"、計算値="寅卯天中殺"

**期待値**:
```json
{
  "sanmeigaku": {
    "nikkan": "甲",
    "tenchusatsu": "子丑天中殺"
  }
}
```

**実際の計算結果**:
```json
{
  "nikkan": "乙",
  "tenchusatsu": "寅卯天中殺"
}
```

### 修正推奨
1. 生年月日を変更するか、
2. 占い結果を計算値に合わせるか
3. どちらの対応をご希望ですか？
```

### フェーズ6: 最終レポート

#### 出力ファイル
`/claudedocs/SANMEIGAKU-VERIFICATION-REPORT.md`

#### レポート構成
```markdown
# 96話キャラクター算命学検証報告

## 検証サマリー
- 全キャラクター数: XX名
- 検証合格: XX名
- 修正必要: XX名（Critical: X、Warning: Y）
- 修正完了: XX名

## 統計データ
### 日干分布
[表]

### 天中殺分布
[表]

### 年齢層分布
[表]

### 職業の多様性
- 総職業数: XX種類
- 重複なし職業リスト: [...]

## 問題一覧
### Critical（修正済み）
1. [...]

### Warning（検討の上、対応済み）
1. [...]

### Info（許容範囲）
1. [...]

## 結論
[算命学的整合性についての最終評価]
```

## 検証スケジュール

### 現在のステータス: 🟡 待機中
- [ ] デザインチーム作業完了待ち
- [ ] 4つのJSONファイルが作成されるのを待機

### 次のアクション
1. いずれかのJSONファイルが作成されたら検証開始
2. 順次、各ブロックを検証
3. 全ファイル完了後、統計検証を実施
4. 最終レポートを作成

## 検証用ツール

### スクリプト構成
1. `verify-all.ts` - 全キャラクター一括検証
2. `verify-block.ts` - ブロック単位検証
3. `stats-analysis.ts` - 統計解析
4. `report-generator.ts` - レポート生成

### 実行コマンド
```bash
# 準備中
npm run verify:wait

# 検証開始（全キャラクター）
npm run verify:all

# ブロック単位検証
npm run verify:block -- --block=1-24

# 統計解析
npm run verify:stats

# レポート生成
npm run verify:report
```

## 注意事項
1. **矛盾はしないように生年月日と占い結果だけはデリケートに**
   - 生年月日から計算した結果と、設計された占い結果が一致するか検証
   - 不一致の場合、どちらを修正すべきか慎重に検討

2. **検証はキャラクター設計の完了を待って開始**
   - 無理に急かさない
   - デザインチームのクリエイティビティを尊重

3. **軽微な誤差は許容**
   - 五行の点数が±5%程度の差異はOK
   - エネルギー点数が±3点程度の差異はOK
   - 日干・天中殺の不一致のみ重大な問題として扱う

## リソース
- 検証ライブラリ: `/mobile/lib/logic/index.ts`
- 型定義: `/mobile/src/types/index.ts`
- テストケース: `/mobile/__tests__/lib/calculate-*.test.ts`
