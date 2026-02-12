---
phase: 02-thirteen-chapters
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/data/chapters.ts
  - src/components/features/ThirteenChapters.tsx
  - src/app/dashboard/page.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "ユーザーは13章構造の全体像を一覧できる（各章の話数範囲、期間、テーマ）"
    - "ユーザーは各章の詳細タイムラインを展開して閲覧できる（アコーディオン展開）"
    - "章ごとの3部構成マッピングが視覚的に識別できる（色分けバッジ）"
  artifacts:
    - path: "src/data/chapters.ts"
      provides: "13章データ構造"
      min_lines: 80
      exports: ["CHAPTERS_DATA", "getPartForChapter", "PART_MAPPING"]
    - path: "src/components/features/ThirteenChapters.tsx"
      provides: "13章構造表示コンポーネント"
      min_lines: 150
      contains: ["accordion", "expandedChapter", "Framer Motion"]
    - path: "src/app/dashboard/page.tsx"
      provides: "13章タブ追加"
      exports: ["ThirteenChaptersTab"]
  key_links:
    - from: "src/components/features/ThirteenChapters.tsx"
      to: "src/data/chapters.ts"
      via: "CHAPTERS_DATA import"
      pattern: "CHAPTERS_DATA\\.map\\(chapter"
    - from: "src/app/dashboard/page.tsx"
      to: "src/components/features/ThirteenChapters.tsx"
      via: "ThirteenChaptersTab component"
      pattern: "ThirteenChaptersTab.*viewMode"
---

<objective>
13章構造データを作成し、アコーディオン形式のタイムラインコンポーネントを実装する

**目的:**
DASHBOARD.mdの13章構造セクションをWeb UIで閲覧可能にする。ユーザーは13章の全体像を一覧でき、各章の詳細（話数範囲、期間、テーマ）を展開して確認できる。

**価値:**
物語の中核構造を可視化することで、読者はストーリーの全体構造を理解しやすくなる。アコーディオンパターンで情報の階層化を実現し、3部構成とのマッピングを色分けで視覚化する。

**出力:**
- `src/data/chapters.ts`: 13章データ構造（TypeScript定数）
- `src/components/features/ThirteenChapters.tsx`: アコーディオンコンポーネント
- `src/app/dashboard/page.tsx`: 新規「13章」タブの追加
</objective>

<execution_context>
@/Users/kitamuratatsuhiko/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kitamuratatsuhiko/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-thirteen-chapters/02-RESEARCH.md

# Phase 1 パターン参照
@.planning/phases/01-overview-stats/01-overview-stats-04-SUMMARY.md

# データソース
@/Users/kitamuratatsuhiko/UIanimated/novel/dashboards/DASHBOARD.md

# 既存コンポーネントパターン
@/Users/kitamuratatsuhiko/UIanimated/src/components/features/StoryPartsDisplay.tsx
@/Users/kitamuratatsuhiko/UIanimated/src/components/features/SubthemesStats.tsx
@/Users/kitamuratatsuhiko/UIanimated/src/app/dashboard/page.tsx
</context>

<tasks>

<task type="auto">
  <name>13章データ構造の作成</name>
  <files>src/data/chapters.ts</files>
  <action>
DASHBOARD.mdの「13章構造」セクション（第43-96行）から13章分のデータをTypeScript定数として作成：

1. **Chapterインターフェースの定義:**
   ```typescript
   export interface Chapter {
     id: number;              // 1-13
     name: string;            // "出会いの章"
     episodeStart: number;     // 1
     episodeEnd: number;       // 8
     period: string;          // "2026年4月前半"
     theme: string;           // "運命診断室の開院と最初の患者たち"
     part: 'foundation' | 'conflict' | 'integration';
   }
   ```

2. **CHAPTERS_DATA定数の作成:**
   - DASHBOARD.md第43-96行から全13章分のデータを抽出
   - 各章の「部（part）」を以下のルールで割り当て:
     - 第1-5章: foundation（基礎編）
     - 第6-9章: conflict（葛藤編）
     - 第10-13章: integration（統合編）
   - データ例:
     ```typescript
     export const CHAPTERS_DATA: Chapter[] = [
       {
         id: 1,
         name: '出会いの章',
         episodeStart: 1,
         episodeEnd: 8,
         period: '2026年4月前半',
         theme: '運命診断室の開院と最初の患者たち',
         part: 'foundation'
       },
       // ... 残り12章
     ];
     ```

