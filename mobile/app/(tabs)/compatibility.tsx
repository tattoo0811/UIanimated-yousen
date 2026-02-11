import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Heart, UserPlus, Trash2, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useResponsive } from '@/hooks/useResponsive';

interface Partner {
    id: string;
    name: string;
    birthDate: string;
    kanshi?: string;
}

export default function CompatibilityTab() {
    const router = useRouter();
    const { contentPadding, fontSize } = useResponsive();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [showInput, setShowInput] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDate, setNewDate] = useState('');

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            const data = await AsyncStorage.getItem('partners');
            if (data) {
                setPartners(JSON.parse(data));
            }
        } catch (e) {
            console.log('Failed to load partners');
        }
    };

    const savePartner = async () => {
        if (!newName || !newDate) {
            Alert.alert('入力エラー', '名前と生年月日を入力してください');
            return;
        }

        const partner: Partner = {
            id: Date.now().toString(),
            name: newName,
            birthDate: newDate,
        };

        const updated = [...partners, partner];
        setPartners(updated);
        await AsyncStorage.setItem('partners', JSON.stringify(updated));
        setNewName('');
        setNewDate('');
        setShowInput(false);
    };

    const deletePartner = async (id: string) => {
        const updated = partners.filter(p => p.id !== id);
        setPartners(updated);
        await AsyncStorage.setItem('partners', JSON.stringify(updated));
    };

    return (
        <View className="flex-1 bg-[#FFF9E6]">
            {/* Header with Settings */}
            <View
                className="px-4 pt-14 pb-4"
                style={{
                    backgroundColor: '#FB7185',
                    borderBottomWidth: 3,
                    borderBottomColor: '#333',
                    alignItems: 'center',
                }}
            >
                <View style={{ width: '100%', maxWidth: 800 }}>
                    {/* Settings Icon */}
                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
                        className="absolute top-14 right-4 w-10 h-10 items-center justify-center"
                        style={{
                            backgroundColor: '#fff',
                            borderWidth: 2,
                            borderColor: '#333',
                            borderRadius: 999,
                            zIndex: 10,
                        }}
                    >
                        <Settings size={20} color="#333" />
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-center gap-3">
                        <Text style={{ fontSize: fontSize.xxl }}>💕</Text>
                        <View>
                            <Text className="font-black text-white" style={{ fontSize: fontSize.xl }}>相性診断</Text>
                            <Text className="font-bold text-white/80" style={{ fontSize: fontSize.sm }}>
                                パートナーとの相性
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: contentPadding, paddingBottom: 32, alignItems: 'center' }}
            >
                <View style={{ width: '100%', maxWidth: 800 }}>
                    {/* Partner List */}
                    {partners.length === 0 ? (
                        <View
                            className="p-8 items-center"
                            style={{
                                backgroundColor: '#fff',
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 20,
                                borderStyle: 'dashed',
                            }}
                        >
                            <Text className="mb-4" style={{ fontSize: fontSize.xl }}>👥</Text>
                            <Text className="font-bold text-gray-600 text-center" style={{ fontSize: fontSize.sm }}>
                                パートナーを追加して{'\n'}相性を診断しましょう
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3 mb-4">
                            {partners.map(partner => (
                                <View
                                    key={partner.id}
                                    className="flex-row items-center p-4"
                                    style={{
                                        backgroundColor: '#fff',
                                        borderWidth: 3,
                                        borderColor: '#333',
                                        borderRadius: 16,
                                    }}
                                >
                                    <View className="flex-1">
                                        <Text className="font-black text-[#333]" style={{ fontSize: fontSize.md }}>{partner.name}</Text>
                                        <Text className="text-gray-600" style={{ fontSize: fontSize.sm }}>{partner.birthDate}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => deletePartner(partner.id)}
                                        className="p-2"
                                    >
                                        <Trash2 size={20} color="#FB7185" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Add Partner Button/Form */}
                    {!showInput ? (
                        <TouchableOpacity
                            onPress={() => setShowInput(true)}
                            className="flex-row items-center justify-center gap-2 p-4 mt-4"
                            style={{
                                backgroundColor: '#FB7185',
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 16,
                                shadowColor: '#333',
                                shadowOffset: { width: 4, height: 4 },
                                shadowOpacity: 1,
                                shadowRadius: 0,
                            }}
                        >
                            <UserPlus size={24} color="#fff" />
                            <Text className="text-white font-bold" style={{ fontSize: fontSize.md }}>パートナーを追加</Text>
                        </TouchableOpacity>
                    ) : (
                        <View
                            className="p-5 mt-4"
                            style={{
                                backgroundColor: '#fff',
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 20,
                            }}
                        >
                            <Text className="font-black text-[#333] mb-4" style={{ fontSize: fontSize.md }}>新しいパートナー</Text>

                            <Text className="font-bold text-gray-600 mb-2" style={{ fontSize: fontSize.sm }}>名前</Text>
                            <TextInput
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="例：田中太郎"
                                className="bg-gray-100 p-4 mb-4 rounded-xl text-[#333]"
                                style={{ borderWidth: 2, borderColor: '#333' }}
                            />

                            <Text className="font-bold text-gray-600 mb-2" style={{ fontSize: fontSize.sm }}>生年月日</Text>
                            <TextInput
                                value={newDate}
                                onChangeText={setNewDate}
                                placeholder="例：1990-05-15"
                                className="bg-gray-100 p-4 mb-4 rounded-xl text-[#333]"
                                style={{ borderWidth: 2, borderColor: '#333' }}
                            />

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setShowInput(false)}
                                    className="flex-1 p-3 items-center bg-gray-200"
                                    style={{ borderWidth: 2, borderColor: '#333', borderRadius: 12 }}
                                >
                                    <Text className="font-bold text-[#333]" style={{ fontSize: fontSize.sm }}>キャンセル</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={savePartner}
                                    className="flex-1 p-3 items-center bg-[#60A5FA]"
                                    style={{ borderWidth: 2, borderColor: '#333', borderRadius: 12 }}
                                >
                                    <Text className="font-bold text-white" style={{ fontSize: fontSize.sm }}>保存</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
