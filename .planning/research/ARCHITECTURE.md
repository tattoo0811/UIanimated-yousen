# Architecture Research

**Domain:** React Native Video Generation (Fortune-telling App)
**Researched:** 2026-01-22
**Confidence:** HIGH

## Critical Finding: Remotion Does NOT Support React Native

**Source:** Official Remotion Documentation (HIGH confidence)
- Remotion explicitly states: "Support for React Native is currently not planned due to performance issues"
- Root cause: Remotion's architecture requires re-rendering on every frame, which is prohibitively expensive in React Native
- This fundamentally changes the architecture approach

**Recommended Solution:** Server-side video generation with React Native as client

---

## Standard Architecture

### System Overview

```
[React Native Client (Expo)]
┌─────────────────────────────────────────────────────────────┐
│  UI Layer                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Fortune │  │ Preview │  │ Loading │  │ Result  │        │
│  │ Result  │  │ Screen  │  │ Screen  │  │ Screen  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│  Business Logic Layer                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Video Generation Service                            │    │
│  │  - Progress tracking                                 │    │
│  │  - Polling for completion                           │    │
│  │  - Caching strategy                                  │    │
│  └─────────────────────────────────────────────────────┘    │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│  Data Layer                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ AsyncStorage  │  FileSystem  │  SecureStore  │           │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│  [Backend Server]                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Remotion Video Renderer                             │    │
│  │  - Receives generation request                       │    │
│  │  - Renders video server-side                         │    │
│  │  - Stores video (S3/Cloudflare R2)                  │    │
│  │  - Returns URL                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Asset Storage                                       │    │
│  │  - Templates (backgrounds, animations)               │    │
│  │  - Music files                                       │    │
│  │  - Font files                                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                      [External APIs]
                      ┌─────────┐
                      │ TikTok  │
                      │ Sharing │
                      └─────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Fortune Result Screen | Displays fortune-telling result | React Native component with Expo Router |
| Video Generation Service | Orchestrates video creation, tracks progress | Custom hook/service layer |
| Preview Screen | Shows animated preview of video | React Native Reanimated |
| Loading Screen | Shows progress during generation | Animated progress indicator |
| Result Screen | Displays completed video, enables sharing | expo-video + expo-sharing |
| Backend Remotion Renderer | Server-side video generation | Remotion Lambda or custom server |
| Asset Storage | Stores video assets, templates | S3, Cloudflare R2, or local filesystem |

## Recommended Project Structure

```
mobile/
├── app/                       # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx         # Home/fortune input
│   │   ├── result.tsx        # Fortune result + generate video button
│   │   └── _layout.tsx       # Tab navigation
│   ├── loading.tsx           # Video generation progress screen
│   └── share.tsx             # Result screen with sharing options
├── src/
│   ├── components/
│   │   ├── FortuneCard.tsx   # Fortune result display
│   │   ├── ProgressBar.tsx   # Generation progress indicator
│   │   └── VideoPreview.tsx  # Video preview player
│   ├── services/
│   │   ├── videoGeneration.ts # Video generation API client
│   │   ├── progressPolling.ts # WebSocket/polling for progress
│   │   └── assetCache.ts      # Local asset caching
│   ├── lib/
│   │   ├── storage/
│   │   │   ├── asyncStorage.ts # Local data persistence
│   │   │   └── fileSystem.ts   # Video file management
│   │   └── api/
│   │       └── video.ts        # Backend API endpoints
│   └── types/
│       └── video.ts           # Video-related type definitions
└── assets/
    ├── videos/                # Local video templates
    ├── audio/                 # Background music
    └── fonts/                 # Custom fonts
