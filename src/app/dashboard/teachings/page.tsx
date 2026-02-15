'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Search, X } from 'lucide-react';
import { SAKURA_TEACHINGS } from '@/data/sakura-teachings';
import { EPISODES_PHASE_DATA } from '@/data/episodes-phase-data';

export default function TeachingsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // 検索フィルタリング適用
  const filteredTeachings = useMemo(() => {
    if (!searchQuery.trim()) return SAKURA_TEACHINGS;
    const query = searchQuery.toLowerCase();
    return SAKURA_TEACHINGS.filter(t => {
      return (
        t.title.toLowerCase().includes(query) ||
        t.theme.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.path.toLowerCase().includes(query) ||
        t.useCases?.some(useCase =>
          useCase.toLowerCase().includes(query)
        )
      );
    });
  }, [searchQuery]);

  const byCategory = filteredTeachings.reduce(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    },
    {} as Record<string, typeof SAKURA_TEACHINGS>
  );
  const categories = ['東洋の知恵', '西洋哲学・心理学', 'ビジネス・人生訓', '自然科学'];

  const episodesUsingTeaching = (id: string) =>
    EPISODES_PHASE_DATA.filter((ep) => ep.sakuraTeachings?.includes(id));

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
            <Sparkles className="w-5 h-5" />
            さくらの教え
          </h1>
          <p className="text-[#6b5d4d] text-sm mt-1">
            novel/sakura-teachings より。各エピソードを話にタグ付けして管理
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 dashboard-container space-y-8">
        {/* 検索バー */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="教え名・テーマ・カテゴリで検索..."
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

        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
              {cat}
            </h2>
            <div className="space-y-4">
              {(byCategory[cat] || []).map((t) => (
                <div
                  key={t.id}
                  className="bg-white/90 rounded-lg border border-[#d4c9b8] p-4 shadow-sm"
                >
                  <h3 className="font-semibold text-[#3d3629]">{t.title}</h3>
                  <p className="text-sm text-[#6b5d4d] mt-1">{t.theme}</p>
                  <p className="text-xs text-[#8a7d6d] mt-2">path: {t.path}</p>
                  {episodesUsingTeaching(t.id).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-[#8a7d6d]">使用話:</span>
                      {episodesUsingTeaching(t.id).map((ep) => (
                        <Link
                          key={ep.episode}
                          href="/dashboard?tab=episodes"
                          className="text-xs px-2 py-1 rounded bg-amber-100/80 text-amber-900"
                        >
                          第{ep.episode}話 {ep.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
            v2オリジナル（さくら回想で使用・エピソード集未収録）
          </h2>
          <ul className="text-sm text-[#6b5d4d] space-y-1">
            <li>天中殺＝大地が眠る時間（第2話・第5話など）</li>
            <li>龍は箱に入りきらん（第3話）</li>
            <li>種が花になる時、庭師は離れる（第40.5話）</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
