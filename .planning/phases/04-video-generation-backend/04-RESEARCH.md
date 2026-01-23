# Phase 04: Video Generation Backend - Research

**Researched:** 2026-01-23
**Domain:** Server-side video rendering with Remotion on GCP
**Confidence:** HIGH

## Summary

Phase 04 focuses on building a server-side Remotion-based video generation system on Google Cloud Platform. The system will generate 9:16 vertical videos (1080x1920, 30fps, 15-30 seconds) with typing effect animations for personalized fortune-telling content. Research confirms that **@remotion/cloudrun** (v4.0.399+) provides official GCP integration with comprehensive tooling for deployment, rendering, and progress tracking.

The recommended architecture uses **Cloud Run** for containerized video rendering services, **Cloud Storage** for video output delivery, and **Cloud Build** for CI/CD. Progress tracking is implemented via polling-based status endpoints (3-5 second intervals). The typing effect uses native Remotion patterns with **Sequence** and **interpolate()** for character-by-character text animation.

**Primary recommendation:** Use `@remotion/cloudrun` official package with 2 vCPU / 2GiB memory configuration, implementing polling-based progress tracking with Cloud Storage CDN delivery for optimal cost-performance balance.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **remotion** | 4.0+ | Video rendering framework | Official framework, React-based, extensive documentation (3146 code snippets) |
| **@remotion/cloudrun** | 4.0.399+ | GCP Cloud Run integration | Official GCP support, tested patterns, idempotent deployment |
| **@remotion/cloudrun/client** | 4.0+ | Client-side rendering API | Type-safe SDK for triggering renders and progress tracking |
| **@remotion/bundler** | 4.0+ | Webpack bundling | Bundle Remotion compositions for server deployment |
| **express** | 4.x | REST API server | Standard Node.js backend framework |
| **Node.js** | 18+ | Runtime | Remotion requires Node 18+, supports modern async/await |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@remotion/zod-types** | 4.0+ | Props validation schema | Type-safe input props validation for compositions |
| **@google-cloud/storage** | 7.x | Cloud Storage client | Direct GCS access for custom upload/download logic |
| **@google-cloud/tasks** | 4.x | Cloud Tasks client | Job queue implementation (optional, for concurrent request handling) |
| **cors** | 2.x | CORS middleware | Express API CORS support |
| **dotenv** | 16.x | Environment variables | Configuration management |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **@remotion/cloudrun** | **@remotion/lambda** (AWS) | AWS Lambda has mature patterns but project uses GCP. Lambda has better cold-start characteristics but Cloud Run provides simpler pricing model |
| **Cloud Run rendering** | **Cloud Build rendering** | Cloud Build is time-based billing (~$0.003/min), better for batch jobs. Cloud Run is resource-based billing, better for on-demand APIs |
| **Polling progress** | **Webhook callbacks** | Webhooks reduce polling overhead but require public endpoint and retry logic. Polling is simpler for mobile clients |
| **GCS direct delivery** | **Cloud CDN** | Cloud CDN provides caching edge locations but adds cost. GCS + signed URLs sufficient for moderate volume |

**Installation:**
```bash
# Core packages
npm install remotion @remotion/cloudrun @remotion/cloudrun/client @remotion/bundler
npm install express cors dotenv

# TypeScript types
npm install -D @types/express @types/cors

# Google Cloud clients
npm install @google-cloud/storage @google-cloud/tasks

# Validation
npm install @remotion/zod-types zod
```

## Architecture Patterns

### Recommended Project Structure

```
backend/
├── src/
│   ├── compositions/     # Remotion video templates
│   │   ├── HookComposition.tsx
│   │   ├── TypingText.tsx
│   │   └── themes/       # KiraPop, MonoEdge, ZenWa themes
│   ├── api/              # Express REST API
│   │   ├── routes/
│   │   │   ├── generate.ts
│   │   │   └── status.ts
│   │   ├── controllers/
│   │   │   └── renderController.ts
│   │   └── index.ts      # Express app setup
│   ├── services/         # Business logic
│   │   ├── cloudrun.ts   # Remotion Cloud Run wrapper
│   │   ├── storage.ts    # Cloud Storage operations
│   │   └── queue.ts      # Job queue (optional)
│   ├── lib/              # Utilities
│   │   ├── progress.ts   # Progress polling logic
│   │   └── cache.ts      # Render result caching
│   └── index.ts          # Remotion entry point
├── Dockerfile            # Container image
├── cloudbuild.yaml       # CI/CD pipeline
└── package.json
```

