# 処方箋機能実装レポート

## 実装概要

Expoアプリに処方箋（Shohousen）機能を統合しました。HTMLデザインをベースにReact Nativeで実装し、60干支すべての処方箋データを表示できるようにしました。

## 実装内容

### 1. データ構造

#### データファイル
- **`/mobile/src/data/prescriptions-all-60.json`**
  - 60干支すべての処方箋データ
  - 各干支に以下の情報を含む:
    - 病名・サブタイトル
    - 症状リスト
    - 処方（仕事・恋愛・家族）
    - 副作用
    - 禁忌

#### 型定義 (`prescriptions.types.ts`)
```typescript
interface PrescriptionData {
  cardId: string;
  number: number;
  kanshi: string;
  characterName: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  diseaseName: string;
  diseaseSubtitle: string;
  symptoms: string[];
  prescriptionWork: string;
  prescriptionLove: string;
  prescriptionFamily: string;
  dosage: string;
  sideEffects: string[];
  contraindications: string[];
}
```

#### ヘルパー関数 (`prescriptions-helper.ts`)
- `getPrescriptionByKanshi(kanshi)`: 干支から処方箋を取得
- `getCategoryContent(prescription, category)`: カテゴリ別コンテンツを取得
- `getAllPrescriptions()`: 全処方箋を取得
- `getPrescriptionsByElement(element)`: 元素別処方箋を取得

### 2. 画面構造

#### ルート設定
- **パス**: `/app/shohousen/[kanshi].tsx`
- **パラメータ**: `kanshi` (干支, 例: "甲子")
- **ナビゲーション**: 結果画面から遷移

#### 画面構成
1. **ヘッダー**
   - 戻るボタン
   - タイトル「人生処方箋」
   - チャプター表示「第壱話」

2. **ドクターヘッダー** (`PrescriptionDoctor`)
   - ドクターイメージ（👩‍⚕️）
   - セリフ吹き出し
   - ドクター名表示

3. **処方箋カード** (`PrescriptionCard`)
   - Rxスタンプ
   - 干支・元素表示
   - 病名
   - 症状リスト
   - 処方内容
   - 用法（朝・昼・夜）
   - 副作用
   - 禁忌
   - ドクター印鑑「巡」

4. **タブバー** (`PrescriptionTabBar`)
   - 総合運
   - 恋愛運
   - 星の処方箋
   - タブ切り替えで内容が動的に変更

5. **ボトムボタン**
   - もう一度診断
   - シェアする

### 3. コンポーネント実装

#### PrescriptionCard.tsx
- スクロール可能な処方箋カード
- Reanimatedアニメーション（FadeIn）
- 元素別カラースキーム
- ドクター印鑑の回転エフェクト

#### PrescriptionDoctor.tsx
- 吹き出し付きドクターコメント
- グラデーション背景
- アニメーション効果

#### PrescriptionTabBar.tsx
- 3つのタブ（総合運・恋愛運・星の処方箋）
- アクティブタブのハイライト表示
- タブ切り替えアニメーション

#### PrescriptionHeader.tsx
- チャプターヘッダー表示
- 装飾ライン
- アニメーション効果

### 4. ナビゲーション統合

#### result.tsxへの変更
```typescript
// 追加ボタン
<TouchableOpacity
  onPress={() => router.push(`/shohousen/${kanshi}` as any)}
  className="flex-row items-center justify-center gap-2 bg-[#c41e3a] p-4"
  // ... styles
>
  <FileText size={20} color="#fff" />
  <Text className="font-bold text-white text-lg">人生処方箋</Text>
</TouchableOpacity>
```

### 5. 技術仕様

#### 使用技術
- **Expo Router**: ファイルベースルーティング
- **React Native Reanimated**: アニメーション
  - FadeInDown, FadeInUp, ZoomIn
- **Tailwind CSS (Nativewind)**: スタイリング
- **TypeScript**: 型安全な実装

#### デザイン要件
- 背景色: `#fafaf8` (和紙風)
- アクセントカラー: `#c41e3a` (朱色)
- ボーダー: 2-3px 黒枠
- シャドウ: オフセット付き
- フォント: Tamanegi (玉ねぎ楷書)

