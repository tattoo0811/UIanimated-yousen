import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, ArrowRight, RefreshCw, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { loadStorage } from '@/lib/storage';
import { useResponsive } from '@/hooks/useResponsive';

export default function DiagnosisTab() {
    const router = useRouter();
    const { isTablet, contentPadding, cardWidth, fontSize } = useResponsive();
    const [hasResult, setHasResult] = useState(false);
    const [savedDate, setSavedDate] = useState<string | null>(null);

    useEffect(() => {
        checkExistingResult();
    }, []);

    const checkExistingResult = async () => {
        try {
            const storage = await loadStorage();
            if (storage.fortuneResults && storage.fortuneResults.length > 0) {
                // 最新の結果を取得
                const latestInfo = storage.fortuneResults[storage.fortuneResults.length - 1]; // Simply picking last one for now or define logic
                // But wait, the schema says SchemaV2 has fortuneResults array.
                // The old logic was checking for 'result_' key.
                // My migration logic handles old data.
                // So I should just check fortuneResults.
                if (latestInfo) {
                    setHasResult(true);
                    const date = new Date(latestInfo.birthDate);
                    setSavedDate(date.toISOString().split('T')[0]);
                }
            }
        } catch (e) {
            console.log('No saved result');
        }
    };

    const handleStartDiagnosis = () => {
        router.push('/profile');
    };

    const handleReDiagnosis = () => {
        Alert.alert(
            '再鑑定',
            '新しい生年月日で鑑定しますか？',
            [
                { text: 'キャンセル', style: 'cancel' },
                { text: '再鑑定する', onPress: () => router.push('/profile') },
            ]
        );
    };

    return (
        <View className="flex-1 bg-[#FFF9E6]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: contentPadding, paddingTop: 60, alignItems: 'center' }}
            >
                {/* Header */}
                <View className="items-center mb-8">
                    <View
                        className="bg-[#333] px-6 py-2 mb-4"
                        style={{ borderRadius: 999 }}
                    >
                        <Text className="text-white font-black" style={{ fontSize: fontSize.md }}>GOGYO POP!</Text>
                    </View>
                    <Text className="font-black text-[#333]" style={{ fontSize: fontSize.xl }}>五行診断</Text>
                    <Text className="text-gray-600 mt-2" style={{ fontSize: fontSize.sm }}>あなたの生まれ持った運命を解析</Text>
                </View>

                {/* Main Card */}
                <View
                    className="p-6 mb-6"
                    style={{
                        backgroundColor: '#A3E635',
                        borderWidth: 4,
                        borderColor: '#333',
                        borderRadius: 24,
                        shadowColor: '#333',
                        shadowOffset: { width: 8, height: 8 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        width: cardWidth,
                    }}
                >
                    <Text className="text-center mb-4" style={{ fontSize: fontSize.xxl }}>🔮</Text>
                    <Text className="font-black text-center text-[#333] mb-2" style={{ fontSize: fontSize.lg }}>
                        陰陽五行論
                    </Text>
                    <Text className="text-center text-[#333] font-bold leading-relaxed" style={{ fontSize: fontSize.sm }}>
                        古代中国から伝わる宇宙の法則。{'\n'}
                        あなたの60タイプの本質を解明します。
                    </Text>
                </View>

                {/* Features */}
                <View className="gap-3 mb-8" style={{ width: cardWidth }}>
                    {[
                        { icon: '⚡', text: '60種類のタイプ診断' },
                        { icon: '💫', text: '今日・今月・今年の運気' },
                        { icon: '💕', text: '相性診断' },
                        { icon: '🎯', text: '開運アドバイス' },
                    ].map((item, i) => (
                        <View
                            key={i}
                            className="flex-row items-center gap-3 bg-white p-4"
                            style={{
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 16,
                            }}
                        >
                            <Text style={{ fontSize: fontSize.md }}>{item.icon}</Text>
                            <Text className="font-bold text-[#333]" style={{ fontSize: fontSize.sm }}>{item.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Zodiac Swipe Link */}
                <TouchableOpacity
                    onPress={() => router.push('/zodiac-select')}
                    className="flex-row items-center justify-center gap-2 p-4 mb-6"
                    style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 2,
                        borderColor: '#8B5CF6',
                        borderRadius: 16,
                        width: cardWidth,
                    }}
                >
                    <Sparkles size={18} color="#8B5CF6" />
                    <Text className="font-bold" style={{ color: '#8B5CF6', fontSize: fontSize.sm }}>
                        まずは干支を選んでみる
                    </Text>
                    <ArrowRight size={18} color="#8B5CF6" />
                </TouchableOpacity>

                {/* Start Button */}
                {!hasResult ? (
                    <TouchableOpacity
                        onPress={handleStartDiagnosis}
                        className="flex-row items-center justify-center gap-2 p-5"
                        style={{
                            backgroundColor: '#FB7185',
                            borderWidth: 4,
                            borderColor: '#333',
                            borderRadius: 20,
                            shadowColor: '#333',
                            shadowOffset: { width: 6, height: 6 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            width: cardWidth,
                        }}
                    >
                        <Calendar size={24} color="#fff" />
                        <Text className="text-white font-black" style={{ fontSize: fontSize.md }}>診断スタート！</Text>
                        <ArrowRight size={24} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <View className="gap-3" style={{ width: cardWidth }}>
                        <View
                            className="bg-white p-4"
                            style={{
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 16,
                            }}
                        >
                            <Text className="text-gray-600 text-sm">保存済みの生年月日</Text>
                            <Text className="font-black text-xl text-[#333]">{savedDate}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleReDiagnosis}
                            className="flex-row items-center justify-center gap-2 p-4"
                            style={{
                                backgroundColor: '#60A5FA',
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 16,
                            }}
                        >
                            <RefreshCw size={20} color="#fff" />
                            <Text className="text-white font-bold" style={{ fontSize: fontSize.sm }}>別の日付で再鑑定</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
