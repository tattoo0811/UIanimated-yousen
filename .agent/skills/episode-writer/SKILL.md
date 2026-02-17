---
name: episode-writer
description: 「巡の運命診断室」エピソード執筆セッションのオーケストレーター。ペルソナ・参考ソース・モードを統合し、Draft → Review → Revise サイクルを実行する。
---

# Episode Writer — 執筆セッション・ワークフロー

## 概要

このスキルは、1エピソードの執筆セッション全体を管理する。
他の3スキル（`novel-writing-technique`, `novel-critique`, `character-identity`）を束ねるオーケストレーターとして機能する。

---

## Phase 0: Pre-flight（セッション準備）

**必ずセッション開始時に以下を読み込むこと。**

### 0-1. 対象エピソードの特定

```
novel/episodes/manuscripts/ep{N}/manifest.json
```

- `currentDraftId` を確認し、次のドラフト番号を決定
- `protagonist` からメインキャラクターを特定

### 0-2. ペルソナ読み込み（必須）

| ファイル | パス | 用途 |
|---------|------|------|
| **患者 identity.md** | `novel/characters/personas/ep{N}-{name}/identity.md` | 命式・性格・話し方・外見 |
| **患者 soul.md** | `novel/characters/personas/ep{N}-{name}/soul.md` | 天中殺・大運・成長弧・世界観・巡の語り |
| **巡 identity.md** | `novel/characters/personas/kujo-meguru/identity.md` | 主人公の基本設定 |
| **巡 soul.md** | `novel/characters/personas/kujo-meguru/soul.md` | 巡の内面・診断スタイル |

### 0-3. 参考ソース

| ソース | アクセス方法 | 用途 |
|--------|-------------|------|
| **AI プロンプト設計書** | `novel/settings/NOVEL-WRITING-AI-PROMPT-DESIGN.md` | シーン構造(PPP, Scene & Sequel)、日本的感性の技法 |
| **キャラクター設計マニュアル** | `novel/settings/CHARACTER-DESIGN-MANUAL.md` | 年齢層別テンプレート、七つの鉄則 |
| **陰陽五行 NotebookLM** | ID: `5c1dd305-31f4-4ff3-833a-e749ba10c665` | 算命学の知識検証 |
| **文学技法 NotebookLM** | ID: `8bc0ef83-2641-4021-863b-1f2d24820961` | 三者の文体分析・モード設計根拠 |
| **前のドラフト** | `novel/episodes/manuscripts/ep{N}/draft-{prev}.md` | 改善対象 |

### 0-4. 既存ドラフトの批評（draft-2以降の場合）

前ドラフトがある場合、`novel-critique` の `review-all` を実行し、改善点を特定してから執筆に入る。

---

## Phase 1: Draft（執筆）— 富山あるき

**担当ペルソナ**: 富山 あるき（丁・灯火 / Somatic Mode / Dreamer）

### 1-1. モード選定

`auto-mode-select` の指針に従い、シーンごとにモードを決定:

| シーン | 推奨モード | 理由 |
|--------|-----------|------|
| 冒頭（患者の日常） | **Somatic** or **Tapestry** | 患者の内面 or 社会的背景の描写 |
| 来院〜問診 | **Logic** (導入) → **Somatic** (告白) | 診断室の空気感 → 患者の吐露 |
| 鑑定シーン | **Logic** | 巡の帰納的論理。命式の分析 |
| 処方箋（巡の語りかけ） | **Hybrid** (Logic + Somatic) | 論理の構造で救済の感情を包む |
| エンディング | **Somatic** | 患者の身体的変容。世界の見え方が変わる |

### 1-2. 構造テンプレート（Scene & Sequel + PPP）

```
■ Promise（冒頭 〜 来院）
  - 患者の「重さ」を身体的に描写（Somatic Marker）
  - 「この人に何が起きるのか」の期待形成
  - 診断室との出会い

■ Progress（問診 〜 鑑定）
  - Goal: 患者が自分の「本当の問い」に辿り着く
  - Conflict: 表面の悩み ≠ 本質の問い（命式が暴く）
  - Disaster: 患者が自分の命式の真実に直面する（痛みの瞬間）

■ Payoff（処方箋 〜 エンディング）
  - Reaction: 患者の感情的反応（涙、沈黙、身体的変化）
  - Dilemma: 「変われるのか」という問い
  - Decision: 小さな一歩（身体的な行動で示す）
```

