import { Solar } from 'lunar-javascript';
import type { FourPillars, FiveElements } from '@/src/types';
import { getTenGreatStar, getTwelveGreatStar } from './yangsen';
import { calculateFiveElements } from './fiveElements';
import { STEMS, BRANCHES } from './constants';

// Constants for Special Conditions
const BRANCH_RELATIONSHIPS = {
    // Six Clashes (Chuu) - 対冲
    CLASH: {
        '子': '午', '午': '子',
        '丑': '未', '未': '丑',
        '寅': '申', '申': '寅',
        '卯': '酉', '酉': '卯',
        '辰': '戌', '戌': '辰',
        '巳': '亥', '亥': '巳'
    },
    // Six Combines (Shi-go) - 支合
    COMBINE: {
        '子': '丑', '丑': '子',
        '寅': '亥', '亥': '寅',
        '卯': '戌', '戌': '卯',
        '辰': '酉', '酉': '辰',
        '巳': '申', '申': '巳',
        '午': '未', '未': '午'
    }
};

const DIRECTIONS: Record<string, string> = {
    '子': '北', '丑': '北北東', '寅': '東北東', '卯': '東', '辰': '東南東', '巳': '南南東',
    '午': '南', '未': '南南西', '申': '西南西', '酉': '西', '戌': '西北西', '亥': '北北西'
};

// 運勢レベル（十二大従星のスコアと十大主星から算出）
const FORTUNE_LEVELS = {
    '大吉': { minScore: 10, color: '#10b981' },
    '吉': { minScore: 7, color: '#3b82f6' },
    '中吉': { minScore: 5, color: '#8b5cf6' },
    '小吉': { minScore: 3, color: '#f59e0b' },
    '末吉': { minScore: 0, color: '#f97316' }
};

// 運勢レベルのアドバイス
const FORTUNE_ADVICE: Record<string, string[]> = {
    '大吉': [
        '新しいことを始めるのに最適な日です。',
        '大きな決断をする絶好のタイミングです。',
        '運気が最高潮に達しています。積極的に行動しましょう。',
        '願い事が叶いやすい日です。チャンスを逃さないでください。'
    ],
    '吉': [
        '順調に物事が進む日です。',
        '安定した運気が続いています。計画通りに進めましょう。',
        '良好な人間関係が築ける日です。',
        '努力が実を結ぶ日です。継続が大切です。'
    ],
    '中吉': [
        '落ち着いて行動すれば良い結果が得られます。',
        '慎重に判断を下すことが大切です。',
        '周囲との協調を心がけましょう。',
        '小さな変化に注意を払う日です。'
    ],
    '小吉': [
        '小さな幸運がある日です。',
        '地道な努力が報われる日です。',
        '無理をせず、自然な流れに任せましょう。',
        '休息を取ることも大切です。'
    ],
    '末吉': [
        '慎重に行動しましょう。',
        '急がず、焦らず、一歩ずつ進みましょう。',
        '見直しや調整が必要な日です。',
        '準備や計画を立てるのに適した日です。'
    ]
};

