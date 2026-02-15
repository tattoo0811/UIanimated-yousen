'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Search, X } from 'lucide-react';
import {
  CHAPTERS_13,
  THEME_STRUCTURE,
  MAJOR_MILESTONES,
  DASHBOARD_STATS,
} from '@/data/dashboard-overview';

/** さくら回想20回（DASHBOARD.md より） */
const SAKURA_RECALL_20 = [
  { ep: 1, theme: '種と土と水──重い土の下の種に、水と光を', source: 'v2オリジナル' },
  { ep: 2, theme: '天中殺＝大地が眠る時間', source: 'v2オリジナル' },
  { ep: 3, theme: '龍は箱に入りきらん', source: 'v2オリジナル' },
  { ep: 7, theme: '十牛図', source: 'sakura-teachings' },
  { ep: 14, theme: '老子の無為自然', source: 'sakura-teachings' },
  { ep: 20, theme: '河合隼雄「子は背中を見とる」', source: 'sakura-teachings' },
  { ep: 30, theme: 'メキシコの漁師', source: 'sakura-teachings' },
  { ep: 37, theme: '荘子の胡蝶の夢', source: 'sakura-teachings' },
  { ep: 40.5, theme: '静かな変化──種が花になる時、庭師は離れる', source: 'v2オリジナル' },
  { ep: 48, theme: '達磨の面壁九年', source: 'sakura-teachings' },
  { ep: 55, theme: 'エピクテトスの二分法', source: 'sakura-teachings' },
  { ep: 59.5, theme: '正しさの罠', source: 'sakura-teachings' },
  { ep: 67.5, theme: '父との相似', source: 'v2オリジナル' },
  { ep: 70, theme: 'As a Man Thinketh', source: 'sakura-teachings' },
  { ep: 76, theme: '7つの習慣', source: 'sakura-teachings' },
  { ep: 84.5, theme: '太陽の本質──丙火の太陽', source: 'sakura-teachings' },
  { ep: 89, theme: 'サルトルの実存', source: 'sakura-teachings' },
  { ep: 90.5, theme: '闇もまた自己──ユングのシャドー', source: 'sakura-teachings' },
  { ep: 98, theme: '宇宙のスケール', source: 'sakura-teachings' },
  { ep: 104.5, theme: '溶ける心──仏教の慈悲', source: 'sakura-teachings' },
];

export default function WorldviewPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // 検索フィルタリング適用
  const filteredSakuraRecalls = useMemo(() => {
    if (!searchQuery.trim()) return SAKURA_RECALL_20;
    const query = searchQuery.toLowerCase();
    return SAKURA_RECALL_20.filter(r => {
      return (
        r.theme.toLowerCase().includes(query) ||
        r.source.toLowerCase().includes(query) ||
        r.ep.toString().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#3d3629]">
      <header className="sticky top-0 z-30 bg-[#e8dfd0] border-b-2 border-[#c4b8a8] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="text-[#6b5d4d] hover:text-[#3d3629] flex items-center gap-2 mb-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> ダッシュボード
          </Link>
          <h1 className="text-xl font-semibold tracking-wide flex items-center gap-2">
            <Globe className="w-5 h-5" />
            世界観
          </h1>
          <p className="text-[#6b5d4d] text-sm mt-1">
            novel/dashboards/DASHBOARD.md より。13章構造・テーマ・さくら回想20回
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 dashboard-container space-y-10">
        {/* 検索バー */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="テーマ・ソースで検索..."
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="search-clear"
                aria-label="クリア"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* テーマ構造 */}
        <section>
          <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
            裏テーマ
          </h2>
          <div className="bg-white/90 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
            <p className="text-xl font-semibold text-[#3d3629]">{THEME_STRUCTURE.rootTheme}</p>
            <p className="text-[#6b5d4d] mt-2">{THEME_STRUCTURE.subtitle}</p>
            <p className="text-sm text-[#8a7d6d] mt-4">
              核心思想: 命式は変えられない。しかし在り方は変えられる。変えられる部分に集中すれば、運命は開かれる
            </p>
          </div>
        </section>

        {/* サブテーマ統計 */}
        <section>
          <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
            サブテーマ分布（120話中）
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {THEME_STRUCTURE.subThemes.map((t) => (
              <div
                key={t.theme}
                className="flex justify-between items-center p-3 rounded-lg border border-[#d4c9b8] bg-white/80 text-sm"
              >
                <span className="font-medium">{t.theme}</span>
                <span className="text-[#6b5d4d]">
                  {t.count}話 ({t.percent}%)
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 13章構造 */}
        <section>
          <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
            13章構造
          </h2>
          <div className="space-y-3">
            {CHAPTERS_13.map((ch) => (
              <div
                key={ch.chapter}
                className="bg-white/90 rounded-lg border border-[#d4c9b8] p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-[#3d3629]">
                    第{ch.chapter}章：{ch.title}
                  </span>
                  <span className="text-sm text-[#6b5d4d]">{ch.episodes}</span>
                </div>
                <p className="text-xs text-[#8a7d6d] mt-1">{ch.period}</p>
                <p className="text-sm text-[#3d3629] mt-2">{ch.theme}</p>
              </div>
            ))}
          </div>
        </section>

        {/* さくら回想20回 */}
        <section>
          <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
            さくら回想シーン（20回）
          </h2>
          <div className="mb-2 text-sm text-[#6b5d4d]">
            基礎編9回 / 葛藤編6回 / 統合編5回
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {filteredSakuraRecalls.map((r) => (
              <div
                key={`${r.ep}-${r.theme}`}
                className="p-3 rounded-lg border border-[#d4c9b8] bg-white/80 text-sm"
              >
                <span className="font-mono text-[#6b5d4d]">第{r.ep}話</span>
                <span className="ml-2">{r.theme}</span>
                <span className="block text-xs text-[#8a7d6d] mt-1">{r.source}</span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/teachings"
            className="inline-block mt-4 text-sm text-[#6b5d4d] hover:text-[#3d3629]"
          >
            さくらの教え一覧 →
          </Link>
        </section>

        {/* タイムライン（主要マイルストーン） */}
        <section>
          <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
            主要プロットマイルストーン
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-[#d4c9b8]" />
            <div className="space-y-6">
              {MAJOR_MILESTONES.map((m) => (
                <div key={m.episode} className="flex gap-4 pl-12 relative">
                  <span className="absolute left-0 w-8 text-right font-mono text-sm text-[#6b5d4d]">
                    第{m.episode}話
                  </span>
                  <div className="flex-1 pb-6">
                    <h3 className="font-semibold text-[#3d3629]">{m.title}</h3>
                    <p className="text-sm text-[#6b5d4d] mt-0.5">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ライフイベントカバレッジ概要 */}
        <section>
          <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
            ライフイベントカバレッジ
          </h2>
          <div className="bg-white/90 rounded-lg border border-[#d4c9b8] p-4 shadow-sm">
            <p className="text-[#3d3629]">
              <strong>{DASHBOARD_STATS.lifeEventCoverage.done}</strong> /{' '}
              <strong>{DASHBOARD_STATS.lifeEventCoverage.total}</strong> 件（
              {DASHBOARD_STATS.lifeEventCoverage.percent}%）
            </p>
            <p className="text-sm text-[#6b5d4d] mt-2">
              転職・婚活・介護・うつ病・離婚・定年・がん診断など、48種類のライフイベントのうち40件を120話でカバー
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
