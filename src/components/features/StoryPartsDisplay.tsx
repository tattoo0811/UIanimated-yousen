'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { STORY_PARTS_DATA } from '@/data/storyParts';

interface StoryPartsDisplayProps {
  viewMode: 'simple' | 'detailed';
}

/**
 * 3部構成表示コンポーネント
 * 基礎編・葛藤編・統合編のカードレイアウト
 */
export function StoryPartsDisplay({ viewMode }: StoryPartsDisplayProps) {
  return (
    <div className="space-y-4">
      {STORY_PARTS_DATA.map((part, index) => (
        <motion.div
          key={part.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 hover:border-slate-600/50 transition-colors"
        >
          {/* カードヘッダー: ラベルとグラデーション */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-2 h-16 rounded-full bg-gradient-to-b ${part.color} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-white">{part.label}</h3>
                <span className="text-sm text-slate-400">{part.episodes}</span>
              </div>
              <p className="text-sm text-slate-500">{part.period}</p>
            </div>
          </div>

          {/* テーマ説明 */}
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            {part.theme}
          </p>

          {/* さくら回想情報 */}
          <div className="flex items-center gap-2">
            {part.sakuraFlashbacks > part.sakuraFlashbackLimit ? (
              <>
                <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs font-medium text-amber-300">
                  さくら回想 {part.sakuraFlashbacks}回/上限{part.sakuraFlashbackLimit}
                </span>
                {viewMode === 'detailed' && (
                  <span className="text-xs text-amber-400">
                    +{part.sakuraFlashbacks - part.sakuraFlashbackLimit}オーバー
                  </span>
                )}
              </>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-xs font-medium text-emerald-300">
                さくら回想 {part.sakuraFlashbacks}回
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
