import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Sparkles, Zap, Heart, MessageCircle, Star } from 'lucide-react-native';

function TabBarIcon({ icon: Icon, focused }: { icon: any; focused: boolean; color: string }) {
    return (
        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
            <Icon size={24} color={focused ? '#333' : '#999'} />
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFF9E6',
                    borderTopWidth: 3,
                    borderTopColor: '#333',
                    height: 80,
                    paddingTop: 8,
                    paddingBottom: 24,
                },
                tabBarActiveTintColor: '#333',
                tabBarInactiveTintColor: '#999',
                tabBarLabelStyle: {
                    fontWeight: 'bold',
                    fontSize: 11,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: '鑑定',
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon icon={Sparkles} focused={focused} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="result"
                options={{
                    title: '結果',
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon icon={Zap} focused={focused} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="compatibility"
                options={{
                    title: '相性',
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon icon={Heart} focused={focused} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="fortune"
                options={{
                    title: '占い',
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon icon={MessageCircle} focused={focused} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="yosen"
                options={{
                    title: '陽占',
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon icon={Star} focused={focused} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerActive: {
        backgroundColor: '#A3E635',
        borderWidth: 2,
        borderColor: '#333',
    },
});
