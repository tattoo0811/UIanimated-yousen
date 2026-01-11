/**
 * 陽占ハック：バイラルキャラクターデータ
 * 自動生成ファイル - 手動編集しないでください
 * 生成元: analytics-data/viral-characters-1-30.md, viral-characters-31-60.md
 * 生成スクリプト: scripts/convert-viral-characters.js
 */

import { ViralCharacterData } from '../types';
import viralCharactersData from './viral-characters.json';

export const viralCharacters: ViralCharacterData[] = viralCharactersData as ViralCharacterData[];

// IDでキャラクターを取得するヘルパー関数
export function getViralCharacterById(id: number): ViralCharacterData | undefined {
  return viralCharacters.find(char => char.id === id);
}

// 干支名でキャラクターを取得するヘルパー関数
export function getViralCharacterByName(name: string): ViralCharacterData | undefined {
  return viralCharacters.find(char => char.name === name);
}
