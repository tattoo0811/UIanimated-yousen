# Requirements: 巡の運命診断室ダッシュボード

**Defined:** 2026-02-12
**Core Value:** 正典（DASHBOARD.md）の全内容をWebダッシュボードで閲覧可能にする

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### 全体統計 (Overview)

- [ ] **OV-01**: ユーザーは120話全体統計を閲覧できる
  - 総エピソード数、物語期間、ライフイベントカバレッジ、メインキャラクター数
- [ ] **OV-02**: ユーザーは主要登場人物（5キャラクター）を確認できる
- [ ] **OV-03**: ユーザーは3部構成の基本情報を確認できる
  - 各部の話数、期間、テーマ、さくら回想回数
- [ ] **OV-04**: ユーザーはさくら回想シーン分布（合計20回）を確認できる
  - 基礎編9回、葛藤編6回、統合編5回
- [ ] **OV-05**: ユーザーはサブテーマ統計を閲覧できる
  - 転職、恋愛、家族問題、健康、天中殺等12カテゴリ

### 13章構造 (Thirteen Chapters)

- [ ] **CH-01**: ユーザーは13章構造の全体像を確認できる
  - 各章の話数範囲、期間、テーマ
- [ ] **CH-02**: ユーザーは各章の詳細タイムラインを閲覧できる
- [ ] **CH-03**: ユーザーは章ごとのテーマを確認できる（関連キャラクターはDASHBOARD.mdにデータがないため実装対象外）
- [ ] **CH-04**: ユーザーは13章構造を3部とマッピングして理解できる

### さくら回想シーン (Sakura Flashbacks)

- [ ] **SA-01**: ユーザーは20回のさくら回想シーン全件をリスト閲覧できる
  - 話数、テーマ、出典（v2オリジナル/sakura-teachings）
- [ ] **SA-02**: ユーザーは回想シーンの3部構成別分布を視覚的に確認できる
- [ ] **SA-03**: ユーザーは各回想シーンの詳細（テーマ、内容）を確認できる
- [ ] **SA-04**: ユーザーは回想シーンを物語の流れで時系列順に確認できる

### サブテーマ統計 (Subtheme Stats)

- [ ] **TH-01**: ユーザーは12テーマ別登場回数統計を閲覧できる
  - 転職、恋愛、家族、健康、天中殺、不倫、介護等
- [ ] **TH-02**: ユーザーは各テーマの割合と登場話を確認できる
- [ ] **TH-03**: ユーザーは3部別のテーマ推移を確認できる
  - 基礎編・葛藤編・統合編のテーマシフト
- [ ] **TH-04**: ユーザーは主要なテーマの登場話例を確認できる

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### キャラクター成長弧

- **CHAR-ARC-01**: ユーザーは各キャラクターの成長弧をタイムラインで確認できる
  - 巡・美咲・慧のフェーズ変遷（6フェーズずつ）
- **CHAR-ARC-02**: ユーザーはキャラクター間の関係性変化を追跡できる

### ライフイベントカバレッジ

- **LIFE-01**: ユーザーは48ライフイベントの実装状況を確認できる
  - カテゴリ別（教育、就職、結婚、出産等）
- **LIFE-02**: ユーザーはカバレッジ率（83.3%）を視覚的に確認できる

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| キャラクター成長弧 | v1ではデータ可視化に専念。成長弧の複雑なデータ構造はv2で検討 |
| ライフイベント詳細 | 48件の詳細はv2。v1は全体統計のカバレッジ数のみ |
| Turso DB接続 | 正典データを静的JSONに変換して使用。DB接続は将来検討 |
| ユーザー認証 | パブリックダッシュボードとして実装 |
| データ編集機能 | 閲覧専用。編集はスコープ外 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| OV-01 | Phase 1 | Pending |
| OV-02 | Phase 1 | Pending |
| OV-03 | Phase 1 | Pending |
| OV-04 | Phase 1 | Pending |
| OV-05 | Phase 1 | Pending |
| CH-01 | Phase 2 | Pending |
| CH-02 | Phase 2 | Pending |
| CH-03 | Phase 2 | Pending |
| CH-04 | Phase 2 | Pending |
| SA-01 | Phase 3 | Pending |
| SA-02 | Phase 3 | Pending |
| SA-03 | Phase 3 | Pending |
| SA-04 | Phase 3 | Pending |
| TH-01 | Phase 4 | Pending |
| TH-02 | Phase 4 | Pending |
| TH-03 | Phase 4 | Pending |
| TH-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-12*
*Last updated: 2026-02-12 after initial definition*
