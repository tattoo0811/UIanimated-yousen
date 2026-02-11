/**
 * 藤堂慧の命式候補日探索スクリプト
 *
 * 探索条件:
 * - 生年: 1988-1992年
 * - 性別: 男性
 * - 鳳閣星: 必須（胸か腹の配置）
 * - 禄存星: 必須（腹の配置）
 * - 調舒星: 必須（左手か胸の配置）
 * - 巳午天中殺: 30代前半に経験
 * - 日干: 庚辛（金）が望ましい
 */

import { Solar } from 'lunar-javascript';
import { calculateBaZi } from '../mobile/lib/logic/bazi';
import { calculateYangSen } from '../mobile/lib/logic/yangsen';
import { calculateSanmeigakuInsen } from '../mobile/lib/logic/insen';
import { TEN_STARS, TWELVE_STAR_PHASES } from '../mobile/lib/logic/constants';

// ============================================================
// 型定義
// ============================================================

interface CandidateResult {
  birthDate: string;
  dayPillar: string;
  yangSen: {
    head: string;
    rightHand: string;
    chest: string;
    leftHand: string;
    belly: string;
  };
  twelveStars: {
    leftShoulder: string;
    leftLeg: string;
    rightLeg: string;
  };
  tenchusatsu: string;
  dayStem: string;
  score: number;
  details: string[];
}

interface ScoreWeights {
  fugekoChest: number;
  fugekoBelly: number;
  rokuzonBelly: number;
  chojyoLeftHand: number;
  chojyoChest: number;
  dayStemMetal: number;
  siwuTenchusatsu: number;
}

// ============================================================
// 定数
// ============================================================

const REQUIRED_STARS = {
  FUGEKO: '鳳閣星',
  ROKUZON: '禄存星',
  CHOJO: '調舒星',
};

const TENCHUSATSU_PATTERNS = {
  SI_WU: ['巳午天中殺'],
};

const WEIGHTS: ScoreWeights = {
  fugekoChest: 30,      // 鳳閣星が胸にある（最優先：表現の場）
  fugekoBelly: 25,      // 鳳閣星が腹にある
  rokuzonBelly: 20,     // 禄存星が腹にある
  chojyoLeftHand: 15,   // 調舒星が左手にある
  chojyoChest: 10,      // 調舒星が胸にある
  dayStemMetal: 5,      // 日干が庚辛
  siwuTenchusatsu: 15,  // 巳午天中殺（重要な変革期）
};

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * 日付文字列をフォーマット
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 天中殺が巳午天中殺か判定
 */
function isSiWuTenchusatsu(tenchusatsu: string): boolean {
  return TENCHUSATSU_PATTERNS.SI_WU.includes(tenchusatsu);
}

/**
 * 日干が庚辛（金）か判定
 */
function isMetalDayStem(dayStem: string): boolean {
  return dayStem === '庚' || dayStem === '辛';
}

/**
 * 候補者をスコアリング
 */
function scoreCandidate(result: CandidateResult): number {
  let score = 0;
  const details: string[] = [];

  // 鳳閣星の配置
  if (result.yangSen.chest === REQUIRED_STARS.FUGEKO) {
    score += WEIGHTS.fugekoChest;
    details.push(`鳳閣星@胸: +${WEIGHTS.fugekoChest}`);
  } else if (result.yangSen.belly === REQUIRED_STARS.FUGEKO) {
    score += WEIGHTS.fugekoBelly;
    details.push(`鳳閣星@腹: +${WEIGHTS.fugekoBelly}`);
  }

  // 禄存星の配置
  if (result.yangSen.belly === REQUIRED_STARS.ROKUZON) {
    score += WEIGHTS.rokuzonBelly;
    details.push(`禄存星@腹: +${WEIGHTS.rokuzonBelly}`);
  }

  // 調舒星の配置
  if (result.yangSen.leftHand === REQUIRED_STARS.CHOJO) {
    score += WEIGHTS.chojyoLeftHand;
    details.push(`調舒星@左手: +${WEIGHTS.chojyoLeftHand}`);
  } else if (result.yangSen.chest === REQUIRED_STARS.CHOJO) {
    score += WEIGHTS.chojyoChest;
    details.push(`調舒星@胸: +${WEIGHTS.chojyoChest}`);
  }

  // 日干が庚辛
  if (isMetalDayStem(result.dayStem)) {
    score += WEIGHTS.dayStemMetal;
    details.push(`日干が金: +${WEIGHTS.dayStemMetal}`);
  }

  // 巳午天中殺
  if (isSiWuTenchusatsu(result.tenchusatsu)) {
    score += WEIGHTS.siwuTenchusatsu;
    details.push(`巳午天中殺: +${WEIGHTS.siwuTenchusatsu}`);
  }

  result.details = details;
  result.score = score;

  return score;
}

/**
 * 必須条件を満たしているか判定
 */
function meetsRequiredConditions(result: CandidateResult): boolean {
  // 鳳閣星が胸か腹にある
  const hasFugeko = result.yangSen.chest === REQUIRED_STARS.FUGEKO ||
                    result.yangSen.belly === REQUIRED_STARS.FUGEKO;

  // 禄存星が腹にある
  const hasRokuzonBelly = result.yangSen.belly === REQUIRED_STARS.ROKUZON;

  // 調舒星が左手か胸にある
  const hasChojyo = result.yangSen.leftHand === REQUIRED_STARS.CHOJO ||
                    result.yangSen.chest === REQUIRED_STARS.CHOJO;

  return hasFugeko && hasRokuzonBelly && hasChojyo;
}

