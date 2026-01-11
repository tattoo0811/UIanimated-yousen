#!/usr/bin/env tsx
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { db } from './client';
import { kanshiPatterns, compatibilityPatterns, stemRelations, branchRelations } from './schema';
import { eq, and } from 'drizzle-orm';

interface KanshiData {
    kanshi: string;
    character_name: string;
    concept: string;
}

async function generateCompatibility() {
    console.log('🌱 Generating 3,600 compatibility patterns...\n');

    // Load Kanshi patterns from YAML
    const yamlContent = readFileSync('/Users/kitamuratatsuhiko/UIanimated/analytics-data/character-tokuchou.yaml', 'utf8');
    const kanshiList: KanshiData[] = parse(yamlContent);

    // Get all Kanshi from database
    const allKanshi = await db.select().from(kanshiPatterns);
    console.log(`Found ${allKanshi.length} Kanshi patterns\n`);

    let count = 0;
    const relationshipTypes = ['romantic', 'business', 'friendship', 'family'];

    for (const kanshiA of allKanshi) {
        for (const kanshiB of allKanshi) {
            // Get stem relation
            const stemRel = await db
                .select()
                .from(stemRelations)
                .where(
                    and(
                        eq(stemRelations.stemA, kanshiA.stem),
                        eq(stemRelations.stemB, kanshiB.stem)
                    )
                )
                .limit(1);

            // Get branch relation
            const branchRel = await db
                .select()
                .from(branchRelations)
                .where(
                    and(
                        eq(branchRelations.branchA, kanshiA.branch),
                        eq(branchRelations.branchB, kanshiB.branch)
                    )
                )
                .limit(1);

            if (stemRel.length === 0 || branchRel.length === 0) {
                console.error(`Missing relation data for ${kanshiA.kanshi} × ${kanshiB.kanshi}`);
                continue;
            }

            const stemRelData = stemRel[0];
            const branchRelData = branchRel[0];

            // Calculate compatibility score (0-100)
            const stemScore = stemRelData.harmonyLevel * 5; // 0-50
            const branchScore = branchRelData.harmonyLevel * 5; // 0-50
            const compatibilityScore = stemScore + branchScore;

            // Generate relationship-specific advice
            for (const relType of relationshipTypes) {
                const advice = generateAdvice(
                    kanshiA,
                    kanshiB,
                    stemRelData,
                    branchRelData,
                    relType,
                    compatibilityScore
                );

                await db.insert(compatibilityPatterns).values({
                    kanshiA: kanshiA.kanshi,
                    kanshiB: kanshiB.kanshi,
                    stemRelation: stemRelData.relationType,
                    branchRelation: branchRelData.relationType,
                    compatibilityScore,
                    relationshipType: relType,
                    ...advice,
                });

                count++;
                if (count % 100 === 0) {
                    console.log(`Generated ${count} compatibility patterns...`);
                }
            }
        }
    }

    console.log(`\n✅ Compatibility generation completed!`);
    console.log(`   Total patterns: ${count}`);
}

function generateAdvice(
    kanshiA: any,
    kanshiB: any,
    stemRel: any,
    branchRel: any,
    relType: string,
    score: number
): {
    strengths: string;
    challenges: string;
    advice: string;
    dynamicDescription: string;
} {
    const charA = kanshiA.characterName;
    const charB = kanshiB.characterName;

    let strengths = '';
    let challenges = '';
    let advice = '';

    // 干の関係に基づく分析
    if (stemRel.relationType === '干合') {
        strengths = '運命的な調和。お互いを深く理解し合える特別な縁。';
        challenges = '依存しすぎる傾向。適度な距離感を保つことが重要。';
    } else if (stemRel.relationType.includes('相生')) {
        strengths = '支援的な関係。一方が他方を自然に助ける流れがある。';
        challenges = '与える側と受ける側のバランスに注意。';
    } else if (stemRel.relationType.includes('相剋')) {
        strengths = '刺激的で成長を促す関係。お互いを高め合える。';
        challenges = '対立や緊張が生じやすい。理解と妥協が必要。';
    } else if (stemRel.relationType === '比和') {
        strengths = '共感しやすく、価値観が似ている。';
        challenges = '競争関係になりやすい。役割分担が重要。';
    }

    // 支の関係に基づく追加分析
    if (branchRel.relationType === '三合' || branchRel.relationType === '六合') {
        strengths += ' 深い絆で結ばれた運命的な縁。';
    } else if (branchRel.relationType === '冲') {
        challenges += ' 価値観の違いから衝突しやすい。';
    }

    // 関係タイプ別のアドバイス
    switch (relType) {
        case 'romantic':
            if (score >= 80) {
                advice = `${charA}と${charB}の組み合わせは、恋愛において非常に良好です。${strengths}お互いの個性を尊重し、長期的な関係を築けるでしょう。`;
            } else if (score >= 60) {
                advice = `${charA}と${charB}は、努力次第で良い関係を築けます。${challenges}コミュニケーションを大切にしましょう。`;
            } else {
                advice = `${charA}と${charB}の組み合わせは、課題が多い関係です。${challenges}お互いの違いを認め合うことが成功の鍵です。`;
            }
            break;

        case 'business':
            if (score >= 80) {
                advice = `ビジネスパートナーとして最適。${strengths}役割分担を明確にすることで、大きな成功を収められます。`;
            } else if (score >= 60) {
                advice = `ビジネス関係は可能ですが、${challenges}契約や役割を明確にすることが重要です。`;
            } else {
                advice = `ビジネスパートナーとしては慎重に。${challenges}短期的なプロジェクトに限定するのが賢明です。`;
            }
            break;

        case 'friendship':
            if (score >= 70) {
                advice = `友人として素晴らしい関係。${strengths}長く続く友情を育めるでしょう。`;
            } else {
                advice = `友人関係は可能ですが、${challenges}適度な距離感を保つことが大切です。`;
            }
            break;

        case 'family':
            advice = `家族としての関係では、${strengths}${challenges}お互いの立場を理解し、尊重し合うことが調和の鍵です。`;
            break;
    }

    const dynamicDescription = `${charA}（${kanshiA.kanshi}）と${charB}（${kanshiB.kanshi}）の関係性。干は${stemRel.relationType}、支は${branchRel.relationType}。`;

    return {
        strengths,
        challenges,
        advice,
        dynamicDescription,
    };
}

generateCompatibility().catch(console.error);
