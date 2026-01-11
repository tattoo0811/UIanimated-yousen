#!/usr/bin/env node

/**
 * 陽占ハック：バイラルキャラクターデータ変換スクリプト
 * analytics-data/viral-characters-1-30.md と viral-characters-31-60.md を
 * JSON形式に変換します
 */

const fs = require('fs');
const path = require('path');

// 干支の読み方マッピング（簡易版、必要に応じて拡張）
const KANSHI_READINGS = {
  '甲子': 'きのえね',
  '乙丑': 'きのとうし',
  '丙寅': 'ひのえとら',
  '丁卯': 'ひのとう',
  '戊辰': 'つちのえたつ',
  '己巳': 'つちのとみ',
  '庚午': 'かのえうま',
  '辛未': 'かのとひつじ',
  '壬申': 'みずのえさる',
  '癸酉': 'みずのととり',
  '甲戌': 'きのえいぬ',
  '乙亥': 'きのとい',
  '丙子': 'ひのえね',
  '丁丑': 'ひのとうし',
  '戊寅': 'つちのえとら',
  '己卯': 'つちのとう',
  '庚辰': 'かのえたつ',
  '辛巳': 'かのとみ',
  '壬午': 'みずのえうま',
  '癸未': 'みずのとひつじ',
  '甲申': 'きのえさる',
  '乙酉': 'きのととり',
  '丙戌': 'ひのえいぬ',
  '丁亥': 'ひのとい',
  '戊子': 'つちのえね',
  '己丑': 'つちのとうし',
  '庚寅': 'かのえとら',
  '辛卯': 'かのとう',
  '壬辰': 'みずのえたつ',
  '癸巳': 'みずのとみ',
  '甲午': 'きのえうま',
  '乙未': 'きのとひつじ',
  '丙申': 'ひのえさる',
  '丁酉': 'ひのととり',
  '戊戌': 'つちのえいぬ',
  '己亥': 'つちのとい',
  '庚子': 'かのえね',
  '辛丑': 'かのとうし',
  '壬寅': 'みずのえとら',
  '癸卯': 'みずのとう',
  '甲辰': 'きのえたつ',
  '乙巳': 'きのとみ',
  '丙午': 'ひのえうま',
  '丁未': 'ひのとひつじ',
  '戊申': 'つちのえさる',
  '己酉': 'つちのととり',
  '庚戌': 'かのえいぬ',
  '辛亥': 'かのとい',
  '壬子': 'みずのえね',
  '癸丑': 'みずのとうし',
  '甲寅': 'きのえとら',
  '乙卯': 'きのとう',
  '丙辰': 'ひのえたつ',
  '丁巳': 'ひのとみ',
  '戊午': 'つちのえうま',
  '己未': 'つちのとひつじ',
  '庚申': 'かのえさる',
  '辛酉': 'かのととり',
  '壬戌': 'みずのえいぬ',
  '癸亥': 'みずのとい',
};

function parseMarkdown(content) {
  const characters = [];
  const lines = content.split('\n');
  
  let currentCharacter = null;
  let currentSection = null;
  let currentSubsection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // キャラクタータイトル: ### 01 甲子：流転する「水辺の賢者」
    if (line.startsWith('### ')) {
      // 前のキャラクターを保存
      if (currentCharacter) {
        characters.push(currentCharacter);
      }
      
      const match = line.match(/^### (\d+)\s+([^：]+)：(.+)$/);
      if (match) {
        const [, id, name, characterName] = match;
        currentCharacter = {
          id: parseInt(id, 10),
          name: name.trim(),
          character_name: characterName.trim().replace(/「|」/g, ''),
          core_style: {
            viral_expression: '',
            strengths_weaknesses: '',
          },
          social_face: {
            superior: '',
            subordinate: '',
          },
          private_face: {
            society: '',
            family: '',
          },
        };
        currentSection = null;
        currentSubsection = null;
      }
      continue;
    }
    
    // セクション: #### ①【本質】コア・スタイル
    if (line.startsWith('#### ')) {
      if (line.includes('①【本質】')) {
        currentSection = 'core_style';
      } else if (line.includes('②【外向き】')) {
        currentSection = 'social_face';
      } else if (line.includes('③【内向き】')) {
        currentSection = 'private_face';
      }
      currentSubsection = null;
      continue;
    }
    
    // サブセクション: *   **バズり表現**: ...
    if (line.startsWith('*   **')) {
      const match = line.match(/\*\*([^：]+)\*\*:\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        const cleanValue = value.trim();
        
        if (currentSection === 'core_style') {
          if (key === 'バズり表現') {
            currentCharacter.core_style.viral_expression = cleanValue;
          } else if (key === '強み/弱点') {
            currentCharacter.core_style.strengths_weaknesses = cleanValue;
          }
        } else if (currentSection === 'social_face') {
          if (key.startsWith('上司')) {
            currentCharacter.social_face.superior = cleanValue;
          } else if (key.startsWith('部下')) {
            currentCharacter.social_face.subordinate = cleanValue;
          }
        } else if (currentSection === 'private_face') {
          if (key.startsWith('社会')) {
            currentCharacter.private_face.society = cleanValue;
          } else if (key.startsWith('家庭')) {
            currentCharacter.private_face.family = cleanValue;
          }
        }
      }
      continue;
    }
  }
  
  // 最後のキャラクターを保存
  if (currentCharacter) {
    characters.push(currentCharacter);
  }
  
  return characters;
}

function main() {
  const rootDir = path.resolve(__dirname, '../..');
  const dataDir = path.join(rootDir, 'analytics-data');
  const outputDir = path.join(rootDir, 'yinyang-app/src/data');
  
  // ファイルを読み込む
  const file1 = path.join(dataDir, 'viral-characters-1-30.md');
  const file2 = path.join(dataDir, 'viral-characters-31-60.md');
  
  console.log('Reading files...');
  const content1 = fs.readFileSync(file1, 'utf-8');
  const content2 = fs.readFileSync(file2, 'utf-8');
  
  // パース
  console.log('Parsing markdown...');
  const characters1 = parseMarkdown(content1);
  const characters2 = parseMarkdown(content2);
  
  // マージ
  const allCharacters = [...characters1, ...characters2];
  
  // バリデーション
  console.log(`Parsed ${allCharacters.length} characters`);
  if (allCharacters.length !== 60) {
    console.warn(`Warning: Expected 60 characters, got ${allCharacters.length}`);
  }
  
  // 出力
  const outputFile = path.join(outputDir, 'viral-characters.json');
  fs.writeFileSync(
    outputFile,
    JSON.stringify(allCharacters, null, 2),
    'utf-8'
  );
  
  console.log(`✓ Successfully converted to ${outputFile}`);
  console.log(`  Total characters: ${allCharacters.length}`);
}

if (require.main === module) {
  main();
}

module.exports = { parseMarkdown };
