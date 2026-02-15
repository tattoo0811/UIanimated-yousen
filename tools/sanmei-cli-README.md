# 算命学計算ツール (Sanmei CLI)

生年月日と性別を入力として、算命学に基づいた命式（陰占・陽占・大運・数理法エネルギー）を計算し、JSON形式で出力するCLIツールです。

## 概要

- **ファイル名**: sanmei-with-energy-cli.ts
- **言語**: TypeScript
- **機能**: 節入り日を考慮した干支計算、十大主星・十二大従星の算出、大運（10年ごとの運気）、数理法エネルギー（1990-03-02→丙寅・267点で検証済み）
- **用途**: AIエージェントによる自動鑑定、バックエンドシステムへの組み込み、データ分析など

## 環境セットアップ

実行には Node.js と tsx（TypeScript実行環境）が必要です。

```bash
npm install -g tsx typescript
npm install -g @types/node
```

## 使用方法

コマンドラインから以下の形式で引数を渡して実行します。

```bash
# 形式: npx tsx sanmei-cli.ts <YYYY-MM-DD> <gender>
# genderは 'male' または 'female'

# 例: 1995年6月15日生まれの女性の場合
npx tsx sanmei-with-energy-cli.ts 1995-06-15 female
```

## 出力データ構造 (JSON)

出力は標準出力（stdout）にJSON形式で書き出されます。

```json
{
  "input": {
    "date": "1995-6-15",
    "gender": "female"
  },
  "insen": {
    "year": { "gan": "乙", "shi": "亥", "zokan": "甲" },
    "month": { "gan": "壬", "shi": "午", "zokan": "己" },
    "day": { "gan": "丙", "shi": "申", "zokan": "庚" },
    "setsuiriDay": 6
  },
  "yousen": {
    "north": "玉堂星",
    "south": "車騎星",
    "east": "龍高星",
    "west": "禄存星",
    "center": "調舒星",
    "start": "天馳星",
    "middle": "天将星",
    "end": "天胡星"
  },
  "suriho": {
    "total_energy": 267,
    "gogyo_scores": { "木": 48, "火": 105, "土": 105, "金": 9, "水": 0 }
  },
  "taiun": {
    "isForward": true,
    "ritsuun": 3,
    "list": [
      {
        "age": 3,
        "eto": "癸未",
        "gan": "癸",
        "shi": "未",
        "star": "牽牛星",
        "jusei": "天印星"
      }
    ]
  }
}
```

## 各項目の解説

### 陰占 (insen)

- **year/month/day**: それぞれ年干支、月干支、日干支オブジェクト
  - **gan**: 十干（甲乙丙丁戊己庚辛壬癸）
  - **shi**: 十二支（子丑寅卯辰巳午未申酉戌亥）
  - **zokan**: 蔵干（二十八元から節入り日経過日数に基づき算出されたもの）
- **setsuiriDay**: 計算に使用されたその月の節入り日（日）

### 陽占 (yousen)

人体星図の各位置にある星です。

- **north**: 頭（北）。精神、目上、親を表します
- **south**: 腹（南）。精神的目標、目下、子供を表します
- **east**: 東。現実、社会、仕事、兄弟、母を表します
- **west**: 西。現実結果、家庭、配偶者を表します
- **center**: 胸（中央）。本質、自分自身を表します
- **start**: 初年期（右上）
- **middle**: 中年期（右下）
- **end**: 晩年期（左下）

### 大運 (taiun)

10年ごとの運気の流れです。

- **isForward**: 順行（true）か逆行（false）か
- **ritsuun**: 運気の変わり目が何歳か（例: 3なら3歳、13歳、23歳...で切り替わる）
- **list**: 1旬目から10旬目（概ね100歳頃まで）のリスト

## AIエージェントでの活用例

このツールを「Function Calling」や「Tools」としてAIに登録する場合の定義例です。

```json
{
  "name": "calculate_sanmei",
  "description": "Calculate Sanmei-gaku (Chinese divination) chart including Insen, Yousen, and Taiun based on birth date and gender.",
  "parameters": {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "description": "Birth date in YYYY-MM-DD format"
      },
      "gender": {
        "type": "string",
        "enum": ["male", "female"],
        "description": "Gender of the person"
      }
    },
    "required": ["date", "gender"]
  }
}
```

AIがこのツールを呼び出すと、CLIを実行し、返ってきたJSONを解析してユーザーに運勢を解説させることができます。

## 重要な特徴

1. **正確な二十八元計算**: 節入り日を考慮した正確な蔵干計算
2. **完全な陽占用データ**: 十大主星・十二大従星・大運を含む
3. **JSON形式**: AIエージェントや他のシステムとの連携が容易
4. **検証済み**: localhost:3002の結果と完全に一致

## ライセンス

MIT
