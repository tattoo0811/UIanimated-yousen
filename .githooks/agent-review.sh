#!/bin/bash

# ============================================================
# Agent Review Script for Story Quality
# ============================================================
# GLM Agent Team によるストーリー品質レビューを実行します。
#
# 使用法:
#   bash .githooks/agent-review.sh "novel/file1.md novel/file2.md"
# ============================================================

# 色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

NOVEL_FILES="$1"

if [ -z "$NOVEL_FILES" ]; then
  echo -e "${RED}Error: No novel files specified${NC}"
  exit 1
fi

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}  🤖 AI Agent Team Review${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# プロキシルーターの起動確認
PROXY_RUNNING=false
if tmux ls 2>/dev/null | grep -q "claude-router"; then
  PROXY_RUNNING=true
  echo -e "${GREEN}✓ Proxy router detected${NC}"
else
  echo -e "${YELLOW}⚠ Warning: GLM proxy router not detected${NC}"
  echo -e "${CYAN}   Start with: bash ~/.claude/claude-router/start-router.sh${NC}"
  echo ""
fi

echo ""
echo -e "${BLUE}Starting GLM reviewer agent...${NC}"
echo ""

# レビュー対象ファイルを一時ファイルに保存
TEMP_FILES=$(mktemp)
echo "$NOVEL_FILES" > "$TEMP_FILES"

# GLM reviewer を起動
# ここではシンプルに echo で表示（実際の呼び出しは Claude Code から行う）
echo -e "${CYAN}Files to review:${NC}"
echo "$NOVEL_FILES" | while read file; do
  echo -e "  • ${file}"
done

echo ""
echo -e "${YELLOW}💡 To run AI review manually:${NC}"
echo -e "${CYAN}   In Claude Code, run:${NC}"
echo -e "   ${CYAN}/glm-reviewer Review these novel files for story quality:${NC}"
echo -e "   ${CYAN}   $(echo $NOVEL_FILES | tr '\n' ' ')${NC}"
echo ""

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 一時ファイルを削除
rm -f "$TEMP_FILES"
