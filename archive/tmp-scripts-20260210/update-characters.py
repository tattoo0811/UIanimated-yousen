import json
import re

# 正しい誕生日のマッピング
correct_dates = {
  "大輝": "1998-01-27T14:30:00",
  "蒼空": "2000-01-17T16:45:00",
  "美咲": "1991-01-04T12:00:00",
  "松井": "1985-02-04T09:30:00",
  "真由": "1997-02-01T15:20:00",
  "源田耕造": "1966-01-04T08:00:00",
  "橘純子": "1964-01-24T11:30:00",
  "中島直人": "1992-02-25T13:45:00",
  "山田茂": "1961-01-16T10:00:00",
  "早川奈々": "2001-01-21T14:20:00",
  "村田梅": "1961-01-07T06:00:00",
  "小林翔太": "1994-07-28T12:00:00",
  "上原芳子": "1966-02-22T16:30:00",
  "山本慎太郎": "1995-01-01T10:15:00",
  "藤堂慧": "1992-02-24T11:30:00",
  "松本奏": "1999-01-01T13:00:00",
  "大野翔": "2003-01-18T03:30:00",
  "工藤遥": "2001-01-01T02:00:00",
  "大杉美和子": "1998-01-01T23:00:00",
  "宮本蓮": "1997-01-01T22:00:00",
  "神崎舞": "2004-01-01T12:00:00",
  "秋山翔": "2000-01-01T10:00:00"
}

# 天中殺なしのキャラクター用の代替日付（実際の計算結果に基づく）
no_tenchusatsu_dates = {
  "佐々木玲奈": "1989-08-21T19:45:00",  # 元の設定を維持（実際には天中殺がある）
  "水野健一": "1995-12-25T14:00:00"      # 元の設定を維持（実際には天中殺がある）
}

with open('/Users/kitamuratatsuhiko/UIanimated/claudedocs/EPISODES-49-72-CHARACTERS.json', 'r') as f:
    data = json.load(f)

for char in data['characters']:
    name = char['name']
    if '&' in name:  # 双生児の処理
        base_name = name.split('&')[0].strip()
        if base_name in correct_dates:
            char['birth_date'] = correct_dates[base_name]
    elif name in correct_dates:
        char['birth_date'] = correct_dates[name]
    elif name in no_tenchusatsu_dates:
        char['birth_date'] = no_tenchusatsu_dates[name]
        # noteを追加
        if 'note' not in char:
            char['note'] = ""
        char['note'] += " [天中殺なしの設定は実際には存在しないため、代用の誕生日]"

with open('/Users/kitamuratatsuhiko/UIanimated/claudedocs/EPISODES-49-72-CHARACTERS.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("キャラクター設定を更新しました")