### 1-3. 執筆ルール

1. **soul.md の「巡が見る風景」をそのまま組み込む**
   - 「巡の内面」→ 地の文・心の声として使用
   - 「語りかけ」→ 巡のセリフとして使用（算命学用語は禁止）
2. **identity.md の「話し方の例」を参考に患者のセリフを構築**
3. **「キーシーンへの指針」の「輝く条件」を意識して場面を設計**
4. **「避けるべき描写」に列挙された行動をさせない**
5. **感情語の直接使用を禁止**（Somatic Marker に変換）

### 1-4. 出力

```
novel/episodes/manuscripts/ep{N}/draft-{next}.md
```

---

## Phase 2: Review（批評）— 織部紡

**担当ペルソナ**: 織部 紡（甲・大樹 / Logic Mode / Realist）

### 2-1. `review-all` の実行

`novel-critique` スキルの `review-all` を、完成したドラフトに対して実行。

### 2-2. 重点チェック項目

| チェック | 基準 |
|---------|------|
| **感情語の残存** | 「悲しい」「辛い」「嬉しい」等が残っていないか（Somatic基準） |
| **命式との整合性** | キャラクターの行動・台詞が identity.md / soul.md と矛盾しないか |
| **巡の語りの原則** | 巡のセリフに算命学用語（星名・五行数値・天中殺名称）が入っていないか |
| **構造的整合性** | PPP / Scene & Sequel の6ビートが機能しているか |
| **帰納的論理** | 鑑定シーンの推理に飛躍がないか。読者がついてこれるか |
| **生活のディテール** | 患者の社会的背景が十分に描かれているか（Tapestry基準） |
| **他エピソード混入禁止** | 他エピソードの固有名キャラクターが紛れ込んでいないか（例: EP4の森川をEP1に登場させない） |
| **台詞トーン検証** | 巡の台詞が「そうでしょう」等の断定・押しつけになっていないか。問いかけ・独白のニュアンスが保たれているか |
| **診断フロー完備** | 初回来訪者に対して①名前取得②サービス説明③料金・時間④同意の4要素が揃っているか |
| **時間整合性** | 昼休み→診断→帰還の時間経過が現実的か。昼が夕方にならないか |
| **情報出所の整合** | 巡が名前で呼ぶ場合、その名前を知る手段（カード記入等）が先に描かれているか |
| **数字発話禁止** | 五行数値は巡の内面描写のみ。台詞として口に出していないか |

### 2-3. 出力

Critique Report を生成し、Phase 3 に渡す。

---

## Phase 3: Revise（改稿）

Phase 2 の Critique Report に基づき、ドラフトを修正。
修正後、必要に応じて Phase 2 を再実行（最大2回）。

---

## Phase 4: Finalize（保存）

### 4-1. manifest.json の更新

```json
{
  "drafts": [
    {"id": 1, "file": "draft-1.md", "note": "初稿", "createdAt": "..."},
    {"id": 2, "file": "draft-2.md", "note": "文学的モード適用・改稿", "createdAt": "..."}
  ],
  "currentDraftId": 2
}
```

### 4-2. 最終確認

- [ ] ファイルが `novel/episodes/manuscripts/ep{N}/draft-{next}.md` に保存されたか
- [ ] manifest.json が更新されたか
- [ ] 感情語が一切残っていないか（最終スキャン）
- [ ] 巡のセリフに算命学用語が含まれていないか（最終スキャン）
- [ ] 他エピソードの固有名キャラクターが混入していないか
- [ ] 巡の台詞が断定・押しつけになっていないか（問いかけトーン維持）
- [ ] 初回来訪者への診断フロー（名前/説明/料金/同意）が完備されているか
- [ ] 時間経過が現実的か（昼→夕方への論理飛躍がないか）
- [ ] 情報出所の整合性（名前を知る手段が先に描かれているか）
- [ ] 五行数値が巡の内面のみで、台詞に漏れていないか
