/**
 * 処方箋データをscreen-shohousen.htmlに統合するスクリプト
 */

const fs = require('fs');
const path = require('path');

// 処方箋データを読み込む
const prescriptionsPath = path.join(__dirname, '../jsons/prescriptions-all-60.json');
const prescriptionsData = JSON.parse(fs.readFileSync(prescriptionsPath, 'utf-8'));

// 元素の日本語マッピング
const elementMap = {
  'wood': '木',
  'fire': '火',
  'earth': '土',
  'metal': '金',
  'water': '水'
};

// 元素色マッピング
const elementColors = {
  'wood': '#2d5a27',
  'fire': '#c41e3a',
  'earth': '#8b7355',
  'metal': '#666',
  'water': '#2a4a6a'
};

// HTMLを読み込む
const htmlPath = path.join(__dirname, '../screen-shohousen.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// JavaScriptコードを生成
const jsCode = `
    <script>
    // =====================
    // 処方箋データ（60干支分）
    // =====================
    const prescriptionsData = ${JSON.stringify(prescriptionsData, null, 4)};

    // 元素マッピング
    const elementMap = ${JSON.stringify(elementMap, null, 4)};
    const elementColors = ${JSON.stringify(elementColors, null, 4)};

    // =====================
    // 初期化処理
    // =====================
    function initializePrescription() {
        // URLパラメータから干支を取得
        const urlParams = new URLSearchParams(window.location.search);
        const kanshiParam = urlParams.get('kanshi');

        if (kanshiParam) {
            // 干支が指定されている場合、対応する処方箋を表示
            const prescription = prescriptionsData.find(p => p.kanshi === kanshiParam);
            if (prescription) {
                updatePrescriptionCard(prescription);
            } else {
                console.error('干支が見つかりません:', kanshiParam);
                alert('干支「' + kanshiParam + '」のデータが見つかりませんでした');
            }
        } else {
            // 干支が指定されていない場合、デフォルトで甲子を表示
            const defaultPrescription = prescriptionsData.find(p => p.kanshi === '甲子');
            if (defaultPrescription) {
                updatePrescriptionCard(defaultPrescription);
            }
        }
    }

    // =====================
    // 処方箋カードを更新
    // =====================
    function updatePrescriptionCard(data) {
        // ヘッダー更新
        document.querySelector('.rx-number').textContent = 'No. ' + String(data.number).padStart(3, '0');
        document.querySelector('.rx-diagnosis-title').textContent = data.characterName;

        // 干支と五行
        const kanshiElements = document.querySelectorAll('.rx-element-value');
        kanshiElements[0].textContent = data.kanshi;
        kanshiElements[1].textContent = elementMap[data.element] || data.element;

        // 病名更新
        const diseaseNameEl = document.querySelector('.section-title-large');
        if (diseaseNameEl) {
            diseaseNameEl.textContent = data.diseaseName;
        }

        // 病状リスト更新
        const symptomList = document.querySelector('.symptom-list');
        if (symptomList && data.symptoms) {
            symptomList.innerHTML = data.symptoms.map(s => '<li>' + s + '</li>').join('');
        }

        // 処方リスト更新（WORK, LOVE, HOME）
        const prescriptionList = document.querySelector('.prescription-list');
        if (prescriptionList) {
            const prescriptionItems = [
                { category: '仕事', text: data.prescriptionWork },
                { category: '恋愛', text: data.prescriptionLove },
                { category: '家庭', text: data.prescriptionFamily }
            ].filter(item => item.text); // 空のデータを除外

            prescriptionList.innerHTML = prescriptionItems.map(item =>
                '<li><span class="category">【' + item.category + '】</span>' + item.text + '</li>'
            ).join('');
        }

        // 用法・用量
        const dosageContent = document.querySelector('.dosage-content');
        if (dosageContent && data.dosage) {
            dosageContent.textContent = data.dosage;
        }

        // 副作用
        const sideEffectSection = document.querySelector('.side-effects-section');
        if (sideEffectSection && data.sideEffects && data.sideEffects.length > 0) {
            const sideEffectList = sideEffectSection.querySelector('.side-effect-list');
            if (sideEffectList) {
                sideEffectList.innerHTML = data.sideEffects.map(s => '<li>' + s + '</li>').join('');
            }
            sideEffectSection.style.display = 'block';
        } else if (sideEffectSection) {
            sideEffectSection.style.display = 'none';
        }

        // 禁忌
        const contraindicationsSection = document.querySelector('.contraindications-section');
        if (contraindicationsSection && data.contraindications && data.contraindications.length > 0) {
            const contraindicationsList = contraindicationsSection.querySelector('.contraindications-list');
            if (contraindicationsList) {
                contraindicationsList.innerHTML = data.contraindications.map(c => '<li>' + c + '</li>').join('');
            }
            contraindicationsSection.style.display = 'block';
        } else if (contraindicationsSection) {
            contraindicationsSection.style.display = 'none';
        }

        // スタンプ更新（元素に応じた色）
        const rxStamp = document.querySelector('.rx-stamp');
        if (rxStamp) {
            const stampColor = elementColors[data.element] || '#c41e3a';
            rxStamp.style.color = stampColor;
            rxStamp.style.borderColor = stampColor;
        }
    }

    // =====================
    // 干支選択UI（オプション）
    // =====================
    function createKanshiSelector() {
        // 五行ごとに干支をグループ化
        const groupedData = {
            '木': prescriptionsData.filter(p => p.element === 'wood'),
            '火': prescriptionsData.filter(p => p.element === 'fire'),
            '土': prescriptionsData.filter(p => p.element === 'earth'),
            '金': prescriptionsData.filter(p => p.element === 'metal'),
            '水': prescriptionsData.filter(p => p.element === 'water')
        };

        // ドキュメントに追加するかは後で実装
        console.log('干支データ:', groupedData);
    }

    // =====================
    // ページ読み込み時に実行
    // =====================
    window.addEventListener('DOMContentLoaded', () => {
        initializePrescription();
        createKanshiSelector();
    });
    </script>
`;

// </body>の前にJavaScriptを挿入
html = html.replace('</body>', jsCode + '\n</body>');

// 出力
const outputPath = path.join(__dirname, '../screen-shohousen-complete.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log('\n✅ screen-shohousen-complete.htmlを作成しました');
console.log('📁 出力先:', outputPath);
console.log('');
console.log('🔗 使用方法:');
console.log('   ブラウザでHTMLファイルを開くと、デフォルトで甲子の処方箋が表示されます');
console.log('   URLパラメータで干支を指定できます:');
console.log('');
console.log('   例:');
console.log('   screen-shohousen-complete.html              # 甲子（デフォルト）');
console.log('   screen-shohousen-complete.html?kanshi=丙午  # 丙午');
console.log('   screen-shohousen-complete.html?kanshi=壬子  # 壬子');
console.log('');
console.log('📊 対応干支: ' + prescriptionsData.length + '件');
console.log('');
console.log('五行別内訳:');
const elementCounts = prescriptionsData.reduce((acc, p) => {
  acc[p.element] = (acc[p.element] || 0) + 1;
  return acc;
}, {});
Object.entries(elementCounts).forEach(([elem, count]) => {
  console.log('   ' + elem + ': ' + count + '件');
});
