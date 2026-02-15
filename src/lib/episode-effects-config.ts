/**
 * エピソード別の読書画面エフェクト設定
 */

export interface EpisodeEffectConfig {
  effectTriggerScrollRatio?: number;
  useSplashCursor?: boolean;
  splashCursorBackColor?: { r: number; g: number; b: number };
  initialBackground?: 'default' | 'solid';
  initialBackgroundColor?: string;
  scrollRevealBackgroundColor?: string;
  scrollRevealTextColor?: string;
}

export const EPISODE_EFFECTS: Record<string, EpisodeEffectConfig> = {
  ep1: {
    effectTriggerScrollRatio: 0.5,
    useSplashCursor: true,
    splashCursorBackColor: { r: 0, g: 0, b: 0 },
    initialBackground: 'solid',
    initialBackgroundColor: '#000000',
  },
};

export function getEpisodeEffectConfig(slug: string): EpisodeEffectConfig | null {
  return EPISODE_EFFECTS[slug] ?? null;
}
