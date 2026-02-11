/**
 * PDF例題の検証スクリプト
 *
 * 例題: 辛巳戊庚丙 / 戊戌辛丁戊 / 壬子癸
 *
 * 年柱: 壬子
 * 月柱: 戊戌
 * 日柱: 辛巳
 * 時柱: 癸巳
 *
 * 期待される総エネルギー数: 201点
 */

import { calculateSanmei } from './sanmei-cli-suriho';

// PDFの例題
// 陰占の四柱推命命式は以下の通り:
// 年柱: 壬子
// 月柱: 戊戌
// 日柱: 辛巳
// 時柱: 癸巳

// しかし、これは陰陽五行論塾の例題であり、
// 生年月日から導出されるものではありません。

// そのため、直接数理法計算の検証を行います。

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 十二大従星の点数表
const ENERGY_TABLE: Record<string, number[]> = {
    "甲": [7, 10, 11, 12, 8, 4, 2, 5, 1, 3, 6, 9],  // 子, 丑, 寅, 卯, 辰, 巳, 午, 未, 申, 酉, 戌, 亥
    "乙": [4, 8, 12, 11, 10, 7, 9, 6, 3, 1, 5, 2],
    "丙": [3, 6, 9, 7, 10, 11, 12, 8, 4, 2, 5, 1],
    "丁": [1, 5, 2, 4, 8, 12, 11, 10, 7, 9, 6, 3],
    "戊": [3, 6, 9, 7, 10, 11, 12, 8, 4, 2, 5, 1],
    "己": [1, 5, 2, 4, 8, 12, 11, 10, 7, 9, 6, 3],
    "庚": [2, 5, 1, 3, 6, 9, 7, 10, 11, 12, 8, 4],
    "辛": [9, 6, 3, 1, 5, 2, 4, 8, 12, 11, 10, 7],
    "壬": [12, 8, 4, 2, 5, 1, 3, 6, 9, 7, 10, 11],
    "癸": [11, 10, 7, 9, 6, 3, 1, 5, 2, 4, 8, 12]
};

