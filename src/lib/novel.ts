import fs from 'fs';
import path from 'path';

export interface EpisodeManifest {
  episode: string | number;
  title: string;
  rokujukkoushi?: string;
  nikkan?: string;
  theme?: string;
  protagonist?: string;
  drafts: { id: number; file: string; note?: string }[];
  currentDraftId: number | null;
}

export interface EpisodeMeta {
  slug: string;
  manifest: EpisodeManifest;
  draftContent: string | null;
}

const EPISODES_DIR = path.join(process.cwd(), 'novel/episodes/manuscripts');

export function listEpisodes(): EpisodeMeta[] {
  const dirs = fs.readdirSync(EPISODES_DIR, { withFileTypes: true });
  const episodes: EpisodeMeta[] = [];

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const manifestPath = path.join(EPISODES_DIR, dir.name, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    const manifest: EpisodeManifest = JSON.parse(
      fs.readFileSync(manifestPath, 'utf-8')
    );

    let draftContent: string | null = null;
    const draft = manifest.drafts?.find(
      (d) => d.id === manifest.currentDraftId
    );
    if (draft) {
      const draftPath = path.join(EPISODES_DIR, dir.name, draft.file);
      if (fs.existsSync(draftPath)) {
        draftContent = fs.readFileSync(draftPath, 'utf-8');
      }
    }

    episodes.push({
      slug: dir.name,
      manifest,
      draftContent,
    });
  }

  return episodes.sort((a, b) => {
    const aEp = typeof a.manifest.episode === 'number' ? a.manifest.episode : 999;
    const bEp = typeof b.manifest.episode === 'number' ? b.manifest.episode : 999;
    if (aEp !== bEp) return aEp - bEp;
    // 同一番号ならスラッグでソート（jin-sui-demo 等は末尾）
    return String(a.manifest.episode).localeCompare(String(b.manifest.episode));
  });
}

export function getEpisode(slug: string): EpisodeMeta | null {
  const manifestPath = path.join(EPISODES_DIR, slug, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;

  const manifest: EpisodeManifest = JSON.parse(
    fs.readFileSync(manifestPath, 'utf-8')
  );

  let draftContent: string | null = null;
  const draft = manifest.drafts?.find(
    (d) => d.id === manifest.currentDraftId
  );
  if (draft) {
    const draftPath = path.join(EPISODES_DIR, slug, draft.file);
    if (fs.existsSync(draftPath)) {
      draftContent = fs.readFileSync(draftPath, 'utf-8');
    }
  }

  return { slug, manifest, draftContent };
}

/** 「生年月日」で区切るマーカー（鑑定前で一度止める） */
export const BIRTHDATE_SPLIT_MARKER = '「生年月日を」';

/** マークダウンの見出しを除去し、本文のみをパース */
export function parseNovelContent(md: string): {
  title: string;
  body: string;
  /** 生年月日で分割する場合 [鑑定前, 鑑定後] */
  sections?: [string, string];
} {
  const lines = md.split('\n');
  let title = '';
  const body: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '').trim();
      continue;
    }
    if (line.startsWith('## ') && !title) {
      title = line.replace(/^##\s+/, '').trim();
      continue;
    }
    if (line.startsWith('## ')) continue;
    body.push(line);
  }

  const fullBody = body.join('\n').trim();
  const splitIdx = fullBody.indexOf(BIRTHDATE_SPLIT_MARKER);

  if (splitIdx >= 0) {
    const endOfPart1 = splitIdx + BIRTHDATE_SPLIT_MARKER.length;
    const part1 = fullBody.slice(0, endOfPart1).trim();
    const part2 = fullBody.slice(endOfPart1).trim();
    return {
      title: title || '無題',
      body: fullBody,
      sections: [part1, part2],
    };
  }

  return { title: title || '無題', body: fullBody };
}
