'use client';

import React from 'react';
import { CharacterCard } from '@/components/features/CharacterCard';
import { CHARACTERS } from '@/data/characters';

interface CharactersListProps {
  viewMode: 'simple' | 'detailed';
}

/**
 * キャラクター一覧表示コンポーネント
 *
 * 主要キャラクター全員をグリッドレイアウトで表示する。
 * CharacterCardを通じて各キャラクターの詳細情報を提供する。
 */
export function CharactersList({ viewMode }: CharactersListProps) {
  return (
    <div className="space-y-4">
      {/* ヘッダー：タイトルとキャラクター数 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">主要キャラクター</h2>
        <p className="text-xs text-slate-500">{CHARACTERS.length}名</p>
      </div>

      {/* キャラクターカードグリッド */}
      <div className="grid gap-4 lg:grid-cols-2">
        {CHARACTERS.map((char, i) => (
          <CharacterCard key={char.id} character={char} viewMode={viewMode} index={i} />
        ))}
      </div>
    </div>
  );
}
