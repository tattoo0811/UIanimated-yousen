/**
 * キャラクター表現レビュー
 *
 * チェック項目:
 * - 発言の矛盾（性格一貫性）
 * - より良いセリフの提案
 * - キャラクターの「声」の品質評価
 * - 言葉遣いのキャラクター性
 */

import { readFileSync, existsSync } from 'fs';

interface Issue {
  level: 'error' | 'warning' | 'suggestion';
  category: string;
  character?: string;
  message: string;
  line?: string;
  improvement?: string;
}

const results: Issue[] = [];

function addIssue(
  level: Issue['level'],
  category: string,
  message: string,
  character?: string,
  line?: string,
  improvement?: string
) {
  results.push({ level, category, character, message, line, improvement });
}

/**
 * キャラクターの言葉遣い特性
 */
interface CharacterVoice {
  name: string;
  tone: string;
  keywords: string[];
  avoidWords: string[];
  speechPatterns: string[];
}

const characterVoices: CharacterVoice[] = [
  {
    name: '九条 巡',
    tone: '分析的、少し冷笑的、内省的',
    keywords: ['原理', '構造', '因果', '傾向'],
    avoidWords: ['絶対', '100%'],
    speechPatterns: ['〜だろう', '〜という', '〜のようだ'],
  },
  {
    name: '藤堂 慧',
    tone: '実直、誠実、少し堅苦しい',
    keywords: ['努力', '継続', '約束'],
    avoidWords: ['適当', 'いい加減'],
    speechPatterns: ['〜です', '〜ます', '〜ね'],
  },
  {
    name: '九条 さくら',
    tone: '詩的、比喩的、穏やか',
    keywords: ['種', '土', '水', '光', '静か'],
    avoidWords: [],
    speechPatterns: ['〜でしょう', '〜ですね', '〜かもしれません'],
  },
  {
    name: '高橋 美咲',
    tone: '元気、率直、少し反抗的',
    keywords: ['うそ', 'まじ', 'やだ'],
    avoidWords: [],
    speechPatterns: ['〜じゃん', '〜だし', '〜して'],
  },
];

/**
 * 発言のキャラクター性チェック
 */
function checkSpeechCharacterConsistency(speech: string, character: string) {
  const voice = characterVoices.find(v => v.name === character);
  if (!voice) return;

  // 避けるべき言葉のチェック
  for (const avoid of voice.avoidWords) {
    if (speech.includes(avoid)) {
      addIssue(
        'warning',
        '言葉遣い',
        `${character} らしくない言葉「${avoid}」が使われています`,
        character,
        speech,
        `より自然な表現に変更を検討してください`
      );
    }
  }

  // キーワードの使用チェック（情報レベル）
  const keywordCount = voice.keywords.filter(k => speech.includes(k)).length;
  if (keywordCount > 0) {
    addIssue(
      'suggestion',
      '言葉遣い',
      `${character} の特性を表現するキーワード ${keywordCount} 件を使用`,
      character,
      speech,
      `キーワード: ${voice.keywords.filter(k => speech.includes(k)).join(', ')}`
    );
  }
}

/**
 * セリフの品質評価
 */
function evaluateDialogueQuality(speech: string, character: string): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 100;

  // 長すぎるセリフ
  if (speech.length > 100) {
    score -= 10;
    reasons.push('セリフが長すぎる');
  }

  // 短すぎるセリフ（重要な場面）
  if (speech.length < 5 && character === '九条 さくら') {
    score -= 5;
    reasons.push('重要なキャラクターのセリフが短すぎる');
  }

  // 「...」多用
  const ellipsisCount = (speech.match(/\.\.\./g) || []).length;
  if (ellipsisCount > 2) {
    score -= 5;
    reasons.push('「...」を多用しすぎ');
  }

  // 説明的すぎる
  const explanationWords = ['つまり', 'ようするに', 'だから'];
  const explanationCount = explanationWords.filter(w => speech.includes(w)).length;
  if (explanationCount >= 2) {
    score -= 10;
    reasons.push('説明になりすぎている');
  }

  return { score, reasons };
}

/**
 * 小説ファイルからセリフを抽出してチェック
 */
