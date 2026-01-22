# Domain Pitfalls

**Domain:** React Native Video Generation (Fortune-telling App)
**Researched:** 2026-01-22

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Attempting to Run Remotion in React Native

**What goes wrong:**
Developers try to use Remotion directly in React Native, often through React Native Web or experimental integrations. This leads to:
- Unusable rendering performance (frame-by-frame re-rendering is too expensive)
- Memory exhaustion during rendering
- App freezes during video generation
- Eventually, a complete rewrite is required

**Why it happens:**
- Remotion's documentation shows React components, so developers assume it works in React Native
- Desire to avoid backend infrastructure ("can we just do it client-side?")
- Experimental GitHub repos show proof-of-concepts that don't work in production

**Consequences:**
- Weeks wasted on experimental integration attempts
- Technical debt from partially implemented solutions
- Need to migrate to server-side rendering mid-project
- Loss of confidence in the chosen technology stack

**Prevention:**
- **Never attempt direct Remotion integration in React Native.** The official documentation explicitly states: "Support for React Native is currently not planned due to performance issues"
- Start with server-side video generation architecture from day one
- Use Remotion Lambda or a custom server for rendering
- React Native should only be a client that requests videos and displays results

**Detection:**
- Warning sign: Seeing imports like `remotion` or `@remotion/cli` in React Native code
- Warning sign: Attempting to render React components to video client-side
- Warning sign: Performance testing shows <1 FPS during "video generation"

**Phase to address:**
**Phase 1: Architecture Planning.** This decision must be made before any code is written.

### Pitfall 2: Memory Leaks with Video Components in FlatList

**What goes wrong:**
When implementing video feeds or galleries with `react-native-video` in a FlatList:
- Memory usage grows linearly as user scrolls
- App crashes after 6-20 videos depending on device
- On Android, specific hardware decoder limits are hit (cannot allocate 100+ decoders)
- Memory is not released even when videos are unmounted

**Why it happens:**
- react-native-video instances are not properly cleaned up on unmount
- Expo video has known memory leaks that don't release memory when component unmounts
- Default FlatList rendering creates too many video instances simultaneously
- No offloading of offscreen video resources

**Consequences:**
- Crashes on lower-end devices (especially Android)
- Poor user experience with scrolling
- Negative reviews about app stability
- Difficult to debug because memory leaks manifest over time

**Prevention:**
```typescript
// DO: Proper cleanup in video components
useEffect(() => {
  return () => {
    // Explicit cleanup of video resources
    if (videoRef.current) {
      videoRef.current.dismissFullscreenPlayer();
      // Unload the video source
      videoRef.current.setNativeProps({ src: null });
    }
  };
}, []);

// DO: Use FlatList optimization props
<FlatList
  removeClippedSubviews={true} // Unmount off-screen views
  maxToRenderPerBatch={5} // Limit concurrent renders
  windowSize={5} // Small render window
  initialNumToRender={2} // Start with minimal items
/>

// DO: Only play visible videos (pagination pattern)
const viewabilityConfig = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 300,
};

const onViewableItemsChanged = ({ changed }) => {
  changed.forEach(item => {
    if (item.isViewable) {
      playVideo(item.key);
    } else {
      pauseAndUnloadVideo(item.key); // Critical: unload when not visible
    }
  });
};
```

**Detection:**
- Monitor memory usage while scrolling video lists
- Test on older Android devices with limited RAM
- Use React DevTools Profiler to detect growing memory footprint
- Watch for OS warnings about memory pressure

**Phase to address:**
**Phase 2: Client Video Integration.** Implement video playback with proper cleanup from the start.

### Pitfall 3: Assuming Video Generation Always Succeeds

**What goes wrong:**
Client code assumes backend video generation will always complete successfully:
- No retry logic for failed generations
- No timeout handling
- Progress bar spins forever when server errors occur
- User has no way to recover from failures

**Why it happens:**
- Happy-path development (only testing successful cases)
- Backend works during development but fails under load
- Asset corruption or invalid data causes rendering failures
- Network timeouts aren't handled

**Consequences:**
- Users stuck on loading screen with no escape
- App abandonment during generation
- Support tickets about "broken" videos
- No telemetry to diagnose what went wrong

