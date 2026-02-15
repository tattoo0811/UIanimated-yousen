/**
 * 算命学 位相法（干支の関係判定）
 * 
 * 位相法（融合・分離）:
 *   支合（しごう）、半会（はんかい）、対冲（たいちゅう）
 *   刑（けい：生貴刑・庫気刑・旺気刑・自刑）、害（がい）、破（は）
 * 
 * 特殊位相法:
 *   天剋地冲（てんこくちちゅう）：天干が相剋（七殺）で、地支が対冲
 *   納音（なっちん）：天干が同じで、地支が対冲
 *   律音（りっちん）：干支が全く同じ
 *   干合（かんごう）：天干が引き合う関係
 *   干合支合：干合＋支合が同時成立
 *   干合支害：干合＋害が同時成立
 */

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

const KANGO_PAIRS: [string, string][] = [
  ['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸'],
];

const GOGYO: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
  '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

// 支合（しごう）
const SHIGO_PAIRS: [string, string][] = [
  ['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未'],
];

// 対冲（たいちゅう）
const TAICHO_PAIRS: [string, string][] = [
  ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

// 三合（半会判定用）
const SANGO_GROUPS: string[][] = [
  ['寅', '午', '戌'], // 火局
  ['巳', '酉', '丑'], // 金局
  ['申', '子', '辰'], // 水局
  ['亥', '卯', '未'], // 木局
];

// 害（がい）
const GAI_PAIRS: [string, string][] = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
];

// 破（は）
const HA_PAIRS: [string, string][] = [
  ['子', '酉'], ['丑', '辰'], ['寅', '亥'], ['卯', '午'], ['巳', '申'], ['未', '戌'],
];

// 刑（けい）- サブタイプ付き
const KEI_MAP: Record<string, Array<{ target: string; label: string }>> = {
  '子': [{ target: '卯', label: '旺気刑' }],
  '卯': [{ target: '子', label: '旺気刑' }],
  '寅': [{ target: '巳', label: '生貴刑' }, { target: '申', label: '生貴刑' }],
  '巳': [{ target: '寅', label: '生貴刑' }, { target: '申', label: '生貴刑' }],
  '申': [{ target: '寅', label: '生貴刑' }, { target: '巳', label: '生貴刑' }],
  '丑': [{ target: '戌', label: '庫気刑' }, { target: '未', label: '庫気刑' }],
  '戌': [{ target: '丑', label: '庫気刑' }, { target: '未', label: '庫気刑' }],
  '未': [{ target: '丑', label: '庫気刑' }, { target: '戌', label: '庫気刑' }],
  '辰': [{ target: '辰', label: '自刑' }],
  '午': [{ target: '午', label: '自刑' }],
  '酉': [{ target: '酉', label: '自刑' }],
  '亥': [{ target: '亥', label: '自刑' }],
};

// 本気蔵干
export const HONKI: Record<string, string> = {
  '子': '癸', '丑': '己', '寅': '甲', '卯': '乙', '辰': '戊', '巳': '丙',
  '午': '丁', '未': '己', '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬',
};

// --- 判定ヘルパー ---

function isKango(gan1: string, gan2: string): boolean {
  return KANGO_PAIRS.some(([a, b]) => (a === gan1 && b === gan2) || (a === gan2 && b === gan1));
}

/** 七殺（相剋で陰陽同じ） = 天干index差が4または6 */
function isShichisatsu(gan1: string, gan2: string): boolean {
  const idx1 = GAN.indexOf(gan1);
  const idx2 = GAN.indexOf(gan2);
  const diff = Math.abs(idx1 - idx2);
  return diff === 4 || diff === 6;
}

function checkPair(pairs: [string, string][], shi1: string, shi2: string): boolean {
  return pairs.some(([a, b]) => (a === shi1 && b === shi2) || (a === shi2 && b === shi1));
}

/** 通変（干の五行関係） */
function getTsuuhen(gan1: string, gan2: string): '比' | '相生' | '相剋' | '干合' {
  if (isKango(gan1, gan2)) return '干合';
  const g1 = GOGYO[gan1] || '土';
  const g2 = GOGYO[gan2] || '土';
  if (g1 === g2) return '比';
  const sei: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const koku: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
  if (sei[g1] === g2 || sei[g2] === g1) return '相生';
  if (koku[g1] === g2 || koku[g2] === g1) return '相剋';
  return '比';
}

