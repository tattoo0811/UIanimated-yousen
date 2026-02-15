import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draftId = request.nextUrl.searchParams.get('draft');
    const base = process.cwd();
    const dir = path.join(base, 'novel', 'episodes', 'manuscripts', `ep${id}`);

    if (!existsSync(dir)) {
      return NextResponse.json(
        { error: 'Manuscript not found', episode: id },
        { status: 404 }
      );
    }

    const manifestPath = path.join(dir, 'manifest.json');
    if (!existsSync(manifestPath)) {
      return NextResponse.json(
        { error: 'Manifest not found', episode: id },
        { status: 404 }
      );
    }

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const currentId = draftId ? parseInt(draftId, 10) : manifest.currentDraftId;
    const draft = manifest.drafts?.find((d: { id: number }) => d.id === currentId);

    if (!draft || !manifest.drafts?.length) {
      return NextResponse.json(
        { manifest, draft: null, currentDraftId: null },
        { status: 200 }
      );
    }

    const draftPath = path.join(dir, draft.file);
    let content = '';
    if (existsSync(draftPath)) {
      content = readFileSync(draftPath, 'utf-8');
    }

    return NextResponse.json({
      manifest,
      draft: { ...draft, content },
      currentDraftId: currentId,
    });
  } catch (e) {
    console.error('Manuscript API error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** 新規ドラフト保存 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, note } = body as { content?: string; note?: string };

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'content is required (string)' },
        { status: 400 }
      );
    }

    const base = process.cwd();
    const dir = path.join(base, 'novel', 'episodes', 'manuscripts', `ep${id}`);
    mkdirSync(dir, { recursive: true });

    const manifestPath = path.join(dir, 'manifest.json');
    let manifest: {
      episode: number;
      title?: string;
      drafts: { id: number; file: string; note: string; createdAt: string }[];
      currentDraftId: number | null;
    } = {
      episode: parseInt(id, 10),
      drafts: [],
      currentDraftId: null,
    };

    if (existsSync(manifestPath)) {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    }

    const nextId = manifest.drafts.length
      ? Math.max(...manifest.drafts.map((d) => d.id)) + 1
      : 1;
    const fileName = `draft-${nextId}.md`;
    const draftPath = path.join(dir, fileName);
    const createdAt = new Date().toISOString();

    manifest.drafts.push({
      id: nextId,
      file: fileName,
      note: note || `ドラフト${nextId}`,
      createdAt,
    });
    manifest.currentDraftId = nextId;

    writeFileSync(draftPath, content, 'utf-8');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    return NextResponse.json({
      ok: true,
      draft: { id: nextId, file: fileName, note: manifest.drafts[manifest.drafts.length - 1].note, createdAt },
    });
  } catch (e) {
    console.error('Manuscript POST error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
