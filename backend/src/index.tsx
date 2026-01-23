import {Composition} from 'remotion';
import {HookComposition} from './compositions/HookComposition';
import {CompatibilityComposition} from './compositions/CompatibilityComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HookComposition"
        component={HookComposition as any}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          nickname: 'テストユーザー',
          fortuneData: {
            result: '今日は幸運な一日でしょう！',
            rating: 5,
          },
          theme: 'KiraPop',
          tone: 'TikTok',
        }}
      />
      <Composition
        id="CompatibilityComposition"
        component={CompatibilityComposition as any}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          people: [{ name: 'あなた', birthDate: '1990-01-01', gender: 'female' }],
          compatibilityResult: {
            scores: { overall: 85, love: 90, work: 80, friendship: 85 },
            level: 'great',
            message: '素晴らしい相性！',
            advice: 'お互いを高め合える関係です。',
            comparisons: [],
          },
          theme: 'KiraPop',
          tone: 'TikTok',
        }}
      />
    </>
  );
};
