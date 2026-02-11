#!/bin/bash

# 安全なマージスクリプト（コンフリクトチェック + マージ）
# 使用方法: ./scripts/merge-safe.sh [target-branch] [--auto]
# 例: ./scripts/merge-safe.sh origin/main
#     ./scripts/merge-safe.sh origin/main --auto (確認なしで実行)

set -e

# ヘルプ表示
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  echo "安全なマージスクリプト"
  echo ""
  echo "使用方法:"
  echo "  ./scripts/merge-safe.sh [target-branch] [--auto]"
  echo "  npm run merge:safe [target-branch]"
  echo "  npm run merge:safe:auto"
  echo ""
  echo "引数:"
  echo "  target-branch  マージ元のブランチ（デフォルト: origin/main）"
  echo "  --auto         確認プロンプトをスキップして自動実行"
  echo ""
  echo "例:"
  echo "  ./scripts/merge-safe.sh origin/main"
  echo "  ./scripts/merge-safe.sh origin/develop"
  echo "  ./scripts/merge-safe.sh origin/main --auto"
  exit 0
fi

# カラー出力用
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 引数の処理
TARGET_BRANCH="${1:-origin/main}"
AUTO_MODE="${2:-}"
STASHED=false
STASHED=false

echo "🔍 安全なマージプロセスを開始します..."
echo "マージ先: ${TARGET_BRANCH}"
echo ""

# 1. Git状態の確認
echo "📊 1. Git状態の確認"
echo "────────────────────────────────────────────────────────"
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}未コミットの変更があります:${NC}"
  git status --short
  echo ""
  
  # AI自動判断: 未コミットの変更は自動的にスタッシュして安全にマージ
  echo -e "${BLUE}🤖 AI自動判断: 未コミットの変更をスタッシュして安全にマージします${NC}"
  echo -e "${BLUE}   マージ完了後に自動で変更を復元します${NC}"
  echo ""
  
  # スタッシュ実行
  echo -e "${BLUE}変更をスタッシュ中...${NC}"
  if git stash push -m "ccm: マージ前の一時保存 $(date +%Y-%m-%d_%H:%M:%S)"; then
    STASHED=true
    echo -e "${GREEN}✓ スタッシュ完了（変更は一時保存されました）${NC}"
  else
    echo -e "${YELLOW}⚠ スタッシュに失敗しましたが、変更を保持したまま続行します${NC}"
    STASHED=false
  fi
  echo ""
else
  echo -e "${GREEN}✓ 作業ディレクトリはクリーンです${NC}"
fi
echo ""

# 2. リモートとの同期
echo "🔄 2. リモート情報の取得"
echo "────────────────────────────────────────────────────────"
git fetch origin
echo ""

# 3. ブランチ情報
echo "🌿 3. ブランチ情報"
echo "────────────────────────────────────────────────────────"
CURRENT_BRANCH=$(git branch --show-current)
echo "現在のブランチ: ${CURRENT_BRANCH}"
echo "マージ元: ${TARGET_BRANCH} → ${CURRENT_BRANCH}"
echo ""

# 3.5. ブランチ間の状態分析
echo "📊 3.5. ブランチ間の状態分析"
echo "────────────────────────────────────────────────────────"
AHEAD_COUNT=$(git rev-list --count "$TARGET_BRANCH"..HEAD 2>/dev/null || echo "0")
BEHIND_COUNT=$(git rev-list --count HEAD.."$TARGET_BRANCH" 2>/dev/null || echo "0")

if [ "$AHEAD_COUNT" -gt 0 ]; then
  echo -e "${BLUE}現在のブランチは ${TARGET_BRANCH} より ${AHEAD_COUNT} コミット先に進んでいます${NC}"
fi

