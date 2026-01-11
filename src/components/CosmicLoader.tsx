'use client';

import { motion } from 'framer-motion';

export function CosmicLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Central Glowing Orb */}
        <motion.div
          className="absolute w-12 h-12 bg-primary rounded-full blur-lg"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
            backgroundColor: ["#8b5cf6", "#a78bfa", "#8b5cf6"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-8 h-8 bg-white rounded-full z-10 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rotating Rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute border border-primary/30 rounded-full"
            style={{
              width: `${(i + 2) * 30}%`,
              height: `${(i + 2) * 30}%`,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              rotate: {
                duration: 10 + i * 5,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              },
              opacity: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              },
            }}
          />
        ))}

        {/* Orbiting Stars */}
        <motion.div
           className="absolute w-full h-full"
           animate={{ rotate: -360 }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
            <motion.div 
                className="absolute top-0 left-1/2 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_var(--color-accent)]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.div>
      </div>
      
      <motion.p
        className="text-primary-foreground font-light tracking-[0.2em] text-sm uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Consulting the Stars...
      </motion.p>
    </div>
  );
}
