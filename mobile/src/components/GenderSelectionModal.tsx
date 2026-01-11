import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import clsx from 'clsx';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function GenderSelectionModal() {
    const router = useRouter();

    const handleGenderSelect = (gender: 'male' | 'female') => {
        router.push({
            pathname: '/birth-decade',
            params: { gender }
        });
    };

    return (
        <View className="absolute inset-0 z-50 flex items-center justify-center pointer-events-box-none">
            {/* Semi-transparent backdrop to focus attention (optional, using solid background card instead) */}

            <Animated.View
                entering={FadeInUp.delay(500).springify()}
                className="w-[90%] bg-surface-dark border border-white/10 rounded-3xl p-6 shadow-2xl"
                style={{ marginTop: Dimensions.get('window').height * 0.1 }}
            >
                <Text className="text-white text-xl font-bold text-center mb-2">自分の性別を選択</Text>
                <Text className="text-white/60 text-xs text-center mb-6">占いの結果をより正確にするために必要です</Text>

                <View className="gap-4">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        testID="gender-male"
                        onPress={() => handleGenderSelect('male')}
                        className="w-full h-16 rounded-xl overflow-hidden shadow-lg"
                    >
                        <LinearGradient
                            colors={['#2563eb', '#3b82f6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="w-full h-full flex-row items-center justify-center gap-3"
                        >
                            <Text className="text-2xl">♂</Text>
                            <Text className="text-white text-lg font-bold">男性</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        testID="gender-female"
                        onPress={() => handleGenderSelect('female')}
                        className="w-full h-16 rounded-xl overflow-hidden shadow-lg"
                    >
                        <LinearGradient
                            colors={['#db2777', '#f472b6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="w-full h-full flex-row items-center justify-center gap-3"
                        >
                            <Text className="text-2xl">♀</Text>
                            <Text className="text-white text-lg font-bold">女性</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <Text className="text-white/30 text-[10px] text-center mt-4">
                    ※プロフィールは、設定からいつでも変更できます
                </Text>
            </Animated.View>
        </View>
    );
}
