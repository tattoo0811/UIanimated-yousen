import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import type { SanmeigakuInsenChart } from '@/src/types';
import { Heart, Users, Briefcase, Home, X, Check, Video } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
// TODO: Restore import when lib file is available
// import { calculateBaZi } from '@/src/lib/logic';
import { getKanshiPopType, ELEMENT_COLORS } from '@/src/data/kanshi-pop-types';

// Temporary stub implementation
const calculateBaZi = (birthDate: Date) => {
    return {
        year: { stemStr: '甲', branchStr: '子' },
        month: { stemStr: '甲', branchStr: '子' },
        day: { stemStr: '甲', branchStr: '子' },
        hour: { stemStr: '甲', branchStr: '子' }
    };
};
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

type Props = {
    insen: SanmeigakuInsenChart;
};

type RelationType = 'romantic' | 'business' | 'friendship' | 'family';

interface SavedPartner {
    name: string;
    year: number;
    month: number;
    day: number;
    kanshi: string;
}

interface CompatibilityResult {
    scores: {
        overall: number;
        love: number;
        work: number;
        friendship: number;
    };
    level: 'perfect' | 'great' | 'good' | 'neutral' | 'challenging';
    message: string;
    advice: string;
    comparisons: Array<{
        person1: string;
        person2: string;
        score: number;
        strengths: string[];
        challenges: string[];
    }>;
}

interface MultiPersonComparison {
    people: Array<{
        name: string;
        birthDate: string;
        gender: 'male' | 'female';
        insen: any;
    }>;
    matrix: number[][];
    rankings: Array<{
        person: string;
        averageScore: number;
        bestMatch: string;
        bestMatchScore: number;
    }>;
}

const SAVED_PARTNERS_KEY = 'saved_partners';
const BACKEND_URL = 'http://localhost:8080'; // TODO: Use environment variable

