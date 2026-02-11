declare module 'lunar-javascript' {
  export class Solar {
    constructor(year: number, month: number, day: number, hour?: number, minute?: number, second?: number);
    toLunar(): Lunar;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeZhi(): string;
    getYearGanExact(): string;
    getYearZhiExact(): string;
    getMonthGanExact(): string;
    getMonthZhiExact(): string;
  }
}
