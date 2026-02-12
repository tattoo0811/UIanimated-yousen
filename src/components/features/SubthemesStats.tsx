'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { SUBTHEMES_DATA, TOTAL_SUBTHEMES, SUBTHEME_CATEGORIES } from '@/data/subthemes';

interface SubthemesStatsProps {
  viewMode: 'simple' | 'detailed';
}

/**
 * サブテーマ統計表示コンポーネント
 * 12カテゴリのテーマ統計をカード形式で表示
 */
export function SubthemesStats({ viewMode }: SubthemesStatsProps) {
  // プログレスバーの最大幅を計算（最大20%で100%）
  const maxPercentage = 20.0;

  return (
    <div className="space-y-4">
      {/* セクションヘッダー */}
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-violet-400" />
        <div>
          <h3 className="text-base font-semibold text-white">サブテーマ統計</h3>
          <p className="text-xs text-slate-400">
            {SUBTHEME_CATEGORIES}カテゴリ • 合計{TOTAL_SUBTHEMES}テーマ
          </p>
        </div>
      </div>

      {/* テーマカードグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SUBTHEMES_DATA.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="bg-slate-800/30 rounded-xl p-4 hover:bg-slate-800/50 transition-colors"
          >
            {/* テーマ名 */}
            <h4 className="text-base font-semibold text-white mb-2">
              {theme.name}
            </h4>

            {/* 登場回数と割合 */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold text-white">
                {theme.count}話
              </span>
              <span className="text-sm text-violet-400">
                ({theme.percentage.toFixed(1)}%)
              </span>
            </div>

            {/* プログレスバー */}
            <div className="mb-3">
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(theme.percentage / maxPercentage) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.6 }}
                  className={`h-full bg-gradient-to-r ${theme.color} rounded-full`}
                />
              </div>
            </div>

            {/* 登場話例（詳細モード時のみ表示） */}
            {viewMode === 'detailed' && (
              <div className="mt-2 pt-2 border-t border-slate-700/30">
                <p className="text-[10px] text-slate-500 leading-tight">
                  {theme.episodes.slice(0, 5).join(', ')}
                  {theme.episodes.length > 5 && '...'}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