// 五行バランスに基づいた開運アドバイス
const FIVE_ELEMENTS_ADVICE: Record<string, {
    weak: string[];  // 不足している場合のアドバイス
    strong: string[]; // 過剰な場合のアドバイス
    balanced: string[]; // バランスが取れている場合のアドバイス
}> = {
    wood: {
        weak: [
            '木の気が不足しています。緑のものを身につけたり、植物を育てることで運気が上がります。',
            '新しいことに挑戦する勇気が湧いてくる時期です。行動を起こしてみましょう。',
            '成長と発展のエネルギーを補うため、自然に触れる時間を作りましょう。'
        ],
        strong: [
            '木の気が強すぎる日です。柔軟性を心がけ、周囲との調和を大切にしましょう。',
            '勢いがありすぎる時は、一歩引いて全体を見渡すことが大切です。',
            '成長のエネルギーを適切にコントロールし、無理をしないようにしましょう。'
        ],
        balanced: [
            '木の気がバランスよく整っています。新しいアイデアを形にするのに最適です。',
            '成長と発展のエネルギーが安定しています。計画を進めましょう。'
        ]
    },
    fire: {
        weak: [
            '火の気が不足しています。赤やオレンジのものを身につけたり、温かい飲み物を飲むと良いでしょう。',
            '情熱と行動力が湧いてくる時期です。積極的に動きましょう。',
            '明るい場所で過ごしたり、太陽の光を浴びることで運気が上がります。'
        ],
        strong: [
            '火の気が強すぎる日です。冷静さを保ち、感情に流されないようにしましょう。',
            'エネルギッシュすぎる時は、休息を取ってリラックスすることが大切です。',
            '情熱を適切にコントロールし、周囲への配慮を忘れないようにしましょう。'
        ],
        balanced: [
            '火の気がバランスよく整っています。情熱と行動力で目標を達成できる日です。',
            '明るいエネルギーが安定しています。人との交流が活発になるでしょう。'
        ]
    },
    earth: {
        weak: [
            '土の気が不足しています。茶色やベージュのものを身につけたり、大地に触れると良いでしょう。',
            '安定と継続のエネルギーを補うため、規則正しい生活を心がけましょう。',
            '信頼関係を築くのに適した時期です。約束を守り、誠実に行動しましょう。'
        ],
        strong: [
            '土の気が強すぎる日です。柔軟性を持ち、変化を受け入れることが大切です。',
            '安定しすぎて動きが鈍くなる時は、新しい刺激を取り入れてみましょう。',
            '堅実さを保ちつつ、時には冒険心も大切にしましょう。'
        ],
        balanced: [
            '土の気がバランスよく整っています。安定した基盤の上で着実に進めます。',
            '継続と信頼のエネルギーが安定しています。長期的な計画を立てるのに最適です。'
        ]
    },
    metal: {
        weak: [
            '金の気が不足しています。白やシルバーのものを身につけたり、整理整頓をすると良いでしょう。',
            '決断力と実行力を補うため、明確な目標を設定しましょう。',
            '美しいものに触れたり、質の高いものを選ぶことで運気が上がります。'
        ],
        strong: [
            '金の気が強すぎる日です。柔らかさを心がけ、完璧主義になりすぎないようにしましょう。',
            '厳格すぎる時は、周囲への思いやりを忘れずに行動しましょう。',
            '決断力が強すぎる時は、一度立ち止まって考える時間を作りましょう。'
        ],
        balanced: [
            '金の気がバランスよく整っています。明確な判断と実行力で目標を達成できます。',
            '整理と決断のエネルギーが安定しています。重要な決断をするのに最適です。'
        ]
    },
    water: {
        weak: [
            '水の気が不足しています。黒やネイビーのものを身につけたり、水に触れると良いでしょう。',
            '知性と柔軟性を補うため、学習や読書の時間を作りましょう。',
            '静かな場所で過ごしたり、瞑想することで運気が上がります。'
        ],
        strong: [
            '水の気が強すぎる日です。行動力を高め、流されないようにしましょう。',
            '感情が揺れ動く時は、冷静な判断を心がけることが大切です。',
            '柔軟性を保ちつつ、時には自分の意志を貫く強さも必要です。'
        ],
        balanced: [
            '水の気がバランスよく整っています。知性と柔軟性で困難を乗り越えられます。',
            '流れと適応のエネルギーが安定しています。変化に対応する力が高まります。'
        ]
    }
};

export interface DailyFortune {
    date: string;
    dailyGanZhi: {
        stem: string;
        branch: string;
    };
    dailyTenStar: string; // Day Master vs Daily Stem
    dailyTwelveStar: {
        name: string;
        score: number;
    }; // Day Master vs Daily Branch
    specialConditions: string[]; // Chuu, Shigo, etc.
    luckyDirection: string; // Based on daily branch
    level: '大吉' | '吉' | '中吉' | '小吉' | '末吉';
    color: string;
    advice: string;
    fiveElementsAdvice?: string[]; // 五行バランスに基づいた開運アドバイス
}

