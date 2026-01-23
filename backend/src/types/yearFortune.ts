/**
 * Year Fortune Type Definitions
 * Type definitions for year fortune calculation system
 */

import { z } from 'zod';
import type { SanmeigakuInsenChart } from './insen';

/**
 * Five element types (五行)
 */
export type FiveElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/**
 * Yin-yang types (陰陽)
 */
export type YinYangType = 'yang' | 'yin';

/**
 * Year relationship types
 */
export type YearRelationshipType = 'productive' | 'controlling' | 'same' | 'neutral';

/**
 * Year data structure
 * Generic year information structure for fortune calculation
 */
export interface YearData {
  /** Calendar year (e.g., 2026) */
  year: number;
  /** Sexagenary cycle (干支) - e.g., "丙午" */
  kanshi: string;
  /** Heavenly stem (天干) - e.g., "丙" */
  tenStem: string;
  /** Earthly branch (地支) - e.g., "午" */
  twelveBranch: string;
  /** Five element of the year */
  element: FiveElementType;
  /** Yin or yang polarity */
  yinYang: YinYangType;
  /** Year characteristics explanation */
  description: string;
  /** Key themes for the year */
  themes: string[];
}

/**
 * Fortune breakdown
 */
export interface FortuneBreakdown {
  /** Overall fortune summary */
  overall: string;
  /** Love fortune */
  love: string;
  /** Work/career fortune */
  work: string;
  /** Health fortune */
  health: string;
  /** General advice */
  advice: string;
}

/**
 * Year fortune calculation result
 */
export interface YearFortuneResult {
  /** Year information */
  yearData: YearData;
  /** User's five element based on day stem */
  userElement: FiveElementType;
  /** User's day stem (天干) */
  userStem: string;
  /** Compatibility score (0-100) */
  compatibilityScore: number;
  /** Relationship type between user and year */
  relationship: YearRelationshipType;
  /** Detailed fortune breakdown */
  fortune: FortuneBreakdown;
  /** Key lucky points */
  highlights: string[];
}

// Zod schemas for validation

/**
 * Request schema for year fortune calculation
 */
export const yearFortuneRequestSchema = z.object({
  insen: z.any(), // SanmeigakuInsenChart - using z.any() for complex nested object
  year: z.number().optional().default(2026),
});

/**
 * Response schema for year fortune result
 */
export const yearFortuneResponseSchema: z.ZodType<YearFortuneResult> = z.object({
  yearData: z.object({
    year: z.number(),
    kanshi: z.string(),
    tenStem: z.string(),
    twelveBranch: z.string(),
    element: z.enum(['wood', 'fire', 'earth', 'metal', 'water']),
    yinYang: z.enum(['yang', 'yin']),
    description: z.string(),
    themes: z.array(z.string()),
  }),
  userElement: z.enum(['wood', 'fire', 'earth', 'metal', 'water']),
  userStem: z.string(),
  compatibilityScore: z.number().min(0).max(100),
  relationship: z.enum(['productive', 'controlling', 'same', 'neutral']),
  fortune: z.object({
    overall: z.string(),
    love: z.string(),
    work: z.string(),
    health: z.string(),
    advice: z.string(),
  }),
  highlights: z.array(z.string()),
});

export type YearFortuneRequest = z.infer<typeof yearFortuneRequestSchema>;
