import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {VideoTemplate} from './VideoTemplate';
import {TypingText} from './TypingText';
import {useTheme} from './themes/themeConfig';
import type {YearFortuneResult} from '../types/yearFortune';

export const yearFortuneCompositionSchema = z.object({
  nickname: z.string().max(20),
  yearFortune: z.any(), // YearFortuneResult
  theme: z.enum(['KiraPop', 'MonoEdge', 'ZenWa', 'HeinoE2026']),
  tone: z.enum(['TikTok', 'YouTube', 'Instagram']),
});

interface YearFortuneCompositionProps {
  nickname: string;
  yearFortune: YearFortuneResult;
  theme: 'KiraPop' | 'MonoEdge' | 'ZenWa' | 'HeinoE2026';
  tone: 'TikTok' | 'YouTube' | 'Instagram';
}

// Glow Effect Component
const GlowEffect: React.FC<{
  children: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
}> = ({children, color = '#FFD700', intensity = 'high'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Pulsing glow effect
  const glowOpacity = interpolate(
    frame % (fps * 2),
    [0, fps, fps * 2],
    [0.3, intensity === 'high' ? 0.8 : intensity === 'medium' ? 0.6 : 0.4, 0.3]
  );

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: -20,
          right: -20,
          bottom: -20,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: glowOpacity,
          filter: 'blur(20px)',
          zIndex: -1,
        }}
      />
      {children}
    </div>
  );
};

// Particle Effect Component
const ParticleEffect: React.FC<{
  count?: number;
  color?: string;
}> = ({count = 20, color = '#FFD700'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const particles = Array.from({length: count}, (_, i) => {
    const delay = (i / count) * fps * 2;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 8 + 4;
    const opacity = interpolate(
      ((frame + delay) % (fps * 3)) / fps,
      [0, 1, 2, 3],
      [0, 1, 1, 0]
    );

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          opacity,
          boxShadow: `0 0 ${size}px ${color}`,
        }}
      />
    );
  });

  return <>{particles}</>;
};

