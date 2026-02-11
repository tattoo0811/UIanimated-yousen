# 朱学院自動検証ツール

## 概要

算命学データ（accurate-logicでの計算結果）を朱学院で自動検証するためのツール。

## 特徴

- **厳密なデータ取得**: Playwrightを使用してDOMから直接データを抽出
- **スクリーンショット保存**: 証拠として全ページのスクリーンショットを自動保存
- **JSON出力**: 構造化されたJSONファイルでデータを保存
- **認識ミス防止**: 標準化された抽出順序でデータを取得

## インストール

```bash
cd tools
npm install playwright
npx playwright install chromium
```

## 使い方

### 基本的な使用方法

```bash
node verify-shugakuin.js <名前> <生年月日> <時刻> <性別>
```

### 引数

- `name`: キャラクター名（例: "涼子"）
- `birthdate`: 生年月日（フォーマット: YYYY-MM-DD、例: "1977-08-20"）
- `birthtime`: 出生時刻（フォーマット: HH:MM、例: "14:00"）
- `gender`: 性別（`male` または `female`）
- `location`: 場所（オプション、例: "tokyo"）

### 実行例

```bash
# 涼子の検証
node verify-shugakuin.js "涼子" "1977-08-20" "14:00" "female"

# 場所を指定する場合
node verify-shugakuin.js "康和" "1968-08-29" "10:00" "male" "tokyo"
```

## 出力ファイル

検証結果は以下の場所に保存されます：

```
claudedocs/screenshots/shugakuin/
├── 涼子-2026-02-10T10-30-00.000Z.png    # スクリーンショット
├── 涼子-2026-02-10T10-30-00.000Z.json    # 検証データ（JSON）
└── ...
```

### JSONファイルの構造

```json
{
  "params": {
    "name": "涼子",
    "birthDate": "1977-08-20",
    "birthTime": "14:00",
    "gender": "female"
  },
  "data": {
    "basicInfo": { ... },
    "fourPillars": { ... },
    "jugdai": { ... },
    "junidai": { ... },
    "tenchusatsu": "...",
    "screenshot": "スクリーンショットのパス",
    "verifiedAt": "2026-02-10T10:30:00.000Z"
  }
}
```

## データ抽出順序（厳密）

ツールは以下の順序でデータを抽出します：

1. **基本情報**
   - 生年月日
   - 出生時刻
   - 性別
   - 場所

2. **四柱推命**
   - 年柱
   - 月柱
   - 日柱
   - 時柱

3. **十大主星**（この順序で厳密に）
   - 頭（上中央）
   - 胸（中央）
   - 腹（下中央）
   - 右手（中段右）
   - 左手（中段左）

4. **十二大従星**（この順序で厳密に）
   - 左肩（上段左）
   - 左足（下段左）
   - 右足（下段右）

5. **天中殺**
   - あり/なし

## 人体図の標準レイアウト

```
         空白      頭        左肩        ← 行0 (上段)
         右手      胸        左手        ← 行1 (中段)
         右足      腹        左足        ← 行2 (下段)
```

### 十大主星の配置

- **頭**: 行0, 列1
- **胸**: 行1, 列1（中心星）
- **腹**: 行2, 列1
- **右手**: 行1, 列0
- **左手**: 行1, 列2

### 十二大従星の配置

- **左肩**: 行0, 列2
- **左足**: 行2, 列2
- **右足**: 行2, 列0

## エラーハトランス

### データ取得失敗

```
❌ エラーが発生しました: Cannot find selector...
```

**原因**: 朱学院のサイト構造が変更されている可能性
**対処**: `.claude/skills/SHUGAKUIN-VERIFICATION.md` を参照してセレクタを更新

### タイムアウト

```
❌ エラーが発生しました: Timeout 30000ms exceeded
```

**原因**: サイトの応答が遅い、またはネットワーク問題
**対処**: 再実行する

## 自動化スクリプトの使用例

### 複数キャラクターを一括検証

```bash
# 検証リストを作成
cat > verify-list.txt << EOF
涼子,1977-08-20,14:00,female
康和,1968-08-29,10:00,male
佑真,2013-08-30,11:00,male
智矢,2017-11-30,15:00,female
EOF

# 一括検証（シェルスクリプトでループ）
while IFS=',' read -r name birthdate birthtime gender; do
  node verify-shugakuin.js "$name" "$birthdate" "$birthtime" "$gender"
done < verify-list.txt
```

### accurate-logic との照合

```typescript
import { calculateBaZi } from '../accurate-logic/src/bazi';
import { calculateYangSen } from '../accurate-logic/src/yangsen';
import * as fs from 'fs';

// 朱学院の検証結果を読み込み
const shugakuinData = JSON.parse(
  fs.readFileSync('claudedocs/screenshots/shugakuin/涼子-xxx.json', 'utf8')
);

// accurate-logic で計算
const birthDate = new Date(shugakuinData.params.birthDate + 'T' + shugakuinData.params.birthTime + ':00');
const bazi = calculateBaZi(birthDate, 135);
const yangsen = calculateYangSen(bazi, birthDate);

// 照合
console.log('十大主星の照合:');
console.log(`  頭: ${yangsen.head} vs ${shugakuinData.data.jugdai.head}`);
console.log(`  胸: ${yangsen.chest} vs ${shugakuinData.data.jugdai.chest}`);
// ... 他も同様に
```

## トラブルシューティング

### スクリーンショットが真っ黒

**原因**: ページの読み込みが完了していない
**対処**: `await page.waitForTimeout(3000)` の時間を増やす

### データが「取得失敗」になる

**原因**: セレクタが正しくない
**対処**:
1. スクリーンショットを確認して、HTML構造を確認
2. `.claude/skills/SHUGAKUIN-VERIFICATION.md` のセレクタを更新
3. 再実行

### ヘッドレスモードで実行したい場合

```javascript
// verify-shugakuin.js の修正
const browser = await chromium.launch({
  headless: false,  // true を指定してヘッドレスモード
  slowMo: 50        // 操作を遅くして実行（デバッグ用）
});
```

## 関連ファイル

- `.claude/skills/SHUGAKUIN-VERIFICATION.md` - 検証プロセスの詳細
- `AGENTS.md` - エージェント指示（検証プロセスの記載）
- `accurate-logic/src/yangsen.ts` - accurate-logic の十大主星計算ロジック

## 更新履歴

- 2026-02-10: 初版作成
