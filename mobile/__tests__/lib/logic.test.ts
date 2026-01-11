/**
 * 計算ロジック単体テスト
 *
 * テストデータ: PC版の既知の正解データを使用
 * 基準日時: 1983-08-11 12:00 (日本標準時 経度135度)
 * 期待結果: 癸亥年 庚申月 辛未日 甲午時（PC版test-bazi-1983-08-11.js で確認済み）
 */

import {
  calculateBaZi,
  calculateFiveElements,
  calculateYangSen,
  calculateEnergyScore,
  STEMS,
  BRANCHES
} from '@/src/lib/logic';

describe('四柱推命計算テスト', () => {
  // PC版との完全一致検証用テストケース
  const testDate = new Date(1983, 7, 11, 12, 0, 0); // 1983-08-11 12:00
  const longitude = 135; // 日本標準時子午線

  describe('calculateBaZi - 四柱推命計算', () => {
    it('PC版の既知のテストデータと完全一致すること', () => {
      const result = calculateBaZi(testDate, longitude);

      // 年柱: 癸亥
      expect(result.year.stemStr).toBe('癸');
      expect(result.year.branchStr).toBe('亥');
      expect(result.year.name).toBe('癸亥');

      // 月柱: 庚申
      expect(result.month.stemStr).toBe('庚');
      expect(result.month.branchStr).toBe('申');
      expect(result.month.name).toBe('庚申');

      // 日柱: 辛未
      expect(result.day.stemStr).toBe('辛');
      expect(result.day.branchStr).toBe('未');
      expect(result.day.name).toBe('辛未');

      // 時柱: 甲午
      expect(result.hour.stemStr).toBe('甲');
      expect(result.hour.branchStr).toBe('午');
      expect(result.hour.name).toBe('甲午');
    });

    it('GanZhiオブジェクトの構造が正しいこと', () => {
      const result = calculateBaZi(testDate, longitude);

      // Year Pillar
      expect(result.year).toHaveProperty('stem');
      expect(result.year).toHaveProperty('branch');
      expect(result.year).toHaveProperty('stemStr');
      expect(result.year).toHaveProperty('branchStr');
      expect(result.year).toHaveProperty('name');
      expect(result.year).toHaveProperty('id');
      expect(result.year).toHaveProperty('hiddenStems');

      // stem と branch の範囲チェック
      expect(result.year.stem).toBeGreaterThanOrEqual(1);
      expect(result.year.stem).toBeLessThanOrEqual(10);
      expect(result.year.branch).toBeGreaterThanOrEqual(1);
      expect(result.year.branch).toBeLessThanOrEqual(12);

      // hiddenStems が配列であること
      expect(Array.isArray(result.year.hiddenStems)).toBe(true);
      expect(result.year.hiddenStems.length).toBeGreaterThan(0);
    });

    it('異なる日時で異なる結果が返ること', () => {
      const date1 = new Date(1990, 0, 1, 0, 0, 0);
      const date2 = new Date(2000, 11, 31, 23, 59, 59);

      const result1 = calculateBaZi(date1, longitude);
      const result2 = calculateBaZi(date2, longitude);

      // 少なくとも年柱は異なるはず
      expect(result1.year.name).not.toBe(result2.year.name);
    });

    it('時刻が異なると時柱が異なること', () => {
      const morning = new Date(1983, 7, 11, 6, 0, 0); // 06:00
      const noon = new Date(1983, 7, 11, 12, 0, 0);   // 12:00
      const evening = new Date(1983, 7, 11, 18, 0, 0); // 18:00

      const result1 = calculateBaZi(morning, longitude);
      const result2 = calculateBaZi(noon, longitude);
      const result3 = calculateBaZi(evening, longitude);

      // 時柱は異なるはず
      expect(result1.hour.name).not.toBe(result2.hour.name);
      expect(result2.hour.name).not.toBe(result3.hour.name);

      // しかし日柱は同じはず
      expect(result1.day.name).toBe(result2.day.name);
      expect(result2.day.name).toBe(result3.day.name);
    });
  });

  describe('calculateFiveElements - 五行バランス計算', () => {
    it('五行の値が正しく計算されること', () => {
      const bazi = calculateBaZi(testDate, longitude);
      const elements = calculateFiveElements(bazi);

      // 五行の値が0以上であること
      expect(elements.wood).toBeGreaterThanOrEqual(0);
      expect(elements.fire).toBeGreaterThanOrEqual(0);
      expect(elements.earth).toBeGreaterThanOrEqual(0);
      expect(elements.metal).toBeGreaterThanOrEqual(0);
      expect(elements.water).toBeGreaterThanOrEqual(0);

      // 合計が0より大きいこと
      const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
      expect(total).toBeGreaterThan(0);
    });

    it('同じ四柱から同じ五行バランスが計算されること', () => {
      const bazi = calculateBaZi(testDate, longitude);

      const elements1 = calculateFiveElements(bazi);
      const elements2 = calculateFiveElements(bazi);

      expect(elements1).toEqual(elements2);
    });
  });

  describe('calculateYangSen - 陽占計算', () => {
    it('PC版の既知のテストデータと十大主星が完全一致すること', () => {
      const bazi = calculateBaZi(testDate, longitude);
      const yangSen = calculateYangSen(bazi, testDate);

      // 参照サイト（sanmeiapp.net）で検証した正しい期待値
      // 1983-08-11 12:00: 癸亥年 庚申月 辛未日 甲午時
      // 節入り: 8月8日 → 経過4日目（初気を使用）
      expect(yangSen.head).toBe('鳳閣星');      // 頭: 日干辛 × 年干癸
      expect(yangSen.rightHand).toBe('車騎星'); // 右手: 日干辛 × 日支蔵干丁（未の初気）
      expect(yangSen.chest).toBe('玉堂星');     // 胸: 日干辛 × 月支蔵干戊（申の初気）
      expect(yangSen.leftHand).toBe('司禄星');  // 左手: 日干辛 × 年支蔵干甲（亥の初気）
      expect(yangSen.belly).toBe('石門星');     // 腹: 日干辛 × 月干庚
    });

    it('十二大従星が参照サイトと一致すること', () => {
      const bazi = calculateBaZi(testDate, longitude);
      const yangSen = calculateYangSen(bazi, testDate);

      // 参照サイト（sanmeiapp.net）で検証済みの期待値
      // 1983-08-11: 日干=辛, 年支=亥, 月支=申, 日支=未
      expect(yangSen.leftShoulder.name).toBe('天恍星');  // 年支亥→左肩
      expect(yangSen.leftShoulder.score).toBe(7);
      expect(yangSen.rightLeg.name).toBe('天堂星');      // 日支未→右足
      expect(yangSen.rightLeg.score).toBe(8);
      expect(yangSen.leftLeg.name).toBe('天将星');       // 月支申→左足
      expect(yangSen.leftLeg.score).toBe(12);
    });

    it('十二大従星のスコアが有効範囲内であること', () => {
      const bazi = calculateBaZi(testDate, longitude);
      const yangSen = calculateYangSen(bazi);

      // スコアが1-12点の範囲内であること
      expect(yangSen.leftShoulder.score).toBeGreaterThanOrEqual(1);
      expect(yangSen.leftShoulder.score).toBeLessThanOrEqual(12);
      expect(yangSen.rightLeg.score).toBeGreaterThanOrEqual(1);
      expect(yangSen.rightLeg.score).toBeLessThanOrEqual(12);
      expect(yangSen.leftLeg.score).toBeGreaterThanOrEqual(1);
      expect(yangSen.leftLeg.score).toBeLessThanOrEqual(12);
    });

    it('人体図の位置関係が正しく定義されていること', () => {
      const bazi = calculateBaZi(testDate, longitude);
      const yangSen = calculateYangSen(bazi, testDate);

      // 人体図の配置（上から下、左から右）
      // 1983-08-11の例で位置と内容を検証（参照サイトで確認済み）

      // 上部: 頭
      expect(yangSen.head).toBe('鳳閣星'); // 日干×年干

      // 中段: 右手・胸・左手
      expect(yangSen.rightHand).toBe('車騎星'); // 日干×日支蔵干（二十八元）
      expect(yangSen.chest).toBe('玉堂星');     // 日干×月支蔵干（二十八元）
      expect(yangSen.leftHand).toBe('司禄星');  // 日干×年支蔵干（二十八元）

      // 下部: 腹
      expect(yangSen.belly).toBe('石門星'); // 日干×月干

      // 十二大従星の配置（参照サイトで検証済み）
      expect(yangSen.leftShoulder.name).toBe('天恍星');  // 年支亥→左肩
      expect(yangSen.rightLeg.name).toBe('天堂星');      // 日支未→右足
      expect(yangSen.leftLeg.name).toBe('天将星');       // 月支申→左足
    });

    it('同じ四柱から同じ陽占が計算されること', () => {
      const bazi = calculateBaZi(testDate, longitude);

      const yangSen1 = calculateYangSen(bazi);
      const yangSen2 = calculateYangSen(bazi);

      expect(yangSen1).toEqual(yangSen2);
    });
  });

  describe('calculateEnergyScore - エネルギー点数計算', () => {
    it('エネルギー点数が有効範囲内であること', () => {
      const bazi = calculateBaZi(testDate, longitude);
      const score = calculateEnergyScore(bazi);

      // エネルギー点数の範囲: 0-120点
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(120);
    });

    it('同じ四柱から同じエネルギー点数が計算されること', () => {
      const bazi = calculateBaZi(testDate, longitude);

      const score1 = calculateEnergyScore(bazi);
      const score2 = calculateEnergyScore(bazi);

      expect(score1).toBe(score2);
    });

    it('異なる四柱で異なるエネルギー点数が計算される可能性があること', () => {
      const date1 = new Date(1990, 0, 1, 0, 0, 0);
      const date2 = new Date(2000, 11, 31, 23, 59, 59);

      const bazi1 = calculateBaZi(date1, longitude);
      const bazi2 = calculateBaZi(date2, longitude);

      const score1 = calculateEnergyScore(bazi1);
      const score2 = calculateEnergyScore(bazi2);

      // 点数は数値であること
      expect(typeof score1).toBe('number');
      expect(typeof score2).toBe('number');
    });
  });

  describe('統合テスト - 完全な計算フロー', () => {
    it('生年月日から最終結果まで正しく計算できること', () => {
      // Step 1: 四柱推命計算
      const bazi = calculateBaZi(testDate, longitude);
      expect(bazi).toBeTruthy();

      // Step 2: 五行バランス計算
      const fiveElements = calculateFiveElements(bazi);
      expect(fiveElements).toBeTruthy();

      // Step 3: 陽占計算
      const yangSen = calculateYangSen(bazi);
      expect(yangSen).toBeTruthy();

      // Step 4: エネルギー点数計算
      const energyScore = calculateEnergyScore(bazi);
      expect(energyScore).toBeTruthy();

      // 全てのデータが揃っていること
      expect(bazi.year).toBeTruthy();
      expect(bazi.month).toBeTruthy();
      expect(bazi.day).toBeTruthy();
      expect(bazi.hour).toBeTruthy();

      expect(fiveElements.wood).toBeDefined();
      expect(fiveElements.fire).toBeDefined();
      expect(fiveElements.earth).toBeDefined();
      expect(fiveElements.metal).toBeDefined();
      expect(fiveElements.water).toBeDefined();

      expect(yangSen.head).toBeTruthy();
      expect(yangSen.chest).toBeTruthy();
      expect(yangSen.leftShoulder).toBeTruthy();

      expect(typeof energyScore).toBe('number');
    });
  });

  describe('境界値テスト', () => {
    it('1900年のデータが計算できること', () => {
      const oldDate = new Date(1900, 0, 1, 12, 0, 0);
      const result = calculateBaZi(oldDate, longitude);

      expect(result.year).toBeTruthy();
      expect(result.month).toBeTruthy();
      expect(result.day).toBeTruthy();
      expect(result.hour).toBeTruthy();
    });

    it('2100年のデータが計算できること', () => {
      const futureDate = new Date(2100, 11, 31, 12, 0, 0);
      const result = calculateBaZi(futureDate, longitude);

      expect(result.year).toBeTruthy();
      expect(result.month).toBeTruthy();
      expect(result.day).toBeTruthy();
      expect(result.hour).toBeTruthy();
    });

    it('子の刻（23:00-01:00）が正しく計算されること', () => {
      const midnight = new Date(1983, 7, 11, 23, 30, 0);
      const result = calculateBaZi(midnight, longitude);

      expect(result.hour.branchStr).toBe('子');
    });

    it('異なる経度でも計算できること', () => {
      const tokyo = 139.7; // 東京の経度
      const osaka = 135.5; // 大阪の経度

      const result1 = calculateBaZi(testDate, tokyo);
      const result2 = calculateBaZi(testDate, osaka);

      // 結果が取得できること
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
    });
  });

  describe('定数の妥当性テスト', () => {
    it('STEMS配列が10個の要素を持つこと', () => {
      expect(STEMS).toHaveLength(10);
      expect(STEMS[0]).toBe('甲');
      expect(STEMS[9]).toBe('癸');
    });

    it('BRANCHES配列が12個の要素を持つこと', () => {
      expect(BRANCHES).toHaveLength(12);
      expect(BRANCHES[0]).toBe('子');
      expect(BRANCHES[11]).toBe('亥');
    });
  });
});
