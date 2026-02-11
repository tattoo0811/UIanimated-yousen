/**
 * screen-shohousen.htmlに処方箋データを埋め込むスクリプト
 */

const fs = require('fs');
const path = require('path');

// 処方箋データを読み込む
const prescriptionsPath = path.join(__dirname, '../jsons/prescriptions-all-60.json');
const prescriptionsData = JSON.parse(fs.readFileSync(prescriptionsPath, 'utf-8'));

// HTMLを読み込む
const htmlPath = path.join(__dirname, '../screen-shohousen.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// JavaScript定数として埋め込むデータを作成
const jsData = `    <script>
    // 処方箋データ（60干支分）
    const prescriptionsData = ${JSON.stringify(prescriptionsData, null, 6)};

    // URLパラメータから干支を取得して処方箋を表示
    function loadPrescription() {
        const urlParams = new URLSearchParams(window.location.search);
        const kanshi = urlParams.get('kanshi') || '甲子'; // デフォルト: 甲子

        const prescription = prescriptionsData.find(p => p.kanshi === kanshi);
        if (prescription) {
            updatePrescriptionCard(prescription);
        }
    }

    // 処方箋カードを更新
    function updatePrescriptionCard(data) {
        // 実装は既存のHTML構造に合わせて調整が必要
        console.log('処方箋データ:', data);
    }

    // ページ読み込み時に実行
    window.addEventListener('DOMContentLoaded', loadPrescription);
    </script>`;

// </body>の前にデータを挿入
html = html.replace('</body>', jsData + '\n</body>');

// 出力
const outputPath = path.join(__dirname, '../screen-shohousen-with-data.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log('✅ screen-shohousen-with-data.htmlを作成しました');
console.log('📁 出力先:', outputPath);
console.log('');
console.log('使用方法:');
console.log('  screen-shohousen-with-data.html?kanshi=甲子  # 甲子の処方箋を表示');
console.log('  screen-shohousen-with-data.html?kanshi=丙午  # 丙午の処方箋を表示');
console.log('');
console.log('対応干支（' + prescriptionsData.length + '件）:');
const sampleKanshi = prescriptionsData.slice(0, 10).map(p => p.kanshi).join(', ');
console.log('  ' + sampleKanshi + ', ...');
