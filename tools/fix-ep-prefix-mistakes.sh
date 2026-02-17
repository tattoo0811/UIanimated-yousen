#!/bin/bash
# identity.mdから抽出したEP番号に基づいて正しいプレフィックスに修正

PERSONA_DIR="/Users/kitamuratatsuhiko/UIanimated/novel/characters/personas"
cd "$PERSONA_DIR"

echo "🔧 EPプレフィックスを修正..."
echo ""

renamed=0
skipped=0

# 修正リスト
mv "ep1-gunji-kazuto" "ep23-gunji-kazuto" 2>/dev/null && ((renamed++)) || echo "  ✓ ep23-gunji-kazuto (既に正しい、または不存在)"
mv "ep1-akagi-yoshito" "ep24-akagi-yoshito" 2>/dev/null && ((renamed++)) || echo "  ✓ ep24-akagi-yoshito (既に正しい、または不存在)"
mv "ep1-fumizuki-manabu" "ep25-fumizuki-manabu" 2>/dev/null && ((renamed++)) || echo "  ✓ ep25-fumizuki-manabu (既に正しい、または不存在)"
mv "ep1-hatsuse-tsumugi" "ep26-hatsuse-tsumugi" 2>/dev/null && ((renamed++)) || echo "  ✓ ep26-hatsuse-tsumugi (既に正しい、または不存在)"
mv "ep1-utakata-yuto" "ep27-utakata-yuto" 2>/dev/null && ((renamed++)) || echo "  ✓ ep27-utakata-yuto (既に正しい、または不存在)"
mv "ep1-kaburagi-takuma" "ep28-kaburagi-takuma" 2>/dev/null && ((renamed++)) || echo "  ✓ ep28-kaburagi-takuma (既に正しい、または不存在)"
mv "ep1-toyoshima-kenichi" "ep29-toyoshima-kenichi" 2>/dev/null && ((renamed++)) || echo "  ✓ ep29-toyoshima-kenichi (既に正しい、または不存在)"
mv "ep1-minegishi-daigo" "ep30-minegishi-daigo" 2>/dev/null && ((renamed++)) || echo "  ✓ ep30-minegishi-daigo (既に正しい、または不存在)"
mv "ep1-shinohara-shiori" "ep84-shinohara-shiori" 2>/dev/null && ((renamed++)) || echo "  ✓ ep84-shinohara-shiori (既に正しい、または不存在)"
mv "ep1-fujido-nanami" "ep107-fujido-nanami" 2>/dev/null && ((renamed++)) || echo "  ✓ ep107-fujido-nanami (既に正しい、または不存在)"

echo ""
echo "✅ 完了: $renamed 個修正, $skipped 個スキップ"
