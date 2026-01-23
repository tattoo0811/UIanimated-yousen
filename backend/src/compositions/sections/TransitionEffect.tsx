import {useCurrentFrame, interpolate} from 'remotion';

interface TransitionEffectProps {
  trigger: boolean | number;
  duration?: number; // frames, default 30
  type?: 'fade' | 'slide' | 'scale'; // default 'fade'
}

export const TransitionEffect = ({
  trigger,
  duration = 30,
  type = 'fade',
}: TransitionEffectProps) => {
  const frame = useCurrentFrame();

  // Convert trigger to frame number
  const triggerFrame = typeof trigger === 'number' ? trigger : 0;

  // Calculate progress based on frame position relative to trigger
  const progress = Math.max(0, Math.min(1, (frame - triggerFrame) / duration));

  // Calculate opacity based on type
  let opacity = 1;
  let transform = '';

  if (type === 'fade') {
    // Fade in: 0 -> 1 over duration
    opacity = interpolate(progress, [0, 1], [0, 1], {extrapolateRight: 'clamp'});
  } else if (type === 'slide') {
    // Slide up + fade: 0 -> 1 over duration
    opacity = interpolate(progress, [0, 1], [0, 1], {extrapolateRight: 'clamp'});
    const translateY = interpolate(progress, [0, 1], [50, 0], {extrapolateRight: 'clamp'});
    transform = `translateY(${translateY}px)`;
  } else if (type === 'scale') {
    // Scale up + fade: 0 -> 1 over duration
    opacity = interpolate(progress, [0, 1], [0, 1], {extrapolateRight: 'clamp'});
    const scale = interpolate(progress, [0, 1], [0.8, 1], {extrapolateRight: 'clamp'});
    transform = `scale(${scale})`;
  }

  return {
    opacity,
    transform: transform || undefined,
  };
};
