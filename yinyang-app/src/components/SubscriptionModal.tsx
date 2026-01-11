
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Crown, Loader2 } from 'lucide-react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = () => {
        setLoading(true);
        // Mock payment delay
        setTimeout(() => {
            setLoading(false);
            onSubscribe();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-gold/20 overflow-hidden"
                >
                    {/* Decorative bg */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gold/10 to-transparent pointer-events-none" />

                    <div className="relative z-10 text-center mb-8">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                            <Crown className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-2xl font-bold text-white font-serif mb-2">Premium Plan</h2>
                        <p className="text-sm text-gray-400">
                            運命の流れを、もっと深く、自由に。
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-sm text-gray-300">AIコーチへの相談</span>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500 line-through">1日1回</span>
                                <span className="text-gold font-bold flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-gold" /> 無制限
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-sm text-gray-300">成長プログラム</span>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500">一部のみ</span>
                                <span className="text-gold font-bold flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-gold" /> 全開放
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-sm text-gray-300">詳細な運勢分析</span>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500"><X className="w-4 h-4" /></span>
                                <span className="text-gold font-bold flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-gold" /> 閲覧可
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-gold to-yellow-600 rounded-xl text-black font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'プレミアムに登録 (¥980/月)'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-3 text-sm text-gray-500 hover:text-white transition-colors"
                        >
                            今はスキップする
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
