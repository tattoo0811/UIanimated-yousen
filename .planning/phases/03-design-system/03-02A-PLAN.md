---
phase: 03-design-system
plan: 02A
type: execute
wave: 2
depends_on: [03-01]
files_modified:
  - mobile/package.json
  - mobile/src/themes/themes/kiraPop.ts
  - mobile/src/themes/themes/monoEdge.ts
  - mobile/src/themes/themes/zenWa.ts
  - mobile/src/themes/index.ts
  - mobile/src/themes/fonts.ts
autonomous: true

must_haves:
  truths:
    - "3 Google Font packages installed (@expo-google-fonts/m-plus-rounded-1c, noto-sans-jp, noto-serif-jp)"
    - "KiraPop theme defined with pink/cyan/yellow colors and rounded font"
    - "MonoEdge theme defined with monochrome colors and sans-serif font"
    - "ZenWa theme defined with forest green/brown/akane colors and serif font"
    - "themes/index.ts exports all 3 themes"
    - "fonts.ts provides useThemeFonts hook for font loading"
  artifacts:
    - path: "mobile/package.json"
      provides: "Font package dependencies"
      contains: "@expo-google-fonts/m-plus-rounded-1c, @expo-google-fonts/noto-sans-jp, @expo-google-fonts/noto-serif-jp"
    - path: "mobile/src/themes/themes/kiraPop.ts"
      provides: "KiraPop theme config (vibrant, playful, 10-20s demographic)"
      contains: "colors.light.primary: '#FF6B9D'"
    - path: "mobile/src/themes/themes/monoEdge.ts"
      provides: "MonoEdge theme config (monochrome, modern, 30-40s demographic)"
      contains: "colors.light.primary: '#1A1A1A'"
    - path: "mobile/src/themes/themes/zenWa.ts"
      provides: "ZenWa theme config (Japanese elegant, serene, 50s+ demographic)"
      contains: "colors.light.primary: '#2D5016'"
    - path: "mobile/src/themes/index.ts"
      provides: "Central theme exports"
      exports: ["themes", "allThemes"]
    - path: "mobile/src/themes/fonts.ts"
      provides: "Font loading hook"
      exports: ["useThemeFonts"]
  key_links:
    - from: "mobile/src/themes/index.ts"
      to: "mobile/src/themes/themes/kiraPop.ts"
      via: "import { kiraPopTheme }"
      pattern: "kiraPopTheme"
    - from: "mobile/src/themes/fonts.ts"
      to: "@expo-google-fonts/*"
      via: "import { useFonts }"
      pattern: "useFonts"
---

<objective>
Three Theme Implementations — Create KiraPop, MonoEdge, ZenWa themes with unique colors/fonts/animations, install font packages, configure font loading
Purpose: Deliver theme configurations targeting different age demographics with unique visual identities
Output: 3 working theme configurations ready for UI integration
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md

@.planning/phases/03-design-system/03-CONTEXT.md
@.planning/phases/03-design-system/03-RESEARCH.md
@.planning/ROADMAP.md
@.planning/PROJECT.md
@.planning/phases/03-design-system/03-01-PLAN.md

@mobile/src/themes/types.ts
@mobile/src/contexts/ThemeContext.tsx
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/03-design-system/03-01-SUMMARY.md

@mobile/src/themes/types.ts
@mobile/src/contexts/ThemeContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Google Font packages</name>
  <files>mobile/package.json</files>
  <action>
Install the three Google Font packages needed for the themes:

```bash
cd mobile && npm install --save-exact @expo-google-fonts/m-plus-rounded-1c @expo-google-fonts/noto-sans-jp @expo-google-fonts/noto-serif-jp
```

These packages provide:
- M PLUS Rounded 1c: Rounded font for KiraPop (playful, youth-oriented)
- Noto Sans JP: Clean sans-serif for MonoEdge (modern, professional)
- Noto Serif JP: Elegant serif for ZenWa (traditional, refined)

All fonts use SIL Open Font License (OFL) - free for commercial use without restrictions.
  </action>
  <verify>