```

### Structure Rationale

- **app/**: Expo Router convention for file-based routing
- **src/components/**: Reusable UI components for video-related features
- **src/services/**: Business logic for video generation, progress tracking
- **src/lib/storage/**: Abstraction layer for local storage operations
- **src/types/**: TypeScript types for video generation domain
- **assets/**: Static assets bundled with app

## Architectural Patterns

### Pattern 1: Client-Server Video Generation

**What:** React Native client sends generation request to backend server where Remotion renders the video

**When to use:**
- When video generation requires complex animations
- When multiple export formats are needed
- When server-side assets are required

**Trade-offs:**
- Pros: Full Remotion capabilities, no mobile performance constraints, easier to maintain
- Cons: Requires backend infrastructure, network dependency, server costs

**Example:**
```typescript
// src/services/videoGeneration.ts
export interface GenerationRequest {
  fortuneData: FortuneResult;
  templateId: string;
  musicTrack?: string;
}

export interface GenerationResponse {
  jobId: string;
  estimatedDuration: number;
}

export class VideoGenerationService {
  async generateVideo(request: GenerationRequest): Promise<GenerationResponse> {
    const response = await fetch(`${API_BASE}/video/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async getJobStatus(jobId: string): Promise<{ status: 'pending' | 'processing' | 'completed' | 'failed', progress: number }> {
    const response = await fetch(`${API_BASE}/video/status/${jobId}`);
    return response.json();
  }

  async downloadVideo(jobId: string): Promise<string> {
    const { uri } = await FileSystem.downloadAsync(
      `${API_BASE}/video/download/${jobId}`,
      `${FileSystem.documentDirectory}videos/${jobId}.mp4`
    );
    return uri;
  }
}
```

### Pattern 2: Progress Polling with Fallback

**What:** Poll for progress updates, fall back to timeout-based progress if unavailable

**When to use:**
- When WebSocket support is unreliable
- When simple progress indication suffices
- When backend doesn't support real-time updates

**Trade-offs:**
- Pros: Simple to implement, works everywhere, minimal backend complexity
- Cons: Less accurate than WebSocket, higher network overhead

**Example:**
```typescript
// src/services/progressPolling.ts
export class ProgressPollingService {
  private pollInterval = 1000; // 1 second

  async pollProgress(
    jobId: string,
    onProgress: (progress: number) => void,
    onComplete: (videoUrl: string) => void
  ): Promise<void> {
    const startTime = Date.now();
    const estimatedDuration = 30000; // 30 seconds default

    const poll = async () => {
      const status = await videoService.getJobStatus(jobId);

      if (status.status === 'completed') {
        onComplete(status.videoUrl);
        return;
      }

      if (status.status === 'failed') {
        throw new Error('Video generation failed');
      }

      // Use actual progress or estimate based on time
      const progress = status.progress > 0
        ? status.progress
        : Math.min(90, ((Date.now() - startTime) / estimatedDuration) * 100);

      onProgress(progress);

      // Continue polling
      setTimeout(poll, this.pollInterval);
    };

    poll();
  }
}
```

### Pattern 3: Asset Preloading and Caching

**What:** Preload video assets and cache them locally for faster subsequent generations

**When to use:**
- When app uses same assets repeatedly
- When offline functionality is desired
- When reducing generation time is critical

**Trade-offs:**
- Pros: Faster generation, offline capability, reduced bandwidth
- Cons: Increased app size, cache management complexity

**Example:**
```typescript
// src/services/assetCache.ts
export class AssetCacheService {
  private cache = new Map<string, string>();

  async preloadAsset(url: string, key: string): Promise<string> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const localPath = `${FileSystem.cacheDirectory}${key}`;
    await FileSystem.downloadAsync(url, localPath);
    this.cache.set(key, localPath);

    return localPath;
  }

  async preloadMusicTracks(tracks: string[]): Promise<void> {
    await Promise.all(
      tracks.map(track => this.preloadAsset(track, `music/${basename(track)}`))
    );
  }

  getCachedAsset(key: string): string | undefined {
    return this.cache.get(key);
  }
}
```

## Data Flow

### Request Flow

```
[User Action: Generate Video]
    ↓
[Result Screen] → [VideoGenerationService.generateVideo()]
    ↓                  ↓
[Loading Screen]  → [POST /video/generate]
    ↓                  ↓
[ProgressPolling] ← [Backend: Create Job]
    ↓                  ↓
[ProgressBar Update] ← [Remotion: Render Video]
    ↓                  ↓
[Status Check Loop] → [GET /video/status/{jobId}]
    ↓                  ↓
[Download Complete] ← [Backend: Return URL]
    ↓
[VideoPreview] → [FileSystem.downloadAsync()]
    ↓
[Result Screen] → [expo-video playback]
    ↓
[User Action: Share]
    ↓
[expo-sharing] → [External Apps]
```

### State Management

```
[Video Generation State]
    ↓ (useVideoGeneration hook)
[Components] ←→ [Actions]
                      ↓
              [Async Thunks]
                      ↓
              [Service Layer]
                      ↓
              [API Calls]
```

### Key Data Flows

1. **Fortune Result to Video Request:**
   - User receives fortune result (stored locally)
   - User taps "Generate Video"
   - Fortune data extracted from storage
   - Generation request sent to backend with fortune data
   - Backend maps fortune data to video template parameters

2. **Progress Updates:**
   - Loading screen displays after generation request
   - Service polls backend every 1-2 seconds
   - Progress bar updates based on returned percentage
   - On completion, video URL is returned

3. **Video Download and Playback:**
   - Backend returns signed URL or direct download link
   - FileSystem downloads video to app's documentDirectory
   - expo-video component plays from local URI
   - Video cached for future playback

4. **Sharing Workflow:**
   - User taps share button
   - expo-sharing opens share sheet
   - User selects target app (TikTok, Instagram, etc.)
   - Video file passed to target app
   - Target app handles upload

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single server with Remotion Lambda or custom Fargate tasks |
| 1k-100k users | Queue-based processing (SQS + Lambda), CDN for video delivery |
| 100k+ users | Dedicated rendering cluster, distributed asset storage, edge caching |

### Scaling Priorities

1. **First bottleneck:** Video generation CPU time
   - Fix: Use Remotion Lambda for horizontal scaling, implement queue system
2. **Second bottleneck:** Storage and bandwidth costs
   - Fix: Use S3 + CloudFront, implement video cleanup policies, consider lower resolution options

## Anti-Patterns

### Anti-Pattern 1: Trying to Run Remotion in React Native

**What people do:** Attempt to use Remotion directly in React Native with React Native Web

**Why it's wrong:** Remotion explicitly doesn't support React Native due to performance issues. Every-frame re-rendering is prohibitively expensive on mobile.

**Do this instead:** Use server-side video generation with Remotion, send generation requests from React Native client

### Anti-Pattern 2: Blocking UI During Generation

**What people do:** Show loading spinner without progress, block all navigation

**Why it's wrong:** Video generation can take 10-30 seconds. Users may think app froze and abandon.

**Do this instead:** Show progress bar, allow cancellation, display estimated time remaining

### Anti-Pattern 3: Downloading Video Every Playback

**What people do:** Fetch video URL from network every time user wants to watch

**Why it's wrong:** Wastes bandwidth, causes playback delays, poor UX

**Do this instead:** Download once to local filesystem, play from local URI, implement cache expiration

### Anti-Pattern 4: No Error Handling for Generation Failures

**What people do:** Assume video generation always succeeds

**Why it's wrong:** Rendering can fail for various reasons (invalid assets, server errors, timeouts)

**Do this instead:** Implement retry logic, show friendly error messages, offer "try again" option

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| TikTok Share SDK | expo-sharing (native share sheet) | Direct TikTok SDK requires dev config, share sheet works universally |
| Instagram | expo-sharing | Supports Stories and Feed |
| LINE | expo-sharing | Native LINE integration on iOS/Android |
| Backend API | REST or WebSocket | REST for requests, WebSocket for real-time progress |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ Video Service | Async functions, custom hooks | Service layer handles all API communication |
| Video Service ↔ Storage | FileSystem API | Store downloaded videos in documentDirectory |
| Progress Polling ↔ UI | State updates via React state | Use useCallback to prevent re-renders |

## Technology Recommendations

### Client-Side (React Native)

| Technology | Version | Purpose |
|------------|---------|---------|
| expo-video | ~1.2.0 | Video playback (replaces deprecated expo-av Video) |
| expo-sharing | ~14.0.8 | Share videos to other apps |
| expo-file-system | ~18.0.6 | Local video storage |
| react-native-reanimated | ~4.1.1 | Smooth progress animations |
| react-native-worklets | 0.5.1 | UI thread animations for preview |

**Note:** expo-sharing is already installed. Add expo-video for playback.

### Server-Side (Video Generation)

| Technology | Purpose |
|------------|---------|
| Remotion | Video generation framework |
| Remotion Lambda | AWS Lambda-based rendering (recommended) |
| Express/Fastify | API server |
| S3 / Cloudflare R2 | Video storage |
| SQS / BullMQ | Job queue for scaling |

### Build Order (Based on Dependencies)

1. **Phase 1: Backend Foundation**
   - Set up Remotion video templates
   - Create generation API endpoint
   - Implement basic job processing

2. **Phase 2: Client Integration**
   - Create VideoGenerationService
   - Implement loading screen with progress
   - Add video download to filesystem

3. **Phase 3: Playback and Sharing**
   - Integrate expo-video for playback
   - Implement expo-sharing workflow
   - Add video caching

4. **Phase 4: Enhancement**
   - Add preview animations
   - Implement asset preloading
   - Add error handling and retry logic

## Architecture Alternatives Considered

### Alternative 1: Cloud Video Generation APIs (Creatomate, Shotstack)

**What:** Use managed APIs for video generation instead of building custom Remotion backend

**Pros:**
- No infrastructure to manage
- Faster to implement initially
- Predictable pricing

**Cons:**
- Less customization control
- Vendor lock-in
- Can become expensive at scale

**Verdict:** Consider for MVP, but custom Remotion backend offers better long-term value

### Alternative 2: React Native Video Editor SDKs (IMG.LY, Banuba)

**What:** Use commercial SDKs for client-side video editing

**Pros:**
- No backend required
- Real-time preview
- Offline functionality

**Cons:**
- Expensive licensing (thousands per year)
- Larger app size
- Limited by mobile hardware

**Verdict:** Not recommended for fortune-telling use case; server-side generation is sufficient

### Alternative 3: React Native Reanimated Only (Simple Animations)

**What:** Create simple animations using Reanimated and record screen

**Pros:**
- No backend required
- Lightweight solution

**Cons:**
- Limited animation capabilities
- Screen recording is unreliable
- Poor quality output

**Verdict:** Not suitable for TikTok-style UGC videos

## Sources

### Official Documentation (HIGH Confidence)
- **Remotion React Native Docs:** https://www.remotion.dev/docs/react-native - Explicitly states no React Native support planned
- **Remotion renderMedia():** https://www.remotion.dev/docs/renderer/render-media - Server-side rendering API
- **Remotion Assets:** https://www.remotion.dev/docs/assets/ - Asset management in Remotion
- **Remotion Fonts:** https://www.remotion.dev/docs/fonts/ - Custom font loading
- **expo-video:** https://docs.expo.dev/versions/latest/sdk/video/ - Modern video playback API
- **expo-sharing:** https://docs.expo.dev/versions/latest/sdk/sharing/ - File sharing functionality
- **expo-file-system:** https://docs.expo.dev/versions/latest/sdk/file-system/ - File storage API

### WebSearch Results (MEDIUM-LOW Confidence)
- "Remotion React Native 2026" - Confirmed no official support
- "React Native video editor SDKs 2026" - Identified IMG.LY, Banuba options
- "expo-video deprecated expo-av" - Confirmed expo-av Video is deprecated
- "TikTok sharing React Native 2026" - expo-sharing provides native share sheet

---
*Architecture research for: React Native Video Generation (Fortune-telling App)*
*Researched: 2026-01-22*
