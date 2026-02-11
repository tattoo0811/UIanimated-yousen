// TODO: Restore import when lib file is available
// import { calculateBaZi } from '@/src/lib/logic';

// Stub implementations for disabled tests
const calculateBaZi = () => ({ year: { name: '' }, month: { name: '' }, day: { name: '' }, hour: { name: '' } });

describe('calculateBaZi', () => {
    it('calculates correct BaZi for 1983-08-11 12:00', () => {
        // 1983年8月11日 12:00
        // 年: 癸亥
        // 月: 庚申
        // 日: 辛未
        const date = new Date(1983, 7, 11, 12, 0, 0);
        const bazi = calculateBaZi(date);

        expect(bazi.year.name).toBe('癸亥');
        expect(bazi.month.name).toBe('庚申');
        expect(bazi.day.name).toBe('辛未');
    });

    it('calculates correct BaZi for 1984-12-02 12:00 (Koushi)', () => {
        // 1984年12月2日 12:00
        // 年: 甲子
        // 月: 乙亥
        // 日: 庚午
        const date = new Date(1984, 11, 2, 12, 0, 0);
        const bazi = calculateBaZi(date);

        expect(bazi.year.name).toBe('甲子');
        expect(bazi.month.name).toBe('乙亥'); // 節入り前か後かで変わるが、12/2は節入り前（12/7頃）なので前月（乙亥）
        expect(bazi.day.name).toBe('庚午');
    });

    // TODO: Fix logic.ts to use Solar Terms (Lichun) instead of Lunar Year.
    // Currently calculateBaZi uses lunar.getYearInGanZhi() which is Lunar New Year based.
});