/**
 * 五行バランスを分析して開運アドバイスを生成
 * @param fiveElements 五行バランス
 * @param dateSeed 日付ベースのシード（毎日同じ結果を得るため）
 * @returns 開運アドバイスの配列
 */
function generateFiveElementsAdvice(fiveElements: FiveElements, dateSeed: number): string[] {
    const advice: string[] = [];
    const elementNames: (keyof FiveElements)[] = ['wood', 'fire', 'earth', 'metal', 'water'];
    const elementLabels = {
        wood: '木',
        fire: '火',
        earth: '土',
        metal: '金',
        water: '水'
    };

    // 各五行の値を取得
    const values = elementNames.map(name => fiveElements[name]);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / elementNames.length;
    const threshold = average * 0.3; // 平均の30%を閾値とする

    // 各五行を分析
    elementNames.forEach((element, index) => {
        const value = fiveElements[element];
        const diff = value - average;
        
        if (Math.abs(diff) < threshold) {
            // バランスが取れている
            const adviceList = FIVE_ELEMENTS_ADVICE[element].balanced;
            if (adviceList.length > 0) {
                const adviceIndex = (dateSeed + index) % adviceList.length;
                advice.push(`${elementLabels[element]}の気: ${adviceList[adviceIndex]}`);
            }
        } else if (diff < -threshold) {
            // 不足している
            const adviceList = FIVE_ELEMENTS_ADVICE[element].weak;
            if (adviceList.length > 0) {
                const adviceIndex = (dateSeed + index) % adviceList.length;
                advice.push(`${elementLabels[element]}の気: ${adviceList[adviceIndex]}`);
            }
        } else {
            // 過剰
            const adviceList = FIVE_ELEMENTS_ADVICE[element].strong;
            if (adviceList.length > 0) {
                const adviceIndex = (dateSeed + index) % adviceList.length;
                advice.push(`${elementLabels[element]}の気: ${adviceList[adviceIndex]}`);
            }
        }
    });

    // 最も偏りの大きい五行を優先的に表示（最大3つ）
    const imbalances = elementNames
        .map((name, index) => ({
            name,
            label: elementLabels[name],
            diff: Math.abs(fiveElements[name] - average),
            index
        }))
        .sort((a, b) => b.diff - a.diff)
        .slice(0, 3);

    // 優先度の高いアドバイスを先頭に配置
    const prioritizedAdvice: string[] = [];
    const remainingAdvice = [...advice];

    imbalances.forEach(imbalance => {
        const element = imbalance.name;
        const value = fiveElements[element];
        const diff = value - average;
        const threshold = average * 0.3;

        if (diff < -threshold) {
            const adviceList = FIVE_ELEMENTS_ADVICE[element].weak;
            if (adviceList.length > 0) {
                const adviceIndex = (dateSeed + imbalance.index) % adviceList.length;
                prioritizedAdvice.push(`${imbalance.label}の気: ${adviceList[adviceIndex]}`);
            }
        } else if (diff > threshold) {
            const adviceList = FIVE_ELEMENTS_ADVICE[element].strong;
            if (adviceList.length > 0) {
                const adviceIndex = (dateSeed + imbalance.index) % adviceList.length;
                prioritizedAdvice.push(`${imbalance.label}の気: ${adviceList[adviceIndex]}`);
            }
        }
    });

    // 優先度の高いアドバイスと残りを結合（最大5つまで）
    return [...prioritizedAdvice, ...remainingAdvice.filter(a => !prioritizedAdvice.includes(a))].slice(0, 5);
}

/**
 * 日付と生年月日から毎日異なる運勢を生成するアルゴリズム
 * @param userBazi ユーザーの四柱推命
 * @param date 運勢を計算する日付（デフォルト: 今日）
 * @returns 今日の運勢情報
 */
