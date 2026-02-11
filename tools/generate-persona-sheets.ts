/**
 * ペルソナシート一括生成スクリプト
 * ALL-CHARACTERS-SANMEI.json の命式データと各エピソードJSONのコンテキストを統合し、
 * 各キャラクターのペルソナシート（表・裏・ギャップ・テーマ接続・天中殺タイムライン）を生成する。
 *
 * 実行: npx tsx tools/generate-persona-sheets.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 十大主星の解釈辞書 ---
const JUDAI_SHUSEI_MEANINGS: Record<string, {
    omote: string; // 表の性格（日常の顔）
    ura: string;   // 裏の性格（内面・本質）
    keyword: string;
}> = {
    "貫索星": {
        omote: "自分のペースを崩さない穏やかな印象。マイペースだが芯がある",
        ura: "頑固で妥協を嫌う。自分の世界観を壊されることへの強い抵抗",
        keyword: "自我・独立"
    },
    "石門星": {
        omote: "誰とでも穏やかに接する社交的な人。協調性が高く和を重んじる",
        ura: "集団の中で自分を見失いやすい。本音を隠して合わせる癖がある",
        keyword: "協調・和合"
    },
    "鳳閣星": {
        omote: "のんびりした空気感。食や芸術を楽しむ余裕がある",
        ura: "楽観の裏にある「何も深く考えたくない」という逃避癖",
        keyword: "遊楽・表現"
    },
    "調舒星": {
        omote: "繊細で感受性豊か。芸術的なセンスを感じさせる",
        ura: "孤独と完璧主義の呪縛。他者への不信感が根底にある",
        keyword: "孤独・完璧"
    },
    "禄存星": {
        omote: "面倒見がよく、誰にでも気前がいい。愛情深い印象",
        ura: "与えることで自己価値を確認する依存。見返りへの執着",
        keyword: "奉仕・愛情"
    },
    "司禄星": {
        omote: "堅実で計画的。質素倹約を美徳とする安定志向",
        ura: "変化を極端に恐れる保守性。蓄積への執着が強い",
        keyword: "蓄積・堅実"
    },
    "車騎星": {
        omote: "行動力があり、決断が早い。スポーティで活動的",
        ura: "立ち止まることへの恐怖。休むこと＝価値がないという思い込み",
        keyword: "行動・突進"
    },
    "牽牛星": {
        omote: "責任感が強く、礼儀正しい。社会的な信用を大切にする",
        ura: "名誉と体裁への過度な執着。本音を言えない苦しさ",
        keyword: "名誉・責任"
    },
    "龍高星": {
        omote: "知的好奇心旺盛で冒険好き。既存の枠にとらわれない",
        ura: "安定を壊したい衝動。放浪癖とコミットメントへの恐怖",
        keyword: "改革・冒険"
    },
    "玉堂星": {
        omote: "学問や教養を重んじる知性的な人。穏やかで品がある",
        ura: "理屈で感情を抑え込む癖。頭では分かるが心が動かない苦しみ",
        keyword: "知性・伝統"
    }
};

// --- 十二大従星の気質解釈 ---
const JUNIDAI_MEANINGS: Record<string, {
    energy: string;
    spirit: string;
}> = {
    "天報星": { energy: "胎児のエネルギー（3点）。多芸多才だが器用貧乏になりがち", spirit: "変化を好み、一つに定まらない気質" },
    "天印星": { energy: "赤ちゃんのエネルギー（6点）。周囲の助けを引き寄せる天性", spirit: "素直で愛されやすいが、依存的になる面も" },
    "天貴星": { energy: "幼児のエネルギー（9点）。感性豊かでプライドが高い", spirit: "品格と気位の高さ。自尊心が傷つくと立ち直りにくい" },
    "天恍星": { energy: "少年のエネルギー（7点）。夢見がちでロマンチスト", spirit: "理想と現実のギャップに苦しみやすい" },
    "天南星": { energy: "青年のエネルギー（10点）。情熱的で前向き、闘争心旺盛", spirit: "負けず嫌いで挑戦的。敗北を認められない" },
    "天禄星": { energy: "壮年のエネルギー（11点）。現実的で堅実、社会適応力が高い", spirit: "安定志向が強く、冒険を避ける傾向" },
    "天将星": { energy: "王のエネルギー（12点）。最強のリーダーシップと支配力", spirit: "自分の王国を作りたい欲求。コントロール願望が強い" },
    "天堂星": { energy: "老人のエネルギー（8点）。経験知に基づく落ち着き", spirit: "過去への執着。新しいことへの腰が重い" },
    "天胡星": { energy: "病人のエネルギー（4点）。感受性が極限まで研ぎ澄まされる", spirit: "直感力は鋭いが、現実対応力が弱い" },
    "天極星": { energy: "死人のエネルギー（2点）。究極まで削ぎ落とされた本質", spirit: "潔さと達観。しかし現世への関心が薄くなる" },
    "天庫星": { energy: "墓のエネルギー（5点）。先祖からの因縁が強く働く", spirit: "伝統や過去への探究。収集癖や執着" },
    "天馳星": { energy: "魂のエネルギー（1点）。肉体を離れた精神のスピード", spirit: "あの世とこの世を行き来する感受性。スピリチュアルな資質" }
};

// --- 日干の本質 ---
const NIKKAN_MEANINGS: Record<string, string> = {
    "甲": "大木。まっすぐで折れない芯。成長への本能的な欲求",
    "乙": "草花。しなやかで柔軟。環境に適応しながらも根を張る強さ",
    "丙": "太陽。明るく温かい存在感。周囲を照らすが、自分は孤独",
    "丁": "灯火。繊細で内省的。小さな光で確実に照らす知性",
    "戊": "山。動かない安定感と包容力。変化への鈍感さ",
    "己": "畑。他者を育てる力。自分を犠牲にしてでも実りを生む",
    "庚": "鉄。鍛えられることで輝く。試練を糧にする気質",
    "辛": "宝石。磨かれた美しさと鋭さ。傷つきやすさの裏返し",
    "壬": "大河。スケールの大きさとうねるような感情の波",
    "癸": "雨。静かに浸透する知恵。見えないところで万物を潤す"
};

// --- 天中殺の解釈 ---
const TENCHUSATSU_MEANINGS: Record<string, {
    theme: string;
    blind_spot: string;
    timeline_2026_2027: string;
}> = {
    "子丑天中殺": {
        theme: "家庭・親子関係が空転する",
        blind_spot: "家族への期待が裏切られやすい。親子の絆を手放す時期",
        timeline_2026_2027: "2026年（丙午年）・2027年（丁未年）は天中殺ではない。比較的安定"
    },
    "寅卯天中殺": {
        theme: "社会的な居場所・仕事が空転する",
        blind_spot: "キャリアや社会的立場への執着が裏目に出る",
        timeline_2026_2027: "2026年（丙午年）・2027年（丁未年）は天中殺ではない。比較的安定"
    },
    "辰巳天中殺": {
        theme: "精神世界・学問が空転する",
        blind_spot: "理想や信念への追求が空回りしやすい",
        timeline_2026_2027: "2026年（丙午年）・2027年（丁未年）は天中殺ではない。比較的安定"
    },
    "午未天中殺": {
        theme: "結果・成果が空転する",
        blind_spot: "努力の成果が出にくい。結果への執着を手放す学び",
        timeline_2026_2027: "2026年（丙午年）は天中殺！自分の成果が見えなくなる大転換期。2027年（丁未年）も天中殺。2年間の浄化期"
    },
    "申酉天中殺": {
        theme: "行動・実行力が空転する",
        blind_spot: "行動しても結果が伴わない。じっとしていることが最善",
        timeline_2026_2027: "2026年（丙午年）・2027年（丁未年）は天中殺ではない。比較的安定"
    },
    "戌亥天中殺": {
        theme: "精神的支柱・信念が空転する",
        blind_spot: "信じていたものが崩れる体験。価値観の根本的な転換",
        timeline_2026_2027: "2026年（丙午年）・2027年（丁未年）は天中殺ではない。比較的安定"
    }
};

// --- エピソードコンテキスト読み込み ---
function loadEpisodeContexts(): Record<number, {
    worry?: string;
    occupation?: string;
    background?: string;
    episode_theme?: string;
    personality?: string;
    family?: string;
}> {
    const claudeDocsDir = path.join(__dirname, '..', 'claudedocs');
    const contexts: Record<number, any> = {};

    // EP 1-24
    const ep1 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-1-24-CHARACTERS.json'), 'utf8'));
    for (const c of ep1) {
        const ep = c.episode || c.episodeNumber;
        if (ep === 1) continue;
        contexts[ep] = {
            worry: c.worry || c.chief_complaint,
            occupation: c.occupation,
            background: c.background,
            episode_theme: c.episode_theme,
            personality: c.personality,
            family: c.family
        };
    }

    // EP 25-48
    const ep2 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-25-48-CHARACTERS.json'), 'utf8'));
    for (const c of ep2.characters) {
        contexts[c.episode] = {
            worry: c.presentingIssue || c.worry,
            occupation: c.occupation,
            background: c.background,
            episode_theme: c.theme,
            personality: c.personality,
            family: c.family
        };
    }

    // EP 49-72
    const ep3 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-49-72-CHARACTERS.json'), 'utf8'));
    for (const c of ep3.characters) {
        contexts[c.episode] = {
            worry: c.chief_complaint,
            occupation: c.occupation,
            background: c.background,
            episode_theme: c.episode_theme,
            personality: c.personality,
            family: c.family
        };
    }

    // EP 73-96
    const ep4 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-73-96-CHARACTERS.json'), 'utf8'));
    for (const [, phaseData] of Object.entries(ep4.episodes) as any) {
        if (phaseData.patients) {
            for (const p of phaseData.patients) {
                const pt = p.patient || {};
                if (!pt.name || pt.name === '（来院者なし）') continue;
                contexts[p.episode] = {
                    worry: pt.worry,
                    occupation: pt.occupation,
                    background: pt.background,
                    episode_theme: p.title,
                    personality: pt.personality,
                    family: pt.family
                };
            }
        }
        if (phaseData.episodes_detail) {
            for (const d of phaseData.episodes_detail) {
                if (!d.patient || d.patient.name === '（来院者なし）') continue;
                if (contexts[d.episode]) continue;
                contexts[d.episode] = {
                    worry: d.patient.worry,
                    occupation: d.patient.occupation,
                    episode_theme: d.title,
                };
            }
        }
    }

    // EP 91-120
    const ep5 = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'EPISODES-91-120-CHARACTERS.json'), 'utf8'));
    for (let i = 0; i < 30; i++) {
        const c = ep5[String(i)];
        if (!c) continue;
        contexts[c.episode] = {
            worry: c.worry,
            occupation: c.occupation,
            background: c.background || c.life_event,
            episode_theme: c.episode_theme || c.life_event,
            personality: c.personality,
            family: c.family
        };
    }

    return contexts;
}

// --- ペルソナ生成ロジック ---
interface PersonaSheet {
    episode: number;
    name: string;
    birthDate: string;
    gender: string;
    nikkan: string;

    omote: string;      // 表の性格
    ura: string;        // 裏の性格
    gap: string;        // ギャップ
    themeConnection: string; // エピソードテーマ「在り方を変える」との接続
    tenchusatsuNote: string; // 天中殺と物語タイムラインの関係

    // 解析データ
    sanmeiSummary: {
        nikkanMeaning: string;
        centerStar: string;
        centerMeaning: string;
        northStar: string;
        southStar: string;
        eastStar: string;
        westStar: string;
        startJusei: string;
        middleJusei: string;
        endJusei: string;
        totalEnergy: number;
        tenchusatsu: string;
        tenchusatsuTheme: string;
    };
}

function generatePersona(
    char: any,
    context: { worry?: string; occupation?: string; background?: string; episode_theme?: string; personality?: string; family?: string; } | undefined
): PersonaSheet {
    const s = char.sanmei;
    const nikkan = s.insen.day.gan;
    const center = s.yousen.center;
    const north = s.yousen.north;
    const south = s.yousen.south;
    const east = s.yousen.east;
    const west = s.yousen.west;
    const startJ = s.yousen.start.name;
    const middleJ = s.yousen.middle.name;
    const endJ = s.yousen.end.name;
    const totalEnergy = s.suriho.total_energy;
    const tenchusatsu = char.tenchusatsu;

    const nikkanM = NIKKAN_MEANINGS[nikkan] || "不明";
    const centerM = JUDAI_SHUSEI_MEANINGS[center] || { omote: "", ura: "", keyword: "" };
    const northM = JUDAI_SHUSEI_MEANINGS[north] || { omote: "", ura: "", keyword: "" };
    const southM = JUDAI_SHUSEI_MEANINGS[south] || { omote: "", ura: "", keyword: "" };
    const eastM = JUDAI_SHUSEI_MEANINGS[east] || { omote: "", ura: "", keyword: "" };
    const westM = JUDAI_SHUSEI_MEANINGS[west] || { omote: "", ura: "", keyword: "" };
    const startJM = JUNIDAI_MEANINGS[startJ] || { energy: "", spirit: "" };
    const middleJM = JUNIDAI_MEANINGS[middleJ] || { energy: "", spirit: "" };
    const endJM = JUNIDAI_MEANINGS[endJ] || { energy: "", spirit: "" };
    const tenchusatsuM = TENCHUSATSU_MEANINGS[tenchusatsu] || { theme: "", blind_spot: "", timeline_2026_2027: "" };

    const worry = context?.worry || "不明";
    const occupation = context?.occupation || "不明";
    const epTheme = context?.episode_theme || "";

    // --- 表の性格（中心星 + 東西南北の外向き面 + 日干の表現） ---
    const omote = [
        `日干${nikkan}（${nikkanM.split('。')[0]}）の人。`,
        `中心に${center}（${centerM.keyword}）を持ち、${centerM.omote}。`,
        `社会面（東）に${east}があり、${eastM.omote.split('。')[0]}。`,
        `パートナー面（西）に${west}があり、${westM.omote.split('。')[0]}。`,
        occupation !== "不明" ? `職業は${occupation}。` : "",
    ].filter(Boolean).join('');

    // --- 裏の性格（中心星の裏面 + 初年期〜晩年期の気質 + エネルギー総量） ---
    const ura = [
        `中心星${center}の裏面: ${centerM.ura}。`,
        `初年期${startJ}（${startJM.spirit.split('。')[0]}）`,
        `→ 中年期${middleJ}（${middleJM.spirit.split('。')[0]}）`,
        `→ 晩年期${endJ}（${endJM.spirit.split('。')[0]}）。`,
        `エネルギー総量${totalEnergy}点${totalEnergy >= 250 ? '（高エネルギー型：燃え尽きリスク）' : totalEnergy <= 150 ? '（低エネルギー型：繊細体質）' : '（中庸型）'}。`,
        `天中殺は${tenchusatsu}（${tenchusatsuM.theme}）。`
    ].join('');

    // --- ギャップ（表と裏の矛盾が生むドラマ性） ---
    const gap = (() => {
        // 中心星の表裏ギャップ
        const centerGap = `表では${centerM.omote.split('。')[0]}一方、内面では${centerM.ura.split('。')[0]}`;

        // 南北のギャップ（親子関係 vs 社会関係）
        const nsGap = north !== south
            ? `目上（${north}: ${northM.keyword}）と目下（${south}: ${southM.keyword}）で異なる顔を見せる`
            : `親子関係でも社会関係でも同じ${north}の顔`;

        // エネルギーと十二大従星のギャップ
        const energyGap = (() => {
            if (s.yousen.start.score >= 10 && s.yousen.end.score <= 3) {
                return "若い頃の勢いが晩年に急激に萎む型。人生後半の在り方が問われる";
            }
            if (s.yousen.start.score <= 3 && s.yousen.end.score >= 10) {
                return "大器晩成型。若い頃の弱さが後半の強さに変わるが、その間の苦しみが深い";
            }
            if (s.yousen.middle.score >= 11) {
                return "中年期に最大の力を発揮する社会人型。しかしピーク後の落差が課題";
            }
            return "人生の波が比較的穏やかだが、劇的な転換点を自ら作る必要がある";
        })();

        return `${centerGap}。${nsGap}。${energyGap}。`;
    })();

    // --- テーマ接続（裏テーマ「在り方を変える」） ---
    const themeConnection = (() => {
        const nikkanTheme = `日干${nikkan}の本質は「${nikkanM.split('。')[0]}」`;
        const worryTheme = worry !== "不明" ? `。来院時の悩み「${worry.slice(0, 50)}」` : "";
        const tenchusatsuTheme = tenchusatsuM.theme
            ? `。天中殺テーマ「${tenchusatsuM.theme}」は「在り方を変える」と直結する`
            : "";

        // 中心星と悩みの関係
        const coreConflict = (() => {
            if (center === "貫索星" || center === "石門星") {
                return "自我のあり方（独立 vs 協調）を根本から問い直す物語";
            }
            if (center === "鳳閣星" || center === "調舒星") {
                return "表現のあり方（楽観 vs 完璧主義）を変えることで救われる物語";
            }
            if (center === "禄存星" || center === "司禄星") {
                return "与え方・蓄え方（奉仕 vs 堅実）の在り方を変える物語";
            }
            if (center === "車騎星" || center === "牽牛星") {
                return "行動・責任の在り方（突進 vs 名誉）を転換する物語";
            }
            if (center === "龍高星" || center === "玉堂星") {
                return "知性・冒険の在り方（改革 vs 伝統）を統合する物語";
            }
            return "在り方の転換が最も核心的なテーマとなる";
        })();

        const timelineNote = tenchusatsu === "午未天中殺"
            ? "【重要】2026-2027年は天中殺期間中。物語タイムラインと完全に重なり、最も劇的な変容を遂げるキャラクターの一人"
            : "";

        return [nikkanTheme, worryTheme, tenchusatsuTheme, `。${coreConflict}`, timelineNote ? `。${timelineNote}` : ""].filter(Boolean).join('');
    })();

    const tenchusatsuNote = tenchusatsuM.timeline_2026_2027 || "不明";

    return {
        episode: char.episode,
        name: char.name,
        birthDate: char.birthDate,
        gender: char.gender,
        nikkan,
        omote, ura, gap, themeConnection, tenchusatsuNote,
        sanmeiSummary: {
            nikkanMeaning: nikkanM,
            centerStar: center,
            centerMeaning: centerM.keyword,
            northStar: north,
            southStar: south,
            eastStar: east,
            westStar: west,
            startJusei: startJ,
            middleJusei: middleJ,
            endJusei: endJ,
            totalEnergy,
            tenchusatsu,
            tenchusatsuTheme: tenchusatsuM.theme
        }
    };
}

// --- メイン ---
async function main() {
    const claudeDocsDir = path.join(__dirname, '..', 'claudedocs');

    // 命式データ読み込み
    const sanmeiData = JSON.parse(fs.readFileSync(path.join(claudeDocsDir, 'ALL-CHARACTERS-SANMEI.json'), 'utf8'));
    console.log(`📖 命式データ読み込み: ${sanmeiData.characters.length}名`);

    // エピソードコンテキスト読み込み
    const contexts = loadEpisodeContexts();
    console.log(`📋 エピソードコンテキスト読み込み: ${Object.keys(contexts).length}エピソード`);

    // ペルソナシート生成
    const personas: PersonaSheet[] = [];
    for (const char of sanmeiData.characters) {
        const context = contexts[char.episode];
        const persona = generatePersona(char, context);
        personas.push(persona);
    }

    console.log(`\n✅ ペルソナシート生成完了: ${personas.length}名`);

    // 統計
    const gogoCount: Record<string, number> = {};
    for (const p of personas) {
        const g = p.sanmeiSummary.tenchusatsu;
        gogoCount[g] = (gogoCount[g] || 0) + 1;
    }

    // 午未天中殺キャラ（2026-2027天中殺中）のリスト
    const gogoChars = personas.filter(p => p.sanmeiSummary.tenchusatsu === "午未天中殺");
    console.log(`\n🔥 午未天中殺（2026-2027年天中殺中）: ${gogoChars.length}名`);
    gogoChars.forEach(p => console.log(`  EP${p.episode} ${p.name} (${p.nikkan})`));

    // 中心星分布
    const centerStarDist: Record<string, number> = {};
    for (const p of personas) {
        const cs = p.sanmeiSummary.centerStar;
        centerStarDist[cs] = (centerStarDist[cs] || 0) + 1;
    }
    console.log(`\n📊 中心星分布:`);
    for (const [star, count] of Object.entries(centerStarDist).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${star}: ${count}名`);
    }

    // JSON出力
    const output = {
        metadata: {
            generated: new Date().toISOString(),
            totalPersonas: personas.length,
            gogoTenchusatsuCount: gogoChars.length,
            centerStarDistribution: centerStarDist,
            tenchusatsuDistribution: gogoCount
        },
        personas
    };

    const outputPath = path.join(claudeDocsDir, 'PERSONA-SHEETS.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`\n💾 保存: ${outputPath}`);
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