**Prevention:**
```typescript
// DO: Implement robust generation with retry logic
interface GenerationConfig {
  maxRetries: 3;
  timeout: 60000; // 60 seconds
  backoffMs: 2000;
}

async function generateVideoWithRetry(
  request: GenerationRequest,
  config: GenerationConfig
): Promise<string> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        videoService.generateVideo(request),
        timeout(config.timeout),
      ]);
      return result.videoUrl;
    } catch (error) {
      lastError = error;
      if (attempt < config.maxRetries) {
        await delay(config.backoffMs * attempt); // Exponential backoff
      }
    }
  }

  throw new VideoGenerationError(
    `Failed after ${config.maxRetries} attempts`,
    lastError
  );
}

// DO: Provide user controls
<LoadingScreen
  progress={progress}
  onCancel={() => {
    cancelGeneration();
    navigateBack();
  }}
  estimatedTimeRemaining={estimatedTime}
/>
```

**Detection:**
- Warning sign: Loading screens without cancel buttons
- Warning sign: No try-catch around generation API calls
- Warning sign: No error handling in promise chains

**Phase to address:**
**Phase 2: Client Video Integration.** Implement error handling alongside the initial generation flow.

### Pitfall 4: ProGuard/R8 Breaking Release Builds on Android

**What goes wrong:**
App works perfectly in debug mode but crashes immediately on release builds:
- `TypeError: undefined is not a function` errors
- Video-related libraries fail to load
- Native module methods are not found

**Why it happens:**
- ProGuard/R8 minification obfuscates JSI methods and native module names
- React Native video libraries require specific ProGuard rules
- Some libraries don't ship proper ProGuard configurations
- Release builds use Hermes optimizations that differ from debug

**Consequences:**
- App works in development but crashes in production
- Only discovered after release to users
- Difficult to debug without proper crash reporting
- Emergency hotfixes required

**Prevention:**
```proguard
# android/app/proguard-rules.pro - Add these rules

# Keep React Native Video methods
-keep class com.brentvatne.react.** { *; }
-keep @com.facebook.proguard.annotations.DoNotStrip class *

# Keep native module methods
-keepclassmembers class * {
  @android.webkit.JavascriptInterface <methods>;
}

# Keep React Native JSI
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.jni.** { *; }

# Keep general React Native
-keep class com.facebook.react.** { *; }

# Keep expo modules
-keep class expo.modules.** { *; }
```

**Detection:**
- Test release builds regularly (not just debug builds)
- Use Crashlytics or similar to catch release-only crashes
- Run `bundle release` builds on CI/CD and smoke-test them

**Phase to address:**
**Phase 3: Production Preparation.** Configure ProGuard rules and test release builds before launch.

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 1: Downloading Videos Repeatedly Without Caching

**What goes wrong:**
Videos are downloaded from the network every time they're viewed:
- Wasted bandwidth for users
- Slow playback (waiting for download each time)
- Increased CDN/cloud storage costs
- Poor offline experience

**Why it happens:**
- Using remote URLs directly in video player
- No local filesystem caching strategy
- Not using expo-video's built-in LRU cache properly

**Prevention:**
```typescript
// DO: Implement video caching
async function getCachedVideo(videoUrl: string): Promise<string> {
  const filename = hashFilename(videoUrl);
  const localPath = `${FileSystem.documentDirectory}videos/${filename}.mp4`;

  const info = await FileSystem.getInfoAsync(localPath);
  if (info.exists) {
    return localPath;
  }

  // Download and cache
  await FileSystem.downloadAsync(videoUrl, localPath);
  return localPath;
}

// DO: Use expo-video with cache configuration
import { Video } from 'expo-video';

<Video
  source={{ uri: videoUrl }}
  cachingStrategy="workingCache" // or "aggressive"
  allowsCachingVideo={true}
/>
```

**Phase to address:**
**Phase 3: Playback and Sharing.** Implement caching when adding video playback.

### Pitfall 2: Ignoring iOS vs Android Video Format Differences

**What goes wrong:**
Videos encoded for one platform don't work well on the other:
- Videos play on iOS but not Android (or vice versa)
- Audio codec compatibility issues
- HDR format support differs

**Why it happens:**
- Testing only on one platform during development
- Assuming all MP4 files are the same
- Not accounting for codec support differences

**Prevention:**
```typescript
// Recommended encoding settings for cross-platform compatibility

// Server-side Remotion config:
const outputSettings = {
  codec: 'h264', // H.264 is universally supported
  audioCodec: 'aac', // AAC audio works on both platforms
  pixelFormat: 'yuv420p', // Most compatible pixel format
  profile: 'baseline', // Most compatible H.264 profile
  level: 3.1, // Compatible with mobile devices
  bitrate: '5000K', // 5 Mbps for 1080p, good balance
  maxBitrate: '8000K',
  bufsize: '2000K',
};
```

