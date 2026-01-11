'use client';

import { ZodiacSign } from "@/lib/zodiac";
import { Sparkles } from "lucide-react";

interface ZodiacCardProps {
    sign: ZodiacSign;
    active?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ZodiacCard({ sign, active }: ZodiacCardProps) {
    return (
        <div className="relative w-full h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-between p-8 text-center select-none">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 w-full flex justify-between items-start opacity-70">
                <span className="text-xs font-mono tracking-widest uppercase">{sign.element}</span>
                <span className="text-xs font-mono tracking-widest uppercase">{sign.dateRange}</span>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="text-9xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {sign.symbol}
                </div>
                <div>
                    <h2 className="text-4xl font-light tracking-wider mb-2 text-white">{sign.name}</h2>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {sign.keywords.map(keyword => (
                            <span key={keyword} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-wider text-primary-foreground/80">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 pb-4">
                <div className="flex items-center gap-2 text-accent text-sm animate-pulse">
                    <Sparkles size={16} />
                    <span className="font-medium tracking-wide">Swipe to Explore</span>
                </div>
            </div>
        </div>
    );
}
