'use client';

import { motion } from 'framer-motion';
import { Database, Clock, Users, UserPlus, BookOpen, Layers } from 'lucide-react';
import { OVERVIEW_STATS, STATS_DESCRIPTIONS } from '@/data/overview';

interface OverviewStatsProps {
  viewMode: 'simple' | 'detailed';
}

export function OverviewStats({ viewMode }: OverviewStatsProps) {
  const stats = [
    {
      key: 'totalEpisodes',
      label: '総エピソード数',
      value: `${OVERVIEW_STATS.totalEpisodes}話`,
      description: STATS_DESCRIPTIONS.totalEpisodes,
      icon: Database
    },
    {
      key: 'storyPeriod',
      label: '物語期間',
      value: '1年9ヶ月',
      description: STATS_DESCRIPTIONS.storyPeriod,
      icon: Clock
    },
    {
      key: 'lifeEventCoverage',
      label: 'ライフイベント',
      value: `${OVERVIEW_STATS.lifeEventCoverage.implemented}/${OVERVIEW_STATS.lifeEventCoverage.total}`,
      subValue: `${OVERVIEW_STATS.lifeEventCoverage.percentage}%`,
      description: STATS_DESCRIPTIONS.lifeEventCoverage,
      icon: Layers
    },
    {
      key: 'mainCharacters',
      label: 'メインキャラクター',
      value: `${OVERVIEW_STATS.mainCharacters}名`,
      description: STATS_DESCRIPTIONS.mainCharacters,
      icon: Users
    },
    {
      key: 'totalCharacters',
      label: '全キャラクター',
      value: `${OVERVIEW_STATS.totalCharacters}名`,
      description: STATS_DESCRIPTIONS.totalCharacters,
      icon: UserPlus
    },
    {
      key: 'themes',
      label: '算命学テーマ',
      value: `${OVERVIEW_STATS.themes}テーマ`,
      description: STATS_DESCRIPTIONS.themes,
      icon: BookOpen
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="bg-slate-800/30 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex justify-center mb-2">
              <Icon className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            {stat.subValue && (
              <p className="text-sm font-semibold text-violet-400 mt-0.5">{stat.subValue}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
            {viewMode === 'detailed' && (
              <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                {stat.description}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