**Phase to address:**
**Phase 1: Backend Foundation.** Configure cross-platform encoding when setting up Remotion templates.

### Pitfall 3: Not Handling File System Cleanup

**What goes wrong:**
Downloaded videos accumulate on device storage:
- `FileSystem.cacheDirectory` fills up
- No cleanup of old videos
- Device storage warnings
- App becomes unusable over time

**Why it happens:**
- Expo's FileSystem.cacheDirectory requires manual cleanup
- No LRU eviction for downloaded files
- Not tracking what's stored locally

**Prevention:**
```typescript
// DO: Implement cache cleanup
async function cleanupOldVideos(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000) {
  const videosDir = `${FileSystem.documentDirectory}videos/`;
  const files = await FileSystem.readDirectoryAsync(videosDir);

  for (const file of files) {
    const path = `${videosDir}${file}`;
    const info = await FileSystem.getInfoAsync(path);

    if (info.modificationTime && (Date.now() - info.modificationTime) > maxAgeMs) {
      await FileSystem.deleteAsync(path);
    }
  }
}

// DO: Run cleanup periodically
useEffect(() => {
  const cleanupInterval = setInterval(() => {
    cleanupOldVideos();
  }, 24 * 60 * 60 * 1000); // Daily cleanup

  return () => clearInterval(cleanupInterval);
}, []);
```

**Phase to address:**
**Phase 3: Playback and Sharing.** Implement cleanup alongside video caching.

### Pitfall 4: Bundle Size Explosion from Video Assets

**What goes wrong:**
Including video assets, fonts, or animations in the app bundle:
- Initial download size exceeds 50MB
- Users reluctant to download
- Poor app store ratings due to size
- Update downloads take too long

**Why it happens:**
- Bundling background videos or music with app
- Not using asset splitting or code splitting
- Including Lottie animations with embedded assets

**Prevention:**
- **Never bundle videos** with the app. Download from CDN.
- Use CDN-hosted fonts instead of bundling
- Lazy load animation libraries
- Use Hermes engine to reduce JS bundle size

```typescript
// DO: Load assets from CDN
const ASSET_BASE_URL = 'https://cdn.example.com/assets/';

function getAssetUrl(assetName: string): string {
  return `${ASSET_BASE_URL}${assetName}`;
}

// DON'T: Import large assets directly
// import bigVideo from './assets/big-video.mp4'; // Avoid this
```

**Phase to address:**
**Phase 3: Playback and Sharing.** Audit bundle size before release.

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 1: Inadequate Progress Feedback During Generation

**What goes wrong:**
Users see a spinner with no indication of:
- How long generation will take
- What stage is currently processing
- Whether the app has frozen

**Prevention:**
```typescript
// DO: Show detailed progress
<ProgressScreen
  stage={currentStage} // "Preparing assets", "Rendering video", "Encoding"
  progress={progressPercent}
  estimatedTimeRemaining={estimatedSeconds}
/>
```

**Phase to address:**
**Phase 2: Client Video Integration.**

### Pitfall 2: Not Testing on Lower-End Devices

**What goes wrong:**
App works on iPhone 15 Pro and Pixel 8 Pro but crashes on older devices.

**Prevention:**
- Test on devices with 2-3GB RAM
- Use React Native Performance monitoring
- Enable adaptive quality settings based on device capabilities

**Phase to address:**
**Phase 4: Enhancement.** Add performance monitoring and adaptive quality.

### Pitfall 3: Using `any` Type Instead of Proper Schema

**What goes wrong:**
TypeScript type safety is lost with `any` types:
- Runtime errors from undefined properties
- No IDE autocomplete
- Harder refactoring

**Why it happens:**
- Quick prototyping with loose types
- Not defining interfaces for API responses
- AsyncStorage data not properly typed

**Prevention:**
```typescript
// DON'T: Use any
const data: any = await AsyncStorage.getItem('fortune');

// DO: Define and use schema
interface FortuneSchema {
  birthdate: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  result: string;
  timestamp: number;
}

const data = await storage.get<FortuneSchema>('fortune');
```

**Phase to address:**
**All phases.** Establish strict TypeScript discipline from the start.

### Pitfall 4: Not Implementing AsyncStorage Schema Versioning

**What goes wrong:**
App updates break because AsyncStorage format changed:
- Old data can't be read by new code
- App crashes on startup after update
- Users lose their data

