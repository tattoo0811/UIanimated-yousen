# 算命学ロジック整理バックアップ

**バックアップ日時**: 2026-02-10 23:17

## バックアップ内容

### ディレクトリ

1. **accurate-logic/** - 旧検証用ロジック
   - `src/yangsen.ts` - 古い陽占計算
   - `src/bazi.ts` - 四柱推命計算
   - `tests/` - 検証テスト
   - `claudedocs/` - 検証ドキュメント

2. **sanmei-calc-engine/** - 旧計算エンジン
   - `src/types.ts` - 型定義
   - `src/index.ts` - メイン計算
   - `src/tenStars.ts` - 十大主星
   - `src/twelveStars.ts` - 十二大従星

3. **yinyang-app/** - 旧Reactアプリ
   - 完全なReact Webアプリケーション

4. **old-scripts/** - 検証スクリプト群
   - `calculate-sanmeigaku.js`
   - `extract_ji_stars.py`
   - `random-validation.js`
   - `test-yinyang-app-logic.js`
   - `verify-yinyang-code.js`

5. **mobile-claudedocs/** - モバイル用ドキュメント
   - `yangsen-verification-report.md`
   - `yangsen-calculation-complete-analysis.md`
   - 他 yangsen 関連ドキュメント

6. **mobile/lib/logic/yangsen.ts** - 旧モバイル陽占計算

## 現在の有効構造

### 計算エンジン（単一ソース）

- **`/tools/sanmei-cli.ts`** - 唯一の計算エンジン
  - 二十八元による正確な蔵干計算
  - 十大主星・十二大従星の計算
  - 大運計算
  - TypeScriptで実装
  - CLI: `npx tsx sanmei-cli.ts YYYY-MM-DD gender`

### フロントエンド

1. **stella-check/app/** - Next.js検証アプリ
   - `/stella-check/app/page.tsx` - 完全なReact UI
   - localhost:3002で動作確認済み

2. **mobile/** - React Nativeアプリ
   - `/mobile/lib/logic/yangsen.ts` - sanmei-cli.tsを使用
   - `/mobile/src/types/index.ts` - east/west表記に更新済み

### ドキュメント

- **`/tools/sanmei-cli-README.md`** - 使用マニュアル
- **`/AGENTS.md`** - エージェント用ドキュメント
- **`/.claude/skills/CALCULATE-SANMEIGAKU.md`** - スキルドキュメント

## 変更点

### 型定義の統一

**旧**: `rightHand`/`leftHand`（身体部位）
**新**: `west`/`east`（方角）

```typescript
// 新しい型定義
export interface YangSen {
  head: string;        // 頭（北）
  chest: string;       // 胸（中央）
  belly: string;       // 腹（南）
  west: string;        // 西
  east: string;        // 東
  leftShoulder: StarInfo;
  leftLeg: StarInfo;
  rightLeg: StarInfo;
}
```

### 人体図の見直し

```
        頭（北）
    親・目上・上司

  西（西）  胸（中央）  東（東）
配偶者・家庭   自分・本質   社会・仕事

        腹（南）
    子供・目下・部下
```

## リストア方法

必要な場合は以下のコマンドでリストア：

```bash
# ディレクトリを戻す
cp -r .backup/deprecated-sanmei-logic-20260210-231746/accurate-logic ./
cp -r .backup/deprecated-sanmei-logic-20260210-231746/sanmei-calc-engine ./
cp -r .backup/deprecated-sanmei-logic-20260210-231746/yinyang-app ./

# スクリプトを戻す
cp .backup/deprecated-sanmei-logic-20260210-231746/old-scripts/* tools/
```

## 検証済みデータ

- **1983-08-11** - 朱学院と完全一致 ✓
- **1977-08-20** - 朱学院と完全一致 ✓
- **1995-06-15** - localhost:3002と一致 ✓

## 関連ファイル

- `/Users/kitamuratatsuhiko/UIanimated/tools/sanmei-cli.ts`
- `/Users/kitamuratatsuhiko/UIanimated/tools/sanmei-cli-README.md`
- `/Users/kitamuratatsuhiko/UIanimated/AGENTS.md`
