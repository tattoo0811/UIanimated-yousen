import { calculateKanshi } from '../mobile/lib/logic/kanshi';

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 完全条件に合う生年月日を検索
 * - 日柱: 乙亥（木陰）
 * - 天中殺: 申酉（日支が寅または卯）
 * - 龍高星がある
 * - 総エネルギー: 15点
 * - 年齢: 35歳前後（2026年時点→1990-1991年生まれ）
 */

function hasRyukoko(yangSen: any): boolean {
  const positions = [
    yangSen.head,
    yangSen.chest,
    yangSen.leftHand,
    yangSen.belly
  ];
  return positions.includes('龍高星');
}

console.log('完全条件に合う生年月日を検索（1988-1994年）\n');

const targetYear = 2026 - 35; // 1991
const searchYears = [1988, 1989, 1990, 1991, 1992, 1993, 1994];

for (const year of searchYears) {
  console.log(`\n═══════════════════════════════════════`);
  console.log(`${year}年の検索結果`);
  console.log(`═══════════════════════════════════════\n`);
  
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      try {
        const date = new Date(year, month - 1, day, 12, 0, 0);
        
        // 無効な日付はスキップ
        if (date.getMonth() !== month - 1) continue;
        
        const result = calculateKanshi({
          birthDate: date,
          gender: 'male',
          longitude: 135,
          includeTaiun: false,
          includeInsen: false
        });
        
        // 日支が寅または卯（申酉天中殺）
        const dayBranchId = result.bazi.day.branch;
        const hasTenchusatsu = dayBranchId === 3 || dayBranchId === 4; // 寅卯
        const hasRyukokoStar = hasRyukoko(result.yangSen);
        const energy15 = result.energyScore === 15;
        
        // 条件に合うものだけ表示
        if (hasTenchusatsu && hasRyukokoStar && energy15) {
          const age = 2026 - year;
          console.log(`📅 ${date.toISOString().split('T')[0]} (${date.toLocaleDateString('ja-JP')}) - ${age}歳`);
          console.log(`   日柱: ${result.bazi.day.name}`);
          console.log(`   日支: ${result.bazi.day.branchStr} (ID: ${dayBranchId}) → 天中殺: 申酉 ✓`);
          console.log(`   龍高星: ✓ あり`);
          console.log(`   エネルギー: ${result.energyScore}点 ✓`);
          console.log(`   十大主星: 頭${result.yangSen.head} 胸${result.yangSen.chest} 左手${result.yangSen.leftHand} 腹${result.yangSen.belly}`);
          console.log('');
        }
      } catch (e) {
        // 無効な日付をスキップ
      }
    }
  }
}

console.log('検索完了');
