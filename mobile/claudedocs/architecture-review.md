# モバイル占いアプリ - アーキテクチャレビュー

**レビュー日**: 2026-01-04
**レビュー対象**: `/mobile` - GOGYO POP! 五行診断アプリ
**基準**: React Native Architecture Best Practices

---

## 📊 現状分析

### ✅ 良い点

#### 1. 技術スタック選定
- **Expo SDK 54** - 最新の安定版を使用
- **Expo Router 6** - ファイルベースルーティング採用
- **TypeScript strict mode** - 型安全性確保
- **NativeWind 4** - Tailwind CSSでスタイリング統一
- **React Native Reanimated 4** - 高性能アニメーション対応

#### 2. プロジェクト構造
```
mobile/
├── app/              # Expo Router screens (21 files)
│   ├── (tabs)/      # Tab navigation
│   └── fortune/     # Dynamic routes
├── src/
│   ├── components/  # UI components (14 files)
│   ├── lib/         # Business logic
│   ├── types/       # TypeScript types
│   ├── hooks/       # Custom hooks
│   └── utils/       # Utilities
```

#### 3. コンポーネント分離
- UIコンポーネントの適切な分離
- カスタムフックの使用
- 型定義の集約

---

## 🔴 重大な問題

### 1. テストコードが存在しない ⚠️⚠️⚠️

**問題**:
- `src/lib/logic.ts` (974行) に対してテストなし
- 複雑な占い計算ロジックが未検証
- リグレッションリスク極めて高い

**影響**:
- 本番環境でのバグ発生リスク: 極めて高い
- リファクタリング困難
- 継続的な品質保証不可能

**推奨対策**:
```typescript
// mobile/__tests__/lib/logic.test.ts
import { calculateBaZi, calculateYangSen } from '@/src/lib/logic';

describe('calculateBaZi', () => {
  it('should calculate correct four pillars for known date', () => {
    const date = new Date('1990-01-01T12:00:00');
    const result = calculateBaZi(date);
    expect(result.year.stemStr).toBe('己');
    expect(result.year.branchStr).toBe('巳');
  });
});
```

**優先度**: 🔴 最優先

---

### 2. 状態管理がAsyncStorageのみ ⚠️⚠️

**問題**:
- 29箇所でAsyncStorage直接使用
- React Query/TanStack Query未実装
- オフライン対応なし
- キャッシュ戦略なし

**影響**:
- データ整合性の問題
- パフォーマンス劣化
- ユーザー体験の低下

**推奨対策**:
```typescript
// src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 60 * 24, // 24時間
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
```

**優先度**: 🟡 高

---

### 3. 巨大なロジックファイル (974行) ⚠️⚠️

**問題**:
- `src/lib/logic.ts`に全ビジネスロジック集中
- Single Responsibility Principle違反
- テスト・メンテナンス困難

**影響**:
- 可読性低下
- 変更リスク増大
- 並行開発困難

**推奨対策**:
```
src/lib/
├── fortune/
│   ├── bazi/
│   │   ├── calculate.ts      # 四柱計算
│   │   ├── stems.ts          # 天干ロジック
│   │   └── branches.ts       # 地支ロジック
│   ├── yangsen/
│   │   ├── calculate.ts      # 陽占計算
│   │   └── stars.ts          # 十大主星・十二大従星
│   └── elements/
│       ├── calculate.ts      # 五行計算
│       └── balance.ts        # バランス分析
└── index.ts                  # 公開API
```

**優先度**: 🟡 高

---

### 4. エラーバウンダリ未実装 ⚠️

**問題**:
- アプリクラッシュ時の対応なし
- ユーザーフレンドリーなエラー表示なし

