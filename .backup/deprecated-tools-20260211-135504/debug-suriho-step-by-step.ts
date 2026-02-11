/**
 * 数理法エネルギー計算のステップバイステップデバッグ
 *
 * 特定の生年月日で計算プロセスを詳細に出力し、
 * どこで問題が発生しているかを特定する。
 */

import { calculateSanmei } from './sanmei-cli-suriho';

// デバッグ対象の生年月日
const debugDates = [
    '1983-12-01', // 最大値: 207点
    '2009-02-01', // 最小値: 90点
    '1995-06-15', // さくらの生年月日
    '1984-12-02', // 美咲の生年月日
    '1983-08-11', // 慧の生年月日
];

function debugSurihoCalculation(dateStr: string) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`生年月日: ${dateStr}`);
    console.log(`${'='.repeat(80)}\n`);

    const [y, m, d] = dateStr.split('-').map(Number);
    const result = calculateSanmei(y, m, d, 'male');

    // 陰占情報
    console.log('【陰占情報】');
    console.log(`年柱: ${result.insen.year.gan}${result.insen.year.shi} (蔵干: ${result.insen.year.zokan})`);
    console.log(`月柱: ${result.insen.month.gan}${result.insen.month.shi} (蔵干: ${result.insen.month.zokan})`);
    console.log(`日柱: ${result.insen.day.gan}${result.insen.day.shi} (蔵干: ${result.insen.day.zokan})`);

    // 宿命に含まれる十二支（重複を含む）
    const shiList = [
        result.insen.year.shi,
        result.insen.month.shi,
        result.insen.day.shi
    ];

    // 重複なしの十二支
    const shiSet = new Set(shiList);
    console.log(`\n宿命に含まれる十二支: ${shiList.join(', ')} (${shiList.length}個)`);
    console.log(`重複なし: ${Array.from(shiSet).join(', ')} (${shiSet.size}種類)`);

    // 十干の個数
    console.log('\n【十干の個数】');
    const ganCount = result.suriho.ganCount;
    Object.entries(ganCount).forEach(([gan, count]) => {
        if (count > 0) {
            console.log(`${gan}: ${count}個`);
        }
    });

    // 各十干の詳細スコア
    console.log('\n【各十干のスコア詳細】');

    const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    const JUSEI_ORDER = [
        { name: "天報星", sub: "胎", score: 3 },
        { name: "天印星", sub: "養", score: 6 },
        { name: "天貴星", sub: "長生", score: 9 },
        { name: "天恍星", sub: "沐浴", score: 7 },
        { name: "天南星", sub: "冠帯", score: 10 },
        { name: "天禄星", sub: "建禄", score: 11 },
        { name: "天将星", sub: "帝旺", score: 12 },
        { name: "天堂星", sub: "衰", score: 8 },
        { name: "天胡星", sub: "病", score: 4 },
        { name: "天極星", sub: "死", score: 2 },
        { name: "天庫星", sub: "墓", score: 5 },
        { name: "天馳星", sub: "絶", score: 1 }
    ];

    const TAI_INDEX: Record<string, number> = {
        "甲": 9, "乙": 8, "丙": 0, "丁": 11, "戊": 0,
        "己": 11, "庚": 3, "辛": 2, "壬": 6, "癸": 5
    };

    const IS_FORWARD_GAN: Record<string, boolean> = {
        "甲": true, "乙": false, "丙": true, "丁": false, "戊": true,
        "己": false, "庚": true, "辛": false, "壬": true, "癸": false
    };

    const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

    const getJunidaiJusei = (dayGan: string, shi: string) => {
        const shiIdx = SHI.indexOf(shi);
        const startShiIdx = TAI_INDEX[dayGan];
        const isForward = IS_FORWARD_GAN[dayGan];

        let distance;
        if (isForward) {
            distance = (shiIdx - startShiIdx + 12) % 12;
        } else {
            distance = (startShiIdx - shiIdx + 12) % 12;
        }
        return JUSEI_ORDER[distance];
    };

    let totalEnergy = 0;

    for (const gan of GAN) {
        const count = ganCount[gan];
        if (count === 0) continue;

        console.log(`\n${gan} (${count}個):`);

        let totalScore = 0;

        // 宿命の全ての十二支（重複を含む）に対して点数を計算
        for (const shi of shiList) {
            const jusei = getJunidaiJusei(result.insen.day.gan, shi);
            const score = jusei.score;
            totalScore += score;

            console.log(`  ${gan} × ${shi} = ${jusei.name} (${score}点)`);
        }

        const finalScore = totalScore * count;
        console.log(`  小計: ${totalScore}点 × ${count}個 = ${finalScore}点`);
        totalEnergy += finalScore;
    }

    // 五行別集計
    console.log('\n【五行別エネルギー】');
    console.log(`木: ${result.suriho.fiveElements.wood}点`);
    console.log(`火: ${result.suriho.fiveElements.fire}点`);
    console.log(`土: ${result.suriho.fiveElements.earth}点`);
    console.log(`金: ${result.suriho.fiveElements.metal}点`);
    console.log(`水: ${result.suriho.fiveElements.water}点`);

    // 総エネルギー
    console.log('\n【総エネルギー】');
    console.log(`計算値: ${totalEnergy}点`);
    console.log(`実装値: ${result.suriho.totalEnergy}点`);
    console.log(`一致: ${totalEnergy === result.suriho.totalEnergy ? '✓' : '✗'}`);

    // 排気口
    console.log('\n【排気口】');
    console.log(`初期: ${result.yousen.start.name} (${result.yousen.start.score}点)`);
    console.log(`中期: ${result.yousen.middle.name} (${result.yousen.middle.score}点)`);
    console.log(`晩期: ${result.yousen.end.name} (${result.yousen.end.score}点)`);
    console.log(`排気口: ${result.suriho.haikiko}点`);

    // 理論値との比較
    console.log('\n【理論値との比較】');
    console.log(`理論平均値: 200点`);
    console.log(`理論最大値: 343点`);
    console.log(`理論最小値: 64点`);
    console.log(`実測値: ${result.suriho.totalEnergy}点`);

    const diffFromAvg = result.suriho.totalEnergy - 200;
    const diffPercent = (diffFromAvg / 200 * 100).toFixed(1);
    console.log(`平均値との差異: ${diffFromAvg > 0 ? '+' : ''}${diffFromAvg}点 (${diffPercent}%)`);
}

