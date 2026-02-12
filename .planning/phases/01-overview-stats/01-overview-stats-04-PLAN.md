---
phase: 01-overview-stats
plan: 04
type: execute
wave: 1
depends_on: [01-01, 01-02, 01-03]
files_modified:
  - src/data/subthemes.ts
  - src/components/features/SubthemesStats.tsx
  - src/app/dashboard/page.tsx
autonomous: true
gap_closure: true

must_haves:
  truths:
    - "ユーザーは12カテゴリのサブテーマ統計（転職、恋愛、家族等）を一覧できる"
    - "各テーマの登場回数と割合が表示される"
    - "主要な登場話が参照できる"
  artifacts:
    - path: "src/data/subthemes.ts"
      provides: "12テーマ統計データ構造"
      min_lines: 50
      contains: "SUBTHEMES_DATA"
    - path: "src/components/features/SubthemesStats.tsx"
      provides: "サブテーマ統計表示コンポーネント"
      min_lines: 60
      exports: ["SubthemesStats"]
  key_links:
    - from: "src/components/features/SubthemesStats.tsx"
      to: "src/data/subthemes.ts"
      via: "import { SUBTHEMES_DATA }"
      pattern: "import.*SUBTHEMES_DATA"
    - from: "src/app/dashboard/page.tsx"
      to: "src/components/features/SubthemesStats.tsx"
      via: "JSX <SubthemesStats>"
      pattern: "SubthemesStats"
---

<objective>
サブテーマ統計機能を実装し、Phase 1の5番目の成功基準（OV-05）を達成する

Purpose: VERIFICATION.mdで特定されたギャップをクローズし、12テーマ別統計をダッシュボードで閲覧可能にする
Output: サブテーマ統計データ構造、表示コンポーネント、ダッシュボード統合
</objective>

<execution_context>
@/Users/kitamuratatsuhiko/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kitamuratatsuhiko/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-overview-stats/01-overview-stats-VERIFICATION.md
@.planning/phases/01-overview-stats/01-overview-stats-01-SUMMARY.md
@.planning/phases/01-overview-stats/01-overview-stats-02-SUMMARY.md
@.planning/phases/01-overview-stats/01-overview-stats-03-SUMMARY.md
@/Users/kitamuratatsuhiko/UIanimated/novel/dashboards/DASHBOARD.md
@/Users/kitamuratatsuhiko/UIanimated/src/components/features/OverviewStats.tsx
@/Users/kitamuratatsuhiko/UIanimated/src/components/features/StoryPartsDisplay.tsx
@/Users/kitamuratatsuhiko/UIanimated/src/app/dashboard/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: サブテーマ統計データ構造の作成</name>
  <files>src/data/subthemes.ts</files>
  <action>
正典（DASHBOARD.md）のサブテーマ統計セクションから、12テーマのデータをTypeScript定数に変換して作成する。

**インターフェース定義**:
```typescript
export interface SubthemeStat {
  id: string;
  name: string;
  count: number;
  percentage: number;
  episodes: number[];
  color: string; // グラフ表示用の色クラス
}
```

**SUBTHEMES_DATA定数（正典のデータ順序で）**:
1. 転職・キャリア: 18話 (15.0%) - エピソード例: 4, 15, 32, 44, 52, 64, 71, 82, 88, 96
2. 恋愛・結婚: 24話 (20.0%) - エピソード例: 6, 18, 26, 35, 47, 58, 68, 79, 89, 97
3. 家族問題: 15話 (12.5%) - エピソード例: 3, 11, 24, 38, 54, 69, 78, 91, 105
4. 健康問題: 12話 (10.0%) - エピソード例: 22, 33, 46, 59, 73, 86, 99, 101, 114
5. 天中殺: 15話 (12.5%) - エピソード例: 2, 13, 25, 36, 45, 56, 67, 77, 90
6. 不倫・浮気: 8話 (6.7%) - エピソード例: 41, 53, 65, 72, 83, 94, 109, 115
7. 介護: 6話 (5.0%) - エピソード例: 39, 57, 75, 88, 103, 118
8. 債務問題: 5話 (4.2%) - エピソード例: 17, 40, 66, 84, 102
9. AI vs 運命: 15話 (12.5%) - エピソード例: 49, 55, 60, 65, 75, 82, 88, 102, 111
10. 成長・自己実現: 22話 (18.3%) - 全編を通じて散在
11. 対立・葛藤: 20話 (16.7%) - 第41-90話に集中
12. 統合・協力: 12話 (10.0%) - 第91-120話に集中

