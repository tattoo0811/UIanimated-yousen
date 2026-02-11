"use strict";
/**
 * fiveElements.ts - 五行分析エンジン
 *
 * 五行（木火土金水）の相互関係を分析し、命式における五行のバランスを計算します。
 * 相生（生成）、相剋（制御）などの関係性を定義し、人生の傾向を読み取ります。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTROL_CYCLE = exports.GENERATION_CYCLE = void 0;
exports.getElement = getElement;
exports.getBranchElement = getBranchElement;
exports.getRelationship = getRelationship;
exports.checkKango = checkKango;
exports.checkBranchPartnership = checkBranchPartnership;
exports.checkBranchClash = checkBranchClash;
exports.checkTriad = checkTriad;
exports.analyzeFiveElementsBalance = analyzeFiveElementsBalance;
exports.getElementDescription = getElementDescription;
exports.getRelationshipDescription = getRelationshipDescription;
const constants_1 = require("./constants");
/**
 * 五行間の相生（生成）関係
 * 木→火→土→金→水→木
 */
exports.GENERATION_CYCLE = {
    '木': '火',
    '火': '土',
    '土': '金',
    '金': '水',
    '水': '木',
};
/**
 * 五行間の相剋（制御）関係
 * 木→土→水→火→金→木
 */
exports.CONTROL_CYCLE = {
    '木': '土',
    '土': '水',
    '水': '火',
    '火': '金',
    '金': '木',
};
/**
 * 干合（天干の組み合わせ）による五行化合
 * 甲+己→土化, 乙+庚→金化, 丙+辛→水化, 丁+壬→木化, 戊+癸→火化
 */
const STEM_KANGO_PAIRS = {
    '甲己': '土',
    '己甲': '土',
    '乙庚': '金',
    '庚乙': '金',
    '丙辛': '水',
    '辛丙': '水',
    '丁壬': '木',
    '壬丁': '木',
    '戊癸': '火',
    '癸戊': '火',
};
/**
 * 支合（地支の組み合わせ）
 */
const BRANCH_PARTNERSHIPS = {
    '子丑': '土',
    '丑子': '土',
    '寅亥': '木',
    '亥寅': '木',
    '卯戌': '火',
    '戌卯': '火',
    '辰酉': '金',
    '酉辰': '金',
    '巳申': '水',
    '申巳': '水',
    '午未': '火',
    '未午': '火',
};
/**
 * 三合（三つの地支の調和）
 * 申子辰→水局, 亥卯未→木局, 寅午戌→火局, 巳酉丑→金局
 */
const BRANCH_TRIADS = [
    { branches: ['申', '子', '辰'], element: '水' },
    { branches: ['亥', '卯', '未'], element: '木' },
    { branches: ['寅', '午', '戌'], element: '火' },
    { branches: ['巳', '酉', '丑'], element: '金' },
];
/**
 * 支冲（地支の衝突）
 */
const BRANCH_CLASHES = {
    '子午': true,
    '午子': true,
    '丑未': true,
    '未丑': true,
    '寅申': true,
    '申寅': true,
    '卯酉': true,
    '酉卯': true,
    '辰戌': true,
    '戌辰': true,
    '巳亥': true,
    '亥巳': true,
};
/**
 * 天干のインデックスから五行要素を取得
 * @param stemIndex - 天干のインデックス (0-9)
 * @returns 五行要素
 */
function getElement(stemIndex) {
    const stem = constants_1.STEMS[stemIndex % 10];
    return constants_1.STEM_ELEMENTS[stem];
}
/**
 * 地支のインデックスから五行要素を取得
 * @param branchIndex - 地支のインデックス (0-11)
 * @returns 五行要素
 */
function getBranchElement(branchIndex) {
    const branch = constants_1.BRANCHES[branchIndex % 12];
    return constants_1.BRANCH_ELEMENTS[branch];
}
/**
 * 五行間の関係を判定
 * @param element1 - 最初の要素
 * @param element2 - 次の要素
 * @returns 関係の種類
 */
function getRelationship(element1, element2) {
    if (element1 === element2) {
        return 'same';
    }
    if (exports.GENERATION_CYCLE[element1] === element2) {
        return 'generates';
    }
    if (exports.GENERATION_CYCLE[element2] === element1) {
        return 'generated_by';
    }
    if (exports.CONTROL_CYCLE[element1] === element2) {
        return 'controls';
    }
    if (exports.CONTROL_CYCLE[element2] === element1) {
        return 'controlled_by';
    }
    return 'same'; // デフォルト（理論的には到達不可）
}
/**
 * 干合（天干の組み合わせ）を判定
 * @param stem1Index - 最初の天干のインデックス (0-9)
 * @param stem2Index - 次の天干のインデックス (0-9)
 * @returns 干合の有無と化合後の要素
 */
function checkKango(stem1Index, stem2Index) {
    const stem1 = constants_1.STEMS[stem1Index % 10];
    const stem2 = constants_1.STEMS[stem2Index % 10];
    const key1 = `${stem1}${stem2}`;
    const key2 = `${stem2}${stem1}`;
    if (STEM_KANGO_PAIRS[key1]) {
        return {
            isKango: true,
            resultElement: STEM_KANGO_PAIRS[key1],
        };
    }
    if (STEM_KANGO_PAIRS[key2]) {
        return {
            isKango: true,
            resultElement: STEM_KANGO_PAIRS[key2],
        };
    }
    return { isKango: false };
}
/**
 * 支合（地支の組み合わせ）を判定
 * @param branch1 - 最初の地支
 * @param branch2 - 次の地支
 * @returns 支合の有無と結果の要素
 */
