# Stack Research

**Domain:** React Native (Expo) Mobile App with UGC Video Generation
**Researched:** 2025-01-22
**Confidence:** MEDIUM

## Executive Summary

**Critical Finding:** Remotion for React Native is officially **NOT SUPPORTED**. The Remotion team explicitly states they are not pursuing React Native integration due to performance issues with the re-render-on-every-frame model.

**Recommended Approach:** Use a hybrid architecture:
- **Client-side:** React Native Reanimated 4 + Gesture Handler for UI animations
- **Server-side:** Cloud-based video generation (Remotion on Node.js) OR custom FFmpeg solution
- **Alternative:** Record React Native animations directly using expo-screen-capture (experimental)

## Recommended Stack

### Core Animation & Gesture

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-native-reanimated | ~4.1.1 (already installed) | High-performance UI animations | UI thread execution, 120fps capable, CSS-style animations in v4 |
| react-native-gesture-handler | ~2.28.0 (already installed) | Touch gesture handling | Native gesture recognizers, integrates with Reanimated |

**Note:** Project already has Reanimated 4.1.1 and Gesture Handler 2.28.0 installed. Reanimated 4 stable (July 2025) introduces CSS-style animations API - use declarative CSS animations for state-driven animations, keep worklets for gesture/scroll-driven animations.

### Card-Based UI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-native-deck-swiper | ^1.6.5 | Tinder-style card stack | Specialized for card swiping, mature library |
| react-native-gesture-handler | ~2.28.0 (already installed) | Custom card gestures | Use for bespoke card interactions beyond deck-swiper |

**Recommendation:** Start with react-native-deck-swiper for speed-to-market. Use Gesture Handler directly if you need more control.

### Typography Animation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Custom hook with Reanimated 4 | - | Typewriter effect | Use worklets for character-by-character animation |
| typewriter4react-native | 0.5.3 | Drop-in typewriter component | Actively maintained (Sep 2025), Expo-compatible, stable sizing |

**Recommendation:** For simple typewriter effects, use typewriter4react-native. For complex typography animations (staggered reveals, custom easing), build a custom hook using Reanimated 4 worklets.

```typescript
// Custom typewriter hook example using Reanimated 4
const useTypewriter = (text: string, speed: number = 50) => {
  const displayText = useSharedValue('');
  // Implementation using Reanimated 4 worklets
  return { displayText };
};
```

### Video Generation (Critical)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Remotion** | **NOT SUPPORTED** | Video generation in RN | HIGH confidence - explicitly unsupported |
| FFmpegKit | RETIRED (Jan 2025) | Video processing | HIGH confidence - binaries removed |
| @ffmpeg-kit/react-native | - | Alternative FFmpeg | LOW - requires local setup post-retirement |
| expo-camera | ~17.0.10 | Video recording | HIGH - for recording camera content |
| expo-video | ~3.0.15 | Video playback | HIGH - official Expo solution |

**CRITICAL FINDING - Remotion for React Native:**
> "Support for React Native is currently not planned due to performance issues. While we previously prototyped this, the main culprit is the model of re-rendering on every frame, which prevents achieving the high performance levels that are possible on the web."
> Source: Official Remotion docs (verified 2025-01-22)

**Recommended Architecture for Video Generation:**

1. **Server-Side Video Generation (Recommended)**
   - Use Remotion on Node.js backend
   - Client sends data (text, images, settings) to API
   - Server renders video and returns URL
   - Pros: Reliable, full Remotion feature set, no mobile resource constraints
   - Cons: Requires server infrastructure, network latency

2. **Client-Side Animation Recording (Alternative)**
   - Build animations using Reanimated 4
   - Record screen using expo-screen-capture or react-native-view-shot
   - Export to gallery using expo-sharing
   - Pros: No server needed, real-time preview
   - Cons: Quality depends on device performance, limited to what's visible on screen

3. **Cloud Video SDK (Commercial Option)**
   - IMG.LY VideoCreator SDK
   - Banuba Video Editor SDK
   - Pros: Full-featured, maintained, support
   - Cons: Licensing costs

### Video Playback & Sharing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| expo-video | ~3.0.15 | Video playback | Official Expo replacement for expo-av |
| expo-sharing | ~14.0.8 (already installed) | Share videos to other apps | Native share sheets, cross-platform |
| expo-media-library | - | Save to device gallery | Permanent storage of generated videos |

**Note:** expo-av is deprecated as of Expo SDK 52. Use expo-video for new development.

## Installation

