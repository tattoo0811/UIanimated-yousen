'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Users, BookOpen, ChevronRight, FileText, Sparkles, Tag, Home, Globe, Search, X } from 'lucide-react';
import { EP1_120_CHARACTERS } from '@/data/ep1-120-characters';
import { EPISODES_PHASE_DATA, getEpisodePhaseData } from '@/data/episodes-phase-data';
import { calculateSanmei } from '@/lib/sanmei';
import { SAKURA_TEACHINGS, getSakuraTeachingById } from '@/data/sakura-teachings';
import { FORESHADOWS } from '@/data/foreshadows';
import {
  DASHBOARD_STATS,
  THREE_PARTS,
  SOT_CANON,
  MAJOR_MILESTONES,
} from '@/data/dashboard-overview';
import { GlossaryPanel } from '@/components/features/GlossaryPanel';
import { CHAPTERS, getChapterForEpisode } from '@/data/chapter-data';
import styles from './dashboard.module.css';

type Tab = 'overview' | 'characters' | 'episodes';

function DashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === 'episodes' ? 'episodes' : tabParam === 'characters' ? 'characters' : 'overview'
  );
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // クエリ変更時にタブを同期
  useEffect(() => {
    if (tabParam === 'episodes') setActiveTab('episodes');
    else if (tabParam === 'characters') setActiveTab('characters');
    else setActiveTab('overview');
  }, [tabParam]);

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#3d3629]">
      <GlossaryPanel isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />

      {/* 和風ヘッダー */}
      <header className="sticky top-0 z-30 bg-[#e8dfd0] border-b-2 border-[#c4b8a8] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-wide">巡の運命診断室</h1>
            <button
              onClick={() => setGlossaryOpen(true)}
              className="text-sm text-[#6b5d4d] hover:text-[#3d3629] px-3 py-1.5 rounded border border-[#c4b8a8] hover:bg-white/50"
            >
              <BookOpen className="w-4 h-4 inline mr-1 align-middle" />
              用語集
            </button>
          </div>
          <nav className={styles.dashboardTabs}>
            <button
              onClick={() => setActiveTab('overview')}
              className={styles.tabButton}
              data-active={activeTab === 'overview'}
            >
              <Home className="w-4 h-4" />
              オーバービュー
            </button>
            <button
              onClick={() => setActiveTab('episodes')}
              className={styles.tabButton}
              data-active={activeTab === 'episodes'}
            >
              <FileText className="w-4 h-4" />
              話
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              className={styles.tabButton}
              data-active={activeTab === 'characters'}
            >
              <Users className="w-4 h-4" />
              キャラクター
            </button>
            <Link href="/dashboard/teachings" className={styles.tabButton} data-external>
              <Sparkles className="w-4 h-4" />
              さくらの教え
            </Link>
            <Link href="/dashboard/foreshadows" className={styles.tabButton} data-external>
              <Tag className="w-4 h-4" />
              伏線
            </Link>
            <Link href="/dashboard/worldview" className={styles.tabButton} data-external>
              <Globe className="w-4 h-4" />
              世界観
            </Link>
          </nav>
        </div>
      </header>

      <main className={`max-w-4xl mx-auto px-4 py-8 ${styles.dashboardContainer}`}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'characters' && <CharactersTab />}
        {activeTab === 'episodes' && <EpisodesTab />}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center text-[#6b5d4d]">
          読み込み中...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

/* ==================== オーバービュータブ ==================== */
function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* SSoT バナー */}
      <section className={`${styles.dashboardCard} bg-amber-50/80 border-amber-200 p-4`}>
        <h2 className="text-sm font-semibold text-amber-900 mb-2">📜 SSoT（正典）</h2>
        <p className="text-[#3d3629]">
          <strong>九条巡</strong> 生年月日: <code className="bg-amber-100 px-1 rounded">{SOT_CANON.meguruBirthDate}</code>{' '}
          日柱: {SOT_CANON.meguruDayPillar} / エネルギー: {SOT_CANON.meguruEnergy}点
        </p>
        <p className="text-xs text-[#6b5d4d] mt-1">正典: {SOT_CANON.canonPath}</p>
      </section>

      {/* 全体統計 */}
      <section>
        <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
          全体統計
        </h2>
        <div className={styles.statsGrid}>
          <StatCard label="総エピソード数" value={`${DASHBOARD_STATS.totalEpisodes}話`} />
          <StatCard label="物語期間" value={DASHBOARD_STATS.storyPeriod} />
          <StatCard label="メインキャラ" value={`${DASHBOARD_STATS.mainCharacters}名`} />
          <StatCard label="算命学テーマ" value={`${DASHBOARD_STATS.sanmeiThemes}テーマ`} />
          <StatCard label="さくら回想" value={`${DASHBOARD_STATS.sakuraRecallScenes}回`} />
          <StatCard
            label="ライフイベント"
            value={`${DASHBOARD_STATS.lifeEventCoverage.done}/${DASHBOARD_STATS.lifeEventCoverage.total} (${DASHBOARD_STATS.lifeEventCoverage.percent}%)`}
          />
        </div>
      </section>

      {/* 3部構成 */}
      <section>
        <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
          3部構成
        </h2>
        <div className="space-y-4">
          {THREE_PARTS.map((p) => (
            <div key={p.part} className={styles.dashboardCard}>
              <h3 className="font-semibold text-[#3d3629]">
                {p.part}　{p.episodes}
              </h3>
              <p className="text-sm text-[#6b5d4d] mt-1">{p.period}</p>
              <p className="text-sm text-[#3d3629] mt-2">{p.theme}</p>
              <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-amber-100/80 text-amber-900">
                さくら回想 {p.sakuraRecall}回
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* クイックリンク */}
      <section>
        <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
          クイックリンク
        </h2>
        <div className={styles.quicklinksGrid}>
          <QuickLink href="/dashboard?tab=episodes" icon={<FileText className="w-4 h-4" />} label="話（本編執筆）" />
          <QuickLink href="/dashboard?tab=characters" icon={<Users className="w-4 h-4" />} label="キャラクター" />
          <QuickLink href="/dashboard/teachings" icon={<Sparkles className="w-4 h-4" />} label="さくらの教え" />
          <QuickLink href="/dashboard/foreshadows" icon={<Tag className="w-4 h-4" />} label="伏線逆算" />
          <QuickLink href="/dashboard/worldview" icon={<Globe className="w-4 h-4" />} label="世界観" />
        </div>
      </section>

      {/* 主要マイルストーン（抜粋） */}
      <section>
        <h2 className="text-lg font-semibold text-[#6b5d4d] border-b border-[#c4b8a8] pb-2 mb-4">
          主要マイルストーン
        </h2>
        <div className="space-y-2">
          {MAJOR_MILESTONES.filter((m) => [1, 25, 41, 70, 99, 120].includes(m.episode)).map((m) => (
            <div key={m.episode} className="flex gap-4 text-sm">
              <span className="font-mono w-12 text-[#6b5d4d]">第{m.episode}話</span>
              <div>
                <span className="font-medium">{m.title}</span>
                <span className="text-[#6b5d4d] ml-2">— {m.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.dashboardCard}>
      <div className="text-xs text-[#8a7d6d]">{label}</div>
      <div className="font-semibold text-[#3d3629] mt-1">{value}</div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 ${styles.quicklink}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

/* ==================== キャラクタータブ ==================== */
const MAIN_CHAR_IDS = ['meguru', 'kei', 'sakura', 'misaki'];
const CHARS_PER_PAGE = 16;

function CharactersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const { mainChars, otherChars, filteredOthers } = useMemo(() => {
    const main = EP1_120_CHARACTERS.filter((c) => MAIN_CHAR_IDS.includes(c.id));
    const others = EP1_120_CHARACTERS.filter((c) => !MAIN_CHAR_IDS.includes(c.id));
    if (!searchQuery.trim()) {
      return { mainChars: main, otherChars: others, filteredOthers: others };
    }
    const q = searchQuery.toLowerCase();
    const filtered = others.filter(
      (char) =>
        char.name.toLowerCase().includes(q) ||
        char.id.toLowerCase().includes(q) ||
        char.narrativeCore?.some((item) => item.toLowerCase().includes(q)) ||
        char.ageLayerThemes?.some((item) => item.toLowerCase().includes(q)) ||
        char.timeline?.some((e) => e.event.toLowerCase().includes(q)) ||
        char.birthDate?.includes(q)
    );
    return { mainChars: main, otherChars: others, filteredOthers: filtered };
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOthers.length / CHARS_PER_PAGE));
  const paginatedChars = filteredOthers.slice(page * CHARS_PER_PAGE, (page + 1) * CHARS_PER_PAGE);

  // 検索変更でページリセット
  useEffect(() => setPage(0), [searchQuery]);

  return (
    <div className="space-y-6">
      <p className={styles.sectionSubtitle}>
        EP1-120の登場人物。主役4人＋検索・ページネーションで管理
      </p>

      {/* 主役4人ヒーロー */}
      <section>
        <h2 className={styles.sectionTitle}>主役</h2>
        <div className={styles.heroChars}>
          {mainChars.map((char) => {
            const [y, m, d] = char.birthDate.split('-').map(Number);
            const result = calculateSanmei(y, m, d, char.gender || 'male');
            const dayPillar = `${result.insen.day.gan}${result.insen.day.shi}`;
            return (
              <Link
                key={char.id}
                href={`/dashboard/characters/${char.id}`}
                className={styles.heroCharCard}
              >
                <h3>{char.name}</h3>
                <p className="meta">
                  {char.episode ? `EP${char.episode}` : '全話'}・{char.ageAtStory}歳
                </p>
                <span className="pill">{dayPillar} / {result.suriho.total_energy}点</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 検索＋一覧 */}
      <section>
        <h2 className={styles.sectionTitle}>登場人物一覧 ({filteredOthers.length}名)</h2>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="名前・エピソード・キーワードで検索..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className={styles.searchClear} aria-label="クリア">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.charGrid}>
          {paginatedChars.map((char) => {
            const [y, m, d] = char.birthDate.split('-').map(Number);
            const result = calculateSanmei(y, m, d, char.gender || 'male');
            const dayPillar = `${result.insen.day.gan}${result.insen.day.shi}`;
            return (
              <Link key={char.id} href={`/dashboard/characters/${char.id}`} className={styles.charCard}>
                <div className="min-w-0 flex-1">
                  <div className={styles.charName}>{char.name}</div>
                  <div className={styles.charMeta}>
                    {char.episode ? `EP${char.episode}` : '全話'}・{char.ageAtStory}歳
                  </div>
                  <div className={styles.charBadges}>
                    <span>{dayPillar}</span>
                    <span>{result.suriho.total_energy}点</span>
                  </div>
                </div>
                <ChevronRight className={styles.charChevron} size={20} />
              </Link>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              前へ
            </button>
            <span className={styles.paginationInfo}>
              {page * CHARS_PER_PAGE + 1}-{Math.min((page + 1) * CHARS_PER_PAGE, filteredOthers.length)} / {filteredOthers.length}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              次へ
            </button>
          </div>
        )}
      </section>

      <div className="pt-6 border-t border-[#d4c9b8]">
        <Link href="/sanmei" className="text-sm text-[#6b5d4d] hover:text-[#3d3629]">
          算命学アプリを試す →
        </Link>
      </div>
    </div>
  );
}

/* ==================== 話タブ（Phase 1-3） ==================== */
type PhaseTab = 'phase1' | 'phase2' | 'phase3';

type ManuscriptData = {
  manifest: { drafts: { id: number; file: string; note: string; createdAt: string }[]; currentDraftId: number | null };
  draft: { id: number; content: string; note: string } | null;
  currentDraftId: number | null;
};

function DraftSaveForm({ episode, onSaved }: { episode: number; onSaved: () => void }) {
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus('saving');
    try {
      const res = await fetch(`/api/episodes/${episode}/manuscript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), note: note || '新規ドラフト' }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('done');
        onSaved();
      } else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="本編テキストを貼り付け..."
        className="w-full h-32 p-2 border border-[#c4b8a8] rounded text-sm"
        rows={6}
      />
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="メモ（例: ドラフト2・推敲）"
        className="w-full p-2 border border-[#c4b8a8] rounded text-sm"
      />
      <button
        type="submit"
        disabled={status === 'saving' || !content.trim()}
        className="px-4 py-2 bg-[#6b5d4d] text-white rounded text-sm disabled:opacity-50"
      >
        {status === 'saving' ? '保存中...' : status === 'done' ? '保存完了' : '新規ドラフト保存'}
      </button>
    </form>
  );
}

function EpisodesTab() {
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [phaseTab, setPhaseTab] = useState<PhaseTab>('phase1');
  const [manuscript, setManuscript] = useState<ManuscriptData | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
  const [manuscriptRefresh, setManuscriptRefresh] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const data = selectedEpisode ? getEpisodePhaseData(selectedEpisode) : null;

  // 章でフィルタリングされたエピソードリスト
  const filteredEpisodes = useMemo(() => {
    if (!selectedChapter) return EPISODES_PHASE_DATA;
    return EPISODES_PHASE_DATA.filter(ep => {
      const chapter = getChapterForEpisode(ep.episode);
      return chapter?.id === selectedChapter;
    });
  }, [selectedChapter]);

  useEffect(() => {
    if (!selectedEpisode || phaseTab !== 'phase3') {
      setManuscript(null);
      return;
    }
    const draftParam = selectedDraftId ? `?draft=${selectedDraftId}` : '';
    fetch(`/api/episodes/${selectedEpisode}/manuscript${draftParam}`)
      .then((r) => r.json())
      .then((res) => {
        setManuscript({
          manifest: res.manifest || { drafts: [], currentDraftId: null },
          draft: res.draft,
          currentDraftId: res.currentDraftId,
        });
      })
      .catch(() => setManuscript(null));
  }, [selectedEpisode, phaseTab, selectedDraftId, manuscriptRefresh]);

  return (
    <div className="space-y-6">
      <p className="text-[#6b5d4d] text-sm">
        各話の Phase1（宿命の履歴書）・Phase2（物語の骨格）・Phase3（本編執筆）を戦略的に確認
      </p>

      {/* 章フィルター */}
      <div className={styles.chapterFilter}>
        <div className={styles.chapterPills}>
          <button
            className={`${styles.chapterPill} ${!selectedChapter ? styles.chapterPillActive : ''}`}
            onClick={() => setSelectedChapter(null)}
          >
            すべて
          </button>
          {CHAPTERS.map((chapter) => (
            <button
              key={chapter.id}
              className={`${styles.chapterPill} ${selectedChapter === chapter.id ? styles.chapterPillActive : ''}`}
              onClick={() => setSelectedChapter(chapter.id)}
              style={{ '--chapter-color': chapter.color } as React.CSSProperties}
            >
              {chapter.name}
              <span className={styles.episodeRange}>
                E{chapter.episodeRange[0]} - {chapter.episodeRange[1]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 話一覧 */}
      <div className="flex flex-wrap gap-2">
        {filteredEpisodes.map((ep) => (
          <button
            key={ep.episode}
            onClick={() => {
              setSelectedEpisode(ep.episode);
              setPhaseTab('phase1');
              setSelectedDraftId(null);
            }}
            className={`px-4 py-2 rounded-lg border text-sm text-left ${
              selectedEpisode === ep.episode
                ? 'bg-[#6b5d4d] text-white border-[#6b5d4d]'
                : 'bg-white/80 border-[#d4c9b8] text-[#3d3629] hover:border-[#b8a898]'
            }`}
          >
            <span className="block">第{ep.episode}話 {ep.title}</span>
            {(ep.sakuraTeachings?.length || ep.foreshadows?.length) ? (
              <span className="block mt-1 opacity-80 text-xs flex flex-wrap gap-1">
                {ep.sakuraTeachings?.slice(0,2).map(t => (
                  <span key={t} className="px-1 rounded bg-white/30">🌸{t.startsWith('v2-') ? t.replace('v2-','') : (getSakuraTeachingById(t)?.title?.slice(0,8) || t)}</span>
                ))}
                {ep.foreshadows?.slice(0,2).map(f => (
                  <span key={f} className="px-1 rounded bg-white/30">📌{f}</span>
                ))}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {data && (
        <>
          {/* Phase サブタブ */}
          <div className="flex gap-2 border-b border-[#c4b8a8] pb-2">
            {(['phase1', 'phase2', 'phase3'] as PhaseTab[]).map((p) => (
              <button
                key={p}
                onClick={() => setPhaseTab(p)}
                className={`px-4 py-2 rounded-t text-sm ${
                  phaseTab === p
                    ? 'bg-white border border-[#c4b8a8] border-b-white -mb-[2px] text-[#3d3629] font-medium'
                    : 'text-[#6b5d4d] hover:text-[#3d3629]'
                }`}
              >
                {p === 'phase1' && 'Phase 1: 宿命の履歴書'}
                {p === 'phase2' && 'Phase 2: 物語の骨格'}
                {p === 'phase3' && 'Phase 3: 本編執筆'}
              </button>
            ))}
          </div>

          {/* Phase コンテンツ */}
          <div className="bg-white/90 rounded-lg border border-[#d4c9b8] p-6 shadow-sm min-h-[320px]">
            {phaseTab === 'phase1' && (
              <section>
                <h3 className="text-lg font-semibold text-[#3d3629] mb-4">宿命の履歴書</h3>
                {data.phase1.characters.map((c) => (
                  <div key={c.name} className="mb-6 last:mb-0">
                    <h4 className="font-semibold text-[#6b5d4d] border-b border-[#e0d5c5] pb-1 mb-3">
                      {c.name}
                      {c.age != null && <span className="font-normal">（{c.age}歳）</span>}
                    </h4>
                    <dl className="grid gap-2 text-sm">
                      <div>
                        <dt className="text-[#8a7d6d]">生年月日</dt>
                        <dd>{c.birthDate}</dd>
                      </div>
                      <div>
                        <dt className="text-[#8a7d6d]">命式</dt>
                        <dd>{c.meishiki}</dd>
                      </div>
                      <div>
                        <dt className="text-[#8a7d6d]">本質（日干）</dt>
                        <dd>{c.essence}</dd>
                      </div>
                      <div>
                        <dt className="text-[#8a7d6d]">特徴</dt>
                        <dd>{c.traits}</dd>
                      </div>
                      {c.contradiction && (
                        <div>
                          <dt className="text-[#8a7d6d]">宿命の矛盾</dt>
                          <dd className="text-amber-900/90">{c.contradiction}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ))}
              </section>
            )}
            {phaseTab === 'phase2' && (
              <section>
                <h3 className="text-lg font-semibold text-[#3d3629] mb-4">物語の骨格</h3>
                <div className="mb-4">
                  <span className="text-[#8a7d6d] text-sm">構成パターン: </span>
                  <span className="font-medium bg-[#f5f0e8] px-2 py-1 rounded border border-[#d4c9b8]">
                    {data.phase2.pattern}
                  </span>
                </div>
                <p className="text-sm text-[#3d3629] mb-6">{data.phase2.premise}</p>
                <div className="space-y-4">
                  {data.phase2.plots.map((p) => (
                    <div key={p.section} className="border-l-2 border-[#c4b8a8] pl-4">
                      <div className="text-[#6b5d4d] font-medium text-sm mb-1">{p.section}</div>
                      <p className="text-sm text-[#3d3629]">{p.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {phaseTab === 'phase3' && (
              <section>
                <h3 className="text-lg font-semibold text-[#3d3629] mb-4">本編執筆</h3>
                {data.sakuraTeachings?.length || data.foreshadows?.length ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {data.sakuraTeachings?.map((t) => (
                      <Link key={t} href="/dashboard/teachings" className="text-xs px-2 py-1 rounded bg-amber-100/80 text-amber-900 border border-amber-200">
                        🌸 {t.startsWith('v2-') ? t.replace('v2-', '') : (getSakuraTeachingById(t)?.title || t)}
                      </Link>
                    ))}
                    {data.foreshadows?.map((f) => {
                      const fs = FORESHADOWS.find((x) => x.foreshadow_id === f);
                      return (
                        <Link key={f} href="/dashboard/foreshadows" className="text-xs px-2 py-1 rounded bg-sky-100/80 text-sky-900 border border-sky-200">
                          📌 {f}: {fs?.surface_description?.slice(0, 12) || f}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
                <div className="text-[#8a7d6d] text-sm mb-2">文体・推敲のポイント</div>
                <ul className="list-disc list-inside space-y-2 text-sm text-[#3d3629] mb-6">
                  {data.phase3.styleNotes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
                <div className="border-t border-[#d4c9b8] pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#8a7d6d] text-sm">本編</span>
                    {manuscript?.manifest?.drafts?.length ? (
                      <select
                        value={selectedDraftId ?? manuscript?.currentDraftId ?? ''}
                        onChange={(e) => setSelectedDraftId(e.target.value ? parseInt(e.target.value, 10) : null)}
                        className="text-sm border border-[#c4b8a8] rounded px-2 py-1 bg-white"
                      >
                        {manuscript.manifest.drafts.map((d) => (
                          <option key={d.id} value={d.id}>
                            ドラフト{d.id}: {d.note}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                  {manuscript?.draft?.content ? (
                    <div className="bg-[#faf6f0] rounded border border-[#e0d5c5] p-4 text-sm text-[#3d3629] whitespace-pre-wrap max-h-[400px] overflow-y-auto font-serif leading-relaxed">
                      {manuscript.draft.content}
                    </div>
                  ) : (
                    <p className="text-[#8a7d6d] text-sm italic">ドラフトがありません。下のフォームから保存するか、novel/episodes/manuscripts/ep{selectedEpisode}/ に手動で追加してください。</p>
                  )}
                  <details className="mt-4">
                    <summary className="text-sm text-[#6b5d4d] cursor-pointer">新規ドラフトとして保存</summary>
                    <DraftSaveForm episode={selectedEpisode!} onSaved={() => setManuscriptRefresh((r) => r + 1)} />
                  </details>
                </div>
              </section>
            )}
          </div>
        </>
      )}

      {!data && (
        <div className="bg-white/60 rounded-lg border border-[#d4c9b8] p-12 text-center text-[#6b5d4d]">
          話を選択してください
        </div>
      )}
    </div>
  );
}
