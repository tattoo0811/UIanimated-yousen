'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { ZodiacSign } from '@/lib/zodiac';
import { ZodiacCard } from './ZodiacCard';

interface SwipeableStackProps {
    signs: ZodiacSign[];
    onSwipeComplete?: (sign: ZodiacSign) => void;
    onSelect?: (sign: ZodiacSign) => void;
}

export function SwipeableStack({ signs, onSwipeComplete, onSelect }: SwipeableStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Calculate active and next cards based on current index
    const activeCard = signs[currentIndex % signs.length];
    const nextCard = signs[(currentIndex + 1) % signs.length];

    // Motion values for the active card
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Interpolate rotation and opacity based on x drag
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

    // Overlay indicators opacity
    const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);

    const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const threshold = 100;

        if (offset > threshold || velocity > 500) {
            // Swiped Right (Select)
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
            if (onSelect) onSelect(activeCard);
            handleSwipe();
        } else if (offset < -threshold || velocity < -500) {
            // Swiped Left (Next)
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
            handleSwipe();
        } else {
            // Reset
            controls.start({ x: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
    };

    const handleSwipe = () => {
        if (onSwipeComplete) {
            onSwipeComplete(activeCard);
        }

        // Advance index
        setCurrentIndex((prev) => prev + 1);

        // Reset position immediately for the "new" active card (which was previously next)
        // We need to wait a tiny bit for the state update to render the new card as active
        setTimeout(() => {
            x.set(0);
        }, 50);
    };

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center perspective-[1000px]">
            {/* Next Card (Background) */}
            <div
                key={nextCard.id + '-next-' + currentIndex}
                className="absolute w-full max-w-sm h-[500px] transform scale-95 opacity-50 translate-y-4 -z-10 transition-all duration-300"
            >
                <ZodiacCard sign={nextCard} />
            </div>

            {/* Active Card (Foreground) */}
            <motion.div
                key={activeCard.id + '-' + currentIndex}
                className="absolute w-full max-w-sm h-[500px] cursor-grab active:cursor-grabbing z-20"
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                whileTap={{ scale: 1.05 }}
            >
                <ZodiacCard sign={activeCard} active />

                {/* Swipe Indicators */}
                <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 border-4 border-emerald-400 rounded-lg px-4 py-2 transform -rotate-12 z-30 pointer-events-none bg-black/20 backdrop-blur-sm">
                    <span className="text-emerald-400 text-3xl font-bold uppercase tracking-widest shadow-black drop-shadow-md">SELECT</span>
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 border-4 border-rose-400 rounded-lg px-4 py-2 transform rotate-12 z-30 pointer-events-none bg-black/20 backdrop-blur-sm">
                    <span className="text-rose-400 text-3xl font-bold uppercase tracking-widest shadow-black drop-shadow-md">NEXT</span>
                </motion.div>
            </motion.div>

            {/* Hint Text */}
            <div className="absolute bottom-4 flex gap-8 text-sm text-muted-foreground font-mono opacity-50">
                <span>← Slide to Skip</span>
                <span>Slide to Select →</span>
            </div>
        </div>
    );
}
