/**
 * 相性診断ロジック
 */

export type RelationType = 'romantic' | 'business' | 'friendship';

export interface CompatibilityResult {
    score: number;
    scoreLevel: string;
    myKanshi: string;
    partnerKanshi: string;
    myElement: string;
    partnerElement: string;
    isKango: boolean;
    advice: string;
    strengths: string[];
    challenges: string[];
}

/**
 * 天干から五行を取得
 */
function getElementFromStem(stem: string): string {
    const stemElements: Record<string, string> = {
        '甲': '木', '乙': '木',
        '丙': '火', '丁': '火',
        '戊': '土', '己': '土',
        '庚': '金', '辛': '金',
        '壬': '水', '癸': '水',
    };
    return stemElements[stem] || '土';
}

/**
 * 干合（かんごう）をチェック
 */
function isKango(myStem: string, partnerStem: string): boolean {
    const kangoSets = [
        ['甲', '己'],
        ['乙', '庚'],
        ['丙', '辛'],
        ['丁', '壬'],
        ['戊', '癸']
    ];
    return kangoSets.some(set =>
        (set[0] === myStem && set[1] === partnerStem) ||
        (set[0] === partnerStem && set[1] === myStem)
    );
}

/**
 * 五行の相性を計算
 */
function calculateElementCompatibility(myElement: string, partnerElement: string): number {
    // 相生関係（生み出す）
    const generating: Record<string, string[]> = {
        '木': ['火'],
        '火': ['土'],
        '土': ['金'],
        '金': ['水'],
        '水': ['木']
    };

    // 相剋関係（剋す）
    const controlling: Record<string, string[]> = {
        '木': ['土'],
        '火': ['金'],
        '土': ['水'],
        '金': ['木'],
        '水': ['火']
    };

    if (myElement === partnerElement) {
        return 15; // 同じ五行
    } else if (generating[myElement]?.includes(partnerElement)) {
        return 20; // 相生（自分が相手を生む）
    } else if (generating[partnerElement]?.includes(myElement)) {
        return 20; // 相生（相手が自分を生む）
    } else if (controlling[myElement]?.includes(partnerElement)) {
        return 5; // 相剋（自分が相手を剋す）
    } else if (controlling[partnerElement]?.includes(myElement)) {
        return 5; // 相剋（相手が自分を剋す）
    }

    return 10; // その他
}

/**
 * 関係タイプに応じたアドバイスを生成
 */
function generateAdvice(
    myElement: string,
    partnerElement: string,
    isKango: boolean,
    relationType: RelationType
): { advice: string; strengths: string[]; challenges: string[] } {
    if (isKango) {
        const romanticAdvice = '運命的な出会い！お互いを高め合える関係です。';
        const businessAdvice = '最強のビジネスパートナー！お互いの強みを活かし合えます。';
        const friendshipAdvice = '一生の友達になれる関係！深い絆で結ばれています。';

        const advice = relationType === 'romantic' ? romanticAdvice :
                      relationType === 'business' ? businessAdvice : friendshipAdvice;

        return {
            advice,
            strengths: ['運命的な相性', 'お互いを高め合える', '深い理解'],
            challenges: ['時には距離を保つことも大切', 'お互いの個性を尊重']
        };
    }

    if (myElement === partnerElement) {
        const romanticAdvice = '似た者同士で理解し合える関係。ただし、刺激が少ないかもしれません。';
        const businessAdvice = '同じ価値観でスムーズに進められます。新しい視点を取り入れることも大切。';
        const friendshipAdvice = '気の合う仲間！一緒にいて安心できる関係です。';

        const advice = relationType === 'romantic' ? romanticAdvice :
                      relationType === 'business' ? businessAdvice : friendshipAdvice;

        return {
            advice,
            strengths: ['理解し合える', '価値観が近い', '安心感'],
            challenges: ['刺激が少ない', '新しい視点が必要']
        };
    }

    const romanticAdvice = '刺激し合える関係。違いを楽しんで、お互いを尊重しましょう。';
    const businessAdvice = '異なる強みを活かし合える関係。チームワークが鍵です。';
    const friendshipAdvice = '多様性のある関係。お互いの違いから学べることが多いです。';

    const advice = relationType === 'romantic' ? romanticAdvice :
                  relationType === 'business' ? businessAdvice : friendshipAdvice;

    return {
        advice,
        strengths: ['刺激し合える', '異なる視点', '成長できる'],
        challenges: ['価値観の違い', 'コミュニケーションが重要']
    };
}

/**
 * 相性を計算
 * @param myKanshi 自分の日柱干支（例: "甲子"）
 * @param partnerKanshi 相手の日柱干支（例: "乙丑"）
 * @param relationType 関係タイプ
 */
export function calculateCompatibility(
    myKanshi: string,
    partnerKanshi: string,
    relationType: RelationType = 'romantic'
): CompatibilityResult {
    const myStem = myKanshi[0];
    const partnerStem = partnerKanshi[0];

    const myElement = getElementFromStem(myStem);
    const partnerElement = getElementFromStem(partnerStem);

    const isKangoResult = isKango(myStem, partnerStem);

    // ベーススコア
    let score = 50;

    // 干合の場合は大幅に加点
    if (isKangoResult) {
        score += 30;
    } else {
        // 五行の相性を加算
        score += calculateElementCompatibility(myElement, partnerElement);
    }

    // ランダム要素（±10点）
    const randomFactor = Math.floor(Math.random() * 21) - 10;
    score = Math.min(100, Math.max(0, score + randomFactor));

    // スコアレベル
    let scoreLevel: string;
    if (score >= 80) {
        scoreLevel = '最高の相性！';
    } else if (score >= 60) {
        scoreLevel = 'いい感じ！';
    } else if (score >= 40) {
        scoreLevel = 'まあまあ';
    } else {
        scoreLevel = 'ちょっと...';
    }

    // アドバイス生成
    const { advice, strengths, challenges } = generateAdvice(
        myElement,
        partnerElement,
        isKangoResult,
        relationType
    );

    return {
        score,
        scoreLevel,
        myKanshi,
        partnerKanshi,
        myElement,
        partnerElement,
        isKango: isKangoResult,
        advice,
        strengths,
        challenges
    };
}
