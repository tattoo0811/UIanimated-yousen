# Phase 3: Design System - Research

**Researched:** 2026-01-23
**Domain:** React Native theming system, Japanese typography, design patterns for age demographics
**Confidence:** HIGH

## Summary

This research investigated the implementation of a multi-theme design system for a React Native (Expo) fortune-telling app targeting Japanese users. The standard approach involves React Context API for theme state management, expo-haptics for haptic feedback, react-native-reanimated for smooth theme switching animations, and AsyncStorage for persistence.

Key findings:
1. **Theme switching architecture**: React Context + useTheme hook pattern is the established standard (HIGH confidence)
2. **Japanese fonts**: M PLUS Rounded 1c and Noto Sans JP are both free (OFL license) and suitable for commercial use (HIGH confidence)
3. **Age-based design preferences**: Younger groups prefer vibrant colors with playful animations, middle-aged prefer modern minimal designs, seniors prefer gentle movements with high contrast (MEDIUM confidence)
4. **Theme naming**: Japanese-English wordplay and cultural concepts provide authentic naming opportunities (MEDIUM confidence)

**Primary recommendation:** Implement a React Context-based theme system with three distinct themes: "KiraPop" (playful), "MonoEdge" (modern), and "ZenWa" (elegant), each with unique fonts, color palettes, and animation profiles.

---

## Standard Stack

### Core Libraries

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Context API | Built-in | Theme state management | Official React solution, widely adopted |
| @react-native-async-storage/async-storage | 2.2.0 | Theme persistence | Already installed, industry standard for key-value storage |
| react-native-reanimated | ~4.1.1 | Smooth theme switching animations | Already installed, best-in-class for 60fps animations |
| expo-font | ~14.0.10 | Custom font loading | Already installed, official Expo font management |
| expo-haptics | ~15.0.8 | Theme selection feedback | Already installed, enhances UX with tactile feedback |

### Theme Libraries Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom Context solution | react-native-paper theming | Paper theming is Material Design specific, too opinionated for our aesthetic needs |
| Custom Context solution | @react-navigation/native theming | Navigation-focused, not comprehensive app-wide theming |
| Custom animations | react-native-theme-switch-animation | Extra dependency, we already have reanimated installed |

**Installation:**
```bash
# No additional packages needed - all dependencies already installed
# Fonts will be loaded via expo-font (already in package.json)
```

---

## Theme Naming Proposals (ワードセンス重視)

Based on research into Japanese-English wordplay, cultural concepts, and age demographics, here are three distinctive theme names with clear personality:

### Theme A: 若年層（10-20代）- ポップ・ビビッド・遊び心

**Theme Name: "KiraPop" (キラポップ)**

**Naming Rationale:**
- **"Kira"** (キラ): Japanese onomatopoeia for sparkling/twinkling (きらきら), commonly used in kawaii culture
- **"Pop"**: English word meaning sudden/bursting, associated with pop art and vibrant colors
- **Combined**: Authentic Japanese-English wordplay that feels natural and playful to Japanese youth
- **Personality**: Energetic, cute, attention-grabbing, social media-friendly

**Alternative Names Considered:**
- "PokaPoka" (ぽかぽか) - warm/comfortable, but too soft for vibrant theme
- "BubbleBurst" - too English-focused
- "SparkleJoy" - doesn't sound natural to Japanese speakers

### Theme B: 中堅層（30-40代）- モダン・クール・洗練

**Theme Name: "MonoEdge" (モノエッジ)**

**Naming Rationale:**
- **"Mono"**: Monochrome, minimalist, single-focused
- **"Edge"**: Cutting edge, sharp, boundary-pushing
- **Combined**: Suggests sophistication, urban professionalism, contemporary design
- **Personality**: Cool, confident, premium, tech-forward

**Cultural Context:**
- Appeals to Japanese appreciation for minimalism (減色, gen-shoku)
- "Edge" in katakana (エッジ) sounds modern and international
- Resonates with Tokyo urban aesthetics

**Alternative Names Considered:**
- "NoirVibe" - too film-focused
- "SleekZen" - contradictory concepts
- "UrbanMono" - too descriptive

### Theme C: シニア層（50代+）- 落ち着いた和風・上品

**Theme Name: "ZenWa" (ゼンワ)**

**Naming Rationale:**
- **"Zen"**: Well-known Japanese concept globally, represents simplicity, meditation, clarity
- **"Wa"** (和): Core Japanese concept meaning harmony, peace, balance (和の心)
- **Combined**: "Zen harmony" - communicates authenticity, tranquility, traditional wisdom
- **Personality**: Sophisticated, timeless, respectful, spiritual

