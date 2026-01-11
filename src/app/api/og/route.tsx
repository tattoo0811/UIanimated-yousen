import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// フォント読み込み（日本語対応）
// Edge Runtimeではファイルシステムにアクセスできないため、
// フォントはpublicディレクトリから読み込むか、CDNから取得する
async function loadFont() {
  try {
    // フォントをpublicディレクトリに配置した場合のパス
    // または、CDNからフォントを取得
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fontUrl = `${baseUrl}/fonts/玉ねぎ楷書激無料版v7改.ttf`;
    
    const response = await fetch(fontUrl);
    if (!response.ok) {
      console.warn('Font file not found, using system font');
      return null;
    }
    
    const fontData = await response.arrayBuffer();
    return fontData;
  } catch (error) {
    console.warn('Font loading failed, using system font:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータから診断結果データを取得
    const kanshi = searchParams.get('kanshi') || '甲子';
    const characterName = searchParams.get('characterName') || '水辺の賢者';
    const viralExpression = searchParams.get('viralExpression') || '表面はニコニコ同調、中身は自分だけの世界へスイッチOFF中。';
    const icon = searchParams.get('icon') || '🌳';
    const luckyColor = searchParams.get('luckyColor') || 'グリーン';
    const luckyItem = searchParams.get('luckyItem') || '観葉植物';
    const color = searchParams.get('color') || '#A3E635';

    // フォント読み込み
    const fontData = await loadFont();

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: `linear-gradient(135deg, ${color}15 0%, #0a0a0a 50%)`,
            position: 'relative',
            fontFamily: fontData ? 'Tamanegi' : 'system-ui',
          }}
        >
          {/* 背景装飾 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 30% 20%, ${color}20 0%, transparent 50%)`,
            }}
          />

          {/* メインコンテンツ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              width: '100%',
              maxWidth: '1200px',
            }}
          >
            {/* アイコンとキャラクター名 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  fontSize: '120px',
                  marginBottom: '20px',
                }}
              >
                {icon}
              </div>
              <div
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '10px',
                  textAlign: 'center',
                }}
              >
                {characterName}
              </div>
              <div
                style={{
                  fontSize: '36px',
                  color: color,
                  fontWeight: '600',
                  marginBottom: '30px',
                }}
              >
                {kanshi}
              </div>
            </div>

            {/* バズり表現 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                marginBottom: '50px',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  color: '#e0e0e0',
                  lineHeight: '1.6',
                  textAlign: 'center',
                  maxWidth: '900px',
                  padding: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  border: `2px solid ${color}40`,
                }}
              >
                {viralExpression}
              </div>
            </div>

            {/* ラッキー情報 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '40px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px 40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  border: `1px solid ${color}40`,
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    color: '#999',
                    marginBottom: '8px',
                  }}
                >
                  ラッキーカラー
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    color: color,
                    fontWeight: 'bold',
                  }}
                >
                  {luckyColor}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px 40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  border: `1px solid ${color}40`,
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    color: '#999',
                    marginBottom: '8px',
                  }}
                >
                  ラッキーアイテム
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    color: color,
                    fontWeight: 'bold',
                  }}
                >
                  {luckyItem}
                </div>
              </div>
            </div>

            {/* アプリ名 */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '60px',
                fontSize: '24px',
                color: '#666',
                fontWeight: '500',
              }}
            >
              陰陽五行診断
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontData
          ? [
              {
                name: 'Tamanegi',
                data: fontData,
                style: 'normal',
              },
            ]
          : [],
      }
    );
  } catch (e: any) {
    console.error('OG image generation failed:', e);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
