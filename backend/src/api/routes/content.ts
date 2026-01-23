import {Router} from 'express';
import {generateImagePrompt} from '../../lib/imagePromptGenerator';
import type {SanmeigakuInsenChart} from '../../../mobile/src/types';

/**
 * Build minimal insen chart from day stem and branch
 * This creates a simplified insen chart with just the day pillar
 * In production, you'd calculate the full chart from birth date
 */
function buildMinimalInsen(dayStem: string, dayBranch: string): SanmeigakuInsenChart {
  return {
    meta: {
      dayStem,
      calendar: 'solar'
    },
    pillars: {
      year: {stem: '甲', branch: '子'}, // Placeholder
      month: {stem: '甲', branch: '子'}, // Placeholder
      day: {stem: dayStem, branch: dayBranch}
    },
    hiddenStems: [],
    tsuhensei: [],
    junishiUn: [],
    fiveElements: {
      distribution: {
        wood: 0,
        fire: 0,
        earth: 0,
        metal: 0,
        water: 0
      },
      dayStemStrength: 'balanced'
    },
    phaseRelations: [],
    tenchusatsu: {
      type: '',
      missingBranches: []
    }
  };
}

const router = Router();

/**
 * GET /api/image-prompt
 *
 * Generate AI image prompts based on fortune data
 *
 * Query params:
 * - kanshi: Day stem + branch (e.g., "丙午")
 * - section: Section type ("essence" | "family" | "work" | "love")
 * - tone: Content tone ("TikTok" | "YouTube" | "Instagram")
 * - theme: Visual theme ("KiraPop" | "MonoEdge" | "ZenWa")
 *
 * Returns: Image prompt with style, negativePrompt, and suggestedFormat
 */
router.get('/image-prompt', async (req, res) => {
  try {
    const {kanshi, section, tone, theme} = req.query;

    // Validate required params
    if (!kanshi || typeof kanshi !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid kanshi parameter',
        message: 'kanshi must be a string (e.g., "丙午")'
      });
    }

    if (!section || typeof section !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid section parameter',
        message: 'section must be one of: essence, family, work, love'
      });
    }

    if (!tone || typeof tone !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid tone parameter',
        message: 'tone must be one of: TikTok, YouTube, Instagram'
      });
    }

    if (!theme || typeof theme !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid theme parameter',
        message: 'theme must be one of: KiraPop, MonoEdge, ZenWa'
      });
    }

    // Validate section enum
    const validSections = ['essence', 'family', 'work', 'love'];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        error: 'Invalid section value',
        message: `section must be one of: ${validSections.join(', ')}`
      });
    }

    // Validate tone enum
    const validTones = ['TikTok', 'YouTube', 'Instagram'];
    if (!validTones.includes(tone)) {
      return res.status(400).json({
        error: 'Invalid tone value',
        message: `tone must be one of: ${validTones.join(', ')}`
      });
    }

    // Validate theme enum
    const validThemes = ['KiraPop', 'MonoEdge', 'ZenWa'];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({
        error: 'Invalid theme value',
        message: `theme must be one of: ${validThemes.join(', ')}`
      });
    }

    // Parse kanshi (format: "丙午" -> stem="丙", branch="午")
    if (kanshi.length !== 2) {
      return res.status(400).json({
        error: 'Invalid kanshi format',
        message: 'kanshi must be 2 characters (e.g., "丙午")'
      });
    }

    const dayStem = kanshi[0];
    const dayBranch = kanshi[1];

    // Build minimal insen chart from kanshi
    // Note: We're creating a minimal insen chart with just the day pillar
    // In production, you'd want to calculate the full chart
    const insen = buildMinimalInsen(dayStem, dayBranch);

    // Generate image prompt
    const promptResult = generateImagePrompt(
      insen,
      section as 'essence' | 'family' | 'work' | 'love',
      tone as 'TikTok' | 'YouTube' | 'Instagram',
      theme as 'KiraPop' | 'MonoEdge' | 'ZenWa'
    );

    res.json(promptResult);
  } catch (error) {
    console.error('Image prompt generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate image prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
