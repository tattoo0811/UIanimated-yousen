/**
 * fiveElements.ts - 五行分析エンジン
 *
 * 五行（木火土金水）の相互関係を分析し、命式における五行のバランスを計算します。
 * 相生（生成）、相剋（制御）などの関係性を定義し、人生の傾向を読み取ります。
 */
import type { Element, Stem, Branch } from './constants';
import type { FourPillars } from './types';
/**
 * 五行間の相生（生成）関係
 * 木→火→土→金→水→木
 */
export declare const GENERATION_CYCLE: Record<Element, Element>;
/**
 * 五行間の相剋（制御）関係
 * 木→土→水→火→金→木
 */
export declare const CONTROL_CYCLE: Record<Element, Element>;
/**
 * 天干のインデックスから五行要素を取得
 * @param stemIndex - 天干のインデックス (0-9)
 * @returns 五行要素
 */
export declare function getElement(stemIndex: number): Element;
/**
 * 地支のインデックスから五行要素を取得
 * @param branchIndex - 地支のインデックス (0-11)
 * @returns 五行要素
 */
export declare function getBranchElement(branchIndex: number): Element;
/**
 * 五行間の関係を判定
 * @param element1 - 最初の要素
 * @param element2 - 次の要素
 * @returns 関係の種類
 */
export declare function getRelationship(element1: Element, element2: Element): 'same' | 'generates' | 'generated_by' | 'controls' | 'controlled_by';
/**
 * 干合（天干の組み合わせ）を判定
 * @param stem1Index - 最初の天干のインデックス (0-9)
 * @param stem2Index - 次の天干のインデックス (0-9)
 * @returns 干合の有無と化合後の要素
 */
export declare function checkKango(stem1Index: number, stem2Index: number): {
    isKango: boolean;
    resultElement?: Element;
};
/**
 * 支合（地支の組み合わせ）を判定
 * @param branch1 - 最初の地支
 * @param branch2 - 次の地支
 * @returns 支合の有無と結果の要素
 */
export declare function checkBranchPartnership(branch1: Branch, branch2: Branch): {
    isPartnership: boolean;
    resultElement?: Element;
};
/**
 * 支冲（地支の衝突）を判定
 * @param branch1 - 最初の地支
 * @param branch2 - 次の地支
 * @returns 衝突の有無
 */
export declare function checkBranchClash(branch1: Branch, branch2: Branch): boolean;
/**
 * 三合（三つの地支の調和）を判定
 * @param branches - 地支の配列
 * @returns 三合の有無と結果の要素
 */
export declare function checkTriad(branches: Branch[]): {
    isTriad: boolean;
    resultElement?: Element;
};
/**
 * 五行バランス情報
 */
export interface FiveElementsBalance {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
    total: number;
    percentages: Record<Element, number>;
    dominant: Element;
    weakest: Element;
    balanceScore: number;
}
/**
 * 隠れ干データ（蔵干）
 */
export interface HiddenStemData {
    branch: Branch;
    mainStem: Stem;
    subStem?: Stem;
    extraStem?: Stem;
}
/**
 * 四柱と隠れ干から五行バランスを分析
 * @param pillars - 四柱データ
 * @param hiddenStems - 隠れ干データの配列
 * @returns 五行バランス分析結果
 */
export declare function analyzeFiveElementsBalance(pillars: FourPillars, hiddenStems: HiddenStemData[]): FiveElementsBalance;
/**
 * 五行の説明を取得
 * @param element - 五行要素
 * @returns 日本語の説明
 */
export declare function getElementDescription(element: Element): string;
/**
 * 関係の説明を取得
 * @param rel - 関係の種類
 * @returns 日本語の説明
 */
export declare function getRelationshipDescription(rel: ReturnType<typeof getRelationship>): string;
