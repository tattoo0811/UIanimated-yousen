import {Composition} from 'remotion';
import {HookComposition} from './compositions/HookComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HookComposition"
        component={HookComposition}
        durationInFrames={900}  // 30 seconds @ 30fps
        fps={30}
        width={1080}   // 9:16 vertical
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
    </>
  );
};
