import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Settings, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import PopResultCard from '@/src/components/PopResultCard';
import { loadResult } from '@/src/utils/storage';
import type { CalculationResult } from '@/src/types';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const resultId = params.resultId as string;

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResultData();
  }, []);

  const loadResultData = async () => {
    try {
      console.log('📖 結果を読み込み中...', resultId);

      if (!resultId) {
        throw new Error('結果IDが見つかりません');
      }

      const data = await loadResult(resultId);
      console.log('📦 読み込んだデータ:', JSON.stringify(data, null, 2).slice(0, 500));

      if (!data) {
        throw new Error('結果データが見つかりません');
      }

      setResult(data);
    } catch (error) {
      console.error('Failed to load result:', error);
      Alert.alert('エラー', '結果データの読み込みに失敗しました', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    router.replace('/');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#FFF9E6] items-center justify-center">
        <Text className="text-6xl mb-4">🔮</Text>
        <Text className="text-2xl font-black text-[#333]">読み込み中...</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View className="flex-1 bg-[#FFF9E6] items-center justify-center">
        <Text className="text-6xl mb-4">😢</Text>
        <Text className="text-xl font-black text-[#333]">データが見つかりません</Text>
        <TouchableOpacity
          onPress={handleReset}
          className="mt-8 bg-[#FF7E5F] px-8 py-4"
          style={{
            borderWidth: 3,
            borderColor: '#333',
            borderRadius: 16,
          }}
        >
          <Text className="text-white font-bold">トップに戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 日干支を取得
  const bazi = result.result?.bazi;
  const kanshi = bazi?.day?.stemStr && bazi?.day?.branchStr
    ? `${bazi.day.stemStr}${bazi.day.branchStr}`
    : '甲子';

  console.log('🎯 表示する干支:', kanshi);

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

      {/* Bottom Button */}
      <View className="px-4 pb-8">
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
