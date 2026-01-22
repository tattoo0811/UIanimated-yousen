# Project Research Summary

**Project:** UIanimated - Viral Fortune Telling App (Japanese Market)
**Domain:** React Native (Expo) Mobile App with UGC Video Generation
**Researched:** 2026-01-22
**Confidence:** HIGH

## Executive Summary

This is a viral mobile fortune-telling app for the Japanese market that generates shareable TikTok-style videos based on traditional 陰陽五行 (Yin-Yang Five Elements) fortune telling. Research reveals that **video generation cannot be performed client-side in React Native**—Remotion explicitly does not support React Native due to frame-by-frame re-rendering performance issues. The recommended architecture is a hybrid approach: React Native client with Reanimated 4 for UI animations, and server-side Remotion rendering for video generation.

The 2026 Japanese fortune-telling app market requires **video content as a baseline expectation**, not a premium feature. Gen Z users find static text results "old-fashioned" (昭和感). Success depends on implementing the "7-second hook" formula for TikTok virality, incorporating emotional resonance (共感), humor (笑い), and social sharing triggers. The critical technical risk is attempting client-side Remotion integration—this will cause performance catastrophes and requires complete architectural rework.

Key mitigation strategy: Implement server-side video generation from day one using Remotion Lambda or custom Node.js rendering. Client-side should focus on smooth UI animations with Reanimated 4 and high-quality video playback using expo-video.

## Key Findings

### Recommended Stack

**Critical technical constraint:** Remotion does NOT support React Native. This fundamentally changes the architecture from client-side to hybrid client-server.

**Core client-side technologies:**
- **react-native-reanimated (~4.1.1)** — High-performance UI animations on UI thread (already installed)
- **react-native-gesture-handler (~2.28.0)** — Touch gesture handling for card swiping (already installed)
- **react-native-deck-swiper (^1.6.5)** — Tinder-style card stack interface
- **expo-video (~3.0.15)** — Official Expo video playback (replaces deprecated expo-av)
- **expo-sharing (~14.0.8)** — Native share sheet integration (already installed)

**Server-side video generation:**
- **Remotion (Node.js)** — Video generation framework
- **Remotion Lambda** — AWS Lambda-based rendering for scalability
- **S3 / Cloudflare R2** — Video storage and CDN delivery

### Expected Features

**Must have (table stakes):**
- **Daily fortune delivery** — Users expect fresh content with push notifications
- **Personalized results** — Birthdate-based 陰陽五行 calculations
- **Result saving/sharing** — Native share to TikTok, Instagram, LINE
- **Basic video generation** — 9:16 vertical format, 15-30 seconds
- **Visual feedback** — Animated reveals, color-coded results

**Should have (competitive differentiators):**
- **7-second hook videos** — Captures attention in TikTok's critical window
- **Emotional resonance (共感)** — "That's so me!" moments drive sharing
- **Friend comparison (相性診断)** — Compatibility scores with friends
- **Humor integration (笑い)** — Funny content spreads faster
- **Share triggers** — Embedded psychological prompts to share

**Defer (v2+):**
- **Premium/subscriptions** — Monetization can wait until user base established
- **Social community features** — Chat, forums are complex and different value prop
- **Multiple fortune types** — Stay focused on 陰陽五行 differentiation
- **AI chatbot integration** — Nice-to-have, not core to shareable videos

### Architecture Approach

The architecture follows a **client-server video generation pattern** due to Remotion's inability to run in React Native. The React Native client focuses on UI presentation and user interaction, while the backend handles video rendering.

**Major components:**
1. **React Native Client** — UI layer with fortune result display, loading screens, and video playback
2. **Video Generation Service** — Orchestrates server-side rendering with progress polling
3. **Backend Remotion Renderer** — Server-side video generation with template system
4. **Asset Storage** — CDN-hosted templates, music, fonts (never bundle with app)

**Data flow:** User receives fortune → taps "Generate Video" → client sends generation request → server renders video → client polls for progress → downloads and displays → user shares via native share sheet

### Critical Pitfalls

1. **Attempting Remotion in React Native** — Explicitly unsupported. Causes catastrophic performance issues. Prevention: Never attempt client-side rendering. Use server-side Remotion from day one.

2. **Memory leaks with video components** — Video components in FlatLists crash apps after 6-20 videos. Prevention: Implement explicit cleanup on unmount, use FlatList optimization props, pause/unload off-screen videos.

3. **Assuming video generation always succeeds** — Network errors, server failures, and timeouts cause infinite loading states. Prevention: Implement retry logic with exponential backoff, timeout handling, user cancellation, and friendly error messages.

