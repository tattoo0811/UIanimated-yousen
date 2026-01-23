---
phase: 01-foundation-code-quality
plan: 02B
type: execute
wave: 2
depends_on: [02A]
files_modified:
  - mobile/src/components/cards/FamilyCard.tsx
  - mobile/src/components/cards/LoveCard.tsx
  - mobile/src/components/cards/WorkCard.tsx
  - mobile/src/data/viral-characters.ts
  - mobile/package.json
autonomous: true
user_setup: []

must_haves:
  truths:
    - "viral-characters.tsがJavaScriptバンドルに含まれない"
    - "既存コンポーネントが動的ローダーを使用している"
    - "バンドルサイズが削減されている"
  artifacts:
    - path: "mobile/src/data/viral-characters.ts"
      provides: "元のデータファイル（削除）"
      exists: false
    - path: "mobile/src/data/viral-characters.json"
      provides: "バイラルキャラクターの静的データ（アセット）"
      exists: true
  key_links:
    - from: "mobile/src/components/cards/*.tsx"
      to: "mobile/src/lib/viral-characters-loader.ts"
      via: "import loadViralCharacters function"
      pattern: "loadViralCharacters.*await"
    - from: "mobile/src/lib/viral-characters-loader.ts"
      to: "mobile/src/data/viral-characters.json"
      via: "expo-asset for dynamic loading"
      pattern: "Asset.fromModule.*viral-characters"
---

<objective>
既存コンポーネントを動的ローダーに移行し、viral-characters.tsを削除してバンドルサイズを削減する（パート2）

Purpose: 01-02Aで作成した型定義・JSON・ローダーを既存コンポーネントで使用するように移行し、元のviral-characters.tsファイルを削除してバンドルサイズを削減する。
Output: 既存コンポーネントの動的ローダー使用、元ファイル削除、バンドルサイズ削減
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation-code-quality/01-RESEARCH.md
@.planning/phases/01-foundation-code-quality/01-02A-SUMMARY.md

# Current State
@mobile/src/data/viral-characters.ts - 72KB, still bundled with JS
@mobile/src/data/viral-characters.types.ts - Created in 01-02A
@mobile/src/data/viral-characters.json - Created in 01-02A
@mobile/src/lib/viral-characters-loader.ts - Created in 01-02A
</context>

<tasks>

<task type="auto">
  <name>Task 1: 既存のimportを置き換え</name>
  <files>
    mobile/src/components/cards/FamilyCard.tsx
    mobile/src/components/cards/LoveCard.tsx
    mobile/src/components/cards/WorkCard.tsx
  </files>
  <action>
    viral-characters.tsの直接importをloadViralCharacters関数に置き換え。
    1. 既存の`import { viralCharactersData }`を削除
    2. `import { loadViralCharacters }`と`import type { ViralCharacterData }`を追加
    3. データ使用箇所で`await loadViralCharacters()`を呼び出し
    4. 必要に応じてuseEffectまたはasync関数内で呼び出し
  </action>
  <verify>grep -r "from.*viral-characters" mobile/src/components/cards/ shows only type imports or loader imports</verify>
  <done>直接のデータimportが削除され、動的ローダー経由に置き換わっている</done>
</task>

<task type="auto">
  <name>Task 2: 元のviral-characters.tsを削除</name>
  <files>mobile/src/data/viral-characters.ts</files>
  <action>
    型定義とデータが分離されたため、元のviral-characters.tsファイルを削除。
    バックアップとして.gitの歴史は残すが、作業コピーからは削除。
  </action>
  <verify>test ! -f mobile/src/data/viral-characters.ts && ls mobile/src/data/viral-characters.* | wc -l | grep -q 2</verify>
  <done>viral-characters.tsが削除され、.jsonと.types.tsのみが存在</done>
</task>

<task type="auto">
  <name>Task 3: バンドルサイズを確認</name>
  <files>mobile/package.json</files>
  <action>
    バンドルサイズ削減を確認。
    1. `npx expo export`を実行してバンドルを生成
    2. 生成されたバンドルサイズを確認
    3. viral-charactersデータがメインバンドルに含まれていないことを確認
    （このタスクは検証用）
  </action>
  <verify>bundle size is reduced and viral-characters.json is in assets folder, not in main bundle</verify>
  <done>バンドルサイズが削減され、データが外部アセットとして分離されている</done>
</task>

</tasks>

<verification>
1. `mobile/src/data/viral-characters.ts` が削除されていること
2. `mobile/src/data/viral-characters.json` が存在し、有効なJSONであること
3. 既存のコンポーネントがloadViralCharactersを使用していること
4. ビルドが正常に完了すること
</verification>

<success_criteria>
1. viral-characters.ts（72KB）がJavaScriptバンドルから除外
2. データがviral-characters.jsonとして静的アセット化
3. 動的読み込み（loadViralCharacters）が実装され、キャッシュ機能が動作
4. 既存機能が正常に動作し、回帰がない
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-code-quality/01-02B-SUMMARY.md`
</output>
