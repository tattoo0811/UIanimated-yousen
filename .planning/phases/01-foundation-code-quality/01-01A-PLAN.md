---
phase: 01-foundation-code-quality
plan: 01A
type: execute
wave: 1
depends_on: []
files_modified:
  - mobile/src/types/index.ts
  - mobile/src/lib/storage/schema.ts
  - mobile/src/lib/cache.ts
  - mobile/src/lib/monitoring.ts
  - mobile/src/lib/share.ts
  - mobile/src/lib/storage/migrations.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "lib/*配下のany型が適切な型に置き換えられている"
    - "型定義ファイルのTypeScriptエラーが解消されている"
  artifacts:
    - path: "mobile/src/types/index.ts"
      provides: "型定義"
      contains: "Record<string, unknown>" instead of "Record<string, any>"
    - path: "mobile/src/lib/storage/schema.ts"
      provides: "ストレージスキーマ型定義"
      contains: "FortuneResult type with proper resultData type"
    - path: "mobile/src/lib/cache.ts"
      provides: "メモ化キャッシュ"
      contains: "proper generic types without any"
  key_links:
    - from: "mobile/src/lib/storage/schema.ts"
      to: "mobile/src/types/index.ts"
      via: "FortuneResult.resultData should use CalculationResult type"
      pattern: "resultData.*CalculationResult"
    - from: "mobile/src/lib/cache.ts"
      to: "mobile/src/types/index.ts"
      via: "memoizeSimple generic constraints"
      pattern: "extends.*Args.*unknown"
---

<objective>
lib/*配下のTypeScript strict modeエラーを修正し、型安全性を向上させる（パート1）

Purpose: 既存コードベースの`any`型使用を適切な型に置き換え、strict mode下で型エラーが発生しない状態にする。この計画ではlib/*配下のファイルに焦点を当てる。
Output: lib/*配下の型エラー解消、`any`型の削除、適切な型定義の追加
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

# Current Type Issues
@mobile/src/types/index.ts - Contains Record<string, any> at line 137
@mobile/src/lib/storage/schema.ts - Contains resultData: any at line 23
@mobile/src/lib/cache.ts - Uses any[] at line 10
@mobile/src/lib/monitoring.ts - Uses Record<string, any> at line 38
@mobile/src/lib/share.ts - Uses any for error at line 132
@mobile/src/lib/storage/migrations.ts - Uses any at lines 7, 45
</context>

<tasks>

<task type="auto">
  <name>Task 1: types/index.tsのany型を修正</name>
  <files>mobile/src/types/index.ts</files>
  <action>
    SanmeigakuInsenChart.extensionsの型を`Record<string, any>`から`Record<string, unknown>`に変更。
    理由: `any`は型安全性を完全に無視するため、`unknown`を使用して型ガードを強制する方が安全。
  </action>
  <verify>npx tsc --noEmit | grep -i "types/index.ts" returns no errors</verify>
  <done>SanmeigakuInsenChart.extensionsがunknown型を使用し、型エラーが解消されている</done>
</task>

<task type="auto">
  <name>Task 2: lib/storage/schema.tsの型定義を強化</name>
  <files>mobile/src/lib/storage/schema.ts</files>
  <action>
    FortuneResult.resultDataの型を`any`から適切な型に変更。
    1. types/index.tsのCalculationResult型をimport
    2. FortuneResult.resultDataを`CalculationResult | null`に変更
    3. 既存データとの互換性を考慮し、resultDataはオプショナルにする
  </action>
  <verify>npx tsc --noEmit | grep -i "schema.ts" returns no errors</verify>
  <done>FortuneResult.resultDataがCalculationResult型を使用し、型安全性が確保されている</done>
</task>

<task type="auto">
  <name>Task 3: lib/cache.tsのany型を修正</name>
  <files>mobile/src/lib/cache.ts</files>
  <action>
    memoizeSimple関数のジェネリック制約を修正。
    1. `...args: any[]`を`...args: unknown[]`に変更
    2. JSON.stringifyの使用を維持（キャッシュキー生成には妥当）
    3. 必要に応じて型ガードを追加
  </action>
  <verify>npx tsc --noEmit | grep -i "cache.ts" returns no errors</verify>
  <done>memoizeSimple関数がunknown型を使用し、型安全性が向上している</done>
</task>

<task type="auto">
  <name>Task 4: lib/monitoring.tsのany型を修正</name>
  <files>mobile/src/lib/monitoring.ts</files>
  <action>
    recordErrorメソッドのcontextパラメータ型を`Record<string, any>`から`Record<string, string | number | boolean>`に変更。
    理由: Firebase Crashlyticsに渡す属性はプリミティブ型のみが有効。
  </action>
  <verify>npx tsc --noEmit | grep -i "monitoring.ts" returns no errors</verify>
  <done>recordErrorのcontextパラメータが適切な型制約を持っている</done>
</task>

<task type="auto">
  <name>Task 5: lib/share.tsのany型を修正</name>
  <files>mobile/src/lib/share.ts</files>
  <action>
    shareNative関数内のerror型を`any`から`unknown`に変更。
    1. `error: any`を`error: unknown`に変更
    2. 型ガード`error instanceof Error`を追加して安全にプロパティアクセス
  </action>
  <verify>npx tsc --noEmit | grep -i "share.ts" returns no errors</verify>
  <done>errorがunknown型で適切に型ガードされている</done>
</task>

<task type="auto">
  <name>Task 6: lib/storage/migrations.tsのany型を修正</name>
  <files>mobile/src/lib/storage/migrations.ts</files>
  <action>
    migrateStorage関数のoldDataパラメータとvalidateSchema関数のdataパラメータを`any`から`unknown`に変更。
    1. `oldData: any`を`oldData: unknown`に変更
    2. 関数内で型ガードを使用して安全に型チェック
    3. validateSchemaのdataパラメータも同様に変更
  </action>
  <verify>npx tsc --noEmit | grep -i "migrations.ts" returns no errors</verify>
  <done>migrateStorageとvalidateSchemaがunknown型で適切に型ガードされている</done>
</task>

</tasks>

<verification>
1. `cd mobile && npx tsc --noEmit` でlib/*配下の型エラーが発生しないこと
2. lib/*配下の`any`型使用箇所が0になっていること
</verification>

<success_criteria>
1. lib/*配下のTypeScript strict mode有効状態で型エラー数: 0
2. lib/*配下の`any`型使用箇所: 0（unknownまたは適切な型に置換）
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-code-quality/01-01A-SUMMARY.md`
</output>
