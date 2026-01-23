#!/bin/bash
# 並列タスクワーカースクリプト
# 使用方法: ./parallel-worker.sh <task-id> <agent-type>

set -e

TASK_ID="$1"
AGENT_TYPE="${2:-CURSOR}"  # デフォルトはCURSOR
WORKSPACE_DIR="${WORKSPACE_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
LOG_DIR="${WORKSPACE_DIR}/.parallel-logs"
SESSION_NAME="parallel-tasks"

# ログディレクトリ作成
mkdir -p "$LOG_DIR"

# ログファイル
LOG_FILE="${LOG_DIR}/worker-${TASK_ID}.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$TASK_ID] $*" | tee -a "$LOG_FILE"
}

log "=== ワーカー開始: $TASK_ID (Agent: $AGENT_TYPE) ==="

# ワークスペースに移動
cd "$WORKSPACE_DIR"

# タスクの詳細を取得
log "タスク詳細を取得中..."
TASK_INFO=$(bd show "$TASK_ID" 2>&1 || echo "タスクが見つかりません")

if echo "$TASK_INFO" | grep -q "タスクが見つかりません"; then
    log "エラー: タスク $TASK_ID が見つかりません"
    exit 1
fi

# タスクを in_progress に更新
log "タスクを in_progress に更新中..."
bd update "$TASK_ID" --status in_progress || log "警告: ステータス更新に失敗"

# タスクブランチを作成
BRANCH_NAME="task/${TASK_ID}"
log "ブランチ作成: $BRANCH_NAME"

# 現在のブランチを確認
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    # ブランチが存在するか確認
    if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
        log "ブランチ $BRANCH_NAME が既に存在します。チェックアウトします。"
        git checkout "$BRANCH_NAME"
        git pull --rebase origin "$BRANCH_NAME" 2>/dev/null || true
    else
        log "新しいブランチ $BRANCH_NAME を作成します。"
        git checkout -b "$BRANCH_NAME"
    fi
fi

# タスクのタイトルを取得（簡易版）
TASK_TITLE=$(echo "$TASK_INFO" | grep -E "^title:" | head -1 | sed 's/^title: *//' || echo "$TASK_ID")

log "タスクタイトル: $TASK_TITLE"

# エージェントタイプに応じた処理
case "$AGENT_TYPE" in
    CURSOR|FAST|UI)
        log "Cursorエージェントとして処理します"
        # Cursor向けの処理（実装タスク）
        ;;
    OPUS|AUDIT)
        log "Gemini/Antigravityエージェントとして処理します"
        # Gemini/Antigravity向けの処理（レビュー・設計）
        ;;
    CLAUDE)
        log "Claude Codeエージェントとして処理します"
        # Claude Code向けの処理（複雑なロジック）
        ;;
    *)
        log "デフォルトエージェントとして処理します"
        ;;
esac

# ここで実際のタスク処理を実行
# この部分は、タスクの内容に応じてカスタマイズが必要です
log "タスク処理を開始します..."

# 例: ビルド検証が必要な場合
if echo "$TASK_TITLE" | grep -q "\[VERIFY\]"; then
    log "ビルド検証を実行します"
    npm run build 2>&1 | tee -a "$LOG_FILE"
    BUILD_STATUS=${PIPESTATUS[0]}
    if [ $BUILD_STATUS -ne 0 ]; then
        log "ビルドエラーが発生しました"
        exit $BUILD_STATUS
    fi
    log "ビルド成功"
fi

# タスク完了処理
log "タスク処理が完了しました"
log "=== ワーカー終了: $TASK_ID ==="

# 注意: 実際のタスク完了（bd close）は手動または別スクリプトで行う
# このスクリプトはタスクの実行のみを担当
