/**
 * Content Translator
 *
 * Transforms professional fortune-telling content into platform-specific styles.
 * Supports TikTok (short/emotional), YouTube (storytelling), and Instagram (visual) tones.
 */

export type ContentTone = 'TikTok' | 'YouTube' | 'Instagram';

export interface TranslationConfig {
  tone: ContentTone;
  section: 'essence' | 'family' | 'work' | 'love' | 'ochi';
  nickname?: string;
}

/**
 * TikTok tone patterns
 * Characteristics: Short sentences, emotional keywords, punchlines, direct address
 */
const tikTokPatterns = {
  essence: (base: string, nickname: string): string => {
    // Extract key characteristics and transform to short emotional format
    const keywords = extractKeywords(base);
    return `【${nickname}の本質】\n${keywords.strength}◎ ${keywords.nature}！${keywords.emoji}\n${keywords.appeal}✨\nもう、気づいてる？その魅力！`;
  },

  family: (base: string): string => {
    const keywords = extractKeywords(base);
    return `家族運◎ ${keywords.action}！\n${keywords.role}${keywords.emoji}\n${keywords.affection}`;
  },

  work: (base: string): string => {
    const keywords = extractKeywords(base);
    return `仕事運◎ ${keywords.strength}！\n${keywords.opportunity}💪\n${keywords.motivation}`;
  },

  love: (base: string): string => {
    const keywords = extractKeywords(base);
    return `恋愛運◎ ${keywords.style}！\n${keywords.compatibility}💕\n${keywords.dreamy}`;
  },

  ochi: (base: string, nickname: string): string => {
    // Ochi is already punchy, just add energy
    const lines = base.split('、');
    return `${nickname}、${lines[0]}🔥\n${lines[1] || '今日も頑張るぞ！'}`;
  },
};

/**
 * YouTube tone patterns
 * Characteristics: Conversational, storytelling flow, connective phrases
 */
const youtubePatterns = {
  essence: (base: string, nickname: string): string => {
    const keywords = extractKeywords(base);
    return `【${nickname}さんの本質って？】\n実はね、${keywords.strength}があるんだよね。${keywords.nature}、${keywords.detail}があるの。\nこの${keywords.quality}、${keywords.potential}生かしていったら絶対認められるよ`;
  },

  family: (base: string): string => {
    const keywords = extractKeywords(base);
    return `家族運について話そうかな\n${keywords.role}になれるタイプ。${keywords.responsibility}、${keywords.environment}できるんだよね\n実際に、${keywords.action}してみてよ。きっと${keywords.recognition}されるはず`;
  },

  work: (base: string): string => {
    const keywords = extractKeywords(base);
    return `仕事で活きるって知ってた？\n${keywords.strength}を発揮できる仕事が向いてるんだ。${keywords.nature}、${keywords.advantage}が強み\n${keywords.role}で一番輝けるよ`;
  },

  love: (base: string): string => {
    const keywords = extractKeywords(base);
    return `恋愛観、聞かせてくれたらな\n${keywords.style}で接する相手が相性良いみたい。${keywords.preference}んだよね\n素直に${keywords.attitude}振る舞ったら、運気上がるかも`;
  },

  ochi: (base: string, nickname: string): string => {
    const lines = base.split('、');
    return `${nickname}さん、${lines[0]}！\n${lines[1] || '今日もポジティブにいこう！'}\n応援してるからね！`;
  },
};

/**
 * Instagram tone patterns
 * Characteristics: Visual-focused, line breaks, emoji, hashtags, aesthetic language
 */
