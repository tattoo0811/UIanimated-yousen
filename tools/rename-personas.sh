#!/bin/bash
# personaディレクトリにEP番号プレフィックスを追加するスクリプト

# set -e  # 個別のエラーで止まらないように

PERSONA_DIR="/Users/kitamuratatsuhiko/UIanimated/novel/characters/personas"
cd "$PERSONA_DIR"

# カウンタ
renamed=0
skipped=0

# リネーム実行関数
rename_if_exists() {
  local old_name="$1"
  local new_name="$2"

  # 既に新しい名前のディレクトリが存在する場合はスキップ
  if [[ -d "$new_name" ]]; then
    echo "✓ 既にリネーム済み: $new_name"
    return
  fi

  if [[ ! -d "$old_name" ]]; then
    echo "⚠️  ディレクトリなし: $old_name"
    ((skipped++))
    return
  fi

  if [[ "$old_name" == "$new_name" ]]; then
    echo "✓ 既に正しい形式: $old_name"
    return
  fi

  echo "📁 $old_name -> $new_name"
  mv "$old_name" "$new_name"
  ((renamed++))
}

echo "🔄 personaディレクトリのリネームを開始..."
echo ""

# EP1
rename_if_exists "takahashi-misaki" "ep1-takahashi-misaki"
rename_if_exists "kujo-meguru" "ep1-kujo-meguru"

# EP2
rename_if_exists "murata-kenichi" "ep2-murata-kenichi"

# EP3
rename_if_exists "morikawa-maki" "ep3-morikawa-maki"
rename_if_exists "morikawa-hina" "ep3-morikawa-hina"

# EP4
rename_if_exists "tanaka-kenta" "ep4-tanaka-kenta"

# EP5
rename_if_exists "sato-masato" "ep5-sato-masato"

# EP6
rename_if_exists "obayashi-takuya" "ep6-obayashi-takuya"

# EP7
rename_if_exists "kusano-chiho" "ep7-kusano-chiho"

# EP8
rename_if_exists "hyuga-yoichi" "ep8-hyuga-yoichi"

# EP9
rename_if_exists "akari-nana" "ep9-akari-nana"

# EP10
rename_if_exists "iwata-tsuyoshi" "ep10-iwata-tsuyoshi"

# EP11
rename_if_exists "hatanaka-yui" "ep11-hatanaka-yui"

# EP12
rename_if_exists "kaneshiro-tetsuya" "ep12-kaneshiro-tetsuya"

# EP13
rename_if_exists "shirogane-sayuki" "ep13-shirogane-sayuki"

# EP14
rename_if_exists "unabara-yosuke" "ep14-unabara-yosuke"

# EP15
rename_if_exists "mizukami-sumiko" "ep15-mizukami-sumiko"

# EP16
rename_if_exists "kito-seiichi" "ep16-kito-seiichi"

# EP17
rename_if_exists "hanazono-mai" "ep17-hanazono-mai"

# EP18
rename_if_exists "otonashi-shiori" "ep18-otonashi-shiori"

# EP19
rename_if_exists "ena-sachiko" "ep19-ena-sachiko"

# EP20
rename_if_exists "kobayakawa-rie-ren" "ep20-kobayakawa-rie-ren"

# EP21
rename_if_exists "yajima-hayato" "ep21-yajima-hayato"

# EP22
rename_if_exists "hoshikawa-wataru" "ep22-hoshikawa-wataru"

# EP31
rename_if_exists "akiyama-yosuke" "ep31-akiyama-yosuke"

# EP32
rename_if_exists "kirishima-mizuki" "ep32-kirishima-mizuki"

# EP33
rename_if_exists "owarinomiya-toru" "ep33-owarinomiya-toru"

# EP34
rename_if_exists "morishita-midori" "ep34-morishita-midori"

# EP35
rename_if_exists "tetsuya-tsuyoshi" "ep35-tetsuya-tsuyoshi"

# EP36
rename_if_exists "futami-kazuma" "ep36-futami-kazuma"

# EP37
rename_if_exists "harada-makoto" "ep37-harada-makoto"

# EP38
rename_if_exists "tokitou-haruka" "ep38-tokitou-haruka"

