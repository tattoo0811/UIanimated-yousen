# Backup History

## 2026-02-10 18:09:04 - 十大主星ロジック修正前バックアップ

**バックアップID**: `pre-yangsen-fix-20260210-180604`
**目的**: 十大主星ロジック修正前の安全確保

### アーカイブ情報
- **ファイル**: `pre-yangsen-fix-20260210-180604.tar.gz`
- **サイズ**: 13KB
- **SHA256**: `1836c36024151819a08b9251fb1711710ec6ddddbc5386dd5bc4146734076d9f`

### バックアップ内容

#### Logic Files (3 files)
- mobile版十大主星ロジック (9.5KB)
- accurate-logic版十大主星ロジック (11KB)
- accurate-logic版四柱推命ロジック (3.0KB)

#### Astrology Data (3 JSON files)
- birthdata.json (1.9KB)
- constraints.json (4.7KB)
- destiny_map.json (8.6KB)

#### Verification Docs (3 files)
- 60干支検証レポート
- 粛学院検証レポート
- 桜運命検証

### 復元コマンド

```bash
# アーカイブの展開
cd /Users/kitamuratatsuhiko/UIanimated
tar -xzf .backup/pre-yangsen-fix-20260210-180604.tar.gz -C .backup/

# ファイルの復元
cp .backup/pre-yangsen-fix-20260210-180604/logic/mobile-yangsen.ts mobile/lib/logic/yangsen.ts
cp .backup/pre-yangsen-fix-20260210-180604/logic/accurate-yangsen.ts accurate-logic/src/yangsen.ts
cp .backup/pre-yangsen-fix-20260210-180604/logic/accurate-bazi.ts accurate-logic/src/bazi.ts
cp .backup/pre-yangsen-fix-20260210-180604/astrology/*.json beads/astrology/
cp .backup/pre-yangsen-fix-20260210-180604/docs/*verification*.md claudedocs/
```

### 整合性確認
✅ 全9ファイルが正常にバックアップされました
✅ 圧縮アーカイブ作成完了
✅ SHA256チェックサム記録完了

---

*このバックアップは十大主星ロジック修正作業の前に作成されました*
