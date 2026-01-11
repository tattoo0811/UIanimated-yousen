const fs = require('fs');
const yaml = require('js-yaml');

// YAML読み込み
const yamlContent = fs.readFileSync('/Users/kitamuratatsuhiko/UIanimated/analytics-data/character-tokuchou.yaml', 'utf8');
const data = yaml.load(yamlContent);

// 五行マッピング
const elementMap = {
    '木': 'wood',
    '火': 'fire',
    '土': 'earth',
    '金': 'metal',
    '水': 'water'
};

// アイコンマッピング（五行に基づく）
const iconMap = {
    'wood': ['🌳', '🌿', '🌸', '🌷', '🌱', '🍃'],
    'fire': ['☀️', '🔥', '🕯️', '💡', '🌟', '✨'],
    'earth': ['⛰️', '🏔️', '🌄', '🏯', '🌻', '🏺'],
    'metal': ['⚔️', '💎', '✨', '🗡️', '🛡️', '💫'],
    'water': ['🌊', '💧', '⛲', '🚣', '🐋', '🌧️']
};

// カラーマッピング
const colorMap = {
    'wood': '#A3E635',
    'fire': '#FB7185',
    'earth': '#FACC15',
    'metal': '#E2E8F0',
    'water': '#60A5FA'
};

// 現代風に短縮
function modernize(text) {
    return text
        .replace(/「(.+?)」/g, '$1')
        .replace(/を発動し、/g, '→')
        .replace(/を宿し、/g, '→')
        .replace(/を内包し、/g, '→')
        .replace(/を背負い、/g, '→')
        .replace(/という/g, '')
        .replace(/によって/g, 'で')
        .replace(/することで/g, 'して')
        .replace(/。/g, '！')
        .substring(0, 50);
}

// 短い名前を生成
function getShortName(name) {
    return name.length > 6 ? name.substring(0, 6) : name;
}

// JSONに変換
const types = data.map((item, index) => {
    const primary = elementMap[item.attributes.primary] || 'earth';
    const secondary = elementMap[item.attributes.secondary] || primary;

    // アイコン選択（indexに基づいてローテーション）
    const iconArray = iconMap[primary];
    const icon = iconArray[index % iconArray.length];

    // personalityを現代風に
    const personality = item.features.slice(0, 4).map(f => modernize(f));

    // conceptを短く
    const concept = item.concept.substring(0, 60) + (item.concept.length > 60 ? '...' : '');

    return {
        id: index + 1,
        kanshi: item.kanshi.split(' ')[1].replace(/[()]/g, ''),
        reading: item.kanshi.split(' ')[2]?.replace(/[()]/g, '') || '',
        name: item.character_name,
        shortName: getShortName(item.character_name),
        icon: icon,
        element: primary,
        secondary: secondary,
        color: colorMap[primary],
        concept: concept,
        personality: personality,
        strengths: personality[0]?.replace(/[→！]/g, '') || '未定義',
        weaknesses: personality[1]?.replace(/[→！]/g, '') || '未定義',
        luckyColor: ['グリーン', 'レッド', 'イエロー', 'シルバー', 'ブルー'][['wood', 'fire', 'earth', 'metal', 'water'].indexOf(primary)],
        luckyItem: ['観葉植物', 'キャンドル', '陶器', 'アクセサリー', '万年筆'][['wood', 'fire', 'earth', 'metal', 'water'].indexOf(primary)],
        advice: item.features[item.features.length - 1]?.substring(3, 60) || 'あなたらしく生きよう！'
    };
});

// JSON出力
const output = {
    formatVersion: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    description: '60干支タイプ - 現代風ポップバージョン',
    types: types
};

fs.writeFileSync(
    '/Users/kitamuratatsuhiko/UIanimated/mobile/src/data/kanshi-types.json',
    JSON.stringify(output, null, 2),
    'utf8'
);

console.log(`✅ 60干支データ変換完了！`);
console.log(`📦 出力: src/data/kanshi-types.json`);
console.log(`📊 タイプ数: ${types.length}`);
