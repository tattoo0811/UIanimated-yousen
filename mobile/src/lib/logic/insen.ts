import type { FourPillars, SanmeigakuInsenChart, FiveElements, InsenHiddenStem, InsenTsuhensei, InsenPhaseRelation } from '@/src/types';
import { getTenGreatStar, getTwelveGreatStar } from './yangsen';
import { calculateFiveElements } from './fiveElements';
import { STEMS, BRANCHES, HIDDEN_STEMS, STEM_TO_INDEX, ELEMENT_MAP, TEN_STARS } from './constants';

/**
 * 陰占（SanmeigakuInsenChart）を計算
 * @param bazi 四柱
 * @param date 日付
 * @returns 陰占チャート
 */
export function calculateSanmeigakuInsen(bazi: FourPillars, date: Date): SanmeigakuInsenChart {
    const fiveElements = calculateFiveElements(bazi);

    // 蔵干計算
    const hiddenStems = calculateHiddenStems(bazi);

    // 通変星計算
    const tsuhensei = calculateTsuhensei(bazi, hiddenStems);

    // 位相法計算
    const phaseRelations = calculatePhaseRelations(bazi);

    // 身強/身弱判定（簡易版）
    const dayStemStrength = calculateDayStemStrength(fiveElements, bazi.day.stemStr);

    return {
        meta: {
            dayStem: bazi.day.stemStr,
            calendar: 'solar'
        },
        pillars: {
            year: { stem: bazi.year.stemStr, branch: bazi.year.branchStr },
            month: { stem: bazi.month.stemStr, branch: bazi.month.branchStr },
            day: { stem: bazi.day.stemStr, branch: bazi.day.branchStr }
        },
        hiddenStems,
        tsuhensei,
        junishiUn: [
            { pillar: 'year', branch: bazi.year.branchStr, state: getTwelveGreatStar(bazi.day.stem - 1, bazi.year.branch - 1).name },
            { pillar: 'month', branch: bazi.month.branchStr, state: getTwelveGreatStar(bazi.day.stem - 1, bazi.month.branch - 1).name },
            { pillar: 'day', branch: bazi.day.branchStr, state: getTwelveGreatStar(bazi.day.stem - 1, bazi.day.branch - 1).name }
        ],
        fiveElements: {
            distribution: fiveElements,
            dayStemStrength
        },
        phaseRelations,
        tenchusatsu: {
            type: calculateTenchusatsu(bazi.day.id),
            missingBranches: calculateMissingBranches(bazi.day.id)
        }
    };
}

/**
 * 蔵干計算
 */
function calculateHiddenStems(bazi: FourPillars): InsenHiddenStem[] {
    const result: InsenHiddenStem[] = [];

    const pillars: Array<{ pillar: 'year' | 'month' | 'day', branch: string }> = [
        { pillar: 'year', branch: bazi.year.branchStr },
        { pillar: 'month', branch: bazi.month.branchStr },
        { pillar: 'day', branch: bazi.day.branchStr }
    ];

    for (const { pillar, branch } of pillars) {
        const hiddenStemList = HIDDEN_STEMS[branch] || [];

        if (hiddenStemList.length === 1) {
            result.push({ pillar, branch, type: 'main', stem: hiddenStemList[0] });
        } else if (hiddenStemList.length === 2) {
            result.push({ pillar, branch, type: 'main', stem: hiddenStemList[0] });
            result.push({ pillar, branch, type: 'sub', stem: hiddenStemList[1] });
        } else if (hiddenStemList.length === 3) {
            result.push({ pillar, branch, type: 'main', stem: hiddenStemList[0] });
            result.push({ pillar, branch, type: 'sub', stem: hiddenStemList[1] });
            result.push({ pillar, branch, type: 'extra', stem: hiddenStemList[2] });
        }
    }

    return result;
}

/**
 * 通変星計算
 */
function calculateTsuhensei(bazi: FourPillars, hiddenStems: InsenHiddenStem[]): InsenTsuhensei[] {
    const result: InsenTsuhensei[] = [];
    const dayStem = bazi.day.stemStr;

    // 天干の通変星
    const pillars: Array<{ pillar: 'year' | 'month' | 'day', stem: string }> = [
        { pillar: 'year', stem: bazi.year.stemStr },
        { pillar: 'month', stem: bazi.month.stemStr },
        { pillar: 'day', stem: bazi.day.stemStr }
    ];

    for (const { pillar, stem } of pillars) {
        const starName = getTenStarName(dayStem, stem);
        result.push({
            pillar,
            source: 'heavenlyStem',
            stem,
            name: starName
        });
    }

    // 蔵干の通変星
    for (const hidden of hiddenStems) {
        const starName = getTenStarName(dayStem, hidden.stem);
        result.push({
            pillar: hidden.pillar,
            source: 'hiddenStem',
            hiddenType: hidden.type,
            stem: hidden.stem,
            name: starName
        });
    }

    return result;
}

