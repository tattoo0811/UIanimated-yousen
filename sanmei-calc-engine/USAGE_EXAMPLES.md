# Sanmei-gaku Engine - Usage Examples

## Basic Import and Usage

```typescript
import { calculateFourPillars, STEMS, BRANCHES, KANSHI } from './src/index';

// Calculate four pillars for a birth date
const pillars = calculateFourPillars(1985, 4, 18, 10);

console.log('Year Pillar:', pillars.year.stem + pillars.year.branch);
console.log('Month Pillar:', pillars.month.stem + pillars.month.branch);
console.log('Day Pillar:', pillars.day.stem + pillars.day.branch);
console.log('Hour Pillar:', pillars.hour.stem + pillars.hour.branch);
```

## Working with Constants

```typescript
import { STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS } from './src/constants';

// Access stem information
const stem = STEMS[0]; // '甲'
console.log('Stem element:', STEM_ELEMENTS[stem]); // '木'

// Access branch information
const branch = BRANCHES[0]; // '子'
console.log('Branch element:', BRANCH_ELEMENTS[branch]); // '水'

// Get kanshi name
import { kanshiIndexToString } from './src/constants';
console.log('Kanshi at index 0:', kanshiIndexToString(0)); // '甲子'
console.log('Kanshi at index 59:', kanshiIndexToString(59)); // '癸亥'
```

## Working with Four Pillars

```typescript
import { calculateFourPillars } from './src/fourPillars';

const pillars = calculateFourPillars(2000, 1, 1, 12);

// Access all pillar properties
const yearPillar = pillars.year;
console.log({
  stem: yearPillar.stem,           // '甲'
  branch: yearPillar.branch,       // '午' (example)
  kanshiIndex: yearPillar.kanshiIndex,
  element: yearPillar.element,     // Element from stem
  yinYang: yearPillar.yinYang,     // 'yang' or 'yin'
  stemElement: yearPillar.stemElement,
  branchElement: yearPillar.branchElement,
});
```

## Hidden Stems Data

```typescript
import { HIDDEN_STEMS } from './src/constants';

// Get hidden stems for a branch
const hiddenStemsForMonth = HIDDEN_STEMS['子'];
console.log('Hidden stems for 子 month:');
console.log('Main stem:', hiddenStemsForMonth.main); // '癸'
console.log('Timings:', hiddenStemsForMonth.timings);

// For a multi-stem branch like 丑
const hiddenStemsForUi = HIDDEN_STEMS['丑'];
console.log('Hidden stems for 丑 month:');
hiddenStemsForUi.timings.forEach(timing => {
  console.log(`Days 1-${timing.days}: ${timing.stem}`);
});
// Output:
// Days 1-9: 癸
// Days 10-12: 辛
// Days 13-30: 己
```

## Type Safety with TypeScript

```typescript
import { 
  FourPillars, 
  Pillar,
  Stem,
  Branch,
  Element,
  FourPillarsCalculationOptions
} from './src/types';

function analyzePillar(pillar: Pillar): string {
  const element: Element = pillar.element;
  const stem: Stem = pillar.stem;
  const branch: Branch = pillar.branch;
  
  return `${stem}${branch} (${element})`;
}

const pillars: FourPillars = calculateFourPillars(1985, 4, 18, 10);

console.log('Year:', analyzePillar(pillars.year));
console.log('Month:', analyzePillar(pillars.month));
console.log('Day:', analyzePillar(pillars.day));
console.log('Hour:', analyzePillar(pillars.hour));
```

## Reference Formulas in Code

### Year Pillar Calculation
```typescript
// Year Pillar: 甲 = 1900, 乙 = 1901, ..., 癸 = 1909, 甲 = 1910, ...
// Pattern repeats every 60 years

const year = 1985;
const stemIndex = (year - 4) % 10;  // (1985 - 4) % 10 = 1 = 乙
const branchIndex = (year - 4) % 12; // (1985 - 4) % 10 = 1 = 丑
// Result: 乙丑
```

### Month Pillar via 五虎遁
```typescript
// Year 1985 = 乙干 (index 1)
// 乙年 → WU_HU_DUN[1 % 5] = WU_HU_DUN[1] = 4 (戊)
// So Yin month (寅月) starts with 戊 (戊寅)
// April 18 is in Yin month (after 立春 Feb 4)
// 戊 → 己 → 庚 → 辛 → 壬 → 癸 → 甲 → 乙 (continuing)
```

