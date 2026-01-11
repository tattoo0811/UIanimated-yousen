import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { updateNotificationSchedule, setupNotificationHandlers } from '@/src/lib/notifications';
import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Tamanegi: require('../assets/fonts/Tamanegi.ttf'),
  });

  // ナビゲーション状態を確認
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (loaded && rootNavigationState?.key) {
      SplashScreen.hideAsync();
    }
  }, [loaded, rootNavigationState?.key]);

  // 通知の初期設定
  useEffect(() => {
    // 通知ハンドラーを設定
    setupNotificationHandlers(
      (notification) => {
        // フォアグラウンドで通知を受信したときの処理
        console.log('Notification received:', notification);
      },
      (response) => {
        // 通知がタップされたときの処理
        console.log('Notification tapped:', response);
        // 必要に応じて特定の画面に遷移
        // const router = useRouter();
        // router.push('/fortune');
      }
    );

    // 通知スケジュールを更新
    updateNotificationSchedule().catch((error) => {
      console.error('Failed to update notification schedule:', error);
    });
  }, []);

  // フォントがまだ読み込まれていない場合
  if (!loaded) {
    return null;
  }

  // ナビゲーションがまだ準備できていない場合
  if (!rootNavigationState?.key) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF7E5F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#FFF9E6' },
              animation: 'slide_from_right',
            }}
          />
          <StatusBar
            style="dark"
            backgroundColor={Platform.OS === 'android' ? '#FFF9E6' : undefined}
            translucent={Platform.OS === 'android' ? false : true}
          />
        </ErrorBoundary>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
