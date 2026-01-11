import type { FourPillars } from '@/src/types';
import { getDailyFortune, type DailyFortune } from './dailyFortune';

export interface WeeklyFortune {
    weekStart: string; // 週の開始日（ISO形式）
    weekEnd: string;   // 週の終了日（ISO形式）
    dailyFortunes: DailyFortune[]; // 7日分の日次運勢
    summary: {
        averageLevel: '大吉' | '吉' | '中吉' | '小吉' | '末吉';
        averageScore: number; // 平均スコア
        bestDay: {
            date: string;
            level: '大吉' | '吉' | '中吉' | '小吉' | '末吉';
            score: number;
        };
        worstDay: {
            date: string;
            level: '大吉' | '吉' | '中吉' | '小吉' | '末吉';
            score: number;
        };
        trend: 'upward' | 'downward' | 'stable'; // 週の傾向
        luckyDays: number; // 吉以上の日数
        cautionDays: number; // 小吉以下の日数
    };
    weeklyAdvice: string; // 週全体のアドバイス
}

// 運勢レベルのスコアマッピング（計算用）
const LEVEL_SCORES: Record<'大吉' | '吉' | '中吉' | '小吉' | '末吉', number> = {
    '大吉': 10,
    '吉': 7,
    '中吉': 5,
    '小吉': 3,
    '末吉': 1
};

// 週次アドバイス
const WEEKLY_ADVICE: Record<string, string[]> = {
    upward: [
        '今週は運気が上昇傾向にあります。後半に向けてさらに良い流れが期待できそうです。',
        '週の後半にかけて運気が高まります。重要な決断は後半に回すと良いでしょう。',
        '今週は徐々に運気が上がっていく週です。焦らず、着実に進めましょう。'
    ],
    downward: [
        '今週は運気が下降傾向にあります。前半のうちに重要なことを済ませることをおすすめします。',
        '週の後半は慎重に行動しましょう。無理をせず、準備や見直しの時間に充ててください。',
        '今週は運気が下がり気味です。焦らず、一歩ずつ着実に進めることが大切です。'
    ],
    stable: [
        '今週は運気が安定しています。計画通りに進めれば良い結果が得られるでしょう。',
        '今週は全体的にバランスの取れた週です。無理をせず、自然な流れに任せましょう。',
        '今週は安定した運気が続きます。継続的な努力が実を結ぶ週です。'
    ]
};

/**
 * 週の開始日を取得（月曜日を週の開始とする）
 */
function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 (日曜) から 6 (土曜)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日に調整
    return new Date(d.setDate(diff));
}

/**
 * 週次運勢を生成
 * @param userBazi ユーザーの四柱推命
 * @param date 基準日（デフォルト: 今日）
 * @returns 週次運勢情報
 */
export function getWeeklyFortune(userBazi: FourPillars, date: Date = new Date()): WeeklyFortune {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // 7日後

    // 7日分の日次運勢を取得
    const dailyFortunes: DailyFortune[] = [];
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + i);
        dailyFortunes.push(getDailyFortune(userBazi, currentDate));
    }

    // 各日のスコアを計算
    const scores = dailyFortunes.map(fortune => {
        // 十二大従星のスコアを基準に、運勢レベルによる補正を加える
        let score = fortune.dailyTwelveStar.score;
        
        // 十大主星による補正
        const tenStarBonus: Record<string, number> = {
            '貫索星': -1, '石門星': -1,
            '鳳閣星': 0, '調舒星': 0,
            '禄存星': 1, '司禄星': 1,
            '車騎星': 2, '牽牛星': 2,
            '龍高星': 3, '玉堂星': 3
        };
        score += tenStarBonus[fortune.dailyTenStar] || 0;
        
        // 特殊条件による補正
        if (fortune.specialConditions.some(c => c.includes('支合'))) {
            score += 1;
        }
        if (fortune.specialConditions.some(c => c.includes('対冲'))) {
            score -= 2;
        }
        
        // スコアを0-12の範囲に制限
        score = Math.max(0, Math.min(12, score));
        
        return {
            date: fortune.date,
            score,
            level: fortune.level
        };
    });

    // 平均スコアを計算
    const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    
    // 平均レベルを決定
    let averageLevel: '大吉' | '吉' | '中吉' | '小吉' | '末吉' = '末吉';
    if (averageScore >= 10) {
        averageLevel = '大吉';
    } else if (averageScore >= 7) {
        averageLevel = '吉';
    } else if (averageScore >= 5) {
        averageLevel = '中吉';
    } else if (averageScore >= 3) {
        averageLevel = '小吉';
    }

    // 最高・最低の日を特定
    const bestDay = scores.reduce((best, current) => 
        current.score > best.score ? current : best
    );
    const worstDay = scores.reduce((worst, current) => 
        current.score < worst.score ? current : worst
    );

    // 傾向を判定（前半3日と後半4日の平均を比較）
    const firstHalfAvg = scores.slice(0, 3).reduce((sum, s) => sum + s.score, 0) / 3;
    const secondHalfAvg = scores.slice(3, 7).reduce((sum, s) => sum + s.score, 0) / 4;
    const diff = secondHalfAvg - firstHalfAvg;
    
    let trend: 'upward' | 'downward' | 'stable';
    if (diff > 1) {
        trend = 'upward';
    } else if (diff < -1) {
        trend = 'downward';
    } else {
        trend = 'stable';
    }

    // 吉以上の日数と小吉以下の日数をカウント
    const luckyDays = dailyFortunes.filter(f => 
        f.level === '大吉' || f.level === '吉'
    ).length;
    const cautionDays = dailyFortunes.filter(f => 
        f.level === '小吉' || f.level === '末吉'
    ).length;

    // 週次アドバイスを生成（週の開始日をシードとして使用）
    const weekSeed = weekStart.getFullYear() * 10000 + (weekStart.getMonth() + 1) * 100 + weekStart.getDate();
    const adviceList = WEEKLY_ADVICE[trend];
    const adviceIndex = weekSeed % adviceList.length;
    const weeklyAdvice = adviceList[adviceIndex];

    return {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        dailyFortunes,
        summary: {
            averageLevel,
            averageScore: Math.round(averageScore * 10) / 10,
            bestDay: {
                date: bestDay.date,
                level: bestDay.level,
                score: bestDay.score
            },
            worstDay: {
                date: worstDay.date,
                level: worstDay.level,
                score: worstDay.score
            },
            trend,
            luckyDays,
            cautionDays
        },
        weeklyAdvice
    };
}
