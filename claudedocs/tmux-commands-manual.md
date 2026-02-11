# Tmux コマンド使い方マニュアル

**Agent Teams で複数セッションを管理するためのガイド**

---

## 🚀 クイックスタート

### 基本的な使い方

```bash
# agent-team セッションにアタッチ（最もよく使う）
tm

# セッション一覧を表示
tml

# 新しいセッションを作成（バックグラウンド）
tmn my-project
```

---

## 📋 コマンド一覧

### エイリアス（短縮コマンド）

| コマンド | 説明 | 使用例 |
|---------|------|--------|
| `tm` | agent-team にアタッチ | `tm` |
| `tml` | セッション一覧を表示 | `tml` |
| `tmn` | 新規セッション作成 | `tmn project-name` |
| `tk` | 全tmuxセッションを終了 | `tk` |

### 関数（高度な操作）

| 関数 | 説明 | 使用例 |
|------|------|--------|
| `tmnew` | デタッチ状態で新規セッション作成 | `tmnew backend` |
| `tma` | セッションにアタッチ（fzf対応） | `tma backend` |
| `tmkill` | セッションを削除 | `tmkill backend` |
| `tms` | セッションを切り替え（tmux内で） | `tms frontend` |
| `tmclaude` | Claude Code を新規セッションで起動 | `tmclaude agent-team /path/to/project` |

---

## 🔧 複数セッションの管理

### シナリオ1: 複数プロジェクトを並行作業

```bash
# === プロジェクト1: バックエンド ===
tmnew backend-api
# → デタッチ状態で作成される

# === プロジェクト2: フロントエンド ===
tmnew frontend-app
# → デタッチ状態で作成される

# === プロジェクト3: Agent Teams テスト ===
tmnew agent-teams
# → デタッチ状態で作成される

# === 作業を開始 ===
tma backend-api          # バックエンド作業
# Ctrl+b d でデタッチ

tma frontend-app         # フロントエンド作業
# Ctrl+b d でデタッチ

tma agent-teams          # Agent Teams テスト
# Ctrl+b d でデタッチ

# === セッション一覧を確認 ===
tml
# 出力例:
# backend-api: 1 windows (created Sat Feb  7 10:00:00 2026)
# frontend-app: 1 windows (created Sat Feb  7 10:05:00 2026)
# agent-teams: 4 windows (created Sat Feb  7 10:10:00 2026)
```

### シナリオ2: Agent Teams 専用ワークフロー

```bash
# === Agent Teams 用セッションを作成 ===
tmclaude agent-team ~/UIanimated

# または、既存セッションにアタッチ
tm

# Agent Teams を実行
# 各チームメイトが自動的に分割ペインに表示される

# === デタッチしてバックグラウンドで実行 ===
# Ctrl+b d

# === 後で確認 ===
tml
tm attach -t agent-team
```

### シナリオ3: セッション間の移動（tmux 内で）

```bash
# agent-team セッションにアタッチ
tm

# セッション内で別のセッションに切り替え
# Ctrl+b : でコマンドモード
# > switch-client -t backend-api

# または、設定済み関数を使用
tms backend-api          # backend-api に切り替え
tms frontend-app         # frontend-app に切り替え
tms agent-team           # agent-team に戻る
```

---

## 🎯 よく使う操作

### tmux 内での基本操作

