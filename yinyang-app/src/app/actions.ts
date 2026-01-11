import {
    calculateBaZi,
    calculateEnergyScore,
    calculateFiveElements,
    calculateYangSen,
    calculateTaiun,
    getFourPillarsTenStar,
    getFourPillarsTwelveUn,
    getEnergyInterpretation
} from '@/utils/logic';
import { calculateDetailedScores } from '@/utils/scoringLogic';
import charactersData from '@/data/characters.json';
import { AnalysisResult, CharacterData } from '@/types';

// Create character index for O(1) lookup
const characterIndex = new Map<number, CharacterData>();
charactersData.forEach(char => {
    characterIndex.set(char.id, char as CharacterData);
});

// Helper to convert Stem string to Index
const STEM_TO_INDEX: Record<string, number> = {
    '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
    '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

export async function analyzeFate(data: { dateStr: string; timeStr: string; longitude: number; gender: 'male' | 'female' }): Promise<AnalysisResult> {
    const [year, month, day] = data.dateStr.split('-').map(Number);
    const [hours, minutes] = data.timeStr.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);

    // Calculate BaZi first (needed by other calculations)
    const bazi = calculateBaZi(date, data.longitude);

    // Parallelize independent calculations
    const [energyScore, fiveElements, yangSen, taiun, character] = await Promise.all([
        Promise.resolve(calculateEnergyScore(bazi)),
        Promise.resolve(calculateFiveElements(bazi)),
        Promise.resolve(calculateYangSen(bazi)),
        Promise.resolve(calculateTaiun(bazi, data.gender, date)),
        Promise.resolve(characterIndex.get(bazi.day.id))
    ]);

    if (!character) {
        throw new Error('Character not found');
    }

    const dayStemIdx = bazi.day.stem - 1;

    // Helper to calculate stars for a pillar
    const getPillarData = (pillar: any) => {
        const stemIdx = pillar.stem - 1;
        const branchIdx = pillar.branch - 1;

        // Ten Star (Main Stem)
        const tenStar = getFourPillarsTenStar(dayStemIdx, stemIdx);

        // Hidden Stem Ten Star
        const hiddenStemStr = pillar.hiddenStems[0];
        const hiddenStemIdx = STEM_TO_INDEX[hiddenStemStr];
        const hiddenTenStar = hiddenStemIdx !== undefined ? getFourPillarsTenStar(dayStemIdx, hiddenStemIdx) : '-';

        // Twelve Un
        const twelveUn = getFourPillarsTwelveUn(dayStemIdx, branchIdx);

        return {
            stem: pillar.stemStr,
            branch: pillar.branchStr,
            name: pillar.name,
            hiddenStems: pillar.hiddenStems,
            tenStar: pillar === bazi.day ? '－' : tenStar,
            hiddenTenStar,
            twelveUn
        };
    };

    // Calculate detailed scores in parallel with pillar data
    const [yearPillar, monthPillar, dayPillar, detailed] = await Promise.all([
        Promise.resolve(getPillarData(bazi.year)),
        Promise.resolve(getPillarData(bazi.month)),
        Promise.resolve(getPillarData(bazi.day)),
        Promise.resolve(calculateDetailedScores(bazi, fiveElements, yangSen, data.gender, date))
    ]);

    return {
        character,
        yinSen: {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: {
                stem: '－',
                branch: '－',
                name: '－',
                hiddenStems: ['－'],
                tenStar: '－',
                hiddenTenStar: '－',
                twelveUn: '－'
            }
        },
        yangSen,
        taiun,
        energyScore,
        energyInterpretation: getEnergyInterpretation(energyScore),
        fiveElements,
        birthDate: data.dateStr,
        birthTime: data.timeStr,
        detailed
    };
}