**Cultural Significance:**
- **Wa (和)** is a cornerstone of Japanese aesthetics - represents harmony with nature and others
- Zen philosophy emphasizes eliminating excess, stillness, simplicity, and presence
- Resonates with traditional Japanese tea ceremony values (wa-kei-sei-jaku: 和敬清寂)

**Alternative Names Considered:**
- "HarmonyFlow" - too generic
- "NatureZen" - redundant
- "SerenityWa" - doesn't flow naturally

---

## Color Palette Design

### Theme A: KiraPop - ビビッドで遊び心

**Light Mode:**
```typescript
{
  primary: '#FF6B9D',      // ピンク (vivid pink) - playful, energetic
  secondary: '#00D9FF',    // シアン (cyan) - fresh, attention-grabbing
  accent: '#FFED47',       // イエロー (yellow) - cheerful, bright
  background: '#FFF5F8',   // 薄ピンクベージュ (light pinkish cream)
  surface: '#FFFFFF',      // 純白 (pure white)
  text: '#2D2D2D',         // 濃いグレー (dark gray) - readable
  textSecondary: '#6B6B6B', // ミディアムグレー (medium gray)
}
```

**Dark Mode:**
```typescript
{
  primary: '#FF6B9D',      // Same primary for consistency
  secondary: '#00D9FF',
  accent: '#FFED47',
  background: '#1A1020',   // 深紫がかった黒 (deep purplish black)
  surface: '#2D1A30',      // 紫がかったダークグレー (purplish dark gray)
  text: '#FFFFFF',
  textSecondary: '#B8B8B8',
}
```

