/**
 * 13章構造データ定義（ドクター・メグルの人生処方箋）
 * ダッシュボード用チャプター構造と算命学的要素
 *
 * 120話エピソードを13章に分割した物語構造
 * 各章にはテーマ、色相、主要なプロットマイルストーンが定義
 *
 * @author AI Documentation Specialist
 * @created 2026-02-15
 */

/**
 * 章データインターフェース
 */
export interface Chapter {
  /** 章番号（1-13） */
  id: number;
  /** 章の名称 */
  name: string;
  /** 章の概要説明 */
  description: string;
  /** 章に属するエピソード範囲 [start, end] */
  episodeRange: [number, number];
  /** 章のテーマ群 */
  themes: string[];
  /** 視覚的差別化用カラーコード */
  color: string;
  /** 主要なプロットマイルストーン */
  milestones: string[];
  /** 天中殺の影響（該当する場合） */
  tenchuSatsu?: '子丑' | '寅卯' | '辰巳' | '午未' | '申酉' | '戌亥';
  /** 五行の主題 */
  fiveElements?: '木' | '火' | '土' | '金' | '水';
  /** 主要登場人物 */
  mainCharacters: string[];
  /** 物語的役割 */
  narrativeRole: string;
  /** 感情のトーン */
  emotionalTone: string;
}

/**
 * 13章構造定義（120話エピソード）
 * 基礎編（1-40）、葛藤編（41-80）、統合編（81-120）を統合した構造
 */
