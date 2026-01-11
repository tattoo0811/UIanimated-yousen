'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

interface SparkleParticlesProps {
    count?: number;
    duration?: number;
    className?: string;
}

export function SparkleParticles({ 
    count = 30, 
    duration = 2,
    className = '' 
}: SparkleParticlesProps) {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    useEffect(() => {
        const newSparkles: Sparkle[] = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * duration + duration * 0.5,
            delay: Math.random() * 0.5,
        }));
        setSparkles(newSparkles);
    }, [count, duration]);

    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    className="absolute rounded-full bg-accent"
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        width: `${sparkle.size}px`,
                        height: `${sparkle.size}px`,
                        boxShadow: `0 0 ${sparkle.size * 2}px var(--color-accent)`,
                    }}
                    initial={{ 
                        opacity: 0, 
                        scale: 0,
                        x: 0,
                        y: 0,
                    }}
                    animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200,
                    }}
                    transition={{
                        duration: sparkle.duration,
                        delay: sparkle.delay,
                        ease: "easeOut",
                        repeat: Infinity,
                        repeatDelay: sparkle.delay + sparkle.duration,
                    }}
                />
            ))}
        </div>
    );
}
