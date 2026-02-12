'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BarChart3, Sparkles, ChevronDown, ChevronUp, List, Clock } from 'lucide-react';
import { FLASHBACKS_DATA, getSourceDistribution, getPartDistribution, type Flashback } from '@/data/flashbacks';
import { getPartColor, PART_MAPPING } from '@/data/chapters';
import type { PartType } from '@/data/chapters';

type ViewMode = 'simple' | 'detailed';
type DisplayView = 'list' | 'timeline';

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
 * パートセパレーターコンポーネント（ThirteenChaptersから再利用）
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

/**
 * タイムラインマーカーコンポーネント
 */
const TimelineMarker = ({
  flashback,
  position,
  onClick,
  isSelected
}: {
  flashback: Flashback;
  position: number; // 0-100 (percentage)
  onClick: () => void;
  isSelected: boolean;
}) => {
  const partColor = {
    foundation: 'bg-emerald-500',
    conflict: 'bg-amber-500',
    integration: 'bg-violet-500'
  }[flashback.part];

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3 + (flashback.id * 0.05) }}
      className="relative"
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        top: `${position}%`
      }}
    >
      {/* ツールチップ */}
      <div className={`
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-3 py-2 rounded-lg bg-slate-800 border border-slate-700
        text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100
        transition-opacity pointer-events-none group-hover:pointer-events-auto
        z-10
      `}>
        <div className="font-medium text-white mb-1">{flashback.title}</div>
        <div className="text-slate-400">第{flashback.episode}話</div>
        {/* 小さな矢印 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
      </div>

      {/* マーカー円 */}
      <button
        onClick={onClick}
        className={`
          w-4 h-4 rounded-full ${partColor} cursor-pointer
          hover:scale-125 transition-transform duration-200
          ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}
        `}
        aria-label={`回想シーン: ${flashback.title}（第${flashback.episode}話）`}
      />
    </motion.div>
  );
};

/**
 * さくらの回想シーン一覧表示コンポーネント
 * 20回の回想シーンを一覧表示し、出典別・3部構成別の分布をグラフ表示
 * 詳細パネル展開とタイムラインビューに対応
 */
