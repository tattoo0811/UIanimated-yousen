'use client';

import { SwipeableStack } from "@/components/SwipeableStack";
import { ZODIAC_SIGNS, ZodiacSign } from "@/lib/zodiac";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleSelect = (sign: ZodiacSign) => {
    // Navigate to the fortune page for the selected sign
    setTimeout(() => {
      router.push(`/fortune/${sign.id}`);
    }, 300);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-8 overflow-hidden">

      {/* Header */}
      <motion.header
        className="relative z-10 text-center mt-8 sm:mt-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="text-accent w-5 h-5 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-accent/80">Daily Horoscope</span>
          <Sparkles className="text-accent w-5 h-5 animate-pulse" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-thin tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 font-serif">
          Cosmic<br />Guidance
        </h1>
      </motion.header>

      {/* Main Interaction Area */}
      <main className="w-full max-w-md relative z-20 flex-1 flex flex-col justify-center my-8">
        <SwipeableStack
          signs={ZODIAC_SIGNS}
          onSelect={handleSelect}
        />
      </main>

      {/* Footer */}
      <motion.footer
        className="relative z-10 text-center text-xs text-muted-foreground font-light tracking-widest pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p>FIND YOUR SIGN</p>
      </motion.footer>

      {/* Ambient Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>
    </div>
  );
}
