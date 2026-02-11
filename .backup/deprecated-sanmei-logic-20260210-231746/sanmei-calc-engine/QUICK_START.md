# Quick Start Guide

## Installation

No installation required! Pure TypeScript with zero dependencies.

```bash
# Simply import from the module
import { calculateFourPillars } from './src/fourPillars';
import { STEMS, BRANCHES, KANSHI } from './src/constants';
```

## Basic Usage

### 1. Calculate Four Pillars from Birth Date

```typescript
import { calculateFourPillars } from './src/fourPillars';

// Calculate for: 1985年4月18日 10時
const pillars = calculateFourPillars(1985, 4, 18, 10);

console.log('Year Pillar:', pillars.year.stem + pillars.year.branch);
console.log('Month Pillar:', pillars.month.stem + pillars.month.branch);
console.log('Day Pillar:', pillars.day.stem + pillars.day.branch);
console.log('Hour Pillar:', pillars.hour.stem + pillars.hour.branch);
```

### 2. Access Pillar Details

```typescript
const dayPillar = pillars.day;

console.log({
  stem: dayPillar.stem,           // Heavenly Stem
  branch: dayPillar.branch,       // Earthly Branch
  element: dayPillar.element,     // Element from stem
  stemElement: dayPillar.stemElement,
  branchElement: dayPillar.branchElement,
  yinYang: dayPillar.yinYang,     // 'yang' or 'yin'
  kanshiIndex: dayPillar.kanshiIndex, // 0-59 cycle position
});
```

### 3. Look Up Constants

```typescript
import { STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS } from './src/constants';

// Get all stems
console.log(STEMS);  // ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// Get all branches
console.log(BRANCHES);  // ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// Look up element
const stem = '甲';
console.log(STEM_ELEMENTS[stem]);  // '木'

const branch = '子';
console.log(BRANCH_ELEMENTS[branch]);  // '水'
```

### 4. Get Hidden Stems

```typescript
import { HIDDEN_STEMS } from './src/constants';

// Get hidden stems for a branch
const hiddenInfo = HIDDEN_STEMS['寅'];
console.log('Main stem:', hiddenInfo.main);  // '甲'
console.log('Timings:', hiddenInfo.timings);
// [ { stem: '戊', days: 7 }, { stem: '丙', days: 14 }, { stem: '甲', days: 30 } ]

// For the day of the month, find which stem applies
const dayOfMonth = 10;
const applicableStem = hiddenInfo.timings.find(t => dayOfMonth <= t.days);
console.log('Stem on day 10:', applicableStem?.stem);  // '丙'
```

### 5. Use Transformation Formulas

```typescript
import { WU_HU_DUN, WU_SHU_DUN } from './src/constants';

// Wu Hu Dun: Year stem → Month stem
const yearStemIndex = 1;  // 乙
const monthStartStemIndex = WU_HU_DUN[yearStemIndex % 5];  // 4 (戊)

// Wu Shu Dun: Day stem → Hour stem
const dayStemIndex = 0;  // 甲
const hourStartStemIndex = WU_SHU_DUN[dayStemIndex % 5];  // 0 (甲)
```

### 6. Access Kanshi Cycle

```typescript
import { KANSHI, kanshiIndexToString } from './src/constants';

// Get a specific kanshi
console.log(KANSHI[0]);   // ['甲', '子'] (甲子)
console.log(KANSHI[59]);  // ['癸', '亥'] (癸亥)

// Convert to string
console.log(kanshiIndexToString(0));   // '甲子'
console.log(kanshiIndexToString(59));  // '癸亥'
```

### 7. Type-Safe Code with TypeScript

```typescript
import { FourPillars, Pillar, Stem, Branch, Element } from './src/types';
import { calculateFourPillars } from './src/fourPillars';

// Function with type safety
function analysePillar(pillar: Pillar): string {
  const stem: Stem = pillar.stem;
  const branch: Branch = pillar.branch;
  const element: Element = pillar.element;
  
  return `${stem}${branch} (${element})`;
}

// Use with type checking
const pillars: FourPillars = calculateFourPillars(1985, 4, 18, 10);
console.log('Day:', analysePillar(pillars.day));
```

## Error Handling

```typescript
import { calculateFourPillars } from './src/fourPillars';

try {
  const pillars = calculateFourPillars(1985, 4, 18, 10);
  console.log('Calculation successful');
} catch (error) {
  if (error instanceof Error) {
    console.error('Calculation error:', error.message);
  }
}

// Input validation examples:
// - Year must be 1800-2100
// - Month must be 1-12
// - Day must be 1-31
// - Hour must be 0-23
```

## Common Patterns

### Pattern 1: Get Complete Pillar Info

```typescript
function getPillarInfo(pillars: FourPillars, position: 'year' | 'month' | 'day' | 'hour') {
  const pillar = pillars[position];
  return {
    characters: pillar.stem + pillar.branch,
    stemElement: pillar.stemElement,
    branchElement: pillar.branchElement,
    yinYang: pillar.yinYang,
    kanshiIndex: pillar.kanshiIndex,
  };
}

const pillars = calculateFourPillars(2000, 1, 1, 12);
console.log(getPillarInfo(pillars, 'day'));
```

### Pattern 2: Print All Four Pillars

```typescript
function printFourPillars(pillars: FourPillars): void {
  const positions: Array<[string, keyof FourPillars]> = [
    ['Year', 'year'],
    ['Month', 'month'],
    ['Day', 'day'],
    ['Hour', 'hour'],
  ];

  for (const [name, key] of positions) {
    const pillar = pillars[key];
    console.log(`${name}: ${pillar.stem}${pillar.branch}`);
  }
}

const pillars = calculateFourPillars(1985, 4, 18, 10);
printFourPillars(pillars);
```

### Pattern 3: Build Lookup Functions

```typescript
import { HIDDEN_STEMS, BUILD_LUCK_BRANCH } from './src/constants';
import type { Branch, Stem } from './src/types';

function getHiddenStemOnDay(branch: Branch, dayOfMonth: number): Stem {
  const hiddenInfo = HIDDEN_STEMS[branch];
  for (const timing of hiddenInfo.timings) {
    if (dayOfMonth <= timing.days) {
      return timing.stem;
    }
  }
  return hiddenInfo.main;
}

function getLuckyBranch(stem: Stem): Branch {
  return BUILD_LUCK_BRANCH[stem];
}

// Usage
console.log(getHiddenStemOnDay('寅', 10));  // '丙'
console.log(getLuckyBranch('甲'));          // '寅'
```

## Testing Your Implementation

```typescript
import { calculateFourPillars } from './src/fourPillars';

// Test with a known date
const result = calculateFourPillars(2000, 1, 1, 12);

// Expected output example:
// Year: (calculated from 1896-1900 range)
// Month: (calculated from Jan 1 before Lichun)
// Day: (calculated using JDN)
// Hour: (calculated from noon)

console.log('Year:', result.year.stem + result.year.branch);
console.log('Month:', result.month.stem + result.month.branch);
console.log('Day:', result.day.stem + result.day.branch);
console.log('Hour:', result.hour.stem + result.hour.branch);
```

## Next Steps

1. Explore `/src/types.ts` for all available types
2. Check `/src/constants.ts` for all data structures
3. Read USAGE_EXAMPLES.md for advanced patterns
4. Review VERIFICATION.md for algorithm details

## Integration Notes

- For Team B (Relationships): Use `FourPillars` and `TenStar`/`TwelveStar` types
- For Team C (UI/API): Export `calculateFourPillars()` and constants for display
- All calculations are deterministic - same input always produces same output
- No external dependencies - pure TypeScript only
