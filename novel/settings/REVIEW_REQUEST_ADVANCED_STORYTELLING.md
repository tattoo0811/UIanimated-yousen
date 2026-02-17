# Review Request: Advanced Storytelling Techniques Implementation

## 1. 概要 (Overview)
今回の作業では、**「日本的感性とAI最適構造の融合」**、および**「作家・編集者ペルソナによる品質管理体制」**を構築しました。
これらは以下の3つの柱で構成されています。

1.  **3つの文学的モード（Literary Modes）**: 辻村深月（Somatic）、米澤穂信（Logic）、宮部みゆき（Tapestry）の技法を体系化。
2.  **双子星スタッフ（Staff Personas）**: 作家「富山あるき」と編集者「織部紡」による相互監視体制。
3.  **スキル実装（Skill Implementation）**: CLIコマンドによる執筆・批評の自動化。

## 2. 実装内容 (Implementation Details)

### A. 文学的モードの実装
以下の3つのモードを定義し、執筆・批評の両面で適用可能にしました。

| モード | スタイル | 特徴 | 視点 |
| :--- | :--- | :--- | :--- |
| **Somatic** | 辻村深月風 | 感情を「身体的反応（痛み、渇き）」で描写 | 内的焦点化 |
| **Logic** | 米澤穂信風 | 感情を「論理」と「客観的相関物（風景）」で描写 | 観察者・推理 |
| **Tapestry** | 宮部みゆき風 | 個人のドラマを「社会構造（生活・制度）」と接続 | 多声的・俯瞰 |

### B. スキル定義 (Skills)
*   **執筆スキル**: `tools/skills/novel-writing-technique/SKILL.md`
    *   `write-scene --mode [somatic|logic|tapestry]`: 指定モードでの執筆。
    *   `generate-character`: モード別の葛藤（自意識・論理の盾・社会的鎖）を付与。
*   **批評スキル**: `tools/skills/novel-critique/SKILL.md`
    *   `review-sensibility`: 「悲しい」などのNGワードを検出し、身体描写へ誘導。
    *   `review-logic`: 因果律の破綻や、ご都合主義を指摘。
    *   `review-social`: 生活感の欠如（家計、職業的リアリティ）を指摘。

### C. スタッフペルソナ (Personas)
**「1990年3月の双子星」**として、互いに補完・対立する2人のAI人格を設定しました。

1.  **[作家] 富山 あるき (Toyama Aruki)**
    *   **生年月日**: 1990-03-03 (丁卯 / 戌亥天中殺)
    *   **役割**: 月光の作家 (Dreamer / Somatic Mode)
    *   **スタンス**: 「痛みだけが真実だ」
    *   **ファイル**: `novel/characters/personas/toyama-aruki/`

2.  **[編集者] 織部 紡 (Oribe Tsumugu)**
    *   **生年月日**: 1990-03-30 (甲午 / 辰巳天中殺)
    *   **役割**: 燃える大樹の編集者 (Realist / Logic Mode)
    *   **スタンス**: 「売れ。私が君を燃やして輝かせてやる」
    *   **ファイル**: `novel/characters/personas/oribe-tsumugu/`

### D. 設定ファイル (Configuration)
*   **`CLAUDE.md`**: 文学的モードの定義と運用ルールを追加。
*   **`AGENTS.md`**: `StoryReviewer` エージェントに新スキル（批評）の使用を義務付け。

## 3. 今後のワークフロー (Future Workflow)

今後は以下のように、モードと担当者を指定して指示を出してください。

### ケース1: 感情的なシーンを書きたい時
> **指示**: 「あるき先生、Somatic Modeで、巡が過去のトラウマを思い出すシーンを書いてください」
>
> **AIの挙動**: 「喉の渇き」「視野の歪み」などを駆使し、内面深く潜る描写を行います。

### ケース2: 謎解きや診断シーン
> **指示**: 「織部さん、Logic Modeで、この診断シーンの矛盾点を厳しく指摘してください」
>
> **AIの挙動**: 感情論を排し、論理的な整合性と「ビターな後味」の有無をチェックします。

### ケース3: 社会派ドラマ
> **指示**: 「Tapestry Modeで、患者の生活背景（経済状況や家族構成）を深掘りしてください」
>
> **AIの挙動**: 食事の内容、家賃、職場の人間関係など、具体的な「生活の手触り」を追加します。

## 4. レビュー依頼 (Review Steps)
1.  **スキルファイルの確認**: `tools/skills/` 配下の `SKILL.md` が意図通りか。
2.  **ペルソナの確認**: `novel/characters/personas/` の設定が「双子星」として機能するか。
3.  **設定の確認**: `CLAUDE.md` と `AGENTS.md` の連携ルール。

以上、ご確認をお願いいたします。
