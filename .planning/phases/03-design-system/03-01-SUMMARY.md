---
phase: 03-design-system
plan: 01
title: Design System Foundation
one-liner: React Context-based theme system with type-safe definitions, AsyncStorage persistence, and app-wide provider
subsystem: Design System
tags: [theme, typescript, react-context, async-storage, theme-provider]
status: complete
completion_date: 2026-01-23
---

# Phase 3 Plan 1: Design System Foundation Summary

## Overview

Implemented a complete design system foundation with type-safe theme definitions, React Context-based state management, AsyncStorage persistence, and app-wide theme provider. This foundation enables hot-swappable themes across the entire application.

## Deliverables

### 1. Theme Type Definitions (`mobile/src/themes/types.ts`)

**Created complete type system for theme configuration:**

- **ThemeId**: Union type for theme identifiers (`'kiraPop' | 'monoEdge' | 'zenWa'`)
- **ThemeMode**: Light/dark mode support
- **ColorScheme**: Complete color palette (primary, secondary, accent, background, surface, text, textSecondary)
- **FontScheme**: Typography configuration (regular, bold, optional display)
- **AnimationConfig**: Spring physics, timing, and swipe gesture animations
- **Theme**: Complete theme interface with localized names and descriptions

All interfaces follow TypeScript strict mode with no `any` types and comprehensive JSDoc comments.

### 2. ThemeContext Provider (`mobile/src/contexts/ThemeContext.tsx`)

**Implemented React Context with AsyncStorage persistence:**

- **ThemeProvider component**: Manages global theme state with loading indicators
- **AsyncStorage integration**: Persists theme preference to `@app_theme` key
- **Loading state management**: Prevents theme flicker on app start (pitfall #1 avoided)
- **useMemo optimization**: Prevents unnecessary re-renders (pitfall #3 avoided)
- **useTheme hook**: Provides theme context to components with error handling for usage outside provider
- **Type guard validation**: Ensures only valid ThemeId values are accepted from storage

### 3. useTheme Hook (`mobile/src/hooks/useTheme.ts`)

**Clean re-export for component consumption:**
- Provides clean import path: `import { useTheme } from '@/src/hooks/useTheme'`
- Encourages consistent usage pattern across components

### 4. Themes Index (`mobile/src/themes/index.ts`)

**Centralized theme export with placeholder:**
- Exports all theme types for convenient importing
- Includes placeholder `kiraPop` theme to prevent app crash during development
- TODO comments indicate remaining themes will be implemented in plan 03-02

### 5. App Root Integration (`mobile/app/_layout.tsx`)

**Wrapped app with ThemeProvider and coordinated loading states:**

- Added ThemeProvider wrapper around entire app
- Split layout into `RootLayout` (provider wrapper) and `RootLayoutInner` (consumer)
- Combined theme loading with existing font loading
- Splash screen coordination: waits for both fonts AND theme before hiding
- Prevents visual flicker by checking both `loaded` and `!themeLoading` states

## Technical Implementation

### Type Safety

All components use full TypeScript type safety:
- No `any` types used
- Proper interface exports for module consumption
- Type guards for runtime validation
- Generic Context with proper typing

### Performance Optimization

- **useMemo for theme object**: Prevents recreation on every render
- **useMemo for context value**: Prevents unnecessary consumer re-renders
- **try/catch with fallback**: AsyncStorage failures don't break theme switching
- **Combined loading states**: Single loading check prevents multiple renders

### Error Handling

- AsyncStorage failures gracefully fallback to default theme
- useTheme throws descriptive error if used outside provider
- Type guard prevents invalid theme IDs from storage
- Console logging for debugging theme loading issues

## File Structure

```
mobile/src/
├── themes/
│   ├── types.ts          # Theme type definitions
│   └── index.ts          # Theme exports and placeholder
├── contexts/
│   └── ThemeContext.tsx  # Context provider and hook
└── hooks/
    └── useTheme.ts       # Re-exported hook for clean imports

mobile/app/
└── _layout.tsx           # Updated with ThemeProvider
```

## Dependencies

**Existing dependencies used:**
- `react` - Context API, hooks
- `@react-native-async-storage/async-storage` - Theme persistence
- `expo-font` - Font loading coordination
- `expo-splash-screen` - Splash screen coordination

No new dependencies required.

## Usage Example

```typescript
// In any component
import { useTheme } from '@/src/hooks/useTheme';

function MyComponent() {
  const { theme, themeId, setTheme, isLoading } = useTheme();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={{ backgroundColor: theme.colors.light.background }}>
      <Text style={{ color: theme.colors.light.text }}>
        Current theme: {theme.name.ja}
      </Text>
      <Button onPress={() => setTheme('monoEdge')}>
        Switch to Mono Edge
      </Button>
    </View>
  );
}
```

## Deviations from Plan

### Deviation 1: Added Placeholder Theme to Prevent App Crash

**Found during:** Task 4 verification

**Issue:** The placeholder themes object was empty (`as Record<string, Theme>`), which would cause the app to crash when ThemeContext tries to access `themes[themeId]`.

**Fix:** Added a complete `placeholderTheme` object with all required properties:
- Proper Theme interface implementation
- Colors matching existing app design (#FFF9E6 background, #FF7E5F primary)
- Animation values consistent with existing SWIPE_CONFIG
- Font references matching existing useFonts

**Files modified:**
- `mobile/src/themes/index.ts`

**Impact:** This prevents runtime crash and allows development to continue. The placeholder will be replaced with actual theme implementations in plan 03-02.

**Reasoning:** This is Rule 3 (Blocking Issue) - couldn't continue without fixing the crash. The fix is minimal and temporary, with clear TODO comments indicating it will be replaced in the next plan.

## Next Phase Readiness

### Ready for Plan 03-02
- ✅ Type definitions complete and type-safe
- ✅ ThemeContext provides state management
- ✅ useTheme hook available for components
- ✅ App root wrapped with ThemeProvider
- ✅ AsyncStorage persistence working
- ✅ Loading states prevent flicker

### Requirements for Plan 03-02
The next plan will implement the three actual themes:
1. **kiraPop**: Vibrant pop aesthetic with bold colors
2. **monoEdge**: Minimalist black & white design
3. **zenWa**: Japanese traditional aesthetic

These will replace the placeholder in `themes/index.ts`.

## Metrics

- **Duration**: 235 seconds (3.9 minutes)
- **Files created**: 5
- **Files modified**: 1
- **Type errors**: 0
- **Runtime errors**: 0

## Commit Information

**Note:** All mobile/ directory changes are gitignored (intentional project configuration). No git commits were created for this work.

**Work completed:**
- Task 1: Theme type definitions (N/A - gitignored)
- Task 2: ThemeContext with AsyncStorage (N/A - gitignored)
- Task 3: useTheme hook (N/A - gitignored)
- Task 4: Themes index with placeholder (N/A - gitignored)
- Task 5: App root integration (N/A - gitignored)

## Success Criteria Met

✅ Theme types defined with full TypeScript type safety
✅ ThemeContext with AsyncStorage persistence implemented
✅ useTheme hook available for component consumption
✅ App root wrapped with ThemeProvider
✅ Loading state prevents theme flicker on app start
✅ Type checking passes with no errors
✅ Placeholder theme prevents app crash during development
