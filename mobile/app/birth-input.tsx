import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import clsx from 'clsx';
import { validateBirthDate } from '@/src/utils/validation';

export default function BirthInputScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const gender = params.gender as 'male' | 'female';

  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 1));
  const [birthTime, setBirthTime] = useState(new Date(1990, 0, 1, 12, 0));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setBirthTime(selectedTime);
    }
  };

  const handleNext = () => {
    // バリデーション
    const validation = validateBirthDate(birthDate);
    if (!validation.valid) {
      Alert.alert('エラー', validation.error);
      return;
    }

    // 日付と時刻を統合
    const fullDateTime = new Date(
      birthDate.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate(),
      birthTime.getHours(),
      birthTime.getMinutes(),
      0
    );

    router.push({
      pathname: '/loading',
      params: {
        birthDate: fullDateTime.toISOString(),
        gender: gender,
        longitude: '135' // デフォルト: 日本標準時子午線
      }
    });
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View className="flex-1 bg-background-dark">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-4 py-4 justify-between bg-background-dark">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface-dark items-center justify-center"
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">生年月日・時刻</Text>
        <View className="w-10" />
      </View>

      {/* Progress */}
      <View className="px-6 py-4 flex-row gap-2">
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
        <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
        <View className="h-1.5 flex-1 rounded-full bg-surface-dark border border-white/10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-4">
        <View className="items-center mb-8">
          <Text className="text-3xl font-extrabold text-white text-center mb-3">
            生年月日と時刻を{'\n'}教えてください
          </Text>
          <Text className="text-white/60 text-sm text-center leading-relaxed">
            正確な占い結果を得るため、できるだけ{'\n'}正確な生年月日と時刻を入力してください
          </Text>
        </View>

        <View className="gap-6">
          {/* Date Input */}
          <View>
            <Text className="text-white/80 text-sm font-medium mb-3 ml-1">生年月日</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              testID="date-picker-trigger"
              className="flex-row items-center p-4 rounded-xl border-2 border-white/10 bg-surface-dark h-20"
            >
              <LinearGradient
                colors={['#e879f9', '#9333ea']}
                style={styles.iconGradient}
              >
                <Calendar color="white" size={24} />
              </LinearGradient>

              <View className="ml-4 flex-1">
                <Text className="text-white/50 text-xs mb-1">生年月日</Text>
                <Text className="text-white text-xl font-bold">
                  {formatDate(birthDate)}
                </Text>
              </View>

              <ArrowRight color="white" size={20} opacity={0.5} />
            </TouchableOpacity>
          </View>

          {/* Time Input */}
          <View>
            <Text className="text-white/80 text-sm font-medium mb-3 ml-1">出生時刻</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              testID="time-picker-trigger"
              className="flex-row items-center p-4 rounded-xl border-2 border-white/10 bg-surface-dark h-20"
            >
              <LinearGradient
                colors={['#22d3ee', '#2563eb']}
                style={styles.iconGradient}
              >
                <Clock color="white" size={24} />
              </LinearGradient>

              <View className="ml-4 flex-1">
                <Text className="text-white/50 text-xs mb-1">出生時刻</Text>
                <Text className="text-white text-xl font-bold">
                  {formatTime(birthTime)}
                </Text>
              </View>

              <ArrowRight color="white" size={20} opacity={0.5} />
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View className="bg-primary/10 border border-primary/30 rounded-xl p-4 mt-2">
            <Text className="text-primary text-xs leading-relaxed">
              💡 出生時刻が不明な場合は、12:00（正午）で計算されます。{'\n'}
              より正確な結果を得るには、母子手帳などで確認してください。
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={birthTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {/* Footer CTA */}
      <View className="p-6 bg-background-dark">
        <TouchableOpacity
          onPress={handleNext}
          testID="calculate-button"
          className="w-full h-14 rounded-full items-center justify-center flex-row gap-2 bg-primary"
        >
          <Text className="text-white font-bold text-lg">計算を開始</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
