import React from 'react';
import {TypingText} from '../TypingText';
import {TransitionEffect} from './TransitionEffect';
import {useTheme, type VideoTheme} from '../themes/themeConfig';

interface SectionProps {
  title: string;
  content: string;
  speed: number;
  theme: VideoTheme['theme'];
  triggerFrame?: number; // When transition starts
}

export const EssenceSection: React.FC<SectionProps> = ({
  title,
  content,
  speed,
  theme,
  triggerFrame = 0,
}) => {
  const themeConfig = useTheme(theme);
  const transition = TransitionEffect({trigger: triggerFrame, duration: 15, type: 'fade'});

  return (
    <div
      style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        opacity: transition.opacity,
      }}
    >
      {title && (
        <div style={{fontSize: 32, fontWeight: 'bold', color: themeConfig.colors.primary, marginBottom: 20}}>
          {title}
        </div>
      )}
      <TypingText
        text={content}
        speed={speed}
        style={{fontSize: 38, color: themeConfig.colors.text, lineHeight: 1.6}}
      />
    </div>
  );
};

export const FamilySection: React.FC<SectionProps> = ({
  title,
  content,
  speed,
  theme,
  triggerFrame = 0,
}) => {
  const themeConfig = useTheme(theme);
  const transition = TransitionEffect({trigger: triggerFrame, duration: 15, type: 'fade'});

  return (
    <div
      style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        opacity: transition.opacity,
      }}
    >
      {title && (
        <div style={{fontSize: 32, fontWeight: 'bold', color: themeConfig.colors.primary, marginBottom: 20}}>
          {title}
        </div>
      )}
      <TypingText
        text={content}
        speed={speed}
        style={{fontSize: 36, color: themeConfig.colors.text, lineHeight: 1.6}}
      />
    </div>
  );
};

export const WorkSection: React.FC<SectionProps> = ({
  title,
  content,
  speed,
  theme,
  triggerFrame = 0,
}) => {
  const themeConfig = useTheme(theme);
  const transition = TransitionEffect({trigger: triggerFrame, duration: 15, type: 'fade'});

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        opacity: transition.opacity,
      }}
    >
      {title && (
        <div style={{fontSize: 32, fontWeight: 'bold', color: themeConfig.colors.primary, marginBottom: 20}}>
          {title}
        </div>
      )}
      <TypingText
        text={content}
        speed={speed}
        style={{fontSize: 36, color: themeConfig.colors.text, lineHeight: 1.6}}
      />
    </div>
  );
};

export const LoveSection: React.FC<SectionProps> = ({
  title,
  content,
  speed,
  theme,
  triggerFrame = 0,
}) => {
  const themeConfig = useTheme(theme);
  const transition = TransitionEffect({trigger: triggerFrame, duration: 15, type: 'fade'});

  return (
    <div
      style={{
        position: 'absolute',
        top: '55%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        opacity: transition.opacity,
      }}
    >
      {title && (
        <div style={{fontSize: 32, fontWeight: 'bold', color: themeConfig.colors.primary, marginBottom: 20}}>
          {title}
        </div>
      )}
      <TypingText
        text={content}
        speed={speed}
        style={{fontSize: 36, color: themeConfig.colors.text, lineHeight: 1.6}}
      />
    </div>
  );
};

export const OchiSection: React.FC<SectionProps> = ({
  title,
  content,
  speed,
  theme,
  triggerFrame = 0,
}) => {
  const themeConfig = useTheme(theme);
  const transition = TransitionEffect({trigger: triggerFrame, duration: 15, type: 'fade'});

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        opacity: transition.opacity,
      }}
    >
      {/* Ochi section has no title */}
      <TypingText
        text={content}
        speed={speed}
        style={{fontSize: 48, color: themeConfig.colors.accent, lineHeight: 1.6, fontWeight: 'bold'}}
      />
    </div>
  );
};
