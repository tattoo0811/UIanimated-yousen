/**
 * エピソード31-60のキャラクター算命学計算スクリプト
 */

import { calculateBaZi } from '../accurate-logic/src/bazi';
import { calculateYangSen } from '../accurate-logic/src/yangsen';
import type { FourPillars, YangSen } from '../accurate-logic/src/types';
import { STEM_TO_INDEX, BRANCH_TO_INDEX } from '../accurate-logic/src/constants';

// キャラクターデータ型
interface CharacterData {
  episode: number;
  name: string;
  name_reading?: string;
  age: number;
  gender: 'male' | 'female';
  birth_date: string;
  birth_longitude?: number;
  occupation: string;
}

// 計算結果型
interface SanmeigakuResult {
  episode: number;
  name: string;
  birth_date: string;
  sanmeigaku_verified: {
    bazi: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    jugdais: string[];
    junidai: Array<{
      part: string;
      star: string;
      points: number;
    }>;
    five_elements: string;
    total_energy: number;
  };
  persona_traits: string[];
  verified_with_shugakuin: boolean;
  notes: string;
}

// 五行エネルギー計算
function calculateFiveElements(bazi: FourPillars): { elements: string; total: number } {
  const elements: string[] = [];

  // 天干から五行を取得
  const stems = [bazi.year.stemStr, bazi.month.stemStr, bazi.day.stemStr, bazi.hour.stemStr];
  const stemElements = stems.map(s => {
    switch (s) {
      case '甲':
      case '乙':
        return '木';
      case '丙':
      case '丁':
        return '火';
      case '戊':
      case '己':
        return '土';
      case '庚':
      case '辛':
        return '金';
      case '壬':
      case '癸':
        return '水';
      default:
        return '';
    }
  });

  // 地支から五行を取得
  const branches = [bazi.year.branchStr, bazi.month.branchStr, bazi.day.branchStr, bazi.hour.branchStr];
  const branchElements = branches.map(b => {
    switch (b) {
      case '寅':
      case '卯':
        return '木';
      case '巳':
      case '午':
        return '火';
      case '辰':
      case '戌':
      case '丑':
      case '未':
        return '土';
      case '申':
      case '酉':
        return '金';
      case '亥':
      case '子':
        return '水';
      default:
        return '';
    }
  });

  // 天干と地支の五行を結合
  const allElements = [...stemElements, ...branchElements];

  // 五行ごとにカウント
  const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  allElements.forEach(e => {
    if (e) counts[e]++;
  });

  // 文字列形式に変換
  const elementsStr = `木${counts['木']}火${counts['火']}土${counts['土']}金${counts['金']}水${counts['水']}`;

  // 合計エネルギー
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);

  return { elements: elementsStr, total };
}

// ペルソナ特徴生成
function generatePersonaTraits(
  bazi: FourPillars,
  yangsen: YangSen,
  tenchusatsu: string,
  age: number,
  occupation: string
): string[] {
  const traits: string[] = [];

  // 日干の基本性格
  const dayStem = bazi.day.stemStr;
  switch (dayStem) {
    case '甲':
      traits.push('木の性質：直情的で、成長意欲が強い。リーダーシップを発揮する傾向');
      break;
    case '乙':
      traits.push('木の性質：柔軟で適応力が高い。協調性を重視する傾向');
      break;
    case '丙':
      traits.push('火の性質：明るくエネルギッシュ。周囲を照らす存在');
      break;
    case '丁':
      traits.push('火の性質：繊細で感性豊か。情緒の変化が激しい');
      break;
    case '戊':
      traits.push('土の性質：信頼できて安定感がある。中核的な存在');
      break;
    case '己':
      traits.push('土の性質：包容力が強く、支える役割を担う');
      break;
    case '庚':
      traits.push('金の性質：意志が強く、断固としている。正義感が強い');
      break;
    case '辛':
      traits.push('金の性質：繊細で厳格。美的センスが鋭い');
      break;
    case '壬':
      traits.push('水の性質：適応力が高く、知恵がある。柔軟な発想');
      break;
    case '癸':
      traits.push('水の性質：感受性が豊かで、直感的。神秘的な雰囲気');
      break;
  }

  // 十大主星から特徴を追加
  if (yangsen.head === '貫索星') {
    traits.push('頭：貫索星 - 正義感が強く、論理的。問題解決能力が高い');
  } else if (yangsen.head === '司禄星') {
    traits.push('頭：司禄星 - 真面目で責任感が強い。組織に忠実');
  } else if (yangsen.head === '鳳閣星') {
    traits.push('頭：鳳閣星 - 知性が高く、美的センスが優れている');
  }

  // 天中殺の影響
  if (tenchusatsu === '寅卯天中殺') {
    traits.push('寅卯天中殺：親密な人間関係の試練期。人を信じることを学ぶ時期');
  } else if (tenchusatsu === '辰巳天中殺') {
    traits.push('辰巳天中殺：孤独と葛藤の時期。自己内省の機会');
  } else if (tenchusatsu === '午未天中殺') {
    traits.push('午未天中殺：家庭的・精神的な試練期。家庭や価値観の再構築');
  } else if (tenchusatsu === '申酉天中殺') {
    traits.push('申酉天中殺：社会停滞期。準備と忍耐が求められる時期');
  } else if (tenchusatsu === '戌亥天中殺') {
    traits.push('戌亥天中殺：社会的地位や財産の変動期。大きな転換点');
  } else if (tenchusatsu === '子丑天中殺') {
    traits.push('子丑天中殺：社会的試練期。自立と責任を学ぶ時期');
  }

  return traits;
}

