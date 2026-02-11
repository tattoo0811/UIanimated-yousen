# 統合JSON生成チーム - 詳細統合計画

**作成日**: 2026-02-09
**担当**: 統合JSON生成チーム
**ステータス**: 準備完了 - 他チームの作業待ち

---

## 現状分析

### 既存ファイルの確認
- ✅ **meguri-96episodes-final.json** (2.6MB) 存在
- ✅ 96話分のエピソードデータ完備
- ✅ メインキャラクター: 九条巡（現在は26歳、1991-03-07生）

### 設計方針ドキュメント
- ✅ CHARACTER-BIRTHDATE-ADJUSTMENT-FINAL.md 読み込み完了
- ✅ キャラクター修正方針確認
- ✅ 算命学モジュール分析完了

### 待機中のデータ（他チーム作業中）
- ⏳ CHARACTER-DESIGN-MANUAL.md（未作成）
- ⏳ EPISODES-*-CHARACTERS.json（4ブロック分、未作成）
- ⏳ SANMEIGAKU-VERIFICATION-REPORT.md（未作成）

---

## 統合フローチャート

```
┌─────────────────────────────────────────────────────────┐
│  Phase 1: データ収集・監視                                  │
│  各チームの作業完了を待ち、ファイルを監視                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 2: 構造整合性確認                                    │
│  既存JSON構造を維持しつつ、マージ方法を検証                   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 3: キャラクターデータ統合                            │
│  メインキャラクター＋全患者キャラクターを統合                 │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 4: JSONバリデーション                               │
│  構文・必須フィールド・データ型・日付フォーマットを確認         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 5: 統計情報付与                                     │
│  メタデータとして統計情報を付加                              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 6: 最終出力＆変更履歴作成                            │
│  v2ファイル・バックアップ・移行ログを作成                    │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: データ収集・監視

### 1.1 監視対象ファイル

| ファイル | 期待内容 | 作成チーム | ステータス |
|---------|----------|-----------|----------|
| `claudedocs/CHARACTER-DESIGN-MANUAL.md` | 設計方針・ガイドライン | 設計統括チーム | ⏳ 未作成 |
| `claudedocs/EPISODES-001-024-CHARACTERS.json` | 第1-24話キャラクター | ブロック1チーム | ⏳ 未作成 |
| `claudedocs/EPISODES-025-048-CHARACTERS.json` | 第25-48話キャラクター | ブロック2チーム | ⏳ 未作成 |
| `claudedocs/EPISODES-049-072-CHARACTERS.json` | 第49-72話キャラクター | ブロック3チーム | ⏳ 未作成 |
| `claudedocs/EPISODES-073-096-CHARACTERS.json` | 第73-96話キャラクター | ブロック4チーム | ⏳ 未作成 |
| `claudedocs/SANMEIGAKU-VERIFICATION-REPORT.md` | 検証報告 | 検証チーム | ⏳ 未作成 |

### 1.2 監視プロセス

```bash
# 5分間隔でファイルの有無をチェック
while true; do
  echo "Checking files at $(date)"
  ls -la claudedocs/EPISODES-*-CHARACTERS.json 2>/dev/null | wc -l
  sleep 300
