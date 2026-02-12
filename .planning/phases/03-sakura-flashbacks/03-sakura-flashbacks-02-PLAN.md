---
phase: 03-sakura-flashbacks
plan: 02
type: execute
wave: 1
depends_on: ["03-sakura-flashbacks-01"]
files_modified:
  - src/components/features/SakuraFlashbacks.tsx
autonomous: true

must_haves:
  truths:
    - "ユーザーは各回想シーンの詳細（テーマ、内容）をクリックして確認できる"
    - "詳細パネルはスムーズなアニメーションで開閉する"
    - "ユーザーは回想シーンを物語の流れで時系列順に確認できる"
    - "タイムラインビューでは120話の中で回想がどの位置にあるか視覚的に把握できる"
  artifacts:
    - path: "src/components/features/SakuraFlashbacks.tsx"
      provides: "回想シーン詳細パネルとタイムラインビュー"
      min_lines: 250（01-02実装後の拡張）
  key_links:
    - from: "SakuraFlashbacks.tsx（詳細パネル）"
      to: "FLASHBACKS_DATA"
      via: "selectedFlashback stateで選択されたデータを参照"
      pattern: "selectedFlashback.*FLASHBACKS_DATA"
    - from: "SakuraFlashbacks.tsx（タイムライン）"
      to: "ThirteenChapters.tsx"
      via: "同じタイムラインパターンを再利用"
      pattern: "timeline.*episode.*range"
---

<objective>
回想シーンの詳細パネル展開とタイムラインビューを実装する

**目的:**
ユーザーが各回想シーンの詳細内容を確認でき、物語の流れの中で回想シーンの位置関係を把握できるようにする

**出力:**
- クリックで展開する詳細パネル（内容説明の全文表示）
- タイムラインビュー（120話の物語流れの中で回想シーンを可視化）
- ビュー切替機能（一覧/タイムライン）

**価値:**
単なるリスト以上の探索体験を提供し、さくらの回想シーンが物語のどのタイミングで挿入されているかを直感的に理解できる
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

# Component Pattern for Detail Panel
@src/components/features/ThirteenChapters.tsx
@src/components/features/StoryTimeline.tsx

# Data Source
@src/data/flashbacks.ts
</context>

<tasks>

<task type="auto">
  <name>回想シーン詳細パネルの実装</name>
  <files>src/components/features/SakuraFlashbacks.tsx</files>
  <action>
01-01で実装したSakuraFlashbacksコンポーネントに詳細パネル機能を追加:

1. **状態管理追加**:
   ```typescript
   const [expandedFlashbackId, setExpandedFlashbackId] = useState<number | null>(null);
   const [selectedFlashback, setSelectedFlashback] = useState<Flashback | null>(null);
   ```

2. **カードクリックハンドラー**:
   ```typescript
   const handleFlashbackClick = (flashback: Flashback) => {
     // 展開状態をトグル
     setExpandedFlashbackId(expandedFlashbackId === flashback.id ? null : flashback.id);
     // 詳細表示のために選択状態をセット
     setSelectedFlashback(flashback);
   };
   ```

3. **詳細パネル実装**（ThirteenChaptersのアコーディオンパターンを再利用）:
   - AnimatePresenceでスムーズな開閉アニメーション
   - 展開時のパネル内容:
     - ヘッダー: 話数 + 出典 + パートバッジ + テーマタイトル
     - 内容説明（フルテキスト）
     - メタデータ: 登場話、出典区分、3部構成所属
     - 関連情報（例：該当話数が属する章情報）

4. **詳細パネルスタイリング**:
   - 背景色: bg-slate-700/30
   - ボーダー: border-t border-slate-700/50
   - パディング: p-5
   - タイポグラフィ: text-sm text-slate-300 leading-relaxed

5. **アクセシビリティ**:
   - aria-expanded属性
   - aria-controlsでパネルとの関連付け
   - onKeyDownでEnter/Spaceキー対応

6. **詳細モードでの表示強化**:
   - viewMode === 'detailed'の場合のみ、追加のコンテキスト情報を表示
   - 例: 3部構成マッピング情報、該当章の範囲など

**重要**: 一覧ビューでは、クリックでカード自体が展開（アコーディオン）
</action>
  <verify>
