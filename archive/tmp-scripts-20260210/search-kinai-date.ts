import { calculateKanshi } from '../mobile/lib/logic/kanshi';

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 乙亥（木陰）の日柱を持つ1991年生まれの日付を検索
 * - 天中殺: 申酉（日支が寅または卯）
 * - 龍高星がある
 * - 総エネルギー: 15点
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

console.log('1991年の乙亥（木陰）の日付を検索...\n');

// 1991年1月から12月までを検索
for (let month = 1; month <= 12; month++) {
  for (let day = 1; day <= 31; day++) {
    try {
      const date = new Date(1991, month - 1, day, 12, 0, 0);
      
      // 無効な日付はスキップ（例：2月30日）
      if (date.getMonth() !== month - 1) continue;
      
      const result = calculateKanshi({
        birthDate: date,
        gender: 'male',
        longitude: 135,
        includeTaiun: true,
        includeInsen: false
      });
      
      // 日柱が乙亥かチェック
      if (result.bazi.day.name === '乙亥') {
        const dayBranchId = result.bazi.day.branch;
        const hasTenchusatsu = dayBranchId === 3 || dayBranchId === 4; // 寅卯→申酉天中殺
        const hasRyukokoStar = hasRyukoko(result.yangSen);
        const energy15 = result.energyScore === 15;
        
        console.log(`📅 ${date.toISOString().split('T')[0]} (${date.toLocaleDateString('ja-JP')})`);
        console.log(`   日柱: ${result.bazi.day.name}`);
        console.log(`   日支: ${result.bazi.day.branchStr} (ID: ${dayBranchId})`);
        console.log(`   天中殺: ${hasTenchusatsu ? '✓ 申酉' : '✗ ' + (dayBranchId === 3 || dayBranchId === 4 ? '申酉' : 'その他')}`);
        console.log(`   龍高星: ${hasRyukokoStar ? '✓ あり' : '✗ なし'}`);
        console.log(`   エネルギー: ${result.energyScore}点 ${energy15 ? '✓' : '✗'}`);
        console.log(`   十大主星: 頭${result.yangSen.head} 胸${result.yangSen.chest} 左手${result.yangSen.leftHand} 腹${result.yangSen.belly}`);
        
        if (hasTenchusatsu && hasRyukokoStar && energy15) {
          console.log(`   ⭐⭐⭐ 完全一致！⭐⭐⭐`);
        }
        console.log('');
      }
    } catch (e) {
      // 無効な日付をスキップ
    }
  }
}

console.log('検索完了');