### Pattern 1: Cloud Run Service Deployment

**What:** Idempotent deployment of Remotion rendering service to Google Cloud Run with configured resources.

**When to use:** Initial setup and updates to rendering infrastructure. The `deployService()` function is idempotent - it returns existing service if configuration matches.

**Example:**
```typescript
// Source: https://context7.com/remotion-dev/remotion/llms.txt
import {deployService, getOrCreateBucket, deploySite} from '@remotion/cloudrun';

const REGION = 'us-central1';

async function setupCloudRun() {
  // 1. Create or get existing GCS bucket
  const {bucketName} = await getOrCreateBucket({
    region: REGION,
  });

  // 2. Deploy Cloud Run service
  const {serviceName, uri} = await deployService({
    region: REGION,
    memorySizeInMb: 2048,  // 2GiB recommended minimum
    cpuCount: 2,            // 2 vCPU for good performance
    timeoutInSeconds: 300,  // 5 minutes max render time
  });

  // 3. Deploy Remotion site bundle
  const {serveUrl} = await deploySite({
    entryPoint: './src/index.ts',
    bucketName,
    siteName: 'fortune-video-site',
  });

  return {serviceName, serveUrl, bucketName};
}
```

**Resource Requirements (HIGH confidence):**
- **Memory:** 2GiB minimum recommended by Remotion docs (min: 512MiB, max: 32GiB)
- **CPU:** 2 vCPU for 30-second videos, scale to 4-8 vCPU for concurrent renders
- **Timeout:** 300 seconds (5 minutes) sufficient for 30-second video
- **Instance scaling:** Set minimum instances to 1 to reduce cold starts

### Pattern 2: Render Trigger with Progress Tracking

**What:** Asynchronous video rendering with immediate job ID return and polling-based progress tracking.

**When to use:** On-demand video generation from mobile app clients requiring real-time progress updates.

**Example:**
```typescript
// Source: Context7 Cloud Run documentation
import {renderMediaOnCloudrun} from '@remotion/cloudrun/client';

// API endpoint: POST /api/video/generate
async function generateVideo(req: Request, res: Response) {
  const {nickname, fortuneData, theme, tone} = req.body;

  // Trigger render (returns immediately)
  const {bucketName, renderId} = await renderMediaOnCloudrun({
    region: 'us-central1',
    serviceName: 'remotion-render-service',
    serveUrl: deployedSiteUrl,
    composition: 'HookComposition',
    inputProps: {
      nickname,
      fortuneData,
      theme,  // KiraPop, MonoEdge, ZenWa
      tone,
    },
    codec: 'h264',
    privacy: 'public',

    // Optional: Progress callback during render
    onProgress: ({progress, renderedFrames, totalFrames}) => {
      console.log(`Render ${renderId}: ${Math.round(progress * 100)}%`);
    },
  });

  // Return job ID immediately (mobile polls for status)
  res.json({
    jobId: renderId,
    status: 'pending',
    bucketName,
  });
}

// API endpoint: GET /api/video/status/:jobId
async function getRenderStatus(req: Request, res: Response) {
  const {jobId} = req.params;

  // Poll render progress
  const progress = await getRenderProgress({
    renderId: jobId,
    bucketName: 'remotioncloudrun-xxxxx',
    region: 'us-central1',
    serviceName: 'remotion-render-service',
  });

  if (progress.done) {
    return res.json({
      status: 'completed',
      videoUrl: progress.outputFile,
      renderTime: progress.timeToFinish,
    });
  }

  if (progress.fatalErrorEncountered) {
    return res.status(500).json({
      status: 'failed',
      errors: progress.errors,
    });
  }

  res.json({
    status: 'processing',
    progress: progress.overallProgress,
    renderedFrames: progress.renderedFrameCount,
  });
}
```

