
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';

interface OnboardingSlidesProps {
    onComplete: () => void;
}

const SLIDES = [
    {
        id: 1,
        icon: Wind,
        title: "生まれた瞬間の\n「流れ」を受け取る",
        desc: "人は誰しも、生まれた瞬間に陰陽五行という固有のエネルギーの流れを受け取ります。\nそれは変えられない宿命のように見えますが、実はあなたの土台となる大切なギフトです。",
        color: "text-blue-400",
        bg: "bg-blue-400/20"
    },
    {
        id: 2,
        icon: BookOpen,
        title: "「読み方」次第で\n最強の味方になる",
        desc: "流れに逆らうのではなく、その性質を知り、乗りこなすこと。\n雨の日に傘を差すように、自分の流れを知れば、どんな時も迷わず進めるようになります。",
        color: "text-gold",
        bg: "bg-gold/20"
    },
    {
        id: 3,
        icon: TrendingUp,
        title: "未来は\n「行動」で創られる",
        desc: "運命は決まっているものではありません。\n流れを読み、自分を整え、今日の一歩を踏み出す。\nその積み重ねが、あなたが望む未来を創り出します。",
        color: "text-green-400",
        bg: "bg-green-400/20"
    }
];

export default function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-40 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = offset.x;

                            if (swipe < -50 || velocity.x < -0.5) {
                                handleNext();
                            } else if (swipe > 50 || velocity.x > 0.5) {
                                if (currentSlide > 0) {
                                    setCurrentSlide(curr => curr - 1);
                                }
                            }
                        }}
                        className="flex flex-col items-center text-center z-10 max-w-sm cursor-grab active:cursor-grabbing"
                    >
                        {(() => {
                            const Slide = SLIDES[currentSlide];
                            const Icon = Slide.icon;
                            return (
                                <>
                                    <div className={`w-20 h-20 rounded-2xl ${Slide.bg} flex items-center justify-center mb-8 rotate-3`}>
                                        <Icon className={`w-10 h-10 ${Slide.color}`} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white font-serif mb-6 whitespace-pre-line leading-relaxed">
                                        {Slide.title}
                                    </h2>
                                    <p className="text-sm text-gray-400 leading-7 whitespace-pre-line">
                                        {Slide.desc}
                                    </p>
                                </>
                            );
                        })()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="p-8 flex flex-col gap-6 z-10">
                {/* Pagination Dots */}
                <div className="flex justify-center gap-2">
                    {SLIDES.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-gold' : 'bg-white/20'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                    {currentSlide === SLIDES.length - 1 ? '診断を始める' : '次へ'}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
