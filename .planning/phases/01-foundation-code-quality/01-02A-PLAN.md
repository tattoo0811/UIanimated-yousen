---
phase: 01-foundation-code-quality
plan: 02A
type: execute
wave: 1
depends_on: []
files_modified:
  - mobile/src/data/viral-characters.types.ts
  - mobile/src/data/viral-characters.json
  - mobile/src/lib/viral-characters-loader.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "型定義ファイルが作成されている"
    - "データがJSONアセットとして外部化されている"
    - "動的読み込みローダーが実装されている"
  artifacts:
    - path: "mobile/src/data/viral-characters.json"
      provides: "バイラルキャラクターの静的データ"
      min_lines: 1000
    - path: "mobile/src/data/viral-characters.types.ts"
      provides: "型定義（ViralCharacterData, ViralCharactersData）"
      exports: ["ViralCharacterData", "ViralCharactersData"]
    - path: "mobile/src/lib/viral-characters-loader.ts"
      provides: "データの動的読み込みとキャッシュ"
      exports: ["loadViralCharacters"]
  key_links:
    - from: "mobile/src/lib/viral-characters-loader.ts"
      to: "mobile/src/data/viral-characters.json"
      via: "expo-asset for dynamic loading"
      pattern: "Asset.fromModule.*viral-characters"
---

<objective>
viral-characters.ts（72KB、1,093行）を型定義・JSON・ローダーに分割する（パート1）

Purpose: 現在JavaScriptバンドルに含まれている大規模データファイルを、型定義・JSONデータ・動的ローダーの3ファイルに分割する。この計画では型定義作成、JSON変換、ローダー実装を行う。
Output: 型定義ファイル、JSONアセットファイル、ローダー関数
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
@mobile/src/data/viral-characters.ts - 72KB, 1,093 lines, bundled with JS
</context>

<tasks>

<task type="auto">
  <name>Task 1: 型定義ファイルを作成</name>
  <files>mobile/src/data/viral-characters.types.ts</files>
  <action>
    viral-characters.tsから型定義のみを抽出して新規ファイルを作成。
    1. `ViralCharacterData`インターフェースを定義
    2. `ViralCharactersData`インターフェースを定義
    3. エクスポート形式: `export interface ViralCharacterData {...}`
    型定義のみを含め、データは含めないこと。
  </action>
  <verify>grep -i "export interface" mobile/src/data/viral-characters.types.ts shows ViralCharacterData and ViralCharactersData</verify>
  <done>型定義ファイルが作成され、ViralCharacterDataとViralCharactersDataがエクスポートされている</done>
</task>

<task type="auto">
  <name>Task 2: データをJSONファイルに変換</name>
  <files>mobile/src/data/viral-characters.json</files>
  <action>
    viral-characters.tsのデータ部分のみを抽出してJSONファイルを作成。
    1. `viralCharactersData`オブジェクトの内容をJSON形式で保存
    2. 構造: `{"formatVersion": "1.0", "lastUpdated": "2026-01-11", "description": "...", "characters": [...]}`
    3. TypeScriptコードを含めず、純粋なJSONのみ
  </action>
  <verify>jq . mobile/src/data/viral-characters.json succeeds and file contains characters array</verify>
  <done>JSONファイルが作成され、60キャラクター分のデータが含まれている</done>
</task>

<task type="auto">
  <name>Task 3: 動的ローダー関数を実装</name>
  <files>mobile/src/lib/viral-characters-loader.ts</files>
  <action>
    expo-assetを使用した動的読み込み関数を作成。
    1. `expo-asset`から`Asset`をimport
    2. `loadViralCharacters(): Promise<ViralCharactersData>`関数を実装
    3. メモリキャッシュを実装（モジュールレベルのキャッシュ変数）
    4. エラーハンドリングを追加
    実装パターン:
    ```typescript
    import { Asset } from 'expo-asset';
    import type { ViralCharactersData } from '../data/viral-characters.types';

    let cachedData: ViralCharactersData | null = null;

    export async function loadViralCharacters(): Promise<ViralCharactersData> {
      if (cachedData) return cachedData;
      const asset = Asset.fromModule(require('../data/viral-characters.json'));
      await asset.downloadAsync();
      const response = await fetch(asset.localUri!);
      cachedData = await response.json();
      return cachedData;
    }
    ```
  </action>
  <verify>grep -q "loadViralCharacters" mobile/src/lib/viral-characters-loader.ts && grep -q "Asset.fromModule" mobile/src/lib/viral-characters-loader.ts</verify>
  <done>loadViralCharacters関数が実装され、expo-assetで動的読み込みが可能</done>
</task>

</tasks>

<verification>
1. `mobile/src/data/viral-characters.types.ts` が型定義をエクスポートしていること
2. `mobile/src/data/viral-characters.json` が存在し、有効なJSONであること
3. `mobile/src/lib/viral-characters-loader.ts` がloadViralCharacters関数をエクスポートしていること
</verification>

<success_criteria>
1. 型定義ファイルが作成されている
2. データがJSON形式で出力されている
3. 動的ローダー関数が実装されている
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-code-quality/01-02A-SUMMARY.md`
</output>
