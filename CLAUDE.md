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

## 🖋️ Storytelling Modes & Skills

小説生成と批評には、以下の3つの「文学的モード」を使い分けます。これらは `novel-writing-technique` と `novel-critique` スキルで実装されています。

1.  **Somatic Mode (身体的感性)**: [辻村深月] 感情を「身体的反応」として描写。内的焦点化。
2.  **Logic Mode (論理・抑制)**: [米澤穂信] 感情を抑制し「論理」と「風景」で描写。構造的アイロニー。
3.  **Tapestry Mode (社会・多声)**: [宮部みゆき] 個人のドラマを「社会構造（生活の詳細）」と接続。多声的。

### Available Skills
- `novel-writing-technique`: キャラクター・プロット・シーン生成
- `novel-critique`: モード別品質チェック・論理検証

### 👥 Staff Personas (The Twin Stars)
| Role | Name | Style | Tenchusatsu |
|------|------|-------|-------------|
| **Author** | **Toyama Aruki** | Somatic / Dreamer | Inu-I (Spirit) |
| **Editor** | **Oribe Tsumugu** | Logic / Realist | Tatsu-Mi (Reality) |

Gen AI Workflow:
1.  **Draft**: Request `Toyama Aruki` to write (Somatic/Fire).
2.  **Review**: Request `Oribe Tsumugu` to critique (Logic/Wood).


## 🧠 知識獲得 (NotebookLM)

プロジェクト固有の知識（特に陰陽五行・算命学）は NotebookLM に集約されています。
疑問がある場合は、以下のノートブックを `nlm` コマンドで参照してください。

- **陰陽五行・算命学ナレッジベース**: `5c1dd305-31f4-4ff3-833a-e749ba10c665`
  - URL: [Notebook Link](https://notebooklm.google.com/notebook/5c1dd305-31f4-4ff3-833a-e749ba10c665)


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
