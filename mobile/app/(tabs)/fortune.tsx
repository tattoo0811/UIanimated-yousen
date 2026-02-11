import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { Send, Sparkles, Calendar, ArrowRight, Flame } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useResponsive } from '@/hooks/useResponsive';
import { loadStorage } from '@/lib/storage';
import type { CalculationResult } from '@/types';
import FortuneCard from '@/components/cards/FortuneCard';
import WeeklyFortuneCard from '@/components/cards/WeeklyFortuneCard';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

type TabType = 'daily' | 'weekly' | 'chat';

export default function FortuneTab() {
    const router = useRouter();
    const { contentPadding, fontSize } = useResponsive();
    const [activeTab, setActiveTab] = useState<TabType>('daily');
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'こんにちは！🔮\n\n私はGOGYO POP!のAI占い師です。陰陽五行論に基づいて、あなたのお悩みや質問にお答えします。\n\n何でもお気軽にご相談ください！',
            timestamp: new Date(),
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

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

    const handleSend = async () => {
        if (!inputText.trim() || chatLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setChatLoading(true);

        // TODO: API統合（OpenAI/Claude）
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `「${inputText}」についてですね。\n\n陰陽五行論の観点から申し上げますと、あなたの運気は現在上昇傾向にあります。特に木の気が強まっているため、新しいことに挑戦する絶好のタイミングです。\n\n詳しい診断は「鑑定」タブから生年月日を入力して診断してみてください！`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            setChatLoading(false);

            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, 1500);
    };

    // タブコンテンツのレンダリング
    const renderTabContent = () => {
        if (activeTab === 'daily') {
            if (loading) {
                return (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-white text-lg">読み込み中...</Text>
                    </View>
                );
            }
            if (!result) {
                return (
                    <View className="flex-1 items-center justify-center px-4">
                        <Text className="text-white text-center leading-relaxed">
                            運勢を表示するには、まず「鑑定」タブから生年月日を入力して診断を行ってください。
                        </Text>
                    </View>
                );
            }
            return (
                <FortuneCard
                    insen={result.result.insen!}
                    birthDate={new Date(result.input.birthDate)}
                />
            );
        }

        if (activeTab === 'weekly') {
            if (loading) {
                return (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-white text-lg">読み込み中...</Text>
                    </View>
                );
            }
            if (!result) {
                return (
                    <View className="flex-1 items-center justify-center px-4">
                        <Text className="text-white text-center leading-relaxed">
                            運勢を表示するには、まず「鑑定」タブから生年月日を入力して診断を行ってください。
                        </Text>
                    </View>
                );
            }
            return (
                <WeeklyFortuneCard
                    insen={result.result.insen!}
                    birthDate={new Date(result.input.birthDate)}
                />
            );
        }

        // Chat tab
        return (
            <>
                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerStyle={{ padding: contentPadding, paddingBottom: 32, alignItems: 'center' }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ width: '100%', maxWidth: 800 }}>
                        {messages.map((message) => (
                            <View
                                key={message.id}
                                className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <View
                                    className="max-w-[80%] p-4"
                                    style={{
                                        backgroundColor: message.role === 'user' ? '#60A5FA' : '#fff',
                                        borderWidth: 3,
                                        borderColor: '#333',
                                        borderRadius: 16,
                                        shadowColor: '#333',
                                        shadowOffset: { width: 3, height: 3 },
                                        shadowOpacity: 1,
                                        shadowRadius: 0,
                                    }}
                                >
                                    <Text
                                        className={`font-bold leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-[#333]'}`}
                                        style={{ fontSize: fontSize.sm }}
                                    >
                                        {message.content}
                                    </Text>
                                </View>
                                <Text className="text-xs text-gray-500 mt-1 px-2">
                                    {message.timestamp.toLocaleTimeString('ja-JP', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </View>
                        ))}

                        {chatLoading && (
                            <View className="items-start mb-4">
                                <View
                                    className="p-4 flex-row items-center gap-2"
                                    style={{
                                        backgroundColor: '#fff',
                                        borderWidth: 3,
                                        borderColor: '#333',
                                        borderRadius: 16,
                                    }}
                                >
                                    <Sparkles size={20} color="#FB7185" />
                                    <Text className="font-bold text-[#333]" style={{ fontSize: fontSize.sm }}>考え中...</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Input */}
                <View
                    className="p-4"
                    style={{
                        backgroundColor: '#FFF9E6',
                        borderTopWidth: 3,
                        borderTopColor: '#333',
                        alignItems: 'center',
                    }}
                >
                    <View style={{ width: '100%', maxWidth: 800, flexDirection: 'row', gap: 8 }}>
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="メッセージを入力..."
                            multiline
                            maxLength={500}
                            className="flex-1 bg-white p-4 font-bold text-[#333]"
                            style={{
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 16,
                                maxHeight: 100,
                                fontSize: fontSize.sm,
                            }}
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim() || chatLoading}
                            className="w-14 h-14 items-center justify-center"
                            style={{
                                backgroundColor: inputText.trim() && !chatLoading ? '#FB7185' : '#ccc',
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 16,
                            }}
                        >
                            <Send size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        );
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-[#FFF9E6]"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}
        >
            {/* Header */}
            <View
                className="px-4 pt-14 pb-4"
                style={{
                    backgroundColor: '#FB7185',
                    borderBottomWidth: 3,
                    borderBottomColor: '#333',
                    alignItems: 'center',
                }}
            >
                <View style={{ width: '100%', maxWidth: 800 }}>
                    <View className="flex-row items-center justify-center gap-3 mb-4">
                        <Text style={{ fontSize: fontSize.xl }}>🔮</Text>
                        <View>
                            <Text className="font-black text-white" style={{ fontSize: fontSize.lg }}>運勢</Text>
                            <Text className="font-bold text-white/80" style={{ fontSize: fontSize.sm }}>
                                今日と今週の運気をチェック
                            </Text>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => setActiveTab('daily')}
                            className="flex-1 py-2 px-4 rounded-lg items-center"
                            style={{
                                backgroundColor: activeTab === 'daily' ? '#fff' : 'transparent',
                                borderWidth: 2,
                                borderColor: '#fff',
                            }}
                        >
                            <Text
                                className="font-bold"
                                style={{
                                    color: activeTab === 'daily' ? '#FB7185' : '#fff',
                                    fontSize: fontSize.sm,
                                }}
                            >
                                今日の運勢
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('weekly')}
                            className="flex-1 py-2 px-4 rounded-lg items-center"
                            style={{
                                backgroundColor: activeTab === 'weekly' ? '#fff' : 'transparent',
                                borderWidth: 2,
                                borderColor: '#fff',
                            }}
                        >
                            <Text
                                className="font-bold"
                                style={{
                                    color: activeTab === 'weekly' ? '#FB7185' : '#fff',
                                    fontSize: fontSize.sm,
                                }}
                            >
                                今週の運勢
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('chat')}
                            className="flex-1 py-2 px-4 rounded-lg items-center"
                            style={{
                                backgroundColor: activeTab === 'chat' ? '#fff' : 'transparent',
                                borderWidth: 2,
                                borderColor: '#fff',
                            }}
                        >
                            <Text
                                className="font-bold"
                                style={{
                                    color: activeTab === 'chat' ? '#FB7185' : '#fff',
                                    fontSize: fontSize.sm,
                                }}
                            >
                                AI占い師
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Zodiac Swipe Entry Card */}
            <View
                className="mx-4 -mt-2 p-4 mb-3"
                style={{
                    backgroundColor: '#8B5CF6',
                    borderWidth: 3,
                    borderColor: '#fff',
                    borderRadius: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.push('/zodiac-select')}
                    className="flex-row items-center justify-between"
                >
                    <View className="flex-row items-center gap-3">
                        <View
                            className="w-14 h-14 items-center justify-center"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 12,
                            }}
                        >
                            <Sparkles size={28} color="#fff" />
                        </View>
                        <View>
                            <Text className="font-black text-white text-lg">干支スワイプ占い</Text>
                            <Text className="text-white/80 text-sm">スワイプして運勢をチェック</Text>
                        </View>
                    </View>
                    <View
                        className="w-10 h-10 items-center justify-center"
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 10,
                        }}
                    >
                        <ArrowRight size={20} color="#8B5CF6" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* 2026年運 Entry Card */}
            <View
                className="mx-4 p-4 mb-3"
                style={{
                    backgroundColor: '#FFD700',
                    borderWidth: 3,
                    borderColor: '#333',
                    borderRadius: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.push('/year-fortune')}
                    className="flex-row items-center justify-between"
                >
                    <View className="flex-row items-center gap-3">
                        <View
                            className="w-14 h-14 items-center justify-center"
                            style={{
                                backgroundColor: 'rgba(26, 10, 10, 0.3)',
                                borderRadius: 12,
                            }}
                        >
                            <Flame size={28} color="#1A0A0A" />
                        </View>
                        <View>
                            <Text className="font-black text-[#1A0A0A] text-lg">2026年運</Text>
                            <Text className="text-[#1A0A0A]/70 text-sm">丙午の年の運勢をチェック</Text>
                        </View>
                    </View>
                    <View
                        className="w-10 h-10 items-center justify-center"
                        style={{
                            backgroundColor: '#1A0A0A',
                            borderRadius: 10,
                        }}
                    >
                        <ArrowRight size={20} color="#FFD700" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View className="flex-1 bg-[#0A0A0A]">
                {renderTabContent()}
            </View>
        </KeyboardAvoidingView>
    );
}
