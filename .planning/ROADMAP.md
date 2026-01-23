# Roadmap: 陰陽五行アプリ リニューアル

## Overview

スクロールレスなカード型UIとTikTok風動画生成機能により、占い結果をバズるコンテンツとしてシェア可能にするモバイルアプリのリニューアル。既存のReact Nativeコードベースを拡張し、サーバーサイドRemotionによる動画生成、ネイティブシェア機能、バズりやすい言葉への翻訳機能を実装する。

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Code Quality** - TypeScript strict mode, bundle size optimization
- [ ] **Phase 2: Card UI Core** - Scroll-less card-based interface
- [ ] **Phase 3: Design System** - Multiple design themes
- [ ] **Phase 4: Video Generation Backend** - Server-side Remotion infrastructure
- [ ] **Phase 5: Video Content Integration** - Personalized video content with nickname
- [ ] **Phase 6: Video Playback & Share** - Native share sheet and camera roll save
- [ ] **Phase 7: Direct Social Sharing** - TikTok/Instagram direct posting
- [ ] **Phase 8: Content Translation** - Buzz-worthy word translation system
- [ ] **Phase 9: Image Generation Prompts** - AI image prompts for preset images
- [ ] **Phase 10: Friend Compatibility** - Compatibility diagnosis feature
- [ ] **Phase 11: 2026 Year Fortune** - Year-specific fortune content

## Phase Details

### Phase 1: Foundation & Code Quality
**Goal**: 既存コードベースの技術的負債を解消し、新機能追加の基盤を整備する
**Depends on**: Nothing (first phase)
**Requirements**: None (technical foundation)
**Success Criteria** (what must be TRUE):
  1. TypeScript strict modeが有効になり、`any`型使用が検出される
  2. viral-characters.tsのデータが外部化/圧縮され、バンドルサイズが削減される
  3. ビルドがエラーなく通過する（iOS/Android両方）
  4. ESLintルールが適用され、コード品質が向上する
  5. 既存機能の回帰テストがパスする
**Plans**: 6 plans

