# 統合JSON生成チーム - 運用マニュアル

**作成日**: 2026-02-09
**担当**: 統合JSON生成チーム
**ステータス**: 準備完了 - 他チームの作業待ち

---

## チーム概要

### 役割
4つのデザインチームと検証チームが作成したデータを統合し、最終的な `meguri-96episodes-v2.json` を生成します。

### タイムライン
- **準備期間**: 2026-02-09 ~ データ受信まで
- **統合期間**: データ受信後 ~ 2時間以内
- **検証期間**: 統合完了後 ~ 30分以内

---

## ディレクトリ構成

```
/Users/kitamuratatsuhiko/UIanimated/
├── .tmp/
│   ├── json-integration-plan.md          # 統合計画詳細
│   ├── integration-watcher.sh            # ファイル監視スクリプト
│   └── integration-script.ts             # 統合実行スクリプト
├── claudedocs/
│   ├── CHARACTER-DESIGN-MANUAL.md        # [待機] 設計方針
│   ├── EPISODES-001-024-CHARACTERS.json  # [待機] ブロック1
│   ├── EPISODES-025-048-CHARACTERS.json  # [待機] ブロック2
│   ├── EPISODES-049-072-CHARACTERS.json  # [待機] ブロック3
│   ├── EPISODES-073-096-CHARACTERS.json  # [待機] ブロック4
│   ├── SANMEIGAKU-VERIFICATION-REPORT.md # [待機] 検証報告
│   └── JSON-MIGRATION-LOG.md             # [出力] 移行ログ
├── meguri-96episodes-final.json          # 元ファイル
├── meguri-96episodes-v2.json             # [出力] 新ファイル
└── meguri-96episodes-final-backup.json   # [出力] バックアップ
```

---

## 作業フロー

### ステップ1: ファイル監視の開始

```bash
# ターミナルで監視スクリプトを実行
cd /Users/kitamuratatsuhiko/UIanimated
.tmp/integration-watcher.sh
```

**監視対象**:
- `claudedocs/EPISODES-*-CHARACTERS.json` (4ファイル)
- `claudedocs/SANMEIGAKU-VERIFICATION-REPORT.md`

**監視間隔**: 5分ごと

**完了通知**: 全ファイル揃った時点で通知音＋メッセージ

---

### ステップ2: データ受信確認

監視スクリプトが完了通知を出したら、以下を確認:

```bash
# ファイルの存在確認
ls -la claudedocs/EPISODES-*-CHARACTERS.json
ls -la claudedocs/SANMEIGAKU-VERIFICATION-REPORT.md

# ファイル数の確認（5ファイルであること）
ls claudedocs/EPISODES-*-CHARACTERS.json | wc -l
```

**期待する出力**:
```
5
```

---

### ステップ3: 検証報告の確認

検証チームの報告書を確認し、以下の項目をチェック:

```bash
# 検証報告を開く
cat claudedocs/SANMEIGAKU-VERIFICATION-REPORT.md
```

**確認項目**:
- ✅ 全キャラクターの算命学データが検証済み
- ✅ 日干・天中殺・十大主星の整合性確認済み
- ✅ 不整合データの修正済み
- ✅ 検証チームの「完了」マークがある

---

### ステップ4: 統合スクリプトの実行

**注意**: 全ての確認が終わってから実行してください。

```bash
# 統合スクリプトを実行
npx tsx .tmp/integration-script.ts
```

**実行内容**:
1. ファイル可用性チェック
2. 既存JSON読み込み
3. ブロックデータ読み込み
4. メインキャラクター更新
5. 患者キャラクター統合
6. 算命学データ再計算
7. JSONバリデーション
8. メタデータ生成
9. バックアップ作成
10. v2ファイル出力
11. 移行ログ作成

**期待する出力**:
```
[INFO] ========================================
[INFO] JSON Integration Script Started
[INFO] ========================================

[INFO] Phase 1: File Availability Check
[SUCCESS] All required files found

[INFO] Phase 2: Load Existing Data
[SUCCESS] Loaded 96 episodes

...

[SUCCESS] ========================================
[SUCCESS] Integration completed successfully!
[SUCCESS] ========================================
```

---

### ステップ5: 統合結果の検証

```bash
# v2ファイルのサイズ確認
ls -lh meguri-96episodes-v2.json

# JSON構文チェック
jq '.' meguri-96episodes-v2.json > /dev/null && echo "JSON is valid"

# エピソード数確認
jq '.episodes | length' meguri-96episodes-v2.json

# メタデータ確認
jq '._metadata' meguri-96episodes-v2.json
```

**期待する出力**:
```
JSON is valid
96
{
  "version": "2.0",
  "created_date": "2026-02-09",
  "total_characters": 97,
  ...
}
```

---

## トラブルシューティング

### 問題1: ファイルが揃わない

**症状**: 監視スクリプトが完了通知を出さない

**対策**:
1. 各チームの進捗を確認
2. 遅れているチームをサポート
3. 一部ファイルだけ先に統合するか検討

---

### 問題2: JSON構文エラー

**症状**: `jq` でパースエラー

**対策**:
```bash
# エラー箇所を特定
jq '.' meguri-96episodes-v2.json 2>&1 | head -20

# 該当行を確認
sed -n '100,110p' meguri-96episodes-v2.json
```

---

### 問題3: 算命学データの不整合

**症状**: 検証報告で不整合が見つかる

**対策**:
1. 該当キャラクターを特定
2. 再計算スクリプトを実行
3. 検証チームに再検証を依頼

---

## 成果物

### メインファイル
- **meguri-96episodes-v2.json**: 最終統合JSON

### バックアップファイル
- **meguri-96episodes-final-backup.json**: 元ファイルのバックアップ

### ドキュメント
- **JSON-MIGRATION-LOG.md**: 変更履歴と統計情報

---

## 品質チェックリスト

### データ整合性
- [ ] 全96話分のエピソードデータが含まれている
- [ ] メインキャラクターが正しく更新されている
- [ ] 患者キャラクターが重複なく統合されている
- [ ] 算命学データが calculateKanshi() で再計算されている

### JSON品質
- [ ] JSON構文が正しい
- [ ] 必須フィールドが欠けていない
- [ ] データ型が正しい（数値・文字列・配列等）
- [ ] 日付フォーマットが統一されている（YYYY-MM-DD）

### 算命学的整合性
- [ ] 全キャラクターの日干が正しい
- [ ] 全キャラクターの天中殺が正しい
- [ ] 十大主星・十二大従星が整合している
- [ ] 五行バランス・総エネルギー点数が計算されている

### ドキュメント
- [ ] 移行ログが作成されている
- [ ] 統計情報が正確である
- [ ] 変更点が明確に記載されている

---

## 次のステップ

統合完了後、以下のチームへ引き継ぎ:

1. **開発チーム**: v2ファイルを使用してアプリを更新
2. **漫画制作チーム**: キャラクターデータを漫画シナリオに反映
3. **テストチーム**: テストデータを更新

---

## 連絡先

- **チームリーダー**: 統合JSON生成チーム
- **作業場所**: `/Users/kitamuratatsuhiko/UIanimated`
- **ドキュメント**: `claudedocs/INTEGRATION-TEAM-MANUAL.md`

---

**最終更新**: 2026-02-09
**バージョン**: 1.0
