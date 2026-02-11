/**
 * 藤堂慧の命式候補日探索スクリプト（日干が金・特化版）
 *
 * 日干が庚辛（金）の候補に焦点を当てて探索
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
  tenchusatsuAge: { start: number; end: number; description: string };
  score: number;
  details: string[];
  character: string;  // 物語的なキャラクター評価
}

// ============================================================
// 定数
// ============================================================

const REQUIRED_STARS = {
  FUGEKO: '鳳閣星',
  ROKUZON: '禄存星',
  CHOJO: '調舒星',
};

// 天中殺の年齢計算（簡易版）
function calculateTenchusatsuAge(birthDateStr: string, tenchusatsu: string): { start: number; end: number; description: string } {
  const birth = new Date(birthDateStr);
  const currentYear = 2026;
  const age = currentYear - birth.getFullYear();

  const descriptions: Record<string, string> = {
    '戌亥天中殺': '社会的成功・承認・自己表現での変革期',
    '申酉天中殺': '対人関係・パートナーシップでの変革期',
    '午未天中殺': '内面・精神的成長・創造性での変革期',
    '辰巳天中殺': '自己表現・コミュニケーション・行動での変革期',
    '寅卯天中殺': 'キャリア・社会的地位・目標達成での変革期',
    '子丑天中殺': '家庭・基盤・安定感での変革期',
  };

  // 天中殺は一般的に前後2-3年が影響期
  // 30代前半〜中半（34-36歳頃）に来るのが理想
  const baseAge = 35;  // 目標年齢

  return {
    start: baseAge - 2,
    end: baseAge + 2,
    description: descriptions[tenchusatsu] || tenchusatsu
  };
}

// ============================================================
// ヘルパー関数
// ============================================================

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
 * 物語的なキャラクター評価を生成
 */
function generateCharacterAssessment(result: CandidateResult): string {
  const traits: string[] = [];

  // 鳳閣星の位置による評価
  if (result.yangSen.chest === REQUIRED_STARS.FUGEKO) {
    traits.push('胸に鳳閣星＝心の中央に表現欲求があり、内面から溢れ出るクリエイティビティ');
  } else if (result.yangSen.belly === REQUIRED_STARS.FUGEKO) {
    traits.push('腹に鳳閣星＝行動の原動力としての表現欲求、実現に向けてのエネルギー');
  } else if (result.yangSen.head === REQUIRED_STARS.FUGEKO) {
    traits.push('頭に鳳閣星＝アイデンティティそのものが表現志向、自分らしい生き方を追求');
  }

  // 禄存星の位置による評価
  if (result.yangSen.belly === REQUIRED_STARS.ROKUZON) {
    traits.push('腹に禄存星＝基盤となる保守性、堅実な行動で成果を積み重ねる');
  } else if (result.yangSen.chest === REQUIRED_STARS.ROKUZON) {
    traits.push('胸に禄存星＝心の安定を重視、感情的な安定から来る強さ');
  }

  // 調舒星の位置による評価
  if (result.yangSen.leftHand === REQUIRED_STARS.CHOJO) {
    traits.push('左手に調舒星＝感受性を通じて他者に働きかける、共感的な表現');
  } else if (result.yangSen.chest === REQUIRED_STARS.CHOJO) {
    traits.push('胸に調舒星＝豊かな感受性を内に秘め、心の動きが表現の源');
  }

  // 日干の五行
  if (result.dayStem === '庚') {
    traits.push('日干が庚陽＝強固な意志、 restructuring の力、厳しさの中に優しさ');
  } else if (result.dayStem === '辛') {
    traits.push('日干が辛陰＝繊細な感性、正確さ、美しさへのこだわり');
  }

  // 天中殺による評価
  if (result.tenchusatsu === '辰巳天中殺') {
    traits.push('辰巳天中殺＝自己表現とコミュニケーションの変革期（物語の核心に近い）');
  } else if (result.tenchusatsu === '申酉天中殺') {
    traits.push('申酉天中殺＝対人関係と協働の変革期（巡との関係性に直結）');
  }

  return traits.join('、');
}

/**
 * 候補者をスコアリング（詳細版）
 */
