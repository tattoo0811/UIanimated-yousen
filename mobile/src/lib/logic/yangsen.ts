import { memoizeSimple } from '../cache';
import type { FourPillars, YangSen } from '@/src/types';
import {
    STEM_TO_INDEX,
    TWENTY_EIGHT_ELEMENTS,
    YANGSEN_HIDDEN_STEMS_DATA,
    SOLAR_TERM_APPROX_DAYS,
    TEN_STARS,
    getElement,
    getPolarity,
    BUILD_LUCK_BRANCH,
    TWELVE_STAR_PHASES,
    PHASE_TO_SCORE
} from './constants';

/**
 * 節入りからの経過日数を計算
 */
function getDaysFromSolarTerm(date: Date): number {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const solarTermDay = SOLAR_TERM_APPROX_DAYS[month];

    if (day < solarTermDay) {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        const prevSolarTermDay = SOLAR_TERM_APPROX_DAYS[prevMonth];
        return (prevMonthLastDay - prevSolarTermDay) + day;
    }

    return day - solarTermDay + 1;
}

/**
 * 二十八元に基づいて蔵干を選択
 */
function getHiddenStemByDays(branchStr: string, daysFromSolarTerm: number): string {
    const data = TWENTY_EIGHT_ELEMENTS[branchStr];
    if (!data) throw new Error(`Invalid branch: ${branchStr}`);

    if (data.extra && daysFromSolarTerm <= data.extra.days) return data.extra.stem;

    const extraDays = data.extra?.days || 0;
    if (data.sub && daysFromSolarTerm <= extraDays + data.sub.days) return data.sub.stem;

    return data.main.stem;
}

/**
 * 陽占計算で使用する蔵干を取得
 */
function getYangSenHiddenStem(branchStr: string, position: 'year' | 'month' | 'day', date?: Date): string {
    if (date) {
        const daysFromSolarTerm = getDaysFromSolarTerm(date);
        return getHiddenStemByDays(branchStr, daysFromSolarTerm);
    }

    const data = YANGSEN_HIDDEN_STEMS_DATA[branchStr];
    if (!data) throw new Error(`Invalid branch: ${branchStr}`);
    return data.main;
}

/**
 * 十大主星を算出（Raw版）
 */
function getTenGreatStarRaw(dayStemIdx: number, targetStemIdx: number): string {
    const dElem = getElement(dayStemIdx);
    const tElem = getElement(targetStemIdx);
    const dPol = getPolarity(dayStemIdx);
    const tPol = getPolarity(targetStemIdx);

    const rel = (tElem - dElem + 5) % 5;
    const polMatch = dPol === tPol ? 0 : 1;
    const index = rel * 2 + polMatch;

    return TEN_STARS[index];
}

export const getTenGreatStar = memoizeSimple(getTenGreatStarRaw);

/**
 * 十二大従星を算出
 */
export function getTwelveGreatStar(dayStemIdx: number, branchIdx: number): { name: string; score: number } {
    const buildLuckBranch = BUILD_LUCK_BRANCH[dayStemIdx];
    let phase = (branchIdx - buildLuckBranch + 12) % 12;
    const isYin = dayStemIdx % 2 === 1;
    if (isYin) phase = (12 - phase) % 12;

    return {
        name: TWELVE_STAR_PHASES[phase],
        score: PHASE_TO_SCORE[phase]
    };
}

/**
 * 陽占（人体図）を計算
 */
export function calculateYangSen(bazi: FourPillars, date?: Date): YangSen {
    const dayStemIdx = bazi.day.stem - 1;

    // 頭: 日干 × 年干
    const head = getTenGreatStar(dayStemIdx, bazi.year.stem - 1);

    // 右手: 日干 × 日支蔵干
    const dayBranchHiddenStem = getYangSenHiddenStem(bazi.day.branchStr, 'day', date);
    const rightHand = getTenGreatStar(dayStemIdx, STEM_TO_INDEX[dayBranchHiddenStem]);

    // 胸: 日干 × 月支蔵干
    const monthBranchHiddenStem = getYangSenHiddenStem(bazi.month.branchStr, 'month', date);
    const chest = getTenGreatStar(dayStemIdx, STEM_TO_INDEX[monthBranchHiddenStem]);

    // 左手: 日干 × 年支蔵干
    const yearBranchHiddenStem = getYangSenHiddenStem(bazi.year.branchStr, 'year', date);
    const leftHand = getTenGreatStar(dayStemIdx, STEM_TO_INDEX[yearBranchHiddenStem]);

    // 腹: 日干 × 月干
    const belly = getTenGreatStar(dayStemIdx, bazi.month.stem - 1);

    // 十二大従星
    const leftShoulder = getTwelveGreatStar(dayStemIdx, bazi.year.branch - 1);
    const leftLeg = getTwelveGreatStar(dayStemIdx, bazi.month.branch - 1);
    const rightLeg = getTwelveGreatStar(dayStemIdx, bazi.day.branch - 1);

    return {
        head,
        rightHand,
        chest,
        leftHand,
        belly,
        leftShoulder,
        rightLeg,
        leftLeg
    };
}