const instagramPatterns = {
  essence: (base: string, nickname: string): string => {
    const keywords = extractKeywords(base);
    return `【${nickname}の本質】🌿\n${keywords.strength}という${keywords.metaphor} ${keywords.emoji}\n${keywords.nature}で、${keywords.presence}\nあなたの${keywords.vibe}が、誰かを救う✨\n#本質 #リーダーシップ #運命`;
  },

  family: (base: string): string => {
    const keywords = extractKeywords(base);
    return `【家族運】🏡\n${keywords.role}としての${keywords.quality}\n${keywords.responsibility}ある姿勢が、家族を守る\n${keywords.warmth}を育む毎日 🕯️\n#家族 #家時間 #幸せ`;
  },

  work: (base: string): string => {
    const keywords = extractKeywords(base);
    return `【仕事運】💼\n${keywords.strength}として輝く瞬間\n${keywords.nature}が、チームを動かす\n${keywords.trust}への道 📈\n#仕事 #キャリア #やりたいこと`;
  },

  love: (base: string): string => {
    const keywords = extractKeywords(base);
    return `【恋愛運】💕\n${keywords.style}で繋がる関係\n${keywords.preference}愛の形が似合う\n運命との出会い、もうすぐ 🌸\n#恋愛 #愛 #運命の人`;
  },

  ochi: (base: string, nickname: string): string => {
    const lines = base.split('、');
    return `${nickname}、${lines[0]}！\n${lines[1] || '今日も頑張る！'}\n#今日も頑張る #やる気`;
  },
};

/**
 * Extract keywords from base content
 * This analyzes the content and returns structured keywords for transformation
 */
