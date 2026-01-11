// 1983-08-11 の陽占命式を検証
// 画像から読み取ったデータ：
// 年：癸亥、月：庚申、日：辛未

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 日干：辛 (index 7, 金の陰)
const dayStem = 7; // 辛

// 各柱のデータ
const bazi = {
    year: { stem: 9, branch: 11 }, // 癸亥
    month: { stem: 6, branch: 8 }, // 庚申
    day: { stem: 7, branch: 7 }    // 辛未
};

// 蔵干（本気）のルール確認
// 画像では：亥→戊、申→戊、未→丁
// 標準的な蔵干の「本気」：
// 亥：壬（本気）
// 申：庚（本気）
// 未：己（本気）

// しかし画像では違う値。特別なルールがあるかもしれない。
// 一旦、画像の値を使って十大主星を逆算する

// 蔵干の値（画像から）
const yearHidden = 4; // 戊
const monthHidden = 4; // 戊  
const dayHidden = 3; // 丁

// 期待される陽占命式：
// 頭（年干 癸）：鳳閣星
// 胸（月支蔵干 戊）：玉堂星
// 腹（日支蔵干 丁）：石門星
// 右手（月干 庚）：車騎星
// 左手（年支蔵干 戊）：司禄星

console.log('=== 1983-08-11 陽占命式 検証 ===\n');
console.log('日干：辛 (金の陰)\n');

// 五行と陰陽の関係
function getElement(stem) {
    return Math.floor(stem / 2); // 0=Wood, 1=Fire, 2=Earth, 3=Metal, 4=Water
}

function isYang(stem) {
    return stem % 2 === 0;
}

const ELEMENTS = ['木', '火', '土', '金', '水'];

// 十大主星の計算
const TEN_STARS_BY_REL = {
    '0-same': '貫索星',
    '0-diff': '石門星',
    '1-same': '鳳閣星',
    '1-diff': '調舒星',
    '2-same': '禄存星',
    '2-diff': '司禄星',
    '3-same': '車騎星',
    '3-diff': '牽牛星',
    '4-same': '龍高星',
    '4-diff': '玉堂星'
};

function analyzeRelationship(dayStem, targetStem) {
    const dElem = getElement(dayStem);
    const tElem = getElement(targetStem);
    const dYang = isYang(dayStem);
    const tYang = isYang(targetStem);

    // 五行相生相剋の関係
    const rel = (tElem - dElem + 5) % 5;
    const polarity = dYang === tYang ? 'same' : 'diff';

    const star = TEN_STARS_BY_REL[`${rel}-${polarity}`];

    console.log(`${STEMS[targetStem]} (${ELEMENTS[tElem]}${tYang ? '陽' : '陰'}):`, star);
    console.log(`  関係: ${rel} (${['比和', '洩気', '財', '官', '印'][rel]}), 陰陽: ${polarity}`);

    return { star, rel, polarity };
}

console.log('--- 期待される結果 ---');
console.log('頭（年干 癸）：鳳閣星');
console.log('右手（月干 庚）：車騎星');
console.log('胸（月支蔵干 戊）：玉堂星');
console.log('左手（年支蔵干 戊）：司禄星');
console.log('腹（日支蔵干 丁）：石門星\n');

console.log('--- 計算結果 ---');
console.log('頭（年干 癸）：');
const head = analyzeRelationship(dayStem, bazi.year.stem);

console.log('\n右手（月干 庚）：');
const rightHand = analyzeRelationship(dayStem, bazi.month.stem);

console.log('\n胸（月支蔵干 戊）：');
const chest = analyzeRelationship(dayStem, monthHidden);

console.log('\n左手（年支蔵干 戊）：');
const leftHand = analyzeRelationship(dayStem, yearHidden);

console.log('\n腹（日支蔵干 丁）：');
const belly = analyzeRelationship(dayStem, dayHidden);
