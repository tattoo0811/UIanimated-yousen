import { julian, solar } from 'astronomia';

// ============================================================
// Astronomical Functions
// ============================================================

/**
 * ユリウス日を計算
 * @param date グレゴリオ暦の日時
 * @returns ユリウス日
 */
export function calculateJulianDay(date: Date): number {
    return julian.CalendarGregorianToJD(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate() + date.getHours() / 24 + date.getMinutes() / 1440 + date.getSeconds() / 86400
    );
}

/**
 * 太陽の黄経を取得
 * @param jd ユリウス日
 * @returns 太陽の黄経（度）
 */
export function getSolarLongitude(jd: number): number {
    return solar.apparentLongitude(jd) * 180 / Math.PI;
}

/**
 * 真太陽時を計算
 * 均時差と経度補正を適用
 * @param date 現地時刻
 * @param longitude 経度（デフォルト: 135度 = 日本標準時子午線）
 * @returns 真太陽時
 */
export function calculateTrueSolarTime(date: Date, longitude: number): Date {
    // Calculate EoT (Equation of Time)
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180); // Convert to radians
    const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // Minutes

    const timeOffset = (longitude - 135) * 4; // Minutes
    const totalOffsetMinutes = timeOffset + eot;

    const trueTime = new Date(date.getTime() + totalOffsetMinutes * 60000);
    return trueTime;
}
