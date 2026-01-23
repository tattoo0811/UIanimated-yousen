#!/bin/bash
# tmuxベースの並列タスク管理スクリプト
# 使用方法: ./parallel-manager.sh [start|stop|status|attach|command]

set -e

WORKSPACE_DIR="${WORKSPACE_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
SESSION_NAME="parallel-tasks"
WORKER_SCRIPT="${WORKSPACE_DIR}/scripts/parallel-worker.sh"

cd "$WORKSPACE_DIR"

# tmuxセッションが存在するか確認
tmux_has_session() {
    tmux has-session -t "$SESSION_NAME" 2>/dev/null
}

# 利用可能なタスクを取得
get_available_tasks() {
    bd ready 2>/dev/null | grep -E "^[a-z0-9-]+" | awk '{print $1}' || echo ""
}

# タスクのエージェントタイプを判定
detect_agent_type() {
    local task_id="$1"
    local task_info=$(bd show "$task_id" 2>/dev/null || echo "")
    
    if echo "$task_info" | grep -q "\[CURSOR\]\|\[FAST\]\|\[UI\]"; then
        echo "CURSOR"
    elif echo "$task_info" | grep -q "\[OPUS\]\|\[AUDIT\]"; then
        echo "OPUS"
    elif echo "$task_info" | grep -q "\[CLAUDE\]"; then
        echo "CLAUDE"
    else
        echo "CURSOR"  # デフォルト
    fi
}

# tmuxセッションを開始
start_session() {
    if tmux_has_session; then
        echo "セッション $SESSION_NAME は既に実行中です"
        return 1
    fi
    
    echo "tmuxセッション $SESSION_NAME を開始します..."
    
    # セッションを作成（最初のペインは監視用）
    tmux new-session -d -s "$SESSION_NAME" -n "monitor" \
        "cd '$WORKSPACE_DIR' && echo '=== 並列タスク監視セッション ===' && echo '' && echo '利用可能なコマンド:' && echo '  ./scripts/parallel-manager.sh attach  - セッションにアタッチ' && echo '  ./scripts/parallel-manager.sh status  - ステータス確認' && echo '  ./scripts/parallel-manager.sh command <pane> <cmd>  - コマンド送信' && echo '' && watch -n 5 'bd list | head -20'"
    
    echo "セッションが開始されました。'./scripts/parallel-manager.sh attach' でアタッチできます。"
}

# セッションを停止
stop_session() {
    if ! tmux_has_session; then
        echo "セッション $SESSION_NAME は実行されていません"
        return 1
    fi
    
    echo "セッション $SESSION_NAME を停止します..."
    tmux kill-session -t "$SESSION_NAME"
    echo "セッションを停止しました"
}

# ステータス確認
show_status() {
    if ! tmux_has_session; then
        echo "セッション $SESSION_NAME は実行されていません"
        return 1
    fi
    
    echo "=== セッション状態 ==="
    tmux list-sessions | grep "$SESSION_NAME" || echo "セッションが見つかりません"
    echo ""
    echo "=== アクティブなペイン ==="
    tmux list-panes -t "$SESSION_NAME" -F "#{pane_index}: #{pane_title} - #{pane_current_command}" || echo "ペインが見つかりません"
    echo ""
    echo "=== 利用可能なタスク ==="
    get_available_tasks | head -10
}

# セッションにアタッチ
attach_session() {
    if ! tmux_has_session; then
        echo "セッション $SESSION_NAME は実行されていません。先に start してください。"
        return 1
    fi
    
    tmux attach-session -t "$SESSION_NAME"
}

