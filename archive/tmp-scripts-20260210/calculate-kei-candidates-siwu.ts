/**
 * 藤堂慧の命式候補日探索スクリプト（巳午天中殺特化版）
 *
 * 巳午天中殺を持つ候補に焦点を当てて探索
 */

import { Solar } from 'lunar-javascript';
import { calculateBaZi } from '../mobile/lib/logic/bazi';
import { calculateYangSen } from '../mobile/lib/logic/yangsen';
import { calculateSanmeigakuInsen } from '../mobile/lib/logic/insen';

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
  dayPolarity: '陽' | '陰';
  age: number;
  score: number;
  details: string[];
}

// ============================================================
// 定数
// ============================================================

const REQUIRED_STARS = {
  FUGEKO: '鳳閣星',
  ROKUZON: '禄存星',
  CHOJO: '調舒星',
};

// ============================================================
// ヘルパー関数
// ============================================================

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSiWuTenchusatsu(tenchusatsu: string): boolean {
  return tenchusatsu === '巳午天中殺';
}

function isMetalDayStem(dayStem: string): boolean {
  return dayStem === '庚' || dayStem === '辛';
}

function getPolarity(dayStem: string): '陽' | '陰' {
  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  return yangStems.includes(dayStem) ? '陽' : '陰';
}

/**
 * 星の性格特性を取得
 */
function getStarCharacteristics(starName: string): string[] {
  const characteristics: Record<string, string[]> = {
    '鳳閣星': ['表現の場', '承認欲求', 'クリエイティブ', '華やかさ'],
    '禄存星': ['保守的', '安定志向', '堅実', '継続力'],
    '調舒星': ['感受性が強い', '繊細', '美的感覚', '共感性'],
    '貫索星': ['指導力', '自主性', '率先力', '責任感'],
    '石門星': ['慎重', '控えめ', '観察力', '内向的'],
    '司禄星': ['資質', '才能', '貴族的', '洗練'],
    '車騎星': ['行動力', '実行力', '気力', '推進力'],
    '牽牛星': ['義務感', '規律', '組織力', '勤勉'],
    '龍高星': ['知識', '学習', '分析力', '論理的'],
    '玉堂星': ['包容力', '受容力', '調和', '平和'],
  };
  return characteristics[starName] || [];
}

/**
 * 候補者をスコアリング
 */
function scoreCandidate(result: CandidateResult): number {
  let score = 0;
  const details: string[] = [];

  // 鳳閣星の配置
  if (result.yangSen.chest === REQUIRED_STARS.FUGEKO) {
    score += 40;
    details.push(`鳳閣星@胸: +40`);
  } else if (result.yangSen.belly === REQUIRED_STARS.FUGEKO) {
    score += 35;
    details.push(`鳳閣星@腹: +35`);
  } else if (result.yangSen.head === REQUIRED_STARS.FUGEKO) {
    score += 20;
    details.push(`鳳閣星@頭: +20`);
  } else if (result.yangSen.leftHand === REQUIRED_STARS.FUGEKO) {
    score += 15;
    details.push(`鳳閣星@左手: +15`);
  } else if (result.yangSen.rightHand === REQUIRED_STARS.FUGEKO) {
    score += 15;
    details.push(`鳳閣星@右手: +15`);
  }

  // 禄存星の配置
  if (result.yangSen.belly === REQUIRED_STARS.ROKUZON) {
    score += 30;
    details.push(`禄存星@腹: +30`);
  } else if (result.yangSen.chest === REQUIRED_STARS.ROKUZON) {
    score += 25;
    details.push(`禄存星@胸: +25`);
  } else if (result.yangSen.head === REQUIRED_STARS.ROKUZON) {
    score += 15;
    details.push(`禄存星@頭: +15`);
  }

  // 調舒星の配置
  if (result.yangSen.leftHand === REQUIRED_STARS.CHOJO) {
    score += 25;
    details.push(`調舒星@左手: +25`);
  } else if (result.yangSen.chest === REQUIRED_STARS.CHOJO) {
    score += 20;
    details.push(`調舒星@胸: +20`);
  } else if (result.yangSen.rightHand === REQUIRED_STARS.CHOJO) {
    score += 15;
    details.push(`調舒星@右手: +15`);
  }

  // 日干が庚辛
  if (isMetalDayStem(result.dayStem)) {
    score += 20;
    details.push(`日干が金(${result.dayStem}): +20`);
  } else {
    details.push(`日干が${result.dayStem}: +0`);
  }

  // 巳午天中殺ボーナス
  if (isSiWuTenchusatsu(result.tenchusatsu)) {
    score += 30;
    details.push(`巳午天中殺: +30`);
  }

  // 日干が陽か陰か
  if (result.dayPolarity === '陽') {
    score += 5;
    details.push(`日干が陽: +5`);
  }

  result.details = details;
  result.score = score;

  return score;
}

/**
 * 必須最低条件を満たしているか判定
 */
function meetsMinimumConditions(result: CandidateResult): boolean {
  const hasFugeko = [
    result.yangSen.head,
    result.yangSen.rightHand,
    result.yangSen.chest,
    result.yangSen.leftHand,
    result.yangSen.belly,
  ].includes(REQUIRED_STARS.FUGEKO);

  const hasRokuzon = [
    result.yangSen.head,
    result.yangSen.rightHand,
    result.yangSen.chest,
    result.yangSen.leftHand,
    result.yangSen.belly,
  ].includes(REQUIRED_STARS.ROKUZON);

  const hasChojyo = [
    result.yangSen.head,
    result.yangSen.rightHand,
    result.yangSen.chest,
    result.yangSen.leftHand,
    result.yangSen.belly,
  ].includes(REQUIRED_STARS.CHOJO);

  return hasFugeko && hasRokuzon && hasChojyo;
}

