#!/usr/bin/env tsx
import { db } from './client';
import { adviceTemplates, combinationRules } from './schema';

async function seedAdviceTemplates() {
    console.log('🌱 Seeding advice templates...\n');

    // 十大主星 × カテゴリ のアドバイステンプレート
    const tenStarAdvice = [
        // 貫索星
        { category: 'work', elementType: 'ten_star', elementName: '貫索星', template: '独立心が強く、自分の信念を貫く力があります。フリーランスや起業など、自分の裁量で仕事ができる環境が最適です。' },
        { category: 'love', elementType: 'ten_star', elementName: '貫索星', template: '自立した関係を好みます。お互いの個性を尊重し、適度な距離感を保つことで良好な関係が築けます。' },
        { category: 'family', elementType: 'ten_star', elementName: '貫索星', template: '家族に対しても自分の意見をしっかり持ちます。押し付けず、対等な関係を心がけましょう。' },

        // 石門星
        { category: 'work', elementType: 'ten_star', elementName: '石門星', template: 'チームワークを重視し、協調性に優れています。組織の中で調整役として活躍できます。' },
        { category: 'love', elementType: 'ten_star', elementName: '石門星', template: '友情から始まる恋愛が向いています。共通の趣味や価値観を大切にする関係が理想的です。' },
        { category: 'family', elementType: 'ten_star', elementName: '石門星', template: '家族の絆を大切にし、みんなで協力することを好みます。家族会議などで意見を出し合いましょう。' },

        // 鳳閣星
        { category: 'work', elementType: 'ten_star', elementName: '鳳閣星', template: '表現力豊かで、クリエイティブな仕事が向いています。楽観的な性格を活かして、明るい職場を作れます。' },
        { category: 'love', elementType: 'ten_star', elementName: '鳳閣星', template: '楽しい時間を共有できる相手を求めます。デートは楽しさ重視で、笑顔の絶えない関係を築けます。' },
        { category: 'family', elementType: 'ten_star', elementName: '鳳閣星', template: '家庭を明るく楽しい場所にする才能があります。家族との時間を大切にし、笑いの絶えない家庭を。' },

        // 調舒星
        { category: 'work', elementType: 'ten_star', elementName: '調舒星', template: '繊細な感性を持ち、芸術的な仕事に適性があります。完璧主義なので、質の高い仕事ができます。' },
        { category: 'love', elementType: 'ten_star', elementName: '調舒星', template: '感受性が強く、相手の気持ちを深く理解します。ロマンチックな雰囲気を大切にする恋愛が向いています。' },
        { category: 'family', elementType: 'ten_star', elementName: '調舒星', template: '家族の感情の変化に敏感です。繊細な心を理解してもらえる環境を作りましょう。' },

        // 禄存星
        { category: 'work', elementType: 'ten_star', elementName: '禄存星', template: '現実的で経済観念が優れています。ビジネスや財務関係の仕事で成功しやすいです。' },
        { category: 'love', elementType: 'ten_star', elementName: '禄存星', template: '安定した関係を求めます。経済的な基盤がしっかりした相手との結婚が理想的です。' },
        { category: 'family', elementType: 'ten_star', elementName: '禄存星', template: '家計管理が得意で、家族の経済的安定を重視します。計画的な生活を心がけましょう。' },

        // 司禄星
        { category: 'work', elementType: 'ten_star', elementName: '司禄星', template: '堅実で責任感が強く、管理職や事務職に向いています。コツコツと積み上げる仕事で成果を出せます。' },
        { category: 'love', elementType: 'ten_star', elementName: '司禄星', template: '誠実で真面目な恋愛を好みます。長く安定した関係を築くことができます。' },
        { category: 'family', elementType: 'ten_star', elementName: '司禄星', template: '家族の安定と安心を第一に考えます。規則正しい生活リズムを大切にしましょう。' },

        // 車騎星
        { category: 'work', elementType: 'ten_star', elementName: '車騎星', template: '行動力があり、競争の激しい環境で力を発揮します。営業や勝負の世界で成功しやすいです。' },
        { category: 'love', elementType: 'ten_star', elementName: '車騎星', template: '情熱的で積極的なアプローチをします。刺激的な恋愛を求める傾向があります。' },
        { category: 'family', elementType: 'ten_star', elementName: '車騎星', template: '家族のために積極的に行動します。時には落ち着いて家族の声に耳を傾けることも大切です。' },

        // 牽牛星
        { category: 'work', elementType: 'ten_star', elementName: '牽牛星', template: 'プライドが高く、専門性を追求します。技術職や専門職で高い評価を得られます。' },
        { category: 'love', elementType: 'ten_star', elementName: '牽牛星', template: '理想が高く、相手に完璧を求めがちです。相手の長所を認めることで良い関係が築けます。' },
        { category: 'family', elementType: 'ten_star', elementName: '牽牛星', template: '家族にも高い基準を求めます。完璧を求めすぎず、ありのままを受け入れる心を。' },

        // 龍高星
        { category: 'work', elementType: 'ten_star', elementName: '龍高星', template: '好奇心旺盛で、新しいことに挑戦する仕事が向いています。変化を恐れず、革新的なアイデアを出せます。' },
        { category: 'love', elementType: 'ten_star', elementName: '龍高星', template: '自由な恋愛を好み、束縛を嫌います。お互いの自由を尊重できる関係が理想的です。' },
        { category: 'family', elementType: 'ten_star', elementName: '龍高星', template: '家族にも自由を求めます。型にはまらない、開放的な家庭環境を作りましょう。' },

        // 玉堂星
        { category: 'work', elementType: 'ten_star', elementName: '玉堂星', template: '知的で学問好きです。研究職や教育関係の仕事で才能を発揮できます。' },
        { category: 'love', elementType: 'ten_star', elementName: '玉堂星', template: '知性を重視し、知的な会話を楽しめる相手を求めます。精神的なつながりを大切にします。' },
        { category: 'family', elementType: 'ten_star', elementName: '玉堂星', template: '家族の教育を重視します。学びの機会を大切にし、知的な家庭環境を作りましょう。' },
    ];

    // 十二運 × カテゴリ のアドバイステンプレート
    const twelveUnAdvice = [
        // 長生
        { category: 'work', elementType: 'twelve_un', elementName: '長生', template: '成長期のエネルギーがあります。新しいプロジェクトや学びに最適な時期です。' },
        { category: 'love', elementType: 'twelve_un', elementName: '長生', template: '新しい出会いに恵まれやすい時期です。フレッシュな気持ちで恋愛を楽しめます。' },
        { category: 'family', elementType: 'twelve_un', elementName: '長生', template: '家族関係が成長する時期です。新しい家族の形を築くのに適しています。' },

        // 沐浴
        { category: 'work', elementType: 'twelve_un', elementName: '沐浴', template: '変化の時期です。柔軟に対応することで、新しいチャンスをつかめます。' },
        { category: 'love', elementType: 'twelve_un', elementName: '沐浴', template: '感情が揺れ動きやすい時期です。冷静さを保ちながら、関係を深めましょう。' },
        { category: 'family', elementType: 'twelve_un', elementName: '沐浴', template: '家族関係に変化が訪れる時期です。コミュニケーションを大切にしましょう。' },

        // 冠帯
        { category: 'work', elementType: 'twelve_un', elementName: '冠帯', template: '社会デビューの時期です。積極的に活動することで、大きな成果を得られます。' },
        { category: 'love', elementType: 'twelve_un', elementName: '冠帯', template: '恋愛運が上昇する時期です。自信を持ってアプローチしましょう。' },
        { category: 'family', elementType: 'twelve_un', elementName: '冠帯', template: '家族の中で存在感を発揮できる時期です。リーダーシップを取りましょう。' },

        // 建禄
        { category: 'work', elementType: 'twelve_un', elementName: '建禄', template: '最も安定した時期です。着実に成果を積み上げることができます。' },
        { category: 'love', elementType: 'twelve_un', elementName: '建禄', template: '安定した恋愛関係を築ける時期です。結婚を考えるのに最適です。' },
        { category: 'family', elementType: 'twelve_un', elementName: '建禄', template: '家庭が安定する時期です。家族との絆を深めることができます。' },

        // 帝旺
        { category: 'work', elementType: 'twelve_un', elementName: '帝旺', template: 'エネルギーの頂点です。大きな挑戦をするのに最適な時期です。' },
        { category: 'love', elementType: 'twelve_un', elementName: '帝旺', template: '情熱的な恋愛ができる時期です。積極的に行動しましょう。' },
        { category: 'family', elementType: 'twelve_un', elementName: '帝旺', template: '家族のために力を発揮できる時期です。リーダーシップを取りましょう。' },

        // 衰
        { category: 'work', elementType: 'twelve_un', elementName: '衰', template: 'エネルギーが落ち着く時期です。無理せず、質を重視した仕事を心がけましょう。' },
        { category: 'love', elementType: 'twelve_un', elementName: '衰', template: '落ち着いた恋愛が向いています。相手との深い絆を大切にしましょう。' },
        { category: 'family', elementType: 'twelve_un', elementName: '衰', template: '家族との静かな時間を大切にする時期です。ゆっくり過ごしましょう。' },

        // 病
        { category: 'work', elementType: 'twelve_un', elementName: '病', template: '無理は禁物です。健康管理を優先し、できる範囲で仕事をしましょう。' },
        { category: 'love', elementType: 'twelve_un', elementName: '病', template: '相手に甘えることも大切です。支え合う関係を築きましょう。' },
        { category: 'family', elementType: 'twelve_un', elementName: '病', template: '家族のサポートを受け入れる時期です。無理せず休息を取りましょう。' },

        // 死
        { category: 'work', elementType: 'twelve_un', elementName: '死', template: '活動を控える時期です。次のステップに向けて準備をしましょう。' },
        { category: 'love', elementType: 'twelve_un', elementName: '死', template: '関係を見直す時期です。本当に大切なものを見極めましょう。' },
        { category: 'family', elementType: 'twelve_un', elementName: '死', template: '家族との関係を静かに見つめ直す時期です。' },

        // 墓
        { category: 'work', elementType: 'twelve_un', elementName: '墓', template: '蓄積と準備の時期です。知識やスキルを磨きましょう。' },
        { category: 'love', elementType: 'twelve_un', elementName: '墓', template: '内面を磨く時期です。自分を高めることで、良い出会いにつながります。' },
        { category: 'family', elementType: 'twelve_un', elementName: '墓', template: '家族の歴史や伝統を大切にする時期です。' },

        // 絶
        { category: 'work', elementType: 'twelve_un', elementName: '絶', template: '最も弱い時期ですが、新しい始まりの前触れです。焦らず待ちましょう。' },
        { category: 'love', elementType: 'twelve_un', elementName: '絶', template: '無理に動かず、自然な流れに任せましょう。' },
        { category: 'family', elementType: 'twelve_un', elementName: '絶', template: '家族との静かな時間を大切にしましょう。' },

        // 胎
        { category: 'work', elementType: 'twelve_un', elementName: '胎', template: '新しい芽生えの時期です。小さな一歩から始めましょう。' },
        { category: 'love', elementType: 'twelve_un', elementName: '胎', template: '新しい恋の予感がある時期です。期待を持って過ごしましょう。' },
        { category: 'family', elementType: 'twelve_un', elementName: '胎', template: '新しい家族の形が芽生える時期です。' },

        // 養
        { category: 'work', elementType: 'twelve_un', elementName: '養', template: '育成期です。じっくりと力を蓄えることが大切です。' },
        { category: 'love', elementType: 'twelve_un', elementName: '養', template: '関係を育てる時期です。焦らず、ゆっくり深めていきましょう。' },
        { category: 'family', elementType: 'twelve_un', elementName: '養', template: '家族を育む時期です。愛情を注ぎましょう。' },
    ];

    // Insert all templates
    console.log(`Inserting ${tenStarAdvice.length} ten star advice templates...`);
    await db.insert(adviceTemplates).values(tenStarAdvice);

    console.log(`Inserting ${twelveUnAdvice.length} twelve un advice templates...`);
    await db.insert(adviceTemplates).values(twelveUnAdvice);

    console.log('\n✅ Advice templates seeded!');
}

seedAdviceTemplates().catch(console.error);
