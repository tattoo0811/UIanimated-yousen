import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { loadStorage, saveStorage } from './storage';
import type { StorageSchemaV2 } from './storage/schema';
import { calculateBaZi } from './logic/bazi';
import { getDailyFortune } from './logic/dailyFortune';

// DateTriggerInputのtypeプロパティ用の型定義
type DateTriggerType = Notifications.NotificationTriggerInput & { type: typeof Notifications.SchedulableTriggerInputTypes.DATE };

// 通知の表示形式を設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 通知の権限をリクエスト
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return false;
    }

    // Android用の通知チャンネル設定
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-fortune', {
        name: '毎日の運勢',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF7E5F',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    return true;
  } catch (error) {
    console.error('[Notifications] Permission request error:', error);
    return false;
  }
}

/**
 * 毎日の運勢通知をスケジュール
 * @param hour 通知時刻（時、デフォルト: 8時）
 * @param minute 通知時刻（分、デフォルト: 0分）
 */
export async function scheduleDailyFortuneNotification(
  hour: number = 8,
  minute: number = 0
): Promise<void> {
  try {
    // 既存の通知をキャンセル
    await Notifications.cancelAllScheduledNotificationsAsync();

    // ストレージからユーザー情報を取得
    const storage = await loadStorage();
    
    if (!storage.birthData) {
      console.warn('[Notifications] Birth data not found, skipping notification schedule');
      return;
    }

    // 生年月日から四柱推命を計算
    const birthDate = new Date(
      storage.birthData.year,
      storage.birthData.month - 1,
      storage.birthData.day,
      storage.birthData.hour || 0,
      storage.birthData.minute || 0
    );

    // 今日の運勢を取得（通知内容のプレビュー用）
    const bazi = calculateBaZi(birthDate);
    const todayFortune = getDailyFortune(bazi, new Date());

    // 通知内容を生成
    const title = `今日の運勢: ${todayFortune.level}`;
    const body = todayFortune.advice;

    // 毎日の通知をスケジュール（30日分）
    const notifications = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const notificationDate = new Date(now);
      notificationDate.setDate(now.getDate() + i);
      notificationDate.setHours(hour, minute, 0, 0);

      // 過去の日付はスキップ
      if (notificationDate <= now) {
        continue;
      }

      // その日の運勢を計算
      const fortune = getDailyFortune(bazi, notificationDate);
      const notificationTitle = `今日の運勢: ${fortune.level}`;
      const notificationBody = fortune.advice;

      notifications.push({
        content: {
          title: notificationTitle,
          body: notificationBody,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            date: fortune.date,
            level: fortune.level,
            type: 'daily-fortune',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationDate,
        } as DateTriggerType,
      });
    }

    // 通知をスケジュール
    for (const notification of notifications) {
      await Notifications.scheduleNotificationAsync(notification);
    }

    console.log(`[Notifications] Scheduled ${notifications.length} daily fortune notifications`);
  } catch (error) {
    console.error('[Notifications] Schedule error:', error);
  }
}

/**
 * 通知のスケジュールを更新（アプリ起動時や設定変更時）
 */
export async function updateNotificationSchedule(): Promise<void> {
  try {
    const storage = await loadStorage();

    // 通知が有効でない場合はスキップ
    if (storage.settings.notifications === false) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[Notifications] Notifications disabled, cancelled all schedules');
      return;
    }

    // 権限を確認
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[Notifications] No permission, skipping schedule');
      return;
    }

    // 通知をスケジュール（デフォルト: 毎朝8時）
    await scheduleDailyFortuneNotification(8, 0);
  } catch (error) {
    console.error('[Notifications] Update schedule error:', error);
  }
}

/**
 * 通知設定を更新
 */
export async function updateNotificationSettings(enabled: boolean): Promise<void> {
  try {
    const storage = await loadStorage();
    const updatedStorage: StorageSchemaV2 = {
      ...storage,
      settings: {
        ...storage.settings,
        notifications: enabled,
      },
    };

    await saveStorage(updatedStorage);

    if (enabled) {
      await updateNotificationSchedule();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch (error) {
    console.error('[Notifications] Update settings error:', error);
    throw error;
  }
}

/**
 * 通知の受信ハンドラーを設定
 */
export function setupNotificationHandlers(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
): void {
  // フォアグラウンドで通知を受信したとき
  Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Notifications] Received:', notification);
    onNotificationReceived?.(notification);
  });

  // 通知がタップされたとき
  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Notifications] Tapped:', response);
    onNotificationTapped?.(response);
  });
}
