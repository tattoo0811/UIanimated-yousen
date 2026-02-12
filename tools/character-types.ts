/**
 * キャラクターデータ型定義
 * meguru-characters-ep1-10.md のフォーマットを構造化したもの
 */

export interface Character {
    id: string;
    name: string;
    nameReading?: string;
    birthDate: string;       // ISO 8601
    gender: "male" | "female";
    ageAtStory: number;      // 2026年4月時点
    role: "main" | "patient" | "supporting";
    episode?: number;
    occupation?: string;
    birthplace?: string;
    familySummary?: string;
    narrativeCore?: string[];
}

export interface Meishiki {
    characterId: string;
    // 三柱
    yearGan: string;
    yearShi: string;
    monthGan: string;
    monthShi: string;
    dayGan: string;
    dayShi: string;
    // 蔵干
    yearZokan?: string;
    monthZokan?: string;
    dayZokan?: string;
    // 十大主星（五方位）
    starNorth?: string;
    starSouth?: string;
    starEast?: string;
    starWest?: string;
    starCenter?: string;
    // 十二大従星（三位置）
    juseiStart?: string;
    juseiStartScore?: number;
    juseiMiddle?: string;
    juseiMiddleScore?: number;
    juseiEnd?: string;
    juseiEndScore?: number;
    // メタ
    energyTotal?: number;
    tenchusatsu?: string;
    setsuiriDay?: number;
}

export interface TimelineEvent {
    characterId: string;
    age: number;
    year: number;
    event: string;
    category?: "life" | "career" | "family" | "health" | "turning_point";
}

export interface TaiunRow {
    characterId: string;
    age: number;
    eto: string;
    gan: string;
    shi: string;
    star: string;
    jusei: string;
}

export interface CharacterProfile {
    character: Character;
    meishiki: Meishiki;
    timeline: TimelineEvent[];
    taiun?: TaiunRow[];
}
