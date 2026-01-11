import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ReactNode } from 'react';

interface SwipeableLayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabs: string[];
}

export default function SwipeableLayout({ children, activeTab, onTabChange, tabs }: SwipeableLayoutProps) {
    const currentIndex = tabs.indexOf(activeTab);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        const velocityThreshold = 0.2;

        if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
            // Swipe Left -> Next Tab
            if (currentIndex < tabs.length - 1) {
                onTabChange(tabs[currentIndex + 1]);
            }
        } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
            // Swipe Right -> Previous Tab
            if (currentIndex > 0) {
                onTabChange(tabs[currentIndex - 1]);
            }
        }
    };

    return (
        <div className="relative w-full min-h-[calc(100vh-80px)] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={handleDragEnd}
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
