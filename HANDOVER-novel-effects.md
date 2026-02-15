# 小説リーダー・後半エフェクト 引継書（部分）

> 本ドキュメントは HANDOVER の部分要素として利用。メインの HANDOVER-*.md に「以下を追記」形式で組み込むか、参照用に残す。

---

## 小説専用エフェクト（後半）

### 概要
`/novel/read/[slug]` で、エピソードによってスクロール後半に専用エフェクトを表示する仕組み。

| 項目 | 内容 |
|------|------|
| 対象ルート | `/novel/read/ep1`, `/novel/read/ep2` 等 |
| 設定ファイル | `src/lib/episode-effects-config.ts` |
| 実装 | `src/components/novel/NovelReader.tsx` |
| エフェクト部品 | `src/components/SplashCursor.jsx` |

---

### 現在の動作（第1話 ep1）

1. **前半（スクロール 0〜50%）**
   - 背景: 黒（`#000000`）
   - 黒オーバーレイ: 不透明（opacity 1）
   - 効果なし

2. **後半（スクロール 50%超）**
   - SplashCursor（流体シミュレーション）が有効化
   - 黒オーバーレイ: ほぼ透明（opacity 0.03）
   - マウス／タッチ（スワイプ）で流体が反応

3. **モバイル**
   - スワイプスクロール中も `window` の `touchmove` で SplashCursor が動作
   - `pointer-events: none` のためスクロールは通常どおり

---

### 設定（episode-effects-config.ts）

```ts
export interface EpisodeEffectConfig {
  effectTriggerScrollRatio?: number;  // 0-1. この割合超えでエフェクトON
  useSplashCursor?: boolean;
  splashCursorBackColor?: { r: number; g: number; b: number };
  initialBackground?: 'default' | 'solid';
  initialBackgroundColor?: string;
  scrollRevealBackgroundColor?: string;  // 未使用（停止済）
  scrollRevealTextColor?: string;        // 未使用（停止済）
}

// ep1 現在値
ep1: {
  effectTriggerScrollRatio: 0.5,
  useSplashCursor: true,
  splashCursorBackColor: { r: 0, g: 0, b: 0 },
  initialBackground: 'solid',
  initialBackgroundColor: '#000000',
}
```

---

### 他エピソード・海の回について

| エピソード | 背景 | 後半エフェクト |
|------------|------|----------------|
| ep1 | 黒 | SplashCursor（途中から） |
| ep2〜, jin-sui-demo 以外 | 海（WaterShaderBackground） | 黒オーバーレイのスクロールフェードのみ |
| jin-sui-demo | 専用（JinSuiDemoReader） | 壬子・海シェーダー |

**今後の想定**
- 海がテーマの話: `WaterShaderBackground` をベースにした別レンダー
- 話ごとに `EPISODE_EFFECTS` に設定を追加してエフェクトを切り替え

---

### SplashCursor 導入元・プロパティ

- **パッケージ**: `@react-bits/SplashCursor-JS-CSS`
- **配置**: `src/components/SplashCursor.jsx`
- **主なプロパティ**: `SIM_RESOLUTION`, `DYE_RESOLUTION`, `DENSITY_DISSIPATION`, `VELOCITY_DISSIPATION`, `PRESSURE`, `CURL`, `SPLAT_RADIUS`, `SPLAT_FORCE`, `COLOR_UPDATE_SPEED`, `BACK_COLOR`（現状は黒背景で未使用）

---

### トラブルシューティング

| 現象 | 確認ポイント |
|------|--------------|
| エフェクトが動かない | `effectTriggerScrollRatio` 超えているか、`useSplashCursor` が true か |
| モバイルで反応しない | SplashCursor は `window` の touch イベントを使用。`pointer-events: none` が有効か |
| 背景が緑などになる | `scrollRevealBackgroundColor` が設定されていないか確認（現在は使用停止） |
