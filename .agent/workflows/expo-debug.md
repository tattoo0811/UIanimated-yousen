---
description: Debug and fix common Expo Router and React Native errors
---

# Expo Router & React Native デバッグワークフロー

このワークフローは、Expo RouterやReact Nativeでよくあるエラーの診断と修正手順を記載しています。

---

## 1. "Couldn't find a navigation context" エラー

### 原因
- `useRouter()` や `useNavigation()` がナビゲーションコンテキスト外で呼び出されている
- `_layout.tsx` の設定が不正
- Metro のキャッシュが古い

### 診断手順
1. `app/` ディレクトリ内のすべてのスクリーンファイルを確認
2. `_layout.tsx` で `Stack.Screen` が正しく定義されているか確認
3. 手動インポート（`import XScreen from './x'`）がないか grep で検索

### 修正手順
1. `_layout.tsx` から不要な `ThemeProvider` や `NavigationContainer` を削除（Expo Router が内部で管理）
2. すべてのスクリーンを `Stack.Screen` に登録
3. `useRouter()` をコンポーネント内に限定（トップレベルで呼ばない）
4. キャッシュクリアして再起動:
```bash
// turbo
cd mobile && npx expo start -c
```

---

## 2. Babel エラー: ".plugins is not a valid Plugin property"

### 原因
- NativeWind v4 の Babel 設定が誤っている

### 修正手順
1. `babel.config.js` を修正:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ]
  };
};
```

2. `metro.config.js` を作成:
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

3. キャッシュクリアして再起動

---

## 3. Reanimated の警告: "accessing shared value during render"

### 原因
- `useSharedValue` の値をレンダリング中に直接参照している

### 修正手順
1. `useAnimatedStyle` 内でのみ shared value にアクセス
2. レンダリング中の直接参照を避ける

---

## 4. Metro バンドルエラー

### 診断手順
1. ログでエラーファイルを特定
2. 構文エラーや未解決のインポートを確認

### 修正手順
// turbo
```bash
cd mobile && rm -rf node_modules/.cache && npx expo start -c
```

---

## 5. NativeWind スタイルが適用されない

### 確認項目
1. `global.css` に Tailwind ディレクティブがあるか
2. `_layout.tsx` で `import '../global.css'` しているか
3. `metro.config.js` が正しく設定されているか
4. `tailwind.config.js` の `content` パスが正しいか

---

## キャッシュクリアコマンド集

```bash
# Expo キャッシュクリア
// turbo
npx expo start -c

# Metro キャッシュクリア
// turbo
rm -rf node_modules/.cache

# 完全クリーンビルド
// turbo
rm -rf node_modules && npm install && npx expo start -c
```
