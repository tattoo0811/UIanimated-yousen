'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, ChevronRight } from 'lucide-react';
import { STORY_PARTS, TURNING_POINTS } from '@/data/episodes';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface StoryTimelineProps {
  viewMode: 'simple' | 'detailed';
}

export function StoryTimeline({ viewMode }: StoryTimelineProps) {
  return (
    <section aria-label="ストーリーライン">
      {/* 三部構成概要 */}
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {STORY_PARTS.map((part, i) => (
          <motion.div
            key={part.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4"
          >
            <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${part.color} mb-3`} />
            <h4 className="text-sm font-semibold text-white">{part.label}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{part.episodes}</p>
            {viewMode === 'detailed' && (
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{part.description}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* 全体プログレス */}
      <ProgressBar
        value={0}
        label="ストーリー進捗"
        milestones={[
          { position: 33.3, label: '基礎編' },
          { position: 66.6, label: '葛藤編' },
          { position: 100, label: '統合編' },
        ]}
      />

      {/* ターニングポイント（詳細モード） */}
      {viewMode === 'detailed' && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
            <Bookmark className="w-4 h-4 text-amber-400" />
            ターニングポイント（8箇所）
          </h4>
          <div className="space-y-2">
            {TURNING_POINTS.map((tp, i) => (
              <motion.div
                key={tp.number}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-amber-400">{tp.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{tp.title}</p>
                  <p className="text-xs text-slate-400 truncate">{tp.turningPointDescription}</p>
                </div>
                <Badge variant="outline" size="sm">{tp.partLabel}</Badge>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
