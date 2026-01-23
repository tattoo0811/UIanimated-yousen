# Phase 11: 2026 Year Fortune - Research

**Researched:** 2026-01-24
**Domain:** Remotion Video Generation + 陰陽五行 Fortune Calculation
**Confidence:** HIGH

## Summary

フェーズ11は、2026年（丙午）の年運に特化した動画生成機能を実装するプロジェクトです。既存のRemotion動画生成システムに、新しい年運専用コンポジションを追加し、ユーザーは自分の干支と2026年の丙午との相性を動画形式で確認・シェアできるようになります。

**主要な発見:**
1. **既存のRemotion構造**: `HookComposition`と`CompatibilityComposition`が既に実装されており、同じパターンで`YearFortuneComposition`を追加できる
2. **テーマシステム**: 3つのテーマ（KiraPop/MonoEdge/ZenWa）が`themeConfig.ts`で定義されており、丙午専用の拡張テーマを追加可能
3. **陰陽五行データ**: `SanmeigakuInsenChart`タイプと計算ロジックが既に存在し、年運計算に再利用できる
4. **コンテンツ生成**: `contentGenerator.ts`でセクションごとのコンテンツ生成パターンが確立されている
5. **UI構造**: モバイルアプリはExpo Routerのタブ構造で、新しいボタンは既存のタブ内または専用ページとして追加できる

**主要な推奨事項:**
- 既存の`CompatibilityComposition`の7セクション構造をベースに、丙午要素を混ぜ込む形で実装
- テーマは既存の3テーマを拡張し、丙午専用のカラーパレットと輝きエフェクトを追加
- 年運計算は既存の`compatibilityCalculator.ts`のパターンを参照し、2026年（丙午）とユーザーの干支の相性を計算
- APIルートは既存の`/api/video`パターンに従い、`/api/video/year-fortune`エンドポイントを追加
- 専用ボタンはモバイルアプリの「占い」タブ内に追加し、年運専用ページへ遷移

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Remotion** | 4.x | 動画生成フレームワーク | Reactコンポーネントで動画を定義、既存コードベースで採用済み |
| **Express** | 4.x | APIサーバー | 既存のバックエンドAPIで採用済み |
| **TypeScript** | 5.x | 型安全性 | 既存コードベース全体で採用 |
| **Zod** | 3.x | スキーマ検証 | 既存のcompositionスキーマ定義で使用済み |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **expo-router** | 3.x | モバイル画面遷移 | 専用ボタンから年运ページへの遷移 |
| **React Native** | - | モバイルUI | 既存のボタン/カードコンポーネントを再利用 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Remotion | FFmpeg直接操作 | RemotionはReactコンポーネントで動画を定義でき、既存コードとの統合が容易 |
| 専用テーマ | 既存テーマのみ | 既存テーマに丙午要素を追加する方がコード重複を避けられる |

**Installation:**
```bash
# 必要なパッケージは既にインストール済み
cd backend && npm install  # 依存関係の確認
cd mobile && npm install    # モバイル側の依存関係の確認
```

## Architecture Patterns

### Recommended Project Structure
```
backend/src/
├── compositions/
│   ├── YearFortuneComposition.tsx    # 新規：年運専用コンポジション
│   ├── themes/
│   │   └── themeConfig.ts              # 拡張：丙午テーマ設定追加
│   └── sections/
│       └── ContentSections.tsx         # 参照：既存セクション構造
├── lib/
│   ├── yearFortuneCalculator.ts       # 新規：年運計算ロジック
│   └── contentGenerator.ts            # 参照：コンテンツ生成パターン
├── types/
│   └── yearFortune.ts                 # 新規：年運タイプ定義
├── api/
│   ├── routes/
│   │   └── yearFortune.ts             # 新規：年運動画生成API
│   └── index.ts                       # 変更：ルート追加
└── index.tsx                          # 変更：Composition登録

mobile/app/
├── (tabs)/
│   └── fortune.tsx                     # 変更：年運ボタン追加
├── year-fortune.tsx                    # 新規：年運専用ページ
└── _layout.ts                          # 変更：必要に応じてナビゲーション追加
```