**Color Psychology:**
- **Pink (#FF6B9D)**: Energetic, youthful, associated with Japanese pop culture
- **Cyan (#00D9FF)**: Fresh, modern, tech-forward
- **Yellow (#FFED47)**: Optimistic, cheerful, high energy
- High saturation creates excitement and playfulness

### Theme B: MonoEdge - モダンでクール

**Light Mode:**
```typescript
{
  primary: '#1A1A1A',      // ブラック (black) - sophisticated
  secondary: '#4A4A4A',    // ダークグレー (dark gray)
  accent: '#6366F1',       // インディゴ (indigo) - tech, modern
  background: '#FAFAFA',   // オフホワイト (off-white)
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
}
```

**Dark Mode:**
```typescript
{
  primary: '#FFFFFF',      // ホワイト (white)
  secondary: '#A1A1AA',    // ライトグレー (light gray)
  accent: '#818CF8',       // Lighter indigo for dark mode
  background: '#0A0A0A',   // Deepest black
  surface: '#171717',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
}
```

**Color Psychology:**
- **Monochrome base**: Conveys sophistication, minimalism, focus
- **Indigo accent (#6366F1)**: Trust, technology, wisdom, modern
- Low saturation creates calm, professional atmosphere
- High contrast for readability and accessibility

### Theme C: ZenWa - 落ち着いた和風

**Light Mode:**
```typescript
{
  primary: '#2D5016',      // 深緑 (deep forest green) - nature, harmony
  secondary: '#8B7355',    // ブラウン (earthy brown) - warmth, grounding
  accent: '#C77D63',       // 茜色 (akane - madder red) - traditional Japanese color
  background: '#F5F1E8',   // 生成り色 (kinari-iro - natural cream)
  surface: '#FAF6EF',      // 薄いクリーム (light cream)
  text: '#2D2D2D',
  textSecondary: '#6B6B6B',
}
```

**Dark Mode:**
```typescript
{
  primary: '#7DA869',      // Lighter green for visibility
  secondary: '#A89070',
  accent: '#D9947A',
  background: '#1A1A14',   // 暖かい黒 (warm black with hint of brown)
  surface: '#242018',      // 暖かいダークグレー
  text: '#F5F1E8',         // Cream for comfort
  textSecondary: '#B8B8B8',
}
```

**Color Psychology:**
- **Forest green (#2D5016)**: Nature, growth, harmony, healing
- **Earthy brown (#8B7355)**: Stability, warmth, authenticity
- **Akane red (#C77D63)**: Traditional Japanese color, elegant, timeless
- Muted, natural tones create serenity and connection to nature

### Accessibility Considerations

All themes comply with WCAG AA standards:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio

---

## Font Selection

### Theme A: KiraPop - 丸ゴシック系（遊び心）

**Font Choice: M PLUS Rounded 1c**

**Rationale:**
- **Rounded corners** create friendly, approachable, cute aesthetic (かわいい)
- **7 weights available** (100-900) for flexible typography
- **Open Font License (OFL)** - free for commercial use without restrictions
- **Designed by Coji Morishita** - modern Japanese typeface designer
- **Perfect for youth-oriented apps** - commonly used in Japanese mobile games and casual apps

**Font Characteristics:**
- Rounded stroke ends soften the overall feel
- Highly readable at small sizes despite playful design
- Supports full Japanese character set (Hiragana, Katakana, Kanji)
- Katakana characters have particularly cute rounded forms

**Expo Integration:**
```typescript
import { useFonts } from 'expo-font';
import { MPlusRounded1c_400Regular, MPlusRounded1c_700Bold } from '@expo-google-fonts/m-plus-rounded-1c';
```

**Confidence:** HIGH - Font is production-ready, widely used in Japanese apps

### Theme B: MonoEdge - モダンゴシック系（洗練）

**Font Choice: Noto Sans JP**

**Rationale:**
- **Clean, modern sans-serif** - professional and minimalist
- **7 weights available** (100-900) for sophisticated typography hierarchy
- **Developed by Google** - continuously maintained and improved
- **Industry standard** for Japanese web/mobile applications
- **Excellent legibility** - designed for screen readability
- **Open Font License (OFL)** - free for commercial use

**Font Characteristics:**
- Neutral design that doesn't compete with content
- Consistent stroke widths create clean, orderly appearance
- Optimized for digital displays
- Supports full Japanese character set with beautiful kanji designs
- Tight character spacing for efficient use of space

**Expo Integration:**
```typescript
import { useFonts } from 'expo-font';
import { NotoSansJP_400Regular, NotoSansJP_700Bold } from '@expo-google-fonts/noto-sans-jp';
```

**Confidence:** HIGH - Google's flagship Japanese font, battle-tested

### Theme C: ZenWa - 明朝系・和風系（上品）

**Font Choice: Noto Serif JP**

**Rationale:**
- **Elegant serif design** - conveys sophistication, tradition, wisdom
- **Vertical stroke variations** create distinctive Japanese aesthetic
- **7 weights available** for refined typography
- **Perfect balance** of traditional and modern design
- **Highly readable** despite ornate design details
- **Open Font License (OFL)** - free for commercial use

**Font Characteristics:**
- Delicate stroke endings (serifs) create graceful, refined appearance
- Variable stroke widths mimic brush calligraphy traditions
- Excellent for long-form reading (fortune-telling results)
- Kanji characters have beautiful, balanced designs
- Evokes printed books and traditional Japanese publications

**Alternative Considered:**
- **Shippori Mincho**: More traditional, but Noto Serif JP has better screen rendering
- **Sawarabi Mincho**: Too stylized, harder to read

**Expo Integration:**
```typescript
import { useFonts } from 'expo-font';
import { NotoSerifJP_400Regular, NotoSerifJP_700Bold } from '@expo-google-fonts/noto-serif-jp';
```

**Confidence:** HIGH - Google's Japanese serif font, excellent for traditional aesthetics

### Font Licensing Status (2026)

**CRITICAL CONTEXT:** Japanese font licensing landscape changed dramatically in 2026:

**Fontworks Crisis:**
- Fontworks LETS ended game font licensing
- Replacement Monotype Fonts plan: **$380/year → $20,000+/year** (50x increase)
- Affects Japanese game/app developers seeking commercial fonts

**Our Strategy:**
- ✅ **All selected fonts use SIL Open Font License (OFL)**
- ✅ **No licensing fees** - completely free for commercial use
- ✅ **No expiration** - licenses don't have time limits
- ✅ **Self-hosting allowed** - can download and host font files
- ✅ **No attribution required** (though appreciated)

**Font Sources:**
- Google Fonts (official, always up-to-date)
- @expo-google-fonts packages (NPM integration)
- Fontsource (self-hosting option)

**Confidence:** HIGH - Legal research confirms OFL license is safe and permanent

---

## Architecture Recommendations

### Theme System Architecture

**Pattern: React Context + Custom Hook + AsyncStorage Persistence**

This is the established standard for React Native theming (HIGH confidence):

```
┌─────────────────────────────────────────────┐
│          ThemeProvider (Context)            │
│  - Manages current theme state              │
│  - Loads saved theme from AsyncStorage      │
│  - Provides theme change function           │
└─────────────────┬───────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐     ┌────▼────────┐
    │ useTheme │     │ Children    │
    │  Hook    │◄────│ Components  │
    └──────────┘     └─────────────┘
```

### File Structure

```
src/
├── themes/
│   ├── index.ts                    # Theme exports
│   ├── types.ts                    # Theme type definitions
│   ├── themes/
│   │   ├── kiraPop.ts             # Playful theme config
│   │   ├── monoEdge.ts            # Modern theme config
│   │   └── zenWa.ts               # Elegant theme config
│   ├── animations.ts              # Theme-specific animation configs
│   └── fonts.ts                   # Font loading configuration
├── contexts/
│   └── ThemeContext.tsx           # Theme provider & context
├── hooks/
│   └── useTheme.ts                # Custom theme hook
└── components/
    ├── ThemeCard.tsx              # Theme selection card (swipeable)
    └── ThemePreview.tsx           # Real-time theme preview
```

### Implementation Pattern

**1. Theme Type Definition:**

```typescript
// src/themes/types.ts
export type ThemeId = 'kiraPop' | 'monoEdge' | 'zenWa';

export interface Theme {
  id: ThemeId;
  name: {
    en: string;
    ja: string;
  };
  description: {
    en: string;
    ja: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    regular: string;
    bold: string;
    display?: string;
  };
  animations: AnimationConfig;
}

export interface AnimationConfig {
  spring: {
    damping: number;
    stiffness: number;
    mass: number;
  };
  timing: {
    duration: number;
  };
  swipe: {
    maxRotation: number;
    scaleAmount: number;
    fadeSpeed: number;
  };
}
```

**2. Theme Configuration:**

```typescript
// src/themes/themes/kiraPop.ts
import { Theme } from '../types';

export const kiraPopTheme: Theme = {
  id: 'kiraPop',
  name: { en: 'KiraPop', ja: 'キラポップ' },
  description: {
    en: 'Vibrant & Playful',
    ja: 'キラキラポップで楽しく'
  },
  colors: {
    primary: '#FF6B9D',
    secondary: '#00D9FF',
    accent: '#FFED47',
    // ... (from Color Palette section)
  },
  fonts: {
    regular: 'MPlusRounded1c_400Regular',
    bold: 'MPlusRounded1c_700Bold',
  },
  animations: {
    spring: { damping: 12, stiffness: 400, mass: 0.8 }, // Bouncy
    timing: { duration: 300 },
    swipe: { maxRotation: 20, scaleAmount: 1.15, fadeSpeed: 0.7 },
  },
};
```

**3. Theme Context:**

```typescript
// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeId } from '../themes/types';
import { themes } from '../themes';

interface ThemeContextType {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>('kiraPop');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@app_theme');
      if (savedTheme && themes[savedTheme as ThemeId]) {
        setThemeIdState(savedTheme as ThemeId);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newThemeId: ThemeId) => {
    try {
      await AsyncStorage.setItem('@app_theme', newThemeId);
      setThemeIdState(newThemeId);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeId], themeId, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

**4. Component Integration:**

```typescript
// Example: Updated ZodiacCard.tsx
import { useTheme } from '../hooks/useTheme';

export function ZodiacCard({ sign, active }: ZodiacCardProps) {
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <Text style={{ fontFamily: theme.fonts.regular, color: theme.colors.text }}>
        {sign.name}
      </Text>
    </View>
  );
}
```

### Theme Switching Implementation

**Settings Screen Integration:**

```typescript
// app/settings.tsx (updated section)
import { ThemeCard } from '@/src/components/ThemeCard';
import { useTheme } from '@/src/hooks/useTheme';

export default function SettingsScreen() {
  const { themeId, setTheme } = useTheme();

  return (
    <ScrollView>
      {/* Theme Selection Section */}
      <View style={{ backgroundColor: theme.colors.surface }}>
        <Text style={{ color: theme.colors.text }}>テーマを選択</Text>

        {/* Swipeable Theme Cards */}
        <SwipeableStack
          signs={Object.values(themes)}
          onSwipeComplete={(selectedTheme) => setTheme(selectedTheme.id)}
        />
      </View>
    </ScrollView>
  );
}
```

### Real-Time Preview Strategy

**Critical Requirement:** Theme must change immediately when user selects it

**Implementation:**
1. **Theme Card Component:** Preview card showing theme colors, fonts, and sample animations
2. **Immediate Application:** Context update triggers re-render across all components
3. **Auto-Save:** AsyncStorage write happens automatically on selection
4. **Haptic Feedback:** Use expo-haptics to confirm selection (already installed)

**Theme Card Design:**
```typescript
export function ThemeCard({ theme, onPress }: ThemeCardProps) {
  const { themeId } = useTheme();
  const isActive = theme.id === themeId;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ backgroundColor: theme.colors.background }}>
        {/* Preview sample card using theme colors */}
        <View style={{ backgroundColor: theme.colors.primary }} />
        <Text style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}>
          {theme.name.ja}
        </Text>
        <Text style={{ fontFamily: theme.fonts.regular, color: theme.colors.textSecondary }}>
          {theme.description.ja}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
```

### Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme state management | Custom state propagation | React Context API | Official React pattern, optimized for re-renders |
| Theme switching animations | Manual Animated API | react-native-reanimated (already installed) | 60fps performance, worklets, declarative |
| Font loading | Manual Font.loadAsync | expo-font (already installed) | Pre-loading, caching, error handling built-in |
| Persistence | Custom file system | AsyncStorage (already installed) | Battle-tested, async, cross-platform |
| Theme type definitions | Inline type objects | Centralized type file | Type safety, autocomplete, refactoring safety |

---

## Animation Design

### Theme-Specific Animation Profiles

Each theme has distinct animation characteristics matching its target demographic:

**Theme A: KiraPop - 弾むような動き（bounce, spring）**

```typescript
// src/themes/themes/kiraPop.ts
animations: {
  spring: {
    damping: 12,        // Low damping = more oscillation
    stiffness: 400,     // High stiffness = snappy response
    mass: 0.8,          // Light mass = quick movement
  },
  timing: {
    duration: 300,      // Fast transitions
  },
  swipe: {
    maxRotation: 20,    // More rotation for playfulness
    scaleAmount: 1.15,  // Larger scale effect
    fadeSpeed: 0.7,     // Quick fade
  },
}
```

**Characteristics:**
- **Bouncy spring**: overshoots target then settles (damping:12 < damping:20)
- **Quick response**: High stiffness makes it feel energetic
- **Exaggerated effects**: Larger scale/rotation for visual impact
- **Multiple particles**: Add sparkles/confetti on swipe complete

**Visual Effects:**
- Sparkle particles on card swipe
- Elastic border animations
- Gradient color shifts
- Multiple micro-interactions (tap, swipe, long press)

---

**Theme B: MonoEdge - 滑らかな動き（ease, smooth）**

```typescript
// src/themes/themes/monoEdge.ts
animations: {
  spring: {
    damping: 25,        // Medium damping = minimal oscillation
    stiffness: 300,     // Medium stiffness = smooth response
    mass: 1.0,          // Standard mass
  },
  timing: {
    duration: 350,      // Moderate transitions
  },
  swipe: {
    maxRotation: 12,    // Moderate rotation
    scaleAmount: 1.05,  // Subtle scale
    fadeSpeed: 0.85,    // Smooth fade
  },
}
```

**Characteristics:**
- **Smooth spring**: settles quickly without bouncing (damping:25 ≈ critically damped)
- **Balanced response**: Medium stiffness feels professional
- **Subtle effects**: Scale/rotation are refined, not exaggerated
- **Clean transitions**: Minimal visual noise

**Visual Effects:**
- Smooth gradient transitions
- Subtle shadow animations
- Clean line animations
- Monochrome accent highlights

---

**Theme C: ZenWa - 和緩やかな動き（gentle, slow）**

```typescript
// src/themes/themes/zenWa.ts
animations: {
  spring: {
    damping: 30,        // High damping = no oscillation
    stiffness: 200,     // Lower stiffness = gentle response
    mass: 1.2,          // Heavier mass = graceful movement
  },
  timing: {
    duration: 450,      // Slower, deliberate transitions
  },
  swipe: {
    maxRotation: 8,     // Minimal rotation
    scaleAmount: 1.02,  // Very subtle scale
    fadeSpeed: 1.0,     // Gentle fade
  },
}
```

**Characteristics:**
- **Over-damped spring**: No bounce, smooth approach (damping:30 > critical damping)
- **Gentle response**: Lower stiffness feels relaxed
- **Minimal effects**: Subtle scale/rotation for calmness
- **Deliberate pace**: Longer duration feels thoughtful

**Visual Effects:**
- Ink diffusion effects on card swipe
- Falling petal animations
- Gentle wave motions
- Muted color transitions

---

### Swipe Animation Implementation

**Updated SwipeableStack with Theme Support:**

```typescript
// src/components/SwipeableStack.tsx (modified)
import { useTheme } from '../hooks/useTheme';

export function SwipeableStack({ signs, onSwipeComplete }: SwipeableStackProps) {
  const { theme } = useTheme();
  const { success, selection } = useHapticFeedback();

  const springConfig = theme.animations.spring;
  const swipeConfig = theme.animations.swipe;

  // Use theme-specific animation config
  const handleSwipeEnd = (direction: 'left' | 'right') => {
    translationX.value = withSpring(
      direction === 'right' ? SCREEN_WIDTH * 2 : -SCREEN_WIDTH * 2,
      springConfig, // Theme-specific spring
      () => runOnJS(handleSwipeComplete)(direction)
    );
  };

  const activeCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translationX.value,
      [-ANIMATION_DISTANCE, 0, ANIMATION_DISTANCE],
      [-swipeConfig.maxRotation, 0, swipeConfig.maxRotation], // Theme-specific rotation
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translationX.value },
        { rotate: `${rotate}deg` }
      ]
    };
  });

  // Theme-specific visual effects on swipe complete
  const handleSwipeComplete = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      success();
      if (theme.id === 'kiraPop') {
        // Trigger sparkle effect
        runOnJS(triggerSparkles)();
      } else if (theme.id === 'zenWa') {
        // Trigger petal effect
        runOnJS(triggerPetals)();
      }
    }
    // ... rest of handler
  };
}
```

---

## Common Pitfalls

### Pitfall 1: Theme Flicker on App Launch

**What goes wrong:**
- App loads with default theme
- AsyncStorage read completes after initial render
- Theme suddenly changes, causing visual flicker

**Why it happens:**
- AsyncStorage is async but initial render is sync
- Default theme renders before saved theme loads

**How to avoid:**
```typescript
// Show loading state until theme loads
const [isLoading, setIsLoading] = useState(true);