3. **パートマッピング情報の追加:**
   ```typescript
   export const PART_MAPPING = {
     foundation: { name: '基礎編', chapters: [1, 2, 3, 4, 5] },
     conflict: { name: '葛藤編', chapters: [6, 7, 8, 9] },
     integration: { name: '統合編', chapters: [10, 11, 12, 13] }
   } as const;

   export function getPartForChapter(chapterId: number): PartType {
     if (chapterId <= 5) return 'foundation';
     if (chapterId <= 9) return 'conflict';
     return 'integration';
   }
   ```

4. **.gitignoreへの追加:**
   - characters.tsと同様、chapters.tsもローカル更新のみとするため.gitignoreに追加
   - `src/data/chapters.ts`をコミット対象外に

**重要:**
- episodeStart/episodeEndは数値型（stringではなく）
- themeは日本語テキストをそのまま保持
- partは3つのリテラル型のみ使用
  </action>
  <verify>
```bash
# ファイル存在確認
test -f src/data/chapters.ts && echo "✅ File exists"

# TypeScript型チェック
npx tsc --noEmit --skipLibCheck 2>&1 | grep -i "chapters.ts" || echo "✅ No type errors"

# データ数確認（13章）
node -e "const data = require('./src/data/chapters.ts'); console.log(data.CHAPTERS_DATA?.length === 13 ? '✅ 13 chapters' : '❌ Wrong count')"

# パート割り当て確認
node -e "
const data = require('./src/data/chapters.ts');
const f = data.CHAPTERS_DATA.filter(c => c.part === 'foundation').length;
const cf = data.CHAPTERS_DATA.filter(c => c.part === 'conflict').length;
const i = data.CHAPTERS_DATA.filter(c => c.part === 'integration').length;
console.log((f === 5 && cf === 4 && i === 4) ? '✅ Part mapping correct' : '❌ Part mapping wrong');
"
```
  </verify>
  <done>
- `src/data/chapters.ts`が存在し、CHAPTERS_DATA定数に13章分のデータが含まれる
- 各章にid(1-13), name, episodeStart, episodeEnd, period, theme, partが正しく設定されている
- getPartForChapter関数が章IDから正しくパート型を返す
- TypeScriptコンパイルエラーがない
- chapters.tsが.gitignoreに追加されている（ローカル更新のみ）
  </done>
</task>

<task type="auto">
  <name>ThirteenChaptersアコーディオンコンポーネントの実装</name>
  <files>src/components/features/ThirteenChapters.tsx</files>
  <action>
StoryPartsDisplay.tsxとSubthemesStats.tsxのパターンを参考に、13章構造表示コンポーネントを実装：

1. **基本構造:**
   ```typescript
   'use client';
   import React, { useState } from 'react';
   import { motion, AnimatePresence } from 'framer-motion';
   import { ChevronDown, ChevronUp, Calendar, BookOpen } from 'lucide-react';
   import { CHAPTERS_DATA, PART_MAPPING } from '@/data/chapters';
   import type { ViewMode } from '@/app/dashboard/page';

   export function ThirteenChapters({ viewMode }: { viewMode: ViewMode }) {
     const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
     // ...
   }
   ```

2. **アコーディオンパターン:**
   - 単一選択アコーディオン（expandedChapterはnumber | null）
   - ヘッダーをクリックで展開/折りたたみ
   - Framer MotionのAnimatePresenceで高さアニメーション
   ```typescript
   <AnimatePresence>
     {expandedChapter === chapter.id && (
       <motion.div
         initial={{ height: 0, opacity: 0 }}
         animate={{ height: 'auto', opacity: 1 }}
         exit={{ height: 0, opacity: 0 }}
         transition={{ duration: 0.3 }}
         className="overflow-hidden"
       >
         {/* 詳細コンテンツ */}
       </motion.div>
     )}
   </AnimatePresence>
   ```

3. **パート色分け:**
   ```typescript
   const PART_COLORS = {
     foundation: 'from-emerald-500 to-green-500',
     conflict: 'from-amber-500 to-orange-500',
     integration: 'from-violet-500 to-purple-500'
   } as const;
   ```
   - ヘッダーのバッジにパート名と色を表示
   - StoryPartsDisplay.tsxの色分けと統一

4. **章ヘッダー（常に表示）:**
   - 第X章: 章名
   - パートバッジ（色分け）
   - 話数範囲（例: "第1-8話"）
   - ChevronDown/ChevronUpアイコン（展開状態に応じて回転）

5. **章詳細（展開時表示）:**
   - 期間（Calendar icon）
   - テーマ（BookOpen icon）
   - **話数グリッド**:
     - episodeStartからepisodeEndまでの全話数をグリッド表示
     - レスポンシブ: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
     - 各話数セル: "第X話"のテキスト

