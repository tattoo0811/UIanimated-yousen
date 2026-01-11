
import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A] to-[#1A1F2C] z-50 flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center relative z-10"
            >
                {/* Animated Yin-Yang Symbol */}
                <motion.div
                    className="relative w-32 h-32 mb-8"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    {/* Outer glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/30 to-indigo/30 blur-xl" />

                    {/* Yin-Yang Container */}
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gold to-yellow-600 shadow-[0_0_40px_rgba(229,211,179,0.5)]">
                        {/* Yang (light) side - top half */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-gold to-yellow-600 rounded-t-full" />

                        {/* Yin (dark) side - bottom half */}
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-br from-indigo to-indigo-light rounded-b-full" />

                        {/* Small circles */}
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo shadow-inner" />
                        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-gold shadow-inner" />

                        {/* Curved divider effect */}
                        <svg className="absolute inset-0" viewBox="0 0 100 100">
                            <path d="M50,0 A25,25 0 0,1 50,50 A25,25 0 0,0 50,100" fill="url(#yinGradient)" />
                            <defs>
                                <linearGradient id="yinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(26,31,44,1)" />
                                    <stop offset="100%" stopColor="rgba(42,50,69,1)" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </motion.div>

                {/* App Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-4xl font-bold text-gradient-gold font-serif tracking-wider mb-3"
                >
                    陰陽五行
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-xs text-gold tracking-[0.3em] uppercase mb-6"
                >
                    YIN YANG COACHING
                </motion.p>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="text-sm text-gray-400 font-serif text-center leading-relaxed"
                >
                    流れを読み、<br />未来を創る。
                </motion.p>

                {/* Loading indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="mt-8 flex gap-1.5"
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-gold"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
