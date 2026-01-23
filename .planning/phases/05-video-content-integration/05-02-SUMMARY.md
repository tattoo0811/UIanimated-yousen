---
phase: 05-video-content-integration
plan: 02
subsystem: video-content
tags: [remotion, content-generation, sections, personalized-video]
tech-stack:
  added: []
  patterns:
    - Content generator pattern for video sections
    - Section component pattern with transitions
    - Sequential narrative flow for video storytelling
tech-compatibility:
  - React 18
  - Remotion 4.0
  - TypeScript 5+
requires:
  - 05-01: Nickname dynamic insertion (section component pattern)
  - 04-02: Theme Configuration System (theme integration)
  - 04-01: Backend Project Structure (Remotion setup)
provides:
  - 5-section content structure (本質→家族→仕事→恋愛→オチ)
  - Content generation library with 10 stem-based patterns
  - Complete personalized video narrative flow
affects:
  - 06-01: Video playback will use this structure
  - 06-02: Video sharing will depend on working generation
duration: 12 min
completed: 2026-01-24
---

# Phase 5 Plan 02: 本質→家族→仕事→恋愛→オチ Content Structure Summary

Implement 本質→家族→仕事→恋愛→オチ content structure with transition effects for personalized video narrative.

## What Was Built

**Content Types** (`backend/src/types/content.ts`)
- `ContentSection`: Interface with title, content, and duration fields
- `VideoContent`: Interface with 5 sections (essence, family, work, love, ochi)
- `ContentGeneratorParams`: Interface with insen, nickname, and tone fields

**Content Generation Library** (`backend/src/lib/contentGenerator.ts`)
- `generateEssenceContent()`: 本質 section based on day stem characteristics (120 frames)
  - 10 stem patterns (甲-癸) describing core personality traits
  - Title format: "【{nickname}の本質】"
- `generateFamilyContent()`: 家族 section based on FamilyCard patterns (90 frames)
  - 10 stem patterns adapted from mobile/src/components/cards/FamilyCard.tsx
  - Title: "【家族運】"
- `generateWorkContent()`: 仕事 section based on WorkCard patterns (90 frames)
  - 10 stem patterns adapted from mobile/src/components/cards/WorkCard.tsx
  - Title: "【仕事運】"
- `generateLoveContent()`: 恋愛 section based on LoveCard patterns (90 frames)
  - 10 stem patterns adapted from mobile/src/components/cards/LoveCard.tsx
  - Title: "【恋愛運】"
- `generateOchiContent()`: オチ section with humorous closing (60 frames)
  - 10 stem patterns with 2 humorous options each
  - No title, just punchline message

**Content Section Components** (`backend/src/compositions/sections/ContentSections.tsx`)
- `EssenceSection`: 本質 section (top: 40%, fontSize: 38px)
- `FamilySection`: 家族 section (top: 45%, fontSize: 36px)
- `WorkSection`: 仕事 section (top: 50%, fontSize: 36px)
- `LoveSection`: 恋愛 section (top: 55%, fontSize: 36px)
- `OchiSection`: オチ section (top: 50%, fontSize: 48px bold, accent color)

Each section component:
- Uses TypingText for character-by-character display
- Uses TransitionEffect for fade-in animation (15 frames)
- Integrates with theme system for consistent styling
- Accepts title, content, speed, theme, and triggerFrame props

**HookComposition Integration** (`backend/src/compositions/HookComposition.tsx`)
- Updated schema to include optional insen field
- Added content generation at component level
- Implemented 5-section Sequence structure:
  - 5-9s (120 frames): 本質
  - 9-12s (90 frames): 家族
  - 12-15s (90 frames): 仕事
  - 15-18s (90 frames): 恋愛
  - 18-20s (60 frames): オチ
- Adjusted CTA (20-25s) and branding (25-30s) timing
- Total duration: 900 frames (30 seconds)

## Key Decisions

1. **Video-Optimized Content**: Adapted mobile card patterns for video format (1-3 short sentences per section vs full paragraphs in mobile)

2. **Sequential Narrative Flow**: Structured content as 本質→家族→仕事→恋愛→オチ to tell a coherent story from core identity to practical advice to humorous conclusion

3. **Vertical Progression**: Positioned sections progressively lower on screen (40% → 45% → 50% → 55% → 50%) to create visual flow and prevent overlap

4. **Conditional Rendering**: Content sections only render when insen data is available, maintaining backward compatibility

5. **Stem-Based Patterns**: Used day stem (十干) for all content generation, consistent with mobile app's approach and providing 10 distinct variations

6. **Humor Strategy**: Ochi section uses casual, energetic language (～じゃ！～ぜ！) to create memorable closing that encourages sharing

## Deviations from Plan

None - plan executed exactly as written.

## Files Modified

### Created
- `backend/src/types/content.ts` (20 lines)
- `backend/src/lib/contentGenerator.ts` (243 lines)
- `backend/src/compositions/sections/ContentSections.tsx` (183 lines)

### Modified
- `backend/src/compositions/HookComposition.tsx` (+89, -26 lines)

## Commits

- `b34493a`: feat(05-02): create content types and generation library
- `76bb29f`: feat(05-02): create ContentSections components with transition effects
- `4bd9586`: feat(05-02): integrate 5-section structure into HookComposition

## Verification

✅ File structure check passed (all 3 files exist)
✅ TypeScript compilation passed without errors
✅ Import verification passed (all 5 content generators imported and used)
✅ Section component verification passed (all 5 sections used in HookComposition)
✅ Schema update passed (insen field added as optional)

## Content Examples

### 本質 Example (甲 stem):
```
【nicknameの本質】
リーダーシップがあり、堂々とした佇まい。大木のようにしっかりとした芯を持つあなたは、周囲を支える力があります。
```

### 家族 Example (乙 stem):
```
【家族運】
家族の調和を大切にします。しなやかに対応し、家族間の潤滑油として機能します。
```

### 仕事 Example (丙 stem):
```
【仕事運】
人前に立つ仕事や営業が向いています。太陽のように明るく情熱的に、周囲を照らす存在になれます。
```

### 恋愛 Example (丁 stem):
```
【恋愛運】
繊細で深い愛情表現を好みます。じっくりと関係を育てるタイプで、一途な愛を捧げます。
```

### オチ Example (戊 stem):
```
山のように動かない俺様、安定最強！
```

## Next Phase Readiness

**Status**: Ready for Phase 06 (Video Playback & Share)

**Completed Dependencies**:
- ✅ Complete 5-section content structure (本質→家族→仕事→恋愛→オチ)
- ✅ Content generation library with 10 stem variations
- ✅ Section components with typing animations and transitions
- ✅ HookComposition with full narrative flow
- ✅ Total video duration within 30-second limit

**Next Steps**: Phase 06 will implement video playback in mobile app and video sharing functionality, building on this complete content generation system.

## Performance Notes

- Content generation is synchronous and fast (simple object lookups)
- 5 sections use same TransitionEffect pattern (consistent performance)
- Total content duration: 450 frames (15 seconds) fits well within 30-second limit
- No dynamic imports or lazy loading needed (small bundle size impact)

## Content Quality Considerations

- Content adapted from mobile app cards (tested and validated patterns)
- Stem-based approach provides variety (10 distinct content sets)
- Humor level calibrated for Japanese social media (casual but not offensive)
- Sentence length optimized for video format (shorter than mobile cards)
- Progressive disclosure creates engagement (essence → practical → humorous)