function extractKeywords(content: string): Record<string, string> {
  const lowerContent = content.toLowerCase();

  // Detect leadership/strength traits
  if (lowerContent.includes('リーダー') || lowerContent.includes('リーダーシップ') || lowerContent.includes('大木')) {
    return {
      strength: 'リーダーシップ',
      nature: '大木のようにどっしりとした芯',
      appeal: 'みんなを支える頼りが存在',
      emoji: '🌳',
      action: '困ったら頼られる',
      role: '家庭の柱',
      affection: '愛される当たり前の人',
      opportunity: 'チーム率いて結果出す',
      motivation: '任せて！って言われ続ける',
      style: '自然体でモテる',
      compatibility: 'リードする関係が最高',
      dreamy: '運命の人、もうすぐ会えるかも',
      detail: '周囲を支える力',
      quality: '強さ',
      potential: '今後も',
      responsibility: '責任感があって',
      environment: '安定した環境を作れる',
      recognition: '頼りに',
      advantage: '堂々と構えられる',
      metaphor: '大樹',
      presence: '周囲を支える存在感',
      vibe: '佇まい',
      warmth: '温かい絆',
      trust: '信頼される存在',
      preference: 'リードする',
      attitude: '自分らしく',
    };
  }

  // Detect flexibility traits
  if (lowerContent.includes('柔軟') || lowerContent.includes('しなやか') || lowerContent.includes('草花')) {
    return {
      strength: '柔軟性',
      nature: 'しなやかに対応する力',
      appeal: '誰とでも仲良くなれる',
      emoji: '🌸',
      action: '家族の調和を大切に',
      role: '潤滑油として機能',
      affection: 'みんなに愛される',
      opportunity: '臨機応変で輝く',
      motivation: '万能選手として活躍',
      style: '柔軟で協調的',
      compatibility: '相手に合わせる関係',
      dreamy: '穏やかな恋愛ができる',
      detail: '調和を大切にする',
      quality: '優しさ',
      potential: '今後も',
      responsibility: '協調性',
      environment: '調和した環境',
      recognition: '愛される',
      advantage: 'しなやかに対応',
      metaphor: '草花',
      presence: '調和を生む力',
      vibe: '柔らかさ',
      warmth: '優しい絆',
      trust: '信頼される存在',
      preference: '相手に合わせる',
      attitude: '自然体で',
    };
  }

  // Detect brightness/passion traits
  if (lowerContent.includes('太陽') || lowerContent.includes('明る') || lowerContent.includes('情熱')) {
    return {
      strength: '明るさと情熱',
      nature: '太陽のような輝き',
      appeal: '周囲を元気にする',
      emoji: '☀️',
      action: '明るい家庭を作る',
      role: '元気を与える存在',
      affection: 'みんなの太陽',
      opportunity: '人前に立つ仕事で輝く',
      motivation: '周りを照らし続ける',
      style: '情熱的でモテる',
      compatibility: '明るい関係が最高',
      dreamy: '熱い恋が待ってる',
      detail: '人々を惹きつける魅力',
      quality: '魅力',
      potential: 'これからも',
      responsibility: '元気を与える',
      environment: '活気のある雰囲気',
      recognition: '明るくて',
      advantage: '明るく情熱的に',
      metaphor: '太陽',
      presence: '輝く存在感',
      vibe: '明るさ',
      warmth: '温かい絆',
      trust: '愛される存在',
      preference: '情熱的な',
      attitude: '積極的に',
    };
  }

  // Detect sensitivity traits
  if (lowerContent.includes('繊細') || lowerContent.includes('ろうそく') || lowerContent.includes('温か')) {
    return {
      strength: '繊細な感性',
      nature: '静かに確実に支える力',
      appeal: '誰よりも心に寄り添える',
      emoji: '🕯️',
      action: '細やかな愛情で包む',
      role: '心の支え',
      affection: '大切にされる',
      opportunity: '丁寧な仕事ぶりが評価',
      motivation: '確実に信頼を築く',
      style: '繊細で深い愛情',
      compatibility: 'じっくり育つ関係',
      dreamy: '深い絆を感じられる',
      detail: '人々の心を温める',
      quality: '深い愛情',
      potential: 'これからも',
      responsibility: '一人ひとりに目を配り',
      environment: '温かい絆',
      recognition: '信頼',
      advantage: '繊細に丁寧に',
      metaphor: '灯',
      presence: '温かい存在感',
      vibe: '優しさ',
      warmth: '温かい絆',
      trust: '信頼される',
      preference: 'じっくり育つ',
      attitude: '丁寧に',
    };
  }

  // Detect stability traits
  if (lowerContent.includes('山') || lowerContent.includes('安定') || lowerContent.includes('信頼')) {
    return {
      strength: '安定性と信頼',
      nature: '山のような頼もしさ',
      appeal: 'みんなが安心して頼れる',
      emoji: '⛰️',
      action: '安定した家庭を築く',
      role: '組織の柱',
      affection: '頼りにされる存在',
      opportunity: '安定した環境で力を発揮',
      motivation: 'みんなの支えになり続ける',
      style: '安定を重視する',
      compatibility: '信頼関係が築ける',
      dreamy: '長期的なパートナーを探してる',
      detail: '組織や家庭の柱',
      quality: '信頼感',
      potential: '今後も',
      responsibility: '安定した環境を作る',
      environment: '安定した環境',
      recognition: '信頼できる',
      advantage: 'どっしりとした信頼感',
      metaphor: '山',
      presence: '頼もしい存在感',
      vibe: '安定感',
      warmth: '温かい絆',
      trust: '絶対の信頼',
      preference: '安定した',
      attitude: '堂々と',
    };
  }

  // Default fallback
  return {
    strength: '個性',
    nature: '独自の魅力',
    appeal: 'あなただけの特長',
    emoji: '✨',
    action: '自分らしく振る舞う',
    role: 'チームの一人',
    affection: '大切にされる',
    opportunity: '自分の特性を活かす',
    motivation: '個性を活かして頑張る',
    style: '自分らしく',
    compatibility: '自然な関係',
    dreamy: '良い出会いがあるかも',
    detail: '個性を活かして生きる',
    quality: '魅力',
    potential: 'これから',
    responsibility: '自分の役割',
    environment: '自分の環境',
    recognition: '認められる',
    advantage: '自分の強み',
    metaphor: '宝石',
    presence: '存在感',
    vibe: '魅力',
    warmth: '絆',
    trust: '信頼',
    preference: '自然体',
    attitude: '自分らしく',
  };
}

/**
 * Translate content to specified tone
 *
 * @param content - Base content to translate
 * @param config - Translation configuration
 * @returns Translated content
 */
export function translateToTone(
  content: string,
  config: TranslationConfig
): string {
  const { tone, section, nickname = '' } = config;

  switch (tone) {
    case 'TikTok':
      return tikTokPatterns[section as keyof typeof tikTokPatterns](content, nickname);

    case 'YouTube':
      return youtubePatterns[section as keyof typeof youtubePatterns](content, nickname);

    case 'Instagram':
      return instagramPatterns[section as keyof typeof instagramPatterns](content, nickname);

    default:
      return content;
  }
}
