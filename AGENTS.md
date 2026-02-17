---
agents:
  - name: StoryReviewer
    role: ストーリー整合性レビュアー
    description: 算命学の制約とストーリーの理論的一貫性をチェック
    instructions: |
      1. novel-critique スキル (review-all) を使用した文学的モードの品質チェック
      2. 算命学ツール (sanmei-with-energy-cli) を使用した命式の検証
      3. novel/ 配下の STORYLINE v3 と DASHBOARD の同期チェック
  - name: CodeReviewer
    role: 技術スタックレビュアー
    description: Next.js 15, Tailwind v4 等の最新技術スタックに準拠しているか確認
    instructions: |
      1. nextjs.org/docs/llms.txt の最新プラクティスとの照合
      2. beads (bd) ワークフローの遵守確認
---

# UIanimated — Agent Quick Reference

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## 🚀 Quick Start

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## 📁 Project Structure (3 Pillars)

| Pillar | Path | Purpose |
|--------|------|---------|
| **Story** | `novel/` | 小説の正典（SSoT） |
| **Dashboard** | `src/app/dashboard/` | Turso管理者ダッシュボード |
| **Tools** | `tools/` | CLI計算・検証ツール |

## 🔴 必読ドキュメント（優先順位）

1. **`MANIFEST.json`** — プロジェクトの SSoT(Single Source of Truth) マップ
2. **`novel/settings/NOVEL-WRITING-AI-PROMPT-DESIGN.md`** — AIプロンプト設計書（※新規）
3. **`novel/settings/CHARACTER-DESIGN-MANUAL.md`** — キャラクター設計マニュアル
4. **`claudedocs/active/`** — 現在参照中の設定ドキュメント

## 📖 ドキュメントルール

- `novel/` が正典 — 矛盾がある場合、novel/ が正しい
- `claudedocs/legacy/` は読み取り専用
- 新規ドキュメントは `novel/settings/` 配下に作成
- ファイル作成前に `bd create` で issue を作成

## 👥 主要キャラクター

| キャラクター | 生年月日 | 性別 | 日柱 | エネルギー |
|------------|---------|------|------|-----------|
| 九条 巡 | 1990-03-02 | 男性 | 丙寅 | 267点 |
| 藤堂 慧 | 1990-05-25 | 男性 | 庚寅 | 255点 |
| 九条 さくら | 1925-07-30 | 女性 | 乙卯 | 204点 |
| 高橋 美咲 | 1999-05-03 | 女性 | 乙卯 | 196点 |

### 大運ルール（絶対遵守）
- 男性: 陽年干 → 順行、陰年干 → 逆行
- 女性: 陰年干 → 順行、陽年干 → 逆行
- ❌ 「女性はすべて逆行」は間違い

## 🛠️ 算命学ツール

```bash
# 基本CLI
npx tsx tools/sanmei-with-energy-cli.ts <YYYY-MM-DD> <male|female>

# ストーリー整合性検証
npx tsx tools/verify-storyline.ts
```

詳細: `tools/sanmei-cli-README.md`

## 🖋️ 小説執筆・批評スキル

AIによる執筆と批評は、以下のスキルを使用して行います。

```bash
# 執筆 (Somatic/Logic/Tapestryモードを指定)
# 例: "Somatic Modeで、巡の回想シーンを書いて"
novel-writing-technique write-scene --mode somatic

# 批評 (生成されたテキストの品質チェック)
# 例: "このシーンの身体的描写をチェックして"
novel-critique review-sensibility
```

## 📘 NotebookLM (知識ベース)

複雑な算命学のルールや陰陽五行の理論背景を確認するために、NotebookLM MCP (`nlm`) を使用します。

### 主要ノートブック ID
- **陰陽五行**: `5c1dd305-31f4-4ff3-833a-e749ba10c665`

### 使用例
```bash
# 特定のトピックについて質問する
nlm query "大運の順行・逆行の決定ルールは？" --notebook 5c1dd305-31f4-4ff3-833a-e749ba10c665

# ノートブック内のソースを確認
nlm notebook sources 5c1dd305-31f4-4ff3-833a-e749ba10c665
```


## 🧪 検証プロセス

### 朱学院検証（命式データ）
1. スクリーンショットを取得（目視確認禁止）
2. DOM抽出と照合
3. 詳細: `.claude/skills/SHUGAKUIN-VERIFICATION.md`

### ストーリー検証
- `npx tsx tools/verify-storyline.ts` で16項目チェック
- PR時に自動実行（`.github/workflows/story-review.yml`）

## ✅ Landing the Plane

**セッション終了時の必須ワークフロー:**

1. 残タスクを `bd create` で issue 化
2. issue ステータス更新 (`bd close` / `bd update`)
3. **PUSH TO REMOTE** (必須):
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # "up to date" を確認
   ```
4. 次セッションへの引き継ぎコメント

**CRITICAL**: `git push` が成功するまで作業完了ではない。