# 新しいタスクを開始（新しいペインで）
start_task() {
    local task_id="$1"
    
    if [ -z "$task_id" ]; then
        echo "使用方法: $0 start-task <task-id>"
        return 1
    fi
    
    if ! tmux_has_session; then
        echo "セッションが開始されていません。先に start してください。"
        return 1
    fi
    
    # タスクが利用可能か確認
    if ! bd show "$task_id" >/dev/null 2>&1; then
        echo "エラー: タスク $task_id が見つかりません"
        return 1
    fi
    
    # エージェントタイプを判定
    local agent_type=$(detect_agent_type "$task_id")
    
    echo "タスク $task_id を開始します (Agent: $agent_type)..."
    
    # 新しいペインを作成してタスクを実行
    local pane_name="task-${task_id}"
    tmux new-window -t "$SESSION_NAME" -n "$pane_name" \
        "cd '$WORKSPACE_DIR' && '$WORKER_SCRIPT' '$task_id' '$agent_type' 2>&1 | tee .parallel-logs/worker-${task_id}.log; echo ''; echo 'タスク完了。Enterキーでこのペインを閉じます...'; read"
    
    echo "タスク $task_id がペイン $pane_name で開始されました"
}

# コマンドを特定のペインに送信
send_command() {
    local pane="$1"
    shift
    local cmd="$*"
    
    if [ -z "$pane" ] || [ -z "$cmd" ]; then
        echo "使用方法: $0 command <pane-index> <command>"
        echo "例: $0 command 1 'bd list'"
        return 1
    fi
    
    if ! tmux_has_session; then
        echo "セッションが開始されていません"
        return 1
    fi
    
    # ペインにコマンドを送信
    tmux send-keys -t "$SESSION_NAME:$pane" "$cmd" C-m
    echo "コマンドをペイン $pane に送信しました: $cmd"
}

# 複数のタスクを一括で開始
start_multiple_tasks() {
    local max_parallel="${1:-4}"  # デフォルトは4並列
    
    if ! tmux_has_session; then
        echo "セッションが開始されていません。先に start してください。"
        return 1
    fi
    
    echo "最大 $max_parallel 個のタスクを並列で開始します..."
    
    local tasks=($(get_available_tasks))
    local count=0
    
    for task_id in "${tasks[@]}"; do
        if [ $count -ge $max_parallel ]; then
            echo "最大並列数に達しました。残りのタスクは後で開始してください。"
            break
        fi
        
        # タスクが既に in_progress でないか確認
        local status=$(bd show "$task_id" 2>/dev/null | grep -E "^status:" | awk '{print $2}' || echo "unknown")
        if [ "$status" = "in_progress" ]; then
            echo "タスク $task_id は既に進行中です。スキップします。"
            continue
        fi
        
        start_task "$task_id"
        count=$((count + 1))
        sleep 1  # 少し待機してから次のタスクを開始
    done
    
    echo "$count 個のタスクを開始しました"
}

# メイン処理
case "${1:-}" in
    start)
        start_session
        ;;
    stop)
        stop_session
        ;;
    status)
        show_status
        ;;
    attach)
        attach_session
        ;;
    start-task)
        start_task "$2"
        ;;
    start-multiple)
        start_multiple_tasks "$2"
        ;;
    command)
        send_command "$2" "${@:3}"
        ;;
    *)
        echo "使用方法: $0 {start|stop|status|attach|start-task|start-multiple|command}"
        echo ""
        echo "コマンド:"
        echo "  start              - tmuxセッションを開始"
        echo "  stop               - tmuxセッションを停止"
        echo "  status             - セッションとタスクの状態を表示"
        echo "  attach             - セッションにアタッチ"
        echo "  start-task <id>    - 指定したタスクを新しいペインで開始"
        echo "  start-multiple [N] - 利用可能なタスクを最大N個並列で開始（デフォルト: 4）"
        echo "  command <pane> <cmd> - 指定したペインにコマンドを送信"
        echo ""
        echo "例:"
        echo "  $0 start"
        echo "  $0 start-task toukei-xxxx"
        echo "  $0 start-multiple 8"
        echo "  $0 command 1 'bd list'"
        exit 1
        ;;
esac