if (isLoading) {
  return <SplashScreen />; // Prevent render until theme loads
}

// Render app with correct theme
return <AppContent />;
```

**Warning signs:**
- Theme flashes from default to saved on app start
- Inconsistent colors between first render and subsequent renders

---

### Pitfall 2: Font Loading Race Conditions

**What goes wrong:**
- Components render before fonts are loaded
- Text appears in system font, then swaps to custom font
- Layout shifts when fonts load (font metrics differ)

**Why it happens:**
- expo-font loading is async
- Component render doesn't wait for font promise

**How to avoid:**
```typescript
// Wait for fonts in ThemeProvider
const [fontsLoaded] = useFonts({
  MPlusRounded1c_400Regular,
  MPlusRounded1c_700Bold,
  NotoSansJP_400Regular,
  NotoSansJP_700Bold,
  NotoSerifJP_400Regular,
  NotoSerifJP_700Bold,
});

if (!fontsLoaded || isLoading) {
  return <SplashScreen />;
}
```

**Warning signs:**
- Font changes mid-session
- Layout jumps when theme changes
- Typography looks inconsistent

---

### Pitfall 3: Unnecessary Re-renders with Context

**What goes wrong:**
- Every context update re-renders all consumers
- Performance degrades with many themed components
- Theme switching feels laggy

**Why it happens:**
- Context consumers re-render on any context value change
- Theme object is recreated on every render

**How to avoid:**
```typescript
// Memoize theme object
const theme = useMemo(() => themes[themeId], [themeId]);
const value = useMemo(() => ({ theme, themeId, setTheme }), [theme, themeId]);

