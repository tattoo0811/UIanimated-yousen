// Search for optimal combination with different 天中殺
import { calculateBaZi } from '../accurate-logic/src/index';
import { calculateYangSen } from '../accurate-logic/src/yangsen';

function getTenchusatsu(yearBranch: string): string {
  const tensuMap: { [key: string]: string } = {
    '子': '申酉',
    '丑': '申酉',
    '寅': '亥子',
    '卯': '亥子',
    '辰': '寅卯',
    '巳': '寅卯',
    '午': '寅卯',
    '未': '申酉',
    '申': '巳午',
    '酉': '巳午',
    '戌': '辰巳',
    '亥': '辰巳'
  };
  return tensuMap[yearBranch] || '';
}

console.log('========== 最適な組み合わせを探す ==========\n');

// 慧の候補（1990年生まれ・庚午日）
console.log('【慧】1990年生まれ・庚午日');
const keiCandidates = [
  '1990-01-05', '1990-03-06', '1990-05-05', '1990-07-04',
  '1990-09-02', '1990-11-01', '1990-12-31'
];

console.log('日付\t\t年柱\t月柱\t天中殺\t陽占');
console.log('────────────────────────────────────────────────');
const keiData = [];

keiCandidates.forEach(date => {
  const bazi = calculateBaZi(new Date(date + 'T12:00:00'), 135);
  const yangSen = calculateYangSen(bazi, new Date(date + 'T12:00:00'));
  const tensu = getTenchusatsu(bazi.year.branchStr);
  const mainStars = `${yangSen.leftShoulder.name}(${yangSen.leftShoulder.score})・${yangSen.rightLeg.name}(${yangSen.rightLeg.score})`;

  console.log(`${date}\t${bazi.year.name}\t${bazi.month.name}\t${tensu}\t${mainStars}`);
  keiData.push({ date, bazi, yangSen, tensu, mainStars });
});

// 巡の候補（1991年生まれ・辛未日）
console.log('\n【巡】1991年生まれ・辛未日');
console.log('日付\t\t年柱\t月柱\t天中殺\t陽占');
console.log('────────────────────────────────────────────────');

// Search for 辛未 in 1991
const meguruCandidates = [];

for (let month = 1; month <= 12; month++) {
  for (let day = 1; day <= 31; day++) {
    try {
      const dateStr = `1991-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`;
      const birth = new Date(dateStr);
      const bazi = calculateBaZi(birth, 135);

      if (bazi.day.stemStr === '辛' && bazi.day.branchStr === '未') {
        meguruCandidates.push(dateStr.substring(0, 10));
      }
    } catch (e) {
      // Invalid date, skip
    }
  }
}

const meguruData = [];

meguruCandidates.forEach(date => {
  const bazi = calculateBaZi(new Date(date + 'T12:00:00'), 135);
  const yangSen = calculateYangSen(bazi, new Date(date + 'T12:00:00'));
  const tensu = getTenchusatsu(bazi.year.branchStr);
  const mainStars = `${yangSen.leftShoulder.name}(${yangSen.leftShoulder.score})・${yangSen.rightLeg.name}(${yangSen.rightLeg.score})`;

  console.log(`${date}\t${bazi.year.name}\t${bazi.month.name}\t${tensu}\t${mainStars}`);
  meguruData.push({ date, bazi, yangSen, tensu, mainStars });
});

console.log('\n========== おすすめの組み合わせ ==========');
console.log('天中殺の補完関係: 慧（寅卯）× 巡（申酉）');
console.log('「早生まれ」で2009年入学の同級生\n');

// 最適な組み合わせを提案（陽占の違いを考慮）
console.log('【候補1】陽占の差異を最大化');
console.log('慧: 1990-09-02 天恍星(7)・天禄星(11)');
console.log('巡: 1991-05-XX（要確認）');
