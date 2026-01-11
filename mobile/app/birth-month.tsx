import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import clsx from 'clsx';
import { useState } from 'react';

const MONTHS = [
    { value: 1, label: '1月' },
    { value: 2, label: '2月' },
    { value: 3, label: '3月' },
    { value: 4, label: '4月' },
    { value: 5, label: '5月' },
    { value: 6, label: '6月' },
    { value: 7, label: '7月' },
    { value: 8, label: '8月' },
    { value: 9, label: '9月' },
    { value: 10, label: '10月' },
    { value: 11, label: '11月' },
    { value: 12, label: '12月' },
];

export default function BirthMonthScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const gender = params.gender as 'male' | 'female';
    const year = params.year as string;
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

    const handleMonthSelect = (month: number) => {
        setSelectedMonth(month);
        // Navigate immediately on selection
        router.push({
            pathname: '/birth-day',
            params: { gender, year, month: month.toString() }
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
                <Text className="text-white text-lg font-bold">生まれた月</Text>
                <View className="w-10" />
            </View>

            {/* Progress */}
            <View className="px-6 py-4 flex-row gap-2">
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                <View className="items-center mb-8">
                    <Text className="text-3xl font-extrabold text-white text-center mb-3">
                        何月に{'\n'}生まれましたか？
                    </Text>
                    <Text className="text-white/60 text-sm text-center leading-relaxed">
                        {year}年の月を選んでください
                    </Text>
                </View>

                <View className="flex-row flex-wrap gap-3">
                    {MONTHS.map((month) => (
                        <TouchableOpacity
                            key={month.value}
                            activeOpacity={0.9}
                            onPress={() => handleMonthSelect(month.value)}
                            testID={`month-${month.value}`}
                            className={clsx(
                                "items-center justify-center p-4 rounded-xl border-2 bg-surface-dark",
                                "w-[calc(33.33%-8px)]",
                                selectedMonth === month.value ? "border-primary bg-primary/10" : "border-transparent"
                            )}
                            style={{ width: '31%' }}
                        >
                            <Text className={clsx(
                                "text-lg font-bold",
                                selectedMonth === month.value ? "text-primary" : "text-white"
                            )}>
                                {month.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
