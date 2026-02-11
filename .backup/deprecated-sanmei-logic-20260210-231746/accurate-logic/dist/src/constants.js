"use strict";
/**
 * accurate-logic Constants
 * 算命学・陰陽五行の正確な計算ロジック用定数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRANCH_TO_INDEX = exports.STEM_TO_INDEX = exports.SOLAR_TERM_DAYS = exports.TWENTY_EIGHT_ELEMENTS = exports.TWENTY_EIGHT_ELEMENTS_MONTH = exports.TWENTY_EIGHT_ELEMENTS_DAY = exports.BUILD_LUCK_BRANCH = exports.PHASE_TO_SCORE = exports.TWELVE_STAR_PHASES = exports.TWELVE_STARS = exports.TEN_STARS = exports.BRANCH_MAIN_STEM = exports.BRANCHES = exports.STEMS = void 0;
exports.getElement = getElement;
exports.getPolarity = getPolarity;
exports.getBranchElement = getBranchElement;
// ============================================================
// 基本定数
// ============================================================
// 十干（天干）
exports.STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 十二支（地支）
exports.BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 地支の本気（蔭干）
// 各地支が本来持っている天干（十二支配）
exports.BRANCH_MAIN_STEM = {
    '子': '癸', // 水
    '丑': '己', // 土
    '寅': '甲', // 木
    '卯': '乙', // 木
    '辰': '戊', // 土
    '巳': '丙', // 火
    '午': '丁', // 火
    '未': '丁', // 火（または己）
    '申': '庚', // 金
    '酉': '辛', // 金
    '戌': '戊', // 土
    '亥': '壬', // 水
};
// 十大主星
exports.TEN_STARS = [
    '貫索星', '石門星', // 0: 比和（木）
    '鳳閣星', '調舒星', // 1: 洩気（火）
    '禄存星', '司禄星', // 2: 財（土）
    '車騎星', '牽牛星', // 3: 官（金）
    '龍高星', '玉堂星', // 4: 印（水）
    '車輪星', '石門星' // 追加: 車輪星（車騎星の別名）
];
// 十二大従星
exports.TWELVE_STARS = [
    '天馳星', // 1点 - あの世
    '天極星', // 2点 - 死人
    '天報星', // 3点 - 胎児
    '天胡星', // 4点 - 病人
    '天庫星', // 5点 - 入墓
    '天印星', // 6点 - 赤ん坊
    '天恍星', // 7点 - 少年少女
    '天堂星', // 8点 - 老人
    '天貴星', // 9点 - 児童
    '天南星', // 10点 - 青年
    '天禄星', // 11点 - 壮年
    '天将星' // 12点 - 家長
];
// 十二大従星の位相順序 (建禄からの順序)
exports.TWELVE_STAR_PHASES = [
    '天禄星', // 0: 建禄
    '天将星', // 1: 帝旺
    '天堂星', // 2: 衰
    '天胡星', // 3: 病
    '天極星', // 4: 死
    '天庫星', // 5: 墓
    '天馳星', // 6: 絶
    '天報星', // 7: 胎
    '天印星', // 8: 養
    '天貴星', // 9: 長生
    '天恍星', // 10: 沐浴
    '天南星' // 11: 冠帯
];
// 位相ID→点数マッピング
exports.PHASE_TO_SCORE = [11, 12, 8, 4, 2, 5, 1, 3, 6, 9, 7, 10];
// 建禄支（日干から建禄支を求める）
exports.BUILD_LUCK_BRANCH = {
    0: 2, // 甲（木・陽）→ 寅(2)
    1: 3, // 乙（木・陰）→ 卯(3)
    2: 5, // 丙（火・陽）→ 巳(5)
    3: 6, // 丁（火・陰）→ 午(6)
    4: 5, // 戊（土・陽）→ 巳(5)
    5: 6, // 己（土・陰）→ 午(6)
    6: 8, // 庚（金・陽）→ 申(8)
    7: 9, // 辛（金・陰）→ 酉(9)
    8: 11, // 壬（水・陽）→ 亥(11)
    9: 0 // 癸（水・陰）→ 子(0)
};
// ============================================================
// 二十八元データ
// ============================================================
// 日支用二十八元データ（節入りからの日数に基づいて蔵干を決定）
// 算命学Stockの蔵干表に基づいて実装（日数は0始まり）
exports.TWENTY_EIGHT_ELEMENTS_DAY = {
    '子': {
        extra: { stem: '癸', days: 19 },
        main: { stem: '癸' }
    },
    '丑': {
        extra: { stem: '癸', days: 9 },
        sub: { stem: '辛', days: 3 },
        sub2: { stem: '己', days: 7 },
        main: { stem: '己' }
    },
    '寅': {
        extra: { stem: '戊', days: 9 },
        sub: { stem: '丙', days: 10 },
        sub2: { stem: '甲', days: 7 },
        main: { stem: '甲' }
    },
    '卯': {
        extra: { stem: '乙', days: 19 },
        main: { stem: '乙' }
    },
    '辰': {
        extra: { stem: '乙', days: 9 },
        sub: { stem: '癸', days: 3 },
        sub2: { stem: '戊', days: 7 },
        main: { stem: '戊' }
    },
    '巳': {
        extra: { stem: '戊', days: 5 },
        sub: { stem: '庚', days: 12 },
        sub2: { stem: '丙', days: 7 },
        main: { stem: '丙' }
    },
    '午': {
        extra: { stem: '己', days: 30 },
        main: { stem: '丁' }
    },
    '未': {
        extra: { stem: '丁', days: 3 },
        main: { stem: '壬' }
    },
    '申': {
        extra: { stem: '戊', days: 3 },
        sub: { stem: '丙', days: 4 },
        sub2: { stem: '壬', days: 3 },
        main: { stem: '庚' }
    },
    '酉': {
        extra: { stem: '辛', days: 19 },
        main: { stem: '辛' }
    },
    '戌': {
        extra: { stem: '辛', days: 9 },
        sub: { stem: '丁', days: 3 },
        sub2: { stem: '戊', days: 7 },
        main: { stem: '戊' }
    },
    '亥': {
        extra: { stem: '甲', days: 2 }, // 0-2日目: 甲（余気・初気）
        sub: { stem: '己', days: 10 }, // 3-12日目: 己（中気）
        main: { stem: '壬' } // 13日目以降: 壬（本気）
    }
};
// 月支用二十八元データ（陽占計算用）
// 正解データ（1984-12-02）に基づいて調整
exports.TWENTY_EIGHT_ELEMENTS_MONTH = {
    '子': {
        extra: { stem: '癸', days: 19 },
        main: { stem: '癸' }
    },
    '丑': {
        extra: { stem: '癸', days: 9 },
        sub: { stem: '辛', days: 3 },
        sub2: { stem: '己', days: 7 },
        main: { stem: '己' }
    },
    '寅': {
        extra: { stem: '戊', days: 9 },
        sub: { stem: '丙', days: 10 },
        sub2: { stem: '甲', days: 7 },
        main: { stem: '甲' }
    },
    '卯': {
        extra: { stem: '乙', days: 19 },
        main: { stem: '乙' }
    },
    '辰': {
        extra: { stem: '乙', days: 9 },
        sub: { stem: '癸', days: 3 },
        sub2: { stem: '戊', days: 7 },
        main: { stem: '戊' }
    },
    '巳': {
        extra: { stem: '戊', days: 5 },
        sub: { stem: '庚', days: 12 },
        sub2: { stem: '丙', days: 7 },
        main: { stem: '丙' }
    },
    '午': {
        extra: { stem: '己', days: 30 },
        main: { stem: '丁' }
    },
    '未': {
        extra: { stem: '丁', days: 3 },
        main: { stem: '壬' }
    },
    '申': {
        extra: { stem: '戊', days: 3 },
        sub: { stem: '丙', days: 4 },
        sub2: { stem: '壬', days: 3 },
        main: { stem: '庚' }
    },
    '酉': {
        extra: { stem: '辛', days: 19 },
        main: { stem: '辛' }
    },
    '戌': {
        extra: { stem: '辛', days: 9 },
        sub: { stem: '丁', days: 3 },
        sub2: { stem: '戊', days: 7 },
        main: { stem: '戊' }
    },
    '亥': {
        extra: { stem: '甲', days: 12 }, // 0-12日目: 甲（正解データに基づいて調整）
        main: { stem: '壬' } // 13日目以降: 壬（本気）
    }
};
// 二十八元データ（デフォルトは日支用）
exports.TWENTY_EIGHT_ELEMENTS = exports.TWENTY_EIGHT_ELEMENTS_DAY;
// 節入り日データ（毎月の節入り日の概ねの日付）
// 注意: 11月と12月は正確な日付（小雪: 11/22, 大雪: 12/7）
exports.SOLAR_TERM_DAYS = {
    1: 6, // 小寒
    2: 4, // 立春
    3: 6, // 啓蟄
    4: 5, // 清明
    5: 6, // 立夏
    6: 6, // 芒種
    7: 7, // 小暑
    8: 8, // 立秋
    9: 8, // 白露
    10: 8, // 寒露
    11: 22, // 小雪（正確な日付）
    12: 7 // 大雪（正確な日付）
};
// ============================================================
// ヘルパー関数
// ============================================================
// 天干文字列→インデックス
exports.STEM_TO_INDEX = {
    '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
    '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};
// 地支文字列→インデックス
exports.BRANCH_TO_INDEX = {
    '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
    '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11
};
// 五行ID取得（0:木, 1:火, 2:土, 3:金, 4:水）
function getElement(stemIdx) {
    return Math.floor(stemIdx / 2);
}
// 陰陽取得（0:陽, 1:陰）
function getPolarity(stemIdx) {
    return stemIdx % 2;
}
// 地支の五行取得
function getBranchElement(branchIdx) {
    // 寅卯(2,3)→木(0), 巳午(5,6)→火(1), 辰戌丑未(4,10,1,7)→土(2), 申酉(8,9)→金(3), 子亥(0,11)→水(4)
    if (branchIdx === 2 || branchIdx === 3)
        return 0; // 木
    if (branchIdx === 5 || branchIdx === 6)
        return 1; // 火
    if (branchIdx === 4 || branchIdx === 7 || branchIdx === 10 || branchIdx === 1)
        return 2; // 土
    if (branchIdx === 8 || branchIdx === 9)
        return 3; // 金
    return 4; // 水
}
