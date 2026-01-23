import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useTheme, type VideoTheme} from './themes/themeConfig';

interface VideoTemplateProps {
  theme: VideoTheme['theme'];
  children: React.ReactNode;
}

export const VideoTemplate: React.FC<VideoTemplateProps> = ({
  theme,
  children,
}) => {
  const themeConfig = useTheme(theme);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: themeConfig.colors.background,
        color: themeConfig.colors.text,
        fontFamily: themeConfig.fonts.body,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
