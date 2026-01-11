import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react-native';
import { useResponsive } from '@/src/hooks/useResponsive';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function FortuneTab() {
    const { contentPadding, fontSize } = useResponsive();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'こんにちは！🔮\n\n私はGOGYO POP!のAI占い師です。陰陽五行論に基づいて、あなたのお悩みや質問にお答えします。\n\n何でもお気軽にご相談ください！',
            timestamp: new Date(),
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = async () => {
        if (!inputText.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        // TODO: API統合（OpenAI/Claude）
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `「${inputText}」についてですね。\n\n陰陽五行論の観点から申し上げますと、あなたの運気は現在上昇傾向にあります。特に木の気が強まっているため、新しいことに挑戦する絶好のタイミングです。\n\n詳しい診断は「鑑定」タブから生年月日を入力して診断してみてください！`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            setLoading(false);

            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, 1500);
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
                    <View className="flex-row items-center justify-center gap-3">
                        <Text style={{ fontSize: fontSize.xl }}>🔮</Text>
                        <View>
                            <Text className="font-black text-white" style={{ fontSize: fontSize.lg }}>AI占い師</Text>
                            <Text className="font-bold text-white/80" style={{ fontSize: fontSize.sm }}>
                                何でも相談してください
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

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

                    {loading && (
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
                        disabled={!inputText.trim() || loading}
                        className="w-14 h-14 items-center justify-center"
                        style={{
                            backgroundColor: inputText.trim() && !loading ? '#FB7185' : '#ccc',
                            borderWidth: 3,
                            borderColor: '#333',
                            borderRadius: 16,
                        }}
                    >
                        <Send size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
