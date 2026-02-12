# Novel & Story Data (SSoT)

ここはプロジェクトの**正典 (Single Source of Truth)** です。
ストーリーに関する全ての情報はここに集約されます。

## ディレクトリ構成

- **`storyline-v3.md`**: マスターストーリーライン
- **`characters/`**: キャラクターデータ（JSON/MD）
- **`settings/`**: 世界観・家族背景・命式・キャラクターデザイン
- **`sakura-teachings/`**: さくらの教えエピソード集
- **`dashboards/`**: 自動生成/管理用ダッシュボード

## ルール

1. **新規ドキュメントはここに作る**: `claudedocs/` ではなく、この `novel/` 配下の適切なフォルダに作成してください。
2. **整合性維持**: ここを変更したら、必ず `npx tsx ../tools/verify-storyline.ts` を実行してください。

