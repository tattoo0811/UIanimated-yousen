"use strict";
/**
 * 朱学院の占い計算サイトからデータをスクレイピング
 *
 * 注意: このスクリプトは学習目的での使用を想定しています。
 * サイトの利用規約を遵守し、過度なリクエストを送信しないでください。
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
exports.scrapeCase = scrapeCase;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const BASE_URL = 'https://www.shugakuin.co.jp/fate_calculation';
const testCases = [
    { caseNumber: 1, year: 1983, month: 8, day: 11, gender: 1, genderText: 'male' },
    { caseNumber: 2, year: 1984, month: 12, day: 2, gender: 1, genderText: 'male' },
    { caseNumber: 3, year: 1980, month: 1, day: 24, gender: 2, genderText: 'female' },
];
/**
 * ページを読み込み、データを抽出
 */
async function scrapeCase(browser, testCase) {
    const page = await browser.newPage();
    const url = `${BASE_URL}?ge=${testCase.gender}&ye=${testCase.year}&mo=${testCase.month}&da=${testCase.day}`;
    console.log(`\nケース ${testCase.caseNumber} をスクレイピング中...`);
    console.log(`URL: ${url}`);
    try {
        // ページを読み込み（日本語ページ用に設定）
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });
        // ページが読み込まれるのを待機
        await page.waitForTimeout(2000);
        // ページ全体のHTMLを取得（デバッグ用）
        const bodyHtml = await page.evaluate(() => {
            return document.body.innerHTML;
        });
        // 四柱推命データを抽出
        const fourPillars = await page.evaluate(() => {
            const getTextBySelector = (selector) => {
                const element = document.querySelector(selector);
                return element?.textContent?.trim() || '';
            };
            return {
                year: getTextBySelector('.year-pillar, .year_pillar, [data-type="year"]'),
                month: getTextBySelector('.month-pillar, .month_pillar, [data-type="month"]'),
                day: getTextBySelector('.day-pillar, .day_pillar, [data-type="day"]'),
            };
        });
        // 十大主星を抽出
        const tenMajorStars = await page.evaluate(() => {
            return {
                head: document.querySelector('[data-position="head"], .star-head, .頭')?.textContent?.trim() || '',
                chest: document.querySelector('[data-position="chest"], .star-chest, .胸')?.textContent?.trim() || '',
                abdomen: document.querySelector('[data-position="abdomen"], .star-abdomen, .腹')?.textContent?.trim() || '',
                rightHand: document.querySelector('[data-position="right-hand"], .star-right-hand, .右手')?.textContent?.trim() || '',
                leftHand: document.querySelector('[data-position="left-hand"], .star-left-hand, .左手')?.textContent?.trim() || '',
            };
        });
        // 十二大従星を抽出
        const twelveMinorStars = await page.evaluate(() => {
            return {
                leftShoulder: document.querySelector('[data-position="left-shoulder"], .star-left-shoulder, .左肩')?.textContent?.trim() || '',
                leftFoot: document.querySelector('[data-position="left-foot"], .star-left-foot, .左足')?.textContent?.trim() || '',
                rightFoot: document.querySelector('[data-position="right-foot"], .star-right-foot, .右足')?.textContent?.trim() || '',
            };
        });
        // セレクタが見つからない場合の代替手段: テキストパターン検索
        if (!tenMajorStars.head || !twelveMinorStars.leftShoulder) {
            const alternativeData = await page.evaluate(() => {
                const allText = document.body.innerText;
                const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                // 四柱推命パターン
                const yearPillar = lines.find(line => line.match(/年柱|年/));
                const monthPillar = lines.find(line => line.match(/月柱|月/));
                const dayPillar = lines.find(line => line.match(/日柱|日/));
                return {
                    lines,
                    fourPillars: { year: yearPillar || '', month: monthPillar || '', day: dayPillar || '' },
                };
            });
            console.log('代替データ抽出結果:', JSON.stringify(alternativeData, null, 2));
        }
        const result = {
            caseNumber: testCase.caseNumber,
            birthdate: `${testCase.year}/${testCase.month}/${testCase.day}`,
            gender: testCase.genderText,
            fourPillars,
            tenMajorStars,
            twelveMinorStars,
            rawHtml: bodyHtml.substring(0, 5000), // 最初の5000文字を保存
        };
        console.log(`ケース ${testCase.caseNumber} のデータ抽出完了`);
        console.log(JSON.stringify(result, null, 2));
        return result;
    }
    catch (error) {
        console.error(`ケース ${testCase.caseNumber} のスクレイピング中にエラーが発生:`, error);
        throw error;
    }
    finally {
        await page.close();
    }
}
/**
 * メイン処理
 */
async function main() {
    console.log('=== 朱学院スクレイピング開始 ===');
    console.log('注意: サイトのサーバーに負荷をかけないよう、リクエスト間に遅延を設定します\n');
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const results = [];
    try {
        for (const testCase of testCases) {
            const data = await scrapeCase(browser, testCase);
            results.push(data);
            // サーバーへの負荷を軽減するため、リクエスト間に3秒待機
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        // 結果をJSONファイルに保存
        const outputPath = path.join(__dirname, 'shugakuin-results.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
        console.log(`\n結果を ${outputPath} に保存しました`);
        // サマリーを表示
        console.log('\n=== スクレイピング結果サマリー ===');
        results.forEach(result => {
            console.log(`\nケース ${result.caseNumber}: ${result.birthdate} (${result.gender === 'male' ? '男性' : '女性'})`);
            console.log('四柱推命:', result.fourPillars);
            console.log('十大主星:', result.tenMajorStars);
            console.log('十二大従星:', result.twelveMinorStars);
        });
    }
    catch (error) {
        console.error('スクレイピング中にエラーが発生:', error);
        throw error;
    }
    finally {
        await browser.close();
        console.log('\n=== スクレイピング完了 ===');
    }
}
// スクリプト実行
if (require.main === module) {
    main().catch(console.error);
}
