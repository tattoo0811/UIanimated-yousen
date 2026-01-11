import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import clsx from 'clsx';
import { useState } from 'react';

export default function BirthYearScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const gender = params.gender as 'male' | 'female';
    const decade = params.decade as string;
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    // Generate years for the selected decade
    const startYear = parseInt(decade);
    const years = Array.from({ length: 10 }, (_, i) => startYear + i);

    const handleYearSelect = (year: number) => {
        setSelectedYear(year.toString());
        // Navigate immediately on selection
        router.push({
            pathname: '/birth-month',
            params: { gender, year: year.toString() }
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
                <Text className="text-white text-lg font-bold">生まれた年</Text>
                <View className="w-10" />
            </View>

            {/* Progress */}
            <View className="px-6 py-4 flex-row gap-2">
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                <View className="items-center mb-8">
                    <Text className="text-3xl font-extrabold text-white text-center mb-3">
                        何年に{'\n'}生まれましたか？
                    </Text>
                    <Text className="text-white/60 text-sm text-center leading-relaxed">
                        {decade}年代から選んでください
                    </Text>
                </View>

                <View className="flex-row flex-wrap gap-3">
                    {years.map((year) => (
                        <TouchableOpacity
                            key={year}
                            activeOpacity={0.9}
                            onPress={() => handleYearSelect(year)}
                            testID={`year-${year}`}
                            className={clsx(
                                "items-center justify-center p-4 rounded-xl border-2 bg-surface-dark",
                                "w-[calc(50%-6px)]",
                                selectedYear === year.toString() ? "border-primary bg-primary/10" : "border-transparent"
                            )}
                            style={{ width: '48%' }}
                        >
                            <Text className={clsx(
                                "text-xl font-bold",
                                selectedYear === year.toString() ? "text-primary" : "text-white"
                            )}>
                                {year}年
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
