---
agents:
  - name: StoryReviewer
    role: ストーリー整合性レビュアー
    description: 算命学の制約とストーリーの理論的一貫性をチェックする専門エージェント
    instructions: |
      1. novel/ 配下の STORYLINE v3 と DASHBOARD の同期チェック
      2. 算命学ツール (sanmei-with-energy-cli) を使用した命式の検証
      3. 伏線 (foreshadow) の回収漏れチェック
  - name: CodeReviewer
    role: 技術スタックレビュアー
    description: Next.js 15, Tailwind v4 等の最新技術スタックに準拠しているか確認
    instructions: |
      1. nextjs.org/docs/llms.txt の最新プラクティスとの照合
      2. beads (bd) ワークフローの遵守確認
---

# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## 🔴 最初にMANIFEST.jsonを読め

`MANIFEST.json` がプロジェクトの SSoT(Single Source of Truth) マップ。作業前に必ず参照。

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

---

## プロジェクト構造（3本柱）

| 柱 | パス | 用途 |
|----|------|------|
| **Story** | `novel/` | 小説の正典（SSoT） |
| **Dashboard** | `src/app/dashboard/` | Turso管理者ダッシュボード |
| **Tools** | `tools/` | CLI計算・検証ツール |

## ドキュメントルール

1. **novel/ が正典** — 矛盾がある場合、novel/ が正しい
2. **claudedocs/active/** — 現在参照中の設定ドキュメント（15件）
3. **claudedocs/legacy/** — 読み取り専用。書き込み禁止
4. **新規ドキュメントは novel/ 配下に作成**
5. **ファイル作成前に `bd create`** — beads issue を先に作る
6. **beads/ は issue管理のみ** — キャラデータの正は novel/characters/

---

## 主要キャラクター設定

| キャラクター | 生年月日 | 性別 | 日柱 | エネルギー |
|------------|---------|------|------|-----------|
| 九条 巡 | 1990-03-02 | **男性** | 丙寅 | 267点 |
| 藤堂 慧 | 1990-05-25 | 男性 | 庚寅 | 255点 |
| 九条 さくら | 1925-07-30 | 女性 | — | 204点 |
| 高橋 美咲 | 1999-05-03 | 女性 | 乙卯 | 196点 |

### 大運の順行・逆行ルール（絶対遵守）

- **男性**: 陽年干 → 順行、陰年干 → 逆行
- **女性**: 陰年干 → 順行、陽年干 → 逆行
- ❌ 「女性はすべて逆行」は間違い

---

## 算命学ツール

```bash
# 基本CLI
npx tsx tools/sanmei-with-energy-cli.ts <YYYY-MM-DD> <male|female>

# エネルギー計算付き
npx tsx tools/sanmei-with-energy-cli.ts <YYYY-MM-DD> <male|female>

# ストーリー整合性検証
npx tsx tools/verify-storyline.ts
```

詳細: `tools/sanmei-cli-README.md`

---

## 検証プロセス

### 朱学院検証（命式データ）
1. 必ずスクリーンショットを取得（目視確認禁止）
2. DOM抽出と照合
3. 詳細: `.claude/skills/SHUGAKUIN-VERIFICATION.md`

### ストーリー検証
- `npx tsx tools/verify-storyline.ts` で16項目チェック
- PR時に自動実行（`.github/workflows/story-review.yml`）
- ストーリー変更は `/story-workflow` を参照

---

## Landing the Plane

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