export function SakuraFlashbacks({ viewMode }: SakuraFlashbacksProps) {
  const [expandedFlashbackId, setExpandedFlashbackId] = useState<number | null>(null);
  const [selectedFlashback, setSelectedFlashback] = useState<Flashback | null>(null);
  const [displayView, setDisplayView] = useState<DisplayView>('list');

  const sourceDistribution = getSourceDistribution();
  const partDistribution = getPartDistribution();

  // 話数順にソート（既にソート済みだが明示的に）
  const sortedFlashbacks = [...FLASHBACKS_DATA].sort((a, b) => a.episode - b.episode);

  /**
   * フラッシュバックカードクリックハンドラー
   */
  const handleFlashbackClick = (flashback: Flashback) => {
    // 展開状態をトグル
    setExpandedFlashbackId(expandedFlashbackId === flashback.id ? null : flashback.id);
    // 詳細表示のために選択状態をセット
    setSelectedFlashback(flashback);
  };

  /**
   * タイムラインマーカークリックハンドラー
   */
  const handleTimelineMarkerClick = (flashback: Flashback) => {
    setSelectedFlashback(flashback);
    setExpandedFlashbackId(flashback.id);
    // 一覧ビューに切り替えて展開
    setDisplayView('list');
  };

  /**
   * タイムライン上のマーカー位置を計算
   * @param episode - 話数（1-120）
   * @returns 位置パーセンテージ（0-100）
   */
  const calculateMarkerPosition = (episode: number): number => {
    return ((episode - 1) / 119) * 100;
  };

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
        {/* ビュー切替ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <h3 className="text-base font-semibold text-white">回想シーン一覧</h3>
            <span className="text-xs text-slate-500">
              全{FLASHBACKS_DATA.length}回
            </span>
          </div>

          {/* ビュー切替ボタン */}
          <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1">
            <button
              onClick={() => setDisplayView('list')}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all
                ${displayView === 'list'
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-slate-400 hover:text-slate-300'
                }
              `}
              aria-pressed={displayView === 'list'}
            >
              <List className="w-3.5 h-3.5" />
              一覧
            </button>
            <button
              onClick={() => setDisplayView('timeline')}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all
                ${displayView === 'timeline'
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-slate-400 hover:text-slate-300'
                }
              `}
              aria-pressed={displayView === 'timeline'}
            >
              <Clock className="w-3.5 h-3.5" />
              タイムライン
            </button>
          </div>
        </div>

        {/* 一覧ビュー */}
        {displayView === 'list' && (
          <div
            className="grid grid-cols-1 gap-3"
            role="list"
            aria-label="回想シーン一覧"
          >
            {sortedFlashbacks.map((flashback, index) => (
              <motion.div
                key={flashback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
              >
                {/* フラッシュバックカード（アコーディオンヘッダー） */}
                <div
                  onClick={() => handleFlashbackClick(flashback)}
                  className={`
                    cursor-pointer transition-all duration-200
                    ${expandedFlashbackId === flashback.id
                      ? 'bg-slate-800/60 ring-1 ring-violet-500/30'
                      : 'hover:bg-slate-800/50 hover:shadow-lg'
                    }
                    bg-slate-800/40 border border-slate-700/40 rounded-xl overflow-hidden
                  `}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedFlashbackId === flashback.id}
                  aria-controls={`flashback-${flashback.id}-content`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleFlashbackClick(flashback);
                    }
                  }}
                >
                  {/* カードヘッダー */}
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* 話数バッジ */}
                      <div className="shrink-0">
                        <span className="px-2.5 py-1 rounded text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          第{flashback.episode}話
                        </span>
                      </div>

                      {/* カード内容 */}
                      <div className="flex-1 min-w-0">
                        {/* バッジ群 */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                        <h4 className="text-sm font-semibold text-white mb-1 leading-tight">
                          {flashback.title}
                        </h4>

                        {/* 内容の一部をプレビュー（折りたたみ時） */}
                        {expandedFlashbackId !== flashback.id && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {flashback.content}
                          </p>
                        )}
                      </div>

                      {/* 展開インジケーター */}
                      <div className="shrink-0">
                        {expandedFlashbackId === flashback.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 詳細パネル（展開時） */}
                <AnimatePresence>
                  {expandedFlashbackId === flashback.id && (
                    <motion.div
                      id={`flashback-${flashback.id}-content`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-slate-700/50 bg-slate-700/30"
                    >
                      <div className="p-5 space-y-4">
                        {/* ヘッダー情報 */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">
                            第{flashback.episode}話
                          </span>
                          <span className="text-slate-500">•</span>
                          <SourceBadge source={flashback.source} />
                          <span className="text-slate-500">•</span>
                          <span className={`
                            px-2 py-0.5 rounded text-xs font-medium
                            bg-gradient-to-r ${getPartColor(flashback.part)}
                            text-white
                          `}>
                            {PART_MAPPING[flashback.part].name}
                          </span>
                        </div>

                        {/* テーマタイトル */}
                        <h5 className="text-base font-semibold text-white">
                          {flashback.title}
                        </h5>

                        {/* 内容説明（フルテキスト） */}
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {flashback.content}
                        </p>

                        {/* メタデータ（詳細モードのみ） */}
                        {viewMode === 'detailed' && (
                          <div className="pt-3 border-t border-slate-700/30 space-y-3">
                            {/* 3部構成マッピング情報 */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400">3部構成所属:</span>
                              <span className={`
                                px-2 py-1 rounded font-medium
                                bg-gradient-to-r ${getPartColor(flashback.part)}
                                text-white
                              `}>
                                {PART_MAPPING[flashback.part].name}
                              </span>
                              <span className="text-slate-500">
                                (第{PART_MAPPING[flashback.part].chapters.join(', ')}章)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* タイムラインビュー */}
        {displayView === 'timeline' && (
          <div className="py-8">
            {/* タイムラインコンテナ */}
            <div className="relative bg-slate-800/40 border border-slate-700/40 rounded-xl p-6">
              {/* 垂直タイムライン */}
              <div className="relative h-[600px] border-l-2 border-slate-700 ml-6">
                {/* 基礎編セパレーター（第40話後 = 33.3%） */}
                <div
                  className="absolute left-0 w-full border-t-2 border-emerald-500/30"
                  style={{ top: `${calculateMarkerPosition(40)}%` }}
                >
                  <div className="absolute -top-3 left-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">
                    第40話
                  </div>
                </div>

                {/* 葛藤編セパレーター（第80話後 = 66.6%） */}
                <div
                  className="absolute left-0 w-full border-t-2 border-amber-500/30"
                  style={{ top: `${calculateMarkerPosition(80)}%` }}
                >
                  <div className="absolute -top-3 left-0 px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
                    第80話
                  </div>
                </div>

                {/* 回想マーカー */}
                {sortedFlashbacks.map((flashback) => (
                  <div
                    key={flashback.id}
                    className="group"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top: `${calculateMarkerPosition(flashback.episode)}%`
                    }}
                  >
                    {/* ツールチップ */}
                    <div className={`
                      absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      px-3 py-2 rounded-lg bg-slate-800 border border-slate-700
                      text-xs text-slate-300 whitespace-nowrap opacity-0
                      group-hover:opacity-100 transition-opacity pointer-events-none
                      group-hover:pointer-events-auto z-10
                    `}>
                      <div className="font-medium text-white mb-1">{flashback.title}</div>
                      <div className="text-slate-400">第{flashback.episode}話</div>
                      {/* 小さな矢印 */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
                    </div>

                    {/* マーカー円 */}
                    <button
                      onClick={() => handleTimelineMarkerClick(flashback)}
                      className={`
                        w-4 h-4 rounded-full cursor-pointer
                        hover:scale-125 transition-transform duration-200
                        ${
                          {
                            foundation: 'bg-emerald-500',
                            conflict: 'bg-amber-500',
                            integration: 'bg-violet-500'
                          }[flashback.part]
                        }
                      `}
                      aria-label={`回想シーン: ${flashback.title}（第${flashback.episode}話）`}
                    />
                  </div>
                ))}

                {/* 話数目盛（10話ごと） */}
                {Array.from({ length: 12 }, (_, i) => i * 10 + 10).map((episode) => (
                  <div
                    key={episode}
                    className="absolute right-0 -translate-y-1/2 pr-4 text-xs text-slate-500"
                    style={{ top: `${calculateMarkerPosition(episode)}%` }}
                  >
                    第{episode}話
                  </div>
                ))}
              </div>

              {/* 選択中の回想シーン詳細パネル */}
              <AnimatePresence>
                {selectedFlashback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 bg-slate-700/30 border-t border-slate-700/50 rounded-t-xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-white">
                        選択中の回想シーン
                      </span>
                      <button
                        onClick={() => setSelectedFlashback(null)}
                        className="text-xs text-slate-400 hover:text-slate-300"
                      >
                        閉じる
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* バッジ群 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          第{selectedFlashback.episode}話
                        </span>
                        <SourceBadge source={selectedFlashback.source} />
                        <span className={`
                          px-2 py-0.5 rounded text-xs font-medium
                          bg-gradient-to-r ${getPartColor(selectedFlashback.part)}
                          text-white
                        `}>
                          {selectedFlashback.part === 'foundation' ? '基礎編' :
                           selectedFlashback.part === 'conflict' ? '葛藤編' : '統合編'}
                        </span>
                      </div>

                      {/* テーマタイトル */}
                      <h5 className="text-base font-semibold text-white">
                        {selectedFlashback.title}
                      </h5>

                      {/* 内容説明 */}
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {selectedFlashback.content}
                      </p>

                      {/* アクションボタン */}
                      <button
                        onClick={() => {
                          setDisplayView('list');
                          setExpandedFlashbackId(selectedFlashback.id);
                        }}
                        className="text-xs text-violet-400 hover:text-violet-300"
                      >
                        一覧ビューで詳細を開く →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
