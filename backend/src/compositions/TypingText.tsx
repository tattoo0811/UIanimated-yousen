import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

interface TypingTextProps {
  text: string;
  speed?: number;  // characters per second (default: 15)
  style?: React.CSSProperties;
}

export const TypingText: React.FC<TypingTextProps> = ({
  text,
  speed = 15,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Calculate how many characters should be visible
  const charsPerSecond = speed;
  const charsToShow = Math.floor((frame / fps) * charsPerSecond);

  // Slice text progressively
  const visibleText = text.slice(0, charsToShow);

  // Optional: Cursor blink effect
  const showCursor = interpolate(frame % 30, [0, 15, 30], [1, 0, 1]);

  return (
    <div style={style}>
      {visibleText}
      <span style={{opacity: showCursor, marginLeft: 2}}>▋</span>
    </div>
  );
};
