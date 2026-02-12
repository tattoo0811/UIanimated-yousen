# Phase 2: 13章構造可視化 - Research

**Researched:** 2026-02-12
**Domain:** React data visualization, timeline UI patterns, expandable components
**Confidence:** HIGH

## Summary

Phase 2 requires visualizing the 13-chapter structure of the 120-episode story, with each chapter containing episode ranges, time periods, themes, and character associations. The implementation must integrate seamlessly with Phase 1's established patterns while introducing expandable chapter details and 3-part structure mapping.

**Primary recommendation:** Use accordion-style expandable cards for chapters with a nested grid layout for episode ranges, leveraging existing component patterns (OverviewStats, StoryPartsDisplay) and Framer Motion for smooth expand/collapse animations.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | UI framework | Already in use, provides hooks for state management |
| Next.js | 16.1.1 | App Router | Existing project infrastructure |
| TypeScript | 5.x | Type safety | Already configured, prevents data structure errors |
| Tailwind CSS | 4.x | Styling | Existing utility classes, responsive design |
| Framer Motion | 12.23.26 | Animations | Already used for animations, provides smooth transitions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.562.0 | Icons | Chapter headers, expand/collapse indicators |
| clsx | 2.1.1 | Conditional classes | Dynamic styling for chapter states |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom accordion | @radix-ui/react-accordion | Radix provides accessible primitives, but adds dependency. Custom implementation with Framer Motion is sufficient for this use case and maintains consistency with existing components |
| Static timeline | Interactive timeline (vis.js, D3) | Static visualization is sufficient. Interactive libraries add complexity and bundle size without providing additional value for this phase |

**Installation:**
No additional packages needed. All required libraries are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── data/
│   └── chapters.ts          # NEW: 13-chapter data structure
├── components/
│   └── features/
│       └── ThirteenChapters.tsx  # NEW: Main chapters component
└── app/
    └── dashboard/
        └── page.tsx          # MODIFIED: Add chapters tab
```

### Pattern 1: Expandable Chapter Cards with Accordion Pattern
**What:** Parent component managing expanded state for 13 chapters, with smooth expand/collapse animations

**When to use:** When you need to show hierarchical data (chapter summary → detailed timeline) without overwhelming users

**Example:**
```typescript
// Source: Based on existing StoryPartsDisplay.tsx pattern
interface ChapterData {
  id: number;
  name: string;
  episodeRange: [number, number];
  period: string;
  theme: string;
  part: 'foundation' | 'conflict' | 'integration';
}

export function ThirteenChapters() {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {CHAPTERS_DATA.map((chapter) => (
        <motion.div
          key={chapter.id}
          // Expandable pattern with Framer Motion
        >
          {/* Chapter header - always visible */}
          {/* Chapter details - visible when expanded */}
        </motion.div>
      ))}
    </div>
  );
}
```

### Pattern 2: Three-Part Structure Mapping Visualizer
**What:** Visual representation showing which chapters belong to which story part (foundation/conflict/integration)

**When to use:** When users need to understand hierarchical grouping (13 chapters → 3 parts)

**Example:**
```typescript
// Color-coded part indicators on each chapter
const PART_COLORS = {
  foundation: 'from-emerald-500 to-green-500',
  conflict: 'from-amber-500 to-orange-500',
  integration: 'from-violet-500 to-purple-500'
};

// Chapter header shows part membership via colored badge
<motion.div className={`flex items-center gap-2 ${PART_COLORS[chapter.part]}`}>
  <span className="text-xs font-mono bg-slate-900/50 px-2 py-1 rounded">
    第{chapter.id}章
  </span>
  <Badge variant={chapter.part}>{PART_NAMES[chapter.part]}</Badge>
</motion.div>
```

### Pattern 3: Episode Range Display with Grid Layout
**What:** Visual grid showing episode numbers within each chapter's range

**When to use:** When displaying ranges (e.g., "第1-8話") in a scannable format

**Example:**
```typescript
// Phase 1 OverviewStats.tsx pattern (3-column grid)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
  {chapter.episodes.map((ep) => (
    <div key={ep} className="bg-slate-800/30 rounded-lg p-3">
      <span className="text-sm text-slate-300">第{ep}話</span>
    </div>
  ))}
