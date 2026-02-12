---
phase: 02-thirteen-chapters
plan: 02
type: execute
wave: 2
depends_on: [02-01]
files_modified:
  - src/components/features/ThirteenChapters.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "章詳細パネルに3部構成の区切りセパレーターが表示される"
    - "章ごとの関連キャラクターや特徴的な要素が視覚的に強調されている"
    - "13章構造と3部構成の対応関係が明確に理解できる（追加のビジュアル補助）"
  artifacts:
    - path: "src/components/features/ThirteenChapters.tsx"
      provides: "強化された13章表示コンポーネント"
      min_lines: 180
      contains: ["part section divider", "visual enhancements", "chapter characteristics"]
  key_links:
    - from: "src/components/features/ThirteenChapters.tsx"
      to: "src/data/chapters.ts"
      via: "PART_MAPPING import"
      pattern: "PART_MAPPING\\[part\\.name\\]"
---

<objective>
章詳細パネルを拡張し、3部構成マッピングの視覚的明確化と追加コンテキスト情報を実装する

**目的:**
02-01で実装した基本機能を拡張し、ユーザー体験を向上させる。3部構成の区切りを視覚的に明確化し、各章の特徴的な要素を強調表示することで、13章構造と3部構成の対応関係をより直感的に理解できるようにする。

**価値:**
視覚的な階層化と補助情報により、物語構造の理解度を向上させる。パート区切りセパレーターで大枠を把握しやすくし、章の特徴的な要素（回想シーン数、主要キャラクター等）を表示することで、物語の流れをより深く理解できる。

**出力:**
- 拡張された`ThirteenChapters.tsx`コンポーネント（パート区切り、特徴的要素表示）
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
@.planning/phases/02-thirteen-chapters/02-thirteen-chapters-01-PLAN.md

# Phase 1 パターン参照
@.planning/phases/01-overview-stats/01-overview-stats-04-SUMMARY.md

# 既存実装
@/Users/kitamuratatsuhiko/UIanimated/src/components/features/ThirteenChapters.tsx
</context>

<tasks>

<task type="auto">
  <name>3部構成区切りセパレーターの実装</name>
  <files>src/components/features/ThirteenChapters.tsx</files>
  <action>
ThirteenChaptersコンポーネントに3部構成の視覚的な区切りを追加：

1. **パートセパレーターコンポーネントの作成（関数内）:**
   ```typescript
   const PartSeparator = ({ part }: { part: 'foundation' | 'conflict' | 'integration' }) => {
     const config = {
       foundation: {
         name: '基礎編',
         gradient: 'from-emerald-500/20 to-green-500/10',
         borderColor: 'border-emerald-500/30',
         textColor: 'text-emerald-400'
       },
       conflict: {
         name: '葛藤編',
         gradient: 'from-amber-500/20 to-orange-500/10',
         borderColor: 'border-amber-500/30',
         textColor: 'text-amber-400'
       },
       integration: {
         name: '統合編',
         gradient: 'from-violet-500/20 to-purple-500/10',
         borderColor: 'border-violet-500/30',
         textColor: 'text-violet-400'
       }
     }[part];

     return (
       <div className={`relative my-8 py-4 ${config.borderColor} border-t-2 border-b-2`}>
         <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-50`} />
         <div className="relative text-center">
           <span className={`text-sm font-bold ${config.textColor} tracking-widest uppercase`}>
             {config.name}
           </span>
           <span className="ml-2 text-xs text-slate-500">
             {PART_MAPPING[part].name}
           </span>
         </div>
       </div>
     );
   };
   ```

2. **章リストへのセパレーター挿入:**
   - CHAPTERS_DATA.map()内で、章のパートが変わるタイミングでセパレーターを表示
   - 第5章後 → 基礎編/葛藤編セパレーター
   - 第9章後 → 葛藤編/統合編セパレーター
   ```typescript
   {CHAPTERS_DATA.map((chapter, index) => (
     <React.Fragment key={chapter.id}>
       {/* パート境界でセパレーター表示 */}
       {index === 5 && <PartSeparator part="conflict" />}
       {index === 10 && <PartSeparator part="integration" />}

       {/* 章カード */}
       <ChapterCard chapter={chapter} />
     </React.Fragment>
   ))}
   ```

3. **冒頭に基礎編セパレーター:**
   - リストの最初（第1章の前）に基礎編セパレーターを配置
   - ユーザーが最初のパートを明確に認識できる

**デザイン要件:**
- グラデーション背景で視覚的な階層を作る
- パート名を太字・大文字で強調
- 上下のボーダーで明確な区切りを表現
- スペース（my-8 py-4）で余白を持たせる
- StoryPartsDisplay.tsxのパート色と統一
  </action>
  <verify>
```bash
# TypeScriptコンパイル
npx tsc --noEmit src/components/features/ThirteenChapters.tsx 2>&1 | head -20

