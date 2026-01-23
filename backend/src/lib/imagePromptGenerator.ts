import type {SanmeigakuInsenChart} from '../../../mobile/src/types';

/**
 * Image generation prompt result
 */
export interface ImagePromptResult {
  prompt: string;           // Full prompt for AI image generation
  style: string;            // Style description
  negativePrompt: string;   // What to avoid in generation
  suggestedFormat: string;  // Aspect ratio recommendation
}

/**
 * Generate image prompts based on day stem, theme, and tone
 *
 * Creates AI-ready prompts for DALL-E, Midjourney, and other image generators
 * based on user's fortune data (insen chart), theme preference, and content tone.
 */
export function generateImagePrompt(
  insen: SanmeigakuInsenChart,
  section: 'essence' | 'family' | 'work' | 'love',
  tone: 'TikTok' | 'YouTube' | 'Instagram',
  theme: 'KiraPop' | 'MonoEdge' | 'ZenWa'
): ImagePromptResult {
  const dayStem = insen.pillars.day.stem;

  // Day stem visual patterns (10 variations)
  const stemPatterns: Record<string, {
    subject: string;
    characteristics: string[];
    colors: string[];
    mood: string;
  }> = {
    '甲': {
      subject: 'Strong, upright person with leadership presence',
      characteristics: [
        'standing tall like a great tree',
        'confident posture with broad shoulders',
        'commanding presence',
        'natural authority',
        'grounded and stable'
      ],
      colors: ['deep green', 'brown', 'earth tones', 'forest green'],
      mood: 'powerful and reliable'
    },
    '乙': {
      subject: 'Graceful, flexible person with gentle movement',
      characteristics: [
        'flowing like grass in wind',
        'elegant and flexible',
        'adaptable to surroundings',
        'soft curves and gentle posture',
        'harmonious with nature'
      ],
      colors: ['light green', 'soft yellow', 'pastel tones', 'natural greens'],
      mood: 'gentle and adaptable'
    },
    '丙': {
      subject: 'Radiant person with sun-like charisma',
      characteristics: [
        'standing with arms spread open',
        'warm golden light emanating from body',
        'bright and energetic presence',
        'radiating confidence and warmth',
        'illuminating surroundings'
      ],
      colors: ['bright orange', 'gold', 'yellow', 'warm white'],
      mood: 'energetic and inspiring'
    },
    '丁': {
      subject: 'Person with gentle, candle-like glow',
      characteristics: [
        'soft, intimate lighting',
        'gentle warmth radiating',
        'calm and peaceful demeanor',
        'quiet but steady presence',
        'illuminating darkness gently'
      ],
      colors: ['warm amber', 'soft orange', 'gentle yellow', 'candlelight glow'],
      mood: 'intimate and comforting'
    },
    '戊': {
      subject: 'Solid, mountain-like person with stability',
      characteristics: [
        'firm, immovable stance',
        'broad and stable shoulders',
        'grounded like a mountain',
        'dependable and strong',
        'solid foundation'
      ],
      colors: ['brown', 'terracotta', 'earth tones', 'stone gray'],
      mood: 'stable and trustworthy'
    },
    '己': {
      subject: 'Nurturing person with fertile field energy',
      characteristics: [
        'warm, welcoming presence',
        'nurturing posture',
        'surrounded by growth and abundance',
        'motherly or fatherly energy',
        'supporting others'
      ],
      colors: ['rich soil brown', 'golden wheat', 'lush green', 'warm earth tones'],
      mood: 'nurturing and abundant'
    },
    '庚': {
      subject: 'Sharp, precise person with sword-like energy',
      characteristics: [
        'clean, sharp lines',
        'precise and disciplined posture',
        'metallic shine or gleam',
        'decisive and strong',
        'cutting through obstacles'
      ],
      colors: ['silver', 'steel gray', 'white', 'metallic blue'],
      mood: 'sharp and determined'
    },
    '辛': {
      subject: 'Refined person with gemstone-like beauty',
      characteristics: [
        'elegant and graceful',
        'sparkling with inner beauty',
        'refined and sophisticated',
        'jewel-like quality',
        'delicate precision'
      ],
      colors: ['crystal white', 'soft pink', 'amethyst purple', 'pearl'],
      mood: 'elegant and refined'
    },
    '壬': {
      subject: 'Free person with ocean-like vastness',
      characteristics: [
        'expansive and open',
        'flowing like ocean waves',
        'boundless horizon',
        'free and unconfined',
        'vast and deep presence'
      ],
      colors: ['deep blue', 'ocean blue', 'aqua', 'gradient blues'],
      mood: 'free and expansive'
    },
    '癸': {
      subject: 'Subtle person with rain or dew-like beauty',
      characteristics: [
        'quiet and unassuming',
        'surrounded by gentle mist',
        'soft, diffused lighting',
        'tranquil and peaceful',
        'subtle but powerful presence'
      ],
      colors: ['soft blue', 'misty gray', 'pale aqua', 'gentle white'],
      mood: 'tranquil and subtle'
    }
  };

  // Theme visual styles
  const themeStyles: Record<string, {
    description: string;
    techniques: string[];
    quality: string;
  }> = {
    'KiraPop': {
      description: 'Vibrant pop art with bold colors and high energy',
      techniques: [
        'pop art style',
        'bold outlines',
        'high contrast colors',
        'comic book aesthetic',
        'vibrant saturated colors',
        'dynamic composition',
        'energetic atmosphere'
      ],
      quality: '4k quality, professional illustration'
    },
    'MonoEdge': {
      description: 'Monochrome with indigo accents, minimalist and modern',
      techniques: [
        'black and white photography style',
        'minimalist composition',
        'clean lines',
        'subtle indigo accent colors',
        'modern aesthetic',
        'elegant simplicity',
        'professional photography'
      ],
      quality: 'high-end photography, sharp focus'
    },
    'ZenWa': {
      description: 'Earth tones with Japanese aesthetics, natural and serene',
      techniques: [
        'Japanese aesthetic',
        'natural lighting',
        'earth tone color palette',
        'serene composition',
        'traditional Japanese art influence',
        'peaceful atmosphere',
        'organic textures'
      ],
      quality: 'fine art photography, museum quality'
    }
  };

  // Tone mood adjustments
  const toneMoods: Record<string, {
    emotional: string;
    energy: string;
    composition: string;
  }> = {
    'TikTok': {
      emotional: 'emotional, dramatic, bold',
      energy: 'high energy, dynamic, exciting',
      composition: 'vertical composition optimized for 9:16 format, close-up or medium shot, attention-grabbing'
    },
    'YouTube': {
      emotional: 'warm, authentic, relatable',
      energy: 'balanced energy, storytelling feel',
      composition: 'horizontal or square format, cinematic composition, natural framing'
    },
    'Instagram': {
      emotional: 'aesthetic, curated, visually pleasing',
      energy: 'soft energy, elegant',
      composition: 'square or 4:5 format, balanced composition, Instagram-worthy'
    }
  };

  // Section-specific context
  const sectionContext: Record<string, {
    context: string;
    elements: string[];
  }> = {
    'essence': {
      context: 'portrait showing personal essence and character',
      elements: ['single figure', 'expressive face', 'personality visible', 'character portrait']
    },
    'family': {
      context: 'family-oriented scene with warmth',
      elements: ['family gathering', 'warm home setting', 'togetherness', 'domestic harmony']
    },
    'work': {
      context: 'professional or career-focused setting',
      elements: ['work environment', 'professional setting', 'achievement', 'career success']
    },
    'love': {
      context: 'romantic or love-focused scene',
      elements: ['romantic atmosphere', 'intimate setting', 'love and connection', 'emotional bond']
    }
  };

  // Get pattern data
  const stemPattern = stemPatterns[dayStem] || stemPatterns['甲'];
  const themeStyle = themeStyles[theme];
  const toneMood = toneMoods[tone];
  const sectionData = sectionContext[section];

  // Build prompt
  const promptParts = [
    // Main subject
    stemPattern.subject,
    `in a ${sectionData.context}`,

    // Characteristics
    ...stemPattern.characteristics.slice(0, 3),

    // Visual elements
    ...sectionData.elements.slice(0, 2),

    // Theme style
    ...themeStyle.techniques.slice(0, 4),

    // Colors
    `color palette: ${stemPattern.colors.join(', ')}`,

    // Mood
    `${stemPattern.mood}, ${toneMood.emotional}`,

    // Energy and composition
    toneMood.energy,
    toneMood.composition,

    // Quality
    themeStyle.quality
  ];

  const prompt = promptParts.join(', ');

  // Build negative prompt
  const negativePrompts = [
    'dark, gloomy',
    'low contrast',
    'muted colors',
    'sad expression',
    'depressed',
    'low quality',
    'blurry',
    'distorted',
    'ugly',
    'poorly drawn'
  ];

  // Suggest format based on tone
  const formatSuggestions: Record<string, string> = {
    'TikTok': '9:16 (vertical for TikTok/Reels)',
    'YouTube': '16:9 (horizontal for YouTube)',
    'Instagram': '1:1 or 4:5 (square for Instagram feed)'
  };

  return {
    prompt,
    style: themeStyle.description,
    negativePrompt: negativePrompts.join(', '),
    suggestedFormat: formatSuggestions[tone]
  };
}
