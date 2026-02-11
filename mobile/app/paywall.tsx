import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Check, Sparkles, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePurchases } from '@/hooks/usePurchases';

export default function PaywallScreen() {
    const router = useRouter();
    const { isPremium, purchasePackage, enablePremium, disablePremium } = usePurchases();

    const handlePurchase = async () => {
        await purchasePackage();
        router.back();
    };

    return (
        <View className="flex-1 bg-background-dark">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <X color="#fff" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">
                    {isPremium ? 'プレミアム会員' : 'プレミアムプラン'}
                </Text>
                <View className="w-6" />
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Test Controls */}
                <View className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                    <View className="flex-row items-center mb-3">
                        <Settings size={16} color="#eab308" />
                        <Text className="text-yellow-500 text-sm font-bold ml-2">テストモード</Text>
                    </View>
                    <Text className="text-white/60 text-xs mb-3">
                        現在の状態: {isPremium ? 'プレミアム会員' : '無料会員'}
                    </Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={enablePremium}
                            className="flex-1 bg-green-500/20 border border-green-500/40 rounded-lg py-2"
                        >
                            <Text className="text-green-400 text-xs font-bold text-center">
                                プレミアム有効化
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={disablePremium}
                            className="flex-1 bg-red-500/20 border border-red-500/40 rounded-lg py-2"
                        >
                            <Text className="text-red-400 text-xs font-bold text-center">
                                無料版に戻す
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hero */}
                <View className="items-center mb-8">
                    <LinearGradient
                        colors={['#f425f4', '#00ffff']}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Sparkles size={40} color="#fff" />
                    </LinearGradient>
                    <Text className="text-white text-3xl font-bold text-center mb-2">
                        プレミアムで{'\n'}運命を深く知る
                    </Text>
                    <Text className="text-white/60 text-center">
                        3000年の知恵を、あなたのために
                    </Text>
                </View>

                {/* Features */}
                <View className="bg-surface-dark rounded-2xl p-6 mb-6">
                    {[
                        { text: '命式診断 無制限', enabled: isPremium },
                        { text: '相性診断 20人/月', enabled: isPremium },
                        { text: '週間・月間・年間運勢', enabled: isPremium },
                        { text: 'AI相談 10回/日', enabled: isPremium },
                        { text: '広告なし', enabled: isPremium },
                        { text: 'データ永久保存', enabled: isPremium },
                    ].map((feature, i) => (
                        <View key={i} className="flex-row items-center mb-4">
                            <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${feature.enabled ? 'bg-primary/20' : 'bg-white/10'
                                }`}>
                                <Check size={16} color={feature.enabled ? '#f425f4' : '#666'} />
                            </View>
                            <Text className={`text-base ${feature.enabled ? 'text-white' : 'text-white/40'}`}>
                                {feature.text}
                            </Text>
                        </View>
                    ))}
                </View>

                {!isPremium && (
                    <>
                        {/* Pricing - Yearly (Recommended) */}
                        <TouchableOpacity
                            onPress={handlePurchase}
                            className="bg-primary rounded-2xl p-6 mb-4"
                        >
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-white text-xl font-bold">年間プラン</Text>
                                <View className="bg-white/20 px-3 py-1 rounded-full">
                                    <Text className="text-white text-xs font-bold">おすすめ</Text>
                                </View>
                            </View>
                            <View className="flex-row items-baseline mb-2">
                                <Text className="text-white text-4xl font-bold">¥250</Text>
                                <Text className="text-white/80 text-lg ml-2">/月</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text className="text-red-400 text-sm line-through mr-2">¥500</Text>
                                <Text className="text-white text-sm">→ ¥250（50% OFF）</Text>
                            </View>
                            <Text className="text-white/80 text-sm mt-2">一括 ¥3,000/年</Text>
                        </TouchableOpacity>

                        {/* Pricing - Monthly */}
                        <TouchableOpacity
                            onPress={handlePurchase}
                            className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6"
                        >
                            <Text className="text-white text-xl font-bold mb-2">月額プラン</Text>
                            <View className="flex-row items-baseline">
                                <Text className="text-white text-4xl font-bold">¥500</Text>
                                <Text className="text-white/80 text-lg ml-2">/月</Text>
                            </View>
                        </TouchableOpacity>
                    </>
                )}

                {isPremium && (
                    <View className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-6">
                        <Text className="text-green-400 text-lg font-bold text-center mb-2">
                            プレミアム会員です
                        </Text>
                        <Text className="text-white/60 text-sm text-center">
                            全ての機能をご利用いただけます
                        </Text>
                    </View>
                )}

                {/* Footer */}
                <Text className="text-white/40 text-xs text-center mb-8">
                    購読は自動更新されます。いつでもキャンセル可能です。
                </Text>
            </ScrollView>
        </View>
    );
}