### Day Pillar via Julian Day Number
```typescript
// For any Gregorian date:
const jdn = gregorianToJDN(2000, 1, 1); // JDN = 2451545
const stemIdx = (jdn + 9) % 10;    // Stem index
const branchIdx = (jdn + 1) % 12;  // Branch index

// Validation: 1900-01-01
// JDN(1900-01-01) = 2415021
// (2415021 + 9) % 10 = 0 (甲)
// (2415021 + 1) % 12 = 10 (戌)
// Result: 甲戌 ✓
```

### Hour Pillar via 五鼠遁
```typescript
// Hour 10 = 10:00 AM
// Branch: floor((10 + 1) / 2) % 12 = floor(5.5) % 12 = 5 = 巳
// If day stem is 甲 (index 0)
// WU_SHU_DUN[0 % 5] = 0 (甲)
// Hour stem: (0 + 5) % 10 = 5 = 己
// Result: 己巳
```

## Extending with Hidden Stems

```typescript
import { HIDDEN_STEMS, Branch } from './src/constants';
import { calculateFourPillars } from './src/fourPillars';

function getHiddenStemForDate(branch: Branch, dayOfMonth: number): string {
  const hiddenInfo = HIDDEN_STEMS[branch];
  
  // Find which stem applies on this day
  for (const timing of hiddenInfo.timings) {
    if (dayOfMonth <= timing.days) {
      return timing.stem;
    }
  }
  
  return hiddenInfo.main; // Fallback to main
}

// Example: what's the hidden stem in Yin month (寅月) on day 10?
const hiddenStemDay10 = getHiddenStemForDate('寅', 10);
console.log(hiddenStemDay10); // '丙' (days 8-14)
```

## Validation Examples

```typescript
import { calculateFourPillars } from './src/fourPillars';

// Valid calculation
try {
  const result = calculateFourPillars(1985, 4, 18, 10);
  console.log('Calculation successful');
} catch (e) {
  console.error('Calculation failed:', e.message);
}

// Invalid year (out of range)
try {
  const result = calculateFourPillars(1700, 4, 18, 10);
} catch (e) {
  console.error(e.message); // "Year must be between 1800 and 2100"
}

// Invalid month
try {
  const result = calculateFourPillars(1985, 13, 18, 10);
} catch (e) {
  console.error(e.message); // "Month must be between 1 and 12"
}

// Invalid hour
try {
  const result = calculateFourPillars(1985, 4, 18, 25);
} catch (e) {
  console.error(e.message); // "Hour must be between 0 and 23"
}
```

## Data Structure Access Pattern

```typescript
import { FourPillars, Pillar } from './src/types';
import { STEM_YIN_YANG, BRANCH_YIN_YANG } from './src/constants';

function printFullAnalysis(pillars: FourPillars): void {
  const pillars_array: [string, Pillar][] = [
    ['Year', pillars.year],
    ['Month', pillars.month],
    ['Day', pillars.day],
    ['Hour', pillars.hour],
  ];

  for (const [name, pillar] of pillars_array) {
    const stemYinYang = STEM_YIN_YANG[pillar.stem];
    const branchYinYang = BRANCH_YIN_YANG[pillar.branch];
    
    console.log(`${name}:`);
    console.log(`  Characters: ${pillar.stem}${pillar.branch}`);
    console.log(`  Kanshi Index: ${pillar.kanshiIndex}`);
    console.log(`  Stem Element: ${pillar.stemElement} (${stemYinYang})`);
    console.log(`  Branch Element: ${pillar.branchElement} (${branchYinYang})`);
    console.log('');
  }
}

const pillars = calculateFourPillars(1985, 4, 18, 10);
printFullAnalysis(pillars);
```

## Notes for Integration with Team B & C

### For Team B (Relationship Calculations)
The `FourPillars` structure provides:
- All stem and branch information needed for Ten Star calculations
- Element data for compatibility analysis
- Yin/Yang classification for relationship scoring

### For Team C (UI/API)
Export the following from this module:
- `calculateFourPillars()` - Main API function
- `FourPillars`, `Pillar` types - For API responses
- `STEMS`, `BRANCHES` - For dropdown displays
- `KANSHI` - For full cycle reference
- Helper functions from constants for display formatting

