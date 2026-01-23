# Phase 02: Card UI Core - Research

**Researched:** 2026-01-23
**Domain:** React Native gesture-driven card UI with animations
**Confidence:** HIGH

## Summary

This research covers implementing a Tinder-style swipeable card interface in React Native using the modern stack of `react-native-gesture-handler` and `react-native-reanimated 4.x`. The project already has a `SwipeableStack.tsx` component that implements basic swipe functionality with `react-native-gesture-handler` and `react-native-reanimated`, which should be enhanced rather than replaced.

The core challenge is creating a smooth, 60fps card stack interface where users can swipe cards left/right to navigate, with tap feedback animations and haptic responses. The modern stack runs animations on the native UI thread, avoiding the JavaScript bridge bottleneck that causes jank in legacy implementations.

**Primary recommendation:** Enhance the existing `SwipeableStack.tsx` component using the current `react-native-gesture-handler` (~2.28.0) and `react-native-reanimated` (~4.1.1) already installed, add `expo-haptics` for tap feedback, and implement proper card stack animations with rotation, scale, and opacity effects.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-native-gesture-handler` | ~2.28.0 | Gesture detection (Pan, Pinch, Rotation) | Already installed; industry standard for touch handling in RN |
| `react-native-reanimated` | ~4.1.1 | High-performance animations | Already installed; runs on UI thread for 60fps animations |
| `expo-haptics` | latest | Haptic feedback | Official Expo library for iOS/Android tactile feedback |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-linear-gradient` | ~15.0.8 | Gradient backgrounds | Already installed; used in existing cards |
| `expo-blur` | ~15.0.8 | Blur effects | Already installed; used in ZodiacCard |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom swipe implementation | `react-native-deck-swiper` | Library is poorly maintained; customization ceiling limits future flexibility |

**Installation:**
```bash
# Only expo-haptics needs to be added
npx expo install expo-haptics
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── SwipeableStack.tsx    # Enhanced with better animations
│   ├── ZodiacCard.tsx         # Already exists, add tap animations
│   └── CardStack.tsx          # New: manages card stack state
├── hooks/
│   ├── useCardSwipe.ts        # New: encapsulates swipe logic
│   └── useHapticFeedback.ts   # New: haptic feedback utilities
└── lib/
    └── animations.ts          # New: shared animation configs
```

### Pattern 1: Modern Gesture Handling with Gesture API

**What:** Using `Gesture.Pan()` with `GestureDetector` for swipe detection

**When to use:** All swipeable card interfaces requiring smooth, touch-following animations

**Example:**
```typescript
// Source: Context7 - /software-mansion/react-native-reanimated/4.1.5
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

const translateX = useSharedValue(0);
const context = useSharedValue({ x: 0 });

const panGesture = Gesture.Pan()
  .onStart(() => {
    'worklet';
    context.value = { x: translateX.value };
  })
  .onUpdate((event) => {
    'worklet';
    translateX.value = context.value.x + event.translationX;
  })
  .onEnd((event) => {
    'worklet';
    const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
    if (event.translationX > SWIPE_THRESHOLD || event.velocityX > 800) {
      translateX.value = withSpring(SCREEN_WIDTH * 2);
      runOnJS(handleSwipeRight)();
    } else if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -800) {
      translateX.value = withSpring(-SCREEN_WIDTH * 2);
      runOnJS(handleSwipeLeft)();
    } else {
      translateX.value = withSpring(0);
    }
  });

return (
  <GestureDetector gesture={panGesture}>
    <Animated.View style={animatedStyle}>
      {/* Card content */}
    </Animated.View>
  </GestureDetector>
);
```

### Pattern 2: Card Rotation with Interpolation

**What:** Mapping horizontal translation to rotation for natural card tilt

**When to use:** All swipeable cards to create physical, dynamic feel

**Example:**
```typescript
// Source: Based on Context7 interpolation patterns
const rotateZ = interpolate(
  translateX.value,
  [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
  [-15, 0, 15],
  Extrapolation.CLAMP
);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: translateX.value },
    { rotateZ: `${rotateZ}deg` }
  ]
}));
```

### Pattern 3: Next Card Scale/Opacity Animation

**What:** Background card scales up and fades in as top card swipes away

**When to use:** Creating depth illusion in card stacks

**Example:**
```typescript
// Background card reacts to active card's translation
const nextCardStyle = useAnimatedStyle(() => {
  const scale = interpolate(
    Math.abs(translateX.value),
    [0, SCREEN_WIDTH / 2],
    [0.9, 1],
    Extrapolation.CLAMP
  );
  const opacity = interpolate(
    Math.abs(translateX.value),
    [0, SCREEN_WIDTH / 4],
    [0.5, 1],
    Extrapolation.CLAMP
  );
  return {
    transform: [{ scale }],
    opacity
  };
});
```

