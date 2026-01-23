import { Platform } from 'react-native';

// Lazy load types to avoid runtime import issues
type Analytics = typeof import('@react-native-firebase/analytics').default;
type Crashlytics = typeof import('@react-native-firebase/crashlytics').default;

class MonitoringService {
    private isInitialized = false;

    // 初期化（必要に応じて設定を読み込むなど）
    initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('MonitoringService initialized');
    }

    private get analytics(): Analytics | null {
        try {
            if (__DEV__) return null;
            return require('@react-native-firebase/analytics').default;
        } catch (e) {
            console.warn('Firebase Analytics not available:', e);
            return null;
        }
    }

    private get crashlytics(): Crashlytics | null {
        try {
            if (__DEV__) return null;
            return require('@react-native-firebase/crashlytics').default;
        } catch (e) {
            console.warn('Firebase Crashlytics not available:', e);
            return null;
        }
    }

    // エラー記録
    recordError(error: Error, context?: Record<string, string>) {
        if (__DEV__) {
            console.error('[Monitoring] Error:', error, context);
            return;
        }

        try {
            const crash = this.crashlytics;
            if (crash) {
                const instance = crash();
                if (context) {
                    instance.setAttributes(context);
                }
                instance.recordError(error);
            }
        } catch (e) {
            console.warn('Failed to record error to Crashlytics:', e);
        }
    }

    // ログ記録（非エラー）
    log(message: string) {
        if (__DEV__) {
            console.log('[Monitoring] Log:', message);
            return;
        }
        try {
            const crash = this.crashlytics;
            if (crash) crash().log(message);
        } catch (e) {
            console.warn('Failed to log to Crashlytics:', e);
        }
    }

    // イベント計測
    async logEvent(eventName: string, params?: Record<string, string | number>) {
        if (__DEV__) {
            console.log(`[Monitoring] Event: ${eventName}`, params);
            return;
        }
        try {
            const ana = this.analytics;
            if (ana) {
                await ana().logEvent(eventName, params);
            }
        } catch (e) {
            console.warn('Failed to log event to Analytics:', e);
        }
    }

    // ユーザーID設定
    async setUserId(userId: string) {
        if (__DEV__) return;
        try {
            const crash = this.crashlytics;
            const ana = this.analytics;

            const promises = [];
            if (crash) promises.push(crash().setUserId(userId));
            if (ana) promises.push(ana().setUserId(userId));

            await Promise.all(promises);
        } catch (e) {
            console.warn('Failed to set userId:', e);
        }
    }

    // ユーザー属性設定
    async setUserAttribute(name: string, value: string) {
        if (__DEV__) return;
        try {
            const crash = this.crashlytics;
            const ana = this.analytics;

            const promises = [];
            if (crash) promises.push(crash().setAttribute(name, value));
            if (ana) promises.push(ana().setUserProperty(name, value));

            await Promise.all(promises);
        } catch (e) {
            console.warn('Failed to set user attribute:', e);
        }
    }
}

export const monitoring = new MonitoringService();
