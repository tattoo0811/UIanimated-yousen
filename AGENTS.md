# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

---

## 算命学計算ツールセット

### 使用中のツール（最新版）

#### 1. sanmei-cli-v3.ts - 基本CLIツール
**陰占・陽占・大運計算（詳細な蔵干データ付き）**

```bash
cd /Users/kitamuratatsuhiko/UIanimated/tools
npx tsx sanmei-cli-v3.ts <YYYY-MM-DD> <male|female>

# 例：九条 巡（1990-03-02 女性）
npx tsx sanmei-cli-v3.ts 1990-03-02 female
```

**特徴**:
- 正確な二十八元計算（節入り日考慮）
- 詳細な蔵干データ（初元・中元・本元の候補リスト）
- 完全な陽占用データ（十大主星・十二大従星）
- 大運の厳密な計算（順行・逆行、立運の正確な算出）

#### 2. sanmei-with-energy-cli.ts - エネルギー計算付きCLI
**数理法エネルギー計算を含む完全版**

```bash
npx tsx sanmei-with-energy-cli.ts <YYYY-MM-DD> <male|female> --format json
```

**特徴**:
- 数理法エネルギー計算（PDF 201804_数理法_rev2.0.2.pdf 準拠）
- 五行別スコア表示
- 八門法による型判定
- JSON形式出力（AI連携向け）

#### 3. sanmei-app-v3.tsx - Reactアプリケーション
**ブラウザで使用可能な算命学アプリ**

```bash
# Next.jsアプリに組み込み済み
# アクセス: http://localhost:3001/sanmei
```

**特徴**:
- インタラクティブなUI
- 陰占・陽占・大運・数理法の統合表示
- リアルタイム計算
- 八門法チャート表示

---

## 出力データ構造

### sanmei-cli-v3.ts の出力

```json
{
  "input": {
    "date": "1990-03-02",
    "gender": "female"
  },
  "insen": {
    "year": {
      "gan": "庚",
      "shi": "午",
      "zokan": {
        "selected": "戊",
        "type": "main",
        "candidates": {
          "initial": "壬",
          "main": "戊"
        }
      }
    },
    "month": { "gan": "戊", "shi": "寅", "zokan": {...} },
    "day": { "gan": "丙", "shi": "寅", "zokan": {...} },
    "setsuiriDay": 6
  },
  "yousen": {
    "north": "禄存星",
    "south": "司禄星",
    "east": "調舒星",
    "west": "牽牛星",
    "center": "貫索星",
    "start": { "name": "天庫星", "sub": "墓", "score": 5 },
    "middle": { "name": "天禄星", "sub": "建禄", "score": 11 },
    "end": { "name": "天貴星", "sub": "長生", "score": 9 }
  },
  "taiun": {
    "isForward": false,
    "ritsuun": 9,
    "list": [ /* 10旬分の大運データ */ ]
  }
}
```

### sanmei-with-energy-cli.ts の出力（数理法付き）

上記に加え、以下を含む：

```json
{
  "suriho": {
    "total_energy": 267,
    "gogyo_scores": {
      "木": 56,
      "火": 85,
      "土": 42,
      "金": 0,
      "水": 84
    },
    "details": [ /* 各十干の詳細スコア */ ]
  }
}
```

---

## 重要な特徴

### 1. 正確な二十八元計算
- 節入り日を考慮した正確な蔵干計算
- 初元・中元・本元の候補リストを含む詳細データ
- 陰陽順逆に基づく正確な大運計算

### 2. 数理法エネルギー計算（PDF準拠）
- PDF「201804_数理法_rev2.0.2.pdf」の正しいエネルギー点数表を使用
- 全蔵干（数理法用）を考慮した計算
- PDF例題（壬子 / 戊戌 / 辛巳 = 201点）と完全に一致 ✓

### 3. 検証済み
- localhost:3001のReactアプリ結果と完全に一致
- 主要キャラクターのエネルギー値：
  - 九条 巡（1990-03-02）: **267点**
  - 藤堂 慧（1990-05-25）: **255点**
  - 九条 さくら（1925-07-30）: **204点**
  - 高橋 美咲（1999-05-03）: **196点**

---

## バックアップについて

古いツール・デバッグ用ファイルは以下のディレクトリに移動済み：

```
.backup/deprecated-tools-20260211-135504/
├── debug-suriho-step-by-step.ts
├── sanmei-cli-suriho-fixed.ts
├── sanmei-cli-suriho.ts
├── sanmei-cli.ts
├── sanmei-v2.ts
├── test-pdf-example.ts
└── verify-suriho-distribution.ts
```

**使用中の最新ツール（残したファイル）**:
- `sanmei-cli-v3.ts` - 基本CLI
- `sanmei-with-energy-cli.ts` - エネルギー計算付きCLI
- `sanmei-app-v3.tsx` - Reactアプリ

---

## ドキュメント

### 実装コード
- **基本CLI**: `/Users/kitamuratatsuhiko/UIanimated/tools/sanmei-cli-v3.ts`
- **エネルギー付きCLI**: `/Users/kitamuratatsuhiko/UIanimated/tools/sanmei-with-energy-cli.ts`
- **Reactアプリ**: `/Users/kitamuratatsuhiko/UIanimated/src/app/sanmei/page.tsx`

### 関連ドキュメント
- キャラクター命式データ: `/Users/kitamuratatsuhiko/UIanimated/claudedocs/CHARACTERS-AGE-RELATIONSHIPS.md`

---

## 算命学データ検証プロセス

算命学データを検証する際は、必ず以下のプロセスに従うこと：

### 重要: 朱学院検証の厳密化

**認識ミス防止のためのルール**:

1. **必ずスクリーンショットを取得**
   - 目視での確認は禁止
   - スクリーンショットを証拠として保存

2. **人体図の標準レイアウト（3x3構造）**
   ```
         空白      頭        左肩        ← 行0 (上段)
            右手      胸        左手        ← 行1 (中段)
            右足      腹        左足        ← 行2 (下段)
   ```

3. **データ抽出の厳密な順序**
   - 基本情報（生年月日・時刻・性別・場所）
   - 四柱推命（年柱・月柱・日柱・時柱）
   - 十大主星（頭→胸→腹→右手→左手）
   - 十二大従星（左肩→左足→右足）
   - 天中殺（あり/なし）

4. **照合プロセス**
   - スクリーンショットから抽出
   - DOMから直接取得
   - 両者が一致することを確認

5. **詳細なドキュメント**
   - `.claude/skills/SHUGAKUIN-VERIFICATION.md` を参照

**違反した場合の后果**:
- 誤ったロジック修正につながる
- 既存の検証データを破壊する可能性
- 時間の無駄

---

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
