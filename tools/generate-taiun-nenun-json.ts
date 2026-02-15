/**
 * 主要キャラクターの大運・年運 JSON を一括生成
 * AI創作用: novel/characters/taiun-nenun/*.json に出力
 *
 * Usage: npx tsx tools/generate-taiun-nenun-json.ts
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const CHARACTERS = [
  { id: 'meguru', name: '九条巡', birthDate: '1990-03-02', gender: 'male' },
  { id: 'kei', name: '藤堂慧', birthDate: '1990-11-01', gender: 'male' },
  { id: 'misaki', name: '高橋美咲', birthDate: '1999-05-03', gender: 'female' },
  { id: 'murata', name: '村田健一', birthDate: '1980-05-06', gender: 'male' },
  { id: 'sakura', name: '九条さくら', birthDate: '1925-07-30', gender: 'female' },
];

const OUT_DIR = join(process.cwd(), 'novel', 'characters', 'taiun-nenun');
const STORY_START = 2024;
const STORY_END = 2030;

function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  for (const c of CHARACTERS) {
    try {
      const out = execSync(
        `npx tsx tools/taiun-nenun-cli.ts ${c.birthDate} ${c.gender} ${STORY_START} ${STORY_END}`,
        { encoding: 'utf-8', cwd: process.cwd() }
      );
      const data = JSON.parse(out);
      const filePath = join(OUT_DIR, `${c.id}.json`);
      writeFileSync(filePath, JSON.stringify({ characterId: c.id, characterName: c.name, ...data }, null, 2));
      console.log(`✅ ${c.name} (${c.id}) → ${filePath}`);
    } catch (e) {
      console.error(`❌ ${c.name}:`, e);
    }
  }
  console.log(`\n${CHARACTERS.length}件生成完了。AI創作時に novel/characters/taiun-nenun/*.json を参照可`);
}

main();