| 操作 | キーバインド | 説明 |
|------|-------------|------|
| **セッション操作** |
| デタッチ | `Ctrl+b d` | セッションを維持したまま離脱 |
| セッション一覧 | `Ctrl+b s` | セッション一覧を表示 |
| **スクロール操作** |
| マウススクロール | `マウスホイール` | そのままスクロール（推奨） |
| スクロールモード（上） | `Ctrl+a k` | コピーモードで上にスクロール |
| スクロールモード | `Ctrl+a j` | コピーモードに入る |
| PageUp/PageDown | `PageUp/PageDown` | コピーモードでページスクロール |
| **ペイン操作（Agent Teams で重要）** |
| 水平分割 | `Ctrl+b \|` | 左右にペイン分割 |
| 垂直分割 | `Ctrl+b -` | 上下にペイン分割 |
| 移動 | `Ctrl+b <arrow>` | 矢印キーでペイン移動 |
| 拡大/縮小 | `Ctrl+b z` | 現在のペインを全画面表示 |
| ペイン閉じる | `Ctrl+b x` | 現在のペインを閉じる |
| **ウィンドウ操作** |
| 新規ウィンドウ | `Ctrl+b c` | 新しいウィンドウ作成 |
| 次のウィンドウ | `Ctrl+b n` | 次のウィンドウへ移動 |
| 前のウィンドウ | `Ctrl+b p` | 前のウィンドウへ移動 |
| ウィンドウ選択 | `Ctrl+b w` | ウィンドウ一覧から選択 |

### .tmux.conf に設定済みのキーバインド

あなたの `.tmux.conf` には以下が設定済みです：

| 操作 | キーバインド | 説明 |
|------|-------------|------|
| 水平分割 | `Ctrl+a \|` | 左右に分割 |
| 垂直分割 | `Ctrl+a -` | 上下に分割 |
| 左移動 | `Ctrl+a h` | 左のペインへ |
| 下移動 | `Ctrl+a j` | 下のペインへ |
| 上移動 | `Ctrl+a k` | 上のペインへ |
| 右移動 | `Ctrl+a l` | 右のペインへ |
| 左に拡大 | `Ctrl+a H` | 左へ5文字分拡大 |
| 下に拡大 | `Ctrl+a J` | 下へ5行分拡大 |
| 上に拡大 | `Ctrl+a K` | 上へ5行分拡大 |
| 右に拡大 | `Ctrl+a L` | 右へ5文字分拡大 |

**注意**: あなたの設定ではプレフィックスが `Ctrl+b` から `Ctrl+a` に変更されています。

---

## 📜 スクロール方法

tmux内で長い出力をスクロールする3つの方法：

### 方法1: マウススクロール（推奨）

**一番簡単な方法** - マウスまたはトラックパッドでそのままスクロール：

- ✅ 自動的に有効
- ✅ クリックでカーソル位置を設定
- ✅ なじみの操作感

**設定**: 既に `.tmux.conf` で有効化済み：
```bash
set-option -g mouse on
```

### 方法2: キーボードショートカット

| 操作 | キーバインド |
|------|-------------|
| スクロールモードに入る | `PageUp` または `Ctrl+a k` |
| 1行上にスクロール | `Ctrl+a k` |
| 1行下にスクロール | `Ctrl+a j` |
| ページアップ | `PageUp` |
| ページダウン | `PageDown` |
| スクロールモード終了 | `q` または `Enter` |

### 方法3: Viスタイル（コピーモード）

高度なユーザー向けのvi風操作：

#### ステップ1: コピーモードに入る

```bash
Ctrl+a [     # または PageUp
```

#### ステップ2: スクロール操作

| 操作 | キー | 説明 |
|------|------|------|
| 上へ | `k` | 1行上 |
| 下へ | `j` | 1行下 |
| 左へ | `h` | 1文字左 |
| 右へ | `l` | 1文字右 |
| ページアップ | `Ctrl+u` | 半ページ上 |
| ページダウン | `Ctrl+d` | 半ページ下 |
| 先頭へ | `g` | 履歴の最初 |
| 末尾へ | `G` | 履歴の最後 |

#### ステップ3: コピーモードを終了

```bash
q            # コピーモード終了
Enter        # または Enter
```

### ステータスバーのインジケーター

- **COPY**: コピーモード（スクロール可能）
- **SYNC**: ペイン同期モード

### トラブルシューティング

**問題**: マウススクロールが効かない

**解決策**:
```bash
# tmux設定をリロード
tmux source-file ~/.tmux.conf

# または、tmuxセッションを再起動
tmux kill-server
tm
```

