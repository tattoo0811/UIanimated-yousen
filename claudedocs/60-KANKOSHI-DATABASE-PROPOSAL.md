# 六十花甲子データベース turso連携提案

> **作成日**: 2026年2月11日
> **バージョン**: 1.0.0
> **ステータス**: 提案

---

## 概要

めぐり物語プロジェクトにおける六十花甲子（60干支）データの管理方法と、tursoデータベース連携の可能性について提案します。

---

## 現状のデータ構造

### 既存のJSONファイル

| ファイル | パス | 内容 | サイズ |
|---------|------|------|--------|
| **60kanshi-elements.json** | jsons/ | 60干支の元素属性 | 3.4KB |
| **kanshi_features.json** | jsons/ | 各干支の特性・業データ | 約70KB |
| **kanshi_patterns.json** | jsons/ | 各干支の概念・キャラクター名 | 約40KB |

### データの重複と整合性

現在、60干支に関するデータが複数のJSONファイルに分散しています。

- **重複**: 同じ干支データが複数ファイルに存在
- **整合性リスク**: 更新時に複数ファイルを同期する必要がある
- **検索の非効率**: 特定条件での検索が困難

---

## 提案1: 統合JSONファイルの作成（推奨）

### 方針

既存の3つのJSONファイルを統合し、単一のソースオブトゥルースを作成します。

### スキーマ案

```json
{
  "metadata": {
    "version": "1.0.0",
    "last_updated": "2026-02-11",
    "total_count": 60,
    "source": "kanshi_features.json + kanshi_patterns.json + 60kanshi-elements.json"
  },
  "kanshi": [
    {
      "id": 1,
      "no": 1,
      "kanshi": "甲子",
      "reading": "きのえね",
      "stem": "甲",
      "branch": "子",
      "element": "wood",
      "primary_element": "木",
      "secondary_element": "水",
      "tenchusatsu_group": 1,
      "tenchusatsu": "なし",
      "character_name": "水辺の賢者",
      "concept": "流転する水面に立つ孤独な神木...",
      "features": [
        {
          "feature_type": "karma",
          "feature_name": "不族の業",
          "description": "「不族の業」を発動し...",
          "category": "general"
        },
        {
          "feature_type": "star",
          "feature_name": "天恍星",
          "description": "「天恍星」の奔放なエネルギー...",
          "category": "general"
        }
      ]
    }
  ]
}
```

### メリット

- ✅ 単一のデータソースによる整合性の確保
- ✅ JSONとしての軽量さと可読性の維持
- ✅ 既存システムとの互換性
- ✅ TypeScriptでの型定義が容易

### デメリット

- ❌ 大規模データの検索には不向き（60件程度では問題なし）
- ❌ 複雑なクエリ（結合、集計など）には不向き

---

## 提案2: tursoデータベースの活用（将来検討）

### 方針

turso（LibSQL）を使用したリレーショナルデータベースを構築します。

### スキーマ案

```sql
-- 干支マスタ
CREATE TABLE kanshi (
    id INTEGER PRIMARY KEY,
    kanshi_number INTEGER UNIQUE NOT NULL,
    kanshi TEXT NOT NULL UNIQUE,
    reading TEXT NOT NULL,
    stem TEXT NOT NULL,
    branch TEXT NOT NULL,
    element TEXT NOT NULL,
    tenchusatsu_group INTEGER NOT NULL,
    tenchusatsu TEXT NOT NULL,
    character_name TEXT NOT NULL,
    concept TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 干支特性テーブル
CREATE TABLE kanshi_features (
    id INTEGER PRIMARY KEY,
    kanshi_id INTEGER NOT NULL,
    feature_type TEXT NOT NULL,
    feature_name TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    FOREIGN KEY (kanshi_id) REFERENCES kanshi(id)
);

-- 索引
CREATE INDEX idx_kanshi_element ON kanshi(element);
CREATE INDEX idx_kanshi_tenchusatsu ON kanshi(tenchusatsu_group);
CREATE INDEX idx_kanshi_stem ON kanshi(stem);
CREATE INDEX idx_kanshi_branch ON kanshi(branch);
CREATE INDEX idx_features_type ON kanshi_features(feature_type);
CREATE INDEX idx_features_category ON kanshi_features(category);
```

### メリット

- ✅ 複雑なクエリ（結合、集計、フィルタリング）に対応
- ✅ 大規模データの検索に適している
- ✅ トランザクション処理によるデータ整合性の保証
- ✅ Webアプリからの直接アクセスが可能

