/**
 * 数理法に基づく五行バランス計算
 * 
 * このファイルはWeb版（Next.js）用の五行バランス計算ロジックです。
 * mobile版のロジックをベースにしています。
 */

import type { FiveElements } from './types';

// 十干（天干）
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 十二支（地支）
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 蔵干（Hidden Stems）
const HIDDEN_STEMS: { [key: string]: string[] } = {
    '子': ['癸'],
    '丑': ['己', '癸', '辛'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '庚', '戊'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲']
};

// 五行マッピング
const ELEMENT_MAP: Record<string, keyof FiveElements> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
};

// 天干インデックスマッピング
const STEM_TO_INDEX: Record<string, number> = {
    '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
    '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

// エネルギー点数対応表（十二大従星点数）
const ENERGY_TABLE = [
    [7, 8, 11, 12, 10, 6, 3, 1, 5, 2, 4, 9], // 甲
    [4, 5, 2, 1, 12, 8, 6, 9, 10, 7, 11, 3], // 乙
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 丙
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 丁
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 戊
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 己
    [2, 6, 1, 9, 5, 8, 4, 12, 11, 10, 3, 7], // 庚
    [9, 6, 3, 1, 4, 10, 11, 12, 8, 5, 2, 7], // 辛
    [12, 11, 10, 7, 9, 3, 6, 5, 4, 1, 8, 2], // 壬
    [12, 6, 1, 3, 9, 8, 4, 5, 2, 7, 10, 11]  // 癸
];

/**
 * 四柱推命の四柱（年柱・月柱・日柱・時柱）
 */
export type FourPillars = {
    year: { stemStr: string; branch: number };
    month: { stemStr: string; branch: number };
    day: { stemStr: string; branch: number };
    hour: { stemStr: string; branch: number };
};

/**
 * 数理法に基づく五行バランスを計算
 * 
 * 数理法の計算手順：
 * 1. 全十干の特定と出現回数の集計（天干 + 蔵干）
 * 2. 各十干について、宿命の各地支（年支、月支、日支）との組み合わせからエネルギー点を算出
 * 3. 十干ごとの合計点に個数を乗じる
 * 4. 五行ごとに集計
 * 
 * @param bazi 四柱（陰占は年柱・月柱・日柱の三柱を使用）
 * @returns 五行バランス（木火土金水の点数）
 */
export function calculateFiveElements(bazi: FourPillars): FiveElements {
    // ステップ1: 全十干の特定と出現回数の集計
    const stemCounts: Record<string, number> = {};
    
    // 天干を集計（年柱・月柱・日柱のみ。陰占は三柱を使用）
    const stems = [bazi.year.stemStr, bazi.month.stemStr, bazi.day.stemStr];
    stems.forEach(s => {
        stemCounts[s] = (stemCounts[s] || 0) + 1;
    });

    // 蔵干を集計（年支・月支・日支のみ）
    const branchIndices = [bazi.year.branch - 1, bazi.month.branch - 1, bazi.day.branch - 1];
    branchIndices.forEach(b => {
        const branchName = BRANCHES[b];
        const hidden = HIDDEN_STEMS[branchName];
        if (hidden) {
            hidden.forEach(h => {
                stemCounts[h] = (stemCounts[h] || 0) + 1;
            });
        }
    });

    // ステップ2-3: 各十干について、宿命の各地支との組み合わせからエネルギー点を算出し、個数を乗じる
    const stemScores: Record<string, number> = {};
    const branchNames = [
        BRANCHES[bazi.year.branch - 1],
        BRANCHES[bazi.month.branch - 1],
        BRANCHES[bazi.day.branch - 1]
    ];

    // 各十干について計算
    Object.keys(stemCounts).forEach(stem => {
        const stemIdx = STEM_TO_INDEX[stem];
        if (stemIdx === undefined) return;

        // 各地支との組み合わせからエネルギー点を算出
        let totalScore = 0;
        branchNames.forEach(branchName => {
            const branchIdx = BRANCHES.indexOf(branchName);
            if (branchIdx >= 0 && ENERGY_TABLE[stemIdx]) {
                totalScore += ENERGY_TABLE[stemIdx][branchIdx];
            }
        });

        // 十干ごとの合計点に個数を乗じる
        stemScores[stem] = totalScore * stemCounts[stem];
    });

    // ステップ4: 五行ごとに集計
    const counts: FiveElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    Object.keys(stemScores).forEach(stem => {
        const element = ELEMENT_MAP[stem];
        if (element) {
            counts[element] += stemScores[stem];
        }
    });

    return counts;
}
