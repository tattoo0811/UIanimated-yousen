#!/usr/bin/env tsx
import { db } from './client';
import { stemRelations, branchRelations } from './schema';

// 十天干
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 五行対応
const STEM_ELEMENTS: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
};

// 十二支
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 支の五行
const BRANCH_ELEMENTS: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 五行の相生相剋関係
function getElementRelation(elementA: string, elementB: string): {
    type: string;
    harmony: number;
    description: string;
} {
    if (elementA === elementB) {
        return {
            type: '比和',
            harmony: 7,
            description: '同じ五行同士。共感しやすいが、競争関係にもなりやすい。',
        };
    }

    const shengRelations: Record<string, string> = {
        '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
    };

    const keRelations: Record<string, string> = {
        '木': '土', '火': '金', '土': '水', '金': '木', '水': '火',
    };

    if (shengRelations[elementA] === elementB) {
        return {
            type: '相生（生む）',
            harmony: 9,
            description: `${elementA}が${elementB}を生み出す関係。支援的で調和的。`,
        };
    }

    if (shengRelations[elementB] === elementA) {
        return {
            type: '相生（生まれる）',
            harmony: 8,
            description: `${elementB}が${elementA}を生み出す関係。助けられる立場。`,
        };
    }

    if (keRelations[elementA] === elementB) {
        return {
            type: '相剋（剋す）',
            harmony: 4,
            description: `${elementA}が${elementB}を剋する関係。支配的だが緊張を生む。`,
        };
    }

    if (keRelations[elementB] === elementA) {
        return {
            type: '相剋（剋される）',
            harmony: 5,
            description: `${elementB}が${elementA}を剋する関係。刺激的だが圧迫感も。`,
        };
    }

    return {
        type: '中立',
        harmony: 6,
        description: '特別な関係性はないが、バランスは取れている。',
    };
}

// 干合の判定
function isKangoRelation(stemA: string, stemB: string): boolean {
    const kangoSets = [
        ['甲', '己'],
        ['乙', '庚'],
        ['丙', '辛'],
        ['丁', '壬'],
        ['戊', '癸'],
    ];

    return kangoSets.some(
        set => (set[0] === stemA && set[1] === stemB) || (set[0] === stemB && set[1] === stemA)
    );
}

// 支の特殊関係
function getBranchSpecialRelation(branchA: string, branchB: string): {
    type: string;
    harmony: number;
    description: string;
} | null {
    const branchIndexA = BRANCHES.indexOf(branchA);
    const branchIndexB = BRANCHES.indexOf(branchB);

    // 冲（対立）
    if (Math.abs(branchIndexA - branchIndexB) === 6) {
        return {
            type: '冲',
            harmony: 2,
            description: '正反対の位置。激しい対立や変化をもたらす関係。',
        };
    }

    // 三合（最高の調和）
    const sangoSets = [
        ['申', '子', '辰'], // 水局
        ['亥', '卯', '未'], // 木局
        ['寅', '午', '戌'], // 火局
        ['巳', '酉', '丑'], // 金局
    ];

    for (const set of sangoSets) {
        if (set.includes(branchA) && set.includes(branchB)) {
            return {
                type: '三合',
                harmony: 10,
                description: '最高の調和。運命的な縁を示す。',
            };
        }
    }

    // 六合（良好な縁）
    const rokugoPairs = [
        ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
        ['辰', '酉'], ['巳', '申'], ['午', '未'],
    ];

    for (const pair of rokugoPairs) {
        if (
            (pair[0] === branchA && pair[1] === branchB) ||
            (pair[0] === branchB && pair[1] === branchA)
        ) {
            return {
                type: '六合',
                harmony: 9,
                description: '良好な縁。お互いを補完し合う関係。',
            };
        }
    }

    // 刑（試練）
    const keiSets = [
        ['寅', '巳', '申'],
        ['丑', '戌', '未'],
        ['子', '卯'],
    ];

    for (const set of keiSets) {
        if (set.includes(branchA) && set.includes(branchB)) {
            return {
                type: '刑',
                harmony: 4,
                description: '試練を伴う縁。成長の機会でもある。',
            };
        }
    }

    return null;
}

async function seedRelations() {
    console.log('🌱 Seeding stem and branch relations...\n');

    // 1. 干の関係をシード
    console.log('Seeding stem relations...');
    let stemCount = 0;

    for (const stemA of STEMS) {
        for (const stemB of STEMS) {
            const elementA = STEM_ELEMENTS[stemA];
            const elementB = STEM_ELEMENTS[stemB];

            let relationType: string;
            let harmonyLevel: number;
            let description: string;

            // 干合の判定
            if (isKangoRelation(stemA, stemB)) {
                relationType = '干合';
                harmonyLevel = 10;
                description = `${stemA}と${stemB}の干合。運命的な調和を示す特別な関係。`;
            } else {
                const relation = getElementRelation(elementA, elementB);
                relationType = relation.type;
                harmonyLevel = relation.harmony;
                description = relation.description;
            }

            await db.insert(stemRelations).values({
                stemA,
                stemB,
                relationType,
                elementA,
                elementB,
                description,
                harmonyLevel,
            });

            stemCount++;
        }
    }

    console.log(`✅ Seeded ${stemCount} stem relations\n`);

    // 2. 支の関係をシード
    console.log('Seeding branch relations...');
    let branchCount = 0;

    for (const branchA of BRANCHES) {
        for (const branchB of BRANCHES) {
            const specialRelation = getBranchSpecialRelation(branchA, branchB);

            let relationType: string;
            let harmonyLevel: number;
            let description: string;

            if (specialRelation) {
                relationType = specialRelation.type;
                harmonyLevel = specialRelation.harmony;
                description = specialRelation.description;
            } else {
                // 通常の五行関係
                const elementA = BRANCH_ELEMENTS[branchA];
                const elementB = BRANCH_ELEMENTS[branchB];
                const relation = getElementRelation(elementA, elementB);
                relationType = relation.type;
                harmonyLevel = relation.harmony;
                description = relation.description;
            }

            await db.insert(branchRelations).values({
                branchA,
                branchB,
                relationType,
                description,
                harmonyLevel,
            });

            branchCount++;
        }
    }

    console.log(`✅ Seeded ${branchCount} branch relations\n`);
    console.log('🎉 Relations seeding completed!');
    console.log(`   - Stem relations: ${stemCount}`);
    console.log(`   - Branch relations: ${branchCount}`);
}

seedRelations().catch(console.error);
