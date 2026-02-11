/**
 * キャラクター陽占タイプ対応表の検証
 * 生年月日から六十干支を計算し、バイラルキャラクターと照合
 */

import { calculateKanshi } from '../mobile/lib/logic/kanshi';
import viralCharacters from '../mobile/src/data/viral-characters.json';

interface CharacterMatch {
  episode: number;
  name: string;
  birth_date: string;
  rokujukkoushi: {
    year: string;
    month: string;
    day: string;
  };
  yangsenType: string;
  viralCharacter: any;
  jugdais: string[];
}

// キャラクターデータ
const characters = [
  { episode: 2, name: "佐藤 翔", birth_date: "2003-02-20" },
  { episode: 3, name: "双子の姉妹", birth_date: "1999-11-15" },
  { episode: 4, name: "田中 優子", birth_date: "1995-04-18" },
  { episode: 5, name: "山田 太郎", birth_date: "1988-07-22" },
  { episode: 6, name: "佐々木 美咲", birth_date: "2004-09-10" },
  { episode: 7, name: "中村 大輔", birth_date: "1981-12-05" },
  { episode: 8, name: "小林 真由", birth_date: "1992-03-28" },
  { episode: 9, name: "加藤 誠", birth_date: "1968-06-14" },
  { episode: 10, name: "松本 愛", birth_date: "1997-08-30" },
  { episode: 11, name: "井上 健一", birth_date: "1975-11-20" },
  { episode: 12, name: "木村 彩花", birth_date: "2000-02-14" },
  { episode: 13, name: "林 翔太", birth_date: "1990-05-08" },
  { episode: 14, name: "斎藤 舞", birth_date: "1986-10-25" },
  { episode: 15, name: "清水 隆之", birth_date: "1994-07-03" },
  { episode: 16, name: "渡辺 和子", birth_date: "1972-04-12" },
  { episode: 17, name: "伊藤 拓哉", birth_date: "1983-09-19" },
  { episode: 18, name: "遠藤 萌", birth_date: "1999-06-28" },
  { episode: 19, name: "武田 健二", birth_date: "1965-11-30" },
  { episode: 20, name: "上原 里奈", birth_date: "2002-12-24" },
  { episode: 21, name: "森田 悠真", birth_date: "2007-01-15" },
  { episode: 22, name: "土屋 美穂", birth_date: "1979-03-17" },
  { episode: 23, name: "大野 翔", birth_date: "1993-08-05" },
  { episode: 24, name: "菊地 真理子", birth_date: "1961-10-08" }
];

// 六十干支から陽占タイプを検索
function findViralCharacter(rokujukkoushi: string): any {
  return viralCharacters.characters.find((vc: any) => vc.name === rokujukkoushi);
}

// 検証実行
const results: CharacterMatch[] = [];

characters.forEach(char => {
  const birthDate = new Date(char.birth_date + 'T12:00:00');
  const kanshiResult = calculateKanshi({
    birthDate,
    gender: 'male',
    longitude: 135,
    includeTaiun: false,
    includeInsen: false
  });

  const dayKanshi = kanshiResult.bazi.day.name;
  const viralChar = findViralCharacter(dayKanshi);

  results.push({
    episode: char.episode,
    name: char.name,
    birth_date: char.birth_date,
    rokujukkoushi: {
      year: kanshiResult.bazi.year.name,
      month: kanshiResult.bazi.month.name,
      day: dayKanshi
    },
    yangsenType: dayKanshi,
    viralCharacter: viralChar,
    jugdais: [
      kanshiResult.yangSen.head,
      kanshiResult.yangSen.rightHand,
      kanshiResult.yangSen.chest,
      kanshiResult.yangSen.leftHand,
      kanshiResult.yangSen.belly
    ]
  });
});

// 結果出力
console.log('=== キャラクター陽占タイプ対応表 ===\n');

results.forEach(result => {
  console.log(`エピソード${result.episode}: ${result.name}`);
  console.log(`生年月日: ${result.birth_date}`);
  console.log(`六十干支: 年${result.rokujukkoushi.year} 月${result.rokujukkoushi.month} 日${result.rokujukkoushi.day}`);
  console.log(`陽占タイプ: ${result.yangsenType}`);

  if (result.viralCharacter) {
    console.log(`バイラルキャラクター: ${result.viralCharacter.character_name}`);
    console.log(`コアスタイル: ${result.viralCharacter.core_style.viral_expression.substring(0, 60)}...`);
  } else {
    console.log('⚠️ バイラルキャラクター未対応');
  }

  console.log(`十大主星: ${result.jugdais.join(' → ')}`);
  console.log('---\n');
});

// 陽占タイプの多様性を確認
const typeCount = results.reduce((acc, r) => {
  acc[r.yangsenType] = (acc[r.yangsenType] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('### 陽占タイプの分布 ###');
Object.entries(typeCount)
  .sort(([, a], [, b]) => b - a)
  .forEach(([type, count]) => {
    console.log(`${type}: ${count}人`);
  });

const uniqueCount = Object.keys(typeCount).length;
console.log(`\nユニークタイプ数: ${uniqueCount} / ${results.length}`);
console.log(`多様性スコア: ${Math.round((uniqueCount / results.length) * 100)}%`);

export { results };
