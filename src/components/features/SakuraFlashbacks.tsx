'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BarChart3, Sparkles } from 'lucide-react';
import { FLASHBACKS_DATA, getSourceDistribution, getPartDistribution } from '@/data/flashbacks';
import { getPartColor } from '@/data/chapters';
import type { PartType } from '@/data/chapters';

type ViewMode = 'simple' | 'detailed';

interface SakuraFlashbacksProps {
  viewMode: ViewMode;
}

/**
 * 出典バッジコンポーネント
 */
const SourceBadge = ({ source }: { source: 'v2-original' | 'sakura-teachings' }) => {
  const config = {
    'v2-original': {
      label: 'v2オリジナル',
      className: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    'sakura-teachings': {
      label: 'sakura-teachings',
      className: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    }
  }[source];

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};

/**
 * 分布統計カードコンポーネント
 */
const DistributionCard = ({
  title,
  icon: Icon,
  data,
  type
}: {
  title: string;
  icon: React.ElementType;
  data: Record<string, number>;
  type: 'source' | 'part';
}) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const maxValue = Math.max(...Object.values(data));

  const getPartConfig = (part: PartType) => {
    const configs = {
      foundation: { name: '基礎編', color: 'from-emerald-500 to-green-500' },
      conflict: { name: '葛藤編', color: 'from-amber-500 to-orange-500' },
      integration: { name: '統合編', color: 'from-violet-500 to-purple-500' }
    };
    return configs[part];
  };

  const getSourceConfig = (source: string) => {
    if (source === 'v2-original') {
      return { name: 'v2オリジナル', color: 'from-blue-500 to-cyan-500' };
    }
    return { name: 'sakura-teachings', color: 'from-violet-500 to-purple-500' };
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-violet-400" />
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>

      <div className="space-y-2">
        {Object.entries(data)
          .sort(([, a], [, b]) => b - a)
          .map(([key, count]) => {
            const config = type === 'part'
              ? getPartConfig(key as PartType)
              : getSourceConfig(key);
            const percentage = ((count / total) * 100).toFixed(1);
            const barWidth = (count / maxValue) * 100;

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{config.name}</span>
                  <span className="text-slate-400">
                    {count}回 ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={`h-full bg-gradient-to-r ${config.color} rounded-full`}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

/**
 * さくらの回想シーン一覧表示コンポーネント
 * 20回の回想シーンを一覧表示し、出典別・3部構成別の分布をグラフ表示
 */
export function SakuraFlashbacks({ viewMode }: SakuraFlashbacksProps) {
  const sourceDistribution = getSourceDistribution();
  const partDistribution = getPartDistribution();

  // 話数順にソート（既にソート済みだが明示的に）
  const sortedFlashbacks = [...FLASHBACKS_DATA].sort((a, b) => a.episode - b.episode);

  return (
    <div className="space-y-6">
      {/* セクションヘッダー */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">さくらの回想シーン</h2>
        </div>
        <p className="text-sm text-slate-400">
          全20回の回想シーンと出典別・3部構成別の分布
        </p>
      </section>

      {/* 分布統計セクション */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 出典別分布 */}
          <DistributionCard
            title="出典別分布"
            icon={BookOpen}
            data={sourceDistribution}
            type="source"
          />

          {/* 3部構成別分布 */}
          <DistributionCard
            title="3部構成別分布"
            icon={BarChart3}
            data={partDistribution}
            type="part"
          />
        </div>
      </section>

      {/* 回想シーン一覧セクション */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-violet-400" />
          <h3 className="text-base font-semibold text-white">回想シーン一覧</h3>
          <span className="text-xs text-slate-500">
            全{FLASHBACKS_DATA.length}回
          </span>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          role="list"
          aria-label="回想シーン一覧"
        >
          {sortedFlashbacks.map((flashback, index) => (
            <motion.div
              key={flashback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              className={`
                bg-slate-800/40 border border-slate-700/40 rounded-xl p-4
                hover:bg-slate-800/60 hover:shadow-lg hover:ring-1 hover:ring-violet-500/20
                transition-all duration-200
              `}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // クリックハンドラーがあればここで呼び出し（03-02で実装予定）
                }
              }}
            >
              {/* 話数バッジ */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  第{flashback.episode}話
                </span>

                {/* 出典バッジ */}
                <SourceBadge source={flashback.source} />

                {/* パートバッジ */}
                <span className={`
                  px-2 py-0.5 rounded text-xs font-medium
                  bg-gradient-to-r ${getPartColor(flashback.part)}
                  text-white
                `}>
                  {flashback.part === 'foundation' ? '基礎編' :
                   flashback.part === 'conflict' ? '葛藤編' : '統合編'}
                </span>
              </div>

              {/* テーマタイトル */}
              <h4 className="text-sm font-semibold text-white mb-2 leading-tight">
                {flashback.title}
              </h4>

              {/* 内容説明（詳細モードのみ） */}
              {viewMode === 'detailed' && (
                <p className="text-xs text-slate-400 leading-relaxed">
                  {flashback.content}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
