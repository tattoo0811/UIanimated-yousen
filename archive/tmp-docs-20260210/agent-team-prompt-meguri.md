# めぐり96話 セリフ自然化 エージェントチームプロンプト

## 概要
複数エージェントが並行して漫画セリフの日本語自然化を実行するためのガイド。

---

## チーム構成

### Agent A：Markdown修正担当
**対象ファイル**：
- `.tmp/meguri-96episodes-v2-chapter3-4.md`
- `.tmp/meguri-96episodes-v2-chapter9.md`

### Agent B：Markdown修正担当
**対象ファイル**：
- `.tmp/meguri-96episodes-v2-chapter10-11.md`
- その他の章ファイル

### Agent C：JSON修正担当
**対象ファイル**：
- `meguri-96episodes-final.json`

---

## 共通ルール

### キャラクター設定（確定）
```yaml
九条巡:
  年齢: 35歳
  性別: 男性
  経歴: 元精神科医（5年勤務後、算命師に転身）
  話し方:
    若い患者へ: 「お前」「〜だ」「〜しろ」（年上らしく）
    同世代へ: 「君」「あんた」「〜だ」
    年上へ: 「あなた」「〜ですね」
  口癖: 「ふむ」「なるほど」「……」（間を多用）
  処方箋: 命令形で簡潔に（「〜しろ」「〜を受け入れろ」）

一条慧:
  年齢: 36歳
  関係: 巡の幼馴染、AIエンジニア
```

### 修正パターン

#### 1. `**太字**:` → `### 見出し`
```diff
- **患者プロフィール**:
+ ### 患者プロフィール
```

#### 2. `- **項目**: 内容` → 自然なリスト
```diff
- - **葵の悩み**:
-   - 内容1
+ 葵の悩み：
+ - 内容1
```

#### 3. 硬い敬語 → 自然な口語
```diff
- 「あなたの命式には…」
+ 「君の命式には…」

- 「処方：〜を受け入れる」
+ 「〜を受け入れろ」
```

#### 4. 誇張表現の許容
- 「完璧な」「完全に」→ キャラ設定上の意図的使用はOK
- ナレーションでの多用は避ける

---

## textlint使用方法

### インストール（プロジェクトローカル）
```bash
cd /Users/kitamuratatsuhiko/UIanimated
npm install textlint @textlint-ja/textlint-rule-preset-ai-writing --save-dev
```

### 実行コマンド
```bash
# 単一ファイル
npx textlint --preset @textlint-ja/textlint-rule-preset-ai-writing [ファイルパス]

# 全章ファイル
npx textlint --preset @textlint-ja/textlint-rule-preset-ai-writing .tmp/meguri-96episodes-v2-chapter*.md
```

### 主なエラーと対応
| エラー | 対応 |
|--------|------|
| `no-ai-list-formatting` | `**太字**:` → `### 見出し` |
| `no-ai-hype-expressions` | 「完璧な」「完全に」→ 文脈確認 |
| `no-ai-colon-continuation` | `〜:` → 自然な文に |

---

## 作業フロー

### Step 1: textlintで問題箇所を特定
```bash
npx textlint --preset @textlint-ja/textlint-rule-preset-ai-writing [対象ファイル] > lint-report.txt
```

### Step 2: パターン置換で一括修正
```bash
# 例：**太字**: を ### 見出し に変換
sed -i '' 's/\*\*\([^*]*\)\*\*:/### \1/g' [ファイル]
```

### Step 3: セリフの個別調整
- 巡の発言を年齢差に応じて調整
- 患者のセリフを年代別に自然化

### Step 4: 再検証
```bash
npx textlint --preset @textlint-ja/textlint-rule-preset-ai-writing [対象ファイル]
```

---

## 完了基準
- [ ] textlintの`no-ai-list-formatting`エラー: 0件
- [ ] 巡のセリフが男性的口調で統一
- [ ] 年齢差に応じた話し方の調整完了
- [ ] 処方箋が命令形で統一

---

## 参考ファイル
- 修正済みサンプル: `.tmp/meguri-96episodes-v2-chapter1-2.md`
- キャラクター設定: このプロンプト内の`キャラクター設定`セクション