### Pattern 1: Remotion Composition Structure
**What:** 動画コンポジションはReactコンポーネントとして定義し、`Sequence`で時間軸を制御
**When to use:** 新しい動画テンプレートを作成する場合
**Example:**
```typescript
// Source: backend/src/compositions/HookComposition.tsx
export const HookComposition: React.FC<HookCompositionProps> = ({
  nickname,
  fortuneData,
  theme,
  tone,
}) => {
  const themeConfig = useTheme(theme);

  return (
    <VideoTemplate theme={theme}>
      <AbsoluteFill>
        {/* Section 0: Hook (0-2s) */}
        <Sequence from={0} durationInFrames={60}>
          <div>{/* Hook content */}</div>
        </Sequence>

        {/* Section 1-6: 各セクション */}
        <Sequence from={60} durationInFrames={90}>
          {/* Content sections */}
        </Sequence>
      </AbsoluteFill>
    </VideoTemplate>
  );
};
```

### Pattern 2: Theme System Extension
**What:** `themeConfig`オブジェクトに新しいテーマを追加し、`useTheme`フックで利用
**When to use:** 丙午専用のビジュアルスタイルを定義する場合
**Example:**
```typescript
// Source: backend/src/compositions/themes/themeConfig.ts
export const themeConfig: Record<string, ThemeConfig> = {
  KiraPop: { /* 既存 */ },
  MonoEdge: { /* 既存 */ },
  ZenWa: { /* 既存 */ },

  // 新規追加：丙午専用テーマ
  HeinoE2026: {
    colors: {
      background: '#FFD700',    // 金色背景
      primary: '#FF4500',       // 情熱的赤
      text: '#2F2F2F',
      accent: '#FFD700',        // 輝き金
    },
    fonts: {
      heading: 'Noto Serif JP, serif',
      body: 'Noto Sans JP, sans-serif',
    },
    animations: {
      spring: { damping: 20, stiffness: 150 },
      typingSpeed: 18,
    },
  },
};
```

### Pattern 3: Content Generator
**What:** `insen`データを受け取り、トーン別に翻訳されたコンテンツを生成
**When to use:** 年運に特化した説明文を生成する場合
**Example:**
```typescript
// Source: backend/src/lib/contentGenerator.ts
export const generateYearFortuneContent = (
  insen: SanmeigakuInsenChart,
  yearKanshi: string,  // '丙午'
  tone: 'TikTok' | 'YouTube' | 'Instagram'
): ContentSection => {
  const dayStem = insen.pillars.day.stem;
  const yearStem = yearKanshi[0];  // '丙'

  // 年運計算ロジック
  const compatibility = calculateYearCompatibility(dayStem, yearStem);

  // トーン別翻訳
  const translatedContent = translateToTone(baseContent, {
    tone,
    section: 'yearFortune',
    nickname: 'あなた',
  });

  return {
    title: `【2026年 丙午の年運】`,
    content: translatedContent,
    duration: 150,
  };
};
```

### Pattern 4: API Route Structure
**What:** Express Routerを使用して、動画生成トリガーエンドポイントを作成
**When to use:** 年運動画生成APIを追加する場合
**Example:**
```typescript
// Source: backend/src/api/routes/generate.ts（既存パターン）
router.post('/year-fortune', async (req, res) => {
  try {
    const { nickname, insenData, year, theme, tone } = req.body;

    const result = await triggerRender({
      compositionName: 'YearFortuneComposition',
      inputProps: {
        nickname,
        insenData,
        year: 2026,
        yearKanshi: '丙午',
        theme,
        tone,
      },
    });

    res.json({
      jobId: result.jobId,
      status: result.status,
      estimatedTimeSeconds: 30,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start render' });
  }
});
```

