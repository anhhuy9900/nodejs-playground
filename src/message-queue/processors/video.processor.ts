import { Job } from 'bull';

interface VideoJob {
  videoId: string;
  url: string;
  resolution: string;
}

export async function processVideo(job: Job<VideoJob>) {
  const { videoId, resolution } = job.data;

  job.log(`🎬 Processing ${videoId} at ${resolution}`);

  for (let i = 0; i <= 100; i += 10) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await job.progress(i);
  }

  return {
    videoId,
    status: 'completed',
    outputUrl: `https://cdn.example.com/${videoId}-${resolution}.mp4`,
  };
}