/**
 * 現在の年齢（2026年時点）を計算
 */
function calculateAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date('2026-02-09');
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ============================================================
// 探索関数
// ============================================================

/**
 * 指定年の候補日を探索
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

    // 巳午天中殺のみにフィルタ
    if (insen.tenchusatsu.type !== '巳午天中殺') continue;

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
      dayPolarity: getPolarity(bazi.day.stemStr),
      age: 0,
      score: 0,
      details: [],
    };

    result.age = calculateAge(result.birthDate);

    if (meetsMinimumConditions(result)) {
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
    console.log(`探索中: ${year}年 (巳午天中殺のみ)...`);
    const yearCandidates = exploreCandidates(year);
    console.log(`  -> ${yearCandidates.length}件の候補を発見`);
    allCandidates.push(...yearCandidates);
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
  console.log(`候補第${rank}位 (スコア: ${candidate.score}点) - ${candidate.age}歳`);
  console.log('='.repeat(70));
  console.log(`生年月日: ${candidate.birthDate}`);
  console.log(`日柱: ${candidate.dayPillar} (日干: ${candidate.dayStem}${candidate.dayPolarity})`);
  console.log(`天中殺: ${candidate.tenchusatsu} (自己表現・コミュニケーション・行動での変革期)`);

  // 天中殺年齢計算
  const tenchusatsuAges = calculateTenchusatsuAge(candidate.birthDate);
  console.log(`  -> 変革期: ${tenchusatsuAges.start}歳〜${tenchusatsuAges.end}歳頃`);

  console.log('\n【陽占（十大主星）】');
  console.log(`  頭:    ${candidate.yangSen.head} ${getStarCharacteristics(candidate.yangSen.head).slice(0, 2).join('・')}`);
  console.log(`  右手:  ${candidate.yangSen.rightHand} ${getStarCharacteristics(candidate.yangSen.rightHand).slice(0, 2).join('・')}`);
  console.log(`  胸:    ${candidate.yangSen.chest} ${getStarCharacteristics(candidate.yangSen.chest).slice(0, 2).join('・')}`);
  console.log(`  左手:  ${candidate.yangSen.leftHand} ${getStarCharacteristics(candidate.yangSen.leftHand).slice(0, 2).join('・')}`);
  console.log(`  腹:    ${candidate.yangSen.belly} ${getStarCharacteristics(candidate.yangSen.belly).slice(0, 2).join('・')}`);
  console.log('\n【十二大従星】');
  console.log(`  左肩: ${candidate.twelveStars.leftShoulder}`);
  console.log(`  左足: ${candidate.twelveStars.leftLeg}`);
  console.log(`  右足: ${candidate.twelveStars.rightLeg}`);
  console.log('\n【スコア内訳】');
  candidate.details.forEach(detail => console.log(`  ${detail}`));
}

/**
 * 天中殺の年齢を計算（簡易版）
 * 巳午天中殺は日支が辰・巳の間にある場合に発生
 * 一般的に前後2-3年が影響期
 */
function calculateTenchusatsuAge(birthDateStr: string): { start: number; end: number } {
  const birth = new Date(birthDateStr);
  const baseAge = Math.floor((2026 - birth.getFullYear()) / 2);
  return { start: baseAge - 2, end: baseAge + 2 };
}

/**
 * サマリー表示
 */
function printSummary(candidates: CandidateResult[]): void {
  console.log('\n' + '#'.repeat(70));
  console.log('# 藤堂慧 命式候補日探索結果（巳午天中殺特化版）');
  console.log('#'.repeat(70));
  console.log(`\n総候補数: ${candidates.length}件`);
  console.log('\n探索条件:');
  console.log('  - 生年: 1988-1992年');
  console.log('  - 天中殺: 巳午天中殺のみ');
  console.log('  - 必須: 鳳閣星・禄存星・調舒星が配置されている');
}

// ============================================================
// メイン実行
// ============================================================

function main(): void {
  console.log('藤堂慧の命式候補日を探索します（巳午天中殺特化版）...\n');

  const candidates = exploreAll();
  printSummary(candidates);

  if (candidates.length === 0) {
    console.log('\n⚠️  巳午天中殺で条件を満たす候補日が見つかりませんでした。');
    console.log('辰巳天中殺（近い効果）の候補を探索します...');

    // 辰巳天中殺の候補を探索
    const chenSiCandidates = exploreChenSiCandidates();
    if (chenSiCandidates.length > 0) {
      console.log(`\n🔍 辰巳天中殺の候補: ${chenSiCandidates.length}件見つかりました`);
      chenSiCandidates.slice(0, 5).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.birthDate} (${c.dayPillar}) - スコア: ${c.score}`);
      });
    }
  } else {
    const top5 = candidates.slice(0, Math.min(5, candidates.length));
    top5.forEach((c, i) => printCandidate(c, i + 1));
  }
}

/**
 * 辰巳天中殺の候補を探索
 */
function exploreChenSiCandidates(): CandidateResult[] {
  const candidates: CandidateResult[] = [];

  for (let year = 1988; year <= 1992; year++) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      const bazi = calculateBaZi(date);
      const yangSen = calculateYangSen(bazi, date);
      const insen = calculateSanmeigakuInsen(bazi, date);

      if (insen.tenchusatsu.type !== '辰巳天中殺') continue;

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
        dayPolarity: getPolarity(bazi.day.stemStr),
        age: calculateAge(formatDate(date)),
        score: 0,
        details: [],
      };

      if (meetsMinimumConditions(result)) {
        scoreCandidate(result);
        candidates.push(result);
      }
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

// 実行
main();
