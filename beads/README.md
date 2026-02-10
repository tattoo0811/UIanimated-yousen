# beads Novel Management System

**3-Layer Architecture for Robust Long-Form Storytelling using [steveyegge/beads](https://github.com/steveyegge/beads)**

## 概要

このプロジェクトは **Steve Yegge's beads** を使用した「正史（Canon）／伏線（Foreshadow）／占い（Astrology）」3層アーキテクチャの小説管理システムです。beads は git-backed な issue トラッカーで、AI エージェント向けの永続的メモリを提供します。

## ディレクトリ構造

```
beads/
├─ canon/              # 絶対不変の正史
│   ├─ characters.json  # キャラクター基本データ
│   └─ timeline.json    # 物語タイムライン
│
├─ foreshadow/         # 伏線専用（状態管理あり）
│   └─ foreshadows.json # 伏線データ
│
└─ astrology/          # 占い・命式DB（最重要）
    ├─ birthdata.json     # 生年月日（絶対正史）
    ├─ destiny_map.json   # 命式データ（accurate-logicで生成）
    └─ constraints.json   # 物語制約エンジン
```

## 重要原則

### canon（正史）
- **事実**を記録
- `immutable_rules`: 物語中で破ってはいけない制約
- 生年月日は`birth_id`参照のみ（直書き禁止）

### foreshadow（伏線）
- **未確定状態を含む事実**を管理
- 状態遷移: `planned → introduced → hinted → unresolved → resolved`
- `must_resolve_by`を超えたらエラー
- `linked_constraints`で占い由来の回収条件を管理

### astrology（占い）
- **物語生成を縛るルールエンジン**
- 生年月日＝絶対変更禁止
- 命式結果が展開を縛る設計変数
- `severity: hard`の制約は絶対遵守

## CLI ツール (beads `bd` コマンド)

### インストール

```bash
# beads をグローバルにインストール
npm install -g @beads/bd
# または
brew tap steveyegge/beads
brew install bd
```

### 基本コマンド

```bash
# issues 一覧
bd list

# ラベルでフィルタリング
bd list --labels canon,character
bd list --labels foreshadow
bd list --labels astrology,constraint

# issue 作成
bd create "Issue title" --labels "canon,event" --priority 0

# issue 詳細表示
bd show UIanimated-xxx

# issue をクローズ
bd close UIanimated-xxx

# 依存関係の追加
bd deps add UIanimated-xxx --blocks UIanimated-yyy

# ステータス変更
bd update UIanimated-xxx --status closed
```

## データスキーマ

### canon/characters.json

```json
{
  "character_id": "C001",
  "name": "九条 巡",
  "birth_id": "B001",
  "sex": "male",
  "status": "alive",
  "immutable_rules": [
    "医師国家試験に合格している",
    "MedAIで慧に裏切られた"
  ],
  "relationships": {
    "C002": "former_partner_betrayed"
  }
}
```

### astrology/birthdata.json

```json
{
  "birth_id": "B001",
  "calendar": "gregorian",
  "date": "1991-05-01",
  "time": "14:30",
  "timezone": "Asia/Tokyo",
  "immutable": true
}
```

### astrology/destiny_map.json

```json
{
  "birth_id": "B001",
  "day_master": {
    "stem": "辛",
    "yin_yang": "yin"
  },
  "tenchusatsu": "申酉",
  "four_pillars": { ... },
  "yangsen": { ... }
}
```

### astrology/constraints.json

```json
{
  "constraint_id": "AST-003",
  "type": "relationship",
  "rule": "天中殺の補完関係：巡（申酉）× 慧（寅卯）",
  "severity": "hard",
  "applies_to": ["relationship", "foreshadow"]
}
```

## 実戦運用フロー

### 章を書く前

```bash
# 1. 現在の状況確認
bd list --labels canon,character
bd list --labels foreshadow

# 2. 制約確認
bd list --labels astrology,constraint --priority 0
```

### 章を書いた後

```bash
# 1. 新規事象をbeads issueとして作成
bd create "[CANON] Event: 新しいイベント" --labels "canon,event" --priority 0

# 2. 伏線の追加
bd create "[FORESHADOW] 新しい伏線" --labels "foreshadow,high" --priority 0

# 3. JSON データの更新（必要に応じて）
# - beads/canon/characters.json または timeline.json を編集
# - beads/astrology/constraints.json を編集
# - beads/foreshadow/foreshadows.json を編集
```

## accurate-logic との連携

`destiny_map.json` は `birthdata.json` から `accurate-logic` を使って自動生成されます。

```bash
# 命式データを再生成
tsx scripts/generate-destiny-map.ts
```

**⚠️ 注意**: `birthdata.json` を変更したら必ず再生成してください。

## 制約チェック

### hard 制約
- 絶対遵守
- 破ると世界観が崩壊
- 例: 「巡と慧は天中殺の補完関係にある」

### soft 制約
- 回避可能だが代償必須
- 例: 「美咲が慧に利用される可能性」

## トラブルシューティング

### データが矛盾している場合

```bash
# beads の診断
bd doctor --fix

# issues の一覧で確認
bd list --json | jq '.[] | select(.status == "open")'
```

### 伏線が回収されていない場合

```bash
# 未解決の伏線を確認
bd list --labels foreshadow --json | jq '.[] | select(.status == "open")'

# foreshadows.json の status を更新
```

## 用語集

- **birth_id**: 生年月日データへの参照ID
- **character_id**: キャラクターID
- **foreshadow_id**: 伏線ID
- **constraint_id**: 制約ID
- **event_id**: タイムラインイベントID
- **immutable_rules**: 絶対変更禁止ルール
- **severity**: 制約の重要度（hard/soft）
- **linked_constraints**: 占い由来の回収条件

## 今後の拡張

- [x] steveyegge/beads による issue 管理
- [ ] beads issues と JSON データの双方向同期
- [ ] 自動制約違反検知（pre-commit hook）
- [ ] エピソード単位の管理
- [ ] Git 連携による変更履歴管理

## 参考リンク

- [steveyegge/beads GitHub](https://github.com/steveyegge/beads)
- [Introducing Beads - Steve Yegge](https://steve-yegge.medium.com/introducing-beads-a-coding-agent-memory-system-637d7d92514a)
- [Beads Best Practices](https://steve-yegge.medium.com/beads-best-practices-2db636b9760c)

## ライセンス

MIT

---

**作成**: 2026-02-10
**バージョン**: 1.0