// メイン処理
async function main() {
    console.log('=== 数理法エネルギー計算 ステップバイステップデバッグ ===\n');

    for (const date of debugDates) {
        debugSurihoCalculation(date);
    }

    console.log('\n=== デバッグ完了 ===\n');

    // 問題点の分析
    console.log('【問題点の分析】\n');
    console.log('1. 宿命に含まれる十二支の数が限定的（3種類のみ）');
    console.log('   → 年柱・月柱・日柱の十二支のみを使用');
    console.log('   → 理論上は「陰占内の全ての十二支」を使用すべき可能性');
    console.log('');
    console.log('2. 各十干のスコア計算で、十二支の数が限定的');
    console.log('   → 十干×十二支の組み合わせが最大でも3種類');
    console.log('   → 理論上は、より多くの組み合わせを考慮すべき可能性');
    console.log('');
    console.log('3. 十干の個数が最大6個');
    console.log('   → 年干・年蔵干・月干・月蔵干・日干・日蔵干');
    console.log('   → 理論上の最大値343点を達成するには不十分な可能性');
    console.log('');
    console.log('【推奨される対応】\n');
    console.log('1. 数理法の原著・参考資料を再確認する');
    console.log('2. 「宿命に含まれる十二支」の定義を確認する');
    console.log('3. 「十干×十二支の組み合わせ」の計算方法を確認する');
    console.log('4. 「十干の個数」のカウント方法を確認する');
}

main().catch(console.error);