done
```

### 1.3 データ受信時の確認事項

- ✅ 全4ブロック分が揃っている
- ✅ 検証チームのレポートで「整合性確認済み」マークがある
- ✅ 各JSONファイルが正しい構造を持つ
- ✅ 生年月日・年齢・算命学データが含まれている

---

## Phase 2: 構造整合性確認

### 2.1 既存JSON構造の分析

```json
{
  "series": {
    "title": "ドクター巡の人生処方箋",
    "title_en": "Doctor Meguru's Life Prescription",
    "total_episodes": 96,
    "format": "vertical_scroll_webtoon",
    "canvas": { "width": 800, "height": 1280, "dpi": 300 }
  },
  "characters": {
    "main": [ /* メインキャラクター */ ],
    "patients": [ /* 全患者キャラクター */ ]
  },
  "episodes": [
    {
      "episode_number": 1,
      "chapter": 1,
      "chapter_title": "開院篇",
      "title": "...",
      "patient": { /* 患者データ */ },
      "fortune": { /* 算命学データ */ },
      "manga_structure": { /* 漫画構造 */ }
    }
  ]
}
```

### 2.2 構造維持ルール

1. **series**: 既存のまま維持
2. **characters.main**: 九条巡・一条慧・祖母さくら・白河栞を更新
3. **characters.patients**: 新しいデータで完全に置き換え
4. **episodes[].patient**: 各エピソードの患者データを更新
5. **episodes[].fortune**: 算命学データを再計算

### 2.3 マージ戦略

```typescript
// マージ擬似コード
const existing = loadJSON('meguri-96episodes-final.json');
const newData = {
  main: loadFromBlocks('EPISODES-*-CHARACTERS.json'),
  patients: extractPatientsFromBlocks()
};

const merged = {
  ...existing.series,
  characters: {
    main: updateMainCharacters(existing.characters.main, newData.main),
    patients: newData.patients
  },
  episodes: existing.episodes.map(ep => ({
    ...ep,
    patient: findPatient(ep.episode_number, newData.patients),
    fortune: recalculateFortune(ep.patient.birth_date)
  }))
};
```

---

## Phase 3: キャラクターデータ統合

### 3.1 メインキャラクター更新

| キャラクター | 項目 | 旧値 | 新値 |
|-------------|------|------|------|
| 九条巡 | 年齢 | 26歳 | 34歳 |
| 九条巡 | 生年月日 | 1991-03-07 | 1991-09-30 |
| 一条慧 | 年齢 | - | 32歳 |
| 一条慧 | 生年月日 | - | 1992-xx-xx |

### 3.2 患者キャラクター統合

```typescript
interface PatientCharacter {
  id: string;
  name: string;
  name_reading: string;
  age: number;
  birth_date: string; // YYYY-MM-DD
  occupation: string;
  sanmeigaku: {
    nikkan: string;
    tenchusatsu: string;
    center_star: string;
    twelve_stars: Record<string, { name: string; score: number }>;
    five_elements: Record<string, number>;
  };
  episode_appearances: number[]; // 登場エピソード番号
}
```

### 3.3 データ整合性チェック

```typescript
function validatePatient(patient: PatientCharacter): ValidationResult {
  const errors = [];

  // 日付フォーマット
  if (!/^\d{4}-\d{2}-\d{2}$/.test(patient.birth_date)) {
    errors.push('Invalid birth_date format');
  }

  // 年齢計算
  const calculatedAge = calculateAge(patient.birth_date);
  if (calculatedAge !== patient.age) {
    errors.push(`Age mismatch: ${patient.age} vs ${calculatedAge}`);
  }

  // 算命学データ
  const kanshi = calculateKanshi(patient.birth_date);
  if (kanshi.bazi.day.stemStr !== patient.sanmeigaku.nikkan) {
    errors.push('Nikkan mismatch');
  }

  return { valid: errors.length === 0, errors };
}
```

---

## Phase 4: JSONバリデーション

### 4.1 バリデーション項目

```typescript
interface ValidationResult {
  syntax: boolean;      // JSON構文
  requiredFields: boolean; // 必須フィールド
  dataTypes: boolean;   // データ型
  dateFormats: boolean; // 日付フォーマット
  references: boolean;  // 相互参照
  sanmeigaku: boolean;  // 算命学整合性
}

