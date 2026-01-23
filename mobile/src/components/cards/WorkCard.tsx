import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import type { SanmeigakuInsenChart } from '@/src/types';
import { Briefcase } from 'lucide-react-native';

type Props = {
    insen: SanmeigakuInsenChart;
};

// ローカルアドバイスデータ（Turso APIの代わり）
const getWorkAdvice = (kanshi: string, characterName?: string): string => {
    const name = characterName || kanshi;

    // 主要な特徴に基づくアドバイス生成
    const adviceMap: Record<string, string> = {
        '甲': 'リーダーシップを発揮できる仕事が向いています。大木のように堂々と構え、チームを率いる役割で力を発揮します。',
        '乙': '柔軟性を活かせる仕事が向いています。草花のようにしなやかに対応し、協調性を活かした役割で輝きます。',
        '丙': '人前に立つ仕事や営業が向いています。太陽のように明るく情熱的に、周囲を照らす存在になれます。',
        '丁': '細やかな配慮が必要な仕事が向いています。ろうそくの炎のように繊細に、丁寧な仕事ぶりが評価されます。',
        '戊': '安定した環境で力を発揮します。山のようにどっしりとした信頼感で、組織の柱となる存在です。',
        '己': '人を育てる仕事が向いています。田畑のように育む力で、後輩や部下の成長を支えます。',
        '庚': '専門性を活かせる仕事が向いています。刀のように鋭い判断力で、難題を解決する力があります。',
        '辛': '美的センスを活かせる仕事が向いています。宝石のように美しく繊細に、質の高い仕事を追求します。',
        '壬': '自由度の高い仕事が向いています。大海のように広大な視野で、型にはまらない発想が強みです。',
        '癸': '裏方で支える仕事が向いています。雨や露のように静かに、確実にサポートする力があります。',
    };

    const stem = kanshi[0];
    const baseAdvice = adviceMap[stem] || '自分の特性を活かした仕事選びが重要です。';

    return `【${name}の仕事運】\n\n${baseAdvice}\n\n【行動提案】\n1. 自分の強みを活かせる環境を選ぶ\n2. 弱点を補う努力を継続する\n3. 長期的なキャリア計画を立てる`;
};

export default function WorkCard({ insen }: Props) {
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

            // ローカルアドバイス生成
            const adviceText = getWorkAdvice(kanshi);
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
            {/* Header */}
            <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-3">
                    <Briefcase color="#f425f4" size={24} />
                </View>
                <View>
                    <Text className="text-white text-2xl font-bold">仕事の悩み</Text>
                    <Text className="text-white/50 text-sm">キャリア・適職・職場関係</Text>
                </View>
            </View>

            {/* Content */}
            <View className="bg-surface-dark rounded-2xl p-6 mb-6">
                {loading ? (
                    <ActivityIndicator color="#f425f4" />
                ) : (
                    <Text className="text-white text-base leading-relaxed">{advice}</Text>
                )}
            </View>
        </ScrollView>
    );
}
