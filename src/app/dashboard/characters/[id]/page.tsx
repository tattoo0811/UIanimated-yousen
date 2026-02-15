'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { calculateSanmei, calculateNenun, type TaiunRow, type NenunRow } from '@/lib/sanmei';
import { type IsohoLabel, type IsohoCategory } from '@/lib/isouhou';
import { getCharacterById } from '@/data/ep1-120-characters';
import { useParams } from 'next/navigation';

const REVIEW_STORAGE_KEY = 'char-review';

interface CharReviewState {
  humanReviewed: boolean;
  toolReviewed: boolean;
  personaNeedsUpdate: boolean;
  designNeedsUpdate: boolean;
  notes: string;
}

function loadReviewState(id: string): CharReviewState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const raw = localStorage.getItem(`${REVIEW_STORAGE_KEY}-${id}`);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<CharReviewState>;
    return { ...getDefaultState(), ...parsed };
  } catch {
    return getDefaultState();
  }
}

function getDefaultState(): CharReviewState {
  return {
    humanReviewed: false,
    toolReviewed: false,
    personaNeedsUpdate: false,
    designNeedsUpdate: false,
    notes: '',
  };
}

// --- 位相法カテゴリ別のスタイル ---
const CATEGORY_STYLES: Record<IsohoCategory, string> = {
  gouhou: 'bg-emerald-100 text-emerald-800 border-emerald-300',   // 合法（融合）
  sanpou: 'bg-rose-100 text-rose-800 border-rose-300',             // 散法（分離）
  tokushu: 'bg-amber-100 text-amber-800 border-amber-300',         // 特殊
  chuui: 'bg-orange-100 text-orange-800 border-orange-300',        // 注意
};

const CATEGORY_NAMES: Record<IsohoCategory, string> = {
  gouhou: '合法（融合）',
  sanpou: '散法（分離）',
  tokushu: '特殊',
  chuui: '注意',
};

const CATEGORY_EXAMPLES: Record<IsohoCategory, string> = {
  gouhou: '支合・半会・干合・干合支合',
  sanpou: '対冲・天剋地冲',
  tokushu: '納音・律音・干合支害',
  chuui: '刑（生貴刑/庫気刑/旺気刑/自刑）・害・破',
};

