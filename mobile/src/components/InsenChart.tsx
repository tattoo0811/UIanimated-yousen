import { View, Text, StyleSheet } from 'react-native';
import type { SanmeigakuInsenChart, InsenHiddenStem } from '@/src/types';

type Props = {
    data: SanmeigakuInsenChart;
};

export default function InsenChart({ data }: Props) {
    // Helper to get hidden stems for a specific pillar and type
    const getHiddenStem = (pillar: 'year' | 'month' | 'day', type: 'main' | 'sub' | 'extra') => {
        return data.hiddenStems.find(h => h.pillar === pillar && h.type === type);
    };

    // Helper to get Tsuhensei for hidden stem
    const getHiddenTsuhensei = (pillar: 'year' | 'month' | 'day', type: 'main' | 'sub' | 'extra') => {
        return data.tsuhensei.find(t => t.pillar === pillar && t.source === 'hiddenStem' && t.hiddenType === type);
    };

    // Helper to get Tsuhensei for heavenly stem
    const getHeavenlyTsuhensei = (pillar: 'year' | 'month' | 'day') => {
        return data.tsuhensei.find(t => t.pillar === pillar && t.source === 'heavenlyStem');
    };

    // Helper to get JunishiUn
    const getJunishiUn = (pillar: 'year' | 'month' | 'day') => {
        return data.junishiUn.find(j => j.pillar === pillar);
    };

    // Helper to get Phase Relations
    const getPhaseRelations = (pillar: 'year' | 'month' | 'day') => {
        // Find relations where 'from' or 'to' is this pillar
        // Actually phase relations are usually displayed below the chart in a summary or between specific pillars.
        // For this chart layout, we might just list them or indicate them.
        return data.phaseRelations.filter(r => r.from === pillar || r.to === pillar);
    };

    const renderPillarColumn = (pillarKey: 'year' | 'month' | 'day', label: string) => {
        const pillarData = data.pillars[pillarKey];
        const junishiUn = getJunishiUn(pillarKey);
        const heavenlyTsuhensei = getHeavenlyTsuhensei(pillarKey);

        const hiddenExtra = getHiddenStem(pillarKey, 'extra');
        const hiddenSub = getHiddenStem(pillarKey, 'sub');
        const hiddenMain = getHiddenStem(pillarKey, 'main');

        const tsuhenExtra = getHiddenTsuhensei(pillarKey, 'extra');
        const tsuhenSub = getHiddenTsuhensei(pillarKey, 'sub');
        const tsuhenMain = getHiddenTsuhensei(pillarKey, 'main');

        return (
            <View className="flex-1 items-center border-r border-white/10 last:border-r-0">
                <Text className="text-white/40 text-[10px] mb-2">{label}</Text>

                {/* Heavenly Stem & Tsuhensei */}
                <View className="mb-4 items-center">
                    <Text className="text-primary/70 text-[10px] mb-1">{heavenlyTsuhensei?.name || '-'}</Text>
                    <View className="w-10 h-10 rounded-lg bg-primary/20 items-center justify-center border border-primary/30">
                        <Text className="text-white text-lg font-bold">{pillarData.stem}</Text>
                    </View>
                </View>

                {/* Earthly Branch */}
                <View className="mb-4 items-center">
                    <View className="w-10 h-10 rounded-lg bg-secondary/20 items-center justify-center border border-secondary/30">
                        <Text className="text-white text-lg font-bold">{pillarData.branch}</Text>
                    </View>
                </View>

                {/* Hidden Stems (Extra -> Sub -> Main) */}
                <View className="w-full px-1 gap-1 mb-4">
                    {/* Initial (Extra) */}
                    <View className="flex-row justify-between items-center h-6">
                        <Text className="text-white/40 text-[10px] w-8 text-center">{tsuhenExtra?.name || ''}</Text>
                        <Text className="text-white/60 text-xs">{hiddenExtra?.stem || '-'}</Text>
                        <Text className="text-white/20 text-[8px] w-6 text-right">初</Text>
                    </View>
                    {/* Middle (Sub) */}
                    <View className="flex-row justify-between items-center h-6">
                        <Text className="text-white/40 text-[10px] w-8 text-center">{tsuhenSub?.name || ''}</Text>
                        <Text className="text-white/60 text-xs">{hiddenSub?.stem || '-'}</Text>
                        <Text className="text-white/20 text-[8px] w-6 text-right">中</Text>
                    </View>
                    {/* Main */}
                    <View className="flex-row justify-between items-center h-6 bg-white/5 rounded px-1">
                        <Text className="text-primary/70 text-[10px] w-8 text-center font-bold">{tsuhenMain?.name || ''}</Text>
                        <Text className="text-white text-xs font-bold">{hiddenMain?.stem || '-'}</Text>
                        <Text className="text-white/20 text-[8px] w-6 text-right">本</Text>
                    </View>
                </View>

                {/* Junishi Un */}
                <View className="bg-white/5 rounded px-2 py-1">
                    <Text className="text-white/80 text-xs">{junishiUn?.state || '-'}</Text>
                </View>
            </View>
        );
    };

    return (
        <View className="w-full bg-surface-dark rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg font-bold">陰占（命式表）</Text>
                <View className="bg-primary/20 px-2 py-1 rounded">
                    <Text className="text-primary text-xs font-bold">日干: {data.meta.dayStem}</Text>
                </View>
            </View>

            {/* Main Table */}
            <View className="flex-row border border-white/10 rounded-xl bg-background-dark/50 p-2">
                {/* Note: In Sanmeigaku, order is usually Year - Month - Day (Right to Left in traditional, but Left to Right in App) */}
                {renderPillarColumn('year', '年柱')}
                {renderPillarColumn('month', '月柱')}
                {renderPillarColumn('day', '日柱')}
            </View>

            {/* Footer Info: Tenchusatsu & Phase Relations */}
            <View className="mt-4 gap-2">
                {/* Tenchusatsu */}
                <View className="flex-row items-center gap-2">
                    <Text className="text-white/50 text-xs">天中殺:</Text>
                    <Text className="text-white font-bold">{data.tenchusatsu.type}</Text>
                    <Text className="text-white/40 text-xs">({data.tenchusatsu.missingBranches.join('')}が欠け)</Text>
                </View>

                {/* Phase Relations */}
                {data.phaseRelations.length > 0 && (
                    <View className="mt-2">
                        <Text className="text-white/50 text-xs mb-1">位相法:</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {data.phaseRelations.map((rel, idx) => (
                                <View key={idx} className="bg-white/5 px-2 py-1 rounded border border-white/5">
                                    <Text className="text-white/80 text-xs">
                                        {rel.from === 'year' ? '年' : rel.from === 'month' ? '月' : '日'}
                                        -
                                        {rel.to === 'year' ? '年' : rel.to === 'month' ? '月' : '日'}
                                        : <Text className="text-secondary font-bold">{rel.relation}</Text>
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