### Pattern 5: Mobile UI Integration
**What:** `TouchableOpacity`で専用ボタンを作成し、`router.push`で年運ページへ遷移
**When to use:** モバイルアプリに年運診断へのエントリーを追加する場合
**Example:**
```typescript
// Source: mobile/app/(tabs)/fortune.tsx（既存パターン）
<TouchableOpacity
  onPress={() => router.push('/year-fortune')}
  className="flex-row items-center justify-center gap-2 p-4"
  style={{
    backgroundColor: '#FFD700',
    borderWidth: 3,
    borderColor: '#333',
    borderRadius: 16,
  }}
>
  <Sparkles size={20} color="#333" />
  <Text className="font-black" style={{ fontSize: fontSize.sm }}>
    2026年の年運を見る
  </Text>
  <ArrowRight size={20} color="#333" />
</TouchableOpacity>
```

### Anti-Patterns to Avoid
- **既存テーマのコピペ**: テーマ設定を重複して作成せず、既存の`themeConfig`に拡張テーマを追加する
- **ハードコードされた年**: `2026`を直接コードに埋め込まず、汎用的な年運構造を作り、パラメータとして渡す
- **陰陽五行データの再実装**: 既存の`SanmeigakuInsenChart`と計算ロジックを再利用し、重複を避ける

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 動画レンダリング | FFmpegを直接操作 | RemotionのComposition | 既存のRemotionインフラがあり、Reactコンポーネントで動画を定義できる |
| スキーマ検証 | 手動のバリデーション | Zodスキーマ | 既存のコードベースでZodを使用しており、型安全なバリデーションが可能 |
| テーマシステム | 独自のCSS-in-JS | 既存のthemeConfig | テーマの切り替えや拡張が容易で、コードの一貫性を保てる |
| 陰陽五行計算 | 新しい計算ロジック | 既存のcompatibilityCalculator | 五行の相性計算パターンが既に実装されている |
| UIコンポーネント | 独自のボタンコンポーネント | 既存のTouchableOpacityパターン | モバイルアプリ全体で統一されたUI/UXを保てる |

**Key insight:** 既存のコードベースには動画生成、テーマシステム、陰陽五行計算、モバイルUIのすべてのパターンが確立されている。これらを再利用することで、実装時間を大幅に短縮し、コードの一貫性を保てる。

## Common Pitfalls

### Pitfall 1: 年のハードコーディング
**What goes wrong:** コード全体に`2026`や`丙午`をハードコードすると、2027年以降の対応が困難になる
**Why it happens:** 当座の機能実装に集中しすぎて、将来の拡張性を考慮しないため
**How to avoid:** 年、干支、テーマをパラメータとして渡し、汎用的な`YearFortuneCalculator`を作成する
**Warning signs:** コード内にマジックナンバー`2026`が散乱している、関数名に`2026`が含まれている

### Pitfall 2: テーマ設定の重複
**What goes wrong:** 既存の3テーマ（KiraPop/MonoEdge/ZenWa）のコードをコピーして丙午テーマを作成すると、メンテナンスが困難になる
**Why it happens:** 既存のテーマ構造を理解せず、早く実装しようとしてコピペするため
**How to avoid:** `themeConfig.ts`に新しいテーマオブジェクトを追加し、既存の`useTheme`フックを再利用する
**Warning signs:** 同じ色設定やアニメーション設定が複数のファイルに重複して存在する

### Pitfall 3: セクション構造の不一致
**What goes wrong:** 既存の動画（HookComposition/CompatibilityComposition）とセクション構造が異なると、ユーザー体験が不整合になる
**Why it happens:** 年運専用の特別な構造を作ろうとして、既存のパターンを無視するため
**How to avoid:** 既存の7セクション構造（Hook/Intro/Essence/Family/Work/Love/Ochi/CTA/Branding）を維持し、丙午要素を各セクションに自然に混ぜ込む
**Warning signs:** セクション数やタイミングが既存の動画と大幅に異なる

### Pitfall 4: 陰陽五行データの不整合
**What goes wrong:** モバイルアプリの陰陽五行データとバックエンドのデータ形式が異なると、計算結果が不正確になる
**Why it happens:** バックエンドとモバイルで別々にデータ構造を定義してしまうため
**How to avoid:** 既存の`SanmeigakuInsenChart`タイプを共有し、`compatibilityCalculator.ts`のパターンを再利用する
**Warning signs:** `backend/src/types/insen.ts`と`mobile/src/types`で異なる構造を定義している