export default function CharacterDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const char = getCharacterById(id);

  const [review, setReview] = useState<CharReviewState>(() => loadReviewState(id));
  useEffect(() => {
    setReview(loadReviewState(id));
  }, [id]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${REVIEW_STORAGE_KEY}-${id}`, JSON.stringify(review));
    }
  }, [id, review]);

  const result = useMemo(() => {
    if (!char) return null;
    const [y, m, d] = char.birthDate.split('-').map(Number);
    const sanmei = calculateSanmei(y, m, d, char.gender || 'male');
    const nenun = calculateNenun(y, m, d, char.gender || 'male', 0, 100);
    return { ...sanmei, nenun };
  }, [char]);

  if (!char) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] p-8">
        <Link href="/dashboard" className="text-amber-900/70 hover:text-amber-900 flex items-center gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> 一覧に戻る
        </Link>
        <p className="text-amber-900/80">キャラクターが見つかりません</p>
      </div>
    );
  }

  if (!result) {
    return <div className="min-h-screen bg-[#f5f0e8] p-8">読み込み中...</div>;
  }

  const { insen, yousen, suriho, taiun, tenchusatsu, nenun } = result;
  const dayPillar = `${insen.day.gan}${insen.day.shi}`;

  // 大運に西暦を付与
  const [birthY] = char.birthDate.split('-').map(Number);
  const taiunDetail = taiun.list.map((row) => ({
    ...row,
    year: birthY + row.age,
  }));

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#3d3629]">
      {/* 和風ヘッダー */}
      <header className="bg-[#e8dfd0] border-b-2 border-[#c4b8a8] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-[#6b5d4d] hover:text-[#3d3629] flex items-center gap-2 mb-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> キャラクター一覧
          </Link>
          <h1 className="text-2xl font-semibold tracking-wide">{char.name}</h1>
          <p className="text-[#6b5d4d] text-sm mt-1">
            {char.birthDate}（{char.gender === 'male' ? '男性' : '女性'}）・EP{char.episode || 'レギュラー'}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 dashboard-container space-y-8">
        {/* 命式・エネルギー・大運サマリー */}
        <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
          <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">命式・数理法</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#faf6f0] rounded p-4 border border-[#e0d5c5] text-center">
              <div className="text-xs text-[#6b5d4d] mb-1">日柱</div>
              <div className="text-xl font-bold">{dayPillar}</div>
            </div>
            <div className="bg-[#faf6f0] rounded p-4 border border-[#e0d5c5] text-center">
              <div className="text-xs text-[#6b5d4d] mb-1">命式</div>
              <div className="text-sm">
                {insen.year.gan}{insen.year.shi}年 {insen.month.gan}{insen.month.shi}月 {insen.day.gan}{insen.day.shi}日
              </div>
            </div>
            <div className="bg-[#faf6f0] rounded p-4 border border-[#e0d5c5] text-center">
              <div className="text-xs text-[#6b5d4d] mb-1">エネルギー</div>
              <div className="text-xl font-bold text-amber-800">{suriho.total_energy}<span className="text-sm font-normal">点</span></div>
            </div>
            <div className="bg-[#faf6f0] rounded p-4 border border-[#e0d5c5] text-center">
              <div className="text-xs text-[#6b5d4d] mb-1">大運</div>
              <div className="text-sm">{taiun.isForward ? '順行' : '逆行'} {taiun.ritsuun}歳運</div>
            </div>
          </div>
          {/* 天中殺表示 */}
          <div className="text-sm text-amber-900/90 bg-amber-50/70 rounded px-3 py-2 border border-amber-200">
            <strong>天中殺</strong>: {tenchusatsu.my}天中殺（{tenchusatsu.branches.join('・')}）
          </div>
        </section>

        {/* 9マス：十大主星・十二大従星 */}
        <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
          <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">陽占（人体星図）</h2>
          <div className="max-w-sm mx-auto aspect-square grid grid-cols-3 gap-2">
            <div />
            <Cell title={yousen.north} sub="北（親・目上）" />
            <JuseiCell star={yousen.start} pos="初年期" />
            <Cell title={yousen.west} sub="西（家庭）" />
            <Cell title={yousen.center} sub="中央（自分）" isCenter />
            <Cell title={yousen.east} sub="東（社会）" />
            <JuseiCell star={yousen.end} pos="晩年期" />
            <Cell title={yousen.south} sub="南（子供・目下）" />
            <JuseiCell star={yousen.middle} pos="中年期" />
          </div>
        </section>

        {/* 位相法凡例 */}
        <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
          <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">位相法カテゴリ（凡例）</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(CATEGORY_STYLES) as IsohoCategory[]).map(cat => (
              <div key={cat} className="flex items-start gap-3">
                <span className={`inline-block px-2 py-0.5 text-[10px] rounded border font-medium whitespace-nowrap ${CATEGORY_STYLES[cat]}`}>
                  {CATEGORY_NAMES[cat]}
                </span>
                <span className="text-xs text-[#6b5d4d]">{CATEGORY_EXAMPLES[cat]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#8a7d6d] mt-3">
            ※ 西方＝日柱（結果・配偶者）、中央＝月柱（自分・現在）、東方＝年柱（親・社会・未来）との関係
          </p>
        </section>

        {/* 大運表（位相法カラーコーディング・天中殺付き） */}
        <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
          <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">
            大運（位相法・天中殺付き）
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#6b5d4d] border-b border-[#d4c9b8]">
                  <th className="text-left py-2 pr-2">歳</th>
                  <th className="text-left py-2 px-1">西暦</th>
                  <th className="text-left py-2 px-1">干支</th>
                  <th className="text-left py-2 px-1">主星</th>
                  <th className="text-left py-2 px-1">従星</th>
                  <th className="text-left py-2 px-1 bg-rose-50/50">
                    西方<br /><span className="text-[9px] font-normal">日柱(結果)</span>
                  </th>
                  <th className="text-left py-2 px-1 bg-sky-50/50">
                    中央<br /><span className="text-[9px] font-normal">月柱(現在)</span>
                  </th>
                  <th className="text-left py-2 px-1 bg-emerald-50/50">
                    東方<br /><span className="text-[9px] font-normal">年柱(未来)</span>
                  </th>
                  <th className="text-center py-2 w-12">天中殺</th>
                </tr>
              </thead>
              <tbody>
                {taiunDetail.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[#e8dfd0] ${row.isTenchu
                      ? 'bg-red-50/50 border-l-2 border-l-red-400'
                      : ''
                      }`}
                  >
                    <td className="py-2 pr-2 font-medium">{row.age}</td>
                    <td className="py-2 px-1">{row.year}</td>
                    <td className="py-2 px-1 font-bold">{row.eto}</td>
                    <td className="py-2 px-1">{row.star}</td>
                    <td className="py-2 px-1">{row.jusei}</td>
                    <td className="py-2 px-1">
                      <IsohoLabels labels={row.westLabels} />
                    </td>
                    <td className="py-2 px-1">
                      <IsohoLabels labels={row.centerLabels} />
                    </td>
                    <td className="py-2 px-1">
                      <IsohoLabels labels={row.eastLabels} />
                    </td>
                    <td className="py-2 text-center">
                      {row.isTenchu && (
                        <span className="text-[10px] bg-red-100 text-red-700 border border-red-300 rounded px-1.5 py-0.5 font-medium">
                          天中殺
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 年運（Nenun）表 */}
        <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
          <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">
            年運（0〜100歳）
          </h2>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#f5f0e8] z-10">
                <tr className="text-[#6b5d4d] border-b border-[#d4c9b8]">
                  <th className="text-left py-2 pr-2">歳</th>
                  <th className="text-left py-2 px-1">西暦</th>
                  <th className="text-left py-2 px-1">干支</th>
                  <th className="text-left py-2 px-1">主星</th>
                  <th className="text-left py-2 px-1">従星</th>
                  <th className="text-left py-2 px-1 bg-rose-50/50">
                    西方<br /><span className="text-[9px] font-normal">日柱(結果)</span>
                  </th>
                  <th className="text-left py-2 px-1 bg-sky-50/50">
                    中央<br /><span className="text-[9px] font-normal">月柱(現在)</span>
                  </th>
                  <th className="text-left py-2 px-1 bg-emerald-50/50">
                    東方<br /><span className="text-[9px] font-normal">年柱(未来)</span>
                  </th>
                  <th className="text-center py-2 w-12">天中殺</th>
                </tr>
              </thead>
              <tbody>
                {nenun.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[#e8dfd0] hover:bg-[#faf6f0] transition-colors ${row.isTenchu
                      ? 'bg-red-50/50 border-l-2 border-l-red-400'
                      : ''
                      }`}
                  >
                    <td className="py-2 pr-2 font-medium">{row.age}</td>
                    <td className="py-2 px-1">{row.year}</td>
                    <td className="py-2 px-1 font-bold">{row.eto}</td>
                    <td className="py-2 px-1">{row.star}</td>
                    <td className="py-2 px-1">{row.jusei}</td>
                    <td className="py-2 px-1">
                      <IsohoLabels labels={row.westLabels} />
                    </td>
                    <td className="py-2 px-1">
                      <IsohoLabels labels={row.centerLabels} />
                    </td>
                    <td className="py-2 px-1">
                      <IsohoLabels labels={row.eastLabels} />
                    </td>
                    <td className="py-2 text-center">
                      {row.isTenchu && (
                        <span className="text-[10px] bg-red-100 text-red-700 border border-red-300 rounded px-1.5 py-0.5 font-medium">
                          天中殺
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 年表 */}
        {char.timeline && char.timeline.length > 0 && (
          <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
            <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">年表</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#6b5d4d] border-b border-[#d4c9b8]">
                  <th className="text-left py-2 w-20">年齢</th>
                  <th className="text-left py-2 w-20">西暦</th>
                  <th className="text-left py-2">出来事</th>
                </tr>
              </thead>
              <tbody>
                {char.timeline.map((t, i) => (
                  <tr key={i} className="border-b border-[#e8dfd0]">
                    <td className="py-2 pr-4">{t.age}</td>
                    <td className="py-2 pr-4">{t.year}</td>
                    <td className="py-2">{t.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 物語における核 */}
        {char.narrativeCore && char.narrativeCore.length > 0 && (
          <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
            <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">物語における核</h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              {char.narrativeCore.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-700">・</span>
                  <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 年齢層テーマ */}
        {char.ageLayerThemes && char.ageLayerThemes.length > 0 && (
          <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
            <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">年齢層テーマ</h2>
            <ul className="space-y-2 text-sm">
              {char.ageLayerThemes.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </ul>
          </section>
        )}

        {/* レビュー状況（ダブルチェック） */}
        <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
          <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">レビュー状況（ダブルチェック）</h2>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-3 cursor-pointer group">
              <button
                type="button"
                role="checkbox"
                aria-checked={review.humanReviewed}
                onClick={() => setReview((r) => ({ ...r, humanReviewed: !r.humanReviewed }))}
                className="flex items-center justify-center w-6 h-6 rounded border-2 border-[#c4b8a8] hover:border-amber-600 transition-colors"
              >
                {review.humanReviewed ? <Check className="w-4 h-4 text-amber-700" strokeWidth={2.5} /> : null}
              </button>
              <span className="text-[#3d3629]">人間によるレビュー</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <button
                type="button"
                role="checkbox"
                aria-checked={review.toolReviewed}
                onClick={() => setReview((r) => ({ ...r, toolReviewed: !r.toolReviewed }))}
                className="flex items-center justify-center w-6 h-6 rounded border-2 border-[#c4b8a8] hover:border-amber-600 transition-colors"
              >
                {review.toolReviewed ? <Check className="w-4 h-4 text-amber-700" strokeWidth={2.5} /> : null}
              </button>
              <span className="text-[#3d3629]">ツールによるレビュー（verify-ep1-10 / verify-storyline）</span>
            </label>
          </div>
        </section>

        {/* ペルソナ・キャラ設計変更レビュー */}
        <section className="bg-white/80 rounded-lg border border-[#d4c9b8] p-6 shadow-sm">
          <h2 className="text-lg font-semibold border-b border-[#c4b8a8] pb-2 mb-4">ペルソナ・キャラ設計変更レビュー</h2>
          <p className="text-sm text-[#6b5d4d] mb-4">
            ストーリーライン変更後、以下の見直しが必要か確認します。
          </p>
          <div className="space-y-3 text-sm mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                role="checkbox"
                aria-checked={review.personaNeedsUpdate}
                onClick={() => setReview((r) => ({ ...r, personaNeedsUpdate: !r.personaNeedsUpdate }))}
                className="flex items-center justify-center w-6 h-6 rounded border-2 border-[#c4b8a8] hover:border-amber-600 transition-colors"
              >
                {review.personaNeedsUpdate ? <Check className="w-4 h-4 text-amber-700" strokeWidth={2.5} /> : null}
              </button>
              <span>ペルソナ（人物像）の見直しが必要</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                role="checkbox"
                aria-checked={review.designNeedsUpdate}
                onClick={() => setReview((r) => ({ ...r, designNeedsUpdate: !r.designNeedsUpdate }))}
                className="flex items-center justify-center w-6 h-6 rounded border-2 border-[#c4b8a8] hover:border-amber-600 transition-colors"
              >
                {review.designNeedsUpdate ? <Check className="w-4 h-4 text-amber-700" strokeWidth={2.5} /> : null}
              </button>
              <span>キャラクター設計（年表・核・他キャラ関係）の見直しが必要</span>
            </label>
          </div>
          <div>
            <label className="block text-xs text-[#6b5d4d] mb-1.5">メモ（変更点・懸念事項）</label>
            <textarea
              value={review.notes}
              onChange={(e) => setReview((r) => ({ ...r, notes: e.target.value }))}
              placeholder="ストーリーライン変更に伴う修正メモ、他キャラとの整合性など"
              className="w-full min-h-[80px] px-3 py-2 text-sm border border-[#d4c9b8] rounded bg-[#faf6f0] placeholder:text-[#8a7d6d] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
              rows={3}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

// --- 位相法ラベルバッジコンポーネント ---

function IsohoLabels({ labels }: { labels: IsohoLabel[] }) {
  if (!labels || labels.length === 0) {
    return <span className="text-[10px] text-[#8a7d6d]">―</span>;
  }
  return (
    <div className="flex flex-wrap gap-0.5">
      {labels.map((label, i) => (
        <span
          key={i}
          className={`inline-block px-1 py-0.5 text-[9px] rounded border font-medium leading-tight ${CATEGORY_STYLES[label.category]}`}
          title={CATEGORY_NAMES[label.category]}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
}

// --- 共通UIコンポーネント ---

function Cell({ title, sub, isCenter }: { title: string; sub: string; isCenter?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded border min-h-[80px] ${isCenter ? 'bg-rose-50/80 border-rose-300/70' : 'bg-[#faf6f0] border-[#d4c9b8]'
      }`}>
      <span className="font-bold text-sm">{title}</span>
      <span className="text-[10px] text-[#6b5d4d] mt-1">{sub}</span>
    </div>
  );
}

function JuseiCell({ star, pos }: { star: { name: string; sub: string; score: number }; pos: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded border bg-[#f5f0e8] border-[#d4c9b8] min-h-[80px]">
      <span className="font-bold text-sm">{star.name}</span>
      <span className="text-[10px] text-[#6b5d4d]">{star.sub}（{star.score}点）</span>
      <span className="text-[9px] text-[#8a7d6d] mt-0.5">{pos}</span>
    </div>
  );
}
