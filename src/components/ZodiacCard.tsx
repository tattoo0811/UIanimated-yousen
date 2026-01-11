'use client';

import { ZodiacSign } from "@/lib/zodiac";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ZodiacCardProps {
    sign: ZodiacSign;
    active?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ZodiacCard({ sign, active }: ZodiacCardProps) {
    return (
        <motion.div 
            className="relative w-full h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-between p-8 text-center select-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 15
            }}
            whileHover={{ scale: 1.02 }}
        >
            {/* Background decoration with animation */}
            <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"
                animate={{ 
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div 
                className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none"
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div 
                className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            {/* Header */}
            <motion.div 
                className="relative z-10 w-full flex justify-between items-start opacity-70"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <motion.span 
                    className="text-xs font-mono tracking-widest uppercase"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    {sign.element}
                </motion.span>
                <motion.span 
                    className="text-xs font-mono tracking-widest uppercase"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    {sign.dateRange}
                </motion.span>
            </motion.div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                <motion.div 
                    className="text-9xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ 
                        delay: 0.4, 
                        duration: 1.0,
                        type: "spring",
                        stiffness: 150,
                        damping: 12
                    }}
                >
                    {sign.symbol}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <motion.h2 
                        className="text-4xl font-light tracking-wider mb-2 text-white"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        {sign.name}
                    </motion.h2>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {sign.keywords.map((keyword, index) => (
                            <motion.span 
                                key={keyword} 
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-wider text-primary-foreground/80"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                    delay: 0.8 + index * 0.1,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15
                                }}
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                            >
                                {keyword}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <motion.div 
                className="relative z-10 pb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
            >
                <motion.div 
                    className="flex items-center gap-2 text-accent text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <motion.div
                        animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Sparkles size={16} />
                    </motion.div>
                    <span className="font-medium tracking-wide">Swipe to Explore</span>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