grep -q "@expo-google-fonts/m-plus-rounded-1c" mobile/package.json && grep -q "@expo-google-fonts/noto-sans-jp" mobile/package.json && grep -q "@expo-google-fonts/noto-serif-jp" mobile/package.json
  </verify>
  <done>
Three @expo-google-fonts packages installed in package.json
  </done>
</task>

<task type="auto">
  <name>Task 2: Create KiraPop theme (vibrant, playful, 10-20s)</name>
  <files>mobile/src/themes/themes/kiraPop.ts</files>
  <action>
Create mobile/src/themes/themes/kiraPop.ts:

1. Import Theme type from '../types'

2. Export kiraPopTheme: Theme with:

**id**: 'kiraPop'

**name**: { en: 'KiraPop', ja: 'キラポップ' }

**description**: { en: 'Vibrant & Playful', ja: 'キラキラポップで楽しく' }

**colors.light**:
- primary: '#FF6B9D' (vivid pink)
- secondary: '#00D9FF' (cyan)
- accent: '#FFED47' (yellow)
- background: '#FFF5F8' (light pinkish cream)
- surface: '#FFFFFF' (pure white)
- text: '#2D2D2D' (dark gray)
- textSecondary: '#6B6B6B' (medium gray)

**colors.dark**:
- primary: '#FF6B9D' (same)
- secondary: '#00D9FF'
- accent: '#FFED47'
- background: '#1A1020' (deep purplish black)
- surface: '#2D1A30' (purplish dark gray)
- text: '#FFFFFF'
- textSecondary: '#B8B8B8'

**fonts**:
- regular: 'MPlusRounded1c_400Regular'
- bold: 'MPlusRounded1c_700Bold'

**animations.spring**: { damping: 12, stiffness: 400, mass: 0.8 } (bouncy)
**animations.timing**: { duration: 300 }
**animations.swipe**: { maxRotation: 20, scaleAmount: 1.15, fadeSpeed: 0.7 }
  </action>
  <verify>
grep -q "kiraPopTheme" mobile/src/themes/themes/kiraPop.ts && grep -q "#FF6B9D" mobile/src/themes/themes/kiraPop.ts && grep -q "MPlusRounded1c" mobile/src/themes/themes/kiraPop.ts
  </verify>
  <done>
kiraPop.ts exports theme with pink/cyan/yellow colors, rounded font, bouncy animations
  </done>
</task>

<task type="auto">
  <name>Task 3: Create MonoEdge theme (monochrome, modern, 30-40s)</name>
  <files>mobile/src/themes/themes/monoEdge.ts</files>
  <action>
Create mobile/src/themes/themes/monoEdge.ts:

1. Import Theme type from '../types'

2. Export monoEdgeTheme: Theme with:

**id**: 'monoEdge'

**name**: { en: 'MonoEdge', ja: 'モノエッジ' }

**description**: { en: 'Modern & Cool', ja: 'クールでモダンに' }

**colors.light**:
- primary: '#1A1A1A' (black)
- secondary: '#4A4A4A' (dark gray)
- accent: '#6366F1' (indigo)
- background: '#FAFAFA' (off-white)
- surface: '#FFFFFF'
- text: '#1A1A1A'
- textSecondary: '#6B7280'

**colors.dark**:
- primary: '#FFFFFF' (white)
- secondary: '#A1A1AA' (light gray)
- accent: '#818CF8' (lighter indigo)
- background: '#0A0A0A' (deepest black)
- surface: '#171717'
- text: '#FFFFFF'
- textSecondary: '#A1A1AA'

**fonts**:
- regular: 'NotoSansJP_400Regular'
- bold: 'NotoSansJP_700Bold'

**animations.spring**: { damping: 25, stiffness: 300, mass: 1.0 } (smooth)
**animations.timing**: { duration: 350 }
**animations.swipe**: { maxRotation: 12, scaleAmount: 1.05, fadeSpeed: 0.85 }
  </action>
  <verify>
grep -q "monoEdgeTheme" mobile/src/themes/themes/monoEdge.ts && grep -q "#1A1A1A" mobile/src/themes/themes/monoEdge.ts && grep -q "NotoSansJP" mobile/src/themes/themes/monoEdge.ts
  </verify>
  <done>
