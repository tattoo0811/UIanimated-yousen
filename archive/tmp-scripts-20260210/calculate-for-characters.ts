/**
 * エピソード1-24 キャラクター算命学計算スクリプト
 * mobile/lib/logic を使用して正確な算命学データを計算
 */

import { calculateKanshi } from '../mobile/lib/logic/kanshi';
import type { KanshiResult } from '../mobile/lib/logic/kanshi';

interface CharacterData {
  episode: number;
  name: string;
  name_reading: string;
  age: number;
  birth_date: string;
  occupation: string;
  economic: {
    income: string;
    assets: string;
  };
  family: string;
  sns: {
    twitter: boolean;
    instagram: boolean;
    tiktok: boolean;
  };
  worry: string;
  sanmeigaku: {
    nikkan: string;
    gesshi: string;
    tenchusatsu: string;
    jugdais: string[];
    junidai: string[];
    five_elements: string;
    total_energy: number;
  };
}

// 既存キャラクター（エピソード1-3）
const existingCharacters: CharacterData[] = [
  {
    episode: 1,
    name: "（来院者なし）",
    name_reading: "",
    age: 0,
    birth_date: "",
    occupation: "",
    economic: { income: "", assets: "" },
    family: "",
    sns: { twitter: false, instagram: false, tiktok: false },
    worry: "運命外来の開院と導入",
    sanmeigaku: {
      nikkan: "",
      gesshi: "",
      tenchusatsu: "",
      jugdais: [],
      junidai: [],
      five_elements: "",
      total_energy: 0
    }
  },
  {
    episode: 2,
    name: "佐藤 翔",
    name_reading: "さとう しょう",
    age: 22,
    birth_date: "2003-02-20",
    occupation: "大学4年生、就職活動中",
    economic: { income: "低（親元同居）", assets: "なし" },
    family: "独身、実家暮らし（両親と妹1人）",
    sns: { twitter: true, instagram: true, tiktok: false },
    worry: "就職活動がうまくいかない。自分の適性がわからない",
    sanmeigaku: {
      nikkan: "",
      gesshi: "",
      tenchusatsu: "",
      jugdais: [],
      junidai: [],
      five_elements: "",
      total_energy: 0
    }
  },
  {
    episode: 3,
    name: "双子の姉妹（葵・凛）",
    name_reading: "あおい・りん",
    age: 24,
    birth_date: "1999-11-15",
    occupation: "葵は広告代理店の営業、凛はフリーランスイラストレーター",
    economic: { income: "中（葵350万・凛400万）", assets: "なし" },
    family: "葵は独身、凛は独身（実家から離れて暮らす）",
    sns: { twitter: true, instagram: true, tiktok: false },
    worry: "葵：仕事で結果が出ない。凛：自分の表現に自信が持てない",
    sanmeigaku: {
      nikkan: "",
      gesshi: "",
      tenchusatsu: "",
      jugdais: [],
      junidai: [],
      five_elements: "",
      total_energy: 0
    }
  }
];

