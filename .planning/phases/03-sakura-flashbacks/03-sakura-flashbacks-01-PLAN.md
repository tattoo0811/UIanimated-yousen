---
phase: 03-sakura-flashbacks
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/data/flashbacks.ts
  - src/components/features/SakuraFlashbacks.tsx
  - src/app/dashboard/page.tsx
autonomous: true

must_haves:
  truths:
    - "ユーザーは20回の回想シーン全件をリスト閲覧できる（話数、テーマ、出典）"
    - "ユーザーは回想シーンの3部構成別分布を視覚的なグラフ等で確認できる"
    - "3部構成色分けがPhase 1/2と統一されている（emerald/amber/violet）"
    - "一覧表示は話数順にソートされている"
  artifacts:
    - path: "src/data/flashbacks.ts"
      provides: "回想シーンデータ構造（FLASHBACKS_DATA定数、20回分）"
      exports: ["FLASHBACKS_DATA", "Flashback", "getSourceDistribution", "getPartDistribution"]
      min_lines: 80
    - path: "src/components/features/SakuraFlashbacks.tsx"
      provides: "回想シーン一覧表示コンポーネント"
      min_lines: 150
    - path: "src/app/dashboard/page.tsx"
      provides: "ダッシュボード回想シーンタブ統合"
      exports: ["Tab", "TABS", "SakuraFlashbacksTab"]
  key_links:
    - from: "src/components/features/SakuraFlashbacks.tsx"
      to: "src/data/flashbacks.ts"
      via: "import { FLASHBACKS_DATA, getSourceDistribution, getPartDistribution }"
      pattern: "FLASHBACKS_DATA|getSourceDistribution|getPartDistribution"
    - from: "src/app/dashboard/page.tsx"
      to: "src/components/features/SakuraFlashbacks.tsx"
      via: "import { SakuraFlashbacks } from '@/components/features/SakuraFlashbacks'"
      pattern: "SakuraFlashbacks.*viewMode"
---

<objective>
回想シーンデータ構造を作成し、一覧表示と分布グラフコンポーネントを実装する

**目的:**
さくらの回想シーン20回の全データを閲覧可能にし、3部構成別・出典別の分布を視覚的に把握できるようにする

**出力:**
- FLASHBACKS_DATA定数（20回分の回想シーンデータ）
- SakuraFlashbacksコンポーネント（一覧表示 + 分布グラフ）
- ダッシュボード「さくら回想」タブ統合

**価値:**
ユーザーは120話の中でさくらがどのタイミングで回想シーンを持っているかを一覧と分布グラフで即座に理解できる
</objective>

<execution_context>
@/Users/kitamuratatsuhiko/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kitamuratatsuhiko/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# Phase 2 Pattern Reference
@.planning/phases/02-thirteen-chapters/02-thirteen-chapters-01-SUMMARY.md
@.planning/phases/02-thirteen-chapters/02-thirteen-chapters-02-SUMMARY.md

# Data Structure Pattern
@src/data/chapters.ts
@src/data/overview.ts

# Component Pattern
@src/components/features/ThirteenChapters.tsx
@src/components/features/SubthemesStats.tsx
</context>

<tasks>

<task type="auto">
  <name>回想シーンデータ構造の作成</name>
  <files>src/data/flashbacks.ts</files>
  <action>
以下の回想シーンデータ構造を作成:

1. **Flashback interface定義**:
   ```typescript
   export interface Flashback {
     id: number;              // 1-20（連番）
     episode: number;         // 話数（1, 2, 3, 7, 14...）
     title: string;           // テーマタイトル（例："種と土と水──重い土の下の種に、水と光を"）
     content: string;         // 内容説明
     source: 'v2-original' | 'sakura-teachings';  // 出典
     part: 'foundation' | 'conflict' | 'integration';  // 3部構成
   }
   ```

