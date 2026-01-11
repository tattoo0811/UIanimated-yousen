import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import clsx from 'clsx';

export default function GenderScreen() {
    const router = useRouter();
    const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);

    const handleNext = () => {
        if (selectedGender) {
            router.push({
                pathname: '/birth-decade',
                params: { gender: selectedGender }
            });
        }
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    };

    return (
        <View className="flex-1 bg-background-dark">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center px-4 py-4 justify-between bg-background-dark">
                <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 rounded-full bg-surface-dark items-center justify-center"
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">性別を選択</Text>
                <View className="w-10" />
            </View>

            {/* Progress */}
            <View className="px-6 py-4 flex-row gap-2">
                <View className="h-1.5 flex-1 rounded-full bg-primary shadow-neon" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
                <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                <View className="items-center mb-8">
                    <Text className="text-3xl font-extrabold text-white text-center mb-3">
                        あなたの性別を{'\n'}教えてください
                    </Text>
                    <Text className="text-white/60 text-sm text-center leading-relaxed">
                        占いの結果をより正確にするために必要です。{'\n'}後から変更することはできません。
                    </Text>
                </View>

                <View className="gap-6">
                    {/* Male Option */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setSelectedGender('male')}
                        testID="gender-male"
                        className={clsx(
                            "flex-row items-center p-4 rounded-xl border-2 h-32 bg-surface-dark",
                            selectedGender === 'male' ? "border-secondary bg-secondary/10" : "border-transparent"
                        )}
                    >
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={['#22d3ee', '#2563eb']}
                                style={styles.iconGradient}
                            >
                                <Text style={styles.genderSymbol}>♂</Text>
                            </LinearGradient>
                        </View>

                        <View className="ml-6 flex-1">
                            <Text className={clsx("text-2xl font-bold", selectedGender === 'male' ? "text-secondary" : "text-white")}>男性</Text>
                            <Text className="text-xs text-white/50 mt-1 font-medium tracking-wider uppercase">Yang • 陽</Text>
                        </View>

                        <View className={clsx(
                            "w-8 h-8 rounded-full border-2 items-center justify-center",
                            selectedGender === 'male' ? "border-secondary bg-secondary" : "border-white/20"
                        )}>
                            {selectedGender === 'male' && <Check size={18} color="#221022" strokeWidth={3} />}
                        </View>
                    </TouchableOpacity>

                    {/* Female Option */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setSelectedGender('female')}
                        testID="gender-female"
                        className={clsx(
                            "flex-row items-center p-4 rounded-xl border-2 h-32 bg-surface-dark",
                            selectedGender === 'female' ? "border-primary bg-primary/10" : "border-transparent"
                        )}
                    >
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={['#e879f9', '#9333ea']}
                                style={styles.iconGradient}
                            >
                                <Text style={styles.genderSymbol}>♀</Text>
                            </LinearGradient>
                        </View>

                        <View className="ml-6 flex-1">
                            <Text className={clsx("text-2xl font-bold", selectedGender === 'female' ? "text-primary" : "text-white")}>女性</Text>
                            <Text className="text-xs text-white/50 mt-1 font-medium tracking-wider uppercase">Yin • 陰</Text>
                        </View>

                        <View className={clsx(
                            "w-8 h-8 rounded-full border-2 items-center justify-center",
                            selectedGender === 'female' ? "border-primary bg-primary" : "border-white/20"
                        )}>
                            {selectedGender === 'female' && <Check size={18} color="white" strokeWidth={3} />}
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Footer CTA */}
            <View className="p-6 bg-background-dark">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!selectedGender}
                    testID="next-button"
                    className={clsx(
                        "w-full h-14 rounded-full items-center justify-center flex-row gap-2",
                        selectedGender ? "bg-primary opacity-100" : "bg-white/10 opacity-50"
                    )}
                >
                    <Text className="text-white font-bold text-lg">次へ進む</Text>
                    <ArrowRight color="white" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        width: 80,
        height: 80,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genderSymbol: {
        color: 'white',
        fontSize: 36,
    },
});
