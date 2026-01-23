# 陰陽五行アプリ リニューアル

## What This Is

生年月日から陰陽五行に基づいた自分の強みのある方位を算出する占いアプリ。現在のUX（スクロールが多く、見にくい）を改善し、カード型のスクロールレスデザインと、TikTok風のUGC動画生成機能を追加して、シェアしたくなるバズる体験を提供する。

## Core Value

**わかりやすさ × 共感 × 笑い**: 専門用語をバズる言葉に翻訳し、自分の診断結果が動画でシェアしたくなる体験を提供する

## Requirements

### Validated

<!-- 既存機能で動作しているもの -->
- ✓ 四柱推命・陰陽五行の計算ロジック — existing
- ✓ 生年月日入力と診断結果の表示 — existing
- ✓ ローカルストレージでのデータ保存 — existing
- ✓ 通知機能 — existing
- ✓ Firebase Analytics/Crashlytics — existing

### Active

<!-- 今回実装する機能 -->
- [ ] スクロールレスなカード型UIデザイン
- [ ] 複数のデザインパターン提案機能
- [ ] TikTok風動画生成（Remotion使用）
  - ニックネーム入り診断動画
  - タイピングエフェクト
  - 自動生成画像プロンプト提供
  - 構成：本質 → 家族 → 仕事 → 恋愛 → オチ
- [ ] バズりやすい言葉への翻訳
  - TikTok風（短文、エモい、パンチライン）
  - YouTube風（ストーリーテリング）
  - Instagram風（ビジュアル重視）
- [ ] 専門的な占いインターフェース（カード2枚目以降）
- [ ] 動画シェア機能
  - 端末への保存
  - 各SNSアプリへの直接投稿
  - Webページリンクシェア

### Out of Scope

- リアルタイムチャット機能 — v1では動画生成で十分
- ユーザー間のソーシャル機能 — まずは個人診断に集中
- 動画のAI画像生成 — プリセット画像+プロンプト提供で対応

## Context

**既存コードベースの状態:**
- React Native + Expo Router構成
- 四柱推命計算ロジックは `mobile/src/lib/logic/` に実装済み
- `viral-characters.ts` に10,000行以上のハードコードデータ（バンドルサイズ問題）
- TypeScript型安全性の課題（`any` 型の多用）
- Firebase統合済み（Analytics, Crashlytics）

**デザインの課題:**
- 現在は縦長スクロールで情報量が多い
- モバイルで片手操作しづらい
- 専門用語が多く、一般ユーザーに伝わりにくい

**UGCの戦略:**
- 動画は短く、インパクト重視（15〜30秒想定）
- ニックネーム入りでパーソナライズ感
- 「わかる！」と共感できる内容
- 最後のオチで笑いとシェア意欲を喚起

**陰陽五行の原典:**
- `/Users/kitamuratatsuhiko/UIanimated/drive-download-20251129T134637Z-1-001` に師匠の教えあり
- `analytics-data/` に日干からの特徴データあり
- 専門的な内容をバズる言葉に変換する必要あり

## Constraints

- **Tech Stack**: React Native + Expo（既存コードベース）
- **Video Generation**: Remotion使用
- **Images**: プリセット画像 + プロンプト提供（AI生成はユーザー側で）
- **Platform**: iOS優先、Android対応
- **Bundle Size**: 既存のデータ肥大化問題に配慮

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| カード型UI | スクロールレス、片手操作に対応 | — Pending |
| 動画構成パターン固定 | 本質→家族→仕事→恋愛→オチ | — Pending |
| プリセット画像 | 動画生成速度と安定性確保 | — Pending |
| プラットフォーム別トーン | ミックスで各SNSに最適化 | — Pending |

---
*Last updated: 2026-01-23 after Phase 2 planning*
