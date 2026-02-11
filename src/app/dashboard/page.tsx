'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, BookOpen, Eye, EyeOff, Users, Map,
  BarChart3, Settings, ArrowRight
} from 'lucide-react';
import { CHARACTERS } from '@/data/characters';
import { CharacterCard } from '@/components/features/CharacterCard';
import { StoryTimeline } from '@/components/features/StoryTimeline';
import { GlossaryPanel } from '@/components/features/GlossaryPanel';
import { OnboardingFlow } from '@/components/features/OnboardingFlow';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';

type ViewMode = 'simple' | 'detailed';
type Tab = 'overview' | 'characters' | 'storyline' | 'meishiki';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: '概要', icon: BarChart3 },
  { id: 'characters', label: 'キャラクター', icon: Users },
  { id: 'storyline', label: 'ストーリー', icon: Map },
  { id: 'meishiki', label: '命式比較', icon: Sparkles },
];

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // 初回アクセス判定
  useEffect(() => {
    const visited = sessionStorage.getItem('dashboard-visited');
    if (!visited) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    sessionStorage.setItem('dashboard-visited', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* オンボーディングフロー */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}

      {/* 用語集パネル */}
      <GlossaryPanel isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />

      {/* ヘッダー */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h1 className="text-lg font-semibold text-white tracking-wide">
              巡の運命診断室
            </h1>
            <Badge size="sm">ダッシュボード</Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* 用語集ボタン */}
            <button
              onClick={() => setGlossaryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="用語集を開く"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">用語集</span>
            </button>

            {/* 表示モード切替 */}
            <button
              onClick={() => setViewMode(viewMode === 'simple' ? 'detailed' : 'simple')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              aria-label={viewMode === 'simple' ? '詳細モードに切替' : 'シンプルモードに切替'}
              aria-pressed={viewMode === 'detailed'}
            >
              {viewMode === 'simple' ? (
                <><Eye className="w-4 h-4" /><span className="hidden sm:inline">詳細モード</span></>
              ) : (
                <><EyeOff className="w-4 h-4" /><span className="hidden sm:inline">シンプルモード</span></>
              )}
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <nav className="max-w-6xl mx-auto px-4" aria-label="ダッシュボードナビゲーション">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-violet-400 border-violet-400'
                      : 'text-slate-400 border-transparent hover:text-slate-300 hover:border-slate-600'
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'overview' && <OverviewTab viewMode={viewMode} />}
        {activeTab === 'characters' && <CharactersTab viewMode={viewMode} />}
        {activeTab === 'storyline' && <StorylineTab viewMode={viewMode} />}
        {activeTab === 'meishiki' && <MeishikiTab viewMode={viewMode} />}
      </main>
    </div>
  );
}

/* ==================== 概要タブ ==================== */
function OverviewTab({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className="space-y-8">
      {/* ヒーローセクション */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h2 className="text-3xl sm:text-4xl font-thin tracking-wider text-white mb-3">
          あなたの運命を知る旅に<br />出かけよう
        </h2>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          120話の物語を通じて、東洋の運命学{' '}
          <Tooltip content="生年月日から運命を読み解く東洋占星術" position="bottom">
            算命学
          </Tooltip>
          {' '}を学びます
        </p>
      </motion.section>

      {/* ベネフィットカード */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, color: 'text-emerald-400', title: '算命学を学べる', desc: '日本の伝統的な運命学を物語と共に学習' },
          { icon: Users, color: 'text-cyan-400', title: 'キャラクターと共に成長', desc: '主人公・巡の17年間の旅路を追体験' },
          { icon: Sparkles, color: 'text-amber-400', title: '自分の運命を知る', desc: '簡易診断で自分の運命傾向を確認' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 hover:border-slate-600/50 transition-colors"
          >
            <item.icon className={`w-6 h-6 ${item.color} mb-3`} />
            <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '全エピソード', value: '120話', sub: '三部構成' },
          { label: 'キャラクター', value: '4名', sub: '主要キャラクター' },
          { label: 'ターニングポイント', value: '8箇所', sub: '物語の転換点' },
          { label: 'テーマ', value: '在り方', sub: '「占い ≠ 未来予測」' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="bg-slate-800/30 rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            {viewMode === 'detailed' && (
              <p className="text-[10px] text-slate-500 mt-1">{stat.sub}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
        <a
          href="#characters"
          onClick={(e) => { e.preventDefault(); }}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
        >
          キャラクターを見る <ArrowRight className="w-4 h-4" />
        </a>
        <a
          href="/sanmei"
          className="px-6 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-colors"
        >
          算命学アプリを試す
        </a>
      </div>
    </div>
  );
}

/* ==================== キャラクタータブ ==================== */
function CharactersTab({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">主要キャラクター</h2>
        <p className="text-xs text-slate-500">{CHARACTERS.length}名</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {CHARACTERS.map((char, i) => (
          <CharacterCard key={char.id} character={char} viewMode={viewMode} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ==================== ストーリータブ ==================== */
function StorylineTab({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">ストーリーライン</h2>
      <StoryTimeline viewMode={viewMode} />
    </div>
  );
}

/* ==================== 命式比較タブ ==================== */
function MeishikiTab({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">命式比較</h2>

      {/* エネルギー比較 */}
      <section className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <Tooltip content="命式のエネルギー値を数値化する手法" position="top">
            数理法エネルギー比較
          </Tooltip>
        </h3>
        <div className="space-y-3">
          {CHARACTERS.map(char => {
            const maxEnergy = 300;
            const percentage = (char.meishiki.energy / maxEnergy) * 100;
            return (
              <div key={char.id} className="flex items-center gap-3">
                <div className="w-20 text-sm text-slate-300 shrink-0 truncate">{char.name.split(' ')[1]}</div>
                <div className="flex-1 h-6 bg-slate-700/50 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${char.color} rounded-lg`}
                  />
                  <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-mono text-white/80">
                    {char.meishiki.energy}点
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 三運比較 */}
      <section className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <Tooltip content="人生のエネルギーレベルを示す12種類の星" position="top">
            三運（十二大従星）比較
          </Tooltip>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="text-slate-500 text-xs">
                <th className="text-left py-2 pr-4">キャラクター</th>
                <th className="text-center py-2 px-2">始（頭）</th>
                <th className="text-center py-2 px-2">中（胸）</th>
                <th className="text-center py-2 px-2">終（腹）</th>
                <th className="text-center py-2 pl-2">合計</th>
              </tr>
            </thead>
            <tbody>
              {CHARACTERS.map(char => {
                const total = char.meishiki.sanun.reduce((s, v) => s + v.score, 0);
                return (
                  <tr key={char.id} className="border-t border-slate-700/30">
                    <td className="py-2.5 pr-4 text-white font-medium">{char.name.split(' ')[1]}</td>
                    {char.meishiki.sanun.map((s, i) => (
                      <td key={i} className="text-center py-2.5 px-2">
                        <span className="text-slate-300">{s.name}</span>
                        <span className="text-xs text-amber-400 ml-1">({s.score})</span>
                      </td>
                    ))}
                    <td className="text-center py-2.5 pl-2 font-bold text-white">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 大運情報 */}
      {viewMode === 'detailed' && (
        <section className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-cyan-400" />
            <Tooltip content="10年ごとに変わる人生の大きな流れ" position="top">
              大運情報
            </Tooltip>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHARACTERS.map(char => (
              <div key={char.id} className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${char.color}`} />
                  <span className="text-sm font-medium text-white">{char.name.split(' ')[1]}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>大運: <span className="text-slate-300">{char.meishiki.daiun === 'forward' ? '順行' : '逆行'}</span></span>
                  <span>立運: <span className="text-slate-300">{char.meishiki.ritsuun}歳</span></span>
                  <span>性別: <span className="text-slate-300">{char.gender === 'male' ? '男性' : '女性'}</span></span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {char.meishiki.yearPillar.gan}({['甲', '丙', '戊', '庚', '壬'].includes(char.meishiki.yearPillar.gan) ? '陽' : '陰'}) × {char.gender === 'male' ? '男性' : '女性'} = {char.meishiki.daiun === 'forward' ? '順行' : '逆行'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
