import {renderMediaOnCloudrun, getRenderProgress} from '@remotion/cloudrun/client';
import {hookCompositionSchema} from '../../compositions/HookComposition';

interface GenerateVideoParams {
  nickname: string;
  fortuneData: {
    result: string;
    rating: number;
  };
  theme: 'KiraPop' | 'MonoEdge' | 'ZenWa';
  tone: 'TikTok' | 'YouTube' | 'Instagram';
}

interface GenerateVideoResult {
  jobId: string;
  bucketName: string;
  status: 'pending';
}

interface RenderProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  renderTime?: number;
  errors?: string[];
}

export const triggerRender = async (
  params: GenerateVideoParams
): Promise<GenerateVideoResult> => {
  // Validate input props
  const validatedProps = hookCompositionSchema.parse(params);

  const {
    bucketName,
    renderId,
  } = await renderMediaOnCloudrun({
    region: process.env.GCP_REGION || 'us-central1',
    serviceName: process.env.REMOTION_SERVICE_NAME || '',
    serveUrl: process.env.REMOTION_SERVE_URL || '',
    composition: 'HookComposition',
    inputProps: validatedProps,
    codec: 'h264',
    privacy: 'public',
    inputProps: validatedProps,
  });

  return {
    jobId: renderId,
    bucketName,
    status: 'pending',
  };
};

export const checkRenderProgress = async (
  jobId: string
): Promise<RenderProgress> => {
  const progress = await getRenderProgress({
    renderId: jobId,
    bucketName: process.env.GCS_BUCKET_NAME || '',
    region: process.env.GCP_REGION || 'us-central1',
    serviceName: process.env.REMOTION_SERVICE_NAME || '',
  });

  if (progress.done) {
    return {
      status: 'completed',
      videoUrl: progress.outputFile,
      renderTime: progress.timeToFinish,
    };
  }

  if (progress.fatalErrorEncountered) {
    return {
      status: 'failed',
      errors: progress.errors,
    };
  }

  return {
    status: 'processing',
    progress: Math.round(progress.overallProgress * 100),
  };
};
