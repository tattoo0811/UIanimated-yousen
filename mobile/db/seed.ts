#!/usr/bin/env tsx
import { db } from './client';
import { stems, branches, tenStars, twelveUn, tsuhensei, tenchusatsuTypes } from './schema';

async function seed() {
    console.log('🌱 Seeding Turso database...\n');

    // 十干（Heavenly Stems）
    console.log('Seeding stems...');
    await db.insert(stems).values([
        { id: 1, name: '甲', yinYang: '陽', element: '木', meaning: '大木のように堂々とした性質', workAdvice: 'リーダーシップを発揮する仕事が向いています' },
        { id: 2, name: '乙', yinYang: '陰', element: '木', meaning: '草花のようにしなやかな性質', workAdvice: '柔軟性を活かせる仕事が向いています' },
        { id: 3, name: '丙', yinYang: '陽', element: '火', meaning: '太陽のように明るく情熱的', workAdvice: '人前に立つ仕事や営業が向いています' },
        { id: 4, name: '丁', yinYang: '陰', element: '火', meaning: 'ろうそくの炎のように繊細', workAdvice: '細やかな配慮が必要な仕事が向いています' },
        { id: 5, name: '戊', yinYang: '陽', element: '土', meaning: '山のようにどっしりとした性質', workAdvice: '安定した環境で力を発揮します' },
        { id: 6, name: '己', yinYang: '陰', element: '土', meaning: '田畑のように育む性質', workAdvice: '人を育てる仕事が向いています' },
        { id: 7, name: '庚', yinYang: '陽', element: '金', meaning: '刀のように鋭い性質', workAdvice: '専門性を活かせる仕事が向いています' },
        { id: 8, name: '辛', yinYang: '陰', element: '金', meaning: '宝石のように美しく繊細', workAdvice: '美的センスを活かせる仕事が向いています' },
        { id: 9, name: '壬', yinYang: '陽', element: '水', meaning: '大海のように広大な性質', workAdvice: '自由度の高い仕事が向いています' },
        { id: 10, name: '癸', yinYang: '陰', element: '水', meaning: '雨や露のように静かな性質', workAdvice: '裏方で支える仕事が向いています' },
    ]);

    // 十二支（Earthly Branches）
    console.log('Seeding branches...');
    await db.insert(branches).values([
        { id: 1, name: '子', element: '水', hiddenStems: JSON.stringify(['癸']), meaning: '新しい始まりの時期' },
        { id: 2, name: '丑', element: '土', hiddenStems: JSON.stringify(['己', '癸', '辛']), meaning: '準備と蓄積の時期' },
        { id: 3, name: '寅', element: '木', hiddenStems: JSON.stringify(['甲', '丙', '戊']), meaning: '成長の始まりの時期' },
        { id: 4, name: '卯', element: '木', hiddenStems: JSON.stringify(['乙']), meaning: '発展の時期' },
        { id: 5, name: '辰', element: '土', hiddenStems: JSON.stringify(['戊', '乙', '癸']), meaning: '調整の時期' },
        { id: 6, name: '巳', element: '火', hiddenStems: JSON.stringify(['丙', '庚', '戊']), meaning: '活動の時期' },
        { id: 7, name: '午', element: '火', hiddenStems: JSON.stringify(['丁', '己']), meaning: '最盛期' },
        { id: 8, name: '未', element: '土', hiddenStems: JSON.stringify(['己', '丁', '乙']), meaning: '成熟の時期' },
        { id: 9, name: '申', element: '金', hiddenStems: JSON.stringify(['庚', '壬', '戊']), meaning: '収穫の時期' },
        { id: 10, name: '酉', element: '金', hiddenStems: JSON.stringify(['辛']), meaning: '完成の時期' },
        { id: 11, name: '戌', element: '土', hiddenStems: JSON.stringify(['戊', '辛', '丁']), meaning: '蓄積の時期' },
        { id: 12, name: '亥', element: '水', hiddenStems: JSON.stringify(['壬', '甲']), meaning: '次への準備期' },
    ]);

    // 十大主星（Ten Great Stars）
    console.log('Seeding ten stars...');
    await db.insert(tenStars).values([
        { id: 1, name: '貫索星', nature: '自立心が強く、頑固', workAdvice: '独立して仕事をするのが向いています', strengths: JSON.stringify(['意志が強い', '一貫性がある']), weaknesses: JSON.stringify(['頑固', '融通が利かない']) },
        { id: 2, name: '石門星', nature: '協調性があり、仲間を大切にする', workAdvice: 'チームワークを活かせる仕事が向いています' },
        { id: 3, name: '鳳閣星', nature: '楽天的で表現力豊か', workAdvice: 'クリエイティブな仕事が向いています' },
        { id: 4, name: '調舒星', nature: '繊細で感受性が強い', workAdvice: '芸術的な仕事が向いています' },
        { id: 5, name: '禄存星', nature: '現実的で経済観念が強い', workAdvice: 'ビジネスや財務関係の仕事が向いています' },
        { id: 6, name: '司禄星', nature: '堅実で責任感が強い', workAdvice: '管理職や事務職が向いています' },
        { id: 7, name: '車騎星', nature: '行動力があり、勝負強い', workAdvice: '営業や競争の激しい仕事が向いています' },
        { id: 8, name: '牽牛星', nature: 'プライドが高く、完璧主義', workAdvice: '専門職や技術職が向いています' },
        { id: 9, name: '龍高星', nature: '好奇心旺盛で改革的', workAdvice: '新しいことに挑戦する仕事が向いています' },
        { id: 10, name: '玉堂星', nature: '知的で学問好き', workAdvice: '研究職や教育関係が向いています' },
    ]);

    // 十二運（Twelve Un）
    console.log('Seeding twelve un...');
    await db.insert(twelveUn).values([
        { id: 1, name: '長生', score: 9, meaning: '成長期、新しいスタート', energyLevel: 'high' },
        { id: 2, name: '沐浴', score: 7, meaning: '不安定な時期、変化の時', energyLevel: 'medium' },
        { id: 3, name: '冠帯', score: 10, meaning: '社会デビュー、活躍の時', energyLevel: 'high' },
        { id: 4, name: '建禄', score: 11, meaning: '最も安定した時期', energyLevel: 'high' },
        { id: 5, name: '帝旺', score: 12, meaning: '最盛期、エネルギーの頂点', energyLevel: 'high' },
        { id: 6, name: '衰', score: 8, meaning: '衰退期の始まり', energyLevel: 'medium' },
        { id: 7, name: '病', score: 4, meaning: '弱っている時期', energyLevel: 'low' },
        { id: 8, name: '死', score: 2, meaning: '活動停止の時期', energyLevel: 'low' },
        { id: 9, name: '墓', score: 5, meaning: '蓄積と準備の時期', energyLevel: 'low' },
        { id: 10, name: '絶', score: 1, meaning: '最も弱い時期', energyLevel: 'low' },
        { id: 11, name: '胎', score: 3, meaning: '新しい芽生えの時期', energyLevel: 'low' },
        { id: 12, name: '養', score: 6, meaning: '育成期', energyLevel: 'medium' },
    ]);

    // 天中殺タイプ
    console.log('Seeding tenchusatsu types...');
    await db.insert(tenchusatsuTypes).values([
        { id: 1, name: '子丑天中殺', missingBranches: JSON.stringify(['子', '丑']), characteristics: '家庭運に影響', advice: '家族との絆を大切に' },
        { id: 2, name: '寅卯天中殺', missingBranches: JSON.stringify(['寅', '卯']), characteristics: '仕事運に影響', advice: '独立心を持つことが大切' },
        { id: 3, name: '辰巳天中殺', missingBranches: JSON.stringify(['辰', '巳']), characteristics: '社会運に影響', advice: '自分の道を貫く' },
        { id: 4, name: '午未天中殺', missingBranches: JSON.stringify(['午', '未']), characteristics: '精神性に影響', advice: '内面を磨くことが大切' },
        { id: 5, name: '申酉天中殺', missingBranches: JSON.stringify(['申', '酉']), characteristics: '金銭運に影響', advice: '堅実な生活を心がける' },
        { id: 6, name: '戌亥天中殺', missingBranches: JSON.stringify(['戌', '亥']), characteristics: '人間関係に影響', advice: '信頼関係を大切に' },
    ]);

    console.log('\n✅ Seeding completed!');
}

seed().catch(console.error);
