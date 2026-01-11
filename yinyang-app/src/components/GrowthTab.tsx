
import { useState } from 'react';
import { TrendingUp, Star, CheckCircle, Lock, ArrowRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SubscriptionModal from './SubscriptionModal';

interface Program {
    id: string;
    title: string;
    description: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    color: string;
    steps: { day: number; title: string; completed: boolean }[];
}

const PROGRAMS: Program[] = [
    {
        id: 'confidence',
        title: '自信を取り戻す30日',
        description: '五行の「土」を整え、揺るがない自己肯定感を育てるプログラム。毎日の小さな行動で、確実に自信を積み上げます。',
        duration: '30 Days',
        level: 'Beginner',
        color: 'from-yellow-600 to-orange-500',
        steps: [
            { day: 1, title: '自分の「強み」を3つ書き出す', completed: true },
            { day: 2, title: '「できない」を「まだできる」と言い換える', completed: false },
            { day: 3, title: '鏡に向かって笑顔を作る', completed: false },
            { day: 4, title: '小さな約束を守る', completed: false },
            { day: 5, title: '10分間の瞑想を行う', completed: false },
        ]
    },
    {
        id: 'habit',
        title: '習慣化マスター',
        description: '「木」の成長エネルギーを借りて、新しい習慣を定着させる2週間。三日坊主を卒業し、継続する力を手に入れます。',
        duration: '14 Days',
        level: 'Intermediate',
        color: 'from-green-500 to-emerald-600',
        steps: [
            { day: 1, title: 'やめる習慣を1つ決める', completed: false },
            { day: 2, title: '新しい習慣をスモールステップにする', completed: false },
            { day: 3, title: 'いつやるか（If-Then）を決める', completed: false },
        ]
    },
    {
        id: 'love',
        title: '愛される自分になる',
        description: '「火」と「水」のバランスを整え、魅力を開花させる特別プログラム。内面から輝き、良縁を引き寄せます。',
        duration: '21 Days',
        level: 'Advanced',
        color: 'from-pink-500 to-rose-500',
        steps: [
            { day: 1, title: '自分を褒める日記をつける', completed: false },
            { day: 2, title: '感謝の言葉を3人に伝える', completed: false },
        ]
    }
];

export default function GrowthTab() {
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [showSubModal, setShowSubModal] = useState(false);
    const [isPremium, setIsPremium] = useState(false); // Mock premium state

    const handleUnlock = () => {
        setIsPremium(true);
        setShowSubModal(false);
    };

    return (
        <div className="pb-24 space-y-6 px-4 pt-6">
            <SubscriptionModal
                isOpen={showSubModal}
                onClose={() => setShowSubModal(false)}
                onSubscribe={handleUnlock}
            />

            <AnimatePresence mode="wait">
                {!selectedProgram ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <header>
                            <h1 className="text-2xl font-bold text-white font-serif mb-2">成長プログラム</h1>
                            <p className="text-sm text-gray-400">
                                行動を変え、未来を創るためのステップアップ・プログラム。
                            </p>
                        </header>

                        <div className="grid gap-4">
                            {PROGRAMS.map((program) => (
                                <button
                                    key={program.id}
                                    onClick={() => setSelectedProgram(program)}
                                    className="group relative overflow-hidden rounded-2xl glass border border-white/10 text-left transition-transform hover:scale-[1.02]"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${program.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                                    <div className="p-6 relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] text-white font-bold tracking-wider uppercase">
                                                {program.level}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-gold">
                                                <Calendar className="w-3 h-3" />
                                                {program.duration}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1">{program.title}</h3>
                                        <p className="text-xs text-gray-400 line-clamp-2">{program.description}</p>

                                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gold w-1/5" /> {/* Mock progress */}
                                            </div>
                                            <span>20%</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={() => setSelectedProgram(null)}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            ← 一覧に戻る
                        </button>

                        <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedProgram.color} relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">{selectedProgram.title}</h2>
                            <p className="text-white/80 text-sm relative z-10">{selectedProgram.description}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gold" />
                                プログラムのステップ
                            </h3>

                            <div className="space-y-3">
                                {selectedProgram.steps.map((step, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border flex items-center gap-4 ${step.completed
                                            ? 'bg-gold/10 border-gold/30'
                                            : idx === 1 // Mock current step
                                                ? 'bg-white/10 border-white/20'
                                                : 'bg-transparent border-white/5 opacity-50'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step.completed ? 'bg-gold text-black' : 'bg-white/10 text-gray-400'
                                            }`}>
                                            {step.completed ? <CheckCircle className="w-5 h-5" /> : step.day}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-bold ${step.completed ? 'text-gold' : 'text-white'}`}>
                                                Day {step.day}
                                            </p>
                                            <p className="text-xs text-gray-400">{step.title}</p>
                                        </div>
                                        {!step.completed && idx > 1 && !isPremium && <Lock className="w-4 h-4 text-gray-600" />}
                                        {!step.completed && idx === 1 && (
                                            <button className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs text-white transition-colors">
                                                Start
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!isPremium && (
                            <button
                                onClick={() => setShowSubModal(true)}
                                className="w-full py-4 bg-white/10 rounded-xl text-gray-400 text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                            >
                                すべてのステップを見る（有料プラン）
                                <Lock className="w-4 h-4" />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
