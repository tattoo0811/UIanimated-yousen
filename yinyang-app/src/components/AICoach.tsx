
import { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '@/types';
import { Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AICoachProps {
    result: AnalysisResult;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    options?: string[];
    timestamp: Date;
}

export default function AICoach({ result }: AICoachProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `こんにちは、${result.character.name}さん。\n陰陽五行ライフコーチです。\n\n今の運気の流れや、抱えている悩みについて、何でも相談してください。`,
            options: ["今日の運勢は？", "仕事の悩み", "人間関係について"],
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai-advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate: result.birthDate,
                    birthTime: result.birthTime,
                    type: 'coaching',
                    userQuestion: text
                })
            });

            const data = await res.json();

            if (data.advice) {
                let content = data.advice;
                let options: string[] = [];

                try {
                    // Try to parse JSON from the response (it might be wrapped in markdown code blocks)
                    const cleanJson = data.advice.replace(/```json\n|\n```/g, '').trim();
                    const parsed = JSON.parse(cleanJson);
                    content = parsed.text;
                    options = parsed.options || [];
                } catch (e) {
                    // Fallback if not JSON
                    console.log('Response was not JSON', e);
                }

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: content,
                    options: options,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                throw new Error('No advice returned');
            }
        } catch (error) {
            console.error('Failed to send message', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '申し訳ありません。通信エラーが発生しました。もう一度お試しください。',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const PRESETS = [
        "今日の運勢と過ごし方は？",
        "最近、やる気が出ない...",
        "人間関係で悩んでいます",
        "仕事の方向性を相談したい"
    ];

    // Only show presets if the last message has no options or is from user (initial state mainly)
    const showPresets = messages.length === 1;

    return (
        <div className="flex flex-col h-[calc(100vh-180px)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/50">
                    <Bot className="w-6 h-6 text-gold" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">AIライフコーチ</h2>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Online
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 glass rounded-2xl border border-white/10 mb-4 scrollbar-hide">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gold/20 border border-gold/30'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-gold" />}
                        </div>
                        <div className={`max-w-[80%] space-y-2`}>
                            <div className={`rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-gray-700 text-white rounded-tr-none'
                                : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
                                }`}>
                                {msg.content}
                            </div>

                            {/* Render Options if available and it's the latest message */}
                            {msg.options && msg.options.length > 0 && idx === messages.length - 1 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {msg.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(opt)}
                                            disabled={loading}
                                            className="px-3 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-xl text-xs text-gold transition-colors text-left"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
                            <Loader2 className="w-4 h-4 text-gold animate-spin" />
                        </div>
                        <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 border border-white/5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="space-y-3">
                {/* Presets (Only show if no dynamic options are active) */}
                {showPresets && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {PRESETS.map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(preset)}
                                disabled={loading}
                                className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-gray-300 transition-colors disabled:opacity-50"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                )}

                {/* Text Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="相談内容を入力..."
                        disabled={loading}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