```bash
# Card UI
npm install react-native-deck-swiper

# Typography
npm install typewriter4react-native

# Video playback (if not already installed)
npx expo install expo-video

# Media library
npx expo install expo-media-library

# Note: Reanimated and Gesture Handler already installed
# Note: expo-sharing already installed
```

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| Card UI | react-native-deck-swiper | react-native-swipeable-card-stack | Need more customization than deck-swiper provides |
| Typography | Custom Reanimated hook | react-native-type-animation | Need very specific typewriter variants |
| Video Generation | Server-side Remotion | @ffmpeg-kit/react-native | Must generate offline, can accept build complexity |
| Video Generation | Server-side Remotion | IMG.LY / Banuba SDK | Have budget, want turnkey solution |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Remotion for React Native** | Officially unsupported, performance issues with frame re-rendering | Server-side Remotion OR cloud video SDKs |
| **FFmpegKit** | Retired Jan 2025, binaries removed from public repos | @ffmpeg-kit/react-native (requires local setup) OR cloud solutions |
| **expo-av** | Deprecated as of Expo SDK 52 | expo-video for playback |
| **react-native-typewriter** | Last updated 6 years ago (v0.7.0) | typewriter4react-native (active, Expo-compatible) |
| **react-native-video** | Additional dependency when expo-video is sufficient | expo-video (for Expo projects) |

## Stack Patterns by Variant

**If generating videos server-side:**
- Use Remotion on Node.js backend
- Client sends fortune data + user preferences
- Server returns video URL
- Use expo-video for preview, expo-sharing for download

**If generating videos client-side:**
- Use Reanimated 4 for animations
- Use expo-screen-capture or react-native-view-shot for recording
- Use expo-media-library to save to gallery
- Use expo-sharing to share to other apps
- Accept quality limitations based on device performance

**If targeting TikTok/Instagram sharing:**
- Generate 9:16 vertical videos (1080x1920 or 720x1280)
- Keep duration under 60 seconds
- Use H.264 codec for maximum compatibility
- Add watermark/logo for brand awareness

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react-native-reanimated@4.x | React Native New Architecture required | Reanimated 4 requires New Architecture |
| react-native-reanimated@4.x | react-native-gesture-handler@2.x | Must use compatible versions |
| expo-video@3.x | Expo SDK 54+ | Already compatible with current project |
| typewriter4react-native@0.5.3 | Expo 50+ | Fully compatible |

## Phase-Specific Stack Recommendations

**Phase 1: Card-Based UI**
- react-native-deck-swiper for card stack
- react-native-gesture-handler for custom gestures
- react-native-reanimated for animations

**Phase 2: Typography Effects**
- Custom Reanimated 4 hook for main typewriter effect
- typewriter4react-native for simple cases

**Phase 3: Video Generation**
- Start with server-side Remotion (requires API setup)
- OR use expo-screen-capture for client-side recording
- Evaluate need for cloud SDK based on quality requirements

## Architecture Decision: Video Generation Strategy

**Decision Point:** How to generate TikTok-style videos?

Given the constraints:
1. Remotion for React Native is explicitly NOT supported
2. FFmpegKit retirement complicates client-side video generation
3. Project already has Reanimated 4 for UI animations

**Recommended Path:**

**Option A: Server-Side Video Generation (Recommended for MVP)**
```
Client (Expo) → API Endpoint → Remotion Server → Video URL → Client Download
```

Pros:
- Full Remotion feature set
- Consistent quality across devices
- No mobile resource constraints
- Easier to iterate on video templates

Cons:
- Requires server infrastructure
- Network latency for video generation
- Additional cost for server hosting

**Option B: Client-Side Animation Recording**
```
Reanimated Animation → Screen Recording → Local File → Share/Save
```

Pros:
- No server needed
- Real-time preview
- Works offline

Cons:
- Quality varies by device
- Limited to visible screen content
- More complex to implement reliably
- May not meet TikTok quality expectations

**Recommendation:** Start with Option A (server-side) for MVP quality. Consider Option B only if offline capability is a hard requirement.

## Sources

### High Confidence (Official Documentation)
- [Remotion React Native Documentation](https://www.remotion.dev/docs/react-native) - Explicitly states not supported for RN
- [Expo Video Documentation](https://docs.expo.dev/versions/latest/sdk/video/) - Official video playback library
- [Expo Sharing Documentation](https://docs.expo.dev/versions/latest/sdk/sharing/) - File sharing API
- [Expo Camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/) - Camera and video recording
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) - Animation library official docs
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) - Gesture handling official docs

### Medium Confidence (Recent Articles, Verified 2025)
- [Reanimated 4 Stable Release Announcement](https://blog.swmansion.com/reanimated-4-stable-release-the-future-of-react-native-animations-ba68210c3713) - July 2025, CSS animations API
- [FFmpegKit Retirement](https://www.itpathsolutions.com/ffmpegkit-shutdown-what-to-do-next) - January 2025
- [typewriter4react-native GitHub](https://github.com/irolinski/typewriter4react-native) - Last updated Sep 2025
- [Tinder-style Swipe Interfaces](https://vinova.sg/engineering-tinder-style-swipe-interfaces-in-react-native/) - Implementation guide

### Low Confidence (Community Resources, Needs Verification)
- Various typewriter animation libraries - Some may be unmaintained
- react-native-deck-swiper - Popular but verify latest version compatibility
- Commercial video SDKs - Need pricing and licensing evaluation

---
*Stack research for: React Native UGC Video Generation (Fortune Telling App)*
*Researched: 2025-01-22*
