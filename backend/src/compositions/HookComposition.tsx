import {z} from 'zod';
import {zColor} from '@remotion/zod-types';

export const hookCompositionSchema = z.object({
  nickname: z.string().max(20),
  fortuneData: z.object({
    result: z.string().max(200),
    rating: z.number().min(1).max(5),
  }),
  theme: z.enum(['KiraPop', 'MonoEdge', 'ZenWa']),
  tone: z.enum(['TikTok', 'YouTube', 'Instagram']),
});

export const HookComposition: React.FC<z.infer<typeof hookCompositionSchema>> = ({
  nickname,
  fortuneData,
  theme,
}) => {
  return (
    <div style={{
      backgroundColor: '#000',
      color: '#fff',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 48,
    }}>
      {nickname}さんの{theme}テーマ動画
    </div>
  );
};
