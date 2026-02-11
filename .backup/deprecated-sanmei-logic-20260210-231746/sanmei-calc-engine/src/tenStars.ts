/**
 * tenStars.ts - 十大主星計算エンジン
 *
 * 十大主星（じゅうたいしゅうせい）は通変星から派生する10の主要な星。
 * 四柱推命の基本となる星の配置を計算します。
 */

import type {
  FourPillars,
  TenStarChart,
  TsuhenSei,
  TenStar,
  Pillar,
} from './types';
import {
  STEMS,
  BRANCHES,
  ELEMENT_MAP,
  YIN_YANG_MAP,
  GENERATION_RELATIONS,
  CONTROL_RELATIONS,
  HIDDEN_STEMS,
} from './constants';

/**
 * 天干の五行を取得
 * @param stem - 天干のインデックス (0-9)
 * @returns 五行 ('木', '火', '土', '金', '水')
 */
function getStemElement(stem: number): string {
  return ELEMENT_MAP[STEMS[stem]];
}

/**
 * 天干の陰陽を取得
 * @param stem - 天干のインデックス (0-9)
 * @returns true = 陽, false = 陰
 */
function getStemPolarity(stem: number): boolean {
  return YIN_YANG_MAP[STEMS[stem]];
}

/**
 * 5行間の相生関係をチェック
 * (木→火→土→金→水→木)
 * @param source - ジェネレーション元の5行
 * @param target - ジェネレーション対象の5行
 * @returns sourceがtargetを生成する場合true
 */
function checksGeneration(source: string, target: string): boolean {
  return GENERATION_RELATIONS[source] === target;
}

/**
 * 5行間の相剋（制御）関係をチェック
 * (木→土→水→火→金→木)
 * @param source - コントロール元の5行
 * @param target - コントロール対象の5行
 * @returns sourceがtargetを制御する場合true
 */
function checksControl(source: string, target: string): boolean {
  return CONTROL_RELATIONS[source] === target;
}

/**
 * 日干と対象天干から通変星を導出
 *
 * 通変星の判定ロジック：
 * 1. 同じ五行かチェック
 * 2. 相生（生成）関係をチェック
 * 3. 相剋（制御）関係をチェック
 * 4. 逆相剋と逆相生をチェック
 *
 * @param dayStem - 日干のインデックス
 * @param targetStem - 対象天干のインデックス
 * @returns 通変星の種類
 */
function deriveTsuhenSei(dayStem: number, targetStem: number): TsuhenSei {
  const dayElement = getStemElement(dayStem);
  const targetElement = getStemElement(targetStem);
  const dayPolarity = getStemPolarity(dayStem);
  const targetPolarity = getStemPolarity(targetStem);

  const samePolarity = dayPolarity === targetPolarity;

  // 同一五行の場合
  if (dayElement === targetElement) {
    return samePolarity ? '比肩' : '劫財';
  }

  // 日干が対象を生成する場合
  if (checksGeneration(dayElement, targetElement)) {
    return samePolarity ? '食神' : '傷官';
  }

  // 日干が対象を制御する場合
  if (checksControl(dayElement, targetElement)) {
    return samePolarity ? '偏財' : '正財';
  }

  // 対象が日干を制御する場合
  if (checksControl(targetElement, dayElement)) {
    return samePolarity ? '偏官' : '正官';
  }

  // 対象が日干を生成する場合
  if (checksGeneration(targetElement, dayElement)) {
    return samePolarity ? '印綬' : '偏印';
  }

  // デフォルト（エラーハンドリング）
  throw new Error(`Unable to determine Tsuhensei for day stem ${dayStem} and target stem ${targetStem}`);
}

/**
 * 通変星を十大主星にマッピング
 * @param tsuhensei - 通変星
 * @returns 十大主星
 */
function mapTsuhenToTenStar(tsuhensei: TsuhenSei): TenStar {
  const mapping: Record<TsuhenSei, TenStar> = {
    '比肩': '貫索星',
    '劫財': '石門星',
    '食神': '鳳閣星',
    '傷官': '調舒星',
    '偏財': '禄存星',
    '正財': '司禄星',
    '偏官': '車騎星',
    '正官': '牽牛星',
    '偏印': '龍高星',
    '印綬': '玉堂星'
  };
  return mapping[tsuhensei];
}

