import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 基本マスターデータ
export const stems = sqliteTable('stems', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    yinYang: text('yin_yang').notNull(),
    element: text('element').notNull(),
    meaning: text('meaning'),
    workAdvice: text('work_advice'),
    loveAdvice: text('love_advice'),
    familyAdvice: text('family_advice'),
});

export const branches = sqliteTable('branches', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    element: text('element').notNull(),
    hiddenStems: text('hidden_stems'),
    meaning: text('meaning'),
});

export const tenStars = sqliteTable('ten_stars', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    nature: text('nature'),
    workAdvice: text('work_advice'),
    loveAdvice: text('love_advice'),
    familyAdvice: text('family_advice'),
    strengths: text('strengths'),
    weaknesses: text('weaknesses'),
});

export const twelveUn = sqliteTable('twelve_un', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    score: integer('score').notNull(),
    meaning: text('meaning'),
    energyLevel: text('energy_level'),
});

export const tsuhensei = sqliteTable('tsuhensei', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    nature: text('nature'),
    workAdvice: text('work_advice'),
    loveAdvice: text('love_advice'),
    familyAdvice: text('family_advice'),
});

export const tenchusatsuTypes = sqliteTable('tenchusatsu_types', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    missingBranches: text('missing_branches').notNull(),
    characteristics: text('characteristics'),
    advice: text('advice'),
});

// 60干支パターン
export const kanshiPatterns = sqliteTable('kanshi_patterns', {
    id: integer('id').primaryKey(),
    kanshi: text('kanshi').notNull().unique(),
    kanshiNumber: integer('kanshi_number').notNull(),
    stem: text('stem').notNull(),
    branch: text('branch').notNull(),
    reading: text('reading').notNull(),
    characterName: text('character_name').notNull(),
    concept: text('concept').notNull(),
    primaryElement: text('primary_element').notNull(),
    secondaryElement: text('secondary_element').notNull(),
});

export const kanshiFeatures = sqliteTable('kanshi_features', {
    id: integer('id').primaryKey(),
    kanshi: text('kanshi').notNull(),
    featureType: text('feature_type').notNull(),
    featureName: text('feature_name'),
    description: text('description').notNull(),
    category: text('category'),
});

export const kanshiAdvice = sqliteTable('kanshi_advice', {
    id: integer('id').primaryKey(),
    kanshi: text('kanshi').notNull(),
    category: text('category').notNull(),
    advice: text('advice').notNull(),
    reasoning: text('reasoning').notNull(),
    actionItems: text('action_items').notNull(),
    strengths: text('strengths'),
    challenges: text('challenges'),
});

// ============================================================
// 相性分析テーブル
// ============================================================

export const compatibilityPatterns = sqliteTable('compatibility_patterns', {
    id: integer('id').primaryKey(),
    kanshiA: text('kanshi_a').notNull(),
    kanshiB: text('kanshi_b').notNull(),
    stemRelation: text('stem_relation').notNull(),
    branchRelation: text('branch_relation').notNull(),
    compatibilityScore: integer('compatibility_score').notNull(),
    relationshipType: text('relationship_type').notNull(),
    strengths: text('strengths').notNull(),
    challenges: text('challenges').notNull(),
    advice: text('advice').notNull(),
    dynamicDescription: text('dynamic_description').notNull(),
});

// 干の関係マスターデータ
export const stemRelations = sqliteTable('stem_relations', {
    id: integer('id').primaryKey(),
    stemA: text('stem_a').notNull(),
    stemB: text('stem_b').notNull(),
    relationType: text('relation_type').notNull(),
    elementA: text('element_a').notNull(),
    elementB: text('element_b').notNull(),
    description: text('description').notNull(),
    harmonyLevel: integer('harmony_level').notNull(),
});

// 支の関係マスターデータ
export const branchRelations = sqliteTable('branch_relations', {
    id: integer('id').primaryKey(),
    branchA: text('branch_a').notNull(),
    branchB: text('branch_b').notNull(),
    relationType: text('relation_type').notNull(),
    description: text('description').notNull(),
    harmonyLevel: integer('harmony_level').notNull(),
});

// その他の既存テーブル...
export const combinationRules = sqliteTable('combination_rules', {
    id: integer('id').primaryKey(),
    ruleType: text('rule_type').notNull(),
    conditionJson: text('condition_json').notNull(),
    category: text('category').notNull(),
    adviceTemplate: text('advice_template').notNull(),
    priority: integer('priority').default(0),
});

export const adviceTemplates = sqliteTable('advice_templates', {
    id: integer('id').primaryKey(),
    category: text('category').notNull(),
    elementType: text('element_type').notNull(),
    elementName: text('element_name').notNull(),
    template: text('template').notNull(),
    variables: text('variables'),
});

export const userResults = sqliteTable('user_results', {
    id: text('id').primaryKey(),
    birthDate: text('birth_date').notNull(),
    gender: text('gender').notNull(),
    insenJson: text('insen_json').notNull(),
    yangsenJson: text('yangsen_json').notNull(),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const chatHistory = sqliteTable('chat_history', {
    id: text('id').primaryKey(),
    userResultId: text('user_result_id').references(() => userResults.id),
    category: text('category'),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
