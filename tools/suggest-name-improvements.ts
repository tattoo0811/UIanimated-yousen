/**
 * キャラクター名改善提案ツール
 * 
 * NAME-AGE-ANALYSIS.jsonの問題点に基づき、改善された名前を提案
 * 実行: npx tsx tools/suggest-name-improvements.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// character-improvement-proposal.mdより抽出した名字データベース
const UNCOMMON_LASTNAMES = [
    // 自然由来
    '小鳥遊', '風間', '星野', '天野', '雨宮',
    // 職業由来
    '犬養', '鍛冶', '酒井', '神谷',
    // 珍しい読み
    '五月雨', '九条', '西園寺',
    // 追加
    '青陽', '朝日奈', '涼風', '神楽', '鍛山'
];

// 年代別人気名前（character-improvement-proposal.mdより）
const POPULAR_NAMES = {
    male: {
        '1970-1980': ['浩一', '和彦', '直樹', '拓也', '聡', '翔太', '智也', '誠司'],
        '1990-2000': ['翔', '拓海', '大輝', '悠真', '蓮', '陽翔', '樹', '大和', '悠斗', '蒼', '陸', '健太', '颯太', '隼人'],
        '2000-2020': ['蓮', '陽翔', '悠真', '颯', '蒼', '大翔', '陽向', '結翔', '悠斗', '朝陽', 'はると', 'そうた']
    },
    female: {
        '1970-1980': ['真由美', '恵', '香織', '美咲', '舞', '愛', '麻衣', '理恵'],
        '1990-2000': ['葵', '美月', '結衣', '優花', '陽菜', '結菜', '真央', '彩', '萌', '凛', '愛', '美咲', '美羽', '愛莉'],
        '2000-2020': ['陽葵', '結菜', '莉子', '芽依', '澪', '結衣', '陽菜', '凛', '葵', '咲良', 'ひな', 'ゆい']
    }
};

interface Issue {
    episode: number;
    name: string;
    birthYear: number;
    age: number;
    gender: string;
    issue: string;
    fitScore: number;
}

interface Suggestion {
    episode: number;
    originalName: string;
    suggestedName: string;
    reason: string;
    birthYear: number;
    gender: string;
}

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function suggestName(issue: Issue, usedNames: Set<string>, uncommonLastNamePool: string[]): Suggestion {
    const birthYear = issue.birthYear;
    const gender = issue.gender as 'male' | 'female';
    const [originalLastName, originalFirstName] = issue.name.split(' ');

    let suggestedFirstName: string;
    let suggestedLastName: string;

    // 生年に基づいて適切な名前を選択
    if (birthYear >= 1990 && birthYear < 2000) {
        const candidates = POPULAR_NAMES[gender]['1990-2000'];
        suggestedFirstName = getRandomItem(candidates);
    } else if (birthYear >= 2000 && birthYear < 2010) {
        const candidates = POPULAR_NAMES[gender]['2000-2020'];
        suggestedFirstName = getRandomItem(candidates);
    } else if (birthYear >= 2010) {
        const candidates = POPULAR_NAMES[gender]['2000-2020'];
        suggestedFirstName = getRandomItem(candidates);
    } else {
        // その他の年代はデフォルト
        suggestedFirstName = originalFirstName;
    }

    // 名字: 30%の確率で珍しい名字に変更
    if (Math.random() < 0.3 && uncommonLastNamePool.length > 0) {
        const idx = Math.floor(Math.random() * uncommonLastNamePool.length);
        suggestedLastName = uncommonLastNamePool.splice(idx, 1)[0]; // 使用済みは削除
    } else {
        suggestedLastName = originalLastName;
    }

    const suggestedName = `${suggestedLastName} ${suggestedFirstName}`;

    // 重複チェック（まだ使われていない名前になるまで再試行）
    let attempts = 0;
    while (usedNames.has(suggestedName) && attempts < 10) {
        if (birthYear >= 1990 && birthYear < 2000) {
            suggestedFirstName = getRandomItem(POPULAR_NAMES[gender]['1990-2000']);
        } else if (birthYear >= 2000) {
            suggestedFirstName = getRandomItem(POPULAR_NAMES[gender]['2000-2020']);
        }
        attempts++;
    }

    usedNames.add(suggestedName);

    const reason = issue.issue || `${birthYear}年生に適した名前に変更`;

    return {
        episode: issue.episode,
        originalName: issue.name,
        suggestedName,
        reason,
        birthYear,
        gender
    };
}

async function main() {
    const claudeDocsDir = path.join(__dirname, '..', 'claudedocs');

    // NAME-AGE-ANALYSIS.json読み込み
    const analysisData = JSON.parse(
        fs.readFileSync(path.join(claudeDocsDir, 'NAME-AGE-ANALYSIS.json'), 'utf8')
    );

    // PERSONA-SHEETS.json読み込み（重複チェック用）
    const personaData = JSON.parse(
        fs.readFileSync(path.join(claudeDocsDir, 'PERSONA-SHEETS.json'), 'utf8')
    );

    const usedNames = new Set<string>(
        personaData.personas.map((p: any) => p.name.replace(/（再登場）/g, '').trim())
    );

    console.log('📝 キャラクター名改善提案生成開始...\n');

    const issues: Issue[] = analysisData.issues;
    const suggestions: Suggestion[] = [];

    // 珍しい名字のプール（ランダム選択用）
    const uncommonLastNamePool = [...UNCOMMON_LASTNAMES];

    // 問題のある名前に対して提案生成
    for (const issue of issues) {
        const suggestion = suggestName(issue, usedNames, uncommonLastNamePool);
        suggestions.push(suggestion);
    }

    // 重複名「大野 翔」の片方を変更
    const duplicateEp66 = {
        episode: 66,
        name: '大野 翔',
        birthYear: 2001,
        age: 25,
        gender: 'male',
        issue: '名前重複（EP23と同じ）',
        fitScore: 50
    };

    suggestions.push(suggestName(duplicateEp66 as Issue, usedNames, uncommonLastNamePool));

    console.log(`✅ 提案生成完了: ${suggestions.length}件\n`);
    console.log('=== 改善提案リスト ===\n');

    suggestions.forEach(s => {
        console.log(`EP${s.episode} ${s.originalName} → ${s.suggestedName}`);
        console.log(`  理由: ${s.reason}`);
        console.log(`  (${s.birthYear}年生, ${s.gender})\n`);
    });

    // JSON出力
    const output = {
        metadata: {
            generated: new Date().toISOString(),
            totalSuggestions: suggestions.length,
            uncommonLastNamesUsed: UNCOMMON_LASTNAMES.length - uncommonLastNamePool.length
        },
        suggestions
    };

    const outputPath = path.join(claudeDocsDir, 'NAME-IMPROVEMENT-SUGGESTIONS.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`💾 保存: ${outputPath}`);

    // エピソード別の変更リストも生成
    console.log('\n=== エピソード別変更リスト ===');
    const byEpisode = suggestions.sort((a, b) => a.episode - b.episode);
    byEpisode.forEach(s => {
        console.log(`EP${s.episode}: ${s.originalName} → ${s.suggestedName}`);
    });
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
