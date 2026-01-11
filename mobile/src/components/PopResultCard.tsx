import { View, Text, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, RefreshCw, Share2, Zap } from 'lucide-react-native';
import kanshiData from '@/src/data/kanshi-types.json';
import { shareToSocial, showShareOptions } from '@/src/lib/share';
import { getCharacterByKanshi } from '@/src/data/viral-characters';

const { width, height } = Dimensions.get('window');

interface Props {
    kanshi: string;
    onReset?: () => void;
}

export default function PopResultCard({ kanshi, onReset }: Props) {
    // kanshi-types.jsonから該当タイプを検索
    const type = kanshiData.types.find(t => t.kanshi === kanshi);
    // バズり表現データを取得
    const viralData = getCharacterByKanshi(kanshi);

    if (!type) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-[#333] text-lg">タイプが見つかりませんでした</Text>
                <Text className="text-gray-600">{kanshi}</Text>
            </View>
        );
    }

    const handleShare = () => {
        const viralText = viralData?.core_style.viral_expression || type.concept;
        const shareMessage = `${type.icon} ${type.shortName}（${type.kanshi}）\n\n${viralText}\n\nラッキーカラー: ${type.luckyColor}\nラッキーアイテム: ${type.luckyItem}\n\n#${type.shortName} #${type.kanshi} #占い #運勢`;
        
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

    // カラーからグラデーション色を生成
    const getGradientColors = (baseColor: string) => {
        // より視覚的にインパクトのあるグラデーション
        // 同じ色を3回使用して統一感を保ちつつ、LinearGradientの効果で自然なグラデーションを生成
        return [
            baseColor,
            baseColor,
            baseColor,
        ];
    };

    return (
        <View className="flex-1 bg-[#FFF9E6]" style={{ paddingTop: 8, paddingBottom: 8, paddingHorizontal: 16 }}>
            {/* メインカード - グラデーション背景 */}
            <LinearGradient
                colors={getGradientColors(type.color)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1"
                style={{
                    borderWidth: 5,
                    borderColor: '#000',
                    borderRadius: 36,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    padding: 24,
                    justifyContent: 'space-between',
                }}
            >
                {/* 装飾的なスパークル */}
                <View className="absolute top-4 right-4 opacity-30">
                    <Sparkles size={32} color="#FFF" />
                </View>
                <View className="absolute bottom-20 left-4 opacity-20">
                    <Zap size={24} color="#FFF" />
                </View>

                {/* ヘッダー */}
                <View>
                    {/* Element Badge - より目立つデザイン */}
                    <View
                        className="self-center mb-3"
                        style={{
                            backgroundColor: '#000',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 999,
                            borderWidth: 2,
                            borderColor: '#FFF',
                        }}
                    >
                        <Text className="text-white text-xs font-black tracking-wider uppercase">
                            {type.element.toUpperCase()}
                        </Text>
                    </View>

                    {/* Icon & Name - より大きく、インパクトのあるデザイン */}
                    <View className="items-center mb-4">
                        <View
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                borderRadius: 999,
                                padding: 16,
                                marginBottom: 8,
                            }}
                        >
                            <Text style={{ fontSize: 72 }}>
                                {type.icon}
                            </Text>
                        </View>
                        <Text
                            className="text-4xl font-black text-center leading-tight mb-1"
                            style={{
                                color: '#000',
                                textShadowColor: 'rgba(255,255,255,0.8)',
                                textShadowOffset: { width: 0, height: 2 },
                                textShadowRadius: 4,
                            }}
                        >
                            {type.shortName}
                        </Text>
                        <Text className="text-sm font-bold text-[#000]/70">
                            {type.kanshi}（{type.reading}）
                        </Text>
                    </View>

                    {/* バズり表現 - メインコンテンツとして強調 */}
                    {character?.core_style.viral_expression && (
                        <View
                            className="p-4 mb-3"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                borderWidth: 3,
                                borderColor: '#000',
                                borderRadius: 20,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                            }}
                        >
                            <View className="flex-row items-center gap-2 mb-2">
                                <Sparkles size={20} color="#FF6B6B" />
                                <Text className="text-xs font-black text-[#FF6B6B] uppercase tracking-wider">
                                    バズり表現
                                </Text>
                            </View>
                            <Text className="text-base font-black text-[#000] leading-relaxed" style={{ lineHeight: 24 }}>
                                {character.core_style.viral_expression}
                            </Text>
                        </View>
                    )}

                    {/* Concept - サブコンテンツ */}
                    <View
                        className="p-3 items-center"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            borderWidth: 2,
                            borderColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 16,
                        }}
                    >
                        <Text className="font-bold text-[#000] text-center text-sm leading-tight" numberOfLines={2}>
                            {type.concept}
                        </Text>
                    </View>
                </View>

                {/* Middle: Personality (コンパクト) */}
                <View className="gap-2 my-2">
                    {type.personality.slice(0, 2).map((trait, idx) => (
                        <View
                            key={idx}
                            className="flex-row items-start gap-2"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.5)',
                                padding: 8,
                                borderRadius: 12,
                                borderWidth: 1.5,
                                borderColor: 'rgba(0,0,0,0.15)',
                            }}
                        >
                            <Text className="text-sm">✨</Text>
                            <Text className="flex-1 text-xs font-bold text-[#000] leading-snug" numberOfLines={2}>
                                {trait}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Bottom: Lucky Info - より視覚的に魅力的に */}
                <View>
                    <View className="flex-row gap-3 mb-3">
                        <View
                            className="flex-1 p-3 items-center"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                borderWidth: 3,
                                borderColor: '#000',
                                borderRadius: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                            }}
                        >
                            <Text className="text-xs font-black uppercase text-gray-600 mb-1">
                                🎨 Color
                            </Text>
                            <Text className="font-black text-[#000] text-sm">{type.luckyColor}</Text>
                        </View>

                        <View
                            className="flex-1 p-3 items-center"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                borderWidth: 3,
                                borderColor: '#000',
                                borderRadius: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                            }}
                        >
                            <Text className="text-xs font-black uppercase text-gray-600 mb-1">
                                ✨ Item
                            </Text>
                            <Text className="font-black text-[#000] text-sm">{type.luckyItem}</Text>
                        </View>
                    </View>

                    {/* Actions - より目立つボタンデザイン */}
                    <View className="flex-row gap-3">
                        {onReset && (
                            <TouchableOpacity
                                onPress={onReset}
                                className="flex-1 flex-row items-center justify-center gap-2 bg-white py-3"
                                style={{
                                    borderWidth: 3,
                                    borderColor: '#000',
                                    borderRadius: 16,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                }}
                            >
                                <RefreshCw size={18} color="#000" />
                                <Text className="font-black text-[#000] text-sm">もう一度</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={handleShare}
                            className="flex-1 flex-row items-center justify-center gap-2 py-3"
                            style={{
                                backgroundColor: '#000',
                                borderWidth: 3,
                                borderColor: '#FFF',
                                borderRadius: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                            }}
                        >
                            <Share2 size={18} color="#FFF" />
                            <Text className="font-black text-white text-sm">シェア</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}