export default function CompatibilityCard({ insen }: Props) {
    const router = useRouter();
    const currentYear = new Date().getFullYear();
    const [nickname, setNickname] = useState('');
    const [year, setYear] = useState(1990);
    const [month, setMonth] = useState(1);
    const [day, setDay] = useState(1);
    const [editingField, setEditingField] = useState<'year' | 'month' | 'day' | null>(null);
    const [relationType, setRelationType] = useState<RelationType>('romantic');
    const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
    const [groupResults, setGroupResults] = useState<MultiPersonComparison | null>(null);
    const [savedPartners, setSavedPartners] = useState<SavedPartner[]>([]);
    const [selectedPartnerIndex, setSelectedPartnerIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const myKanshi = `${insen.pillars.day.stem}${insen.pillars.day.branch}`;
    const myType = getKanshiPopType(myKanshi);

    useEffect(() => { loadSavedPartners(); }, []);

    const loadSavedPartners = async () => {
        try {
            const saved = await AsyncStorage.getItem(SAVED_PARTNERS_KEY);
            if (saved) setSavedPartners(JSON.parse(saved));
        } catch (error) {
            console.error('Failed to load:', error);
        }
    };

    const saveAndDiagnose = async () => {
        if (savedPartners.length >= 10) return; // Increased from 3 to 10

        const partnerBirthdate = new Date(year, month - 1, day);
        const partnerBazi = calculateBaZi(partnerBirthdate);
        const partnerKanshi = `${partnerBazi.day.stemStr}${partnerBazi.day.branchStr}`;

        const newPartner: SavedPartner = {
            name: nickname || `相手${savedPartners.length + 1}`,
            year, month, day,
            kanshi: partnerKanshi,
        };

        const updated = [...savedPartners, newPartner];
        setSavedPartners(updated);
        await AsyncStorage.setItem(SAVED_PARTNERS_KEY, JSON.stringify(updated));

        setSelectedPartnerIndex(updated.length - 1);
        await calculateWithBackend();
        setNickname('');
        setEditingField(null);
    };

    const removePartner = async (index: number) => {
        const updated = savedPartners.filter((_, i) => i !== index);
        setSavedPartners(updated);
        await AsyncStorage.setItem(SAVED_PARTNERS_KEY, JSON.stringify(updated));
        if (selectedPartnerIndex === index) {
            setSelectedPartnerIndex(null);
            setCompatibility(null);
            setGroupResults(null);
        }
    };

    const selectPartner = (index: number) => {
        setSelectedPartnerIndex(index);
        calculateWithBackend();
    };

    const calculateWithBackend = async () => {
        setIsLoading(true);
        try {
            const myBirthDate = await getMyBirthDate();
            const people = [
                {
                    name: 'あなた',
                    birthDate: myBirthDate,
                    gender: 'female' as const, // TODO: Get from user profile
                },
                ...savedPartners.map(p => ({
                    name: p.name,
                    birthDate: `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`,
                    gender: 'female' as const, // TODO: Add gender input
                })),
            ];

            const response = await fetch(`${BACKEND_URL}/api/compatibility/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ people }),
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();

            if (savedPartners.length === 0 || (savedPartners.length === 1 && selectedPartnerIndex === 0)) {
                setCompatibility(data as CompatibilityResult);
                setGroupResults(null);
            } else {
                setGroupResults(data as MultiPersonComparison);
                setCompatibility(null);
            }
        } catch (error) {
            console.error('API error:', error);
            // Fallback to local calculation could go here
        } finally {
            setIsLoading(false);
        }
    };

    const getMyBirthDate = async (): Promise<string> => {
        // TODO: Get from AsyncStorage or user profile
        // For now, return a default date
        return '1990-01-01';
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#A3E635';
        if (score >= 60) return '#60A5FA';
        if (score >= 40) return '#FACC15';
        return '#FB7185';
    };

    const getLevelEmoji = (level: string) => {
        const emojis: Record<string, string> = {
            perfect: '💕✨',
            great: '💗',
            good: '😊',
            neutral: '🤝',
            challenging: '💪',
        };
        return emojis[level] || '❓';
    };

    const navigateToResult = () => {
        if (!compatibility && !groupResults) return;

        const resultJson = JSON.stringify(compatibility || groupResults);
        const peopleJson = JSON.stringify([
            { name: 'あなた', birthDate: '1990-01-01', gender: 'female' },
            ...savedPartners.map(p => ({
                name: p.name,
                birthDate: `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`,
                gender: 'female',
            })),
        ]);

        router.push({
            pathname: '/result',
            params: {
                type: 'compatibility',
                result: resultJson,
                people: peopleJson,
            },
        } as any);
    };

    const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => 1920 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="mb-4">
                <Text className="text-2xl font-black text-[#333]">相性診断 💫</Text>
                <Text className="text-gray-600 font-bold">あなた: {myType?.name || myKanshi} {myType?.icon}</Text>
            </View>

            {/* Saved Partners */}
            {savedPartners.length > 0 && (
                <View className="mb-4">
                    <Text className="text-sm font-bold text-gray-500 mb-2">
                        保存済み {savedPartners.length}/10 (タップで診断)
                    </Text>
                    <View className="flex-row gap-2 flex-wrap">
                        {savedPartners.map((partner, index) => {
                            const type = getKanshiPopType(partner.kanshi);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => selectPartner(index)}
                                    className="p-3 mb-2"
                                    style={{
                                        backgroundColor: selectedPartnerIndex === index ? (type?.color || '#fff') : '#fff',
                                        borderWidth: 3,
                                        borderColor: '#333',
                                        borderRadius: 12,
                                        minWidth: 100,
                                    }}
                                >
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-sm font-bold text-[#333]">{partner.name}</Text>
                                        <TouchableOpacity onPress={() => removePartner(index)}>
                                            <X size={14} color="#333" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text className="text-xs text-gray-600">{type?.icon} {type?.name?.slice(0, 6) || partner.kanshi}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Add New */}
            {savedPartners.length < 10 && (
                <View
                    className="bg-white p-4 mb-4"
                    style={{
                        borderWidth: 3,
                        borderColor: '#333',
                        borderRadius: 16,
                    }}
                >
                    <Text className="font-bold text-[#333] mb-2">新しく追加</Text>
                    <View className="flex-row gap-2 items-center">
                        <TextInput
                            value={nickname}
                            onChangeText={setNickname}
                            placeholder="名前"
                            placeholderTextColor="#999"
                            className="flex-1 bg-[#FFF9E6] px-3 py-2 font-bold"
                            style={{
                                borderWidth: 2,
                                borderColor: '#333',
                                borderRadius: 8,
                            }}
                        />
                        {['year', 'month', 'day'].map((field) => (
                            <TouchableOpacity
                                key={field}
                                onPress={() => setEditingField(editingField === field ? null : field as any)}
                                className="px-3 py-2"
                                style={{
                                    backgroundColor: editingField === field ? '#60A5FA' : '#FFF9E6',
                                    borderWidth: 2,
                                    borderColor: '#333',
                                    borderRadius: 8,
                                }}
                            >
                                <Text className="font-bold text-[#333] text-xs">
                                    {field === 'year' ? year : field === 'month' ? `${month}月` : `${day}日`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={saveAndDiagnose}
                            className="bg-[#FF7E5F] p-2"
                            style={{
                                borderWidth: 2,
                                borderColor: '#333',
                                borderRadius: 8,
                            }}
                        >
                            <Check size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {editingField && (
                        <View
                            className="mt-2"
                            style={{
                                borderWidth: 2,
                                borderColor: '#333',
                                borderRadius: 8,
                                overflow: 'hidden',
                            }}
                        >
                            <Picker
                                selectedValue={editingField === 'year' ? year : editingField === 'month' ? month : day}
                                onValueChange={(v) => {
                                    if (editingField === 'year') setYear(v);
                                    else if (editingField === 'month') setMonth(v);
                                    else setDay(v);
                                }}
                                style={{ height: 120 }}
                                itemStyle={{ fontWeight: 'bold' }}
                            >
                                {(editingField === 'year' ? years : editingField === 'month' ? months : days).map((v) => (
                                    <Picker.Item
                                        key={v}
                                        label={`${v}${editingField === 'year' ? '年' : editingField === 'month' ? '月' : '日'}`}
                                        value={v}
                                    />
                                ))}
                            </Picker>
                        </View>
                    )}
                </View>
            )}

            {/* Loading */}
            {isLoading && (
                <View className="py-12 items-center">
                    <ActivityIndicator size="large" color="#FF7E5F" />
                    <Text className="text-gray-600 font-bold mt-4">診断中...</Text>
                </View>
            )}

            {/* Pairwise Result */}
            {compatibility && !isLoading && (
                <View
                    className="p-6 mb-4"
                    style={{
                        backgroundColor: getScoreColor(compatibility.scores.overall),
                        borderWidth: 4,
                        borderColor: '#333',
                        borderRadius: 24,
                        shadowColor: '#333',
                        shadowOffset: { width: 8, height: 8 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                    }}
                >
                    <Text className="text-6xl font-black text-center mb-2">{compatibility.scores.overall}</Text>
                    <Text className="text-2xl font-black text-center text-[#333] mb-2">
                        {getLevelEmoji(compatibility.level)} {compatibility.message}
                    </Text>

                    <View className="flex-row items-center justify-center gap-4 mb-4">
                        <View className="items-center">
                            <Text className="text-4xl">{myType?.icon}</Text>
                            <Text className="font-bold text-xs text-[#333]/60">あなた</Text>
                        </View>
                        <Text className="text-3xl">💕</Text>
                        <View className="items-center">
                            <Text className="text-4xl">{getKanshiPopType(savedPartners[0]?.kanshi || '')?.icon || '❓'}</Text>
                            <Text className="font-bold text-xs text-[#333]/60">相手</Text>
                        </View>
                    </View>

                    {/* Aspect Scores */}
                    <View className="mb-4">
                        {[
                            { label: '恋愛', score: compatibility.scores.love, icon: '💕' },
                            { label: '仕事', score: compatibility.scores.work, icon: '💼' },
                            { label: '友情', score: compatibility.scores.friendship, icon: '🤝' },
                        ].map((aspect) => (
                            <View key={aspect.label} className="flex-row items-center py-1">
                                <Text className="text-lg mr-2">{aspect.icon}</Text>
                                <Text className="flex-1 font-bold text-sm">{aspect.label}</Text>
                                <Text className="font-bold text-sm">{aspect.score}点</Text>
                            </View>
                        ))}
                    </View>

                    <View
                        className="bg-white/50 p-4 mb-4"
                        style={{ borderRadius: 12 }}
                    >
                        <Text className="font-bold text-[#333] text-center text-sm">{compatibility.advice}</Text>
                    </View>

                    {/* Generate Video Button */}
                    <TouchableOpacity
                        onPress={navigateToResult}
                        className="bg-[#60A5FA] p-3 flex-row items-center justify-center"
                        style={{ borderRadius: 12, borderWidth: 2, borderColor: '#333' }}
                    >
                        <Video size={20} color="#fff" />
                        <Text className="text-white font-bold ml-2">動画で見る 🎬</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Group Comparison Result */}
            {groupResults && !isLoading && (
                <View className="mb-4">
                    <Text className="text-xl font-bold mb-3">グループ相性ランキング 🏆</Text>
                    {groupResults.rankings.map((ranking, index) => {
                        const type = getKanshiPopType(savedPartners.find(p => p.name === ranking.person)?.kanshi || '');
                        return (
                            <View
                                key={index}
                                className="p-4 mb-2"
                                style={{
                                    backgroundColor: index === 0 ? '#A3E635' : '#fff',
                                    borderWidth: 3,
                                    borderColor: '#333',
                                    borderRadius: 12,
                                }}
                            >
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <Text className="text-2xl font-black mr-2">#{index + 1}</Text>
                                        <Text className="text-lg font-bold">{ranking.person} {type?.icon}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-2xl font-black">{ranking.averageScore}点</Text>
                                        <Text className="text-xs text-gray-600">
                                            ベスト: {ranking.bestMatch} ({ranking.bestMatchScore}点)
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {/* Generate Video Button for Group */}
                    <TouchableOpacity
                        onPress={navigateToResult}
                        className="bg-[#60A5FA] p-4 flex-row items-center justify-center mt-4"
                        style={{ borderRadius: 12, borderWidth: 2, borderColor: '#333' }}
                    >
                        <Video size={20} color="#fff" />
                        <Text className="text-white font-bold ml-2">動画でシェア 🎬</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!compatibility && !groupResults && !isLoading && (
                <View className="items-center py-12">
                    <Text className="text-5xl mb-4">👆</Text>
                    <Text className="text-gray-500 font-bold text-center">
                        相手を追加または選択して{'\n'}相性を診断しよう！
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}
