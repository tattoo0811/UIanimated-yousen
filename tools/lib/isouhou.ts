/**
 * 算命学 位相法（干支の関係判定）
 * 大運・年運と命式との関係（西方/中央/東方）算出に使用
 *
 * AI創作用: 構造化データでストーリー生成の負担を軽減
 */

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const SHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// === 干（十干）の関係 ===

/** 干合の組み合わせ（5組） */
const KANGO_PAIRS: [string, string][] = [
  ['甲', '己'],
  ['乙', '庚'],
  ['丙', '辛'],
  ['丁', '壬'],
  ['戊', '癸'],
];

/** 干合をチェック */
export function getKango(gan1: string, gan2: string): boolean {
  return KANGO_PAIRS.some(
    ([a, b]) => (a === gan1 && b === gan2) || (a === gan2 && b === gan1)
  );
}

/** 五行から通変（比和/相生/相剋）を判定 */
const GOGYO: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
  '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

export function getTsuuhen(gan1: string, gan2: string): '比' | '相生' | '相剋' | '干合' {
  if (getKango(gan1, gan2)) return '干合';
  const g1 = GOGYO[gan1] || '土';
  const g2 = GOGYO[gan2] || '土';
  if (g1 === g2) return '比';
  const sei: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const koku: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
  if (sei[g1] === g2 || sei[g2] === g1) return '相生';
  if (koku[g1] === g2 || koku[g2] === g1) return '相剋';
  return '比';
}

// === 支（十二支）の関係 ===

/** 支合（六合） */
const SHIGO_PAIRS: [string, string][] = [
  ['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未'],
];

/** 対冲（六冲） */
const TAICHO_PAIRS: [string, string][] = [
  ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

/** 半会（2支ずつ）春:寅卯辰 夏:巳午未 秋:申酉戌 冬:亥子丑 */
const HANKAI_GROUPS: [string, string][] = [
  ['寅', '卯'], ['卯', '辰'], ['巳', '午'], ['午', '未'],
  ['申', '酉'], ['酉', '戌'], ['亥', '子'], ['子', '丑'],
];

/** 害（六害） */
const GAI_PAIRS: [string, string][] = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
];

/** 刑（三刑＋自刑） */
function getKei(shi1: string, shi2: string): boolean {
  const keiGroups: [string, string][] = [
    ['巳', '申'], ['申', '寅'], ['寅', '巳'],
    ['丑', '戌'], ['戌', '未'], ['未', '丑'],
    ['子', '卯'], ['卯', '子'],
  ];
  const jikei = ['午', '辰', '酉', '亥'];
  if (shi1 === shi2 && jikei.includes(shi1)) return true;
  return keiGroups.some(([a, b]) => (a === shi1 && b === shi2) || (a === shi2 && b === shi1));
}

/** 破（支破） */
const HA_PAIRS: [string, string][] = [
  ['子', '酉'], ['丑', '辰'], ['寅', '亥'], ['卯', '午'], ['巳', '申'], ['未', '戌'],
];

function checkPair(pairs: [string, string][], shi1: string, shi2: string): boolean {
  return pairs.some(
    ([a, b]) => (a === shi1 && b === shi2) || (a === shi2 && b === shi1)
  );
}

export interface IsouhouResult {
  shigo: boolean;   // 支合
  taicho: boolean;  // 対冲
  hankai: boolean;  // 半会
  gai: boolean;     // 害
  kei: boolean;     // 刑
  ha: boolean;      // 破
  /** 人間が読みやすいラベル（複数ある場合は併記） */
  labels: string[];
}

/** 二つの十二支の位相法関係を算出 */
export function getIsouhou(shi1: string, shi2: string): IsouhouResult {
  const shigo = checkPair(SHIGO_PAIRS, shi1, shi2);
  const taicho = checkPair(TAICHO_PAIRS, shi1, shi2);
  const hankai = checkPair(HANKAI_GROUPS, shi1, shi2);
  const gai = checkPair(GAI_PAIRS, shi1, shi2);
  const kei = getKei(shi1, shi2);
  const ha = checkPair(HA_PAIRS, shi1, shi2);

  const labels: string[] = [];
  if (shigo) labels.push('支合');
  if (taicho) labels.push('対冲');
  if (hankai) labels.push('半会');
  if (gai) labels.push('害');
  if (kei) labels.push('刑');
  if (ha) labels.push('破');

  return { shigo, taicho, hankai, gai, kei, ha, labels };
}

/** 西方/中央/東方の表示用ラベル生成 */
export function getRelationLabel(
  unGan: string,
  unShi: string,
  targetGan: string,
  targetShi: string
): string {
  const parts: string[] = [];

  // 干の関係
  const kango = getKango(unGan, targetGan);
  const tsuuhen = getTsuuhen(unGan, targetGan);
  if (kango) parts.push('干合');
  else if (tsuuhen === '比') parts.push('比');
  else if (tsuuhen === '相生' || tsuuhen === '相剋') parts.push(tsuuhen);

  // 支の関係
  const isou = getIsouhou(unShi, targetShi);
  if (isou.taicho) parts.push('対冲');
  if (isou.shigo) parts.push('支合');
  if (isou.hankai) parts.push('半会');
  if (isou.gai) parts.push('害');
  if (isou.kei) parts.push('刑');
  if (isou.ha) parts.push('破');

  return parts.length > 0 ? parts.join('・') : '―';
}