1. カードクリックで詳細パネルが展開されること
2. アニメーションがスムーズであること（Framer Motionのheight/opacityトランジション）
3. 展開されたパネルに内容説明のフルテキストが表示されていること
4. aria-expandedが正しく切り替わっていること（true/false）
5. キーボード操作（Enter/Space）でパネルが開閉できること
  </verify>
  <done>
回想シーンカードクリックで詳細パネルが展開され、内容説明とメタデータが表示される
  </done>
</task>

<task type="auto">
  <name>タイムラインビューの実装</name>
  <files>src/components/features/SakuraFlashbacks.tsx</files>
  <action>
一覧ビューに加え、タイムラインビューを実装:

1. **ビュー切替状態追加**:
   ```typescript
   const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
   ```

2. **ビュー切替ボタン**:
   - 一覧/タイムラインの切り替えボタンをセクションヘッダー付近に配置
   - アイコン使用: List（一覧）、Clock（タイムライン）または Timeline from lucide-react
   - アクティブなビューはボールド＆ハイライト表示

3. **タイムラインコンポーネント構造**:
   - 垂直タイムライン（StoryTimeline.tsxのパターンを参考）
   - 120話の全範囲を表示（1話〜120話）
   - 回想シーンのある話数位置にマーカーを配置

4. **タイムライン実装詳細**:
   - **全体レイアウト**: 垂直ライン（border-l-2 border-slate-700）
   - **話数目盛**: 10話ごとにラベル（第10話、第20話...）
   - **回想マーカー**:
     - 該当話数位置に円形マーカーを配置
     - マーカーの色はパートに応じて変化（foundation: emerald, conflict: amber, integration: violet）
     - マーカーサイズ: w-4 h-4（circle）
     - ホバー時: ツールチップで回想テーマを表示
   - **クリック可能**: マーカークリックで該当回想シーンの詳細パネルを開く（一覧ビューに切り替えて展開）

5. **3部構成セパレーター**:
   - タイムライン上で第40話後、第80話後にパート境界セパレーターを表示
   - PartSeparatorコンポーネント（ThirteenChaptersから再利用またはコピー）

6. **詳細パネル統合**:
   - タイムライン上でマーカークリック時、詳細パネルをタイムライン下に表示
   - 「選択中の回想シーン」としてハイライト表示

7. **レスポンシブ対応**:
   - モバイル: 縦方向のタイムライン（スクロール可能）
   - デスクトップ: 横方向のタイムラインも検討（または縦方向を維持）

8. **アニメーション**:
   - 初回レンダリング時のフェードイン
   - マーカーのホバーエフェクト（scale up）
   - セパレーターのスライドイン

**デザイン参考**: StoryTimeline.tsxの既存パターンを尊重しつつ、回想シーン専用のUI要素を追加
</action>
  <verify>
1. ビュー切替ボタンで一覧/タイムラインが切り替わること
2. タイムライン上に20個の回想マーカーが正しく配置されていること
3. マーカーが話数の正しい位置にあること（例: 1話マーカーは timeline-top付近、120話マーカーは底部）
4. マーカーの色がパートに応じて正しく変化していること（1-40話: emerald, 41-80話: amber, 81-120話: violet）
5. マーカーホバーでツールチップが表示されること
6. マーカークリックで詳細パネルが開くこと
7. 3部構成セパレーターが正しい位置（第40話後、第80話後）に表示されていること
  </verify>
  <done>
