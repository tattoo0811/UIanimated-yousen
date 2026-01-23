import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {z} from 'zod';
import {VideoTemplate} from './VideoTemplate';
import {NicknameSection} from './sections/NicknameSection';
import {
  EssenceSection,
  FamilySection,
  WorkSection,
  LoveSection,
  OchiSection,
} from './sections/ContentSections';
import {
  generateEssenceContent,
  generateFamilyContent,
  generateWorkContent,
  generateLoveContent,
  generateOchiContent,
} from '../lib/contentGenerator';
import type {SanmeigakuInsenChart} from '../../../mobile/src/types';
import {useTheme} from './themes/themeConfig';

export const hookCompositionSchema = z.object({
  nickname: z.string().max(20),
  fortuneData: z.object({
    result: z.string().max(200),
    rating: z.number().min(1).max(5),
    insen: z.any().optional(), // SanmeigakuInsenChart for content generation
  }),
  theme: z.enum(['KiraPop', 'MonoEdge', 'ZenWa']),
  tone: z.enum(['TikTok', 'YouTube', 'Instagram']),
});

interface HookCompositionProps {
  nickname: string;
  fortuneData: {
    result: string;
    rating: number;
    insen?: SanmeigakuInsenChart;
  };
  theme: 'KiraPop' | 'MonoEdge' | 'ZenWa';
  tone: 'TikTok' | 'YouTube' | 'Instagram';
}

export const HookComposition: React.FC<HookCompositionProps> = ({
  nickname,
  fortuneData,
  theme,
  tone,
}) => {
  const themeConfig = useTheme(theme);

  // Generate content if insen data is available
  const content = fortuneData.insen ? {
    essence: generateEssenceContent(fortuneData.insen, nickname, tone),
    family: generateFamilyContent(fortuneData.insen, nickname, tone),
    work: generateWorkContent(fortuneData.insen, nickname, tone),
    love: generateLoveContent(fortuneData.insen, nickname, tone),
    ochi: generateOchiContent(fortuneData.insen, nickname, tone),
  } : null;

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
          <NicknameSection
            nickname={nickname}
            speed={themeConfig.animations.typingSpeed}
            theme={theme}
          />
        </Sequence>

        {content && (
          <>
            {/* 5-9s (120 frames): 本質 - Essence section */}
            <Sequence from={150} durationInFrames={120}>
              <EssenceSection
                title={content.essence.title}
                content={content.essence.content}
                speed={themeConfig.animations.typingSpeed}
                theme={theme}
                triggerFrame={0}
              />
            </Sequence>

            {/* 9-12s (90 frames): 家族 - Family section */}
            <Sequence from={270} durationInFrames={90}>
              <FamilySection
                title={content.family.title}
                content={content.family.content}
                speed={themeConfig.animations.typingSpeed}
                theme={theme}
                triggerFrame={0}
              />
            </Sequence>

            {/* 12-15s (90 frames): 仕事 - Work section */}
            <Sequence from={360} durationInFrames={90}>
              <WorkSection
                title={content.work.title}
                content={content.work.content}
                speed={themeConfig.animations.typingSpeed}
                theme={theme}
                triggerFrame={0}
              />
            </Sequence>

            {/* 15-18s (90 frames): 恋愛 - Love section */}
            <Sequence from={450} durationInFrames={90}>
              <LoveSection
                title={content.love.title}
                content={content.love.content}
                speed={themeConfig.animations.typingSpeed}
                theme={theme}
                triggerFrame={0}
              />
            </Sequence>

            {/* 18-20s (60 frames): オチ - Ochi section */}
            <Sequence from={540} durationInFrames={60}>
              <OchiSection
                title={content.ochi.title}
                content={content.ochi.content}
                speed={themeConfig.animations.typingSpeed}
                theme={theme}
                triggerFrame={0}
              />
            </Sequence>
          </>
        )}

        {/* 20-25s (150 frames): CTA - call to action */}
        <Sequence from={600} durationInFrames={150}>
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

        {/* 25-30s (150 frames): Branding - brand elements */}
        <Sequence from={750} durationInFrames={150}>
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
