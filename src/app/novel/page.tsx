import { listEpisodes } from '@/lib/novel';
import Link from 'next/link';

export default function NovelIndexPage() {
  const episodes = listEpisodes();

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-24">
        <header className="mb-16 text-center">
          <h1 className="text-2xl font-medium tracking-[0.2em] text-[#94a3b8]">
            巡の運命診断室
          </h1>
          <p className="mt-4 text-sm text-[#64748b]">
            算命学に彩られた物語
          </p>
        </header>

        <nav className="space-y-1">
          {episodes.map((ep) => (
            <Link
              key={ep.slug}
              href={`/novel/read/${ep.slug}`}
              className="group block border-b border-[#1e293b] py-6 transition-colors hover:border-[#334155]"
            >
              <span className="text-xs font-mono text-[#64748b]">
                {typeof ep.manifest.episode === 'string'
                  ? ep.manifest.episode
                  : `第${ep.manifest.episode}話`}
              </span>
              <h2 className="mt-1 text-lg font-medium text-[#e8eef5] group-hover:text-[#f1f5f9]">
                {ep.manifest.title}
              </h2>
              {ep.manifest.rokujukkoushi && (
                <span className="mt-2 inline-block text-sm text-[#64748b]">
                  {ep.manifest.rokujukkoushi}
                  {ep.manifest.theme && ` ── ${ep.manifest.theme}`}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {episodes.length === 0 && (
          <p className="py-16 text-center text-[#64748b]">
            まだエピソードがありません。
          </p>
        )}
      </div>
    </div>
  );
}