タイムラインビューで120話の中で回想シーンがどの位置にあるか視覚的に把握でき、マーカークリックで詳細確認できる
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    1. 回想シーン詳細パネル（クリックで展開、内容説明表示）
    2. タイムラインビュー（120話の物語流れで回想シーンを可視化）
    3. ビュー切替機能（一覧/タイムライン）
  </what-built>
  <how-to-verify>
    1. **詳細パネル検証**:
                   - ダッシュボードの「さくら回想」タブを開く
                   - 一覧表示で任意の回想シーンカードをクリック
                   - 詳細パネルが展開し、内容説明が全文表示されていることを確認
                   - キーボードTabでカードにフォーカス後、Enterキーでパネルが開くことを確認

    2. **タイムラインビュー検証**:
                   - ビュー切替ボタンで「タイムライン」を選択
                   - 120話のタイムラインが表示されていることを確認
                   - 20個の回想マーカーが正しい位置にあることを確認（例: 1話マーカーは上部、104.5話マーカーは下部寄り）
                   - マーカーの色がパートで変化していることを確認（1-40話: 緑系、41-80話: オレンジ系、81-120話: 紫系）

    3. **インタラクション検証**:
                   - タイムライン上のマーカーにホバーし、ツールチップが表示されることを確認
                   - マーカーをクリックし、詳細パネルが開くことを確認
                   - 一覧ビューに戻り、同じ回想シーンが展開されていることを確認

    4. **時系列順確認**:
                   - タイムライン上でマーカーが話数順に並んでいることを確認（上から下に向かって1話 → 104.5話）
                   - 一覧ビューでもカードが話数順にソートされていることを確認

    5. **アクセシビリティ検証**:
                   - キーボードのみでビュー切替、マーカー選択が可能であることを確認
                   - スクリーンリーダーで「タイムライン」「回想マーカー」が正しく読み上げられることを確認
  </how-to-verify>
  <resume-signal>
    - "approved" - 全検証項目がパスした場合、次のフェーズへ進む
    - または問題の詳細を説明（修正対応）
  </resume-signal>
</task>

</tasks>

<verification>
## Phase全体検証

### コード検証
1. `npm run build` 成功（TypeScriptエラーなし）
2. `npm run lint` エラーなし

### 機能検証（03-01統合）
1. 一覧ビューで20回の回想シーンが表示されていること（03-01）
2. 分布グラフが正しく表示されていること（03-01）
3. カードクリックで詳細パネルが展開されること（03-02）
4. タイムラインビューに切り替え可能であること（03-02）
5. タイムライン上で回想シーンの位置関係が把握できること（03-02）

### SA達成基準検証
1. SA-01: 20回の回想シーン全件がリスト閲覧できる（話数、テーマ、出典）
2. SA-02: 3部構成別分布がグラフで確認できる
3. SA-03: 各回想シーンの詳細（テーマ、内容）をクリックして確認できる
4. SA-04: 回想シーンを物語の流れで時系列順に確認できる

### デザイン整合性
1. 詳細パネルのアニメーションがThirteenChaptersと統一されていること
2. タイムラインのデザインがStoryTimelineのパターンを尊重していること
3. 3部構成色分けがPhase 1/2と統一されていること

### パフォーマンス
1. ビュー切替がスムーズであること（lagなし）
2. タイムラインのレンダリングが高速であること（20マーカー + 120話スケール）
</verification>

<success_criteria>
## Phase 3完了基準

### SA-01: 回想シーン一覧閲覧
- [x] 20回の回想シーン全件がリスト表示されている
- [x] 各シーンの話数、テーマ、出典が表示されている

### SA-02: 3部構成別分布視覚化
- [x] 基礎編(9回)・葛藤編(6回)・統合編(5回)の分布がグラフで表示されている

### SA-03: 各回想シーン詳細確認
- [x] クリックで詳細パネルが展開される
- [x] 内容説明の全文が表示されている
- [x] メタデータ（出典、パート、話数）が確認できる

### SA-04: 時系列順確認
- [x] 一覧ビューで話数順に並んでいる
- [x] タイムラインビューで物語の流れが視覚的に把握できる
- [x] タイムライン上で回想シーンの位置関係が理解できる

## Phase 3完了条件
- [ ] すべての成功基準（SA-01〜04）が達成されている
- [ ] ユーザー検証（checkpoint）がパスしている
- [ ] コード品質（build、lint）がクリアされている
- [ ] Phase 4の実行準備が完了している
</success_criteria>

<output>
完了後、`.planning/phases/03-sakura-flashbacks/03-sakura-flashbacks-02-SUMMARY.md` を作成:

1. 実装された機能の概要（詳細パネル、タイムラインビュー）
2. 各タスクのコミットハッシュ
3. 作成/変更されたファイル一覧
4. 重要な決定事項（UIパターン、アニメーション設計など）
5. 計画からの逸脱とその理由
6. ユーザーフィードバック（checkpointの結果）
7. Phase 3完了のサマリ（SA-01〜04の達成状況）
8. 次のフェーズ準備（Phase 4: サブテーマ統計への引き継ぎ事項）
</output>
