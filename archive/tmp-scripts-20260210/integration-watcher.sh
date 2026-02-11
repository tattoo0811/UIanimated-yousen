#!/bin/bash

# 統合JSON生成チーム - ファイル監視スクリプト
# 他チームの作業完了を待機し、データ受信を検知する

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLOCO_DOCS="$PROJECT_ROOT/claudedocs"

# 監視対象ファイル
REQUIRED_FILES=(
  "$CLOCO_DOCS/CHARACTER-DESIGN-MANUAL.md"
  "$CLOCO_DOCS/EPISODES-001-024-CHARACTERS.json"
  "$CLOCO_DOCS/EPISODES-025-048-CHARACTERS.json"
  "$CLOCO_DOCS/EPISODES-049-072-CHARACTERS.json"
  "$CLOCO_DOCS/EPISODES-073-096-CHARACTERS.json"
  "$CLOCO_DOCS/SANMEIGAKU-VERIFICATION-REPORT.md"
)

# ログ関数
log_info() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $*"
}

log_success() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $*"
}

log_warning() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $*"
}

# ファイル存在チェック
check_files() {
  local found=0
  local missing=()

  log_info "Checking required files..."

  for file in "${REQUIRED_FILES[@]}"; do
    local filename=$(basename "$file")
    if [ -f "$file" ]; then
      log_success "Found: $filename"
      ((found++))
    else
      log_warning "Missing: $filename"
      missing+=("$filename")
    fi
  done

  echo ""
  echo "Progress: $found / ${#REQUIRED_FILES[@]} files found"

  if [ $found -eq ${#REQUIRED_FILES[@]} ]; then
    echo "Status: ✅ All files ready for integration!"
    return 0
  else
    echo "Status: ⏳ Waiting for ${#missing[@]} files..."
    echo "Missing: ${missing[*]}"
    return 1
  fi
}

# メイン関数
main() {
  log_info "Starting file watcher for integration team"
  log_info "Monitoring ${#REQUIRED_FILES[@]} required files"
  echo ""

  # 初回チェック
  if check_files; then
    echo ""
    log_info "All files are ready! You can now proceed with integration."
    exit 0
  fi

  # 5分間隔で監視
  log_info "Starting monitoring loop (checking every 5 minutes)..."
  log_info "Press Ctrl+C to stop"
  echo ""

  while true; do
    sleep 300  # 5分待機

    echo ""
    if check_files; then
      echo ""
      log_success "=========================================="
      log_success "All required files are now available!"
      log_success "Ready to start integration process."
      log_success "=========================================="
      echo ""

      # 通知音（macOS）
      if command -v afplay &> /dev/null; then
        afplay /System/Library/Sounds/Glass.aiff 2>/dev/null || true
      fi

      exit 0
    fi
  done
}

# シグナルハンドリング
trap 'echo ""; log_info "Watcher stopped by user"; exit 130' INT TERM

# 実行
main "$@"
