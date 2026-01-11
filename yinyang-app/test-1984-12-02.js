// 1984年12月2日のテスト
const { calculateBaZi, calculateYangSen } = require('./src/utils/logic.ts');

const testDate = new Date(1984, 11, 2, 12, 0, 0); // 1984-12-02 12:00
const longitude = 135;

console.log('=== 1984-12-02 12:00 テスト ===\n');

const bazi = calculateBaZi(testDate, longitude);

console.log('四柱:');
console.log('年柱:', bazi.year.name);
console.log('月柱:', bazi.month.name);
console.log('日柱:', bazi.day.name);
console.log('時柱:', bazi.hour.name);
console.log('');

const yangSen = calculateYangSen(bazi);

console.log('十大主星:');
console.log('頭:', yangSen.head);
console.log('右手:', yangSen.rightHand);
console.log('胸:', yangSen.chest);
console.log('左手:', yangSen.leftHand);
console.log('腹:', yangSen.belly);
console.log('');

console.log('十二大従星:');
console.log('左肩:', yangSen.leftShoulder.name, yangSen.leftShoulder.score + '点');
console.log('右足:', yangSen.rightLeg.name, yangSen.rightLeg.score + '点');
console.log('左足:', yangSen.leftLeg.name, yangSen.leftLeg.score + '点');
console.log('');

console.log('画像の正解:');
console.log('頭: 禄存星');
console.log('右手: 牽牛星');
console.log('胸: 鳳閣星');
console.log('左手: 調舒星');
console.log('腹: 司禄星');
console.log('左肩: 天極星');
console.log('右足: 天恍星');
console.log('左足: 天胡星');
