import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, User, Calendar, Heart, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

type Gender = 'male' | 'female' | 'other';
type MaritalStatus = 'single' | 'married' | 'divorced';

export default function ProfileScreen() {
    const router = useRouter();
    const currentYear = new Date().getFullYear();

    const [nickname, setNickname] = useState('');
    const [year, setYear] = useState(1995);
    const [month, setMonth] = useState(6);
    const [day, setDay] = useState(15);
    const [gender, setGender] = useState<Gender>('male');
    const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single');
    const [editingField, setEditingField] = useState<'year' | 'month' | 'day' | null>(null);

    const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => 1920 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const handleNext = () => {
        if (!nickname.trim()) return;

        const birthDate = new Date(year, month - 1, day);
        router.push({
            pathname: '/loading',
            params: {
                birthDate: birthDate.toISOString(),
                gender,
                nickname,
                maritalStatus,
            },
        });
    };

    const PopButton = ({
        selected,
        onPress,
        children
    }: {
        selected: boolean;
        onPress: () => void;
        children: React.ReactNode;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 py-3 ${selected ? 'bg-[#A3E635]' : 'bg-white'}`}
            style={{
                borderWidth: 3,
                borderColor: '#333',
                borderRadius: 12,
                shadowColor: '#333',
                shadowOffset: { width: selected ? 0 : 3, height: selected ? 0 : 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
                transform: [{ translateX: selected ? 2 : 0 }, { translateY: selected ? 2 : 0 }],
            }}
        >
            <Text className={`text-center font-bold ${selected ? 'text-[#333]' : 'text-gray-600'}`}>
                {children}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#FFF9E6]">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center px-4 pt-16 pb-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white p-2"
                    style={{
                        borderWidth: 3,
                        borderColor: '#333',
                        borderRadius: 12,
                    }}
                >
                    <ArrowLeft color="#333" size={24} />
                </TouchableOpacity>
                <Text className="text-2xl font-black text-[#333] ml-4">プロフィール</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                {/* Main Card */}
                <View
                    className="bg-white p-6 mb-4"
                    style={{
                        borderWidth: 4,
                        borderColor: '#333',
                        borderRadius: 24,
                        shadowColor: '#333',
                        shadowOffset: { width: 6, height: 6 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                    }}
                >
                    {/* Nickname */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-2">
                            <User size={20} color="#333" />
                            <Text className="text-lg font-bold text-[#333] ml-2">ニックネーム</Text>
                        </View>
                        <TextInput
                            value={nickname}
                            onChangeText={setNickname}
                            placeholder="例: たろう"
                            placeholderTextColor="#999"
                            className="bg-[#FFF9E6] text-[#333] px-4 py-4 text-lg font-bold"
                            style={{
                                borderWidth: 3,
                                borderColor: '#333',
                                borderRadius: 12,
                            }}
                            maxLength={20}
                        />
                    </View>

                    {/* Birthdate */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-2">
                            <Calendar size={20} color="#333" />
                            <Text className="text-lg font-bold text-[#333] ml-2">生年月日</Text>
                        </View>

                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setEditingField(editingField === 'year' ? null : 'year')}
                                className={`flex-1 py-3 ${editingField === 'year' ? 'bg-[#60A5FA]' : 'bg-[#FFF9E6]'}`}
                                style={{
                                    borderWidth: 3,
                                    borderColor: '#333',
                                    borderRadius: 12,
                                }}
                            >
                                <Text className="text-center font-bold text-[#333]">{year}年</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setEditingField(editingField === 'month' ? null : 'month')}
                                className={`flex-1 py-3 ${editingField === 'month' ? 'bg-[#60A5FA]' : 'bg-[#FFF9E6]'}`}
                                style={{
                                    borderWidth: 3,
                                    borderColor: '#333',
                                    borderRadius: 12,
                                }}
                            >
                                <Text className="text-center font-bold text-[#333]">{month}月</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setEditingField(editingField === 'day' ? null : 'day')}
                                className={`flex-1 py-3 ${editingField === 'day' ? 'bg-[#60A5FA]' : 'bg-[#FFF9E6]'}`}
                                style={{
                                    borderWidth: 3,
                                    borderColor: '#333',
                                    borderRadius: 12,
                                }}
                            >
                                <Text className="text-center font-bold text-[#333]">{day}日</Text>
                            </TouchableOpacity>
                        </View>

                        {editingField && (
                            <View
                                className="mt-2 bg-white overflow-hidden"
                                style={{
                                    borderWidth: 3,
                                    borderColor: '#333',
                                    borderRadius: 12,
                                }}
                            >
                                <Picker
                                    selectedValue={editingField === 'year' ? year : editingField === 'month' ? month : day}
                                    onValueChange={(value) => {
                                        if (editingField === 'year') setYear(value);
                                        else if (editingField === 'month') setMonth(value);
                                        else setDay(value);
                                    }}
                                    style={{ height: 150 }}
                                    itemStyle={{ fontSize: 18, fontWeight: 'bold' }}
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

                    {/* Gender */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#333] mb-2">性別</Text>
                        <View className="flex-row gap-2">
                            <PopButton selected={gender === 'male'} onPress={() => setGender('male')}>
                                男性
                            </PopButton>
                            <PopButton selected={gender === 'female'} onPress={() => setGender('female')}>
                                女性
                            </PopButton>
                            <PopButton selected={gender === 'other'} onPress={() => setGender('other')}>
                                回答しない
                            </PopButton>
                        </View>
                    </View>

                    {/* Marital Status */}
                    <View className="mb-2">
                        <View className="flex-row items-center mb-2">
                            <Heart size={20} color="#333" />
                            <Text className="text-lg font-bold text-[#333] ml-2">ライフスタイル</Text>
                        </View>
                        <View className="flex-row gap-2">
                            <PopButton selected={maritalStatus === 'single'} onPress={() => setMaritalStatus('single')}>
                                未婚
                            </PopButton>
                            <PopButton selected={maritalStatus === 'married'} onPress={() => setMaritalStatus('married')}>
                                既婚
                            </PopButton>
                            <PopButton selected={maritalStatus === 'divorced'} onPress={() => setMaritalStatus('divorced')}>
                                バツ有り
                            </PopButton>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Next Button */}
            <View className="px-4 pb-8">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!nickname.trim()}
                    className={`p-5 ${nickname.trim() ? 'bg-[#FF7E5F]' : 'bg-gray-300'}`}
                    style={{
                        borderWidth: 4,
                        borderColor: '#333',
                        borderRadius: 16,
                        shadowColor: '#333',
                        shadowOffset: { width: nickname.trim() ? 6 : 0, height: nickname.trim() ? 6 : 0 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                    }}
                >
                    <View className="flex-row items-center justify-center gap-2">
                        <Text className={`text-2xl font-black ${nickname.trim() ? 'text-white' : 'text-gray-500'}`}>
                            診断する！
                        </Text>
                        <ChevronRight size={28} color={nickname.trim() ? '#fff' : '#888'} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
