/**
 * 算命学統計解析スクリプト
 *
 * 使用方法:
 * npx tsx .tmp/scripts/sanmeigaku/stats-analysis.ts
 */

import fs from 'fs';
import path from 'path';

// 型定義
interface Character {
  episode: number;
  name: string;
  name_kana: string;
  birth_date: string;
  gender?: 'male' | 'female';
  age?: number;
  profession?: string;
  sanmeigaku: {
    nikkan: string;
    tenchusatsu: string;
    five_elements?: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    stars?: string[];
    energy_score?: number;
  };
}

/**
 * 年齢を計算
 */
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * 年齢層を取得
 */
function getAgeGroup(age: number): string {
  if (age < 20) return '10代';
  if (age < 30) return '20代';
  if (age < 40) return '30代';
  if (age < 50) return '40代';
  return '50代+';
}

/**
 * メイン処理
 */
async function main() {
  console.log('📊 算命学統計解析開始...\n');

  // 全キャラクターファイルを読み込み
  const files = [
    'EPISODES-1-24-CHARACTERS.json',
    'EPISODES-25-48-CHARACTERS.json',
    'EPISODES-49-72-CHARACTERS.json',
    'EPISODES-73-96-CHARACTERS.json'
  ];

  const allCharacters: Character[] = [];
  const missingFiles: string[] = [];

  for (const file of files) {
    const filePath = path.join(process.cwd(), 'claudedocs', file);

    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      allCharacters.push(...data.characters);
    } catch (error) {
      console.error(`❌ ${file} の読み込みに失敗:`, error);
    }
  }

  if (missingFiles.length > 0) {
    console.log(`\n⚠️  以下のファイルがまだ作成されていません:`);
    missingFiles.forEach(f => console.log(`   - ${f}`));
    console.log('\nデザインチームの作業完了をお待ちください。\n');
    return;
  }

  console.log(`📊 全キャラクター数: ${allCharacters.length}名\n`);

  // === 1. 日干分布 ===
  console.log('## 1. 日干分布\n');

  const nikkanCounts: Record<string, number> = {};
  const nikkans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  nikkans.forEach(n => nikkanCounts[n] = 0);
  allCharacters.forEach(c => {
    nikkanCounts[c.sanmeigaku.nikkan] = (nikkanCounts[c.sanmeigaku.nikkan] || 0) + 1;
  });

  console.log('| 日干 | 人数 | 割合 |');
  console.log('|------|------|------|');
  nikkans.forEach(n => {
    const count = nikkanCounts[n];
    const percentage = ((count / allCharacters.length) * 100).toFixed(1);
    const status = count >= 8 && count <= 12 ? '✅' : '⚠️';
    console.log(`| ${n} | ${count} | ${percentage}% | ${status} |`);
  });

  // === 2. 天中殺分布 ===
  console.log('\n## 2. 天中殺分布\n');

  const tenchusatsuCounts: Record<string, number> = {};
  const tenchusatsuList = [
    '子丑天中殺', '寅卯天中殺', '辰巳天中殺',
    '午未天中殺', '申酉天中殺', '戌亥天中殺'
  ];

  tenchusatsuList.forEach(t => tenchusatsuCounts[t] = 0);
  allCharacters.forEach(c => {
    tenchusatsuCounts[c.sanmeigaku.tenchusatsu] =
      (tenchusatsuCounts[c.sanmeigaku.tenchusatsu] || 0) + 1;
  });

  console.log('| 天中殺 | 人数 | 割合 |');
  console.log('|--------|------|------|');
  tenchusatsuList.forEach(t => {
    const count = tenchusatsuCounts[t];
    const percentage = ((count / allCharacters.length) * 100).toFixed(1);
    const status = count >= 13 && count <= 19 ? '✅' : '⚠️';
    console.log(`| ${t} | ${count} | ${percentage}% | ${status} |`);
  });

  // === 3. 年齢層分布 ===
  console.log('\n## 3. 年齢層分布\n');

  const ageDistribution: Record<string, number> = {
    '10代': 0,
    '20代': 0,
    '30代': 0,
    '40代': 0,
    '50代+': 0
  };

  allCharacters.forEach(c => {
    const age = calculateAge(c.birth_date);
    const ageGroup = getAgeGroup(age);
    ageDistribution[ageGroup]++;
  });

  console.log('| 年齢層 | 人数 | 割合 |');
  console.log('|--------|------|------|');
  Object.entries(ageDistribution).forEach(([ageGroup, count]) => {
    const percentage = ((count / allCharacters.length) * 100).toFixed(1);
    console.log(`| ${ageGroup} | ${count} | ${percentage}% |`);
  });

  // === 4. 職業の多様性 ===
  console.log('\n## 4. 職業の多様性\n');

  const professions = allCharacters
    .map(c => c.profession)
    .filter((p): p is string => p != null);

  const uniqueProfessions = new Set(professions);
  const professionCounts: Record<string, number> = {};

  professions.forEach(p => {
    professionCounts[p] = (professionCounts[p] || 0) + 1;
  });

  console.log(`**総職業数**: ${uniqueProfessions.size}種類\n`);
  console.log(`**目標**: 30種類以上 ${uniqueProfessions.size >= 30 ? '✅' : '⚠️'}\n`);

  // 重複する職業を表示
  const duplicatedProfessions = Object.entries(professionCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);

  if (duplicatedProfessions.length > 0) {
    console.log('**重複する職業（2回以上）**:\n');
    duplicatedProfessions.forEach(([profession, count]) => {
      console.log(`- ${profession}: ${count}回`);
    });
    console.log('');
  }

  // 職業リスト（アルファベット順）
  console.log('**全職業リスト**:\n');
  Array.from(uniqueProfessions)
    .sort()
    .forEach(p => console.log(`- ${p}`));

  // === 5. 性別分布 ===
  console.log('\n## 5. 性別分布\n');

  const genderCounts: Record<string, number> = {
    male: 0,
    female: 0,
    unknown: 0
  };

  allCharacters.forEach(c => {
    if (c.gender === 'male') genderCounts.male++;
    else if (c.gender === 'female') genderCounts.female++;
    else genderCounts.unknown++;
  });

  console.log('| 性別 | 人数 | 割合 |');
  console.log('|------|------|------|');
  console.log(`| 男性 | ${genderCounts.male} | ${((genderCounts.male / allCharacters.length) * 100).toFixed(1)}% |`);
  console.log(`| 女性 | ${genderCounts.female} | ${((genderCounts.female / allCharacters.length) * 100).toFixed(1)}% |`);
  if (genderCounts.unknown > 0) {
    console.log(`| 不明 | ${genderCounts.unknown} | ${((genderCounts.unknown / allCharacters.length) * 100).toFixed(1)}% |`);
  }

  // === 6. エネルギー点数分布 ===
  console.log('\n## 6. エネルギー点数分布\n');

  const energyScores = allCharacters
    .map(c => c.sanmeigaku.energy_score)
    .filter((s): s is number => s != null);

  if (energyScores.length > 0) {
    const avg = energyScores.reduce((a, b) => a + b, 0) / energyScores.length;
    const min = Math.min(...energyScores);
    const max = Math.max(...energyScores);

    console.log(`**平均**: ${avg.toFixed(1)}点`);
    console.log(`**最小**: ${min}点`);
    console.log(`**最大**: ${max}点`);
    console.log(`**範囲**: ${max - min}点\n`);

    // ヒストグラム
    const histogram: Record<string, number> = {};
    energyScores.forEach(score => {
      const bucket = Math.floor(score / 5) * 5;
      const key = `${bucket}-${bucket + 4}`;
      histogram[key] = (histogram[key] || 0) + 1;
    });

    console.log('| 点数範囲 | 人数 |');
    console.log('|----------|------|');
    Object.keys(histogram)
      .sort()
      .forEach(key => {
        console.log(`| ${key} | ${histogram[key]} |`);
      });
  }

  // 統計結果をJSONで出力
  const outputPath = path.join(process.cwd(), '.tmp', 'statistics-results.json');
  const statistics = {
    total: allCharacters.length,
    nikkanDistribution: nikkanCounts,
    tenchusatsuDistribution: tenchusatsuCounts,
    ageDistribution,
    professionCount: uniqueProfessions.size,
    professions: Array.from(uniqueProfessions).sort(),
    genderDistribution: genderCounts,
    energyScoreDistribution: {
      average: energyScores.length > 0 ? energyScores.reduce((a, b) => a + b, 0) / energyScores.length : null,
      min: energyScores.length > 0 ? Math.min(...energyScores) : null,
      max: energyScores.length > 0 ? Math.max(...energyScores) : null
    }
  };

  fs.writeFileSync(outputPath, JSON.stringify(statistics, null, 2));
  console.log(`\n📄 統計結果: ${outputPath}\n`);
}

main().catch(console.error);
