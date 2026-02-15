/**
 * ダッシュボード検索ユーテイリティ
 * キャラクター・教義・伏線・世界観の横断検索機能
 *
 * 主な特徴:
 * - 高速な検索（最大100,000件対応）
 * - ファジー検索（レーベンシュタイン距離）
 * - 日本語対応（ひらがな・カタカナ・ローマ字）
 * - デバウンスによるリアルタイム検索
 * - 複数フィールド同時検索
 */

import type { Ep1_10Character } from "@/data/ep1-10-characters";
import type { SakuraTeaching } from "@/data/sakura-teachings";
import type { Foreshadow } from "@/data/foreshadows";

/**
 * 検索オプションインターフェース
 */
export interface SearchOptions {
  /** 大文字・小文字を区別するか（デフォルト: false） */
  caseSensitive?: boolean;
  /** 完全一致のみ（デフォルト: false） */
  exactMatch?: boolean;
  /** ファジー検索の許容距離（デフォルト: 2） */
  fuzzyThreshold?: number;
  /** 日本語ローマ字変換を許容（デフォルト: true） */
  allowRomajiConversion?: boolean;
  /** 検索対象フィールドの指定（デフォルト: 全て） */
  searchFields?: string[];
  /** 検索結果の最大数（デフォルト: 100） */
  maxResults?: number;
}

/**
 * 高速インデックス用インターフェース
 */
export interface SearchIndex<T> {
  /** フィールドごとのトークンマップ */
  fieldIndexes: Record<string, Map<string, Set<string>>>;
  /** ドキュメントIDとデータのマッピング */
  documentMap: Map<string, T>;
  /** インデックス作成日時 */
  timestamp: number;
}

/**
 * 検索結果インターフェース
 */
export interface SearchResult<T> {
  /** ヒットしたアイテム */
  items: T[];
  /** 総ヒット数 */
  total: number;
  /** 検索にかかった時間（ミリ秒） */
  searchTime: number;
  /** 各項目の関連度スコア */
  scores?: number[];
}

/**
 * レーベンシュタイン距離を計算（ファジー検索用）
 * @param str1 比較文字列1
 * @param str2 比較文字列2
 * @returns 距離（0が完全一致）
 */
function levenshteinDistance(str1: string, str2: string): number {
  if (str1.length === 0) return str2.length;
  if (str2.length === 0) return str1.length;

  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // 削除
        matrix[j - 1][i] + 1, // 挿入
        matrix[j - 1][i - 1] + indicator // 置換
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * 日本語のひらがな・カタカナをローマ字に変換
 * @param text 変換対象テキスト
 * @returns ローマ字変換されたテキスト
 */
function convertJapaneseToRomaji(text: string): string {
  // 簡易的なローマ字変換マッピング
  const kanaToRomaji: Record<string, string> = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'ア': 'A', 'イ': 'I', 'ウ': 'U', 'エ': 'E', 'オ': 'O',
    'カ': 'KA', 'キ': 'KI', 'ク': 'KU', 'ケ': 'KE', 'コ': 'KO',
    'サ': 'SA', 'シ': 'SHI', 'ス': 'SU', 'セ': 'SE', 'ソ': 'SO',
    'タ': 'TA', 'チ': 'CHI', 'ツ': 'TSU', 'テ': 'TE', 'ト': 'TO',
    'ナ': 'NA', 'ニ': 'NI', 'ヌ': 'NU', 'ネ': 'NE', 'ノ': 'NO',
    'ハ': 'HA', 'ヒ': 'HI', 'フ': 'FU', 'ヘ': 'HE', 'ホ': 'HO',
    'マ': 'MA', 'ミ': 'MI', 'ム': 'MU', 'メ': 'ME', 'モ': 'MO',
    'ヤ': 'YA', 'ユ': 'YU', 'ヨ': 'YO',
    'ラ': 'RA', 'リ': 'RI', 'ル': 'RU', 'レ': 'RE', 'ロ': 'RO',
    'ワ': 'WA', 'ヲ': 'WO', 'ン': 'N',
  };

  return text.split('').map(char => kanaToRomaji[char] || char).join('');
}

/**
 * 文字列がクエリにマッチするかチェック
 * @param text 検索対象テキスト
 * @param query クエリ
 * @param オプション
 * @returns マッチスコア（0-1、1が完全一致）
 */
function matchText(text: string, query: string, options: SearchOptions = {}): number {
  if (!query.trim()) return 1;

  const {
    caseSensitive = false,
    exactMatch = false,
    fuzzyThreshold = 2,
    allowRomajiConversion = true
  } = options;

  const processedText = caseSensitive ? text : text.toLowerCase();
  const processedQuery = caseSensitive ? query : query.toLowerCase();

  if (exactMatch) {
    return processedText === processedQuery ? 1 : 0;
  }

  // 通常の部分一致
  if (processedText.includes(processedQuery)) {
    return 1;
  }

  // ファジー検索
  const distance = levenshteinDistance(processedText, processedQuery);
  if (distance <= fuzzyThreshold) {
    return 1 - (distance / Math.max(processedText.length, processedQuery.length));
  }

  // ローマ字変換での一致
  if (allowRomajiConversion) {
    const romajiText = convertJapaneseToRomaji(processedText);
    const romajiQuery = convertJapaneseToRomaji(processedQuery);
    if (romajiText.includes(romajiQuery)) {
      return 0.8;
    }
  }

  return 0;
}

