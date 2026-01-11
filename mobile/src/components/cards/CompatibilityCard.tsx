import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import type { SanmeigakuInsenChart } from '@/src/types';
import { Heart, Users, Briefcase, Home, X, Check } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { calculateBaZi } from '@/src/lib/logic';
import { getKanshiPopType, ELEMENT_COLORS } from '@/src/data/kanshi-pop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const SAVED_PARTNERS_KEY = 'saved_partners';

// 相性計算
const calculateCompatibility = (myKanshi: string, partnerKanshi: string, relationType: RelationType) => {
    const myStem = myKanshi[0];
    const partnerStem = partnerKanshi[0];

    const stemElements: Record<string, string> = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
        '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
    };

    const myElement = stemElements[myStem];
    const partnerElement = stemElements[partnerStem];

    const kangoSets = [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']];
    const isKango = kangoSets.some(set =>
        (set[0] === myStem && set[1] === partnerStem) || (set[0] === partnerStem && set[1] === myStem)
    );

    let score = 50;
    if (isKango) score += 30;
    else if (myElement === partnerElement) score += 15;
    else score += 10;

    score = Math.min(100, Math.max(0, score + Math.floor(Math.random() * 20)));

    const myType = getKanshiPopType(myKanshi);
    const partnerType = getKanshiPopType(partnerKanshi);

    return {
        score,
        scoreLevel: score >= 80 ? '最高の相性！' : score >= 60 ? 'いい感じ！' : score >= 40 ? 'まあまあ' : 'ちょっと...',
        myType,
        partnerType,
        advice: isKango ? '運命的な出会い！お互いを高め合える関係です。' : '刺激し合える関係。違いを楽しんで！',
    };
};

export default function CompatibilityCard({ insen }: Props) {
    const currentYear = new Date().getFullYear();
    const [nickname, setNickname] = useState('');
    const [year, setYear] = useState(1990);
    const [month, setMonth] = useState(1);
    const [day, setDay] = useState(1);
    const [editingField, setEditingField] = useState<'year' | 'month' | 'day' | null>(null);
    const [relationType, setRelationType] = useState<RelationType>('romantic');
    const [compatibility, setCompatibility] = useState<any>(null);
    const [savedPartners, setSavedPartners] = useState<SavedPartner[]>([]);
    const [selectedPartnerIndex, setSelectedPartnerIndex] = useState<number | null>(null);

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
        if (savedPartners.length >= 3) return;

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
        calculateWithPartner(partnerKanshi);
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
        }
    };

    const selectPartner = (index: number) => {
        setSelectedPartnerIndex(index);
        calculateWithPartner(savedPartners[index].kanshi);
    };

    const calculateWithPartner = (partnerKanshi: string) => {
        const result = calculateCompatibility(myKanshi, partnerKanshi, relationType);
        setCompatibility(result);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#A3E635';
        if (score >= 60) return '#60A5FA';
        if (score >= 40) return '#FACC15';
        return '#FB7185';
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
                    <Text className="text-sm font-bold text-gray-500 mb-2">保存済み（タップで診断）</Text>
                    <View className="flex-row gap-2">
                        {savedPartners.map((partner, index) => {
                            const type = getKanshiPopType(partner.kanshi);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => selectPartner(index)}
                                    className="flex-1 p-3"
                                    style={{
                                        backgroundColor: selectedPartnerIndex === index ? (type?.color || '#fff') : '#fff',
                                        borderWidth: 3,
                                        borderColor: '#333',
                                        borderRadius: 12,
                                    }}
                                >
                                    <View className="flex-row justify-between">
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
            {savedPartners.length < 3 && (
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

            {/* Result */}
            {compatibility && (
                <View
                    className="p-6 mb-8"
                    style={{
                        backgroundColor: getScoreColor(compatibility.score),
                        borderWidth: 4,
                        borderColor: '#333',
                        borderRadius: 24,
                        shadowColor: '#333',
                        shadowOffset: { width: 8, height: 8 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                    }}
                >
                    <Text className="text-6xl font-black text-center mb-2">{compatibility.score}</Text>
                    <Text className="text-2xl font-black text-center text-[#333] mb-4">
                        {compatibility.scoreLevel}
                    </Text>

                    <View className="flex-row items-center justify-center gap-4 mb-4">
                        <View className="items-center">
                            <Text className="text-4xl">{compatibility.myType?.icon}</Text>
                            <Text className="font-bold text-xs text-[#333]/60">あなた</Text>
                        </View>
                        <Text className="text-3xl">💕</Text>
                        <View className="items-center">
                            <Text className="text-4xl">{compatibility.partnerType?.icon || '❓'}</Text>
                            <Text className="font-bold text-xs text-[#333]/60">相手</Text>
                        </View>
                    </View>

                    <View
                        className="bg-white/50 p-4"
                        style={{ borderRadius: 12 }}
                    >
                        <Text className="font-bold text-[#333] text-center">{compatibility.advice}</Text>
                    </View>
                </View>
            )}

            {!compatibility && (
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
