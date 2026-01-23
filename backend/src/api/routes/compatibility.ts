/**
 * Compatibility API Routes
 * Endpoints for multi-person compatibility calculation
 */

import { Router } from 'express';
import { calculateCompatibility, compareMultiplePeople } from '../../lib/compatibilityCalculator';
import { triggerRender } from '../controllers/renderController';
import type { PersonData, CompatibilityResult, MultiPersonComparison } from '../../types/compatibility';

const router = Router();

interface CalculateRequest {
  people: Array<{
    name: string;
    birthDate: string;
    gender: 'male' | 'female';
  }>;
}

// POST /api/compatibility/calculate
router.post('/calculate', async (req, res) => {
  try {
    const { people }: CalculateRequest = req.body;

    // Validate input
    if (!people || people.length < 2) {
      return res.status(400).json({
        error: 'At least 2 people required for compatibility calculation',
      });
    }

    if (people.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 people allowed',
      });
    }

    // Calculate insen for each person
    // TODO: Integrate actual bazi/insen calculation from mobile
    // For now, using placeholder insen data based on birthDate
    const peopleWithInsen: PersonData[] = people.map((person) => {
      const birthDate = new Date(person.birthDate);

      // Simple placeholder logic to determine day stem from birth year
      // In production, this should use actual bazi calculation
      const year = birthDate.getFullYear();
      const stemIndex = ((year - 4) % 10); // Approximate stem from year
      const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const branchIndex = ((year - 4) % 12);

      const dayStem = stems[stemIndex];

      // Placeholder insen data
      const insen = {
        meta: {
          dayStem,
          calendar: 'solar' as const,
        },
        pillars: {
          year: { stem: stems[stemIndex], branch: branches[branchIndex] },
          month: { stem: stems[stemIndex], branch: branches[branchIndex] },
          day: { stem: dayStem, branch: branches[branchIndex] },
        },
        hiddenStems: [],
        tsuhensei: [],
        junishiUn: [],
        fiveElements: {
          distribution: { wood: 2, fire: 2, earth: 2, metal: 2, water: 2 },
          dayStemStrength: 'balanced' as const,
        },
        phaseRelations: [],
        tenchusatsu: {
          type: 'None',
          missingBranches: [],
        },
      };

      return {
        ...person,
        insen,
      };
    });

    // For 2 people, return detailed compatibility
    if (peopleWithInsen.length === 2) {
      const result: CompatibilityResult = calculateCompatibility(
        peopleWithInsen[0],
        peopleWithInsen[1]
      );
      return res.json(result);
    }

    // For 3+ people, return multi-person comparison
    const result: MultiPersonComparison = compareMultiplePeople(peopleWithInsen);
    return res.json(result);

  } catch (error) {
    console.error('Compatibility calculation error:', error);
    res.status(500).json({
      error: 'Failed to calculate compatibility',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/compatibility/video
router.post('/video', async (req, res) => {
  try {
    const { people, compatibilityResult, theme, tone } = req.body;

    // Validate input
    if (!people || !compatibilityResult) {
      return res.status(400).json({
        error: 'people and compatibilityResult are required',
      });
    }

    const renderResult = await triggerRender({
      composition: 'CompatibilityComposition',
      inputProps: {
        people,
        compatibilityResult,
        theme: theme || 'KiraPop',
        tone: tone || 'TikTok',
      },
    });

    res.json({
      jobId: renderResult.jobId,
      status: renderResult.status,
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({
      error: 'Failed to generate video',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
