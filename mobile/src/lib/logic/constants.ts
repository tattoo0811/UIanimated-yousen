import type { FiveElements } from '@/src/types';

// ============================================================
// Constants
// ============================================================

// 十干（天干）
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 十二支（地支）
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 蔵干（Hidden Stems） - 五行計算用（複数蔵干）
export const HIDDEN_STEMS: { [key: string]: string[] } = {
    '子': ['癸'],
    '丑': ['己', '癸', '辛'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '庚', '戊'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲']
};

// 陰占用蔵干（YINSEN_HIDDEN_STEMS） - 四柱推命表示用（代表蔵干）
export const YINSEN_HIDDEN_STEMS = [
    '癸', // 子 (0) - Water
    '辛', // 丑 (1) - Metal
    '丙', // 寅 (2) - Fire
    '乙', // 卯 (3) - Wood
    '乙', // 辰 (4) - Wood
    '庚', // 巳 (5) - Metal
    '丁', // 午 (6) - Fire
    '丁', // 未 (7) - Fire
    '己', // 申 (8) - Earth
    '辛', // 酉 (9) - Metal
    '丁', // 戌 (10) - Fire
    '壬'  // 亥 (11) - Water
];

// 陽占用蔵干型定義
export type HiddenStemData = {
    main: string;      // 本気
    sub?: string;      // 中気
    extra?: string;    // 余気（初気）
};

// 二十八元データ型定義
export type TwentyEightElementData = {
    extra?: { stem: string; days: number };  // 余気（初気）: 節入り後の最初のN日間
    sub?: { stem: string; days: number };    // 中気: 余気終了後の次のN日間
    main: { stem: string };                   // 本気: 残りの日数
};

// 二十八元データ
export const TWENTY_EIGHT_ELEMENTS: Record<string, TwentyEightElementData> = {
    '子': { main: { stem: '癸' } }, // 子は癸のみ
    '丑': {
        extra: { stem: '癸', days: 9 },   // 余気: 癸 (9日)
        sub: { stem: '辛', days: 3 },     // 中気: 辛 (3日)
        main: { stem: '己' }              // 本気: 己 (残り)
    },
    '寅': {
        extra: { stem: '戊', days: 7 },   // 余気: 戊 (7日)
        sub: { stem: '丙', days: 7 },     // 中気: 丙 (7日)
        main: { stem: '甲' }              // 本気: 甲 (残り)
    },
    '卯': { main: { stem: '乙' } },       // 卯は乙のみ
    '辰': {
        extra: { stem: '乙', days: 9 },   // 余気: 乙 (9日)
        sub: { stem: '癸', days: 3 },     // 中気: 癸 (3日)
        main: { stem: '戊' }              // 本気: 戊 (残り)
    },
    '巳': {
        extra: { stem: '戊', days: 5 },   // 余気: 戊 (5日) ※土気の余韻
        sub: { stem: '庚', days: 9 },     // 中気: 庚 (9日)
        main: { stem: '丙' }              // 本気: 丙 (残り)
    },
    '午': {
        extra: { stem: '丙', days: 10 },  // 余気: 丙 (10日)
        sub: { stem: '己', days: 9 },     // 中気: 己 (9日)
        main: { stem: '丁' }              // 本気: 丁 (残り)
    },
    '未': {
        extra: { stem: '丁', days: 9 },   // 余気: 丁 (9日)
        sub: { stem: '乙', days: 3 },     // 中気: 乙 (3日)
        main: { stem: '己' }              // 本気: 己 (残り)
    },
    '申': {
        extra: { stem: '戊', days: 10 },  // 余気: 戊 (10日)
        sub: { stem: '壬', days: 3 },     // 中気: 壬 (3日)
        main: { stem: '庚' }              // 本気: 庚 (残り)
    },
    '酉': { main: { stem: '辛' } },       // 酉は辛のみ
    '戌': {
        extra: { stem: '辛', days: 9 },   // 余気: 辛 (9日)
        sub: { stem: '丁', days: 3 },     // 中気: 丁 (3日)
        main: { stem: '戊' }              // 本気: 戊 (残り)
    },
    '亥': {
        extra: { stem: '甲', days: 12 },  // 余気: 甲 (12日)
        main: { stem: '壬' }              // 本気: 壬 (残り)
    }
};

// 節入り日データ
export const SOLAR_TERM_APPROX_DAYS: Record<number, number> = {
    1: 6,   // 小寒 (1月6日頃)
    2: 4,   // 立春 (2月4日頃)
    3: 6,   // 啓蟄 (3月6日頃)
    4: 5,   // 清明 (4月5日頃)
    5: 6,   // 立夏 (5月6日頃)
    6: 6,   // 芒種 (6月6日頃)
    7: 7,   // 小暑 (7月7日頃)
    8: 8,   // 立秋 (8月8日頃)
    9: 8,   // 白露 (9月8日頃)
    10: 8,  // 寒露 (10月8日頃)
    11: 7,  // 立冬 (11月7日頃)
    12: 7   // 大雪 (12月7日頃)
};

// 陽占専用の蔵干データ（後方互換性）
export const YANGSEN_HIDDEN_STEMS_DATA: Record<string, HiddenStemData> = {
    '子': { main: '癸' },
    '丑': { main: '己', sub: '癸', extra: '辛' },
    '寅': { main: '甲', sub: '丙', extra: '戊' },
    '卯': { main: '乙' },
    '辰': { main: '戊', sub: '乙', extra: '癸' },
    '巳': { main: '丙', sub: '庚', extra: '戊' },
    '午': { main: '丁', sub: '己' },
    '未': { main: '己', sub: '丁', extra: '乙' },
    '申': { main: '庚', sub: '壬', extra: '戊' },
    '酉': { main: '辛' },
    '戌': { main: '戊', sub: '辛', extra: '丁' },
    '亥': { main: '壬', sub: '甲' }
};

// エネルギー点数表
export const ENERGY_TABLE = [
    [7, 8, 11, 12, 10, 6, 3, 1, 5, 2, 4, 9], // 甲
    [4, 5, 2, 1, 12, 8, 6, 9, 10, 7, 11, 3], // 乙
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 丙
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 丁
    [6, 1, 9, 2, 4, 8, 12, 11, 10, 7, 5, 3], // 戊
    [6, 4, 2, 5, 3, 9, 7, 10, 11, 12, 8, 1], // 己
    [2, 6, 1, 9, 5, 8, 4, 12, 11, 10, 3, 7], // 庚
    [9, 6, 3, 1, 4, 10, 11, 12, 8, 5, 2, 7], // 辛
    [12, 11, 10, 7, 9, 3, 6, 5, 4, 1, 8, 2], // 壬
    [12, 6, 1, 3, 9, 8, 4, 5, 2, 7, 10, 11]  // 癸
];

// 十大主星
export const TEN_STARS = [
    '貫索星', '石門星', // 0: 比和
    '鳳閣星', '調舒星', // 1: 洩気
    '禄存星', '司禄星', // 2: 財
    '車騎星', '牽牛星', // 3: 官
    '龍高星', '玉堂星'  // 4: 印
];

// 十二大従星（IDから名前）
export const TWELVE_STARS: Record<number, string> = {
    12: '天将星',
    11: '天禄星',
    10: '天南星',
    9: '天貴星',
    8: '天堂星',
    7: '天恍星',
    6: '天印星',
    5: '天庫星',
    4: '天胡星',
    3: '天報星',
    2: '天極星',
    1: '天馳星'
};

// 建禄支
export const BUILD_LUCK_BRANCH: Record<number, number> = {
    0: 2,   // 甲（木・陽）→ 寅(2)
    1: 3,   // 乙（木・陰）→ 卯(3)
    2: 5,   // 丙（火・陽）→ 巳(5)
    3: 6,   // 丁（火・陰）→ 午(6)
    4: 5,   // 戊（土・陽）→ 巳(5)
    5: 6,   // 己（土・陰）→ 午(6)
    6: 8,   // 庚（金・陽）→ 申(8)
    7: 9,   // 辛（金・陰）→ 酉(9)
    8: 11,  // 壬（水・陽）→ 亥(11)
    9: 0    // 癸（水・陰）→ 子(0)
};

// 十二大従星の位相順序 (0:建禄, 1:帝旺...)
export const TWELVE_STAR_PHASES = [
    '天禄星',  // 0: 建禄 (11点)
    '天将星',  // 1: 帝旺 (12点)
    '天堂星',  // 2: 衰 (8点)
    '天胡星',  // 3: 病 (4点)
    '天極星',  // 4: 死 (2点)
    '天庫星',  // 5: 墓 (5点)
    '天馳星',  // 6: 絶 (1点)
    '天報星',  // 7: 胎 (3点)
    '天印星',  // 8: 養 (6点)
    '天貴星',  // 9: 長生 (9点)
    '天恍星',  // 10: 沐浴 (7点)
    '天南星'   // 11: 冠帯 (10点)
];

// 位相ID→点数マッピング
export const PHASE_TO_SCORE: Record<number, number> = {
    0: 11,  // 天禄星
    1: 12,  // 天将星
    2: 8,   // 天堂星
    3: 4,   // 天胡星
    4: 2,   // 天極星
    5: 5,   // 天庫星
    6: 1,   // 天馳星
    7: 3,   // 天報星
    8: 6,   // 天印星
    9: 9,   // 天貴星
    10: 7,  // 天恍星
    11: 10  // 天南星
};

// 五行マッピング
export const ELEMENT_MAP: Record<string, keyof FiveElements> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
};

// 天干インデックスマッピング
export const STEM_TO_INDEX: Record<string, number> = {
    '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
    '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

// ヘルパー: 五行ID取得
export function getElement(stemIdx: number): number {
    return Math.floor(stemIdx / 2);
}

// ヘルパー: 陰陽取得
export function getPolarity(stemIdx: number): number {
    return stemIdx % 2;
}
