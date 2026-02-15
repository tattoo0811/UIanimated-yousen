# UIanimated — Project Instructions for Claude

This file augments (does not replace) your global instructions.

---

## 🔴 SSoT (Single Source of Truth)

**`MANIFEST.json`** — 常に最初に確認。プロジェクト全体の地図。

## 📁 Where Files Live

| Type | Location | Rule |
|------|----------|------|
| 小説正典 | `novel/` | **矛盾時はこれが正** |
| 設計ドキュメント | `novel/settings/` | 新規はここに作成 |
| アクティブな設定 | `claudedocs/active/` | 現在参照中 |
| レガシー | `claudedocs/legacy/` | **読み取り専用** |

## 📖 必読ドキュメント（順番に）

1. `MANIFEST.json` — プロジェクト全体マップ
2. `novel/settings/NOVEL-WRITING-AI-PROMPT-DESIGN.md` — AIプロンプト設計書
3. `novel/settings/CHARACTER-DESIGN-MANUAL.md` — キャラクター設計
4. `AGENTS.md` — ワークフロー・ツール・検証

## ⚠️ よくある間違い

| ❌ Don't | ✅ Do |
|---------|-------|
| `claudedocs/legacy/` に書き込む | `novel/settings/` に新規作成 |
| 小説変更時に beads 作成忘れ | 先に `bd create` |
| 目視で朱学院確認 | スクリーンショット必須 |
| 女性＝大運逆行 | 陰年干→順行、陽年干→逆行 |

## 🚀 セッション開始時

```bash
# 1. 状態確認
git status
git branch

# 2. 未完了のissue確認
bd ready

# 3. 最新の設定を確認
cat AGENTS.md
```

## ✅ セッション終了時

```bash
# 1. issue更新
bd sync
git status

# 2. プッシュ（必須）
git pull --rebase
git push

# 3. "up to date" を確認
git status
```

---

**補足**: `AGENTS.md` に詳細なワークフロー・ツール使用法・検証プロセスがあります。
