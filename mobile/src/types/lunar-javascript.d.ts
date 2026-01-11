// 型定義: lunar-javascript
// https://github.com/6tail/lunar-javascript

declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;

    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
  }

  export class Lunar {
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getPrevJie(): any;
    getNextJie(): any;
    getSolar(): Solar;
  }
}
