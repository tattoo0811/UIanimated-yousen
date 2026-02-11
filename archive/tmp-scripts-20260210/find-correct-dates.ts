/**
 * 正しい誕生日を見つけるスクリプト
 * 目標の六十干支になるように、誕生日を調整
 */

import { calculateKanshi } from '@/lib/logic';

// 目標の六十干支と天中殺
const targets = [
  { episode: 49, name: "大輝", target: "申酉天中殺", age: 28 },
  { episode: 54, name: "源田耕造", target: "癸亥", age: 60 },
  { episode: 64, name: "藤堂慧", target: "庚午", age: 34 },
  { episode: 62, name: "佐々木玲奈", target: "天中殺なし", age: 35 },
  { episode: 66, name: "大野翔", target: "辛卯", age: 23 }
];

console.log('# 目標の六十干支・天中殺を持つ誕生日を検索\n');

targets.forEach(t => {
  console.log(`## ${t.name} (エピソード${t.episode}, ${t.age}歳)`);
  console.log(`目標: ${t.target}`);

  // 年齢から生年を推定
  const currentYear = 2026;
  const birthYear = currentYear - t.age;

  // 1年間の色々な日付を試す
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 28; day++) {
      const testDate = new Date(`${birthYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`);

      const result = calculateKanshi({
        birthDate: testDate,
        gender: 'male',
        longitude: 135,
        includeTaiun: false,
        includeInsen: true
      });

      const dayName = result.bazi.day.name;
      const tenchusatsu = result.insen?.tenchusatsu.type || '';
      const missingBranches = result.insen?.tenchusatsu.missingBranches || [];

      let match = false;
      if (t.target === "天中殺なし" && missingBranches.length === 0) {
        match = true;
        console.log(`  ✓ ${testDate.toISOString().split('T')[0]} → ${dayName} (${result.bazi.day.id}番目), 天中殺なし`);
        break;
      } else if (dayName === t.target) {
        match = true;
        console.log(`  ✓ ${testDate.toISOString().split('T')[0]} → ${dayName} (${result.bazi.day.id}番目), ${tenchusatsu}`);
        break;
      } else if (tenchusatsu === t.target) {
        match = true;
        console.log(`  ✓ ${testDate.toISOString().split('T')[0]} → ${dayName} (${result.bazi.day.id}番目), ${tenchusatsu}`);
        break;
      }

      if (match && day === 28) {
        break;
      }
    }
  }

  console.log('');
});

export {};
