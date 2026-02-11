#!/usr/bin/env python3
"""
日干「己」の十大主星検証データを抽出
既存の検証データファイルから日干「己」のデータを抽出して分析
"""

import json
import glob
import re
from pathlib import Path

def extract_ji_stars():
    """検証データから日干「己」のデータを抽出"""

    # 検証データファイルのパス
    verification_files = glob.glob("/Users/kitamuratatsuhiko/UIanimated/accurate-logic/claudedocs/verification_group_*.json")

    results = []

    for file_path in verification_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if 'results' not in data:
                continue

            for result in data['results']:
                if not result.get('success'):
                    continue

                # 四柱推命データを取得
                if 'params' not in result or 'fourPillars' not in result['params']:
                    continue

                four_pillars = result['params']['fourPillars']
                day_pillar = four_pillars.get('day', '')

                # 日干が「己」かチェック
                if not day_pillar.startswith('己'):
                    continue

                # データを抽出
                year_pillar = four_pillars.get('year', '')
                month_pillar = four_pillars.get('month', '')

                year_stem = year_pillar[0] if year_pillar else ''
                month_stem = month_pillar[0] if month_pillar else ''

                jugdai = result.get('jugdai', {})

                results.append({
                    'date': result.get('params', {}).get('date', ''),
                    'year_stem': year_stem,
                    'month_stem': month_stem,
                    'day_pillar': day_pillar,
                    'head': jugdai.get('head', ''),
                    'chest': jugdai.get('chest', ''),
                    'belly': jugdai.get('belly', ''),
                    'rightHand': jugdai.get('rightHand', ''),
                    'leftHand': jugdai.get('leftHand', ''),
                })

        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    return results

def analyze_ji_patterns(results):
    """日干「己」のパターンを分析"""

    print(f"=== 日干「己」の検証データ分析 ===")
    print(f"総データ数: {len(results)}\n")

    # 年干パターン
    year_patterns = {}
    for r in results:
        key = r['year_stem']
        if key and key not in year_patterns:
            year_patterns[key] = []
        if key:
            year_patterns[key].append({
                'date': r['date'],
                'star': r['head']
            })

    # 月干パターン
    month_patterns = {}
    for r in results:
        key = r['month_stem']
        if key and key not in month_patterns:
            month_patterns[key] = []
        if key:
            month_patterns[key].append({
                'date': r['date'],
                'star': r['chest']
            })

    print("【年干パターン（日干己 × 年干 = 頭の星）】")
    for stem in sorted(year_patterns.keys()):
        stars = set([p['star'] for p in year_patterns[stem]])
        examples = year_patterns[stem][:2]
        example_strs = [f"{e['date']}->{e['star']}" for e in examples]
        print(f"  己 × {stem}: {', '.join(stars)} (例: {', '.join(example_strs)})")

    print("\n【月干パターン（日干己 × 月干 = 胸の星）】")
    for stem in sorted(month_patterns.keys()):
        stars = set([p['star'] for p in month_patterns[stem]])
        examples = month_patterns[stem][:2]
        example_strs = [f"{e['date']}->{e['star']}" for e in examples]
        print(f"  己 × {stem}: {', '.join(stars)} (例: {', '.join(example_strs)})")

    # テーブル構築
    print("\n【十大主星テーブル（日干己）】")

    # 天干の順序
    stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

    # 年干パターンからテーブルを構築
    table = {}
    for stem in stems:
        if stem in year_patterns:
            stars = list(set([p['star'] for p in year_patterns[stem]]))
            table[stem] = stars[0] if stars else '?'
        else:
            table[stem] = '?'

    print("【年干に対する十大主星（頭）】")
    for stem in stems:
        print(f"  己 × {stem} = {table[stem]}")

    # 同様に月干
    month_table = {}
    for stem in stems:
        if stem in month_patterns:
            stars = list(set([p['star'] for p in month_patterns[stem]]))
            month_table[stem] = stars[0] if stars else '?'
        else:
            month_table[stem] = '?'

    print("\n【月干に対する十大主星（胸）】")
    for stem in stems:
        print(f"  己 × {stem} = {month_table[stem]}")

    # 不足パターンを確認
    missing_stems = [s for s in stems if table[s] == '?']
    if missing_stems:
        print(f"\n【未検証の天干: {', '.join(missing_stems)}】")

    return results, year_patterns, month_patterns

if __name__ == '__main__':
    results = extract_ji_stars()
    analyze_ji_patterns(results)

    # 結果を保存
    output_file = '/Users/kitamuratatsuhiko/UIanimated/claudedocs/ji-ten-great-star-analysis.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n結果を保存しました: {output_file}")
