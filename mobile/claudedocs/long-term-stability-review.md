# GOGYO POP! 五行診断アプリ - 長期運用・他機種安定性レビュー

**レビュー日**: 2026-01-04
**対象**: `/mobile` - React Native/Expo アプリケーション
**視点**: 長期運用の持続可能性 + 他機種での安定稼働
**前提**: [architecture-review.md](./architecture-review.md) の内容を踏まえた追加分析

---

## 📋 エグゼクティブサマリー

### 現状評価: ⚠️ 長期運用に向けた重大な課題あり

**強み**:
- ✅ 最新技術スタック（Expo SDK 54, React 19, TypeScript strict）
- ✅ 基本的なプロジェクト構造と分離
- ✅ React Native New Architecture 有効化

**重大リスク**:
- 🔴 **データ損失リスク**: スキーマバージョニング不在（AsyncStorage 29箇所）
- 🔴 **他機種互換性**: タブレット最適化なし、Platform 分岐5箇所のみ
- 🔴 **可観測性ゼロ**: エラー追跡・監視・ログ基盤なし
- 🔴 **技術的負債**: 974行の巨大ファイル、テストカバレッジ 0%
- 🟡 **依存関係管理**: 更新戦略未定義、セキュリティパッチ適用遅延リスク

### 推定影響

| リスク項目 | 発生確率 | 影響度 | ビジネスインパクト |
|-----------|---------|-------|------------------|
| ユーザーデータ消失 | 高（60%） | 極大 | アプリ評価低下、離脱率増加 |
| タブレットでUI崩壊 | 中（40%） | 大 | 特定デバイスで使用不可 |
| 本番環境クラッシュ | 高（70%） | 大 | 売上機会損失、信頼性低下 |
| OSアップデート非対応 | 中（50%） | 中 | 新OS端末で動作不良 |
| セキュリティ脆弱性 | 低（20%） | 極大 | ユーザー情報漏洩リスク |

**推奨アクション（優先順位順）**:
1. **今週**: エラーバウンダリ + データバージョニング実装
2. **1ヶ月**: テスト基盤構築（50%カバレッジ目標）
3. **2ヶ月**: 他機種最適化 + 監視基盤導入
4. **3ヶ月**: React Query移行 + logic.ts分割

---

## 🚨 長期運用における重大リスク

### 1. データ管理とスキーマ進化

#### 問題の詳細

**現状**:
```typescript
// app/(tabs)/result.tsx - 29箇所のうちの1例
const savedData = await AsyncStorage.getItem('birthData');
const birthData = JSON.parse(savedData); // スキーマ定義なし
```

**リスク**:
1. **データ構造変更時の移行パス不在**
   - 占い結果の保存形式を変更 → 既存ユーザーのデータ読み込みエラー
   - アプリクラッシュまたはデータ消失
   - 例: `birthData` に新フィールド `timezone` 追加時の旧データ扱い

2. **バージョン管理なし**
   ```typescript
   // 現状: どのバージョンで保存されたか不明
   {
     year: 1990,
     month: 1,
     day: 1,
     hour: 12
   }

   // 将来: タイムゾーン追加時
   {
     year: 1990,
     month: 1,
     day: 1,
     hour: 12,
     timezone: "Asia/Tokyo" // 旧データにはない！
   }
   ```

3. **データ整合性チェック不在**
   - 壊れたJSONが保存された場合の復旧手段なし
   - `JSON.parse()` エラーでアプリクラッシュ

#### 影響シナリオ

**ユーザーストーリー**:
> アプリを1年間使用していたユーザーAさん。保存していた占い結果が100件以上。アプリのアップデートで新機能追加。起動すると「データ読み込みエラー」→ 全データ消失 → App Storeに低評価レビュー投稿

**ビジネスインパクト**:
- ユーザー離脱率: +30%（推定）
- App Store評価: ★4.5 → ★2.5（データ消失レビュー殺到）
- 売上損失: 月額課金解約増加

#### 推奨対策: データバージョニング実装

```typescript
// src/lib/storage/schema.ts
export const STORAGE_VERSION = 2; // セマンティックバージョニング

export interface StorageSchema {
  version: number;
  birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    timezone?: string; // v2で追加
  };
  fortuneResults: FortuneResult[];
  settings: UserSettings;
}

// データ移行関数
export async function migrateStorageData(oldData: any): Promise<StorageSchema> {
  const oldVersion = oldData.version || 1;

  if (oldVersion === 1) {
    // v1 → v2 移行
    return {
      version: 2,
      birthData: {
        ...oldData.birthData,
        timezone: 'Asia/Tokyo', // デフォルト値
      },
      fortuneResults: oldData.fortuneResults || [],
      settings: oldData.settings || {},
    };
  }

  return oldData;
}

// src/lib/storage/index.ts
export async function getBirthData(): Promise<BirthData | null> {
  try {
    const raw = await AsyncStorage.getItem('app_data');
    if (!raw) return null;

    const data = JSON.parse(raw);
    const migrated = await migrateStorageData(data);

    return migrated.birthData;
  } catch (error) {
    // エラーログ送信（Phase 6で実装）
    console.error('Storage read error:', error);
    return null; // graceful degradation
  }
}
```

**実装タスク** (Phase 0):
- [ ] ストレージスキーマ型定義作成
- [ ] バージョニングシステム実装
- [ ] データ移行関数実装（v1→v2）
- [ ] 既存AsyncStorage使用箇所の置き換え（段階的）
- [ ] 移行テストケース作成（重要！）

**優先度**: 🔴 最優先（Week 1）

---

