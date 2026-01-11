
import { AnalysisResult } from '@/types';
import { Calendar, TrendingUp, AlertCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimeFlowDashboardProps {
    result: AnalysisResult;
    onBack: () => void;
}

export default function TimeFlowDashboard({ result, onBack }: TimeFlowDashboardProps) {
    // Mock data generation for visualization (replace with real logic later)
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() + i);
        return {
            month: `${d.getMonth() + 1}月`,
            score: 50 + Math.floor(Math.random() * 40), // Mock score 50-90
            theme: ['変化', '安定', '挑戦', '休息', '出会い', '学習'][i]
        };
    });

    return (
        <div className="pb-24 space-y-6">
            {/* Header */}
            <header className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
                >
                    ←
                </button>
                <h1 className="text-xl font-bold text-white">運気の流れ</h1>
            </header>

            {/* Monthly Flow Chart */}
            <div className="glass p-6 rounded-2xl border border-white/10">
                <h2 className="text-lg font-bold text-gold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    今後半年のバイオリズム
                </h2>
                <div className="h-40 flex items-end justify-between gap-2">
                    {months.map((m, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 w-full">
                            <div className="relative w-full flex justify-center">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${m.score}%` }}
                                    className={`w-full max-w-[20px] rounded-t-full ${m.score > 80 ? 'bg-gold' : m.score > 60 ? 'bg-gold/60' : 'bg-white/20'
                                        }`}
                                    style={{ minHeight: '20px' }}
                                />
                            </div>
                            <span className="text-xs text-gray-400">{m.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Theme Cards */}
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-white mb-2">月ごとのテーマ</h2>
                {months.slice(0, 3).map((m, i) => (
                    <div key={i} className="glass p-4 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-lg font-bold text-gray-300">
                                {m.month}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">テーマ</p>
                                <p className="text-lg font-bold text-white">{m.theme}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">運気スコア</p>
                            <p className={`text-xl font-bold ${m.score > 80 ? 'text-gold' : 'text-white'}`}>
                                {m.score}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Yearly Overview (Placeholder) */}
            <div className="glass p-6 rounded-2xl border border-gold/20 bg-gradient-to-br from-black to-gold/5">
                <h2 className="text-lg font-bold text-gold mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    2025年の大テーマ
                </h2>
                <p className="text-2xl font-bold text-white mb-2">「変革と定着」</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                    今年はあなたにとって、新しい基盤を作る重要な一年になります。
                    前半は変化が多く戸惑うかもしれませんが、後半にはそれが形となり、
                    大きな成果として定着するでしょう。
                </p>
            </div>
        </div>
    );
}