4. **Downloading videos repeatedly without caching** — Wastes bandwidth, causes slow playback. Prevention: Implement FileSystem-based caching with LRU eviction, use expo-video's built-in cache configuration.

5. **ProGuard breaking release builds on Android** — App works in debug but crashes in release. Prevention: Add proper ProGuard rules for video libraries, test release builds regularly before launch.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Fortune Experience
**Rationale:** Establish the fundamental value proposition before adding complexity. Users must receive accurate, personalized fortunes before they'll want to share videos.

**Delivers:**
- Daily fortune calculation (陰陽五行 based on birthdate)
- Personalized result display with visual feedback
- Basic card-based UI with smooth animations

**Addresses features from FEATURES.md:**
- Daily fortune delivery
- Personalized results
- Visual feedback

**Uses stack from STACK.md:**
- react-native-reanimated for UI animations
- react-native-gesture-handler for card interactions
- react-native-deck-swiper for Tinder-style interface

**Avoids pitfalls from PITFALLS.md:**
- ProGuard configuration for release builds
- TypeScript strict mode for type safety

**Research flag:** Skip research—well-established patterns for fortune calculation and card UI.

### Phase 2: Server-Side Video Generation
**Rationale:** This is the critical architectural dependency. Must build backend infrastructure before client can display generated videos. This is the highest-risk technical component.

**Delivers:**
- Remotion backend with basic video templates
- Generation API endpoint
- Progress polling system
- Client-side loading screen with progress feedback

**Uses stack from STACK.md:**
- Remotion on Node.js backend
- Remotion Lambda for scalable rendering
- S3/Cloudflare R2 for video storage

**Implements architecture from ARCHITECTURE.md:**
- Client-server video generation pattern
- Progress polling with fallback
- Video Generation Service layer

**Avoids pitfalls from PITFALLS.md:**
- Never attempts client-side Remotion integration
- Implements retry logic and timeout handling
- Provides cancel button and estimated time remaining

**Research flag:** Needs `/gsd:research-phase` — Remotion backend setup is complex, Lambda configuration requires AWS-specific knowledge, progress polling patterns have multiple valid approaches.

### Phase 3: Video Playback and Sharing
**Rationale:** Users need to view and share generated videos. This completes the core "get fortune → watch video → share" loop.

**Delivers:**
- Video playback using expo-video
- Native share sheet integration (TikTok, Instagram, LINE)
- Video caching to avoid re-downloads
- FileSystem cleanup for old videos

**Uses stack from STACK.md:**
- expo-video for playback
- expo-sharing for native share sheet
- expo-file-system for local caching

**Avoids pitfalls from PITFALLS.md:**
- Implements proper video caching
- Handles iOS vs Android format differences (H.264 + AAC)
- Implements FileSystem cleanup for old videos
- Never bundles videos in app bundle

**Research flag:** Skip research—expo-video and expo-sharing are well-documented with clear examples.

### Phase 4: Viral Mechanics Enhancement
**Rationale:** After core functionality works, maximize shareability and viral growth. These features drive user acquisition through social sharing.

**Delivers:**
- 7-second hook video structure optimization
- Friend comparison feature (相性診断)
- Share triggers in videos
- Fortune reveal animations

**Addresses features from FEATURES.md:**
- 7-second hook videos
- Emotional resonance and humor
- Friend compatibility diagnosis
- Share triggers

**Implements patterns from FEATURES.md:**
- Hook formula: 0-2s visual hook, 2-5s personalization, 5-7s promise
- Social currency and emotional contagion triggers
- "Tag a friend" call-to-action patterns

**Research flag:** Needs `/gsd:research-phase` — Viral content effectiveness requires validation with Japanese audience, A/B testing needed for emotional resonance vs humor approaches.

### Phase 5: Engagement and Retention
**Rationale:** Once viral growth engine is functional, focus on keeping users engaged over time.

**Delivers:**
- Fortune streak tracking (gamification)
- Weekly/monthly fortune videos
- Video template variety
- Push notification timing optimization

**Addresses features from FEATURES.md:**
- Fortune streak tracking
- Weekly/monthly fortune videos
- Personalized video templates

**Research flag:** Skip research—Gamification patterns are well-established. Push notification timing can be optimized through experimentation.

### Phase Ordering Rationale

The phase order follows **dependency-driven development**:

1. **Core fortune first** — No point generating videos for fortunes users don't value
2. **Backend before client video features** — Can't display videos without generation infrastructure
3. **Playback before enhancement** — Must have working video system before optimizing for virality
4. **Viral mechanics before retention** — Focus on acquisition before optimization