export function getDailyFortune(userBazi: FourPillars, date: Date = new Date()): DailyFortune {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    const dailyGanZhiStr = lunar.getDayInGanZhi();
    const dailyStem = dailyGanZhiStr.charAt(0);
    const dailyBranch = dailyGanZhiStr.charAt(1);

    const dailyStemIdx = STEMS.indexOf(dailyStem);
    const dailyBranchIdx = BRANCHES.indexOf(dailyBranch);
    const dayMasterStemIdx = userBazi.day.stem - 1; // 0-indexed

    // 1. Daily Ten Star
    const dailyTenStar = getTenGreatStar(dayMasterStemIdx, dailyStemIdx);

    // 2. Daily Twelve Star
    const dailyTwelveStar = getTwelveGreatStar(dayMasterStemIdx, dailyBranchIdx);

    // 3. Special Conditions
    const specialConditions: string[] = [];
    const userBranches = [userBazi.day.branchStr, userBazi.month.branchStr, userBazi.year.branchStr];

    // Check for Clash (Chuu) - 対冲
    userBranches.forEach((branch, idx) => {
        const clashBranch = BRANCH_RELATIONSHIPS.CLASH[branch as keyof typeof BRANCH_RELATIONSHIPS.CLASH];
        if (clashBranch === dailyBranch) {
            const pillarName = idx === 0 ? '日支' : idx === 1 ? '月支' : '年支';
            specialConditions.push(`${pillarName}対冲`);
        }
    });

    // Check for Combine (Shi-go) - 支合
    userBranches.forEach((branch, idx) => {
        const combineBranch = BRANCH_RELATIONSHIPS.COMBINE[branch as keyof typeof BRANCH_RELATIONSHIPS.COMBINE];
        if (combineBranch === dailyBranch) {
            const pillarName = idx === 0 ? '日支' : idx === 1 ? '月支' : '年支';
            specialConditions.push(`${pillarName}支合`);
        }
    });

    // 4. Lucky Direction (Eho) - 恵方
    const luckyDirection = DIRECTIONS[dailyBranch] || '北';

    // 5. 運勢レベルを決定（十二大従星のスコアと十大主星から算出）
    let baseScore = dailyTwelveStar.score;
    
    // 十大主星による補正
    const tenStarBonus: Record<string, number> = {
        '貫索星': -1, '石門星': -1,
        '鳳閣星': 0, '調舒星': 0,
        '禄存星': 1, '司禄星': 1,
        '車騎星': 2, '牽牛星': 2,
        '龍高星': 3, '玉堂星': 3
    };
    baseScore += tenStarBonus[dailyTenStar] || 0;
    
    // 特殊条件による補正
    if (specialConditions.some(c => c.includes('支合'))) {
        baseScore += 1; // 支合は吉
    }
    if (specialConditions.some(c => c.includes('対冲'))) {
        baseScore -= 2; // 対冲は凶
    }
    
    // スコアを0-12の範囲に制限
    baseScore = Math.max(0, Math.min(12, baseScore));

    // 運勢レベルを決定
    let level: '大吉' | '吉' | '中吉' | '小吉' | '末吉' = '末吉';
    if (baseScore >= FORTUNE_LEVELS['大吉'].minScore) {
        level = '大吉';
    } else if (baseScore >= FORTUNE_LEVELS['吉'].minScore) {
        level = '吉';
    } else if (baseScore >= FORTUNE_LEVELS['中吉'].minScore) {
        level = '中吉';
    } else if (baseScore >= FORTUNE_LEVELS['小吉'].minScore) {
        level = '小吉';
    }

    // アドバイスをランダムに選択（日付ベースの疑似乱数で毎日同じ結果）
    const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const adviceIndex = dateSeed % FORTUNE_ADVICE[level].length;
    const advice = FORTUNE_ADVICE[level][adviceIndex];

    // 五行バランスを計算して開運アドバイスを生成
    const fiveElements = calculateFiveElements(userBazi);
    const fiveElementsAdvice = generateFiveElementsAdvice(fiveElements, dateSeed);

    return {
        date: date.toISOString().split('T')[0],
        dailyGanZhi: {
            stem: dailyStem,
            branch: dailyBranch
        },
        dailyTenStar,
        dailyTwelveStar,
        specialConditions,
        luckyDirection,
        level,
        color: FORTUNE_LEVELS[level].color,
        advice,
        fiveElementsAdvice
    };
}
