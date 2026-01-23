/**
 * Year Fortune API Routes
 * Endpoints for year fortune calculation
 */

import { Router } from 'express';
import { calculateYearFortune, getAvailableYears } from '../../lib/yearFortuneCalculator';
import { yearFortuneRequestSchema } from '../../types/yearFortune';
import type { YearFortuneResult } from '../../types/yearFortune';
import type { SanmeigakuInsenChart } from '../../types/insen';

const router = Router();

interface CalculateRequest {
  insen: SanmeigakuInsenChart;
  year?: number;
}

// POST /api/year-fortune/calculate
router.post('/calculate', async (req, res) => {
  try {
    // Validate request
    const validationResult = yearFortuneRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const { insen, year = 2026 }: CalculateRequest = validationResult.data;

    // Validate insen data
    if (!insen || !insen.meta || !insen.meta.dayStem) {
      return res.status(400).json({
        error: 'Invalid insen data: missing required fields',
      });
    }

    // Calculate year fortune
    const result: YearFortuneResult = calculateYearFortune(insen, year);

    return res.json(result);

  } catch (error) {
    console.error('Year fortune calculation error:', error);

    // Handle year not found error
    if (error instanceof Error && error.message.includes('Year data not found')) {
      return res.status(400).json({
        error: 'Year not supported',
        message: error.message,
        availableYears: getAvailableYears(),
      });
    }

    res.status(500).json({
      error: 'Failed to calculate year fortune',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/year-fortune/years
router.get('/years', async (_req, res) => {
  try {
    const years = getAvailableYears();
    return res.json({ years });
  } catch (error) {
    console.error('Get available years error:', error);
    res.status(500).json({
      error: 'Failed to get available years',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