# セパレーター実装確認
grep -q "PartSeparator" src/components/features/ThirteenChapters.tsx && echo "✅ PartSeparator component exists" || echo "❌ Missing PartSeparator"

# パート境界ロジック確認
grep -q "index === 5" src/components/features/ThirteenChapters.tsx && echo "✅ Foundation/Conflict separator" || echo "❌ Missing foundation/conflict split"
grep -q "index === 10" src/components/features/ThirteenChapters.tsx && echo "✅ Conflict/Integration separator" || echo "❌ Missing conflict/integration split"

# グラデーション確認
grep -q "from-emerald-500/20" src/components/features/ThirteenChapters.tsx && echo "✅ Gradient applied" || echo "❌ Missing gradient"
```
  </verify>
  <done>
- PartSeparator関数が実装されている
- 3つのパートそれぞれに専用の色設定がある（emerald, amber, violet）
- 第5章後、第10章後にセパレーターが表示される
- リスト冒頭に基礎編セパレーターがある
- セパレーターがグラデーション背景とボーダーで視覚的に明確に区切れている
- TypeScriptコンパイルエラーがない
  </done>
</task>

<task type="auto">
  <name>章特徴的要素と強調表示の追加</name>
  <files>src/components/features/ThirteenChapters.tsx</files>
  <action>
章詳細パネルに追加のコンテキスト情報と強調表示を実装：

1. **話数カバレッジ表示（章ヘッダー）:**
   ```typescript
   const totalEpisodes = chapter.episodeEnd - chapter.episodeStart + 1;
   <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
     全{totalEpisodes}話
   </span>
   ```

2. **期間の視覚的強調:**
   - Calendar iconの色をパート色に合わせる
   ```typescript
   const periodIconColor = {
     foundation: 'text-emerald-400',
     conflict: 'text-amber-400',
     integration: 'text-violet-400'
   }[chapter.part];
   ```

3. **3部構成マッピング情報の追加（詳細モードのみ）:**
   ```typescript
   {viewMode === 'detailed' && (
     <div className="mt-3 pt-3 border-t border-slate-700/30">
       <div className="text-xs text-slate-400 mb-2">3部構成マッピング</div>
       <div className="flex items-center gap-2 text-xs">
         <span className={`
           px-2 py-1 rounded font-medium
           bg-gradient-to-r ${PART_COLORS[chapter.part]}
           text-white
         `}>
           {PART_MAPPING[chapter.part].name}
         </span>
         <span className="text-slate-500">
           第{PART_MAPPING[chapter.part].chapters.join(', ')}章
         </span>
       </div>
     </div>
   )}
   ```

4. **章の順序番号強調（詳細モード）:**
   - 章IDを大きく視覚的に強調
   ```typescript
   <span className={`
     text-2xl font-bold bg-gradient-to-r ${PART_COLORS[chapter.part]}
     bg-clip-text text-transparent
   `}>
     {String(chapter.id).padStart(2, '0')}
   </span>
   ```

5. **テキストの改善とアクセシビリティ:**
   - sectionタグでセマンティック構造を維持
   - aria-expanded属性でアコーディオン状態を通知
   ```typescript
   <button
     aria-expanded={expandedChapter === chapter.id}
     aria-controls={`chapter-${chapter.id}-content`}
   >
   ```

6. **ホバー効果の強化:**
   ```typescript
   className={`
     transition-all duration-200
     ${expandedChapter === chapter.id
       ? 'bg-slate-800/60 ring-1 ring-violet-500/30'
       : 'hover:bg-slate-800/50 hover:shadow-lg'
     }
   `}
   ```

**デザイン制約:**
- 既存のパート色分けを維持
- 詳細モードでのみ追加情報を表示（simpleモードは軽量）
- 他コンポーネントと一貫したスペーシングとタイポグラフィ
- Framer Motionアニメーションとの統合
  </action>
  <verify>
```bash
# TypeScriptコンパイル
npx tsc --noEmit src/components/features/ThirteenChapters.tsx 2>&1 | head -20

