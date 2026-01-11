import AsyncStorage from '@react-native-async-storage/async-storage';

const USAGE_KEY = 'usage_counts';
const FREE_LIMIT = 3;

interface UsageCounts {
    diagnoses: number;
    compatibility: string[]; // Array of partner kanshi
    lastReset: string;
}

export const getUsageCounts = async (): Promise<UsageCounts> => {
    try {
        const data = await AsyncStorage.getItem(USAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to get usage counts:', error);
    }

    return {
        diagnoses: 0,
        compatibility: [],
        lastReset: new Date().toISOString(),
    };
};

export const incrementDiagnosis = async (): Promise<boolean> => {
    const counts = await getUsageCounts();
    counts.diagnoses += 1;

    try {
        await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(counts));
        return counts.diagnoses <= FREE_LIMIT;
    } catch (error) {
        console.error('Failed to increment diagnosis:', error);
        return false;
    }
};

export const addCompatibilityCheck = async (partnerKanshi: string): Promise<boolean> => {
    const counts = await getUsageCounts();

    if (!counts.compatibility.includes(partnerKanshi)) {
        counts.compatibility.push(partnerKanshi);
    }

    try {
        await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(counts));
        return counts.compatibility.length <= FREE_LIMIT;
    } catch (error) {
        console.error('Failed to add compatibility check:', error);
        return false;
    }
};

export const canUseDiagnosis = async (): Promise<boolean> => {
    const counts = await getUsageCounts();
    return counts.diagnoses < FREE_LIMIT;
};

export const canUseCompatibility = async (): Promise<boolean> => {
    const counts = await getUsageCounts();
    return counts.compatibility.length < FREE_LIMIT;
};

export const resetUsageCounts = async (): Promise<void> => {
    const newCounts: UsageCounts = {
        diagnoses: 0,
        compatibility: [],
        lastReset: new Date().toISOString(),
    };

    try {
        await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(newCounts));
    } catch (error) {
        console.error('Failed to reset usage counts:', error);
    }
};