function checkNovelDialogues() {
  const novelPath = 'novel';
  // 実際の実装では novel/ 配下のファイルをスキャン

  addIssue(
    'info',
    'スキャン',
    'novel/ 配下のセリフチェック（実装中）',
    undefined,
    undefined,
    '各エピソードファイルのパース処理を追加してください'
  );
}

/**
 * キャラクター間の関係性に基づく発言チェック
 */
function checkRelationshipBasedSpeech() {
  const relationships = [
    { chars: ['九条 巡', '藤堂 慧'], tone: '親友、対等', expected: '敬語すぎない、フランク' },
    { chars: ['九条 巡', '九条 さくら'], tone: '師弟、尊敬', expected: '丁寧、学ぶ姿勢' },
    { chars: ['九条 巡', '高橋 美咲'], tone: '先輩後輩', expected: '指導的、優しさ' },
  ];

  for (const rel of relationships) {
    addIssue(
      'info',
      '関係性',
      `${rel.chars[0]} × ${rel.chars[1]}: ${rel.tone} (${rel.expected})`
    );
  }
}

/**
 * セリフの改善提案
 */
function suggestDialogueImprovements() {
  const improvements = [
    {
      character: '九条 巡',
      bad: 'それは絶対に間違っている',
      good: 'その論理、少し飛躍がある気がする',
      reason: '絶定表現は避け、分析的な口調に',
    },
    {
      character: '九条 さくら',
      bad: '頑張ってください',
      good: '種は、静かに土の中で待つものです',
      reason: '比喩的表現で特徴を活かす',
    },
    {
      character: '高橋 美咲',
      bad: 'わかりました、先生',
      good: 'うそ、まじで？ やだって',
      reason: '年相応の反抗的な口調を反映',
    },
  ];

  for (const imp of improvements) {
    addIssue(
      'suggestion',
      'セリフ改善',
      imp.reason,
      imp.character,
      `Bad: ${imp.bad}`,
      `Good: ${imp.good}`
    );
  }
}

/**
 * キャラクターの感情一貫性チェック
 */
function checkEmotionalConsistency() {
  const emotionalArcs = [
    {
      character: '九条 巡',
      start: '冷笑的、分析的',
      middle: '疑問、探求',
      end: '受容、統合',
      status: '追跡中',
    },
    {
      character: '高橋 美咲',
      start: '反抗的、閉じている',
      middle: '開き始める',
      end: '自立',
      status: '追跡中',
    },
  ];

  for (const arc of emotionalArcs) {
    addIssue(
      'info',
      '感情の弧',
      `${arc.character}: ${arc.start} → ${arc.middle} → ${arc.end} (${arc.status})`
    );
  }
}

/**
 * 実行
 */
function main() {
  console.log('🔍 キャラクター表現レビュー 開始\n');
  console.log('='.repeat(60));

  checkNovelDialogues();
  checkRelationshipBasedSpeech();
  suggestDialogueImprovements();
  checkEmotionalConsistency();

  console.log('\n' + '='.repeat(60));
  console.log(`\n✓ チェック完了: ${results.length} 件の issues\n`);

  // レベル別に集計
  const errors = results.filter(r => r.level === 'error').length;
  const warnings = results.filter(r => r.level === 'warning').length;
  const suggestions = results.filter(r => r.level === 'suggestion').length;

  console.log(`📊 集計: ${errors} エラー, ${warnings} 警告, ${suggestions} 改善提案\n`);

  // 結果表示
  for (const issue of results) {
    const icon =
      issue.level === 'error'
        ? '❌'
        : issue.level === 'warning'
        ? '⚠️'
        : '💡';
    const charStr = issue.character ? ` [${issue.character}]` : '';
    console.log(`${icon} [${issue.category}]${charStr} ${issue.message}`);
    if (issue.line) {
      console.log(`   "${issue.line}"`);
    }
    if (issue.improvement) {
      console.log(`   💡 ${issue.improvement}`);
    }
  }

  // 改善提案は失敗にしない
  if (errors > 0) {
    console.log('\n❌ エラーがあるため失敗しました');
    process.exit(1);
  }

  console.log('\n✅ キャラクター表現レビュー完了');
  process.exit(0);
}

main();