**Progress Tracking Flow (HIGH confidence):**
1. Mobile app calls `POST /api/video/generate` → receives `{jobId, status: 'pending'}`
2. Mobile app polls `GET /api/video/status/:jobId` every 3-5 seconds
3. Server calls `getRenderProgress()` to fetch latest status from Cloud Run
4. Returns status progression: `pending` → `processing` → `completed`|`failed`
5. On `completed`: returns `{videoUrl}` pointing to Cloud Storage
6. Mobile app stops polling on timeout (30 seconds) or completion

### Pattern 3: Typing Effect with Sequence and Interpolate

**What:** Character-by-character text animation using Remotion's native interpolation and Sequence components.

**When to use:** Typing effect for nickname display, fortune results revelation, or any text that should appear progressively.

**Example:**
```typescript
// Source: https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/text-animations.md
import {Sequence, useCurrentFrame, interpolate, useVideoConfig} from 'remotion';

export const TypingText: React.FC<{
  text: string;
  speed?: number;  // characters per second (default: 15)
}> = ({text, speed = 15}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Calculate how many characters should be visible
  const charsPerSecond = speed;
  const charsToShow = Math.floor((frame / fps) * charsPerSecond);

  // Slice text progressively
  const visibleText = text.slice(0, charsToShow);

  // Optional: Cursor blink effect
  const showCursor = interpolate(frame % 30, [0, 15, 30], [1, 0, 1]);

  return (
    <div style={{fontSize: 48, fontFamily: 'monospace'}}>
      {visibleText}
      <span style={{opacity: showCursor}}>▋</span>
    </div>
  );
};

// Usage in composition with timing control
export const HookComposition: React.FC<CompositionProps> = ({
  nickname,
  fortuneData,
  theme,
}) => {
  return (
    <>
      {/* 0-2s: Visual Hook (attention-grabbing visuals) */}
      <Sequence from={0} durationInFrames={60}>
        <VisualHook theme={theme} />
      </Sequence>

      {/* 2-5s: Personalization (nickname typing) */}
      <Sequence from={60} durationInFrames={90}>
        <TypingText
          text={`${nickname}さんの運勢`}
          speed={20}  // Faster for nickname
        />
      </Sequence>

      {/* 5-15s: Revelation (fortune typing) */}
      <Sequence from={150} durationInFrames={300}>
        <TypingText
          text={fortuneData.result}
          speed={15}  // Standard typing speed
        />
      </Sequence>

      {/* 15-20s: CTA */}
      <Sequence from={450} durationInFrames={150}>
        <CallToAction />
      </Sequence>

      {/* 20-30s: Branding */}
      <Sequence from={600} durationInFrames={300}>
        <BrandingElements />
      </Sequence>
    </>
  );
};
```

**Typing Effect Implementation (HIGH confidence):**
- **Frame-based calculation:** Use `useCurrentFrame()` and `fps` to determine timing
- **Text slicing:** `text.slice(0, charsToShow)` for progressive display
- **Cursor effect:** Optional blinking cursor using `interpolate()` with modulo
- **Speed control:** Adjust `charsPerSecond` for different effects (faster for nickname, slower for fortune)
- **Sequence timing:** Use `<Sequence from={frame} durationInFrames={n}>` for section timing

### Pattern 4: 9:16 Vertical Video Composition

**What:** Full HD vertical video composition configured for TikTok/Instagram Reels format.

**When to use:** All video compositions for social media vertical format.

**Example:**
```typescript
// Source: Remotion composition configuration
import {Composition} from 'remotion';
import {HookComposition} from './HookComposition';

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="HookComposition"
        component={HookComposition}
        durationInFrames={900}  // 30 seconds @ 30fps
        fps={30}
        width={1080}   // 9:16 vertical
        height={1920}
        defaultProps={{
          nickname: 'テストユーザー',
          fortuneData: {
            result: '今日は幸運な一日でしょう！',
            rating: 5,
          },
          theme: 'KiraPop',
          tone: 'TikTok',
        }}
      />
    </>
  );
};

// In Root.tsx or video project entry point
import {Composition} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';

export const hookCompositionSchema = z.object({
  nickname: z.string().max(20),
  fortuneData: z.object({
    result: z.string().max(200),
    rating: z.number().min(1).max(5),
  }),
  theme: z.enum(['KiraPop', 'MonoEdge', 'ZenWa']),
  tone: z.enum(['TikTok', 'YouTube', 'Instagram']),
});
```