# 話数カバレッジ確認
grep -q "totalEpisodes" src/components/features/ThirteenChapters.tsx && echo "✅ Episode count calculation" || echo "❌ Missing count"

# 3部構成マッピング確認
grep -q "3部構成マッピング" src/components/features/ThirteenChapters.tsx && echo "✅ Part mapping info" || echo "❌ Missing mapping"

# aria属性確認
grep -q "aria-expanded" src/components/features/ThirteenChapters.tsx && echo "✅ ARIA attributes" || echo "❌ Missing accessibility"

# ホバー効果確認
grep -q "hover:bg-slate-800" src/components/features/ThirteenChapters.tsx && echo "✅ Hover effects" || echo "❌ Missing hover"
```
  </verify>
  <done>
- 章ヘッダーに総話数表示が追加されている
- 期間iconの色がパートに応じて変化している
- 詳細モードで3部構成マッピング情報が表示されている
- 章IDがグラデーションテキストで強調表示されている（詳細モード）
- アコーディオンにaria-expanded属性が設定されている
- ホバー効果が強化されている（ring, shadow）
- simple/detailedモードで表示内容が正しく切り替わる
- TypeScriptコンパイルエラーがない
  </done>
</task>

</tasks>

<verification>
## Phase 2 成功基準検証（02-02完了後）

### CH-01: 13章構造の全体像確認
- [ ] 13章全てが一覧表示されている（02-01から継承）
- [ ] セパレーターでパート境界が視覚的に明確に区切られている

### CH-02: 詳細タイムライン展開
- [ ] アコーディオン展開がスムーズに動作する（02-01から継承）
- [ ] 詳細パネルに総話数、期間強調、追加情報が表示されている

### CH-03: パートマッピング視覚化（強化）
- [ ] セパレーターで3部構成の区切りが直感的に理解できる
- [ ] 各章の3部構成マッピング情報が表示されている（詳細モード）
- [ ] 色分けが一貫して適用されている

### CH-04: 3部構成マッピング理解（強化）
- [ ] セパレーターとバッジの組み合わせでパート分けが明確
- [ ] 各章がどの部に属するか即座に理解できる
- [ ] 13章構造と3部構成の対応関係が視覚的に把握できる

## 追加品質チェック

### ユーザビリティ
- [ ] パート境界が視覚的に明確に識別できる
- [ ] 章の特徴的な情報（総話数、期間、マッピング）が読みやすい
- [ ] アニメーションがスムーズでジャミない

### デザイン整合性
- [ ] Phase 1のパート色分けと統一されている
- [ ] 他タブと同じタイポグラフィとスペーシング
- [ ] レスポンシブデザインが維持されている

### アクセシビリティ
- [ ] アコーディオンに適切なARIA属性が設定されている
- [ ] キーボードナビゲーションで展開/折りたたみが可能
- [ ] 色依存の情報がテキストでも伝わっている

### パフォーマンス
- [ ] 13章全てのレンダリングがラグなく完了する
- [ ] アコーディオン展開/折りたたみが滑らかに動作する
- [ ] TypeScriptコンパイル成功
</verification>

<success_criteria>
## Phase 2 Plan 02 完了定義

**成功条件:**
1. **視覚的区切り**: 3部構成のセパレーターが実装され、パート境界が明確に識別できる
2. **強調表示**: 章の特徴的な要素（総話数、期間、マッピング情報）が視覚的に強調されている
3. **ユーザビリティ**: 詳細モードで豊富な情報が提供され、3部構成との対応関係が即座に理解できる

**検証可能な状態:**
- ユーザーは13章リストを見て、3部構成の区切りを直感的に理解できる
- 各章を展開すると、総話数、3部構成マッピングなどの追加情報が表示される
- パートバッジ、セパレーター、色分けの組み合わせで、どの章がどの部に属するか明確
- simple/detailedモードで表示の簡潔さと情報量が適切に切り替わる

**完了マーク:**
- 全タスク完了（2/2）
- 成功基準4/4達成（CH-01, CH-02, CH-03, CH-04）
- アクセシビリティ要件満たす
- Phase 2完了（02-01 + 02-02）
</success_criteria>

<output>
完了後、`.planning/phases/02-thirteen-chapters/02-thirteen-chapters-02-SUMMARY.md`を作成：
- 実行サマリー（所要時間、完了タスク数）
- セパレーター実装詳細
- 強調表示機能の説明
- アクセシビリティ改善内容
- Phase 2完了確認と成功基準達成状況
- 次の推奨アクション（Phase 3計画または実行）
</output>
