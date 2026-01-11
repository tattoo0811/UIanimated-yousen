'use client';

import { motion } from 'framer-motion';
import { AnalysisResult } from '@/types';
import { Trash2, History } from 'lucide-react';

interface HistoryListProps {
    history: AnalysisResult[];
    onSelect: (result: AnalysisResult) => void;
    onDelete: (index: number) => void;
    onClear: () => void;
}

export default function HistoryList({ history, onSelect, onDelete, onClear }: HistoryListProps) {
    if (history.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto mt-12"
        >
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-gold font-bold flex items-center gap-2">
                    <History className="w-4 h-4" />
                    診断履歴
                </h3>
                <button
                    onClick={onClear}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                    履歴を削除
                </button>
            </div>

            <div className="space-y-3">
                {history.map((item, idx) => (
                    <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="glass rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => onSelect(item)}
                    >
                        <div>
                            <div className="text-gold font-bold text-sm">{item.character.character_name}</div>
                            <div className="text-xs text-gray-500">
                                {item.yinSen?.year?.name || '年'}年 {item.yinSen?.month?.name || '月'}月 {item.yinSen?.day?.name || '日'}日
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(idx);
                            }}
                            className="text-gray-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
