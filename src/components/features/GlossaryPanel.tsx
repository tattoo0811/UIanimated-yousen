'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ChevronRight, X } from 'lucide-react';
import { GLOSSARY, type GlossaryTerm } from '@/data/glossary';

interface GlossaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  basic: { label: '基本用語', emoji: '📖' },
  meishiki: { label: '命式', emoji: '⭐' },
  daiun: { label: '大運', emoji: '🔄' },
  energy: { label: 'エネルギー', emoji: '⚡' },
  relationship: { label: '関係性', emoji: '👥' },
};

export function GlossaryPanel({ isOpen, onClose }: GlossaryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    let terms = GLOSSARY;
    if (selectedCategory) {
      terms = terms.filter(t => t.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      terms = terms.filter(
        t => t.term.toLowerCase().includes(q) ||
             t.simple.toLowerCase().includes(q) ||
             t.detailed.toLowerCase().includes(q)
      );
    }
    return terms;
  }, [searchQuery, selectedCategory]);

  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* バックドロップ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* パネル */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-700 z-50 flex flex-col"
            role="dialog"
            aria-label="用語集"
          >
            {/* ヘッダー */}
            <div className="p-4 border-b border-slate-700 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                  用語集
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  aria-label="閉じる"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 検索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="用語を検索..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  aria-label="用語を検索"
                />
              </div>

              {/* カテゴリフィルタ */}
              <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    !selectedCategory ? 'bg-violet-500/30 text-violet-300' : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  すべて
                </button>
                {categories.map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key === selectedCategory ? null : key)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === key ? 'bg-violet-500/30 text-violet-300' : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {val.emoji} {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 用語リスト */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredTerms.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  該当する用語が見つかりません
                </p>
              ) : (
                filteredTerms.map(term => (
                  <GlossaryTermItem
                    key={term.id}
                    term={term}
                    isExpanded={expandedTerm === term.id}
                    onToggle={() => setExpandedTerm(expandedTerm === term.id ? null : term.id)}
                  />
                ))
              )}
            </div>

            {/* フッター */}
            <div className="p-3 border-t border-slate-700 text-center shrink-0">
              <p className="text-xs text-slate-500">{filteredTerms.length}件の用語</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function GlossaryTermItem({
  term,
  isExpanded,
  onToggle,
}: {
  term: GlossaryTerm;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <ChevronRight
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white">{term.term}</span>
          <p className="text-xs text-slate-400 truncate">{term.simple}</p>
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2 border-t border-slate-700/30 pt-2">
              <p className="text-sm text-slate-300 leading-relaxed">{term.detailed}</p>
              {term.example && (
                <p className="text-xs text-slate-400 bg-slate-700/30 rounded-lg px-3 py-2 italic">
                  {term.example}
                </p>
              )}
              {term.relatedTerms && term.relatedTerms.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-500">関連:</span>
                  {term.relatedTerms.map(rt => (
                    <span key={rt} className="text-xs text-violet-400">#{rt}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