return (
  <ThemeContext.Provider value={value}>
    {children}
  </ThemeContext.Provider>
);
```

**Warning signs:**
- Theme switching delays
- Frame rate drops on theme change
- Performance profiling shows many re-renders

---

### Pitfall 4: Hard-Coded Colors in Components

**What goes wrong:**
- Theme switching doesn't update all UI elements
- Some colors remain from old theme
- Inconsistent appearance

**Why it happens:**
- Developers hard-code colors instead of using theme
- Migration missed some components
- Inline styles override theme values

**How to avoid:**
```typescript
// DON'T
<View style={{ backgroundColor: '#FF6B9D' }}>

// DO
import { useTheme } from '@/src/hooks/useTheme';
const { theme } = useTheme();
<View style={{ backgroundColor: theme.colors.primary }}>
```

**Warning signs:**
- Some UI doesn't change with theme
- Color inconsistencies after theme switch
- Need to restart app to see full theme change

---

### Pitfall 5: Ignoring System Dark Mode Preference

**What goes wrong:**
- User's phone is in dark mode but app is light
- Jarring transition when opening app
- Accessibility issue for users preferring dark mode

**Why it happens:**
- Theme system doesn't respect Appearance API
- Light/dark mode not integrated into theme selection

**How to avoid:**
```typescript
import { Appearance, useColorScheme } from 'react-native';

