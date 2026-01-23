import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    runOnJS,
    Extrapolation,
    SharedValue
} from 'react-native-reanimated';
import { ZodiacSign } from '../lib/zodiac';
import { ZodiacCard } from './ZodiacCard';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useTheme } from '../hooks/useTheme';
import { SWIPE_CONFIG } from '../lib/animations';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SwipeableStackProps {
    signs: ZodiacSign[];
    onSwipeComplete?: (sign: ZodiacSign) => void;
    onSelect?: (sign: ZodiacSign) => void;
}

export function SwipeableStack({ signs, onSwipeComplete, onSelect }: SwipeableStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const translationX = useSharedValue(0);
    const contextX = useSharedValue(0);  // Add context for smooth dragging
    const { success, selection } = useHapticFeedback();
    const { theme } = useTheme();

    // Use theme-based animations with fallback to SWIPE_CONFIG
    const animations = theme.animations || SWIPE_CONFIG;
    const springConfig = animations.spring || SWIPE_CONFIG.SPRING_CONFIG;
    const swipeConfig = animations.swipe || {
        maxRotation: SWIPE_CONFIG.MAX_ROTATION,
        scaleAmount: SWIPE_CONFIG.NEXT_CARD_SCALE.max,
        fadeSpeed: SWIPE_CONFIG.NEXT_CARD_OPACITY.max,
    };

    const activeCard = signs[currentIndex % signs.length];
    const nextCard = signs[(currentIndex + 1) % signs.length];

    const handleSwipeComplete = (direction: 'left' | 'right') => {
        // 右スワイプ（選択）時は成功フィードバック
        if (direction === 'right') {
            success();
            if (onSelect) {
                onSelect(activeCard);
            }
        } else {
            // 左スワイプ（スキップ）時は選択フィードバック
            selection();
        }
        if (onSwipeComplete) {
            onSwipeComplete(activeCard);
        }
        setCurrentIndex((prev) => prev + 1);
        translationX.value = 0;
    };

    const pan = Gesture.Pan()
        .onStart(() => {
            'worklet';
            // Initialize context to prevent jumps during dragging
            contextX.value = translationX.value;
        })
        .onUpdate((event) => {
            'worklet';
            // Calculate relative position from context
            translationX.value = contextX.value + event.translationX;
        })
        .onEnd((event) => {
            'worklet';
            const isSwipeRight =
                event.translationX > SWIPE_CONFIG.THRESHOLD ||
                event.velocityX > SWIPE_CONFIG.VELOCITY_THRESHOLD;
            const isSwipeLeft =
                event.translationX < -SWIPE_CONFIG.THRESHOLD ||
                event.velocityX < -SWIPE_CONFIG.VELOCITY_THRESHOLD;

            if (isSwipeRight) {
                // Swipe Right - fly off to right (use theme spring config)
                translationX.value = withSpring(
                    SCREEN_WIDTH * 2,
                    springConfig,
                    () => {
                        runOnJS(handleSwipeComplete)('right');
                    }
                );
            } else if (isSwipeLeft) {
                // Swipe Left - fly off to left (use theme spring config)
                translationX.value = withSpring(
                    -SCREEN_WIDTH * 2,
                    springConfig,
                    () => {
                        runOnJS(handleSwipeComplete)('left');
                    }
                );
            } else {
                // Reset - spring back to center (use theme spring config)
                translationX.value = withSpring(0, springConfig);
            }
        });

    const activeCardStyle = useAnimatedStyle(() => {
        // Rotation interpolation based on screen width (use theme swipe config)
        const rotate = interpolate(
            translationX.value,
            [-SWIPE_CONFIG.ANIMATION_DISTANCE, 0, SWIPE_CONFIG.ANIMATION_DISTANCE],
            [-swipeConfig.maxRotation, 0, swipeConfig.maxRotation],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { translateX: translationX.value },
                { rotate: `${rotate}deg` }
            ]
        };
    });

    const nextCardStyle = useAnimatedStyle(() => {
        // Scale based on swipe distance (use theme swipe config)
        const scale = interpolate(
            Math.abs(translationX.value),
            [0, SWIPE_CONFIG.ANIMATION_DISTANCE / 2],  // Adjusted to react faster
            [1, swipeConfig.scaleAmount],  // Use theme scaleAmount
            Extrapolation.CLAMP
        );

        // Opacity based on swipe distance (use theme swipe config)
        const opacity = interpolate(
            Math.abs(translationX.value),
            [0, SWIPE_CONFIG.ANIMATION_DISTANCE / 4],  // Fade in faster
            [0, swipeConfig.fadeSpeed],  // Use theme fadeSpeed
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { scale }
            ],
            opacity: opacity
        };
    });

    const likeOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translationX.value, [50, 150], [0, 1], Extrapolation.CLAMP)
    }));

    const nopeOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translationX.value, [-150, -50], [1, 0], Extrapolation.CLAMP)
    }));

    return (
        <View className="relative w-full flex-1 items-center justify-center bg-slate-950">
            {/* Next Card (Background) */}
            <Animated.View className="absolute w-full max-w-sm h-[500px]" style={nextCardStyle} key={`next-${nextCard.id}`}>
                <ZodiacCard sign={nextCard} />
            </Animated.View>

            {/* Active Card (Foreground) */}
            <GestureDetector gesture={pan}>
                <Animated.View className="absolute w-full max-w-sm h-[500px]" style={activeCardStyle} key={`active-${activeCard.id}`}>
                    <ZodiacCard sign={activeCard} active />

                    {/* Swipe Indicators */}
                    <Animated.View
                        style={[likeOpacityStyle, { transform: [{ rotate: '-12deg' }] }]}
                        className="absolute top-8 left-8 border-4 border-emerald-400 rounded-lg px-4 py-2 bg-black/20"
                    >
                        <Text className="text-emerald-400 text-3xl font-bold uppercase tracking-widest shadow-black">SELECT</Text>
                    </Animated.View>

                    <Animated.View
                        style={[nopeOpacityStyle, { transform: [{ rotate: '12deg' }] }]}
                        className="absolute top-8 right-8 border-4 border-rose-400 rounded-lg px-4 py-2 bg-black/20"
                    >
                        <Text className="text-rose-400 text-3xl font-bold uppercase tracking-widest shadow-black">NEXT</Text>
                    </Animated.View>
                </Animated.View>
            </GestureDetector>

            {/* Hint Text */}
            <View className="absolute bottom-4 flex-row gap-8 opacity-50">
                <Text className="text-sm text-slate-400 font-mono">← Slide to Skip</Text>
                <Text className="text-sm text-slate-400 font-mono">Slide to Select →</Text>
            </View>
        </View>
    );
}
