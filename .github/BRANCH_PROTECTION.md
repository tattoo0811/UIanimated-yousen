# Main ブランチ保護設定手順

GitHub Web UI で以下の手順で設定してください：

1. **ブランチ保護ルールの追加**
   - https://github.com/tattoo0811/UIanimated-yousen/settings/branches
   - 「Add rule」をクリック
   - 「Branch name pattern」: `main`

2. **ルール設定**
   - ✅ Require a pull request before merging
     - Approvals: 1
     - ❌ Dismiss stale reviews
     - ❌ Require review from CODEOWNERS
   - ✅ Require status checks to pass before merging
     - Require branches to be up to date before merging
   - ✅ Require branches to be up to date before merging
   - ❌ Do not allow bypassing the above settings

3. **保存**
   - 「Create」または「Save changes」をクリック

## 設定後の挙動

- main に直接プッシュできなくなる
- PR + 承認 + CIパスが必要になる
- 履歴の線形化が強制される

---

## 自動レビューの実行タイミング

現在、以下のタイミングで4つのレビューが実行されます：

- **全ブランチへのプッシュ時** (`push: branches: ['**']`)
- **プルリクエスト作成・更新時**

### 対象ファイル

| ワークフロー | 対象ファイル |
|-------------|-------------|
| データ整合性 | novel/**/*.md, 120-EPISODE-DASHBOARD.md, meguru-storyline-v3.md, tools/**/*.ts |
| 物語整合性 | novel/**/*.md, meguru-storyline-v3.md, 120-EPISODE-DASHBOARD.md, claudedocs/**/*.md |
| キャラクター表現 | novel/**/*.md, meguru-storyline-v3.md, claudedocs/active/character*.md |
| 史実・専門性 | novel/**/*.md, meguru-storyline-v3.md, tools/**/*.ts, claudedocs/**/* |
