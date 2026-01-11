import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Crown, Settings as SettingsIcon, Trash2 } from 'lucide-react-native';
import { usePurchases } from '@/src/hooks/usePurchases';
import { resetUsageCounts, getUsageCounts } from '@/src/utils/usage';
import { useState, useEffect } from 'react';

export default function SettingsScreen() {
    const router = useRouter();
    const { isPremium, enablePremium, disablePremium } = usePurchases();
    const [usageCounts, setUsageCounts] = useState({ diagnoses: 0, compatibility: [] });

    useEffect(() => {
        loadUsage();
    }, []);

    const loadUsage = async () => {
        const counts = await getUsageCounts();
        setUsageCounts(counts);
    };

    const handleResetUsage = async () => {
        Alert.alert(
            '使用回数をリセット',
            '診断回数と相性診断の履歴をリセットしますか？',
            [
                { text: 'キャンセル', style: 'cancel' },
                {
                    text: 'リセット',
                    style: 'destructive',
                    onPress: async () => {
                        await resetUsageCounts();
                        await loadUsage();
                    },
                },
            ]
        );
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
                    <Text className="text-white text-2xl font-bold">設定</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Premium Status */}
                <View className="bg-surface-dark rounded-2xl p-6 mb-6">
                    <View className="flex-row items-center mb-4">
                        <Crown color={isPremium ? '#f425f4' : '#666'} size={24} />
                        <Text className="text-white text-lg font-bold ml-3">
                            {isPremium ? 'プレミアム会員' : '無料会員'}
                        </Text>
                    </View>

                    {!isPremium && (
                        <TouchableOpacity
                            onPress={() => router.push('/paywall')}
                            className="bg-primary rounded-xl py-3"
                        >
                            <Text className="text-white font-bold text-center">
                                プレミアムにアップグレード
                            </Text>
                        </TouchableOpacity>
                    )}

                    {isPremium && (
                        <View className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                            <Text className="text-primary text-sm text-center">
                                全ての機能をご利用いただけます
                            </Text>
                        </View>
                    )}
                </View>

                {/* Usage Stats */}
                <View className="bg-surface-dark rounded-2xl p-6 mb-6">
                    <Text className="text-white text-lg font-bold mb-4">使用状況</Text>

                    <View className="mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-white/60 text-sm">命式診断</Text>
                            <Text className="text-white font-bold">
                                {usageCounts.diagnoses} / {isPremium ? '∞' : '3'}
                            </Text>
                        </View>
                        {!isPremium && (
                            <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-primary"
                                    style={{ width: `${Math.min(100, (usageCounts.diagnoses / 3) * 100)}%` }}
                                />
                            </View>
                        )}
                    </View>

                    <View className="mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-white/60 text-sm">相性診断</Text>
                            <Text className="text-white font-bold">
                                {usageCounts.compatibility.length} / {isPremium ? '20' : '3'}
                            </Text>
                        </View>
                        {!isPremium && (
                            <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-secondary"
                                    style={{
                                        width: `${Math.min(100, (usageCounts.compatibility.length / 3) * 100)}%`,
                                    }}
                                />
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={handleResetUsage}
                        className="flex-row items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 mt-2"
                    >
                        <Trash2 size={16} color="#ef4444" />
                        <Text className="text-red-400 font-bold ml-2">使用回数をリセット</Text>
                    </TouchableOpacity>
                </View>

                {/* Test Controls */}
                <View className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-6">
                    <View className="flex-row items-center mb-4">
                        <SettingsIcon size={20} color="#eab308" />
                        <Text className="text-yellow-500 font-bold ml-2">テストモード</Text>
                    </View>

                    <Text className="text-white/60 text-sm mb-4">
                        TestFlight用のテスト機能です。本番リリース時には削除されます。
                    </Text>

                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={enablePremium}
                            className="bg-green-500/20 border border-green-500/40 rounded-xl py-3"
                        >
                            <Text className="text-green-400 font-bold text-center">
                                プレミアムを有効化
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={disablePremium}
                            className="bg-red-500/20 border border-red-500/40 rounded-xl py-3"
                        >
                            <Text className="text-red-400 font-bold text-center">
                                無料版に戻す
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* App Info */}
                <View className="items-center py-8">
                    <Text className="text-white/40 text-sm mb-2">PopSanmei</Text>
                    <Text className="text-white/40 text-xs">Version 1.0.0 (TestFlight)</Text>
                </View>
            </ScrollView>
        </View>
    );
}
