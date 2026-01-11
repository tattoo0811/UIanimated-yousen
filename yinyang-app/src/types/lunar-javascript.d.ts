declare module 'lunar-javascript' {
  export class Solar {
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number);
    getLunar(): Lunar;
    static fromDate(date: Date): Solar;
    static fromYmd(year: number, month: number, day: number): Solar;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(hour: number, minute: number): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getSolar(): Solar;
  }
}