6. **viewMode対応:**
   - simple: ヘッダー情報のみ（最小表示）
   - detailed: 展開可能な詳細表示（デフォルトは全て折りたたんだ状態）

7. **アニメーション:**
   - フェードイン（stagger: 0.05 + index * 0.03）
   - ホバー効果: bg-slate-800/30 → bg-slate-800/50

8. **セクションヘッダー:**
   - "13章構造"見出し
   - BarChart3 icon
   - パート別説明（基礎編5章、葛藤編4章、統合編4章）

**デザイン制約:**
- OverviewStats.tsxのカードレイアウトパターンを再利用
- StoryPartsDisplay.tsxのパート色分けを統一
- SubthemesStats.tsxのグリッドシステムを話数表示に応用
- アイコンはlucide-reactのみ使用（ChevronDown, ChevronUp, Calendar, BookOpen）
  </action>
  <verify>
```bash
# TypeScriptコンパイル
npx tsc --noEmit src/components/features/ThirteenChapters.tsx 2>&1 | head -20

# ファイルサイズチェック
wc -l src/components/features/ThirteenChapters.tsx | awk '{print $1 >= 150 ? "✅ Min lines ("$1")" : "❌ Too short ("$1")"}'

# インポート確認
grep -q "CHAPTERS_DATA" src/components/features/ThirteenChapters.tsx && echo "✅ Imports data" || echo "❌ Missing import"
grep -q "AnimatePresence" src/components/features/ThirteenChapters.tsx && echo "✅ Uses Framer Motion" || echo "❌ Missing AnimatePresence"
grep -q "lucide-react" src/components/features/ThirteenChapters.tsx && echo "✅ Uses lucide-react" || echo "❌ Missing icons"
```
  </verify>
  <done>
- ThirteenChaptersコンポーネントが作成されている
- CHAPTERS_DATAをインポートし13章分をレンダリングする
- expandedChapter stateでアコーディオン展開制御が実装されている
- 各章のヘッダーにパートバッジ（色分け）が表示される
- 展開時に話数グリッド、期間、テーマが表示される
- viewMode propでsimple/detailed表示を切り替えられる
- Framer Motionでスムーズな展開/折りたたみアニメーションがある
- TypeScriptコンパイルエラーがない
  </done>
</task>

<task type="auto">
  <name>ダッシュボードへの13章タブ追加</name>
  <files>src/app/dashboard/page.tsx</files>
  <action>
ダッシュボードに新規「13章」タブを追加し、ThirteenChaptersコンポーネントを統合：

1. **Tab型定義の拡張:**
   ```typescript
   type Tab = 'overview' | 'characters' | 'storyline' | 'thirteen-chapters' | 'meishiki';
   ```

2. **TABS配列への追加:**
   ```typescript
   const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
     // ... existing tabs
     { id: 'thirteen-chapters', label: '13章', icon: BookOpen },  // ← 新規追加
     { id: 'meishiki', label: '命式比較', icon: Sparkles },
   ];
   ```
   - 注: 既存のMap iconを storylineタブ専用として残し、13章タブにはBookOpen iconを割り当て

3. **ThirteenChaptersTab関数の追加:**
   ```typescript
   function ThirteenChaptersTab({ viewMode }: { viewMode: ViewMode }) {
     return (
       <div className="space-y-6">
         <motion.section
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
         >
           <ThirteenChapters viewMode={viewMode} />
         </motion.section>
       </div>
     );
   }
   ```

4. **メインコンテンツへの条件レンダリング追加:**
   ```typescript
   <main className="max-w-6xl mx-auto px-4 py-6">
     {activeTab === 'overview' && <OverviewTab viewMode={viewMode} />}
     {activeTab === 'characters' && <CharactersTab viewMode={viewMode} />}
     {activeTab === 'storyline' && <StorylineTab viewMode={viewMode} />}
     {activeTab === 'thirteen-chapters' && <ThirteenChaptersTab viewMode={viewMode} />}  // ← 新規追加
     {activeTab === 'meishiki' && <MeishikiTab viewMode={viewMode} />}
   </main>
   ```

5. **インポートの追加:**
   ```typescript
   import { ThirteenChapters } from '@/components/features/ThirteenChapters';
   ```

**整合性チェック:**
- 他のタブ（OverviewTab, CharactersTabなど）と同じ構造を維持
- アニメーションパラメータ（duration, delay）を他タブと統一
- spacing, typographyクラスを既存タブと合わせる
  </action>
  <verify>
