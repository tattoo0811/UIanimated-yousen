'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { WaterShaderBackground } from './WaterShaderBackground';
import Link from 'next/link';
import { getEpisodeEffectConfig } from '@/lib/episode-effects-config';

const SplashCursor = dynamic(
  () => import('@/components/SplashCursor').then((m) => m.default),
  { ssr: false }
);

interface NovelReaderProps {
  slug?: string;
  title: string;
  body: string;
  sections?: [string, string];
  meta: {
    episode?: string | number;
    rokujukkoushi?: string;
    theme?: string;
    protagonist?: string;
  };
}

/**
 * 著者の行構成を尊重してレンダー
 * - 1行＝1ブロック（「戻れば、電話が鳴っている。戻れば、数字が待っている。」等の連続性を保持）
 * - 文節間にスペースは挟まない
 * - ＊は場面転換として大きな余白
 */
function renderParagraph(text: string, keyPrefix = ''): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') continue;

    const isSceneBreak = /^[\s　]*＊[\s　]*$/.test(trimmed);

    if (isSceneBreak) {
      nodes.push(
        <div key={`${keyPrefix}-br-${i}`} className="flex justify-center py-16 sm:py-24" aria-hidden>
          <span className="text-[0.7em] opacity-50">＊</span>
        </div>
      );
    } else {
      nodes.push(
        <p
          key={`${keyPrefix}-${i}`}
          className="mb-[1.2em] last:mb-0 leading-[2.15] text-[1rem] sm:text-[1.0625rem] tracking-normal"
        >
          {trimmed}
        </p>
      );
    }
    i++;
  }

  return nodes;
}

export function NovelReader({
  slug,
  title,
  body,
  sections,
  meta,
}: NovelReaderProps) {
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [effectActive, setEffectActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const effectConfig = slug ? getEpisodeEffectConfig(slug) : null;

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const maxScroll = Math.max(1, scrollHeight - clientHeight);
    const progress = Math.min(scrollTop / maxScroll, 1);
    const pastThreshold =
      effectConfig?.effectTriggerScrollRatio != null &&
      progress >= effectConfig.effectTriggerScrollRatio;

    if (pastThreshold) setEffectActive(true);

    if (effectConfig?.useSplashCursor && pastThreshold) {
      setOverlayOpacity(0.03);
    } else if (!effectConfig) {
      setOverlayOpacity(Math.max(0.08, 1.0 - progress * 1.05));
    } else {
      setOverlayOpacity(1);
    }
  }, [effectConfig]);

  useEffect(() => {
    handleScroll();
    const el = scrollRef.current;
    if (!el) return;
    const obs = new ResizeObserver(handleScroll);
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleScroll]);

  const useSolidBg = effectConfig?.initialBackground === 'solid' && !effectActive;
  const showSplashCursor = effectConfig?.useSplashCursor && effectActive;
  const backColor = effectConfig?.splashCursorBackColor ?? { r: 0.05, g: 0.25, b: 0.18 };

  const content = sections ? (
    <>
      {renderParagraph(sections[0], 'a')}
      <div className="h-24 sm:h-32" aria-hidden />
      {renderParagraph(sections[1], 'b')}
    </>
  ) : (
    renderParagraph(body)
  );

  return (
    <div className="fixed inset-0 w-full h-full min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 z-0">
        {useSolidBg && effectConfig?.initialBackgroundColor ? (
          <div className="absolute inset-0 bg-black" style={{ backgroundColor: effectConfig.initialBackgroundColor }} />
        ) : !showSplashCursor ? (
          <WaterShaderBackground intensity={1} />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
      </div>

      {showSplashCursor && (
        <div className="absolute inset-0 z-[5]">
          <div
            className="absolute inset-0 bg-black"
            style={{ backgroundColor: `rgb(${Math.round(backColor.r * 255)}, ${Math.round(backColor.g * 255)}, ${Math.round(backColor.b * 255)})` }}
          />
          <SplashCursor
            SIM_RESOLUTION={192}
            DYE_RESOLUTION={1440}
            DENSITY_DISSIPATION={4}
            VELOCITY_DISSIPATION={2}
            PRESSURE={0.2}
            CURL={3}
            SPLAT_RADIUS={0.2}
            SPLAT_FORCE={6000}
            COLOR_UPDATE_SPEED={10}
          />
        </div>
      )}

      <div
        className="absolute inset-0 bg-black pointer-events-none z-10 transition-opacity duration-300 ease-out"
        style={{ opacity: overlayOpacity }}
        aria-hidden
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth z-20"
      >
        <article
          className="mx-auto w-full max-w-[24em] px-[1.5rem] py-[2.5rem] pb-[8rem] sm:px-[2.5rem] sm:py-[3.5rem] sm:pb-[10rem] safe-area-padding"
          style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.75)',
          }}
        >
          <nav className="mb-14 sm:mb-16">
            <Link
              href="/novel"
              className="inline-flex items-center gap-2 text-sm text-[#94a3b8] transition-colors hover:text-[#e8eef5]"
            >
              <span aria-hidden>←</span>
              一覧へ
            </Link>
          </nav>

          <header className="mb-16 sm:mb-20">
            {meta.rokujukkoushi && (
              <span className="mb-3 block text-[0.7rem] font-mono tracking-[0.2em] text-[#64748b]">
                {meta.rokujukkoushi}
                {meta.theme && ` · ${meta.theme}`}
              </span>
            )}
            <h1 className="text-[1.25rem] sm:text-[1.5rem] font-medium leading-[1.6] tracking-wide text-[#e2e8f0]">
              {title}
            </h1>
            {meta.protagonist && (
              <p className="mt-4 text-[0.875rem] text-[#94a3b8]">
                {meta.protagonist}
              </p>
            )}
          </header>

          <div className="novel-body text-[#e2e8f0]">
            {content}
          </div>

          <div className="mt-28 sm:mt-36 h-px" aria-hidden />
        </article>
      </div>
    </div>
  );
}
