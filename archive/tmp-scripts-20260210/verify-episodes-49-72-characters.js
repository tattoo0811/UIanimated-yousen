/**
 * エピソード49-72 キャラクター検証スクリプト
 * calculateKanshi関数を使って、各キャラクターの天中殺と干支を検証
 */

const characters = [
  { episode: 49, name: "大輝", birth_date: "1996-08-15T14:30:00", expected_tenchusatsu: "申酉天中殺" },
  { episode: 50, name: "蒼空", birth_date: "1998-03-10T16:45:00", expected_tenchusatsu: "申酉天中殺" },
  { episode: 51, name: "美咲", birth_date: "1989-11-05T12:00:00", expected_tenchusatsu: "申酉天中殺" },
  { episode: 52, name: "松井", birth_date: "1983-07-22T09:30:00", expected_tenchusatsu: "申酉天中殺" },
  { episode: 53, name: "真由", birth_date: "1995-02-14T15:20:00", expected_tenchusatsu: "申酉天中殺" },
  { episode: 54, name: "源田耕造", birth_date: "1964-11-12T08:00:00", expected_tenchusatsu: "戌亥天中殺", expected_rokujukkoushi: "癸亥" },
  { episode: 55, name: "橘純子", birth_date: "1962-08-04T11:30:00", expected_tenchusatsu: "午未天中殺", expected_rokujukkoushi: "壬申" },
  { episode: 56, name: "中島直人", birth_date: "1990-07-08T13:45:00", expected_tenchusatsu: "午未天中殺", expected_rokujukkoushi: "辛未" },
  { episode: 57, name: "山田茂", birth_date: "1959-09-09T10:00:00", expected_tenchusatsu: "申酉天中殺", expected_rokujukkoushi: "己酉" },
  { episode: 58, name: "早川奈々", birth_date: "1999-08-16T14:20:00", expected_tenchusatsu: "午未天中殺", expected_rokujukkoushi: "甲申" },
  { episode: 59, name: "村田梅", birth_date: "1959-01-01T06:00:00", expected_tenchusatsu: "戌亥天中殺", expected_rokujukkoushi: "庚子" },
  { episode: 60, name: "小林翔太", birth_date: "1992-03-15T12:00:00", expected_tenchusatsu: "寅卯天中殺", expected_rokujukkoushi: "乙卯" },
  { episode: 61, name: "上原芳子", birth_date: "1964-12-07T16:30:00", expected_tenchusatsu: "戌亥天中殺", expected_rokujukkoushi: "壬子" },
  { episode: 62, name: "佐々木玲奈", birth_date: "1989-08-21T19:45:00", expected_tenchusatsu: "なし", expected_rokujukkoushi: "甲申" },
  { episode: 63, name: "山本慎太郎", birth_date: "1993-03-27T10:15:00", expected_tenchusatsu: "寅卯天中殺", expected_rokujukkoushi: "乙卯" },
  { episode: 64, name: "藤堂慧", birth_date: "1990-06-11T11:30:00", expected_tenchusatsu: "午未天中殺", expected_rokujukkoushi: "庚午" },
  { episode: 65, name: "松本奏", birth_date: "1997-02-18T13:00:00", expected_tenchusatsu: "子丑天中殺", expected_rokujukkoushi: "丁丑" },
  { episode: 66, name: "大野翔&颯太", birth_date: "2001-04-12T03:30:00", expected_tenchusatsu: "寅卯天中殺", expected_rokujukkoushi: "辛卯" },
  { episode: 67, name: "水野健一", birth_date: "1995-12-25T14:00:00", expected_tenchusatsu: "なし", expected_rokujukkoushi: "癸酉" },
  { episode: 68, name: "工藤遥", birth_date: "1999-05-28T02:00:00", expected_tenchusatsu: "辰巳天中殺", expected_rokujukkoushi: "己巳" },
  { episode: 69, name: "大杉美和子", birth_date: "1996-10-15T23:00:00", expected_tenchusatsu: "戌亥天中殺", expected_rokujukkoushi: "丙戌" },
  { episode: 70, name: "宮本蓮", birth_date: "1995-01-22T22:00:00", expected_tenchusatsu: "子丑天中殺", expected_rokujukkoushi: "乙丑" },
  { episode: 71, name: "神崎舞", birth_date: "2002-07-30T12:00:00", expected_tenchusatsu: "午未天中殺", expected_rokujukkoushi: "壬午" },
  { episode: 72, name: "秋山翔", birth_date: "1998-03-08T10:00:00", expected_tenchusatsu: "寅卯天中殺", expected_rokujukkoushi: "壬寅" }
];

console.log('# エピソード49-72 キャラクター検証\n');
console.log('注意: この検証には実際にcalculateKanshi()関数を実行する必要があります。\n');

characters.forEach((char, index) => {
  console.log(`## ${index + 1}. ${char.name} (エピソード${char.episode})`);
  console.log(`- 誕生日: ${char.birth_date}`);
  console.log(`- 期待天中殺: ${char.expected_tenchusatsu}`);
  if (char.expected_rokujukkoushi) {
    console.log(`- 期待六十干支: ${char.expected_rokujukkoushi}`);
  }
  console.log('');
});

console.log('\n## 検証方法');
console.log('TypeScriptファイルで以下のコードを実行して、実際に命式を計算してください：\n');
console.log('```typescript');
console.log("import { calculateKanshi } from '@/lib/logic';");
console.log('');
console.log('const result = calculateKanshi({');
console.log('  birthDate: new Date("1996-08-15T14:30:00"),');
console.log('  gender: "male",');
console.log('  longitude: 135,');
console.log('  includeTaiun: false,');
console.log('  includeInsen: true');
console.log('});');
console.log('');
console.log("console.log('日柱:', result.bazi.day.name);");
console.log("console.log('天中殺:', result.insen.tenchusatsu.type);");
console.log("console.log('六十干支:', result.bazi.day.name, '(' + result.bazi.day.id + '番目)');");
console.log('```');

export {};
