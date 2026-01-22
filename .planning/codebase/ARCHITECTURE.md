# Architecture

**Analysis Date:** 2026-01-22

## Pattern Overview

**Overall:** File-based router architecture with tab navigation for fortune telling app

**Key Characteristics:**
- React Native with Expo Router for file-based routing
- Modular calculation logic for fortune telling
- Local storage for data persistence
- Tab-based navigation for main features
- Firebase integration for analytics and crash reporting

## Layers

**Presentation Layer:**
- Purpose: User interface components and screens
- Location: `mobile/app/` and `mobile/src/components/`
- Contains: Screen components, navigation, UI components
- Depends on: Business logic, utilities, external libraries
- Used by: Navigation system, user interactions

**Business Logic Layer:**
- Purpose: Fortune calculation algorithms and core functionality
- Location: `mobile/src/lib/logic/`
- Contains: Bazi calculation, YangSen, InSen, Five Elements, Daily fortune
- Depends on: TypeScript types, astronomy libraries
- Used by: Presentation layer, storage layer

**Data Layer:**
- Purpose: Data storage and management
- Location: `mobile/src/utils/storage.ts` and `mobile/src/lib/storage/`
- Contains: AsyncStorage operations, schema definitions
- Depends on: AsyncStorage, type definitions
- Used by: Business logic, presentation layer

**External Services:**
- Purpose: Third-party integrations and utilities
- Location: Various package dependencies
- Contains: Astronomy calculations, notifications, analytics
- Dependencies: `lunar-javascript`, `astronomia`, Firebase, Expo services
- Used by: Business logic layer

## Data Flow

**Fortune Calculation Flow:**

1. **User Input** → Birth input screen collects date, time, gender
2. **Validation** → `validateBirthDate()` in `mobile/src/utils/validation.ts`
3. **Calculation** → `calculateBaZi()` and other functions in `mobile/src/lib/logic/`
4. **Storage** → `saveStorage()` persists results to AsyncStorage
5. **Display** → Results shown in result screens with animations

**Notification Flow:**

1. **Permission Request** → `requestNotificationPermissions()` in `mobile/src/lib/notifications.ts`
2. **Daily Schedule** → `updateNotificationSchedule()` sets up daily notifications
3. **User Interaction** → Notification tap handlers route to relevant screens
4. **Content Generation** → `getDailyFortune()` generates fortune content

**State Management:**
- Uses React hooks for local state management
- AsyncStorage for persistent data
- No global state management library
- Component-level state passed through props

## Key Abstractions

**FortuneCalculation:**
- Purpose: Abstract interface for different fortune calculation types
- Examples: `bazi.ts`, `yangsen.ts`, `insen.ts`
- Pattern: Each module exports calculation functions with consistent interfaces

**StorageSchema:**
- Purpose: Typed data structure for persistence
- Location: `mobile/src/lib/storage/schema.ts`
- Pattern: Versioned schema for backward compatibility
- Contains: Birth data, fortune results, user settings

**Navigation:**
- Purpose: File-based routing system
- Location: `mobile/app/`
- Pattern: Expo Router with tab layouts and stack navigation
- Contains: Routes for each feature area

## Entry Points

**Root Entry:**
- Location: `mobile/app/_layout.tsx`
- Triggers: App initialization, font loading, splash screen
- Responsibilities: Global providers, error boundaries, navigation setup

**Tab Navigation:**
- Location: `mobile/app/(tabs)/_layout.tsx`
- Triggers: Tab-based navigation
- Responsibilities: Bottom tab bar, route management

**Main Screens:**
- `mobile/app/index.tsx` - Entry point with terms check
- `mobile/app/birth-input.tsx` - Birth data collection
- `mobile/app/result.tsx` - Fortune display
- `mobile/app/compatibility.tsx` - Compatibility analysis
- `mobile/app/fortune.tsx` - Daily fortune
- `mobile/app/yosen.tsx` - YangSen display

## Error Handling

**Strategy:** Boundary-based error handling with graceful fallbacks

**Patterns:**
- `ErrorBoundary` component wraps navigation stack
- Custom error types in `mobile/src/utils/errors.ts`
- Try-catch blocks for async operations
- User-friendly error messages in Alert dialogs

**Recovery:**
- AsyncStorage errors show fallback UI
- Calculation errors with retry mechanisms
- Navigation failures with safe fallbacks

## Cross-Cutting Concerns

**Logging:**
- Console logging for development
- Firebase Crashlytics for production errors
- No structured logging system

**Validation:**
- Birth date validation with business rules
- Input sanitization before calculations
- Type validation through TypeScript

**Performance:**
- Lazy loading of fonts
- AsyncStorage batching for multiple operations
- Reanimated for smooth animations

**Notifications:**
- Scheduled daily notifications
- Background notification handling
- Platform-specific configurations

---

*Architecture analysis: 2026-01-22*
