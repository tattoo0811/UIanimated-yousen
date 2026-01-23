import React, { useEffect, useState } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { z } from 'zod';
import { VideoTemplate } from './VideoTemplate';
import { TypingText } from './TypingText';
import { useTheme } from './themes/themeConfig';
import type { CompatibilityResult } from '../types/compatibility';

export const compatibilityCompositionSchema = z.object({
  people: z.array(z.object({
    name: z.string(),
    birthDate: z.string(),
    gender: z.enum(['male', 'female']),
  })),
  compatibilityResult: z.object({
    scores: z.object({
      overall: z.number(),
      love: z.number(),
      work: z.number(),
      friendship: z.number(),
    }),
    level: z.enum(['perfect', 'great', 'good', 'neutral', 'challenging']),
    message: z.string(),
    advice: z.string(),
    comparisons: z.array(z.object({
      person1: z.string(),
      person2: z.string(),
      score: z.number(),
      strengths: z.array(z.string()),
      challenges: z.array(z.string()),
    })),
  }),
  theme: z.enum(['KiraPop', 'MonoEdge', 'ZenWa']),
  tone: z.enum(['TikTok', 'YouTube', 'Instagram']),
});

interface CompatibilityCompositionProps {
  people: Array<{ name: string; birthDate: string; gender: 'male' | 'female' }>;
  compatibilityResult: CompatibilityResult;
  theme: 'KiraPop' | 'MonoEdge' | 'ZenWa';
  tone: 'TikTok' | 'YouTube' | 'Instagram';
}

