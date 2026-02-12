'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, BookOpen, BarChart3 } from 'lucide-react';
import { CHAPTERS_DATA, PART_MAPPING, getPartName, getPartColor, type Chapter } from '@/data/chapters';

interface ViewMode {
  viewMode: 'simple' | 'detailed';
}

/**
 * 13章構造表示コンポーネント
 * アコーディオン形式で各章の詳細を展開表示
 */
export function ThirteenChapters({ viewMode }: ViewMode) {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const toggleChapter = (chapterId: number) => {
    setExpandedChapter(prev => prev === chapterId ? null : chapterId);
  };

  // パート色定義（StoryPartsDisplayと統一）
  const PART_COLORS = {
    foundation: 'from-emerald-500 to-green-500',
    conflict: 'from-amber-500 to-orange-500',
    integration: 'from-violet-500 to-purple-500'
  } as const;

  // 話数配列を生成
  const generateEpisodes = (start: number, end: number): number[] => {
    const episodes: number[] = [];
    for (let i = start; i <= end; i++) {
      episodes.push(i);
    }
    return episodes;
  };

  return (
    <div className="space-y-4">
      {/* セクションヘッダー */}
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-violet-400" />
        <div>
          <h3 className="text-base font-semibold text-white">13章構造</h3>
          <p className="text-xs text-slate-400">
            基礎編{PART_MAPPING.foundation.chapters.length}章・
            葛藤編{PART_MAPPING.conflict.chapters.length}章・
            統合編{PART_MAPPING.integration.chapters.length}章
          </p>
        </div>
      </div>

      {/* 章カードグリッド */}
      <div className="grid grid-cols-1 gap-3">
        {CHAPTERS_DATA.map((chapter, index) => {
          const isExpanded = expandedChapter === chapter.id;
          const partColor = PART_COLORS[chapter.part];

          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.03 }}
              className="bg-slate-800/30 rounded-xl overflow-hidden hover:bg-slate-800/50 transition-colors"
            >
              {/* 章ヘッダー（常に表示） */}
              <div
                onClick={() => viewMode === 'detailed' && toggleChapter(chapter.id)}
                className={`p-4 cursor-pointer ${
                  viewMode === 'detailed' ? 'hover:bg-slate-800/30' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* 章番号と名前 */}
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-white">
                        第{chapter.id}章: {chapter.name}
                      </h4>
                      {/* パートバッジ */}
                      <span
                        className={`px-2 py-0.5 bg-gradient-to-r ${partColor} rounded-lg text-[10px] font-medium text-white`}
                      >
                        {getPartName(chapter.part)}
                      </span>
                    </div>

                    {/* 話数範囲 */}
                    <p className="text-sm text-slate-400">
                      第{chapter.episodeStart}-{chapter.episodeEnd}話
                    </p>
                  </div>

                  {/* 展開アイコン（詳細モード時のみ表示） */}
                  {viewMode === 'detailed' && (
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 章詳細（展開時表示） */}
              <AnimatePresence>
                {isExpanded && viewMode === 'detailed' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 space-y-3">
                      {/* 期間 */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-slate-300">{chapter.period}</span>
                      </div>

                      {/* テーマ */}
                      <div className="flex items-start gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300 leading-relaxed">{chapter.theme}</span>
                      </div>

                      {/* 話数グリッド */}
                      <div className="pt-2 border-t border-slate-700/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {generateEpisodes(chapter.episodeStart, chapter.episodeEnd).map((episode) => (
                            <div
                              key={episode}
                              className="px-2 py-1.5 bg-slate-700/30 rounded-lg text-center text-xs text-slate-400"
                            >
                              第{episode}話
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