**Prevention:**
```typescript
// DO: Implement schema versioning
interface StorageSchema {
  version: 1;
  fortune: FortuneData | null;
  preferences: UserPreferences;
}

async function migrateStorage() {
  const version = await AsyncStorage.getItem('schema_version');

  if (!version) {
    // Migrate from unversioned to v1
    await migrateToV1();
    await AsyncStorage.setItem('schema_version', '1');
  }
}
```

**Phase to address:**
**Phase 3: Production Preparation.** Add migrations before major releases.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| **Phase 1: Backend Foundation** | Trying to use Remotion in React Native | Explicitly document: Remotion is server-side only. Never attempt client-side rendering. |
| **Phase 1: Backend Foundation** | Wrong video encoding for mobile | Use H.264 baseline profile, AAC audio, test on both iOS and Android |
| **Phase 2: Client Integration** | Memory leaks with video components | Implement proper cleanup from day one, test memory usage |
| **Phase 2: Client Integration** | No error handling for generation failures | Add retry logic, timeouts, and user-friendly error messages |
| **Phase 3: Playback & Sharing** | Downloading videos repeatedly | Implement caching with FileSystem or expo-video cache |
| **Phase 3: Playback & Sharing** | Bundle size explosion | Use CDN for assets, never bundle videos |
| **Phase 3: Production Preparation** | ProGuard breaking release builds | Add proper ProGuard rules, test release builds regularly |
| **Phase 3: Production Preparation** | AsyncStorage migration crashes | Implement schema versioning and migrations |
| **Phase 4: Enhancement** | Performance issues on low-end devices | Add adaptive quality, monitor performance, test on older devices |

## Existing Project Issues to Address

Based on the project context, these specific issues should be flagged:

### Issue: TypeScript Type Safety

**Current concern:** "TypeScript型安全性"
**Risk:** Using `any` or `unknown` types reduces confidence in code correctness

**Recommendation:**
- Enable strict TypeScript: `"strict": true` in tsconfig.json
- Define proper interfaces for all data structures
- Use schema validation for external data (API responses, AsyncStorage)
- Avoid type assertions unless necessary

### Issue: Bundle Size

**Current concern:** "バンドルサイズ"
**Risk:** App may become too large with video-related dependencies

**Recommendation:**
- Audit bundle size with `expo bundle-size`
- Use lazy loading for video-related screens
- Consider code splitting for generation feature
- Don't bundle video assets—load from CDN

## Quick Reference Checklist

Before releasing video generation features:

- [ ] Never attempted Remotion integration in React Native
- [ ] All video components implement proper cleanup on unmount
- [ ] Generation API has retry logic and timeout handling
- [ ] ProGuard rules configured for Android release builds
- [ ] Video caching implemented to avoid re-downloads
- [ ] Cross-platform encoding tested (H.264 + AAC)
- [ ] FileSystem cleanup implemented for old videos
- [ ] Bundle size audited (videos not bundled)
- [ ] Progress feedback shown during generation
- [ ] Tested on lower-end devices
- [ ] AsyncStorage schema versioning implemented
- [ ] TypeScript strict mode enabled
- [ ] Release build tested (not just debug)

## Sources

### Official Documentation (HIGH Confidence)
- **Remotion React Native:** https://www.remotion.dev/docs/react-native - Officially states no React Native support
- **expo-video:** https://docs.expo.dev/versions/latest/sdk/video/ - Video playback API
- **expo-file-system:** https://docs.expo.dev/versions/latest/sdk/file-system/ - File storage, requires manual cache cleanup
- **React Native Performance:** https://reactnative.dev/docs/performance - Official performance guidelines
- **Expo Development Build:** https://docs.expo.dev/workflow/overview/ - Development vs production builds

### GitHub Issues & Discussions (MEDIUM Confidence)
- **expo-video memory leak:** https://github.com/expo/expo/issues/35130
- **expo-video-thumbnails memory leak:** https://github.com/expo/expo/issues/15927
- **Multiple videos in FlatList crash:** https://github.com/react-native-community/react-native-video/issues/1938
- **react-native-reanimated memory leaks:** https://github.com/software-mansion/react-native-reanimated/discussions/2286

### WebSearch Results (LOW-MEDIUM Confidence)
- H.264 bitrate recommendations for mobile
- AsyncStorage schema versioning libraries
- TypeScript best practices for React Native
- React Native video editor SDK alternatives

---
*Domain pitfalls research for: React Native Video Generation (Fortune-telling App)*
*Researched: 2026-01-22*
