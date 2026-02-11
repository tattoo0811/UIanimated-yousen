import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Settings, Users, Image, FileText } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import PopResultCard from '@/components/PopResultCard';
import FortuneTypewriterReveal from '@/components/FortuneTypewriterReveal';
import { loadStorage } from '@/lib/storage';
import kanshiData from '@/data/kanshi-types.json';
import { getCharacterByKanshi } from '@/lib/viral-characters-loader';

export default function ResultScreen() {
  const router = useRouter();

  const [nickname, setNickname] = useState<string | undefined>();
  const [kanshi, setKanshi] = useState<string>('甲子');
  const [viralExpression, setViralExpression] = useState<string | undefined>();
  const [showAnimation, setShowAnimation] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResultData();
  }, []);

  const loadResultData = async () => {
    try {
      const storage = await loadStorage();

      if (storage.fortuneResults && storage.fortuneResults.length > 0) {
        // 最新の結果を取得
        const latest = storage.fortuneResults[storage.fortuneResults.length - 1];
        const resultData = latest.resultData;

        // ニックネームを設定
        setNickname(latest.nickname);

        // 日干支を取得
        const bazi = resultData?.result?.bazi;
        const dayKanshi = bazi?.day?.stemStr && bazi?.day?.branchStr
          ? `${bazi.day.stemStr}${bazi.day.branchStr}`
          : '甲子';

        setKanshi(dayKanshi);
        console.log('🎯 表示する干支:', dayKanshi);

        // バズり表現を非同期で取得
        const viralData = await getCharacterByKanshi(dayKanshi);
        setViralExpression(viralData?.core_style.viral_expression);
      }
    } catch (error) {
      console.error('Failed to load result:', error);
      Alert.alert('エラー', '結果データの読み込みに失敗しました', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    router.replace('/');
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  const handleAnimationSkip = () => {
    setShowAnimation(false);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#FFF9E6] items-center justify-center">
        <Text className="text-6xl mb-4">🔮</Text>
        <Text className="text-2xl font-black text-[#333]">読み込み中...</Text>
      </View>
    );
  }

  // タイピングアニメーション表示中
  if (showAnimation && nickname) {
    const type = kanshiData.types.find(t => t.kanshi === kanshi);

    return (
      <FortuneTypewriterReveal
        userName={nickname}
        kanshi={kanshi}
        typeName={type?.shortName || kanshi}
        icon={type?.icon}
        viralExpression={viralExpression}
        onComplete={handleAnimationComplete}
        onSkip={handleAnimationSkip}
      />
    );
  }

  // メイン結果画面
  return (
    <View className="flex-1 bg-[#FFF9E6]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-4">
        <TouchableOpacity
          onPress={() => router.replace('/')}
          className="bg-white p-2"
          style={{
            borderWidth: 3,
            borderColor: '#333',
            borderRadius: 12,
          }}
        >
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>

        <View
          className="bg-[#333] px-4 py-1"
          style={{ borderRadius: 999 }}
        >
          <Text className="text-white text-sm font-black">GOGYO POP!</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/settings')}
          className="bg-white p-2"
          style={{
            borderWidth: 3,
            borderColor: '#333',
            borderRadius: 12,
          }}
        >
          <Settings color="#333" size={24} />
        </TouchableOpacity>
      </View>

      {/* Result Card */}
      <PopResultCard kanshi={kanshi} onReset={handleReset} />

      {/* Bottom Buttons */}
      <View className="px-4 pb-8 gap-3">
        <TouchableOpacity
          onPress={() => router.push(`/shohousen/${kanshi}` as any)}
          className="flex-row items-center justify-center gap-2 bg-[#c41e3a] p-4"
          style={{
            borderWidth: 3,
            borderColor: '#333',
            borderRadius: 16,
            shadowColor: '#333',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}
        >
          <FileText size={20} color="#fff" />
          <Text className="font-bold text-white text-lg">人生処方箋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/image-prompts')}
          className="flex-row items-center justify-center gap-2 bg-[#FF6B9D] p-4"
          style={{
            borderWidth: 3,
            borderColor: '#333',
            borderRadius: 16,
            shadowColor: '#333',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}
        >
          <Image size={20} color="#fff" />
          <Text className="font-bold text-white text-lg">AI画像プロンプト</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/compatibility')}
          className="flex-row items-center justify-center gap-2 bg-[#60A5FA] p-4"
          style={{
            borderWidth: 3,
            borderColor: '#333',
            borderRadius: 16,
            shadowColor: '#333',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}
        >
          <Users size={20} color="#fff" />
          <Text className="font-bold text-white text-lg">相性診断へ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
