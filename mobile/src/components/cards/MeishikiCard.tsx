import { View, Text, ScrollView } from 'react-native';
import type { SanmeigakuInsenChart } from '@/src/types';
import InsenChart from '@/src/components/InsenChart';

type Props = {
    insen: SanmeigakuInsenChart;
    birthDate: string;
};

export default function MeishikiCard({ insen, birthDate }: Props) {
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    return (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="mb-4">
                <Text className="text-white text-2xl font-bold">命式表</Text>
                <Text className="text-white/50 text-sm">{formatDate(birthDate)}</Text>
            </View>

            {/* Insen Chart */}
            <InsenChart data={insen} />

            {/* Explanation */}
            <View className="bg-white/5 rounded-xl p-4 mt-4 mb-8">
                <Text className="text-white/50 text-xs leading-relaxed">
                    命式表は生年月日から算出された四柱（年・月・日）、蔵干、通変星、十二運を表示しています。{'\n'}
                    日干（日柱の天干）があなたの本質を表します。
                </Text>
            </View>
        </ScrollView>
    );
}
