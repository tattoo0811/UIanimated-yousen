
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Loader2, CheckCircle } from 'lucide-react';

interface PurchaseModalProps {
    isOpen: boolean;
    title: string;
    price: string;
    description: string;
    onClose: () => void;
    onPurchase: () => void;
}

export default function PurchaseModal({ isOpen, title, price, description, onClose, onPurchase }: PurchaseModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePurchase = () => {
        setLoading(true);
        // Mock payment delay
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => {
                onPurchase();
                setSuccess(false); // Reset for next time if needed, though usually modal closes
            }, 1500);
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
                    className="relative w-full max-w-md bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-white/10 overflow-hidden"
                >
                    {success ? (
                        <div className="py-12 flex flex-col items-center text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
                            >
                                <CheckCircle className="w-10 h-10 text-white" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-2">購入完了</h3>
                            <p className="text-gray-400">コンテンツが解放されました</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
                                    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 mb-8 flex justify-between items-center">
                                <span className="text-gray-300">価格</span>
                                <span className="text-2xl font-bold text-white">{price}</span>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePurchase}
                                    disabled={loading}
                                    className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg shadow-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '購入してロック解除'}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="w-full py-3 text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
