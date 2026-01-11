import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { calculateBaZi, calculateFiveElements, calculateYangSen, calculateEnergyScore, calculateSanmeigakuInsen, calculateTaiun } from '@/src/lib/logic';
import { loadStorage, saveStorage } from '@/src/lib/storage';
import type { CalculationResult } from '@/src/types';

export default function LoadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    performCalculation();
  }, []);

  const performCalculation = async () => {
    try {
      const birthDateStr = params.birthDate as string;
      const gender = params.gender as 'male' | 'female';
      const longitudeStr = params.longitude as string || '135';

      if (!birthDateStr || !gender) {
        throw new Error('必要なパラメータが不足しています');
      }

      const fullDateTime = new Date(birthDateStr);
      const longitude = parseFloat(longitudeStr);

      console.log('🧮 計算開始...', { date: fullDateTime });

      const bazi = calculateBaZi(fullDateTime, longitude);
      const fiveElements = calculateFiveElements(bazi);
      const energyScore = calculateEnergyScore(bazi);
      const yangSen = calculateYangSen(bazi, fullDateTime);
      const insen = calculateSanmeigakuInsen(bazi, fullDateTime);
      const taiun = calculateTaiun(bazi, fullDateTime, gender);

      console.log('✅ 計算完了:', { day: bazi.day.name });

      const result: CalculationResult = {
        input: {
          birthDate: fullDateTime.toISOString(),
          gender: gender,
          longitude: longitude
        },
        result: {
          bazi: bazi,
          fiveElements: fiveElements,
          yangSen: yangSen,
          energyScore: energyScore,
          insen: insen,
          taiun: taiun
        },
        timestamp: new Date().toISOString()
      };

      // 新しいストレージシステムへ保存
      const storage = await loadStorage();

      // 結果ID生成
      const resultId = `result_${Date.now()}`;

      const newFortuneResult = {
        id: resultId,
        birthDate: fullDateTime.toISOString(),
        resultType: 'diagnosis',
        resultData: result,
        createdAt: Date.now()
      };

      const updatedStorage = {
        ...storage,
        fortuneResults: [...storage.fortuneResults, newFortuneResult]
      };

      await saveStorage(updatedStorage);
      console.log('💾 保存完了:', resultId);

      // タブの結果画面へ遷移
      setTimeout(() => {
        router.replace('/(tabs)/result');
      }, 1500);

    } catch (error) {
      console.error('❌ 計算エラー:', error);
      Alert.alert(
        '計算に失敗しました',
        '生年月日を確認してもう一度お試しください。',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  return (
    <View className="flex-1 bg-[#FFF9E6]" style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated Circles */}
      <View style={styles.circleOuter}>
        <View style={styles.circleMiddle}>
          <View style={styles.circleInner}>
            <Text style={styles.emoji}>🔮</Text>
          </View>
        </View>
      </View>

      {/* Loading Text */}
      <Text style={styles.title}>診断中...</Text>
      <Text style={styles.subtitle}>あなたの運命を解析しています</Text>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {['四柱推命の計算', '五行バランス分析', '運命タイプ判定'].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={[styles.dot, { backgroundColor: ['#A3E635', '#60A5FA', '#FB7185'][i] }]} />
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <ActivityIndicator size="large" color="#FB7185" style={{ marginTop: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  circleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#333',
    backgroundColor: '#A3E635',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#333',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  circleMiddle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#333',
    backgroundColor: '#60A5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#333',
    backgroundColor: '#FB7185',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 32,
  },
  stepsContainer: {
    width: '100%',
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#333',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
  },
  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
