
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

interface DailyAdviceProps {
    birthDate: string;
    birthTime: string;
}

export default function DailyAdvice({ birthDate, birthTime }: DailyAdviceProps) {
    const [advice, setAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [dailyData, setDailyData] = useState<any>(null);

    const fetchAdvice = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai-advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ birthDate, birthTime })
            });
            const data = await res.json();
            if (data.advice) {
                setAdvice(data.advice);
                setDailyData(data.dailyFortune);
            }
        } catch (error) {
            console.error('Failed to fetch advice', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-8 mt-8 border border-gold/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gold font-serif flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    今日の運勢 AI鑑定
                </h3>
                {!advice && !loading && (
                    <button
                        onClick={fetchAdvice}
                        className="px-6 py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/50 rounded-full transition-all flex items-center gap-2 font-serif"
                    >
                        鑑定する
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                    <p className="text-gray-400 font-serif animate-pulse">星の動きを計算中...</p>
                </div>
            )}

            {advice && dailyData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Daily Parameters Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                            <p className="text-xs text-gray-500 mb-1">今日の日干支</p>
                            <p className="text-xl font-bold text-white font-serif">
                                {dailyData.dailyGanZhi.stem}{dailyData.dailyGanZhi.branch}
                            </p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                            <p className="text-xs text-gray-500 mb-1">今日の主星</p>
                            <p className="text-xl font-bold text-gold font-serif">{dailyData.dailyTenStar}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                            <p className="text-xs text-gray-500 mb-1">エネルギー</p>
                            <p className="text-xl font-bold text-white font-serif">{dailyData.dailyTwelveStar.name}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                            <p className="text-xs text-gray-500 mb-1">吉方位</p>
                            <p className="text-xl font-bold text-gold font-serif">{dailyData.luckyDirection}</p>
                        </div>
                    </div>

                    {/* AI Advice Content */}
                    <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-200 leading-relaxed font-serif">
                            {advice}
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-xs text-gray-600">Powered by Grok-4 & Sanmei Logic</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