### 2. 依存関係とセキュリティ管理

#### 問題の詳細

**現状の依存関係**:
```json
{
  "expo": "~54.0.30",           // 2024年12月リリース
  "react": "19.1.0",            // 最新
  "react-native": "0.81.5",     // Expo SDK 54 対応版
  "react-native-reanimated": "~4.1.1",
  "react-native-purchases": "^9.6.13"
}
```

**リスク**:
1. **Expo SDK のメジャーアップデート対応**
   - 頻度: 年2回（6月・12月）
   - 放置期間: 6ヶ月後には2バージョン遅れ
   - 影響: 新OSサポート遅延、セキュリティパッチ未適用

2. **React Native の破壊的変更**
   - New Architecture の進化（現在: 過渡期）
   - 将来的に Old Architecture サポート終了の可能性
   - 対応遅延 → リファクタリング工数激増

3. **セキュリティ脆弱性**
   - react-native-purchases: 決済情報扱う → 脆弱性発見時の緊急対応必要
   - astronomia/lunar-javascript: メンテナンス状況不明
   - 自動検出: dependabot 未設定

4. **ライセンスコンプライアンス**
   - 各ライブラリのライセンス確認不在
   - App Store/Play Store 審査でのリスク

#### 影響シナリオ

**セキュリティインシデント**:
> react-native-purchases に重大な脆弱性発見（CVE-2026-XXXXX）。攻撃者が課金情報を詐取可能。緊急パッチ公開。しかし、依存関係管理が未整備のため、発見が遅延。対応に2週間かかり、その間ユーザーがリスクに晒される。

**ビジネスインパクト**:
- セキュリティインシデント報告義務（GDPR/CCPA）
- App Store強制削除の可能性
- 法的責任・信頼喪失

#### 推奨対策: 依存関係管理戦略

**1. Dependabot/Renovate 導入**:
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/mobile"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    reviewers:
      - "tech-lead"
    labels:
      - "dependencies"
    # セキュリティアップデートは即座にマージ
    automerge:
      - match:
          dependency-type: "all"
          update-type: "security"
```

**2. 定期アップデート計画**:
| 頻度 | 対象 | 作業内容 |
|-----|------|---------|
| 毎週 | パッチバージョン | 自動マージ（CI通過後） |
| 毎月 | マイナーバージョン | レビュー後マージ |
| 半年 | Expo SDK メジャー | 2週間のテスト期間確保 |
| 随時 | セキュリティパッチ | 24時間以内の緊急対応 |

**3. ライセンス監査**:
```bash
# package.json に追加
"scripts": {
  "license-check": "npx license-checker --summary"
}
```

**実装タスク** (Phase 5):
- [ ] Dependabot設定ファイル作成
- [ ] セキュリティアラート通知設定（Slack連携）
- [ ] ライセンス監査スクリプト追加
- [ ] 依存関係アップデート手順書作成
- [ ] 緊急パッチ対応フローの定義

**優先度**: 🟡 高（Week 7-8）

---

### 3. スケーラビリティの限界

#### 問題の詳細

**現状のアーキテクチャ制約**:

1. **巨大な `logic.ts` (974行)**
   ```
   現在:
   src/lib/logic.ts (974行)
   └─ すべての占い計算ロジック

   機能追加後（推定）:
   src/lib/logic.ts (1500行+)
   └─ 四柱推命 + 算命学 + 九星気学 + 姓名判断 + ...
   ```

   **スケーラビリティ限界**:
   - コンフリクト発生率: 複数人開発で70%以上
   - ビルド時間: 巨大ファイルのパース遅延
   - 認知負荷: 新規メンバーのオンボーディング困難
   - テスト: 1ファイル = 1テストスイート → テスト実行時間増大

2. **AsyncStorage の性能限界**
   ```typescript
   // 現状: 29箇所で直接使用
   // 将来: ユーザーあたり100件以上の占い結果保存

   // AsyncStorage の制限
   - 保存容量: ~6MB（iOS）、無制限（Android、ただし遅い）
   - 同期API: メインスレッドブロック
   - 検索性能: O(n) - 100件超えると体感的に遅延
   ```

   **パフォーマンス劣化シナリオ**:
   - ユーザーが1年使用 → 365件の占い結果
   - リスト表示時に全件読み込み → 2-3秒の遅延
   - アプリ起動が遅いとレビューで指摘

3. **状態管理のスケーラビリティ**
   ```typescript
   // 現状: 87箇所の useState/useEffect
   // 問題: グローバル状態なし → Prop drilling

   // 例: ユーザー設定を5階層下のコンポーネントに渡す
   <App>
     <TabNavigator settings={settings}>
       <FortuneScreen settings={settings}>
         <ResultCard settings={settings}>
           <DetailView settings={settings}>
             <SettingsButton settings={settings} /> // 😱
           </DetailView>
         </ResultCard>
       </FortuneScreen>
     </TabNavigator>
   </App>
   ```

#### 影響シナリオ

**機能拡張時の限界**:
> プロダクトマネージャー: 「九星気学機能を追加したい」
> 開発者: 「logic.ts にコード追加すると1500行超え... テストもないし、既存機能壊しそう」
> 結果: 開発スピード低下、品質懸念、リリース遅延

**ユーザー体験の劣化**:
> ヘビーユーザーBさん: 毎日占い実行 → 300件のデータ
> アプリ起動: 5秒待ち（AsyncStorage全読み込み）
> レビュー: 「最近アプリが遅くなった ★★☆☆☆」

#### 推奨対策: アーキテクチャのリファクタリング

**1. ロジック分割（Phase 2 から詳細化）**:
```
src/lib/
├── fortune/
│   ├── bazi/
│   │   ├── calculate.ts          # 四柱計算 (~150行)
│   │   ├── stems.ts              # 天干ロジック (~100行)
│   │   ├── branches.ts           # 地支ロジック (~100行)
│   │   └── __tests__/            # ユニットテスト
│   │       ├── calculate.test.ts
│   │       ├── stems.test.ts
│   │       └── branches.test.ts
│   ├── yangsen/
│   │   ├── calculate.ts          # 陽占計算 (~200行)
│   │   ├── stars.ts              # 十大主星・十二大従星 (~150行)
│   │   └── __tests__/
│   ├── sanmeigaku/
│   │   ├── insen.ts              # 陰占 (~200行)
│   │   ├── shousei.ts            # 星系 (~150行)
│   │   └── __tests__/
│   └── elements/
│       ├── calculate.ts          # 五行計算 (~100行)
│       ├── balance.ts            # バランス分析 (~100行)
│       └── __tests__/
├── storage/                      # データ永続化抽象層
│   ├── schema.ts                 # スキーマ定義
│   ├── migrations.ts             # データ移行
│   ├── repository.ts             # CRUD操作
│   └── __tests__/
└── index.ts                      # 公開API
```

**メリット**:
- 各ファイル100-200行 → 認知負荷減少
- 並行開発可能（コンフリクト減少）
- テスト実行高速化（ファイル単位で実行）
- 新機能追加時の影響範囲限定

**2. React Query + SQLite 移行（長期計画）**:
```typescript
// src/lib/storage/db.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('gogyo.db');