// 新規キャラクター（エピソード4-24）
const newCharacters: Omit<CharacterData, 'sanmeigaku'>[] = [
  {
    episode: 4,
    name: "田中 優子",
    name_reading: "たなか ゆうこ",
    age: 28,
    birth_date: "1995-04-18",
    occupation: " OL（派遣社員）",
    economic: { income: "低（年収250万）", assets: "貯金50万" },
    family: "独身、一人暮らし",
    sns: { twitter: false, instagram: true, tiktok: false },
    worry: "同僚との人間関係に疲れている。自分の意見を言えない"
  },
  {
    episode: 5,
    name: "山田 太郎",
    name_reading: "やまだ たろう",
    age: 35,
    birth_date: "1988-07-22",
    occupation: " 中堅企業営業",
    economic: { income: "中（年収600万）", assets: "持ち家（ローン残り2000万）" },
    family: "妻（32歳）、娘（5歳）",
    sns: { twitter: false, instagram: false, tiktok: false },
    worry: "仕事と家庭の両立に疲れている。昇進のプレッシャー"
  },
  {
    episode: 6,
    name: "佐々木 美咲",
    name_reading: "ささき みさき",
    age: 19,
    birth_date: "2004-09-10",
    occupation: "短大1年生",
    economic: { income: "低（バイト月8万）", assets: "なし" },
    family: "実家暮らし（両親、弟）",
    sns: { twitter: true, instagram: true, tiktok: true },
    worry: "進路に迷っている。親の期待に応えられない"
  },
  {
    episode: 7,
    name: "中村 大輔",
    name_reading: "なかむら だいすけ",
    age: 42,
    birth_date: "1981-12-05",
    occupation: " ITエンジニア",
    economic: { income: "高（年収900万）", assets: "株・投資300万" },
    family: "独身、一人暮らし",
    sns: { twitter: true, instagram: false, tiktok: false },
    worry: "技術の変化についていけない。キャリアの先行き不安"
  },
  {
    episode: 8,
    name: "小林 真由",
    name_reading: "こばやし まゆ",
    age: 31,
    birth_date: "1992-03-28",
    occupation: " 保育士",
    economic: { income: "中（年収380万）", assets: "貯金200万" },
    family: "独身、実家暮らし",
    sns: { twitter: false, instagram: true, tiktok: false },
    worry: "結婚への焦り。仕事の忙しさ"
  },
  {
    episode: 9,
    name: "加藤 誠",
    name_reading: "かとう まこと",
    age: 55,
    birth_date: "1968-06-14",
    occupation: "中小企業経営者",
    economic: { income: "中（年収800万）", assets: "自社株式、マンション" },
    family: "妻（52歳）、長女（25歳、就活中）",
    sns: { twitter: false, instagram: false, tiktok: false },
    worry: "事業承継の問題。後継者が見つからない"
  },
  {
    episode: 10,
    name: "松本 愛",
    name_reading: "まつもと あい",
    age: 26,
    birth_date: "1997-08-30",
    occupation: "フリーランスデザイナー",
    economic: { income: "中（年収450万）", assets: "なし" },
    family: "独身、一人暮らし",
    sns: { twitter: true, instagram: true, tiktok: true },
    worry: "クライアント対応のストレス。自分のスタイルが確立できない"
  },
  {
    episode: 11,
    name: "井上 健一",
    name_reading: "いのうえ けんいち",
    age: 48,
    birth_date: "1975-11-20",
    occupation: "公務員",
    economic: { income: "中（年収700万）", assets: "持ち家（ローン完済）、貯金1000万" },
    family: "妻（45歳）、長男（20歳、大学生）、次男（17歳、高校生）",
    sns: { twitter: false, instagram: false, tiktok: false },
    worry: "定年後の生活設計。子供の教育費"
  },
  {
    episode: 12,
    name: "木村 彩花",
    name_reading: "きむら あやか",
    age: 23,
    birth_date: "2000-02-14",
    occupation: "新入社員（商社）",
    economic: { income: "低（年収280万）", assets: "なし" },
    family: "独身、一人暮らし",
    sns: { twitter: true, instagram: true, tiktok: false },
    worry: "職場でのミスが怖い。上司とのコミュニケーション"
  },
  {
    episode: 13,
    name: "林 翔太",
    name_reading: "はやし しょうた",
    age: 33,
    birth_date: "1990-05-08",
    occupation: "飲食店オーナー",
    economic: { income: "低（開業2年目）", assets: "店舗、借入金" },
    family: "独身",
    sns: { twitter: true, instagram: true, tiktok: false },
    worry: "集客が伸びない。資金繰り"
  },
  {
    episode: 14,
    name: "斎藤 舞",
    name_reading: "さいとう まい",
    age: 37,
    birth_date: "1986-10-25",
    occupation: "看護師",
    economic: { income: "中（年収550万）", assets: "貯金500万" },
    family: "独身",
    sns: { twitter: false, instagram: true, tiktok: false },
    worry: "夜勤の健康被害。結婚への焦り"
  },
  {
    episode: 15,
    name: "清水 隆之",
    name_reading: "しみず たかゆき",
    age: 29,
    birth_date: "1994-07-03",
    occupation: "システムエンジニア",
    economic: { income: "中（年収650万）", assets: "貯金300万" },
    family: "独身、一人暮らし",
    sns: { twitter: true, instagram: false, tiktok: false },
    worry: "転職すべきか。専門スキルの不安"
  },
  {
    episode: 16,
    name: "渡辺 和子",
    name_reading: "わたなべ かずこ",
    age: 51,
    birth_date: "1972-04-12",
    occupation: "パートタイム（スーパー）",
    economic: { income: "低（月収15万）", assets: "持ち家" },
    family: "夫（53歳、会社員）、娘（22歳、社会人1年目）",
    sns: { twitter: false, instagram: false, tiktok: false },
    worry: "娘の自立。自分の生きがい"
  },
  {
    episode: 17,
    name: "伊藤 拓哉",
    name_reading: "いとう たくや",
    age: 40,
    birth_date: "1983-09-19",
    occupation: "営業マネージャー",
    economic: { income: "高（年収1000万）", assets: "マンション、株" },
    family: "妻（38歳）、息子（10歳）、娘（7歳）",
    sns: { twitter: false, instagram: false, tiktok: false },
    worry: "部下のマネジメント。仕事へのやりがい"
  },
  {
    episode: 18,
    name: "遠藤 萌",
    name_reading: "えんどう もえ",
    age: 24,
    birth_date: "1999-06-28",
    occupation: "大学院生",
    economic: { income: "低（奨学金・バイト）", assets: "なし（負債あり）" },
    family: "実家暮らし",
    sns: { twitter: true, instagram: true, tiktok: false },
    worry: "研究の行き詰まり。進学か就職か"
  },
  {
    episode: 19,
    name: "武田 健二",
    name_reading: "たけだ けんじ",
    age: 58,
    birth_date: "1965-11-30",
    occupation: "定年間近の会社員",
    economic: { income: "中（年収750万）", assets: "持ち家、貯金2000万" },
    family: "妻（55歳）、長女（29歳、未婚）",
    sns: { twitter: false, instagram: false, tiktok: false },
    worry: "定年後の第二の人生。娘の結婚"
  },
  {
    episode: 20,
    name: "上原 里奈",
    name_reading: "うえはら りな",
    age: 21,
    birth_date: "2002-12-24",
    occupation: "大学生3年生",
    economic: { income: "低（親仕送り）", assets: "なし" },
    family: "実家暮らし（実家は北海道）",
    sns: { twitter: true, instagram: true, tiktok: true },
    worry: "就活への不安。上京しての孤独感"
  },
  {
    episode: 21,
    name: "森田 悠真",
    name_reading: "もりた ゆうま",
    age: 17,
    birth_date: "2007-01-15",
    occupation: "高校2年生",
    economic: { income: "低（親仕送り）", assets: "なし" },
    family: "両親、妹",
    sns: { twitter: true, instagram: true, tiktok: true },
    worry: "進路選択（文系か理系か）。部活との両立"
  },
  {
    episode: 22,
    name: "土屋 美穂",
    name_reading: "つちや みほ",
    age: 44,
    birth_date: "1979-03-17",
    occupation: "主婦（パート経験あり）",
    economic: { income: "低（夫の収入に依存）", assets: "持ち家" },
    family: "夫（46歳、会社員）、長女（18歳、受験生）、長男（15歳）",
    sns: { twitter: false, instagram: true, tiktok: false },
    worry: "夫の転勤で知らない土地へ。子供の進学"
  },
  {
    episode: 23,
    name: "大野 翔",
    name_reading: "おおの しょう",
    age: 30,
    birth_date: "1993-08-05",
    occupation: "フリーター",
    economic: { income: "低（年収200万）", assets: "なし" },
    family: "独身、実家暮らし",
    sns: { twitter: true, instagram: false, tiktok: true },
    worry: "正社員になれない。将来の不安"
  },
  {
    episode: 24,
    name: "菊地 真理子",
    name_reading: "きくち まりこ",
    age: 62,
    birth_date: "1961-10-08",
    occupation: "早期退職してボランティア",
    economic: { income: "中（年金＋退職金）", assets: "持ち家、貯金2500万" },
    family: "夫（65歳、定年後）、孫2人",
    sns: { twitter: false, instagram: false, tiktok: false },
    worry: "夫との時間の過ごし方。生きがい探し"
  }
];

