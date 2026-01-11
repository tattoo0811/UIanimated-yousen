
import { Solar } from 'lunar-javascript';
import { FourPillars, GanZhi } from './logic';
import { getTenGreatStar, getTwelveGreatStar } from './logic';

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
    },
    // Three Harmonies (San-go) - 三合会局 (Simplified: just checking if daily branch completes a partial frame is too complex for now, just checking direct affinity)
    // We will focus on Chuu and Shigo for daily impact.
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
}

const DIRECTIONS = {
    '子': '北', '丑': '北北東', '寅': '東北東', '卯': '東', '辰': '東南東', '巳': '南南東',
    '午': '南', '未': '南南西', '申': '西南西', '酉': '西', '戌': '西北西', '亥': '北北西'
};

export function getDailyFortune(userBazi: FourPillars, date: Date = new Date()): DailyFortune {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    const dailyGanZhiStr = lunar.getDayInGanZhi();
    const dailyStem = dailyGanZhiStr.charAt(0);
    const dailyBranch = dailyGanZhiStr.charAt(1);

    const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

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

    // Check for Clash (Chuu)
    userBranches.forEach((branch, idx) => {
        // @ts-ignore
        if (BRANCH_RELATIONSHIPS.CLASH[branch] === dailyBranch) {
            const pillarName = idx === 0 ? '日支' : idx === 1 ? '月支' : '年支';
            specialConditions.push(`${pillarName}対冲`);
        }
    });

    // Check for Combine (Shi-go)
    userBranches.forEach((branch, idx) => {
        // @ts-ignore
        if (BRANCH_RELATIONSHIPS.COMBINE[branch] === dailyBranch) {
            const pillarName = idx === 0 ? '日支' : idx === 1 ? '月支' : '年支';
            specialConditions.push(`${pillarName}支合`);
        }
    });

    // Check for Tenchusatsu (Void) - Simplified logic
    // Need to calculate Tenchusatsu for the user first. 
    // Tenchusatsu is determined by (Day Stem Index - Day Branch Index).
    // But for now, let's skip complex Tenchusatsu calculation unless requested, 
    // as it requires determining the 2 void branches for the user's Day Pillar.

    // 4. Lucky Direction (Eho) - Simplified: Direction of the Daily Branch is often significant, 
    // or we can use the direction that balances the user. 
    // For "Daily Advice", the direction of the Day's Branch is often cited as the "Seat of the Day".
    // @ts-ignore
    const luckyDirection = DIRECTIONS[dailyBranch] || '北';

    return {
        date: date.toISOString().split('T')[0],
        dailyGanZhi: {
            stem: dailyStem,
            branch: dailyBranch
        },
        dailyTenStar,
        dailyTwelveStar,
        specialConditions,
        luckyDirection
    };
}