</div>
```

### Anti-Patterns to Avoid
- **Nested accordions**: Don't put accordions inside accordions. 13 chapters → expandable details is sufficient. Adding episode-level accordions creates UI complexity
- **Separate page for details**: Don't navigate away to show chapter details. Expand inline to maintain context
- **Hardcoded episode ranges**: Don't repeat range calculations. Derive from start/end episode numbers
- **Animation overload**: Don't animate every element. Animate chapter expand/collapse, but keep episode display static for performance

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accordion state management | Custom useState with nested conditions | Single expandedChapter state (number | null) | Simplest pattern for single-selection accordion |
| Expand/collapse animations | CSS transitions with height: auto | Framer Motion AnimatePresence | Handles height: 0 → height: auto smoothly with spring physics |
| Responsive grid | Media queries in CSS | Tailwind responsive classes (grid-cols-1 sm:grid-cols-2) | Already configured, mobile-first approach |
| Icon selection | Inline SVG strings | lucide-react icons (ChevronDown, ChevronUp) | Consistent with existing components, tree-shakeable |

**Key insight:** Phase 1 established patterns for card layouts, grid systems, and color schemes. Reuse these patterns rather than creating new visual language. The accordion pattern is the only new interaction pattern, and Framer Motion makes this straightforward.

## Common Pitfalls

### Pitfall 1: Data Structure Mismatch
**What goes wrong:** Chapter data from DASHBOARD.md doesn't map cleanly to TypeScript interfaces

**Why it happens:** DASHBOARD.md uses mixed formats (episode ranges as "第1-8話", periods as date ranges, themes as narrative text)

**How to avoid:**
1. Create clean TypeScript interfaces that normalize data
2. Parse episode ranges into numbers (start: 1, end: 8)
3. Store period as structured object (startDate, endDate)
4. Keep theme text as-is for display

**Warning signs:** Type coercion errors, "Cannot read property of undefined" when accessing nested data

### Pitfall 2: Over-Nesting Components
**What goes wrong:** Creating separate components for ChapterHeader, ChapterContent, EpisodeGrid, etc. when they're only used once

**Why it happens:** Following "separation of concerns" too rigidly for a small feature

**How to avoid:** Keep it in one file (ThirteenChapters.tsx) unless subcomponents are reused 3+ times

**Warning signs:** Prop-drilling becomes complex, file has 5+ imports for local components

### Pitfall 3: Animation Performance with 13 Chapters
**What goes wrong:** Expanding/collapsing chapters feels laggy, especially on mobile

**Why it happens:** Animating all 13 chapters simultaneously, or using layout thrashing (reading height → setting height)

**How to avoid:**
1. Only animate the expanding chapter, not all chapters
2. Use Framer Motion's layout prop for automatic layout animations
3. Test on mobile device (not just DevTools responsive mode)

**Warning signs:** Frame rate drops below 30fps during expansion

### Pitfall 4: Part-to-Chapter Mapping Confusion
**What goes wrong:** Users can't tell which part (foundation/conflict/integration) a chapter belongs to

**Why it happens:** Relying solely on chapter numbers (1-13) without visual part indicators

**How to avoid:**
1. Color-code part badges (consistent with Phase 1 StoryPartsDisplay colors)
2. Show part name in chapter header
3. Consider part section dividers in the list

**Warning signs:** Users have to scroll back and forth to understand chapter context

## Code Examples

Verified patterns from official sources:

### Data Structure for 13 Chapters
```typescript
// Source: DASHBOARD.md 13章構造セクション
export interface Chapter {
  id: number;              // 1-13
  name: string;            // "出会いの章"
  episodeStart: number;     // 1
  episodeEnd: number;       // 8
  period: string;          // "2026年4月前半"
  theme: string;           // "運命診断室の開院と最初の患者たち"
  part: 'foundation' | 'conflict' | 'integration';
}

export const CHAPTERS_DATA: Chapter[] = [
  {
    id: 1,
    name: '出会いの章',
    episodeStart: 1,
    episodeEnd: 8,
    period: '2026年4月前半',
    theme: '運命診断室の開院と最初の患者たち',
    part: 'foundation'
  },
  // ... 12 more chapters
];
```

### Accordion Pattern with Framer Motion
```typescript
// Source: Framer Motion AnimatePresence docs
// https://www.framer.com/motion/animate-presence/
import { AnimatePresence, motion } from 'framer-motion';

