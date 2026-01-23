import type {SanmeigakuInsenChart} from '../../../mobile/src/types';
import type {
  ContentSection,
  ContentGeneratorParams,
} from '../types/content';
import { translateToTone, type ContentTone, type TranslationConfig } from './contentTranslator';

/**
 * Generate 本質 (Essence) section content
 * Based on day stem (日干) characteristics from mobile app patterns
 */
export const generateEssenceContent = (
  insen: SanmeigakuInsenChart,
  nickname: string,
  tone: 'TikTok' | 'YouTube' | 'Instagram'
): ContentSection => {
  const dayStem = insen.pillars.day.stem;

  // Essence patterns based on day stem (十干)
  const essenceMap: Record<string, string> = {
    '甲': 'リーダーシップがあり、堂々とした佇まい。大木のようにしっかりとした芯を持つあなたは、周囲を支える力があります。',
    '乙': '柔軟性と協調性を兼ね備え、しなやかに対応。草花のように環境に馴染み、調和を大切にする優しさがあります。',
    '丙': '太陽のような明るさと情熱。周囲を照らす魅力と積極性で、人々を惹きつける存在感があります。',
    '丁': '繊細な感性と深い愛情。ろうそくの炎のように静かに、しかし確かに人々の心を温める力があります。',
    '戊': '山のような信頼感と安定性。どっしりとした姿勢で、組織や家庭の柱となる頼もしさがあります。',
    '己': '田畑のような包容力。人を育み、支える母性的な愛情で、周囲の成長を促す力があります。',
    '庚': '刀のように鋭い判断力と正義感。白黒はっきりとした姿勢で、困難を切り拓く強さがあります。',
    '辛': '宝石のような美しさと繊細さ。上品で洗練されたセンスで、質の高さを追求する心があります。',
    '壬': '大海のような広い心と自由さ。型にはまらない発想と、柔軟な対応力で可能性を広げます。',
    '癸': '雨や露のように静かに、しかし確実に。控めめながらも深い知性と、人を支える確かな力があります。',
  };

  const baseContent = essenceMap[dayStem] || '独自の特徴を持ち、個性を活かして生きる力があります。';

  // Apply tone translation
  const translatedContent = translateToTone(baseContent, {
    tone,
    section: 'essence',
    nickname,
  });

  return {
    title: `【${nickname}の本質】`,
    content: translatedContent,
    duration: 120, // 4 seconds at 30fps
  };
};

/**
 * Generate 家族 (Family) section content
 * Based on FamilyCard patterns from mobile app
 */
export const generateFamilyContent = (
  insen: SanmeigakuInsenChart,
  nickname: string,
  tone: 'TikTok' | 'YouTube' | 'Instagram'
): ContentSection => {
  const dayStem = insen.pillars.day.stem;
  const dayBranch = insen.pillars.day.branch;
  const kanshi = `${dayStem}${dayBranch}`;

  // Family advice patterns (from mobile/src/components/cards/FamilyCard.tsx)
  const adviceMap: Record<string, string> = {
    '甲': '家族を率いるリーダーシップが。家庭の柱として責任感を持ち、安定した環境を作れます。',
    '乙': '家族の調和を大切にします。しなやかに対応し、家族間の潤滑油として機能します。',
    '丙': '明るい家庭を作る力が。家族に元気を与え、活気のある雰囲気を生み出します。',
    '丁': '家族への細やかな愛情が。一人ひとりに目を配り、温かい絆を育てます。',
    '戊': '安定した家庭を築く力が。信頼できる存在として、家族の支えになれます。',
    '己': '家族を育てる力が。包容力があり、子供や家族の成長を支えられます。',
    '庚': '家族のルールを大切にします。規律がありながらも、公平な判断で家庭を守ります。',
    '辛': '美しい家庭を作るセンスが。上品で洗練された家庭環境を整えられます。',
    '壬': '家族の自由を尊重します。それぞれの個性を認め、広い心で接することができます。',
    '癸': '家族への静かな愛情が。表には出しませんが、深い絆で家族を守ります。',
  };

  const stem = kanshi[0];
  const baseAdvice = adviceMap[stem] || '家族との関係を大切にすることが重要です。';

  // Apply tone translation
  const translatedContent = translateToTone(baseAdvice, {
    tone,
    section: 'family',
    nickname,
  });

  return {
    title: '【家族運】',
    content: translatedContent,
    duration: 90, // 3 seconds at 30fps
  };
};

/**
 * Generate 仕事 (Work) section content
 * Based on WorkCard patterns from mobile app
 */