export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    name: "第1章：運命の扉を開けて",
    description: "巡が運命診断師としての道を歩み始める。最初の患者たちとの出会いと、祖母さくらの教えを受け継ぐ。",
    episodeRange: [1, 10],
    themes: ["始まり", "受容", "診断師の覚悟"],
    color: "#1E3A8A",
    milestones: [
      "第1話：始まりの運命 - 高橋美咲との初診",
      "第2話：天中殺は罰ではなく - 村田健一の受け入れ",
      "第3話：箱の外の龍 - 森川陽菜の解放",
      "第10話：運命診断師への覚醒 - 巡の決意"
    ],
    tenchuSatsu: "寅卯",
    fiveElements: "木",
    mainCharacters: ["九条巡", "高橋美咲", "村田健一", "森川陽菜"],
    narrativeRole: "物語の基礎構築",
    emotionalTone: "希望と懐疑"
  },
  {
    id: 2,
    name: "第2章：天中殺の冬",
    description: "大地が眠る時期。巡自身も「申酉天中殺」の只中にある。過去の傷と向き合いながら、診断師として成長する。",
    episodeRange: [11, 20],
    themes: ["内省", "冬の眠り", "傷の回復"],
    color: "#1E40AF",
    milestones: [
      "第15話：MedAI創業者 - 巡の過去が語られる",
      "第18話：祖母の教え - 戦争体験の回想",
      "第20話：うつ状態からの再生 - 巡の転換点"
    ],
    tenchuSatsu: "申酉",
    fiveElements: "水",
    mainCharacters: ["九条巡", "藤堂慧（回想）", "九条さくら（回想）"],
    narrativeRole: "主人公の内面成長",
    emotionalTone: "深遠と静寂"
  },
  {
    id: 3,
    name: "第3章：人との繋がり",
    description: "美咲が正式にアシスタントに就任。診断室に集まる人々の物語。算命学を通じた人間関係の深化。",
    episodeRange: [21, 30],
    themes: ["関係性", "学習", "支え合い"],
    color: "#2563EB",
    milestones: [
      "第25話：美咲、アシスタント就任 - 新たな関係性",
      "第27話：五行の理解 - 算命学の基礎",
      "第30話：診断室のコミュニティ - 繋がりの始まり"
    ],
    fiveElements: "火",
    mainCharacters: ["九条巡", "高橋美咲", "田中健太"],
    narrativeRole: "二次キャラクターの展開",
    emotionalTone: "温もりと発展"
  },
  {
    id: 4,
    name: "第4章：対立の芽",
    description: "慧のMedAIが台頭し始める。データと運命の対立が表面化。美咲の揺れ動きが始まる。",
    episodeRange: [31, 40],
    themes: ["対立", "選択", "価値観の衝突"],
    color: "#3B82F6",
    milestones: [
      "第31話：MedAIの発表 - データの時代",
      "第35話：データ vs 運命 - 初の対立",
      "第40話：基礎編完結 - 新たな時代への序章"
    ],
    fiveElements: "土",
    mainCharacters: ["九条巡", "高橋美咲", "藤堂慧"],
    narrativeRole: "対立構造の構築",
    emotionalTone: "緊張と不確かさ"
  },
  {
    id: 5,
    name: "第5章：葛藤の時代",
    description: "「データ vs 在り方」の対決本格化。巡と慧の思想が衝突。美咲は二つの世界の間で苦悩する。",
    episodeRange: [41, 50],
    themes: ["葛藤", "信念の衝突", "真実の追求"],
    color: "#F59E0B",
    milestones: [
      "第41話：葛藤編開始 - 対立の激化",
      "第45話：MedAIの成功 - データの優位性",
      "第50話：美咲の決断 - 両者の間での板挟み"
    ],
    tenchuSatsu: "辰巳",
    fiveElements: "金",
    mainCharacters: ["九条巡", "藤堂慧", "高橋美咲"],
    narrativeRole: "主要対立の深化",
    emotionalTone: "激しい感情の渦"
  },
  {
    id: 6,
    name: "第6章：99%の壁",
    description: "MedAIが「99%の精度」に到達するが、残りの1%が最も困難な問題であることが明らかになる。",
    episodeRange: [51, 60],
    themes: ["限界", "完璧主義", "不確かさ"],
    color: "#F97316",
    milestones: [
      "第55話：MedAIの成功と限界 - 99%精度の壁",
      "第57話：データには測れないもの - 感情の問題",
      "第60話：美咲の決断 - スカウトに応じるか"
    ],
    fiveElements: "火",
    mainCharacters: ["藤堂慧", "高橋美咲", "MedAIチーム"],
    narrativeRole: "テクノロジーの限界",
    emotionalTone: "焦燥と諦念"
  },
  {
    id: 7,
    name: "第7章：離脱と選択",
    description: "美咲がMedAIへ移籍。診断室の変化と、巡の孤独。二人の関係性が大きく揺らぎ始める。",
    episodeRange: [61, 70],
    themes: ["離別", "選択", "成長の痛み"],
    color: "#EF4444",
    milestones: [
      "第62話：美咲の移籍 - 結ばれない道",
      "第65話：診断室の空白 - 巡の孤独",
      "第70話：二つの価値観 - 互いの信条の確認"
    ],
    tenchuSatsu: "午未",
    fiveElements: "火",
    mainCharacters: ["九条巡", "高橋美咲", "藤堂慧"],
    narrativeRole: "関係性の再編",
    emotionalTone: "痛みと諦念"
  },
  {
    id: 8,
    name: "第8章：最後の患者",
    description: "MedAIが全てを支配する世界。最後の患者となった人物が、巡に新たな問いを投げかける。",
    episodeRange: [71, 80],
    themes: ["最終局面", "問いかけ", "運命の必然"],
    color: "#DC2626",
    milestones: [
      "第75話：最後の患者 - 予期せぬ登場人物",
      "第78話：真実の追求 - 診断師としての本質",
      "第80話：葛藤編クライマックス - 思想の対決"
    ],
    fiveElements: "土",
    mainCharacters: ["九条巡", "藤堂慧", "最後の患者"],
    narrativeRole: "葛藤編のクライマックス",
    emotionalTone: "高熱と緊張"
  },
  {
    id: 9,
    name: "第9章：統合への道",
    description: "「残りの2%」の意味が徐々に明らかになる。巡と慧、二人が共通の答えに気づき始める。",
    episodeRange: [81, 90],
    themes: ["統合", "気づき", "和解の兆し"],
    color: "#7C3AED",
    milestones: [
      "第81話：統合編開始 - 新たな視点",
      "第85話：データと運命の融合 - 新しい道",
      "第90話：過去の回収 - 巡の過去が明らか"
    ],
    tenchuSatsu: "戌亥",
    fiveElements: "水",
    mainCharacters: ["九条巡", "藤堂慧"],
    narrativeRole: "統合プロセスの始まり",
    emotionalTone: "静けさと洞察"
  },
  {
    id: 10,
    name: "第10章：美咲の帰還",
    description: "MedAIの限界を感じた美咲が巡の元へ戻る。三人の関係が再構築され始める。",
    episodeRange: [91, 100],
    themes: ["帰還", "再構築", "友情"],
    color: "#8B5CF6",
    milestones: [
      "第92話：美咲の帰還 - 二度目の出会い",
      "第95話：MedAIの崩壊 - テクノロジーの限界",
      "第100話：統合編転換点 - 「残りの2%」の真実"
    ],
    fiveElements: "木",
    mainCharacters: ["九条巡", "高橋美咲", "藤堂慧"],
    narrativeRole: "関係性の修復",
    emotionalTone: "希望と和らぎ"
  },
  {
    id: 11,
    name: "第11章：算命学の真髄",
    description: "データだけでは解決できない「心の問題」に対し、算命学が持つ真の価値が明確になる。",
    episodeRange: [101, 110],
    themes: ["真実", "価値の再確認", "統合"],
    color: "#A855F7",
    milestones: [
      "第105話：算命学の真髄 - データを超えるもの",
      "第108話：和解への道 - 慧の変化",
      "第110話：三人の絆 - 新しい関係性の完成"
    ],
    tenchuSatsu: "子丑",
    fiveElements: "金",
    mainCharacters: ["九条巡", "高橋美咲", "藤堂慧"],
    narrativeRole: "価値観の統合",
    emotionalTone: "深い理解と慈悲"
  },
  {
    id: 12,
    name: "第12章：未来への橋",
    description: "過去の清算と未来への展望。データと運命の統合が、新しい医療の道を示す。",
    episodeRange: [111, 119],
    themes: ["清算", "展望", "新たな始まり"],
    color: "#9333EA",
    milestones: [
      "第115話：過去との和解 - 巡の内面の解放",
      "第117話：未来への橋 - 二つの道の統合",
      "第119話：準備完了 - 全ての伏線が回収"
    ],
    fiveElements: "土",
    mainCharacters: ["九条巡", "高橋美咲", "藤堂慧", "新たな患者"],
    narrativeRole: "物語の収束",
    emotionalTone: "完成と解放"
  },
  {
    id: 13,
    name: "第13章：運命の処方箋",
    description: "物語の完結。巡が医師としての経験と算命師としての知恵を統合し、真の「人生の処方箋」を完成させる。",
    episodeRange: [120, 120],
    themes: ["完結", "統合", "永遠"],
    color: "#7C2D12",
    milestones: [
      "第120話：最終話 - 真の処方箋"
    ],
    tenchuSatsu: "申酉",
    fiveElements: "水",
    mainCharacters: ["九条巡", "高橋美咲", "藤堂慧"],
    narrativeRole: "物語の完結と教訓",
    emotionalTone: "深みと満足"
  }
] as const;

