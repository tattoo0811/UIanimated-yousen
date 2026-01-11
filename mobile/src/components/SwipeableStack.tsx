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

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeableStackProps {
    signs: ZodiacSign[];
    onSwipeComplete?: (sign: ZodiacSign) => void;
    onSelect?: (sign: ZodiacSign) => void;
}

export function SwipeableStack({ signs, onSwipeComplete, onSelect }: SwipeableStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const translationX = useSharedValue(0);

    const activeCard = signs[currentIndex % signs.length];
    const nextCard = signs[(currentIndex + 1) % signs.length];

    const handleSwipeComplete = (direction: 'left' | 'right') => {
        if (direction === 'right' && onSelect) {
            onSelect(activeCard);
        }
        if (onSwipeComplete) {
            onSwipeComplete(activeCard);
        }
        setCurrentIndex((prev) => prev + 1);
        translationX.value = 0;
    };

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translationX.value = event.translationX;
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                // Swipe Right
                translationX.value = withTiming(SCREEN_WIDTH * 1.5, {}, () => {
                    runOnJS(handleSwipeComplete)('right');
                });
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                // Swipe Left
                translationX.value = withTiming(-SCREEN_WIDTH * 1.5, {}, () => {
                    runOnJS(handleSwipeComplete)('left');
                });
            } else {
                // Reset
                translationX.value = withSpring(0);
            }
        });

    const activeCardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translationX.value,
            [-200, 200],
            [-25, 25],
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
        const scale = interpolate(
            Math.abs(translationX.value),
            [0, SCREEN_WIDTH],
            [0.9, 1],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            Math.abs(translationX.value),
            [0, SCREEN_WIDTH / 2],
            [0.5, 1],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale }],
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
        <View className="relative w-full h-[600px] items-center justify-center">
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
