#!/bin/bash

# ccmコマンドのセットアップスクリプト
# このスクリプトを実行すると、~/.zshrc にエイリアスが追加されます

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CCM_SCRIPT="$PROJECT_ROOT/scripts/ccm"

# シェル設定ファイルを特定
if [ -n "$ZSH_VERSION" ]; then
  SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
  SHELL_RC="$HOME/.bashrc"
else
  SHELL_RC="$HOME/.zshrc"
fi

# エイリアスの追加
ALIAS_LINE="alias ccm='$CCM_SCRIPT'"

# 既にエイリアスが存在するかチェック
if grep -q "alias ccm=" "$SHELL_RC" 2>/dev/null; then
  echo "⚠️  ccmエイリアスは既に存在します"
  echo ""
  echo "既存のエイリアスを更新しますか？ (y/N)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    # 既存のエイリアスを削除
    sed -i.bak '/alias ccm=/d' "$SHELL_RC"
    echo "$ALIAS_LINE" >> "$SHELL_RC"
    echo "✅ ccmエイリアスを更新しました"
  else
    echo "キャンセルしました"
    exit 0
  fi
else
  echo "" >> "$SHELL_RC"
  echo "# ccmコマンド（コンフリクトチェック + マージ）" >> "$SHELL_RC"
  echo "$ALIAS_LINE" >> "$SHELL_RC"
  echo "✅ ccmエイリアスを追加しました"
fi

echo ""
echo "設定を反映するには、以下を実行してください:"
echo "  source $SHELL_RC"
echo ""
echo "または、新しいターミナルを開いてください。"
echo ""
echo "使用方法:"
echo "  ccm [target-branch] [--auto]"
echo "  ccm origin/main"
echo "  ccm origin/main --auto"
