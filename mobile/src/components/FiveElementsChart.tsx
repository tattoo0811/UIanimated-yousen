// 五行バランスチャート
import { View, Text } from 'react-native';
import type { FiveElements } from '@/src/types';

interface Props {
  elements: FiveElements;
}

export default function FiveElementsChart({ elements }: Props) {
  const elementData = [
    { name: '木', value: elements.wood, color: '#10b981', emoji: '🌳' },
    { name: '火', value: elements.fire, color: '#ef4444', emoji: '🔥' },
    { name: '土', value: elements.earth, color: '#f59e0b', emoji: '🏔️' },
    { name: '金', value: elements.metal, color: '#e5e7eb', emoji: '⚙️' },
    { name: '水', value: elements.water, color: '#3b82f6', emoji: '💧' }
  ];

  // 最大値を計算（正規化用）
  const maxValue = Math.max(elements.wood, elements.fire, elements.earth, elements.metal, elements.water);
  const minHeight = 40; // 最小の高さ（ピクセル）
  const maxHeight = 160; // 最大の高さ（ピクセル）

  return (
    <View className="bg-surface-dark rounded-2xl p-6">
      <Text className="text-white text-xl font-bold mb-6">五行バランス</Text>

      {/* Bar Chart */}
      <View className="flex-row items-end justify-between h-48 mb-4">
        {elementData.map((element) => {
          const heightRatio = maxValue > 0 ? element.value / maxValue : 0;
          const barHeight = minHeight + (maxHeight - minHeight) * heightRatio;

          return (
            <View key={element.name} className="flex-1 items-center mx-1">
              {/* Value */}
              <Text className="text-white/80 text-sm font-bold mb-2">
                {element.value}
              </Text>

              {/* Bar */}
              <View
                style={{
                  height: barHeight,
                  backgroundColor: element.color,
                  opacity: 0.8
                }}
                className="w-full rounded-t-lg shadow-lg"
              />

              {/* Label */}
              <View className="mt-3 items-center">
                <Text className="text-2xl mb-1">{element.emoji}</Text>
                <Text className="text-white/70 text-xs font-medium">
                  {element.name}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View className="bg-white/5 rounded-xl p-4 mt-4">
        <Text className="text-white/50 text-xs leading-relaxed">
          五行は木・火・土・金・水の5つの要素で構成されます。{'\n'}
          それぞれのバランスがあなたの性格や運勢を表します。
        </Text>
      </View>
    </View>
  );
}