### Pattern 4: Haptic Feedback Integration

**What:** Tactile response on user interactions

**When to use:** Tap events, swipe completions, state changes

**Example:**
```typescript
// Source: Context7 - /expo/expo haptics
import * as Haptics from 'expo-haptics';

// Subtle feedback for selection
const handleTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// Success feedback for swipe complete
const handleSwipeComplete = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Selection feedback for card change
const handleCardChange = () => {
  Haptics.selectionAsync();
};
```

### Anti-Patterns to Avoid

- **Using Animated API instead of Reanimated:** The legacy `Animated` API runs on JS thread, causing jank during heavy operations
- **Using PanResponder instead of Gesture Handler:** Older API with less responsive touch handling
- **Running haptics on every frame:** Only trigger haptics on discrete events (tap, swipe complete), not during drag
- **Hardcoded screen dimensions:** Use `Dimensions.get('window')` or `useWindowDimensions()` hook
- **Forgetting 'worklet' directive:** All gesture callbacks must include `'worklet';` to run on UI thread

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gesture detection | Custom touch event handlers | `react-native-gesture-handler` | Edge cases (multi-touch, velocity calculation, gesture cancellation) are complex |
| Physics-based animations | Custom easing functions | `withSpring`, `withDecay` from Reanimated | Native physics simulation is more realistic and performant |
| Haptic patterns | Platform-specific vibration code | `expo-haptics` | Cross-platform abstraction; handles iOS Taptic Engine and Android Vibrator |

**Key insight:** Custom gesture/animation implementations almost always have subtle bugs (dropped touches, incorrect velocity, edge-case jank). The existing libraries have been battle-tested across millions of devices.

## Common Pitfalls

### Pitfall 1: Jank During Swipe

**What goes wrong:** Animations stutter or drop frames during card swipe

**Why it happens:** Animation logic running on JavaScript thread instead of UI thread

**How to avoid:** Always use `react-native-reanimated` with worklets for gesture-driven animations. Never use `Animated.View` from core React Native for swipe interactions.

**Warning signs:** Frame rate drops below 60fps, card "lags" behind finger

### Pitfall 2: Card Snaps Back Instead of Flying Off

**What goes wrong:** Card returns to center even after strong swipe

**Why it happens:** Not checking gesture velocity in `onEnd` callback, only checking translation

**How to avoid:** Combine both translation distance AND velocity for swipe decision:
```typescript
const swipedOffRight = event.translationX > SWIPE_THRESHOLD || event.velocityX > 800;
```

**Warning signs:** Users have to swipe very slowly and far to dismiss card

### Pitfall 3: Next Card "Pops" In Instead of Scaling Smoothly

**What goes wrong:** Background card appears abruptly instead of smoothly growing

**Why it happens:** Not tying next card animation to active card's translation value

**How to avoid:** Pass `translateX` shared value to next card and use `interpolate` for scale/opacity

**Warning signs:** Blink effect between card transitions

### Pitfall 4: Haptics Not Working

**What goes wrong:** Haptic feedback does nothing on device

**Why it happens:** Missing `expo-haptics` installation; not supported on all devices/emulators

**How to avoid:** Test on physical device; add try-catch for haptic calls (they can throw)

**Warning signs:** No error, but no vibration

### Pitfall 5: Worklets Not Running on UI Thread

**What goes wrong:** Gesture callbacks still cause jank

**Why it happens:** Missing `'worklet';` directive at top of callback functions

**How to avoid:** Always start gesture callbacks with `'worklet';`

**Warning signs:** Console warnings about "worklet not found"

## Code Examples

### Complete Swipeable Card Component Structure

```typescript
// Source: Synthesized from Context7 patterns and existing SwipeableStack.tsx
import { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolate, Extrapolation } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const VELOCITY_THRESHOLD = 800;

export function useCardSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = context.value.x + event.translationX;
    })
    .onEnd((event) => {
      'worklet';
      const swipedRight = event.translationX > SWIPE_THRESHOLD || event.velocityX > VELOCITY_THRESHOLD;
      const swipedLeft = event.translationX < -SWIPE_THRESHOLD || event.velocityX < -VELOCITY_THRESHOLD;

      if (swipedRight) {
        translateX.value = withSpring(SCREEN_WIDTH * 2);
        runOnJS(onSwipeRight)();
      } else if (swipedLeft) {
        translateX.value = withSpring(-SCREEN_WIDTH * 2);
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotateZ: `${rotate}deg` }
      ]
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [50, 150], [0, 1], Extrapolation.CLAMP)
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-150, -50], [1, 0], Extrapolation.CLAMP)
  }));

  const reset = () => {
    translateX.value = 0;
  };

  return {
    panGesture,
    cardStyle,
    likeOpacity,
    nopeOpacity,
    translateX,
    reset
  };
}
```

