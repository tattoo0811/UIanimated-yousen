
import { Home, MessageCircle, Heart, TrendingUp, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const tabs = [
        { id: 'home', label: 'ホーム', icon: Home },
        { id: 'coach', label: 'コーチ', icon: MessageCircle },
        { id: 'compatibility', label: '相性', icon: Heart },
        { id: 'growth', label: '成長', icon: TrendingUp },
        { id: 'mypage', label: 'マイページ', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 glass-heavy pb-safe z-50">
            {/* Swipe Hint */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-gold/30 rounded-full" />

            <div className="flex justify-around items-center max-w-md mx-auto px-4 pt-2 pb-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex flex-col items-center gap-1 p-2 transition-all duration-300 min-w-[60px]"
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gold/10 rounded-2xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-gold' : 'text-gray-500'}`} />
                                {isActive && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full"
                                    />
                                )}
                            </div>

                            <span className={`text-[10px] font-medium transition-colors relative ${isActive ? 'text-gold-light' : 'text-gray-500'
                                }`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

