import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check } from 'lucide-react-native';

const TERMS_ACCEPTED_KEY = 'terms_accepted';

export default function TermsScreen() {
    const router = useRouter();
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        checkTermsAccepted();
    }, []);

    const checkTermsAccepted = async () => {
        const value = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
        if (value === 'true') {
            // 既に承諾済みの場合はタブへ
            router.replace('/(tabs)');
        }
    };

    const handleAccept = async () => {
        await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
        router.replace('/(tabs)');
    };

    return (
        <View className="flex-1 bg-[#FFF9E6]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 120 }}
            >
                {/* Header */}
                <View className="items-center mb-8">
                    <View
                        className="bg-[#333] px-6 py-2 mb-4"
                        style={{ borderRadius: 999 }}
                    >
                        <Text className="text-white text-lg font-black">GOGYO POP!</Text>
                    </View>
                    <Text className="text-3xl font-black text-[#333] mb-2">利用規約</Text>
                    <Text className="text-gray-600 text-center">
                        ご利用前に必ずお読みください
                    </Text>
                </View>

                {/* Terms Content */}
                <View
                    className="p-6 mb-6"
                    style={{
                        backgroundColor: '#fff',
                        borderWidth: 3,
                        borderColor: '#333',
                        borderRadius: 20,
                    }}
                >
                    <Text className="font-black text-lg text-[#333] mb-4">第1条（適用）</Text>
                    <Text className="text-[#333] leading-relaxed mb-6">
                        本規約は、本アプリケーション「GOGYO POP!」（以下「本アプリ」）の利用に関する条件を、本アプリを利用するすべてのユーザー（以下「ユーザー」）と当社との間で定めるものです。
                    </Text>

                    <Text className="font-black text-lg text-[#333] mb-4">第2条（サービス内容）</Text>
                    <Text className="text-[#333] leading-relaxed mb-6">
                        本アプリは、陰陽五行論に基づく占いサービスを提供します。診断結果は参考情報であり、その正確性や結果に対する責任は負いかねます。
                    </Text>

                    <Text className="font-black text-lg text-[#333] mb-4">第3条（個人情報）</Text>
                    <Text className="text-[#333] leading-relaxed mb-6">
                        ユーザーが入力した生年月日等の情報は、診断結果の算出のみに使用され、端末内に保存されます。外部サーバーへの送信は行いません。
                    </Text>

                    <Text className="font-black text-lg text-[#333] mb-4">第4条（禁止事項）</Text>
                    <Text className="text-[#333] leading-relaxed mb-6">
                        ユーザーは、本アプリの利用にあたり、以下の行為を行ってはなりません：{'\n'}
                        • 本アプリの不正利用{'\n'}
                        • 第三者への迷惑行為{'\n'}
                        • 法令に違反する行為
                    </Text>

                    <Text className="font-black text-lg text-[#333] mb-4">第5条（免責事項）</Text>
                    <Text className="text-[#333] leading-relaxed mb-6">
                        本アプリの診断結果はあくまで参考情報です。ユーザーの判断と責任において利用してください。診断結果に基づく行動の結果について、当社は一切の責任を負いません。
                    </Text>

                    <Text className="font-black text-lg text-[#333] mb-4">第6条（規約の変更）</Text>
                    <Text className="text-[#333] leading-relaxed">
                        当社は、必要に応じて本規約を変更することができます。変更後の規約は、本アプリ内で通知した時点で効力を生じます。
                    </Text>
                </View>

                {/* Checkbox */}
                <TouchableOpacity
                    onPress={() => setAccepted(!accepted)}
                    className="flex-row items-center gap-3 mb-6"
                >
                    <View
                        className="w-8 h-8 items-center justify-center"
                        style={{
                            backgroundColor: accepted ? '#A3E635' : '#fff',
                            borderWidth: 3,
                            borderColor: '#333',
                            borderRadius: 8,
                        }}
                    >
                        {accepted && <Check size={20} color="#333" />}
                    </View>
                    <Text className="flex-1 font-bold text-[#333]">
                        利用規約に同意します
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View
                className="absolute bottom-0 left-0 right-0 p-5"
                style={{
                    backgroundColor: '#FFF9E6',
                    borderTopWidth: 3,
                    borderTopColor: '#333',
                }}
            >
                <TouchableOpacity
                    onPress={handleAccept}
                    disabled={!accepted}
                    className="flex-row items-center justify-center gap-2 p-5"
                    style={{
                        backgroundColor: accepted ? '#FB7185' : '#ccc',
                        borderWidth: 4,
                        borderColor: '#333',
                        borderRadius: 20,
                        shadowColor: '#333',
                        shadowOffset: { width: 6, height: 6 },
                        shadowOpacity: accepted ? 1 : 0.3,
                        shadowRadius: 0,
                    }}
                >
                    <Text className="text-white text-xl font-black">
                        {accepted ? '同意して始める' : '規約に同意してください'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