/**
 * エピソード番号から対応する章を取得する
 * @param episodeId エピソード番号（1-120）
 * @returns 対応する章オブジェクト、見つからない場合はundefined
 */
export function getChapterForEpisode(episodeId: number): Chapter | undefined {
  return CHAPTERS.find(chapter =>
    episodeId >= chapter.episodeRange[0] &&
    episodeId <= chapter.episodeRange[1]
  );
}

/**
 * 章IDから章オブジェクトを取得する
 * @param chapterId 章ID（1-13）
 * @returns 対応する章オブジェクト、見つからない場合はundefined
 */
export function getChapterById(chapterId: number): Chapter | undefined {
  return CHAPTERS.find(chapter => chapter.id === chapterId);
}

/**
 * 章IDから色を取得する
 * @param chapterId 章ID（1-13）
 * @returns カラーコード文字列、見つからない場合はデフォルト色
 */
export function getChapterColor(chapterId: number): string {
  return CHAPTERS.find(ch => ch.id === chapterId)?.color || "#9E9E9E";
}

/**
 * 特定の天中殺に該当する章を取得する
 * @param tenchuSatsu 天中殺タイプ
 * @returns 該当する章の配列
 */
export function getChaptersByTenchuSatsu(tenchuSatsu: string): Chapter[] {
  return CHAPTERS.filter(chapter => chapter.tenchuSatsu === tenchuSatsu);
}

/**
 * 特定の五行に該当する章を取得する
 * @param element 五行
 * @returns 該当する章の配列
 */
export function getChaptersByFiveElements(element: string): Chapter[] {
  return CHAPTERS.filter(chapter => chapter.fiveElements === element);
}

/**
 * 指定されたエピソード範囲に属する章をすべて取得する
 * @param startEpisode 開始エピソード
 * @param endEpisode 終了エピソード
 * @returns 該当する章の配列
 */
export function getChaptersInRange(startEpisode: number, endEpisode: number): Chapter[] {
  return CHAPTERS.filter(chapter =>
    startEpisode <= chapter.episodeRange[1] &&
    endEpisode >= chapter.episodeRange[0]
  );
}

/**
 * 基礎編に属する章を取得する（1-40話）
 */
export function getFoundationChapters(): Chapter[] {
  return getChaptersInRange(1, 40);
}

/**
 * 葛藤編に属する章を取得する（41-80話）
 */
export function getConflictChapters(): Chapter[] {
  return getChaptersInRange(41, 80);
}

/**
 * 統合編に属する章を取得する（81-120話）
 */
export function getIntegrationChapters(): Chapter[] {
  return getChaptersInRange(81, 120);
}