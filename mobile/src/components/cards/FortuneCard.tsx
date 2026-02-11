import { View, Text, ScrollView } from 'react-native';
import type { SanmeigakuInsenChart, FourPillars } from '@/src/types';
import { Calendar, TrendingUp, Compass, Sparkles } from 'lucide-react-native';
// TODO: Restore imports when lib files are available
// import { getDailyFortune } from '@/src/lib/logic/dailyFortune';
// import { calculateBaZi } from '@/src/lib/logic/bazi';

// Temporary stub implementations
const calculateBaZi = (birthDate: Date) => {
    return null;
};

const getDailyFortune = (bazi: any, currentDate: Date) => {
    return {
        level: '中吉' as const,
        color: '#8b5cf6',
        advice: '生年月日を入力すると、より正確な運勢が表示されます。',
        dailyGanZhi: { stem: '?', branch: '?' },
        dailyTenStar: '?',
        dailyTwelveStar: { name: '?', score: 0 },
        specialConditions: [],
        luckyDirection: '?',
        date: currentDate.toISOString().split('T')[0]
    };
};

type Props = {
    insen: SanmeigakuInsenChart;
    birthDate?: Date; // 生年月日（四柱推命計算用）
    currentDate?: Date;
};

export default function FortuneCard({ insen, birthDate, currentDate = new Date() }: Props) {
    // 生年月日から四柱推命を計算（なければinsenから推測）
    let userBazi: FourPillars | null = null;
    
    if (birthDate) {
        userBazi = calculateBaZi(birthDate);
    } else if (insen?.pillars) {
        // insenから四柱推命を再構築（簡易版）
        // 注意: 時柱は推測できないため、日柱のみを使用
        const dayStemIdx = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(insen.meta.dayStem);
        const dayBranchIdx = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(insen.pillars.day.branch);
        
        if (dayStemIdx >= 0 && dayBranchIdx >= 0) {
            // 簡易的な四柱推命オブジェクトを作成（日柱のみ使用）
            userBazi = {
                year: {
                    stem: 1,
                    branch: 1,
                    stemStr: insen.pillars.year.stem,
                    branchStr: insen.pillars.year.branch,
                    name: `${insen.pillars.year.stem}${insen.pillars.year.branch}`,
                    id: 1,
                    hiddenStems: []
                },
                month: {
                    stem: 1,
                    branch: 1,
                    stemStr: insen.pillars.month.stem,
                    branchStr: insen.pillars.month.branch,
                    name: `${insen.pillars.month.stem}${insen.pillars.month.branch}`,
                    id: 1,
                    hiddenStems: []
                },
                day: {
                    stem: dayStemIdx + 1,
                    branch: dayBranchIdx + 1,
                    stemStr: insen.pillars.day.stem,
                    branchStr: insen.pillars.day.branch,
                    name: `${insen.pillars.day.stem}${insen.pillars.day.branch}`,
                    id: 1,
                    hiddenStems: []
                },
                hour: {
                    stem: 1,
                    branch: 1,
                    stemStr: '甲',
                    branchStr: '子',
                    name: '甲子',
                    id: 1,
                    hiddenStems: []
                }
            };
        }
    }

    // 四柱推命が取得できない場合は簡易版を使用
    const fortune = userBazi 
        ? getDailyFortune(userBazi, currentDate)
        : {
            level: '中吉' as const,
            color: '#8b5cf6',
            advice: '生年月日を入力すると、より正確な運勢が表示されます。',
            dailyGanZhi: { stem: '?', branch: '?' },
            dailyTenStar: '?',
            dailyTwelveStar: { name: '?', score: 0 },
            specialConditions: [],
            luckyDirection: '?',
            date: currentDate.toISOString().split('T')[0]
        };

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

            {/* Daily GanZhi Info */}
            {userBazi && (
                <View className="bg-white/5 rounded-xl p-4 mb-6">
                    <Text className="text-white font-bold mb-3">今日の干支</Text>
                    <View className="gap-2">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-white/80 text-sm">
                                日干支: {fortune.dailyGanZhi.stem}{fortune.dailyGanZhi.branch}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-white/80 text-sm">
                                十大主星: {fortune.dailyTenStar}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-white/80 text-sm">
                                十二大従星: {fortune.dailyTwelveStar.name} ({fortune.dailyTwelveStar.score}点)
                            </Text>
                        </View>
                        {fortune.specialConditions.length > 0 && (
                            <View className="gap-1 mt-2">
                                {fortune.specialConditions.map((condition, idx) => (
                                    <Text key={idx} className="text-yellow-400 text-sm">
                                        ⚠️ {condition}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Lucky Elements */}
            <View className="bg-white/5 rounded-xl p-4 mb-6">
                <View className="flex-row items-center gap-2 mb-3">
                    <Compass color="#e879f9" size={20} />
                    <Text className="text-white font-bold">ラッキー情報</Text>
                </View>
                <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                        <View className="w-3 h-3 rounded-full bg-primary" />
                        <Text className="text-white/80 text-sm">
                            ラッキー方位: {fortune.luckyDirection}
                        </Text>
                    </View>
                    {userBazi && (
                        <View className="flex-row items-center gap-2">
                            <View className="w-3 h-3 rounded-full bg-secondary" />
                            <Text className="text-white/80 text-sm">
                                今日の干支: {fortune.dailyGanZhi.stem}{fortune.dailyGanZhi.branch}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 開運アドバイス（五行バランスに基づく） */}
            {userBazi && fortune.fiveElementsAdvice && fortune.fiveElementsAdvice.length > 0 && (
                <View className="bg-white/5 rounded-xl p-4 mb-8">
                    <View className="flex-row items-center gap-2 mb-3">
                        <Sparkles color="#e879f9" size={20} />
                        <Text className="text-white font-bold">開運アドバイス</Text>
                    </View>
                    <View className="gap-3">
                        {fortune.fiveElementsAdvice.map((advice, idx) => (
                            <View key={idx} className="flex-row gap-3">
                                <View className="w-2 h-2 rounded-full bg-primary mt-2" />
                                <Text className="text-white/90 text-sm flex-1 leading-relaxed">
                                    {advice}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}
