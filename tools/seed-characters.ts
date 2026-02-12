/**
 * Turso スキーマ作成 + EP1-10 キャラクターデータ投入
 * 
 * 実行: npx tsx tools/seed-characters.ts
 */
import { turso } from "./turso.js";
import { calculateSanmei } from "./sanmei-cli-v3.js";
import type { CharacterProfile } from "./character-types.js";

// ============================================================
// DDL — テーブル作成
// ============================================================

const DDL = [
    `CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_reading TEXT,
    birth_date TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('male','female')),
    age_at_story INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('main','patient','supporting')),
    episode INTEGER,
    occupation TEXT,
    birthplace TEXT,
    family_summary TEXT,
    narrative_core TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
    `CREATE TABLE IF NOT EXISTS meishiki (
    character_id TEXT PRIMARY KEY REFERENCES characters(id),
    year_gan TEXT NOT NULL,
    year_shi TEXT NOT NULL,
    month_gan TEXT NOT NULL,
    month_shi TEXT NOT NULL,
    day_gan TEXT NOT NULL,
    day_shi TEXT NOT NULL,
    year_zokan TEXT,
    month_zokan TEXT,
    day_zokan TEXT,
    star_north TEXT,
    star_south TEXT,
    star_east TEXT,
    star_west TEXT,
    star_center TEXT,
    jusei_start TEXT,
    jusei_start_score INTEGER,
    jusei_middle TEXT,
    jusei_middle_score INTEGER,
    jusei_end TEXT,
    jusei_end_score INTEGER,
    energy_total INTEGER,
    tenchusatsu TEXT,
    setsuiri_day INTEGER
  )`,
    `CREATE TABLE IF NOT EXISTS timeline_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id TEXT NOT NULL REFERENCES characters(id),
    age INTEGER NOT NULL,
    year INTEGER NOT NULL,
    event TEXT NOT NULL,
    category TEXT DEFAULT 'life',
    sort_order INTEGER
  )`,
    `CREATE TABLE IF NOT EXISTS taiun (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id TEXT NOT NULL REFERENCES characters(id),
    age INTEGER NOT NULL,
    eto TEXT NOT NULL,
    gan TEXT NOT NULL,
    shi TEXT NOT NULL,
    star TEXT NOT NULL,
    jusei TEXT NOT NULL
  )`,
];

// ============================================================
// EP1-10 キャラクターデータ
// ============================================================

const profiles: CharacterProfile[] = [
    // --- EP1: 高橋美咲 ---
    {
        character: {
            id: "misaki",
            name: "高橋美咲",
            nameReading: "たかはし みさき",
            birthDate: "1999-05-03",
            gender: "female",
            ageAtStory: 27,
            role: "main",
            episode: 1,
            occupation: "広告代理店SNS運用",
            birthplace: "埼玉県川越市",
            familySummary: "父(中学教師)、母(パート)。一人っ子",
            narrativeCore: [
                "土に押さえつけられた若草 — 己・戊・辰の三つの土が乙木を圧迫",
                "貫索星×2: 頑固で自分を曲げない芯がある（後のアシスタント就任の素地）",
                "司禄星×2: 蓄積・継続の才能。SNS運用の実務力の根拠",
                "天禄星(11)×2: エネルギーが高く、本来は行動力がある。しかし環境に抑圧されている"
            ],
        },
        meishiki: { characterId: "misaki", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "misaki", age: 0, year: 1999, event: "埼玉県川越市に生まれる。父は中学教師、母はパート勤務。一人っ子" },
            { characterId: "misaki", age: 6, year: 2005, event: "地元の公立小学校入学。おとなしく目立たない子。図工が得意" },
            { characterId: "misaki", age: 10, year: 2009, event: "父が異動でストレス。家庭内の会話が減る。「空気を読む」癖がつく" },
            { characterId: "misaki", age: 13, year: 2012, event: "中学入学。美術部。SNSを始める" },
            { characterId: "misaki", age: 16, year: 2015, event: "高校入学。進学校ではなく商業科を選ぶ。デザインに興味" },
            { characterId: "misaki", age: 18, year: 2017, event: "短大（広告・デザイン系）入学。初めて「数字で評価される」世界を知る" },
            { characterId: "misaki", age: 20, year: 2019, event: "短大卒業。中堅広告代理店に入社。SNS運用チームに配属" },
            { characterId: "misaki", age: 22, year: 2021, event: "コロナ後の広告業界激変。クライアント対応でストレス増大" },
            { characterId: "misaki", age: 24, year: 2023, event: "上司が「数字が全て」と言い切る環境に違和感。初めて転職を考える" },
            { characterId: "misaki", age: 25, year: 2024, event: "友人の紹介で占いに行くが、しっくりこない。SNSで「もっと人に寄り添いたい」と匿名投稿" },
            { characterId: "misaki", age: 26, year: 2025, event: "巡のSNS投稿（開業準備中の独り言）を偶然見つけ、共感する" },
            { characterId: "misaki", age: 27, year: 2026, event: "【第1話】運命診断室を訪れる。乙卯の命式を知り、涙", category: "turning_point" },
        ],
    },

    // --- EP2: 村田健一 ---
    {
        character: {
            id: "murata",
            name: "村田健一",
            nameReading: "むらた けんいち",
            birthDate: "1980-05-06",
            gender: "male",
            ageAtStory: 46,
            role: "patient",
            episode: 2,
            occupation: "元IT経営者（現・無職）",
            birthplace: "東京都練馬区",
            familySummary: "父(町工場経営)、母(専業主婦)、兄一人。離婚、長男あり",
            narrativeCore: [
                "天将星(12): 最大エネルギー。しかし方向を失うと自己破壊的になる",
                "調舒星: 繊細な感受性。裏切りのダメージが深い（巡の慧への裏切りと共鳴）",
                "石門星×2: 本来は人間関係を大切にする人。山根との友情を信じすぎた",
                "巡との対比: 巡も慧に裏切られた。村田を診ることは巡自身の傷と向き合うこと"
            ],
        },
        meishiki: { characterId: "murata", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "murata", age: 0, year: 1980, event: "東京都練馬区生まれ。父は町工場の経営者、母は専業主婦。兄が一人" },
            { characterId: "murata", age: 10, year: 1990, event: "バブル崩壊。父の工場の受注が半減。家庭の空気が暗くなる" },
            { characterId: "murata", age: 15, year: 1995, event: "高校入学。PCに没頭。独学でプログラミングを覚える" },
            { characterId: "murata", age: 18, year: 1998, event: "工業大学入学。情報工学専攻。父の工場はなんとか存続" },
            { characterId: "murata", age: 22, year: 2002, event: "卒業後、IT企業に就職。Webシステム開発", category: "career" },
            { characterId: "murata", age: 25, year: 2005, event: "同期の山根隆と意気投合。「こんな会社辞めて自分たちでやろう」" },
            { characterId: "murata", age: 27, year: 2007, event: "山根と共同でWeb制作会社を起業。村田がCTO、山根が営業担当", category: "career" },
            { characterId: "murata", age: 30, year: 2010, event: "【大運: 甲申(牽牛星)に入る】会社が軌道に乗り始める。結婚", category: "turning_point" },
            { characterId: "murata", age: 33, year: 2013, event: "長男誕生。社員15名に成長。順調", category: "family" },
            { characterId: "murata", age: 36, year: 2016, event: "大型案件受注。年商2億を超える", category: "career" },
            { characterId: "murata", age: 38, year: 2018, event: "山根が会社の資金を私的流用していることが発覚。問い詰めると逆ギレ", category: "turning_point" },
            { characterId: "murata", age: 39, year: 2019, event: "山根が顧客リストを持ち出し独立。主要クライアントの8割を奪われる" },
            { characterId: "murata", age: 40, year: 2020, event: "【大運: 乙酉(車騎星)に入る。天中殺期間と重なる】会社を畳む。妻と離婚", category: "turning_point" },
            { characterId: "murata", age: 42, year: 2022, event: "実家に戻る。酒量が増える。兄との関係も悪化", category: "health" },
            { characterId: "murata", age: 44, year: 2024, event: "父が倒れる。介護しながら日雇いの仕事。自暴自棄の日々" },
            { characterId: "murata", age: 46, year: 2026, event: "【第2話】酒臭いまま運命診断室を訪れる。「もう何も残ってない」", category: "turning_point" },
        ],
    },

    // --- EP3: 森川真紀 ---
    {
        character: {
            id: "maki",
            name: "森川真紀",
            nameReading: "もりかわ まき",
            birthDate: "1983-01-12",
            gender: "female",
            ageAtStory: 43,
            role: "patient",
            episode: 3,
            occupation: "高校英語教師",
            birthplace: "横浜市",
            familySummary: "父(銀行員)、母(元教師)。夫・森川裕介(理科教師)、娘・陽菜",
            narrativeCore: [
                "庚金の刃 — 正しさの刀剣で娘を切り続ける母",
                "エネルギー合計11点（低）: 娘(21点)とのエネルギー差が親子のすれ違いの一因",
                "調舒星×2: 繊細さと完璧主義が結びついた性格"
            ],
        },
        meishiki: { characterId: "maki", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "maki", age: 0, year: 1983, event: "横浜市に生まれる。父は銀行員、母は元教師。厳格な家庭" },
            { characterId: "maki", age: 6, year: 1989, event: "小学校では学級委員。「ちゃんとしなさい」が母の口癖" },
            { characterId: "maki", age: 12, year: 1995, event: "中学では成績トップクラス。完璧主義の芽が育つ" },
            { characterId: "maki", age: 18, year: 2001, event: "有名私大の教育学部に入学。教員を目指す", category: "career" },
            { characterId: "maki", age: 22, year: 2005, event: "卒業。高校の英語教師になる", category: "career" },
            { characterId: "maki", age: 25, year: 2008, event: "同僚の森川裕介と結婚。3歳年上の穏やかな理科教師", category: "family" },
            { characterId: "maki", age: 27, year: 2010, event: "陽菜誕生。育休取得。「この子には最高の教育を」と決意", category: "family" },
            { characterId: "maki", age: 31, year: 2014, event: "復職。陽菜を私立小学校に入学させる。教育費負担増" },
            { characterId: "maki", age: 37, year: 2020, event: "陽菜が中学受験に合格。名門女子中に進学。安堵" },
            { characterId: "maki", age: 39, year: 2022, event: "陽菜が中1の夏から不登校に。真紀は原因が分からず焦る", category: "turning_point" },
            { characterId: "maki", age: 42, year: 2025, event: "カウンセリング、塾の変更、習い事の追加──すべて裏目に" },
            { characterId: "maki", age: 43, year: 2026, event: "【第3話】陽菜を連れて運命診断室を訪れる", category: "turning_point" },
        ],
    },

    // --- EP3: 森川陽菜 ---
    {
        character: {
            id: "hina",
            name: "森川陽菜",
            nameReading: "もりかわ ひな",
            birthDate: "2010-06-23",
            gender: "female",
            ageAtStory: 15,
            role: "patient",
            episode: 3,
            occupation: "中学生（不登校）",
            birthplace: "横浜市",
            familySummary: "父(理科教師)、母・真紀(英語教師)",
            narrativeCore: [
                "金剋木: 真紀(庚金)の「正しさの刃」が陽菜(甲木)を切り続けている",
                "龍高星: 冒険心、探求心。「箱に入りきらない龍」",
                "天禄星(11): 高い行動エネルギーを持つが、環境に押さえ込まれている",
                "天極星(2): 極限まで追い詰められた精神状態を反映",
                "さくらの「龍は箱に入りきらん」: 陽菜にかける巡の言葉の源泉"
            ],
        },
        meishiki: { characterId: "hina", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "hina", age: 0, year: 2010, event: "横浜生まれ。よく泣く赤ちゃん。母が苦労する" },
            { characterId: "hina", age: 4, year: 2014, event: "私立小入学。絵を描くのが好き。しかし「お勉強の時間」が増え、絵の時間が減る" },
            { characterId: "hina", age: 8, year: 2018, event: "塾通い開始。「算数ができない」と母に叱られる。絵を描くと怒られる" },
            { characterId: "hina", age: 10, year: 2020, event: "中学受験合格。入学式で「やっと自由になれる」と思ったが、さらに厳しい環境" },
            { characterId: "hina", age: 12, year: 2022, event: "部活（美術部）を辞めさせられる。成績が下がったため。心が折れ始める", category: "turning_point" },
            { characterId: "hina", age: 13, year: 2023, event: "夏から不登校。自室に籠もり、スケッチブックに絵を描き続ける。母とは口をきかない" },
            { characterId: "hina", age: 14, year: 2024, event: "フードを深く被って外出。他人と目を合わせない。ただし絵のクオリティは上がっている" },
            { characterId: "hina", age: 15, year: 2026, event: "【第3話】母に連れられて運命診断室へ。フードの下から巡を見る", category: "turning_point" },
        ],
    },

    // --- EP4: 田中健太 ---
    {
        character: {
            id: "kenta",
            name: "田中健太",
            nameReading: "たなか けんた",
            birthDate: "1994-02-11",
            gender: "male",
            ageAtStory: 32,
            role: "patient",
            episode: 4,
            occupation: "SIer大手SE（チームリーダー）",
            birthplace: "千葉県船橋市",
            familySummary: "父(メーカー勤務)、母(看護師)。妹一人。独身",
            narrativeCore: [
                "戊辰: 山のような安定感だが、「動かない」ことが逆に問題",
                "龍高星×2: 知識欲と探究心。しかし「正解主義」に変質している",
                "牽牛星: 正義感と責任感。これが完璧主義を加速させる",
                "五行偏り: 火と土が強く、水・金が弱い → 柔軟性の欠如",
                "「不完全を許す水の器」: 巡からの処方箋"
            ],
        },
        meishiki: { characterId: "kenta", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "kenta", age: 0, year: 1994, event: "千葉県船橋市生まれ。父はメーカー勤務、母は看護師。妹一人" },
            { characterId: "kenta", age: 6, year: 2000, event: "小学校で算数が得意。レゴが好き。「完成するまで寝ない」タイプ" },
            { characterId: "kenta", age: 12, year: 2006, event: "中学で数学オリンピック予選参加。「正解は一つしかない」が信条に" },
            { characterId: "kenta", age: 15, year: 2009, event: "理数系の進学校に入学。友人は少ないが成績は常にトップ" },
            { characterId: "kenta", age: 18, year: 2012, event: "国立大学の情報工学科に入学。初めてチーム開発を経験し、他人のコードが許せない", category: "career" },
            { characterId: "kenta", age: 22, year: 2016, event: "卒業。SIer大手に入社。1年目でバグゼロの記録を作り、社内で話題に", category: "career" },
            { characterId: "kenta", age: 25, year: 2019, event: "チームリーダーに昇進。部下のミスが許せず、厳しく指導。退職者が出る" },
            { characterId: "kenta", age: 27, year: 2021, event: "上司から「お前のチームだけ離職率が高い」と注意される" },
            { characterId: "kenta", age: 29, year: 2023, event: "彼女（3年交際）に「あなたといると息が詰まる」と振られる", category: "turning_point" },
            { characterId: "kenta", age: 30, year: 2024, event: "不眠症を発症。心療内科で「完璧主義傾向」を指摘される", category: "health" },
            { characterId: "kenta", age: 32, year: 2026, event: "【第4話】来院。「ミスを許せない自分を直したい」", category: "turning_point" },
        ],
    },

    // --- EP5: 佐藤雅人 ---
    {
        character: {
            id: "masato",
            name: "佐藤雅人",
            nameReading: "さとう まさと",
            birthDate: "1988-01-18",
            gender: "male",
            ageAtStory: 38,
            role: "patient",
            episode: 5,
            occupation: "大手メーカー営業部長",
            birthplace: "大阪府豊中市",
            familySummary: "父(商社マン)、母(専業主婦)。妻(同社経理部)。子供なし",
            narrativeCore: [
                "壬申: 大河に猿。常に動いていたい。「待つ」ことが最も苦手",
                "車騎星×2: 行動力の塊。止まると不安になる",
                "天中殺テーマ: 「冬に種を蒔いても芽は出ない。しかし冬は土を深く耕す季節」",
                "SNS伏線: 「ネットで」──美咲の匿名投稿の最初の効果"
            ],
        },
        meishiki: { characterId: "masato", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "masato", age: 0, year: 1988, event: "大阪府豊中市に生まれる。父は商社マン（海外赴任多し）、母は専業主婦" },
            { characterId: "masato", age: 8, year: 1996, event: "父の転勤でシンガポールに3年間。英語を覚える。「動くことが当たり前」の感覚が根付く" },
            { characterId: "masato", age: 11, year: 1999, event: "帰国。日本の学校に馴染めず。「ここは狭い」と感じる壬水の本質" },
            { characterId: "masato", age: 15, year: 2003, event: "高校で陸上部。100m走。「止まることが苦手」な性格" },
            { characterId: "masato", age: 18, year: 2006, event: "関西の私大・商学部入学。合コンの主催者タイプ。人脈が広い" },
            { characterId: "masato", age: 22, year: 2010, event: "大手メーカーに入社。営業部配属。1年目から成績トップ", category: "career" },
            { characterId: "masato", age: 28, year: 2016, event: "結婚。妻は同じ会社の経理部。子供はまだ作らない主義", category: "family" },
            { characterId: "masato", age: 30, year: 2018, event: "営業部長に昇進。最年少記録。年収1200万を超える", category: "career" },
            { characterId: "masato", age: 34, year: 2022, event: "会社の業績悪化。リストラの噂。「ここにいていいのか」と初めて迷う" },
            { characterId: "masato", age: 36, year: 2024, event: "天中殺期間に入る。転職エージェントに登録", category: "turning_point" },
            { characterId: "masato", age: 37, year: 2025, event: "ヘッドハンターから外資系の誘い。しかし「動く」か「待つ」かで迷い続ける" },
            { characterId: "masato", age: 38, year: 2026, event: "【第5話】「ネットで見ました」と来院。天中殺中の転職相談", category: "turning_point" },
        ],
    },

    // --- EP6: 大林拓也 ---
    {
        character: {
            id: "takuya",
            name: "大林拓也",
            nameReading: "おおばやし たくや",
            birthDate: "1992-02-08",
            gender: "male",
            ageAtStory: 34,
            role: "patient",
            episode: 6,
            occupation: "建設会社社長",
            birthplace: "神奈川県横須賀市",
            familySummary: "父(急逝・元現場監督)、母(スーパー勤務)。妻・優子、長女、次男",
            narrativeCore: [
                "甲寅: 大樹に虎。猛烈な上昇志向。「天を目指す」ことしか知らない",
                "龍高星×2: 冒険と拡大。止まることを恐れる",
                "禄存星×3: 愛情・奉仕の星がこれほど多いのに、家庭に時間を割けない矛盾",
                "天馳星(1)+天禄星(11)×2: エネルギーのムラが激しい",
                "慧の将来との先行パターン: 「社会的成功と家庭崩壊」のテーマ"
            ],
        },
        meishiki: { characterId: "takuya", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "takuya", age: 0, year: 1992, event: "神奈川県横須賀市に生まれる。父は建設会社の現場監督。母はスーパーのレジ" },
            { characterId: "takuya", age: 6, year: 1998, event: "父の仕事現場についていくのが好き。「でかいものを作りたい」と言い始める" },
            { characterId: "takuya", age: 12, year: 2004, event: "中学では生徒会長。「学校で一番目立ちたい」。背が高い" },
            { characterId: "takuya", age: 15, year: 2007, event: "工業高校に入学。建築科。実習で初めて自分で図面を引く感動", category: "career" },
            { characterId: "takuya", age: 18, year: 2010, event: "工業大学に進学（夜間）。昼は父の会社で働く" },
            { characterId: "takuya", age: 22, year: 2014, event: "卒業。父の建設会社に正式入社。1級建築施工管理技士の資格取得", category: "career" },
            { characterId: "takuya", age: 26, year: 2018, event: "父が急逝（心筋梗塞）。会社を継ぐ。社長就任。社員8名", category: "turning_point" },
            { characterId: "takuya", age: 28, year: 2020, event: "妻（高校の同級生・優子26歳）と結婚。「二人で会社を大きくする」", category: "family" },
            { characterId: "takuya", age: 29, year: 2021, event: "長女誕生。しかし仕事が忙しすぎて入院に立ち会えず", category: "family" },
            { characterId: "takuya", age: 30, year: 2022, event: "大型マンション案件を受注。社員25名に拡大。年商5億", category: "career" },
            { characterId: "takuya", age: 32, year: 2024, event: "次男誕生。妻「あなたはもう家にいない人」。夫婦喧嘩が増える", category: "family" },
            { characterId: "takuya", age: 33, year: 2025, event: "妻が実家に帰る。1週間後に戻るが、以前のような笑顔がない" },
            { characterId: "takuya", age: 34, year: 2026, event: "【第6話】「嫁にも子供にも顔向けできない」と来院", category: "turning_point" },
        ],
    },

    // --- EP7: 草野千穂 ---
    {
        character: {
            id: "chiho",
            name: "草野千穂",
            nameReading: "くさの ちほ",
            birthDate: "1997-02-22",
            gender: "female",
            ageAtStory: 29,
            role: "patient",
            episode: 7,
            occupation: "フリーランスイラストレーター",
            birthplace: "京都市伏見区",
            familySummary: "父(印刷会社勤務)、母(書道教室主宰)。独身",
            narrativeCore: [
                "乙未: 夏草の丘。柔軟で忍耐強いが、他者の評価に左右されやすい",
                "鳳閣星: 表現力。クリエイターとしての才能の根拠",
                "禄存星×2: 愛情深いが、承認欲求とも表裏一体",
                "美咲との対比: 二人とも乙木。しかし卯と未で表現が異なる",
                "十牛図の教え: 「探すから見えなくなる。牛は最初からそこにいた」"
            ],
        },
        meishiki: { characterId: "chiho", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "chiho", age: 0, year: 1997, event: "京都市伏見区に生まれる。父は印刷会社勤務、母は書道教室を主宰" },
            { characterId: "chiho", age: 5, year: 2002, event: "母の影響で絵を描き始める。「千穂ちゃんの絵は変わってるね」と周囲に言われる" },
            { characterId: "chiho", age: 10, year: 2007, event: "小学校で美術コンテスト入賞。しかし「変わっている」ことが嫌になり始める" },
            { characterId: "chiho", age: 15, year: 2012, event: "高校の美術コースに進学。初めて「好きなことだけやっていい」環境を知る" },
            { characterId: "chiho", age: 18, year: 2015, event: "美術大学入学（東京）。上京。SNSに作品を投稿し始める", category: "career" },
            { characterId: "chiho", age: 20, year: 2017, event: "Twitterのフォロワーが5000人を超える。初めて個展を開く" },
            { characterId: "chiho", age: 22, year: 2019, event: "大学卒業。フリーランスのイラストレーターとして独立", category: "career" },
            { characterId: "chiho", age: 23, year: 2020, event: "コロナで仕事が激減。オンラインで活動するが、「いいね」数に一喜一憂し始める" },
            { characterId: "chiho", age: 25, year: 2022, event: "企業案件が増え、年収400万を超える。しかし「描きたいもの」と「求められるもの」の乖離", category: "career" },
            { characterId: "chiho", age: 27, year: 2024, event: "SNSでバズった作品が「パクリ」と炎上。メンタルが崩れる", category: "turning_point" },
            { characterId: "chiho", age: 28, year: 2025, event: "半年間筆を置く。「私には才能がないのかも」", category: "health" },
            { characterId: "chiho", age: 29, year: 2026, event: "【第7話】来院。「自分の値打ちがわからない」", category: "turning_point" },
        ],
    },

    // --- EP8: 日向陽一 ---
    {
        character: {
            id: "youichi",
            name: "日向陽一",
            nameReading: "ひなた よういち",
            birthDate: "1985-09-24",
            gender: "male",
            ageAtStory: 40,
            role: "patient",
            episode: 8,
            occupation: "進学塾カリスマ講師",
            birthplace: "東京都杉並区",
            familySummary: "父(営業マン)、母(主婦)、弟一人。離婚、長男あり",
            narrativeCore: [
                "丙寅: 寅木の上に太陽。木生火の構造だが、燃料を使い切る危険",
                "巡と完全に同じ日柱(丙寅): 鏡のような存在。巡が最も自己投影するキャラクター",
                "玉堂星×2: 教育者・学問の星。塾講師としての天賦の才の根拠",
                "天極星(2): エネルギーの谷。外で輝くほど内が枯渇する構造",
                "妻の言葉「家庭でだけ灯りを消す」: 丙火の本質を突く"
            ],
        },
        meishiki: { characterId: "youichi", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "youichi", age: 0, year: 1985, event: "東京都杉並区に生まれる。秋分の日の翌日。父は営業マン、母は主婦。弟一人" },
            { characterId: "youichi", age: 8, year: 1993, event: "学校で「面白い奴」として人気者。しかし家では無口。「外では太陽、家では月」" },
            { characterId: "youichi", age: 15, year: 2000, event: "高校で演劇部。舞台に立つと輝く。だが幕が下りると空虚" },
            { characterId: "youichi", age: 18, year: 2003, event: "教育大学入学。「人を導く仕事がしたい」", category: "career" },
            { characterId: "youichi", age: 22, year: 2007, event: "卒業。大手進学塾に講師として入社。1年目から人気講師に", category: "career" },
            { characterId: "youichi", age: 25, year: 2010, event: "「合格実績No.1講師」として塾のパンフレットの表紙に。メディア出演も" },
            { characterId: "youichi", age: 28, year: 2013, event: "結婚。妻は同じ塾の事務員。「陽一先生って家では静かなんですね」と驚かれる", category: "family" },
            { characterId: "youichi", age: 30, year: 2015, event: "長男誕生。しかし仕事を優先し、育児にほとんど参加できない", category: "family" },
            { characterId: "youichi", age: 33, year: 2018, event: "妻と離婚。「あなたは家庭でだけ灯りを消す人」と言われる", category: "turning_point" },
            { characterId: "youichi", age: 35, year: 2020, event: "カリスマ講師としての地位は盤石。しかし部屋に帰ると酒を飲むだけ" },
            { characterId: "youichi", age: 38, year: 2023, event: "生徒の親から「先生のおかげで人生が変わりました」と感謝される。嬉しいが、虚しい" },
            { characterId: "youichi", age: 40, year: 2026, event: "【第8話】「太陽でいることに疲れた」と来院", category: "turning_point" },
        ],
    },

    // --- EP9: 灯里奈々 ---
    {
        character: {
            id: "nana",
            name: "灯里奈々",
            nameReading: "あかり なな",
            birthDate: "2000-08-07",
            gender: "female",
            ageAtStory: 25,
            role: "patient",
            episode: 9,
            occupation: "保育士",
            birthplace: "福岡県北九州市",
            familySummary: "父(消防士)、母(保育士)、姉、弟。独身",
            narrativeCore: [
                "丁酉: 蝋燭に鏡。人のために燃える",
                "司禄星: 蓄積と継続の才。毎日手作り教材を作る地道さの根拠",
                "車騎星: 行動力と実行力。しかし「止まれない」性質が燃え尽きに繋がる",
                "天南星(10): 若いエネルギーがあるからこそ、限界まで走ってしまう",
                "丙火(太陽) vs 丁火(蝋燭): 巡との対比で日干の陰陽を際立たせる",
                "「蝋燭は自分で自分を守れない。風除けが要る」: 巡の言葉"
            ],
        },
        meishiki: { characterId: "nana", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "nana", age: 0, year: 2000, event: "福岡県北九州市に生まれる。父は消防士、母は保育士。姉と弟に挟まれた真ん中っ子" },
            { characterId: "nana", age: 5, year: 2005, event: "母の保育園に毎日ついていく。「ママみたいにお仕事したい」" },
            { characterId: "nana", age: 11, year: 2011, event: "東日本大震災。父が派遣され2週間帰らず。「命を守る仕事」を身近に感じる" },
            { characterId: "nana", age: 15, year: 2015, event: "高校入学。保育実習で初めて園児を担当。「この子たちの笑顔を守りたい」" },
            { characterId: "nana", age: 18, year: 2018, event: "保育専門学校入学（東京）。母元を離れて上京", category: "career" },
            { characterId: "nana", age: 20, year: 2020, event: "卒業。コロナ禍で就活が難航するも、都内の認可保育園に就職", category: "career" },
            { characterId: "nana", age: 22, year: 2022, event: "クラス担任を任される。3歳児15名。手作り教材を毎日作る" },
            { characterId: "nana", age: 23, year: 2023, event: "保護者からの苦情対応が増える。「うちの子だけ見てもらえてない」" },
            { characterId: "nana", age: 25, year: 2025, event: "体重が5kg減少。夜眠れない。「自分が頑張らないと子どもたちが困る」と休めない", category: "health" },
            { characterId: "nana", age: 25, year: 2026, event: "【第9話】「火が消えそうです」と来院", category: "turning_point" },
        ],
    },

    // --- EP10: 岩田剛 ---
    {
        character: {
            id: "tsuyoshi",
            name: "岩田剛",
            nameReading: "いわた つよし",
            birthDate: "1976-02-16",
            gender: "male",
            ageAtStory: 50,
            role: "patient",
            episode: 10,
            occupation: "消防署署長",
            birthplace: "静岡県浜松市",
            familySummary: "父(消防署長)、母(公務員)。妻(看護師)、長男(大学生)",
            narrativeCore: [
                "戊戌: 不動の霊山。山は動かない、しかしそれは「変わらない」ことではない",
                "龍高星×2: 実は冒険心を内に秘めている。しかし「消防士」という枠に収めてきた",
                "貫索星×2: 頑固。自分の生き方を変えることへの恐怖",
                "鳳閣星: 表現力。定年後に「伝える」仕事の可能性を示唆",
                "田中健太(戊辰)との対比: 同じ戊土でもスケールが違う",
                "「山は動かない。しかし山の頂には常に雲が流れ、季節ごとに景色が変わる」"
            ],
        },
        meishiki: { characterId: "tsuyoshi", yearGan: "", yearShi: "", monthGan: "", monthShi: "", dayGan: "", dayShi: "" },
        timeline: [
            { characterId: "tsuyoshi", age: 0, year: 1976, event: "静岡県浜松市に生まれる。父は消防署長、母は公務員。「剛」の名は祖父がつけた" },
            { characterId: "tsuyoshi", age: 6, year: 1982, event: "「お父さんみたいになりたい」と作文に書く。運動が得意" },
            { characterId: "tsuyoshi", age: 12, year: 1988, event: "柔道を始める。「動かないこと」の強さを知る" },
            { characterId: "tsuyoshi", age: 18, year: 1994, event: "高校卒業後、消防学校に入学。同期30名中トップの成績", category: "career" },
            { characterId: "tsuyoshi", age: 20, year: 1996, event: "消防署に配属。最初の現場で先輩に「お前は岩のようだ。いい意味でも悪い意味でも」", category: "career" },
            { characterId: "tsuyoshi", age: 25, year: 2001, event: "結婚。妻は看護師。二人とも「命に関わる仕事」同士", category: "family" },
            { characterId: "tsuyoshi", age: 27, year: 2003, event: "長男誕生。「この子にも消防士になってほしい」", category: "family" },
            { characterId: "tsuyoshi", age: 30, year: 2006, event: "隊長に昇進。「俺についてこい」型のリーダーシップ", category: "career" },
            { characterId: "tsuyoshi", age: 35, year: 2011, event: "東日本大震災で派遣。1ヶ月間現地で活動。帰還後、PTSDの兆候", category: "turning_point" },
            { characterId: "tsuyoshi", age: 38, year: 2014, event: "長男が「消防士にはならない。大学に行く」と宣言。初めての価値観の衝突", category: "family" },
            { characterId: "tsuyoshi", age: 42, year: 2018, event: "署長に昇進。デスクワークが増え、現場に出られなくなる", category: "career" },
            { characterId: "tsuyoshi", age: 45, year: 2021, event: "妻に「あなたは山よ。動かないから安心だけど、時々寂しい」と言われる" },
            { characterId: "tsuyoshi", age: 48, year: 2024, event: "定年退職まであと7年。「退職したら何をするんだ」と初めて考える" },
            { characterId: "tsuyoshi", age: 50, year: 2026, event: "【第10話】「定年後の自分が見えない」と来院", category: "turning_point" },
        ],
    },
];

// ============================================================
// メイン実行
// ============================================================

async function main() {
    console.log("🔌 Turso に接続中...");

    // 1. テーブル作成（古いスキーマがある場合はDROP）
    console.log("\n📋 テーブル作成...");
    await turso.execute("PRAGMA foreign_keys = OFF");
    for (const table of ["taiun", "timeline_events", "meishiki", "characters"]) {
        await turso.execute(`DROP TABLE IF EXISTS ${table}`);
    }
    for (const ddl of DDL) {
        await turso.execute(ddl);
    }
    await turso.execute("PRAGMA foreign_keys = ON");
    console.log("  ✅ 4テーブル作成完了");

    // 2. データ投入
    console.log("\n📥 データ投入...");

    for (const p of profiles) {
        const c = p.character;

        // CLI で命式を計算
        const [y, m, d] = c.birthDate.split("-").map(Number);
        const result = calculateSanmei(y, m, d, c.gender);

        // characters テーブル
        await turso.execute({
            sql: `INSERT INTO characters (id, name, name_reading, birth_date, gender, age_at_story, role, episode, occupation, birthplace, family_summary, narrative_core) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                c.id, c.name, c.nameReading ?? null, c.birthDate, c.gender,
                c.ageAtStory, c.role, c.episode ?? null, c.occupation ?? null,
                c.birthplace ?? null, c.familySummary ?? null,
                c.narrativeCore ? JSON.stringify(c.narrativeCore) : null,
            ],
        });

        // meishiki テーブル（CLIから自動計算）
        const i = result.insen;
        const yo = result.yousen;
        await turso.execute({
            sql: `INSERT INTO meishiki (character_id, year_gan, year_shi, month_gan, month_shi, day_gan, day_shi, year_zokan, month_zokan, day_zokan, star_north, star_south, star_east, star_west, star_center, jusei_start, jusei_start_score, jusei_middle, jusei_middle_score, jusei_end, jusei_end_score, energy_total, setsuiri_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                c.id,
                i.year.gan, i.year.shi, i.month.gan, i.month.shi, i.day.gan, i.day.shi,
                i.year.zokan.selected, i.month.zokan.selected, i.day.zokan.selected,
                yo.north, yo.south, yo.east, yo.west, yo.center,
                yo.start.name, yo.start.score,
                yo.middle.name, yo.middle.score,
                yo.end.name, yo.end.score,
                yo.start.score + yo.middle.score + yo.end.score,
                i.setsuiriDay,
            ],
        });

        // timeline_events テーブル
        for (let idx = 0; idx < p.timeline.length; idx++) {
            const t = p.timeline[idx];
            await turso.execute({
                sql: `INSERT INTO timeline_events (character_id, age, year, event, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
                args: [t.characterId, t.age, t.year, t.event, t.category ?? "life", idx],
            });
        }

        // taiun テーブル（CLIから）
        if (result.taiun && result.taiun.list) {
            for (const t of result.taiun.list) {
                await turso.execute({
                    sql: `INSERT INTO taiun (character_id, age, eto, gan, shi, star, jusei) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    args: [c.id, t.age, t.eto, t.gan, t.shi, t.star, t.jusei],
                });
            }
        }

        const dayPillar = i.day.gan + i.day.shi;
        console.log(`  ✅ ${c.name} (EP${c.episode ?? "-"}) ${c.birthDate} → ${dayPillar} | ${yo.start.name}(${yo.start.score})・${yo.middle.name}(${yo.middle.score})・${yo.end.name}(${yo.end.score})`);
    }

    // 4. 検証
    console.log("\n📊 検証...");
    const countChars = await turso.execute("SELECT COUNT(*) as cnt FROM characters");
    const countMeishiki = await turso.execute("SELECT COUNT(*) as cnt FROM meishiki");
    const countTimeline = await turso.execute("SELECT COUNT(*) as cnt FROM timeline_events");
    const countTaiun = await turso.execute("SELECT COUNT(*) as cnt FROM taiun");

    console.log(`  characters:       ${countChars.rows[0].cnt}件`);
    console.log(`  meishiki:         ${countMeishiki.rows[0].cnt}件`);
    console.log(`  timeline_events:  ${countTimeline.rows[0].cnt}件`);
    console.log(`  taiun:            ${countTaiun.rows[0].cnt}件`);

    console.log("\n✨ 完了!");
    turso.close();
}

main().catch((e) => {
    console.error("❌ エラー:", e);
    process.exit(1);
});
