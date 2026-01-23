'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Briefcase, Users, Sparkles } from 'lucide-react';
import { calculateCompatibility, type RelationType } from '@/lib/compatibility';

export default function CompatibilityPage() {
    const router = useRouter();
    const [person1Date, setPerson1Date] = useState('');
    const [person2Date, setPerson2Date] = useState('');
    const [relationType, setRelationType] = useState<RelationType>('romantic');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    // 簡易的な干支計算（実際の実装では lunar-javascript を使用）
    // ここでは簡易版として、生年月日から日柱干支を計算する関数を用意
    // 注意: これは簡易版です。正確な計算には lunar-javascript が必要です
    function getKanshiFromDate(dateStr: string): string {
        if (!dateStr) return '';
        
        // 簡易版: 実際の実装では正確な干支計算が必要
        // ここではデモ用にランダムな干支を返す
        const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        
        const date = new Date(dateStr);
        const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
        
        const stemIdx = dayOfYear % 10;
        const branchIdx = dayOfYear % 12;
        
        return `${stems[stemIdx]}${branches[branchIdx]}`;
    }

    const handleCalculate = () => {
        setError('');
        
        if (!person1Date || !person2Date) {
            setError('両方の生年月日を入力してください');
            return;
        }

        try {
            const person1Kanshi = getKanshiFromDate(person1Date);
            const person2Kanshi = getKanshiFromDate(person2Date);

            if (!person1Kanshi || !person2Kanshi) {
                setError('生年月日の計算に失敗しました');
                return;
            }

            const compatibility = calculateCompatibility(
                person1Kanshi,
                person2Kanshi,
                relationType
            );

            setResult(compatibility);
        } catch (err) {
            setError('計算中にエラーが発生しました');
            console.error(err);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'from-green-400 to-emerald-500';
        if (score >= 60) return 'from-blue-400 to-cyan-500';
        if (score >= 40) return 'from-yellow-400 to-orange-500';
        return 'from-red-400 to-pink-500';
    };

    const relationTypeOptions: { value: RelationType; label: string; icon: any }[] = [
        { value: 'romantic', label: '恋愛', icon: Heart },
        { value: 'business', label: '仕事', icon: Briefcase },
        { value: 'friendship', label: '友情', icon: Users },
    ];

    return (
        <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-start overflow-y-auto bg-background">
            {/* Back Navigation */}
            <motion.button
                className="fixed top-8 left-8 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur transition-colors"
                onClick={() => router.push('/')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <ArrowLeft className="w-6 h-6" />
            </motion.button>

            {/* Content */}
            <motion.div
                className="w-full max-w-2xl flex flex-col items-center gap-8 mt-12"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Title */}
                <div className="text-center space-y-2">
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm tracking-widest uppercase mb-4"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Sparkles size={14} fill="currentColor" />
                        <span>Compatibility Reading</span>
                    </motion.div>
                    <h1 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60">
                        相性診断
                    </h1>
                    <p className="text-muted-foreground tracking-widest">2人の生年月日から相性を診断</p>
                </div>

                {/* Input Form */}
                <motion.div
                    className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                >
                    <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        {/* Relation Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-3">
                                関係タイプ
                            </label>
                            <div className="flex gap-3">
                                {relationTypeOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setRelationType(option.value)}
                                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                                                relationType === option.value
                                                    ? 'bg-accent/20 border-accent text-accent'
                                                    : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                                            }`}
                                        >
                                            <Icon size={24} />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Person 1 Date */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                1人目の生年月日
                            </label>
                            <input
                                type="date"
                                value={person1Date}
                                onChange={(e) => setPerson1Date(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Person 2 Date */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                2人目の生年月日
                            </label>
                            <input
                                type="date"
                                value={person2Date}
                                onChange={(e) => setPerson2Date(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Calculate Button */}
                        <button
                            onClick={handleCalculate}
                            className="w-full py-4 px-6 bg-gradient-to-r from-accent to-primary rounded-xl font-medium text-white hover:opacity-90 transition-opacity shadow-lg"
                        >
                            相性を診断する
                        </button>
                    </div>
                </motion.div>

                {/* Result */}
                {result && (
                    <motion.div
                        className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 space-y-6 text-center">
                            {/* Score */}
                            <div className="space-y-2">
                                <div className={`text-8xl font-black bg-gradient-to-r ${getScoreColor(result.score)} bg-clip-text text-transparent`}>
                                    {result.score}
                                </div>
                                <div className="text-2xl font-light text-primary-foreground">
                                    {result.scoreLevel}
                                </div>
                            </div>

                            {/* Kanshi Info */}
                            <div className="flex items-center justify-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {result.myKanshi}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {result.myElement}
                                    </div>
                                </div>
                                <div className="text-4xl">💕</div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {result.partnerKanshi}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {result.partnerElement}
                                    </div>
                                </div>
                            </div>

                            {/* Advice */}
                            <div className="bg-white/5 rounded-xl p-6 space-y-4">
                                <p className="text-lg leading-relaxed text-muted-foreground">
                                    {result.advice}
                                </p>

                                {/* Strengths */}
                                {result.strengths && result.strengths.length > 0 && (
                                    <div className="text-left">
                                        <h4 className="text-sm font-medium text-accent mb-2">強み</h4>
                                        <ul className="space-y-1">
                                            {result.strengths.map((strength: string, idx: number) => (
                                                <li key={idx} className="text-sm text-muted-foreground">
                                                    • {strength}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Challenges */}
                                {result.challenges && result.challenges.length > 0 && (
                                    <div className="text-left">
                                        <h4 className="text-sm font-medium text-orange-400 mb-2">注意点</h4>
                                        <ul className="space-y-1">
                                            {result.challenges.map((challenge: string, idx: number) => (
                                                <li key={idx} className="text-sm text-muted-foreground">
                                                    • {challenge}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