/**
 * 四柱から十大主星チャートを計算
 *
 * 十大主星の配置（人体星図）：
 * - 頭：年干 vs 日干
 * - 胸：月支の蔵干 vs 日干
 * - 右手：日支の蔵干 vs 日干（自分の星）
 * - 左手：年支の蔵干 vs 日干
 * - 腹：月干 vs 日干
 *
 * @param fourPillars - 四柱 {year, month, day, hour} (各Pillar型)
 * @returns 十大主星チャート
 */
export function calculateTenStars(
  fourPillars: FourPillars
): TenStarChart {
  const dayStem = fourPillars.day.stem;
  const dayBranch = fourPillars.day.branch;

  const yearStem = fourPillars.year.stem;
  const yearBranch = fourPillars.year.branch;

  const monthStem = fourPillars.month.stem;
  const monthBranch = fourPillars.month.branch;

  // Convert stems to indices for deriveTsuhenSei
  const dayStemIdx = STEMS.indexOf(dayStem);
  const yearStemIdx = STEMS.indexOf(yearStem);
  const monthStemIdx = STEMS.indexOf(monthStem);

  // 蔵干情報から隠れた干を取得
  const monthHiddenStem = HIDDEN_STEMS[monthBranch].main;
  const dayHiddenStem = HIDDEN_STEMS[dayBranch].main;
  const yearHiddenStem = HIDDEN_STEMS[yearBranch].main;

  const monthHiddenStemIdx = STEMS.indexOf(monthHiddenStem);
  const dayHiddenStemIdx = STEMS.indexOf(dayHiddenStem);
  const yearHiddenStemIdx = STEMS.indexOf(yearHiddenStem);

  return {
    // 頭（Head）：年干 vs 日干
    head: {
      star: mapTsuhenToTenStar(deriveTsuhenSei(dayStemIdx, yearStemIdx)),
      comparisonStem: yearStem,
      position: '頭'
    },
    // 胸（Chest）：月支の蔵干 vs 日干
    chest: {
      star: mapTsuhenToTenStar(deriveTsuhenSei(dayStemIdx, monthHiddenStemIdx)),
      comparisonStem: monthHiddenStem,
      position: '胸'
    },
    // 右手（Right Hand）：日支の蔵干 vs 日干（自分の星）
    rightHand: {
      star: mapTsuhenToTenStar(deriveTsuhenSei(dayStemIdx, dayHiddenStemIdx)),
      comparisonStem: dayHiddenStem,
      position: '右手',
      isSelf: true
    },
    // 左手（Left Hand）：年支の蔵干 vs 日干
    leftHand: {
      star: mapTsuhenToTenStar(deriveTsuhenSei(dayStemIdx, yearHiddenStemIdx)),
      comparisonStem: yearHiddenStem,
      position: '左手'
    },
    // 腹（Belly）：月干 vs 日干
    belly: {
      star: mapTsuhenToTenStar(deriveTsuhenSei(dayStemIdx, monthStemIdx)),
      comparisonStem: monthStem,
      position: '腹'
    }
  };
}

/**
 * 通変星から日干と対象天干の関係を説明
 * @param dayStemValue - 日干の文字
 * @param targetStemValue - 対象天干の文字
 * @returns 日本語の関係説明
 */
export function getTsuhenExplanation(dayStemValue: string, targetStemValue: string): string {
  const dayStemIdx = STEMS.indexOf(dayStemValue as typeof STEMS[number]);
  const targetStemIdx = STEMS.indexOf(targetStemValue as typeof STEMS[number]);

  if (dayStemIdx === -1 || targetStemIdx === -1) {
    throw new Error('Invalid stem values provided');
  }

  const tsuhensei = deriveTsuhenSei(dayStemIdx, targetStemIdx);
  const tenStar = mapTsuhenToTenStar(tsuhensei);

  return `${dayStemValue}と${targetStemValue}の関係は「${tsuhensei}」であり、十大主星は「${tenStar}」です`;
}
