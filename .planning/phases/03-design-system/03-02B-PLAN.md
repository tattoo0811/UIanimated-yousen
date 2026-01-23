---
phase: 03-design-system
plan: 02B
type: execute
wave: 2
depends_on: [03-01, 03-02A]
files_modified:
  - mobile/src/components/ThemeCard.tsx
  - mobile/src/components/ThemePicker.tsx
  - mobile/app/settings.tsx
  - mobile/src/components/SwipeableStack.tsx
autonomous: true

must_haves:
  truths:
    - "User can select theme from settings screen"
    - "Theme selection persists across app restarts"
    - "Theme applies immediately when selected (real-time preview)"
    - "SwipeableStack uses theme-specific animation configs"
  artifacts:
    - path: "mobile/src/components/ThemeCard.tsx"
      provides: "Theme preview card component"
      exports: ["ThemeCard"]
    - path: "mobile/src/components/ThemePicker.tsx"
      provides: "Swipeable theme selection using SwipeableStack"
      exports: ["ThemePicker"]
    - path: "mobile/app/settings.tsx"
      provides: "Settings screen with theme selection section"
      contains: "ThemePicker"
    - path: "mobile/src/components/SwipeableStack.tsx"
      provides: "Theme-aware swipe animations"
      contains: "theme.animations"
  key_links:
    - from: "mobile/src/components/ThemePicker.tsx"
      to: "mobile/src/hooks/useTheme.ts"
      via: "const { themeId, setTheme } = useTheme()"
      pattern: "setTheme"
    - from: "mobile/app/settings.tsx"
      to: "mobile/src/components/ThemePicker.tsx"
      via: "import { ThemePicker }"
      pattern: "ThemePicker"
    - from: "mobile/src/components/SwipeableStack.tsx"
      to: "mobile/src/hooks/useTheme.ts"
      via: "const { theme } = useTheme()"
      pattern: "theme.animations"
    - from: "mobile/src/components/ThemeCard.tsx"
      to: "mobile/src/themes/index.ts"
      via: "import { Theme }"
      pattern: "Theme"
---

<objective>
Theme Selection UI and Integration — Create theme selection UI components, integrate into settings screen, apply theme-based animations to SwipeableStack
Purpose: Deliver complete user-facing theme switching experience with real-time preview and persistent selection
Output: Working theme selection UI with immediate theme application and persistent storage
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md

@.planning/phases/03-design-system/03-CONTEXT.md
@.planning/phases/03-design-system/03-RESEARCH.md
@.planning/ROADMAP.md
@.planning/PROJECT.md
@.planning/phases/03-design-system/03-01-PLAN.md

@mobile/src/components/SwipeableStack.tsx
@mobile/lib/animations.ts
@mobile/app/settings.tsx
@mobile/src/hooks/useTheme.ts
@mobile/src/hooks/useHapticFeedback.ts
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/03-design-system/03-01-SUMMARY.md
@.planning/phases/03-design-system/03-02A-SUMMARY.md
@.planning/phases/02-card-ui-core/02-03-SUMMARY.md
@.planning/phases/02-card-ui-core/02-04-SUMMARY.md

@mobile/src/contexts/ThemeContext.tsx
@mobile/src/hooks/useTheme.ts
@mobile/src/hooks/useHapticFeedback.ts
@mobile/src/themes/index.ts
@mobile/src/components/SwipeableStack.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create ThemeCard component</name>
  <files>mobile/src/components/ThemeCard.tsx</files>
  <action>
Create mobile/src/components/ThemeCard.tsx:

1. Props interface: theme: Theme, onPress: () => void, isActive?: boolean

2. Component uses useTheme hook to get current themeId

3. Card displays:
   - Theme preview rectangle using theme's colors (gradient of primary/secondary)
   - Theme name in theme's font (ja)
   - Theme description in theme's font
   - Active indicator if this theme is selected
   - Sample text showing theme's typography

4. Styling:
   - Width: ~280px
   - Rounded corners (2xl)
   - Shadow/elevation
   - Border highlight when active

5. Use TouchableOpacity for press feedback

6. Use useHapticFeedback().selection() on press

The card serves as both preview and selector for the theme.
  </action>
  <verify>
grep -q "ThemeCard" mobile/src/components/ThemeCard.tsx && grep -q "useTheme" mobile/src/components/ThemeCard.tsx && npx tsc --noEmit --skipLibCheck
  </verify>
  <done>
ThemeCard.tsx renders theme preview card with colors, fonts, and active state
  </done>
</task>

<task type="auto">
  <name>Task 2: Create ThemePicker swipeable component</name>
  <files>mobile/src/components/ThemePicker.tsx</files>
  <action>