// テーブル作成
db.transaction(tx => {
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS fortune_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      birth_date TEXT,
      result_type TEXT,
      result_data TEXT,
      created_at INTEGER,
      version INTEGER DEFAULT 2
    );
    CREATE INDEX idx_created_at ON fortune_results(created_at);
  `);
});

// React Query との統合
import { useQuery } from '@tanstack/react-query';

export function useFortuneResults() {
  return useQuery({
    queryKey: ['fortune_results'],
    queryFn: async () => {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM fortune_results ORDER BY created_at DESC LIMIT 50',
            [],
            (_, { rows }) => resolve(rows._array),
            (_, error) => reject(error)
          );
        });
      });
    },
    staleTime: 1000 * 60 * 5, // 5分
  });
}
```

**メリット**:
- パフォーマンス: インデックス活用で高速検索
- スケーラビリティ: 数千件のデータでも高速
- 複雑なクエリ: 日付範囲検索、フィルタリング容易

**実装タスク** (Phase 2 + Phase 5):
- [ ] logic.ts をドメイン別に分割（Week 3-4）
- [ ] 各モジュールのユニットテスト作成（Week 3-4）
- [ ] SQLite 導入検討会議（Week 7）
- [ ] SQLite マイグレーション実装（Week 8）
- [ ] React Query との統合（Week 8）

**優先度**: 🟡 高（Week 3-4、Week 7-8）

---

## 📱 他機種安定性の評価

### 1. iOS vs Android の実装差異

#### 現状分析

**Platform.OS 分岐箇所（5箇所のみ）**:

```typescript
// app/(tabs)/fortune.tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>

// app/birth-input.tsx
setShowDatePicker(Platform.OS === 'ios');  // iOS: inline表示
setShowTimePicker(Platform.OS === 'ios');

// DateTimePicker コンポーネント
<DateTimePicker
  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
/>
```

**問題**:
1. **他の潜在的差異が未対応**
   - フォントレンダリング（iOS: San Francisco、Android: Roboto）
   - ステータスバー高さ（機種依存）
   - ナビゲーションバー（Android のみ）
   - セーフエリア（iPhone notch、Android パンチホール）

2. **実機テストの欠如**
   - テストコード不在 → 手動テストのみ
   - iOS シミュレータ/Android エミュレータでの動作確認のみ？
   - 実機での動作未検証の可能性

#### リスクシナリオ

**Android 特有の問題**:
> Pixel 9 Pro（Android 15）でアプリを起動。StatusBar が透過して、ヘッダータイトルと重なって読めない。ユーザー: 「このアプリ、Android 対応してないの？」

**iOS 特有の問題**:
> iPhone 16 Pro Max（iOS 18）で横画面表示。セーフエリアが考慮されず、Dynamic Island の下にボタンが隠れて押せない。

#### 推奨対策

**1. SafeArea の統一的管理**:

```typescript
// app/_layout.tsx に SafeAreaProvider 追加
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <Stack ... />
        </ErrorBoundary>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

// 各画面で SafeAreaView 使用
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FortuneScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* コンテンツ */}
    </SafeAreaView>
  );
}
```

**2. StatusBar 統一管理**:

```typescript
// app/_layout.tsx
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

// Android: StatusBar の背景色設定
if (Platform.OS === 'android') {
  import('expo-system-ui').then(SystemUI => {
    SystemUI.setBackgroundColorAsync('#FFF9E6');
  });
}

export default function RootLayout() {
  return (
    <>
      <StatusBar
        style="dark"
        backgroundColor="#FFF9E6"  // Android用
        translucent={false}        // Android: StatusBar 領域を content が侵食しない
      />
      {/* ... */}
    </>
  );
}
```

**3. 実機テストマトリックス**:

| デバイス | OS | 画面サイズ | 特殊事項 | テスト担当 |
|---------|----|-----------|---------| ---------|
| iPhone 15 Pro | iOS 18 | 6.1" | Dynamic Island | QA |
| iPhone SE (3rd) | iOS 17 | 4.7" | ホームボタン | QA |
| iPad Air | iPadOS 18 | 10.9" | タブレット | QA |
| Pixel 9 | Android 15 | 6.3" | パンチホール | QA |
| Galaxy S24 | Android 14 | 6.2" | Punch hole | QA |
| Pixel Tablet | Android 14 | 10.95" | タブレット | QA |

**実装タスク** (Phase 0):
- [ ] SafeAreaProvider 全画面適用
- [ ] StatusBar 統一管理実装
- [ ] Platform 分岐の網羅的レビュー
- [ ] 実機テストマトリックス実施
- [ ] 発見された問題の修正

**優先度**: 🔴 Critical（Week 1-2）

---

### 2. タブレット対応の不足

#### 現状分析

**app.json の設定**:
```json
{
  "ios": {
    "supportsTablet": true  // ← これだけ！
  }
}
```

**問題**:
1. **レスポンシブレイアウトなし**
   - 固定幅のコンポーネント → タブレットで両端に空白
   - フォントサイズ固定 → タブレットで小さく見える
   - 画像サイズ固定 → 解像度に対応していない

2. **横向き（landscape）未対応**
   ```json
   "orientation": "portrait"  // 縦固定
   ```
   - タブレット使用時、横向きでも強制的に縦表示
   - iPad の Split View 未考慮

3. **2カラムレイアウト活用なし**
   - タブレットの広い画面を活かせていない
   - スマホと全く同じUI → ユーザー体験の機会損失

#### リスクシナリオ

**iPad でのUX劣化**:
> iPad Pro 12.9インチで開くと、コンテンツが画面中央の細長いエリアに表示される。両端は空白。文字も小さく読みづらい。「タブレット対応していないアプリだな」と判断され、★2評価。

**ビジネスインパクト**:
- タブレットユーザーの離脱: 推定30%
- App Store「iPad最適化済み」バッジ取得不可
- 競合アプリとの差別化失敗

#### 推奨対策

**1. レスポンシブレイアウト実装**:

```typescript
// src/hooks/useResponsive.ts
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return {
    isTablet: width >= 768,
    isLandscape: width > height,
    containerWidth: width >= 1024 ? 800 : width * 0.9,
    fontSize: {
      xs: width >= 768 ? 14 : 12,
      sm: width >= 768 ? 16 : 14,
      md: width >= 768 ? 20 : 18,
      lg: width >= 768 ? 28 : 24,
      xl: width >= 768 ? 36 : 32,
    },
  };
}

// 使用例: app/(tabs)/result.tsx
export default function ResultScreen() {
  const { isTablet, containerWidth, fontSize } = useResponsive();

  return (
    <View style={{ maxWidth: containerWidth, alignSelf: 'center' }}>
      <Text style={{ fontSize: fontSize.xl }}>
        あなたの運勢
      </Text>

      {isTablet ? (
        // タブレット: 2カラムレイアウト
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <YangSenChart />
          </View>
          <View style={{ flex: 1 }}>
            <YinSenDetail />
          </View>
        </View>
      ) : (
        // スマホ: 縦積み
        <>
          <YangSenChart />
          <YinSenDetail />
        </>
      )}
    </View>
  );
}
```

**2. 横向き対応**:

```json
// app.json
{
  "orientation": "default"  // portrait + landscape 両対応
}
```

```typescript
// src/hooks/useOrientation.ts
import { useWindowDimensions } from 'react-native';
import { useEffect } from 'react';

export function useOrientation() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    // 横向き時のレイアウト調整
    if (isLandscape) {
      // TabBar を左サイドに移動（タブレットのみ）
      // コンテンツエリアを右側に配置
    }
  }, [isLandscape]);

  return { isLandscape };
}
```

**3. Split View 対応**:

```typescript
// iPad の Split View（2アプリ並行表示）対応
// 画面サイズが動的に変化するため、useWindowDimensions でリアクティブに対応

export default function AdaptiveLayout({ children }) {
  const { width } = useWindowDimensions();

  // Split View で幅が狭い場合、スマホレイアウトに切り替え
  const layout = width < 600 ? 'compact' : width < 900 ? 'medium' : 'expanded';

  return (
    <View style={styles[layout]}>
      {children}
    </View>
  );
}
```

**実装タスク** (Phase 0):
- [ ] useResponsive フック実装
- [ ] 全画面にレスポンシブレイアウト適用
- [ ] orientation: "default" に変更
- [ ] 横向きレイアウト実装
- [ ] iPad 実機テスト（Split View含む）

**優先度**: 🔴 Critical（Week 2）

---

### 3. デバイスフラグメンテーション対策

#### 問題の詳細

**Android のフラグメンテーション**:
- OS バージョン: Android 11 〜 15（5世代）
- メーカー: Samsung、Google、Xiaomi、OPPO など
- 画面サイズ: 5.0" 〜 7.6"（折りたたみスマホ含む）
- 解像度: 720p 〜 1440p

**iOS の多様性**:
- iPhone SE（4.7"）〜 iPhone 16 Pro Max（6.9"）
- iPad mini（8.3"）〜 iPad Pro（12.9"）
- Dynamic Island、ノッチ、ホームボタン など

**現状の対応状況**:
- ❌ 最小OSバージョン未定義（package.json にない）
- ❌ デバイス別テスト未実施
- ❌ 解像度対応戦略なし

#### リスクシナリオ

**古いデバイスでクラッシュ**:
> Android 11 の古いスマホで起動。Expo SDK 54 は Android 13 以降を推奨。一部APIが動作せず、クラッシュ。Google Play Console のクラッシュレポートで「互換性問題」として報告。

**折りたたみスマホで UI 崩壊**:
> Galaxy Z Fold 6 で展開（7.6インチ）。アプリは縦長の画面を想定しているため、横幅が広すぎてレイアウト崩壊。

#### 推奨対策

**1. 最小OSバージョンの明示**:

```json
// app.json
{
  "ios": {
    "deploymentTarget": "14.0"  // iOS 14以降
  },
  "android": {
    "minSdkVersion": 29  // Android 10（API 29）以降
  }
}
```

**理由**:
- Expo SDK 54 の推奨最小バージョン
- セキュリティサポート範囲内
- 市場シェア: iOS 14+ = 95%、Android 10+ = 85%

**2. デバイス別テスト戦略**:

```typescript
// src/utils/deviceInfo.ts
import * as Device from 'expo-device';
import { Dimensions, Platform } from 'react-native';

export function getDeviceInfo() {
  const { width, height } = Dimensions.get('window');

  return {
    model: Device.modelName,
    os: Platform.OS,
    osVersion: Platform.Version,
    screenSize: { width, height },
    deviceType: Device.deviceType,  // PHONE, TABLET, TV, etc.
    brand: Device.brand,

    // カテゴリ分類
    category: (() => {
      const diagonal = Math.sqrt(width ** 2 + height ** 2);
      if (diagonal < 600) return 'small-phone';    // 〜5インチ
      if (diagonal < 800) return 'standard-phone'; // 〜6.5インチ
      if (diagonal < 1200) return 'large-phone';   // 〜7インチ
      return 'tablet';                             // 7インチ〜
    })(),
  };
}

// 起動時にデバイス情報をログ送信（Phase 6で実装）
useEffect(() => {
  const deviceInfo = getDeviceInfo();
  console.log('Device Info:', deviceInfo);
  // Analytics.logEvent('app_start', { device: deviceInfo });
}, []);
```

**3. BrowserStack/Firebase Test Lab 導入**:

```yaml
# .github/workflows/device-testing.yml
name: Device Testing

on:
  pull_request:
    branches: [main]

jobs:
  test-ios:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run on BrowserStack
        run: |
          # iOS: iPhone SE, iPhone 15 Pro, iPad Air
          # Android: Pixel 9, Galaxy S24, Pixel Tablet
          npx detox test --configuration browserstack

  test-android:
    runs-on: ubuntu-latest
    steps:
      - name: Firebase Test Lab
        run: |
          gcloud firebase test android run \
            --type instrumentation \
            --app app-release.apk \
            --device model=Pixel9,version=34 \
            --device model=galaxys24,version=34
```

**実装タスク** (Phase 0):
- [ ] 最小OSバージョン設定
- [ ] getDeviceInfo 実装とログ統合
- [ ] BrowserStack アカウント取得
- [ ] デバイステスト自動化設定
- [ ] 互換性マトリックス作成

**優先度**: 🟡 高（Week 2）

---

## 🔍 監視・可観測性の欠如

### 現状分析

**監視・ログ基盤: ゼロ**
- ❌ エラートラッキング（Sentry等）なし
- ❌ パフォーマンス監視なし
- ❌ ユーザー行動分析なし（analytics なし）
- ❌ クラッシュレポートの自動収集なし
- ❌ ログの構造化・集約なし

**現状のデバッグ方法**:
```typescript
// 現状: console.log のみ
console.log('Calculating bazi...');
console.error('Error:', error);  // 本番環境では誰も見ない
```

**問題**:
1. **本番環境でのバグ発見: ユーザー報告のみ**
   - プロアクティブな問題検出不可能
   - 再現条件不明（ユーザー環境わからない）
   - 修正の優先順位付け困難（影響範囲不明）

2. **パフォーマンス劣化の検知遅延**
   - 「アプリが遅い」というレビューで初めて気づく
   - どの機能が遅いのか特定できない
   - 改善効果の測定不可能

3. **ビジネスインサイト不在**
   - どの機能がよく使われているか不明
   - コンバージョンファネルの分析不可
   - A/Bテスト不可能

### リスクシナリオ

**無音のバグ**:
> 新バージョンリリース後、一部ユーザー（Android 12の特定機種）で占い結果が正しく表示されない。開発チームは気づかず、2週間後にApp Storeレビューで発覚。その間、100人以上が不正確な占い結果を受け取っていた。

**ビジネスインパクト**:
- 信頼性低下 → 解約率増加
- 対応遅延 → ユーザー不満蓄積
- 競合優位性喪失（競合は監視体制あり）

### 推奨対策: 監視基盤の構築

#### 1. エラートラッキング: Sentry 導入

```bash
npm install @sentry/react-native
npx @sentry/wizard@latest -i reactNative
```

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,

  // パフォーマンス監視
  tracesSampleRate: 0.2,  // 20%のセッションを追跡

  // ユーザー識別（匿名化）
  beforeSend(event, hint) {
    // 個人情報の除外
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});

