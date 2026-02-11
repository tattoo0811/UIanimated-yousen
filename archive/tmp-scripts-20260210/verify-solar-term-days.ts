/**
 * 節入りからの日数計算の検証
 *
 * テストケース3と4で、二十八元に基づく蔵干選択が正しいか検証
 */

import { calculateKanshi } from '../mobile/lib/logic';
import {
    TWENTY_EIGHT_ELEMENTS,
    YANGSEN_HIDDEN_STEMS_DATA,
    SOLAR_TERM_APPROX_DAYS
} from '../mobile/lib/logic/constants';

interface TestCase {
    date: Date;
    name: string;
    expectedRightHand?: string;
}

const testCases: TestCase[] = [
    {
        date: new Date('1978-11-05T12:00:00'),
        name: 'テストケース3: 1978-11-05',
    },
    {
        date: new Date('1995-09-12T12:00:00'),
        name: 'テストケース4: 1995-09-12',
        expectedRightHand: '調舒星'
    }
];

function getDaysFromSolarTerm(date: Date): number {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const solarTermDay = SOLAR_TERM_APPROX_DAYS[month];

    if (day < solarTermDay) {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        const prevSolarTermDay = SOLAR_TERM_APPROX_DAYS[prevMonth];
        return (prevMonthLastDay - prevSolarTermDay) + day;
    }

    return day - solarTermDay + 1;
}

function getHiddenStemByDays(branchStr: string, daysFromSolarTerm: number): string {
    const data = TWENTY_EIGHT_ELEMENTS[branchStr];
    if (!data) throw new Error(`Invalid branch: ${branchStr}`);

    if (data.extra && daysFromSolarTerm <= data.extra.days) return data.extra.stem;

    const extraDays = data.extra?.days || 0;
    if (data.sub && daysFromSolarTerm <= extraDays + data.sub.days) return data.sub.stem;

    return data.main.stem;
}

console.log('='.repeat(80));
console.log('節入りからの日数計算の検証');
console.log('='.repeat(80));
console.log();

