# Technology Stack

**Analysis Date:** 2026-01-22

## Languages

**Primary:**
- TypeScript 5.x - Core language for both web and mobile applications

**Secondary:**
- JavaScript - Used in build tools and configuration

## Runtime

**Web Application:**
- Node.js - Runtime environment
- Next.js 16.1.1 - React framework with server-side rendering

**Mobile Application:**
- React Native 0.81.5 - Cross-platform mobile framework
- Expo ~54.0.30 - Development platform and SDK

**Package Manager:**
- npm - Package management for web
- Expo CLI - Package management for mobile
- Lockfile: package-lock.json (web), no mobile lockfile

## Frameworks

**Web:**
- Next.js 16.1.1 - Full-stack React framework
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering
- Framer Motion 12.23.26 - Animation library
- Tailwind CSS 4 - Utility-first CSS framework
- Lucide React 0.562.0 - Icon library

**Mobile:**
- React Native 0.81.5 - Mobile framework
- Expo Router 6.0.21 - File-based routing
- React Navigation 7.1.8 - Navigation library
- React Native Reanimated 4.1.1 - Advanced animations
- NativeWind 4.2.1 - Tailwind CSS for React Native
- Lucide React Native 0.562.0 - Icon library

## Key Dependencies

**Web:**
- @vercel/og 0.8.6 - Open Graph image generation
- clsx 2.1.1 - Conditional class names
- tailwind-merge 3.4.0 - Tailwind class merging

**Mobile:**
- @react-native-async-storage/async-storage 2.2.0 - Local storage
- @react-native-firebase packages 23.7.0 - Firebase services
- @react-native-purchases 9.6.13 - In-app purchases
- react-native-purchases 9.6.13 - Purchases SDK
- react-native-gesture-handler 2.28.0 - Gesture handling
- react-native-safe-area-context 5.6.0 - Safe area handling
- react-native-svg 15.12.1 - SVG rendering
- react-native-web 0.21.0 - Web compatibility

**Infrastructure:**
- Turso - SQLite database (libsql://)
- Grok API - AI service integration
- OpenRouter API - AI service integration

## Configuration

**Environment:**
- Web: .env.local with TURSO_URL and TURSO_TOKEN
- Mobile: No environment variables detected in source
- yinyang-app: .env.local with GROK_API_KEY and OPENROUTER_API_KEY

**Build:**
- Web: Next.js build system
- Mobile: Expo build system with native iOS/Android builds
- TypeScript configuration with strict mode

## Platform Requirements

**Development:**
- Web: Node.js, npm, Next.js CLI
- Mobile: Expo CLI, Node.js, iOS/Android simulators or devices

**Production:**
- Web: Vercel or compatible Node.js hosting
- Mobile: App Store (iOS) and Google Play Store (Android)
- iOS: Xcode 15+ for iOS builds
- Android: Android Studio for Android builds

---

*Stack analysis: 2026-01-22*
```