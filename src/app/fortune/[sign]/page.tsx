'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ZODIAC_SIGNS } from '@/lib/zodiac';
import { CosmicLoader } from '@/components/CosmicLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';
import { ZodiacCard } from '@/components/ZodiacCard';
import { FiveElementsBalance } from '@/components/FiveElementsBalance';
import { FriendComparison } from '@/components/FriendComparison';
import { SparkleParticles } from '@/components/SparkleParticles';

export default function FortunePage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);

    // Derive sign directly from params
    const sign = ZODIAC_SIGNS.find(s => s.id === params.sign);

    useEffect(() => {
        if (!sign) {
            router.push('/');
            return;
        }

        // Simulate cosmic calculation time
        const timer = setTimeout(() => {
            setLoading(false);
            // 少し遅延してからコンテンツを表示（トランジション効果のため）
            setTimeout(() => {
                setShowContent(true);
            }, 300);
        }, 3000);

        return () => clearTimeout(timer);
    }, [sign, router]);

    if (loading || !sign) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <CosmicLoader />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-start overflow-y-auto relative">
            {/* Sparkle Particles Background */}
            <AnimatePresence>
                {showContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <SparkleParticles count={50} duration={3} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back Navigation */}
            <motion.button
                className="fixed top-8 left-8 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur transition-colors"
                onClick={() => router.push('/')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <ArrowLeft className="w-6 h-6" />
            </motion.button>

            {/* Content Reveal with dramatic entrance */}
            <AnimatePresence mode="wait">
                {showContent && (
                    <motion.div
                        className="w-full max-w-2xl flex flex-col items-center gap-8 mt-12"
                        initial={{ opacity: 0, scale: 0.8, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ 
                            duration: 1.2, 
                            ease: [0.16, 1, 0.3, 1],
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                        }}
                    >

                {/* Title with dramatic reveal */}
                <motion.div 
                    className="text-center space-y-2 relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm tracking-widest uppercase mb-4 relative overflow-hidden"
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ 
                            delay: 0.5, 
                            duration: 0.6,
                            type: "spring",
                            stiffness: 200,
                            damping: 15
                        }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-accent/20"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ delay: 0.8, duration: 0.6, ease: "easeInOut" }}
                        />
                        <Star 
                            size={14} 
                            fill="currentColor"
                            className="relative z-10"
                        />
                        <span className="relative z-10">Your Cosmic Reading</span>
                    </motion.div>
                    <motion.h1 
                        className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60"
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ 
                            delay: 0.7, 
                            duration: 0.8,
                            type: "spring",
                            stiffness: 150,
                            damping: 12
                        }}
                    >
                        {sign.name}
                    </motion.h1>
                    <motion.p 
                        className="text-muted-foreground tracking-widest"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                    >
                        {sign.dateRange}
                    </motion.p>
                </motion.div>

                {/* Main Card with dramatic flip/reveal */}
                <motion.div 
                    className="w-full max-w-sm h-[400px] relative"
                    initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    transition={{ 
                        delay: 0.9, 
                        duration: 1.0,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                    style={{ perspective: 1000 }}
                >
                    <motion.div
                        whileHover={{ scale: 1.02, rotateY: 5 }}
                        transition={{ duration: 0.3 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <ZodiacCard sign={sign} active />
                    </motion.div>
                </motion.div>

                {/* Fortune Text with sequential reveal */}
                <motion.div
                    className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                        delay: 1.1, 
                        duration: 0.8,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                >
                    <motion.div 
                        className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.3, duration: 1.2 }}
                    />

                    <div className="relative z-10 space-y-6 text-center">
                        <motion.h3 
                            className="text-2xl font-light text-primary-foreground tracking-wide flex items-center justify-center gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4, duration: 0.6 }}
                        >
                            <motion.div
                                animate={{ 
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                <Sparkles className="text-accent" />
                            </motion.div>
                            Today&apos;s Guidance
                            <motion.div
                                animate={{ 
                                    rotate: [0, -360],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                <Sparkles className="text-accent" />
                            </motion.div>
                        </motion.h3>
                        <motion.p 
                            className="text-lg leading-relaxed text-muted-foreground"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6, duration: 0.8 }}
                        >
                            &quot;The universe aligns to bring {sign.keywords[0].toLowerCase()} energy into your life today.
                            Embrace your natural {sign.element.toLowerCase()} nature. {sign.description}
                            Focus on being {sign.keywords[1].toLowerCase()} and {sign.keywords[2].toLowerCase()} in your interactions.&quot;
                        </motion.p>

                        <motion.div 
                            className="pt-6 grid grid-cols-3 gap-4 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.8, duration: 0.6 }}
                        >
                            {[
                                { label: 'Lucky Color', value: 'Indigo' },
                                { label: 'Number', value: '7' },
                                { label: 'Planet', value: 'Mars' }
                            ].map((item, index) => (
                                <motion.div 
                                    key={item.label}
                                    className="flex flex-col gap-1"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ 
                                        delay: 1.9 + index * 0.1,
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</span>
                                    <span className="font-medium text-white">{item.value}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Five Elements Balance Diagnosis */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                        delay: 2.0, 
                        duration: 0.8,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                    className="w-full"
                >
                    <FiveElementsBalance
                        elements={{
                            wood: 0,
                            fire: 38,
                            earth: 57,
                            metal: 61,
                            water: 45
                        }}
                        totalEnergy={201}
                    />
                </motion.div>

                {/* Friend Comparison */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                        delay: 2.2, 
                        duration: 0.8,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                    className="w-full"
                >
                    <FriendComparison
                        currentSign={sign}
                        currentElements={{
                            wood: 0,
                            fire: 38,
                            earth: 57,
                            metal: 61,
                            water: 45
                        }}
                    />
                </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
