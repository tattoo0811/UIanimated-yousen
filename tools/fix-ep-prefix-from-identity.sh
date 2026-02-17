#!/bin/bash
# identity.mdからEP番号を読み取って正しいEPプレフィックスに修正する

set -u

PERSONA_DIR="/Users/kitamuratatsuhiko/UIanimated/novel/characters/personas"
cd "$PERSONA_DIR"

# カウンタ
fixed=0
skipped=0
no_ep=0

echo "🔍 identity.mdからEP番号を抽出してリネーム..."
echo ""

for dir in ep*-*/; do
  # ディレクトリ名から現在のEPプレフィックスを取得
  if [[ ! "$dir" =~ ^ep([0-9]+)-(.+)$ ]]; then
    continue
  fi

  current_ep="${BASH_REMATCH[1]}"
  rest_name="${BASH_REMATCH[2]}"

  identity_file="$dir/identity.md"

  if [[ ! -f "$identity_file" ]]; then
    echo "⚠️  identity.mdなし: $dir"
    ((skipped++))
    continue
  fi

  # identity.mdからEP番号を抽出
  ep_match=$(grep -oP '\*\*EP\K\d+(?=登場\*\*)' "$identity_file" 2>/dev/null || echo "")

  if [[ -z "$ep_match" ]]; then
    echo "⏭️  EP番号記載なし: $dir (現在: EP$current_ep)"
    ((no_ep++))
    continue
  fi

  correct_ep="$ep_match"

  # EP番号が同じならスキップ
  if [[ "$current_ep" == "$correct_ep" ]]; then
    continue
  fi

  # 新しいディレクトリ名
  new_dir="ep${correct_ep}-${rest_name}"

  # リネーム実行
  echo "📁 $dir -> $new_dir (identity.md says EP${correct_ep})"
  mv "$dir" "$new_dir"
  ((fixed++))
done

echo ""
echo "✅ 完了:"
echo "  修正: $fixed 個"
echo "  スキップ（EP番号記載なし）: $no_ep 個"
echo "  エラー/その他: $skipped 個"
