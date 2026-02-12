/**
 * 3部構成データ（拡張版）
 * 基礎編・葛藤編・統合編の詳細情報
 */

export interface StoryPartDetail {
  id: 'foundation' | 'conflict' | 'integration';
  label: string;
  episodes: string;
  range: [number, number];
  period: string; // 期間（例: 2026年4月〜10月）
  theme: string; // テーマ説明
  sakuraFlashbacks: number; // さくら回想回数
  sakuraFlashbackLimit: number; // 上限回数
  color: string; // グラデーション色
}

export interface SakuraFlashbackDistribution {
  foundation: number;
  conflict: number;
  integration: number;
  total: number;
}

/**
 * 3部構成データ
 * 正典(DASHBOARD.md)から抽出した詳細情報を含む
 */
export const STORY_PARTS_DATA: StoryPartDetail[] = [
  {
    id: 'foundation',
    label: '基礎編',
    episodes: '第1-40話',
    range: [1, 40],
    period: '2026年4月〜10月',
    theme: '陰陽五行の基礎・巡の再生と美咲との出会い',
    sakuraFlashbacks: 9,
    sakuraFlashbackLimit: 8,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'conflict',
    label: '葛藤編',
    episodes: '第41-80話',
    range: [41, 80],
    period: '2026年11月〜2027年5月',
    theme: '巡×慧の対立・AI vs 運命の衝突',
    sakuraFlashbacks: 6,
    sakuraFlashbackLimit: 5,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'integration',
    label: '統合編',
    episodes: '第81-120話',
    range: [81, 120],
    period: '2027年6月〜12月',
    theme: '巡×慧×美咲の統合・新しい形の創造',
    sakuraFlashbacks: 5,
    sakuraFlashbackLimit: 4,
    color: 'from-violet-500 to-purple-600'
  }
];

/**
 * さくら回想シーン分布
 * 全20回の分布データ
 */
export const SAKURA_DISTRIBUTION: SakuraFlashbackDistribution = {
  foundation: 9,
  conflict: 6,
  integration: 5,
  total: 20
};
