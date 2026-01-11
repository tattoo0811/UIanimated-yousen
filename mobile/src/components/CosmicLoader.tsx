import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    cancelAnimation
} from 'react-native-reanimated';

export function CosmicLoader() {
    const orbScale = useSharedValue(1);
    const orbOpacity = useSharedValue(0.5);
    const rotation = useSharedValue(0);
    const textOpacity = useSharedValue(0.4);

    useEffect(() => {
        orbScale.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        orbOpacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 1500 }),
                withTiming(0.5, { duration: 1500 })
            ),
            -1,
            true
        );

        rotation.value = withRepeat(
            withTiming(360, { duration: 10000, easing: Easing.linear }),
            -1,
            false
        );

        textOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.4, { duration: 1000 })
            ),
            -1,
            true
        );

        return () => {
            cancelAnimation(orbScale);
            cancelAnimation(orbOpacity);
            cancelAnimation(rotation);
            cancelAnimation(textOpacity);
        };
    }, []);

    const orbStyle = useAnimatedStyle(() => ({
        transform: [{ scale: orbScale.value }],
        opacity: orbOpacity.value
    }));

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }]
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value
    }));

    return (
        <View className="flex-1 items-center justify-center p-8 space-y-8">
            <View className="relative items-center justify-center w-32 h-32">
                {/* Central Glowing Orb */}
                <Animated.View
                    style={[orbStyle]}
                    className="absolute w-12 h-12 bg-violet-500 rounded-full blur-lg"
                />

                {/* Rotating Rings */}
                {[0, 1, 2].map((i) => (
                    <Ring key={i} index={i} />
                ))}

                {/* Orbiting Stars */}
                <Animated.View style={[containerStyle]} className="absolute w-full h-full">
                    <View className="absolute top-0 left-1/2 w-2 h-2 bg-amber-500 rounded-full shadow-lg shadow-amber-500" />
                </Animated.View>

            </View>

            <Animated.Text style={textStyle} className="text-white font-light tracking-[0.2em] text-sm uppercase mt-8">
                Consulting the Stars...
            </Animated.Text>
        </View>
    );
}

function Ring({ index }: { index: number }) {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 10000 + index * 5000, easing: Easing.linear }),
            -1,
            false
        );

        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotation.value}deg` },
            { scale: scale.value }
        ],
        width: `${(index + 2) * 30}%`,
        height: `${(index + 2) * 30}%`
    }));

    return (
        <Animated.View
            style={style}
            className="absolute border border-violet-500/30 rounded-full"
        />
    );
}
