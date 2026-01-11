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
