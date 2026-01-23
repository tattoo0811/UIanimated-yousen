import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import type { SanmeigakuInsenChart } from '@/src/types';
import { Home } from 'lucide-react-native';

type Props = {
    insen: SanmeigakuInsenChart;
};

const getFamilyAdvice = (kanshi: string, characterName?: string): string => {
    const name = characterName || kanshi;

    const adviceMap: Record<string, string> = {
        '甲': '家族を率いるリーダーシップがあります。家庭の柱として責任感を持ち、安定した環境を作れます。',
        '乙': '家族の調和を大切にします。しなやかに対応し、家族間の潤滑油として機能します。',
        '丙': '明るい家庭を作る力があります。家族に元気を与え、活気のある雰囲気を生み出します。',
        '丁': '家族への細やかな愛情があります。一人ひとりに目を配り、温かい絆を育てます。',
        '戊': '安定した家庭を築く力があります。信頼できる存在として、家族の支えになれます。',
        '己': '家族を育てる力があります。包容力があり、子供や家族の成長を支えられます。',
        '庚': '家族のルールを大切にします。規律がありながらも、公平な判断で家庭を守ります。',
        '辛': '美しい家庭を作るセンスがあります。上品で洗練された家庭環境を整えられます。',
        '壬': '家族の自由を尊重します。それぞれの個性を認め、広い心で接することができます。',
        '癸': '家族への静かな愛情があります。表には出しませんが、深い絆で家族を守ります。',
    };

    const stem = kanshi[0];
    const baseAdvice = adviceMap[stem] || '家族との関係を大切にすることが重要です。';

    return `【${name}の家庭運】\n\n${baseAdvice}\n\n【行動提案】\n1. 家族との対話の時間を増やす\n2. それぞれの個性を尊重する\n3. 長期的な家族の幸せを考える`;
};

export default function FamilyCard({ insen }: Props) {
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

            const adviceText = getFamilyAdvice(kanshi);
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
                <View className="w-12 h-12 rounded-full bg-green-500/20 items-center justify-center mr-3">
                    <Home color="#22c55e" size={24} />
                </View>
                <View>
                    <Text className="text-white text-2xl font-bold">家庭の悩み</Text>
                    <Text className="text-white/50 text-sm">家族・育児・親子関係</Text>
                </View>
            </View>

            <View className="bg-surface-dark rounded-2xl p-6 mb-6">
                {loading ? (
                    <ActivityIndicator color="#22c55e" />
                ) : (
                    <Text className="text-white text-base leading-relaxed">{advice}</Text>
                )}
            </View>
        </ScrollView>
    );
}
