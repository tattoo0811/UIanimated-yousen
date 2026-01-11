
import { useState } from 'react';
import { AnalysisResult } from '@/types';
import { Sparkles, ArrowRight, Wind, Sun, Droplets, Mountain, Flame, MessageCircle, TrendingUp, Eye } from 'lucide-react';
import DailyAdvice from './DailyAdvice';
import ResultCard from './ResultCard';
import TimeFlowDashboard from './TimeFlowDashboard';
import { motion } from 'framer-motion';

interface HomeDashboardProps {
    result: AnalysisResult;
    onConsultCoach: () => void;
}

export default function HomeDashboard({ result, onConsultCoach }: HomeDashboardProps) {
    const [showFullChart, setShowFullChart] = useState(false);
    const [view, setView] = useState<'daily' | 'flow'>('daily');

    if (view === 'flow') {
        return <TimeFlowDashboard result={result} onBack={() => setView('daily')} />;
    }

    // Determine primary element
    const elements = [
        { name: '木', score: result.fiveElements.wood, icon: Wind, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
        { name: '火', score: result.fiveElements.fire, icon: Flame, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
        { name: '土', score: result.fiveElements.earth, icon: Mountain, color: 'text-yellow-600', bg: 'bg-yellow-600/10', border: 'border-yellow-600/30' },
        { name: '金', score: result.fiveElements.metal, icon: Sun, color: 'text-yellow-200', bg: 'bg-yellow-200/10', border: 'border-yellow-200/30' },
        { name: '水', score: result.fiveElements.water, icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    ].sort((a, b) => b.score - a.score);

    const mainElement = elements[0];

    return (
        <div className="pb-24 space-y-4 px-4">
            {/* Simplified Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-3xl border border-gold/20 relative overflow-hidden mt-4"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">あなたの本質</p>
                            <h2 className="text-2xl font-bold text-gold font-serif">{result.character.name}</h2>
                            <p className="text-sm text-gray-400 mt-1">{result.character.attributes.primary}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl ${mainElement.bg} border ${mainElement.border} flex items-center justify-center`}>
                            <mainElement.icon className={`w-7 h-7 ${mainElement.color}`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                            <p className="text-[10px] text-gray-500 mb-0.5">エネルギー</p>
                            <p className="text-lg font-bold text-white">{result.energyInterpretation.level}</p>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                            <p className="text-[10px] text-gray-500 mb-0.5">スコア</p>
                            <p className="text-lg font-bold text-white">{result.energyScore}/36</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Today's Advice */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-5 rounded-3xl border border-indigo/20"
            >
                <h3 className="text-sm font-bold text-gold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    今日の流れ
                </h3>
                <DailyAdvice birthDate={result.birthDate} birthTime={result.birthTime} />
            </motion.div>

            {/* Primary CTA - AI Coach */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={onConsultCoach}
                className="w-full py-4 bg-gradient-to-r from-gold via-yellow-600 to-gold bg-[length:200%_100%] rounded-2xl text-black font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-gold/20 hover:bg-right transition-all duration-500"
            >
                <MessageCircle className="w-5 h-5" />
                AIコーチに相談する
            </motion.button>

            {/* Secondary Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-3"
            >
                <button
                    onClick={() => setView('flow')}
                    className="glass p-4 rounded-2xl border border-white/5 hover:border-gold/30 transition-all flex flex-col items-center gap-2"
                >
                    <TrendingUp className="w-5 h-5 text-gold" />
                    <span className="text-xs text-gray-300">月運を見る</span>
                </button>
                <button
                    onClick={() => setShowFullChart(!showFullChart)}
                    className="glass p-4 rounded-2xl border border-white/5 hover:border-gold/30 transition-all flex flex-col items-center gap-2"
                >
                    <Eye className="w-5 h-5 text-gold" />
                    <span className="text-xs text-gray-300">{showFullChart ? '命式を閉じる' : '詳しい命式'}</span>
                </button>
            </motion.div>

            {/* Full Chart - Collapsed by default */}
            {showFullChart && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                >
                    <ResultCard
                        character={result.character}
                        yinSen={result.yinSen}
                        yangSen={result.yangSen}
                        taiun={result.taiun}
                        energyScore={result.energyScore}
                        energyInterpretation={result.energyInterpretation}
                        fiveElements={result.fiveElements}
                        birthDate={result.birthDate}
                        birthTime={result.birthTime}
                        onReset={() => { }}
                    />
                </motion.div>
            )}
        </div>
    );
}