#### レスポンシブ対応
- `useResponsive` フック使用
- タブレット/モバイル対応
- コンテンツパディング調整

## ファイル構造

```
mobile/
├── app/
│   ├── shohousen/
│   │   └── [kanshi].tsx          # 処方箋画面ルート
│   └── result.tsx                 # 結果画面（遷移追加）
└── src/
    ├── components/
    │   └── prescriptions/
    │       ├── PrescriptionCard.tsx
    │       ├── PrescriptionDoctor.tsx
    │       ├── PrescriptionHeader.tsx
    │       └── PrescriptionTabBar.tsx
    └── data/
        ├── prescriptions-all-60.json
        ├── prescriptions.types.ts
        └── prescriptions-helper.ts
```

## 機能要件の達成

### ✅ 完了した機能
1. **処方箋画面のルート作成**: `/app/shohousen/[kanshi].tsx` 実装
2. **データ統合**: `prescriptions-all-60.json` をコピー
3. **型定義**: `prescriptions.types.ts` 作成
4. **ヘルパー関数**: `prescriptions-helper.ts` 実装
5. **コンポーネント実装**:
   - PrescriptionCard
   - PrescriptionDoctor
   - PrescriptionTabBar
   - PrescriptionHeader
6. **ナビゲーション**: result.tsxから処方箋画面への遷移実装
7. **アニメーション**: Reanimatedによるアニメーション効果
8. **タブ切り替え**: 総合運・恋愛運・星の処方箋
9. **レスポンシブ対応**: useResponsiveフック使用

### 🔧 今後の改善点
1. **シェア機能**: 現在console.logのみ、SNS連携が必要
2. **ドクター画像**: 現在Emoji、実際の画像に置き換え
3. **ルート型定義**: Expo Routerの自動生成待ち
4. **ユニットテスト**: コンポーネントテスト追加
5. **アクセシビリティ**: スクリーンリーダー対応

## データ例

### 甲子の処方箋
```json
{
  "cardId": "card-0",
  "number": 1,
  "kanshi": "甲子",
  "characterName": "水辺の賢者",
  "element": "wood",
  "diseaseName": "慢性・完璧という名の先延ばし芸人",
  "diseaseSubtitle": "脳内会議だけ年収1億の人",
  "symptoms": [
    "転職サイトを3年ブックマークしてるが、応募ボタンを押したことがない",
    "推しの感想を140字で30分推敲した結果「最高でした」で投稿",
    "「来月から本気出す」のカレンダーリマインドが18ヶ月連続で鳴っている",
    "旅行の計画は完璧。航空券の比較表まで作る。でも予約しない"
  ],
  "prescriptionWork": "「80点で出せ」を毎朝3回唱えろ。お前の100点、誰も待ってない。待ってるのは60点の提出物。",
  "prescriptionLove": "好きな人に「好き」って言え。3ヶ月以内。言い方とかタイミングとか考えてる間に相手は結婚する。",
  "prescriptionFamily": "実家に電話しろ。「元気？」の3文字でいい。完璧な近況報告を準備してるうちに親は老いる。",
  "sideEffects": [
    "突然の行動力に周囲が「え、どうした？」とざわつく",
    "意外と80点で褒められて、今までの100点主義がバカらしくなる"
  ],
  "contraindications": [
    "「まだ準備が」は禁句。準備は一生終わらない",
    "比較表作りは週1回まで。それ以上は逃避行為",
    "天中殺期間は決断力が鈍るので、普段の3倍速で動け"
  ]
}
```

## まとめ

処方箋機能の基本的な実装が完了しました。HTMLデザインをReact Nativeコンポーネントに変換し、60干支すべての処方箋データを表示できるようになりました。タブ切り替えでカテゴリ別の処方を表示でき、アニメーション効果でユーザー体験を向上させています。

次のステップとして、シェア機能の実装や実際のドクター画像の追加、ユニットテストの作成が推奨されます。

## 作成者情報
- 作成日: 2026-02-08
- 担当: Claude (AIアシスタント)
- ベースデザイン: screen-shohousen.html
