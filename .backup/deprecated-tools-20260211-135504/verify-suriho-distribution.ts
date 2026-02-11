/**
 * 数理法エネルギー値分布検証スクリプト - 詳細版
 *
 * ランダムな生年月日でエネルギー値の分布を確認し、
 * 最大値343点、平均値200点に近い値が出るかを検証する。
 */

import { calculateSanmei } from './sanmei-cli-suriho';

interface VerificationResult {
    date: string;
    gender: string;
    totalEnergy: number;
    haikiko: number;
    fiveElements: {
        wood: number;
        fire: number;
        earth: number;
        metal: number;
        water: number;
    };
}

interface Statistics {
    count: number;
    min: number;
    max: number;
    avg: number;
    median: number;
    stdDev: number;
}

// ランダムな生年月日を生成
function generateRandomDates(count: number, startYear: number = 1950, endYear: number = 2010): string[] {
    const dates: string[] = [];

    for (let i = 0; i < count; i++) {
        const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;

        dates.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }

    return dates;
}

// 統計情報を計算
function calculateStats(values: number[]): Statistics {
    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / count;

    // 中央値
    const median = count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];

    // 標準偏差
    const squaredDiffs = sorted.map(v => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / count;
    const stdDev = Math.sqrt(variance);

    return { count, min, max, avg, median, stdDev };
}

// 数理法を検証
async function verifySurihoDistribution(dates: string[], gender: string = 'male'): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];

    for (const date of dates) {
        try {
            const [y, m, d] = date.split('-').map(Number);
            const result = calculateSanmei(y, m, d, gender as 'male' | 'female');

            results.push({
                date,
                gender,
                totalEnergy: result.suriho.totalEnergy,
                haikiko: result.suriho.haikiko,
                fiveElements: result.suriho.fiveElements
            });
        } catch (error) {
            console.error(`Error calculating ${date}:`, error);
        }
    }

    return results;
}