// 蔵干（二十八元）
const ZOKAN: Record<string, string[]> = {
    "子": ["癸"],
    "丑": ["己", "癸", "辛"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "庚", "戊"],
    "午": ["丁", "己"],
    "未": ["己", "丁", "乙"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"]
};

/**
 * 数理法エネルギーを計算する（PDFの方法）
 *
 * 重要: 時柱はカウントしない！
 * 年柱・月柱・日柱のみを使用する
 */
function calculateSurihoEnergyFromPDF(
    yearGan: string,
    yearShi: string,
    monthGan: string,
    monthShi: string,
    dayGan: string,
    dayShi: string,
    hourGan: string,
    hourShi: string
) {
    // 宿命に含まれる十干を集める（ユニーク）
    const ganSet = new Set<string>();

    // 天干（年・月・日のみ）
    ganSet.add(yearGan);
    ganSet.add(monthGan);
    ganSet.add(dayGan);
    // hourGanはカウントしない

    // 蔵干（地支に含まれる干）- ユニークな十二支の蔵干だけを追加
    const uniqueShi = Array.from(new Set([yearShi, monthShi, dayShi]));
    uniqueShi.forEach(shi => {
        const zokan = ZOKAN[shi];
        if (zokan) {
            zokan.forEach(g => ganSet.add(g));
        }
    });

    // 宿命に含まれる十二支（重複なし）- 年・月・日のみ
    const shiSet = new Set<string>([yearShi, monthShi, dayShi]);

    console.log('宿命の十干（ユニーク、年月日のみ）:', Array.from(ganSet).join(', '));
    console.log('宿命の十二支（ユニーク、年月日のみ）:', Array.from(shiSet).join(', '));

    // 各十干の個数をカウント（ユニークな十二支に対してのみ）
    const ganCount: Record<string, number> = {};
    GAN.forEach(g => ganCount[g] = 0);

    // 天干をカウント（年・月・日のみ）
    ganCount[yearGan]++;
    ganCount[monthGan]++;
    ganCount[dayGan]++;
    // hourGanはカウントしない

    // 蔵干をカウント（ユニークな十二支に対してのみ）
    uniqueShi.forEach(shi => {
        const zokan = ZOKAN[shi];
        if (zokan) {
            zokan.forEach(g => ganCount[g]++);
        }
    });

    console.log('\n十干の個数:');
    GAN.forEach(gan => {
        if (ganCount[gan] > 0) {
            console.log(`  ${gan}: x${ganCount[gan]}`);
        }
    });

    // 各十干×十二支の組み合わせで点数を計算
    const details: Record<string, { scores: number[], total: number, count: number }> = {};

    console.log('\n各十干のスコア詳細:');

    for (const gan of GAN) {
        const count = ganCount[gan];
        if (count === 0) continue;

        const scores: number[] = [];
        let totalScore = 0;

        for (const shi of shiSet) {
            const shiIdx = SHI.indexOf(shi);
            const score = ENERGY_TABLE[gan][shiIdx];
            scores.push(score);
            totalScore += score;
        }

        details[gan] = {
            scores,
            total: totalScore * count,
            count
        };

        console.log(`\n${gan} (x${count}):`);
        console.log(`  スコア: ${scores.join(' + ')} = ${totalScore}`);
        console.log(`  合計: ${totalScore} × ${count} = ${totalScore * count}`);
    }

    // 五行別に集計
    const WOOD = ["甲", "乙"];
    const FIRE = ["丙", "丁"];
    const EARTH = ["戊", "己"];
    const METAL = ["庚", "辛"];
    const WATER = ["壬", "癸"];

    let wood = 0, fire = 0, earth = 0, metal = 0, water = 0;

    WOOD.forEach(g => wood += details[g]?.total || 0);
    FIRE.forEach(g => fire += details[g]?.total || 0);
    EARTH.forEach(g => earth += details[g]?.total || 0);
    METAL.forEach(g => metal += details[g]?.total || 0);
    WATER.forEach(g => water += details[g]?.total || 0);

    const totalEnergy = wood + fire + earth + metal + water;

    console.log('\n五行別エネルギー:');
    console.log(`  木性 (甲+乙): ${wood}`);
    console.log(`  火性 (丙+丁): ${fire}`);
    console.log(`  土性 (戊+己): ${earth}`);
    console.log(`  金性 (庚+辛): ${metal}`);
    console.log(`  水性 (壬+癸): ${water}`);
    console.log(`\n総合計エネルギー: ${totalEnergy}`);

    return { totalEnergy, wood, fire, earth, metal, water };
}

/**
 * PDFの例題を検証
 */
function testPDFExample() {
    console.log('=== PDF例題の検証 ===\n');
    console.log('命式:');
    console.log('  年柱: 壬子');
    console.log('  月柱: 戊戌');
    console.log('  日柱: 辛巳');
    console.log('  時柱: 癸巳');
    console.log('  期待値: 201点\n');

    const result = calculateSurihoEnergyFromPDF(
        '壬', '子',  // 年柱
        '戊', '戌',  // 月柱
        '辛', '巳',  // 日柱
        '癸', '巳'   // 時柱
    );

    console.log('\n=== 結果 ===');
    console.log(`期待値: 201点`);
    console.log(`計算値: ${result.totalEnergy}点`);
    console.log(`差: ${result.totalEnergy - 201}点`);
    console.log(`一致: ${result.totalEnergy === 201 ? '✅' : '❌'}`);
}

/**
 * 実装の検証
 * sanmei-cli-suriho.ts の実装がPDFの方法と一致しているかを確認
 */
function testImplementation() {
    console.log('\n\n=== 実装の検証 ===\n');

    // PDFの例題に対応する生年月日を探す
    // 年柱: 壬子 → 1972年, 1984年, 1996年, 2008年
    // 月柱: 戊戌 → 9月
    // 日柱: 辛巳
    // 時柱: 癸巳

    // 1984年9月の辛巳の日を探す
    // これは計算が複雑なので、別のアプローチをとる

    // 1984-09-xx の日干が辛になる日を探す
    const testDate = new Date(1984, 8, 1); // 1984年9月1日

    for (let day = 1; day <= 30; day++) {
        const date = new Date(1984, 8, day);
        try {
            const result = calculateSanmei(1984, 9, day, 'male');

            if (result.insen.year.gan === '壬' &&
                result.insen.year.shi === '子' &&
                result.insen.month.gan === '戊' &&
                result.insen.month.shi === '戌' &&
                result.insen.day.gan === '辛' &&
                result.insen.day.shi === '巳') {

                console.log('PDF例題に一致する生年月日が見つかりました:');
                console.log(`  1984-09-${day}\n`);

                console.log('実装による計算結果:');
                console.log(`  総エネルギー数: ${result.suriho.totalEnergy}点`);
                console.log(`  排気口: ${result.suriho.haikiko}`);
                console.log(`  木: ${result.suriho.fiveElements.wood}`);
                console.log(`  火: ${result.suriho.fiveElements.fire}`);
                console.log(`  土: ${result.suriho.fiveElements.earth}`);
                console.log(`  金: ${result.suriho.fiveElements.metal}`);
                console.log(`  水: ${result.suriho.fiveElements.water}`);

                console.log('\nPDFの期待値: 201点');
                console.log(`一致: ${result.suriho.totalEnergy === 201 ? '✅' : '❌'}`);
                return;
            }
        } catch (error) {
            // エラーを無視
        }
    }

    console.log('PDF例題に一致する生年月日は見つかりませんでした');
}

// メイン処理
testPDFExample();
testImplementation();
