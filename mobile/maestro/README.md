# Maestro テストフロー

このディレクトリには、UIanimated モバイルアプリの Maestro E2E テストフローが含まれています。

## テストフロー一覧

### 基本フロー
- **01_basic_male_flow.yaml** - 男性ユーザーの基本的な誕生日入力フロー（1983年8月11日）
- **02_basic_female_flow.yaml** - 女性ユーザーの基本的な誕生日入力フロー（1990年5月20日）

### エッジケース
- **03_edge_dates_flow.yaml** - エッジケースの日付テスト（2000年1月1日）
- **04_leap_year_flow.yaml** - うるう年の処理テスト（2020年2月29日）

### ナビゲーション
- **05_navigation_test.yaml** - 戻るボタンのナビゲーション動作テスト

### 複数パターン
- **06_multiple_dates_flow.yaml** - 別の日付パターン（1984年12月2日）
- **07_recent_date_flow.yaml** - 比較的最近の日付（2018年3月21日）

### ストレステスト
- **08_stress_test.yaml** - 複数回の連続操作によるストレステスト

### レガシー
- **test_birth_date.yaml** - 元の基本テストフロー

## iOS での起動方法

### 前提条件
- Xcode がインストールされていること
- iOS シミュレーターまたは実機が利用可能であること
- Maestro CLI がインストールされていること

### アプリの起動

```bash
# mobile ディレクトリに移動
cd /Users/kitamuratatsuhiko/UIanimated/mobile

# iOS シミュレーターでアプリをビルド・起動
npm run ios

# または特定のデバイスを指定
npx expo run:ios --device "iPhone 15 Pro"
```

### 実機での起動

```bash
# 接続されているデバイスを確認
xcrun xctrace list devices

# 実機でビルド・起動
npx expo run:ios --device
```

## Maestro テストの実行方法

### 単一テストの実行

```bash
# 特定のテストフローを実行
maestro test maestro/01_basic_male_flow.yaml

# スクリーンショット付きで実行
maestro test --format junit maestro/01_basic_male_flow.yaml
```

### 全テストの実行

```bash
# maestro ディレクトリ内の全テストを実行
maestro test maestro/

# 特定のパターンのみ実行
maestro test maestro/0[1-3]*.yaml
```

### デバッグモード

```bash
# デバッグ情報を表示しながら実行
maestro test --debug maestro/01_basic_male_flow.yaml

# 階層情報を出力
maestro hierarchy > maestro_hierarchy.json
```

### 継続的インテグレーション

```bash
# CI 環境での実行（JUnit レポート生成）
maestro test --format junit --output maestro-results maestro/

# 並列実行（複数デバイス）
maestro test --parallel maestro/
```

## テストのカスタマイズ

各テストフローは YAML 形式で記述されており、以下の要素で構成されています：

- `appId`: アプリケーション ID（`com.anonymous.mobile`）
- `stopApp` / `launchApp`: アプリの停止・起動
- `tapOn`: 要素のタップ（ID または座標指定）
- `extendedWaitUntil`: 要素の表示待機
- `takeScreenshot`: スクリーンショットの取得

## トラブルシューティング

### アプリが起動しない場合

```bash
# ビルドキャッシュをクリア
npx expo start --clear

# iOS ビルドフォルダをクリア
rm -rf ios/build
```

### Maestro が要素を見つけられない場合

```bash
# 現在の画面階層を確認
maestro hierarchy

# スクリーンショットを撮って確認
maestro test --debug maestro/01_basic_male_flow.yaml
```

### シミュレーターの問題

```bash
# シミュレーターをリセット
xcrun simctl erase all

# 特定のシミュレーターをリセット
xcrun simctl erase "iPhone 15 Pro"
```

## ベストプラクティス

1. **テスト ID の使用**: UI 要素には必ず `testID` を設定する
2. **適切な待機時間**: `extendedWaitUntil` で要素の表示を確実に待つ
3. **スクリーンショット**: 各ステップでスクリーンショットを取得してデバッグを容易にする
4. **独立性**: 各テストは独立して実行可能にする（`stopApp` / `launchApp`）
5. **命名規則**: テストファイル名は内容が分かりやすい名前にする

## 参考リンク

- [Maestro 公式ドキュメント](https://maestro.mobile.dev/)
- [Expo iOS ビルドガイド](https://docs.expo.dev/guides/ios-developer-mode/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