# EP39
rename_if_exists "momozono-chika" "ep39-momozono-chika"

# EP42
rename_if_exists "aoyagi-ryo" "ep42-aoyagi-ryo"

# EP43
rename_if_exists "mishima-kyoko" "ep43-mishima-kyoko"

# EP44
rename_if_exists "hae-tsubasa" "ep44-hae-tsubasa"

# EP45
rename_if_exists "saionji-ryo" "ep45-saionji-ryo"

# EP46
rename_if_exists "inuzuka-shinichi" "ep46-inuzuka-shinichi"

# EP47
rename_if_exists "kitahara-shizuka" "ep47-kitahara-shizuka"

# EP50
rename_if_exists "fukazawa-miki" "ep50-fukazawa-miki"

# EP51
rename_if_exists "onoda-kineko" "ep51-onoda-kineko"

# EP52
rename_if_exists "shirahase-hotaru" "ep52-shirahase-hotaru"

# EP53
rename_if_exists "umino-sango" "ep53-umino-sango"

# EP54
rename_if_exists "tourouin-akira" "ep54-tourouin-akira"

# EP56
rename_if_exists "maruyama-genzo" "ep56-maruyama-genzo"

# EP57
rename_if_exists "fukatsu-reina" "ep57-fukatsu-reina"

# EP58
rename_if_exists "ise-miyabi" "ep58-ise-miyabi"

# EP59
rename_if_exists "kuki-hajime" "ep59-kuki-hajime"

# EP61
rename_if_exists "asakura-hijiri" "ep61-asakura-hijiri"

# EP62
rename_if_exists "minase-toru" "ep62-minase-toru"

# EP63
rename_if_exists "tojo-shinichi" "ep63-tojo-shinichi"

# EP64
rename_if_exists "rokujoin-miyabi" "ep64-rokujoin-miyabi"

# EP67
rename_if_exists "kirishima-ren" "ep67-kirishima-ren"

# EP68
rename_if_exists "kuroda-rintaro" "ep68-kuroda-rintaro"

# EP69
rename_if_exists "sonobe-momoka" "ep69-sonobe-momoka"

# EP71
rename_if_exists "kikuchi-shota" "ep71-kikuchi-shota"

# EP72
rename_if_exists "tsurumi-miho" "ep72-tsurumi-miho"

# EP73
rename_if_exists "morohoshi-shinobu" "ep73-morohoshi-shinobu"

# EP74
rename_if_exists "kanamori-daichi" "ep74-kanamori-daichi"

# EP76
rename_if_exists "amemiya-yuto" "ep76-amemiya-yuto"

# EP77
rename_if_exists "tetsuda-tsuyoshi" "ep77-tetsuda-tsuyoshi"

# EP78
rename_if_exists "kobayakawa-yui" "ep78-kobayakawa-yui"

# EP79
rename_if_exists "yoshino-tsumugi" "ep79-yoshino-tsumugi"

# 主要キャラクター（EP1準拠）
rename_if_exists "fujido-nanami" "ep1-fujido-nanami"
rename_if_exists "futami-jiro" "ep1-futami-jiro"
rename_if_exists "hidani-dan" "ep1-hidani-dan"
rename_if_exists "wakaba-moe" "ep1-wakaba-moe"
rename_if_exists "mizutani-saori" "ep1-mizutani-saori"
rename_if_exists "shinohara-shiori" "ep1-shinohara-shiori"
rename_if_exists "gunji-kazuto" "ep1-gunji-kazuto"
rename_if_exists "akagi-yoshito" "ep1-akagi-yoshito"
rename_if_exists "fumizuki-manabu" "ep1-fumizuki-manabu"
rename_if_exists "hatsuse-tsumugi" "ep1-hatsuse-tsumugi"
rename_if_exists "utakata-yuto" "ep1-utakata-yuto"
rename_if_exists "kaburagi-takuma" "ep1-kaburagi-takuma"
rename_if_exists "toyoshima-kenichi" "ep1-toyoshima-kenichi"
rename_if_exists "minegishi-daigo" "ep1-minegishi-daigo"

echo ""
echo "✅ 完了: $renamed 個リネーム, $skipped 個スキップ"
