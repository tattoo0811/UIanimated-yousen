import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {VideoTemplate} from './VideoTemplate';

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
  return (
    <VideoTemplate theme={theme}>
      <AbsoluteFill>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          textAlign: 'center',
          padding: 40,
        }}>
          {nickname}さんの{theme}テーマ動画
        </div>
      </AbsoluteFill>
    </VideoTemplate>
  );
};
