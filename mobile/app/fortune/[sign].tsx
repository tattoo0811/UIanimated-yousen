import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Undo2, Share2, Sparkles } from 'lucide-react-native';
import { ZODIAC_SIGNS } from '../../src/lib/zodiac';

export default function FortuneScreen() {
    const { sign: signId } = useLocalSearchParams();
    const router = useRouter();

    const sign = ZODIAC_SIGNS.find(s => s.id === signId);

    if (!sign) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-950">
                <Text className="text-white">Sign not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-950">
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

            <LinearGradient
                colors={['#1e1b4b', '#020617']}
                className="absolute inset-0"
            />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header Image / Symbol Area */}
                <View className="h-80 w-full items-center justify-center relative overflow-hidden">
                    <View className="absolute inset-0 bg-violet-900/20" />
                    <View className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px]" />
                    <View className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-600/20 rounded-full blur-[60px]" />

                    <Text className="text-9xl text-white shadow-lg" style={{ textShadowColor: 'rgba(139, 92, 246, 0.5)', textShadowRadius: 30 }}>
                        {sign.symbol}
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-6 p-2 bg-black/20 rounded-full backdrop-blur-md"
                    >
                        <Undo2 color="white" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Content Body */}
                <View className="px-6 -mt-10">
                    <BlurView intensity={20} tint="dark" className="rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 p-6 min-h-[400px]">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-3xl font-bold text-white mb-1">{sign.name}</Text>
                                <Text className="text-white/60 font-medium">{sign.dateRange}</Text>
                            </View>
                            <View className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                <Text className="text-amber-400 font-bold uppercase text-xs tracking-wider">{sign.element}</Text>
                            </View>
                        </View>

                        {/* Keywords */}
                        <View className="flex-row flex-wrap gap-2 mb-8">
                            {sign.keywords.map(keyword => (
                                <View key={keyword} className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                                    <Text className="text-violet-200 text-xs font-medium uppercase tracking-wide">{keyword}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Description */}
                        <Text className="text-lg leading-8 text-slate-300 font-light mb-8">
                            {sign.description}
                        </Text>

                        <View className="h-[1px] w-full bg-white/10 mb-8" />

                        {/* Lucky Items (Mocked for now) */}
                        <View className="gap-4">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center">
                                    <Sparkles size={20} color="#f59e0b" />
                                </View>
                                <View>
                                    <Text className="text-white font-medium">Daily Fortune</Text>
                                    <Text className="text-slate-400 text-sm">Your stars align for greatness today.</Text>
                                </View>
                            </View>
                        </View>

                    </BlurView>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <View className="absolute bottom-8 right-6">
                <TouchableOpacity className="bg-violet-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-violet-900/50 border border-white/10">
                    <Share2 color="white" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
