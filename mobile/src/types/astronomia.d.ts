// 型定義: astronomia
// https://github.com/commenthol/astronomia

declare module 'astronomia' {
  export namespace julian {
    function CalendarGregorianToJD(
      year: number,
      month: number,
      day: number
    ): number;
  }

  export namespace solar {
    function apparentLongitude(jd: number): number;
  }
}
