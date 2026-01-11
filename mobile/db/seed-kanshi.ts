#!/usr/bin/env tsx
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { db } from './client';
import { kanshiPatterns, kanshiFeatures, kanshiAdvice } from './schema';

interface KanshiData {
    kanshi: string;
    character_name: string;
    concept: string;
    attributes: {
        primary: string;
        secondary: string;
    };
    features: string[];
}

// 特徴を分類する
function categorizeFeature(feature: string): {
    type: 'karma' | 'star' | 'personality' | 'destiny';
    name: string | null;
    category: string | null;
} {
    // 業（カルマ）の検出
    if (feature.includes('業')) {
        const match = feature.match(/「(.+?業)」/);
        return {
            type: 'karma',
            name: match ? match[1] : null,
            category: 'general',
        };
    }

    // 星の検出
    if (feature.includes('星')) {
        const match = feature.match(/「(.+?星)」/);
        return {
            type: 'star',
            name: match ? match[1] : null,
            category: 'general',
        };
    }

    // 性格・特性
    if (feature.includes('性格') || feature.includes('性質') || feature.includes('魅力')) {
        return {
            type: 'personality',
            name: null,
            category: 'general',
        };
    }

    // 運命・宿命
    return {
        type: 'destiny',
        name: null,
        category: 'general',
    };
}

// カテゴリ別アドバイスを生成
function generateAdvice(kanshiData: KanshiData, category: 'work' | 'love' | 'family' | 'fortune') {
    const { character_name, concept, features } = kanshiData;

    // カテゴリに応じた特徴を選択
    let relevantFeatures: string[] = [];
    let advice = '';
    let reasoning = '';
    let actionItems: string[] = [];
    let strengths = '';
    let challenges = '';

    switch (category) {
        case 'work':
            relevantFeatures = features.filter(f =>
                f.includes('仕事') || f.includes('才能') || f.includes('能力') ||
                f.includes('リーダー') || f.includes('成功') || f.includes('職')
            );
            advice = `【${character_name}の仕事運】\n\n${concept}\n\n${relevantFeatures.slice(0, 2).join('\n\n')}`;
            reasoning = `あなたの日柱「${kanshiData.kanshi}」は「${character_name}」の性質を持ちます。`;
            actionItems = [
                '自分の本質を理解し、それに合った職種を選ぶ',
                '強みを活かせる環境で働く',
                '弱点を補う努力を継続する',
            ];
            break;

        case 'love':
            relevantFeatures = features.filter(f =>
                f.includes('恋愛') || f.includes('結婚') || f.includes('異性') ||
                f.includes('感情') || f.includes('愛')
            );
            advice = `【${character_name}の恋愛運】\n\n${concept}\n\n${relevantFeatures.slice(0, 2).join('\n\n')}`;
            reasoning = `「${character_name}」の性質から、恋愛においても独特の傾向があります。`;
            actionItems = [
                '自分の恋愛傾向を理解する',
                '相手との相性を冷静に見極める',
                '長期的な関係を築く努力をする',
            ];
            break;

        case 'family':
            relevantFeatures = features.filter(f =>
                f.includes('家族') || f.includes('家庭') || f.includes('子') ||
                f.includes('親') || f.includes('絆')
            );
            advice = `【${character_name}の家庭運】\n\n${concept}\n\n${relevantFeatures.slice(0, 2).join('\n\n')}`;
            reasoning = `家族関係において、「${character_name}」の特性が影響します。`;
            actionItems = [
                '家族との適切な距離感を保つ',
                'コミュニケーションを大切にする',
                '家族の個性を尊重する',
            ];
            break;

        case 'fortune':
            relevantFeatures = features.filter(f =>
                f.includes('運') || f.includes('時期') || f.includes('環境') ||
                f.includes('開花') || f.includes('成長')
            );
            advice = `【${character_name}の運気】\n\n${concept}\n\n${relevantFeatures.slice(0, 2).join('\n\n')}`;
            reasoning = `「${character_name}」の運気の流れを理解することが重要です。`;
            actionItems = [
                '運気の波を理解し、適切なタイミングで行動する',
                '困難な時期も成長の機会と捉える',
                '自分のペースを大切にする',
            ];
            break;
    }

    // デフォルトのアドバイスを使用（特徴が見つからない場合）
    if (relevantFeatures.length === 0) {
        advice = `【${character_name}】\n\n${concept}\n\n${features[0]}\n\n${features[1] || ''}`;
    }

    return {
        advice,
        reasoning,
        actionItems: JSON.stringify(actionItems),
        strengths: features[0] || '',
        challenges: features[features.length - 1] || '',
    };
}

async function seedKanshi() {
    console.log('🌱 Seeding Kanshi patterns from YAML...\n');

    // YAMLファイルを読み込み
    const yamlContent = readFileSync('/Users/kitamuratatsuhiko/UIanimated/analytics-data/character-tokuchou.yaml', 'utf8');
    const kanshiList: KanshiData[] = parse(yamlContent);

    console.log(`Found ${kanshiList.length} Kanshi patterns\n`);

    for (const [index, kanshiData] of kanshiList.entries()) {
        const kanshiNumber = index + 1;

        // 干支名と読みを抽出
        const match = kanshiData.kanshi.match(/(\d+)\.\s*(.+?)\s*\((.+?)\)/);
        if (!match) continue;

        const [, , kanshiName, reading] = match;
        const stem = kanshiName[0];
        const branch = kanshiName[1];

        console.log(`Processing ${kanshiNumber}. ${kanshiName} (${reading})...`);

        // 1. 基本情報を挿入
        await db.insert(kanshiPatterns).values({
            id: kanshiNumber,
            kanshi: kanshiName,
            kanshiNumber,
            stem,
            branch,
            reading,
            characterName: kanshiData.character_name,
            concept: kanshiData.concept,
            primaryElement: kanshiData.attributes.primary,
            secondaryElement: kanshiData.attributes.secondary,
        });

        // 2. 特徴を細分化して挿入
        for (const feature of kanshiData.features) {
            const { type, name, category } = categorizeFeature(feature);

            await db.insert(kanshiFeatures).values({
                kanshi: kanshiName,
                featureType: type,
                featureName: name,
                description: feature,
                category,
            });
        }

        // 3. カテゴリ別アドバイスを生成して挿入
        const categories: Array<'work' | 'love' | 'family' | 'fortune'> = ['work', 'love', 'family', 'fortune'];

        for (const category of categories) {
            const adviceData = generateAdvice(kanshiData, category);

            await db.insert(kanshiAdvice).values({
                kanshi: kanshiName,
                category,
                ...adviceData,
            });
        }
    }

    console.log('\n✅ Kanshi seeding completed!');
    console.log(`   - ${kanshiList.length} patterns`);
    console.log(`   - ${kanshiList.length * 4} features (avg)`);
    console.log(`   - ${kanshiList.length * 4} advice entries`);
}

seedKanshi().catch(console.error);