monoEdge.ts exports theme with monochrome colors, Noto Sans font, smooth animations
  </done>
</task>

<task type="auto">
  <name>Task 4: Create ZenWa theme (Japanese elegant, serene, 50s+)</name>
  <files>mobile/src/themes/themes/zenWa.ts</files>
  <action>
Create mobile/src/themes/themes/zenWa.ts:

1. Import Theme type from '../types'

2. Export zenWaTheme: Theme with:

**id**: 'zenWa'

**name**: { en: 'ZenWa', ja: 'ゼンワ' }

**description**: { en: 'Elegant & Serene', ja: '和の心で上品に' }

**colors.light**:
- primary: '#2D5016' (deep forest green)
- secondary: '#8B7355' (earthy brown)
- accent: '#C77D63' (akane/madder red - traditional Japanese color)
- background: '#F5F1E8' (kinari-iro - natural cream)
- surface: '#FAF6EF' (light cream)
- text: '#2D2D2D'
- textSecondary: '#6B6B6B'

**colors.dark**:
- primary: '#7DA869' (lighter green for visibility)
- secondary: '#A89070'
- accent: '#D9947A'
- background: '#1A1A14' (warm black with brown hint)
- surface: '#242018' (warm dark gray)
- text: '#F5F1E8' (cream for comfort)
- textSecondary: '#B8B8B8'

**fonts**:
- regular: 'NotoSerifJP_400Regular'
- bold: 'NotoSerifJP_700Bold'

**animations.spring**: { damping: 30, stiffness: 200, mass: 1.2 } (gentle)
**animations.timing**: { duration: 450 }
**animations.swipe**: { maxRotation: 8, scaleAmount: 1.02, fadeSpeed: 1.0 }
  </action>
  <verify>
grep -q "zenWaTheme" mobile/src/themes/themes/zenWa.ts && grep -q "#2D5016" mobile/src/themes/themes/zenWa.ts && grep -q "NotoSerifJP" mobile/src/themes/themes/zenWa.ts
  </verify>
  <done>
zenWa.ts exports theme with forest green/brown/akane colors, Noto Serif font, gentle animations
  </done>
</task>

<task type="auto">
  <name>Task 5: Update themes index and create fonts configuration</name>
  <files>mobile/src/themes/index.ts, mobile/src/themes/fonts.ts</files>
  <action>
1. Update mobile/src/themes/index.ts:
   - Import kiraPopTheme, monoEdgeTheme, zenWaTheme from './themes/*'
   - Export themes object: { kiraPop: kiraPopTheme, monoEdge: monoEdgeTheme, zenWa: zenWaTheme }
   - Export allThemes array: [kiraPopTheme, monoEdgeTheme, zenWaTheme]
   - Remove placeholder from 03-01

2. Create mobile/src/themes/fonts.ts:
   - Create useThemeFonts hook using expo-font's useFonts
   - Import all 6 font variants:
     * MPlusRounded1c_400Regular, MPlusRounded1c_700Bold
     * NotoSansJP_400Regular, NotoSansJP_700Bold
     * NotoSerifJP_400Regular, NotoSerifJP_700Bold
   - Return fontsLoaded boolean
   - Export font names as constants for type safety

Fonts must load before app renders to prevent layout shifts (pitfall #2).
  </action>
  <verify>
grep -q "kiraPopTheme" mobile/src/themes/index.ts && grep -q "useThemeFonts" mobile/src/themes/fonts.ts && npx tsc --noEmit --skipLibCheck
  </verify>
  <done>
themes/index.ts exports themes object with all 3 themes; fonts.ts provides useThemeFonts hook
  </done>
</task>

</tasks>

<verification>
1. All theme files exist and export correctly
2. Font packages installed in package.json
3. Type checking passes: `npx tsc --noEmit --skipLibCheck`
</verification>

<success_criteria>
1. 3 themes (KiraPop, MonoEdge, ZenWa) implemented with unique colors/fonts/animations
2. themes/index.ts exports all themes for consumption
3. fonts.ts provides font loading hook for app integration
</success_criteria>

<output>
After completion, create `.planning/phases/03-design-system/03-02A-SUMMARY.md`
</output>
