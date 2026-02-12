---
phase: 03-sakura-flashbacks
plan: 02
subsystem: ui
tags: [react, framer-motion, typescript, tailwind, accordion, timeline]

# Dependency graph
requires:
  - phase: 03-sakura-flashbacks-01
    provides: [FLASHBACKS_DATA, SakuraFlashbacks component foundation, distribution cards]
provides:
  - Flashback detail panel with accordion expansion
  - Timeline view with 120-episode visualization
  - View toggle between list and timeline modes
  - Click interaction to view flashback details
affects: [03-sakura-flashbacks-03, 04-subtheme-stats]

# Tech tracking
tech-stack:
  added: [framer-motion AnimatePresence, lucide-react icons (List, Clock)]
  patterns: [accordion detail panel, vertical timeline with markers, position-based marker placement]

key-files:
  created: []
  modified: [src/components/features/SakuraFlashbacks.tsx]

key-decisions:
  - "Reused ThirteenChapters accordion pattern for detail panel consistency"
  - "Vertical timeline with percentage-based positioning for episode markers"
  - "Color-coded markers by part (emerald/amber/violet) for visual clarity"
  - "Timeline markers clickable to switch to list view and expand details"

patterns-established:
  - "Accordion pattern: AnimatePresence with height animation for smooth expand/collapse"
  - "Timeline pattern: Absolute positioning with percentage-based top values for marker placement"
  - "View toggle pattern: State-driven rendering between list/timeline modes"
  - "Interaction pattern: Marker click → state update → view switch → panel expand"

# Metrics
duration: 4min
completed: 2026-02-12
---

# Phase 3 Plan 2: Sakura Flashback Detail Panel and Timeline Summary

**Accordion detail panels with full content display, plus 120-episode vertical timeline with color-coded markers and view toggle**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-12T05:19:53Z
- **Completed:** 2026-02-12T05:24:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Implemented accordion-style detail panels for flashback scenes with smooth animations
- Added view toggle between list and timeline modes
- Created vertical timeline visualization showing all 120 episodes
- Added color-coded flashback markers at correct episode positions
- Implemented part separators and episode scale labels on timeline
- Added hover tooltips and click interactions for timeline markers

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement flashback scene detail panel with accordion** - `2708bf2` (feat)
   - Added state management for expanded flashback ID and display view
   - Implemented accordion-style detail panel with AnimatePresence
   - Added view toggle buttons (list/timeline) in header
   - Included full content display and metadata in expanded panel
   - Added keyboard navigation (Enter/Space key support)
   - Added ARIA attributes for accessibility
   - Reused ThirteenChapters accordion pattern

2. **Task 2: Implement timeline view for flashback scenes** - `0bce9ed` (feat)
   - Added vertical timeline visualization (1-120 episodes)
   - Added flashback markers at correct episode positions
   - Color-coded markers by part (emerald/amber/violet)
   - Added hover tooltips with flashback title and episode number
   - Added part separators at episode 40 and 80
   - Added episode scale labels every 10 episodes
   - Implemented marker click to open detail panel
   - Added selected flashback detail panel below timeline
   - Added view toggle between list and timeline modes

**Plan metadata:** Not yet committed (pending checkpoint approval)

## Files Created/Modified
- `src/components/features/SakuraFlashbacks.tsx` - Added detail panel accordion, view toggle, and timeline visualization

## Decisions Made
- Reused ThirteenChapters accordion pattern for consistency across the dashboard
- Used percentage-based positioning (0-100%) for timeline markers instead of pixel values for better responsiveness
- Color-coded markers by part to provide visual context at a glance
- Timeline markers click through to list view with expanded panel for seamless UX
- Kept distribution cards visible in both view modes for persistent context

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- **TypeScript error**: PART_MAPPING.episodes doesn't exist, should be PART_MAPPING.chapters
  - **Resolution**: Changed reference to use `chapters` property and format as "第X章"

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Detail panel implementation complete with full content display
- Timeline view functional with all markers and interactions
- Ready for user verification checkpoint at Task 3
- Phase 4 (subtheme stats) can reference flashback visualization patterns

---
*Phase: 03-sakura-flashbacks-02*
*Completed: 2026-02-12*
