import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { ZodiacSign } from '@/lib/zodiac';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    runOnJS,
    withSpring
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface ZodiacCardProps {
    sign: ZodiacSign;
    active?: boolean;
    onPress?: () => void;
}

export function ZodiacCard({ sign, active, onPress }: ZodiacCardProps) {
    const scale = useSharedValue(1);
    const { light } = useHapticFeedback();

    const tapGesture = Gesture.Tap()
        .onStart(() => {
            'worklet';
            scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
        })
        .onEnd(() => {
            'worklet';
            scale.value = withSpring(1, { damping: 15, stiffness: 400 });
            if (onPress) {
                runOnJS(onPress)();
            }
            runOnJS(light)();
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const content = (
        <View className="relative w-full h-full rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-sm shadow-black/50">

            {/* Background decoration - simulated as absolute views */}
            <LinearGradient
                colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
                style={zodiacStyles.gradientBg}
            />

            {/* Blobs */}
            <View className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px]" />
            <View className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-600/20 rounded-full blur-[60px]" />


            {/* Content Container with Blur */}
            <BlurView intensity={20} tint="dark" style={zodiacStyles.blurContent}>
                {/* Header */}
                <View className="flex-row justify-between items-start opacity-70">
                    <Text className="text-xs font-mono font-medium tracking-widest uppercase text-white opacity-80">{sign.element}</Text>
                    <Text className="text-xs font-mono font-medium tracking-widest uppercase text-white opacity-80">{sign.dateRange}</Text>
                </View>

                {/* Center Content */}
                <View className="items-center gap-6">
                    <Text className="text-9xl text-white shadow-lg" style={{ textShadowColor: 'rgba(255, 255, 255, 0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 }}>
                        {sign.symbol}
                    </Text>

                    <View className="items-center">
                        <Text className="text-4xl font-light tracking-wider mb-3 text-white">{sign.name}</Text>
                        <View className="flex-row flex-wrap justify-center gap-2 mt-2">
                            {sign.keywords.map(keyword => (
                                <View key={keyword} className="px-3 py-1 bg-white/10 border border-white/10 rounded-full">
                                    <Text className="text-[10px] uppercase tracking-wider text-white/90 font-medium">{keyword}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View className="items-center flex-row justify-center gap-2 pb-2 opacity-90">
                    <Sparkles size={16} color="#f59e0b" />
                    <Text className="font-medium tracking-wide text-amber-500 text-sm">Swipe to Explore</Text>
                </View>
            </BlurView>
        </View>
    );

    // Only enable tap gesture when onPress is provided
    if (onPress) {
        return (
            <GestureDetector gesture={tapGesture}>
                <Animated.View style={animatedStyle} className="w-full h-full">
                    {content}
                </Animated.View>
            </GestureDetector>
        );
    }

    return content;
}

const zodiacStyles = StyleSheet.create({
    gradientBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    blurContent: {
        flex: 1,
        padding: 32,
        justifyContent: 'space-between',
    },
});