/**
 * 天中殺の説明を取得
 */
function getTenchusatsuDescription(tenchusatsu: string): string {
  const descriptions: Record<string, string> = {
    '戌亥天中殺': '社会的な成功や承認、自己表現に関わるテーマでの変革期',
    '申酉天中殺': '対人関係、パートナーシップ、協力関係での変革期',
    '午未天中殺': '内面、精神的成長、創造性での変革期',
    '辰巳天中殺': '自己表現、コミュニケーション、行動での変革期',
    '寅卯天中殺': 'キャリア、社会的地位、目標達成での変革期',
    '子丑天中殺': '家庭、基盤、安定感での変革期',
  };
  return descriptions[tenchusatsu] || tenchusatsu;
}

// ============================================================
// 探索関数
// ============================================================

/**
 * 1988-1992年の候補日を探索
 */
function exploreCandidates(year: number): CandidateResult[] {
  const candidates: CandidateResult[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const bazi = calculateBaZi(date);
    const yangSen = calculateYangSen(bazi, date);
    const insen = calculateSanmeigakuInsen(bazi, date);

    const result: CandidateResult = {
      birthDate: formatDate(date),
      dayPillar: bazi.day.name,
      yangSen: {
        head: yangSen.head,
        rightHand: yangSen.rightHand,
        chest: yangSen.chest,
        leftHand: yangSen.leftHand,
        belly: yangSen.belly,
      },
      twelveStars: {
        leftShoulder: yangSen.leftShoulder.name,
        leftLeg: yangSen.leftLeg.name,
        rightLeg: yangSen.rightLeg.name,
      },
      tenchusatsu: insen.tenchusatsu.type,
      dayStem: bazi.day.stemStr,
      score: 0,
      details: [],
    };

    if (meetsRequiredConditions(result)) {
      scoreCandidate(result);
      candidates.push(result);
    }
  }

  return candidates;
}

/**
 * 全探索実行
 */
function exploreAll(): CandidateResult[] {
  const allCandidates: CandidateResult[] = [];

  for (let year = 1988; year <= 1992; year++) {
    console.log(`探索中: ${year}年...`);
    const yearCandidates = exploreCandidates(year);
    allCandidates.push(...yearCandidates);
    console.log(`  -> ${yearCandidates.length}件の候補を発見`);
  }

  return allCandidates.sort((a, b) => b.score - a.score);
}

// ============================================================
// 出力関数
// ============================================================

/**
 * 候補者を詳細表示
 */
function printCandidate(candidate: CandidateResult, rank: number): void {
  console.log('\n' + '='.repeat(70));
  console.log(`候補第${rank}位 (スコア: ${candidate.score}点)`);
  console.log('='.repeat(70));
  console.log(`生年月日: ${candidate.birthDate}`);
  console.log(`日柱: ${candidate.dayPillar} (日干: ${candidate.dayStem})`);
  console.log(`天中殺: ${candidate.tenchusatsu}`);
  console.log(`  -> ${getTenchusatsuDescription(candidate.tenchusatsu)}`);
  console.log('\n【陽占（十大主星）】');
  console.log(`  頭:    ${candidate.yangSen.head}`);
  console.log(`  右手:  ${candidate.yangSen.rightHand}`);
  console.log(`  胸:    ${candidate.yangSen.chest}`);
  console.log(`  左手:  ${candidate.yangSen.leftHand}`);
  console.log(`  腹:    ${candidate.yangSen.belly}`);
  console.log('\n【十二大従星】');
  console.log(`  左肩: ${candidate.twelveStars.leftShoulder}`);
  console.log(`  左足: ${candidate.twelveStars.leftLeg}`);
  console.log(`  右足: ${candidate.twelveStars.rightLeg}`);
  console.log('\n【スコア内訳】');
  candidate.details.forEach(detail => console.log(`  + ${detail}`));
}

/**
 * サマリー表示
 */
function printSummary(candidates: CandidateResult[]): void {
  console.log('\n' + '#'.repeat(70));
  console.log('# 藤堂慧 命式候補日探索結果');
  console.log('#'.repeat(70));
  console.log(`\n総候補数: ${candidates.length}件`);
  console.log('\n探索条件:');
  console.log('  - 生年: 1988-1992年');
  console.log('  - 鳳閣星: 胸か腹に配置');
  console.log('  - 禄存星: 腹に配置');
  console.log('  - 調舒星: 左手か胸に配置');
  console.log('  - 巳午天中殺: 30代前半の変革期');
  console.log('  - 日干: 庚辛（金）が望ましい');
}

// ============================================================
// メイン実行
// ============================================================

function main(): void {
  console.log('藤堂慧の命式候補日を探索します...\n');

  const candidates = exploreAll();
  printSummary(candidates);

  const top3 = candidates.slice(0, 3);
  top3.forEach((c, i) => printCandidate(c, i + 1));

  if (candidates.length === 0) {
    console.log('\n⚠️  条件を満たす候補日が見つかりませんでした。');
    console.log('探索条件を緩和することを検討してください。');
  }
}

// 実行
main();
