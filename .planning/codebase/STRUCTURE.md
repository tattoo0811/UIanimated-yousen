# Codebase Structure

**Analysis Date:** 2026-01-22

## Directory Layout

```
UIanimated/
├── mobile/                    # React Native mobile app (Expo)
│   ├── app/                   # File-based routing screens
│   │   ├── _layout.tsx       # Root layout with providers
│   │   ├── index.tsx         # Entry point with terms check
│   │   ├── (tabs)/           # Tab navigation screens
│   │   │   ├── _layout.tsx   # Tab layout configuration
│   │   │   ├── index.tsx     # Fortune calculation home
│   │   │   ├── result.tsx    # Results display
│   │   │   ├── compatibility.tsx
│   │   │   ├── fortune.tsx   # Daily fortune
│   │   │   └── yosen.tsx    # YangSen diagram
│   │   ├── birth-input.tsx   # Birth data collection
│   │   ├── result.tsx        # Main results screen
│   │   ├── settings.tsx      # User preferences
│   │   ├── profile.tsx       # User profile
│   │   ├── paywall.tsx       # Subscription screen
│   │   ├── terms.tsx         # Terms of service
│   │   └── +not-found.tsx    # 404 handler
│   ├── assets/               # Static assets
│   │   └── fonts/           # App fonts
│   ├── ios/                 # iOS native configuration
│   ├── node_modules/        # Dependencies
│   ├── package.json         # Mobile app dependencies
│   ├── babel.config.js      # Babel configuration
│   ├── eas.json             # Expo Application Services config
│   ├── metro.config.js      # Metro bundler config
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── tsconfig.json        # TypeScript configuration
├── src/                     # Web application (Next.js)
│   ├── app/                 # Next.js app router
│   │   └── compatibility/  # Compatibility feature
│   ├── lib/                 # Shared libraries
│   │   └── compatibility.ts # Compatibility logic
│   └── components/          # Web components
├── public/                  # Static assets for web
├── scripts/                 # Development scripts
├── sample/                  # Sample data
├── analytics-data/         # Analytics export
├── fonts/                  # Font files
├── yinyang-app/            # Legacy or related app
└── .planning/              # Development planning docs
    └── codebase/           # Architecture analysis
```

## Directory Purposes

**mobile/app/:**
- Purpose: Screen components using Expo Router file-based routing
- Contains: Feature screens, navigation layouts
- Key files: `_layout.tsx` (root layout), `(tabs)/` (tab navigation)

**mobile/src/:**
- Purpose: Application source code, utilities, and types
- Contains: Business logic, components, utilities, types
- Key files: `lib/logic/` (fortune calculations), `components/` (UI components)

**mobile/src/lib/logic/:**
- Purpose: Core fortune calculation algorithms
- Contains: Bazi, YangSen, InSen, Five Elements calculations
- Key files: `bazi.ts`, `yangsen.ts`, `insen.ts`, `fiveElements.ts`

**mobile/src/utils/:**
- Purpose: Utility functions and helpers
- Contains: Storage, validation, error handling
- Key files: `storage.ts`, `validation.ts`, `errors.ts`

**mobile/src/components/:**
- Purpose: Reusable UI components
- Contains: Card components, display components, modals
- Key files: `FortuneCard.tsx`, `YosenFortuneCard.tsx`, `SwipeableStack.tsx`

## Key File Locations

**Entry Points:**
- `mobile/app/_layout.tsx`: Root layout with providers and navigation
- `mobile/app/index.tsx`: Entry point with terms acceptance check
- `mobile/app/(tabs)/_layout.tsx`: Tab navigation configuration

**Configuration:**
- `mobile/package.json`: Dependencies and scripts
- `mobile/tsconfig.json`: TypeScript configuration
- `mobile/tailwind.config.js`: Tailwind CSS setup
- `mobile/babel.config.js`: JavaScript transpilation

**Core Logic:**
- `mobile/src/lib/logic/bazi.ts`: Four Pillars of Destiny calculations
- `mobile/src/lib/logic/yangsen.ts`: YangSen (Human Figure) calculations
- `mobile/src/lib/logic/insen.ts`: InSen calculations
- `mobile/src/lib/storage/schema.ts`: Data structure definitions

**Business Logic:**
- `mobile/src/types/index.ts`: TypeScript type definitions
- `mobile/src/utils/validation.ts`: Input validation
- `mobile/src/lib/notifications.ts`: Notification management

**UI Components:**
- `mobile/src/components/cards/`: Card components for different fortune types
- `mobile/src/components/SwipeableStack.tsx`: Swipeable component stack
- `mobile/src/components/ErrorBoundary.tsx`: Error handling component

## Naming Conventions

**Files:**
- Screen components: PascalCase (e.g., `BirthInputScreen.tsx` → `birth-input.tsx`)
- Utility files: camelCase (e.g., `validation.ts`)
- Type definitions: camelCase (e.g., `types/index.ts`)
- Components: PascalCase (e.g., `FortuneCard.tsx`)

**Functions:**
- Calculation functions: camelCase (e.g., `calculateBaZi()`)
- Utility functions: camelCase (e.g., `validateBirthDate()`)
- Storage functions: camelCase (e.g., `saveResult()`)
- Event handlers: camelCase (e.g., `handleDateChange()`)

**Variables:**
- Component props: camelCase (e.g., `birthDate`)
- State variables: camelCase (e.g., `showDatePicker`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `TERMS_ACCEPTED_KEY`)
- TypeScript interfaces: PascalCase (e.g., `BirthData`)

**Types:**
- Interface names: PascalCase (e.g., `FourPillars`)
- Type aliases: PascalCase (e.g., `CalculationResult`)
- Union types: PascalCase (e.g., `Gender`)
- Generic types: T prefix (e.g., `TKey`)

## Where to Add New Code

**New Fortune Type:**
- Primary code: `mobile/src/lib/logic/[newType].ts`
- Tests: `mobile/src/lib/logic/[newType].test.ts` (if using Jest)
- Types: Update `mobile/src/types/index.ts`
- UI: Add to `mobile/src/components/cards/`

**New Screen:**
- Implementation: `mobile/app/[route].tsx`
- Navigation: Add to `mobile/app/(tabs)/_layout.tsx` if needed
- Component: Create in `mobile/src/components/` if reusable

**New Utility:**
- Implementation: `mobile/src/utils/[utility].ts`
- Export index: Update `mobile/src/utils/index.ts`

**New Type Definition:**
- Implementation: Add to `mobile/src/types/index.ts`
- Or create: `mobile/src/types/[category].ts`

## Special Directories

**mobile/app/(tabs)/:**
- Purpose: Tab navigation screens
- Generated: No, manually organized
- Committed: Yes, part of source code

**mobile/src/lib/logic/:**
- Purpose: Pure calculation modules
- Generated: No, manually implemented
- Committed: Yes, core business logic

**mobile/assets/fonts/:**
- Purpose: Font files for custom typography
- Generated: No, manually added
- Committed: Yes, static assets

**mobile/ios/:**
- Purpose: iOS native project configuration
- Generated: Yes, by Expo/React Native
- Committed: Yes, required for build

---

*Structure analysis: 2026-01-22*
