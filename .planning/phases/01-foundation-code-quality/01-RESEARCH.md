# Phase 1: Foundation & Code Quality - Research

**Researched:** 2026-01-23
**Domain:** React Native (Expo) + TypeScript
**Confidence:** HIGH

## Summary

このフェーズでは、既存のReact Native + Expoプロジェクトの技術的負債を解消し、新機能追加の基盤を整備する。主な課題は、TypeScriptの型安全性向上、大規模データファイルの外部化、テスト基盤の強化の3つである。

TypeScript strict modeは既に有効化されているが、型エラーが多数存在する。viral-characters.ts（1,093行、72KB）は現在モジュールとしてバンドルされており、これを外部アセットとして分離することでバンドルサイズを削減する。テストはJest + jest-expoが設定済みだが、テストファイルが存在しない。

**Primary recommendation:** 段階的なアプローチで厳格な型安全性を実現し、静的アセット分離とテストカバレッジ向上を並行して進める。

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.9.2 | Type checking | Expo SDK 54の標準構成、strict modeサポート |
| Jest | ^29.7.0 | Testing framework | React Native/Expoのデファクトスタンダード |
| jest-expo | ^54.0.16 | Expo preset for Jest | Expo公式のJestプリセット、ネイティブモジュールをモック |
| @testing-library/react-native | ^13.3.3 | Component testing | React Testing LibraryのReact Native版、動作重視のテスト |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ESLint | (latest) | Linting | コード品質の維持、Expo公式設定使用 |
| Prettier | (latest) | Code formatting | コードスタイルの一貫性 |
| @testing-library/jest-native | ^5.4.3 | Jest custom matchers | React Native用のアサーション拡張 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AsyncStorage | MMKV | 10倍高速だが、移行コスト高。AsyncStorageのままで十分 |
| JSON bundling | Dynamic imports | Expoではサポート制限あり。静的アセットとして読み込む方が安定 |
| ESLint legacy config | Flat config | Expo SDK 53+で推奨だが、既存プロジェクトなら両方対応 |

**Installation:**
```bash
# ESLint setup (if not configured)
npx expo lint

# Testing dependencies (already installed)
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

## Architecture Patterns

### Recommended Project Structure
```
mobile/
├── __tests__/              # テストファイルのルート
│   ├── components/         # コンポーネントテスト
│   ├── lib/               # ユーティリティテスト
│   └── setup.ts           # Jest設定ファイル
├── src/
│   ├── components/        # UIコンポーネント
│   ├── lib/              # ビジネスロジック
│   ├── data/             # データ定義・型のみ
│   └── assets/           # 静的アセット（JSON、画像等）
│       └── data/         # 大規模JSONデータ
├── jest.config.js         # Jest設定
├── eslint.config.js       # ESLint設定（Flat config）または.eslintrc.js
└── tsconfig.json          # TypeScript設定
```

### Pattern 1: TypeScript Strict Mode Migration
**What:** 既存コードの型エラーを段階的に修正
**When to use:** strict modeは有効だが型エラーが多数存在する場合
**Example:**
```typescript
// Before: any型を使用
const loadData = (key: string): any => {
  return AsyncStorage.getItem(key);
};

// After: 適切な型定義
interface StorageData {
  diagnoses: number;
  compatibility: string[];
}

const loadData = async (key: string): Promise<StorageData | null> => {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) as StorageData : null;
};
```

### Pattern 2: Large Dataset Externalization
**What:** 大規模JSONファイルをモジュールから静的アセットに移動
**When to use:** 10KB以上のデータファイル、変更頻度が低いデータ
**Example:**
```typescript
// Before: 直接import（バンドルに含まれる）
import { viralCharactersData } from './viral-characters';

// After: 静的アセットとして動的読み込み
import { Asset } from 'expo-asset';

