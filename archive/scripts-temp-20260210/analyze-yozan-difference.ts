// Analyze 陽占 differences for different date combinations
import { calculateBaZi } from '../accurate-logic/src/index';
import { calculateYangSen } from '../accurate-logic/src/yangsen';

console.log('========== 陽占トータルの違いを分析 ==========\n');

const candidates = {
  gengWu: [
    { date: '1990-01-05', year: '己巳', month: '丁丑', day: '庚午' },
    { date: '1990-03-06', year: '庚午', month: '己卯', day: '庚午' },
    { date: '1990-05-05', year: '庚午', month: '庚辰', day: '庚午' },
    { date: '1990-07-04', year: '庚午', month: '壬午', day: '庚午' },
    { date: '1990-09-02', year: '庚午', month: '甲申', day: '庚午' },
    { date: '1990-11-01', year: '庚午', month: '丙戌', day: '庚午' },
  ],
  xinWei: [
    { date: '1990-01-06', year: '己巳', month: '丁丑', day: '辛未' },
    { date: '1990-03-07', year: '庚午', month: '己卯', day: '辛未' },
    { date: '1990-05-06', year: '庚午', month: '辛巳', day: '辛未' },
    { date: '1990-07-05', year: '庚午', month: '壬午', day: '辛未' },
    { date: '1990-09-03', year: '庚午', month: '甲申', day: '辛未' },
    { date: '1990-11-02', year: '庚午', month: '丙戌', day: '辛未' },
  ]
};

// 天中殺を計算する関数
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

console.log('【慧】庚午の日');
console.log('日付\t\t年柱\t月柱\t天中殺\t陽占\t\tエネルギー');
console.log('────────────────────────────────────────────────────────────────');

candidates.gengWu.forEach(c => {
  const bazi = calculateBaZi(new Date(c.date + 'T12:00:00'), 135);
  const yangSen = calculateYangSen(bazi, new Date(c.date + 'T12:00:00'));
  const tensu = getTenchusatsu(bazi.year.branchStr);
  const mainStars = `${yangSen.leftShoulder.name}(${yangSen.leftShoulder.score})・${yangSen.rightLeg.name}(${yangSen.rightLeg.score})`;

  console.log(`${c.date}\t${c.year}\t${c.month}\t${tensu}\t${mainStars}`);
});

console.log('\n【巡】辛未の日');
console.log('日付\t\t年柱\t月柱\t天中殺\t陽占\t\tエネルギー');
console.log('────────────────────────────────────────────────────────────────');

candidates.xinWei.forEach(c => {
  const bazi = calculateBaZi(new Date(c.date + 'T12:00:00'), 135);
  const yangSen = calculateYangSen(bazi, new Date(c.date + 'T12:00:00'));
  const tensu = getTenchusatsu(bazi.year.branchStr);
  const mainStars = `${yangSen.leftShoulder.name}(${yangSen.leftShoulder.score})・${yangSen.rightLeg.name}(${yangSen.rightLeg.score})`;

  console.log(`${c.date}\t${c.year}\t${c.month}\t${tensu}\t${mainStars}`);
});

console.log('\n========== おすすめの組み合わせ ==========');

// 天中殺の補完関係を探す
const tensuComplements = [
  { kei: '申酉', meguru: '寅卯', name: '完全な対立' },
  { kei: '巳午', meguru: '亥子', name: '水火の対立' },
  { kei: '辰巳', meguru: '戌亥', name: '土金の対立' },
];

console.log('\n天中殺の補完関係:');
tensuComplements.forEach(t => {
  console.log(`  慧:${t.kei} × 巡:${t.meguru} → ${t.name}`);
});
