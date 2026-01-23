---
phase: 01-foundation-code-quality
plan: 03B
type: execute
wave: 4
depends_on: [03A]
files_modified:
  - mobile/jest.setup.js
  - mobile/.gitignore
  - mobile/__tests__/**/*
autonomous: true
user_setup: []

must_haves:
  truths:
    - "既存の回帰テストが全てパスする"
    - "テストカバレッジが設定された基準を満たす"
    - "テスト生成物がGitにコミットされない"
  artifacts:
    - path: "mobile/jest.setup.js"
      provides: "Jestセットアップ"
      contains: "@testing-library/jest-native/extend-expect"
  key_links:
    - from: "package.json"
      to: "jest.config.js"
      via: "test script using jest"
      pattern: "test.*jest"
    - from: "jest.setup.js"
      to: "jest.config.js"
      via: "setupFilesAfterEnv reference"
      pattern: "setupFilesAfterEnv"
---

<objective>
Jestテストを実行し、既存機能の回帰を検証する（パート2: 実行と検証）

Purpose: 01-03Aで構築したテスト基盤を使用して、既存の回帰テストを実行し、01-01Bと01-02Bの変更による機能への影響がないことを確認する。テストカバレッジレポートを生成し、品質の現状を把握する。
Output: 実行中のJestテスト、テストカバレッジレポート
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
@.planning/phases/01-foundation-code-quality/01-03A-SUMMARY.md

# Current State
- ESLint設定済み: 01-03Aで完了
- Jest設定更新済み: 01-03Aで完了
- テストファイル17個存在: __tests__/lib/*.test.ts, __tests__/components/*.test.tsx
- 01-01Bと01-02BでTypeScript型修正・viral-charactors移行を実施
</context>

<tasks>

<task type="auto">
  <name>Task 1: Jest setupを拡張</name>
  <files>mobile/jest.setup.js</files>
  <action>
    jest.setup.jsに@testing-library/jest-nativeを追加していない場合は追加。
    1. 先頭に`import '@testing-library/jest-native/extend-expect';`を追加
    2. ネイティブモジュールのモックが適切に設定されていることを確認
  </action>
  <verify>grep -q "@testing-library/jest-native/extend-expect" mobile/jest.setup.js</verify>
  <done>jest.setup.jsにテストライブラリ拡張が含まれている</done>
</task>

<task type="auto">
  <name>Task 2: 既存テストを実行して回帰を検証</name>
  <files>mobile/__tests__/**/*</files>
  <action>
    `npm test`を実行して全ての既存テストがパスすることを確認。
    失敗するテストがある場合は、01-01Bまたは01-02Bの変更による影響を確認し修正。
  </action>
  <verify>npm test exits with code 0 and all tests pass</verify>
  <done>全ての既存テストがパスする</done>
</task>

<task type="auto">
  <name>Task 3: テストカバレッジを確認</name>
  <files>mobile/jest.config.js</files>
  <action>
    `npm run test:coverage`を実行してカバレッジレポートを生成。
    設定されたカバレッジ基準（80%）を満たしているか確認。
    不足している場合は、どのファイルのカバレッジを追加すべきかログに記録。
  </action>
  <verify>npm run test:coverage generates coverage report</verify>
  <done>テストカバレッジレポートが生成され、現状のカバレッジが確認できた</done>
</task>

<task type="auto">
  <name>Task 4: .gitignoreを確認</name>
  <files>mobile/.gitignore</files>
  <action>
    .gitignoreにcoverage/とdist/が含まれていることを確認。
    含まれていない場合は追加。
  </action>
  <verify>grep -q "coverage" mobile/.gitignore && grep -q "dist" mobile/.gitignore</verify>
  <done>テスト生成物がGitにコミットされないよう設定済み</done>
</task>

</tasks>

<verification>
1. `npm test` が全てパスすること
2. `npm run test:coverage` でカバレッジレポートが生成されること
3. jest.setup.jsに@testing-library/jest-nativeが含まれていること
4. .gitignoreにcoverage/が含まれていること
</verification>

<success_criteria>
1. 既存の回帰テスト（17個）が全てパス
2. テストカバレッジレポートが生成可能
3. テスト生成物がGitにコミットされないよう設定済み
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-code-quality/01-03B-SUMMARY.md`
</output>