function scoreCandidate(result: CandidateResult): number {
  let score = 0;
  const details: string[] = [];

  // 鳳閣星の配置（最重要）
  if (result.yangSen.chest === REQUIRED_STARS.FUGEKO) {
    score += 35;
    details.push(`鳳閣星@胸: +35`);
  } else if (result.yangSen.belly === REQUIRED_STARS.FUGEKO) {
    score += 30;
    details.push(`鳳閣星@腹: +30`);
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
    score += 25;
    details.push(`禄存星@腹: +25`);
  } else if (result.yangSen.chest === REQUIRED_STARS.ROKUZON) {
    score += 20;
    details.push(`禄存星@胸: +20`);
  } else if (result.yangSen.head === REQUIRED_STARS.ROKUZON) {
    score += 15;
    details.push(`禄存星@頭: +15`);
  }

  // 調舒星の配置
  if (result.yangSen.leftHand === REQUIRED_STARS.CHOJO) {
    score += 20;
    details.push(`調舒星@左手: +20`);
  } else if (result.yangSen.chest === REQUIRED_STARS.CHOJO) {
    score += 15;
    details.push(`調舒星@胸: +15`);
  } else if (result.yangSen.rightHand === REQUIRED_STARS.CHOJO) {
    score += 10;
    details.push(`調舒星@右手: +10`);
  }

  // 日干が庚辛
  if (isMetalDayStem(result.dayStem)) {
    score += 20;
    details.push(`日干が金(${result.dayStem}): +20`);
  }

  // 天中殺評価
  if (result.tenchusatsu === '巳午天中殺') {
    score += 25;
    details.push(`巳午天中殺: +25`);
  } else if (result.tenchusatsu === '辰巳天中殺') {
    score += 20;
    details.push(`辰巳天中殺: +20`);
  } else if (result.tenchusatsu === '申酉天中殺') {
    score += 15;
    details.push(`申酉天中殺: +15`);
  } else if (result.tenchusatsu === '寅卯天中殺') {
    score += 10;
    details.push(`寅卯天中殺: +10`);
  } else {
    details.push(`${result.tenchusatsu}: +0`);
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
 * 指定年の候補日を探索（日干が金のみ）
 */
function exploreCandidates(year: number): CandidateResult[] {
  const candidates: CandidateResult[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const bazi = calculateBaZi(date);

    // 日干が庚辛のみ対象
    if (!isMetalDayStem(bazi.day.stemStr)) continue;

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
      dayPolarity: getPolarity(bazi.day.stemStr),
      age: 0,
      tenchusatsuAge: { start: 0, end: 0, description: '' },
      score: 0,
      details: [],
      character: '',
    };

    result.age = calculateAge(result.birthDate);
    result.tenchusatsuAge = calculateTenchusatsuAge(result.birthDate, result.tenchusatsu);

    if (meetsMinimumConditions(result)) {
      scoreCandidate(result);
      result.character = generateCharacterAssessment(result);
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
    console.log(`探索中: ${year}年 (日干が金のみ)...`);
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
  console.log(`天中殺: ${candidate.tenchusatsu}`);
  console.log(`  -> ${candidate.tenchusatsuAge.description}`);
  console.log(`  -> 影響期: ${candidate.tenchusatsuAge.start}歳〜${candidate.tenchusatsuAge.end}歳頃`);

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

  console.log('\n【物語的キャラクター評価】');
  console.log(`  ${candidate.character}`);
}

/**
 * サマリー表示
 */
function printSummary(candidates: CandidateResult[]): void {
  console.log('\n' + '#'.repeat(70));
  console.log('# 藤堂慧 命式候補日探索結果（日干が金・特化版）');
  console.log('#'.repeat(70));
  console.log(`\n総候補数: ${candidates.length}件`);
  console.log('\n探索条件:');
  console.log('  - 生年: 1988-1992年');
  console.log('  - 日干: 庚辛（金）のみ');
  console.log('  - 必須: 鳳閣星・禄存星・調舒星が配置されている');
}

// ============================================================
// メイン実行
// ============================================================

function main(): void {
  console.log('藤堂慧の命式候補日を探索します（日干が金・特化版）...\n');

  const candidates = exploreAll();
  printSummary(candidates);

  if (candidates.length === 0) {
    console.log('\n⚠️  条件を満たす候補日が見つかりませんでした。');
  } else {
    const top10 = candidates.slice(0, Math.min(10, candidates.length));
    top10.forEach((c, i) => printCandidate(c, i + 1));
  }
}

// 実行
main();