export const generateWorkContent = (
  insen: SanmeigakuInsenChart,
  nickname: string,
  tone: 'TikTok' | 'YouTube' | 'Instagram'
): ContentSection => {
  const dayStem = insen.pillars.day.stem;
  const dayBranch = insen.pillars.day.branch;
  const kanshi = `${dayStem}${dayBranch}`;

  // Work advice patterns (from mobile/src/components/cards/WorkCard.tsx)
  const adviceMap: Record<string, string> = {
    '甲': 'リーダーシップを発揮できる仕事が向いています。大木のように堂々と構え、チームを率いる役割で力を発揮します。',
    '乙': '柔軟性を活かせる仕事が向いています。草花のようにしなやかに対応し、協調性を活かした役割で輝きます。',
    '丙': '人前に立つ仕事や営業が向いています。太陽のように明るく情熱的に、周囲を照らす存在になれます。',
    '丁': '細やかな配慮が必要な仕事が向いています。ろうそくの炎のように繊細に、丁寧な仕事ぶりが評価されます。',
    '戊': '安定した環境で力を発揮します。山のようにどっしりとした信頼感で、組織の柱となる存在です。',
    '己': '人を育てる仕事が向いています。田畑のように育む力で、後輩や部下の成長を支えます。',
    '庚': '専門性を活かせる仕事が向いています。刀のように鋭い判断力で、難題を解決する力があります。',
    '辛': '美的センスを活かせる仕事が向いています。宝石のように美しく繊細に、質の高い仕事を追求します。',
    '壬': '自由度の高い仕事が向いています。大海のように広大な視野で、型にはまらない発想が強みです。',
    '癸': '裏方で支える仕事が向いています。雨や露のように静かに、確実にサポートする力があります。',
  };

  const stem = kanshi[0];
  const baseAdvice = adviceMap[stem] || '自分の特性を活かした仕事選びが重要です。';

  // Apply tone translation
  const translatedContent = translateToTone(baseAdvice, {
    tone,
    section: 'work',
    nickname,
  });

  return {
    title: '【仕事運】',
    content: translatedContent,
    duration: 90, // 3 seconds at 30fps
  };
};

/**
 * Generate 恋愛 (Love) section content
 * Based on LoveCard patterns from mobile app
 */
export const generateLoveContent = (
  insen: SanmeigakuInsenChart,
  nickname: string,
  tone: 'TikTok' | 'YouTube' | 'Instagram'
): ContentSection => {
  const dayStem = insen.pillars.day.stem;
  const dayBranch = insen.pillars.day.branch;
  const kanshi = `${dayStem}${dayBranch}`;

  // Love advice patterns (from mobile/src/components/cards/LoveCard.tsx)
  const adviceMap: Record<string, string> = {
    '甲': '堂々とした姿勢で、自然体で接することができる相手との相性が良いです。リードする関係を好みます。',
    '乙': '柔軟で協調性のある関係を好みます。相手に合わせることが得意で、穏やかな恋愛を築けます。',
    '丙': '情熱的な恋愛を好みます。明るく積極的なアプローチで、相手を引きつける魅力があります。',
    '丁': '繊細で深い愛情表現を好みます。じっくりと関係を育てるタイプで、一途な愛を捧げます。',
    '戊': '安定した関係を求めます。信頼関係を大切にし、長期的なパートナーシップを重視します。',
    '己': '包容力があり、相手を育てる愛情があります。家庭的な関係を好み、温かい家庭を築けます。',
    '庚': '白黒はっきりした関係を好みます。正直で誠実な態度で、信頼できるパートナーになれます。',
    '辛': '繊細で美しい恋愛を好みます。相手の良さを引き出すセンスがあり、上品な関係を築けます。',
    '壬': '自由な恋愛を好みます。束縛を嫌い、お互いの個性を尊重する関係で輝きます。',
    '癸': '静かで深い愛情を持ちます。表面的な関係より、心の繋がりを大切にします。',
  };

  const stem = kanshi[0];
  const baseAdvice = adviceMap[stem] || '自分の恋愛傾向を理解することが大切です。';

  // Apply tone translation
  const translatedContent = translateToTone(baseAdvice, {
    tone,
    section: 'love',
    nickname,
  });

  return {
    title: '【恋愛運】',
    content: translatedContent,
    duration: 90, // 3 seconds at 30fps
  };
};

/**
 * Generate オチ (Ochi) section content
 * Humorous closing message based on day stem
 */
export const generateOchiContent = (
  insen: SanmeigakuInsenChart,
  nickname: string,
  tone: 'TikTok' | 'YouTube' | 'Instagram'
): ContentSection => {
  const dayStem = insen.pillars.day.stem;

  // Humorous closing patterns based on day stem
  const ochiMap: Record<string, string[]> = {
    '甲': [
      `${nickname}、今日もリードしちゃうぞ！`,
      '大樹のようにどっしり行こう！',
    ],
    '乙': [
      'しなやかに今日も乗り切ろう！',
      '柔軟性最強、臨機応変でいこう！',
    ],
    '丙': [
      '今日も太陽のように輝いてやるぜ！',
      '情熱燃烧、ポジティブ全開でいこう！',
    ],
    '丁': [
      '繊細な心で、今日も丁寧に生きよう！',
      '静かに、でも確実に前進だ！',
    ],
    '戊': [
      '山のように動かない俺様、安定最強！',
      'どっしり構えて、今日も頑張るぞ！',
    ],
    '己': [
      '皆を育てる母性全開でいこう！',
      '包容力マシマシ、周りを支えよう！',
    ],
    '庚': [
      '白黒はっきり、今日も正々堂々！',
      '鋭い判断で、困難を切り裂くぞ！',
    ],
    '辛': [
      '美しく、上品に、今日も輝こう！',
      '質へのこだわり、妥協なしで行くぜ！',
    ],
    '壬': [
      '自由自在、型にはまらないで行こう！',
      '広い心で、今日も楽しく過ごそう！',
    ],
    '癸': [
      '静かに、でも確実に結果を出すぞ！',
      '控えめだけど、確かな力を発揮！',
    ],
  };

  const options = ochiMap[dayStem] || [
    '運勢は乗りなさい！信じるものが救われるんじゃ！',
    '今日もポジティブにいこうぜ！',
  ];

  // Select first option for consistency
  const closingMessage = options[0];

  // Apply tone translation
  const translatedContent = translateToTone(closingMessage, {
    tone,
    section: 'ochi',
    nickname,
  });

  return {
    title: '', // No title for ochi
    content: translatedContent,
    duration: 60, // 2 seconds at 30fps
  };
};