// 算命学を計算して結果を付加
function addSanmeigakuData(characters: typeof newCharacters): CharacterData[] {
  return characters.map(char => {
    const birthDate = new Date(char.birth_date + 'T12:00:00');
    const kanshiResult = calculateKanshi({
      birthDate,
      gender: 'male', // デフォルト
      longitude: 135,
      includeTaiun: false,
      includeInsen: false
    });

    const { bazi, yangSen, energyScore, fiveElements } = kanshiResult;

    // 天中殺判定（簡易版）
    const tenchusatsu = ''; // TODO: 実装

    // 五行バランスを文字列化
    const fiveElementsStr = `木${fiveElements.wood}火${fiveElements.fire}土${fiveElements.earth}金${fiveElements.metal}水${fiveElements.water}`;

    return {
      ...char,
      sanmeigaku: {
        nikkan: bazi.day.stemStr,
        gesshi: bazi.month.branchStr,
        tenchusatsu,
        jugdais: [
          yangSen.head,
          yangSen.rightHand,
          yangSen.chest,
          yangSen.leftHand,
          yangSen.belly
        ],
        junidai: [
          yangSen.leftShoulder.name,
          yangSen.leftLeg.name,
          yangSen.rightLeg.name
        ],
        five_elements: fiveElementsStr,
        total_energy: energyScore
      }
    };
  });
}