export function ThirteenChapters() {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {CHAPTERS_DATA.map((chapter) => (
        <div key={chapter.id}>
          {/* Chapter Header - Always Visible */}
          <motion.button
            onClick={() => setExpandedChapter(
              expandedChapter === chapter.id ? null : chapter.id
            )}
            className="w-full text-left"
          >
            <h3>第{chapter.id}章: {chapter.name}</h3>
            <ChevronDown
              className={`transition-transform ${
                expandedChapter === chapter.id ? 'rotate-180' : ''
              }`}
            />
          </motion.button>

          {/* Chapter Details - Expandable */}
          <AnimatePresence>
            {expandedChapter === chapter.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4">
                  {/* Episode grid, theme, period display */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
```

### Part-to-Chapter Mapping Helper
```typescript
// Source: Based on Phase 1 StoryPartsDisplay.tsx pattern
export const PART_MAPPING = {
  foundation: { name: '基礎編', chapters: [1, 2, 3, 4, 5] },
  conflict: { name: '葛藤編', chapters: [6, 7, 8, 9] },
  integration: { name: '統合編', chapters: [10, 11, 12, 13] }
} as const;

export function getPartForChapter(chapterId: number): PartType {
  if (chapterId <= 5) return 'foundation';
  if (chapterId <= 9) return 'conflict';
  return 'integration';
}
```

### Responsive Grid for Episode Display
```typescript
// Source: Tailwind CSS responsive utilities
// https://tailwindcss.com/docs/responsive-design
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
  {Array.from({ length: chapter.episodeEnd - chapter.episodeStart + 1 }, (_, i) => (
    <div
      key={chapter.episodeStart + i}
      className="bg-slate-800/30 rounded-lg p-3 text-center"
    >
      <span className="text-sm text-slate-300">
        第{chapter.episodeStart + i}話
      </span>
    </div>
  ))}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS height transitions with max-height | Framer Motion AnimatePresence | Framer Motion 4+ (2020) | Smoother animations, automatic height calculation |
| Manual accordion state | useState with single selection | React 18+ (2022) | Simpler code, no external libraries needed |
| Inline SVG icons | Icon libraries (lucide-react) | lucide-react 0.562.0 (2025) | Consistent design, tree-shaking, better DX |

**Deprecated/outdated:**
- **CSS-only accordions**: Using :checked hack or peer selectors. React state is clearer
- **max-height transitions**: Requires hardcoded max-height. Framer Motion calculates actual height
- **Manual icon SVG strings**: Maintenance burden, inconsistent styling

## Open Questions

1. **Chapter detail content scope**
   - What we know: Requirements CH-02 mentions "detailed timeline" for each chapter
   - What's unclear: Should we show individual episode summaries or just episode numbers?
   - Recommendation: Start with episode numbers in a grid. Phase 1 (SubthemesStats) showed episode lists are sufficient. Episode summaries are detailed storytelling content, better suited for a future phase

2. **Character association display (CH-03)**
   - What we know: "章ごとの関連キャラクター・テーマを確認できる"
   - What's unclear: Which characters appear in which chapters? This data isn't explicitly in DASHBOARD.md
   - Recommendation: Defer character association to Phase 5 (Character Arcs) or manually tag main characters (巡, 慧, 美咲, さくら) based on storyline descriptions. For Phase 2, focus on structure (episode ranges, periods, themes) rather than character mapping

3. **3-part structure visualization (CH-04)**
   - What we know: "13章構造を3部とマッピングして理解できる"
   - What's unclear: Should this be a separate view or integrated into chapter cards?
   - Recommendation: Integrate as color-coded badges on each chapter card. This is consistent with Phase 1's StoryPartsDisplay pattern and avoids creating multiple views. Consider adding a part filter button in future iterations

## Sources

### Primary (HIGH confidence)
- **Framer Motion AnimatePresence API** - Accordion expand/collapse animations
  - https://www.framer.com/motion/animate-presence/
  - Verified pattern: AnimatePresence with motion.div for height transitions
- **Tailwind CSS Responsive Design** - Grid layout utilities
  - https://tailwindcss.com/docs/responsive-design
  - Verified pattern: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
- **React useState Hook** - State management for accordion
  - https://react.dev/reference/react/useState
  - Verified pattern: Single-selection state (number | null)

### Secondary (MEDIUM confidence)
- **lucide-react Icon Library** - Chapter icons
  - https://lucide.dev/icons/ChevronDown
  - Verified: ChevronDown/ChevronUp for expand indicators
  - Medium confidence: Icon names verified, but usage pattern inferred from existing components

### Tertiary (LOW confidence)
- **Accordion UX best practices** - WebSearch only
  - "how to design accordion UX best practices 2025"
  - LOW confidence: No authoritative source found. Pattern based on common practice (Material Design, WCAG accordion guidelines)
  - **Flagged for validation**: User testing should verify if single-selection accordion is optimal, or if multiple chapters should be expandable simultaneously

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, versions verified from package.json
- Architecture: HIGH - Patterns based on existing Phase 1 components (OverviewStats, StoryPartsDisplay, SubthemesStats)
- Pitfalls: MEDIUM - Animation performance and data structure issues are common, but specific to 13 chapters requires testing
- Data structure: HIGH - DASHBOARD.md provides complete chapter data, mapping to TypeScript interfaces is straightforward

**Research date:** 2026-02-12
**Valid until:** 2026-03-12 (30 days - React ecosystem moves fast, but core patterns are stable)

**Next steps for planner:**
1. Define Chapter interface based on DASHBOARD.md 13章構造
2. Create src/data/chapters.ts with all 13 chapters
3. Build ThirteenChapters.tsx component using accordion pattern
4. Integrate into dashboard as new tab (following Phase 1 tab structure)
5. Implement 3-part mapping with color-coded badges