// 分布を分析
function analyzeDistribution(results: VerificationResult[]): void {
    console.log('\n=== 数理法エネルギー値分布分析 ===\n');

    const energies = results.map(r => r.totalEnergy);
    const stats = calculateStats(energies);

    console.log('【統計サマリー】');
    console.log(`サンプル数: ${stats.count}`);
    console.log(`最小値: ${stats.min} 点`);
    console.log(`最大値: ${stats.max} 点`);
    console.log(`平均値: ${stats.avg.toFixed(2)} 点`);
    console.log(`中央値: ${stats.median} 点`);
    console.log(`標準偏差: ${stats.stdDev.toFixed(2)} 点`);
    console.log(`理論平均値: 200 点`);
    console.log(`理論最大値: 343 点`);
    console.log(`理論最小値: 64 点`);

    // 平均値の差異
    const avgDiff = stats.avg - 200;
    const avgDiffPercent = (avgDiff / 200 * 100);
    console.log(`\n平均値の差異: ${avgDiff.toFixed(2)} 点 (${avgDiffPercent.toFixed(1)}%)`);

    // 最大値の差異
    const maxDiff = stats.max - 343;
    const maxDiffPercent = (maxDiff / 343 * 100);
    console.log(`最大値の差異: ${maxDiff} 点 (${maxDiffPercent.toFixed(1)}%)`);

    // 分布を表示
    console.log('\n【エネルギー値の分布】');
    const buckets = [64, 100, 150, 200, 250, 300, 343];
    for (let i = 0; i < buckets.length - 1; i++) {
        const min = buckets[i];
        const max = buckets[i + 1];
        const count = energies.filter(e => e >= min && e < max).length;
        const percentage = (count / stats.count * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(count / 2));
        console.log(`${min}-${max} 点: ${count}件 (${percentage}%) ${bar}`);
    }

    // 150点以上の生年月日
    console.log('\n【150点以上の生年月日】');
    const highEnergy = results.filter(r => r.totalEnergy >= 150).sort((a, b) => b.totalEnergy - a.totalEnergy);
    console.log(`計 ${highEnergy.length}件 (${(highEnergy.length / stats.count * 100).toFixed(1)}%)`);

    if (highEnergy.length > 0) {
        console.log('\n上位20件:');
        highEnergy.slice(0, 20).forEach((r, i) => {
            console.log(`${i + 1}. ${r.date}: ${r.totalEnergy}点 (排気口: ${r.haikiko})`);
            console.log(`   木:${r.fiveElements.wood} 火:${r.fiveElements.fire} 土:${r.fiveElements.earth} 金:${r.fiveElements.metal} 水:${r.fiveElements.water}`);
        });
    }

    // 100点以下の生年月日
    console.log('\n【100点以下の生年月日】');
    const lowEnergy = results.filter(r => r.totalEnergy <= 100).sort((a, b) => a.totalEnergy - b.totalEnergy);
    console.log(`計 ${lowEnergy.length}件 (${(lowEnergy.length / stats.count * 100).toFixed(1)}%)`);

    if (lowEnergy.length > 0 && lowEnergy.length <= 30) {
        lowEnergy.forEach((r, i) => {
            console.log(`${i + 1}. ${r.date}: ${r.totalEnergy}点 (排気口: ${r.haikiko})`);
            console.log(`   木:${r.fiveElements.wood} 火:${r.fiveElements.fire} 土:${r.fiveElements.earth} 金:${r.fiveElements.metal} 水:${r.fiveElements.water}`);
        });
    }

    // 排気口の分布
    console.log('\n【排気口の分布】');
    const haikikoBuckets = [1, 3, 5, 7, 9, 11];
    for (let i = 0; i < haikikoBuckets.length - 1; i++) {
        const min = haikikoBuckets[i];
        const max = haikikoBuckets[i + 1];
        const count = results.filter(r => r.haikiko >= min && r.haikiko < max).length;
        const percentage = (count / stats.count * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(count / 3));
        const ideal = (i === 2 || i === 3) ? ' (理想範囲)' : '';
        console.log(`${min}-${max}${ideal}: ${count}件 (${percentage}%) ${bar}`);
    }

    // 五行バランスの分析
    console.log('\n【五行別平均エネルギー】');
    const avgElements = {
        wood: results.reduce((sum, r) => sum + r.fiveElements.wood, 0) / stats.count,
        fire: results.reduce((sum, r) => sum + r.fiveElements.fire, 0) / stats.count,
        earth: results.reduce((sum, r) => sum + r.fiveElements.earth, 0) / stats.count,
        metal: results.reduce((sum, r) => sum + r.fiveElements.metal, 0) / stats.count,
        water: results.reduce((sum, r) => sum + r.fiveElements.water, 0) / stats.count
    };

    console.log(`木: ${avgElements.wood.toFixed(2)} 点`);
    console.log(`火: ${avgElements.fire.toFixed(2)} 点`);
    console.log(`土: ${avgElements.earth.toFixed(2)} 点`);
    console.log(`金: ${avgElements.metal.toFixed(2)} 点`);
    console.log(`水: ${avgElements.water.toFixed(2)} 点`);

    const elementTotal = avgElements.wood + avgElements.fire + avgElements.earth + avgElements.metal + avgElements.water;
    console.log(`五行合計: ${elementTotal.toFixed(2)} 点 (平均値: ${stats.avg.toFixed(2)} 点)`);
}