// 天中殺判定
function getTenchusatsu(nikkan: string, gesshi: string): string {
  const nikkanIdx = STEM_TO_INDEX[nikkan] - 1;
  const gesshiIdx = BRANCH_TO_INDEX[gesshi] - 1;

  // 天中殺パターン判定
  // 寅卯天中殺: 甲戌・乙酉
  if ((nikkanIdx === 0 && gesshiIdx === 10) || (nikkanIdx === 1 && gesshiIdx === 9)) {
    return '寅卯天中殺';
  }
  // 辰巳天中殺: 甲申・乙未
  if ((nikkanIdx === 0 && gesshiIdx === 8) || (nikkanIdx === 1 && gesshiIdx === 7)) {
    return '辰巳天中殺';
  }
  // 午未天中殺: 甲午・乙巳
  if ((nikkanIdx === 0 && gesshiIdx === 6) || (nikkanIdx === 1 && gesshiIdx === 5)) {
    return '午未天中殺';
  }
  // 申酉天中殺: 丙辰・丁卯・戊寅・己丑・庚子・辛亥・壬戌・癸酉
  if (
    (nikkanIdx === 2 && gesshiIdx === 4) ||
    (nikkanIdx === 3 && gesshiIdx === 3) ||
    (nikkanIdx === 4 && gesshiIdx === 2) ||
    (nikkanIdx === 5 && gesshiIdx === 1) ||
    (nikkanIdx === 6 && gesshiIdx === 0) ||
    (nikkanIdx === 7 && gesshiIdx === 11) ||
    (nikkanIdx === 8 && gesshiIdx === 10) ||
    (nikkanIdx === 9 && gesshiIdx === 9)
  ) {
    return '申酉天中殺';
  }
  // 戌亥天中殺: 丙寅・丁丑・戊子・己亥・庚戌・辛酉・壬申・癸未
  if (
    (nikkanIdx === 2 && gesshiIdx === 2) ||
    (nikkanIdx === 3 && gesshiIdx === 1) ||
    (nikkanIdx === 4 && gesshiIdx === 0) ||
    (nikkanIdx === 5 && gesshiIdx === 11) ||
    (nikkanIdx === 6 && gesshiIdx === 10) ||
    (nikkanIdx === 7 && gesshiIdx === 9) ||
    (nikkanIdx === 8 && gesshiIdx === 8) ||
    (nikkanIdx === 9 && gesshiIdx === 7)
  ) {
    return '戌亥天中殺';
  }
  // 子丑天中殺: 丙子・丁亥・戊戌・己酉・庚申・辛未・壬午・癸巳
  if (
    (nikkanIdx === 2 && gesshiIdx === 0) ||
    (nikkanIdx === 3 && gesshiIdx === 11) ||
    (nikkanIdx === 4 && gesshiIdx === 10) ||
    (nikkanIdx === 5 && gesshiIdx === 9) ||
    (nikkanIdx === 6 && gesshiIdx === 8) ||
    (nikkanIdx === 7 && gesshiIdx === 7) ||
    (nikkanIdx === 8 && gesshiIdx === 6) ||
    (nikkanIdx === 9 && gesshiIdx === 5)
  ) {
    return '子丑天中殺';
  }

  return 'なし';
}

