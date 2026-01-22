# External Integrations

**Analysis Date:** 2026-01-22

## APIs & External Services

**AI Services:**
- Grok API - AI integration for yinyang-app
  - API Key: GROK_API_KEY (env var)
  - SDK: REST API
- OpenRouter API - AI service proxy
  - API Key: OPENROUTER_API_KEY (env var)
  - SDK: REST API

**Database:**
- Turso (libsql://)
  - Connection: TURSO_URL, TURSO_TOKEN
  - Client: Native libsql client or ORM
  - Location: AWS ap-northeast-1 region

**Image Generation:**
- Vercel OG
  - Purpose: Open Graph image generation
  - SDK: @vercel/og
  - Integration: Next.js API routes

## Data Storage

**Databases:**
- Turso (SQLite cloud database)
  - Connection: libsql://sanmei-sanmei.aws-ap-northeast-1.turso.io
  - Client: Native driver or ORM
  - Purpose: Primary application database

**File Storage:**
- Local filesystem only
- AsyncStorage for mobile app settings

**Caching:**
- Not detected

## Authentication & Identity

**Auth Provider:**
- Custom implementation
  - Implementation: Local storage with AsyncStorage
  - Premium status mock implementation

## Monitoring & Observability

**Error Tracking:**
- Firebase Crashlytics
  - SDK: @react-native-firebase/crashlytics
  - Implementation: Lazy-loaded in monitoring service
  - Environment: Production only (__DEV__ check)

**Analytics:**
- Firebase Analytics
  - SDK: @react-native-firebase/analytics
  - Implementation: Lazy-loaded in monitoring service
  - Events: Custom events with parameters

**Logs:**
- Console logging for development
- Firebase Crashlytics for production logs

## CI/CD & Deployment

**Hosting:**
- Web: Vercel (implied from @vercel/og usage)
- Mobile: App Store and Google Play Store

**CI Pipeline:**
- Not detected in source code
- Expo EAS build system likely used

## Environment Configuration

**Required env vars:**
- TURSO_URL - Database connection URL
- TURSO_TOKEN - Database authentication token
- GROK_API_KEY - AI service authentication (yinyang-app)
- OPENROUTER_API_KEY - AI service proxy (yinyang-app)

**Secrets location:**
- .env.local files in project root and yinyang-app directory
- Not committed to version control

## Webhooks & Callbacks

**Incoming:**
- Not detected in source code

**Outgoing:**
- Not detected in source code

## Mobile-Specific Integrations

**In-App Purchases:**
- react-native-purchases
  - Implementation: Mock implementation in usePurchases.ts
  - Status: Testing mode with AsyncStorage

**Push Notifications:**
- expo-notifications
  - Configuration: Icon and color settings in app.json
  - Implementation: Plugin configuration only

**Storage:**
- AsyncStorage
  - Purpose: Local data persistence
  - Schema: Versioned storage system with migration support

**Firebase Services:**
- Analytics - Event tracking
- Crashlytics - Error reporting
- Implementation: Lazy-loaded with production-only activation

---

*Integration audit: 2026-01-22*
```