function validateJSON(json: any): ValidationResult {
  return {
    syntax: checkSyntax(json),
    requiredFields: checkRequiredFields(json),
    dataTypes: checkDataTypes(json),
    dateFormats: checkDateFormats(json),
    references: checkReferences(json),
    sanmeigaku: checkSanmeigaku(json)
  };
}
```

### 4.2 必須フィールドチェック

```typescript
const REQUIRED_FIELDS = {
  series: ['title', 'total_episodes', 'format'],
  character: ['id', 'name', 'age', 'birth_date'],
  episode: ['episode_number', 'title', 'patient', 'fortune'],
  patient: ['name', 'age', 'birth_date', 'occupation'],
  fortune: ['nikkan', 'tenchusatsu', 'center_star', 'twelve_stars']
};
```

### 4.3 算命学整合性チェック

```typescript
function checkSanmeigaku(json: any): boolean {
  for (const episode of json.episodes) {
    const patient = episode.patient;
    if (!patient.birth_date) continue;

    const kanshi = calculateKanshi(new Date(patient.birth_date));
    const fortune = episode.fortune;

    // 日干の一致
    if (kanshi.bazi.day.stemStr !== fortune.nikkan) {
      console.error(`Episode ${episode.episode_number}: Nikkan mismatch`);
      return false;
    }

    // 天中殺の一致
    if (kanshi.insen.tenchusatsu.type !== fortune.tenchusatsu) {
      console.error(`Episode ${episode.episode_number}: Tenchusatsu mismatch`);
      return false;
    }
  }
  return true;
}
```

---

## Phase 5: 統計情報付与

### 5.1 メタデータ構造

```json
{
  "_metadata": {
    "version": "2.0",
    "created_date": "2026-02-09",
    "total_characters": 97,
    "main_characters": 5,
    "patient_characters": 92,
    "age_distribution": {
      "10s": 15,
      "20s": 25,
      "30s": 30,
      "40s": 20,
      "50s": 7
    },
    "occupation_count": 45,
    "sanmeigaku_stats": {
      "nikkan_distribution": {
        "甲": 10, "乙": 9, "丙": 8, "丁": 11, "戊": 9,
        "己": 10, "庚": 12, "辛": 8, "壬": 10, "癸": 9
      },
      "tenchusatsu_distribution": {
        "戌亥": 15, "申酉": 18, "午未": 16,
        "辰巳": 17, "寅卯": 15, "子丑": 15
      },
      "center_star_distribution": {
        "貫索星": 18, "石門星": 15, "鳳閣星": 16,
        "調舒星": 17, "禄存星": 16, "司禄星": 14,
        "車騎星": 15, "牽牛星": 16, "龍高星": 17, "玉堂星": 16
      }
    }
  }
}
```

### 5.2 統計計算関数

```typescript
function generateMetadata(json: any): Metadata {
  const patients = json.characters.patients;

  return {
    version: "2.0",
    created_date: new Date().toISOString().split('T')[0],
    total_characters: 1 + patients.length, // +1 for meguru
    main_characters: json.characters.main.length,
    patient_characters: patients.length,
    age_distribution: calculateAgeDistribution(patients),
    occupation_count: countUniqueOccupations(patients),
    sanmeigaku_stats: calculateSanmeigakuStats(patients)
  };
}
```

---

## Phase 6: 最終出力＆変更履歴作成

### 6.1 出力ファイル

```bash
# メインファイル
/Users/kitamuratatsuhiko/UIanimated/meguri-96episodes-v2.json

# バックアップ
/Users/kitamuratatsuhiko/UIanimated/meguri-96episodes-final-backup.json

# 変更履歴
/Users/kitamuratatsuhiko/UIanimated/claudedocs/JSON-MIGRATION-LOG.md
```

### 6.2 JSON-MIGRATION-LOG.md テンプレート

```markdown
# JSON移行履歴

## 変更概要
- 元ファイル: meguri-96episodes-final.json
- 新ファイル: meguri-96episodes-v2.json
- 変更日: 2026-02-09
- 変更理由: 算命学的整合性の修正とキャラクターデータの更新

## 主要な変更点

### キャラクター更新
| キャラクター | 項目 | 旧値 | 新値 | 理由 |
|-------------|------|------|------|------|
| 九条巡 | 年齢 | 26歳 | 34歳 | 物語整合性 |
| 九条巡 | 生年月日 | 1991-03-07 | 1991-09-30 | 算命学的矛盾解消 |
| 一条慧 | 追加 | - | 32歳 | ライバルキャラクター追加 |