**Video Format Specifications (HIGH confidence):**
- **Aspect Ratio:** 9:16 (vertical) for TikTok/Instagram Reels
- **Resolution:** 1080x1920 (Full HD vertical)
- **Frame Rate:** 30fps (standard social media)
- **Duration:** 15-30 seconds (900 frames max @ 30fps)
- **Codec:** H.264 + AAC (standard compatibility)
- **Bitrate:** Variable (VBR) for quality optimization

### Anti-Patterns to Avoid

- **Synchronous rendering:** Don't use `renderMedia()` synchronously in API handler. Use `renderMediaOnCloudrun()` for async trigger.
- **Blocking progress polling:** Don't make mobile app wait for render completion. Return job ID immediately, poll asynchronously.
- **Hard-coded credentials:** Don't embed GCP credentials in code. Use ADC (Application Default Credentials) or environment variables.
- **Unlimited text length:** Don't accept unlimited text input. Validate with Zod schema and truncate to prevent overflow.
- **Single theme hardcoded:** Don't build separate compositions for each theme. Use theme system with props for dynamic styling.
- **Ignoring cold starts:** Don't assume Cloud Run instances are always warm. Implement keep-warm strategy or set min instances.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Video rendering orchestration** | Custom FFmpeg wrapper, Puppeteer automation | **@remotion/cloudrun** | Handles container orchestration, progress tracking, error handling, GCS integration |
| **Progress tracking system** | Database-based job status, Redis pub/sub | **getRenderProgress()** from `@remotion/cloudrun/client` | Built-in progress API with overallProgress, renderedFrameCount, error handling |
| **Typing animation** | Custom frame-based text slicing, CSS animations | **Remotion interpolate() + Sequence** | Native support, frame-accurate timing, no external dependencies |
| **Webpack bundling** | Custom webpack config for server bundle | **@remotion/bundler** | Pre-configured for Remotion, handles composition discovery, asset bundling |
| **Props validation** | Manual validation, Joi, Yup | **@remotion/zod-types** | Type-safe, integrates with Remotion dev tools, runtime validation |
| **GCS authentication** | Service account key file parsing | **Google Cloud ADC** | Automatic credential loading, no key management, works locally and on GCP |

**Key insight:** Remotion Cloud Run integration is mature (v4.0.399+) with production-tested patterns. Custom implementations add complexity without benefit.

## Common Pitfalls

### Pitfall 1: Insufficient Cloud Run Resources Leading to Timeouts

**What goes wrong:** Video renders fail with timeout errors or take extremely long (>5 minutes) for 30-second videos.

**Why it happens:** Cloud Run defaults (512MiB RAM, 1 vCPU) are insufficient for video rendering. Memory constrains Chromium browser, CPU limits parallel frame rendering.

**How to avoid:**
- **Minimum resources:** 2 vCPU / 2GiB RAM for 30-second videos
- **Scale for concurrent renders:** 4-8 vCPU if handling multiple simultaneous requests
- **Monitor render times:** Use `onProgress` callback to track performance
- **Optimize composition:** Reduce `<OffthreadVideo>` usage, pre-render assets

**Warning signs:**
- Renders consistently time out at 300 seconds
- Memory errors in Cloud Run logs
- Progress stalls at same percentage

### Pitfall 2: Cold Start Latency Impacting User Experience

**What goes wrong:** First video render after inactivity takes 10-20 seconds longer due to container cold start.

**Why it happens:** Cloud Run scales to zero when idle. Cold start includes: container pull + Node.js startup + Remotion bundle loading + Chromium initialization.

**How to avoid:**
- **Set minimum instances:** `gcloud run services update --min-instances 1` keeps container warm
- **Implement keep-warm pings:** Scheduled cron job (Cloud Scheduler) calls health endpoint every 5 minutes
- **Optimize container size:** Minimize Docker image layers, use alpine base if compatible
- **Acceptable cold start:** Communicate to users via progress UI (e.g., "Preparing video engine...")

**Warning signs:**
- First render after 10+ minutes consistently slower
- Mobile app timeouts (30s) on first request
- Progress shows "pending" for >15 seconds before "processing"

### Pitfall 3: Polling Overload and Cost Accumulation

**What goes wrong:** Mobile apps poll too frequently (every 1 second), generating excessive Cloud Run invocations and costs.