Create mobile/src/components/ThemePicker.tsx:

1. Import SwipeableStack, ThemeCard, useTheme, useHapticFeedback

2. Props interface: onThemeSelect?: (themeId: ThemeId) => void

3. Component:
   - Get current themeId and setTheme from useTheme
   - Get success haptic from useHapticFeedback
   - Map themes to SwipeableStack-compatible format (Theme -> {id, name, ...})
   - Render SwipeableStack with theme cards
   - onSelect handler: calls setTheme + onThemeSelect callback + success() haptic

4. Integration:
   - SwipeableStack handles the card swiping interaction
   - Right swipe on theme card applies that theme
   - Immediate theme change via setTheme

5. Header/label: "テーマを選択" with theme-aware styling

Reuses SwipeableStack from Phase 2 for consistent UX.
  </action>
  <verify>
grep -q "ThemePicker" mobile/src/components/ThemePicker.tsx && grep -q "SwipeableStack" mobile/src/components/ThemePicker.tsx && npx tsc --noEmit --skipLibCheck
  </verify>
  <done>
ThemePicker.tsx provides swipeable theme selection using SwipeableStack
  </done>
</task>

<task type="auto">
  <name>Task 3: Integrate theme selection into settings screen</name>
  <files>mobile/app/settings.tsx</files>
  <action>
Update mobile/app/settings.tsx:

1. Import ThemePicker from '@/src/components/ThemePicker'

2. Add new section "テーマ選択" (Theme Selection) after Premium Status section, before Usage Stats

3. Section styling:
   - Background card matching existing settings sections (bg-surface-dark)
   - Rounded corners (2xl)
   - Padding (p-6)
   - Margin bottom (mb-6)

4. Description text: "スワイプしてテーマを選択" (Swipe to select theme)

5. Render ThemePicker component

6. Ensure theme-aware styling using useTheme hook for text colors

Theme selection is added without removing existing settings functionality.
  </action>
  <verify>
grep -q "ThemePicker" mobile/app/settings.tsx && grep -q "テーマ" mobile/app/settings.tsx
  </verify>
  <done>
settings.tsx includes ThemePicker section for theme selection
  </done>
</task>

<task type="auto">
  <name>Task 4: Integrate theme animations into SwipeableStack</name>
  <files>mobile/src/components/SwipeableStack.tsx</files>
  <action>
Update mobile/src/components/SwipeableStack.tsx to use theme-based animations:

1. Import useTheme hook

2. Get theme.animations config: const { theme } = useTheme()

3. Replace SWIPE_CONFIG references with theme-specific values:
   - spring config: theme.animations.spring (damping, stiffness, mass)
   - swipe config: theme.animations.swipe (maxRotation, scaleAmount, fadeSpeed)
   - timing: theme.animations.timing.duration

4. Modify swipe gesture handlers to use theme.config values:
   - withSpring(SCREEN_WIDTH * 2, theme.animations.spring, ...)
   - Rotation interpolation uses theme.animations.swipe.maxRotation
   - Next card scale uses theme.animations.swipe.scaleAmount
   - Next card opacity uses theme.animations.swipe.fadeSpeed

5. Keep fallback to SWIPE_CONFIG if theme not available (defensive coding)

This makes swipe animations feel different per theme:
- KiraPop: bouncy, exaggerated rotation/scale
- MonoEdge: smooth, moderate effects
- ZenWa: gentle, minimal effects

Note: ZodiacCard colors don't change yet - full component theming is future work.
  </action>
  <verify>
grep -q "useTheme" mobile/src/components/SwipeableStack.tsx && grep -q "theme.animations" mobile/src/components/SwipeableStack.tsx && npx tsc --noEmit --skipLibCheck
  </verify>
  <done>
SwipeableStack uses theme-specific spring, rotation, scale, and fade configs
  </done>
</task>

</tasks>

<verification>
1. ThemePicker renders in settings screen
2. Theme selection persists after app restart
3. SwipeableStack animation changes based on selected theme
4. Type checking passes: `npx tsc --noEmit --skipLibCheck`
</verification>

<success_criteria>
1. User can select theme via settings screen with swipeable cards
2. Theme selection persists across app restarts via AsyncStorage
3. Theme applies immediately when selected (real-time preview)
4. SwipeableStack animations reflect current theme's animation profile
5. Success Criteria from ROADMAP all met:
   - SC1: User can select from 3+ design themes
   - SC2: Each theme has consistent colors, fonts, animations
   - SC3: Theme switching reflects immediately
   - SC4: Settings persist across app restarts
</success_criteria>

<output>
After completion, create `.planning/phases/03-design-system/03-02B-SUMMARY.md`
</output>