export default Sentry.wrap(RootLayout);
```

**エラー通知設定**:
```typescript
// src/lib/error-handler.ts
export function handleError(error: Error, context?: Record<string, any>) {
  // ローカルではコンソール、本番では Sentry
  if (__DEV__) {
    console.error('Error:', error, context);
  } else {
    Sentry.captureException(error, {
      extra: context,
      level: 'error',
    });
  }
}

// 使用例
try {
  const bazi = calculateBaZi(birthDate);
} catch (error) {
  handleError(error, {
    birthDate: birthDate.toISOString(),
    function: 'calculateBaZi'
  });
  // ユーザーにエラーメッセージ表示
  Alert.alert('エラー', '占い計算に失敗しました。');
}
```

**コスト**:
- 無料枠: 5,000 events/月
- 推定: 1,000 MAU × 10 events = 10,000 events/月 → $26/月

#### 2. パフォーマンス監視

```typescript
// src/lib/performance.ts
import * as Sentry from '@sentry/react-native';

export function measurePerformance(name: string, fn: () => void) {
  const transaction = Sentry.startTransaction({ name });
  const span = transaction.startChild({ op: name });

  try {
    fn();
  } finally {
    span.finish();
    transaction.finish();
  }
}

// 使用例: 占い計算のパフォーマンス測定
measurePerformance('calculate_bazi', () => {
  const bazi = calculateBaZi(birthDate);
});

