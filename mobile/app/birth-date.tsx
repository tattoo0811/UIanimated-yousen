import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

export default function BirthDateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const gender = params.gender as string;

    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(1990);
    const [month, setMonth] = useState(1);
    const [day, setDay] = useState(1);

    // Generate arrays for pickers
    const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => 1920 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };
    const days = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1);

    const handleNext = () => {
        const birthDate = new Date(year, month - 1, day);
        router.push({
            pathname: '/loading',
            params: {
                birthDate: birthDate.toISOString(),
                gender,
            },
        });
    };

    return (
        <View className="flex-1 bg-background-dark">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center px-6 pt-16 pb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white text-2xl font-bold">生年月日</Text>
                    <Text className="text-white/50 text-sm mt-1">あなたの生まれた日を選択してください</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Instruction */}
                <View className="bg-white/5 rounded-2xl p-6 mb-6">
                    <Text className="text-white text-center text-base leading-relaxed">
                        生年月日は運命を読み解く{'\n'}最も重要な情報です
                    </Text>
                </View>

                {/* Date Pickers */}
                <View className="bg-surface-dark rounded-3xl overflow-hidden mb-6">
                    {/* Year Picker */}
                    <View className="border-b border-white/10">
                        <Text className="text-white/50 text-xs font-bold px-6 pt-4 pb-2">年</Text>
                        <Picker
                            selectedValue={year}
                            onValueChange={(value) => setYear(value)}
                            style={{
                                color: '#fff',
                                backgroundColor: 'transparent',
                            }}
                            itemStyle={{
                                color: '#fff',
                                fontSize: 20,
                                height: 120,
                            }}
                        >
                            {years.map((y) => (
                                <Picker.Item key={y} label={`${y}年`} value={y} />
                            ))}
                        </Picker>
                    </View>

                    {/* Month Picker */}
                    <View className="border-b border-white/10">
                        <Text className="text-white/50 text-xs font-bold px-6 pt-4 pb-2">月</Text>
                        <Picker
                            selectedValue={month}
                            onValueChange={(value) => {
                                setMonth(value);
                                // Adjust day if needed
                                const maxDay = getDaysInMonth(year, value);
                                if (day > maxDay) {
                                    setDay(maxDay);
                                }
                            }}
                            style={{
                                color: '#fff',
                                backgroundColor: 'transparent',
                            }}
                            itemStyle={{
                                color: '#fff',
                                fontSize: 20,
                                height: 120,
                            }}
                        >
                            {months.map((m) => (
                                <Picker.Item key={m} label={`${m}月`} value={m} />
                            ))}
                        </Picker>
                    </View>

                    {/* Day Picker */}
                    <View>
                        <Text className="text-white/50 text-xs font-bold px-6 pt-4 pb-2">日</Text>
                        <Picker
                            selectedValue={day}
                            onValueChange={(value) => setDay(value)}
                            style={{
                                color: '#fff',
                                backgroundColor: 'transparent',
                            }}
                            itemStyle={{
                                color: '#fff',
                                fontSize: 20,
                                height: 120,
                            }}
                        >
                            {days.map((d) => (
                                <Picker.Item key={d} label={`${d}日`} value={d} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Selected Date Display */}
                <View className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-6">
                    <Text className="text-white/50 text-sm text-center mb-2">選択された生年月日</Text>
                    <Text className="text-white text-2xl font-bold text-center">
                        {year}年 {month}月 {day}日
                    </Text>
                </View>

                {/* Gender Display */}
                <View className="bg-white/5 rounded-xl p-4 mb-6">
                    <Text className="text-white/50 text-sm text-center">
                        性別: {gender === 'male' ? '男性' : '女性'}
                    </Text>
                </View>
            </ScrollView>

            {/* Next Button */}
            <View className="px-6 pb-8">
                <TouchableOpacity
                    onPress={handleNext}
                    className="bg-primary rounded-2xl py-4 items-center"
                >
                    <Text className="text-white font-bold text-lg">診断を開始</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
