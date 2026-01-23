import {Router} from 'express';
import {triggerRender} from '../controllers/renderController';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const {nickname, fortuneData, theme, tone} = req.body;

    const result = await triggerRender({
      nickname,
      fortuneData,
      theme,
      tone,
    });

    res.json({
      jobId: result.jobId,
      status: result.status,
      bucketName: result.bucketName,
      estimatedTimeSeconds: 30,
    });
  } catch (error) {
    console.error('Render trigger failed:', error);
    res.status(500).json({
      error: 'Failed to start render',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
