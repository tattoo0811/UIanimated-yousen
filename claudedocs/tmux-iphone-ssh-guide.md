# iPhone + SSH + Tailscale + tmux 設定ガイド

**モバイル環境からリモート開発を行うための完全ガイド**

---

## 📱 iPhone SSH 環境のセットアップ

### 必要なアプリ

1. **Terminus** または **Blink Shell**（推奨）
   - App Store からダウンロード
   - SSHクライアントとして使用

2. **Tailscale**
   - iPhoneとMac-mini両方にインストール
   - VPNネットワークを構築

---

## 🌐 Tailscale 設定

### Mac-mini 側

```bash
# Tailscale がインストールされているか確認
tailscale version

# Tailscale の IP アドレスを確認
tailscale ip -4
# 例: 100.x.x.x
```

### iPhone 側

1. Tailscale アプリを起動
2. 同じアカウントでサインイン
3. **「Enable SSH」** をオンにする
4. Mac-miniの Tailscale IP メモする

---

## 🔐 SSH 接続の確立

### 方法1: Tailscale IP で接続

iPhoneのターミナルアプリ（Terminusなど）で：

```bash
# SSH 接続
ssh username@100.x.x.x

# 具体例
ssh kitamuratatsuhiko@100.x.x.x
```

### 方法2: Tailscale ホスト名で接続

```bash
# Tailscale のホスト名で接続（推奨）
ssh username@mac-mini-hostname

# 具体例
ssh kitamuratatsuhiko@Mac-mini
```

### 方法3: SSH Config を設定（Mac-mini側）

`~/.ssh/config` に設定を追加：

```ssh
Host mac-mini
    HostName 100.x.x.x
    User kitamuratatsuhiko
    ServerAliveInterval 60
    ServerAliveCountMax 3

Host mac-mini-tailscale
    HostName mac-mini.your-tailnet.ts.net
    User kitamuratatsuhiko
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

iPhoneから：

```bash
ssh mac-mini-tailscale
```

---

## 🖥️ tmux セッション管理（iPhone対応）

### 基本的なワークフロー

#### 1. Mac-mini で事前にセッションを作成

```bash
# Mac-mini で作業開始時にセッション作成
tmnew dev-work
tmnew agent-teams
tmclaude agent-team ~/UIanimated
```

#### 2. iPhone から接続してアタッチ

```bash
# SSH で接続
ssh mac-mini-tailscale

# 既存セッションを確認
tml

# セッションにアタッチ
tma dev-work        # または
tm                  # agent-team にアタッチ
```

---

## 📱 iPhone 特有の最適化

### tmux 設定の調整

`~/.tmux.conf` にモバイル向け設定を追加：

```bash
# モバイル向けのフォントサイズ調整
# （iPhoneのターミナルアプリ側で設定）

# スクロールバーを表示
set -g mouse on

# 履歴を増やす（モバイルで見返しやすく）
set -g history-limit 20000

# ステータスバーを見やすく
set -g status-left-length 20
set -g status-right-length 60
set -g status-interval 5
```

### キーバインドの簡略化（iPhone用）

`~/.tmux.conf` に追加：

```bash
# iPhoneのキーボード向けの簡易キーバインド
bind -n C-up select-pane -U
bind -n C-down select-pane -D
bind -n C-left select-pane -L
bind -n C-right select-pane -R

# Escape キーでデタッチ（iPhoneで入力しやすい）
bind -n Escape detach-client
```

---

## 🔄 定期的な接続維持

### SSH タイムアウト対策

`~/.ssh/config` に設定：

```ssh
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

### tmux セッションの自動維持

tmux内で作業中に回線が切れても、セッションは維持されます：

```bash
# 作業中...
# 回線切断！

# 再接続
ssh mac-mini-tailscale
tml                    # セッションは生きている
tma dev-work           # そのまま作業再開
```

---

## 📋 iPhone からの具体的な手順

### 作業開始から終了まで

#### ステップ1: SSH 接続

```bash
# iPhone のターミナルアプリで
ssh mac-mini-tailscale
```

#### ステップ2: tmux セッションにアタッチ

```bash
# セッション一覧を確認
tml

# 出力例:
# dev-work: 2 windows (created...)
# agent-team: 4 windows (created...)

# 選択してアタッチ
tma dev-work
# または
tm
```

#### ステップ3: 作業

```bash
# tmux 内で通常通り作業
cd ~/UIanimated
git status
npm test
# などなど...
```

