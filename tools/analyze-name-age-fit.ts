/**
 * キャラクター名と年代の適合性チェックツール
 * 
 * 実行: npx tsx tools/analyze-name-age-fit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// 年代別人気名前データベース（character-improvement-proposal.mdより）
const NAME_DATABASE = {
    male: {
        '1940-1960': ['一郎', '弘', '清', '茂', '勇', '誠', '修', '進', '明', '裕', '哲', '浩', '勝', '隆'],
        '1970-1980': ['浩一', '和彦', '直樹', '拓也', '聡', '翔太', '智也', '誠司'],
        '1990-2000': ['翔', '拓海', '大輝', '悠真', '蓮', '陽翔', '樹', '大和', '悠斗', '蒼', '陸', '蒼太', '健太'],
        '2000-2020': ['蓮', '陽翔', '悠真', '颯', '蒼', '大翔', '陽向', '結翔', '悠斗', '朝陽']
    },
    female: {
        '1940-1960': ['照子', '清子', '文子', '和子', '京子', '弘子', '恵子', '洋子', '典子'],
        '1970-1980': ['真由美', '恵', '香織', '美咲', '舞', '愛', '麻衣', '理恵'],
        '1990-2000': ['葵', '美月', '結衣', '優花', '陽菜', '結菜', '真央', '彩', '萌', '凛', '愛', '美咲'],
        '2000-2020': ['陽葵', '結菜', '莉子', '芽依', '澪', '結衣', '陽菜', '凛', '葵', '咲良']
    }
};

// 古風/現代的な名前の特徴
const TRADITIONAL_PATTERNS = /^.*(郎|子|太郎|一郎|次郎|美|恵|代|江)$/;
const MODERN_PATTERNS = /^.*(翔|蓮|陽|葵|結|凛|颯|蒼|陽菜|結衣)$/;

interface Character {
    episode: number;
    name: string;
    birthDate: string;
    gender: string;
}

interface AnalysisResult {
    episode: number;
    name: string;
    birthYear: number;
    age: number;
    gender: string;
    ageBracket: string;
    appropriateNames: string[];
    fitScore: number;
    issue: string | null;
}

function getAgeBracket(birthYear: number): string {
    if (birthYear >= 1940 && birthYear < 1960) return '1940-1960';
    if (birthYear >= 1960 && birthYear < 1970) return '1960-1970';
    if (birthYear >= 1970 && birthYear < 1980) return '1970-1980';
    if (birthYear >= 1980 && birthYear < 1990) return '1980-1990';
    if (birthYear >= 1990 && birthYear < 2000) return '1990-2000';
    if (birthYear >= 2000 && birthYear < 2010) return '2000-2010';
    if (birthYear >= 2010) return '2010-2020';
    return 'unknown';
}

function analyzeName(char: Character): AnalysisResult {
    const birthYear = parseInt(char.birthDate.split('-')[0]);
    const age = 2026 - birthYear;
    const ageBracket = getAgeBracket(birthYear);
    const firstName = char.name.split(' ').pop() || char.name;

    // 年代別の適切な名前リストを取得
    let appropriateNames: string[] = [];
    const gender = char.gender as 'male' | 'female';

    if (birthYear >= 1940 && birthYear < 1970) {
        appropriateNames = NAME_DATABASE[gender]['1940-1960'] || [];
    } else if (birthYear >= 1970 && birthYear < 1990) {
        appropriateNames = NAME_DATABASE[gender]['1970-1980'] || [];
    } else if (birthYear >= 1990 && birthYear < 2010) {
        appropriateNames = NAME_DATABASE[gender]['1990-2000'] || [];
    } else if (birthYear >= 2010) {
        appropriateNames = NAME_DATABASE[gender]['2000-2020'] || [];
    }

    // 適合度スコアリング（0-100）
    let fitScore = 50; // デフォルト中立
    let issue: string | null = null;

    // 名前リストに含まれている場合は高スコア
    if (appropriateNames.some(n => firstName.includes(n) || n.includes(firstName))) {
        fitScore = 90;
    }

    // 年代不適合パターンの検出
    if (birthYear < 1970) {
        // 1970年以前生まれで現代的な名前 → 低スコア
        if (MODERN_PATTERNS.test(firstName)) {
            fitScore = 20;
            issue = `${age}歳（${birthYear}年生）に「${firstName}」は新しすぎる（2000年代以降人気）`;
        }
    } else if (birthYear >= 2000) {
        // 2000年以降生まれで古風な名前 → 低スコア
        if (TRADITIONAL_PATTERNS.test(firstName)) {
            fitScore = 30;
            issue = `${age}歳（${birthYear}年生）に「${firstName}」は古風すぎる（1960-80年代人気）`;
        }
    } else if (birthYear >= 1990 && birthYear < 2000) {
        // 1990年代生まれの微妙なケース
        if (firstName.match(/^.*(子|郎|美|代)$/)) {
            fitScore = 40;
            issue = `${age}歳（${birthYear}年生）に「${firstName}」はやや古風`;
        }
    }

    return {
        episode: char.episode,
        name: char.name,
        birthYear,
        age,
        gender: char.gender,
        ageBracket,
        appropriateNames,
        fitScore,
        issue
    };
}

async function main() {
    const claudeDocsDir = path.join(__dirname, '..', 'claudedocs');
    const personaData = JSON.parse(
        fs.readFileSync(path.join(claudeDocsDir, 'PERSONA-SHEETS.json'), 'utf8')
    );

    console.log('📊 キャラクター名・年代適合性チェック開始...\n');

    const results: AnalysisResult[] = [];
    const issues: AnalysisResult[] = [];

    for (const p of personaData.personas) {
        const char: Character = {
            episode: p.episode,
            name: p.name,
            birthDate: p.birthDate,
            gender: p.gender
        };

        const result = analyzeName(char);
        results.push(result);

        if (result.issue) {
            issues.push(result);
        }
    }

    // 問題のある名前をスコア順にソート
    issues.sort((a, b) => a.fitScore - b.fitScore);

    console.log(`✅ 分析完了: ${results.length}名\n`);
    console.log(`⚠️  年代不適合: ${issues.length}名\n`);

    if (issues.length > 0) {
        console.log('=== 年代不適合な名前リスト ===\n');
        issues.forEach(r => {
            console.log(`EP${r.episode} ${r.name} (${r.birthYear}年生, ${r.age}歳, ${r.gender})`);
            console.log(`  スコア: ${r.fitScore}/100`);
            console.log(`  問題: ${r.issue}`);
            console.log(`  適切な名前例: ${r.appropriateNames.slice(0, 5).join(', ')}\n`);
        });
    }

    // 名字の分布チェック
    const lastNameDist: Record<string, number> = {};
    results.forEach(r => {
        const lastName = r.name.split(' ')[0];
        lastNameDist[lastName] = (lastNameDist[lastName] || 0) + 1;
    });

    console.log('\n=== 名字の分布（5回以上） ===');
    Object.entries(lastNameDist)
        .filter(([, count]) => count >= 5)
        .sort((a, b) => b[1] - a[1])
        .forEach(([lastName, count]) => {
            console.log(`${lastName}: ${count}回`);
        });

    // 重複チェック
    const nameDist: Record<string, number> = {};
    results.forEach(r => {
        const cleanName = r.name.replace(/（再登場）/g, '').trim();
        nameDist[cleanName] = (nameDist[cleanName] || 0) + 1;
    });

    const duplicates = Object.entries(nameDist).filter(([, count]) => count > 1);
    if (duplicates.length > 0) {
        console.log('\n=== 重複した名前 ===');
        duplicates.forEach(([name, count]) => {
            console.log(`${name}: ${count}件`);
        });
    }

    // JSON出力
    const output = {
        metadata: {
            generated: new Date().toISOString(),
            totalCharacters: results.length,
            issuesFound: issues.length,
            duplicates: duplicates.length
        },
        issues,
        lastNameDistribution: lastNameDist,
        duplicates: duplicates.map(([name, count]) => ({ name, count }))
    };

    const outputPath = path.join(claudeDocsDir, 'NAME-AGE-ANALYSIS.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`\n💾 保存: ${outputPath}`);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
