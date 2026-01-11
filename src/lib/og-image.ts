/**
 * OGP画像URLを生成するヘルパー関数
 */

export interface OGImageParams {
  kanshi: string;
  characterName: string;
  viralExpression: string;
  icon: string;
  luckyColor: string;
  luckyItem: string;
  color: string;
}

/**
 * 診断結果データからOGP画像URLを生成
 */
export function generateOGImageUrl(params: OGImageParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const searchParams = new URLSearchParams({
    kanshi: params.kanshi,
    characterName: params.characterName,
    viralExpression: params.viralExpression,
    icon: params.icon,
    luckyColor: params.luckyColor,
    luckyItem: params.luckyItem,
    color: params.color,
  });

  return `${baseUrl}/api/og?${searchParams.toString()}`;
}

/**
 * 診断結果データからOGP画像URLを生成（簡易版）
 * 必要なデータのみを受け取る
 */
export function generateOGImageUrlFromResult(
  kanshi: string,
  characterName: string,
  viralExpression: string,
  icon: string,
  luckyColor: string,
  luckyItem: string,
  color: string
): string {
  return generateOGImageUrl({
    kanshi,
    characterName,
    viralExpression,
    icon,
    luckyColor,
    luckyItem,
    color,
  });
}
