import * as Linking from 'expo-linking';
import { Platform, Alert } from 'react-native';

export type SharePlatform = 'twitter' | 'instagram' | 'line' | 'native';

export interface ShareContent {
    title?: string;
    message: string;
    url?: string;
}

/**
 * URLエンコードされたテキストを生成
 */
function encodeText(text: string): string {
    return encodeURIComponent(text);
}

/**
 * X(Twitter)へのシェア
 */
async function shareToTwitter(content: ShareContent): Promise<boolean> {
    const text = content.message;
    const url = content.url ? ` ${content.url}` : '';
    const fullText = `${text}${url}`;
    
    // URLスキームを試行（アプリがインストールされている場合）
    const twitterAppUrl = `twitter://post?message=${encodeText(fullText)}`;
    const canOpen = await Linking.canOpenURL(twitterAppUrl);
    
    if (canOpen) {
        try {
            await Linking.openURL(twitterAppUrl);
            return true;
        } catch (error) {
            console.error('Failed to open Twitter app:', error);
        }
    }
    
    // フォールバック: Web版Twitter
    const webUrl = `https://twitter.com/intent/tweet?text=${encodeText(fullText)}`;
    try {
        await Linking.openURL(webUrl);
        return true;
    } catch (error) {
        console.error('Failed to open Twitter web:', error);
        return false;
    }
}

/**
 * Instagramへのシェア
 * 注意: Instagramは直接テキストシェアをサポートしていないため、
 * ストーリーや投稿には画像が必要です。ここではWeb版へのリンクを提供します。
 */
async function shareToInstagram(content: ShareContent): Promise<boolean> {
    // InstagramアプリのURLスキーム（ストーリー用）
    // テキストのみのシェアはサポートされていないため、Web版へのリンクを提供
    const webUrl = `https://www.instagram.com/`;
    
    try {
        // まずアプリを試行
        const instagramAppUrl = `instagram://`;
        const canOpen = await Linking.canOpenURL(instagramAppUrl);
        
        if (canOpen) {
            // アプリがインストールされている場合、アラートで案内
            Alert.alert(
                'Instagramでシェア',
                'Instagramアプリを開きました。ストーリーや投稿から結果をシェアしてください。',
                [{ text: 'OK' }]
            );
            await Linking.openURL(instagramAppUrl);
            return true;
        } else {
            // アプリがない場合はWeb版を開く
            await Linking.openURL(webUrl);
            return true;
        }
    } catch (error) {
        console.error('Failed to open Instagram:', error);
        return false;
    }
}

/**
 * LINEへのシェア
 */
async function shareToLine(content: ShareContent): Promise<boolean> {
    const text = content.message;
    const url = content.url ? `\n${content.url}` : '';
    const fullText = `${text}${url}`;
    
    // LINEのURLスキーム
    const lineUrl = `line://msg/text/${encodeText(fullText)}`;
    
    try {
        const canOpen = await Linking.canOpenURL(lineUrl);
        if (canOpen) {
            await Linking.openURL(lineUrl);
            return true;
        } else {
            // LINEアプリがインストールされていない場合
            Alert.alert(
                'LINEアプリが必要です', 
                'LINEアプリをインストールしてから再度お試しください。',
                [{ text: 'OK' }]
            );
            return false;
        }
    } catch (error) {
        console.error('Failed to open LINE:', error);
        return false;
    }
}

/**
 * ネイティブシェアシートを使用
 */
async function shareNative(content: ShareContent): Promise<boolean> {
    // React NativeのShare APIを使用
    if (Platform.OS === 'web') {
        // Web版ではWeb Share APIを使用
        if (navigator.share) {
            try {
                await navigator.share({
                    title: content.title || '',
                    text: content.message,
                    url: content.url || '',
                });
                return true;
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Failed to share:', error);
                }
                return false;
            }
        } else {
            // フォールバック: クリップボードにコピー
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(`${content.message}${content.url ? '\n' + content.url : ''}`);
                Alert.alert('コピーしました', 'テキストをクリップボードにコピーしました。');
                return true;
            }
            return false;
        }
    } else {
        // ネイティブアプリではexpo-sharingを使用
        const { shareAsync } = await import('expo-sharing');
        // テキストのみのシェアはexpo-sharingでは直接サポートされていないため、
        // ここではTwitterをデフォルトとして使用
        return shareToTwitter(content);
    }
}

/**
 * SNSシェア機能のメイン関数
 */
export async function shareToSocial(
    platform: SharePlatform,
    content: ShareContent
): Promise<boolean> {
    try {
        switch (platform) {
            case 'twitter':
                return await shareToTwitter(content);
            case 'instagram':
                return await shareToInstagram(content);
            case 'line':
                return await shareToLine(content);
            case 'native':
                return await shareNative(content);
            default:
                return false;
        }
    } catch (error) {
        console.error(`Failed to share to ${platform}:`, error);
        Alert.alert('エラー', 'シェアに失敗しました。もう一度お試しください。');
        return false;
    }
}

/**
 * シェアプラットフォーム選択ダイアログを表示
 */
export function showShareOptions(
    content: ShareContent,
    onSelect?: (platform: SharePlatform) => void
): void {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // ネイティブアプリでは、まずネイティブシェアを試行
        shareNative(content);
    } else {
        // Web版では選択ダイアログを表示
        Alert.alert(
            'シェア先を選択',
            'シェアするSNSを選択してください',
            [
                { text: 'キャンセル', style: 'cancel' },
                { text: 'X(Twitter)', onPress: () => shareToTwitter(content) },
                { text: 'LINE', onPress: () => shareToLine(content) },
                { text: 'その他', onPress: () => shareNative(content) },
            ]
        );
    }
}
