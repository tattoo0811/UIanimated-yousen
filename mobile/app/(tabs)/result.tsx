import { View, Text, FlatList, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { loadStorage } from '@/lib/storage';
import { useResponsive } from '@/hooks/useResponsive';
import { FortuneCard, CardSection } from '@/components/FortuneCard';
import YangSenDiagram from '@/components/YangSenDiagram';
import type { CalculationResult } from '@/types';
import tenStarsData from '@/data/ten-stars.json';
import twelveStarsData from '@/data/twelve-stars.json';
import relationshipAdviceData from '@/data/relationship-advice.json';
import positiveReframes from '@/data/positive-reframes.json';
import phaseRelationsData from '@/data/phase-relations.json';
import { checkSpecialTenchusatsu } from '@/lib/logic';

const { width } = Dimensions.get('window');

const CARD_CONFIGS = [
    { id: 1, title: '総合サマリー', icon: '🔮', color: '#A3E635' },
    { id: 2, title: '日干タイプ', icon: '✨', color: '#60A5FA' },
    { id: 3, title: '五行バランス', icon: '🌟', color: '#FB7185' },
    { id: 4, title: '陽占・人体図', icon: '🧘', color: '#FACC15' },
    { id: 5, title: '陰占・命式', icon: '📜', color: '#E2E8F0' },
    { id: 6, title: '頭（年干）', icon: '👤', color: '#A3E635' },
    { id: 7, title: '胸（月支蔵干）', icon: '💚', color: '#60A5FA' },
    { id: 8, title: '腹（月干）', icon: '🏠', color: '#FB7185' },
    { id: 9, title: '左手（年支蔵干）', icon: '👇', color: '#FACC15' },
    { id: 10, title: '右手（日支蔵干）', icon: '👆', color: '#E2E8F0' },
    { id: 11, title: '十二大従星', icon: '⭐', color: '#A855F7' },
    { id: 12, title: '天中殺', icon: '🌑', color: '#78716C' },
    { id: 13, title: '位相法', icon: '🔄', color: '#10B981' },
    { id: 14, title: '大運チャート', icon: '📈', color: '#F59E0B' },
    { id: 15, title: '仕事運', icon: '💼', color: '#3B82F6' },
    { id: 16, title: '恋愛運', icon: '💕', color: '#EC4899' },
    { id: 17, title: '家族運', icon: '👨‍👩‍👧', color: '#14B8A6' },
    { id: 18, title: '健康運', icon: '🏃', color: '#84CC16' },
    { id: 19, title: '今年の運勢', icon: '🎊', color: '#F97316' },
    { id: 20, title: '開運アクション', icon: '🎯', color: '#8B5CF6' },
];

export default function ResultTab() {
    const { fontSize } = useResponsive();
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResult();
    }, []);

    const loadResult = async () => {
        try {
            const storage = await loadStorage();
            if (storage.fortuneResults?.length > 0) {
                const latest = storage.fortuneResults[storage.fortuneResults.length - 1];
                setResult(latest.resultData);
            }
        } catch (e) {
            console.error('Failed to load result', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !result) {
        return (
            <View className="flex-1 bg-[#FFF9E6] items-center justify-center">
                <Text className="text-4xl mb-4">🔮</Text>
                <Text className="text-xl font-black text-[#333]">読み込み中...</Text>
            </View>
        );
    }

    const renderCard = ({ item }: { item: typeof CARD_CONFIGS[0] }) => {
        const CardComponent = CARD_COMPONENTS[item.id];
        return (
            <View style={{ width }}>
                <CardComponent result={result} config={item} />
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#FFF9E6]">
            <FlatList
                data={CARD_CONFIGS}
                renderItem={renderCard}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            />
        </View>
    );
}

// カードコンポーネントマップ
const CARD_COMPONENTS: Record<number, React.FC<{ result: CalculationResult; config: typeof CARD_CONFIGS[0] }>> = {
    1: Card1Summary,
    2: Card2DayStem,
    3: Card3FiveElements,
    4: Card4YangSen,
    5: Card5Insen,
    6: Card6Head,
    7: Card7Chest,
    8: Card8Belly,
    9: Card9LeftHand,
    10: Card10RightHand,
    11: Card11TwelveStars,
    12: Card12Tenchusatsu,
    13: Card13PhaseRelations,
    14: Card14Taiun,
    15: Card15Work,
    16: Card16Love,
    17: Card17Family,
    18: Card18Health,
    19: Card19YearFortune,
    20: Card20LuckyActions,
};

// カード1: 100点の総合サマリー
function Card1Summary({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const { bazi, yangSen, energyScore } = result.result;

    // 日干支からkanshi-typesのデータを取得
    const kanshi = bazi.day.stemStr + bazi.day.branchStr;
    const kanshiData = require('@/src/data/kanshi-types.json').types.find(
        (t: any) => t.kanshi === kanshi
    );

    // 中心星のデータ
    const chestStarData = tenStarsData.stars.find(s => s.name === yangSen.chest);

    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            {/* メインタイトル: タイプ名 */}
            <View
                className="items-center p-5 mb-4"
                style={{
                    backgroundColor: kanshiData?.color || '#FACC15',
                    borderWidth: 3,
                    borderColor: '#333',
                    borderRadius: 20,
                    shadowColor: '#333',
                    shadowOffset: { width: 4, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                }}
            >
                <Text style={{ fontSize: 40 }}>{kanshiData?.icon || '🔮'}</Text>
                <Text
                    className="text-[#333] font-black mt-2 text-center"
                    style={{ fontSize: fontSize.xl, fontFamily: 'Tamanegi' }}
                >
                    {kanshiData?.name || kanshi}
                </Text>
                <Text className="text-[#333]/60 font-bold mt-1" style={{ fontSize: fontSize.sm }}>
                    {kanshi}（{kanshiData?.reading || ''}）
                </Text>
            </View>

            {/* コンセプト: ひと目でわかる説明 */}
            <CardSection title="あなたはこんな人" color="#fff">
                <Text className="text-[#333] font-medium leading-6" style={{ fontSize: fontSize.md }}>
                    {kanshiData?.concept || '独自の才能を持つ個性派'}
                </Text>
            </CardSection>

            {/* 性格特徴 */}
            {kanshiData?.personality && (
                <CardSection title="性格のポイント">
                    {kanshiData.personality.map((trait: string, idx: number) => (
                        <Text key={idx} className="text-[#333] mb-2" style={{ fontSize: fontSize.sm }}>
                            {trait}
                        </Text>
                    ))}
                </CardSection>
            )}

            {/* 強み・弱み */}
            <View className="flex-row mb-4" style={{ gap: 8 }}>
                <View
                    className="flex-1 p-4"
                    style={{
                        backgroundColor: '#D1FAE5',
                        borderWidth: 3,
                        borderColor: '#333',
                        borderRadius: 16,
                    }}
                >
                    <Text className="text-[#333] font-bold mb-2" style={{ fontSize: fontSize.sm }}>💪 強み</Text>
                    <Text className="text-[#333]" style={{ fontSize: fontSize.xs }}>
                        {kanshiData?.strengths || chestStarData?.keywords.join('・')}
                    </Text>
                </View>
                <View
                    className="flex-1 p-4"
                    style={{
                        backgroundColor: '#FEE2E2',
                        borderWidth: 3,
                        borderColor: '#333',
                        borderRadius: 16,
                    }}
                >
                    <Text className="text-[#333] font-bold mb-2" style={{ fontSize: fontSize.sm }}>⚠️ 注意点</Text>
                    <Text className="text-[#333]" style={{ fontSize: fontSize.xs }}>
                        {kanshiData?.weaknesses || '特になし'}
                    </Text>
                </View>
            </View>

            {/* 開運アドバイス */}
            <CardSection title="🎯 開運アドバイス" color="#FEF3C7">
                <Text className="text-[#333] font-medium" style={{ fontSize: fontSize.sm }}>
                    {kanshiData?.advice || '自分らしく生きることで運が開けます'}
                </Text>
            </CardSection>

            {/* おまけ情報 */}
            <View className="flex-row mt-2" style={{ gap: 8 }}>
                <View className="flex-1 bg-white p-3 rounded-xl" style={{ borderWidth: 2, borderColor: '#333' }}>
                    <Text className="text-[#666] font-bold mb-1" style={{ fontSize: 10 }}>🎨 ラッキーカラー</Text>
                    <Text className="text-[#333] font-bold" style={{ fontSize: fontSize.sm }}>
                        {kanshiData?.luckyColor || '−'}
                    </Text>
                </View>
                <View className="flex-1 bg-white p-3 rounded-xl" style={{ borderWidth: 2, borderColor: '#333' }}>
                    <Text className="text-[#666] font-bold mb-1" style={{ fontSize: 10 }}>✨ ラッキーアイテム</Text>
                    <Text className="text-[#333] font-bold" style={{ fontSize: fontSize.sm }}>
                        {kanshiData?.luckyItem || '−'}
                    </Text>
                </View>
            </View>

            {/* 詳細情報リンク */}
            <View className="mt-4 p-3 bg-[#333] rounded-xl items-center">
                <Text className="text-white font-bold" style={{ fontSize: fontSize.sm }}>
                    👆 スワイプして詳細を見る
                </Text>
                <Text className="text-white/60 mt-1" style={{ fontSize: 10 }}>
                    中心星: {yangSen.chest} / エネルギー: {energyScore}点
                </Text>
            </View>
        </FortuneCard>
    );
}

function Card2DayStem({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const kanshi = result.result.bazi.day.stemStr + result.result.bazi.day.branchStr;
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title="干支">
                <Text className="text-[#333] font-bold text-center" style={{ fontSize: fontSize.xl, fontFamily: 'Tamanegi' }}>{kanshi}</Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card3FiveElements({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const { fiveElements } = result.result;
    const labels: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title="五行の点数">
                {Object.entries(fiveElements).map(([key, value]) => (
                    <View key={key} className="flex-row justify-between mb-2">
                        <Text className="text-[#333] font-bold" style={{ fontSize: fontSize.md }}>{labels[key]}</Text>
                        <Text className="text-[#333]" style={{ fontSize: fontSize.md }}>{value}</Text>
                    </View>
                ))}
            </CardSection>
        </FortuneCard>
    );
}

function Card4YangSen({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const { yangSen } = result.result;
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <View className="mb-4">
                <YangSenDiagram yangSen={yangSen} />
            </View>
            <CardSection title="陽占の見方">
                <Text className="text-[#666] mb-2" style={{ fontSize: fontSize.sm }}>• 頭: 社会での姿勢（年干から算出）</Text>
                <Text className="text-[#666] mb-2" style={{ fontSize: fontSize.sm }}>• 胸: 本質・中心性格（月支蔵干から算出）</Text>
                <Text className="text-[#666] mb-2" style={{ fontSize: fontSize.sm }}>• 腹: 家庭での姿勢（月干から算出）</Text>
                <Text className="text-[#666] mb-2" style={{ fontSize: fontSize.sm }}>• 左手: 目下との関係（年支蔵干から算出）</Text>
                <Text className="text-[#666] mb-2" style={{ fontSize: fontSize.sm }}>• 右手: 目上との関係（日支蔵干から算出）</Text>
                <Text className="text-[#666] mt-3" style={{ fontSize: fontSize.xs }}>※左右は自分から見た視点です</Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card5Insen({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const { insen } = result.result;
    if (!insen) return <FortuneCard title={config.title} icon={config.icon} color={config.color}><Text>データなし</Text></FortuneCard>;
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title="命式">
                <Text className="text-[#666] mb-2" style={{ fontSize: fontSize.sm }}>年柱: {insen.pillars.year.stem}{insen.pillars.year.branch}</Text>
                <Text className="text-[#666] mb-2" style={{ fontSize: fontSize.sm }}>月柱: {insen.pillars.month.stem}{insen.pillars.month.branch}</Text>
                <Text className="text-[#666] mb-2" style={{ fontSize: fontSize.sm }}>日柱: {insen.pillars.day.stem}{insen.pillars.day.branch}</Text>
            </CardSection>
            <CardSection title="天中殺">
                <Text className="text-[#333] font-bold" style={{ fontSize: fontSize.md }}>{insen.tenchusatsu.type}</Text>
            </CardSection>
        </FortuneCard>
    );
}

// カード6-10: 部位別詳細
function Card6Head({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const star = result.result.yangSen.head;
    const starData = tenStarsData.stars.find(s => s.name === star);
    const advice = relationshipAdviceData.advice.find(a => a.star === star);
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title={star}>
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{starData?.bodyPosition.head || '社会での姿勢を表します'}</Text>
            </CardSection>
            {advice && (
                <CardSection title="社会・仕事での強み">
                    <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{advice.relationships.society.strength}</Text>
                </CardSection>
            )}
        </FortuneCard>
    );
}

function Card7Chest({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const star = result.result.yangSen.chest;
    const starData = tenStarsData.stars.find(s => s.name === star);
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title={star}>
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{starData?.fullDesc || ''}</Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card8Belly({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const star = result.result.yangSen.belly;
    const starData = tenStarsData.stars.find(s => s.name === star);
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title={star}>
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{starData?.bodyPosition.belly || '家庭での姿勢を表します'}</Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card9LeftHand({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const star = result.result.yangSen.leftHand;
    const advice = relationshipAdviceData.advice.find(a => a.star === star);
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title={star}>
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{advice?.relationships.subordinate.strength || '目下との関係'}</Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card10RightHand({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const star = result.result.yangSen.rightHand;
    const advice = relationshipAdviceData.advice.find(a => a.star === star);
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title={star}>
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{advice?.relationships.superior.strength || '目上との関係'}</Text>
            </CardSection>
        </FortuneCard>
    );
}

// カード11-14: 陰占・大運
function Card11TwelveStars({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const { yangSen } = result.result;
    const stars = [yangSen.leftShoulder, yangSen.rightLeg, yangSen.leftLeg];
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            {stars.map((star, idx) => {
                const starData = twelveStarsData.stars.find(s => s.name === star.name);
                return (
                    <CardSection key={idx} title={star.name}>
                        <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{starData?.shortDesc || ''} ({star.score}点)</Text>
                    </CardSection>
                );
            })}
        </FortuneCard>
    );
}

function Card12Tenchusatsu({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const { bazi, insen } = result.result;
    if (!insen) return <FortuneCard title={config.title} icon={config.icon} color={config.color}><Text>データなし</Text></FortuneCard>;

    const specialCheck = checkSpecialTenchusatsu(bazi);
    const hasSpecialCase = specialCheck.specialCases.length > 0;
    const reframe = positiveReframes.reframes.tenchusatsu;

    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            {/* メインメッセージ */}
            <View
                className="items-center p-5 mb-4"
                style={{ backgroundColor: '#E0E7FF', borderWidth: 3, borderColor: '#333', borderRadius: 20 }}
            >
                <Text style={{ fontSize: 32 }}>🌟</Text>
                <Text className="text-[#333] font-black mt-2 text-center" style={{ fontSize: fontSize.lg }}>
                    {reframe.positiveReframe}
                </Text>
                <Text className="text-[#333]/60 font-bold mt-1" style={{ fontSize: fontSize.sm }}>
                    {insen.tenchusatsu.type}（{insen.tenchusatsu.missingBranches.join('・')}）
                </Text>
            </View>

            <CardSection title="この配置が意味すること">
                <Text className="text-[#333] leading-6" style={{ fontSize: fontSize.sm }}>
                    {reframe.description}
                </Text>
            </CardSection>

            <CardSection title="🌱 活かし方" color="#D1FAE5">
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>
                    {reframe.actionAdvice}
                </Text>
            </CardSection>

            {hasSpecialCase && (
                <CardSection title="✨ あなたの特別な資質" color="#FEF3C7">
                    {specialCheck.specialCases.map((caseType, idx) => {
                        const caseKey = caseType === '生年天中殺' ? 'seinentenchusatsu'
                            : caseType === '生月天中殺' ? 'seigetsutenchusatsu'
                                : 'seijitsutenchusatsu';
                        const caseReframe = (positiveReframes.reframes as any)[caseKey];
                        return (
                            <View key={idx} className="mb-3">
                                <Text className="text-[#333] font-bold mb-1" style={{ fontSize: fontSize.md }}>
                                    {caseReframe?.positiveReframe || caseType}
                                </Text>
                                <Text className="text-[#666]" style={{ fontSize: fontSize.sm }}>
                                    {caseReframe?.description || ''}
                                </Text>
                            </View>
                        );
                    })}
                </CardSection>
            )}
        </FortuneCard>
    );
}

function Card13PhaseRelations({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const { insen } = result.result;
    if (!insen) return <FortuneCard title={config.title} icon={config.icon} color={config.color}><Text>データなし</Text></FortuneCard>;

    const phases = phaseRelationsData.phases as Record<string, any>;

    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            {insen.phaseRelations.length > 0 ? (
                insen.phaseRelations.map((rel, idx) => {
                    const phaseKey = rel.relation === '合' ? 'gou'
                        : rel.relation === '冲' ? 'chuu'
                            : rel.relation === '刑' ? 'kei'
                                : rel.relation === '害' ? 'gai' : 'ha';
                    const phaseData = phases[phaseKey];

                    return (
                        <View key={idx} className="mb-4">
                            <View
                                className="p-4 mb-2"
                                style={{ backgroundColor: phaseData?.color || '#E2E8F0', borderWidth: 3, borderColor: '#333', borderRadius: 16 }}
                            >
                                <Text style={{ fontSize: 24 }}>{phaseData?.icon || '🔄'}</Text>
                                <Text className="text-[#333] font-black mt-1" style={{ fontSize: fontSize.md }}>
                                    {rel.from}柱 × {rel.to}柱: {phaseData?.name || rel.relation}
                                </Text>
                                <Text className="text-[#333]/70 font-bold mt-1" style={{ fontSize: fontSize.sm }}>
                                    {phaseData?.shortDesc || ''}
                                </Text>
                            </View>
                            <Text className="text-[#666]" style={{ fontSize: fontSize.sm }}>
                                {phaseData?.lifeAdvice || ''}
                            </Text>
                        </View>
                    );
                })
            ) : (
                <CardSection title="調和の配置" color="#D1FAE5">
                    <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>
                        命式内に特別な緊張関係はありません。これは内なる調和を意味し、自分のペースで穏やかに進める資質です。
                    </Text>
                </CardSection>
            )}
        </FortuneCard>
    );
}

function Card14Taiun({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const { taiun } = result.result;
    if (!taiun) return <FortuneCard title={config.title} icon={config.icon} color={config.color}><Text>データなし</Text></FortuneCard>;

    // 現在の年齢を計算（生年月日から）
    const birthDate = new Date(result.input.birthDate);
    const now = new Date();
    const currentAge = now.getFullYear() - birthDate.getFullYear();

    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title="大運サイクル（全期間）">
                <Text className="text-[#666] mb-3" style={{ fontSize: fontSize.xs }}>
                    {taiun.direction === 'forward' ? '順行' : '逆行'} / 立運{taiun.startAge}歳
                </Text>
                {taiun.cycles.map((cycle, idx) => {
                    const isCurrent = currentAge >= cycle.startAge && currentAge <= cycle.endAge;
                    return (
                        <View
                            key={idx}
                            className="flex-row items-center mb-2 p-2 rounded-lg"
                            style={{ backgroundColor: isCurrent ? '#A3E635' : 'transparent' }}
                        >
                            <View className="w-16">
                                <Text
                                    className="font-bold"
                                    style={{ fontSize: fontSize.sm, color: isCurrent ? '#333' : '#666' }}
                                >
                                    {cycle.startAge}-{cycle.endAge}歳
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text
                                    className="font-bold"
                                    style={{ fontSize: fontSize.md, color: isCurrent ? '#333' : '#333' }}
                                >
                                    {cycle.name}
                                </Text>
                            </View>
                            <View>
                                <Text style={{ fontSize: fontSize.xs, color: '#666' }}>
                                    {cycle.tenStar}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </CardSection>
        </FortuneCard>
    );
}

// カード15-20: 関係性・開運
function Card15Work({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const star = result.result.yangSen.chest;
    const advice = relationshipAdviceData.advice.find(a => a.star === star);
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title="仕事運">
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{advice?.relationships.society.action || '仕事で活躍できます'}</Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card16Love({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const star = result.result.yangSen.chest;
    const starData = tenStarsData.stars.find(s => s.name === star);
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title="恋愛運">
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{starData?.advice.love || '恋愛運'}</Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card17Family({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const star = result.result.yangSen.belly;
    const starData = tenStarsData.stars.find(s => s.name === star);
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title="家族運">
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>{starData?.advice.family || '家族運'}</Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card18Health({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const { fiveElements, insen } = result.result;
    const weakElement = Object.entries(fiveElements).sort((a, b) => a[1] - b[1])[0];
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title="健康アドバイス">
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>
                    {insen?.fiveElements.dayStemStrength === 'weak' ? '身弱のため、無理は禁物です。' : 'バランスの良い生活を心がけましょう。'}
                </Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card19YearFortune({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const year = new Date().getFullYear();
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title={`${year}年の運勢`}>
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>今年の運勢は次の更新で追加予定</Text>
            </CardSection>
        </FortuneCard>
    );
}

function Card20LuckyActions({ result, config }: { result: CalculationResult; config: typeof CARD_CONFIGS[0] }) {
    const { fontSize } = useResponsive();
    const star = result.result.yangSen.chest;
    const starData = tenStarsData.stars.find(s => s.name === star);
    return (
        <FortuneCard title={config.title} icon={config.icon} color={config.color}>
            <CardSection title="ラッキーカラー">
                <Text className="text-[#333] text-center font-bold" style={{ fontSize: fontSize.lg }}>{starData?.color || '#333'}</Text>
            </CardSection>
            <CardSection title="開運アクション">
                <Text className="text-[#333]" style={{ fontSize: fontSize.sm }}>中心星の特性を活かした行動を心がけましょう</Text>
            </CardSection>
        </FortuneCard>
    );
}