/**
 * 十大主星名を取得
 */
function getTenStarName(dayStem: string, targetStem: string): string {
    const dayStemIdx = STEM_TO_INDEX[dayStem];
    const targetStemIdx = STEM_TO_INDEX[targetStem];

    const dayElement = Math.floor(dayStemIdx / 2);
    const targetElement = Math.floor(targetStemIdx / 2);
    const dayPolarity = dayStemIdx % 2;
    const targetPolarity = targetStemIdx % 2;

    const relation = (targetElement - dayElement + 5) % 5;
    const polMatch = dayPolarity === targetPolarity ? 0 : 1;
    const index = relation * 2 + polMatch;

    return TEN_STARS[index];
}

/**
 * 位相法計算（合・冲・刑・害・破）
 */
function calculatePhaseRelations(bazi: FourPillars): InsenPhaseRelation[] {
    const result: InsenPhaseRelation[] = [];

    const branches = [
        { pillar: 'year' as const, branch: bazi.year.branchStr },
        { pillar: 'month' as const, branch: bazi.month.branchStr },
        { pillar: 'day' as const, branch: bazi.day.branchStr }
    ];

    // 対冲（相冲）チェック
    for (let i = 0; i < branches.length; i++) {
        for (let j = i + 1; j < branches.length; j++) {
            const relation = checkBranchRelation(branches[i].branch, branches[j].branch);
            if (relation) {
                result.push({
                    from: branches[i].pillar,
                    to: branches[j].pillar,
                    relation
                });
            }
        }
    }

    return result;
}

/**
 * 地支間の関係をチェック
 */
function checkBranchRelation(branch1: string, branch2: string): string | null {
    const idx1 = BRANCHES.indexOf(branch1);
    const idx2 = BRANCHES.indexOf(branch2);

    // 対冲（6つ離れている）
    if (Math.abs(idx1 - idx2) === 6) {
        return '冲';
    }

    // 支合（三合・六合は複雑なので簡易版）
    const hexCombos: Record<string, string> = {
        '子丑': '合', '寅亥': '合', '卯戌': '合',
        '辰酉': '合', '巳申': '合', '午未': '合'
    };

    const key1 = branch1 + branch2;
    const key2 = branch2 + branch1;

    if (hexCombos[key1] || hexCombos[key2]) {
        return '合';
    }

    // 刑（簡易版：寅巳申、丑戌未など）
    const xingGroups = [
        ['寅', '巳', '申'],
        ['丑', '戌', '未']
    ];

    for (const group of xingGroups) {
        if (group.includes(branch1) && group.includes(branch2)) {
            return '刑';
        }
    }

    return null;
}

/**
 * 身強/身弱判定（簡易版）
 */
function calculateDayStemStrength(fiveElements: FiveElements, dayStem: string): 'strong' | 'weak' | 'balanced' {
    const element = ELEMENT_MAP[dayStem];
    const elementScore = fiveElements[element];
    const total = Object.values(fiveElements).reduce((sum, val) => sum + val, 0);
    const ratio = elementScore / total;

    if (ratio > 0.35) return 'strong';
    if (ratio < 0.15) return 'weak';
    return 'balanced';
}

/**
 * 天中殺計算
 */
function calculateTenchusatsu(ganZhiId: number): string {
    const group = Math.floor((ganZhiId - 1) / 10);
    const types = ['戌亥天中殺', '申酉天中殺', '午未天中殺', '辰巳天中殺', '寅卯天中殺', '子丑天中殺'];
    return types[group];
}

/**
 * 空亡の地支計算
 */
function calculateMissingBranches(ganZhiId: number): string[] {
    const group = Math.floor((ganZhiId - 1) / 10);
    const missing = [
        ['戌', '亥'], ['申', '酉'], ['午', '未'], ['辰', '巳'], ['寅', '卯'], ['子', '丑']
    ];
    return missing[group];
}
