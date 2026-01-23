import {deployService, deploySite, getOrCreateBucket} from '@remotion/cloudrun';
import {bundle} from '@remotion/bundler';
import path from 'path';

interface DeploymentConfig {
  region: string;
  projectName: string;
  memorySizeInMb?: number;
  cpuCount?: number;
  timeoutInSeconds?: number;
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
    memorySizeInMb = 2048,  // 2GiB recommended minimum
    cpuCount = 2,            // 2 vCPU
    timeoutInSeconds = 300,  // 5 minutes
  } = config;

  // Step 1: Create or get existing GCS bucket
  const {bucketName} = await getOrCreateBucket({
    region,
  });

  // Step 2: Bundle Remotion site
  const bundlePath = await bundle({
    entryPoint: path.resolve('./src/index.ts'),
    webpackConfiguration: (config) => ({
      ...config,
      externals: [...(config.externals || []), 'sharp'],
    }),
  });

  // Step 3: Deploy Cloud Run service
  const {serviceName, uri} = await deployService({
    region,
    memorySizeInMb,
    cpuCount,
    timeoutInSeconds,
  });

  // Step 4: Deploy Remotion site bundle
  const {serveUrl} = await deploySite({
    entryPoint: path.resolve('./src/index.ts'),
    bucketName,
    siteName: `${projectName}-site`,
  });

  console.log(`Cloud Run service deployed: ${serviceName}`);
  console.log(`Service URI: ${uri}`);
  console.log(`Site deployed: ${serveUrl}`);
  console.log(`Bucket: ${bucketName}`);

  return {
    serviceName,
    serveUrl,
    bucketName,
  };
};