2. **FLASHBACKS_DATA定数** - 正典データから20回分を作成:
   - 1話: "種と土と水──重い土の下の種に、水と光を" (v2-original)
   - 2話: "天中殺＝大地が眠る時間──罰ではなく栄養を蓄える期間" (v2-original)
   - 3話: "龍は箱に入りきらん──根を張れば龍はどこへでも飛べる" (v2-original)
   - 7話: "十牛図──探すから見えなくなる。牛は最初からそこにいた" (sakura-teachings)
   - 14話: "老子の無為自然──水は万物を潤して争わず" (sakura-teachings)
   - 20話: "河合隼雄「子は背中を見とる」＋親の生き方が教え" (sakura-teachings)
   - 30話: "メキシコの漁師──幸せを先送りしていないか" (sakura-teachings)
   - 37話: "荘子の胡蝶の夢──現実と夢の境界を問う" (sakura-teachings)
   - 40.5話: "静かな変化──「種が花になる時、庭師は離れる」さくらの最後のメッセージ" (v2-original)
   - 48話: "達磨の面壁九年──心の猿を静め、集中の力で苦を超える" (sakura-teachings)
   - 55話: "エピクテトスの二分法──変えられるものと変えられないもの" (sakura-teachings)
   - 59.5話: "正しさの罠──「ある人が正しい ≠ 他の人が間違い」" (sakura-teachings)
   - 67.5話: "父との相似──「気づきが繰り返しを断ち切る」" (v2-original)
   - 70話: "As a Man Thinketh──思考が環境を作る、心の庭" (sakura-teachings)
   - 76話: "7つの習慣──刺激と反応の間にある自由" (sakura-teachings)
   - 84.5話: "太陽の本質──「丙火の太陽は、内面から輝く」" (sakura-teachings)
   - 89話: "サルトルの実存──実存は本質に先立ち、自己創造の自由" (sakura-teachings)
   - 90.5話: "闇もまた自己──「影は太陽自身が作ったもの」ユングのシャドー" (sakura-teachings)
   - 98話: "宇宙のスケール──天法と謙虚さへの気づき" (sakura-teachings)
   - 104.5話: "溶ける心──「かたい心は温もりで溶ける。縁起」仏教の慈悲" (v2-original)

   **重要**: 各回想シーンの`part`は話数から自動判定:
   - foundation (1-40話): 9回（1, 2, 3, 7, 14, 20, 30, 37, 40.5）
   - conflict (41-80話): 6回（48, 55, 59.5, 67.5, 70, 76）
   - integration (81-120話): 5回（84.5, 89, 90.5, 98, 104.5）

3. **ヘルパー関数**:
   - `getSourceDistribution()`: 出典別分布を返す { v2-original: 6, 'sakura-teachings': 14 }
   - `getPartDistribution()`: 3部構成別分布を返す { foundation: 9, conflict: 6, integration: 5 }
   - `getPartForEpisode(episode: number)`: 話数からパート型を返す（chapters.tsのgetPartForChapterと同ロジック）

4. **データ検証**:
   - 総数20回であることを確認
   - 3部構成別分布が正しいことを確認（9:6:5）
   - 出典別分布が正しいことを確認（v2-original: 6, sakura-teachings: 14）

5. **Git管理**: Phase 1/2パターンに従い、flashbacks.tsは.gitignoreに追加（ローカル更新のみ）
  </action>
  <verify>
1. `npm run build` 成功（TypeScriptコンパイルエラーなし）
2. `grep -c "id:" src/data/flashbacks.ts` 出力が20であること
3. コンソールで `getSourceDistribution()` 実行結果が `{ 'v2-original': 6, 'sakura-teachings': 14 }` であること
4. コンソールで `getPartDistribution()` 実行結果が `{ foundation: 9, conflict: 6, integration: 5 }` であること
  </verify>
  <done>
FLASHBACKS_DATA定数に20回分の回想シーンデータが正しく構造化され、出典別・3部構成別の分布ヘルパー関数が正しい値を返す
  </done>
</task>

<task type="auto">
  <name>回想シーン一覧表示コンポーネントの実装</name>
  <files>src/components/features/SakuraFlashbacks.tsx</files>
  <action>
SakuraFlashbacksコンポーネントを作成（ThirteenChaptersとSubthemesStatsのパターンを統合）:

1. **コンポーネント構造**:
   - セクションヘッダー（icon + タイトル + 説明文）
   - 分布統計セクション（出典別 + 3部構成別の円グラフ/棒グラフ）
   - 回想シーン一覧（カード形式、話数順ソート）

2. **分布統計セクション**:
   - 2列グリッド（モバイル1列、デスクトップ2列）
   - **出典別分布**: 円グラフまたは棒グラフでv2-original (6) vs sakura-teachings (14)
     - カード形式で表示：左側にグラフ、右側に数値
   - **3部構成別分布**: 横棒グラフで基礎編(9)・葛藤編(6)・統合編(5)
     - Phase 1/2と同じ色分け：emerald/amber/violetグラデーション
     - StoryPartsDisplay.tsxのgetPartColor関数を再利用

3. **回想シーン一覧**:
   - グリッドレイアウト（モバイル1列、タブレット2列、デスクトップ3列）
   - 各カードに表示:
     - 話数バッジ（第X話）
     - 出典バッジ（v2オリジナル / sakura-teachings）
     - パートバッジ（基礎編/葛藤編/統合編）
     - テーマタイトル
     - 内容説明（詳細モードのみ）
   - ホバー効果（shadow-lg、ring）
   - アニメーション（Framer Motionでfade-in、stagger）

4. **viewMode対応**:
   - simpleモード: 話数バッジ + テーマタイトルのみ
   - detailedモード: 出典・パートバッジ + 内容説明も表示

5. **アクセシビリティ**:
   - role="list" と aria-label="回想シーン一覧"
   - 各カードに role="listitem"
   - キーボードナビゲーション対応（tabIndex、onKeyDown）

6. **色の統一**:
   - パートバッジはchapters.tsからgetPartColorをインポートして使用
   - 出典バッジ: v2-originalはblue、sakura-teachingsはvioletで区別

7. **インポート**:
   ```typescript
   import { FLASHBACKS_DATA, getSourceDistribution, getPartDistribution } from '@/data/flashbacks';
   import { getPartColor } from '@/data/chapters';
   import { BookOpen, BarChart3 } from 'lucide-react';
   ```
  </action>
  <verify>
