/**
 * Compatibility Type Definitions
 * Types for multi-person compatibility calculation based on 陰陽五行 principles
 */

import type { SanmeigakuInsenChart } from './insen';

export interface PersonData {
  name: string;
  birthDate: string; // ISO 8601 format
  gender: 'male' | 'female';
  insen: SanmeigakuInsenChart;
}

export interface CompatibilityScore {
  overall: number; // 0-100
  love: number; // 0-100
  work: number; // 0-100
  friendship: number; // 0-100
}

export interface CompatibilityResult {
  scores: CompatibilityScore;
  level: 'perfect' | 'great' | 'good' | 'neutral' | 'challenging';
  message: string;
  advice: string;
  comparisons: Array<{
    person1: string;
    person2: string;
    score: number;
    strengths: string[];
    challenges: string[];
  }>;
}

export interface MultiPersonComparison {
  people: PersonData[];
  matrix: number[][]; // Compatibility matrix
  rankings: Array<{
    person: string;
    averageScore: number;
    bestMatch: string;
    bestMatchScore: number;
  }>;
}
