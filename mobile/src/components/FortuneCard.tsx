import { View, Text, ScrollView } from 'react-native';
import { ReactNode } from 'react';
import { useResponsive } from '@/src/hooks/useResponsive';

type CardProps = {
    title: string;
    icon: string;
    color: string;
    children: ReactNode;
};

export function FortuneCard({ title, icon, color, children }: CardProps) {
    const { contentPadding, fontSize } = useResponsive();
    return (
        <View className="flex-1 bg-[#FFF9E6]">
            <View style={{ backgroundColor: color, paddingTop: 60, paddingBottom: 20, paddingHorizontal: contentPadding, borderBottomWidth: 3, borderBottomColor: '#333', alignItems: 'center' }}>
                <Text style={{ fontSize: fontSize.xxl }}>{icon}</Text>
                <Text className="font-black text-[#333] mt-2" style={{ fontSize: fontSize.xl }}>{title}</Text>
            </View>
            <ScrollView className="flex-1" contentContainerStyle={{ padding: contentPadding, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                {children}
            </ScrollView>
        </View>
    );
}

export function CardSection({ title, children, color = '#fff' }: { title: string; children: ReactNode; color?: string }) {
    const { fontSize } = useResponsive();
    return (
        <View className="p-5 mb-4" style={{ backgroundColor: color, borderWidth: 3, borderColor: '#333', borderRadius: 20, shadowColor: '#333', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }}>
            <Text className="font-black text-[#333] mb-3" style={{ fontSize: fontSize.md }}>{title}</Text>
            {children}
        </View>
    );
}
