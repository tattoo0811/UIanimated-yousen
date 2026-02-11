'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Users, Compass, ArrowRight, X } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    iconColor: 'text-violet-400',
    title: 'ようこそ「巡の運命診断室」へ',
    description: '120話の物語を通じて、東洋の運命学「算命学」を学ぶダッシュボードです。',
    detail: '主人公・九条巡の17年間の旅路を追体験しながら、自分自身の運命についても考えてみましょう。',
  },
  {
    id: 'learn',
    icon: BookOpen,
    iconColor: 'text-emerald-400',
    title: '算命学を物語で学ぶ',
    description: '難しい専門用語も、物語の中で自然に理解できます。',
    detail: 'わからない用語はツールチップで確認でき、用語集パネルでいつでも復習できます。「シンプルモード」で基本情報だけ見ることもできます。',
  },
  {
    id: 'characters',
    icon: Users,
    iconColor: 'text-cyan-400',
    title: 'キャラクターと共に成長',
    description: '4人の主要キャラクターがそれぞれ異なる命式を持っています。',
    detail: '巡（運命診断師）、慧（AI起業家）、美咲（SNSマーケター）、さくら（祖母）。彼らの命式データを比較しながら、算命学の奥深さを知りましょう。',
  },
  {
    id: 'start',
    icon: Compass,
    iconColor: 'text-amber-400',
    title: 'さあ、始めましょう',
    description: '「占いは未来を占うものではない」—— 在り方を示すものです。',
    detail: 'まずはシンプルモードで概要を把握し、興味が湧いたら詳細モードに切り替えてみてください。',
  },
];

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        key={step.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
        role="dialog"
        aria-label="オンボーディング"
      >
        {/* プログレスバー */}
        <div className="flex gap-1 p-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= currentStep ? 'bg-violet-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="p-6 pt-2">
          {/* アイコン */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
              <Icon className={`w-8 h-8 ${step.iconColor}`} />
            </div>
          </div>

          {/* テキスト */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h2 className="text-xl font-semibold text-white mb-2">{step.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{step.description}</p>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{step.detail}</p>
            </motion.div>
          </AnimatePresence>

          {/* ボタン */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={onSkip}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              スキップ
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-sm text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  戻る
                </button>
              )}
              <button
                onClick={() => {
                  if (isLast) {
                    onComplete();
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-500 transition-colors flex items-center gap-1.5"
              >
                {isLast ? '始める' : '次へ'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
