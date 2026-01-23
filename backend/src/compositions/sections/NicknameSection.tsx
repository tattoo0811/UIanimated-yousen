import React from 'react';
import {TypingText} from '../TypingText';
import {useTheme} from '../themes/themeConfig';

interface NicknameSectionProps {
  nickname: string;
  speed: number;
  theme: 'KiraPop' | 'MonoEdge' | 'ZenWa';
}

export const NicknameSection: React.FC<NicknameSectionProps> = ({
  nickname,
  speed,
  theme,
}) => {
  const themeConfig = useTheme(theme);

  return (
    <div
      style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        textAlign: 'center',
      }}
    >
      <TypingText
        text={`${nickname}さんの運勢`}
        speed={speed}
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: themeConfig.colors.primary,
        }}
      />
    </div>
  );
};
