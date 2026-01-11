import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import clsx from 'clsx';
import { useState } from 'react';

const DECADES = [
    { value: '1920', label: '1920〜' },
    { value: '1930', label: '1930〜' },
    { value: '1940', label: '1940〜' },
    { value: '1950', label: '1950〜' },
    { value: '1960', label: '1960〜' },
    { value: '1970', label: '1970〜' },
    { value: '1980', label: '1980〜' },
    { value: '1990', label: '1990〜' },
    { value: '2000', label: '2000〜' },
    { value: '2010', label: '2010〜' },
    { value: '2020', label: '2020〜' },
    { value: '2030', label: '2030〜' },
];

const DEFAULT_DECADE_INDEX = 7; // 1990s

export default function BirthDecadeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const gender = params.gender as 'male' | 'female';
    const [selectedDecade, setSelectedDecade] = useState<string | null>(null);
    const scrollViewRef = useState<ScrollView | null>(null);

    const handleDecadeSelect = (decade: string) => {
        setSelectedDecade(decade);
        // Navigate immediately on selection
        router.push({
            pathname: '/birth-year',
            params: { gender, decade }
        });
    };

    return (
        <View className="flex-1 bg-background-dark">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center px-4 py-4 justify-between bg-background-dark">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-surface-dark items-center justify-center"
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">生まれた年代</Text>
                <View className="w-10" />
            </View>

            {/* Progress */}
            <View className="px-6 py-4 flex-row gap-2">
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                <View className="items-center mb-8">
                    <Text className="text-3xl font-extrabold text-white text-center mb-3">
                        生まれた年代を{'\n'}選んでください
                    </Text>
                    <Text className="text-white/60 text-sm text-center leading-relaxed">
                        まずは大まかな年代から選びます
                    </Text>
                </View>

                <View className="gap-4">
                    {DECADES.map((decade) => (
                        <TouchableOpacity
                            key={decade.value}
                            activeOpacity={0.9}
                            onPress={() => handleDecadeSelect(decade.value)}
                            testID={`decade-${decade.value}`}
                            className={clsx(
                                "flex-row items-center justify-center p-6 rounded-xl border-2 bg-surface-dark",
                                selectedDecade === decade.value ? "border-primary bg-primary/10" : "border-transparent"
                            )}
                        >
                            <Text className={clsx(
                                "text-2xl font-bold",
                                selectedDecade === decade.value ? "text-primary" : "text-white"
                            )}>
                                {decade.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