export const CompatibilityComposition: React.FC<CompatibilityCompositionProps> = ({
  people,
  compatibilityResult,
  theme,
  tone,
}) => {
  const themeConfig = useTheme(theme);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const [section, setSection] = useState(0);

  // Section timing (frames at 30fps)
  const SECTIONS = {
    hook: 90,      // 0-3s
    intro: 150,    // 3-5s
    score: 270,    // 5-9s
    aspects: 420,  // 9-14s
    advice: 570,   // 14-19s
    cta: 720,      // 19-24s
    branding: 900, // 24-30s
  };

  useEffect(() => {
    if (frame < SECTIONS.hook) setSection(0);
    else if (frame < SECTIONS.intro) setSection(1);
    else if (frame < SECTIONS.score) setSection(2);
    else if (frame < SECTIONS.aspects) setSection(3);
    else if (frame < SECTIONS.advice) setSection(4);
    else if (frame < SECTIONS.cta) setSection(5);
    else setSection(6);
  }, [frame]);

  const person1 = people[0]?.name || 'あなた';
  const person2 = people[1]?.name || '相手';

  return (
    <AbsoluteFill style={{ backgroundColor: themeConfig.colors.background }}>
      <VideoTemplate theme={theme}>
        {/* Section 0: Hook (0-3s) */}
        {section >= 0 && (
          <Sequence from={0} durationInFrames={SECTIONS.hook}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div
                style={{
                  fontSize: 120,
                  fontWeight: 'black',
                  color: themeConfig.colors.primary,
                  opacity: interpolate(frame, [0, 30], [0, 1]),
                  transform: `scale(${interpolate(frame, [0, 60], [0.5, 1])})`,
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                💕
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 'black',
                  color: themeConfig.colors.text,
                  marginTop: 30,
                  opacity: interpolate(frame, [30, 60], [0, 1]),
                  textAlign: 'center',
                }}
              >
                {person1} × {person2}
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 'bold',
                  color: themeConfig.colors.accent,
                  marginTop: 15,
                  opacity: interpolate(frame, [60, 90], [0, 1]),
                  textAlign: 'center',
                }}
              >
                相性診断
              </div>
            </div>
          </Sequence>
        )}

        {/* Section 1: Intro (3-5s) */}
        {section >= 1 && (
          <Sequence from={SECTIONS.hook} durationInFrames={SECTIONS.intro - SECTIONS.hook}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
            }}>
              <TypingText
                text={`${person1}と${person2}の\n相性を診断します...`}
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: themeConfig.colors.text,
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
                speed={themeConfig.animations.typingSpeed}
              />
            </div>
          </Sequence>
        )}

        {/* Section 2: Score (5-9s) */}
        {section >= 2 && (
          <Sequence from={SECTIONS.intro} durationInFrames={SECTIONS.score - SECTIONS.intro}>
            <div style={{
              position: 'absolute',
              top: '35%',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div
                style={{
                  fontSize: 180,
                  fontWeight: 'black',
                  color: themeConfig.colors.primary,
                  opacity: interpolate(frame, [SECTIONS.intro, SECTIONS.intro + 30], [0, 1]),
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                {compatibilityResult.scores.overall}
              </div>
              <div style={{ marginTop: 30, width: '80%' }}>
                <TypingText
                  text={compatibilityResult.message}
                  style={{
                    fontSize: 52,
                    fontWeight: 'bold',
                    color: themeConfig.colors.text,
                    textAlign: 'center',
                  }}
                  speed={themeConfig.animations.typingSpeed}
                />
              </div>
            </div>
          </Sequence>
        )}

        {/* Section 3: Aspects (9-14s) */}
        {section >= 3 && (
          <Sequence from={SECTIONS.score} durationInFrames={SECTIONS.aspects - SECTIONS.score}>
            <div style={{
              position: 'absolute',
              top: '30%',
              left: 0,
              right: 0,
              paddingHorizontal: 80,
            }}>
              {[
                { label: '恋愛', score: compatibilityResult.scores.love, icon: '💕' },
                { label: '仕事', score: compatibilityResult.scores.work, icon: '💼' },
                { label: '友情', score: compatibilityResult.scores.friendship, icon: '🤝' },
              ].map((aspect, index) => {
                const startFrame = SECTIONS.score + index * 45;
                const opacity = interpolate(
                  frame,
                  [startFrame, startFrame + 30],
                  [0, 1],
                  { extrapolateRight: 'clamp' }
                );
                const translateX = interpolate(
                  frame,
                  [startFrame, startFrame + 30],
                  [100, 0],
                  { extrapolateRight: 'clamp' }
                );

                return (
                  <div
                    key={aspect.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 35,
                      opacity,
                      transform: `translateX(${translateX}px)`,
                    }}
                  >
                    <div style={{ fontSize: 56, marginRight: 25 }}>{aspect.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 40,
                        fontWeight: 'bold',
                        color: themeConfig.colors.text,
                      }}>
                        {aspect.label}
                      </div>
                      <div style={{
                        height: 24,
                        backgroundColor: '#e5e5e5',
                        borderRadius: 12,
                        overflow: 'hidden',
                        marginTop: 12,
                      }}>
                        <div
                          style={{
                            width: `${aspect.score}%`,
                            height: '100%',
                            backgroundColor: themeConfig.colors.primary,
                          }}
                        />
                      </div>
                    </div>
                    <div style={{
                      fontSize: 48,
                      fontWeight: 'black',
                      color: themeConfig.colors.primary,
                      marginLeft: 25,
                    }}>
                      {aspect.score}
                    </div>
                  </div>
                );
              })}
            </div>
          </Sequence>
        )}

        {/* Section 4: Advice (14-19s) */}
        {section >= 4 && (
          <Sequence from={SECTIONS.aspects} durationInFrames={SECTIONS.advice - SECTIONS.aspects}>
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '85%',
            }}>
              <div style={{
                padding: 40,
                backgroundColor: themeConfig.colors.accent + '20',
                borderRadius: 24,
                borderWidth: 4,
                borderColor: themeConfig.colors.primary,
              }}>
                <div style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: themeConfig.colors.text,
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                  アドバイス 💡
                </div>
                <TypingText
                  text={compatibilityResult.advice}
                  style={{
                    fontSize: 38,
                    fontWeight: 'bold',
                    color: themeConfig.colors.text,
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                  speed={themeConfig.animations.typingSpeed}
                />
              </div>
            </div>
          </Sequence>
        )}

        {/* Section 5: CTA (19-24s) */}
        {section >= 5 && (
          <Sequence from={SECTIONS.advice} durationInFrames={SECTIONS.cta - SECTIONS.advice}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 'black',
                  color: themeConfig.colors.text,
                  opacity: interpolate(frame, [SECTIONS.advice, SECTIONS.advice + 30], [0, 1]),
                  textAlign: 'center',
                }}
              >
                友達とも診断してみよう！
              </div>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 'bold',
                  color: themeConfig.colors.primary,
                  marginTop: 25,
                  opacity: interpolate(frame, [SECTIONS.advice + 30, SECTIONS.advice + 60], [0, 1]),
                }}
              >
                👇
              </div>
            </div>
          </Sequence>
        )}

        {/* Section 6: Branding (24-30s) */}
        {section >= 6 && (
          <Sequence from={SECTIONS.cta} durationInFrames={SECTIONS.branding - SECTIONS.cta}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: themeConfig.colors.text,
                  opacity: interpolate(frame, [SECTIONS.cta, SECTIONS.cta + 30], [0, 1]),
                  textAlign: 'center',
                }}
              >
                陰陽五行アプリ
              </div>
            </div>
          </Sequence>
        )}
      </VideoTemplate>
    </AbsoluteFill>
  );
};
