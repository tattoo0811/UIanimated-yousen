import {Composition, registerRoot} from 'remotion';
import {HookComposition} from './compositions/HookComposition';
import {CompatibilityComposition} from './compositions/CompatibilityComposition';
import {YearFortuneComposition} from './compositions/YearFortuneComposition';
import type {YearFortuneResult} from './types/yearFortune';

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
      <Composition
        id="YearFortune"
        component={YearFortuneComposition as any}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          nickname: 'テストユーザー',
          yearFortune: {
            yearData: {
              year: 2026,
              kanshi: '丙午',
              tenStem: '丙',
              twelveBranch: '午',
              element: 'fire',
              yinYang: 'yang',
              description: '丙午は火の気が最も強い年です。情熱とエネルギーに満ちた一年となるでしょう。',
              themes: ['情熱', '変革', '活動的'],
            },
            userElement: 'fire',
            userStem: '丙',
            compatibilityScore: 95,
            relationship: 'same',
            fortune: {
              overall: '大吉！火の気が強まり、運気上昇的一年です。',
              love: '恋愛運も上昇。積極的に行動することで良い出会いがありそうです。',
              work: '仕事ではリーダーシップを発揮する好機です。',
              health: '活力に満ちていますが、無理は禁物です。',
              advice: 'この年のエネルギーを活かして、新しいことに挑戦してみましょう！',
            },
            highlights: [
              '火の気が最も強い年で、エネルギー満点',
              '情熱的な行動が実を結ぶ',
              'リーダーシップを発揮できるチャンス',
            ],
          } as YearFortuneResult,
          theme: 'HeinoE2026',
          tone: 'TikTok',
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
