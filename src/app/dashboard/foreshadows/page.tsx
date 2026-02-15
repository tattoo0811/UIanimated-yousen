'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import {
  FORESHADOWS,
  parseEpisodeNum,
  getForeshadowSummaryForEpisode,
} from '@/data/foreshadows';
import { EPISODES_PHASE_DATA } from '@/data/episodes-phase-data';

export default function ForeshadowsPage() {
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(5);
  const [searchQuery, setSearchQuery] = useState("");

  // 検索フィルタリング適用
  const filteredForeshadows = useMemo(() => {
    if (!searchQuery.trim()) return FORESHADOWS;
    const query = searchQuery.toLowerCase();
    return FORESHADOWS.filter(f => {
      return (
        f.foreshadow_id.toLowerCase().includes(query) ||
        f.surface_description?.toLowerCase().includes(query) ||
        f.true_meaning?.toLowerCase().includes(query) ||
        f.risk_level?.toLowerCase().includes(query) ||
        f.introduced_episode?.toLowerCase().includes(query) ||
        f.must_resolve_by?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const episodesUsingForeshadow = (fId: string) =>
    EPISODES_PHASE_DATA.filter((ep) => ep.foreshadows?.includes(fId));

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
            <Tag className="w-5 h-5" />
            伏線逆算
          </h1>
          <p className="text-[#6b5d4d] text-sm mt-1">
            話数ごとに「種蒔きすべき」「回収すべき」伏線を逆算表示
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
              placeholder="伏線ID・説明・リスクレベルで検索..."
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

        {/* 伏線一覧 */}
        <section>
          <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
            登録伏線一覧
          </h2>
          <div className="space-y-4">
            {filteredForeshadows.map((f) => (
              <div
                key={f.foreshadow_id}
                className="bg-white/90 rounded-lg border border-[#d4c9b8] p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[#6b5d4d]">{f.foreshadow_id}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      f.risk_level === 'high' ? 'bg-rose-100 text-rose-800' :
                      f.risk_level === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {f.risk_level}
                    </span>
                  </div>
                  <span className="text-xs text-[#8a7d6d]">
                    種蒔き: 第{parseEpisodeNum(f.introduced_episode)}話 / 回収: 第{parseEpisodeNum(f.must_resolve_by)}話
                  </span>
                </div>
                <p className="text-sm font-medium mt-1">{f.surface_description}</p>
                <p className="text-xs text-[#6b5d4d] mt-1">{f.true_meaning}</p>
                {episodesUsingForeshadow(f.foreshadow_id).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-[#8a7d6d]">使用話:</span>
                    {episodesUsingForeshadow(f.foreshadow_id).map((ep) => (
                      <Link
                        key={ep.episode}
                        href="/dashboard"
                        className="text-xs px-2 py-1 rounded bg-sky-100/80 text-sky-900"
                      >
                        第{ep.episode}話
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 話数別逆算 */}
        <section>
          <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
            話数別：種蒔き・回収マップ
          </h2>
          <p className="text-sm text-[#6b5d4d] mb-4">
            話数を選択すると、その話で「種を蒔くべき」「回収すべき」伏線を逆算表示
          </p>
          {[1, 3, 5, 10, 15, 40, 60, 85, 95, 120].map((epNum) => {
            const summary = getForeshadowSummaryForEpisode(epNum);
            const isExpanded = expandedEpisode === epNum;
            return (
              <div
                key={epNum}
                className="border border-[#d4c9b8] rounded-lg overflow-hidden mb-2"
              >
                <button
                  onClick={() => setExpandedEpisode(isExpanded ? null : epNum)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white/80 hover:bg-white text-left"
                >
                  <span className="font-medium">第{epNum}話</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#6b5d4d]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6b5d4d]" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 py-3 bg-[#faf6f0] border-t border-[#e0d5c5] space-y-3 text-sm">
                    {summary.introducesThisEpisode.length > 0 && (
                      <div>
                        <div className="text-[#6b5d4d] font-medium text-xs mb-1">この話で種蒔き:</div>
                        <ul className="list-disc list-inside">
                          {summary.introducesThisEpisode.map((f) => (
                            <li key={f.foreshadow_id}>{f.foreshadow_id} {f.surface_description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {summary.toResolveThisEpisode.length > 0 && (
                      <div>
                        <div className="text-rose-700 font-medium text-xs mb-1">この話で回収すべき:</div>
                        <ul className="list-disc list-inside">
                          {summary.toResolveThisEpisode.map((f) => (
                            <li key={f.foreshadow_id}>{f.foreshadow_id} {f.surface_description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {summary.toIntroduceBefore.length > 0 && (
                      <div>
                        <div className="text-rose-700 font-medium text-xs mb-1">⚠️ 逆算アラート: 回収期限なのに未導入</div>
                        <ul className="list-disc list-inside">
                          {summary.toIntroduceBefore.map((f) => (
                            <li key={f.foreshadow_id}>
                              {f.foreshadow_id} 第{parseEpisodeNum(f.must_resolve_by)}話で回収予定だが未導入
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {summary.introducesThisEpisode.length === 0 &&
                      summary.toResolveThisEpisode.length === 0 &&
                      summary.toIntroduceBefore.length === 0 && (
                        <p className="text-[#8a7d6d] italic">この話に関連する伏線はありません</p>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
