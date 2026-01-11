import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import clsx from 'clsx';
import { useState } from 'react';

// Helper function to get days in month
const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
};

export default function BirthDayScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const gender = params.gender as 'male' | 'female';
    const year = parseInt(params.year as string);
    const month = parseInt(params.month as string);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const daysInMonth = getDaysInMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleDaySelect = (day: number) => {
        setSelectedDay(day);
        // Create full datetime with default time 12:00
        const fullDateTime = new Date(year, month - 1, day, 12, 0, 0);

        router.push({
            pathname: '/loading',
            params: {
                birthDate: fullDateTime.toISOString(),
                gender: gender,
                longitude: '135' // Default: Japan Standard Time meridian
            }
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
                <Text className="text-white text-lg font-bold">生まれた日</Text>
                <View className="w-10" />
            </View>

            {/* Progress */}
            <View className="px-6 py-4 flex-row gap-2">
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-primary" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                <View className="items-center mb-8">
                    <Text className="text-3xl font-extrabold text-white text-center mb-3">
                        何日に{'\n'}生まれましたか？
                    </Text>
                    <Text className="text-white/60 text-sm text-center leading-relaxed">
                        {year}年{month}月の日を選んでください
                    </Text>
                </View>

                <View className="flex-row flex-wrap gap-2">
                    {days.map((day) => (
                        <TouchableOpacity
                            key={day}
                            activeOpacity={0.9}
                            onPress={() => handleDaySelect(day)}
                            testID={`day-${day}`}
                            className={clsx(
                                "items-center justify-center p-3 rounded-xl border-2 bg-surface-dark",
                                "w-[calc(14.28%-7px)]",
                                selectedDay === day ? "border-primary bg-primary/10" : "border-transparent"
                            )}
                            style={{ width: '13%' }}
                        >
                            <Text className={clsx(
                                "text-base font-bold",
                                selectedDay === day ? "text-primary" : "text-white"
                            )}>
                                {day}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Info Box */}
                <View className="bg-primary/10 border border-primary/30 rounded-xl p-4 mt-6">
                    <Text className="text-primary text-xs leading-relaxed">
                        💡 出生時刻は12:00（正午）で計算されます。{'\n'}
                        より正確な結果を得るには、母子手帳などで確認してください。
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
