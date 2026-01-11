import { Solar } from 'lunar-javascript';
import type { FourPillars, GanZhi } from '@/src/types';
import { STEMS, BRANCHES, YINSEN_HIDDEN_STEMS } from './constants';
import { calculateTrueSolarTime } from './astronomy';

/**
 * 干支オブジェクト生成
 */
function createGanZhi(stemIdx: number, branchIdx: number, hiddenStems: string[] = []): GanZhi {
    const s = ((stemIdx % 10) + 10) % 10;
    const b = ((branchIdx % 12) + 12) % 12;

    let id = 1;
    for (let i = 0; i < 60; i++) {
        if (i % 10 === s && i % 12 === b) {
            id = i + 1;
            break;
        }
    }

    return {
        stem: s + 1,
        branch: b + 1,
        stemStr: STEMS[s],
        branchStr: BRANCHES[b],
        name: `${STEMS[s]}${BRANCHES[b]}`,
        id: id,
        hiddenStems: hiddenStems
    };
}

/**
 * 四柱推命（BaZi）を計算
 * @param date グレゴリオ暦の生年月日時刻
 * @param longitude 経度（デフォルト: 135度）
 * @returns 四柱（年柱・月柱・日柱・時柱）
 */
export function calculateBaZi(date: Date, longitude: number = 135): FourPillars {
    const solarDate = Solar.fromDate(date);
    const lunar = solarDate.getLunar();

    const yearGanZhiStr = lunar.getYearInGanZhi();
    const monthGanZhiStr = lunar.getMonthInGanZhi();
    const dayGanZhiStr = lunar.getDayInGanZhi();

    const yearStemStr = yearGanZhiStr.charAt(0);
    const yearBranchStr = yearGanZhiStr.charAt(1);
    const monthStemStr = monthGanZhiStr.charAt(0);
    const monthBranchStr = monthGanZhiStr.charAt(1);
    const dayStemStr = dayGanZhiStr.charAt(0);
    const dayBranchStr = dayGanZhiStr.charAt(1);

    const yearStemIdx = STEMS.indexOf(yearStemStr);
    const yearBranchIdx = BRANCHES.indexOf(yearBranchStr);
    const monthStemIdx = STEMS.indexOf(monthStemStr);
    const monthBranchIdx = BRANCHES.indexOf(monthBranchStr);
    const dayStemIdx = STEMS.indexOf(dayStemStr);
    const dayBranchIdx = BRANCHES.indexOf(dayBranchStr);

    const yearHidden = [YINSEN_HIDDEN_STEMS[yearBranchIdx]];
    const monthHidden = [YINSEN_HIDDEN_STEMS[monthBranchIdx]];
    const dayHidden = [YINSEN_HIDDEN_STEMS[dayBranchIdx]];

    const yearGanZhi = createGanZhi(yearStemIdx, yearBranchIdx, yearHidden);
    const monthGanZhi = createGanZhi(monthStemIdx, monthBranchIdx, monthHidden);
    const dayGanZhi = createGanZhi(dayStemIdx, dayBranchIdx, dayHidden);

    // Hour Pillar (using True Solar Time)
    const trueTime = calculateTrueSolarTime(date, longitude);
    const h = trueTime.getHours();

    // Branch: (h+1)/2 % 12
    const hourBranchIdx = Math.floor((h + 1) / 2) % 12;

    // Stem: Five Rats Rule
    const hourStartStem = ((dayStemIdx % 5) * 2) % 10;
    const hourStemIdx = (hourStartStem + hourBranchIdx) % 10;

    const hourHidden = [YINSEN_HIDDEN_STEMS[hourBranchIdx]];

    const hourGanZhi = createGanZhi(hourStemIdx, hourBranchIdx, hourHidden);

    return {
        year: yearGanZhi,
        month: monthGanZhi,
        day: dayGanZhi,
        hour: hourGanZhi
    };
}