async function loadViralCharacters() {
  const asset = Asset.fromModule(require('./assets/data/viral-characters.json'));
  await asset.downloadAsync();
  const data = await fetch(asset.localUri);
  return await data.json();
}
```

### Anti-Patterns to Avoid
- **`any`型の乱用**: 型安全性を完全に損なう。`unknown` + 型ガードを使用すべき
- **大規模JSONのトップレベルimport**: バンドルサイズ増加。動的読み込みに変更
- **テストなしの型修正**: リファクタリングでバグを混入させる恐れ。テストを先に書く

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AsyncStorageラッパー | 自作モジュール | 既存のschema.ts | バージョニング、マイグレーション、型安全性を考慮する必要あり |
| TypeScript型ガード | 自作 | `zod`または`io-ts` | 実行時型検証は複雑。既存ライブラリ使用 |
| テストユーティリティ | 自作モック | `@testing-library/react-native` | 公式提供のクエリ関数が最適化済み |
| 非同期処理のキャッシュ | 自作 | `@tanstack/react-query` | キャッシュ、再試行、古いデータの無効化を実装する必要あり |

**Key insight:** React Nativeのエコシステムは成熟している。自作ソリューションは、エッジケースの対応、メンテナンス、テストで重大な負債となる。

## Common Pitfalls

### Pitfall 1: TypeScript strict modeの有効化による既存コードの破壊
**What goes wrong:** strict modeを有効化すると、数百の型エラーが発生
**Why it happens:** プロジェクト開始時に型安全性が考慮されていない
**How to avoid:**
1. 型エラーをカテゴリ分け：Critical（実行時エラー）、High（型安全性）、Medium（改善推奨）
2. Criticalから順に修正、各修正でテストを追加
3. `@ts-ignore`は一時的な回避にのみ使用、必ずTODOコメントを添付
**Warning signs:** `any`型の出現頻度、キャスト`as`の乱用

### Pitfall 2: 大規模JSONファイルのバンドルによるアプリサイズ増加
**What goes wrong:** 72KBのJSONファイルがJavaScriptバンドルに含まれ、アプリサイズが増加
**Why it happens:** `import`で直接JSONを読み込むとMetroがバンドルに含める
**How to avoid:**
1. `viral-characters.ts` → `viral-characters.json`に変換（型定義は別ファイル）
2. `expo-asset`を使用して動的読み込み
3. 読み込みタイミングを初期化時から必要時まで遅延
**Warning signs:** 初期バンドルサイズが急激に増加、アプリ起動が遅い

### Pitfall 3: テストなしでのリファクタリング
**What goes wrong:** 型修正中に既存機能を破壊する
**Why it happens:** 「型を直すだけ」と甘く見る
**How to avoid:**
1. 既存コードのテストを先に記述（Characterization Test）
2. リファクタリング前に「成功するテスト」があることを確認
3. 1つの変更につき1つのテスト、即座に実行
**Warning signs:** 変更のたびに手動で動作確認、本番環境でのみ発覚するバグ

### Pitfall 4: ESLint設定の不適切な構成
**What goes wrong:** 開発環境とCI環境でLint結果が異なる
**Why it happens:** ローカル設定とプロジェクト設定の不一致
**How to avoid:**
1. `eslint.config.js`（Flat config）または`.eslintrc.js`をプロジェクトルートに配置
2. `npx expo lint`で公式設定を使用
3. VS CodeのESLint拡張をインストール、エディタ設定を統一
**Warning signs:** `npm run lint`とエディタ表示のエラーが異なる

## Code Examples

Verified patterns from official sources:

### TypeScript Strict Mode Configuration
```typescript
// Source: https://docs.expo.dev/guides/typescript/
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true  // 既に有効化済み
  }
}
```

### Jest Setup for Expo
```javascript
// Source: https://docs.expo.dev/develop/unit-testing/
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/types/**"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Jest Setup File
```javascript
// Source: https://docs.expo.dev/develop/unit-testing/
// jest.setup.js
import '@testing-library/jest-native/extend-expect';

// Mock native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

### ESLint Flat Config (Expo SDK 53+)
```javascript
// Source: https://docs.expo.dev/guides/using-eslint/
// eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'coverage/*'],
  },
]);
```

### Testing React Native Components
```typescript
// Source: https://oneuptime.com/blog/post/2026-01-15-react-native-jest-testing/view
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct title', () => {
    render(<Button title="Click me" onPress={jest.fn()} />);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    render(<Button title="Submit" onPress={mockOnPress} />);

    fireEvent.press(screen.getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

### Loading Large JSON Assets
```typescript
// Source: Research from Expo asset bundling best practices
import { Asset } from 'expo-asset';
import ViralCharacterData from './types/ViralCharacterData';

let cachedData: ViralCharacterData | null = null;

export async function loadViralCharacters(): Promise<ViralCharacterData> {
  if (cachedData) {
    return cachedData;
  }

  const asset = Asset.fromModule(require('../assets/data/viral-characters.json'));
  await asset.downloadAsync();

  const response = await fetch(asset.localUri!);
  cachedData = await response.json();

  return cachedData;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@types/react` v18 | v19 | 2025 | React 19対応、新しい型定義 |
| AsyncStorage直接使用 | MMKV推奨 | 2024-2025 | 10倍高速だが移行コスト要検討 |
| ESLint legacy config | Flat config | Expo SDK 53+ (2024) | 新規プロジェクトではFlat config推奨 |
| react-test-renderer | @testing-library/react-native | 2024-2025 | React 19非対応、RNTLが標準 |
| 静的import JSON | 動的asset読み込み | 2024-2025 | 大規模データのバンドルサイズ削減 |

**Deprecated/outdated:**
- `react-test-renderer`: React 19をサポートしない。@testing-library/react-nativeに移行済み
- `@typescript-eslint/eslint-plugin`: ESLint 9 + Flat configでは異なる設定が必要
- Hermes無効なビルド: 2024年以降、Hermesはデフォルトで有効、30%バンドル削減

## Open Questions

Things that couldn't be fully resolved:

1. **viral-characters.tsの最適な外部化方法**
   - What we know: 静的アセットとして分離可能、動的読み込みでバンドル削減
   - What's unclear: Expoでの最適なキャッシュ戦略、初回読み込み時のUX影響
   - Recommendation: `expo-asset` + メモリキャッシュで実装、ローディングUIを追加

2. **AsyncStorageのスキーマ移行戦略**
   - What we know: schema.tsでバージョニング実装済み
   - What's unclear: 既存ユーザーデータの移行テスト方法、ロールバック計画
   - Recommendation: 既存スキーマを尊重しつつ、新しい型定義を導入。移行スクリプトを作成して検証

3. **テストカバレッジの適正値**
   - What we know: 80%設定済みだが、テストファイルが存在しない
   - What's unclear: ビジネスロジックとUIコンポーネントの別々のカバレッジ目標
   - Recommendation: ビジネスロジック90%、UIコンポーネント70%から開始、徐々に引き上げ

## Sources

### Primary (HIGH confidence)
- [Expo TypeScript Guide](https://docs.expo.dev/guides/typescript/) - Official Expo TypeScript configuration guide (Updated: November 2025)
- [Expo ESLint Guide](https://docs.expo.dev/guides/using-eslint/) - Official Expo ESLint setup (Updated: October 2025)
- [Expo Unit Testing Guide](https://docs.expo.dev/develop/unit-testing/) - Official Jest + jest-expo setup (Updated: July 2025)
- [React Native TypeScript Docs](https://reactnative.dev/docs/typescript) - Official React Native TypeScript guide (Updated: December 2025)
- Current project state: `tsconfig.json`, `jest.config.js`, `package.json`

### Secondary (MEDIUM confidence)
- [React Native Bundle Size Guide](https://oneuptime.com/blog/post/2026-01-15-react-native-bundle-size/view) - Comprehensive optimization strategies (Published: January 2026)
- [React Native Jest Testing Guide](https://oneuptime.com/blog/post/2026-01-15-react-native-jest-testing/view) - Modern testing patterns (Published: January 2026)
- [Expo Performance Best Practices](https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps) - Official performance optimization (Published: April 2025)
- [MMKV Migration Guide](https://github.com/mrousavy/react-native-mmkv/blob/main/docs/MIGRATE_FROM_ASYNC_STORAGE.md) - AsyncStorage to MMKV migration
- [Large JSON Issue #18365](https://github.com/expo/expo/issues/18365) - Real-world case of 5.8MB JSON causing crashes

### Tertiary (LOW confidence)
- [Expo Router v3 Bundle Splitting](https://expo.dev/changelog/2024-01-23-router-3) - Bundle splitting in Expo Router (January 2024)
- [Dynamic Import Issue #27902](https://github.com/expo/expo/issues/27902) - Expo dynamic import challenges (March 2024)
- [Stop Using AsyncStorage](https://medium.com/@nomanakram1999/stop-using-asyncstorage-in-react-native-mmkv-is-10x-faster-82485a108c25) - MMKV advocacy article (December 2025)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Expo/React Native documentation、現在のプロジェクト状態を確認
- Architecture: HIGH - 公式ドキュメント、2026年のベストプラクティス記事に基づく
- Pitfalls: MEDIUM - 公式ドキュメント + 実際のプロジェクトの型エラー分析、一部は一般的な経験則
- Testing strategy: HIGH - Expo公式ユニットテストガイド、最新のJest設定

**Research date:** 2026-01-23
**Valid until:** 2026-02-22 (30日間 - Expo SDK 54は安定、React Native 0.81-0.83はマイナーアップデートのみ)