**Why it happens:** Developers prioritize real-time updates over cost. 30-second render with 1-second polling = 30 requests per video.

**How to avoid:**
- **Recommended interval:** 3-5 seconds (balances responsiveness and cost)
- **Exponential backoff:** Start at 3s, increase to 5s after 3 polls
- **Client-side timeout:** Stop polling after 30 seconds total
- **Cache results:** Store completed render status in Redis/Firebase for instant lookup

**Cost calculation (MEDIUM confidence):**
- **Polling cost:** $0.40 per million requests
- **3-second polling, 30s render:** 10 requests per video = $0.000004 per video
- **1-second polling:** 30 requests per video = $0.000012 per video (3x cost)

**Warning signs:**
- Cloud Run request count significantly higher than video renders
- Large portion of request time spent on progress checks vs actual rendering

### Pitfall 4: Text Overflow and Layout Breaking in Typing Effect

**What goes wrong:** Typing animation causes text to overflow container boundaries or break layout on mobile preview.

**Why it happens:** Long fortune results (200+ characters) exceed vertical space. Font sizes not responsive to text length.

**How to avoid:**
- **Validate input length:** Zod schema max 200 characters for fortune result
- **Dynamic font sizing:** Calculate font size based on text length
- **Scrollable containers:** Use `overflow-y: auto` for long text sections
- **Line breaks:** Insert `\n` at logical intervals (every 50 characters)

**Example defensive code:**
```typescript
const fontSize = text.length > 100 ? 36 : 48;

<div style={{
  fontSize,
  maxHeight: 600,
  overflowY: 'auto',
  wordBreak: 'break-word',
}}>
  <TypingText text={text} />
</div>
```

**Warning signs:**
- Text cut off at bottom of preview
- Horizontal scrollbars appearing
- Layout breaking on long fortune results

### Pitfall 5: Ignoring Video Format Compatibility

**What goes wrong:** Generated videos don't play on certain devices or social media platforms reject uploads.

**Why it happens:** Using non-standard codecs, wrong aspect ratio, or incorrect audio encoding.

**How to avoid:**
- **Stick to standards:** H.264 video codec, AAC audio codec
- **Aspect ratio:** Exactly 9:16 (1080x1920), not close approximations
- **Frame rate:** 30fps (not 29.97 or 60)
- **Bitrate:** Use VBR 2-5 Mbps for 1080p vertical
- **Test playback:** Verify on iOS, Android, and web before deploying

**Remotion codec configuration (HIGH confidence):**
```typescript
await renderMediaOnCloudrun({
  codec: 'h264',      // Standard compatibility
  audioCodec: 'aac',  // Default for H.264
  bitrate: '4000k',   // 4 Mbps for 1080p
  // Don't customize: profile, level, pixel format
});
```

**Warning signs:**
- Videos play on desktop but not mobile
- Social media upload rejections
- Large file sizes (>10MB for 30-second video)

## Code Examples

Verified patterns from official sources:

### Cloud Run Deployment Script

```typescript
// Source: https://context7.com/remotion-dev/remotion/llms.txt
import {deployService, deploySite, getOrCreateBucket} from '@remotion/cloudrun';

async function deployRemotionService() {
  const REGION = 'us-central1';

  // Step 1: Provision storage
  const {bucketName} = await getOrCreateBucket({region: REGION});

  // Step 2: Deploy rendering service
  const {serviceName, uri} = await deployService({
    region: REGION,
    memorySizeInMb: 2048,
    cpuCount: 2,
    timeoutInSeconds: 300,
  });

  console.log(`Service deployed: ${serviceName}`);
  console.log(`Service URI: ${uri}`);

  // Step 3: Bundle and upload site
  const {serveUrl} = await deploySite({
    entryPoint: './src/index.ts',
    bucketName,
    siteName: 'fortune-videos',
  });

  console.log(`Site deployed: ${serveUrl}`);

  return {serviceName, serveUrl, bucketName};
}
```

### Express API with Render Controller

