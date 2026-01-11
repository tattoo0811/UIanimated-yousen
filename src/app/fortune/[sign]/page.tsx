'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ZODIAC_SIGNS } from '@/lib/zodiac';
import { CosmicLoader } from '@/components/CosmicLoader';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';
import { ZodiacCard } from '@/components/ZodiacCard';
import { FiveElementsBalance } from '@/components/FiveElementsBalance';
import { FriendComparison } from '@/components/FriendComparison';

export default function FortunePage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

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
        <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-start overflow-y-auto">
            {/* Back Navigation */}
            <motion.button
                className="fixed top-8 left-8 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur transition-colors"
                onClick={() => router.push('/')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <ArrowLeft className="w-6 h-6" />
            </motion.button>

            {/* Content Reveal */}
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
                        <Star size={14} fill="currentColor" />
                        <span>Your Cosmic Reading</span>
                    </motion.div>
                    <h1 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60">
                        {sign.name}
                    </h1>
                    <p className="text-muted-foreground tracking-widest">{sign.dateRange}</p>
                </div>

                {/* Main Card (Reused for consistent aesthetics) */}
                <div className="w-full max-w-sm h-[400px]">
                    <ZodiacCard sign={sign} active />
                </div>

                {/* Fortune Text */}
                <motion.div
                    className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                >
                    <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 space-y-6 text-center">
                        <h3 className="text-2xl font-light text-primary-foreground tracking-wide flex items-center justify-center gap-3">
                            <Sparkles className="text-accent" />
                            Today&apos;s Guidance
                            <Sparkles className="text-accent" />
                        </h3>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            &quot;The universe aligns to bring {sign.keywords[0].toLowerCase()} energy into your life today.
                            Embrace your natural {sign.element.toLowerCase()} nature. {sign.description}
                            Focus on being {sign.keywords[1].toLowerCase()} and {sign.keywords[2].toLowerCase()} in your interactions.&quot;
                        </p>

                        <div className="pt-6 grid grid-cols-3 gap-4 text-center">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground">Lucky Color</span>
                                <span className="font-medium text-white">Indigo</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground">Number</span>
                                <span className="font-medium text-white">7</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground">Planet</span>
                                <span className="font-medium text-white">Mars</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Five Elements Balance Diagnosis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
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
        </div>
    );
}
