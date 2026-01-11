import { View, Text, ScrollView } from 'react-native';
import type { SanmeigakuInsenChart } from '@/src/types';
import { Calendar, TrendingUp } from 'lucide-react-native';

type Props = {
    insen: SanmeigakuInsenChart;
    currentDate?: Date;
};

export default function FortuneCard({ insen, currentDate = new Date() }: Props) {
    // Simple fortune calculation based on current date and day pillar
    const getDailyFortune = () => {
        // This is a simplified version - in production, you'd calculate based on:
        // - Current day's stem/branch
        // - Relationship with user's day pillar
        // - Phase relations
        const dayOfWeek = currentDate.getDay();
        const fortunes = [
            { level: '大吉', color: '#10b981', advice: '新しいことを始めるのに最適な日です。' },
            { level: '吉', color: '#3b82f6', advice: '順調に物事が進む日です。' },
            { level: '中吉', color: '#8b5cf6', advice: '落ち着いて行動すれば良い結果が得られます。' },
            { level: '小吉', color: '#f59e0b', advice: '小さな幸運がある日です。' },
            { level: '末吉', color: '#f97316', advice: '慎重に行動しましょう。' },
        ];
        return fortunes[dayOfWeek % fortunes.length];
    };

    const fortune = getDailyFortune();

    return (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="mb-6">
                <View className="flex-row items-center gap-3 mb-2">
                    <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                        <Calendar color="#e879f9" size={24} />
                    </View>
                    <View>
                        <Text className="text-white text-2xl font-bold">今日の運気</Text>
                        <Text className="text-white/50 text-sm">
                            {currentDate.getMonth() + 1}月{currentDate.getDate()}日
                        </Text>
                    </View>
                </View>
            </View>

            {/* Fortune Level */}
            <View className="bg-surface-dark rounded-2xl p-6 mb-6 items-center">
                <View
                    className="w-24 h-24 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: fortune.color + '20' }}
                >
                    <Text className="text-4xl font-bold" style={{ color: fortune.color }}>
                        {fortune.level}
                    </Text>
                </View>
                <Text className="text-white text-base text-center leading-relaxed">
                    {fortune.advice}
                </Text>
            </View>

            {/* Energy Level */}
            <View className="bg-white/5 rounded-xl p-4 mb-6">
                <View className="flex-row items-center gap-2 mb-3">
                    <TrendingUp color="#e879f9" size={20} />
                    <Text className="text-white font-bold">エネルギーレベル</Text>
                </View>
                <View className="gap-3">
                    {insen.junishiUn.map((ju, i) => (
                        <View key={i}>
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-white/70 text-sm">{ju.pillar}柱: {ju.state}</Text>
                            </View>
                            <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${Math.random() * 100}%` }}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Lucky Elements */}
            <View className="bg-white/5 rounded-xl p-4 mb-8">
                <Text className="text-white font-bold mb-3">ラッキーアイテム</Text>
                <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                        <View className="w-3 h-3 rounded-full bg-primary" />
                        <Text className="text-white/80 text-sm">ラッキーカラー: 紫</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <View className="w-3 h-3 rounded-full bg-secondary" />
                        <Text className="text-white/80 text-sm">ラッキー方位: 北</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <View className="w-3 h-3 rounded-full bg-primary" />
                        <Text className="text-white/80 text-sm">ラッキーナンバー: 7</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
