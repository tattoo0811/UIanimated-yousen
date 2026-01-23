import {deployService, deploySite, getOrCreateBucket} from '@remotion/cloudrun';
import {bundle} from '@remotion/bundler';
import path from 'path';

interface DeploymentConfig {
  region: string;
  projectName: string;
  memoryLimit?: string;
  cpuLimit?: string;
  timeoutSeconds?: number;
}

interface DeploymentResult {
  serviceName: string;
  serveUrl: string;
  bucketName: string;
}

export const deployCloudRunService = async (
  config: DeploymentConfig
): Promise<DeploymentResult> => {
  const {
    region = 'us-central1',
    projectName,
    memoryLimit = '2048Mi',  // 2GiB recommended minimum
    cpuLimit = '2',            // 2 vCPU
    timeoutSeconds = 300,      // 5 minutes
  } = config;

  // Step 1: Create or get existing GCS bucket
  const {bucketName} = await getOrCreateBucket({
    region: region as any,
  });

  // Step 2: Bundle Remotion site
  await bundle(
    path.resolve('./src/index.tsx'),
    undefined,
    {
      webpackOverride: (config: any) => ({
        ...config,
        externals: [...(config.externals || []), 'sharp'],
      }),
    }
  );

  // Step 3: Deploy Cloud Run service
  const {fullName, uri} = await deployService({
    region: region as any,
    projectID: projectName,
    memoryLimit,
    cpuLimit,
    timeoutSeconds,
  });

  // Step 4: Deploy Remotion site bundle
  const {serveUrl} = await deploySite({
    entryPoint: path.resolve('./src/index.tsx'),
    bucketName,
    siteName: `${projectName}-site`,
  });

  console.log(`Cloud Run service deployed: ${fullName}`);
  console.log(`Service URI: ${uri}`);
  console.log(`Site deployed: ${serveUrl}`);
  console.log(`Bucket: ${bucketName}`);

  return {
    serviceName: fullName || '',
    serveUrl,
    bucketName,
  };
};
