'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, Zap, Users, BookOpen } from 'lucide-react';
import type { CharacterData } from '@/data/characters';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

interface CharacterCardProps {
  character: CharacterData;
  viewMode: 'simple' | 'detailed';
  index?: number;
}

export function CharacterCard({ character, viewMode, index = 0 }: CharacterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const showDetails = viewMode === 'detailed' || expanded;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-colors"
      role="article"
      aria-label={`${character.name}のプロフィール`}
    >
      {/* ヘッダー：グラデーションバー */}
      <div className={`h-1.5 bg-gradient-to-r ${character.color}`} />

      <div className="p-5">
        {/* 基本情報（常に表示） */}
        <div className="flex items-start gap-4">
          {/* アバター */}
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${character.color} flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg`}
          >
            {character.name.charAt(character.name.indexOf(' ') + 1)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-white">{character.name}</h3>
              <Badge variant="outline" size="sm">{character.role}</Badge>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{character.nameReading}</p>

            {/* シンプル表示：ストーリーサマリー */}
            <p className="text-sm text-slate-300 mt-2 leading-relaxed line-clamp-2">
              {character.story.summary}
            </p>

            {/* キーワードタグ */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {character.story.keywords.map(kw => (
                <Badge key={kw} size="sm">{kw}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 詳しく見るボタン（シンプルモード時） */}
        {viewMode === 'simple' && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-4 flex items-center justify-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors py-1.5"
            aria-expanded={expanded}
            aria-controls={`details-${character.id}`}
          >
            {expanded ? (
              <>閉じる <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>詳しく見る <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}

        {/* 詳細情報（プログレッシブディスクロージャ） */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              id={`details-${character.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">

                {/* 命式データ */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 flex items-center gap-1.5 mb-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <Tooltip content="生年月日から導き出される個人の「設計図」" position="top">
                      命式
                    </Tooltip>
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <MeishikiPillar label="年柱" gan={character.meishiki.yearPillar.gan} shi={character.meishiki.yearPillar.shi} />
                    <MeishikiPillar label="月柱" gan={character.meishiki.monthPillar.gan} shi={character.meishiki.monthPillar.shi} />
                    <MeishikiPillar label="日柱" gan={character.meishiki.dayPillar.gan} shi={character.meishiki.dayPillar.shi} />
                  </div>
                </div>

                {/* 三運（十二大従星） */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 flex items-center gap-1.5 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <Tooltip content="人生のエネルギーレベルを示す12種類の星" position="top">
                      三運（十二大従星）
                    </Tooltip>
                  </h4>
                  <div className="flex items-center gap-2">
                    {character.meishiki.sanun.map((s, i) => (
                      <div key={i} className="flex-1 bg-slate-700/50 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-xs text-slate-400">{['始', '中', '終'][i]}</p>
                        <p className="text-sm font-medium text-white">{s.name}</p>
                        <p className="text-xs text-amber-400">{s.score}点</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* エネルギーと大運 */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-700/30 rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-400">
                      <Tooltip content="命式のエネルギー値を数値化する手法" position="top">
                        数理法エネルギー
                      </Tooltip>
                    </p>
                    <p className="text-xl font-bold text-white">{character.meishiki.energy}<span className="text-sm text-slate-400 font-normal">点</span></p>
                  </div>
                  <div className="flex-1 bg-slate-700/30 rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-400">
                      <Tooltip content="10年ごとに変わる人生の大きな流れ" position="top">
                        大運
                      </Tooltip>
                    </p>
                    <p className="text-sm font-medium text-white">
                      {character.meishiki.daiun === 'forward' ? '順行' : '逆行'}
                      <span className="text-slate-400 ml-1">立運{character.meishiki.ritsuun}歳</span>
                    </p>
                  </div>
                </div>

                {/* 成長アーク */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    成長の軌跡
                  </h4>
                  <p className="text-sm text-slate-300">{character.story.arc}</p>
                </div>

                {/* 関係性 */}
                {character.relationships.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 flex items-center gap-1.5 mb-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      関係性
                    </h4>
                    <div className="space-y-1.5">
                      {character.relationships.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" size="sm">{r.type}</Badge>
                          <span className="text-slate-400">{r.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

/* 命式の柱（年柱・月柱・日柱）表示 */
function MeishikiPillar({ label, gan, shi }: { label: string; gan: string; shi: string }) {
  const GOGYO: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
    '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  };
  const gogyo = GOGYO[gan] || '';

  return (
    <div className="bg-slate-700/50 rounded-lg px-2 py-1.5 text-center">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-white">{gan}{shi}</p>
      {gogyo && <Badge variant="gogyo" color={gogyo} size="sm">{gogyo}</Badge>}
    </div>
  );
}
