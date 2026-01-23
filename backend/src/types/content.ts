import type {SanmeigakuInsenChart} from '../../../mobile/src/types';

export interface ContentSection {
  title: string;
  content: string;
  duration: number; // frames
}

export interface VideoContent {
  essence: ContentSection;    // 本質
  family: ContentSection;     // 家族
  work: ContentSection;       // 仕事
  love: ContentSection;       // 恋愛
  ochi: ContentSection;       // オチ
}

export interface ContentGeneratorParams {
  insen: SanmeigakuInsenChart;
  nickname: string;
  tone: 'TikTok' | 'YouTube' | 'Instagram';
}
