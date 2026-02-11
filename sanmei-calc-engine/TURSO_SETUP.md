# Turso データベースセットアップ手順

## 概要

キャラクター算命学データベースを Turso (SQLite ベースの edge データベース) にセットアップする手順です。

## 前提条件

- Node.js 18+ がインストールされていること
- Turso アカウントを作成済みであること
- Turso CLI がインストールされていること

### Turso CLI のインストール

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# または Homebrew
brew install tursodb/turso/turso

# インストール確認
turso version
```

### Turso へのログイン

```bash
turso auth login
```

## データベースの作成

### 1. 新規データベースの作成

```bash
# データベース作成
turso db create sanmei-fortune --location nrt

# ※ --location オプションで最も近いリージョンを指定
# nrt: 東京, iad: バージニア, fra: フランクフルト など
```

### 2. データベース情報の確認

```bash
# データベース一覧
turso db list

# データベース情報
turso db show sanmei-fortune
```

## スキーマの適用

### 1. スキーマファイルの適用

```bash
# schema.sql を適用
turso db execute sanmei-fortune --file schema.sql

# または、Turso シェルを使用
turso db shell sanmei-fortune
> read schema.sql
> .quit
```

### 2. テーブルの確認

```bash
# テーブル一覧
turso db shell sanmei-fortune
> .tables

# スキーマ確認
> .schema yinyang
> .quit
```

## アクセス管理

### 1. データベース URL の取得

```bash
# データベース URL を表示（環境変数に設定）
turso db create sanmei-fortune --url > .env

# または既存のデータベース URL を取得
turso db show sanmei-fortune --url
```

出力例:
```
libsql://xxxxx@xxxxx.turso.io
```

### 2. アクセストークンの作成

```bash
# 読み取り専用トークン（アプリケーション用）
turso db tokens create sanmei-fortune --read-only

# 読み書きトークン（管理用）
turso db tokens create sanmei-fortune
```

### 3. 環境変数の設定

`.env` ファイルを作成:

```bash
# .env
TURSO_DATABASE_URL="libsql://xxxxx@xxxxx.turso.io"
TURSO_AUTH_TOKEN="xxxxxxxxxxxxx"
```

または、コマンドラインから設定:

```bash
export TURSO_DATABASE_URL="libsql://xxxxx@xxxxx.turso.io"
export TURSO_AUTH_TOKEN="xxxxxxxxxxxxx"
```

## Node.js / TypeScript からの接続

### 1. パッケージのインストール

```bash
npm install @libsql/client
# または
pnpm add @libsql/client
# または
yarn add @libsql/client
```

### 2. 接続設定

```typescript
// src/db/index.ts
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const turso = createClient({
  url,
  authToken,
});

// テスト接続
export async function testConnection() {
  const result = await turso.execute('SELECT 1 AS test');
  console.log('Database connection successful:', result);
}
```

### 3. 基本的なクエリ例

```typescript
// キャラクターの取得
async function getCharacter(characterId: string) {
  const result = await turso.execute({
    sql: 'SELECT * FROM v_character_birth WHERE character_id = ?',
    args: [characterId]
  });
  return result.rows[0];
}

// 陰陽占データの取得
async function getFortuneData(birthId: string) {
  const result = await turso.execute({
    sql: 'SELECT * FROM v_character_complete_fortune WHERE character_id IN (SELECT character_id FROM characters WHERE birth_id = ?)',
    args: [birthId]
  });
  return result.rows[0];
}

