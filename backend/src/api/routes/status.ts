import {Router} from 'express';
import {checkRenderProgress} from '../controllers/renderController';

const router = Router();

router.get('/status/:jobId', async (req, res) => {
  try {
    const {jobId} = req.params;

    const progress = await checkRenderProgress(jobId);

    if (progress.status === 'completed') {
      return res.json({
        status: 'completed',
        videoUrl: progress.videoUrl,
        renderTime: progress.renderTime,
      });
    }

    if (progress.status === 'failed') {
      return res.status(500).json({
        status: 'failed',
        errors: progress.errors,
      });
    }

    res.json({
      status: 'processing',
      progress: progress.progress,
    });
  } catch (error) {
    console.error('Progress check failed:', error);
    res.status(500).json({
      error: 'Failed to check progress',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