/** 刑の判定（サブタイプ付き） */
function getKeiLabel(shi1: string, shi2: string): string | null {
  const entries = KEI_MAP[shi1];
  if (!entries) return null;
  const match = entries.find(e => e.target === shi2);
  return match ? match.label : null;
}

// --- 位相法カテゴリ ---

export type IsohoCategory = 'gouhou' | 'sanpou' | 'tokushu' | 'chuui';

export interface IsohoLabel {
  name: string;
  category: IsohoCategory;
}

/** 位相法カテゴリ判定 */
function categorize(name: string): IsohoCategory {
  // 合法（融合）
  if (['支合', '半会', '干合', '干合支合'].includes(name)) return 'gouhou';
  // 散法（分離）
  if (['対冲', '天剋地冲'].includes(name)) return 'sanpou';
  // 特殊
  if (['納音', '律音', '干合支害'].includes(name)) return 'tokushu';
  // 注意（刑・害・破）
  return 'chuui';
}

// --- メイン関数 ---

/**
 * 位相法ラベルを詳細に取得（特殊位相法を含む）
 * rev-sanmei-v4.ts の getIsohoList と同等のロジック
 */
export function getRelationLabel(
  unGan: string, unShi: string,
  targetGan: string, targetShi: string
): string {
  const labels = getRelationLabels(unGan, unShi, targetGan, targetShi);
  return labels.length > 0 ? labels.map(l => l.name).join('・') : '―';
}

/**
 * 位相法ラベルを構造化データとして取得（カテゴリ付き）
 */
export function getRelationLabels(
  unGan: string, unShi: string,
  targetGan: string, targetShi: string
): IsohoLabel[] {
  const list: IsohoLabel[] = [];

  const ganDiff = Math.abs(GAN.indexOf(unGan) - GAN.indexOf(targetGan));
  const isGanKoku = isShichisatsu(unGan, targetGan);
  const isGanSame = unGan === targetGan;
  const isGanGou = ganDiff === 5; // 干合

  const isShiChu = checkPair(TAICHO_PAIRS, unShi, targetShi);

  // 1. 天剋地冲（最優先：天干が七殺＋地支が対冲）
  if (isGanKoku && isShiChu) {
    list.push({ name: '天剋地冲', category: 'sanpou' });
  } else if (isShiChu) {
    list.push({ name: '対冲', category: 'sanpou' });
  }

  // 2. 納音（天干同じ＋地支対冲）
  if (isGanSame && isShiChu) {
    list.push({ name: '納音', category: 'tokushu' });
  }

  // 3. 律音（干支完全一致）
  if (isGanSame && unShi === targetShi) {
    list.push({ name: '律音', category: 'tokushu' });
  }

  // 4. 干合（+ 支合/支害の複合判定）
  if (isGanGou) {
    if (checkPair(SHIGO_PAIRS, unShi, targetShi)) {
      list.push({ name: '干合支合', category: 'gouhou' });
    } else if (checkPair(GAI_PAIRS, unShi, targetShi)) {
      list.push({ name: '干合支害', category: 'tokushu' });
    } else {
      list.push({ name: '干合', category: 'gouhou' });
    }
  }

  // 5. 支合（干合支合と重複しない）
  if (checkPair(SHIGO_PAIRS, unShi, targetShi) && !list.some(l => l.name === '干合支合')) {
    list.push({ name: '支合', category: 'gouhou' });
  }

  // 6. 刑（サブタイプ付き）
  const keiLabel = getKeiLabel(unShi, targetShi);
  if (keiLabel) {
    list.push({ name: keiLabel, category: 'chuui' });
  }

  // 7. 害（干合支害と重複しない）
  if (checkPair(GAI_PAIRS, unShi, targetShi) && !list.some(l => l.name === '干合支害')) {
    list.push({ name: '害', category: 'chuui' });
  }

  // 8. 破（対冲と重ならない場合のみ）
  if (checkPair(HA_PAIRS, unShi, targetShi) && !isShiChu) {
    list.push({ name: '破', category: 'chuui' });
  }

  // 9. 半会（三合のうち2支が揃う）
  if (unShi !== targetShi) {
    for (const group of SANGO_GROUPS) {
      if (group.includes(unShi) && group.includes(targetShi)) {
        list.push({ name: '半会', category: 'gouhou' });
        break;
      }
    }
  }

  return list;
}

// 通変関係（天干のみの五行関係）を取得
export { getTsuuhen };