**色分けパターン**（既存コンポーネントと一貫性を保つ）:
- 転職・キャリア: from-blue-500 to-cyan-500
- 恋愛・結婚: from-pink-500 to-rose-500
- 家族問題: from-green-500 to-emerald-500
- 健康問題: from-red-500 to-orange-500
- 天中殺: from-purple-500 to-violet-500
- 不倫・浮気: from-amber-500 to-yellow-500
- 介護: from-teal-500 to-cyan-500
- 債務問題: from-slate-500 to-zinc-500
- AI vs 運命: from-indigo-500 to-blue-500
- 成長・自己実現: from-emerald-500 to-green-500
- 対立・葛藤: from-red-600 to-rose-600
- 統合・協力: from-violet-500 to-purple-500

**エクスポート**:
- `SUBTHEMES_DATA`: SubthemeStat[]配列
- `TOTAL_SUBTHEMES`: 142（合計サブテーマ数）
- `SUBTHEME_CATEGORIES`: 12（カテゴリ数）
  </action>
  <verify>ファイルが作成され、12テーマ全てのデータが含まれていること。TypeScript型チェックが通ること。</verify>
  <done>src/data/subthemes.tsが作成され、12テーマの統計データ（名前、回数、割合、登場話、色）が定義されている</done>
</task>

<task type="auto">
  <name>Task 2: SubthemesStatsコンポーネントの実装</name>
  <files>src/components/features/SubthemesStats.tsx</files>
  <action>
サブテーマ統計を表示するReactコンポーネントを作成する。既存のOverviewStats.tsxとStoryPartsDisplay.tsxのデザインパターンを継承する。

**コンポーネント構造**:
```typescript
interface SubthemesStatsProps {
  viewMode: 'simple' | 'detailed';
}

export function SubthemesStats({ viewMode }: SubthemesStatsProps) {
  // SUBTHEMES_DATAを使用
  // グリッドレイアウトで各テーマを表示
}
```

**デザイン要件**:
1. レスポンシブグリッド:
   - モバイル: 1列 (grid-cols-1)
   - タブレット: 2列 (sm:grid-cols-2)
   - デスクトップ: 3列 (lg:grid-cols-3)

2. 各テーマカードの内容:
   - テーマ名（太字、白）
   - 登場回数と割合（例: "18話 (15.0%)"）
   - カラー付きプログレスバー（割合を視覚化）
   - 登場話例（詳細モード時のみ表示）
   - 背景色: bg-slate-800/30、ホバー時: hover:bg-slate-800/50

3. アニメーション:
   - Framer Motionを使用
   - スタガードフェードイン（delay: 0.3 + index * 0.05）
   - 初期状態: opacity: 0, y: 20

4. プログレスバー:
   - 幅: テーマの割合に基づく（最大20%で100%）
   - グラデーション: 各テーマの色クラスを使用
   - 高さ: h-2（8px）

5. 詳細モード対応:
   - viewMode='detailed'時: 登場話例を表示
   - 登場話例はカンマ区切りで最初の5話のみ表示
   - フォントサイズ: text-[10px]、色: text-slate-500

**ヘッダー**:
- セクションタイトル: "サブテーマ統計"
- サブタイトル: "12カテゴリ • 合計142テーマ"
- アイコン: BarChart3（lucide-react）

**実装パターン参照**:
- OverviewStats.tsxのカードレイアウトとアニメーション
- StoryPartsDisplay.tsxの縦積みカード構造
- CharacterCard.tsxのグラデーション使い方
  </action>
  <verify>コンポーネントが作成され、TypeScriptエラーがないこと。12テーマ全てが表示されること。</verify>
  <done>src/components/features/SubthemesStats.tsxが作成され、12テーマの統計情報がカード形式で表示される。レスポンシブデザインと詳細モード切替が機能する</done>
</task>

<task type="auto">
  <name>Task 3: ダッシュボードへの統合</name>
  <files>src/app/dashboard/page.tsx</files>
  <action>
概要タブ（OverviewTab）にSubthemesStatsコンポーネントを統合する。

