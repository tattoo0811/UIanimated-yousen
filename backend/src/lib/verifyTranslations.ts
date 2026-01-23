/**
 * Manual Verification Script for Content Translation
 *
 * Run with: npx ts-node verifyTranslations.ts
 * This script demonstrates all tone patterns with all sections
 */

import { translateToTone } from './contentTranslator';

// Mock data from contentGenerator.ts
const mockContent = {
  essence: {
    甲: 'リーダーシップがあり、堂々とした佇まい。大木のようにしっかりとした芯を持つあなたは、周囲を支える力があります。',
    乙: '柔軟性と協調性を兼ね備え、しなやかに対応。草花のように環境に馴染み、調和を大切にする優しさがあります。',
    丙: '太陽のような明るさと情熱。周囲を照らす魅力と積極性で、人々を惹きつける存在感があります。',
  },
  family: {
    甲: '家族を率いるリーダーシップが。家庭の柱として責任感を持ち、安定した環境を作れます。',
    乙: '家族の調和を大切にします。しなやかに対応し、家族間の潤滑油として機能します。',
    丙: '明るい家庭を作る力が。家族に元気を与え、活気のある雰囲気を生み出します。',
  },
  work: {
    甲: 'リーダーシップを発揮できる仕事が向いています。大木のように堂々と構え、チームを率いる役割で力を発揮します。',
    乙: '柔軟性を活かせる仕事が向いています。草花のようにしなやかに対応し、協調性を活かした役割で輝きます。',
    丙: '人前に立つ仕事や営業が向いています。太陽のように明るく情熱的に、周囲を照らす存在になれます。',
  },
  love: {
    甲: '堂々とした姿勢で、自然体で接することができる相手との相性が良いです。リードする関係を好みます。',
    乙: '柔軟で協調性のある関係を好みます。相手に合わせることが得意で、穏やかな恋愛を築けます。',
    丙: '情熱的な恋愛を好みます。明るく積極的なアプローチで、相手を引きつける魅力があります。',
  },
  ochi: {
    甲: '太郎、今日もリードしちゃうぞ！\n大樹のようにどっしり行こう！',
    乙: 'しなやかに今日も乗り切ろう！\n柔軟性最強、臨機応変でいこう！',
    丙: '今日も太陽のように輝いてやるぜ！\n情熱燃烧、ポジティブ全開でいこう！',
  },
};

const nickname = '太郎';
const tones = ['TikTok', 'YouTube', 'Instagram'] as const;
const sections = ['essence', 'family', 'work', 'love', 'ochi'] as const;
const stems = ['甲', '乙', '丙'] as const;

console.log('=== Content Translation Verification ===\n');

stems.forEach((stem) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`STEM: ${stem}`);
  console.log('='.repeat(60));

  sections.forEach((section) => {
    console.log(`\n--- ${section.toUpperCase()} ---`);

    tones.forEach((tone) => {
      const result = translateToTone(mockContent[section][stem as keyof typeof mockContent[section]], {
        tone,
        section,
        nickname,
      });

      console.log(`\n[${tone}]`);
      console.log(result);
      console.log(`Length: ${result.length} chars`);
    });
  });
});

console.log('\n=== Verification Complete ===');
