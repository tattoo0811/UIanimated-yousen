#!/bin/bash

# 涼子の算命学データ検証スクリプト
# 朱学院の結果とaccurate-logicの計算を比較

echo "=== 涼子の算命学データ検証 ==="
echo ""
echo "【基本データ】"
echo "名前: 涼子（りょうこ）"
echo "生年月日: 1977.8.20"
echo "出生時刻: 14:00"
echo ""

echo "【四柱推命（accurate-logic）】"
echo "年柱: 丁巳"
echo "月柱: 戊申"
echo "日柱: 己酉"
echo "時柱: 辛未"
echo ""

echo "【ユーザー提供の朱学院人体図】"
echo "      龍高星    天将星"
echo "鳳閣星    司禄星    調舒星"
echo "天貴星    石門星    天恍星"
echo ""

echo "【朱学院との照合】"
echo ""
echo "十二大従星の位置:"
echo "  左肩（年支・巳）: 天将星 (12点)"
echo "  左足（日支・酉）: 天貴星 (9点)"
echo "  右足（月支・申）: 天堂星 (8点) ← 朱学院では天恍星?"
echo ""

echo "十大主星の配置:"
echo "  accurate-logic: 調舒星×4 + 禄存星"
echo "  朱学院（ユーザー提供）:"
echo "    頭: 龍高星"
echo "    胸（中心）: 司禄星"
echo "    左手: 調舒星"
echo "    右手: 天将星"
echo "    左足: 天貴星"
echo "    右足: 石門星"
echo "    腹: 天恍星"
echo "    左肩: 鳳閣星"
echo ""

echo "【検証が必要な点】"
echo "1. 十大主星がaccurate-logicと朱学院で完全に異なる"
echo "2. 日支（酉）の蔵干は辛だが、配置が合わない"
echo "3. 朱学院で再確認が必要"
echo ""

echo "https://www.shugakuin.co.jp/fate_calculation で確認してください"