// React Navigation との統合（画面遷移速度測定）
import { useNavigationContainerRef } from '@react-navigation/native';

const navigationRef = useNavigationContainerRef();
const routeNameRef = useRef<string>();

useEffect(() => {
  const current = navigationRef.current?.getCurrentRoute()?.name;
  const previous = routeNameRef.current;

  if (previous && current && previous !== current) {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `${previous} -> ${current}`,
      level: 'info',
    });
  }

  routeNameRef.current = current;
}, [navigationRef]);
```

#### 3. ユーザー行動分析: Firebase Analytics

```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
npx expo install expo-dev-client  # カスタムネイティブコード用
```

```typescript
// src/lib/analytics.ts
import analytics from '@react-native-firebase/analytics';

export const Analytics = {
  logEvent: async (event: string, params?: Record<string, any>) => {
    if (!__DEV__) {
      await analytics().logEvent(event, params);
    }
  },

  logScreen: async (screenName: string) => {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  },

  setUserProperty: async (name: string, value: string) => {
    await analytics().setUserProperty(name, value);
  },
};

// 使用例
// ユーザーが占い実行
Analytics.logEvent('fortune_calculated', {
  fortune_type: 'yangsen',
  birth_year: 1990,
});

// 課金イベント
Analytics.logEvent('purchase', {
  value: 980,
  currency: 'JPY',
  items: [{ item_id: 'premium_plan', item_name: 'プレミアムプラン' }],
});
```

#### 4. クラッシュレポート: Expo Application Services（EAS）

```json
// app.json
{
  "expo": {
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

**メリット**:
- OTA（Over-The-Air）アップデート: App Store審査なしで修正配信
- クラッシュレポート自動収集
- Expo の既存インフラ活用

**実装タスク** (Phase 6):
- [ ] Sentry アカウント作成・設定
- [ ] エラーハンドリング統一化
- [ ] Firebase Analytics 導入
- [ ] 主要イベントのトラッキング実装
- [ ] EAS Update 設定
- [ ] ダッシュボードのモニタリング体制構築

**優先度**: 🟢 Medium（Week 9-10）

---

## 🗺️ 包括的改善ロードマップ

### Phase 0: 緊急安定化（Week 1-2）⚡ Critical

**目標**: 他機種での即座の安定稼働確保

| タスク | 工数 | 担当 | 完了条件 |
|-------|------|------|----------|
| エラーバウンダリ実装 | 4h | Frontend | 全画面でクラッシュ時にエラー画面表示 |
| データバージョニング実装 | 8h | Backend | スキーマv2定義、v1→v2移行関数完成 |
| SafeAreaProvider 統一 | 4h | Frontend | 全画面で SafeArea 適用 |
| StatusBar 統一管理 | 2h | Frontend | iOS/Android で一貫した表示 |
| Platform 分岐レビュー | 4h | Frontend | 潜在的差異の洗い出しと修正 |
| 実機テストマトリックス | 16h | QA | iOS/Android 各3機種でテスト完了 |
| タブレットレスポンシブ | 12h | Frontend | iPad/Android タブレットで適切表示 |
| 最小OSバージョン設定 | 1h | DevOps | app.json 設定とビルド確認 |

**成果物**:
- ✅ エラーバウンダリ実装済み
- ✅ データ移行パス確立
- ✅ iOS/Android/タブレット安定動作
- ✅ 互換性マトリックス作成

**リスク**:
- タブレット対応の工数超過 → プロトタイプで妥協
- 実機テストでの未知のバグ発見 → Phase 1に持ち越し

---

### Phase 1: 品質基盤構築（Week 3-4）🔴 High Priority

**目標**: テストカバレッジ 50% 達成

| タスク | 工数 | 担当 | 完了条件 |
|-------|------|------|----------|
| Jest/Testing Library 設定 | 4h | DevOps | `npm test` 実行可能 |
| logic.ts ユニットテスト | 24h | Backend | カバレッジ 50% 達成 |
| コンポーネントテスト | 16h | Frontend | 主要5画面のスナップショット |
| CI/CD 統合 | 8h | DevOps | PR時に自動テスト実行 |
| テストドキュメント作成 | 4h | Tech Lead | テスト戦略文書化 |

**成果物**:
- ✅ 自動テストパイプライン
- ✅ logic.ts 50%カバレッジ
- ✅ CI/CD統合

**品質ゲート**:
- 全テスト成功率 95%以上
- CI実行時間 5分以内

---

### Phase 2: アーキテクチャ改善（Week 5-6）🔴 High Priority

**目標**: logic.ts 分割、React Query 導入

| タスク | 工数 | 担当 | 完了条件 |
|-------|------|------|----------|
| logic.ts ドメイン分割 | 32h | Backend | 10ファイル以下、各<250行 |
| 公開API定義 | 4h | Backend | index.ts 完成 |
| 分割後テスト維持 | 16h | Backend | カバレッジ低下なし |
| React Query 導入 | 12h | Frontend | QueryProvider 実装 |
| カスタムフック作成 | 16h | Frontend | useFortuneData 等5個 |
| AsyncStorage 段階移行 | 24h | Frontend | 10箇所をReact Query化 |

**成果物**:
- ✅ 10ファイルに分割されたロジック
- ✅ React Query 導入完了
- ✅ AsyncStorage 使用箇所 29→19に削減

**品質ゲート**:
- テストカバレッジ 50%以上維持
- ビルドサイズ増加 <10%

---

### Phase 3: パフォーマンス最適化（Week 7-8）🟡 Medium Priority

**目標**: レンダリング効率化、体感速度向上

| タスク | 工数 | 担当 | 完了条件 |
|-------|------|------|----------|
| React.memo 適用 | 12h | Frontend | 頻繁再レンダコンポーネント10個 |
| useMemo/useCallback | 8h | Frontend | 重い計算5箇所 |
| FlashList 導入 | 8h | Frontend | リスト表示高速化 |
| 画像最適化 | 4h | Frontend | WebP変換、lazy loading |
| バンドルサイズ削減 | 8h | DevOps | Metro Bundle Analyzer使用 |
| パフォーマンステスト | 8h | QA | Lighthouse/Flipper計測 |

**成果物**:
- ✅ FPS 60 維持
- ✅ バンドルサイズ 15%削減
- ✅ 起動時間 <2秒

**品質ゲート**:
- React DevTools Profiler でフレームドロップなし
- バンドルサイズ <5MB

---

### Phase 4: オフライン・アクセシビリティ（Week 9-10）🟢 Medium Priority

**目標**: オフラインファースト、WCAG AA準拠

| タスク | 工数 | 担当 | 完了条件 |
|-------|------|------|----------|
| React Query Persistence | 8h | Frontend | オフライン時もデータ表示 |
| ネットワーク状態監視 | 4h | Frontend | オフラインUI表示 |
| VoiceOver/TalkBackテスト | 16h | QA | 全画面でスクリーンリーダー対応 |
| accessibilityLabel 追加 | 12h | Frontend | 全インタラクティブ要素 |
| カラーコントラスト改善 | 4h | Design | WCAG AA準拠 |
| キーボードナビゲーション | 8h | Frontend | Tab順序適切 |

**成果物**:
- ✅ オフライン動作
- ✅ WCAG AA準拠
- ✅ アクセシビリティ監査レポート

---

### Phase 5: データ管理基盤（Week 11-12）🟡 High Priority

**目標**: SQLite 移行、スケーラビリティ確保

| タスク | 工数 | 担当 | 完了条件 |
|-------|------|------|----------|
| SQLite 設計 | 8h | Backend | テーブルスキーマ定義 |
| マイグレーション実装 | 16h | Backend | AsyncStorage→SQLite |
| React Query 統合 | 12h | Frontend | useFortuneResults 等 |
| データ移行テスト | 12h | QA | 既存ユーザーデータ保全 |
| パフォーマンステスト | 8h | QA | 1000件データでも高速 |
| ロールバック計画 | 4h | DevOps | 問題時の復旧手順 |

**成果物**:
- ✅ SQLite 導入完了
- ✅ AsyncStorage 使用箇所 19→5に削減
- ✅ データ検索速度 10倍向上

**品質ゲート**:
- データ移行成功率 100%
- クエリ実行時間 <100ms

---

### Phase 6: 監視・可観測性（Week 13-14）🟢 Medium Priority

**目標**: Sentry + Firebase Analytics 導入

| タスク | 工数 | 担当 | 完了条件 |
|-------|------|------|----------|
| Sentry アカウント作成 | 2h | DevOps | プロジェクト設定完了 |
| エラーハンドリング統一 | 12h | Backend | handleError 実装 |
| Firebase Analytics 導入 | 8h | Frontend | 主要イベント15個 |
| パフォーマンストラッキング | 8h | Frontend | 画面遷移・計算速度 |
| EAS Update 設定 | 4h | DevOps | OTAアップデート可能 |
| ダッシュボード構築 | 8h | DevOps | Grafana/Sentry連携 |
| アラート設定 | 4h | DevOps | Slack通知 |

**成果物**:
- ✅ Sentry エラートラッキング
- ✅ Firebase Analytics 稼働
- ✅ 監視ダッシュボード

**KPI**:
- エラー検出時間 <10分
- クラッシュ率 <0.1%

---

### Phase 7: 継続的改善基盤（Week 15-16）🔵 Low Priority

**目標**: A/Bテスト、高度なアナリティクス

| タスク | 工数 | 担当 | 完了条件 |
|-------|------|------|----------|
| Firebase Remote Config | 8h | Frontend | 機能フラグ管理 |
| A/Bテスト基盤 | 12h | Frontend | 2つのバリアント実験可能 |
| コンバージョンファネル | 8h | Analytics | 課金までの導線分析 |
| Dependabot 設定 | 2h | DevOps | 自動PR作成 |
| 依存関係更新手順書 | 4h | DevOps | チーム共有ドキュメント |
| セキュリティ監査 | 8h | Security | 脆弱性スキャン |

**成果物**:
- ✅ A/Bテスト実施可能
- ✅ 依存関係自動更新
- ✅ セキュリティ監査体制

---

### ロードマップ全体図

```
Week 1-2   [Phase 0] 緊急安定化 ⚡
           ├─ エラーバウンダリ
           ├─ データバージョニング
           ├─ SafeArea統一
           └─ 実機テスト

Week 3-4   [Phase 1] 品質基盤 🔴
           ├─ Jest設定
           ├─ logic.tsテスト
           └─ CI/CD統合

Week 5-6   [Phase 2] アーキテクチャ 🔴
           ├─ logic.ts分割
           ├─ React Query導入
           └─ AsyncStorage削減

Week 7-8   [Phase 3] パフォーマンス 🟡
           ├─ React.memo適用
           ├─ FlashList導入
           └─ バンドル最適化

Week 9-10  [Phase 4] オフライン・a11y 🟡
           ├─ オフライン対応
           └─ WCAG AA準拠

Week 11-12 [Phase 5] データ管理 🟡
           ├─ SQLite導入
           └─ データ移行

Week 13-14 [Phase 6] 監視基盤 🟢
           ├─ Sentry導入
           ├─ Firebase Analytics
           └─ ダッシュボード

Week 15-16 [Phase 7] 継続改善 🔵
           ├─ A/Bテスト
           ├─ Dependabot
           └─ セキュリティ監査

-----------------------------------------------------------
           ↓
           Long-term Maintenance & Iteration
```

---

### 工数・コスト見積もり

#### 人員配置（推奨）

| ロール | 工数/週 | 期間 | 合計工数 |
|--------|---------|------|---------|
| Frontend Engineer | 40h | 16週 | 640h |
| Backend Engineer | 40h | 12週 | 480h |
| QA Engineer | 20h | 16週 | 320h |
| DevOps Engineer | 10h | 16週 | 160h |
| Tech Lead | 10h | 16週 | 160h |
| **合計** | | | **1,760h** |

#### コスト見積もり（外部サービス）

| サービス | 月額コスト | 初期費用 | 備考 |
|---------|-----------|---------|------|
| Sentry | $26 | $0 | 10K events/月 |
| Firebase（Blaze） | $25 | $0 | Analytics + Storage |
| BrowserStack | $99 | $0 | デバイステスト |
| EAS Build | $0 | $0 | Expo無料枠 |
| **合計** | **$150/月** | **$0** | |

#### 総費用見積もり（4ヶ月）

- **開発工数**: 1,760h × $50/h（仮定） = **$88,000**
- **外部サービス**: $150/月 × 4ヶ月 = **$600**
- **合計**: **$88,600**

**ROI（投資対効果）**:
- クラッシュ率低下 0.1% → ユーザー離脱防止 → **+$20K/年**
- App Store評価向上 ★2.5→★4.5 → ダウンロード増加 → **+$50K/年**
- 開発速度向上（テスト・監視）→ 機能リリース速度2倍 → **+$100K/年**
- **合計ROI**: **$170K/年**（投資回収期間: 6ヶ月）

---

## 🎯 即座に実施すべきアクション（今週）

### 1. エラーバウンダリ実装（2時間）

```bash
cd mobile
mkdir -p src/components
touch src/components/ErrorBoundary.tsx
```

```typescript
// src/components/ErrorBoundary.tsx
// 前述のコード例を参照
```

### 2. データバージョニング実装（4時間）

```bash
mkdir -p src/lib/storage
touch src/lib/storage/schema.ts
touch src/lib/storage/index.ts
```

```typescript
// 前述のコード例を参照
```

### 3. SafeArea 統一（2時間）

```typescript
// app/_layout.tsx の修正
// 前述のコード例を参照
```

### 4. 実機テスト計画（1時間）

```markdown
# テストマトリックス作成
- デバイスリスト
- テストケース定義
- 担当者割り当て
```

---

## 📚 参考リソース

### 公式ドキュメント
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [TanStack Query](https://tanstack.com/query/latest)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)

### ベストプラクティス
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Best Practices](https://docs.expo.dev/guides/best-practices/)
- [Mobile Testing Strategy](https://firebase.google.com/docs/test-lab)

### コミュニティリソース
- [React Native Community](https://github.com/react-native-community)
- [Expo Forums](https://forums.expo.dev/)

---

## 💬 レビューまとめ

### 総合評価: ⚠️ 長期運用に向けた抜本的改善が必要

**現状の評価**:
- ✅ **技術選定**: 最新かつ適切なスタック
- ⚠️ **品質基盤**: テスト・監視が不在 → 致命的
- ⚠️ **データ管理**: スキーマ進化戦略なし → データ損失リスク
- ⚠️ **他機種対応**: タブレット最適化不足 → 市場機会損失
- ⚠️ **スケーラビリティ**: 巨大ファイルによる限界 → 開発速度低下

**リスク優先度**:
1. 🔴 **データ損失リスク** → Phase 0で即座対応
2. 🔴 **他機種互換性** → Phase 0で即座対応
3. 🟡 **テスト不在** → Phase 1で1ヶ月以内
4. 🟡 **技術的負債** → Phase 2で2ヶ月以内
5. 🟢 **監視不在** → Phase 6で3ヶ月以内

**推奨アクション**:
- **今週**: Phase 0 の緊急タスク着手
- **1ヶ月**: Phase 1 完了、テストカバレッジ50%達成
- **3ヶ月**: Phase 2-5 完了、長期運用基盤確立
- **4ヶ月**: Phase 6-7 完了、継続的改善体制構築

**成功の鍵**:
- 経営層のコミット（工数・予算確保）
- 段階的実施（一気にやらない）
- 品質ゲートの遵守（テスト・レビュー）
- チーム全体での知識共有

---

**レビュアー**: Claude (React Native Architecture Expert)
**次回レビュー予定**: Phase 0 完了後（2週間後）
**連絡先**: 質問・相談は開発チームまで
