#!/bin/bash
# エージェント間のコマンド送信スクリプト
# 各エージェントが他のエージェントにコマンドを送信するためのインターフェース

set -e

WORKSPACE_DIR="${WORKSPACE_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
SESSION_NAME="parallel-tasks"
COMMAND_FILE="${WORKSPACE_DIR}/.parallel-commands/commands.queue"
LOCK_FILE="${WORKSPACE_DIR}/.parallel-commands/lock"

cd "$WORKSPACE_DIR"

# コマンドディレクトリ作成
mkdir -p "$(dirname "$COMMAND_FILE")"

# ロック取得（簡易版）
acquire_lock() {
    local timeout=10
    local count=0
    while [ -f "$LOCK_FILE" ] && [ $count -lt $timeout ]; do
        sleep 0.1
        count=$((count + 1))
    done
    touch "$LOCK_FILE"
}

# ロック解放
release_lock() {
    rm -f "$LOCK_FILE"
}

# コマンドを送信
send_command() {
    local target="$1"  # pane-index または "all" または "task-<id>"
    shift
    local command="$*"
    
    if [ -z "$target" ] || [ -z "$command" ]; then
        echo "使用方法: $0 send <target> <command>"
        echo "  target: pane-index (例: 1), 'all', または 'task-<id>'"
        echo "  command: 実行するコマンド"
        return 1
    fi
    
    acquire_lock
    
    # コマンドをキューに追加
    echo "$(date '+%Y-%m-%d %H:%M:%S')|$target|$command" >> "$COMMAND_FILE"
    
    release_lock
    
    echo "コマンドをキューに追加しました: [$target] $command"
}

# コマンドを実行（ワーカーから呼ばれる）
execute_commands() {
    if [ ! -f "$COMMAND_FILE" ]; then
        return 0
    fi
    
    acquire_lock
    
    # コマンドを読み込んで実行
    local temp_file=$(mktemp)
    local processed=0
    
    while IFS='|' read -r timestamp target command; do
        if [ -z "$command" ]; then
            continue
        fi
        
        # ターゲットを判定
        local pane_index=""
        if [ "$target" = "all" ]; then
            # すべてのペインに送信
            local panes=$(tmux list-panes -t "$SESSION_NAME" -F "#{pane_index}" 2>/dev/null || echo "")
            for pane in $panes; do
                tmux send-keys -t "$SESSION_NAME:$pane" "$command" C-m 2>/dev/null || true
            done
            processed=1
        elif [[ "$target" =~ ^task- ]]; then
            # タスクIDでペインを検索
            local task_id="${target#task-}"
            local window_name="task-${task_id}"
            pane_index=$(tmux list-panes -t "$SESSION_NAME" -F "#{window_index}:#{pane_index} #{window_name}" 2>/dev/null | grep "$window_name" | head -1 | cut -d: -f1-2 || echo "")
            if [ -n "$pane_index" ]; then
                tmux send-keys -t "$SESSION_NAME:$pane_index" "$command" C-m 2>/dev/null || true
                processed=1
            fi
        elif [[ "$target" =~ ^[0-9]+$ ]]; then
            # ペインインデックス
            tmux send-keys -t "$SESSION_NAME:$target" "$command" C-m 2>/dev/null || true
            processed=1
        fi
        
        if [ $processed -eq 1 ]; then
            echo "[$timestamp] コマンド実行: [$target] $command" >> "${WORKSPACE_DIR}/.parallel-logs/commander.log"
        fi
        
    done < "$COMMAND_FILE" > "$temp_file"
    
    # 処理済みコマンドを削除（簡易版: ファイルを空にする）
    if [ $processed -eq 1 ]; then
        > "$COMMAND_FILE"
    fi
    
    release_lock
    
    rm -f "$temp_file"
}

# コマンドキューを表示
list_commands() {
    if [ ! -f "$COMMAND_FILE" ] || [ ! -s "$COMMAND_FILE" ]; then
        echo "キューにコマンドはありません"
        return 0
    fi
    
    echo "=== コマンドキュー ==="
    cat "$COMMAND_FILE" | while IFS='|' read -r timestamp target command; do
        echo "[$timestamp] [$target] $command"
    done
}

# コマンドキューをクリア
clear_commands() {
    > "$COMMAND_FILE"
    echo "コマンドキューをクリアしました"
}

# メイン処理
case "${1:-}" in
    send)
        send_command "$2" "${@:3}"
        ;;
    execute)
        execute_commands
        ;;
    list)
        list_commands
        ;;
    clear)
        clear_commands
        ;;
    *)
        echo "使用方法: $0 {send|execute|list|clear}"
        echo ""
        echo "コマンド:"
        echo "  send <target> <command>  - コマンドをキューに追加"
        echo "  execute                 - キューにあるコマンドを実行"
        echo "  list                    - コマンドキューを表示"
        echo "  clear                   - コマンドキューをクリア"
        echo ""
        echo "例:"
        echo "  $0 send 1 'bd list'"
        echo "  $0 send all 'git pull --rebase'"
        echo "  $0 send task-toukei-xxxx 'bd close toukei-xxxx'"
        exit 1
        ;;
esac
