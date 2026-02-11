import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Undo2, Share2, Sparkles } from 'lucide-react-native';
// TODO: Restore imports when lib files are available
// import { ZODIAC_SIGNS } from '../../src/lib/zodiac';
// import { shareToSocial, showShareOptions, SharePlatform } from '../../src/lib/share';

// Temporary inline definitions
const ZODIAC_SIGNS = [
    { id: 'aries', name: '牡羊座', symbol: '♈', dateRange: '3/21 - 4/19', element: 'Fire', keywords: ['大胆', '情熱的', 'リーダー'], description: '新しい始まりに満ちたエネルギッシュな時期です。' },
    { id: 'taurus', name: '牡牛座', symbol: '♉', dateRange: '4/20 - 5/20', element: 'Earth', keywords: ['忍耐強い', '安定', '実用的'], description: '安定と調和をもたらす時期です。' },
    { id: 'gemini', name: '双子座', symbol: '♊', dateRange: '5/21 - 6/20', element: 'Air', keywords: ['適応力', '好奇心', '多才'], description: 'コミュニケーションと学びに適した時期です。' },
    { id: 'cancer', name: '蟹座', symbol: '♋', dateRange: '6/21 - 7/22', element: 'Water', keywords: ['直感的', '保護的', '感情的'], description: '感情の深まりと人間関係の充実の時です。' },
    { id: 'leo', name: '獅子座', symbol: '♌', dateRange: '7/23 - 8/22', element: 'Fire', keywords: ['自信家', '創造的', '寛大'], description: '輝きと創造性が花開く時期です。' },
    { id: 'virgo', name: '乙女座', symbol: '♍', dateRange: '8/23 - 9/22', element: 'Earth', keywords: ['詳細', '分析力', '奉仕的'], description: '整理と改善に適した時期です。' },
    { id: 'libra', name: '天秤座', symbol: '♎', dateRange: '9/23 - 10/22', element: 'Air', keywords: ['バランス', '調和', '社交的'], description: 'パートナーシップと美意識が高まる時期です。' },
    { id: 'scorpio', name: '蠍座', symbol: '♏', dateRange: '10/23 - 11/21', element: 'Water', keywords: ['情熱的', '神秘的', '決断力'], description: '変容と深い気づきをもたらす時期です。' },
    { id: 'sagittarius', name: '射手座', symbol: '♐', dateRange: '11/22 - 12/21', element: 'Fire', keywords: ['冒険心', '楽観的', '哲学的'], description: '探究と自由を追求する時期です。' },
    { id: 'capricorn', name: '山羊座', symbol: '♑', dateRange: '12/22 - 1/19', element: 'Earth', keywords: ['野心的', '規律', '忍耐'], description: '目標達成に向けた着実な進歩の時です。' },
    { id: 'aquarius', name: '水瓶座', symbol: '♒', dateRange: '1/20 - 2/18', element: 'Air', keywords: ['革新的', '独立的', '人道的'], description: '新しいアイデアと友人関係の発展の時です。' },
    { id: 'pisces', name: '魚座', symbol: '♓', dateRange: '2/19 - 3/20', element: 'Water', keywords: ['直感的', '共感的', '芸術的'], description: '直感と創造性が高まる時期です。' },
];

const shareToSocial = (platform: string, options: { message: string }) => {
    console.log(`Share to ${platform}:`, options.message);
    // TODO: Implement actual sharing
};

const showShareOptions = (options: { message: string }) => {
    console.log('Show share options:', options.message);
    // TODO: Implement actual share dialog
};

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

    const handleShare = () => {
        const shareMessage = `${sign.symbol} ${sign.name}の運勢\n\n${sign.description}\n\n#${sign.name} #占い #運勢`;
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            // ネイティブアプリでは選択ダイアログを表示
            Alert.alert(
                'シェア先を選択',
                'シェアするSNSを選択してください',
                [
                    { text: 'キャンセル', style: 'cancel' },
                    { 
                        text: 'X(Twitter)', 
                        onPress: () => shareToSocial('twitter', { 
                            message: shareMessage 
                        })
                    },
                    { 
                        text: 'LINE', 
                        onPress: () => shareToSocial('line', { 
                            message: shareMessage 
                        })
                    },
                    { 
                        text: 'Instagram', 
                        onPress: () => shareToSocial('instagram', { 
                            message: shareMessage 
                        })
                    },
                ]
            );
        } else {
            // Web版では直接ネイティブシェアを使用
            showShareOptions({ message: shareMessage });
        }
    };

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
                <TouchableOpacity 
                    onPress={handleShare}
                    className="bg-violet-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-violet-900/50 border border-white/10"
                >
                    <Share2 color="white" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