if [ "$BEHIND_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}現在のブランチは ${TARGET_BRANCH} より ${BEHIND_COUNT} コミット遅れています${NC}"
  echo -e "${YELLOW}→ マージすると ${BEHIND_COUNT} コミットが取り込まれます${NC}"
elif [ "$AHEAD_COUNT" -gt 0 ] && [ "$BEHIND_COUNT" -eq 0 ]; then
  echo -e "${GREEN}現在のブランチは ${TARGET_BRANCH} の最新を含んでいます${NC}"
  echo -e "${GREEN}→ ${TARGET_BRANCH} には新しいコミットがありません${NC}"
else
  echo -e "${GREEN}現在のブランチと ${TARGET_BRANCH} は同じ状態です${NC}"
fi
echo ""

# 4. マージコンフリクトチェック（ドライラン）
echo "🔀 4. マージコンフリクトチェック（ドライラン）"
echo "────────────────────────────────────────────────────────"
MERGE_TEST_OUTPUT=$(git merge --no-commit --no-ff "$TARGET_BRANCH" 2>&1)
if echo "$MERGE_TEST_OUTPUT" | grep -q "Already up to date"; then
  echo -e "${GREEN}✓ 既に最新です（マージ不要）${NC}"
  git merge --abort 2>/dev/null || true
  echo ""
  echo "📋 詳細:"
  echo "  ${TARGET_BRANCH} には現在のブランチにない新しいコミットがありません。"
  echo "  そのため、マージしても変更は発生しません。"
  echo ""
  if [ "$AHEAD_COUNT" -gt 0 ]; then
    echo -e "${BLUE}💡 現在のブランチには ${AHEAD_COUNT} コミットの変更があります。${NC}"
    echo -e "${BLUE}   これらの変更を ${TARGET_BRANCH} に反映したい場合は、${NC}"
    echo -e "${BLUE}   逆方向のマージ（${CURRENT_BRANCH} → ${TARGET_BRANCH}）を検討してください。${NC}"
  fi
  echo ""
  echo "✅ マージは不要です。既に最新の状態です。"
  exit 0
else
  if echo "$MERGE_TEST_OUTPUT" | grep -q "CONFLICT"; then
    echo -e "${RED}✗ コンフリクトが検出されました！${NC}"
    echo ""
    echo "コンフリクトファイル:"
    git diff --name-only --diff-filter=U
    echo ""
    git merge --abort
    echo -e "${RED}マージを中止しました。コンフリクトを解決してから再度実行してください。${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ コンフリクトなし（マージ可能）${NC}"
    if [ "$BEHIND_COUNT" -gt 0 ]; then
      echo -e "${YELLOW}  → ${BEHIND_COUNT} コミットが取り込まれます${NC}"
    fi
    git merge --abort 2>/dev/null || true
  fi
fi
echo ""

# 5. 変更ファイルの統計
echo "📝 5. マージ後の変更予定"
echo "────────────────────────────────────────────────────────"
git diff --stat "$TARGET_BRANCH"...HEAD 2>/dev/null || git diff --stat HEAD..."$TARGET_BRANCH" 2>/dev/null || true
echo ""

# 6. ビルドチェック（オプション）
if [ -d "survey" ]; then
  echo "🏗️  6. ビルドチェック"
  echo "────────────────────────────────────────────────────────"
  cd survey
  if npm run build 2>&1 | grep -q "Compiled successfully"; then
    echo -e "${GREEN}✓ ビルド成功${NC}"
  else
    echo -e "${YELLOW}⚠ ビルドに警告があります${NC}"
    if [ "$AUTO_MODE" != "--auto" ]; then
      read -p "ビルドに警告がありますが、続行しますか？ (y/N): " -n 1 -r
      echo ""
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        cd ..
        echo "マージをキャンセルしました"
        exit 0
      fi
    fi
  fi
  cd ..
  echo ""
fi

# 7. マージ実行の確認
if [ "$AUTO_MODE" != "--auto" ]; then
  echo "⚠️  マージを実行しますか？"
  echo "   現在のブランチ: ${CURRENT_BRANCH}"
  echo "   マージ元: ${TARGET_BRANCH}"
  echo ""
  read -p "続行しますか？ (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "マージをキャンセルしました"
    exit 0
  fi
fi

# 8. マージ実行
echo "🔄 8. マージを実行中..."
echo "────────────────────────────────────────────────────────"
if git merge --no-ff "$TARGET_BRANCH"; then
  echo -e "${GREEN}✓ マージ成功${NC}"
  echo ""
  
  # 9. マージ後の状態確認
  echo "📊 9. マージ後の状態"
  echo "────────────────────────────────────────────────────────"
  git status --short
  echo ""
  
  # 10. リモートへのプッシュ確認
  if [ "$AUTO_MODE" != "--auto" ]; then
    echo "📤 リモートにプッシュしますか？"
    read -p "プッシュしますか？ (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "リモートにプッシュ中..."
      git push origin "$CURRENT_BRANCH"
      echo -e "${GREEN}✓ プッシュ完了${NC}"
    else
      echo "プッシュをスキップしました。後で手動でプッシュしてください。"
    fi
  else
    echo "📤 リモートにプッシュ中..."
    git push origin "$CURRENT_BRANCH"
    echo -e "${GREEN}✓ プッシュ完了${NC}"
  fi
  
  echo ""
  
  # スタッシュした変更を戻す
  if [ "$STASHED" = true ]; then
    echo "🔄 スタッシュした変更を戻しています..."
    if git stash pop; then
      echo -e "${GREEN}✓ 変更を復元しました${NC}"
      echo ""
      echo -e "${YELLOW}💡 復元された変更を確認して、必要に応じてコミットしてください${NC}"
      git status --short
    else
      echo -e "${YELLOW}⚠ スタッシュの復元でコンフリクトが発生しました${NC}"
      echo ""
      echo "コンフリクトを解決してください:"
      echo "  1. コンフリクトファイルを確認: git status"
      echo "  2. コンフリクトを解決"
      echo "  3. 解決後: git add . && git stash drop"
      echo ""
      echo "スタッシュ一覧: git stash list"
    fi
    echo ""
  fi
  
  echo -e "${GREEN}✅ マージプロセス完了${NC}"
else
  echo -e "${RED}✗ マージに失敗しました${NC}"
  echo ""
  
  # スタッシュした変更を戻す（マージ失敗時も）
  if [ "$STASHED" = true ]; then
    echo "🔄 スタッシュした変更を戻しています..."
    git stash pop
    echo ""
  fi
  
  echo "コンフリクトが発生した可能性があります。以下を確認してください:"
  echo "  - git status"
  echo "  - git diff"
  echo ""
  echo "コンフリクトを解決後、以下でマージを完了してください:"
  echo "  git add ."
  echo "  git commit"
  exit 1
fi
