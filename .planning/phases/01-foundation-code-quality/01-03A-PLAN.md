---
phase: 01-foundation-code-quality
plan: 03A
type: execute
wave: 3
depends_on: [01B, 02B]
files_modified:
  - mobile/package.json
  - mobile/eslint.config.js
  - mobile/jest.config.js
  - mobile/jest.setup.js
autonomous: true
user_setup: []

must_haves:
  truths:
    - "ESLintが実行可能で、プロジェクトルールが適用されている"
    - "Jest設定がExpo SDK 54と互換性がある"
    - "lintスクリプトとtestスクリプトが正常に動作する"
  artifacts:
    - path: "mobile/package.json"
      provides: "npmスクリプト（lint, test）"
      contains: "lint script"
    - path: "mobile/eslint.config.js"
      provides: "ESLint設定"
      exists: true
    - path: "mobile/jest.config.js"
      provides: "Jest設定"
      exists: true
    - path: "mobile/jest.setup.js"
      provides: "Jestセットアップ"
      contains: "@testing-library/jest-native/extend-expect"
  key_links:
    - from: "package.json"
      to: "eslint.config.js"
      via: "lint script using expo lint"
      pattern: "lint.*eslint"
    - from: "package.json"
      to: "jest.config.js"
      via: "test script using jest"
      pattern: "test.*jest"
---

<objective>
ESLint/テスト基盤を構築する（パート1: 設定）

Purpose: コード品質を維持するためのLint基盤を確立し、Jestテストが正しく実行されるように設定を整える。Expo公式のESLint設定を適用し、Jest設定をExpo SDK 54と互換性がある状態にする。
Output: ESLint設定、更新されたJest設定、npmスクリプト
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

# Current State
- Jest設定済み: jest.config.js, jest.setup.js存在
- テストファイル17個存在: __tests__/lib/*.test.ts, __tests__/components/*.test.tsx
- ESLint: グローバルv9.39.2存在、ローカル未インストール
- eslint.config.js: 存在せず
</context>

<tasks>

<task type="auto">
  <name>Task 1: ESLint設定ファイルを作成</name>
  <files>mobile/eslint.config.js</files>
  <action>
    Expo SDK 54のESLint Flat configを作成。
    1. `eslint-config-expo`をインストール: `npm install --save-dev eslint eslint-config-expo`
    2. `eslint.config.js`を作成:
       ```javascript
       const { defineConfig } = require('eslint/config');
       const expoConfig = require('eslint-config-expo/flat');

       module.exports = defineConfig([
         expoConfig,
         {
           ignores: ['dist/*', 'coverage/*', 'node_modules/*', '.expo/*'],
           rules: {
             // プロジェクト固有のルールを追加
             '@typescript-eslint/no-explicit-any': 'error',
             '@typescript-eslint/no-unused-vars': 'warn',
           }
         }
       ]);
       ```
  </action>
  <verify>test -f mobile/eslint.config.js && grep -q "eslint-config-expo" mobile/eslint.config.js</verify>
  <done>eslint.config.jsが作成され、Expo設定が読み込まれている</done>
</task>

<task type="auto">
  <name>Task 2: lintスクリプトを追加</name>
  <files>mobile/package.json</files>
  <action>
    package.jsonにlintスクリプトを追加。
    1. `"lint": "expo lint"`をscriptsセクションに追加
    2. 必要に応じて`"lint:fix": "expo lint --fix"`も追加
  </action>
  <verify>grep -q '"lint".*"expo lint"' mobile/package.json</verify>
  <done>npm run lintでESLintが実行できる</done>
</task>

<task type="auto">
  <name>Task 3: ESLintを実行してエラーを確認</name>
  <files>mobile/eslint.config.js</files>
  <action>
    `npm run lint`を実行して、プロジェクト全体のLintエラーを確認。
    重大なエラーがあれば修正、警告はログに記録。
  </action>
  <verify>npm run lint completes without crashing</verify>
  <done>ESLintが正常に実行され、重大なエラーがないか確認済み</done>
</task>

<task type="auto">
  <name>Task 4: Jest設定を更新</name>
  <files>mobile/jest.config.js</files>
  <action>
    Jest設定がExpo SDK 54と互換性があることを確認。
    1. preset: "jest-expo"を確認
    2. transformIgnorePatternsが正しいことを確認
    3. setupFilesAfterEnvがjest.setup.jsを指していることを確認
    必要に応じて設定を更新。
  </action>
  <verify>grep -q "jest-expo" mobile/jest.config.js && grep -q "setupFilesAfterEnv" mobile/jest.config.js</verify>
  <done>Jest設定がExpo SDK 54と互換性がある</done>
</task>

</tasks>

<verification>
1. `npm run lint` が正常に実行できること
2. jest.config.jsにjest-expo設定が含まれていること
3. eslint.config.jsが存在し、Expo設定が読み込まれていること
</verification>

<success_criteria>
1. ESLintが実行可能で、重大なエラーがない
2. Jest設定がExpo SDK 54と互換性がある
3. lintスクリプトがpackage.jsonに登録されている
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-code-quality/01-03A-SUMMARY.md`
</output>