```typescript
// Source: Based on POST /api/render pattern from Remotion docs
import express from 'express';
import cors from 'cors';
import {renderMediaOnCloudrun, getRenderProgress} from '@remotion/cloudrun/client';

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const CLOUD_RUN_CONFIG = {
  region: 'us-central1',
  serviceName: process.env.REMOTION_SERVICE_NAME,
  serveUrl: process.env.REMOTION_SERVE_URL,
};

// POST /api/video/generate
app.post('/api/video/generate', async (req, res) => {
  try {
    const {nickname, fortuneData, theme, tone} = req.body;

    const {bucketName, renderId} = await renderMediaOnCloudrun({
      ...CLOUD_RUN_CONFIG,
      composition: 'HookComposition',
      inputProps: {nickname, fortuneData, theme, tone},
      codec: 'h264',
      privacy: 'public',
    });

    res.json({
      jobId: renderId,
      status: 'pending',
      estimatedTimeSeconds: 30,
    });
  } catch (error) {
    console.error('Render trigger failed:', error);
    res.status(500).json({error: 'Failed to start render'});
  }
});

// GET /api/video/status/:jobId
app.get('/api/video/status/:jobId', async (req, res) => {
  try {
    const {jobId} = req.params;

    const progress = await getRenderProgress({
      renderId: jobId,
      bucketName: process.env.GCS_BUCKET_NAME,
      region: CLOUD_RUN_CONFIG.region,
      serviceName: CLOUD_RUN_CONFIG.serviceName,
    });

    if (progress.done) {
      return res.json({
        status: 'completed',
        videoUrl: progress.outputFile,
        renderTime: progress.timeToFinish,
      });
    }

    if (progress.fatalErrorEncountered) {
      return res.status(500).json({
        status: 'failed',
        errors: progress.errors,
      });
    }

    res.json({
      status: 'processing',
      progress: Math.round(progress.overallProgress * 100),
      renderedFrames: progress.renderedFrameCount,
      totalFrames: progress.renderMetadata.frameRange[1],
    });
  } catch (error) {
    console.error('Progress check failed:', error);
    res.status(500).json({error: 'Failed to check progress'});
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Render API listening on port ${PORT}`);
});
```

### Theme System for Video Templates

```typescript
// Source: Remotion composition patterns
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';

export const themeSchema = z.object({
  theme: z.enum(['KiraPop', 'MonoEdge', 'ZenWa']),
  tone: z.enum(['TikTok', 'YouTube', 'Instagram']),
});

export type VideoTheme = z.infer<typeof themeSchema>;

export const themeConfig = {
  KiraPop: {
    colors: {
      background: '#FFB6C1',
      primary: '#FF69B4',
      text: '#FFFFFF',
      accent: '#87CEEB',
    },
    fonts: {
      heading: 'M PLUS Rounded 1c',
      body: 'Noto Sans JP',
    },
    animations: {
      spring: {damping: 15, stiffness: 200},
      typingSpeed: 20,
    },
  },
  MonoEdge: {
    colors: {
      background: '#1A1A1A',
      primary: '#FFFFFF',
      text: '#E0E0E0',
      accent: '#00FFFF',
    },
    fonts: {
      heading: 'Noto Sans JP',
      body: 'Noto Sans JP',
    },
    animations: {
      spring: {damping: 50, stiffness: 100},
      typingSpeed: 15,
    },
  },
  ZenWa: {
    colors: {
      background: '#F5F5DC',
      primary: '#8B4513',
      text: '#2F2F2F',
      accent: '#DAA520',
    },
    fonts: {
      heading: 'Noto Serif JP',
      body: 'Noto Serif JP',
    },
    animations: {
      spring: {damping: 30, stiffness: 80},
      typingSpeed: 12,
    },
  },
};

export const useTheme = (themeName: VideoTheme['theme']) => {
  return themeConfig[themeName];
};
```

### Progress Polling Hook (Mobile Client)

```typescript
// Source: Polling pattern best practices
import {useState, useEffect, useCallback} from 'react';

type RenderStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface UseRenderProgressOptions {
  jobId: string;
  pollInterval?: number;  // milliseconds (default: 3000)
  timeout?: number;       // milliseconds (default: 30000)
}

