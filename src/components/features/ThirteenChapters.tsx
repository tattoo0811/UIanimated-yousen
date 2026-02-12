'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, BookOpen, BarChart3 } from 'lucide-react';
import { CHAPTERS_DATA, PART_MAPPING, getPartColor } from '@/data/chapters';

type ViewMode = 'simple' | 'detailed';

/**
 * パートセパレーターコンポーネント
 * 3部構成の視覚的な区切りを表示
 */
const PartSeparator = ({ part }: { part: 'foundation' | 'conflict' | 'integration' }) => {
  const config = {
    foundation: {
      name: '基礎編',
      gradient: 'from-emerald-500/20 to-green-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400'
    },
    conflict: {
      name: '葛藤編',
      gradient: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400'
    },
    integration: {
      name: '統合編',
      gradient: 'from-violet-500/20 to-purple-500/10',
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-400'
    }
  }[part];

  return (
    <div className={`relative my-8 py-4 ${config.borderColor} border-t-2 border-b-2`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-50`} />
      <div className="relative text-center">
        <span className={`text-sm font-bold ${config.textColor} tracking-widest uppercase`}>
          {config.name}
        </span>
        <span className="ml-2 text-xs text-slate-500">
          {PART_MAPPING[part].name}
        </span>
      </div>
    </div>
  );
};

interface ThirteenChaptersProps {
  viewMode: ViewMode;
}

/**
 * 13章構造表示コンポーネント
 * アコーディオン形式で章詳細を展開表示
 */
export function ThirteenChapters({ viewMode }: ThirteenChaptersProps) {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const toggleChapter = (chapterId: number) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  return (
    <div className="space-y-6">
      {/* セクションヘッダー */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">13章構造</h2>
        </div>
        <p className="text-sm text-slate-400">
          基礎編5章・葛藤編4章・統合編4章の全13章構造
        </p>
      </section>

      {/* 冒頭に基礎編セパレーター */}
      <PartSeparator part="foundation" />

      {/* 章リスト */}
      {CHAPTERS_DATA.map((chapter, index) => (
        <React.Fragment key={chapter.id}>
          {/* パート境界でセパレーター表示 */}
          {index === 4 && <PartSeparator part="conflict" />}
          {index === 9 && <PartSeparator part="integration" />}

          {/* 章カード */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.03 }}
            onClick={() => toggleChapter(chapter.id)}
            className={`
              cursor-pointer transition-all duration-200
              ${expandedChapter === chapter.id
                ? 'bg-slate-800/60 ring-1 ring-violet-500/30'
                : 'hover:bg-slate-800/50 hover:shadow-lg'
              }
              bg-slate-800/40 border border-slate-700/40 rounded-xl overflow-hidden
            `}
            role="button"
            tabIndex={0}
            aria-expanded={expandedChapter === chapter.id}
            aria-controls={`chapter-${chapter.id}-content`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleChapter(chapter.id);
              }
            }}
          >
            {/* 章ヘッダー */}
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* 章番号（詳細モードのみ強調表示） */}
                {viewMode === 'detailed' ? (
                  <span className={`
                    text-2xl font-bold bg-gradient-to-r ${getPartColor(chapter.part)}
                    bg-clip-text text-transparent shrink-0
                  `}>
                    {String(chapter.id).padStart(2, '0')}
                  </span>
                ) : (
                  <span className="text-lg font-bold text-slate-300 shrink-0">
                    {String(chapter.id).padStart(2, '0')}
                  </span>
                )}

                {/* 章情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-base font-semibold text-white">
                      {chapter.name}
                    </h3>

                    {/* パートバッジ */}
                    <span className={`
                      px-2 py-0.5 rounded text-xs font-medium
                      bg-gradient-to-r ${getPartColor(chapter.part)}
                      text-white
                    `}>
                      {PART_MAPPING[chapter.part].name}
                    </span>

                    {/* 総話数表示 */}
                    <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                      全{chapter.episodeEnd - chapter.episodeStart + 1}話
                    </span>
                  </div>

                  {/* 話数範囲 */}
                  <p className="text-sm text-slate-400 mb-2">
                    第{chapter.episodeStart}-{chapter.episodeEnd}話
                  </p>

                  {/* 期間（詳細モード） */}
                  {viewMode === 'detailed' && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className={`w-3.5 h-3.5 ${getPeriodIconColor(chapter.part)}`} />
                      <span>{chapter.period}</span>
                    </div>
                  )}
                </div>

                {/* 展開インジケーター */}
                <div className="shrink-0">
                  {expandedChapter === chapter.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {/* 章詳細（展開時） */}
            <AnimatePresence>
              {expandedChapter === chapter.id && (
                <motion.div
                  id={`chapter-${chapter.id}-content`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-slate-700/30"
                >
                  <div className="p-5 space-y-4">
                    {/* 期間（simpleモードでも表示） */}
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${getPeriodIconColor(chapter.part)}`} />
                      <span className="text-sm text-slate-300">{chapter.period}</span>
                    </div>

                    {/* テーマ */}
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-relaxed">{chapter.theme}</p>
                    </div>

                    {/* 3部構成マッピング情報（詳細モードのみ） */}
                    {viewMode === 'detailed' && (
                      <div className="pt-3 border-t border-slate-700/30">
                        <div className="text-xs text-slate-400 mb-2">3部構成マッピング</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`
                            px-2 py-1 rounded font-medium
                            bg-gradient-to-r ${getPartColor(chapter.part)}
                            text-white
                          `}>
                            {PART_MAPPING[chapter.part].name}
                          </span>
                          <span className="text-slate-500">
                            第{PART_MAPPING[chapter.part].chapters.join(', ')}章
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 話数グリッド */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {Array.from(
                        { length: chapter.episodeEnd - chapter.episodeStart + 1 },
                        (_, i) => chapter.episodeStart + i
                      ).map((episode) => (
                        <div
                          key={episode}
                          className="px-3 py-2 bg-slate-700/30 rounded-lg text-center text-xs text-slate-400 hover:bg-slate-700/50 transition-colors"
                        >
                          第{episode}話
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * パートに応じた期間iconの色を取得
 */
function getPeriodIconColor(part: 'foundation' | 'conflict' | 'integration'): string {
  const colors = {
    foundation: 'text-emerald-400',
    conflict: 'text-amber-400',
    integration: 'text-violet-400'
  };
  return colors[part];
}
