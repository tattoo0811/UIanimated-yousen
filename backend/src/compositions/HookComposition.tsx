import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {z} from 'zod';
import {VideoTemplate} from './VideoTemplate';
import {TypingText} from './TypingText';
import {useTheme} from './themes/themeConfig';

export const hookCompositionSchema = z.object({
  nickname: z.string().max(20),
  fortuneData: z.object({
    result: z.string().max(200),
    rating: z.number().min(1).max(5),
  }),
  theme: z.enum(['KiraPop', 'MonoEdge', 'ZenWa']),
  tone: z.enum(['TikTok', 'YouTube', 'Instagram']),
});

interface HookCompositionProps {
  nickname: string;
  fortuneData: {
    result: string;
    rating: number;
  };
  theme: 'KiraPop' | 'MonoEdge' | 'ZenWa';
  tone: 'TikTok' | 'YouTube' | 'Instagram';
}

export const HookComposition: React.FC<HookCompositionProps> = ({
  nickname,
  fortuneData,
  theme,
}) => {
  const themeConfig = useTheme(theme);

  return (
    <VideoTemplate theme={theme}>
      <AbsoluteFill>
        {/* 0-2s (60 frames): Visual Hook - attention-grabbing visuals */}
        <Sequence from={0} durationInFrames={60}>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 72,
            fontWeight: 'bold',
            color: themeConfig.colors.primary,
            textAlign: 'center',
          }}>
            運勢診断
          </div>
        </Sequence>

        {/* 2-5s (90 frames): Personalization - nickname typing */}
        <Sequence from={60} durationInFrames={90}>
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            textAlign: 'center',
          }}>
            <TypingText
              text={`${nickname}さんの運勢`}
              speed={themeConfig.animations.typingSpeed}
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: themeConfig.colors.primary,
              }}
            />
          </div>
        </Sequence>

        {/* 5-15s (300 frames): Revelation - fortune typing */}
        <Sequence from={150} durationInFrames={300}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            textAlign: 'center',
          }}>
            <TypingText
              text={fortuneData.result}
              speed={themeConfig.animations.typingSpeed}
              style={{
                fontSize: fortuneData.result.length > 100 ? 36 : 48,
                color: themeConfig.colors.text,
                lineHeight: 1.6,
              }}
            />
          </div>
        </Sequence>

        {/* 15-20s (150 frames): CTA - call to action */}
        <Sequence from={450} durationInFrames={150}>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 32,
            color: themeConfig.colors.accent,
            textAlign: 'center',
          }}>
            シェアして友達に見せよう！
          </div>
        </Sequence>

        {/* 20-30s (300 frames): Branding - brand elements */}
        <Sequence from={600} durationInFrames={300}>
          <div style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 24,
            opacity: 0.7,
          }}>
            陰陽五行アプリ
          </div>
        </Sequence>
      </AbsoluteFill>
    </VideoTemplate>
  );
};
