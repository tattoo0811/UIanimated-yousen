import {renderMediaOnCloudrun} from '@remotion/cloudrun';
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
  message?: string;
}

export const triggerRender = async (
  params: GenerateVideoParams
): Promise<GenerateVideoResult> => {
  // Validate input props
  const validatedProps = hookCompositionSchema.parse(params);

  const result = await renderMediaOnCloudrun({
    region: (process.env.GCP_REGION as any) || 'us-central1',
    serviceName: process.env.REMOTION_SERVICE_NAME,
    serveUrl: process.env.REMOTION_SERVE_URL || '',
    composition: 'HookComposition',
    inputProps: validatedProps,
    codec: 'h264',
    privacy: 'public',
    forceBucketName: process.env.GCS_BUCKET_NAME,
  });

  if (result.type === 'success') {
    return {
      jobId: result.renderId,
      bucketName: result.bucketName,
      status: 'pending',
    };
  }

  // Crash response
  throw new Error('Cloud Run service crashed during render');
};

export const checkRenderProgress = async (
  jobId: string
): Promise<RenderProgress> => {
  // Cloud Run renders are synchronous, so by the time we have a jobId,
  // the render is already complete
  // This endpoint is kept for API compatibility but returns not-implemented
  return {
    status: 'not-implemented' as any,
    message: 'Cloud Run renders synchronously. Video is available immediately after triggerRender completes.',
  };
};
