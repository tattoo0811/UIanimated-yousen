#!/bin/bash

# コンフリクトチェックスクリプト
# 使用方法: ./scripts/check-conflicts.sh または npm run check:conflicts

set -e

echo "🔍 コンフリクトチェックを開始します..."
echo ""

# カラー出力用
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Git状態の確認
echo "📊 1. Git状態の確認"
echo "────────────────────────────────────────────────────────"
git status --short
echo ""

# 2. リモートとの同期
echo "🔄 2. リモート情報の取得"
echo "────────────────────────────────────────────────────────"
git fetch origin
echo ""

# 3. ブランチ情報
echo "🌿 3. 現在のブランチ"
echo "────────────────────────────────────────────────────────"
CURRENT_BRANCH=$(git branch --show-current)
echo "現在のブランチ: ${CURRENT_BRANCH}"
echo ""

# 4. mainブランチとのマージチェック
echo "🔀 4. mainブランチとのマージコンフリクトチェック"
echo "────────────────────────────────────────────────────────"
if git merge --no-commit --no-ff origin/main 2>&1 | grep -q "Already up to date"; then
  echo -e "${GREEN}✓ コンフリクトなし（Already up to date）${NC}"
  git merge --abort 2>/dev/null || true
else
  MERGE_OUTPUT=$(git merge --no-commit --no-ff origin/main 2>&1)
  if echo "$MERGE_OUTPUT" | grep -q "CONFLICT"; then
    echo -e "${RED}✗ コンフリクトが検出されました！${NC}"
    git merge --abort
    exit 1
  else
    echo -e "${GREEN}✓ コンフリクトなし${NC}"
    git merge --abort 2>/dev/null || true
  fi
fi
echo ""

# 5. 変更ファイルの統計
echo "📝 5. 変更ファイルの統計"
echo "────────────────────────────────────────────────────────"
git diff --stat HEAD
echo ""

# 6. ビルドチェック
echo "🏗️  6. ビルドチェック"
echo "────────────────────────────────────────────────────────"
if [ -d "survey" ]; then
  cd survey
  if npm run build 2>&1 | grep -q "Compiled successfully"; then
    echo -e "${GREEN}✓ ビルド成功${NC}"
  else
    echo -e "${YELLOW}⚠ ビルドに警告があります（詳細は上記を確認）${NC}"
  fi
  cd ..
else
  echo -e "${YELLOW}⚠ surveyディレクトリが見つかりません${NC}"
fi
echo ""

# 7. 他のブランチとの競合可能性チェック
echo "🔍 7. 他のブランチとの競合可能性チェック"
echo "────────────────────────────────────────────────────────"
CHANGED_FILES=$(git diff --name-only HEAD | tr '\n' '|' | sed 's/|$//')
if [ -n "$CHANGED_FILES" ]; then
  for branch in $(git branch -r | grep -v HEAD | sed 's/origin\///'); do
    OVERLAP=$(git diff --name-only origin/main...origin/$branch 2>/dev/null | grep -E "$CHANGED_FILES" | head -3)
    if [ -n "$OVERLAP" ]; then
      echo -e "${YELLOW}⚠ $branch ブランチでも同じファイルが変更されています:${NC}"
      echo "$OVERLAP" | sed 's/^/  - /'
    fi
  done
fi
echo ""

echo "✅ コンフリクトチェック完了"