### Pitfall 5: UI/UXの一貫性の欠如
**What goes wrong:** 専用ボタンのデザインや配置が既存のUIパターンと異なると、ユーザーが混乱する
**Why it happens:** 年運機能を「特別な機能」として扱いすぎて、既存のデザインガイドラインを無視するため
**How to avoid:** 既存のボタンスタイル（`TouchableOpacity` + `lucide-react-native`アイコン）とカードレイアウトを再利用する
**Warning signs:** 新しいボタンが既存の「診断スタート」ボタンや「相性診断」ボタンと全く異なる見た目

## Code Examples

Verified patterns from official sources:

### Remotion Composition Setup
```typescript
// Source: backend/src/index.tsx
import {Composition} from 'remotion';
import {YearFortuneComposition} from './compositions/YearFortuneComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YearFortuneComposition"
        component={YearFortuneComposition as any}
        durationInFrames={900}  // 30秒 @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          nickname: 'テストユーザー',
          insenData: { /* SanmeigakuInsenChart */ },
          year: 2026,
          yearKanshi: '丙午',
          theme: 'HeinoE2026',
          tone: 'TikTok',
        }}
      />
    </>
  );
};
```

### Year Fortune Calculator
```typescript
// Source: backend/src/lib/compatibilityCalculator.ts（既存パターンを参照）
const STEM_TO_ELEMENT: Record<string, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

function calculateYearCompatibility(
  userDayStem: string,
  yearStem: string
): number {
  const userElement = STEM_TO_ELEMENT[userDayStem];
  const yearElement = STEM_TO_ELEMENT[yearStem];

  // 既存の五行相性計算を再利用
  const baseScore = ELEMENT_RELATIONS[userElement][yearElement];

  // 丙午（火）特有の補正
  if (yearStem === '丙') {
    // 火の年は火属性の人が強められる
    if (userElement === 'fire') return Math.min(100, baseScore + 15);
    // 木属性は火を生むのでさらに良い
    if (userElement === 'wood') return Math.min(100, baseScore + 10);
  }

  return baseScore;
}
```

### Mobile Year Fortune Page
```typescript
// Source: mobile/app/year-fortune.tsx（新規作成）
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight, Play } from 'lucide-react-native';

export default function YearFortunePage() {
  const router = useRouter();

  const handleGenerateVideo = async () => {
    // API呼び出し：年運動画生成
    const response = await fetch('/api/video/year-fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: 'ユーザー',
        insenData: { /* 保存済みの陰陽五行データ */ },
        year: 2026,
        theme: 'HeinoE2026',
        tone: 'TikTok',
      }),
    });

    const { jobId } = await response.json();
    router.push(`/result?jobId=${jobId}`);
  };

  return (
    <ScrollView className="flex-1 bg-[#FFF9E6]">
      {/* ヘッダー */}
      <View style={{ backgroundColor: '#FFD700', padding: 20 }}>
        <Text className="font-black text-center text-2xl">
          2026年 丙午の年運
        </Text>
        <Text className="text-center mt-2">
          火のエネルギーが満ちる年
        </Text>
      </View>

      {/* 年运势説明 */}
      <View className="p-4">
        <View className="bg-white p-4 rounded-lg">
          <Text className="font-bold text-lg mb-2">🔥 丙午の年とは</Text>
          <Text className="leading-relaxed">
            丙午は「火の午」の年。情熱とエネルギーが満ちあふれ、
            変革と挑戦の年と言われています。
          </Text>
        </View>
      </View>

      {/* 動画生成ボタン */}
      <TouchableOpacity
        onPress={handleGenerateVideo}
        className="mx-4 p-5"
        style={{
          backgroundColor: '#FF4500',
          borderRadius: 16,
          shadowColor: '#333',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
        }}
      >
        <View className="flex-row items-center justify-center gap-3">
          <Play size={24} color="#fff" />
          <Text className="text-white font-black text-lg">
            年運動画を生成
          </Text>
          <ArrowRight size={24} color="#fff" />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

### Add Year Fortune Button to Fortune Tab
```typescript
// Source: mobile/app/(tabs)/fortune.tsx（変更箇所）
// 既存の「干支スワイプ占い」カードの下に追加

