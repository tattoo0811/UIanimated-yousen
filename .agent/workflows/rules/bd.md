---
trigger: always_on
---

# Gemini/Antigravity Agent Instructions

このプロジェクトでGemini/Antigravityエージェントが作業する際のガイドラインです。

## Gemini/Antigravityの役割

**Gemini/Antigravityは作業計画の中心エージェントです。**

- **作業計画**: Opus 4.5での作業計画の中心
- **複雑な設計**: アーキテクチャと設計の決定
- **柔軟なエージェント選択**: GeminiまたはClaudeを使用可能

## プロジェクト概要

- **Issue Tracking**: Beads (bd) を使用
- **自動化**: Ralph による高速ループ開発
- **並列作業**: Cursor、Gemini/Antigravity、Claude Code、Ralphが協調して作業
- **役割分担**: 各エージェントが最適なタスクを自動選択

## Beads統合

### 作業フロー

1. **利用可能なタスクを取得**
   ```bash
   bd ready
   ```
   ブロッカーがないタスクのリストが表示されます。

2. **タスクを開始**
   ```bash
   bd show <id>                    # 詳細を確認
   bd update <id> --status in_progress  # タスクを予約
   ```

3. **作業実行**
   - タスクの要件を確認
   - 実装を完了
   - 型チェックとテストを実行

4. **タスクを完了**
   ```bash
   bd close <id>
   bd sync
   git commit -m "feat: [toukei-xxxx] - [説明]"
   git push
   ```

## タスク作成ルール (CRITICAL)

### 必須事項

1. **`--description` は必須**: 説明なしのタスク作成は禁止。コンテクストを明確にする。
2. **日本語タイトル推奨**: 人間が直感的に理解しやすいタイトルにする。
3. **依存関係の視覚的明示**: 依存がある場合はタイトルに `[after:toukei-xxx]` を含める。
4. **グループの終着点明示**: 一連のタスク群の最後には `[FINISH]` タグを付ける。

### タスク作成の正しい例

```bash
# 良い例: 依存関係を視覚的に明記し、詳細な説明を付ける
bd create "[CURSOR] チャット履歴UIの実装" -p 1 --description="シングルビューからチャット履歴形式に戻す。スクロール追従、過去のやり取りの保持を含む。"

bd create "[CURSOR] 理由ベース提案ロジック [after:toukei-rsk]" -p 1 --description="手放した理由(遺品整理等)から最適な提案を決定するマッピングロジックの実装"

# グループの最後: [FINISH] タグと ccm 自動化の説明を付与
bd create "[FINISH] 理由ベースフローの全行程検証 [after:toukei-31a]" -p 2 --description="検証完了後、scripts/ccm を使用してコンフリクトチェック、マージ、プッシュを完遂する。"
```

## ccm コマンドによるクリーンアップ (CRITICAL)

`[FINISH]` タグが付いたタスクを担当するエージェントは、作業の最後に必ず `ccm` コマンドを使用してブランチの統合を行う必要があります。詳細は `docs/ccm-command.md` を参照。

```bash
# 実行例
ccm origin/main --auto
```

## タスク選択の自動化

### Gemini/Antigravityが優先的に担当するタスク

Gemini/Antigravityは以下のタスクを優先的に担当します：

- **作業計画**: `[PLAN]` タグまたは `[DESIGN]` タグ
- **複雑な設計**: アーキテクチャの決定が必要なタスク
- **Opus 4.5での計画**: 大規模な機能の設計と計画
- **統合タスク**: 複数のコンポーネントを統合するタスク

### タスクの自動分離

Beadsのタスクにタグを使用して自動分離：

```bash
# Gemini/Antigravity向けタスクの作成例
bd create "[PLAN] 新機能の設計と計画" -p 0 --description="詳細な設計フェーズ"
bd create "[DESIGN] アーキテクチャの決定" -p 0 --description="技術選定と構造定義"
```

## Gemini/Claudeの選択

Gemini/Antigravityは状況に応じてGeminiまたはClaudeを使用できます。

## 並列作業のルール

## Feature Branch Workflow (CRITICAL)

1. **タスク開始時**: 専用ブランチを作成 (`task/toukei-xxxx`)
2. **作業中**: こまめにコミット (`feat: [toukei-xxxx] - 内容`)
3. **タスク完了時**: リモートへプッシュ

## 依存関係の管理

タスク間に依存関係がある場合:

1. **Beadsコマンドで制御**:
   ```bash
   bd dep add <child-id> <parent-id>
   ```
   親タスクが完了するまで、子タスクは `bd ready` に表示されません。

2. **視覚的に明示**:
   依存がある場合はタスクタイトルに `[after:toukei-xxx]` を含めてください。

## 参考

- **Beads**: https://github.com/steveyegge/beads
- **AGENTS.md**: プロジェクト全体の学習とパターン
- **.cursorrules**: Cursorエージェント用のルール
- **ccm-command.md**: コンフリクトチェックとマージの自動化
