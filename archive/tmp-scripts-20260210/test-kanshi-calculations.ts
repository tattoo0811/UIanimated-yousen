/**
 * エピソード49-72 キャラクター設計用テストスクリプト
 * calculateKanshi関数を使って、意図的な天中殺・十大主星を持つキャラクターを設計
 */

// テスト用誕生日パターン（エピソードテーマに合わせた設定）
const testDates = [
  // エピソード49: 申酉天中殺の停滞
  { date: '1995-08-15T14:30:00', gender: 'male' as const, label: '申酉天中殺' },
  { date: '1988-09-20T10:00:00', gender: 'female' as const, label: '申酉天中殺' },

  // エピソード50: 天中殺脱出の計
  { date: '1992-03-10T16:45:00', gender: 'male' as const, label: '天中殺脱出前後' },

  // エピソード51: 天中殺と再婚
  { date: '1980-11-05T12:00:00', gender: 'female' as const, label: '再婚' },

  // エピソード52: 天中殺と起業
  { date: '1985-07-22T09:30:00', gender: 'male' as const, label: '起業' },

  // エピソード53: 天中殺と死別
  { date: '1978-02-14T15:20:00', gender: 'female' as const, label: '死別' },

  // エピソード54: 癸亥（60番目の干支）・還暦
  { date: '1964-11-12T08:00:00', gender: 'male' as const, label: '癸亥還暦' },

  // エピソード55: 壬申（39番目の干支）・夫婦関係
  { date: '1992-08-04T11:30:00', gender: 'female' as const, label: '壬申' },

  // エピソード56: 辛未（8番目の干支）・AI時代
  { date: '1991-07-08T13:45:00', gender: 'male' as const, label: '辛未' },

  // エピソード57: 己酉（46番目の干支）・定年後
  { date: '1963-09-09T10:00:00', gender: 'male' as const, label: '己酉' },

  // エピソード58: 甲申（21番目の干支）・自己表現
  { date: '1994-08-16T14:20:00', gender: 'female' as const, label: '甲申' },

  // エピソード59: 庚子（37番目の干支）・孤独
  { date: '1960-01-01T06:00:00', gender: 'female' as const, label: '庚子' },

  // エピソード60: 乙卯（52番目の干支）・転職
  { date: '1991-03-15T12:00:00', gender: 'male' as const, label: '乙卯' },

  // エピソード61: 壬子（49番目の干支）・生涯学習
  { date: '1962-12-07T16:30:00', gender: 'female' as const, label: '壬子' },

  // エピソード62: 甲申（四回産）・天中殺なし
  { date: '1989-08-21T19:45:00', gender: 'female' as const, label: '四回産' },

  // エピソード63: 三合会局（亥卯未）
  { date: '1993-03-27T10:15:00', gender: 'male' as const, label: '三合会局' },

  // エピソード64: 方冲（子午冲）
  { date: '1990-06-11T11:30:00', gender: 'male' as const, label: '子午冲' },

  // エピソード65: 干合（乙庚合）
  { date: '1991-02-18T13:00:00', gender: 'female' as const, label: '乙庚合' },

  // エピソード66: 双生児
  { date: '1995-04-12T03:30:00', gender: 'male' as const, label: '双生児A' },
  { date: '1995-04-12T03:35:00', gender: 'male' as const, label: '双生児B' },

  // エピソード67: 天中殺なし
  { date: '1992-12-25T14:00:00', gender: 'female' as const, label: '天中殺なし' },

  // エピソード68: 早産
  { date: '1994-05-28T02:00:00', gender: 'male' as const, label: '早産' },

  // エピソード69: 過期産
  { date: '1993-10-15T23:00:00', gender: 'female' as const, label: '過期産' },

  // エピソード70: 逆位誕生
  { date: '1990-01-22T22:00:00', gender: 'male' as const, label: '逆位' },

  // エピソード71: 不妊治療
  { date: '1996-07-30T12:00:00', gender: 'female' as const, label: '不妊治療' },

  // エピソード72: 里親
  { date: '1992-03-08T10:00:00', gender: 'male' as const, label: '里親' },
];

console.log('# エピソード49-72 キャラクター命式計画\n');

testDates.forEach((test, index) => {
  console.log(`## ${test.label}`);
  console.log(`- 誕生日: ${test.date}`);
  console.log(`- 性別: ${test.gender}`);
  console.log('');
});

export {};