function checkBranchPartnership(branch1, branch2) {
    const key1 = `${branch1}${branch2}`;
    const key2 = `${branch2}${branch1}`;
    if (BRANCH_PARTNERSHIPS[key1]) {
        return {
            isPartnership: true,
            resultElement: BRANCH_PARTNERSHIPS[key1],
        };
    }
    if (BRANCH_PARTNERSHIPS[key2]) {
        return {
            isPartnership: true,
            resultElement: BRANCH_PARTNERSHIPS[key2],
        };
    }
    return { isPartnership: false };
}
/**
 * 支冲（地支の衝突）を判定
 * @param branch1 - 最初の地支
 * @param branch2 - 次の地支
 * @returns 衝突の有無
 */
function checkBranchClash(branch1, branch2) {
    const key1 = `${branch1}${branch2}`;
    const key2 = `${branch2}${branch1}`;
    return BRANCH_CLASHES[key1] || BRANCH_CLASHES[key2] || false;
}
/**
 * 三合（三つの地支の調和）を判定
 * @param branches - 地支の配列
 * @returns 三合の有無と結果の要素
 */
function checkTriad(branches) {
    for (const triad of BRANCH_TRIADS) {
        const triadSet = new Set(triad.branches);
        const branchSet = new Set(branches);
        // 三つの地支がすべて一致するかチェック
        if (triadSet.size === 3 &&
            branchSet.size === 3 &&
            Array.from(triadSet).every((b) => branchSet.has(b))) {
            return {
                isTriad: true,
                resultElement: triad.element,
            };
        }
    }
    return { isTriad: false };
}
/**
 * 四柱と隠れ干から五行バランスを分析
 * @param pillars - 四柱データ
 * @param hiddenStems - 隠れ干データの配列
 * @returns 五行バランス分析結果
 */
function analyzeFiveElementsBalance(pillars, hiddenStems) {
    // 各要素のカウント（重み付けあり）
    const counts = {
        '木': 0,
        '火': 0,
        '土': 0,
        '金': 0,
        '水': 0,
    };
    // 四柱の天干と地支をカウント
    // 各ポジション（年月日時）ごとに天干と地支を分析
    const positions = ['year', 'month', 'day', 'hour'];
    positions.forEach((pos) => {
        const pillar = pillars[pos];
        if (pillar) {
            // 天干の五行をカウント（重み 1.0）
            const stemElement = constants_1.STEM_ELEMENTS[pillar.stem];
            counts[stemElement] += 1.0;
            // 地支の五行をカウント（重み 0.8）
            const branchElement = constants_1.BRANCH_ELEMENTS[pillar.branch];
            counts[branchElement] += 0.8;
        }
    });
    // 隠れ干をカウント
    hiddenStems.forEach((hidden) => {
        // 主干（重み 1.0）
        const mainElement = constants_1.STEM_ELEMENTS[hidden.mainStem];
        if (mainElement) {
            counts[mainElement] += 1.0;
        }
        // 副干（重み 0.5）
        if (hidden.subStem) {
            const subElement = constants_1.STEM_ELEMENTS[hidden.subStem];
            if (subElement) {
                counts[subElement] += 0.5;
            }
        }
        // 副副干（重み 0.3）
        if (hidden.extraStem) {
            const extraElement = constants_1.STEM_ELEMENTS[hidden.extraStem];
            if (extraElement) {
                counts[extraElement] += 0.3;
            }
        }
    });
    // 合計を計算
    const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
    // パーセンテージを計算
    const percentages = {
        '木': (counts['木'] / total) * 100,
        '火': (counts['火'] / total) * 100,
        '土': (counts['土'] / total) * 100,
        '金': (counts['金'] / total) * 100,
        '水': (counts['水'] / total) * 100,
    };
    // 支配的な要素と最弱の要素を特定
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0][0];
    const weakest = sorted[sorted.length - 1][0];
    // バランススコアを計算
    // 理想的には各要素が20%ずつ
    // 標準偏差が低いほどバランスが良い
    const ideal = 20;
    const variance = Object.values(percentages).reduce((sum, pct) => {
        return sum + Math.pow(pct - ideal, 2);
    }, 0) / 5;
    const stdDev = Math.sqrt(variance);
    const balanceScore = Math.max(0, 100 - stdDev * 2); // 標準偏差が大きいほどスコアが低い
    return {
        wood: counts['木'],
        fire: counts['火'],
        earth: counts['土'],
        metal: counts['金'],
        water: counts['水'],
        total,
        percentages,
        dominant,
        weakest,
        balanceScore,
    };
}
/**
 * 五行の説明を取得
 * @param element - 五行要素
 * @returns 日本語の説明
 */
function getElementDescription(element) {
    const descriptions = {
        '木': '木行 - 成長、発展、柔軟性を象徴。新しい始まりと拡張性。',
        '火': '火行 - 情熱、活動性、創造性を象徴。明るさと変化の推進力。',
        '土': '土行 - 安定性、信頼、受容性を象徴。基礎と中心的なサポート。',
        '金': '金行 - 厳密性、調整、完成を象徴。秩序と精査。',
        '水': '水行 - 適応性、流動性、深い思考を象徴。循環と変幻自在。',
    };
    return descriptions[element];
}
/**
 * 関係の説明を取得
 * @param rel - 関係の種類
 * @returns 日本語の説明
 */
function getRelationshipDescription(rel) {
    const descriptions = {
        same: '同じ五行 - 協調性と共鳴',
        generates: '生成関係 - 前者が後者を生み出す、支援的',
        generated_by: '被生成 - 後者から支援を受ける',
        controls: '制御関係 - 前者が後者を抑制、調整',
        controlled_by: '被制御 - 後者に抑制される',
    };
    return descriptions[rel];
}
