const { Solar } = require('lunar-javascript');

const date = new Date('1983-08-11T00:00:00');
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();

console.log('Date:', date.toISOString());

const prevJie = lunar.getPrevJie();
const nextJie = lunar.getNextJie();

console.log('Prev Jie:', prevJie.getName(), prevJie.getSolar().toYmdHms());
console.log('Next Jie:', nextJie.getName(), nextJie.getSolar().toYmdHms());

const prevQi = lunar.getPrevQi();
const nextQi = lunar.getNextQi();

console.log('Prev Qi:', prevQi.getName(), prevQi.getSolar().toYmdHms());
console.log('Next Qi:', nextQi.getName(), nextQi.getSolar().toYmdHms());
