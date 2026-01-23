---
phase: 01-foundation-code-quality
plan: 01B
type: execute
wave: 2
depends_on: [01A]
files_modified:
  - mobile/src/lib/notifications.ts
  - mobile/src/components/cards/FamilyCard.tsx
  - mobile/src/components/cards/LoveCard.tsx
  - mobile/src/components/cards/WorkCard.tsx
  - mobile/app/settings.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "components/*のTypeScript型エラーが解消されている"
    - "全体のTypeScript型チェックがパスする"
  artifacts:
    - path: "mobile/src/lib/notifications.ts"
      provides: "通知機能"
      contains: "proper DateTriggerInput types"
    - path: "mobile/src/components/cards/FamilyCard.tsx"
      provides: "家族運カード"
      contains: "proper characterName typing"
    - path: "mobile/src/components/cards/LoveCard.tsx"
      provides: "恋愛運カード"
      contains: "proper characterName typing"
    - path: "mobile/src/components/cards/WorkCard.tsx"
      provides: "仕事運カード"
      contains: "proper characterName typing"
  key_links:
    - from: "mobile/src/components/cards/*"
      to: "mobile/src/types/index.ts"
      via: "ViralCharacterData type usage"
      pattern: "ViralCharacterData"
    - from: "mobile/app/settings.tsx"
      to: "mobile/src/types/index.ts"
      via: "UsageCounts type"
      pattern: "UsageCounts"
---

<objective>
components/*とその他のTypeScript strict modeエラーを修正し、全体の型チェックをパスさせる（パート2）

Purpose: components/*配下とその他のファイルで残っているTypeScript型エラーを修正し、プロジェクト全体で`npx tsc --noEmit`がパスする状態にする。01-01Aで修正したlib/*との整合性も確認する。
Output: components/*とその他の型エラー解消、プロジェクト全体の型チェックパス
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
@.planning/phases/01-foundation-code-quality/01-01A-SUMMARY.md

# Current Type Issues (After 01-01A)
@mobile/src/lib/notifications.ts - DateTriggerInput型エラー
@mobile/src/components/cards/FamilyCard.tsx - characterName型エラー
@mobile/src/components/cards/LoveCard.tsx - characterName型エラー
@mobile/src/components/cards/WorkCard.tsx - characterName型エラー
@mobile/app/settings.tsx - UsageCounts.compatibility型エラー
</context>

<tasks>

<task type="auto">
  <name>Task 1: lib/notifications.tsの型エラーを修正</name>
  <files>mobile/src/lib/notifications.ts</files>
  <action>
    expo-notificationsのDateTriggerInput型エラーを修正。
    1. trigger.typeを"SchedulableTriggerInputTypes.DATE"または適切なリテラル型に変更
    2. channelIdプロパティの位置を修正（DateTriggerInputにはchannelIdは含まれない）
    3. contentのtriggerプロパティを正しく構成
  </action>
  <verify>npx tsc --noEmit | grep -i "notifications.ts" returns no errors</verify>
  <done>notifications.tsの型エラーが解消されている</done>
</task>

<task type="auto">
  <name>Task 2: components/cards/*のcharacterName型エラーを修正</name>
  <files>
    mobile/src/components/cards/FamilyCard.tsx
    mobile/src/components/cards/LoveCard.tsx
    mobile/src/components/cards/WorkCard.tsx
  </files>
  <action>
    FamilyCard、LoveCard、WorkCardでcharacterNameプロパティへのアクセスエラーを修正。
    1. ViralCharacterData型をdata/viral-characters.tsからimport
    2. 各カードでcharacterNameを使用する前に、適切なデータ取得処理を確認
    3. 型定義と実際のデータ構造を整合させる
  </action>
  <verify>npx tsc --noEmit | grep -E "(FamilyCard|LoveCard|WorkCard)" returns no errors</verify>
  <done>カードコンポーネントのcharacterNameアクセスで型エラーが発生しない</done>
</task>

<task type="auto">
  <name>Task 3: app/settings.tsxの型エラーを修正</name>
  <files>mobile/app/settings.tsx</files>
  <action>
    UsageCounts型のcompatibilityプロパティ型エラーを修正。
    1. stateの型定義でcompatibilityを`string[]`として正しく定義
    2. UsageCounts型が正しくエクスポートされていることを確認
    3. 型の不一致を解消
  </action>
  <verify>npx tsc --noEmit | grep -i "settings.tsx" returns no errors</verify>
  <done>settings.tsxの型エラーが解消されている</done>
</task>

<task type="auto">
  <name>Task 4: 全体のTypeScript型チェックを実行</name>
  <files>mobile/tsconfig.json</files>
  <action>
    `npx tsc --noEmit`を実行し、全ての型エラーが解消されていることを確認。
    エラーがある場合は、各ファイルを修正してエラーを0にする。
  </action>
  <verify>npx tsc --noEmit exits with code 0 and no errors</verify>
  <done>TypeScript strict mode下で型エラーが発生しない状態</done>
</task>

</tasks>

<verification>
1. `cd mobile && npx tsc --noEmit` がエラーなしで完了すること
2. components/*とapp/*の型エラーが解消されていること
3. ビルド`npm run ios`または`npm run android`がTypeScriptエラーなく開始できること
</verification>

<success_criteria>
1. TypeScript strict mode有効状態で型エラー数: 0
2. `any`型使用箇所: 0（unknownまたは適切な型に置換）
3. ビルドがTypeScriptエラーなしで通過する
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-code-quality/01-01B-SUMMARY.md`
</output>
