// 配置を変えて再検証
// 可能性1：右手と胸が逆
// 可能性2：左手の計算方法が違う（年干を使う？）

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

const dayStem = 7; // 辛

const yearStem = 9; // 癸
const monthStem = 6; // 庚
const yearHidden = 4; // 戊（年支の蔵干）
const monthHidden = 4; // 戊（月支の蔵干）
const dayHidden = 3; // 丁（日支の蔵干）

const ELEMENTS = ['木', '火', '土', '金', '水'];

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

function getElement(stem) {
    return Math.floor(stem / 2);
}

function isYang(stem) {
    return stem % 2 === 0;
}

function getStar(dayStem, targetStem) {
    const dElem = getElement(dayStem);
    const tElem = getElement(targetStem);
    const dYang = isYang(dayStem);
    const tYang = isYang(targetStem);

    const rel = (tElem - dElem + 5) % 5;
    const polarity = dYang === tYang ? 'same' : 'diff';

    return TEN_STARS_BY_REL[`${rel}-${polarity}`];
}

console.log('=== 配置パターンの検証 ===\n');

// パターン1：標準配置
console.log('【パターン1：標準配置】');
console.log('頭（年干）：', getStar(dayStem, yearStem));
console.log('右手（月干）：', getStar(dayStem, monthStem));
console.log('左手（年支蔵干）：', getStar(dayStem, yearHidden));
console.log('胸（月支蔵干）：', getStar(dayStem, monthHidden));
console.log('腹（日支蔵干）：', getStar(dayStem, dayHidden));

console.log('\n【期待値】');
console.log('頭：鳳閣星');
console.log('右手：車騎星');
console.log('左手：司禄星');
console.log('胸：玉堂星');
console.log('腹：石門星');

// パターン2：右手と胸を入れ替え
console.log('\n【パターン2：右手=月支蔵干、胸=月干】');
console.log('頭（年干）：', getStar(dayStem, yearStem));
console.log('右手（月支蔵干）：', getStar(dayStem, monthHidden));
console.log('左手（年支蔵干）：', getStar(dayStem, yearHidden));
console.log('胸（月干）：', getStar(dayStem, monthStem));
console.log('腹（日支蔵干）：', getStar(dayStem, dayHidden));

// パターン3：左手=年干
console.log('\n【パターン3：左手=年干】');
console.log('頭（年干）：', getStar(dayStem, yearStem));
console.log('右手（月干）：', getStar(dayStem, monthStem));
console.log('左手（年干）：', getStar(dayStem, yearStem));
console.log('胸（月支蔵干）：', getStar(dayStem, monthHidden));
console.log('腹（日支蔵干）：', getStar(dayStem, dayHidden));

// パターン4：右手=日支蔵干、腹=月干
console.log('\n【パターン4：別の配置】');
console.log('頭（年干）：', getStar(dayStem, yearStem));
console.log('右手（日支蔵干）：', getStar(dayStem, dayHidden));
console.log('左手（年支蔵干）：', getStar(dayStem, yearHidden));
console.log('胸（月支蔵干）：', getStar(dayStem, monthHidden));
console.log('腹（月干）：', getStar(dayStem, monthStem));

// パターン5：完全に配置を変える
// 車騎星を出すには：官・同陰陽が必要
// 日干=辛（金陰）から車騎星を出すには：ターゲットが火陰（丁）
// 司禄星を出すには：財・異陰陽が必要  
// 日干=辛（金陰）から司禄星を出すには：ターゲットが木陽（甲）
// 石門星を出すには：比和・異陰陽
// 日干=辛（金陰）から石門星を出すには：ターゲットが金陽（庚）

console.log('\n【逆算による配置】');
console.log('車騎星が出る相手：火陰（丁）→ 日支蔵干（丁）が右手？');
console.log('司禄星が出る相手：木陽（甲）→ ???');
console.log('石門星が出る相手：金陽（庚）→ 月干（庚）が腹？');

console.log('\n【パターン5：逆算配置】');
console.log('頭（年干 癸）：', getStar(dayStem, yearStem));  // 鳳閣星
console.log('右手（日支蔵干 丁）：', getStar(dayStem, dayHidden)); // 車騎星
console.log('胸（月支蔵干 戊）：', getStar(dayStem, monthHidden)); // 玉堂星
console.log('腹（月干 庚）：', getStar(dayStem, monthStem)); // 石門星
console.log('左手（？）：司禄星を出すには甲が必要');

// 亥の完全な蔵干を確認
console.log('\n【亥の蔵干】');
const 亥蔵干 = ['壬', '甲']; // 壬が主気、甲が余気
const 甲Index = 0;
console.log('左手（年支蔵干の副気 甲）：', getStar(dayStem, 甲Index)); // 司禄星?
