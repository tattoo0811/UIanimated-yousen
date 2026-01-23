# 並列タスク実行システム

tmuxとシェルスクリプトを使った並列タスク実行システムです。複数のBeadsタスクを同時に実行し、エージェント間でコマンドを送信できます。

## 概要

このシステムは以下の3つのスクリプトで構成されています：

1. **parallel-manager.sh** - tmuxセッションの管理とタスクの開始
2. **parallel-worker.sh** - 個別のタスクを実行するワーカー
3. **parallel-commander.sh** - エージェント間のコマンド送信

## セットアップ

```bash
# スクリプトに実行権限を付与（既に実行済み）
chmod +x scripts/parallel-*.sh
```

## 基本的な使用方法

### 1. tmuxセッションを開始

```bash
./scripts/parallel-manager.sh start
```

これにより、`parallel-tasks` という名前のtmuxセッションが作成されます。

### 2. セッションにアタッチ

```bash
./scripts/parallel-manager.sh attach
```

または、直接tmuxコマンドを使用：

```bash
tmux attach -t parallel-tasks
```

### 3. タスクを開始

#### 単一タスクを開始

```bash
./scripts/parallel-manager.sh start-task toukei-xxxx
```

#### 複数タスクを並列で開始（最大8個）

```bash
./scripts/parallel-manager.sh start-multiple 8
```

### 4. ステータス確認

```bash
./scripts/parallel-manager.sh status
```

### 5. セッションを停止

```bash
./scripts/parallel-manager.sh stop
```

## エージェント間のコマンド送信

### コマンドを送信

```bash
# 特定のペイン（インデックス1）にコマンドを送信
./scripts/parallel-commander.sh send 1 "bd list"

# すべてのペインにコマンドを送信
./scripts/parallel-commander.sh send all "git pull --rebase"

# 特定のタスクのペインにコマンドを送信
./scripts/parallel-commander.sh send task-toukei-xxxx "bd close toukei-xxxx"
```

### コマンドキューを確認

```bash
./scripts/parallel-commander.sh list
```

### コマンドを実行

各ワーカーは定期的に（または手動で）コマンドキューをチェックして実行します：

```bash
./scripts/parallel-commander.sh execute
```

## 実践的な使用例

### シナリオ1: 8個のタスクを並列で実行

```bash
# 1. セッションを開始
./scripts/parallel-manager.sh start

# 2. 8個のタスクを並列で開始
./scripts/parallel-manager.sh start-multiple 8

# 3. セッションにアタッチして進捗を確認
./scripts/parallel-manager.sh attach

# tmux内で:
# - Ctrl+B, 数字キー: ウィンドウを切り替え
# - Ctrl+B, D: セッションからデタッチ
```

### シナリオ2: エージェント間で同期コマンドを送信

```bash
# すべてのワーカーにgit pullを実行させる
./scripts/parallel-commander.sh send all "git pull --rebase"

# 特定のタスクが完了したら、そのタスクのペインにcloseコマンドを送信
./scripts/parallel-commander.sh send task-toukei-xxxx "bd close toukei-xxxx && bd sync && git push"
```

### シナリオ3: タスクの進捗を監視

```bash
# ステータスを定期的に確認
watch -n 5 './scripts/parallel-manager.sh status'

# または、ログファイルを監視
tail -f .parallel-logs/worker-*.log
```

## ログファイル

すべてのワーカーのログは `.parallel-logs/` ディレクトリに保存されます：

```bash
# 特定のタスクのログを確認
tail -f .parallel-logs/worker-toukei-xxxx.log

# すべてのログを確認
tail -f .parallel-logs/worker-*.log
```

## カスタマイズ

### ワーカースクリプトのカスタマイズ

`parallel-worker.sh` を編集して、タスクの実行方法をカスタマイズできます：

- エージェントタイプに応じた処理分岐
- ビルド検証の自動実行
- タスク完了時の自動コミット・プッシュ

### エージェントタイプの判定

タスクのタイトルに以下のタグがあると、自動的にエージェントタイプが判定されます：

- `[CURSOR]`, `[FAST]`, `[UI]` → CURSORエージェント
- `[OPUS]`, `[AUDIT]` → OPUSエージェント
- `[CLAUDE]` → CLAUDEエージェント

## 注意事項

1. **Gitブランチ**: 各タスクは独立したブランチ（`task/<task-id>`）で実行されます
2. **コンフリクト**: 複数のタスクが同じファイルを編集する場合は、手動でコンフリクトを解決する必要があります
3. **リソース**: 並列実行数が多いと、システムリソースを消費します。適切な並列数を設定してください
4. **Beads同期**: タスク完了後は `bd sync` を実行してBeadsとGitを同期してください

## トラブルシューティング

### tmuxセッションが見つからない

```bash
# セッションを再作成
./scripts/parallel-manager.sh start
```

### タスクが開始されない

```bash
# タスクが利用可能か確認
bd ready

# タスクの詳細を確認
bd show <task-id>
```

### コマンドが実行されない

```bash
# コマンドキューを確認
./scripts/parallel-commander.sh list

# 手動で実行
./scripts/parallel-commander.sh execute
```

## 今後の拡張案

- [ ] タスクの自動再試行機能
- [ ] 依存関係の自動解決
- [ ] リソース使用量の監視
- [ ] Web UIでの進捗確認
- [ ] タスク完了時の自動通知
