'use client';

import { motion } from 'framer-motion';
import { AnalysisResult } from '@/types';
import FiveElementsChart from './FiveElementsChart';
import YinSenChart from './YinSenChart';
import YangSenChart from './YangSenChart';
import TaiunChart from './TaiunChart';
import DailyAdvice from './DailyAdvice';

interface ResultCardProps {
    character: AnalysisResult['character'];
    yinSen: AnalysisResult['yinSen'];
    yangSen: AnalysisResult['yangSen'];
    taiun: AnalysisResult['taiun'];
    energyScore: number;
    energyInterpretation: AnalysisResult['energyInterpretation'];
    fiveElements: AnalysisResult['fiveElements'];
    birthDate: string;
    birthTime: string;
    onReset: () => void;
}

export default function ResultCard({ character, yinSen, yangSen, taiun, energyScore, energyInterpretation, fiveElements, birthDate, birthTime, onReset }: ResultCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto space-y-8 pb-20"
        >
            {/* Character Card (Front) */}
            <div className="glass rounded-3xl overflow-hidden relative border-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                {/* ... (existing content) ... */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 to-black z-0" />

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 text-gold/20 text-4xl font-serif">☯</div>
                <div className="absolute bottom-4 left-4 text-gold/20 text-4xl font-serif">☯</div>

                <div className="p-8 text-center relative z-10">
                    <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 1, type: 'spring' }}
                        className="w-40 h-40 mx-auto mb-6 bg-black rounded-full border-4 border-gold flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 to-transparent opacity-50 group-hover:rotate-180 transition-transform duration-1000" />
                        <span className="text-7xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">☯</span>
                    </motion.div>

                    <h2 className="text-gold text-sm tracking-[0.2em] uppercase mb-2 font-serif">No. {character.id}</h2>
                    <h1 className="text-4xl font-bold text-white mb-2 font-serif tracking-wide">{character.character_name}</h1>
                    <p className="text-gray-400 text-sm mb-6 font-serif">{character.name} ({character.reading})</p>

                    <div className="bg-white/5 rounded-xl p-6 mb-6 text-left border border-white/5">
                        <p className="text-gray-200 leading-relaxed italic font-serif text-center">&quot;{character.concept}&quot;</p>
                    </div>

                    <div className="flex justify-center gap-4 mb-2">
                        <div className="px-4 py-1 rounded-full bg-gold/10 border border-gold/30 text-xs text-gold">
                            主: {character.attributes.primary}
                        </div>
                        <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                            副: {character.attributes.secondary}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Data Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yin Sen Chart */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-gold font-bold mb-4 text-center font-serif border-b border-white/10 pb-2">陰占命式</h3>
                    <YinSenChart data={yinSen} />
                </div>

                {/* Yang Sen Chart */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-gold font-bold mb-4 text-center font-serif border-b border-white/10 pb-2">陽占命式</h3>
                    <YangSenChart data={yangSen} />
                </div>
            </div>

            {/* Taiun Chart */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-gold font-bold mb-4 text-center font-serif border-b border-white/10 pb-2">大運 (Great Life Cycle)</h3>
                <TaiunChart data={taiun} />
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-gold font-bold mb-4 text-center font-serif">五行バランス</h3>
                    <FiveElementsChart data={fiveElements} />
                </div>

                <div className="glass rounded-2xl p-6 flex flex-col justify-center">
                    <h3 className="text-gold font-bold mb-4 text-center font-serif">エネルギー指数</h3>
                    <div className="text-center mb-2">
                        <span className="text-6xl font-bold text-white font-serif">{energyScore}</span>
                        <span className="text-sm text-gray-500 ml-2">/ 36</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mt-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(energyScore / 36) * 100}%` }}
                            className="h-full bg-gradient-to-r from-yellow-700 to-yellow-400"
                        />
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-4 font-serif">
                        {energyScore >= 20 ? '身強 (Strong)' : energyScore >= 10 ? '身中 (Balanced)' : '身弱 (Sensitive)'}
                    </p>
                </div>
            </div>

            {/* Energy Interpretation Section - NEW */}
            <div className="glass rounded-2xl p-8">
                <h3 className="text-gold font-bold mb-6 text-xl font-serif border-b border-white/10 pb-2">エネルギー診断</h3>
                <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-sm text-gray-400 mb-2">エネルギーレベル</p>
                        <p className="text-2xl font-bold text-gold font-serif">{energyInterpretation.level}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-gray-300 leading-relaxed">{energyInterpretation.description}</p>
                    </div>
                    <div className="bg-gold/10 rounded-xl p-4 border border-gold/30">
                        <p className="text-sm text-gold mb-2 font-bold">アドバイス</p>
                        <p className="text-gray-200 leading-relaxed">{energyInterpretation.advice}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-sm text-gray-400 mb-3">あなたの特性</p>
                        <ul className="space-y-2">
                            {energyInterpretation.characteristics.map((char, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                    <span className="text-gold mt-1">✦</span>
                                    <span>{char}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Features List */}
            <div className="glass rounded-2xl p-8">
                <h3 className="text-gold font-bold mb-6 text-xl font-serif border-b border-white/10 pb-2">宿命の特徴</h3>
                <ul className="space-y-4">
                    {character.features.map((feature, idx) => (
                        <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed"
                        >
                            <span className="text-gold mt-1">✦</span>
                            <span>{feature}</span>
                        </motion.li>
                    ))}
                </ul>
            </div>

            {/* Daily Advice Section - NEW */}
            <DailyAdvice birthDate={birthDate || ''} birthTime={birthTime || ''} />

            <div className="text-center pt-8">
                <button
                    onClick={onReset}
                    className="text-gray-500 hover:text-gold transition-colors text-sm tracking-widest uppercase"
                >
                    BACK TO TOP
                </button>
            </div>
        </motion.div>
    );
}
