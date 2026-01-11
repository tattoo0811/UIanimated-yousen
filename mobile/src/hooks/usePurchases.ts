import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const PREMIUM_KEY = 'is_premium_mock';

// テスト用のモックプレミアム管理
export const usePurchases = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPremiumStatus();
    }, []);

    const loadPremiumStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(PREMIUM_KEY);
            setIsPremium(value === 'true');
        } catch (error) {
            console.error('Failed to load premium status:', error);
        } finally {
            setLoading(false);
        }
    };

    const setPremiumStatus = async (status: boolean) => {
        try {
            await AsyncStorage.setItem(PREMIUM_KEY, status.toString());
            setIsPremium(status);
        } catch (error) {
            console.error('Failed to set premium status:', error);
        }
    };

    // テスト用: プレミアムを有効化
    const enablePremium = () => setPremiumStatus(true);

    // テスト用: プレミアムを無効化
    const disablePremium = () => setPremiumStatus(false);

    // モック購入（常に成功）
    const purchasePackage = async () => {
        await setPremiumStatus(true);
        return true;
    };

    // モック復元
    const restorePurchases = async () => {
        return isPremium;
    };

    const checkPremiumStatus = async () => {
        await loadPremiumStatus();
    };

    return {
        isPremium,
        loading,
        purchasePackage,
        restorePurchases,
        checkPremiumStatus,
        enablePremium,
        disablePremium,
        offerings: null, // モックなのでnull
    };
};
