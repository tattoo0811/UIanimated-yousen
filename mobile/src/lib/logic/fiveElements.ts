import type { FiveElements, FourPillars } from '@/src/types';
import { ELEMENT_MAP, HIDDEN_STEMS, BRANCHES, ENERGY_TABLE } from './constants';

/**
 * 五行バランスを計算
 * @param bazi 四柱
 * @returns 五行バランス（木火土金水の点数）
 */
export function calculateFiveElements(bazi: FourPillars): FiveElements {
    const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    const stems = [bazi.year.stemStr, bazi.month.stemStr, bazi.day.stemStr, bazi.hour.stemStr];
    const branches = [bazi.year.branch - 1, bazi.month.branch - 1, bazi.day.branch - 1, bazi.hour.branch - 1];

    // Count Stems（天干）
    stems.forEach(s => {
        if (ELEMENT_MAP[s]) counts[ELEMENT_MAP[s]]++;
    });

    // Count Hidden Stems（蔵干）
    branches.forEach(b => {
        const branchName = BRANCHES[b];
        const hidden = HIDDEN_STEMS[branchName];
        if (hidden) {
            hidden.forEach(h => {
                if (ELEMENT_MAP[h]) counts[ELEMENT_MAP[h]]++;
            });
        }
    });

    return counts;
}

/**
 * エネルギー点数を計算
 * @param bazi 四柱
 * @returns エネルギー点数（3-36）
 */
export function calculateEnergyScore(bazi: FourPillars): number {
    const dayStemIdx = bazi.day.stem - 1;
    const s1 = ENERGY_TABLE[dayStemIdx][bazi.year.branch - 1];
    const s2 = ENERGY_TABLE[dayStemIdx][bazi.month.branch - 1];
    const s3 = ENERGY_TABLE[dayStemIdx][bazi.day.branch - 1];

    return s1 + s2 + s3;
}