// メイン処理
console.log('=== エピソード1-24 キャラクター算命学計算 ===\n');

// 既存キャラクターの算命学を計算
const existingWithSanmeigaku = addSanmeigakuData(
  existingCharacters.filter(c => c.birth_date)
);

console.log('### 既存キャラクター（エピソード1-3）###\n');
existingWithSanmeigaku.forEach(char => {
  console.log(`エピソード${char.episode}: ${char.name}`);
  console.log(`生年月日: ${char.birth_date}`);
  console.log(`日干: ${char.sanmeigaku.nikkan}, 月支: ${char.sanmeigaku.gesshi}`);
  console.log(`十大主星: ${char.sanmeigaku.jugdais.join(', ')}`);
  console.log(`十二大従星: ${char.sanmeigaku.junidai.join(', ')}`);
  console.log(`五行: ${char.sanmeigaku.five_elements}`);
  console.log(`総エネルギー: ${char.sanmeigaku.total_energy}`);
  console.log('---\n');
});

// 新規キャラクターの算命学を計算
const newWithSanmeigaku = addSanmeigakuData(newCharacters);

console.log('### 新規キャラクター（エピソード4-24）###\n');
newWithSanmeigaku.forEach(char => {
  console.log(`エピソード${char.episode}: ${char.name}`);
  console.log(`生年月日: ${char.birth_date}`);
  console.log(`日干: ${char.sanmeigaku.nikkan}, 月支: ${char.sanmeigaku.gesshi}`);
  console.log(`十大主星: ${char.sanmeigaku.jugdais.join(', ')}`);
  console.log(`十二大従星: ${char.sanmeigaku.junidai.join(', ')}`);
  console.log(`五行: ${char.sanmeigaku.five_elements}`);
  console.log(`総エネルギー: ${char.sanmeigaku.total_energy}`);
  console.log('---\n');
});

// JSONファイルに出力
const allCharacters: CharacterData[] = [
  ...existingCharacters.map(c => {
    if (!c.birth_date) return c;
    const withSanmei = existingWithSanmeigaku.find(w => w.name === c.name);
    return withSanmei || c;
  }),
  ...newWithSanmeigaku
];

// JSONファイルに出力
import { writeFileSync } from 'fs';
const outputPath = '/Users/kitamuratatsuhiko/UIanimated/claudedocs/EPISODES-1-24-CHARACTERS.json';
writeFileSync(outputPath, JSON.stringify(allCharacters, null, 2), 'utf-8');

console.log('\n=== JSON出力完了 ===');
console.log(`出力先: ${outputPath}`);
console.log(`総キャラクター数: ${allCharacters.length}`);

export { allCharacters };
