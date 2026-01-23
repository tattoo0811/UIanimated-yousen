# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** わかりやすさ × 共感 × 笑い — 専門用語をバズる言葉に翻訳し、自分の診断結果が動画でシェアしたくなる体験を提供する
**Current focus:** Phase 5: Video Content Integration

## Current Position

Phase: 5 of 11 (Video Content Integration)
Plan: 2 of 2 in current phase
Status: Phase 05 complete ✓
Last activity: 2026-01-24 — Completed 05-02 (本質→家族→仕事→恋愛→オチ Content Structure)

Progress: [██████████] 63%

## Performance Metrics

**Velocity:**
- Total plans completed: 13
- Average duration: 5.6 min
- Total execution time: 1.2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Code Quality | 0/6 | TBD | - |
| 2. Card UI Core | 4/4 | 30 min | 7.5 min |
| 3. Design System | 3/3 | 10 min | 3.3 min |
| 4. Video Generation Backend | 4/4 | 21 min | 5.3 min |
| 5. Video Content Integration | 2/2 | 20 min | 10.0 min |
| 6. Video Playback & Share | 0/2 | TBD | - |
| 7. Direct Social Sharing | 0/2 | TBD | - |
| 8. Content Translation | 0/2 | TBD | - |
| 9. Image Generation Prompts | 0/1 | TBD | - |
| 10. Friend Compatibility | 0/2 | TBD | - |
| 11. 2026 Year Fortune | 0/2 | TBD | - |

**Recent Trend:**
- Last 10 plans: 6 min (04-01), 4 min (04-02), 3 min (04-03), 8 min (04-04), 8 min (05-01), 12 min (05-02)
- Trend: Phase 5 complete with 5-section content structure (本質→家族→仕事→恋愛→オチ)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **Architecture**: Server-side Remotion for video generation (Remotion does not support React Native)
- **Phase 1 First**: Address technical debt before adding features to prevent compounding issues
- **Card UI Enhancement**: Use existing SwipeableStack.tsx with enhancements rather than replacing with external library
- **Gesture Handling**: Use react-native-gesture-handler + react-native-reanimated (already installed)
- **Haptic Feedback**: Add expo-haptics for tactile response
- **Conditional GestureDetector**: Only apply tap gesture when onPress prop is provided to avoid interfering with pan gestures (02-01)
- **Silent Haptic Failures**: Use .catch(() => {}) on all haptic calls to prevent crashes on unsupported devices/emulators (02-01)
- **Centralized Animation Constants**: SWIPE_CONFIG in animations.ts for consistent swipe behavior across components (02-02)
- **Velocity-Based Swipe Detection**: 800 pts/sec threshold enables natural quick-swipe detection (02-02)
- **Spring Physics for Card Animations**: damping:20, stiffness:300 for natural card fly-out feel (02-02)
- **Context-Based Drag Handling**: Initialize contextX in gesture onStart to prevent position jumps (02-02)
- **Zodiac Select Screen**: Created dedicated zodiac-select.tsx screen for swipeable card selection (02-03)
- **Full-Screen Card Layout**: Changed SwipeableStack container from fixed 600px to flex-1 for full viewport height (02-03)
- **Entry Point Cards**: Added prominent Zodiac Swipe entry cards to fortune and index tabs for discoverability (02-04)
- **Preserved Existing Functionality**: Added entry points without removing existing daily/weekly fortune and AI chat features (02-04)
- **Theme System Foundation**: React Context-based theme provider with AsyncStorage persistence and type-safe definitions (03-01)
- **Memoized Theme Context**: Used useMemo for theme object and context value to prevent unnecessary re-renders (03-01)
- **Coordinated Loading States**: Combined theme and font loading to prevent flicker on app start (03-01)
- **Three Theme Implementations**: KiraPop (vibrant pink/cyan/yellow, 10-20s), MonoEdge (monochrome with indigo, 30-40s), ZenWa (forest green/brown/akane, 50s+) (03-02A)
- **Font Loading Infrastructure**: useThemeFonts hook loads all 6 font variants with coordinated loading to prevent layout shifts (03-02A)
- **Google Fonts Integration**: M PLUS Rounded 1c, Noto Sans JP, Noto Serif JP via @expo-google-fonts packages (03-02A)
- **Animation Psychology**: Spring physics customized per demographic (bouncy for youth, smooth for professionals, gentle for mature) (03-02A)
- **Japanese Color Integration**: Akane (madder red), kinari-iro (natural cream) in ZenWa for cultural authenticity (03-02A)
- **SwipeableStack Theme Integration**: Reused SwipeableStack for theme selection UI consistency (03-02B)
- **Theme-Aware Animations**: SwipeableStack uses theme.animations.spring and theme.animations.swipe for per-theme animation feel (03-02B)
- **Backend Project Structure**: Node.js 18 + Remotion 4.0 + TypeScript with strict mode for server-side video rendering (04-01)
- **Cloud Run Integration**: @remotion/cloudrun 4.0.399 for GCP deployment with multi-stage Docker build (04-01)
- **9:16 Video Format**: 1080x1920, 30fps, 900 frames (30 seconds) for TikTok/Instagram Reels compatibility (04-01)
- **Zod Validation**: Type-safe composition props with nickname, fortuneData, theme, tone validation (04-01)
- **Theme Configuration System**: TypeScript object-based configuration with KiraPop, MonoEdge, ZenWa themes matching Phase 3 designs (04-02)
- **useTheme Hook Pattern**: Simple function returning theme configuration based on theme name, no React Context needed for Remotion compositions (04-02)
- **VideoTemplate Wrapper**: AbsoluteFill provides full-screen container with theme-based styling for 9:16 video format (04-02)
- **Animation Parameters per Theme**: Spring physics (damping/stiffness) and typing speed customized per theme (KiraPop: bouncy 15/200, MonoEdge: smooth 50/100, ZenWa: gentle 30/80) (04-02)
- **Section Component Pattern**: Reusable section components with TypingText and TransitionEffect for consistent video sections (05-01)
- **Nickname Dynamic Insertion**: NicknameSection component displays user nickname with "さんの運勢" suffix during 2-5s section (05-01)
- **Utility Hook Pattern**: TransitionEffect returns style object (not JSX) for parent components to apply animations (05-01)
- **5-Section Content Structure**: 本質→家族→仕事→恋愛→オチ narrative flow with 450 frames (15s) total content duration (05-02)
- **Stem-Based Content Generation**: All content uses day stem (十干) patterns with 10 variations per section type (05-02)
- **Video-Optimized Content**: Content shortened to 1-3 sentences per section for video format (vs full paragraphs in mobile) (05-02)
- **Progressive Vertical Positioning**: Sections positioned progressively lower (40%→45%→50%→55%→50%) to create visual flow (05-02)
- **Conditional Content Rendering**: Content sections only render when insen data is available, maintaining backward compatibility (05-02)

### Pending Todos

None yet.

### Blockers/Concerns

**From Research:**
- **Phase 4 Risk**: Server-side video generation is complex with multiple valid approaches (Remotion Lambda vs custom Fargate, queue systems, CDN strategies). AWS-specific knowledge required.
- **Phase 8 Risk**: Viral content effectiveness requires Japanese cultural validation. Hook templates and emotional triggers need A/B testing with target audience.

**From Execution:**
- **mobile/ is gitignored**: All mobile/ changes are not tracked in git. This is intentional but requires awareness when reviewing git history.

## Session Continuity

Last session: 2026-01-24 00:05 UTC
Stopped at: Completed Phase 05 (Video Content Integration)
Resume file: None