Plans:
- [ ] 01-01A: lib/*配下のTypeScript strict modeエラー修正（types, storage, cache, monitoring, share, migrations）
- [ ] 01-01B: components/*とその他のTypeScript strict modeエラー修正（notifications, cards, settings）
- [ ] 01-02A: viral-characters.tsの型定義・JSON・ローダーへの分割
- [ ] 01-02B: 既存コンポーネントの動的ローダー移行とviral-characters.ts削除
- [ ] 01-03A: ESLint/テスト基盤の構築（設定ファイル作成）
- [ ] 01-03B: Jestテスト実行と既存機能の回帰検証

### Phase 2: Card UI Core
**Goal**: スクロールレスなカードベースのUIを実装する
**Depends on**: Phase 1
**Requirements**: UI-01, UI-03
**Success Criteria** (what must be TRUE):
  1. ユーザーはスワイプでカードを切り替えできる
  2. 1画面内で情報が完結し、スクロールが不要である
  3. スワイプ時のアニメーションが60fpsで動作する
  4. タップ時のフィードバックアニメーションが表示される
**Plans**: 4 plans

Plans:
- [x] 02-01: expo-haptics導入とタップフィードバックの実装
- [x] 02-02: スワイプアニメーションの改善（速度判定、回転補間、次カードスケール/フェード）
- [ ] 02-03: 干支選択画面の作成とSwipeableStack統合（ギャップクロージャー）
- [ ] 02-04: 既存画面からのナビゲーション統合（ギャップクロージャー）

### Phase 3: Design System
**Goal**: 複数のデザインテーマを提供し、ユーザーが切り替え可能にする
**Depends on**: Phase 2
**Requirements**: UI-02
**Success Criteria** (what must be TRUE):
  1. ユーザーは3つ以上のデザインテーマから選択できる
  2. 各テーマは一貫した色・フォント・アニメーションを持つ
  3. テーマ切り替えが即座に反映される
  4. 設定が永続化され、アプリ再起動後も保持される
**Plans**: 2 plans

Plans:
- [ ] 03-01: デザインテーマシステムの設計と実装
- [ ] 03-02: 3つのテーマ作成と切り替えUIの実装

### Phase 4: Video Generation Backend
**Goal**: サーバーサイドRemotionによる動画生成基盤を構築する
**Depends on**: Phase 1
**Requirements**: VID-01, VID-03, VID-04
**Success Criteria** (what must be TRUE):
  1. サーバーで9:16縦動画（15-30秒）が生成できる
  2. 動画は1080x1920または720x1280の解像度でH.264 + AACエンコードされる
  3. 7秒フック構成（0-2s: ビジュアルフック、2-5s: パーソナライズ、5-15s: 開示、15-20s: CTA、20-30s: ブランディング）が実装されている
  4. タイピングエフェクトで文字が1文字ずつ表示される
  5. モバイルアプリから動画生成リクエストを送信できる
**Plans**: 4 plans

Plans:
- [ ] 04-01: Remotionバックエンドのセットアップ（Node.js + Lambda）
- [ ] 04-02: 動画テンプレートの作成（9:16フォーマット）
- [ ] 04-03: 7秒フック構成とタイピングエフェクトの実装
- [ ] 04-04: 生成APIエンドポイントと進捗ポーリングシステム

### Phase 5: Video Content Integration
**Goal**: 動画にパーソナライズされたコンテンツを組み込む
**Depends on**: Phase 4
**Requirements**: VID-02, VID-05
**Success Criteria** (what must be TRUE):
  1. ユーザーのニックネームが動画内に動的に表示される
  2. 本質→家族→仕事→恋愛→オチの構成でコンテンツが生成される
  3. 各セクションで切り替わる演出が表示される
  4. オチ（笑い）が最後に含まれる
**Plans**: 2 plans

Plans:
- [ ] 05-01: ニックネーム動的挿入機能の実装
- [ ] 05-02: 本質→家族→仕事→恋愛→オチ構成の実装

### Phase 6: Video Playback & Share
**Goal**: 生成された動画を再生・保存・シェアできるようにする
**Depends on**: Phase 5
**Requirements**: SHR-01, SHR-03
**Success Criteria** (what must be TRUE):
  1. ユーザーは生成された動画をアプリ内で再生できる
  2. ネイティブシェアシートが表示され、各アプリにシェアできる
  3. カメラロールへの保存が機能する（パーミッション処理含む）
  4. 動画はキャッシュされ、再ダウンロードを回避する
**Plans**: 2 plans

Plans:
- [ ] 06-01: expo-videoによる動画再生機能の実装
- [ ] 06-02: expo-media-libraryによるカメラロール保存とexpo-sharingによるシェアシート

### Phase 7: Direct Social Sharing
**Goal**: TikTok/Instagramへの直接投稿を可能にする
**Depends on**: Phase 6
**Requirements**: SHR-02
**Success Criteria** (what must be TRUE):
  1. TikTokアプリがインストールされている場合、直接投稿画面を開ける
  2. Instagramアプリがインストールされている場合、直接投稿画面を開ける
  3. 動画ファイルが正しく各アプリに渡される
  4. アプリが未インストールの場合は適切なフォールバックが表示される
**Plans**: 2 plans

Plans:
- [ ] 07-01: URLスキームによるTikTok/Instagram連携の実装
- [ ] 07-02: アップリインストール検出とフォールバック処理

### Phase 8: Content Translation
**Goal**: 専門用語をバズりやすい言葉に翻訳するシステムを実装する
**Depends on**: Phase 3
**Requirements**: CNT-01, CNT-02
**Success Criteria** (what must be TRUE):
  1. ユーザーはTikTok風/YouTube風/Instagram風からトーンを選択できる
  2. TikTok風は短文・エモい・パンチラインが含まれる
  3. YouTube風はストーリーテリング形式である
  4. Instagram風はビジュアルを重視した説明である
**Plans**: 2 plans

Plans:
- [ ] 08-01: トーン選択システムと翻訳ロジックの実装
- [ ] 08-02: 3つのトーンパターン（TikTok/YouTube/Instagram）の作成

### Phase 9: Image Generation Prompts
**Goal**: プリセット画像用の生成AIプロンプトを提供する
**Depends on**: Phase 8
**Requirements**: CNT-03
**Success Criteria** (what must be TRUE):
  1. ユーザーは診断結果に対応する画像生成プロンプトを確認できる
  2. プロンプトはDALL-E等の画像生成AIで使用可能である
  3. プロンプトをコピーして他のアプリに貼り付けられる
**Plans**: 1 plan

Plans:
- [ ] 09-01: 画像生成プロンプトテンプレートの作成と表示UI

### Phase 10: Friend Compatibility
**Goal**: 友達との相性診断機能を実装する
**Depends on**: Phase 5
**Requirements**: EXT-01
**Success Criteria** (what must be TRUE):
  1. ユーザーは複数人の陰陽五行を比較できる
  2. 相性スコアが表示される
  3. シェアしたくなる結果表示が含まれる
  4. 比較結果が動画形式でも生成可能である
**Plans**: 2 plans

Plans:
- [ ] 10-01: 複数人の陰陽五行比較ロジックの実装
- [ ] 10-02: 相性スコア計算とシェア可能な結果表示

### Phase 11: 2026 Year Fortune
**Goal**: 2026年の年運に特化したコンテンツを提供する
**Depends on**: Phase 5
**Requirements**: EXT-02
**Success Criteria** (what must be TRUE):
  1. 丙午（ひのえうま）の年の特徴が説明される
  2. 年運に特化した動画テンプレートが使用される
  3. 2026年特有の運勢が表示される
**Plans**: 2 plans

Plans:
- [ ] 11-01: 丙午の年の特徴データと2026年運勢ロジックの実装
- [ ] 11-02: 2026年特化動画テンプレートの作成

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Code Quality | 0/6 | Not started | - |
| 2. Card UI Core | 0/2 | Not started | - |
| 3. Design System | 0/2 | Not started | - |
| 4. Video Generation Backend | 0/4 | Not started | - |
| 5. Video Content Integration | 0/2 | Not started | - |
| 6. Video Playback & Share | 0/2 | Not started | - |
| 7. Direct Social Sharing | 0/2 | Not started | - |
| 8. Content Translation | 0/2 | Not started | - |
| 9. Image Generation Prompts | 0/1 | Not started | - |
| 10. Friend Compatibility | 0/2 | Not started | - |
| 11. 2026 Year Fortune | 0/2 | Not started | - |

## Coverage

**Requirements Mapping:**

| Requirement | Phase | Description |
|-------------|-------|-------------|
| UI-01 | Phase 2 | スクロールレスなカードベースUI |
| UI-02 | Phase 3 | 複数のデザインパターン |
| UI-03 | Phase 2 | リッチなアニメーション効果 |
| VID-01 | Phase 4 | 9:16縦動画生成 |
| VID-02 | Phase 5 | ニックネーム埋め込み |
| VID-03 | Phase 4 | 7秒フック構成 |
| VID-04 | Phase 4 | タイピングエフェクト |
| VID-05 | Phase 5 | 本質→家族→仕事→恋愛→オチ構成 |
| SHR-01 | Phase 6 | ネイティブシェアシート |
| SHR-02 | Phase 7 | TikTok/Instagram直接投稿 |
| SHR-03 | Phase 6 | カメラロール保存 |
| CNT-01 | Phase 8 | バズりやすい言葉翻訳 |
| CNT-02 | Phase 8 | 複数トーン対応 |
| CNT-03 | Phase 9 | 生成プロンプト提供 |
| EXT-01 | Phase 10 | 友達との相性診断 |
| EXT-02 | Phase 11 | 2026年年運特化コンテンツ |

**Coverage:** 20/20 requirements mapped ✓

**Technical Foundation:**
- Phase 1 addresses technical debt (TypeScript strict mode, bundle size) that enables all subsequent phases
