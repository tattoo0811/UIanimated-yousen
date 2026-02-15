---
description: ストーリーファイルの変更をブランチで管理し、整合性チェックを経てマージするワークフロー
---

# ストーリーブランチ運用ワークフロー

## ブランチ命名規則

```
story/<変更タイプ>-<内容>
```

例:
- `story/add-sakura-flashback-ep40`
- `story/fix-meishiki-meguru`
- `story/update-dashboard-sync`
- `story/ep11-20-characters`

## 変更手順

### 1. ブランチ作成
// turbo
```bash
git checkout -b story/<変更内容> main
```

### 2. ストーリーファイルを編集

対象ファイル:
- `meguru-storyline-v3.md` — マスターストーリー
- `120-EPISODE-DASHBOARD.md` — ダッシュボード（v3と常に同期）
- `claudedocs/STORYLINE-VERIFICATION-PROMPT.md` — 検証プロンプト
- `claudedocs/EPISODES-*-CHARACTERS.json` — キャラクターデータ

### 3. ローカル検証
// turbo
```bash
npx tsx tools/verify-storyline.ts
```

❌ が出たら修正してから次へ進む。

### 4. コミット & プッシュ
```bash
git add -A
git commit -m "story: <変更内容の説明>"
git push -u origin story/<変更内容>
```

### 5. PR 作成

GitHub で PR を作成。自動で以下が実行される:
- `verify-storyline.ts` による整合性チェック
- 結果が PR コメントに投稿される
- 将来: Claude によるレビューコメント

### 6. マージ

全チェックが ✅ になったらマージ。

## 注意事項

- **v3 がマスター**: DASHBOARD や VERIFICATION-PROMPT を単独で変更しない
- **v3 を変更したら DASHBOARD も同時に変更する**
- **命式は日柱（sanmei-with-energy-cli 計算結果）を使う**。年柱を命式として記載しない
- **回想シーンの追加/削除時**: ヘッダー分布表・詳細テーブル・本文の3箇所を同時更新