### エピソード更新
- 全96話分の患者データを追加・更新
- 全キャラクターの命式を calculateKanshi() で再計算
- 日干・天中殺・十大主星の整合性を確認

### 算命学的整合性
- ✅ 全キャラクターの命式を calculateKanshi() で検証
- ✅ 日干・天中殺・十大主星の整合性を確認
- ✅ 五行バランス・総エネルギー点数を計算

## 検証結果
- ✅ JSON構文チェック
- ✅ 必須フィールド確認
- ✅ データ型検証
- ✅ 日付フォーマット統一
- ✅ 算命学整合性検証

## 統計情報
- 総キャラクター数: 97名
- メインキャラクター: 5名
- 患者キャラクター: 92名
- 職種数: 45種
- 年齢分布: 10代(15) 20代(25) 30代(30) 40代(20) 50代(7)

## 次のステップ
1. meguri-96episodes-v2.json を本番データとして採用
2. meguri-96episodes-final.json はバックアップとして保存
3. manga/ スクリプト等の関連ファイルも更新予定
4. mobile/ アプリのテストデータも更新予定

## 変更履歴
- 2026-02-09: v2.0 初版作成
```

---

## 実行スクリプト準備

### integration-script.ts

```typescript
#!/usr/bin/env npx tsx

import fs from 'fs';
import { calculateKanshi } from '../mobile/lib/logic';

const MAIN_JSON = '/Users/kitamuratatsuhiko/UIanimated/meguri-96episodes-final.json';
const OUTPUT_V2 = '/Users/kitamuratatsuhiko/UIanimated/meguri-96episodes-v2.json';
const BACKUP = '/Users/kitamuratatsuhiko/UIanimated/meguri-96episodes-final-backup.json';

async function integrate() {
  console.log('Starting JSON integration...');

  // Phase 1: Load existing data
  console.log('Phase 1: Loading existing JSON...');
  const existing = JSON.parse(fs.readFileSync(MAIN_JSON, 'utf-8'));

  // Phase 2: Load block data (when ready)
  console.log('Phase 2: Waiting for block data...');
  // TODO: Load EPISODES-*-CHARACTERS.json files

  // Phase 3: Merge data
  console.log('Phase 3: Merging character data...');
  // TODO: Merge main characters and patients

  // Phase 4: Recalculate sanmeigaku
  console.log('Phase 4: Recalculating sanmeigaku data...');
  // TODO: Run calculateKanshi() for all characters

  // Phase 5: Validate
  console.log('Phase 5: Validating JSON...');
  // TODO: Run validation checks

  // Phase 6: Generate metadata
  console.log('Phase 6: Generating metadata...');
  // TODO: Calculate statistics

  // Phase 7: Output
  console.log('Phase 7: Writing output files...');
  // TODO: Write v2, backup, and migration log

  console.log('Integration complete!');
}

integrate().catch(console.error);
```

---

## タスク完了条件チェックリスト

- [ ] 全4ブロックのキャラクターデータが揃っている
- [ ] 検証チームによる整合性確認が完了している
- [ ] メインキャラクター（九条巡・一条慧等）のデータ更新完了
- [ ] 全96話分の患者データ統合完了
- [ ] 算命学データ（calculateKanshi()）の再計算完了
- [ ] JSONバリデーション（構文・必須フィールド・データ型）完了
- [ ] 統計情報の付与完了
- [ ] meguri-96episodes-v2.json の出力完了
- [ ] バックアップファイルの作成完了
- [ ] JSON-MIGRATION-LOG.md の作成完了

---

## 次のアクション

1. **待機**: 他チームの作業完了を待つ
2. **監視**: 5分間隔でファイルの有無をチェック
3. **準備**: 統合スクリプトの最終調整
4. **実行**: 全データ揃い次第、統合プロセスを開始

---

**作成者**: 統合JSON生成チーム
**ステータス**: 準備完了 - 他チーム待機中
**最終更新**: 2026-02-09
