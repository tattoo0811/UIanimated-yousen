import {z} from 'zod';

export const themeSchema = z.object({
  theme: z.enum(['KiraPop', 'MonoEdge', 'ZenWa']),
  tone: z.enum(['TikTok', 'YouTube', 'Instagram']),
});

export type VideoTheme = z.infer<typeof themeSchema>;

export interface ThemeConfig {
  colors: {
    background: string;
    primary: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  animations: {
    spring: {damping: number; stiffness: number};
    typingSpeed: number;
  };
}

export const themeConfig: Record<VideoTheme['theme'], ThemeConfig> = {
  KiraPop: {
    colors: {
      background: '#FFB6C1',
      primary: '#FF69B4',
      text: '#FFFFFF',
      accent: '#87CEEB',
    },
    fonts: {
      heading: 'M PLUS Rounded 1c, sans-serif',
      body: 'Noto Sans JP, sans-serif',
    },
    animations: {
      spring: {damping: 15, stiffness: 200},
      typingSpeed: 20,
    },
  },
  MonoEdge: {
    colors: {
      background: '#1A1A1A',
      primary: '#FFFFFF',
      text: '#E0E0E0',
      accent: '#00FFFF',
    },
    fonts: {
      heading: 'Noto Sans JP, sans-serif',
      body: 'Noto Sans JP, sans-serif',
    },
    animations: {
      spring: {damping: 50, stiffness: 100},
      typingSpeed: 15,
    },
  },
  ZenWa: {
    colors: {
      background: '#F5F5DC',
      primary: '#8B4513',
      text: '#2F2F2F',
      accent: '#DAA520',
    },
    fonts: {
      heading: 'Noto Serif JP, serif',
      body: 'Noto Serif JP, serif',
    },
    animations: {
      spring: {damping: 30, stiffness: 80},
      typingSpeed: 12,
    },
  },
};

export const useTheme = (themeName: VideoTheme['theme']): ThemeConfig => {
  return themeConfig[themeName];
};
