'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Share2, Sparkles } from 'lucide-react';
import { ZodiacSign, ZODIAC_SIGNS } from '@/lib/zodiac';
import { ZodiacCard } from '@/components/ZodiacCard';
import { FiveElementsBalance } from '@/components/FiveElementsBalance';
import type { FiveElements } from '@/lib/types';

interface FriendResult {
    id: string;
    name: string;
    sign: ZodiacSign;
    elements: FiveElements;
}

interface FriendComparisonProps {
    currentSign: ZodiacSign;
    currentElements: FiveElements;
}

const STORAGE_KEY = 'fortune_friends';

export function FriendComparison({ currentSign, currentElements }: FriendComparisonProps) {
    const [friends, setFriends] = useState<FriendResult[]>([]);
    const [showInput, setShowInput] = useState(false);
    const [friendName, setFriendName] = useState('');
    const [selectedFriendSign, setSelectedFriendSign] = useState<ZodiacSign | null>(null);

    // Load friends from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Convert sign IDs back to ZodiacSign objects
                const friendsWithSigns = parsed.map((f: any) => ({
                    ...f,
                    sign: ZODIAC_SIGNS.find(s => s.id === f.signId) || ZODIAC_SIGNS[0]
                }));
                setFriends(friendsWithSigns);
            } catch (e) {
                console.error('Failed to load friends:', e);
            }
        }
    }, []);

    // Save friends to localStorage
    const saveFriends = (newFriends: FriendResult[]) => {
        setFriends(newFriends);
        const toSave = newFriends.map(f => ({
            id: f.id,
            name: f.name,
            signId: f.sign.id,
            elements: f.elements
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    };

    const handleAddFriend = () => {
        if (!friendName || !selectedFriendSign) return;

        const newFriend: FriendResult = {
            id: crypto.randomUUID(),
            name: friendName,
            sign: selectedFriendSign,
            elements: generateRandomElements() // 仮のデータ生成
        };

        saveFriends([...friends, newFriend]);
        setFriendName('');
        setSelectedFriendSign(null);
        setShowInput(false);
    };

    const handleRemoveFriend = (id: string) => {
        saveFriends(friends.filter(f => f.id !== id));
    };

    const handleShare = (friend: FriendResult) => {
        const url = `${window.location.origin}/fortune/${friend.sign.id}?compare=${currentSign.id}&friend=${friend.id}`;
        if (navigator.share) {
            navigator.share({
                title: `${friend.name}さんと${currentSign.name}の占い結果を比較`,
                text: '占い結果を比較してみませんか？',
                url: url
            }).catch(() => {
                // Fallback to copy
                navigator.clipboard.writeText(url);
                alert('URLをクリップボードにコピーしました！');
            });
        } else {
            navigator.clipboard.writeText(url);
            alert('URLをクリップボードにコピーしました！');
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm tracking-widest uppercase mb-4">
                    <Users size={14} />
                    <span>友達と比較</span>
                </div>
                <h3 className="text-2xl font-light text-primary-foreground tracking-wide">
                    あなたと友達の占い結果
                </h3>
            </motion.div>

            {/* Add Friend Button */}
            {!showInput && (
                <motion.button
                    onClick={() => setShowInput(true)}
                    className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 backdrop-blur transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={20} />
                    <span>友達を追加</span>
                </motion.button>
            )}

            {/* Input Form */}
            <AnimatePresence>
                {showInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">
                                    友達の名前
                                </label>
                                <input
                                    type="text"
                                    value={friendName}
                                    onChange={(e) => setFriendName(e.target.value)}
                                    placeholder="例: 太郎"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">
                                    友達の星座
                                </label>
                                <select
                                    value={selectedFriendSign?.id || ''}
                                    onChange={(e) => {
                                        const sign = ZODIAC_SIGNS.find(s => s.id === e.target.value);
                                        setSelectedFriendSign(sign || null);
                                    }}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent/50"
                                >
                                    <option value="">選択してください</option>
                                    {ZODIAC_SIGNS.map(sign => (
                                        <option key={sign.id} value={sign.id}>
                                            {sign.symbol} {sign.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddFriend}
                                    disabled={!friendName || !selectedFriendSign}
                                    className="flex-1 py-2 px-4 bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                                >
                                    追加
                                </button>
                                <button
                                    onClick={() => {
                                        setShowInput(false);
                                        setFriendName('');
                                        setSelectedFriendSign(null);
                                    }}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Comparison Cards */}
            <div className="space-y-8">
                {friends.map((friend, index) => (
                    <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative"
                    >
                        {/* Remove Button */}
                        <button
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>

                        {/* Friend Name */}
                        <div className="text-center mb-6">
                            <h4 className="text-xl font-medium text-white mb-2">
                                {friend.name}さん
                            </h4>
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Sparkles size={14} />
                                <span className="text-sm">{friend.sign.name}</span>
                            </div>
                        </div>

                        {/* Comparison Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Your Card */}
                            <div className="space-y-4">
                                <div className="text-center text-sm text-muted-foreground mb-2">
                                    あなた
                                </div>
                                <div className="h-[300px]">
                                    <ZodiacCard sign={currentSign} active />
                                </div>
                                <FiveElementsBalance elements={currentElements} />
                            </div>

                            {/* Friend Card */}
                            <div className="space-y-4">
                                <div className="text-center text-sm text-muted-foreground mb-2">
                                    {friend.name}さん
                                </div>
                                <div className="h-[300px]">
                                    <ZodiacCard sign={friend.sign} active />
                                </div>
                                <FiveElementsBalance elements={friend.elements} />
                            </div>
                        </div>

                        {/* Share Button */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => handleShare(friend)}
                                className="px-6 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Share2 size={16} />
                                <span>結果を共有</span>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {friends.length === 0 && !showInput && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground"
                >
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>友達を追加して占い結果を比較しましょう</p>
                </motion.div>
            )}
        </div>
    );
}

// Helper function to generate random elements (for demo)
function generateRandomElements(): FiveElements {
    const total = 200;
    const values = [
        Math.floor(Math.random() * total * 0.3),
        Math.floor(Math.random() * total * 0.3),
        Math.floor(Math.random() * total * 0.3),
        Math.floor(Math.random() * total * 0.3),
        Math.floor(Math.random() * total * 0.3)
    ];
    const sum = values.reduce((a, b) => a + b, 0);
    const scale = total / sum;
    
    return {
        wood: Math.round(values[0] * scale),
        fire: Math.round(values[1] * scale),
        earth: Math.round(values[2] * scale),
        metal: Math.round(values[3] * scale),
        water: Math.round(values[4] * scale)
    };
}