### デメリット

- ❌ システムの複雑化
- ❌ インフラコストの発生
- ❌ 60件程度のデータではオーバースペック

---

## 提案3: ハイブリッド方式（推奨）

### 方針

- **静的データ**: 統合JSONファイルで管理
- **動的データ**: tursoで管理（ユーザー入力、診断結果など）

### 実装例

```typescript
// types/kanshi.ts
export interface Kanshi {
  id: number;
  kanshi_number: number;
  kanshi: string;
  reading: string;
  stem: string;
  branch: string;
  element: string;
  tenchusatsu_group: number;
  tenchusatsu: string;
  character_name: string;
  concept: string;
  features: KanshiFeature[];
}

export interface KanshiFeature {
  feature_type: 'karma' | 'star' | 'destiny' | 'personality';
  feature_name: string | null;
  description: string;
  category: string;
}

// lib/kanshi-db.ts
import { Kanshi } from '@/types/kanshi';
import kanshiData from '@/jsons/60kanshi-integrated.json';

export class KanshiDatabase {
  private data: Kanshi[];

  constructor() {
    this.data = kanshiData.kanshi;
  }

  // 基本検索
  findByNumber(no: number): Kanshi | undefined {
    return this.data.find(k => k.kanshi_number === no);
  }

  findByKanshi(kanshi: string): Kanshi | undefined {
    return this.data.find(k => k.kanshi === kanshi);
  }

  // フィルタリング
  filterByElement(element: string): Kanshi[] {
    return this.data.filter(k => k.element === element);
  }

  filterByTenchusatsu(group: number): Kanshi[] {
    return this.data.filter(k => k.tenchusatsu_group === group);
  }

  filterByStem(stem: string): Kanshi[] {
    return this.data.filter(k => k.stem === stem);
  }

  filterByBranch(branch: string): Kanshi[] {
    return this.data.filter(k => k.branch === branch);
  }

  // 複合条件検索
  find(options: {
    element?: string;
    tenchusatsu?: number;
    stem?: string;
    branch?: string;
    featureType?: string;
  }): Kanshi[] {
    return this.data.filter(k => {
      if (options.element && k.element !== options.element) return false;
      if (options.tenchusatsu && k.tenchusatsu_group !== options.tenchusatsu) return false;
      if (options.stem && k.stem !== options.stem) return false;
      if (options.branch && k.branch !== options.branch) return false;
      if (options.featureType && !k.features.some(f => f.feature_type === options.featureType)) return false;
      return true;
    });
  }

  // 全件取得
  getAll(): Kanshi[] {
    return this.data;
  }
}
```

---

## 推奨アクション

### 短期（2026年2月）

1. ✅ **統合JSONファイルの作成**
   - 既存の3つのJSONファイルを統合
   - 型定義（TypeScript）の作成
   - ユーティリティ関数の実装

2. ✅ **60-KANKOSHI-DATABASE.mdの作成**
   - 60干支の完全なドキュメント
   - エピソード対応表
   - 用語集

### 中期（2026年3月〜4月）

3. **Webアプリへの統合**
   - 干支検索機能の実装
   - 干支詳細表示ページ
   - エピソードとのリンク機能

4. **クエリ最適化**
   - 検索インデックスの作成（メモリ上）
   - キャッシュ機能の実装

### 長期（2026年5月以降）

5. **turso導入の検討**
   - ユーザー入力データの保存
   - 診断結果の履歴管理
   - アクセス分析

---

## 結論

現段階では**提案1（統合JSONファイル）**を採用し、データの一元化と整合性の確保を優先することを推奨します。60件程度のデータであれば、JSONファイルによる管理で十分なパフォーマンスが得られます。

将来、以下の条件が揃った段階でturso導入を検討してください：

- ユーザーが干支診断を保存する機能が必要になった
- 診断結果の履歴管理が必要になった
- アクセス分析や統計機能が必要になった
- データ件数が1000件を超えた

---

## 参考資料

- [Turso Documentation](https://docs.turso.tech/)
- [LibSQL](https://libsql.org/)
- [60-KANKOSHI-DATABASE.md](./60-KANKOSHI-DATABASE.md)
- [kanshi_features.json](../jsons/kanshi_features.json)
- [kanshi_patterns.json](../jsons/kanshi_patterns.json)
- [60kanshi-elements.json](../jsons/60kanshi-elements.json)

---

> **作成者**: Claude Code
> **プロジェクト**: めぐり物語
> **最終更新**: 2026年2月11日