for (const testCase of testCases) {
    console.log('─'.repeat(80));
    console.log(testCase.name);
    console.log(`生年月日: ${testCase.date.toISOString().split('T')[0]}`);
    console.log('─'.repeat(80));
    console.log();

    const result = calculateKanshi({
        birthDate: testCase.date,
        gender: 'male',
        longitude: 135,
        includeTaiun: false,
        includeInsen: false
    });

    // 日付情報
    const year = testCase.date.getFullYear();
    const month = testCase.date.getMonth() + 1;
    const day = testCase.date.getDate();

    console.log('【日付情報】');
    console.log(`年月日: ${year}年${month}月${day}日`);
    console.log();

    // 節入り日
    const solarTermDay = SOLAR_TERM_APPROX_DAYS[month];
    console.log('【節入り情報】');
    console.log(`${month}月の節入り日: ${solarTermDay}日`);

    const daysFromSolarTerm = getDaysFromSolarTerm(testCase.date);
    console.log(`節入りからの経過日数: ${daysFromSolarTerm}日目`);
    console.log();

    // 四柱推命
    console.log('【四柱推命】');
    console.log(`年柱: ${result.bazi.year.name} (${result.bazi.year.stemStr}${result.bazi.year.branchStr})`);
    console.log(`月柱: ${result.bazi.month.name} (${result.bazi.month.stemStr}${result.bazi.month.branchStr})`);
    console.log(`日柱: ${result.bazi.day.name} (${result.bazi.day.stemStr}${result.bazi.day.branchStr})`);
    console.log(`時柱: ${result.bazi.hour.name} (${result.bazi.hour.stemStr}${result.bazi.hour.branchStr})`);
    console.log();

    // 日支の二十八元データ
    const dayBranchStr = result.bazi.day.branchStr;
    const twentyEightData = TWENTY_EIGHT_ELEMENTS[dayBranchStr];

    console.log(`【日支「${dayBranchStr}」の二十八元データ】`);
    if (twentyEightData.extra) {
        console.log(`余気: ${twentyEightData.extra.stem} (${twentyEightData.extra.days}日間)`);
    }
    if (twentyEightData.sub) {
        console.log(`中気: ${twentyEightData.sub.stem} (${twentyEightData.sub.days}日間)`);
    }
    console.log(`本気: ${twentyEightData.main.stem} (残りの日数)`);
    console.log();

    // 選択された蔵干
    const selectedHiddenStem = getHiddenStemByDays(dayBranchStr, daysFromSolarTerm);
    console.log(`【選択された蔵干】`);
    console.log(`日支「${dayBranchStr}」の${daysFromSolarTerm}日目 → 蔵干: ${selectedHiddenStem}`);
    console.log();

    // 月支の二十八元データ
    const monthBranchStr = result.bazi.month.branchStr;
    const monthTwentyEightData = TWENTY_EIGHT_ELEMENTS[monthBranchStr];

    console.log(`【月支「${monthBranchStr}」の二十八元データ】`);
    if (monthTwentyEightData.extra) {
        console.log(`余気: ${monthTwentyEightData.extra.stem} (${monthTwentyEightData.extra.days}日間)`);
    }
    if (monthTwentyEightData.sub) {
        console.log(`中気: ${monthTwentyEightData.sub.stem} (${monthTwentyEightData.sub.days}日間)`);
    }
    console.log(`本気: ${monthTwentyEightData.main.stem} (残りの日数)`);
    console.log();

    const monthSelectedHiddenStem = getHiddenStemByDays(monthBranchStr, daysFromSolarTerm);
    console.log(`【選択された蔵干】`);
    console.log(`月支「${monthBranchStr}」の${daysFromSolarTerm}日目 → 蔵干: ${monthSelectedHiddenStem}`);
    console.log();

    // 十大主星
    console.log('【十大主星（人体図）】');
    console.log(`頭: ${result.yangSen.head}`);
    console.log(`右手: ${result.yangSen.rightHand} (日干 × 日支蔵干 ${selectedHiddenStem})`);
    console.log(`胸: ${result.yangSen.chest} (日干 × 月支蔵干 ${monthSelectedHiddenStem})`);
    console.log(`左手: ${result.yangSen.leftHand}`);
    console.log(`腹: ${result.yangSen.belly}`);
    console.log();

    // 固定蔵干との比較
    const fixedDayHiddenStem = YANGSEN_HIDDEN_STEMS_DATA[dayBranchStr].main;
    const fixedMonthHiddenStem = YANGSEN_HIDDEN_STEMS_DATA[monthBranchStr].main;

    console.log('【固定蔵干（yinyang-app版）との比較】');
    console.log(`日支「${dayBranchStr}」: 二十八元 ${selectedHiddenStem} vs 固定 ${fixedDayHiddenStem}`);
    console.log(`月支「${monthBranchStr}」: 二十八元 ${monthSelectedHiddenStem} vs 固定 ${fixedMonthHiddenStem}`);
    console.log();

    // ユーザー確認値との照合
    if (testCase.expectedRightHand) {
        const match = result.yangSen.rightHand === testCase.expectedRightHand;
        console.log(`【ユーザー確認値との照合】`);
        console.log(`${match ? '✓' : '✗'} 右手: ${result.yangSen.rightHand} (期待値: ${testCase.expectedRightHand})`);
        console.log();

        if (!match) {
            console.log('【調舒星になる条件の分析】');
            const dayStemStr = result.bazi.day.stemStr;
            console.log(`日干: ${dayStemStr}`);

            // 調舒星になるための蔵干の条件
            // 日干が丙（火・陽）の場合、調舒星（洩気）になるには:
            // - 水（異五行）かつ 陰（異陰陽）→ 壬(陽)または癸(陰)
            // - 金（異五行）かつ 陰（異陰陽）→ 庚(陽)または辛(陰)

            console.log('調舒星（洩気）になる条件:');
            console.log('- 異五行かつ異陰陽');
            console.log('- 水（壬・癸）または 金（庚・辛）');
            console.log('- かつ陰（癸・辛）');
            console.log();
            console.log(`現在の蔵干: ${selectedHiddenStem} (二十八元) / ${fixedDayHiddenStem} (固定)`);
            console.log();

            if (dayStemStr === '丙') {
                console.log('日干が丙（火・陽）の場合:');
                console.log('- 壬（水・陽）→ 異五行・同陰陽 → 洩気ではない');
                console.log('- 癸（水・陰）→ 異五行・異陰陽 → 洩気（調舒星）✓');
                console.log('- 庚（金・陽）→ 異五行・同陰陽 → 洩気ではない');
                console.log('- 辛（金・陰）→ 異五行・異陰陽 → 洩気（調舒星）✓');
                console.log();
            }
        }
    }

    console.log();
}

console.log('='.repeat(80));
console.log('検証完了');
console.log('='.repeat(80));
