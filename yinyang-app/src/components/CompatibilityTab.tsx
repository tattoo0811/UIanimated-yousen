import { useState, useMemo } from 'react';
import { AnalysisResult } from '@/types';
import { Heart, Plus, X, Users, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompatibilityTabProps {
    userResult: AnalysisResult;
}

interface Friend {
    id: string;
    name: string;
    birthDate: string;
    birthTime: string;
}

interface GroupResult {
    group_name: string;
    description: string;
    roles: {
        name: string;
        role_title: string;
        description: string;
    }[];
    relationships: {
        from: string;
        to: string;
        relation_type: string;
        score: number;
        description: string;
    }[];
    advice: string;
}

export default function CompatibilityTab({ userResult }: CompatibilityTabProps) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [newName, setNewName] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GroupResult | null>(null);

    const canAddFriend = friends.length < 4; // Max 5 people total (User + 4)

    const handleAddFriend = () => {
        if (!newName || !newDate) return;
        setFriends([...friends, {
            id: crypto.randomUUID(),
            name: newName,
            birthDate: newDate,
            birthTime: newTime
        }]);
        setNewName('');
        setNewDate('');
        setNewTime('');
    };

    const removeFriend = (id: string) => {
        setFriends(friends.filter(f => f.id !== id));
    };

    const handleAnalyze = async () => {
        if (friends.length === 0) return;
        setLoading(true);

        try {
            const res = await fetch('/api/ai-advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate: userResult.birthDate,
                    birthTime: userResult.birthTime,
                    type: 'group_compatibility',
                    partners: friends.map(f => ({
                        name: f.name,
                        birthDate: f.birthDate,
                        birthTime: f.birthTime
                    }))
                })
            });

            const data = await res.json();

            if (data.error) {
                console.error('API returned error:', data.error);
                setError(data.error || 'エラーが発生しました');
                return;
            }

            if (!data.advice) {
                console.error('No advice returned from API');
                setError('AIからの応答がありませんでした');
                return;
            }

            try {
                // Heuristic parsing ensuring we get the JSON part
                const cleanJson = data.advice.replace(/```json\n|\n```/g, '').trim();
                const startIdx = cleanJson.indexOf('{');
                const endIdx = cleanJson.lastIndexOf('}');

                if (startIdx === -1 || endIdx === -1) {
                    console.error('Could not find JSON in response:', data.advice);
                    return;
                }

                const jsonStr = cleanJson.substring(startIdx, endIdx + 1);
                const parsed = JSON.parse(jsonStr);
                setResult(parsed);
            } catch (e) {
                console.error("JSON Parse Error", e);
                // Fallback or error state handling
            }

        } catch (error) {
            console.error('Analysis failed', error);
        } finally {
            setLoading(false);
        }
    };

    // Visualization Helpers
    const allMembers = useMemo(() => [
        { name: '自分', type: userResult.yangSen.chest.replace('星', '') }, // Use main star as type
        ...friends.map(f => ({ name: f.name, type: '?' })) // We don't have their star yet in frontend state, simplified for now
    ], [userResult, friends]);

    return (
        <div className="pb-32 px-4 pt-6 max-w-2xl mx-auto">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white font-serif mb-3 tracking-wide flex items-center justify-center gap-3">
                    <Users className="w-8 h-8 text-pink-400" />
                    相性・グループ診断
                </h1>
                <p className="text-sm text-gray-300 leading-relaxed">
                    あなたと友人、最大5人までの<br className="sm:hidden" />
                    「運命の重なり」を可視化します。
                </p>
            </header>

            {!result ? (
                <div className="space-y-6">
                    {/* Member List */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-pink-500 rounded-full" />
                            メンバーを追加 ({friends.length + 1}/5)
                        </h2>

                        <div className="space-y-4">
                            {/* User Self */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    私
                                </div>
                                <div className="text-white font-medium">あなた</div>
                                <div className="ml-auto text-xs text-gray-400">Master</div>
                            </div>

                            {/* Added Friends */}
                            <AnimatePresence>
                                {friends.map(friend => (
                                    <motion.div
                                        key={friend.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 relative group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                                            {friend.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{friend.name}</div>
                                            <div className="text-xs text-gray-400">{friend.birthDate}</div>
                                        </div>
                                        <button
                                            onClick={() => removeFriend(friend.id)}
                                            className="ml-auto p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Add Form */}
                            {canAddFriend && (
                                <div className="grid grid-cols-12 gap-2 pt-2">
                                    <div className="col-span-12 sm:col-span-4">
                                        <input
                                            placeholder="名前"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50"
                                        />
                                    </div>
                                    <div className="col-span-8 sm:col-span-5">
                                        <input
                                            type="date"
                                            value={newDate}
                                            onChange={e => setNewDate(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500/50"
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-3">
                                        <button
                                            onClick={handleAddFriend}
                                            disabled={!newName || !newDate}
                                            className="w-full h-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={friends.length === 0 || loading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="fill-white/20" />}
                        {loading ? 'AIが相性を分析中...' : `この${friends.length + 1}人で診断する`}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Header Summary */}
                    <div className="text-center space-y-2">
                        <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 text-sm font-medium mb-2">
                            GROUP DIAGNOSIS
                        </div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-white">
                            {result.group_name}
                        </h2>
                        <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                            {result.description}
                        </p>
                    </div>

                    {/* Simple Polygon Visualization */}
                    <div className="relative aspect-square max-w-xs mx-auto my-8">
                        {/* Background Polygon */}
                        <svg className="w-full h-full text-white/5" viewBox="0 0 100 100">
                            <MemberPolygon count={friends.length + 1} />
                        </svg>

                        {/* Members on Vertices */}
                        <MemberNodes count={friends.length + 1} members={[{ name: '自分' }, ...friends]} />

                        {/* Center Label */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white drop-shadow-lg">{friends.length + 1}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest">Members</div>
                            </div>
                        </div>
                    </div>

                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.roles.map((role, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass p-5 rounded-2xl border border-white/5 flex flex-col items-center text-center hover:bg-white/5 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xl mb-3 border border-indigo-500/30">
                                    {['👑', '🛡️', '⚡', '💡', '❤️'][i % 5]}
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1">{role.name}</h3>
                                <div className="text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
                                    {role.role_title}
                                </div>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    {role.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Relationships (Secret Thoughts) */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2 px-1">
                            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                            関係性の矢印
                        </h3>
                        <div className="space-y-3">
                            {result.relationships.map((rel, i) => (
                                <div key={i} className="bg-gradient-to-r from-white/5 to-transparent rounded-xl p-4 border-l-2 border-pink-500 flex items-center gap-4">
                                    <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                                        <span className="text-xs text-gray-400">From</span>
                                        <span className="font-bold text-white text-sm">{rel.from}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-500" />
                                    <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                                        <span className="text-xs text-gray-400">To</span>
                                        <span className="font-bold text-white text-sm">{rel.to}</span>
                                    </div>
                                    <div className="flex-1 border-l border-white/10 pl-4">
                                        <div className="text-pink-300 text-xs font-bold mb-0.5">
                                            {rel.relation_type} <span className="text-white/20 ml-1">{rel.score}%</span>
                                        </div>
                                        <div className="text-gray-400 text-xs">
                                            {rel.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advice */}
                    <div className="glass p-6 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
                        <h3 className="text-gold font-bold mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            グループのアドバイス
                        </h3>
                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                            {result.advice}
                        </p>
                    </div>

                    <button
                        onClick={() => setResult(null)}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 text-sm transition-colors"
                    >
                        もう一度診断する
                    </button>
                </motion.div>
            )}
        </div>
    );
}

// Simple SVG Components for visualization
function MemberPolygon({ count }: { count: number }) {
    if (count < 3) return null; // Line for 2 is meaningless in polygon context, handled differently usually

    const points = [];
    const cx = 50, cy = 50, r = 35;

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        points.push(`${x},${y}`);
    }

    return (
        <>
            <polygon points={points.join(' ')} fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            {/* Inner connections for > 3? kept simple for now */}
        </>
    );
}

function MemberNodes({ count, members }: { count: number, members: any[] }) {
    const cx = 50, cy = 50, r = 35;
    const nodes = [];

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        const x = cx + r * Math.cos(angle); // Percent
        const y = cy + r * Math.sin(angle); // Percent

        nodes.push(
            <div
                key={i}
                className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-gray-900 border-2 border-pink-500 z-10 flex items-center justify-center shadow-xl"
                style={{ left: `${x}%`, top: `${y}%` }}
            >
                <span className="text-xs font-bold text-white truncate max-w-[40px] px-1">
                    {members[i]?.name.substring(0, 3)}
                </span>
            </div>
        );
    }
    return <>{nodes}</>;
}