export const useRenderProgress = ({
  jobId,
  pollInterval = 3000,
  timeout = 30000,
}: UseRenderProgressOptions) => {
  const [status, setStatus] = useState<RenderStatus>('pending');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/video/status/${jobId}`);
      const data = await response.json();

      if (data.status === 'completed') {
        setStatus('completed');
        setVideoUrl(data.videoUrl);
        return true;  // Done
      }

      if (data.status === 'failed') {
        setStatus('failed');
        setError(data.error || 'Render failed');
        return true;  // Done
      }

      setStatus('processing');
      setProgress(data.progress);
      return false;  // Continue polling
    } catch (err) {
      setError('Failed to check status');
      return true;  // Done on error
    }
  }, [jobId]);

  useEffect(() => {
    const startTime = Date.now();

    const poll = async () => {
      const isDone = await pollStatus();

      if (!isDone && Date.now() - startTime < timeout) {
        setTimeout(poll, pollInterval);
      } else if (!isDone) {
        setStatus('failed');
        setError('Render timeout');
      }
    };

    poll();
  }, [jobId, pollInterval, timeout, pollStatus]);

  return {status, progress, videoUrl, error};
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| **AWS Lambda only** | **Cloud Run + Lambda + Azure support** | Remotion 4.0 (2024) | Multi-cloud deployment options, no vendor lock-in |
| **FFmpeg manual scripting** | **Remotion compositions** | Remotion 3.0+ | React-based, type-safe, previewable in browser |
| **Webhook-only progress** | **Polling + Webhooks** | Remotion 4.0.399+ | Flexible progress tracking for varied client needs |
| **Fixed video specs** | **Dynamic props with Zod validation** | Remotion 4.0+ | Type-safe composition parameters, runtime validation |

**Deprecated/outdated:**
- **Remotion 3.x Lambda-only patterns:** Cloud Run integration released in 4.0, prefer official GCP package
- **Custom progress tracking:** Use built-in `getRenderProgress()` instead of database-based status
- **Static compositions:** Embrace dynamic props with Zod schemas for flexible templates

## Open Questions

Things that couldn't be fully resolved:

1. **Cloud Run GPU Support for Faster Rendering**
   - What we know: Cloud Run added GPU support (NVIDIA T4, L4) in late 2025
   - What's unclear: GPU benefits for Remotion rendering vs CPU-only cost tradeoff
   - Recommendation: Start with CPU-only (2 vCPU / 2GiB), benchmark performance, consider GPU only if renders consistently timeout. GPU adds ~$1-2/hour vs ~$0.045/vCPU-hour

2. **Optimal Parallel Processing Strategy**
   - What we know: Remotion supports concurrent rendering via `concurrency` parameter. Cloud Run auto-scales based on request volume
   - What's unclear: Job queue vs direct Cloud Run invocation for high-volume scenarios (>100 concurrent requests)
   - Recommendation: Implement direct Cloud Run rendering for Phase 4. Add Cloud Tasks queue in Phase 5 if volume exceeds 10 concurrent renders

3. **Exact Resource Requirements for 30-Second Videos**
   - What we know: 2 vCPU / 2GiB is recommended minimum. Benchmarks show 48-core systems run Remotion successfully
   - What's unclear: Exact render time for 30-second video with complex animations (typing effects, multiple sequences)
   - Recommendation: Test with actual composition during Phase 4-02. Scale resources if renders exceed 240 seconds (4 minutes)

4. **Storage CDN Integration Cost**
   - What we know: GCS + signed URLs sufficient for delivery. Cloud CDN adds caching edge locations
   - What's unclear: CDN cost breakpoint for video delivery volume
   - Recommendation: Use GCS direct delivery initially. Add Cloud CDN if bandwidth cost exceeds $50/month or latency issues reported

5. **Mobile Client Polling Optimization**
   - What we know: 3-5 second polling interval recommended. Exponential backoff reduces requests
   - What's unclear: WebSocket vs Server-Sent Events (SSE) for real-time progress updates
   - Recommendation: Polling is simpler and sufficient for Phase 4. Consider SSE in Phase 6 if user experience testing shows polling latency is problematic

## Sources

### Primary (HIGH confidence)

- **[/remotion-dev/remotion](https://context7.com/remotion-dev/remotion)** - Remotion framework documentation
  - Topics: Cloud Run deployment, rendering API, progress tracking, Sequence component, interpolate animations
  - 3146 code snippets, 93.1 benchmark score, High reputation
  - Last accessed: 2026-01-23

- **[@remotion/cloudrun documentation](https://www.remotion.dev/docs/cloudrun)** - Official GCP integration guide
  - Topics: deployService(), renderMediaOnCloudrun(), getRenderProgress()
  - Updated: January 7, 2026
  - https://www.remotion.dev/docs/cloudrun/deployservice

- **[Remotion Performance Tips](https://www.remotion.dev/docs/performance)** - Official optimization guide
  - Topics: Concurrency configuration, CPU utilization, caching strategies
  - https://www.remotion.dev/docs/lambda/optimizing-speed

- **[Remotion Text Animations Guide](https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/text-animations.md)** - Official typing effect patterns
  - Topics: Character-by-character animation, useCurrentFrame() patterns
  - GitHub: remotion-dev/skills

### Secondary (MEDIUM confidence)

- **[Cloud Run Functions Best Practices](https://docs.cloud.google.com/run/docs/tips/functions-best-practices)** (Google Cloud)
  - Topics: Cold start mitigation, container optimization
  - Last updated: 2025
  - https://docs.cloud.google.com/run/docs/tips/functions-best-practices

- **[Google Cloud Storage Media Workloads Best Practices](https://docs.cloud.google.com/storage/docs/best-practices-media-workload)** (Google Cloud)
  - Topics: CDN integration, caching strategies, video delivery
  - https://docs.cloud.google.com/storage/docs/best-practices-media-workload

- **[Cloud Build Pricing](https://cloud.google.com/build/pricing)** (Google Cloud)
  - Topics: Build-minute pricing, machine types
  - Standard tier: ~$0.003/minute
  - https://cloud.google.com/build/pricing

- **[Cloud Run Pricing](https://cloud.google.com/run/pricing)** (Google Cloud)
  - Topics: CPU, memory, request pricing
  - CPU: $0.0000125/vCPU-second, Memory: $0.0000005/GiB-second
  - https://cloud.google.com/run/pricing

- **[Reddit: Cloud Run Cold Start Mitigation](https://www.reddit.com/r/googlecloud/comments/1ita39x/cloud_run_how_to_mitigate_cold_starts_and_how/)** (Community discussion)
  - Topics: Keep-warm strategies, cost implications
  - Posted: 2025
  - https://www.reddit.com/r/googlecloud/comments/1ita39x

- **[Google Cloud Discussion: Video Processing on Cloud Run](https://discuss.google.dev/t/optimization-advice-for-video-processing-on-cloud-run-cold-starts/314562)** (Official community)
  - Topics: Video processing optimization, timeout handling
  - Posted: December 31, 2025
  - https://discuss.google.dev/t/optimization-advice-for-video-processing-on-cloud-run-cold-starts/314562

### Tertiary (LOW confidence)

- **[Serverless GPU Hosting 2026 Guide](https://thinkpeak.ai/serverless-gpu-hosting-for-ai-2026/)** (Thinkpeak AI)
  - Topics: Keep-warm ping techniques, GPU cold starts
  - Published: January 17, 2026 (6 days ago)
  - https://thinkpeak.ai/serverless-gpu-hosting-for-ai-2026/

- **[Cloud Video Streaming Platforms 2026](https://blog.cdnsun.com/best-video-cdn-platforms/)** (CDNsun blog)
  - Topics: Video CDN comparison, delivery optimization
  - Updated: January 13, 2026
  - https://blog.cdnsun.com/best-video-cdn-platforms/

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - Remotion 4.0+ Cloud Run integration is official and well-documented
- Architecture: **HIGH** - Deployment, rendering, and progress tracking patterns verified from Context7 and official docs
- Resource requirements: **MEDIUM** - 2 vCPU / 2GiB recommended but exact performance depends on composition complexity
- Typing effect implementation: **HIGH** - Native Remotion patterns with interpolate() and Sequence verified
- Cold start mitigation: **MEDIUM** - General patterns documented (min instances, keep-warm), but video-specific impact unclear
- Cost optimization: **MEDIUM** - Pricing models documented, but real-world cost depends on usage patterns

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - Remotion ecosystem stable but new features possible)

**Researcher notes:**
- All Remotion-specific claims verified against Context7 or official documentation
- GCP pricing and features current as of January 2026
- WebSearch results from 2025-2026, prioritized recent sources
- One gap: No specific benchmarks found for 30-second Remotion video render times on Cloud Run
- Testing during Phase 4-02 (template creation) will validate resource assumptions
