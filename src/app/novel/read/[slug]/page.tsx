import { getEpisode } from '@/lib/novel';
import { parseNovelContent } from '@/lib/novel';
import { notFound } from 'next/navigation';
import { NovelReader } from '@/components/novel/NovelReader';
import { JinSuiDemoReader } from '@/components/novel/JinSuiDemoReader';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function NovelReadPage({ params }: Props) {
  const { slug } = await params;

  if (slug === 'jin-sui-demo') {
    return (
      <div className="fixed inset-0 w-full h-full min-h-[100dvh]">
        <JinSuiDemoReader />
      </div>
    );
  }

  const episode = getEpisode(slug);
  if (!episode || !episode.draftContent) notFound();

  const parsed = parseNovelContent(episode.draftContent);
  const { title, body, sections } = parsed;

  return (
    <NovelReader
      slug={slug}
      title={title}
      body={body}
      sections={sections}
      meta={{
        episode: episode.manifest.episode,
        rokujukkoushi: episode.manifest.rokujukkoushi,
        theme: episode.manifest.theme,
        protagonist: episode.manifest.protagonist,
      }}
    />
  );
}
