# Source of Truth（正典）仕訳

> **作成日**: 2026-02-14
> **目的**: 九条巡の生年月日混乱を解消し、以降の参照を一本化する

---

## 正典（Single Source of Truth）

### 九条巡（主人公）

| 項目 | 正値 | 参照元 |
|------|------|--------|
| **生年月日** | **1990-03-02** | AGENTS.md, verify-storyline, CHARACTERS-AGE-RELATIONSHIPS |
| **日柱** | 丙寅 | 算命学CLI検証済み |
| **エネルギー** | 267点 | sanmei-with-energy-cli.ts |
| **2026年4月時点の年齢** | 36歳 | 計算: 2026-1990=36 |

### データ参照の優先順位

1. **キャラクター基本データ**: `novel/characters/ep1-10.md`（正典）
2. **ダッシュボード表示**: `src/data/ep1-10-characters.ts`（ep1-10.md から同期）
3. **検証・ツール**: `AGENTS.md` の主要キャラ表、`tools/verify-storyline.ts`
4. **正史イベント**: `beads/canon/timeline.json`, `beads/astrology/birthdata.json`

**ルール**: 矛盾がある場合、`novel/characters/` が正。他はこれに従って修正する。

---

## 2026-02-14 修正実施

| ファイル | 修正内容 |
|----------|----------|
| `novel/characters/ep1-10.md` | 九条巡: 1991-03-07 → **1990-03-02**、丙子 → **丙寅**、35歳 → **36歳** |
| `src/data/ep1-10-characters.ts` | meguru.birthDate: 1991-03-07 → **1990-03-02**、ageAtStory: 35 → **36** |
| `beads/canon/timeline.json` | E002 九条巡誕生: 1991-03-02 → **1990-03-02** |
| `beads/astrology/birthdata.json` | B001 (C001): 1991-03-02 → **1990-03-02** |

---

## 廃止・参照禁止

- 九条巡の生年月日として **1991-03-07** または **1991-03-02** を参照しないこと
- `novel/characters/ep1-10-AUDIT-2026-02-14.md` の巡の記載は修正前のスナップショット。更新版で上書きするか、このSSoTを参照すること
