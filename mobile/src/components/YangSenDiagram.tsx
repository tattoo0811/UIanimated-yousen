// 陽占人体図 - GOGYO POP! ネオブルータリズムデザイン
import { View, Text } from 'react-native';
import type { YangSen } from '@/src/types';

interface Props {
  yangSen: YangSen;
}

export default function YangSenDiagram({ yangSen }: Props) {
  // 十大主星カード（ポップなデザイン）
  const TenStarCard = ({ star, label, bgColor }: { star: string; label: string; bgColor: string }) => (
    <View
      className="flex-1 items-center justify-center p-3"
      style={{
        backgroundColor: bgColor,
        borderWidth: 3,
        borderColor: '#333',
        borderRadius: 12,
        minHeight: 70,
        shadowColor: '#333',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
      }}
    >
      <Text className="text-[#333]/60 font-bold mb-1" style={{ fontSize: 10 }}>{label}</Text>
      <Text className="text-[#333] font-black text-center" style={{ fontSize: 13 }}>{star}</Text>
    </View>
  );

  // 十二大従星カード（ポップなデザイン）
  const TwelveStarCard = ({ name, score, label }: { name: string; score: number; label: string }) => (
    <View
      className="flex-1 items-center justify-center p-2"
      style={{
        backgroundColor: '#FFF9E6',
        borderWidth: 3,
        borderColor: '#333',
        borderRadius: 12,
        minHeight: 70,
      }}
    >
      <Text className="text-[#333]/60 font-bold" style={{ fontSize: 9 }}>{label}</Text>
      <Text className="text-[#333] font-black text-center my-1" style={{ fontSize: 11 }}>{name}</Text>
      <View className="bg-[#333] px-2 py-0.5 rounded-full">
        <Text className="text-white font-bold" style={{ fontSize: 9 }}>{score}点</Text>
      </View>
    </View>
  );

  // 空のセル
  const EmptyCell = () => <View className="flex-1" style={{ minHeight: 70 }} />;

  return (
    <View
      className="p-4"
      style={{
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#333',
        borderRadius: 20,
        shadowColor: '#333',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
      }}
    >
      <Text className="text-[#333] font-black mb-1 text-center" style={{ fontSize: 16 }}>陽占（人体図）</Text>
      <Text className="text-[#333]/50 font-bold mb-4 text-center" style={{ fontSize: 10 }}>
        ※自分から見た配置
      </Text>

      {/* 9マスグリッド */}
      <View style={{ gap: 6 }}>
        {/* Row 1: 空 | 頭 | 左肩 */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <EmptyCell />
          <TenStarCard star={yangSen.head} label="頭" bgColor="#A3E635" />
          <TwelveStarCard
            name={yangSen.leftShoulder.name}
            score={yangSen.leftShoulder.score}
            label="左肩"
          />
        </View>

        {/* Row 2: 右手 | 胸 | 左手 */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TenStarCard star={yangSen.rightHand} label="右手" bgColor="#60A5FA" />
          <TenStarCard star={yangSen.chest} label="胸" bgColor="#FB7185" />
          <TenStarCard star={yangSen.leftHand} label="左手" bgColor="#FACC15" />
        </View>

        {/* Row 3: 右足 | 腹 | 左足 */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TwelveStarCard
            name={yangSen.rightLeg.name}
            score={yangSen.rightLeg.score}
            label="右足"
          />
          <TenStarCard star={yangSen.belly} label="腹" bgColor="#10B981" />
          <TwelveStarCard
            name={yangSen.leftLeg.name}
            score={yangSen.leftLeg.score}
            label="左足"
          />
        </View>
      </View>

      {/* 説明 */}
      <View
        className="mt-4 p-3"
        style={{
          backgroundColor: '#FFF9E6',
          borderWidth: 2,
          borderColor: '#333',
          borderRadius: 12,
        }}
      >
        <Text className="text-[#333]/70 font-medium text-center" style={{ fontSize: 10, lineHeight: 14 }}>
          人体図は自分を見下ろした視点です{'\n'}
          十大主星がメイン、十二大従星はエネルギー値
        </Text>
      </View>
    </View>
  );
}