**変更内容**:
1. インポート追加:
```typescript
import { SubthemesStats } from '@/components/features/SubthemesStats';
```

2. OverviewTab関数に追加:
   - 統計サマリー（OverviewStats）の後に配置
   - 見出し: <h2 className="text-lg font-semibold text-white mb-4">サブテーマ統計</h2>
   - motion.sectionでラップ（他セクションと一貫性）

3. 配置順序:
   - ヒーローセクション
   - ベネフィットカード
   - 統計サマリー（既存）
   - **サブテーマ統計（新規）** ← ここに追加
   - CTA

** JSX構造**:
```tsx
{/* 統計サマリー */}
<OverviewStats viewMode={viewMode} />

{/* サブテーマ統計 */}
<motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  className="mt-8"
>
  <h2 className="text-lg font-semibold text-white mb-4">サブテーマ統計</h2>
  <SubthemesStats viewMode={viewMode} />
</motion.section>
```

**デザイン一貫性**:
- 他セクションと同じアニメーションパラメータ
- 同じ余白設定（mt-8, mb-4）
- 同じフォントスタイル
  </action>
  <verify>
1. ダッシュボードページを開く (http://localhost:3000/dashboard)
2. 概要タブが選択されていることを確認
3. スクロールダウンして「サブテーマ統計」セクションを確認
4. 12テーマ全てがカード形式で表示されること
5. 各カードにテーマ名、回数、割合、プログレスバーが表示されること
6. 詳細モード切替で登場話例が表示/非表示されること
7. レスポンシブデザインで列数が正しく変化すること（モバイル1列、デスクトップ3列）
  </verify>
  <done>概要タブにサブテーマ統計セクションが追加され、12テーマの統計情報が表示される。ユーザーは転職、恋愛、家族等の各カテゴリの登場回数と割合を確認できる</done>
</task>

</tasks>

<verification>
## 全体検証

### 機能検証
- [ ] 12テーマ全てのデータが正しく表示されている
- [ ] 各テーマの登場回数と割合が正確である
- [ ] プログレスバーが割合に応じて正しく表示されている
- [ ] カラー分けが正しく適用されている
- [ ] 詳細モードで登場話例が表示される

### データ整合性検証
- [ ] 正典（DASHBOARD.md）のデータと一致している
- [ ] 合計値: 142テーマ、12カテゴリ
- [ ] 各テーマの割合計算が正しい

### UI/UX検証
- [ ] レスポンシブデザインが正しく機能する
- [ ] アニメーションが滑らかに実行される
- [ ] ホバー効果が期待通りに動作する
- [ ] 概要タブ内でセクション間の間隔が適切である

### Phase 1成功基準検証
- [ ] OV-05: ユーザーは12カテゴリのサブテーマ統計を閲覧できる

**ギャップクロージャー確認**:
- VERIFICATION.mdで特定された「サブテーマ統計表示機能が未実装」というギャップが解消されていること
- src/data/subthemes.tsが存在し、データが定義されていること
- src/components/features/SubthemesStats.tsxが存在し、機能していること
- ダッシュボードに統合され、ユーザーが閲覧可能であること
</verification>

<success_criteria>
1. **データ作成**: src/data/subthemes.tsが作成され、12テーマの統計データ（名前、回数、割合、登場話、色）が正確に定義されている

2. **コンポーネント実装**: src/components/features/SubthemesStats.tsxが作成され、12テーマの統計情報がカード形式で表示される。レスポンシブデザインと詳細モード切替が機能する

3. **ダッシュボード統合**: 概要タブにサブテーマ統計セクションが追加され、ユーザーが12カテゴリのサブテーマ統計（転職、恋愛、家族等）を閲覧できる

4. **Phase 1完了**: OV-05成功基準が達成され、Phase 1の全ての成功基準（5/5）が満たされる

5. **ギャップクロージャー**: VERIFICATION.mdで特定されたギャップ（サブテーマ統計機能未実装）が完全に解消されている
</success_criteria>

<output>
実装完了後、`.planning/phases/01-overview-stats/01-overview-stats-04-SUMMARY.md`を作成すること

SUMMARY.mdには以下を含める:
- 実行したタスクとコミットハッシュ
- 作成/変更したファイルの一覧
- 正典データとの整合性確認結果
- Phase 1成功基準（OV-05）の達成確認
- ギャップクロージャーの完了確認
</output>
