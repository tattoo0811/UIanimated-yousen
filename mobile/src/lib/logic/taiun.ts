import type { FourPillars, Taiun, TaiunCycle } from '@/src/types';
import { STEMS, BRANCHES } from './constants';
import { getTenGreatStar, getTwelveGreatStar } from './yangsen';

/**
 * 大運を計算（0歳〜90歳までフルバージョン）
 */
export function calculateTaiun(bazi: FourPillars, birthDate: Date, gender: 'male' | 'female'): Taiun {
    const yearStemIdx = bazi.year.stem - 1;
    const isYangYear = yearStemIdx % 2 === 0;

    // 順行/逆行: 陽年男・陰年女→順行、陰年男・陽年女→逆行
    const direction = (isYangYear && gender === 'male') || (!isYangYear && gender === 'female')
        ? 'forward'
        : 'backward';

    // 立運年齢（節入りからの日数÷3）- 簡易版
    const day = birthDate.getDate();
    const startAge = Math.max(1, Math.floor(day / 3));

    // 10サイクル生成（0〜99歳までカバー）
    const cycles = generateTaiunCycles(bazi, direction, startAge, 10);

    return { gender, direction, startAge, cycles };
}

/**
 * 大運サイクルを生成
 */
function generateTaiunCycles(
    bazi: FourPillars,
    direction: 'forward' | 'backward',
    startAge: number,
    count: number
): TaiunCycle[] {
    const cycles: TaiunCycle[] = [];
    const monthStemIdx = bazi.month.stem - 1;
    const monthBranchIdx = bazi.month.branch - 1;
    const dayStemIdx = bazi.day.stem - 1;

    for (let i = 0; i < count; i++) {
        const age = startAge + (i * 10);
        const offset = direction === 'forward' ? i + 1 : -(i + 1);
        const stemIdx = ((monthStemIdx + offset) % 10 + 10) % 10;
        const branchIdx = ((monthBranchIdx + offset) % 12 + 12) % 12;
        const stem = STEMS[stemIdx];
        const branch = BRANCHES[branchIdx];
        const tenStar = getTenGreatStar(dayStemIdx, stemIdx);
        const twelveStar = getTwelveGreatStar(dayStemIdx, branchIdx);

        cycles.push({
            startAge: age,
            endAge: age + 9,
            stem,
            branch,
            name: stem + branch,
            tenStar,
            twelveStar: twelveStar.name
        });
    }
    return cycles;
}

/**
 * 天中殺の特殊ケースをチェック
 */
export function checkSpecialTenchusatsu(bazi: FourPillars): {
    type: string;
    missingBranches: string[];
    specialCases: string[];
} {
    const dayId = bazi.day.id;
    const group = Math.floor((dayId - 1) / 10);
    const types = ['戌亥天中殺', '申酉天中殺', '午未天中殺', '辰巳天中殺', '寅卯天中殺', '子丑天中殺'];
    const missing = [
        ['戌', '亥'], ['申', '酉'], ['午', '未'], ['辰', '巳'], ['寅', '卯'], ['子', '丑']
    ];

    const tenchusatsuType = types[group];
    const missingBranches = missing[group];
    const specialCases: string[] = [];

    // 生年天中殺チェック（年支が空亡に入っている）
    if (missingBranches.includes(bazi.year.branchStr)) {
        specialCases.push('生年天中殺');
    }

    // 生月天中殺チェック（月支が空亡に入っている）
    if (missingBranches.includes(bazi.month.branchStr)) {
        specialCases.push('生月天中殺');
    }

    // 生日天中殺チェック（日支が空亡に入っている）
    if (missingBranches.includes(bazi.day.branchStr)) {
        specialCases.push('生日天中殺');
    }

    return {
        type: tenchusatsuType,
        missingBranches,
        specialCases
    };
}

/**
 * 現在の大運を取得
 */
export function getCurrentTaiunCycle(taiun: Taiun, currentAge: number): TaiunCycle | null {
    return taiun.cycles.find(cycle =>
        currentAge >= cycle.startAge && currentAge <= cycle.endAge
    ) || null;
}
