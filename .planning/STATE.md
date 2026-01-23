# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** わかりやすさ × 共感 × 笑い — 専門用語をバズる言葉に翻訳し、自分の診断結果が動画でシェアしたくなる体験を提供する
**Current focus:** Phase 8: Content Translation

## Current Position

Phase: 8 of 11 (Content Translation)
Plan: 2 of 2 in current phase
Status: Phase 08 complete ✓
Last activity: 2026-01-24 — Completed 08-01, 08-02 (Content Translation)

Progress: [████████████-] 91%

## Performance Metrics

**Velocity:**
- Total plans completed: 19
- Average duration: 7.1 min
- Total execution time: 2.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Code Quality | 0/6 | TBD | - |
| 2. Card UI Core | 4/4 | 30 min | 7.5 min |
| 3. Design System | 3/3 | 10 min | 3.3 min |
| 4. Video Generation Backend | 4/4 | 21 min | 5.3 min |
| 5. Video Content Integration | 2/2 | 20 min | 10.0 min |
| 6. Video Playback & Share | 2/2 | 55 min | 27.5 min |
| 7. Direct Social Sharing | 2/2 | 25 min | 12.5 min |
| 8. Content Translation | 2/2 | 30 min | 15.0 min |
| 9. Image Generation Prompts | 0/1 | TBD | - |
| 10. Friend Compatibility | 0/2 | TBD | - |
| 11. 2026 Year Fortune | 0/2 | TBD | - |

**Recent Trend:**
- Last 10 plans: 4 min (04-02), 3 min (04-03), 8 min (04-04), 8 min (05-01), 12 min (05-02), 25 min (06-01), 30 min (06-02), 12 min (07-01), 13 min (07-02), 12 min (08-01), 18 min (08-02)
- Trend: Phase 8 complete with content translation system

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
- **expo-video Integration**: Used expo-video instead of react-native-video for native Expo SDK 54 compatibility with VideoView and useVideo hook (06-01)
- **AsyncStorage Cache Metadata**: Video cache metadata (path, timestamp, size) stored in AsyncStorage for persistence across app restarts (06-01)
- **URL Hash Cache Keys**: Cache keys generated from URL hash to prevent collisions and support different URLs with same content (06-01)
- **Background Caching Strategy**: Videos cached in background after first play to avoid blocking initial playback while improving subsequent loads (06-01)
- **expo-media-library for Camera Roll**: Used expo-media-library for camera roll save with permission handling and "Fortune Videos" album creation (06-02)
- **expo-sharing Native Share Sheet**: expo-sharing for native share sheet integration with platform-specific app selection (06-02)
- **Separate VideoControls Component**: Extracted video save/share buttons into separate component for reusability and better separation of concerns (06-02)
- **Haptic Feedback Integration**: expo-haptics for tactile button press feedback with .catch() for graceful failure on unsupported devices (06-02)
- **Permission Alert with Settings**: User-friendly alert with "Open Settings" option when camera roll permission denied (06-02)
- **Cache-Before-Share Pattern**: Share operations check cache first and download remote videos before sharing to ensure local file availability (06-02)
- **Social Media URL Schemes**: TikTok (snssdk1233://, tiktok://) and Instagram (instagram://, instagram-stories://) URL schemes for direct app integration (07-01)
- **App Installation Detection**: expo-linking.canOpenURL() for checking social media app installation before attempting deep links (07-01)
- **iOS URL Scheme Whitelisting**: LSApplicationQueriesSchemes in app.json infoPlist for iOS URL scheme access (07-01)
- **Conditional Direct Share UI**: showDirectShare prop on VideoControls to optionally show TikTok/Instagram buttons (07-01)
- **Fallback Dialog UX**: ShareFallbackDialog component with platform-specific colors and 3-option UX (Download, Share via..., Cancel) (07-02)
- **App Store Deep Linking**: Direct App Store links (TikTok: id835599320, Instagram: id389801252) with web URL fallback (07-02)
- **Graceful Degradation**: Multi-tier fallback (direct share → app store → native share sheet) ensures users can always share (07-02)
- **Tone Selection UI Reuse**: ToneSelector reuses SwipeableStack pattern for consistent UX with theme selection (08-01)
- **Content Translator Infrastructure**: Translation pipeline with ContentTone type and translateToTone function for platform-specific content (08-01)
- **AsyncStorage Tone Persistence**: User's tone selection saved with '@selected_tone' key, survives app restarts (08-01)
- **Three Tone Options**: TikTok (short/emotional), YouTube (storytelling), Instagram (visual) covering major use cases (08-01)
- **Rule-Based Translation**: Content transformation uses keyword extraction and tone-specific templates instead of AI for consistency (08-02)
- **Six Personality Types**: Keyword extraction detects leadership, flexibility, brightness, sensitivity, stability, and default traits (08-02)
- **TikTok Tone Pattern**: 2-3 sentences, emotional keywords (◎, ✨, 💪, 💕, 🔥), punchlines, direct address format (08-02)
- **YouTube Tone Pattern**: Conversational (〜だよね, 〜てみてよ), storytelling flow, hook → body → conclusion structure (08-02)
- **Instagram Tone Pattern**: Visual-focused with line breaks, emoji per line, aesthetic vocabulary, hashtags for discoverability (08-02)

### Pending Todos

None yet.

### Blockers/Concerns

**From Research:**
- **Phase 4 Risk**: Server-side video generation is complex with multiple valid approaches (Remotion Lambda vs custom Fargate, queue systems, CDN strategies). AWS-specific knowledge required.
- **Phase 8 Risk**: Viral content effectiveness requires Japanese cultural validation. Hook templates and emotional triggers need A/B testing with target audience.

**From Execution:**
- **mobile/ is gitignored**: All mobile/ changes are not tracked in git. This is intentional but requires awareness when reviewing git history.

## Session Continuity

Last session: 2026-01-24 15:30 UTC
Stopped at: Completed Phase 08 (Content Translation)
Resume file: None