### Haptic Feedback Hook

```typescript
// Source: Based on expo-haptics documentation
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function useHapticFeedback() {
  const impact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(style).catch(() => {
        // Silently fail on unsupported devices
      });
    }
  };

  const selection = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const notification = (type: Haptics.NotificationFeedbackType) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(type).catch(() => {});
    }
  };

  return { impact, selection, notification };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PanResponder + Animated API | Gesture Handler + Reanimated 4 | ~2021 | UI thread execution = consistent 60fps |
| useAnimatedGestureHandler | Gesture.Pan() API | Reanimated 3 (2023) | Cleaner hook-based API |
| Custom haptic modules | expo-haptics | 2020+ | Cross-platform abstraction |

**Deprecated/outdated:**
- **PanResponder:** Still works but less responsive than Gesture Handler
- **Animated.View (core):** Use Reanimated's `Animated.View` for gesture-driven animations
- **react-native-deck-swiper:** Unmaintained, customization limits

## Open Questions

1. **Card infinite loop behavior**
   - What we know: Current `SwipeableStack.tsx` uses modulo for infinite cycling
   - What's unclear: Should this behavior be preserved or changed to finite list?
   - Recommendation: Preserve infinite cycling for exploration UX

2. **Haptic intensity levels**
   - What we know: iOS has Light/Medium/Heavy/Rigid/Soft impacts
   - What's unclear: Which intensity is appropriate for each interaction type
   - Recommendation: Test on physical device; use Light for tap, Medium for swipe

3. **Card stack depth**
   - What we know: Current implementation shows 2 cards
   - What's unclear: Should more background cards be visible for depth perception?
   - Recommendation: Start with 2 cards; add more if needed for visual depth

## Sources

### Primary (HIGH confidence)
- `/software-mansion/react-native-reanimated/4.1.5` - Gesture handler integration, Pan gesture, withSpring, worklets
- `/expo/expo` - expo-haptics API (impactAsync, notificationAsync, selectionAsync)

### Secondary (MEDIUM confidence)
- [Engineering Tinder-Style Swipe Interfaces in React Native (Vinova, 2025)](https://vinova.sg/engineering-tinder-style-swipe-interfaces-in-react-native/) - Comprehensive implementation patterns
- [How to Create a Tinder-Like Card Stack (Stormotion, 2023)](https://stormotion.io/blog/how-to-create-a-tinder-like-card-stack-using-react-native/) - Step-by-step guide
- [React Native Card Swipe With Reanimated (YouTube)](https://www.youtube.com/watch?v=-JoQ5Y_unl8) - Video walkthrough
- [How to Create Fluid Animations with Reanimated v4 (freeCodeCamp, 2025)](https://www.freecodecamp.org/news/how-to-create-fluid-animations-with-react-native-reanimated-v4/) - Reanimated 4 patterns
- [Expo Haptics Documentation](https://docs.expo.dev/versions/latest/sdk/haptics/) - Official API reference

### Tertiary (LOW confidence)
- [Enhancing React Native App with Haptics (YouTube, 2021)](https://www.youtube.com/watch?v=hDGASxkKEXE) - Older haptic patterns, may be outdated

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are installed and documented in Context7
- Architecture: HIGH - Existing SwipeableStack.tsx demonstrates correct patterns
- Pitfalls: HIGH - Well-documented across multiple sources from 2023-2025

**Research date:** 2026-01-23
**Valid until:** 2026-03-01 (React Native ecosystem moves fast; validate before major implementation)

## Current Codebase Assets

The following existing components should be enhanced rather than replaced:

1. **`/mobile/src/components/SwipeableStack.tsx`** - Already implements:
   - `Gesture.Pan()` with translation tracking
   - Rotation interpolation
   - Like/Nope overlay opacity
   - Next card scale animation
   - Infinite card cycling via modulo

2. **`/mobile/src/components/ZodiacCard.tsx`** - Already implements:
   - Card visual design with gradients and blur
   - Responsive styling with NatWind

3. **Missing:**
   - `expo-haptics` installation
   - Tap feedback animations on cards
   - Haptic feedback on gestures