**問題**: キーボードスクロールが効かない

**解決策**:
- プレフィックスキーを確認: `Ctrl+a` (あなたの設定)
- 最初に `Ctrl+a k` でコピーモードに入る
- `q` で確実に終了してから再試行

---

## 🚪 Tmux の終了方法

### 方法1: ペイン/ウィンドウを閉じる

```bash
# 現在のペインで
exit

# または
Ctrl+d

# 全てのペインを閉じるとセッションも終了
```

### 方法2: デタッチして後で終了

```bash
# デタッチ（セッションは維持）
Ctrl+b d

# 後でセッションを削除
tmkill agent-team
```

### 方法3: 全てのセッションを終了

```bash
# tmux サーバー全体を停止（エイリアス: tk）
tk

# またはフルコマンド
tmux kill-server

# または全セッションを削除
tmkill $(tmux ls -F '#{session_name}')
```

### 方法4: 特定のセッションを終了

```bash
# agent-team セッションを終了
tmux kill-session -t agent-team

# またはエイリアス
tmkill agent-team
```

---

## 💼 実践的なワークフロー

### 開発ワークフロー

```bash
# === 朝: 開発開始 ===
# プロジェクトごとにセッション作成
tmnew api
tmnew web
tmnew mobile

# === 午前: API 開発 ===
tma api
# 開発作業...
# Ctrl+b d でデタッチ

# === 午後: フロントエンド ===
tma web
# 開発作業...
# Ctrl+b d でデタッチ

# === 夕方: Agent Teams テスト ===
tmclaude agent-team ~/UIanimated
# Agent Teams 実行...
# Ctrl+b d でデタッチ

# === 定期的にセッション確認 ===
tml
```

### Agent Teams 専用ワークフロー

```bash
# === 準備 ===
# Claude Code を tmux 内で起動
tmclaude agent-team ~/UIanimated

# === Agent Teams 実行 ===
# Claude Code プロンプトで:
# "エージェントチームを作成して、4つのテストカテゴリを並列分析してください..."

# === 結果の確認 ===
# 自動的に分割ペインに各チームメイトが表示される
# Ctrl+a h/j/k/l で各ペインを移動
# Ctrl+a z で特定のペインを拡大して確認

# === 作業終了 ===
exit  # セッション終了
# または
Ctrl+b d  # デタッチ（後で再開可能）
```

---

## 🐛 トラブルシューティング

### 問題1: セッションが残っている

```bash
# セッション一覧を確認
tml

# 不要なセッションを削除
tmkill <session-name>
```

### 問題2: セッションにアタッチできない

```bash
# 既にアタッチされているか確認
tml

# 「attached」と表示される場合:
# 1. 別のターミナルで開かれている
# 2. 強制的にアタッチ:
tmux attach -d -t <session-name>
```

### 問題3: Agent Teams が分割されない

```bash
# tmux セッション内で実行しているか確認
echo $TMUX
# 空の場合: tmux セッション内にいません

# 解決策:
tm  # tmux セッションにアタッチ
# その中で Claude Code を起動
claude
```

### 問題4: tmux がフリーズした

```bash
# セッションを強制終了
tmkill <session-name>

# 全tmux プロセスを終了
tmux kill-server
```

---

## 📚 参考資料

### 公式ドキュメント
- [tmux GitHub Wiki](https://github.com/tmux/tmux/wiki)
- [tmux Manual Page](https://man.openbsd.org/tmux.1)

### 設定ファイルの場所
- **tmux 設定**: `~/.tmux.conf`
- **zsh 設定**: `~/.zshrc`（tmux エイリアス・関数）

### 設定のカスタマイズ

`.tmux.conf` を編集してキーバインドを変更できます：

```bash
# 設定ファイルを開く
edit ~/.tmux.conf

# 設定を反映
tmux source-file ~/.tmux.conf
```

---

**作成日**: 2026-02-07
**用途**: Agent Teams で複数 tmux セッションを管理
