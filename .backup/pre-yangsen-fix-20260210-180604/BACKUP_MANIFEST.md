# Backup Manifest: 十大主星ロジック修正前

**バックアップ日時**: 2026-02-10 18:09:04
**目的**: 十大主星ロジック修正前の安全確保

## バックアップ対象ファイル

### Logic Files
- `logic/mobile-yangsen.ts` - mobile版十大主星ロジック
- `logic/accurate-yangsen.ts` - accurate-logic版十大主星ロジック
- `logic/accurate-bazi.ts` - accurate-logic版四柱推命ロジック

### Astrology JSON Files
- `astrology/birthdata.json` - 誕生日データ
- `astrology/constraints.json` - 制約条件データ
- `astrology/destiny_map.json` - 運命マップデータ

### Verification Docs
- `docs/60kanshi-verification-report.md` - 60干支検証レポート
- `docs/shugakuin-verification-report.md` - 粛学院検証レポート
- `docs/sakura-destiny-verification.md` - 桜運命検証

## バックアップ場所
```
/Users/kitamuratatsuhiko/UIanimated/.backup/pre-yangsen-fix-20260210-180604/
```

## 復元手順

必要に応じて以下のコマンドで復元:

```bash
# Logic files
cp .backup/pre-yangsen-fix-20260210-180604/logic/mobile-yangsen.ts mobile/lib/logic/yangsen.ts
cp .backup/pre-yangsen-fix-20260210-180604/logic/accurate-yangsen.ts accurate-logic/src/yangsen.ts
cp .backup/pre-yangsen-fix-20260210-180604/logic/accurate-bazi.ts accurate-logic/src/bazi.ts

# Astrology JSON files
cp .backup/pre-yangsen-fix-20260210-180604/astrology/*.json beads/astrology/

# Verification docs
cp .backup/pre-yangsen-fix-20260210-180604/docs/*verification*.md claudedocs/
```

## 安全確認

✅ 全てのファイルが正常にコピーされました
✅ ファイル整合性: 完了
✅ バックアップ完了: 2026-02-10 18:09:04
