'use client';

import { useState } from 'react';
import InputForm from '@/components/InputForm';
import ResultCard from '@/components/ResultCard';
import { analyzeFate } from './actions';
import { AnalysisResult } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import HistoryList from '@/components/HistoryList';
import { useEffect } from 'react';
import HomeDashboard from '@/components/HomeDashboard';
import BottomNav from '@/components/BottomNav';
import AICoach from '@/components/AICoach';
import CompatibilityTab from '@/components/CompatibilityTab';
import GrowthTab from '@/components/GrowthTab';
import MyPageTab from '@/components/MyPageTab';
import SplashScreen from '@/components/SplashScreen';
import OnboardingSlides from '@/components/OnboardingSlides';
import SwipeableLayout from '@/components/SwipeableLayout';

type ViewState = 'splash' | 'onboarding' | 'input' | 'result';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('splash');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');

    // Check for saved history
    const saved = localStorage.getItem('yinyang_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }

    if (hasSeenOnboarding) {
      setViewState('input');
    } else {
      // Start with splash
      setViewState('splash');
    }
  }, []);

  const saveToHistory = (newResult: AnalysisResult) => {
    const newHistory = [newResult, ...history].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem('yinyang_history', JSON.stringify(newHistory));
  };

  const handleAnalyze = async (data: { dateStr: string; timeStr: string; longitude: number; gender: 'male' | 'female' }) => {
    setLoading(true);

    try {
      const res = await analyzeFate(data);
      setResult(res);
      saveToHistory(res);
      setViewState('result');
    } catch (e) {
      console.error(e);
      alert('診断中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('yinyang_history');
  };

  const deleteHistoryItem = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('yinyang_history', JSON.stringify(newHistory));
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('has_seen_onboarding', 'true');
    setViewState('input');
  };

  // Render Logic based on ViewState
  if (viewState === 'splash') {
    return <SplashScreen onComplete={() => setViewState('onboarding')} />;
  }

  if (viewState === 'onboarding') {
    return <OnboardingSlides onComplete={handleOnboardingComplete} />;
  }

  return (
    <main className="min-h-screen p-4 pb-24 relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-yellow-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="text-center mb-12 pt-8">
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 mb-2">
            陰陽五行
          </h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Oriental Fate Analysis</p>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gold animate-pulse">運命を計算中...</p>
            </motion.div>
          ) : result ? (
            <>
              <SwipeableLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={['home', 'coach', 'compatibility', 'growth', 'mypage']}
              >
                {activeTab === 'home' && (
                  <HomeDashboard
                    result={result}
                    onConsultCoach={() => setActiveTab('coach')}
                  />
                )}

                {activeTab === 'coach' && (
                  <AICoach result={result} />
                )}

                {activeTab === 'compatibility' && (
                  <CompatibilityTab userResult={result} />
                )}

                {activeTab === 'growth' && (
                  <GrowthTab />
                )}

                {activeTab === 'mypage' && (
                  <MyPageTab result={result} onLogout={() => setResult(null)} />
                )}
              </SwipeableLayout>

              <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </>
          ) : (
            <>
              <InputForm key="input" onSubmit={handleAnalyze} />
              {history.length > 0 && (
                <div className="mt-8">
                  <HistoryList
                    history={history}
                    onSelect={(item) => {
                      setResult(item);
                      setViewState('result'); // Ensure we switch to result view logic if needed, though 'result' state handles it
                    }}
                    onDelete={deleteHistoryItem}
                    onClear={clearHistory}
                  />
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