1. コンポーネントがFLASHBACKS_DATAをインポートし、20回分のデータをレンダリングしていること（grep "FLASHBACKS_DATA.length" 確認）
2. 分布グラフが2つ表示されていること（出典別・3部構成別）
3. カードが話数順にソートされていること（episode昇順）
4. viewMode切替で表示内容が変わること（simple vs detailed）
5. ホバー効果とアニメーションが動作していること
  </verify>
  <done>
20回の回想シーンが一覧表示され、出典別と3部構成別の分布グラフが正しく表示される
  </done>
</task>

<task type="auto">
  <name>ダッシュボード回想シーンタブの追加</name>
  <files>src/app/dashboard/page.tsx</files>
  <action>
ダッシュボードに「さくら回想」タブを追加（Phase 2の13章タブ追加パターンに従う）:

1. **Tab型拡張**:
   ```typescript
   type Tab = 'overview' | 'characters' | 'story' | 'zodiac' | 'thirteen-chapters' | 'sakura-flashbacks';
   ```

2. **TABS配列に追加**:
   ```typescript
   const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
     // ... 既存タブ ...
     {
       id: 'sakura-flashbacks',
       label: 'さくら回想',
       icon: BookOpen  // または適切なicon（例: Sparkles, Lightbulb）
     },
   ];
   ```

3. **SakuraFlashbacksTab関数作成**:
   ```typescript
   function SakuraFlashbacksTab({ viewMode }: { viewMode: ViewMode }) {
     return <SakuraFlashbacks viewMode={viewMode} />;
   }
   ```

4. **メインコンテンツ条件レンダリング追加**:
   ```typescript
   {activeTab === 'sakura-flashbacks' && <SakuraFlashbacksTab viewMode={viewMode} />}
   ```

5. **インポート追加**:
   ```typescript
   import { SakuraFlashbacks } from '@/components/features/SakuraFlashbacks';
   ```

6. **動作確認**:
   - タブ切り替えで「さくら回想」が表示されること
   - viewMode切替で詳細度が変わること
  </action>
  <verify>
1. `npm run build` 成功
2. タブ配列に'sakura-flashbacks'が含まれていること（grep "sakura-flashbacks" page.tsx）
3. SakuraFlashbacksコンポーネントがインポートされていること
4. タブ切り替えでエラーなく表示されること
  </verify>
  <done>
ダッシュボードの「さくら回想」タブ選択時、SakuraFlashbacksコンポーネントが正しくレンダリングされる
  </done>
</task>

</tasks>

<verification>
## Phase全体検証

### コード検証
1. `npm run build` 成功（TypeScriptエラーなし）
2. `npm run lint` エラーなし

### 機能検証
1. 一覧表示で20回の回想シーン全てが表示されていること
2. 分布グラフが正しく表示されていること（出典別: 6/14、3部構成別: 9/6/5）
3. viewMode切替で表示内容が変わること
4. タブ切り替えで「さくら回想」が表示されること
5. 3部構成色分けがPhase 1/2と統一されていること（emerald/amber/violet）

### データ検証
1. FLASHBACKS_DATAの総数が20であること
2. 出典別分布が正しいこと（v2-original: 6, sakura-teachings: 14）
3. 3部構成別分布が正しいこと（foundation: 9, conflict: 6, integration: 5）
4. 各回想シーンのpart判定が正しいこと

### デザイン整合性
1. ThirteenChapters、SubthemesStatsと同じタイポグラフィ・スペーシングであること
2. パート色分けが既存コンポーネントと一致していること
3. アニメーションとホバー効果が統一されていること
</verification>

<success_criteria>
## 達成基準

### SA-01: 回想シーン一覧閲覧
- [x] 20回の回想シーン全件がリスト表示されている
- [x] 各シーンの話数、テーマ、出典が表示されている
- [x] 一覧は話数順（昇順）にソートされている

### SA-02: 3部構成別分布視覚化
- [x] 基礎編(9回)・葛藤編(6回)・統合編(5回)の分布がグラフで表示されている
- [x] パート色分けがPhase 1/2と統一されている（emerald/amber/violet）

### SA-03: 各回想シーン詳細確認（詳細パネルは03-02で実装）
- [x] 一覧表示でテーマと出典が確認できる
- [ ] クリックで詳細パネルが開く（03-02で実装）

### SA-04: 時系列順確認
- [x] 回想シーンが話数順（時系列）に並んでいる
- [ ] タイムラインビューでの流れ追跡（03-02で実装）
</success_criteria>

<output>
完了後、`.planning/phases/03-sakura-flashbacks/03-sakura-flashbacks-01-SUMMARY.md` を作成:

1. 実装された機能の概要
2. 各タスクのコミットハッシュ
3. 作成/変更されたファイル一覧
4. 重要な決定事項（デザインパターン、データ構造など）
5. 計画からの逸脱とその理由
6. 次のステップ（03-02: 詳細パネルとタイムライン実装）
</output>
