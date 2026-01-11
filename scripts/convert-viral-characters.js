const fs = require('fs');
const path = require('path');

// マークダウンファイルを読み込む
const file1 = path.join(__dirname, '../analytics-data/viral-characters-1-30.md');
const file2 = path.join(__dirname, '../analytics-data/viral-characters-31-60.md');

const content1 = fs.readFileSync(file1, 'utf-8');
const content2 = fs.readFileSync(file2, 'utf-8');

const allContent = content1 + '\n' + content2;

// パース関数
function parseMarkdown(content) {
    const characters = [];
    const sections = content.split(/^### /m).filter(s => s.trim());
    
    for (const section of sections) {
        if (!section.trim()) continue;
        
        // ヘッダー行を解析: "01 甲子：流転する「水辺の賢者」"
        const headerMatch = section.match(/^(\d+)\s+([^：]+)：(.*)/);
        if (!headerMatch) continue;
        
        const id = parseInt(headerMatch[1], 10);
        const name = headerMatch[2].trim(); // 甲子
        const characterNameMatch = headerMatch[3].match(/「([^」]+)」/);
        const characterName = characterNameMatch ? characterNameMatch[1] : headerMatch[3].trim();
        
        // 各セクションを抽出
        const coreStyleMatch = section.match(/①【本質】コア・スタイル\s*\n\*?\s*\*\*バズり表現\*\*:\s*(.+?)\n\*?\s*\*\*強み\/弱点\*\*:\s*(.+?)(?=\n####|$)/s);
        const socialFaceMatch = section.match(/②【外向き】社会・上下の顔\s*\n\*?\s*\*\*上司（北）\*\*:\s*(.+?)\n\*?\s*\*\*部下（南）\*\*:\s*(.+?)(?=\n####|$)/s);
        const privateFaceMatch = section.match(/③【内向き】関係・プライベート\s*\n\*?\s*\*\*社会（東）\*\*:\s*(.+?)\n\*?\s*\*\*家庭（西）\*\*:\s*(.+?)(?=\n|---|$)/s);
        
        if (!coreStyleMatch || !socialFaceMatch || !privateFaceMatch) {
            console.warn(`⚠️  Warning: Could not parse character ${id} (${name})`);
            continue;
        }
        
        const character = {
            id: id,
            name: name,
            character_name: characterName,
            core_style: {
                viral_expression: coreStyleMatch[1].trim(),
                strengths_weaknesses: coreStyleMatch[2].trim()
            },
            social_face: {
                superior: socialFaceMatch[1].trim(),
                subordinate: socialFaceMatch[2].trim()
            },
            private_face: {
                society: privateFaceMatch[1].trim(),
                family: privateFaceMatch[2].trim()
            }
        };
        
        characters.push(character);
    }
    
    return characters;
}

// パース実行
const characters = parseMarkdown(allContent);

console.log(`✅ Parsed ${characters.length} characters`);

// JSON出力
const output = {
    formatVersion: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    description: '陽占60キャラクター - バイラル表現データ',
    characters: characters
};

// 出力先を決定（mobile/src/data/に配置）
const outputPath = path.join(__dirname, '../mobile/src/data/viral-characters.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`✅ JSON file created: ${outputPath}`);
console.log(`📊 Total characters: ${characters.length}`);

// TypeScript型定義も生成（オプション）
const tsOutputPath = path.join(__dirname, '../mobile/src/data/viral-characters.ts');
const tsContent = `// 陽占60キャラクター - バイラル表現データ
// Auto-generated from viral-characters-*.md files
// Last updated: ${output.lastUpdated}

export interface ViralCharacterData {
    id: number;
    name: string; // Kanshi name e.g. 甲子
    character_name: string; // e.g. 水辺の賢者
    core_style: {
        viral_expression: string; // バズり表現
        strengths_weaknesses: string; // 強み/弱点
    };
    social_face: {
        superior: string; // 上司（北）
        subordinate: string; // 部下（南）
    };
    private_face: {
        society: string; // 社会（東）
        family: string; // 家庭（西）
    };
}

export interface ViralCharactersData {
    formatVersion: string;
    lastUpdated: string;
    description: string;
    characters: ViralCharacterData[];
}

export const viralCharactersData: ViralCharactersData = ${JSON.stringify(output, null, 2)};
`;

fs.writeFileSync(tsOutputPath, tsContent, 'utf8');
console.log(`✅ TypeScript file created: ${tsOutputPath}`);
