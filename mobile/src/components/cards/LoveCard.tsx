import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import type { SanmeigakuInsenChart } from '@/src/types';
import { Heart } from 'lucide-react-native';

type Props = {
    insen: SanmeigakuInsenChart;
};

const getLoveAdvice = (kanshi: string, characterName?: string): string => {
    const name = characterName || kanshi;

    const adviceMap: Record<string, string> = {
        '甲': '堂々とした姿勢で、自然体で接することができる相手との相性が良いです。リードする関係を好みます。',
        '乙': '柔軟で協調性のある関係を好みます。相手に合わせることが得意で、穏やかな恋愛を築けます。',
        '丙': '情熱的な恋愛を好みます。明るく積極的なアプローチで、相手を引きつける魅力があります。',
        '丁': '繊細で深い愛情表現を好みます。じっくりと関係を育てるタイプで、一途な愛を捧げます。',
        '戊': '安定した関係を求めます。信頼関係を大切にし、長期的なパートナーシップを重視します。',
        '己': '包容力があり、相手を育てる愛情があります。家庭的な関係を好み、温かい家庭を築けます。',
        '庚': '白黒はっきりした関係を好みます。正直で誠実な態度で、信頼できるパートナーになれます。',
        '辛': '繊細で美しい恋愛を好みます。相手の良さを引き出すセンスがあり、上品な関係を築けます。',
        '壬': '自由な恋愛を好みます。束縛を嫌い、お互いの個性を尊重する関係で輝きます。',
        '癸': '静かで深い愛情を持ちます。表面的な関係より、心の繋がりを大切にします。',
    };

    const stem = kanshi[0];
    const baseAdvice = adviceMap[stem] || '自分の恋愛傾向を理解することが大切です。';

    return `【${name}の恋愛運】\n\n${baseAdvice}\n\n【行動提案】\n1. 自分の恋愛傾向を理解する\n2. 相手との相性を冷静に見極める\n3. 長期的な関係を築く努力をする`;
};

export default function LoveCard({ insen }: Props) {
    const [advice, setAdvice] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdvice();
    }, []);

    const fetchAdvice = async () => {
        try {
            const dayStem = insen.pillars.day.stem;
            const dayBranch = insen.pillars.day.branch;
            const kanshi = `${dayStem}${dayBranch}`;

            const adviceText = getLoveAdvice(kanshi, insen.meta.characterName);
            setAdvice(adviceText);
        } catch (error) {
            console.error('Failed to generate advice:', error);
            setAdvice('アドバイスの生成に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 rounded-full bg-pink-500/20 items-center justify-center mr-3">
                    <Heart color="#ec4899" size={24} />
                </View>
                <View>
                    <Text className="text-white text-2xl font-bold">恋愛の悩み</Text>
                    <Text className="text-white/50 text-sm">恋愛・結婚・人間関係</Text>
                </View>
            </View>

            <View className="bg-surface-dark rounded-2xl p-6 mb-6">
                {loading ? (
                    <ActivityIndicator color="#ec4899" />
                ) : (
                    <Text className="text-white text-base leading-relaxed">{advice}</Text>
                )}
            </View>
        </ScrollView>
    );
}
