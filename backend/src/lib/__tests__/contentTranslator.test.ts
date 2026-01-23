/**
 * Content Translator Integration Tests
 *
 * Tests all tone patterns with all content sections
 */

import { translateToTone, type ContentTone } from '../contentTranslator';

// Mock data from contentGenerator.ts
const mockContent = {
  essence: 'リーダーシップがあり、堂々とした佇まい。大木のようにしっかりとした芯を持つあなたは、周囲を支える力があります。',
  family: '家族を率いるリーダーシップが。家庭の柱として責任感を持ち、安定した環境を作れます。',
  work: 'リーダーシップを発揮できる仕事が向いています。大木のように堂々と構え、チームを率いる役割で力を発揮します。',
  love: '堂々とした姿勢で、自然体で接することができる相手との相性が良いです。リードする関係を好みます。',
  ochi: '太郎、今日もリードしちゃうぞ！\n大樹のようにどっしり行こう！',
};

const nickname = '太郎';

describe('Content Translator Integration', () => {
  const tones: ContentTone[] = ['TikTok', 'YouTube', 'Instagram'];
  const sections = ['essence', 'family', 'work', 'love', 'ochi'] as const;

  describe('TikTok Tone', () => {
    it('should translate essence section with short sentences and emotional keywords', () => {
      const result = translateToTone(mockContent.essence, {
        tone: 'TikTok',
        section: 'essence',
        nickname,
      });

      expect(result).toContain('◎');
      expect(result).toContain('✨');
      expect(result).toContain('🌳');
      expect(result).toContain(nickname);
      // Max 2-3 lines
      const lines = result.split('\n').filter(line => line.length > 0);
      expect(lines.length).toBeLessThanOrEqual(4);
    });

    it('should translate family section with emotional appeal', () => {
      const result = translateToTone(mockContent.family, {
        tone: 'TikTok',
        section: 'family',
        nickname,
      });

      expect(result).toContain('家族運◎');
      expect(result.split('\n').filter(l => l).length).toBeLessThanOrEqual(3);
    });

    it('should translate work section with motivation', () => {
      const result = translateToTone(mockContent.work, {
        tone: 'TikTok',
        section: 'work',
        nickname,
      });

      expect(result).toContain('仕事運◎');
      expect(result).toContain('💪');
    });

    it('should translate love section with compatibility focus', () => {
      const result = translateToTone(mockContent.love, {
        tone: 'TikTok',
        section: 'love',
        nickname,
      });

      expect(result).toContain('恋愛運◎');
      expect(result).toContain('💕');
    });

    it('should translate ochi section with energy', () => {
      const result = translateToTone(mockContent.ochi, {
        tone: 'TikTok',
        section: 'ochi',
        nickname,
      });

      expect(result).toContain('🔥');
      expect(result).toContain(nickname);
    });
  });

  describe('YouTube Tone', () => {
    it('should translate essence section with storytelling format', () => {
      const result = translateToTone(mockContent.essence, {
        tone: 'YouTube',
        section: 'essence',
        nickname,
      });

      expect(result).toContain('実はね');
      expect(result).toContain('〜だよね');
      expect(result).toContain(nickname);
    });

    it('should translate family section with conversational flow', () => {
      const result = translateToTone(mockContent.family, {
        tone: 'YouTube',
        section: 'family',
        nickname,
      });

      expect(result).toContain('家族運について話そうかな');
      expect(result).toMatch(/〜てみてよ|〜だよね/);
    });

    it('should translate work section with hook and explanation', () => {
      const result = translateToTone(mockContent.work, {
        tone: 'YouTube',
        section: 'work',
        nickname,
      });

      expect(result).toContain('仕事で活きるって知ってた？');
    });

    it('should translate love section with empathy and advice', () => {
      const result = translateToTone(mockContent.love, {
        tone: 'YouTube',
        section: 'love',
        nickname,
      });

      expect(result).toContain('恋愛観');
      expect(result).toMatch(/〜かも|〜できるはず/);
    });

    it('should translate ochi section with friendly closing', () => {
      const result = translateToTone(mockContent.ochi, {
        tone: 'YouTube',
        section: 'ochi',
        nickname,
      });

      expect(result).toContain('応援してるからね！');
    });
  });

  describe('Instagram Tone', () => {
    it('should translate essence section with visual descriptions and hashtags', () => {
      const result = translateToTone(mockContent.essence, {
        tone: 'Instagram',
        section: 'essence',
        nickname,
      });

      expect(result).toContain('🌿');
      expect(result).toContain('#本質');
      expect(result).toContain('#リーダーシップ');
      // Line breaks for visual appeal
      expect(result.split('\n').length).toBeGreaterThan(3);
    });

    it('should translate family section with emoji and hashtags', () => {
      const result = translateToTone(mockContent.family, {
        tone: 'Instagram',
        section: 'family',
        nickname,
      });

      expect(result).toContain('🏡');
      expect(result).toContain('#家族');
    });

    it('should translate work section with aesthetic language', () => {
      const result = translateToTone(mockContent.work, {
        tone: 'Instagram',
        section: 'work',
        nickname,
      });

      expect(result).toContain('💼');
      expect(result).toContain('#仕事');
      expect(result).toContain('#キャリア');
    });

    it('should translate love section with romantic descriptions', () => {
      const result = translateToTone(mockContent.love, {
        tone: 'Instagram',
        section: 'love',
        nickname,
      });

      expect(result).toContain('💕');
      expect(result).toContain('#恋愛');
      expect(result).toContain('#運命の人');
    });

    it('should translate ochi section with hashtags', () => {
      const result = translateToTone(mockContent.ochi, {
        tone: 'Instagram',
        section: 'ochi',
        nickname,
      });

      expect(result).toContain('#今日も頑張る');
    });
  });

  describe('All tones work with all 10 day stems', () => {
    const allStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

    allStems.forEach((stem) => {
      tones.forEach((tone) => {
        it(`should translate ${stem} stem with ${tone} tone`, () => {
          // Use base content patterns from contentGenerator.ts
          const stemContent = {
            甲: 'リーダーシップがあり、堂々とした佇まい。',
            乙: '柔軟性と協調性を兼ね備え、しなやかに対応。',
            丙: '太陽のような明るさと情熱。',
            丁: '繊細な感性と深い愛情。',
            戊: '山のような信頼感と安定性。',
            己: '田畑のような包容力。',
            庚: '刀のように鋭い判断力と正義感。',
            辛: '宝石のような美しさと繊細さ。',
            壬: '大海のような広い心と自由さ。',
            癸: '雨や露のように静かに、しかし確実に。',
          }[stem];

          const result = translateToTone(stemContent, {
            tone,
            section: 'essence',
            nickname,
          });

          expect(result).toBeTruthy();
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Video duration matching', () => {
    it('should generate content that fits within video duration limits', () => {
      const durations = {
        essence: 120, // 4 seconds at 30fps
        family: 90,   // 3 seconds
        work: 90,     // 3 seconds
        love: 90,     // 3 seconds
        ochi: 60,     // 2 seconds
      };

      sections.forEach((section) => {
        tones.forEach((tone) => {
          const content = mockContent[section];
          const result = translateToTone(content, {
            tone,
            section,
            nickname,
          });

          // Estimate character reading time (Japanese: ~3 chars per second)
          const maxChars = (durations[section] / 30) * 100; // Generous estimate
          expect(result.length).toBeLessThan(maxChars);
        });
      });
    });
  });

  describe('Content safety', () => {
    it('should not contain profanity or inappropriate language', () => {
      const profanityPatterns = [
        /fuck|shit|bitch|ass|damn/i,
        /死ね|殺す|糸|セックス/i,
      ];

      sections.forEach((section) => {
        tones.forEach((tone) => {
          const result = translateToTone(mockContent[section], {
            tone,
            section,
            nickname,
          });

          profanityPatterns.forEach((pattern) => {
            expect(result).not.toMatch(pattern);
          });
        });
      });
    });
  });
});
