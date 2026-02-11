import { View, Text, ScrollView } from 'react-native';
import type { SanmeigakuInsenChart, FourPillars } from '@/src/types';
import { Calendar, TrendingUp, TrendingDown, Minus, Sparkles, AlertCircle } from 'lucide-react-native';
// TODO: Restore imports when lib files are available
// import { getWeeklyFortune } from '@/src/lib/logic/weeklyFortune';
// import { calculateBaZi } from '@/src/lib/logic/bazi';

// Temporary stub implementations
const calculateBaZi = (birthDate: Date) => {
    return null;
};

const getWeeklyFortune = (bazi: any, currentDate: Date) => {
    return null;
};

type Props = {
    insen: SanmeigakuInsenChart;
    birthDate?: Date; // 生年月日（四柱推命計算用）
    currentDate?: Date;
};

// 運勢レベルの色
const LEVEL_COLORS: Record<'大吉' | '吉' | '中吉' | '小吉' | '末吉', string> = {
    '大吉': '#10b981',
    '吉': '#3b82f6',
    '中吉': '#8b5cf6',
    '小吉': '#f59e0b',
    '末吉': '#f97316'
};

// 曜日のラベル
const WEEKDAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

export default function WeeklyFortuneCard({ insen, birthDate, currentDate = new Date() }: Props) {
    // 生年月日から四柱推命を計算（なければinsenから推測）
    let userBazi: FourPillars | null = null;
    
    if (birthDate) {
        userBazi = calculateBaZi(birthDate);
    } else if (insen?.pillars) {
        // insenから四柱推命を再構築（簡易版）
        const dayStemIdx = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(insen.meta.dayStem);
        const dayBranchIdx = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(insen.pillars.day.branch);
        
        if (dayStemIdx >= 0 && dayBranchIdx >= 0) {
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
    const weeklyFortune = userBazi 
        ? getWeeklyFortune(userBazi, currentDate)
        : null;

    if (!weeklyFortune) {
        return (
            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                <View className="bg-white/5 rounded-xl p-6 items-center">
                    <Text className="text-white text-center leading-relaxed">
                        生年月日を入力すると、より正確な週次運勢が表示されます。
                    </Text>
                </View>
            </ScrollView>
        );
    }

    // 日付をフォーマット
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // 曜日を取得
    const getWeekday = (dateStr: string) => {
        const date = new Date(dateStr);
        return WEEKDAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1];
    };

    // 傾向アイコン
    const TrendIcon = weeklyFortune.summary.trend === 'upward' 
        ? TrendingUp 
        : weeklyFortune.summary.trend === 'downward' 
        ? TrendingDown 
        : Minus;

    return (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="mb-6">
                <View className="flex-row items-center gap-3 mb-2">
                    <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                        <Calendar color="#e879f9" size={24} />
                    </View>
                    <View>
                        <Text className="text-white text-2xl font-bold">今週の運気</Text>
                        <Text className="text-white/50 text-sm">
                            {formatDate(weeklyFortune.weekStart)} ～ {formatDate(weeklyFortune.weekEnd)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Weekly Summary */}
            <View className="bg-surface-dark rounded-2xl p-6 mb-6">
                <View className="items-center mb-4">
                    <View
                        className="w-20 h-20 rounded-full items-center justify-center mb-3"
                        style={{ backgroundColor: LEVEL_COLORS[weeklyFortune.summary.averageLevel] + '20' }}
                    >
                        <Text className="text-3xl font-bold" style={{ color: LEVEL_COLORS[weeklyFortune.summary.averageLevel] }}>
                            {weeklyFortune.summary.averageLevel}
                        </Text>
                    </View>
                    <Text className="text-white/70 text-sm mb-1">
                        週平均スコア: {weeklyFortune.summary.averageScore.toFixed(1)}
                    </Text>
                </View>

                {/* Trend */}
                <View className="flex-row items-center justify-center gap-2 mb-4">
                    <TrendIcon 
                        color={weeklyFortune.summary.trend === 'upward' ? '#10b981' : weeklyFortune.summary.trend === 'downward' ? '#f97316' : '#8b5cf6'} 
                        size={20} 
                    />
                    <Text className="text-white/80 text-sm">
                        {weeklyFortune.summary.trend === 'upward' ? '上昇傾向' : weeklyFortune.summary.trend === 'downward' ? '下降傾向' : '安定傾向'}
                    </Text>
                </View>

                {/* Weekly Advice */}
                <View className="bg-white/5 rounded-xl p-4">
                    <View className="flex-row items-center gap-2 mb-2">
                        <Sparkles color="#e879f9" size={18} />
                        <Text className="text-white font-bold text-sm">今週のアドバイス</Text>
                    </View>
                    <Text className="text-white/90 text-sm leading-relaxed">
                        {weeklyFortune.weeklyAdvice}
                    </Text>
                </View>
            </View>

            {/* Best/Worst Days */}
            <View className="flex-row gap-3 mb-6">
                {/* Best Day */}
                <View className="flex-1 bg-white/5 rounded-xl p-4">
                    <View className="flex-row items-center gap-2 mb-2">
                        <Sparkles color="#10b981" size={16} />
                        <Text className="text-white/70 text-xs font-bold">最高の日</Text>
                    </View>
                    <Text className="text-white font-bold text-lg mb-1">
                        {formatDate(weeklyFortune.summary.bestDay.date)} ({getWeekday(weeklyFortune.summary.bestDay.date)})
                    </Text>
                    <View className="flex-row items-center gap-2">
                        <View
                            className="px-2 py-1 rounded"
                            style={{ backgroundColor: LEVEL_COLORS[weeklyFortune.summary.bestDay.level] + '20' }}
                        >
                            <Text className="text-xs font-bold" style={{ color: LEVEL_COLORS[weeklyFortune.summary.bestDay.level] }}>
                                {weeklyFortune.summary.bestDay.level}
                            </Text>
                        </View>
                        <Text className="text-white/50 text-xs">
                            スコア: {weeklyFortune.summary.bestDay.score}
                        </Text>
                    </View>
                </View>

                {/* Worst Day */}
                <View className="flex-1 bg-white/5 rounded-xl p-4">
                    <View className="flex-row items-center gap-2 mb-2">
                        <AlertCircle color="#f97316" size={16} />
                        <Text className="text-white/70 text-xs font-bold">注意の日</Text>
                    </View>
                    <Text className="text-white font-bold text-lg mb-1">
                        {formatDate(weeklyFortune.summary.worstDay.date)} ({getWeekday(weeklyFortune.summary.worstDay.date)})
                    </Text>
                    <View className="flex-row items-center gap-2">
                        <View
                            className="px-2 py-1 rounded"
                            style={{ backgroundColor: LEVEL_COLORS[weeklyFortune.summary.worstDay.level] + '20' }}
                        >
                            <Text className="text-xs font-bold" style={{ color: LEVEL_COLORS[weeklyFortune.summary.worstDay.level] }}>
                                {weeklyFortune.summary.worstDay.level}
                            </Text>
                        </View>
                        <Text className="text-white/50 text-xs">
                            スコア: {weeklyFortune.summary.worstDay.score}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Statistics */}
            <View className="bg-white/5 rounded-xl p-4 mb-6">
                <Text className="text-white font-bold mb-3">週の統計</Text>
                <View className="gap-3">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-white/70 text-sm">吉以上の日</Text>
                        <View className="flex-row items-center gap-2">
                            <View className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${(weeklyFortune.summary.luckyDays / 7) * 100}%` }}
                                />
                            </View>
                            <Text className="text-white font-bold text-sm">
                                {weeklyFortune.summary.luckyDays}日
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-white/70 text-sm">注意が必要な日</Text>
                        <View className="flex-row items-center gap-2">
                            <View className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-orange-500 rounded-full"
                                    style={{ width: `${(weeklyFortune.summary.cautionDays / 7) * 100}%` }}
                                />
                            </View>
                            <Text className="text-white font-bold text-sm">
                                {weeklyFortune.summary.cautionDays}日
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Daily Fortunes */}
            <View className="mb-8">
                <Text className="text-white font-bold text-lg mb-4">7日間の運勢</Text>
                <View className="gap-3">
                    {weeklyFortune.dailyFortunes.map((fortune, index) => {
                        const date = new Date(fortune.date);
                        const weekday = getWeekday(fortune.date);
                        
                        return (
                            <View key={fortune.date} className="bg-white/5 rounded-xl p-4">
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center gap-3">
                                        <Text className="text-white/50 text-xs w-8">
                                            {formatDate(fortune.date)}
                                        </Text>
                                        <Text className="text-white/70 text-xs">
                                            ({weekday})
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <View
                                            className="px-3 py-1 rounded-full"
                                            style={{ backgroundColor: LEVEL_COLORS[fortune.level] + '20' }}
                                        >
                                            <Text className="text-xs font-bold" style={{ color: LEVEL_COLORS[fortune.level] }}>
                                                {fortune.level}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                
                                <Text className="text-white/80 text-sm leading-relaxed mb-2">
                                    {fortune.advice}
                                </Text>
                                
                                <View className="flex-row items-center gap-4 mt-2">
                                    <Text className="text-white/50 text-xs">
                                        十大主星: {fortune.dailyTenStar}
                                    </Text>
                                    <Text className="text-white/50 text-xs">
                                        十二大従星: {fortune.dailyTwelveStar.name}
                                    </Text>
                                </View>
                                
                                {fortune.specialConditions.length > 0 && (
                                    <View className="flex-row flex-wrap gap-2 mt-2">
                                        {fortune.specialConditions.map((condition, idx) => (
                                            <View key={idx} className="px-2 py-1 bg-yellow-500/20 rounded">
                                                <Text className="text-yellow-400 text-xs">
                                                    ⚠️ {condition}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}
