'use client';

import { motion } from 'framer-motion';
import type { FiveElements } from '@/lib/types';

interface FiveElementsBalanceProps {
    elements: FiveElements;
    totalEnergy?: number;
}

export function FiveElementsBalance({ elements, totalEnergy }: FiveElementsBalanceProps) {
    const elementData = [
        { 
            name: '木', 
            value: elements.wood, 
            color: '#10b981', 
            emoji: '🌳',
            description: '成長・発展のエネルギー'
        },
        { 
            name: '火', 
            value: elements.fire, 
            color: '#ef4444', 
            emoji: '🔥',
            description: '情熱・表現のエネルギー'
        },
        { 
            name: '土', 
            value: elements.earth, 
            color: '#f59e0b', 
            emoji: '🏔️',
            description: '安定・基盤のエネルギー'
        },
        { 
            name: '金', 
            value: elements.metal, 
            color: '#e5e7eb', 
            emoji: '⚙️',
            description: '収穫・結果のエネルギー'
        },
        { 
            name: '水', 
            value: elements.water, 
            color: '#3b82f6', 
            emoji: '💧',
            description: '流動・知性のエネルギー'
        }
    ];

    // 最大値を計算（正規化用）
    const maxValue = Math.max(
        elements.wood, 
        elements.fire, 
        elements.earth, 
        elements.metal, 
        elements.water
    );
    
    const total = totalEnergy || 
        elements.wood + elements.fire + elements.earth + elements.metal + elements.water;

    return (
        <motion.div
            className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
                <div className="text-center">
                    <h3 className="text-2xl font-light text-primary-foreground tracking-wide mb-2">
                        五行バランス診断
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        数理法に基づくエネルギー分析
                    </p>
                    {totalEnergy && (
                        <p className="text-xs text-muted-foreground mt-2">
                            総合計エネルギー数: <span className="font-medium text-white">{total}</span>点
                        </p>
                    )}
                </div>

                {/* Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-48 mb-4">
                    {elementData.map((element, index) => {
                        const heightRatio = maxValue > 0 ? element.value / maxValue : 0;
                        const barHeight = Math.max(40, heightRatio * 160);

                        return (
                            <motion.div
                                key={element.name}
                                className="flex-1 flex flex-col items-center"
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                transition={{ 
                                    delay: index * 0.1,
                                    duration: 0.5,
                                    ease: "easeOut"
                                }}
                            >
                                {/* Value */}
                                <div className="mb-2 text-center">
                                    <div className="text-white/90 text-sm font-bold">
                                        {element.value}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {maxValue > 0 ? Math.round((element.value / maxValue) * 100) : 0}%
                                    </div>
                                </div>

                                {/* Bar */}
                                <motion.div
                                    style={{
                                        height: `${barHeight}px`,
                                        backgroundColor: element.color,
                                        opacity: 0.8
                                    }}
                                    className="w-full rounded-t-lg shadow-lg relative group"
                                    whileHover={{ scale: 1.05, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        {element.description}
                                    </div>
                                </motion.div>

                                {/* Label */}
                                <div className="mt-3 flex flex-col items-center">
                                    <div className="text-2xl mb-1">{element.emoji}</div>
                                    <div className="text-white/70 text-xs font-medium">
                                        {element.name}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Balance Analysis */}
                <div className="bg-white/5 rounded-xl p-4 mt-6">
                    <div className="text-sm text-white/80 leading-relaxed space-y-2">
                        <p className="font-medium mb-2">バランス分析</p>
                        {maxValue > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {(() => {
                                    const variance = elementData.reduce((acc, el) => {
                                        const avg = total / 5;
                                        return acc + Math.pow(el.value - avg, 2);
                                    }, 0) / 5;
                                    const stdDev = Math.sqrt(variance);
                                    const avg = total / 5;
                                    const coefficient = (stdDev / avg) * 100;

                                    if (coefficient < 20) {
                                        return '五行のバランスが非常に取れています。平穏な人生を送りやすい傾向にありますが、意識的な努力でさらなる発展が可能です。';
                                    } else if (coefficient < 40) {
                                        return '五行にやや偏りがあります。その偏りを活かすことで、大きな成果を上げる可能性があります。';
                                    } else {
                                        return '五行に大きな偏りがあります。この偏りこそがあなたの才能の源泉です。選択を誤ると苦労が続く可能性もありますが、正しい選択で大活躍する可能性を秘めています。';
                                    }
                                })()}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