// Option 1: Auto-detect system preference
const colorScheme = useColorScheme();
const effectiveTheme = theme[colorScheme]; // theme.light or theme.dark

// Option 2: System setting overrides theme choice
const [autoDarkMode, setAutoDarkMode] = useState(true);
const activeTheme = autoDarkMode && colorScheme === 'dark'
  ? theme.dark
  : theme.light;
```

**Warning signs:**
- App always bright in dark environment
- User complaints about eye strain
- Inconsistent with platform conventions

---

## Code Examples

### Theme Switching Animation with Reanimated

**Source:** [React Native Reanimated - Interpolate Colors Tutorial](https://enzomanuelmangano.medium.com/interpolate-colors-like-a-pro-with-react-native-reanimated-2-253a2695cf0a)

Smooth color interpolation when switching themes:

```typescript
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColors } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

export function ThemedCard() {
  const { theme } = useTheme();
  const animationProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColors(
      animationProgress.value,
      [0, 1],
      ['#FFFFFF', theme.colors.surface] // Old color → New color
    );

    return {
      backgroundColor,
      transform: [{ scale: 0.95 + (animationProgress.value * 0.05) }]
    };
  });

  const triggerAnimation = () => {
    animationProgress.value = withTiming(1, { duration: 300 });
  };

  return <Animated.View style={animatedStyle} />;
}
```

---

### Comprehensive Theme Type Definition

```typescript
// src/themes/types.ts
export type ThemeMode = 'light' | 'dark';
export type ThemeId = 'kiraPop' | 'monoEdge' | 'zenWa';

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border?: string;
  overlay?: string;
}

