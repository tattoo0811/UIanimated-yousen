/**
 * shohousen-all-60.html から処方箋データを抽出してJSON化
 */

const fs = require('fs');
const path = require('path');

// HTMLを読み込む
const htmlPath = path.join(__dirname, '../shohousen-all-60.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// 処方箋データ格納用配列
const allPrescriptions = [];

// カードを分割 - "rx-card"で分割（activeクラスにも対応）
const parts = html.split(/<div class="rx-card/);

// 天干から元素を判定する関数（十干の五行属性）
function getElementFromKan(kan) {
  const kanElementMap = {
    '甲': 'wood',   // きのえ
    '乙': 'wood',   // きのと
    '丙': 'fire',   // ひのえ
    '丁': 'fire',   // ひのと
    '戊': 'earth',  // つちのえ
    '己': 'earth',  // つちのと
    '庚': 'metal',  // かのえ
    '辛': 'metal',  // かのと
    '壬': 'water',  // みずのえ
    '癸': 'water'   // みずのと
  };
  return kanElementMap[kan] || '';
}

// 最初の要素はカードではないのでスキップ（インデックス1から開始）
for (let i = 1; i < parts.length; i++) {
  const part = parts[i];

  // HTML全体を再構築（activeクラス等を保持）
  let cardHtml = '<div class="rx-card' + part;

  // cardIdを抽出
  const cardIdMatch = cardHtml.match(/id="([^"]+)"/);
  const cardId = cardIdMatch ? cardIdMatch[1] : '';

  // キャラクター名
  const characterNameMatch = cardHtml.match(/<div class="rx-patient-name">([^<]+)<\/div>/);
  const characterName = characterNameMatch ? characterNameMatch[1].trim() : '';

  // 干支情報
  const kanshiInfoMatch = cardHtml.match(/<div class="rx-kanshi-info">([^<]+)\s*No\.(\d+)\s*──\s*([^<]+)<\/div>/);
  const kanshi = kanshiInfoMatch ? kanshiInfoMatch[1].trim() : '';
  const number = kanshiInfoMatch ? parseInt(kanshiInfoMatch[2]) : 0;
  const elementRaw = kanshiInfoMatch ? kanshiInfoMatch[3].trim() : '';

  // 天干から元素を判定（正しい五行属性）
  const kan = kanshi.charAt(0); // 干支の最初の文字（天干）
  const element = getElementFromKan(kan);

  // 病名
  const diseaseNameMatch = cardHtml.match(/<div class="rx-disease-name">([^<]+)<\/div>/);
  const diseaseName = diseaseNameMatch ? diseaseNameMatch[1].trim() : '';

  // 病名サブタイトル
  const diseaseSubMatch = cardHtml.match(/<div class="rx-disease-sub">([^<]+)<\/div>/);
  const diseaseSubtitle = diseaseSubMatch ? diseaseSubMatch[1].replace(/^別名：/, '').trim() : '';

  // 症状
  const symptoms = [];
  const symptomSection = cardHtml.match(/<ul class="rx-symptom-list">([\s\S]*?)<\/ul>/);
  if (symptomSection) {
    const symptomRegex = /<li>([^<]+)<\/li>/g;
    let symptomMatch;
    while ((symptomMatch = symptomRegex.exec(symptomSection[1])) !== null) {
      symptoms.push(symptomMatch[1].trim());
    }
  }

  // 処方（WORK, LOVE, HOME）
  let prescriptionWork = '';
  let prescriptionLove = '';
  let prescriptionFamily = '';

  // WORKを抽出
  const workMatch = cardHtml.match(/<span class="rx-cat-label">WORK<\/span>\s*<span class="rx-prescription-text">([^<]+)<\/span>/);
  if (workMatch) prescriptionWork = workMatch[1].trim();

  // LOVEを抽出（love-catクラス対応）
  const loveMatch = cardHtml.match(/<span class="rx-cat-label\s+love-cat">LOVE<\/span>\s*<span class="rx-prescription-text">([^<]+)<\/span>/);
  if (loveMatch) prescriptionLove = loveMatch[1].trim();

  // HOMEを抽出
  const homeMatch = cardHtml.match(/<span class="rx-cat-label">HOME<\/span>\s*<span class="rx-prescription-text">([^<]+)<\/span>/);
  if (homeMatch) prescriptionFamily = homeMatch[1].trim();

  // 用法・用量
  const dosageMatch = cardHtml.match(/<div class="rx-dosage-content">([^<]+(?:<div class="rx-dosage-note">[\s\S]*?<\/div>)?)<\/div>/);
  const dosage = dosageMatch ? dosageMatch[1].replace(/<div class="rx-dosage-note">[\s\S]*?<\/div>/g, '').replace(/<[^>]+>/g, ' ').trim() : '';

  // 副作用
  const sideEffects = [];
  const sideEffectSection = cardHtml.match(/<ul class="rx-sideeffect-list">([\s\S]*?)<\/ul>/);
  if (sideEffectSection) {
    const sideEffectRegex = /<li>([^<]+)<\/li>/g;
    let sideEffectMatch;
    while ((sideEffectMatch = sideEffectRegex.exec(sideEffectSection[1])) !== null) {
      sideEffects.push(sideEffectMatch[1].trim());
    }
  }

  // 禁忌
  const contraindications = [];
  const contraSection = cardHtml.match(/<div class="rx-contra-block">([\s\S]*?)<\/div>/);
  if (contraSection) {
    const contraRegex = /<p>([^<]+)<\/p>/g;
    let contraMatch;
    while ((contraMatch = contraRegex.exec(contraSection[1])) !== null) {
      contraindications.push(contraMatch[1].replace(/⚠\s*/g, '').trim());
    }
  }

  allPrescriptions.push({
    cardId,
    number,
    kanshi,
    characterName,
    element,
    diseaseName,
    diseaseSubtitle,
    symptoms,
    prescriptionWork,
    prescriptionLove,
    prescriptionFamily,
    dosage,
    sideEffects,
    contraindications
  });
}

// 干支順にソート
const kanshiOrder = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'];

allPrescriptions.sort((a, b) => {
  const indexA = kanshiOrder.indexOf(a.kanshi);
  const indexB = kanshiOrder.indexOf(b.kanshi);
  return indexA - indexB;
});

// jsonsディレクトリを確認
const jsonsDir = path.join(__dirname, '../jsons');
if (!fs.existsSync(jsonsDir)) {
  fs.mkdirSync(jsonsDir, { recursive: true });
}

// JSONとして出力
const outputPath = path.join(jsonsDir, 'prescriptions-all-60.json');
fs.writeFileSync(outputPath, JSON.stringify(allPrescriptions, null, 2), 'utf-8');

console.log(`\n✅ ${allPrescriptions.length}件の処方箋データを抽出しました`);
console.log(`📁 出力先: ${outputPath}\n`);

// 要約統計
const elementCounts = allPrescriptions.reduce((acc, p) => {
  acc[p.element] = (acc[p.element] || 0) + 1;
  return acc;
}, {});

console.log('📊 元素別カウント:');
Object.entries(elementCounts).forEach(([elem, count]) => {
  console.log(`   ${elem}: ${count}件`);
});

// 各元素の詳細を表示
const elementNames = {
  'wood': '木',
  'fire': '火',
  'earth': '土',
  'metal': '金',
  'water': '水'
};

console.log('\n📋 元素別干支リスト:');
['wood', 'fire', 'earth', 'metal', 'water'].forEach(elem => {
  const items = allPrescriptions.filter(p => p.element === elem);
  console.log(`\n   ${elementNames[elem]} (${items.length}件):`);
  items.slice(0, 12).forEach(p => {
    console.log(`      ${p.kanshi}: ${p.characterName}`);
  });
});

console.log('\n🔍 サンプル（最初の5件）:');
allPrescriptions.slice(0, 5).forEach(p => {
  const workStatus = p.prescriptionWork ? '✓' : '✗';
  const loveStatus = p.prescriptionLove ? '✓' : '✗';
  const homeStatus = p.prescriptionFamily ? '✓' : '✗';
  console.log(`   ${p.kanshi}: ${p.characterName} [${workStatus}${loveStatus}${homeStatus}] (${elementNames[p.element]})`);
});

// データ品質チェック
const emptyData = allPrescriptions.filter(p =>
  !p.prescriptionWork || !p.prescriptionLove || !p.prescriptionFamily
);

if (emptyData.length > 0) {
  console.log(`\n⚠️  ${emptyData.length}件の処方箋に空データがあります`);
  emptyData.slice(0, 10).forEach(p => {
    const missing = [];
    if (!p.prescriptionWork) missing.push('WORK');
    if (!p.prescriptionLove) missing.push('LOVE');
    if (!p.prescriptionFamily) missing.push('HOME');
    console.log(`   ${p.kanshi}: ${p.characterName} (${missing.join(', ')})`);
  });
} else {
  console.log('\n✅ すべての処方箋データが完全です');
}

// 元素カウントの検証
const expectedCounts = { wood: 12, fire: 12, earth: 12, metal: 12, water: 12 };
const allCorrect = Object.entries(expectedCounts).every(([elem, count]) =>
  elementCounts[elem] === count
);

if (allCorrect) {
  console.log('\n✅ 元素カウントが正しいです（各元素12件ずつ）');
} else {
  console.log('\n⚠️  元素カウントに不整合があります');
  Object.entries(expectedCounts).forEach(([elem, expected]) => {
    const actual = elementCounts[elem] || 0;
    if (actual !== expected) {
      console.log(`   ${elementNames[elem]}: 期待=${expected}, 実際=${actual}`);
    }
  });
}

// 甲子が含まれているか確認
const koushi = allPrescriptions.find(p => p.kanshi === '甲子');
if (koushi) {
  console.log('\n✅ 甲子（水辺の賢者）が正常に抽出されました');
  console.log(`   元素: ${elementNames[koushi.element]} (天干: ${koushi.kanshi.charAt(0)})`);
} else {
  console.log('\n⚠️  甲子が抽出されていません');
}
