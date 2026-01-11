import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Sparkles, RefreshCw, Share2 } from 'lucide-react-native';
import kanshiData from '@/src/data/kanshi-types.json';

const { width, height } = Dimensions.get('window');

interface Props {
    kanshi: string;
    onReset?: () => void;
}

export default function PopResultCard({ kanshi, onReset }: Props) {
    // kanshi-types.jsonから該当タイプを検索
    const type = kanshiData.types.find(t => t.kanshi === kanshi);

    if (!type) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-[#333] text-lg">タイプが見つかりませんでした</Text>
                <Text className="text-gray-600">{kanshi}</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#FFF9E6]" style={{ paddingTop: 8, paddingBottom: 8, paddingHorizontal: 16 }}>
            {/* メインカード - スクロールレス */}
            <View
                className="flex-1"
                style={{
                    backgroundColor: type.color,
                    borderWidth: 4,
                    borderColor: '#333',
                    borderRadius: 32,
                    shadowColor: '#333',
                    shadowOffset: { width: 8, height: 8 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    padding: 20,
                    justifyContent: 'space-between',
                }}
            >
                {/* ヘッダー */}
                <View>
                    {/* Element Badge */}
                    <View
                        className="self-center bg-[#333] px-4 py-1 mb-2"
                        style={{ borderRadius: 999 }}
                    >
                        <Text className="text-white text-xs font-black tracking-wider uppercase">
                            {type.element.toUpperCase()}
                        </Text>
                    </View>

                    {/* Icon & Name */}
                    <View className="items-center mb-3">
                        <Text style={{ fontSize: 64, marginBottom: -8 }}>
                            {type.icon}
                        </Text>
                        <Text
                            className="text-3xl font-black text-center leading-tight"
                            style={{
                                textShadowColor: 'rgba(255,255,255,0.3)',
                                textShadowOffset: { width: 2, height: 2 },
                                textShadowRadius: 0,
                            }}
                        >
                            {type.shortName}
                        </Text>
                        <Text className="text-xs font-bold text-[#333]/60 mt-1">
                            {type.kanshi}（{type.reading}）
                        </Text>
                    </View>

                    {/* Concept */}
                    <View
                        className="p-3 items-center"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.4)',
                            borderWidth: 2,
                            borderColor: 'rgba(0,0,0,0.1)',
                            borderRadius: 16,
                        }}
                    >
                        <Text className="font-bold text-[#333] text-center text-sm leading-tight" numberOfLines={2}>
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
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                padding: 6,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(0,0,0,0.1)',
                            }}
                        >
                            <Text className="text-xs">✨</Text>
                            <Text className="flex-1 text-xs font-bold text-[#333] leading-snug" numberOfLines={2}>
                                {trait}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Bottom: Lucky Info */}
                <View>
                    <View className="flex-row gap-2 mb-2">
                        <View
                            className="flex-1 p-2 items-center"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                borderWidth: 2,
                                borderColor: '#333',
                                borderRadius: 12,
                            }}
                        >
                            <Text className="text-xs font-black uppercase text-gray-500">
                                Color
                            </Text>
                            <Text className="font-bold text-[#333] text-xs">{type.luckyColor}</Text>
                        </View>

                        <View
                            className="flex-1 p-2 items-center"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                borderWidth: 2,
                                borderColor: '#333',
                                borderRadius: 12,
                            }}
                        >
                            <Text className="text-xs font-black uppercase text-gray-500">
                                Item
                            </Text>
                            <Text className="font-bold text-[#333] text-xs">{type.luckyItem}</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-2">
                        {onReset && (
                            <TouchableOpacity
                                onPress={onReset}
                                className="flex-1 flex-row items-center justify-center gap-1 bg-white py-2"
                                style={{
                                    borderWidth: 3,
                                    borderColor: '#333',
                                    borderRadius: 12,
                                }}
                            >
                                <RefreshCw size={16} color="#333" />
                                <Text className="font-bold text-[#333] text-xs">もう一度</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center gap-1 bg-[#60A5FA] py-2"
                            style={{
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 12,
                            }}
                        >
                            <Share2 size={16} color="#fff" />
                            <Text className="font-bold text-white text-xs">シェア</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
