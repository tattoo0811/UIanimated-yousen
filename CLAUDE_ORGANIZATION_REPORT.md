# プロジェクト整理完了レポート

**実行日**: 2026-02-10  
**実行者**: Claude Code Assistant

## 整理概要

プロジェクト全体の整理を実施し、不要なファイルをアーカイブディレクトリに移動しました。

## アーカイブ構成

```
archive/
├── old-dirs-20260210/          # 古いディレクトリ（backup, drive-download-*等）
├── root-files-20260210/         # ルートディレクトリの一時ファイル
├── scripts-20260210/            # 重複scripts copy
├── scripts-temp-20260210/       # scripts/の一時検証・デバッグスクリプト
├── meguri-docs-20260210/        # メグリ関連ドキュメント
├── shohousen-docs-20260210/     # 処方箋関連ドキュメント
├── root-images-20260210/        # ルートディレクトリの画像ファイル
├── strategy-docs-20260210/      # 戦略ドキュメント
├── tmp-docs-20260210/           # .tmp/内のドキュメント（分類済み）
└── tmp-scripts-20260210/        # .tmp/内のスクリプトファイル
```

## 主な整理内容

### 1. ディレクトリ整理
- `scripts copy/` → `archive/scripts-20260210/scripts-copy/`
- `backup/` → `archive/old-dirs-20260210/`
- `"SELECT name FROM sqlite_master..."/` → `archive/old-dirs-20260210/sqlite-query-dir/`
- `drive-download-20251129T134637Z-1-001/` → `archive/old-dirs-20260210/`

### 2. scripts/ 整理
**保持したスクリプト**:
- `create-complete-html.js`
- `embed-prescriptions.js`
- `extract-prescriptions.js`
- `validate-prescriptions.ts`
- `generate-destiny-map.ts`
- `recalculate-all-characters.ts`
- `recalculate-episodes-1-24.ts`
- `migrate-to-beads.ts`
- 並列処理スクリプト群（ccm, parallel-*.sh, merge-safe.sh等）

**アーカイブしたスクリプト**（一時検証・デバッグ用）:
- analyze-*.ts
- calculate-*.ts
- check-*.ts
- compatibility-*.ts
- debug-*.ts
- search-*.ts
- test-*.ts
- verify-*.ts

### 3. .tmp/ 整理
- 全てのファイルをアーカイブに移動
- ドキュメントはカテゴリ別に分類（戦略、検証、キャラクター等）
- スクリプトファイルは別ディレクトリに整理
- ディレクトリ自体を削除（空になったため）

### 4. ルートディレクトリ整理
**残したファイル**:
- `AGENTS.md`
- `README.md`

**アーカイブしたファイル**:
- メグリ関連ドキュメント（meguri-*.md, meguri-*.html）
- 処方箋関連ドキュメント（shohousen-*.md, shohousen-*.html）
- 画面プロトタイプ（screen-*.html）
- 戦略ドキュメント（brand-strategy*.md, character-redesign.md等）
- 画像ファイル（*.png, *.jpeg）

## Git ステータス

- ステージングされたファイル数: **8,580ファイル**
- アーカイブディレクトリの合計サイズ: **48MB**
- プロジェクト全体のサイズ: **6.7GB**

## 削除対象ファイル（Git管理）

古いコンポーネントとロジックファイルが削除マーク（D）付きでステージングされています:

**削除されるコンポーネント**:
- `mobile/components/EditScreenInfo.tsx`
- `mobile/components/ExternalLink.tsx`
- `mobile/components/StyledText.tsx`
- `mobile/components/useClientOnlyValue.ts`
- `mobile/components/useClientOnlyValue.web.ts`
- `mobile/components/useColorScheme.ts`
- `mobile/components/useColorScheme.web.ts`

**削除されるロジックファイル**:
- `mobile/src/lib/cache.ts`
- `mobile/src/lib/logic/` ディレクトリ全体（bazi.ts, yangsen.ts等）
- `mobile/src/lib/monitoring.ts`
- `mobile/src/lib/notifications.ts`
- `mobile/src/lib/share.ts`
- `mobile/src/lib/storage/` ディレクトリ全体
- `mobile/src/lib/zodiac.ts`

## 注意事項

### 保持された重要データ
- **beads/** ディレクトリ: 削除していません
- **正しいロジック**: accurate-logic/, sanmei-calc-engine/ は保持

### 次のステップ
1. Gitコミットの実行（変更を確定）
2. アーカイブの必要に応じて外部ストレージへ移動
3. .gitignoreの更新（不要なファイルを除外）

## 整理効果

1. **プロジェクト構造の明確化**: ルートディレクトリがすっきり
2. **開発効率の向上**: 必要なスクリプトのみがscripts/に残る
3. **バージョン管理の改善**: 不要な一時ファイルが追跡対象から除外
4. **ディスク容量の最適化**: 48MBがアーカイブに移動

---
