'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronDown } from 'lucide-react';

interface InputFormProps {
    onSubmit: (data: { dateStr: string; timeStr: string; longitude: number; gender: 'male' | 'female' }) => void;
}

const COMMON_LOCATIONS = [
    { name: '東京', longitude: 139.7 },
    { name: '大阪', longitude: 135.5 },
    { name: '名古屋', longitude: 136.9 },
    { name: '福岡', longitude: 130.4 },
    { name: '札幌', longitude: 141.4 },
    { name: '仙台', longitude: 140.9 },
    { name: '広島', longitude: 132.5 },
    { name: '沖縄', longitude: 127.7 },
    { name: '明石（標準時）', longitude: 135.0 },
];

export default function InputForm({ onSubmit }: InputFormProps) {
    const [dateStr, setDateStr] = useState('');
    const [timeStr, setTimeStr] = useState('12:00');
    const [selectedLocation, setSelectedLocation] = useState('明石（標準時）');
    const [longitude, setLongitude] = useState(135.0);
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showTimeHelp, setShowTimeHelp] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!dateStr || !timeStr) return;

        onSubmit({ dateStr, timeStr, longitude, gender });
    };

    const handleLocationChange = (locationName: string) => {
        const location = COMMON_LOCATIONS.find(l => l.name === locationName);
        if (location) {
            setSelectedLocation(locationName);
            setLongitude(location.longitude);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-3xl max-w-md w-full mx-auto space-y-6"
            onSubmit={handleSubmit}
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gradient-gold mb-2 font-serif">運命を紐解く</h2>
                <p className="text-gray-400 text-sm">生年月日と出生時間を入力してください</p>
            </div>

            <div className="space-y-5">
                {/* Gender Selection - First for better flow */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gold mb-2 ml-1">性別</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setGender('male')}
                            className={`py-3.5 px-4 rounded-xl font-medium transition-all ${gender === 'male'
                                    ? 'bg-gradient-to-r from-gold to-yellow-600 text-black shadow-lg shadow-gold/20 scale-105'
                                    : 'bg-black/40 border border-white/10 text-gray-400 hover:border-gold/30'
                                }`}
                        >
                            男性
                        </button>
                        <button
                            type="button"
                            onClick={() => setGender('female')}
                            className={`py-3.5 px-4 rounded-xl font-medium transition-all ${gender === 'female'
                                    ? 'bg-gradient-to-r from-gold to-yellow-600 text-black shadow-lg shadow-gold/20 scale-105'
                                    : 'bg-black/40 border border-white/10 text-gray-400 hover:border-gold/30'
                                }`}
                        >
                            女性
                        </button>
                    </div>
                </div>

                {/* Birth Date */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gold mb-2 ml-1">生年月日</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="date"
                            value={dateStr}
                            onChange={(e) => setDateStr(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:border-gold focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Birth Time */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gold ml-1">出生時間</label>
                        <button
                            type="button"
                            onClick={() => setShowTimeHelp(!showTimeHelp)}
                            className="text-[10px] text-gray-500 hover:text-gold transition-colors"
                        >
                            {showTimeHelp ? '閉じる' : 'わからない場合？'}
                        </button>
                    </div>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="time"
                            value={timeStr}
                            onChange={(e) => setTimeStr(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:border-gold focus:outline-none transition-colors"
                        />
                    </div>
                    <AnimatePresence>
                        {showTimeHelp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-3 bg-indigo/20 border border-indigo/30 rounded-lg"
                            >
                                <p className="text-[11px] text-gray-300 leading-relaxed">
                                    正確な時間がわからない場合は、お昼の12:00を入力してください。時間がわかると、より精密な診断ができます。
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Location Selector */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gold mb-2 ml-1">出生地</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                        <select
                            value={selectedLocation}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-10 text-white focus:border-gold focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                            {COMMON_LOCATIONS.map((loc) => (
                                <option key={loc.name} value={loc.name} className="bg-black">
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                </div>

                {/* Advanced Options Toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full py-2 text-xs text-gray-500 hover:text-gold transition-colors flex items-center justify-center gap-1"
                >
                    <span>詳細設定</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                {/* Advanced: Manual Longitude Input */}
                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <label className="block text-xs text-gray-500 ml-1">経度（手動入力）</label>
                            <input
                                type="number"
                                step="0.1"
                                value={longitude}
                                onChange={(e) => {
                                    setLongitude(parseFloat(e.target.value));
                                    setSelectedLocation('カスタム');
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-gold focus:outline-none transition-colors"
                                placeholder="135.0"
                            />
                            <p className="text-[10px] text-gray-600 ml-1">
                                より正確な診断には出生地の経度を入力してください
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-gold via-yellow-600 to-gold text-black font-bold py-4 rounded-xl shadow-lg shadow-gold/20 mt-6 bg-[length:200%_100%] hover:bg-right transition-all duration-500"
            >
                診断を開始する
            </motion.button>
        </motion.form>
    );
}