// 新しいキャラクターの追加
async function addCharacter(data: {
  characterId: string;
  name: string;
  gender: 'male' | 'female';
  birthId: string;
  description?: string;
}) {
  await turso.execute({
    sql: `
      INSERT INTO characters (character_id, name, gender, birth_id, description)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [data.characterId, data.name, data.gender, data.birthId, data.description ?? null]
  });
}

// 照合結果の記録
async function recordVerification(data: {
  verificationId: string;
  birthId: string;
  verificationSource: string;
  overallStatus: 'verified' | 'partial' | 'discrepancy' | 'error';
  verifiedData: Record<string, unknown>;
}) {
  await turso.execute({
    sql: `
      INSERT INTO verification (
        verification_id, birth_id, verification_source,
        verification_date, overall_status, verified_year_pillar,
        verified_month_pillar, verified_day_pillar, verified_hour_pillar,
        verified_tenchusatsu, verified_head_star, verified_chest_star
      ) VALUES (?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.verificationId,
      data.birthId,
      data.verificationSource,
      data.overallStatus,
      data.verifiedData.year_pillar,
      data.verifiedData.month_pillar,
      data.verifiedData.day_pillar,
      data.verifiedData.hour_pillar,
      data.verifiedData.tenchusatsu,
      data.verifiedData.head_star,
      data.verifiedData.chest_star
    ]
  });
}

// 年表イベントの取得
async function getTimeline(characterId: string) {
  const result = await turso.execute({
    sql: `
      SELECT * FROM timeline
      WHERE character_id = ?
      ORDER BY start_age ASC
    `,
    args: [characterId]
  });
  return result.rows;
}

// 大運サイクルの取得
async function getDayunCycles(birthId: string) {
  const result = await turso.execute({
    sql: `
      SELECT * FROM dayun
      WHERE birth_id = ?
      ORDER BY cycle_number ASC
    `,
    args: [birthId]
  });
  return result.rows;
}
```

## データのインポート

### 既存の JSON データからのインポート

```bash
# scripts/import-data.ts
import { turso } from '../src/db';
import birthdata from '../beads/astrology/birthdata.json';
import destinyMap from '../beads/astrology/destiny_map.json';

async function importBirthdata() {
  for (const birth of birthdata.births) {
    await turso.execute({
      sql: `
        INSERT INTO birthdata (
          birth_id, calendar, birth_date, birth_time, timezone,
          location, latitude, longitude, sex, source, immutable
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(birth_id) DO UPDATE SET
          calendar = excluded.calendar,
          birth_date = excluded.birth_date,
          birth_time = excluded.birth_time
      `,
      args: [
        birth.birth_id,
        birth.calendar,
        birth.date,
        birth.time,
        birth.timezone,
        birth.location,
        birth.latitude,
        birth.longitude,
        birth.sex,
        birth.source,
        birth.immutable ? 1 : 0
      ]
    });
  }
  console.log('Birthdata imported successfully');
}

async function importDestinyMap() {
  for (const destiny of destinyMap.destinies) {
    const { four_pillars, day_master, yangsen, five_elements_balance, ...rest } = destiny;

    // 陰占データのインポート
    await turso.execute({
      sql: `
        INSERT INTO yinyang (
          yinyang_id, birth_id, system,
          year_pillar, year_stem, year_branch,
          month_pillar, month_stem, month_branch,
          day_pillar, day_stem, day_branch,
          hour_pillar, hour_stem, hour_branch,
          day_master_stem, day_master_yinyang, day_master_element,
          tenchusatsu,
          five_wood, five_fire, five_earth, five_metal, five_water
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(birth_id) DO UPDATE SET
          year_pillar = excluded.year_pillar,
          day_master_stem = excluded.day_master_stem
      `,
      args: [
        `Y_${rest.birth_id}`,
        rest.birth_id,
        rest.system,
        four_pillars.year.pillar,
        four_pillars.year.stem,
        four_pillars.year.branch,
        four_pillars.month.pillar,
        four_pillars.month.stem,
        four_pillars.month.branch,
        four_pillars.day.pillar,
        four_pillars.day.stem,
        four_pillars.day.branch,
        four_pillars.hour.pillar,
        four_pillars.hour.stem,
        four_pillars.hour.branch,
        day_master.stem,
        day_master.yin_yang,
        day_master.element,
        rest.tenchusatsu,
        five_elements_balance.wood,
        five_elements_balance.fire,
        five_elements_balance.earth,
        five_elements_balance.metal,
        five_elements_balance.water
      ]
    });

    // 陽占データのインポート
    await turso.execute({
      sql: `
        INSERT INTO yangsen (
          yangsen_id, birth_id, system,
          head_star, chest_star, belly_star,
          left_hand_star, right_hand_star,
          left_shoulder_star, left_shoulder_score,
          right_leg_star, right_leg_score,
          left_leg_star, left_leg_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(birth_id) DO UPDATE SET
          head_star = excluded.head_star,
          chest_star = excluded.chest_star
      `,
      args: [
        `YS_${rest.birth_id}`,
        rest.birth_id,
        'sanmeigaku',
        yangsen.head,
        yangsen.chest,
        yangsen.belly,
        yangsen.left_hand,
        yangsen.right_hand,
        yangsen.left_shoulder.name,
        yangsen.left_shoulder.score,
        yangsen.right_leg.name,
        yangsen.right_leg.score,
        yangsen.left_leg.name,
        yangsen.left_leg.score
      ]
    });
  }
  console.log('Destiny map imported successfully');
}