This ordering avoids the critical pitfall of building features for an unvalidated core experience. Each phase delivers user value before the next begins.

**Grouping rationale:**
- Phases 1-3 create the complete MVP loop (fortune → generate → share)
- Phase 4 optimizes for viral growth
- Phase 5 optimizes for long-term retention

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2:** Server-side video generation is complex with multiple valid approaches (Remotion Lambda vs custom Fargate, queue systems, CDN strategies). AWS-specific knowledge required.
- **Phase 4:** Viral content effectiveness requires Japanese cultural validation. Hook templates and emotional triggers need A/B testing with target audience.

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Card-based UI and fortune calculation have well-documented patterns
- **Phase 3:** expo-video and expo-sharing are mature, well-documented libraries
- **Phase 5:** Gamification and push notifications follow established best practices

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official documentation confirms Remotion does not support React Native. Expo libraries well-documented. |
| Features | MEDIUM-HIGH | Based on 2026 TikTok trends and Japanese market analysis. Some aspects need user validation. |
| Architecture | HIGH | Client-server pattern is standard approach given Remotion constraint. Data flow well-established. |
| Pitfalls | HIGH | Official documentation and GitHub issues confirm critical failure modes. Prevention strategies verified. |

**Overall confidence:** HIGH

The critical architectural constraint (Remotion not supporting React Native) is verified with official documentation, providing high confidence in the recommended approach. Feature recommendations are based on current 2026 trends but require user validation for optimal effectiveness.

### Gaps to Address

**Areas needing validation during implementation:**

1. **Optimal video template designs** — What visual styles resonate with Japanese Gen Z?
   - *Handle during Phase 4:* A/B test multiple template styles, gather user feedback

2. **Pricing strategy** — Will Japanese users pay for premium video templates?
   - *Handle during Phase 5:* Experiment with freemium models after establishing user base

3. **Push notification timing** — What times/days maximize engagement?
   - *Handle during Phase 5:* Test different delivery times, analyze open rates

4. **Share rate benchmarks** — What's a "good" share rate for fortune content?
   - *Handle during Phase 4:* Establish baseline metrics, iterate on viral mechanics

5. **Emotional resonance vs humor effectiveness** — Which approach drives more sharing?
   - *Handle during Phase 4:* A/B test both approaches, measure share rates

## Sources

### Primary (HIGH confidence)
- [Remotion React Native Documentation](https://www.remotion.dev/docs/react-native) — Explicitly states no React Native support planned due to performance issues
- [expo-video Documentation](https://docs.expo.dev/versions/latest/sdk/video/) — Official video playback API
- [expo-sharing Documentation](https://docs.expo.dev/versions/latest/sdk/sharing/) — File sharing functionality
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) — Animation library official docs
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) — Gesture handling official docs

### Secondary (MEDIUM confidence)
- [Reanimated 4 Stable Release Announcement](https://blog.swmansion.com/reanimated-4-stable-release-the-future-of-react-native-animations-ba68210c3713) — July 2025, CSS animations API
- [TikTok Storytelling: The 7-Second Hook Formula](https://purplestardust.space/the-7-second-hook-what-tiktok-teaches-brands-about-storytelling-in-2026/) — 2026 storytelling principles
- [HeyGen Fortune Telling Use Case](https://www.heygen.com/use-cases/fortune-telling) — AI video generation for fortune telling
- [Top Astrology Apps 2026](https://www.autviz.com/top-10-best-astrology-app-in-2026/) — Current market leaders feature analysis
- [FFmpegKit Retirement](https://www.itpathsolutions.com/ffmpegkit-shutdown-what-to-do-next) — January 2025

### Tertiary (LOW confidence)
- [星ひとみ監修「2026年の運勢占い」](https://www.tiktok.com/ja/trending/detail/%25E6%2598%259F%25E3%2581%25B2%25E3%2581%25A8%25E3%2581%25BF%25E7%259B%25A3%25E4%25BF%25AE%25E3%200080%258C2026%25E5%25B9%25B4%25E3%2581%25AE%25E9%2581%258B%25E5%258B%25A2%25E5%258D%25A0%25E3%2581%2584%25E3%200080%2585%25E5%2585%25AC%25E9%2596%258B) — Japanese TikTok fortune trends
- Various TikTok fortune telling content patterns — Needs user research validation for effectiveness
- Specific emotional trigger effectiveness for Japanese users — Cultural testing needed

---
*Research completed: 2026-01-22*
*Ready for roadmap: yes*