// メイン処理
async function main() {
    console.log('=== 数理法エネルギー値分布検証（詳細版）===\n');

    // ランダム検証（1000件）
    console.log('1. ランダム検証（1000件）');
    const randomDates = generateRandomDates(1000);
    const randomResults = await verifySurihoDistribution(randomDates);
    analyzeDistribution(randomResults);

    // 全探索（1950-2010年、毎月1日、15日）
    console.log('\n\n=== 全探索検証（1950-2010年）===\n');
    const searchDates: string[] = [];
    for (let year = 1950; year <= 2010; year++) {
        for (let month = 1; month <= 12; month++) {
            searchDates.push(`${year}-${String(month).padStart(2, '0')}-01`);
            searchDates.push(`${year}-${String(month).padStart(2, '0')}-15`);
        }
    }

    console.log(`${searchDates.length}件の生年月日を検索中...`);
    const searchResults = await verifySurihoDistribution(searchDates);

    const energies = searchResults.map(r => r.totalEnergy);
    const stats = calculateStats(energies);

    console.log('\n【全統計サマリー】');
    console.log(`サンプル数: ${stats.count}`);
    console.log(`最小値: ${stats.min} 点`);
    console.log(`最大値: ${stats.max} 点`);
    console.log(`平均値: ${stats.avg.toFixed(2)} 点`);
    console.log(`中央値: ${stats.median} 点`);
    console.log(`標準偏差: ${stats.stdDev.toFixed(2)} 点`);

    // 最高エネルギー値のトップ20
    const top20 = searchResults.sort((a, b) => b.totalEnergy - a.totalEnergy).slice(0, 20);
    console.log('\n【エネルギー値 トップ20】');
    top20.forEach((r, i) => {
        console.log(`${i + 1}. ${r.date}: ${r.totalEnergy}点 (排気口: ${r.haikiko})`);
        console.log(`   木:${r.fiveElements.wood} 火:${r.fiveElements.fire} 土:${r.fiveElements.earth} 金:${r.fiveElements.metal} 水:${r.fiveElements.water}`);
    });

    // 最低エネルギー値のトップ20
    const bottom20 = searchResults.sort((a, b) => a.totalEnergy - b.totalEnergy).slice(0, 20);
    console.log('\n【エネルギー値 ボトム20】');
    bottom20.forEach((r, i) => {
        console.log(`${i + 1}. ${r.date}: ${r.totalEnergy}点 (排気口: ${r.haikiko})`);
        console.log(`   木:${r.fiveElements.wood} 火:${r.fiveElements.fire} 土:${r.fiveElements.earth} 金:${r.fiveElements.metal} 水:${r.fiveElements.water}`);
    });

    // 結論
    console.log('\n\n=== 検証結論 ===\n');
    console.log('【理論値との比較】');
    console.log(`理論平均値: 200 点 → 実測平均値: ${stats.avg.toFixed(2)} 点 (差異: ${(stats.avg - 200).toFixed(2)} 点, ${((stats.avg - 200) / 200 * 100).toFixed(1)}%)`);
    console.log(`理論最大値: 343 点 → 実測最大値: ${stats.max} 点 (差異: ${stats.max - 343} 点, ${((stats.max - 343) / 343 * 100).toFixed(1)}%)`);
    console.log(`理論最小値: 64 点 → 実測最小値: ${stats.min} 点 (差異: ${stats.min - 64} 点, ${((stats.min - 64) / 64 * 100).toFixed(1)}%)`);

    console.log('\n【問題点の分析】');
    if (stats.avg < 150) {
        console.log('⚠️ 平均値が理論値（200点）を大幅に下回っています。');
        console.log('   可能な原因:');
        console.log('   1. 数理法の計算ロジックの誤り');
        console.log('   2. 十二大従星の点数配分の問題');
        console.log('   3. 十干×十二支の組み合わせ計算の誤り');
    }

    if (stats.max < 250) {
        console.log('⚠️ 最大値が理論値（343点）を大幅に下回っています。');
        console.log('   可能な原因:');
        console.log('   1. 宿命に含まれる十二支の数が限定的（3種類のみ）');
        console.log('   2. 各十干の個数が限定的（最大6個）');
        console.log('   3. 計算式自体の見直しが必要');
    }

    console.log('\n【推奨される対応】');
    console.log('1. 数理法の原著・参考資料を再確認する');
    console.log('2. 計算ロジックのステップバイステップでの検証を行う');
    console.log('3. 既存の実装（他の算命学ライブラリ）と比較する');
    console.log('4. 専門家に計算結果の正確性を確認する');

    console.log('\n=== 検証完了 ===');
}

main().catch(console.error);