// キャラクターの計算
function calculateCharacter(char: CharacterData): SanmeigakuResult {
  const birthDate = new Date(char.birth_date);
  const longitude = char.birth_longitude || 135;

  // 四柱推命計算
  const bazi = calculateBaZi(birthDate, longitude);

  // 陽占計算
  const yangsen = calculateYangSen(bazi, birthDate);

  // 天中殺判定
  const tenchusatsu = getTenchusatsu(bazi.day.stemStr, bazi.month.branchStr);

  // 五行エネルギー計算
  const { elements, total } = calculateFiveElements(bazi);

  // ペルソナ特徴生成
  const personaTraits = generatePersonaTraits(bazi, yangsen, tenchusatsu, char.age, char.occupation);

  return {
    episode: char.episode,
    name: char.name,
    birth_date: char.birth_date,
    sanmeigaku_verified: {
      bazi: {
        year: bazi.year.name,
        month: bazi.month.name,
        day: bazi.day.name,
        hour: bazi.hour.name
      },
      jugdais: [
        yangsen.head,
        yangsen.chest,
        yangsen.belly,
        yangsen.rightHand,
        yangsen.leftHand
      ],
      junidai: [
        { part: '左肩', star: yangsen.leftShoulder.name, points: yangsen.leftShoulder.score },
        { part: '左足', star: yangsen.leftLeg.name, points: yangsen.leftLeg.score },
        { part: '右足', star: yangsen.rightLeg.name, points: yangsen.rightLeg.score }
      ],
      five_elements: elements,
      total_energy: total
    },
    persona_traits: personaTraits,
    verified_with_shugakuin: false, // 要検証
    notes: `天中殺: ${tenchusatsu}。時刻: ${char.birth_date.split('T')[1] || '12:00:00'}`
  };
}

// メイン処理
async function main() {
  // エピソード49-60のキャラクター（EPISODES-49-72-CHARACTERS.jsonから抽出）
  const characters49to60: CharacterData[] = [
    { episode: 49, name: '大輝', age: 28, gender: 'male', birth_date: '1998-01-27T14:30:00', birth_longitude: 135, occupation: 'システムエンジニア' },
    { episode: 50, name: '蒼空', age: 26, gender: 'male', birth_date: '2000-01-17T16:45:00', birth_longitude: 140, occupation: '大学生' },
    { episode: 51, name: '美咲', age: 35, gender: 'female', birth_date: '1991-01-04T12:00:00', birth_longitude: 130, occupation: '会社員' },
    { episode: 52, name: '松井', age: 41, gender: 'male', birth_date: '1985-02-04T09:30:00', birth_longitude: 139, occupation: '起業準備中' },
    { episode: 53, name: '真由', age: 29, gender: 'female', birth_date: '1997-02-01T15:20:00', birth_longitude: 135, occupation: '介護士' },
    { episode: 54, name: '源田 耕造', age: 60, gender: 'male', birth_date: '1964-11-12T08:00:00', birth_longitude: 136, occupation: '定年退職者' },
    { episode: 55, name: '橘 純子', age: 62, gender: 'female', birth_date: '1962-08-04T11:30:00', birth_longitude: 139, occupation: '専業主婦' },
    { episode: 56, name: '中島 直人', age: 34, gender: 'male', birth_date: '1990-07-08T13:45:00', birth_longitude: 140, occupation: 'プログラマー' },
    { episode: 57, name: '山田 茂', age: 65, gender: 'male', birth_date: '1959-09-09T10:00:00', birth_longitude: 136, occupation: '定年退職者' },
    { episode: 58, name: '早川 奈々', age: 25, gender: 'female', birth_date: '1999-08-16T14:20:00', birth_longitude: 135, occupation: 'インフルエンサー' },
    { episode: 59, name: '村田 梅', age: 65, gender: 'female', birth_date: '1959-01-01T06:00:00', birth_longitude: 130, occupation: '定年退職者' },
    { episode: 60, name: '小林 翔太', age: 32, gender: 'male', birth_date: '1992-03-15T12:00:00', birth_longitude: 140, occupation: '営業職' }
  ];

  const results: SanmeigakuResult[] = [];

  for (const char of characters49to60) {
    try {
      const result = calculateCharacter(char);
      results.push(result);
      console.log(`✅ エピソード${char.episode}: ${char.name} - 計算完了`);
    } catch (error) {
      console.error(`❌ エピソード${char.episode}: ${char.name} - エラー:`, error);
    }
  }

  // 結果を出力
  console.log('\n=== 結果 ===');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// 実行
main().catch(console.error);