```bash
# TypeScriptコンパイル
npx tsc --noEmit src/app/dashboard/page.tsx 2>&1 | head -20

# インポート確認
grep -q "ThirteenChapters" src/app/dashboard/page.tsx && echo "✅ ThirteenChapters imported" || echo "❌ Missing import"

# タブ確認
grep -q "'thirteen-chapters'" src/app/dashboard/page.tsx && echo "✅ Tab added" || echo "❌ Tab missing"

# 条件レンダリング確認
grep -q "activeTab === 'thirteen-chapters'" src/app/dashboard/page.tsx && echo "✅ Conditional render added" || echo "❌ Missing render"
```
  </verify>
  <done>
- dashboard.tsxにThirteenChaptersTab関数が追加されている
- TABS配列に'thirteen-chapters'タブが追加されている
- mainセクションにactiveTab === 'thirteen-chapters'の条件分岐が追加されている
- ThirteenChaptersコンポーネントが正しくインポートされている
- タブをクリックすると13章構造が表示される
- TypeScriptコンパイルエラーがない
  </done>
</task>

</tasks>

<verification>
## Phase 2 成功基準検証

### CH-01: 13章構造の全体像確認
- [ ] 13章全てのカードが一覧表示されている
- [ ] 各章カードに話数範囲が表示されている（例: "第1-8話"）
- [ ] 各章カードに期間が表示されている（ヘッダーまたは展開時）
- [ ] 各章カードにテーマが表示されている（展開時）

### CH-02: 詳細タイムライン展開
- [ ] 章ヘッダーをクリックで詳細が展開される
- [ ] 展開時にスムーズなアニメーションがある（Framer Motion）
- [ ] 展開時に話数グリッドが表示される
- [ ] 複数章を同時に展開できない（単一選択アコーディオン）

### CH-03: パートマッピング視覚化
- [ ] 各章にパートバッジが表示されている
- [ ] パート色分けが正しい（基礎編: emerald/green, 葛藤編: amber/orange, 統合編: violet/purple）
- [ ] パートと章の対応関係が視覚的に理解できる

### CH-04: 3部構成マッピング理解
- [ ] 基礎編（第1-5章）の識別ができる
- [ ] 葛藤編（第6-9章）の識別ができる
- [ ] 統合編（第10-13章）の識別ができる
- [ ] 色分けバッジでパート分けが直感的に理解できる

## 追加品質チェック

### データ整合性
- [ ] DASHBOARD.mdと全13章のデータが一致している
- [ ] 話数範囲が正しい（第1章: 1-8話、第2章: 9-16話...）
- [ ] パート割り当てが正しい（1-5: 基礎編, 6-9: 葛藤編, 10-13: 統合編）

### デザイン整合性
- [ ] 他タブと同じアニメーションタイミング
- [ ] 他タブと同じspacing/typography
- [ ] レスポンシブレイアウト（モバイルでグリッド1列）
- [ ] viewMode切替が正しく動作する

### パフォーマンス
- [ ] 13章全ての展開/折りたたみがラグなく動作する
- [ ] TypeScriptコンパイルが成功する
- [ ] ランタイムエラーがない
</verification>

<success_criteria>
## Phase 2 Plan 01 完了定義

**成功条件:**
1. **データ構造**: `src/data/chapters.ts`に13章分のデータが正しく定義されている
2. **コンポーネント**: `ThirteenChapters.tsx`がアコーディオンパターンで実装されている
3. **統合**: ダッシュボードに「13章」タブが追加され、コンポーネントが正しく表示される

**検証可能な状態:**
- ユーザーは「13章」タブをクリックすると、13章構造の一覧を閲覧できる
- 各章のヘッダーをクリックすると、詳細（話数グリッド、期間、テーマ）が展開される
- パートバッジ（基礎編/葛藤編/統合編）が色分けで表示され、3部構成との対応関係が理解できる
- viewMode切替でsimple/detailed表示を切り替えられる

**完了マーク:**
- 全タスク完了（3/3）
- 成功基準4/4達成（CH-01, CH-02, CH-03, CH-04）
- データ整合性確認完了
- TypeScriptコンパイル成功
</success_criteria>

<output>
完了後、`.planning/phases/02-thirteen-chapters/02-thirteen-chapters-01-SUMMARY.md`を作成：
- 実行サマリー（所要時間、完了タスク数）
- 各タスクの実装詳細
- データ整合性検証結果
- デザインパターン適用結果
- Phase 2成功基準達成状況
- 次のステップ（02-02計画または実行）
</output>
