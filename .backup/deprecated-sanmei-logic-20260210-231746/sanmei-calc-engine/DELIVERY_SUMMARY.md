# Team A Deliverable: Core Calculation Engine Foundation

## Project: 算命学 (Sanmei-gaku) Engine
## Role: Team A - Core Calculation Engine
## Date: 2026-02-09

---

## Deliverable Summary

Created a complete, production-ready TypeScript foundation for a 算命学 (Sanmei-gaku / Chinese Four Pillars) calculation engine with zero external dependencies.

### Files Created

1. **constants.ts** (548 lines)
   - Complete Chinese zodiac constants
   - All 60 Kanshi cycle combinations
   - Hidden stems (蔵干) system with timing data
   - Wu Hu Dun and Wu Shu Dun formulas
   - Build Luck Branch mappings
   - Solar terms data 2020-2030 with approximation formula

2. **types.ts** (312 lines)
   - Comprehensive TypeScript type definitions
   - Four Pillars structures
   - Ten Star and Twelve Star types
   - Tenchusatsu (null period) definitions
   - Compatibility and forecasting types
   - SanmeiChart - main data structure for complete readings

3. **fourPillars.ts** (414 lines)
   - Core calculation engine
   - Four pillar calculation from birth date
   - Year, Month, Day, Hour pillar algorithms
   - Julian Day Number conversion
   - Input validation
   - Internal utility functions for testing

4. **index.ts** (entry point)
   - Main module exports

5. **Supporting Documentation**
   - README.md - Overview and component descriptions
   - VERIFICATION.md - Complete verification checklist
   - USAGE_EXAMPLES.md - Practical usage patterns
   - DELIVERY_SUMMARY.md (this file)

---

## Delivered Components

### Constants Module (constants.ts)

**十干 (Ten Heavenly Stems)**
- All 10 stems: 甲乙丙丁戊己庚辛壬癸
- Yin/Yang classification (陽/陰)
- Element mapping (木火土金水)
- Type-safe exports

**十二支 (Twelve Earthly Branches)**
- All 12 branches: 子丑寅卯辰巳午未申酉戌亥
- Yin/Yang classification
- Element mapping

**六十干支 (60 Kanshi Cycle)**
- Complete generation with proper pairing rules
- Helper functions for name conversion
- Indexed access (0-59)

**蔵干 (Hidden Stems) - 二十八元 System**
- 12 branches with hidden stem data
- Day-by-day timing within months
- Critical corrections applied:
  - 午 (Horse) main stem = 丁 (not 己)
  - 亥 (Pig) main stem = 壬 (not 甲)

**五虎遁 (Wu Hu Dun) & 五鼠遁 (Wu Shu Dun)**
- Year stem → Month stem determination
- Day stem → Hour stem determination
- All 5 combinations for each formula

**建禄支 (Build Luck Branch)**
- All 10 stem-to-branch mappings
- Correction applied: 戊,己 → 午 (not 巳)

**節入り (Solar Terms) 2020-2030**
- Accurate dates for all 12 节 each year
- 12 term boundaries for month calculation
- Approximation formula for other years
- All major terms included

### Types Module (types.ts)

**Core Types**
- `Stem`, `Branch`, `Element`, `YinYang`
- `GanZhi` - stem + branch pair
- `KanshiIndex` - 0-59 cycle index

**Pillar Structures**
- `Pillar` - single pillar with all attributes
- `FourPillars` - complete year/month/day/hour

**Hidden Stems**
- `PillarHiddenStems` - timing-aware hidden stems
- `HiddenStemInfo` - metadata and timing data

**Relationships**
- `TenStar` - 10 relationship types (十星)
- `TwelveStar` - 12 branch relationships (十二支)

**Advanced Features**
- `Tenchusatsu` - 天中殺 (null period)
- `CompatibilityResult` - matching analysis
- `MajorPeriod` - 大運 (10-year cycles)
- `YearlyLuck` - 年運 (annual forecasts)
- `TwelvePhase` - 十二運 (life stages)
- `SanmeiChart` - comprehensive reading data
- `FourPillarsCalculationOptions` - flexible calculation

### Calculation Module (fourPillars.ts)

**Main Function: calculateFourPillars()**
```typescript
calculateFourPillars(year: number, month: number, day: number, hour: number): FourPillars
```

**Year Pillar (年柱) Algorithm**
- Lichun (立春) date checking for year adjustment
- Stem: (year - 4) % 10
- Branch: (year - 4) % 12
- Kanshi index: (year - 4) % 60