#### ステップ4: デタッチ（セッション維持）

```bash
# 回線を切ってもセッションを維持
Ctrl+a d

# SSH ログアウト
exit
```

#### ステップ5: 再接続

```bash
# 後でまた接続
ssh mac-mini-tailscale
tm                    # そのまま作業再開
```

---

## 🛠️ トラブルシューティング

### 問題1: SSH 接続が切れる

**原因**: ネットワークの切り替えやスリープ

**解決策**:
```bash
# tmux セッションは維持されている
# 再接続するだけ
ssh mac-mini-tailscale
tml                    # セッションを確認
tma <session-name>     # 再アタッチ
```

### 問題2: tmux セッションが見つからない

**解決策**:
```bash
# 全てのセッションを確認
tmux ls

# 強制的にアタッチ（他の接続を切断）
tmux attach -d -t <session-name>
```

### 問題3: 画面が崩れる

**解決策**:
```bash
# tmux 設定をリロード
tmux source-file ~/.tmux.conf

# または強制再描画
Ctrl+a :    # コマンドモード
refresh-client
Enter
```

### 問題4: キー入力が遅い

**解決策**:
```bash
# tmux のエスケープ時間を短縮
# ~/.tmux.conf に追加済みのはず
set -sg escape-time 1

# 効果がない場合
tmux kill-server
tm                    # 再起動
```

---

## 📱 iPhone ターミナルアプリのおすすめ設定

### Terminus の設定

```yaml
Font: Menlo 11pt
Theme: Solarized Dark
Key Repeat: Fast
Delay Until Repeat: Short
Enable Bell: OFF
Visual Bell: ON
Copy Mode: vi
```

### Blink Shell の設定

```yaml
Font: SF Mono 12pt
Theme: Dracula
Key Repeat: Fast
Haptic Feedback: ON
Smart Keys: ON
```

---

## 🎯 実践的なワークフロー

### モバイル開発の一日

#### 朝: Mac-mini で準備

```bash
# セッションを作成
tmnew morning-review
tmnew feature-dev
tmclaude agent-team ~/UIanimated

# 各セッションで環境構築
# （事前に準備しておくとiPhoneでスムーズ）
```

#### 昼: iPhone から確認・軽微な修正

```bash
# SSH 接続
ssh mac-mini-tailscale

# 進捗確認
tml
tma feature-dev

# ログ確認、テスト実行など
npm test
git log --oneline -10

# デタッチ
Ctrl+a d
exit
```

#### 夜: iPhone から緊急対応

```bash
# 緊急バグ対応
ssh mac-mini-tailscale
tm          # agent-team にアタッチ

# Agent Teams でデバッグ
「エージェントチームを作成して、このバグを調査してください」

# 完了したらデタッチ
Ctrl+a d
```

---

## 🚀 ベストプラクティス

### 推奨事項

1. **セッション命名規則**
   ```bash
   tmnew work-$(date +%Y%m%d)    # work-20260207
   tmn project-name              # プロジェクト名
   ```

2. **事前準備**
   ```bash
   # Mac-mini で事前に環境を整える
   # - 依存関係をインストール
   # - Git レポジトリを最新に
   # - テストをパス状態に
   ```

3. **回線切断を前提に**
   ```bash
   # いつ切れても良いように
   # - 頻繁にコミット
   # - tmux セッションを活用
   # - エディタは保存を忘れずに
   ```

4. **バッテリー節約**
   ```bash
   # 不用意なプロセスを終了
   # - top/btop で常時監視しない
   # - ビルド中は放置
   # - 明るさを下げる
   ```

---

## 📚 まとめ

### iPhone + tmux のメリット

- ✅ どこからでも開発環境にアクセス
- ✅ 回線切断でも作業状態を維持
- ✅ Agent Teams をモバイルで管理
- ✅ 緊急対応に即座に対応可能

### 注意点

- ⚠️ 画面サイズの制限を考慮
- ⚠️ キーボード操作の制限に対応
- ⚠️ ネットワーク依存を理解

### 次のステップ

1. **Tailscale の設定を完了**
2. **iPhone SSH アプリをインストール**
3. **接続テスト**: `ssh mac-mini-tailscale`
4. **tmux セッション作成**: `tmn mobile-test`
5. **アタッチ確認**: `tma mobile-test`

---

**作成日**: 2026-02-07
**用途**: iPhone + SSH + Tailscale + tmux でモバイル開発