async function main() {
  await importBirthdata();
  await importDestinyMap();
  process.exit(0);
}

main().catch(console.error);
```

## データのエクスポート

```bash
# データベース全体のダンプ
turso db dump sanmei-fortune > backup.sql

# 特定のテーブルのみエクスポート
turso db shell sanmei-fortune
> .output characters.csv
> .mode csv
> SELECT * FROM characters;
> .quit
```

## ベストプラクティス

### 1. 接続プーリング

```typescript
// src/db/index.ts
import { createClient } from '@libsql/client';

let client: ReturnType<typeof createClient> | null = null;

export function getTursoClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}
```

### 2. トランザクション処理

```typescript
async function addCharacterWithBirthdata(data: {
  character: CharacterData;
  birthdata: BirthData;
}) {
  await turso.batch([
    {
      sql: 'INSERT INTO birthdata (...) VALUES (...)',
      args: [data.birthdata]
    },
    {
      sql: 'INSERT INTO characters (...) VALUES (...)',
      args: [data.character]
    }
  ]);
}
```

### 3. エラーハンドリング

```typescript
import { DatabaseError } from '@libsql/client';

try {
  await turso.execute({ sql: '...', args: [] });
} catch (error) {
  if (error instanceof DatabaseError) {
    console.error('Database error:', error.message);
    // 適切なエラーハンドリング
  }
}
```

### 4. 環境別設定

```typescript
// .env.development
TURSO_DATABASE_URL="file:local-dev.db"
TURSO_AUTH_TOKEN=""

// .env.production
TURSO_DATABASE_URL="libsql://xxxxx@xxxxx.turso.io"
TURSO_AUTH_TOKEN="xxxxxxxxxxxxx"
```

## 運用管理

### データベースの統計情報

```bash
# データベースサイズの確認
turso db inspect sanmei-fortune

# クエリの実行統計
turso db shell sanmei-fortune
> SELECT * FROM v_verification_summary;
```

### バックアップ

```bash
# 定期的なダンプ作成
turso db dump sanmei-fortune > backups/sanmei-fortune-$(date +%Y%m%d).sql
```

### ログの確認

```bash
# Turso ダッシュボードでログ確認
# https://dashboard.turso.tech
```

## トラブルシューティング

### 接続エラー

```bash
# 環境変数の確認
echo $TURSO_DATABASE_URL
echo $TURSO_AUTH_TOKEN

# データベースの存在確認
turso db list
```

### スキーマエラー

```bash
# スキーマの再適用
turso db shell sanmei-fortune
> DROP TABLE IF EXISTS characters;
> .read schema.sql
```

### パフォーマンスの問題

```bash
# インデックスの確認
turso db shell sanmei-fortune
> .indexes

# クエリプランの確認
> EXPLAIN QUERY PLAN SELECT * FROM v_character_complete_fortune WHERE character_id = 'C001';
```

## 参考リンク

- [Turso 公式ドキュメント](https://docs.turso.tech/)
- [@libsql/client npm](https://www.npmjs.com/package/@libsql/client)
- [SQLite ドキュメント](https://www.sqlite.org/docs.html)