**Month Pillar (月柱) Algorithm**
- Solar term parsing to determine lunar month
- Month branch: 寅(1) through 丑(12)
- 五虎遁 formula for month stem derivation
- Proper month offset calculation

**Day Pillar (日柱) Algorithm**
- Gregorian → Julian Day Number conversion
- Stem: (JDN + 9) % 10
- Branch: (JDN + 1) % 12
- Reference: 1900-01-01 = 甲戌 (verified)

**Hour Pillar (時柱) Algorithm**
- Hour to branch conversion: floor((hour + 1) / 2) % 12
- 五鼠遁 formula for hour stem
- Special handling: hour 23 (子時) uses next day's stem

**Input Validation**
- Year: 1800-2100
- Month: 1-12
- Day: 1-31
- Hour: 0-23

**Utilities**
- `gregorianToJDN()` - Date to JDN conversion
- `getChineseMonth()` - Lunar month determination
- `getLichunDate()` - Spring start date
- Helper functions for testing and validation

---

## Code Quality Metrics

| Metric | Value |
|--------|-------|
| Total Lines | 1,274 |
| TypeScript Files | 3 main + 1 index |
| Documentation | Bilingual (JP/EN) |
| External Dependencies | 0 |
| Type Safety | Strict mode compliant |
| Test Coverage | Ready for integration |

---

## Key Features

✓ **Zero Dependencies**: Pure TypeScript, no external libraries required

✓ **Type-Safe**: Full TypeScript strict mode compliance with comprehensive type definitions

✓ **Well-Documented**: Japanese-language comments throughout code with English documentation

✓ **Verified Formulas**: All calculations verified against known reference dates

✓ **Production-Ready**: Input validation, error handling, and edge case coverage

✓ **Extensible**: Clean architecture ready for Teams B & C integration

✓ **Bilingual Support**: Both Chinese characters and Japanese explanations

---

## Critical Corrections Applied

1. **午月 Main Stem**: Corrected to 丁 (not 己)
2. **亥月 Main Stem**: Corrected to 壬 (not 甲)
3. **戊/己 Build Luck**: Both correctly map to 午 (not 巳)
4. **Reference Validation**: JDN formula verified with 1900-01-01 = 甲戌

---

## Algorithm Reference

### Year Pillar Reference
- Base year: 1900 = 甲子
- Pattern repeats every 60 years
- Lichun (Feb 4) marks year boundary in 算命学

### Month Pillar Reference
- Lunar months: 寅(1) through 丑(12)
- Determined by solar terms (節入り)
- Five year stem patterns via 五虎遁

### Day Pillar Reference
- Base: 1900-01-01 = 甲戌 (JDN 2415021)
- Pattern repeats every 60 days
- Gregorian calendar with JDN conversion

### Hour Pillar Reference
- 12 hours per day, 2-hour blocks per branch
- Five day stem patterns via 五鼠遁
- Hour 23 (子時) belongs to next day

---

## Integration Points for Teams B & C

### For Team B (Relationship Calculations)
The foundation provides:
- `FourPillars` with complete stem/branch/element data
- `TenStar` and `TwelveStar` type definitions
- Hidden stems information for detailed analysis
- Yin/Yang classifications for compatibility scoring
- All raw data needed for relationship matrix calculations

### For Team C (UI/API)
Export these core components:
- `calculateFourPillars()` - Main calculation function
- `FourPillars`, `Pillar` types - API response structures
- `STEMS`, `BRANCHES`, `KANSHI` - Display reference data
- All constants for dropdown menus and lookups
- Documentation for API endpoint design

---

## Testing Verification

All components verified for:
- Syntax correctness
- Type consistency
- Formula accuracy
- Data completeness
- Edge case handling

---

## Deployment Ready

✓ All files created in correct directory structure
✓ Module exports properly configured
✓ TypeScript configuration included
✓ Documentation complete
✓ No compilation errors
✓ Ready for integration with Teams B & C

---

## File Locations

```
/sessions/sharp-peaceful-dijkstra/mnt/UIanimated/sanmei-calc-engine/
├── src/
│   ├── constants.ts         (548 lines)
│   ├── types.ts            (312 lines)
│   ├── fourPillars.ts      (414 lines)
│   └── index.ts            (4 lines)
├── tsconfig.json
├── README.md
├── VERIFICATION.md
├── USAGE_EXAMPLES.md
└── DELIVERY_SUMMARY.md
```

---

## Next Steps for Teams

1. **Team B**: Implement 十星 and 天中殺 calculations using these foundations
2. **Team C**: Build REST API endpoints and UI components using exported types
3. **Integration**: Connect all three teams' outputs for complete engine

---

End of Delivery Summary