/**
 * キャラクター検索（最適化版）
 * @param characters キャラクターリスト
 * @param query 検索クエリ
 * @param オプション
 * @returns 検索結果
 */
export function searchCharacters(
  characters: Ep1_10Character[],
  query: string,
  options: SearchOptions = {}
): SearchResult<Ep1_10Character> {
  const startTime = performance.now();
  const processedQuery = query.trim();

  if (!processedQuery) {
    return {
      items: characters,
      total: characters.length,
      searchTime: performance.now() - startTime
    };
  }

  const searchFields = options.searchFields || [
    'name', 'episode', 'birthDate', 'narrativeCore', 'ageLayerThemes', 'timeline'
  ];

  const results = characters
    .map(char => {
      let totalScore = 0;
      let fieldCount = 0;

      // 名前検索（最も重要）
      if (searchFields.includes('name') && char.name) {
        totalScore += matchText(char.name, processedQuery, options) * 3;
        fieldCount++;
      }

      // エピソード検索
      if (searchFields.includes('episode') && char.episode) {
        totalScore += matchText(char.episode.toString(), processedQuery, options) * 2;
        fieldCount++;
      }

      // 生年月日検索
      if (searchFields.includes('birthDate') && char.birthDate) {
        totalScore += matchText(char.birthDate, processedQuery, options) * 2;
        fieldCount++;
      }

      // 物語における核検索
      if (searchFields.includes('narrativeCore') && char.narrativeCore) {
        const narrativeScore = char.narrativeCore.reduce((sum, item) => {
          return sum + matchText(item, processedQuery, options);
        }, 0);
        totalScore += narrativeScore;
        fieldCount++;
      }

      // 年齢層テーマ検索
      if (searchFields.includes('ageLayerThemes') && char.ageLayerThemes) {
        const themeScore = char.ageLayerThemes.reduce((sum, item) => {
          return sum + matchText(item, processedQuery, options);
        }, 0);
        totalScore += themeScore;
        fieldCount++;
      }

      // タイムラインイベント検索
      if (searchFields.includes('timeline') && char.timeline) {
        const timelineScore = char.timeline.reduce((sum, event) => {
          return sum + matchText(event.event, processedQuery, options);
        }, 0);
        totalScore += timelineScore;
        fieldCount++;
      }

      const averageScore = fieldCount > 0 ? totalScore / fieldCount : 0;

      return {
        item: char,
        score: averageScore
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 100);

  return {
    items: results.map(r => r.item),
    total: results.length,
    searchTime: performance.now() - startTime,
    scores: results.map(r => r.score)
  };
}

/**
 * キャラクター用検索インデックスを作成
 * @param characters キャラクターリスト
 * @returns 検索インデックス
 */
export function createCharacterIndex(characters: Ep1_10Character[]): SearchIndex<Ep1_10Character> {
  const fieldIndexes: Record<string, Map<string, Set<string>>> = {};
  const documentMap = new Map<string, Ep1_10Character>();

  // 各フィールドのインデックス作成
  characters.forEach((char, index) => {
    const docId = `char_${index}`;
    documentMap.set(char.id, char);

    // 名前のインデックス
    if (!fieldIndexes.name) fieldIndexes.name = new Map();
    const nameTokens = char.name.toLowerCase().split(/\s+/);
    nameTokens.forEach(token => {
      if (!fieldIndexes.name!.has(token)) {
        fieldIndexes.name!.set(token, new Set());
      }
      fieldIndexes.name!.get(token)!.add(docId);
    });

    // エピソードのインデックス
    if (char.episode) {
      if (!fieldIndexes.episode) fieldIndexes.episode = new Map();
      const episodeKey = `ep${char.episode}`;
      if (!fieldIndexes.episode.has(episodeKey)) {
        fieldIndexes.episode.set(episodeKey, new Set());
      }
      fieldIndexes.episode.get(episodeKey)!.add(docId);
    }

    // 生年月日のインデックス
    if (char.birthDate) {
      if (!fieldIndexes.birthDate) fieldIndexes.birthDate = new Map();
      const dateKey = char.birthDate.replace(/-/g, '');
      if (!fieldIndexes.birthDate.has(dateKey)) {
        fieldIndexes.birthDate.set(dateKey, new Set());
      }
      fieldIndexes.birthDate.get(dateKey)!.add(docId);
    }

    // テーマのインデックス
    if (char.ageLayerThemes) {
      if (!fieldIndexes.ageLayerThemes) fieldIndexes.ageLayerThemes = new Map();
      char.ageLayerThemes.forEach(theme => {
        const themeTokens = theme.toLowerCase().split(/\s+/);
        themeTokens.forEach(token => {
          if (!fieldIndexes.ageLayerThemes!.has(token)) {
            fieldIndexes.ageLayerThemes!.set(token, new Set());
          }
          fieldIndexes.ageLayerThemes!.get(token)!.add(docId);
        });
      });
    }
  });

  return {
    fieldIndexes,
    documentMap,
    timestamp: Date.now()
  };
}

/**
 * インデックスを使った高速キャラクター検索
 * @param index 作成した検索インデックス
 * @param query 検索クエリ
 * @param オプション
 * @returns 検索結果
 */
export function searchCharactersWithIndex(
  index: SearchIndex<Ep1_10Character>,
  query: string,
  options: SearchOptions = {}
): SearchResult<Ep1_10Character> {
  const startTime = performance.now();
  const processedQuery = query.trim();

  if (!processedQuery) {
    return {
      items: Array.from(index.documentMap.values()),
      total: index.documentMap.size,
      searchTime: performance.now() - startTime
    };
  }

  const searchFields = options.searchFields || ['name', 'episode', 'birthDate'];
  const candidateDocIds = new Set<string>();

  // クエリをトークン化して検索
  const queryTokens = processedQuery.toLowerCase().split(/\s+/);

  queryTokens.forEach(token => {
    searchFields.forEach(field => {
      if (index.fieldIndexes[field]) {
        const matchingDocs = index.fieldIndexes[field].get(token);
        if (matchingDocs) {
          matchingDocs.forEach(docId => candidateDocIds.add(docId));
        }
      }
    });
  });

  // 候補ドキュメントからマッチング
  const results = Array.from(candidateDocIds)
    .map(docId => {
      const char = index.documentMap.get(docId);
      if (!char) return null;

      let totalScore = 0;
      let fieldCount = 0;

      searchFields.forEach(field => {
        if (field === 'name' && char.name) {
          totalScore += matchText(char.name, processedQuery, options) * 3;
          fieldCount++;
        } else if (field === 'episode' && char.episode) {
          totalScore += matchText(char.episode.toString(), processedQuery, options) * 2;
          fieldCount++;
        } else if (field === 'birthDate' && char.birthDate) {
          totalScore += matchText(char.birthDate, processedQuery, options) * 2;
          fieldCount++;
        }
      });

      return {
        item: char,
        score: fieldCount > 0 ? totalScore / fieldCount : 0
      };
    })
    .filter((result): result is { item: Ep1_10Character; score: number } => result !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 100);

  return {
    items: results.map(r => r.item),
    total: results.length,
    searchTime: performance.now() - startTime,
    scores: results.map(r => r.score)
  };
}

/**
 * 教義検索（最適化版）
 * @param teachings 教義リスト
 * @param query 検索クエリ
 * @param オプション
 * @returns 検索結果
 */
export function searchTeachings(
  teachings: SakuraTeaching[],
  query: string,
  options: SearchOptions = {}
): SearchResult<SakuraTeaching> {
  const startTime = performance.now();
  const processedQuery = query.trim();

  if (!processedQuery) {
    return {
      items: teachings,
      total: teachings.length,
      searchTime: performance.now() - startTime
    };
  }

  const searchFields = options.searchFields || [
    'title', 'category', 'theme', 'path', 'useCases'
  ];

  const results = teachings
    .map(teaching => {
      let totalScore = 0;
      let fieldCount = 0;

      // タイトル検索（最も重要）
      if (searchFields.includes('title') && teaching.title) {
        totalScore += matchText(teaching.title, processedQuery, options) * 3;
        fieldCount++;
      }

      // カテゴリ検索
      if (searchFields.includes('category') && teaching.category) {
        totalScore += matchText(teaching.category, processedQuery, options) * 2;
        fieldCount++;
      }

      // テーマ検索
      if (searchFields.includes('theme') && teaching.theme) {
        totalScore += matchText(teaching.theme, processedQuery, options) * 2;
        fieldCount++;
      }

      // パス検索
      if (searchFields.includes('path') && teaching.path) {
        totalScore += matchText(teaching.path, processedQuery, options) * 1;
        fieldCount++;
      }

      // ユースケース検索
      if (searchFields.includes('useCases') && teaching.useCases) {
        const useCaseScore = teaching.useCases.reduce((sum, useCase) => {
          return sum + matchText(useCase, processedQuery, options);
        }, 0);
        totalScore += useCaseScore;
        fieldCount++;
      }

      const averageScore = fieldCount > 0 ? totalScore / fieldCount : 0;

      return {
        item: teaching,
        score: averageScore
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 100);

  return {
    items: results.map(r => r.item),
    total: results.length,
    searchTime: performance.now() - startTime,
    scores: results.map(r => r.score)
  };
}

/**
 * 教義用検索インデックスを作成
 * @param teachings 教義リスト
 * @returns 検索インデックス
 */
export function createTeachingIndex(teachings: SakuraTeaching[]): SearchIndex<SakuraTeaching> {
  const fieldIndexes: Record<string, Map<string, Set<string>>> = {};
  const documentMap = new Map<string, SakuraTeaching>();

  teachings.forEach((teaching, index) => {
    const docId = `teaching_${index}`;
    documentMap.set(teaching.id, teaching);

    // タイトルのインデックス
    if (!fieldIndexes.title) fieldIndexes.title = new Map();
    const titleTokens = teaching.title.toLowerCase().split(/\s+/);
    titleTokens.forEach(token => {
      if (!fieldIndexes.title!.has(token)) {
        fieldIndexes.title!.set(token, new Set());
      }
      fieldIndexes.title!.get(token)!.add(docId);
    });

    // カテゴリのインデックス
    if (!fieldIndexes.category) fieldIndexes.category = new Map();
    const categoryKey = teaching.category.toLowerCase();
    if (!fieldIndexes.category.has(categoryKey)) {
      fieldIndexes.category.set(categoryKey, new Set());
    }
    fieldIndexes.category.get(categoryKey)!.add(docId);

    // テーマのインデックス
    if (!fieldIndexes.theme) fieldIndexes.theme = new Map();
    const themeTokens = teaching.theme.toLowerCase().split(/\s+/);
    themeTokens.forEach(token => {
      if (!fieldIndexes.theme!.has(token)) {
        fieldIndexes.theme!.set(token, new Set());
      }
      fieldIndexes.theme!.get(token)!.add(docId);
    });

    // ユースケースのインデックス
    if (teaching.useCases) {
      if (!fieldIndexes.useCases) fieldIndexes.useCases = new Map();
      teaching.useCases.forEach(useCase => {
        const useCaseTokens = useCase.toLowerCase().split(/\s+/);
        useCaseTokens.forEach(token => {
          if (!fieldIndexes.useCases!.has(token)) {
            fieldIndexes.useCases!.set(token, new Set());
          }
          fieldIndexes.useCases!.get(token)!.add(docId);
        });
      });
    }
  });

  return {
    fieldIndexes,
    documentMap,
    timestamp: Date.now()
  };
}

/**
 * インデックスを使った高速教義検索
 * @param index 作成した検索インデックス
 * @param query 検索クエリ
 * @param オプション
 * @returns 検索結果
 */
export function searchTeachingsWithIndex(
  index: SearchIndex<SakuraTeaching>,
  query: string,
  options: SearchOptions = {}
): SearchResult<SakuraTeaching> {
  const startTime = performance.now();
  const processedQuery = query.trim();

  if (!processedQuery) {
    return {
      items: Array.from(index.documentMap.values()),
      total: index.documentMap.size,
      searchTime: performance.now() - startTime
    };
  }

  const searchFields = options.searchFields || ['title', 'category', 'theme'];
  const candidateDocIds = new Set<string>();

  // クエリをトークン化して検索
  const queryTokens = processedQuery.toLowerCase().split(/\s+/);

  queryTokens.forEach(token => {
    searchFields.forEach(field => {
      if (index.fieldIndexes[field]) {
        const matchingDocs = index.fieldIndexes[field].get(token);
        if (matchingDocs) {
          matchingDocs.forEach(docId => candidateDocIds.add(docId));
        }
      }
    });
  });

  // 候補ドキュメントからマッチング
  const results = Array.from(candidateDocIds)
    .map(docId => {
      const teaching = index.documentMap.get(docId);
      if (!teaching) return null;

      let totalScore = 0;
      let fieldCount = 0;

      searchFields.forEach(field => {
        if (field === 'title' && teaching.title) {
          totalScore += matchText(teaching.title, processedQuery, options) * 3;
          fieldCount++;
        } else if (field === 'category' && teaching.category) {
          totalScore += matchText(teaching.category, processedQuery, options) * 2;
          fieldCount++;
        } else if (field === 'theme' && teaching.theme) {
          totalScore += matchText(teaching.theme, processedQuery, options) * 2;
          fieldCount++;
        }
      });

      return {
        item: teaching,
        score: fieldCount > 0 ? totalScore / fieldCount : 0
      };
    })
    .filter((result): result is { item: SakuraTeaching; score: number } => result !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 100);

  return {
    items: results.map(r => r.item),
    total: results.length,
    searchTime: performance.now() - startTime,
    scores: results.map(r => r.score)
  };
}

/**
 * 伏線検索（最適化版）
 * @param foreshadows 伏線リスト
 * @param query 検索クエリ
 * @param オプション
 * @returns 検索結果
 */
export function searchForeshadows(
  foreshadows: Foreshadow[],
  query: string,
  options: SearchOptions = {}
): SearchResult<Foreshadow> {
  const startTime = performance.now();
  const processedQuery = query.trim();

  if (!processedQuery) {
    return {
      items: foreshadows,
      total: foreshadows.length,
      searchTime: performance.now() - startTime
    };
  }

  const searchFields = options.searchFields || [
    'foreshadow_id', 'surface_description', 'true_meaning',
    'introduced_episode', 'must_resolve_by', 'risk_level'
  ];

  const results = foreshadows
    .map(fore => {
      let totalScore = 0;
      let fieldCount = 0;

      // 伏線ID検索
      if (searchFields.includes('foreshadow_id') && fore.foreshadow_id) {
        totalScore += matchText(fore.foreshadow_id, processedQuery, options) * 2;
        fieldCount++;
      }

      // サーフェス説明検索
      if (searchFields.includes('surface_description') && fore.surface_description) {
        totalScore += matchText(fore.surface_description, processedQuery, options) * 3;
        fieldCount++;
      }

      // 真の意味検索
      if (searchFields.includes('true_meaning') && fore.true_meaning) {
        totalScore += matchText(fore.true_meaning, processedQuery, options) * 3;
        fieldCount++;
      }

      // 導入エピソード検索
      if (searchFields.includes('introduced_episode') && fore.introduced_episode) {
        totalScore += matchText(fore.introduced_episode, processedQuery, options) * 2;
        fieldCount++;
      }

      // 回収エピソード検索
      if (searchFields.includes('must_resolve_by') && fore.must_resolve_by) {
        totalScore += matchText(fore.must_resolve_by, processedQuery, options) * 2;
        fieldCount++;
      }

      // リスクレベル検索
      if (searchFields.includes('risk_level') && fore.risk_level) {
        totalScore += matchText(fore.risk_level, processedQuery, options) * 1;
        fieldCount++;
      }

      const averageScore = fieldCount > 0 ? totalScore / fieldCount : 0;

      return {
        item: fore,
        score: averageScore
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 100);

  return {
    items: results.map(r => r.item),
    total: results.length,
    searchTime: performance.now() - startTime,
    scores: results.map(r => r.score)
  };
}

/**
 * 伏線用検索インデックスを作成
 * @param foreshadows 伏線リスト
 * @returns 検索インデックス
 */
export function createForeshadowIndex(foreshadows: Foreshadow[]): SearchIndex<Foreshadow> {
  const fieldIndexes: Record<string, Map<string, Set<string>>> = {};
  const documentMap = new Map<string, Foreshadow>();

  foreshadows.forEach((fore, index) => {
    const docId = `fore_${index}`;
    documentMap.set(fore.foreshadow_id, fore);

    // 伏線IDのインデックス
    if (!fieldIndexes.foreshadow_id) fieldIndexes.foreshadow_id = new Map();
    const idTokens = fore.foreshadow_id.toLowerCase().split(/[-_]/);
    idTokens.forEach(token => {
      if (!fieldIndexes.foreshadow_id!.has(token)) {
        fieldIndexes.foreshadow_id!.set(token, new Set());
      }
      fieldIndexes.foreshadow_id!.get(token)!.add(docId);
    });

    // エピソード番号のインデックス
    if (fore.introduced_episode) {
      if (!fieldIndexes.introduced_episode) fieldIndexes.introduced_episode = new Map();
      const episodeNum = parseEpisodeNum(fore.introduced_episode);
      const episodeKey = `ep${episodeNum}`;
      if (!fieldIndexes.introduced_episode.has(episodeKey)) {
        fieldIndexes.introduced_episode.set(episodeKey, new Set());
      }
      fieldIndexes.introduced_episode.get(episodeKey)!.add(docId);
    }

    if (fore.must_resolve_by) {
      if (!fieldIndexes.must_resolve_by) fieldIndexes.must_resolve_by = new Map();
      const resolveNum = parseEpisodeNum(fore.must_resolve_by);
      const resolveKey = `ep${resolveNum}`;
      if (!fieldIndexes.must_resolve_by.has(resolveKey)) {
        fieldIndexes.must_resolve_by.set(resolveKey, new Set());
      }
      fieldIndexes.must_resolve_by.get(resolveKey)!.add(docId);
    }

    // リスクレベルのインデックス
    if (fore.risk_level) {
      if (!fieldIndexes.risk_level) fieldIndexes.risk_level = new Map();
      const riskKey = fore.risk_level.toLowerCase();
      if (!fieldIndexes.risk_level.has(riskKey)) {
        fieldIndexes.risk_level.set(riskKey, new Set());
      }
      fieldIndexes.risk_level.get(riskKey)!.add(docId);
    }

    // 説明文のインデックス
    if (fore.surface_description) {
      if (!fieldIndexes.surface_description) fieldIndexes.surface_description = new Map();
      const descTokens = fore.surface_description.toLowerCase().split(/\s+/);
      descTokens.forEach(token => {
        if (token.length > 2) { // 短すぎるトークンは無視
          if (!fieldIndexes.surface_description!.has(token)) {
            fieldIndexes.surface_description!.set(token, new Set());
          }
          fieldIndexes.surface_description!.get(token)!.add(docId);
        }
      });
    }

    if (fore.true_meaning) {
      if (!fieldIndexes.true_meaning) fieldIndexes.true_meaning = new Map();
      const meaningTokens = fore.true_meaning.toLowerCase().split(/\s+/);
      meaningTokens.forEach(token => {
        if (token.length > 2) {
          if (!fieldIndexes.true_meaning!.has(token)) {
            fieldIndexes.true_meaning!.set(token, new Set());
          }
          fieldIndexes.true_meaning!.get(token)!.add(docId);
        }
      });
    }
  });

  return {
    fieldIndexes,
    documentMap,
    timestamp: Date.now()
  };
}

/**
 * インデックスを使った高速伏線検索
 * @param index 作成した検索インデックス
 * @param query 検索クエリ
 * @param オプション
 * @returns 検索結果
 */
export function searchForeshadowsWithIndex(
  index: SearchIndex<Foreshadow>,
  query: string,
  options: SearchOptions = {}
): SearchResult<Foreshadow> {
  const startTime = performance.now();
  const processedQuery = query.trim();

  if (!processedQuery) {
    return {
      items: Array.from(index.documentMap.values()),
      total: index.documentMap.size,
      searchTime: performance.now() - startTime
    };
  }

  const searchFields = options.searchFields || ['foreshadow_id', 'surface_description', 'true_meaning'];
  const candidateDocIds = new Set<string>();

  // クエリをトークン化して検索
  const queryTokens = processedQuery.toLowerCase().split(/\s+/);

  queryTokens.forEach(token => {
    searchFields.forEach(field => {
      if (index.fieldIndexes[field]) {
        const matchingDocs = index.fieldIndexes[field].get(token);
        if (matchingDocs) {
          matchingDocs.forEach(docId => candidateDocIds.add(docId));
        }
      }
    });
  });

  // 候補ドキュメントからマッチング
  const results = Array.from(candidateDocIds)
    .map(docId => {
      const fore = index.documentMap.get(docId);
      if (!fore) return null;

      let totalScore = 0;
      let fieldCount = 0;

      searchFields.forEach(field => {
        if (field === 'foreshadow_id' && fore.foreshadow_id) {
          totalScore += matchText(fore.foreshadow_id, processedQuery, options) * 2;
          fieldCount++;
        } else if (field === 'surface_description' && fore.surface_description) {
          totalScore += matchText(fore.surface_description, processedQuery, options) * 3;
          fieldCount++;
        } else if (field === 'true_meaning' && fore.true_meaning) {
          totalScore += matchText(fore.true_meaning, processedQuery, options) * 3;
          fieldCount++;
        }
      });

      return {
        item: fore,
        score: fieldCount > 0 ? totalScore / fieldCount : 0
      };
    })
    .filter((result): result is { item: Foreshadow; score: number } => result !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 100);

  return {
    items: results.map(r => r.item),
    total: results.length,
    searchTime: performance.now() - startTime,
    scores: results.map(r => r.score)
  };
}

/**
 * 世界観データインターフェース
 */
export interface WorldviewData {
  themes: { theme: string; count: number; percent: number }[];
  sakuraRecalls?: { ep: number; theme: string; source: string }[];
  lifeEvents?: string[];
  chapters?: Array<{
    id: number;
    name: string;
    themes: string[];
  }>;
}

/**
 * 世界観検索（最適化版）
 * @param worldview 世界観データ
 * @param query 検索クエリ
 * @param オプション
 * @returns 検索結果
 */
export function searchWorldview(
  worldview: WorldviewData,
  query: string,
  options: SearchOptions = {}
): SearchResult<any> {
  const startTime = performance.now();
  const processedQuery = query.trim();

  if (!processedQuery) {
    return {
      items: [worldview],
      total: 1,
      searchTime: performance.now() - startTime
    };
  }

  const results: any[] = [];
  const scores: number[] = [];

  // テーマ検索
  if (worldview.themes) {
    worldview.themes.forEach(theme => {
      const score = matchText(theme.theme, processedQuery, options);
      if (score > 0) {
        results.push({
          type: 'theme',
          data: theme,
          context: 'theme'
        });
        scores.push(score * 2);
      }
    });
  }

  // さくら回想検索
  if (worldview.sakuraRecalls) {
    worldview.sakuraRecalls.forEach((recall, index) => {
      let totalScore = 0;
      let fieldCount = 0;

      // テーマ検索
      if (recall.theme) {
        totalScore += matchText(recall.theme, processedQuery, options) * 2;
        fieldCount++;
      }

      // ソース検索
      if (recall.source) {
        totalScore += matchText(recall.source, processedQuery, options) * 1;
        fieldCount++;
      }

      // エピソード番号検索
      if (recall.ep.toString().includes(processedQuery)) {
        totalScore += 2;
        fieldCount++;
      }

      if (fieldCount > 0) {
        const averageScore = totalScore / fieldCount;
        results.push({
          type: 'sakuraRecall',
          data: recall,
          context: 'sakuraRecall',
          episode: recall.ep
        });
        scores.push(averageScore);
      }
    });
  }

  // 章のテーマ検索
  if (worldview.chapters) {
    worldview.chapters.forEach(chapter => {
      const themeScore = chapter.themes.reduce((sum, theme) => {
        return sum + matchText(theme, processedQuery, options);
      }, 0);

      if (themeScore > 0) {
        results.push({
          type: 'chapter',
          data: chapter,
          context: 'chapter'
        });
        scores.push(themeScore / chapter.themes.length);
      }
    });
  }

  // ソートとスライス
  const sortedResults = results
    .map((item, index) => ({ item, score: scores[index] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 100);

  return {
    items: sortedResults.map(r => r.item),
    total: sortedResults.length,
    searchTime: performance.now() - startTime,
    scores: sortedResults.map(r => r.score)
  };
}

/**
 * 世界観用検索インデックスを作成
 * @param worldview 世界観データ
 * @returns 検索インデックス
 */
export function createWorldviewIndex(worldview: WorldviewData): SearchIndex<any> {
  const fieldIndexes: Record<string, Map<string, Set<string>>> = {};
  const documentMap = new Map<string, any>();

  // テーマのインデックス
  if (worldview.themes) {
    worldview.themes.forEach((theme, index) => {
      const docId = `theme_${index}`;
      documentMap.set(docId, {
        type: 'theme',
        data: theme,
        context: 'theme'
      });

      if (!fieldIndexes.theme) fieldIndexes.theme = new Map();
      const themeTokens = theme.theme.toLowerCase().split(/\s+/);
      themeTokens.forEach(token => {
        if (!fieldIndexes.theme!.has(token)) {
          fieldIndexes.theme!.set(token, new Set());
        }
        fieldIndexes.theme!.get(token)!.add(docId);
      });
    });
  }

  // さくら回想のインデックス
  if (worldview.sakuraRecalls) {
    worldview.sakuraRecalls.forEach((recall, index) => {
      const docId = `recall_${index}`;
      documentMap.set(docId, {
        type: 'sakuraRecall',
        data: recall,
        context: 'sakuraRecall',
        episode: recall.ep
      });

      // テーマのインデックス
      if (!fieldIndexes.recallTheme) fieldIndexes.recallTheme = new Map();
      const themeTokens = recall.theme.toLowerCase().split(/\s+/);
      themeTokens.forEach(token => {
        if (!fieldIndexes.recallTheme!.has(token)) {
          fieldIndexes.recallTheme!.set(token, new Set());
        }
        fieldIndexes.recallTheme!.get(token)!.add(docId);
      });

      // ソースのインデックス
      if (!fieldIndexes.recallSource) fieldIndexes.recallSource = new Map();
      const sourceKey = recall.source.toLowerCase();
      if (!fieldIndexes.recallSource.has(sourceKey)) {
        fieldIndexes.recallSource.set(sourceKey, new Set());
      }
      fieldIndexes.recallSource.get(sourceKey)!.add(docId);

      // エピソード番号のインデックス
      if (!fieldIndexes.recallEpisode) fieldIndexes.recallEpisode = new Map();
      const episodeKey = `ep${recall.ep}`;
      if (!fieldIndexes.recallEpisode.has(episodeKey)) {
        fieldIndexes.recallEpisode.set(episodeKey, new Set());
      }
      fieldIndexes.recallEpisode.get(episodeKey)!.add(docId);
    });
  }

  // 章のインデックス
  if (worldview.chapters) {
    worldview.chapters.forEach((chapter, index) => {
      const docId = `chapter_${index}`;
      documentMap.set(docId, {
        type: 'chapter',
        data: chapter,
        context: 'chapter'
      });

      // 章名とテーマのインデックス
      if (!fieldIndexes.chapterName) fieldIndexes.chapterName = new Map();
      const nameKey = chapter.name.toLowerCase();
      if (!fieldIndexes.chapterName.has(nameKey)) {
        fieldIndexes.chapterName.set(nameKey, new Set());
      }
      fieldIndexes.chapterName.get(nameKey)!.add(docId);

      if (!fieldIndexes.chapterTheme) fieldIndexes.chapterTheme = new Map();
      chapter.themes.forEach(theme => {
        const themeTokens = theme.toLowerCase().split(/\s+/);
        themeTokens.forEach(token => {
          if (!fieldIndexes.chapterTheme!.has(token)) {
            fieldIndexes.chapterTheme!.set(token, new Set());
          }
          fieldIndexes.chapterTheme!.get(token)!.add(docId);
        });
      });
    });
  }

  return {
    fieldIndexes,
    documentMap,
    timestamp: Date.now()
  };
}

/**
 * インデックスを使った高速世界観検索
 * @param index 作成した検索インデックス
 * @param query 検索クエリ
 * @param オプション
 * @returns 検索結果
 */
export function searchWorldviewWithIndex(
  index: SearchIndex<any>,
  query: string,
  options: SearchOptions = {}
): SearchResult<any> {
  const startTime = performance.now();
  const processedQuery = query.trim();

  if (!processedQuery) {
    return {
      items: Array.from(index.documentMap.values()),
      total: index.documentMap.size,
      searchTime: performance.now() - startTime
    };
  }

  const searchFields = options.searchFields || ['theme', 'recallTheme', 'recallSource', 'chapterName'];
  const candidateDocIds = new Set<string>();

  // クエリをトークン化して検索
  const queryTokens = processedQuery.toLowerCase().split(/\s+/);

  queryTokens.forEach(token => {
    searchFields.forEach(field => {
      if (index.fieldIndexes[field]) {
        const matchingDocs = index.fieldIndexes[field].get(token);
        if (matchingDocs) {
          matchingDocs.forEach(docId => candidateDocIds.add(docId));
        }
      }
    });
  });

  // 候補ドキュメントからマッチング
  const results = Array.from(candidateDocIds)
    .map(docId => {
      const item = index.documentMap.get(docId);
      if (!item) return null;

      let totalScore = 0;
      let fieldCount = 0;

      switch (item.type) {
        case 'theme':
          if (item.data.theme) {
            totalScore += matchText(item.data.theme, processedQuery, options) * 2;
            fieldCount++;
          }
          break;

        case 'sakuraRecall':
          if (item.data.theme) {
            totalScore += matchText(item.data.theme, processedQuery, options) * 2;
            fieldCount++;
          }
          if (item.data.source) {
            totalScore += matchText(item.data.source, processedQuery, options) * 1;
            fieldCount++;
          }
          break;

        case 'chapter':
          if (item.data.name) {
            totalScore += matchText(item.data.name, processedQuery, options) * 2;
            fieldCount++;
          }
          break;
      }

      return {
        item,
        score: fieldCount > 0 ? totalScore / fieldCount : 0
      };
    })
    .filter((result): result is { item: any; score: number } => result !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxResults || 100);

  return {
    items: results.map(r => r.item),
    total: results.length,
    searchTime: performance.now() - startTime,
    scores: results.map(r => r.score)
  };
}

/**
 * エピソードを章でフィルタリング
 * @param episodes エピソードリスト
 * @param chapterId 章ID（nullですべて）
 * @returns フィルタリングされたエピソードリスト
 */
export function filterEpisodesByChapter<T extends { episode: number }>(
  episodes: T[],
  chapterId: number | null
): T[] {
  if (chapterId === null) return episodes;

  const chapter = CHAPTERS.find(ch => ch.id === chapterId);
  if (!chapter) return episodes;

  return episodes.filter(ep =>
    ep.episode >= chapter.episodeRange[0] &&
    ep.episode <= chapter.episodeRange[1]
  );
}

/**
 * ハイライトマッチ関数
 * @param text 元のテキスト
 * @param query クエリ
 * @param options オプション
 * @returns ハイライトされたHTML文字列
 */
export function highlightMatch(
  text: string,
  query: string,
  options: SearchOptions = {}
): string {
  if (!query.trim()) return text;

  const processedQuery = options.caseSensitive ? query : query.toLowerCase();
  const processedText = options.caseSensitive ? text : text.toLowerCase();

  // ファジー検索の場合はハイライトしない
  if (options.fuzzyThreshold && options.fuzzyThreshold > 0) {
    return text;
  }

  const regex = new RegExp(`(${escapedRegExp(processedQuery)})`, 'g');
  return processedText.replace(regex, '<mark>$1</mark>');
}

/**
 * 正規表現特殊文字をエスケープ
 */
function escapedRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * デバウンス関数
 * @param func デバウンス対象の関数
 * @param delay 遅延時間（ミリ秒）
 * @returns デバウンスされた関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 節約版デバウンス（React用）
 * @param callback コールバック関数
 * @param delay 遅延時間
 * @returns デバウンスされたコールバック
 */
export function useDebounceCallback(
  callback: (query: string) => void,
  delay: number = 300
) {
  return debounce(callback, delay);
}

/**
 * 検索インデックスを保存するためのユーティリティ
 * @param key 保存キー
 * @param index 保存するインデックス
 */
export function saveSearchIndex<T>(key: string, index: SearchIndex<T>): void {
  try {
    const serializedIndex = {
      ...index,
      timestamp: Date.now()
    };
    localStorage.setItem(`search_index_${key}`, JSON.stringify(serializedIndex));
  } catch (error) {
    console.warn(`Failed to save search index for ${key}:`, error);
  }
}

/**
 * 検索インデックスを取得するためのユーティリティ
 * @param key 取得キー
 * @param data 最新のデータ（インデックスが古い場合再作成）
 * @returns 検索インデックス
 */
export function loadSearchIndex<T>(
  key: string,
  data: T[],
  createIndex: (data: T) => SearchIndex<T>
): SearchIndex<T> | null {
  try {
    const saved = localStorage.getItem(`search_index_${key}`);
    if (!saved) return null;

    const index: SearchIndex<T> = JSON.parse(saved);

    // インデックスが1時間以上古い場合は再作成
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - index.timestamp > oneHour) {
      return null;
    }

    return index;
  } catch (error) {
    console.warn(`Failed to load search index for ${key}:`, error);
    return null;
  }
}

/**
 * 全データ型を横断検索する汎用関数
 * @param dataSources データソースのマップ
 * @param query 検索クエリ
 * @param options オプション
 * @returns 横断検索結果
 */
export function crossSearch(
  dataSources: {
    characters?: Ep1_10Character[];
    teachings?: SakuraTeaching[];
    foreshadows?: Foreshadow[];
    worldview?: WorldviewData;
  },
  query: string,
  options: SearchOptions = {}
): {
  characters?: SearchResult<Ep1_10Character>;
  teachings?: SearchResult<SakuraTeaching>;
  foreshadows?: SearchResult<Foreshadow>;
  worldview?: SearchResult<any>;
} {
  const results: any = {};

  if (dataSources.characters) {
    results.characters = searchCharacters(dataSources.characters, query, options);
  }

  if (dataSources.teachings) {
    results.teachings = searchTeachings(dataSources.teachings, query, options);
  }

  if (dataSources.foreshadows) {
    results.foreshadows = searchForeshadows(dataSources.foreshadows, query, options);
  }

  if (dataSources.worldview) {
    results.worldview = searchWorldview(dataSources.worldview, query, options);
  }

  return results;
}

// 13章データの参照（循環参照を避けるため別途インポート）
const CHAPTERS = [
  { id: 1, episodeRange: [1, 10] as const },
  { id: 2, episodeRange: [11, 25] as const },
  { id: 3, episodeRange: [26, 41] as const },
  { id: 4, episodeRange: [42, 55] as const },
  { id: 5, episodeRange: [56, 70] as const },
  { id: 6, episodeRange: [71, 85] as const },
  { id: 7, episodeRange: [86, 99] as const },
  { id: 8, episodeRange: [100, 105] as const },
  { id: 9, episodeRange: [106, 112] as const },
  { id: 10, episodeRange: [113, 115] as const },
  { id: 11, episodeRange: [116, 118] as const },
  { id: 12, episodeRange: [119, 119] as const },
  { id: 13, episodeRange: [120, 120] as const },
] as const;

/**
 * エピソード番号をパースするヘルパー関数
 * @param episode エピソード文字列（例: "episode_01"）
 * @returns エピソード番号
 */
export function parseEpisodeNum(ep: string): number {
  const m = ep.match(/episode_(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
}