**推奨対策**:
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // ログ送信などの処理
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-[#FFF9E6] p-6">
          <Text className="text-4xl mb-4">😵</Text>
          <Text className="text-2xl font-black text-[#333] mb-2">
            エラーが発生しました
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            申し訳ございません。アプリを再起動してください。
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            className="bg-[#FB7185] px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">再試行</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

**app/_layout.tsx に適用**:
```typescript
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Stack ... />
      </ErrorBoundary>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
```

**優先度**: 🟡 高

---

### 5. パフォーマンス最適化なし ⚠️

**問題**:
- 87箇所のuseState/useEffect使用
- React.memo, useMemo, useCallback未使用
- 不要な再レンダリング発生リスク

**推奨対策**:
```typescript
// Before
function TabBarIcon({ icon: Icon, focused, color }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Icon size={24} color={focused ? '#333' : '#999'} />
    </View>
  );
}

// After
const TabBarIcon = React.memo(({ icon: Icon, focused, color }) => {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Icon size={24} color={focused ? '#333' : '#999'} />
    </View>
  );
});
```

```typescript
// 重い計算のメモ化
const yangSenResult = useMemo(() => {
  return calculateYangSen(bazi, birthDate);
}, [bazi, birthDate]);
```

**優先度**: 🟢 中

---

## 🔧 改善提案（優先度順）

### Phase 1: 品質基盤構築 (Week 1-2)

#### 1.1 テストインフラ構築
```bash
npm install --save-dev @testing-library/react-native jest-expo
```

**実装タスク**:
- [ ] Jest設定
- [ ] `logic.ts`の単体テスト（最低50%カバレッジ）
- [ ] コンポーネントのスナップショットテスト
- [ ] CI/CD統合

#### 1.2 エラーバウンダリ実装
- [ ] ErrorBoundaryコンポーネント作成
- [ ] ルートレイアウトに適用
- [ ] エラーログ送信機能（任意）

---

### Phase 2: アーキテクチャ改善 (Week 3-4)

#### 2.1 状態管理の現代化
```bash
npm install @tanstack/react-query @tanstack/query-async-storage-persister
```

**実装タスク**:
- [ ] QueryProvider作成
- [ ] カスタムフック作成（useFortuneData, useBirthData）
- [ ] AsyncStorage直接使用を段階的に置き換え

#### 2.2 ロジックファイルの分割
```
src/lib/logic.ts (974行)
↓ リファクタリング
src/lib/fortune/ (複数ファイル、各100-200行)
```

**実装タスク**:
- [ ] ドメイン別にファイル分割
- [ ] 公開APIの定義（index.ts）
- [ ] テストカバレッジ維持

---

### Phase 3: パフォーマンス最適化 (Week 5)

#### 3.1 レンダリング最適化
- [ ] React.memoの適用（頻繁に再レンダリングされるコンポーネント）
- [ ] useMemoの適用（重い計算処理）
- [ ] useCallbackの適用（子コンポーネントへのコールバック）

#### 3.2 リスト最適化
```bash
npm install @shopify/flash-list
```

- [ ] FlatListをFlashListに置き換え（該当箇所があれば）

---

### Phase 4: 追加機能（Week 6+）

#### 4.1 オフラインファースト
- [ ] React QueryのPersistence有効化
- [ ] ネットワーク状態監視
- [ ] オフライン時のUI表示

#### 4.2 アクセシビリティ
- [ ] VoiceOver/TalkBackテスト
- [ ] accessibilityLabel追加
- [ ] WCAG 2.1 AA準拠

#### 4.3 アナリティクス
```bash
npm install expo-firebase-analytics
```

---

## 📏 コード品質メトリクス

### 現状
| メトリクス | 現状 | 推奨値 | 評価 |
|----------|------|-------|------|
| テストカバレッジ | 0% | >70% | 🔴 |
| 最大ファイル行数 | 974行 | <300行 | 🔴 |
| TypeScript strictness | ✅ | ✅ | ✅ |
| コンポーネント数 | 14 | - | ✅ |
| AsyncStorage使用箇所 | 29 | <5 | 🔴 |
| エラーハンドリング | なし | あり | 🔴 |

### 目標（3ヶ月後）
| メトリクス | 目標値 |
|----------|--------|
| テストカバレッジ | >70% |
| 最大ファイル行数 | <300行 |
| AsyncStorage使用箇所 | <5箇所 |
| エラーバウンダリ | 実装済み |
| パフォーマンススコア | >80 |

---

## 🎯 即座に実施すべきアクション (今週)

### 1. テスト環境セットアップ (2時間)
```bash
cd mobile
npm install --save-dev @testing-library/react-native jest-expo
npx jest --init
```

### 2. クリティカルパスのテスト作成 (4時間)
- `calculateBaZi`関数のテスト
- `calculateYangSen`関数のテスト
- 最低10個のテストケース

### 3. エラーバウンダリ実装 (1時間)
- ErrorBoundaryコンポーネント作成
- app/_layout.tsxに適用

### 4. React Query導入検討会議 (1時間)
- チームでの合意形成
- 段階的移行計画の策定

---

## 📚 参考リソース

### 公式ドキュメント
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)

### ベストプラクティス
- [React Native Architecture Patterns](https://reactnative.dev/docs/next/the-new-architecture/why)
- [Testing React Native Apps](https://reactnative.dev/docs/testing-overview)
- [Expo Best Practices](https://docs.expo.dev/workflow/overview/)

---

## 💬 レビューまとめ

### 総合評価: ⚠️ 改善必要

**強み**:
- ✅ 最新のExpo/React Native技術スタック
- ✅ TypeScript strict mode有効
- ✅ 基本的なプロジェクト構造

**弱み**:
- 🔴 テストコード不在 → **最優先で対応**
- 🔴 状態管理の未成熟
- 🔴 巨大なロジックファイル
- 🔴 エラーハンドリング不足

**次のステップ**:
1. 今週中にテスト環境構築とエラーバウンダリ実装
2. 来週からReact Query導入とロジック分割開始
3. 1ヶ月以内にテストカバレッジ50%達成

---

**レビュアー**: Claude (React Native Architecture Expert)
**連絡先**: このドキュメントに関する質問は開発チームまで