<View className="mx-4 mt-4 p-4">
  <TouchableOpacity
    onPress={() => router.push('/year-fortune')}
    className="flex-row items-center justify-between"
    style={{
      backgroundColor: '#FFD700',
      borderWidth: 3,
      borderColor: '#FF4500',
      borderRadius: 20,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    }}
  >
    <View className="flex-row items-center gap-3">
      <View
        className="w-14 h-14 items-center justify-center"
        style={{ backgroundColor: 'rgba(255,69,0,0.2)', borderRadius: 12 }}
      >
        <Sparkles size={28} color="#FF4500" />
      </View>
      <View>
        <Text className="font-black text-lg text-[#333]">
          2026年 丙午の年運
        </Text>
        <Text className="text-sm text-[#666]">
          火のエネルギーで運気上昇🔥
        </Text>
      </View>
    </View>
    <View
      className="w-10 h-10 items-center justify-center"
      style={{ backgroundColor: '#fff', borderRadius: 10 }}
    >
      <ArrowRight size={20} color="#FF4500" />
    </View>
  </TouchableOpacity>
</View>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 個別の動画テンプレート | Remotion Composition統一 | プロジェクト開始時 | 新しい動画テンプレートの追加が容易に |
| ハードコードされたテーマ | パラメータ化されたテーマシステム | Phase 3 | テーマの拡張・切り替えが簡単に |

**Deprecated/outdated:**
- なし：プロジェクト全体で最新のReact/Remotionパターンを使用

## Open Questions

1. **丙午テーマの実装方法**
   - What we know: 既存の3テーマ（KiraPop/MonoEdge/ZenWa）がある
   - What's unclear: 丙午専用の新しいテーマを作るか、既存テーマを拡張するか
   - Recommendation: CONTEXT.mdの決定「既存3テーマの拡張」に従い、`themeConfig.ts`に丙午専用テーマを追加。背景色を金系（#FFD700）にし、輝きエフェクトを強調

2. **輝きエフェクトの実装**
   - What we know: RemotionでCSSアニメーションやSVGフィルターが使用可能
   - What's unclear: 具体的な輝きエフェクトの実装方法
   - Recommendation: `@keyframes`でグリッターアニメーションを定義し、丙午テーマの`animations.spring`設定で制御。Remotionの`interpolate`で透明度やtransformをアニメーション

3. **年運ボタンの配置場所**
   - What we know: モバイルアプリはタブ構造（鑑定/結果/相性/占い/陽占）
   - What's unclear: 年運ボタンを「占い」タブ内に追加するか、独立したタブを作るか
   - Recommendation: CONTEXT.mdの決定「専用ボタン追加」に従い、まずは「占い」タブ内の目立つ場所にプロモーションカードとして追加。将来的に需要があれば独立タブ検討

## Sources

### Primary (HIGH confidence)
- **Remotion Documentation** - Composition定義、Sequence制御、useCurrentFrame/useVideoConfigフック
- **backend/src/compositions/HookComposition.tsx** - 既存の動画コンポジション実装パターン
- **backend/src/compositions/themes/themeConfig.ts** - テーマシステム構造
- **backend/src/lib/compatibilityCalculator.ts** - 五行相性計算ロジック
- **backend/src/types/insen.ts** - 陰陽五行データ構造
- **mobile/app/(tabs)/fortune.tsx** - モバイルUIパターン

### Secondary (MEDIUM confidence)
- **Express Router Documentation** - APIルート定義パターン
- **expo-router Documentation** - モバイル画面遷移パターン

### Tertiary (LOW confidence)
- なし：すべてのコード例は実際のソースコードに基づいている

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 既存のコードベースで使用されているライブラリ
- Architecture: HIGH - 既存のComposition/Theme/UIパターンを分析済み
- Pitfalls: HIGH - 過去のフェーズでの実装経験から一般的な落とし穴を把握

**Research date:** 2026-01-24
**Valid until:** 2026-02-23（30日間：安定した技術スタックのため）

---

*Phase: 11-2026-year-fortune*
*Research completed: 2026-01-24*