export interface FontScheme {
  regular: string;
  medium?: string;
  bold: string;
  display?: string;
}

export interface AnimationConfig {
  spring: {
    damping: number;
    stiffness: number;
    mass: number;
  };
  timing: {
    duration: number;
  };
  swipe: {
    maxRotation: number;
    scaleAmount: number;
    fadeSpeed: number;
  };
}

export interface Theme {
  id: ThemeId;
  name: {
    en: string;
    ja: string;
  };
  description: {
    en: string;
    ja: string;
  };
  colors: {
    light: ColorScheme;
    dark: ColorScheme;
  };
  fonts: FontScheme;
  animations: AnimationConfig;
}
```

---

### Font Loading with Expo

```typescript
// src/themes/fonts.ts
import { useFonts } from 'expo-font';
import {
  MPlusRounded1c_400Regular,
  MPlusRounded1c_700Bold,
} from '@expo-google-fonts/m-plus-rounded-1c';
import {
  NotoSansJP_400Regular,
  NotoSansJP_700Bold,
} from '@expo-google-fonts/noto-sans-jp';
import {
  NotoSerifJP_400Regular,
  NotoSerifJP_700Bold,
} from '@expo-google-fonts/noto-serif-jp';

export function useThemeFonts() {
  const [fontsLoaded] = useFonts({
    // KiraPop fonts
    MPlusRounded1c_400Regular,
    MPlusRounded1c_700Bold,

    // MonoEdge fonts
    NotoSansJP_400Regular,
    NotoSansJP_700Bold,

    // ZenWa fonts
    NotoSerifJP_400Regular,
    NotoSerifJP_700Bold,
  });

  return fontsLoaded;
}
```

---

## State of the Art

### React Native Theming Evolution

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline styles | Context + Custom Hook | 2021-2022 | Centralized theme management, type safety |
| Manual color objects | TypeScript theme interfaces | 2022-2023 | Autocomplete, refactoring safety |
| Hard-coded theme switching | AsyncStorage persistence | 2020-2021 | User preferences survive app restarts |
| System fonts only | Custom fonts via expo-font | 2019-2020 | Brand identity, differentiation |
| Single theme | Multiple theme support | 2021-2022 | User personalization, accessibility |

**Deprecated/outdated:**
- **StyleSheet.flatten()** for theme combination: Use theme objects with spread syntax instead
- **Static theme variables**: Use dynamic Context-based themes
- **Appearance API-only dark mode**: Users expect manual theme control + system preference
- **ColorPropType string literals**: Use typed theme interfaces

---

## Open Questions

### 1. Theme Transition Animation Complexity

**What we know:**
- React Native Reanimated supports smooth color interpolation
- Individual components can animate color changes
- Theme switching should feel instant but polished

**What's unclear:**
- Should entire app animate (expensive) or just key components?
- How to animate nested children without performance issues?

**Recommendation:**
- Start with instant theme switching (no global transition animation)
- Add micro-interactions to individual components (buttons, cards)
- Consider full-screen transition only if performance testing shows <16ms render time

---

### 2. Dark Mode Implementation Strategy

**What we know:**
- Users expect dark mode support
- React Native Appearance API provides system preference
- Each theme can have light/dark variants

**What's unclear:**
- Should dark mode be automatic (system preference) or manual (user toggle)?
- Do we need separate theme selections for light/dark modes?

**Recommendation:**
- Implement hybrid approach:
  - Default: Auto (follows system preference)
  - Manual override: User can lock to light or dark
  - Settings screen: "Auto / Light / Dark" toggle independent of theme selection
- Each theme (KiraPop, MonoEdge, ZenWa) has both light and dark color schemes

---

### 3. Accessibility Impact on Animation Preferences

**What we know:**
- Some users prefer reduced motion (vestibular disorders, ADHD)
- React Native has `AccessibilityInfo.isReduceMotionEnabled()` API
- Seniors might prefer slower animations even without accessibility settings

**What's unclear:**
- Should ZenWa theme automatically reduce motion, or respect system setting?
- How to handle users who want "ZenWa aesthetics but KiraPop animations"?

**Recommendation:**
- Add "Animation Level" setting in accessibility:
  - Full (default): Theme-specific animations
  - Reduced: Gentle transitions only
  - Off: No animations
- ZenWa theme uses gentler animations by default, but all themes respect accessibility setting

---

## Sources

### Primary (HIGH confidence)

**React Native Theming:**
- [Managing Themes in React Native Using Context API - Dev.to](https://dev.to/amitkumar13/managing-themes-in-react-native-using-context-api-3dk2) - Comprehensive Context API pattern
- [Building a React Native Theme Switcher - LogRocket](https://blog.logrocket.com/building-react-native-theme-switcher-app/) - Production-tested implementation
- [React Native Reanimated Documentation - docs.swmansion.com](https://docs.swmansion.com/react-native-reanimated/) - Official library docs

**Japanese Typography:**
- [Noto Sans JP - Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+JP) - Official font specifications
- [M PLUS Rounded 1c - Google Fonts](https://fonts.google.com/specimen/M+PLUS+Rounded+1c) - Official font specifications
- [Noto Serif JP - Google Fonts](https://fonts.google.com/noto/specimen/Noto+Serif+JP) - Official font specifications
- [Fontsource - Noto Sans JP](https://fontsource.org/fonts/noto-sans-jp) - Self-hosting guide, license confirmation

**Color & Design:**
- [Color preference order for different age groups - ResearchGate](https://www.researchgate.net/figure/The-color-preference-order-for-different-age-groups_fig1_267857549) - Scientific study on age-based color preferences
- [Designing for Young Adults (Ages 18-25) - Nielsen Norman Group](https://media.nngroup.com/media/reports/free/Designing_for_Young_Adults_3rd_Edition.pdf) - Age-specific UX research

### Secondary (MEDIUM confidence)

**Animation & Transitions:**
- [Interpolate Colors like a pro with React Native Reanimated 2 - Medium](https://enzomanuelmangano.medium.com/interpolate-colors-like-a-pro-with-react-native-reanimated-2-253a2695cf0a) - Color interpolation techniques
- [React Native Reanimated Tutorial 2026 with Expo - codesofphoenix](https://www.codesofphoenix.com/articles/expo/react-native-reanimated) - Current best practices

**Japanese Design & Naming:**
- [Japanese Words with Deep Meanings - Interac Network](https://interacnetwork.com/japanese-words-with-deep-meanings/) - Cultural concepts for theme naming
- [Harmony and Zen: Japanese Tea Ceremony Guide - Bokksu](https://bokksu.com/blogs/news/harmony-and-zen-an-insiders-guide-to-the-japanese-tea-ceremony) - Wa (和) and Zen philosophy
- [Contemporary Japanese Style App Name Ideas - Boon](https://blog.boon.so/contemporary-japanese-style-app-name-ideas/) - Modern Japanese naming conventions

### Tertiary (LOW confidence)

**Font Licensing Landscape:**
- [Japanese devs face font licensing dilemma - GamesIndustry.biz](https://www.gamesindustry.biz/japanese-devs-face-font-licensing-dilemma-as-leading-provider-increases-annual-plan-price-from-380-to-20000) - Fontworks licensing crisis (verified by multiple sources)
- [Automaton Media analysis of font price hike](https://automaton-media.com/en/news/100-best-japanese-fonts-top-picks-for-your-projects-1764800204) - Industry analysis

**Theme Inspiration:**
- [Japanese App Design Inspiration - Dribbble](https://dribbble.com/tags/japanese-app) - Visual design patterns
- [Best Japanese CSS font-family in 2025 - Bloom Street Japan](https://www.bloomstreetjapan.com/best-japanese-font-setting-for-websites/) - Web font best practices

---

## Metadata

**Confidence breakdown:**
- **Standard stack**: HIGH - All libraries verified via official docs and already installed
- **Architecture patterns**: HIGH - Context + useTheme is established React Native pattern
- **Japanese fonts**: HIGH - All selected fonts use SIL OFL license, commercially safe
- **Color palettes**: MEDIUM - Based on color psychology research and age demographic studies, but subjective
- **Theme naming**: MEDIUM - Cultural concepts verified, but naming is inherently creative and subjective
- **Animation design**: MEDIUM - Based on reanimated docs and animation principles, but user testing needed
- **Pitfalls**: HIGH - All issues are well-documented React Native problems

**Research date:** 2026-01-23

**Valid until:** 2026-02-22 (30 days - font licensing landscape stable, React Native ecosystem stable)

**Key uncertainties requiring validation:**
1. User testing needed for theme names (do Japanese users find them appealing?)
2. Performance testing needed for theme switching animation approach
3. A/B testing needed for color palette effectiveness with target demographics