export const YearFortuneComposition: React.FC<YearFortuneCompositionProps> = ({
  nickname,
  yearFortune,
  theme = 'HeinoE2026', // Default to HeinoE2026
  tone,
}) => {
  const themeConfig = useTheme(theme);

  // Relationship label mapping
  const relationshipLabels: Record<string, string> = {
    productive: '相生',
    controlling: '相剋',
    same: '同五行',
    neutral: '中和',
  };

  return (
    <VideoTemplate theme={theme}>
      <AbsoluteFill>
        {/* Background particles */}
        {theme === 'HeinoE2026' && (
          <ParticleEffect count={30} color={themeConfig.glow?.color || '#FFD700'} />
        )}

        {/* Section 1: Hook (0-3s, 90 frames) */}
        <Sequence from={0} durationInFrames={90}>
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            textAlign: 'center',
          }}>
            <GlowEffect color={themeConfig.glow?.color}>
              <div style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: themeConfig.colors.primary,
                marginBottom: 20,
                textShadow: theme === 'HeinoE2026'
                  ? `0 0 30px ${themeConfig.glow?.color}, 0 0 60px ${themeConfig.glow?.color}`
                  : 'none',
              }}>
                🔥
              </div>
              <div style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: themeConfig.colors.text,
                textShadow: theme === 'HeinoE2026'
                  ? `0 0 20px ${themeConfig.glow?.color}`
                  : 'none',
              }}>
                2026年 丙午の運勢
              </div>
            </GlowEffect>
          </div>
        </Sequence>

        {/* Section 2: Year Intro (3-6s, 90 frames) */}
        <Sequence from={90} durationInFrames={90}>
          <div style={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: themeConfig.colors.primary,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              {yearFortune.yearData.kanshi}の年
            </div>
            <TypingText
              text={yearFortune.yearData.description}
              speed={themeConfig.animations.typingSpeed}
              style={{
                fontSize: 28,
                color: themeConfig.colors.text,
                lineHeight: 1.8,
                textAlign: 'center',
              }}
            />
          </div>
        </Sequence>

        {/* Section 3: Compatibility (6-10s, 120 frames) */}
        <Sequence from={180} durationInFrames={120}>
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: themeConfig.colors.primary,
              marginBottom: 30,
            }}>
              {nickname}と2026年の相性
            </div>
            <GlowEffect color={themeConfig.glow?.color}>
              <div style={{
                fontSize: 96,
                fontWeight: 'bold',
                color: themeConfig.colors.accent,
                marginBottom: 20,
                textShadow: theme === 'HeinoE2026'
                  ? `0 0 30px ${themeConfig.glow?.color}`
                  : 'none',
              }}>
                {yearFortune.compatibilityScore}
              </div>
            </GlowEffect>
            <div style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: themeConfig.colors.primary,
              marginBottom: 20,
            }}>
              {relationshipLabels[yearFortune.relationship]}
            </div>
            {/* Compatibility bar */}
            <div style={{
              width: '80%',
              height: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              margin: '0 auto',
              borderRadius: 10,
              overflow: 'hidden',
              border: `3px solid ${themeConfig.colors.primary}`,
            }}>
              <div style={{
                width: `${yearFortune.compatibilityScore}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${themeConfig.colors.primary}, ${themeConfig.colors.accent})`,
                borderRadius: 7,
              }} />
            </div>
          </div>
        </Sequence>

        {/* Section 4: Fortune Highlights (10-15s, 150 frames) */}
        <Sequence from={300} durationInFrames={150}>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '85%',
          }}>
            <div style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: themeConfig.colors.primary,
              marginBottom: 30,
              textAlign: 'center',
              textShadow: theme === 'HeinoE2026'
                ? `0 0 15px ${themeConfig.glow?.color}`
                : 'none',
            }}>
              ✨ 2026年の運気ポイント ✨
            </div>
            {yearFortune.highlights.slice(0, 3).map((highlight, index) => (
              <div
                key={index}
                style={{
                  fontSize: 26,
                  color: themeConfig.colors.text,
                  marginBottom: 25,
                  padding: '15px 20px',
                  backgroundColor: theme === 'HeinoE2026'
                    ? 'rgba(255, 215, 0, 0.1)'
                    : 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  border: `2px solid ${themeConfig.colors.primary}`,
                  boxShadow: theme === 'HeinoE2026'
                    ? `0 0 15px ${themeConfig.glow?.color}`
                    : 'none',
                  opacity: index < 3 ? 1 : 0,
                }}
              >
                {index + 1}. {highlight}
              </div>
            ))}
          </div>
        </Sequence>

        {/* Section 5: Detailed Fortune (15-20s, 150 frames) */}
        <Sequence from={450} durationInFrames={150}>
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: themeConfig.colors.primary,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              📊 詳細運勢
            </div>

            {/* Overall */}
            <div style={{
              fontSize: 24,
              color: themeConfig.colors.text,
              marginBottom: 20,
              padding: 15,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 10,
            }}>
              <span style={{color: themeConfig.colors.primary, fontWeight: 'bold'}}>全体:</span> {yearFortune.fortune.overall}
            </div>

            {/* Love */}
            <div style={{
              fontSize: 22,
              color: themeConfig.colors.text,
              marginBottom: 15,
              padding: 12,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 10,
            }}>
              <span style={{fontSize: 28}}>💕</span> <span style={{color: themeConfig.colors.primary, fontWeight: 'bold'}}>恋愛:</span> {yearFortune.fortune.love}
            </div>

            {/* Work */}
            <div style={{
              fontSize: 22,
              color: themeConfig.colors.text,
              marginBottom: 15,
              padding: 12,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 10,
            }}>
              <span style={{fontSize: 28}}>💼</span> <span style={{color: themeConfig.colors.primary, fontWeight: 'bold'}}>仕事:</span> {yearFortune.fortune.work}
            </div>

            {/* Health */}
            <div style={{
              fontSize: 22,
              color: themeConfig.colors.text,
              marginBottom: 15,
              padding: 12,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 10,
            }}>
              <span style={{fontSize: 28}}>🏥</span> <span style={{color: themeConfig.colors.primary, fontWeight: 'bold'}}>健康:</span> {yearFortune.fortune.health}
            </div>
          </div>
        </Sequence>

        {/* Section 6: Advice (20-25s, 150 frames) */}
        <Sequence from={600} durationInFrames={150}>
          <GlowEffect color={themeConfig.glow?.color} intensity="medium">
            <div style={{
              position: 'absolute',
              top: '35%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '85%',
              padding: 30,
              backgroundColor: theme === 'HeinoE2026'
                ? 'rgba(255, 69, 0, 0.2)'
                : 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              border: `3px solid ${themeConfig.colors.accent}`,
              boxShadow: theme === 'HeinoE2026'
                ? `0 0 30px ${themeConfig.glow?.color}`
                : 'none',
            }}>
              <div style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: themeConfig.colors.primary,
                marginBottom: 25,
                textAlign: 'center',
              }}>
                💡 2026年のアドバイス
              </div>
              <TypingText
                text={yearFortune.fortune.advice}
                speed={themeConfig.animations.typingSpeed}
                style={{
                  fontSize: 28,
                  color: themeConfig.colors.text,
                  lineHeight: 1.8,
                  textAlign: 'center',
                }}
              />
            </div>
          </GlowEffect>
        </Sequence>

        {/* Section 7: CTA & Branding (25-30s, 150 frames) */}
        <Sequence from={750} durationInFrames={150}>
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            textAlign: 'center',
          }}>
            <GlowEffect color={themeConfig.glow?.color}>
              <div style={{
                fontSize: 42,
                fontWeight: 'bold',
                color: themeConfig.colors.accent,
                marginBottom: 30,
                textShadow: theme === 'HeinoE2026'
                  ? `0 0 20px ${themeConfig.glow?.color}`
                  : 'none',
              }}>
                シェアして2026を運気アップ！
              </div>
            </GlowEffect>
            <div style={{
              fontSize: 28,
              color: themeConfig.colors.text,
              opacity: 0.8,
              marginTop: 40,
            }}>
              GOGYO POP! 陰陽五行アプリ
            </div>
          </div>
        </Sequence>
      </AbsoluteFill>
    </VideoTemplate>
  );
};
